// ─────────────────────────────────────────────────────────────────────────
// analyse.js — Regelbasierte Nebenkosten-Prüf-Engine
//
// WICHTIG: Diese Analyse ist bewusst NICHT KI-basiert. Sie vergleicht jede
// eingegebene Position deterministisch gegen feste, mit dem offiziellen
// DMB-Betriebskostenspiegel abgeglichene Richtwerte (siehe config/business.js)
// und ordnet die passende Rechtsgrundlage (BetrKV etc.) zu. Das ist bewusst
// so gebaut: nachvollziehbar, reproduzierbar, ohne "KI rät" — das ist der
// eigentliche Mehrwert gegenüber einem einfachen ChatGPT-Prompt.
//
// Korrekturen 08/2026 (siehe CHANGELOG.md für Details):
//   - Heizkosten-Abweichungsprozent bezog sich vorher auf einen erfundenen
//     75/25-Split, obwohl DMB nur einen kombinierten Wert ausweist — jetzt
//     ein gemeinsamer, mathematisch konsistenter Vergleichswert.
//   - Versicherungs-Unterpositionen summierten sich auf 115% statt 100%.
//   - Drei Positionen (Heizungsbetriebsstrom, Heizungswartung, Wasserzähler)
//     hatten erfundene Richtwerte ohne offizielle Quelle — entfernt, fallen
//     jetzt korrekt auf den "prüfen"-Status statt eine Scheingenauigkeit
//     vorzutäuschen.
// ─────────────────────────────────────────────────────────────────────────

import { toNum, fmt } from "./format.js";
import { BUSINESS } from "../config/business.js";
import { THEME } from "../config/theme.js";

// NEU 14.08.2026 (siehe CHANGELOG.md, planung/steuerbonus-35a-rollout.md):
// Kategorien, die typischerweise unter § 35a EStG (haushaltsnahe Dienst-
// leistungen/Handwerkerleistungen) fallen können — für die neue PDF-Seite 3
// "Steuer-Bonus" (nur Stufe "voll"). Bewusst als Set von ALLE_POSTEN-Keys
// definiert und unten direkt an den jeweiligen posten_bewertung-Eintrag als
// `steuerlich_35a: true` angehängt (statt eine eigene Datenstruktur/einen
// neuen Supabase-Spalte anzulegen) — SteuerbonusPDF.jsx liest ausschließlich
// aus result.posten_bewertung, das ohnehin schon vollständig durch
// save-report.js/get-report.js persistiert wird. Kein neues Feld in der
// Datenbank, keine neue Stelle, an der Daten verloren gehen können.
// Bewusst NICHT "strassenreinigung" (reine Straßenreinigung fällt nicht
// unter § 35a) und NICHT die "(kombiniert)"-Sammelzeilen, die nicht-
// begünstigte Anteile enthalten — nur eindeutig zuordenbare Einzelpositionen.
// AUFGETEILT AM 11.09.2026. Vorher lagen alle Positionen in einem einzigen
// Set und die PDF-Seite warf sie zu einer Summe zusammen. Das war für den
// Nutzer wertlos, weil § 35a EStG zwei getrennte Töpfe kennt, die er in der
// Steuererklärung auch getrennt einträgt und für die unterschiedliche
// Höchstbeträge gelten:
//
//   § 35a Abs. 2 EStG  haushaltsnahe Dienstleistungen   20 %, max. 4.000 €/Jahr
//   § 35a Abs. 3 EStG  Handwerkerleistungen             20 %, max. 1.200 €/Jahr
//
// Die Zuordnung folgt der Art der Tätigkeit: Wiederkehrende Arbeiten, die ein
// Haushaltsmitglied grundsätzlich auch selbst erledigen könnte, sind
// Dienstleistungen. Arbeiten, für die ein Handwerksbetrieb oder eine
// zugelassene Fachkraft nötig ist, sind Handwerkerleistungen.
//
// Grenzfall Hauswart: Er macht beides. Die Rechtsprechung und die
// Finanzverwaltung ordnen die typische Hauswarttätigkeit den haushaltsnahen
// Dienstleistungen zu; reine Reparaturanteile gehören ohnehin nicht in die
// Betriebskostenabrechnung (§ 1 Abs. 2 BetrKV) und tauchen hier deshalb
// nicht auf. Einordnung als Dienstleistung ist damit die sichere Variante.
//
// Bewusst NICHT enthalten: "strassenreinigung" (öffentliche Gebühr, keine
// Leistung im Haushalt) und die "(kombiniert)"-Sammelzeilen, die nicht
// begünstigte Anteile enthalten.
const STEUER_DIENSTLEISTUNG = new Set([
  "gartenpflege", "hausreinigung", "hauswart", "schnee_eis_beseitigung",
]);
const STEUER_HANDWERKER = new Set([
  "schornsteinreinigung", "aufzug", "heizung_wartung",
  "rauchwarnmelder_wartung", "gasleitungspruefung",
]);
// Bleibt bestehen, damit vorhandener Code unverändert weiterläuft.
const STEUERLICH_35A = new Set([...STEUER_DIENSTLEISTUNG, ...STEUER_HANDWERKER]);

// ───────────────────────────────────────────────────────────────────────────
// NICHT BEGÜNSTIGTE POSTEN, ergänzt 11.09.2026 auf Stefans Hinweis:
// "Die ganzen Steuer-Apps fragen die einzelnen Posten ab wie Müll,
// Straßenreinigung, etc."
//
// Das stimmt, und es macht eine reine Liste der absetzbaren Posten unbrauchbar:
// Wenn Taxfix nach den Müllgebühren fragt und im Bericht steht nichts dazu,
// weiß der Kunde nicht, ob er sie vergessen hat oder ob sie nicht zählen.
//
// Deshalb bekommt JEDER Posten der Abrechnung eine Einordnung, auch die nicht
// begünstigten, jeweils mit Begründung. Der Bericht wird damit zum Antwortblatt
// für die Steuersoftware.
//
// Ausgerechnet Stefans zwei Beispiele sind die nicht begünstigten Fälle, und
// die Abgrenzung ist feiner, als man denkt. BFH, Urteil vom 13.05.2020,
// VI R 4/18, Leitsatz 1 im Wortlaut:
//
//   "Die Reinigung der Fahrbahn einer öffentlichen Straße ist, anders als die
//    Reinigung des öffentlichen Gehwegs vor dem Haus, nicht als haushaltsnahe
//    Dienstleistung nach § 35a Abs. 2 EStG begünstigt."
//
// Daraus folgt die Trennung: Straßenreinigung (Fahrbahn, kommunale Gebühr)
// nein, Winterdienst und Gehwegreinigung vor dem Haus ja. Deshalb steht
// schnee_eis_beseitigung oben bei den Dienstleistungen und strassenreinigung
// hier unten.
//
// Müllgebühren sind nicht begünstigt, weil die eigentliche Leistung, die
// Entsorgung, außerhalb des Haushalts stattfindet (FG Köln; die Revision kam
// verspätet beim BFH an, eine höchstrichterliche Entscheidung steht deshalb
// weiterhin aus). Wer es trotzdem angibt, riskiert nur die Streichung, keine
// Sanktion. Der Bericht sagt das so.
const STEUER_NICHT = new Map([
  ["strassenreinigung", "Reinigung der öffentlichen Fahrbahn, BFH VI R 4/18. Der Winterdienst auf dem Gehweg vor dem Haus zählt dagegen mit."],
  ["muellbeseitigung", "Die Entsorgung findet außerhalb des Haushalts statt. Bisher nur Finanzgerichte, noch keine BFH-Entscheidung."],
  ["grundsteuer", "Eine Steuer, keine Dienstleistung."],
  ["niederschlagswasser", "Kommunale Gebühr, keine Leistung im Haushalt."],
  ["entwasserung", "Kommunale Gebühr, keine Leistung im Haushalt."],
  ["kaltwasser", "Lieferung eines Stoffs, keine Dienstleistung."],
  ["heizkosten_gesamt", "Brennstoff- und Lieferkosten. Nur die Wartung der Anlage zählt, siehe eigene Zeile."],
  ["warmwasser_gesamt", "Lieferung von Warmwasser, keine Dienstleistung."],
  ["allgemeinstrom", "Stromlieferung, keine Dienstleistung."],
  ["feuerversicherung", "Versicherungsprämie, keine Dienstleistung."],
  ["sturm_hagel_versicherung", "Versicherungsprämie, keine Dienstleistung."],
  ["leitungswasser_versicherung", "Versicherungsprämie, keine Dienstleistung."],
  ["haftpflichtversicherung", "Versicherungsprämie, keine Dienstleistung."],
  ["glasversicherung", "Versicherungsprämie, keine Dienstleistung."],
  ["kabelanschluss", "Entgelt für einen Anschluss, keine Dienstleistung im Haushalt."],
  ["gemeinschaftsantenne", "Entgelt für einen Anschluss, keine Dienstleistung im Haushalt."],
  ["wasserzaehler", "Miete und Eichung eines Geräts, keine Arbeitsleistung im Haushalt."],
  ["co2_abgabe", "Abgabe auf den Brennstoff, keine Dienstleistung."],
]);

// Sonderfall mit eigener Antwort: "Sonstige vereinbarte Betriebskosten" nach
// Nr. 17 BetrKV ist ein Sammelbegriff. Was darunter abgerechnet wurde, steht
// nur im Mietvertrag. Es kann eine begünstigte Arbeitsleistung sein (etwa
// Dachrinnenreinigung) oder eine nicht begünstigte Gebühr. Ein pauschales Ja
// oder Nein wäre in beide Richtungen falsch, deshalb die dritte Antwort.
// Sie ist wichtig, weil die Steuerprogramme auch nach diesem Posten fragen.
const STEUER_UNKLAR = new Map([
  ["sonstiges_vereinbart", "Hängt davon ab, was dein Vermieter darunter abgerechnet hat. Steht im Mietvertrag. Ist es eine Arbeitsleistung am Haus, etwa Dachrinnenreinigung, zählt sie als Handwerkerleistung. Ist es eine Gebühr, zählt sie nicht."],
]);

// Liefert { art, grund }. art ist "dienstleistung", "handwerker", "nicht"
// oder null (unbekannt, dann wird die Zeile im Bericht ausgelassen).
export function steuerArtFuer(key) {
  if (STEUER_DIENSTLEISTUNG.has(key)) return "dienstleistung";
  if (STEUER_HANDWERKER.has(key)) return "handwerker";
  if (STEUER_NICHT.has(key)) return "nicht";
  if (STEUER_UNKLAR.has(key)) return "unklar";
  return null;
}
export function steuerGrundFuer(key) {
  return STEUER_NICHT.get(key) || STEUER_UNKLAR.get(key) || "";
}

// Kein `beispiel`-Feld mehr (bis 13.08.2026 gab es hier graue Platzhalter-
// Beispielbeträge je Posten, hergeleitet aus den DMB-Richtwerten). Stefans
// Entscheidung: Auch als reiner Placeholder (kein echter Wert, siehe
// EuroInput.jsx) wirkt eine konkrete Zahl im Eingabefeld wie ein plausibler
// Vorschlag und kann Kunden in die Irre führen. Alle Felder zeigen jetzt
// einheitlich "0,00" als Platzhalter (EuroInput.jsx). Die eigentlichen
// DMB-Richtwerte für den Auffälligkeits-Abgleich (RICHTWERTE, siehe
// analysierePosten weiter unten) sind davon unabhängig und bleiben unverändert.
//
// STRUKTUR-ÜBERARBEITUNG 08/2026 (siehe CHANGELOG.md):
// Auslöser war ein Praxistest anhand einer echten Abrechnung (ABG Frankfurt
// Holding, 14 Seiten). Befund: Abrechnungen listen alle Betriebskosten als
// EINE durchlaufende Tabelle, unser Formular verteilte sie vorher auf 7
// einzeln auf-/zuklappbare Kategorien — das erzwang ständiges Umschalten
// zwischen Formular-Kategorie und Abrechnungszeile.
//
// Wichtige Erkenntnis dabei: Verschiedene Vermieter/Hausverwaltungen sortieren
// und benennen ihre Abrechnungen unterschiedlich — eine feste Reihenfolge
// nach EINER Beispielabrechnung zu kopieren hilft nur diesem einen Vermieter,
// nicht allen Nutzern. Lösung: Reihenfolge folgt stattdessen der amtlichen
// Gliederung nach § 2 Nr. 1-17 BetrKV (Betriebskostenverordnung) — das ist
// die einzige Ordnung, die branchenübergreifend gilt und auf die praktisch
// jede Abrechnung direkt oder indirekt referenziert. Zusätzlich bekommt jeder
// Posten `aliases`: alternative Bezeichnungen, wie sie auf echten Abrechnungen
// vorkommen, für die Live-Suche in Posten.jsx — das löst das Reihenfolge-/
// Benennungsproblem robuster als jede feste Sortierung, weil Nutzer ihren
// Abrechnungsbegriff eintippen können, unabhängig von Position oder Wortwahl.
//
// Außerdem wurden vier vorher künstlich zusammengefasste Posten in ihre auf
// Abrechnungen tatsächlich einzeln ausgewiesenen Bestandteile aufgeteilt
// (Sturm-/Hagel- und Leitungswasserversicherung aus "Gebäudeversicherung";
// Schnee-/Eisbeseitigung aus "Straßenreinigung"), sowie zwei komplett fehlende
// Posten ergänzt (Wartung Rauchwarnmelder, Gasleitungsprüfung) — vorher hätten
// Nutzer diese Beträge selbst zusammenrechnen oder gar nicht eintragen können,
// was dem Hinweis "Trage die Beträge so ein wie sie auf der Abrechnung stehen"
// widersprach. Für KEINEN dieser neuen Einzelposten wird ein eigener,
// erfundener Richtwert vorgetäuscht — die Prüfung erfolgt weiterhin auf Basis
// der SUMME aller eingegebenen Unterposten gegen den einzigen offiziell
// veröffentlichten DMB-Kombiwert (siehe analysierePosten unten), analog zum
// bereits bestehenden Vorgehen bei Wasser/Abwasser.
export const POSTEN_GRUPPEN = [
  { id: "grundsteuer", label: "Grundsteuer", paragraf: "§ 2 Nr. 1 BetrKV", icon: "🏛",
    posten: [
      { key: "grundsteuer", label: "Grundsteuer", tip: "Prüfe ob Betrag mit Bescheid übereinstimmt", aliases: ["Grundabgaben"] },
    ]},
  { id: "wasser", label: "Wasserversorgung", paragraf: "§ 2 Nr. 2 BetrKV", icon: "💧",
    posten: [
      { key: "kaltwasser", label: "Wasserversorgung (Kaltwasser)", tip: "Frischwasserkosten inkl. Grundgebühr", aliases: ["Frischwasser", "Kaltwasserkosten"] },
      { key: "wasserzaehler", label: "Miete und Wartung Wasserzähler", tip: "Zählermiete und Eichung", aliases: ["Zählermiete", "Eichung"], selten: true },
    ]},
  { id: "entwaesserung", label: "Entwässerung", paragraf: "§ 2 Nr. 3 BetrKV", icon: "💧",
    posten: [
      { key: "entwasserung", label: "Entwässerung und Abwasser", tip: "Kanalgebühren der Gemeinde", aliases: ["Kanalgebühr", "Abwasserkosten"] },
      { key: "niederschlagswasser", label: "Niederschlagswassergebühr", tip: "Manche Kommunen erheben dies separat", aliases: ["Regenwasser"], selten: true },
    ]},
  { id: "heizung", label: "Heizung", paragraf: "§ 2 Nr. 4 BetrKV", icon: "🔥",
    posten: [
      { key: "heizkosten_gesamt", label: "Heizkosten", pflicht: true, tip: "Gesamte Heizkosten lt. Abrechnung, auf vielen Abrechnungen als 'Heizung Grundanteil' + 'Heizung Verbrauchsanteil' getrennt ausgewiesen, dann beide Beträge zusammenzählen", aliases: ["Wärmeversorgung", "Zentralheizung", "Heizung Grundanteil", "Heizung Verbrauchsanteil"] },
      { key: "heizung_betriebsstrom", label: "Betriebsstrom Heizungsanlage", tip: "Strom für Pumpen, Steuerung", aliases: ["Stromkosten Heizung"], selten: true },
      { key: "heizung_wartung", label: "Wartung Heizungsanlage", tip: "Wartung ja, Reparaturen nein", aliases: ["Heizkosten Wartung", "Gerätemiete Heizung"], selten: true },
      { key: "co2_abgabe", label: "CO2-Abgabe (Kohlendioxidkosten)", tip: "Vermieter trägt je nach Energieklasse 0-95%. Achtung: steht oft NICHT als eigene Zeile auf der Hauptseite, sondern nur auf einer Detail-Anlage weiter hinten in der Abrechnung ('CO2-Kosten', 'Aufteilung der CO2-Kosten'), dort nachschauen, wenn hier nichts auf den ersten Blick zu finden ist.", aliases: ["CO2-Kosten", "CO2KostAufG", "Kohlendioxidabgabe"] },
    ]},
  { id: "warmwasser", label: "Warmwasser", paragraf: "§ 2 Nr. 5 BetrKV", icon: "🔥",
    posten: [
      { key: "warmwasser_gesamt", label: "Warmwasserversorgung", pflicht: true, tip: "Muss separat ausgewiesen sein, auf manchen Abrechnungen als 'Warmwasser Grundanteil' + 'Warmwasser Verbrauchsanteil' getrennt, dann beide zusammenzählen", aliases: ["Warmwasser Grundanteil", "Warmwasser Verbrauchsanteil"] },
    ]},
  { id: "aufzug", label: "Aufzug", paragraf: "§ 2 Nr. 7 BetrKV", icon: "⚙️",
    posten: [
      { key: "aufzug", label: "Aufzug (Betrieb, Wartung, TÜV)", tip: "Nur Betrieb und Wartung, keine Reparaturen", aliases: ["Fahrstuhl"], selten: true },
    ]},
  { id: "strassenreinigung", label: "Straßenreinigung und Müllbeseitigung", paragraf: "§ 2 Nr. 8 BetrKV", icon: "🧹",
    posten: [
      { key: "strassenreinigung", label: "Straßenreinigung", tip: "Ohne Winterdienst: der hat auf vielen Abrechnungen eine eigene Zeile, siehe unten", aliases: ["Straßenreinigungsgebühr"] },
      { key: "schnee_eis_beseitigung", label: "Schnee- und Eisbeseitigung", tip: "Winterdienst, auf manchen Abrechnungen mit der Straßenreinigung zusammengefasst, auf anderen eigene Zeile", aliases: ["Winterdienst", "Räum- und Streudienst"] },
      { key: "muellbeseitigung", label: "Müllbeseitigung und Abfallentsorgung", tip: "Gebühren für alle Tonnen", aliases: ["Müllabfuhr", "Abfallgebühren"] },
    ]},
  { id: "gebaeude", label: "Gebäudereinigung und Ungezieferbekämpfung", paragraf: "§ 2 Nr. 9 BetrKV", icon: "🧹",
    posten: [
      { key: "hausreinigung", label: "Hausreinigung und Treppenhausreinigung", tip: "Nur umlagefähig wenn vertraglich vereinbart", aliases: ["Gebäudereinigung", "Treppenhausreinigung"] },
      { key: "ungezieferbekaempfung", label: "Ungezieferbekämpfung", tip: "Nur bei tatsächlichem Bedarf", aliases: ["Schädlingsbekämpfung"], selten: true },
    ]},
  { id: "garten", label: "Gartenpflege", paragraf: "§ 2 Nr. 10 BetrKV", icon: "🧹",
    posten: [
      { key: "gartenpflege", label: "Gartenpflege", tip: "Nur laufende Pflege, keine Neuanlage", aliases: ["Grünpflege", "Außenanlagen"] },
    ]},
  { id: "beleuchtung", label: "Beleuchtung", paragraf: "§ 2 Nr. 11 BetrKV", icon: "⚙️",
    posten: [
      { key: "allgemeinstrom", label: "Beleuchtung und Allgemeinstrom", tip: "Strom für Gemeinschaftsflächen", aliases: ["Gemeinschaftsstrom", "Hausstrom"] },
    ]},
  { id: "schornstein", label: "Schornsteinreinigung", paragraf: "§ 2 Nr. 12 BetrKV", icon: "🔥",
    posten: [
      { key: "schornsteinreinigung", label: "Schornsteinreinigung", tip: "Kehrgebühren", aliases: ["Kaminkehrer", "Kehrgebühr"], selten: true },
    ]},
  { id: "versicherungen", label: "Versicherungen", paragraf: "§ 2 Nr. 13 BetrKV", icon: "🛡",
    hint: "Nur Sachversicherungen des Gebäudes, nicht deine Hausratsversicherung",
    posten: [
      { key: "feuerversicherung", label: "Gebäude- und Feuerversicherung", tip: "Auf manchen Abrechnungen mit Sturm und Leitungswasser zu einer 'Gebäudeversicherung' zusammengefasst, dann hier den Gesamtbetrag eintragen", aliases: ["Gebäudeversicherung", "Brandversicherung"] },
      { key: "sturm_hagel_versicherung", label: "Sturm- und Hagelversicherung", tip: "Oft eigene Zeile, manchmal Teil der Gebäudeversicherung", aliases: ["Sturmversicherung", "Hagelversicherung"] },
      { key: "leitungswasser_versicherung", label: "Leitungswasserversicherung", tip: "Oft eigene Zeile, manchmal Teil der Gebäudeversicherung", aliases: ["Wasserschadenversicherung"] },
      { key: "haftpflichtversicherung", label: "Haftpflichtversicherung Gebäude", tip: "Haus- und Grundbesitzerhaftpflicht", aliases: ["Grundbesitzerhaftpflicht"] },
      { key: "glasversicherung", label: "Glasversicherung", tip: "Nur wenn vertraglich vereinbart", selten: true },
    ]},
  { id: "hauswart", label: "Hauswart", paragraf: "§ 2 Nr. 14 BetrKV", icon: "🏠",
    posten: [
      { key: "hauswart", label: "Hauswart (Hausmeister)", tip: "Nur Betriebskostenanteile: keine Verwaltung und keine Instandhaltung", aliases: ["Hausmeisterkosten", "Concierge"] },
    ]},
  { id: "technik", label: "Gemeinschaftsantenne, Kabel und Waschräume", paragraf: "§ 2 Nr. 15 BetrKV", icon: "⚙️",
    posten: [
      { key: "gemeinschaftsantenne", label: "Gemeinschaftsantenne und SAT-Anlage", tip: "Umlagefähig wenn Gemeinschaftsanlage", aliases: ["Antennenanlage"], selten: true },
      { key: "kabelanschluss", label: "Kabelanschluss und TV-Versorgung", tip: "Seit 01.07.2024 grundsätzlich nicht mehr umlagefähig, bei Abrechnungsjahr vor 2024 regulär zulässig", aliases: ["Breitbandkabelanschluss", "TV-Kabel"] },
      { key: "gemeinschaftswaschmaschine", label: "Waschmaschinen und Trockenräume", tip: "Betrieb der Gemeinschaftsgeräte", aliases: ["Waschküche", "Trockenraum"], selten: true },
      { key: "tiefgarage", label: "Tiefgaragenbelüftung und -entwässerung", tip: "Wenn im Mietvertrag vereinbart", aliases: ["Tiefgarage"], selten: true },
    ]},
  { id: "sonstiges", label: "Sonstige Betriebskosten", paragraf: "§ 2 Nr. 17 BetrKV", icon: "🏠",
    hint: "Achtung: Verwaltungskosten darf der Vermieter NICHT umlegen",
    posten: [
      { key: "rauchwarnmelder_wartung", label: "Wartung Rauchwarnmelder", tip: "Nur Wartung und Miete, keine Anschaffung", aliases: ["Rauchmelder"], selten: true },
      { key: "gasleitungspruefung", label: "Gasleitungs- und Gasgeräteprüfung", tip: "Wiederkehrende Prüfpflicht", aliases: ["Gasprüfung", "Gasleitungsprüfung Allgemein"], selten: true },
      { key: "sonstiges_vereinbart", label: "Sonstige vereinbarte Betriebskosten", tip: "Nur wenn explizit im Mietvertrag benannt", aliases: ["Wartung Sonstige"] },
    ]},
  // Neu 10.08.2026 (siehe CHANGELOG, Stefans Frage "was ist ein harter
  // Verstoß" — bisher war das praktisch nur der Kabelanschluss-Fall). Diese
  // zwei Positionen sind nach § 1 Abs. 2 BetrKV KATEGORISCH von den
  // Betriebskosten ausgeschlossen, unabhängig von jedem Richtwert — wenn sie
  // separat auf der Abrechnung auftauchen, ist das immer ein Fehler. Vorher
  // gab es dafür gar kein Eingabefeld, obwohl die Startseite genau das als
  // Leistung bewarb ("Wir erkennen... Verwaltungskosten") — das Versprechen
  // stimmt jetzt tatsächlich.
  { id: "nicht_umlagefaehig", label: "Kategorisch ausgeschlossene Kosten", paragraf: "§ 1 Abs. 2 BetrKV", icon: "🚫",
    hint: "Nur ausfüllen, falls auf der Abrechnung separat ausgewiesen, diese Kosten darf dein Vermieter nach dem Gesetz nie umlegen",
    posten: [
      { key: "verwaltungskosten", label: "Verwaltungskosten", tip: "Kaufmännische und technische Verwaltung, nie umlagefähig (§ 1 Abs. 2 Nr. 1 BetrKV)", aliases: ["Verwaltungsgebühr", "Verwaltungspauschale", "Verwaltungskostenpauschale"], selten: true },
      { key: "instandhaltung", label: "Instandhaltung und Instandsetzung", tip: "Reparaturen, Erhaltungsaufwand, nie umlagefähig (§ 1 Abs. 2 Nr. 2 BetrKV)", aliases: ["Reparaturkosten", "Instandsetzungskosten", "Erhaltungsaufwand"], selten: true },
    ]},
];

export const ALLE_POSTEN = POSTEN_GRUPPEN.flatMap(g => g.posten);

export const BEWERTUNG = {
  ok:         { label: "Unauffällig",  farbe: THEME.color.ok,       bg: THEME.color.okBg,       icon: "✅", sub: "Keine wesentlichen Fehler gefunden" },
  auffaellig: { label: "Prüfenswert",  farbe: THEME.color.warn,     bg: THEME.color.warnBg,     icon: "⚠️", sub: "Auffälligkeiten. Einwände ratsam" },
  kritisch:   { label: "Fehlerhaft",   farbe: THEME.color.critical, bg: THEME.color.criticalBg, icon: "🚨", sub: "Erhebliche Fehler. Einwände dringend empfohlen" },
};

function abw(betrag, richtwert) {
  return richtwert > 0 ? Math.round(((betrag - richtwert) / richtwert) * 100) : 0;
}

// Baut aus [label, betrag]-Paaren einen lesbaren Aufzählungstext, z.B.
// "Feuerversicherung 332,38 €, Sturm-/Hagelversicherung 73,46 € und
// Haftpflichtversicherung Gebäude 4,02 €" — nur tatsächlich befüllte
// Positionen (betrag > 0). Zweck: Im Anschreiben an den Vermieter
// (§ 556 Abs. 3 BGB) muss IMMER konkret benannt werden, welche Einzel-
// positionen mit welchem Betrag zur beanstandeten Summe beitragen — ein
// pauschales "Versicherungen sind zu hoch" wäre als Einwendung zu unbe-
// stimmt (Stefan, 10.08.2026, siehe CHANGELOG).
function listeText(paare) {
  const teile = paare.filter(([, b]) => b > 0).map(([label, b]) => label + " " + fmt(b));
  if (teile.length <= 1) return teile.join("");
  return teile.slice(0, -1).join(", ") + " und " + teile[teile.length - 1];
}

// ───────────────────────────────────────────────────────────────────────────
// HEIZKOSTENVERORDNUNG: die formalen Prüfungen (13.09.2026, Task #104)
//
// WARUM ES DIESEN BLOCK GIBT: Seit dem 11.09.2026 beanstandet die Auswertung
// Heizung, Warmwasser und Wasser nicht mehr wegen ihrer Höhe, weil das
// verbrauchsabhängige Kosten sind und jeder anders verbraucht. Das war
// fachlich richtig, hat aber eine Lücke hinterlassen: Der Bericht sagte dem
// Kunden wörtlich, prüfbar sei das Verhältnis von Grund- zu Verbrauchsanteil,
// und prüfte es dann nirgends. Wir haben etwas versprochen und nicht geliefert.
//
// Genau hier liegt aber der stärkste Teil des ganzen Produkts. Die
// Heizkostenverordnung stellt FORMALE Anforderungen an die Art der Abrechnung.
// Die sind unabhängig davon, wie viel jemand verbraucht, und der Vermieter
// kann ihnen nicht mit "jeder verbraucht eben anders" begegnen. Es ist reine
// Rechnung gegen klaren Verordnungstext.
//
// GEPRÜFT WIRD (Primärquelle gesetze-im-internet.de, abgerufen 13.09.2026):
//
//   § 7 Abs. 1 S. 1  Von den Heizkosten sind mindestens 50 und höchstens 70
//                    Prozent nach erfasstem Verbrauch zu verteilen.
//   § 8 Abs. 1       Dasselbe für die Warmwasserkosten.
//   § 12 Abs. 1 S. 1 Wird entgegen der Verordnung gar nicht verbrauchsabhängig
//                    abgerechnet, darf der Nutzer seinen Anteil um 15 Prozent
//                    kürzen.
//   § 12 Abs. 1 S. 3 Teilt der Eigentümer die Informationen nach § 6a nicht
//                    oder nicht vollständig mit, sind es 3 Prozent. Dazu
//                    gehört nach § 6a Abs. 3 Nr. 5 zwingend ein GRAFISCHER
//                    Vergleich des witterungsbereinigten Verbrauchs mit dem
//                    vorherigen Abrechnungszeitraum. Der fehlt sehr häufig.
//
// BEWUSST NICHT GEPRÜFT wird § 12 Abs. 1 S. 2, die 3 Prozent für fehlende
// fernablesbare Zähler. Die Frist zum Nachrüsten vorhandener Geräte läuft
// nach § 5 Abs. 3 erst am 31.12.2026 ab. Bis dahin greift die Kürzung nur bei
// Geräten, die nach dem 01.12.2021 NEU eingebaut wurden, und dieses Datum
// kennt kein Mieter. Wir würden eine Forderung erheben, die der Vermieter mit
// einem Satz abräumt. Ab Abrechnungsjahr 2027 gehört die Prüfung hier rein,
// dann ist sie sauber; siehe Konstante HKV_NACHRUEST_FRIST weiter unten.
//
// GRENZEN, die im Text auch benannt werden:
//   - § 7 Abs. 1 S. 2 verlangt bei bestimmten Altbauten sogar zwingend 70
//     Prozent. Ob ein Gebäude darunter fällt, können wir aus den Eingaben
//     nicht erkennen, deshalb prüfen wir nur den Rahmen 50 bis 70 und
//     behaupten nichts darüber hinaus.
//   - § 12 Abs. 1 S. 4 nimmt Wohnungseigentümer gegenüber ihrer Gemeinschaft
//     vom Kürzungsrecht aus. Unsere Kunden sind Mieter, der Hinweis steht
//     trotzdem im Bericht.
//   - Die Verordnung gilt nach § 1 nur bei zentraler Anlage oder
//     Wärmelieferung. Wer eine eigene Gastherme hat, füllt diesen Teil
//     schlicht nicht aus und bekommt dann auch keinen Befund.
// ───────────────────────────────────────────────────────────────────────────

// Ab diesem Abrechnungsjahr greift § 12 Abs. 1 S. 2 (fehlende fernablesbare
// Ausstattung) ohne die Einbaudatums-Frage, weil die Nachrüstfrist des
// § 5 Abs. 3 am 31.12.2026 endet. Steht hier als Konstante, damit die
// Erweiterung später eine Zahländerung ist und keine Suche im Text.
export const HKV_NACHRUEST_FRIST = 2027;

// Ab diesem Abrechnungsjahr gelten die Informationspflichten des § 6a. Die
// Vorschrift gilt für Abrechnungszeiträume, die ab dem 01.12.2021 beginnen,
// bei Kalenderjahr-Abrechnung also ab dem Jahr 2022.
export const HKV_INFOPFLICHT_AB = 2022;

// Toleranz in Prozentpunkten beim 50-bis-70-Vergleich.
//
// WARUM ÜBERHAUPT EINE TOLERANZ: Wir rechnen aus zwei auf volle Cent
// gerundeten Beträgen zurück auf einen Prozentsatz. Eine Abrechnung, die
// sauber mit 70 Prozent verteilt, kann dadurch rechnerisch bei 70,03 landen.
// Ohne Toleranz würden wir dem Vermieter einen Verstoß vorwerfen, den es nicht
// gibt, und das ist der teuerste Fehler, den dieses Produkt machen kann.
//
// WARUM 0,5 UND NICHT MEHR: Echte Verstöße sehen nicht so aus. Wer den
// falschen Schlüssel verwendet, landet bei 80 zu 20 oder 40 zu 60, also
// zweistellig daneben. Eine halbe Prozentpunkt-Toleranz kostet uns damit
// keinen einzigen echten Befund und schützt vor jedem Rundungsartefakt.
const HKV_ANTEIL_TOLERANZ = 0.5;

// Rechnet aus Grund- und Verbrauchskosten den Verbrauchsanteil aus und sagt,
// ob er im vorgeschriebenen Rahmen liegt. Gibt null zurück, wenn nicht beide
// Werte vorliegen: Ein leeres Feld ist keine Null, sondern eine fehlende
// Angabe, und daraus darf kein Befund entstehen.
//
// Der Rückgabewert funktioniert mit Beträgen genauso wie mit Prozentzahlen,
// weil nur das Verhältnis der beiden Zahlen zueinander zählt. Manche
// Abrechnungen drucken nur das eine, manche nur das andere.
function verbrauchsanteil(grund, verbrauchswert) {
  const g = toNum(grund), v = toNum(verbrauchswert);
  if (g <= 0 || v <= 0) return null;
  const summe = g + v;
  const prozent = (v / summe) * 100;
  return {
    grund: g,
    verbrauch: v,
    summe,
    prozent,
    text: prozent.toFixed(1).replace(".", ",") + " Prozent",
    zuNiedrig: prozent < 50 - HKV_ANTEIL_TOLERANZ,
    zuHoch: prozent > 70 + HKV_ANTEIL_TOLERANZ,
  };
}

export function analysierePosten(w, wohn) {
  const R = BUSINESS.RICHTWERTE;

  // ───────────────────────────────────────────────────────────────────────
  // ZWEITE SICHERUNG GEGEN DIE FEHLENDE WOHNFLÄCHE (13.09.2026)
  //
  // Die Zeile darunter hieß früher nur `Math.max(toNum(wohn.flaeche), 5)`.
  // Der Mindestwert 5 stand dort, damit nie durch null geteilt wird. Das
  // löst das Rechenproblem, erzeugt aber ein viel schlimmeres inhaltliches:
  // Aus einer FEHLENDEN Wohnfläche werden stillschweigend 5 m², und dann
  // liegt jeder normale Posten hunderte Prozent über seinem Richtwert. Im
  // Live-Test kam so "Müllbeseitigung: 2365 % über DMB-Richtwert! Belege
  // anfordern." bei einem völlig unauffälligen Betrag heraus.
  //
  // App.jsx lässt den Posten-Schritt inzwischen gar nicht mehr ohne
  // Wohnfläche zu. Diese Prüfung hier ist die zweite Linie: Sollte der Wert
  // auf einem anderen Weg doch einmal fehlen, etwa aus einem alten
  // gespeicherten Entwurf oder über die Bestellhistorie, darf daraus keine
  // Beanstandung werden.
  //
  // Wir geben dann ein ehrliches Ergebnis zurück statt eines falschen: die
  // Beträge werden gelistet, aber nichts wird bewertet, und der Grund steht
  // dabei. Lieber "können wir nicht beurteilen" als eine erfundene Zahl.
  const flaecheRoh = toNum(wohn.flaeche);
  if (flaecheRoh < 5) {
    return {
      posten_bewertung: ALLE_POSTEN
        .filter(p => toNum(w[p.key]) > 0)
        .map(p => ({
          posten: p.label,
          betrag: toNum(w[p.key]),
          richtwert: 0,
          abweichung_prozent: 0,
          status: "pruefen",
          hinweis: "Ohne deine Wohnfläche lässt sich diese Position nicht mit dem DMB-Richtwert vergleichen, denn alle Vergleichswerte gelten pro Quadratmeter. Trage die Wohnfläche nach, dann bewerten wir die Position.",
          paragraf: "§ 2 BetrKV",
          steuerArt: steuerArtFuer(p.key),
          steuerGrund: steuerGrundFuer(p.key),
        })),
      widerspruch: [],
      heizBefunde: [],
      kuerzungBetrag: 0,
    };
  }

  const flaeche = Math.max(flaecheRoh, 5);
  const rj = m => m * flaeche * 12; // Monatsrichtwert -> Jahresrichtwert für die Wohnfläche

  // widerspruch: Array von { text, typ }. "typ" unterscheidet zwei grund-
  // sätzlich verschiedene Aussagearten (10.08.2026, siehe CHANGELOG —
  // Stefans Frage, ob eine hohe angezeigte "Rückforderung" realistisch ist):
  //   "hart"        — deterministischer, aus den Eingabedaten allein
  //                    beweisbarer Rechtsverstoß, keine weitere Prüfung
  //                    durch den Vermieter nötig, um ihn zu bestätigen
  //                    (aktuell nur: Kabelanschluss, komplettes Abrechnungs-
  //                    jahr nach dem 01.07.2024).
  //   "statistisch" — Abweichung von einem Durchschnitts-Richtwert (DMB)
  //                    oder eine offene, nur mit weiteren Unterlagen zu
  //                    klärende Frage (z.B. genauer Abrechnungszeitraum
  //                    einer Position). Ein Anlass zur Nachfrage/Belegein-
  //                    sicht — KEIN Beweis für einen Fehler. Der DMB selbst
  //                    weist ausdrücklich darauf hin, dass Abweichungen vom
  //                    Betriebskostenspiegel keine verbindliche Prüfung der
  //                    Abrechnung ersetzen (mieterbund.de, Stand 12/2025).
  const widerspruch = [];
  const posten_bewertung = [];

  // Kabelanschluss — seit 01.07.2024 durch die TKG-Novelle grundsätzlich nicht
  // mehr umlagefähig ("Nebenkostenprivileg" abgeschafft). WICHTIG: Wir erfassen
  // nur einen JAHRESBETRAG, keinen Abrechnungszeitraum pro Position. Bei einer
  // Abrechnung fürs Übergangsjahr 2024 sieht ein korrekt nur anteilig bis
  // 30.06.2024 abgerechneter Betrag identisch aus wie ein zu Unrecht fürs
  // ganze Jahr abgerechneter — beides ergibt nur EINE Zahl im Formular. Bestä-
  // tigter Praxisfall (siehe CHANGELOG.md, Stefans Testabrechnung 2024): dort
  // korrekt nur bis 30.06.2024 abgerechnet, die vorherige pauschale "voller
  // Betrag rückforderbar"-Behauptung wäre hier schlicht falsch gewesen.
  // Deshalb nach Abrechnungsjahr gestaffelt statt einer einzigen Pauschalregel:
  if (toNum(w.kabelanschluss) > 0) {
    const b = toNum(w.kabelanschluss);
    const jahrNum = parseInt(wohn.jahr, 10);
    if (jahrNum && jahrNum < 2024) {
      // Vor der Gesetzesänderung regulär umlagefähig, keine Beanstandung.
      posten_bewertung.push({ posten: "Kabelanschluss", betrag: b, richtwert: 0, abweichung_prozent: 0, status: "ok", hinweis: "Vor der Gesetzesänderung zum 01.07.2024 regulär umlagefähig.", paragraf: "§ 2 Nr. 15 BetrKV a.F." });
    } else if (!jahrNum || jahrNum === 2024) {
      // Übergangsjahr bzw. Jahr nicht sicher bekannt: keine sichere Behauptung möglich,
      // ohne den genauen Abrechnungszeitraum dieser einen Position zu kennen.
      posten_bewertung.push({ posten: "Kabelanschluss", betrag: b, richtwert: 0, abweichung_prozent: 0, status: "pruefen", hinweis: "Seit 01.07.2024 nicht mehr umlagefähig (§ 2 Nr. 15b TKG). Prüfe den auf der Abrechnung angegebenen Zeitraum: Anteil bis 30.06.2024 zulässig, danach nicht mehr.", paragraf: "§ 2 Nr. 15b TKG" });
      widerspruch.push({ typ: "statistisch", text: "Kabelanschlusskosten " + fmt(b) + ": Prüfe den abgerechneten Zeitraum auf der Abrechnung. Seit 01.07.2024 nicht mehr umlagefähig (§ 2 Nr. 15b TKG), nur der Anteil bis 30.06.2024 ist noch zulässig." });
    } else {
      // Abrechnungsjahr vollständig nach der Gesetzesänderung — hier ist die
      // Pauschalaussage tatsächlich sicher.
      posten_bewertung.push({ posten: "Kabelanschluss", betrag: b, richtwert: 0, abweichung_prozent: 100, status: "nicht_umlagefaehig", hinweis: "Seit 01.07.2024 nicht mehr umlagefähig. Voller Betrag rückforderbar.", paragraf: "§ 2 Nr. 15b TKG" });
      widerspruch.push({ typ: "hart", text: "Kabelanschlusskosten " + fmt(b) + ": Nicht umlagefähig seit 01.07.2024 (§ 2 Nr. 15b TKG). Rückforderung des vollen Betrags." });
    }
  }

  // Verwaltungskosten / Instandhaltung — kategorisch nicht umlagefähig
  // (§ 1 Abs. 2 Nr. 1 und 2 BetrKV), unabhängig von jedem Richtwert. Anders
  // als beim Kabelanschluss gibt es hier keine zeitliche Übergangsregel und
  // keine Grauzone: Wenn diese Kosten separat auf der Abrechnung stehen,
  // ist das immer ein Fehler. Deshalb direkt "hart", ohne Fallunterscheidung.
  if (toNum(w.verwaltungskosten) > 0) {
    const b = toNum(w.verwaltungskosten);
    posten_bewertung.push({ posten: "Verwaltungskosten", betrag: b, richtwert: 0, abweichung_prozent: 100, status: "nicht_umlagefaehig", hinweis: "Nie umlagefähig, unabhängig von der Höhe. Voller Betrag rückforderbar.", paragraf: "§ 1 Abs. 2 Nr. 1 BetrKV" });
    widerspruch.push({ typ: "hart", text: "Verwaltungskosten " + fmt(b) + ": Nach § 1 Abs. 2 Nr. 1 BetrKV nicht umlagefähig. Rückforderung des vollen Betrags." });
  }
  if (toNum(w.instandhaltung) > 0) {
    const b = toNum(w.instandhaltung);
    posten_bewertung.push({ posten: "Instandhaltung und Instandsetzung", betrag: b, richtwert: 0, abweichung_prozent: 100, status: "nicht_umlagefaehig", hinweis: "Nie umlagefähig, unabhängig von der Höhe. Voller Betrag rückforderbar.", paragraf: "§ 1 Abs. 2 Nr. 2 BetrKV" });
    widerspruch.push({ typ: "hart", text: "Instandhaltungs-/Instandsetzungskosten " + fmt(b) + ": Nach § 1 Abs. 2 Nr. 2 BetrKV nicht umlagefähig. Rückforderung des vollen Betrags." });
  }

  // Heizung + Warmwasser — DMB weist nur einen KOMBINIERTEN Wert aus, daher hier
  // bewusst kein künstlicher Einzel-Split mehr (siehe Änderungs-Hinweis oben).
  const heiz = toNum(w.heizkosten_gesamt), ww = toNum(w.warmwasser_gesamt);
  if (heiz > 0 || ww > 0) {
    const kombi = heiz + ww;
    const rwK = rj(R.heizung_warmwasser), rwMax = rj(R.heizung_max);
    const aK = abw(kombi, rwK);
    // ─────────────────────────────────────────────────────────────────────
    // VERBRAUCHSPOSTEN WERDEN NICHT BEANSTANDET (11.09.2026, Vorgabe Stefan:
    // "Verbrauchszahlen können nicht beanstandet werden, da sie vom Verbrauch
    // abhängig sind. Jeder verbraucht anders.")
    //
    // Das ist der fachlich saubere Punkt, und er gilt für Heizung, Warmwasser
    // und Wasser gleichermaßen. Der DMB-Richtwert ist ein Durchschnitt pro
    // Quadratmeter. Wie viel geheizt und verbraucht wird, hängt aber an der
    // Personenzahl, am Verhalten, an der Lage der Wohnung im Haus und am
    // energetischen Zustand des Gebäudes. Eine Abweichung nach oben ist
    // deshalb KEIN Indiz für einen Abrechnungsfehler.
    //
    // Wer einen hohen Verbrauch beanstandet, bekommt vom Vermieter zu Recht
    // die Antwort, dass die Zähler eben das anzeigen. Das kostet den Nutzer
    // Glaubwürdigkeit für die Positionen, bei denen er tatsächlich recht hat.
    //
    // WAS STATTDESSEN PASSIERT: Die Zahl wird weiterhin angezeigt und
    // eingeordnet, aber sie erzeugt keinen Punkt im Schreiben an den
    // Vermieter mehr. Der Status bleibt "ok", weil "hoch" in der Anzeige wie
    // ein Vorwurf wirkt.
    //
    // WO DER FLÄCHENVERGLEICH WEITER GILT: Bei FIXEN Kosten, die nicht vom
    // Verbrauch abhängen. Grundsteuer, Versicherungen, Müllgebühren,
    // Hausreinigung, Gartenpflege, Hausmeister. Dort ist eine deutliche
    // Abweichung tatsächlich ein Hinweis, dem man nachgehen kann, und dort
    // bleiben die Beanstandungen deshalb unverändert bestehen.
    //
    // WAS BEI HEIZUNG TROTZDEM PRÜFBAR IST und nichts mit der Höhe zu tun
    // hat: das Verhältnis von Grund- zu Verbrauchsanteil. § 7 Abs. 1
    // HeizkostenV schreibt zwingend 50 bis 70 Prozent Verbrauchsanteil vor.
    // Das ist eine harte Rechtsvorgabe und unabhängig davon, wie viel jemand
    // verbraucht. Steht unten als eigener Hinweis.
    // ─────────────────────────────────────────────────────────────────────
    let st = "ok";
    let hi = "Richtwert Heizung und Warmwasser für " + flaeche + "m²: " + fmt(rwK) + "/Jahr (bundesweiter DMB-Durchschnitt). Heizkosten hängen vom Verbrauch ab, deshalb ist eine Abweichung nach oben oder unten normal und für sich genommen kein Fehler. Prüfbar ist dagegen das Verhältnis: Der Verbrauchsanteil muss zwischen 50 und 70 Prozent der Heizkosten liegen (§ 7 Abs. 1 HeizkostenV).";
    if (kombi > rwMax) {
      hi = "Liegt " + aK + "% über dem DMB-Durchschnitt und über dem Höchstwert von " + fmt(rwMax) + "/Jahr. Das kann an hohem Verbrauch, an einem schlecht gedämmten Gebäude oder an der Lage der Wohnung liegen und ist kein Abrechnungsfehler. Sinnvoll ist ein Blick auf die Zählerstände im Vergleich zum Vorjahr und darauf, ob der Verbrauchsanteil die vorgeschriebenen 50 bis 70 Prozent einhält (§ 7 Abs. 1 HeizkostenV).";
    } else if (kombi > rwK * 1.3) {
      hi = "Liegt " + aK + "% über dem DMB-Durchschnitt. Bei verbrauchsabhängigen Kosten ist das ohne Weiteres möglich. Zählerstände mit dem Vorjahr vergleichen und prüfen, ob der Verbrauchsanteil zwischen 50 und 70 Prozent liegt (§ 7 Abs. 1 HeizkostenV).";
    }
    posten_bewertung.push({ posten: "Heizkosten & Warmwasser (kombiniert)", betrag: kombi, richtwert: rwK, abweichung_prozent: aK, status: st, hinweis: hi, paragraf: "§ 2 Nr. 4+5 BetrKV, § 7 HeizkostenV" });
    if (ww > 0) posten_bewertung.push({ posten: "davon Warmwasserversorgung", betrag: ww, richtwert: 0, abweichung_prozent: 0, status: "ok", hinweis: "Bereits in der Vergleichsrechnung oben enthalten. Muss laut Gesetz separat ausgewiesen sein (§ 8 HeizkostenV).", paragraf: "§ 2 Nr. 5 BetrKV", steuerArt: steuerArtFuer("warmwasser_gesamt"), steuerGrund: steuerGrundFuer("warmwasser_gesamt") });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FORMALE PRÜFUNG DER HEIZKOSTENABRECHNUNG
  //
  // Ausführliche Begründung und Quellen siehe Kopfkommentar bei
  // verbrauchsanteil() weiter oben.
  //
  // Diese Befunde landen BEWUSST NICHT in posten_bewertung. Die Tabelle dort
  // beantwortet die Frage "ist dieser Betrag der Höhe nach in Ordnung", hier
  // geht es dagegen um die Art der Abrechnung. Beides in eine Tabelle zu
  // mischen hätte zwei Nachteile: Die Beträge (etwa die Grundkosten) würden
  // neben den ohnehin schon gelisteten Heizkosten stehen und wie eine
  // Doppelzählung aussehen, und die Rückforderungssumme würde stillschweigend
  // mit Zahlen gespeist, die eine ganz andere Bedeutung haben. Deshalb ein
  // eigener Abschnitt im Bericht, mit eigener Überschrift.
  // ─────────────────────────────────────────────────────────────────────────
  const heizBefunde = [];
  let kuerzungBetrag = 0;
  const hkBasis = heiz + ww;           // eigener Anteil an Wärme und Warmwasser
  const hkJahr = parseInt(wohn.jahr, 10);
  // Formulierungshilfe für den Kürzungsbetrag.
  //
  // KORRIGIERT NOCH VOR DER AUSLIEFERUNG, gefunden im eigenen Testlauf: Die
  // erste Fassung setzte zwei Beträge unmittelbar nebeneinander und ergab
  // "von € 1.162,56 € 174,38". Das ist unlesbar. Jetzt ein vollständiger Satz
  // aus einer Hand, mit dem Betrag am Satzende.
  //
  // Ohne erfasste Heiz- und Warmwasserkosten lässt sich die Kürzung nicht
  // beziffern. Das Recht besteht trotzdem und wird dann ohne Zahl benannt.
  // Lieber ein Recht ohne Betrag als ein erfundener Betrag.
  const kuerzungSatz = (prozent, betrag) => hkBasis > 0
    ? "Deine Heiz- und Warmwasserkosten betragen " + fmt(hkBasis) + ", " + prozent + " Prozent davon sind " + fmt(betrag) + "."
    : "Wie hoch die Kürzung ausfällt, können wir hier nicht ausrechnen, weil du deine Heiz- und Warmwasserkosten nicht eingetragen hast. Nimm den Betrag, der auf deiner Abrechnung für Wärme und Warmwasser auf dich entfällt, und ziehe " + prozent + " Prozent davon ab.";

  for (const p of [
    { a: verbrauchsanteil(wohn.heizGrundkosten, wohn.heizVerbrauchskosten), was: "Heizkosten", norm: "§ 7 Abs. 1 Satz 1 HeizkostenV" },
    { a: verbrauchsanteil(wohn.wwGrundkosten, wohn.wwVerbrauchskosten), was: "Warmwasserkosten", norm: "§ 8 Abs. 1 HeizkostenV" },
  ]) {
    if (!p.a) continue;
    const a = p.a;
    if (a.zuNiedrig || a.zuHoch) {
      heizBefunde.push({
        titel: "Verbrauchsanteil " + p.was + ", " + a.text,
        norm: p.norm,
        status: "verstoss",
        schwere: "form",
        text: "Von deinen " + p.was + " entfallen " + fmt(a.grund) + " auf die Grundkosten und " + fmt(a.verbrauch)
          + " auf die Verbrauchskosten, zusammen " + fmt(a.summe) + ". Der Verbrauchsanteil beträgt damit " + a.text + ". "
          + p.norm + " schreibt mindestens 50 und höchstens 70 Prozent vor. Der Anteil ist "
          + (a.zuNiedrig ? "zu niedrig" : "zu hoch")
          + ", die Abrechnung ist in diesem Punkt fehlerhaft und muss korrigiert werden. Wie viel Geld die Korrektur dir bringt, "
          + "hängt davon ab, ob du mehr oder weniger geheizt hast als der Durchschnitt im Haus. Deshalb steht hier bewusst kein Betrag.",
      });
      widerspruch.push({
        typ: "hart",
        text: "Verbrauchsanteil bei den " + p.was + ": Nach der Abrechnung entfallen " + fmt(a.grund) + " auf die Grundkosten und "
          + fmt(a.verbrauch) + " auf die Verbrauchskosten. Der Verbrauchsanteil beträgt damit " + a.text + ". "
          + p.norm + " schreibt zwingend mindestens 50 und höchstens 70 Prozent vor. Ich bitte um eine korrigierte Abrechnung.",
      });
    } else {
      heizBefunde.push({
        titel: "Verbrauchsanteil " + p.was + ", " + a.text,
        norm: p.norm,
        status: "ok",
        text: "Grundkosten " + fmt(a.grund) + ", Verbrauchskosten " + fmt(a.verbrauch) + ". Der Verbrauchsanteil liegt damit "
          + "im vorgeschriebenen Rahmen von 50 bis 70 Prozent (" + p.norm + "). In diesem Punkt ist die Abrechnung korrekt.",
      });
    }
  }

  // § 12 Abs. 1 Satz 1: gar keine verbrauchsabhängige Abrechnung, 15 Prozent.
  //
  // Die Angabe kommt vom Kunden, nicht aus einer Messung von uns. Deshalb ist
  // der Text im Brief bewusst als eigene Feststellung des Mieters formuliert
  // ("Meine Abrechnung weist keinen ... aus") und nicht als unser Prüfergebnis.
  if (wohn.hkVerbrauchErfasst === "nein") {
    const betrag = Math.round(hkBasis * 0.15 * 100) / 100;
    kuerzungBetrag += betrag;
    heizBefunde.push({
      titel: "Keine verbrauchsabhängige Abrechnung, 15 Prozent Kürzungsrecht",
      norm: "§ 12 Abs. 1 Satz 1 HeizkostenV",
      status: "verstoss",
      schwere: "hart",
      betrag,
      text: "Du hast angegeben, dass auf deiner Abrechnung kein Zählerstand und kein Verbrauchswert für deine Wohnung steht. "
        + "Dann wurde nicht verbrauchsabhängig abgerechnet, und du darfst deinen Anteil an den Heiz- und Warmwasserkosten "
        + "um 15 Prozent kürzen (§ 12 Abs. 1 Satz 1 HeizkostenV). " + kuerzungSatz(15, betrag)
        + " Das Recht besteht unabhängig davon, ob der Vermieter einen Grund für das Fehlen nennt. "
        + "Eine Ausnahme gilt nur für Wohnungseigentümer gegenüber ihrer Eigentümergemeinschaft (§ 12 Abs. 1 Satz 4).",
    });
    widerspruch.push({
      typ: "hart",
      betrag: betrag > 0 ? betrag : undefined,
      text: "Meine Abrechnung weist für meine Wohnung keinen erfassten Verbrauch aus. Die Kosten der Versorgung mit Wärme und Warmwasser "
        + "wurden damit nicht verbrauchsabhängig abgerechnet. Nach § 12 Abs. 1 Satz 1 HeizkostenV kürze ich den auf mich entfallenden Anteil "
        + "um 15 Prozent" + (betrag > 0 ? " (" + fmt(betrag) + ")" : "") + ".",
    });
  }

  // § 12 Abs. 1 Satz 3 in Verbindung mit § 6a Abs. 3 Nr. 5: fehlende
  // Pflichtangaben, 3 Prozent.
  //
  // Zwei Bedingungen, beide notwendig:
  //   1. Das Abrechnungsjahr muss ab 2022 liegen (§ 6a gilt für Zeiträume ab
  //      dem 01.12.2021, bei Kalenderjahren also ab 2022).
  //   2. Es muss überhaupt verbrauchsabhängig abgerechnet worden sein. § 6a
  //      Abs. 3 knüpft ausdrücklich daran an. Wurde gar nicht nach Verbrauch
  //      abgerechnet, greift schon die 15-Prozent-Kürzung oben, und beides
  //      nebeneinander zu fordern wäre angreifbar.
  if (wohn.hkVorjahresvergleich === "nein" && wohn.hkVerbrauchErfasst === "ja" && hkJahr >= HKV_INFOPFLICHT_AB) {
    const betrag = Math.round(hkBasis * 0.03 * 100) / 100;
    kuerzungBetrag += betrag;
    heizBefunde.push({
      titel: "Fehlender Vorjahresvergleich, 3 Prozent Kürzungsrecht",
      norm: "§ 12 Abs. 1 Satz 3 in Verbindung mit § 6a Abs. 3 Nr. 5 HeizkostenV",
      status: "verstoss",
      schwere: "hart",
      betrag,
      text: "Du hast angegeben, dass deiner Abrechnung kein grafischer Vergleich deines Verbrauchs mit dem Vorjahr beiliegt. "
        + "Dieser Vergleich ist seit dem Abrechnungsjahr " + HKV_INFOPFLICHT_AB + " zwingend vorgeschrieben, und zwar ausdrücklich "
        + "in grafischer Form und witterungsbereinigt (§ 6a Abs. 3 Nr. 5 HeizkostenV). Fehlt er, darfst du deinen Anteil um "
        + "3 Prozent kürzen (§ 12 Abs. 1 Satz 3 HeizkostenV). " + kuerzungSatz(3, betrag)
        + " Eine reine Zahlenangabe zum Vorjahr genügt nicht, die Verordnung verlangt eine Grafik.",
    });
    widerspruch.push({
      typ: "hart",
      betrag: betrag > 0 ? betrag : undefined,
      text: "Meiner Abrechnung liegt kein grafischer Vergleich meines witterungsbereinigten Verbrauchs mit dem vorherigen Abrechnungszeitraum bei. "
        + "Dieser ist nach § 6a Abs. 3 Nr. 5 HeizkostenV zwingend vorgeschrieben. Nach § 12 Abs. 1 Satz 3 HeizkostenV kürze ich den auf mich "
        + "entfallenden Anteil deshalb um 3 Prozent" + (betrag > 0 ? " (" + fmt(betrag) + ")" : "") + ".",
    });
  }

  // CO2-Abgabe
  if (toNum(w.co2_abgabe) > 0) {
    const b = toNum(w.co2_abgabe);
    posten_bewertung.push({ posten: "CO2-Abgabe", betrag: b, richtwert: 0, abweichung_prozent: 0, status: "pruefen", hinweis: "Vermieter muss 0-95% selbst tragen (10-Stufen-Modell). Energieausweis anfordern.", paragraf: "§ 5 CO2KostAufG", steuerArt: steuerArtFuer("co2_abgabe"), steuerGrund: steuerGrundFuer("co2_abgabe") });
    widerspruch.push({ typ: "statistisch", text: "CO2-Abgabe " + fmt(b) + ": Prüfe ob Vermieteranteil korrekt abgezogen wurde (§ 5 CO2KostAufG)." });
  }

  // Hauswart — DMB-Wert "separat abgerechnet" (0,21), da Hausreinigung und Garten bei uns eigene Felder sind
  if (toNum(w.hauswart) > 0) {
    const b = toNum(w.hauswart), rw = rj(R.hausmeister), a = abw(b, rw);
    let st = "ok", hi = "Nur Betriebskostenanteile umlagefähig. Richtwert (separat abgerechnet): " + fmt(rw) + "/Jahr.";
    if (b > rw * 1.5) {
      st = "sehr_hoch";
      widerspruch.push({ typ: "statistisch", betrag: Math.max(0, b - rw), text: "Hausmeisterkosten " + fmt(b) + " erheblich über Richtwert " + fmt(rw) + "/Jahr für " + flaeche + "m². Aufschlüsselung anfordern." });
      hi = a + "% über Richtwert! Aufschlüsselung anfordern.";
    } else if (b > rw * 1.3) {
      st = "hoch";
      widerspruch.push({ typ: "statistisch", betrag: Math.max(0, b - rw), text: "Hausmeisterkosten " + fmt(b) + " (" + a + "% über Richtwert). Nachweis anfordern." });
    }
    posten_bewertung.push({ posten: "Hauswart (Hausmeister)", betrag: b, richtwert: rw, abweichung_prozent: a, status: st, hinweis: hi, paragraf: "§ 2 Nr. 14 BetrKV", steuerlich_35a: true, steuerArt: steuerArtFuer("hauswart"), steuerGrund: steuerGrundFuer("hauswart") });
  }

  // Wasser + Abwasser
  const kw = toNum(w.kaltwasser), ew = toNum(w.entwasserung), nw = toNum(w.niederschlagswasser);
  const wg = kw + ew + nw;
  if (wg > 0) {
    const rw = rj(R.wasser_abwasser), a = abw(wg, rw);
    // WORTWAHL KORRIGIERT 11.09.2026 nach Stefans Echttest mit seiner eigenen
    // Abrechnung (ABG Frankfurt, 80,55 m², 2025).
    //
    // Vorher stand hier bei mehr als 60 % Abweichung: "mögliche
    // Doppelberechnung!" und im Brief "Auf Doppelberechnung prüfen."
    // Das ist ein Vorwurf, den die Datenlage nicht trägt. Begründung:
    //
    // Wasser ist eine VERBRAUCHSABHÄNGIGE Position. Der DMB-Wert von
    // 0,29 €/m²/Monat (Primärquelle geprüft: "Alle Betriebskostenarten im
    // Überblick", DMB, 18.12.2025, Abrechnungsjahr 2024) ist ein
    // bundesweiter Durchschnitt pro Quadratmeter. Wie viel Wasser ein
    // Haushalt verbraucht, hängt aber an der Personenzahl, nicht an der
    // Wohnfläche. Ein Vierpersonenhaushalt auf 70 m² liegt zwangsläufig
    // weit über diesem Wert, ohne dass die Abrechnung einen Fehler hätte.
    //
    // In Stefans Fall: 514,76 € bei 80,55 m² sind 84 % über dem Richtwert.
    // Der Kaltwasserverbrauch laut Abrechnung beträgt 113,64 m³ im Jahr,
    // was bei etwa 45 m³ pro Person und Jahr auf zwei bis drei Personen
    // deutet. Die Abweichung ist damit vollständig durch den Verbrauch
    // erklärbar. Ein Hinweis auf "Doppelberechnung" wäre schlicht falsch
    // gewesen und hätte den Nutzer mit einem unhaltbaren Vorwurf zum
    // Vermieter geschickt.
    //
    // Dasselbe gilt sinngemäß für Heizung und Warmwasser. Bei FIXEN
    // Positionen (Grundsteuer, Versicherungen, Müll, Hausreinigung) ist der
    // Flächenvergleich dagegen aussagekräftig, weil dort kein individueller
    // Verbrauch hineinspielt. Diese Unterscheidung ist der Kern einer
    // ehrlichen Prüfung und darf nicht wieder eingeebnet werden.
    // Keine Beanstandung, siehe ausführliche Begründung beim Heizungsblock
    // weiter oben. Wasser ist verbrauchsabhängig, und der Verbrauch hängt an
    // der Personenzahl, nicht an der Wohnfläche. Ein Vierpersonenhaushalt auf
    // 70 m² liegt zwangsläufig weit über dem Durchschnitt pro Quadratmeter,
    // ohne dass die Abrechnung einen Fehler hätte.
    const st = "ok";
    let hi = "Richtwert Wasser und Abwasser für " + flaeche + "m²: " + fmt(rw) + "/Jahr (bundesweiter DMB-Durchschnitt). Wasser wird nach Verbrauch abgerechnet, deshalb sagt ein Vergleich pro Quadratmeter wenig aus.";
    if (wg > rw * 1.3) {
      hi = "Liegt " + a + "% über dem DMB-Durchschnitt. Das ist bei mehreren Personen im Haushalt normal, denn der Wasserverbrauch hängt an der Personenzahl und nicht an der Wohnfläche. Als Orientierung: etwa 45 m³ pro Person und Jahr. Sinnvoll ist ein Vergleich der Zählerstände mit dem Vorjahr, und ein Blick darauf, ob die Kanalgebühren nur einmal auftauchen.";
    }
    // Richtwert-Anzeige proportional zum tatsächlichen Anteil an der Gesamtsumme wg aufteilen
    // (nicht pauschal 50/50) — bei pauschaler Aufteilung zeigte die Zeile "Wasserversorgung" einen
    // Richtwert, der zur oben berechneten Abweichung "a" nicht mehr passte, sobald nur eine der beiden
    // Positionen befüllt war (Normalfall: Kanalgebühren stecken schon im Kaltwasser-Sammelposten,
    // "Entwässerung" bleibt 0). Durch den proportionalen Anteil gilt für jede Zeile exakt
    // betrag/richtwert == wg/rw == a — mathematisch konsistent, unabhängig davon, wie sich wg auf
    // kw/ew verteilt. Gefunden + korrigiert 10.08.2026, siehe CHANGELOG.
    const richtwertKw = rw * (kw / wg);
    const richtwertEw = rw * (ew / wg);
    if (kw > 0) posten_bewertung.push({ posten: "Wasserversorgung", betrag: kw, richtwert: richtwertKw, abweichung_prozent: a, status: st, hinweis: hi, paragraf: "§ 2 Nr. 2 BetrKV", steuerArt: steuerArtFuer("kaltwasser"), steuerGrund: steuerGrundFuer("kaltwasser") });
    if (ew > 0) posten_bewertung.push({ posten: "Entwässerung", betrag: ew, richtwert: richtwertEw, abweichung_prozent: a, status: st, hinweis: hi, paragraf: "§ 2 Nr. 2 BetrKV", steuerArt: steuerArtFuer("entwasserung"), steuerGrund: steuerGrundFuer("entwasserung") });
    if (nw > 0) posten_bewertung.push({ posten: "Niederschlagswasser", betrag: nw, richtwert: 0, abweichung_prozent: 0, status: "ok", hinweis: "Kommunale Gebühr.", paragraf: "§ 2 Nr. 2 BetrKV", steuerArt: steuerArtFuer("niederschlagswasser"), steuerGrund: steuerGrundFuer("niederschlagswasser") });
  }

  // Straßenreinigung + Schnee-/Eisbeseitigung — DMB weist nur einen KOMBINIERTEN
  // Wert aus (Straßenreinigung inkl. Winterdienst), beide Positionen sind zudem
  // rechtlich dieselbe Kategorie (§ 2 Nr. 8 BetrKV). Analog zu Heizung/Warmwasser
  // jetzt als kombinierte Zeile (trägt den Status) + neutrale "davon"-Unterzeilen
  // dargestellt, sobald beide Felder befüllt sind (10.08.2026, siehe CHANGELOG).
  // Vorher trugen beide Einzelzeilen denselben "Stark erhöht"-Status — irreführend,
  // wenn eine der beiden Positionen für sich genommen klein/unauffällig war.
  const sr = toNum(w.strassenreinigung), se = toNum(w.schnee_eis_beseitigung);
  const srg = sr + se;
  if (srg > 0) {
    const rw = rj(R.strassenreinigung), a = abw(srg, rw);
    let st = "ok", hi = "Richtwert Straßenreinigung inkl. Winterdienst für " + flaeche + "m²: " + fmt(rw) + "/Jahr.";
    const bez = listeText([["Straßenreinigung", sr], ["Schnee-/Eisbeseitigung", se]]);
    if (srg > rw * 1.8) { st = "sehr_hoch"; widerspruch.push({ typ: "statistisch", betrag: Math.max(0, srg - rw), text: bez + (sr > 0 && se > 0 ? " (zusammen " + fmt(srg) + ")" : "") + " liegen " + a + "% über dem DMB-Richtwert für Straßenreinigung inkl. Winterdienst. Belege anfordern." }); hi = a + "% über DMB-Richtwert! Belege anfordern."; }
    else if (srg > rw * 1.4) { st = "hoch"; hi = a + "% über DMB-Richtwert."; }
    if (sr > 0 && se > 0) {
      posten_bewertung.push({ posten: "Straßenreinigung & Winterdienst (kombiniert)", betrag: srg, richtwert: rw, abweichung_prozent: a, status: st, hinweis: hi, paragraf: "§ 2 Nr. 8 BetrKV" });
      posten_bewertung.push({ posten: "davon Straßenreinigung", betrag: sr, richtwert: 0, abweichung_prozent: 0, status: "ok", hinweis: "Bereits in der Vergleichsrechnung oben enthalten.", paragraf: "§ 2 Nr. 8 BetrKV", steuerArt: steuerArtFuer("strassenreinigung"), steuerGrund: steuerGrundFuer("strassenreinigung") });
      posten_bewertung.push({ posten: "davon Schnee-/Eisbeseitigung", betrag: se, richtwert: 0, abweichung_prozent: 0, status: "ok", hinweis: "Bereits in der Vergleichsrechnung oben enthalten.", paragraf: "§ 2 Nr. 8 BetrKV", steuerlich_35a: true, steuerArt: steuerArtFuer("schnee_eis_beseitigung"), steuerGrund: steuerGrundFuer("schnee_eis_beseitigung") });
    } else if (sr > 0) {
      posten_bewertung.push({ posten: "Straßenreinigung", betrag: sr, richtwert: rw, abweichung_prozent: a, status: st, hinweis: hi, paragraf: "§ 2 Nr. 8 BetrKV" });
    } else {
      posten_bewertung.push({ posten: "Schnee- und Eisbeseitigung", betrag: se, richtwert: rw, abweichung_prozent: a, status: st, hinweis: hi, paragraf: "§ 2 Nr. 8 BetrKV", steuerlich_35a: true, steuerArt: steuerArtFuer("schnee_eis_beseitigung"), steuerGrund: steuerGrundFuer("schnee_eis_beseitigung") });
    }
  }

  // Versicherungen — DMB weist nur einen KOMBINIERTEN Wert für alle Gebäude-
  // Sachversicherungen aus. Fünf Eingabefelder (so wie viele Abrechnungen sie
  // tatsächlich einzeln ausweisen), aber bewusst KEINE erfundenen Einzel-
  // Richtwerte pro Versicherungsart — stattdessen Summe gegen den einen
  // offiziellen Kombiwert geprüft (08/2026, ersetzt die vorherige 65/25/10%-
  // Schätzung ohne Quelle). Darstellung analog zu Heizung/Warmwasser und
  // Straßenreinigung/Winterdienst: EINE kombinierte Zeile trägt den Status,
  // sobald mehr als eine Versicherungsart befüllt ist; die Einzelpositionen
  // darunter sind neutral (10.08.2026, siehe CHANGELOG — vorher trugen alle
  // Einzelzeilen denselben "Stark erhöht"-Status, auch kleine Beträge wie eine
  // 4-Euro-Haftpflichtversicherung, was irreführend wirkte). Im Anschreiben
  // werden trotzdem IMMER alle befüllten Einzelpositionen mit Betrag benannt,
  // nie nur pauschal "Versicherungen sind zu hoch" — eine so unbestimmte
  // Einwendung nach § 556 Abs. 3 BGB wäre zu unspezifisch.
  const vFeuer = toNum(w.feuerversicherung), vSturm = toNum(w.sturm_hagel_versicherung),
        vLeitung = toNum(w.leitungswasser_versicherung), vHaft = toNum(w.haftpflichtversicherung),
        vGlas = toNum(w.glasversicherung);
  const vg = vFeuer + vSturm + vLeitung + vHaft + vGlas;
  const vEinzelpositionen = [["Gebäude- und Feuerversicherung", vFeuer], ["Sturm- und Hagelversicherung", vSturm], ["Leitungswasserversicherung", vLeitung], ["Haftpflichtversicherung Gebäude", vHaft], ["Glasversicherung", vGlas]];
  const vAnzahlBefuellt = vEinzelpositionen.filter(([, b]) => b > 0).length;
  if (vg > 0) {
    const rw = rj(R.versicherungen), a = abw(vg, rw);
    let st = "ok", hi = "Richtwert für alle Gebäude-Sachversicherungen zusammen, " + flaeche + "m²: " + fmt(rw) + "/Jahr.";
    if (vg > rw * 1.8) { st = "sehr_hoch"; widerspruch.push({ typ: "statistisch", betrag: Math.max(0, vg - rw), text: listeText(vEinzelpositionen) + (vAnzahlBefuellt > 1 ? " (zusammen " + fmt(vg) + ")" : "") + " liegen " + a + "% über dem DMB-Richtwert für Gebäude-Sachversicherungen insgesamt. Um Vorlage der Versicherungspolicen und um Erläuterung der Prämienentwicklung wird gebeten." }); hi = a + "% über DMB-Richtwert (alle Versicherungen zusammen)! Nachweis anfordern."; }
    else if (vg > rw * 1.4) { st = "hoch"; hi = a + "% über DMB-Richtwert (alle Versicherungen zusammen)."; }
    if (vAnzahlBefuellt > 1) {
      posten_bewertung.push({ posten: "Versicherungen (kombiniert)", betrag: vg, richtwert: rw, abweichung_prozent: a, status: st, hinweis: hi, paragraf: "§ 2 Nr. 13 BetrKV" });
      vEinzelpositionen.forEach(([label, betrag]) => {
        // steuerArt fest "nicht": Alle fünf Zeilen sind Versicherungsprämien.
        // Prämien sind keine Dienstleistung im Haushalt und damit nie nach
        // § 35a EStG begünstigt, unabhängig von der Versicherungsart.
        if (betrag > 0) posten_bewertung.push({ posten: "davon " + label, betrag, richtwert: 0, abweichung_prozent: 0, status: "ok", hinweis: "Bereits in der Vergleichsrechnung oben enthalten.", paragraf: "§ 2 Nr. 13 BetrKV", steuerArt: "nicht", steuerGrund: "Versicherungsprämie, keine Dienstleistung." });
      });
    } else {
      vEinzelpositionen.forEach(([label, betrag]) => {
        if (betrag > 0) posten_bewertung.push({ posten: label, betrag, richtwert: rw, abweichung_prozent: a, status: st, hinweis: hi, paragraf: "§ 2 Nr. 13 BetrKV" });
      });
    }
  }

  // Generische Positionen mit direktem Richtwert-Mapping.
  // heizung_betriebsstrom, heizung_wartung, wasserzaehler, rauchwarnmelder_wartung,
  // gasleitungspruefung bewusst NICHT enthalten: kein offizieller Einzel-
  // Vergleichswert vorhanden (siehe Änderungs-Hinweis oben) — fallen dadurch
  // unten korrekt auf den generischen "prüfen"-Zweig.
  const bm = {
    grundsteuer: [R.grundsteuer, "§ 2 Nr. 1 BetrKV"],
    muellbeseitigung: [R.muell, "§ 2 Nr. 8 BetrKV"],
    allgemeinstrom: [R.allgemeinstrom, "§ 2 Nr. 11 BetrKV"],
    gartenpflege: [R.gartenpflege, "§ 2 Nr. 10 BetrKV"],
    aufzug: [R.aufzug, "§ 2 Nr. 7 BetrKV"],
    schornsteinreinigung: [R.schornstein, "§ 2 Nr. 12 BetrKV"],
    hausreinigung: [R.gebaeudereinigung, "§ 2 Nr. 9 BetrKV"],
  };

  const skip = new Set([
    "heizkosten_gesamt", "warmwasser_gesamt", "co2_abgabe", "hauswart",
    "kaltwasser", "entwasserung", "niederschlagswasser", "kabelanschluss",
    "strassenreinigung", "schnee_eis_beseitigung",
    "feuerversicherung", "sturm_hagel_versicherung", "leitungswasser_versicherung", "haftpflichtversicherung", "glasversicherung",
    "verwaltungskosten", "instandhaltung",
  ]);

  ALLE_POSTEN.forEach(p => {
    const b = toNum(w[p.key]);
    if (b <= 0 || skip.has(p.key)) return;
    const entry = bm[p.key];
    if (entry) {
      const [rm, para] = entry, rw = rj(rm), a = abw(b, rw);
      // Grundsteuer-Sonderfall (gefunden 10.08.2026, siehe CHANGELOG): Der
      // DMB-Richtwert ist ein BUNDESWEITER Durchschnitt inkl. günstiger
      // ländlicher Regionen. In Großstädten mit hohen Immobilienwerten
      // (bestätigt am Beispiel Frankfurt: DMB Mieterschutzverein Frankfurt,
      // Interview t-online 06.02.2025 — dort historisch 10-49 Cent/m²/Monat
      // üblich, weit über dem DMB-Schnitt von 0,18€) ist eine überdurch-
      // schnittliche Grundsteuer oft schlicht ortsüblich, kein Abrechnungs-
      // fehler. Ohne diesen Hinweis suggeriert die Abweichungsanzeige mehr
      // Sicherheit, als die Methode hergibt.
      const istGrundsteuer = p.key === "grundsteuer";
      let st = "ok", hi = rw > 0 ? "Richtwert für " + flaeche + "m²: " + fmt(rw) + "/Jahr." : "Formale Zulässigkeit prüfen.";
      if (a > 80) {
        st = "sehr_hoch";
        hi = a + "% über DMB-Richtwert! Belege anfordern." + (istGrundsteuer ? " In Großstädten mit hohen Immobilienwerten oft ortsüblich, kein sicheres Zeichen für einen Fehler." : "");
        widerspruch.push({
          typ: "statistisch",
          text: p.label + " " + fmt(b) + " liegt " + a + "% über DMB-Richtwert. Belegeinsicht anfordern (§ 259 BGB)."
            + (istGrundsteuer ? " Hinweis: Der DMB-Richtwert ist ein bundesweiter Durchschnitt; in Großstädten mit hohen Immobilienwerten ist eine überdurchschnittliche Grundsteuer oft ortsüblich und kein Abrechnungsfehler." : ""),
        });
      }
      else if (a > 40) { st = "hoch"; hi = a + "% über DMB-Richtwert. Prüfenswert."; }
      posten_bewertung.push({ posten: p.label, betrag: b, richtwert: rw, abweichung_prozent: Math.max(0, a), status: st, hinweis: hi, paragraf: para, steuerlich_35a: STEUERLICH_35A.has(p.key), steuerArt: steuerArtFuer(p.key), steuerGrund: steuerGrundFuer(p.key) });
    } else {
      posten_bewertung.push({ posten: p.label, betrag: b, richtwert: 0, abweichung_prozent: 0, status: "pruefen", hinweis: "Kein offizieller Vergleichswert für diese Position verfügbar. Prüfe ob im Mietvertrag vereinbart und nach § 2 BetrKV zulässig.", paragraf: "§ 2 BetrKV", steuerlich_35a: STEUERLICH_35A.has(p.key), steuerArt: steuerArtFuer(p.key), steuerGrund: steuerGrundFuer(p.key) });
    }
  });

  return { posten_bewertung, widerspruch, heizBefunde, kuerzungBetrag };
}

export function buildResult(w, wohn) {
  const R = BUSINESS.RICHTWERTE;
  const flaeche = Math.max(toNum(wohn.flaeche), 5);
  // co2_abgabe bewusst aus der Gesamtsumme ausgeschlossen (12.08.2026, echter
  // Bug, gefunden beim Testen mit Stefans realer Abrechnung 2025): Die
  // CO2-Kosten nach CO2KostAufG sind strukturell IMMER schon Teil der
  // bereits abgerechneten Heiz-/Brennstoffkosten (heizkosten_gesamt) — die
  // Angabe im Feld co2_abgabe ist eine informative Aufschlüsselung, wer
  // welchen Anteil dieser bereits enthaltenen Kosten trägt, kein zusätzlicher
  // Posten obendrauf. Vorher floss der Betrag zusätzlich in "gesamt" ein,
  // sobald das Feld befüllt war — das hat Gesamtkosten, Saldo und €/m²/Jahr
  // um genau diesen Betrag verfälscht (bestätigt: 80,87 € Differenz im
  // Realtest). co2_abgabe bleibt für Anzeige/Hinweis (co2_hinweis, Posten-
  // Zeile "Prüfen") erhalten, zählt nur nicht mehr zur Gesamtsumme.
  const gesamt = ALLE_POSTEN.filter(p => p.key !== "co2_abgabe").reduce((s, p) => s + toNum(w[p.key]), 0);
  const proQmJahr = gesamt / flaeche;
  const richtwertJahr = R.gesamt * 12;
  const vorauszahlung = toNum(wohn.vorauszahlung);
  const saldo = vorauszahlung > 0 ? gesamt - vorauszahlung : null;

  const { posten_bewertung, widerspruch, heizBefunde, kuerzungBetrag } = analysierePosten(w, wohn);

  // Abrechnungsfrist des Vermieters (§ 556 Abs. 3 Satz 2 BGB) — neu 10.08.2026,
  // siehe CHANGELOG, Stefans Wunsch. Der Vermieter muss innerhalb von 12
  // Monaten nach Ende des Abrechnungszeitraums abrechnen. Bei Kalenderjahr-
  // Abrechnung (der Regelfall, andere Zeiträume erfassen wir aktuell nicht)
  // endet der Zeitraum am 31.12. des Abrechnungsjahres, die Frist damit am
  // 31.12. des Folgejahres. Kommt die Abrechnung später beim Mieter an, ist
  // eine Nachforderung grundsätzlich ausgeschlossen (Ausnahme: Vermieter hat
  // die Verspätung nicht zu vertreten, z.B. bei verspätetem Grundsteuer-
  // bescheid — das können wir aus den Eingabedaten nicht erkennen, deshalb
  // Hinweis statt automatischer 100%-Sicherheit im Text). Nur ausgewertet,
  // wenn das Datum tatsächlich angegeben wurde (Feld ist optional).
  if (wohn.erhaltenAm) {
    const jahrNum = parseInt(wohn.jahr, 10);
    // <input type="date"> liefert "YYYY-MM-DD"; new Date(String) parst das
    // als UTC-Mitternacht. Der Vergleichswert fristEnde MUSS deshalb
    // ebenfalls über Date.UTC gebildet werden — sonst vergleicht man einen
    // UTC-Zeitpunkt mit einem lokalen Zeitpunkt, was am 31.12. je nach
    // Zeitzone/Sommerzeit zu einem falschen "verspätet"-Befund führen kann
    // (per Test gefunden: 31.12. exakt am Fristende wurde faelschlich als
    // Verstoß gewertet). Gleiches gilt für die Formatierung — timeZone:
    // "UTC" erzwingen, sonst kann die Anzeige vom Tag abweichen.
    const erhalten = new Date(wohn.erhaltenAm);
    if (jahrNum && !isNaN(erhalten.getTime())) {
      const fristEnde = new Date(Date.UTC(jahrNum + 1, 11, 31));
      if (erhalten > fristEnde) {
        const fristEndeText = fristEnde.toLocaleDateString("de-DE", { timeZone: "UTC" });
        const betroffenerBetrag = saldo != null && saldo > 0 ? saldo : 0;
        posten_bewertung.push({
          posten: "Abrechnungsfrist versäumt",
          betrag: betroffenerBetrag,
          richtwert: 0,
          abweichung_prozent: 100,
          status: "nicht_umlagefaehig",
          hinweis: "Die Abrechnung kam erst nach dem " + fristEndeText + " bei dir an, mehr als 12 Monate nach Ende des Abrechnungszeitraums " + jahrNum + ". Nach § 556 Abs. 3 Satz 2 BGB ist eine Nachforderung dann grundsätzlich ausgeschlossen, außer der Vermieter hat die Verspätung nicht zu vertreten.",
          paragraf: "§ 556 Abs. 3 S. 2 BGB",
        });
        widerspruch.push({
          typ: "hart",
          text: "Die Abrechnung ist erst nach dem " + fristEndeText + " bei mir eingegangen, mehr als 12 Monate nach Ende des Abrechnungszeitraums " + jahrNum + ". Nach § 556 Abs. 3 Satz 2 BGB ist eine Nachforderung damit ausgeschlossen. Ich widerspreche einer etwaigen Nachforderung aus diesem Grund"
            + (betroffenerBetrag > 0 ? " (" + fmt(betroffenerBetrag) + ")." : "."),
        });
      }
    }
  }

  // GESAMTBEWERTUNG, ergänzt um die Heizkostenbefunde (13.09.2026, Task #104).
  //
  // Die beiden Arten von Heizkostenbefund wirken unterschiedlich stark, und
  // das ist Absicht:
  //   schwere "hart" — ein Kürzungsrecht nach § 12 mit konkretem Betrag. Das
  //                    ist ein Rechtsverstoß mit unmittelbarer Geldfolge und
  //                    wiegt so schwer wie eine nicht umlagefähige Position.
  //   schwere "form" — ein falscher Verteilerschlüssel nach § 7 oder § 8. Die
  //                    Abrechnung ist fehlerhaft und muss korrigiert werden,
  //                    ob dabei Geld für den Mieter herausspringt, hängt aber
  //                    an seinem eigenen Verbrauch. Deshalb "auffaellig" und
  //                    nicht "kritisch": Wir behaupten nur, was wir wissen.
  const heizHart = heizBefunde.some(b => b.status === "verstoss" && b.schwere === "hart");
  const heizForm = heizBefunde.some(b => b.status === "verstoss" && b.schwere === "form");
  const hatKritisch = posten_bewertung.some(p => p.status === "nicht_umlagefaehig") || heizHart;
  const hatSehrHoch = posten_bewertung.some(p => p.status === "sehr_hoch");
  const hatHoch = posten_bewertung.some(p => ["hoch", "pruefen"].includes(p.status));
  // Ohne plausible Wohnfläche darf der Quadratmetervergleich NIRGENDS
  // stattfinden, auch nicht in der Kopfzeile. analysierePosten() liefert in
  // dem Fall schon keine Beanstandungen mehr (siehe dort), die Zeile
  // "Auffällig: 199,49/m2/Jahr" stand danach aber trotzdem noch im Ergebnis,
  // weil proQmJahr hier oben getrennt berechnet wird. Im Test gefunden,
  // unmittelbar nach dem Einbau der ersten Sicherung.
  const flaechePlausibel = toNum(wohn.flaeche) >= 5;
  const gesamtZuHoch = flaechePlausibel && proQmJahr > richtwertJahr * 1.25;
  const bew = hatKritisch ? "kritisch" : (hatSehrHoch || gesamtZuHoch || heizForm || widerspruch.length > 1) ? "auffaellig" : hatHoch ? "auffaellig" : "ok";

  // WICHTIG (gefunden 10.08.2026 durch Stefans Plausibilitätsfrage, siehe CHANGELOG):
  // Die Bedingung "betrag > richtwert" allein reicht NICHT — sie greift auch bei
  // Positionen, die z.B. nur 10-20% über dem Richtwert liegen und deshalb im
  // Bericht korrekt als "Unauffällig" ausgewiesen werden (Status "ok", Schwelle
  // für "hoch" liegt bei >40% bzw. >1,3x je nach Position). Ohne den Status-Check
  // floss die Differenz trotzdem lautlos in "Mögliche Rückforderung" ein — die
  // Summenanzeige widersprach damit der eigenen Tabelle. Nur tatsächlich als
  // "hoch"/"sehr_hoch"/"nicht_umlagefaehig" geflaggte Positionen dürfen zur
  // Rückforderung beitragen, sonst ist die Zahl nicht mehr durch die sichtbaren
  // Status-Markierungen gedeckt.
  // kuerzungBetrag (Heizkosten, § 12 HeizkostenV) kommt oben drauf. Er stammt
  // nicht aus posten_bewertung, weil die Kürzung kein einzelner Posten ist,
  // sondern ein prozentualer Abschlag auf die Heiz- und Warmwasserkosten.
  // Siehe den Abschnitt "Formale Prüfung der Heizkostenabrechnung" oben.
  const ersparnis = posten_bewertung.reduce((s, p) => {
    if (p.status === "nicht_umlagefaehig") return s + p.betrag;
    if (p.status !== "ok" && p.richtwert > 0 && p.betrag > p.richtwert) return s + (p.betrag - p.richtwert);
    return s;
  }, 0) + kuerzungBetrag;

  // Aufteilung nach Beweisstärke (10.08.2026, siehe CHANGELOG): "hart" = aus
  // den Eingabedaten allein beweisbar (aktuell: status "nicht_umlagefaehig",
  // bislang nur der Kabelanschluss-Fall). "statistisch" = Richtwert-Abweichung
  // oder offene Frage — ein Anlass zur Nachfrage, kein Beweis. Diese Trennung
  // zieht sich auch durch widerspruch[].typ (siehe analysierePosten oben) und
  // wird in BriefPDF.jsx/Result.jsx/AbrechnungPDF.jsx verwendet, um nicht mehr
  // Sicherheit zu suggerieren, als die Methode tatsächlich hergibt.
  const ersparnisHart = posten_bewertung.reduce((s, p) => p.status === "nicht_umlagefaehig" ? s + p.betrag : s, 0) + kuerzungBetrag;
  const ersparnisStatistisch = Math.round((ersparnis - ersparnisHart) * 100) / 100;
  const widerspruchHart = widerspruch.filter(g => g.typ === "hart");
  const widerspruchStatistisch = widerspruch.filter(g => g.typ !== "hart");

  const saldoText = saldo !== null ? (saldo > 0 ? " Nachzahlung: " + fmt(saldo) + "." : " Guthaben: " + fmt(Math.abs(saldo)) + ", trotzdem inhaltlich prüfen!") : "";

  return {
    gesamtbewertung: bew,
    gesamt,
    // Saldo als eigenes Feld (nicht nur in zusammenfassung-Text eingebacken):
    // > 0 = Nachzahlung, < 0 = Guthaben, null = keine Vorauszahlung angegeben.
    // Wird von BriefPDF.jsx gebraucht, um den "Nachzahlung unter Vorbehalt"-
    // Satz nur bei tatsächlicher Nachzahlung anzuzeigen (echter Bug, 08/2026:
    // der Satz stand vorher immer im Brief, auch bei Guthaben, siehe CHANGELOG).
    saldo,
    // ─────────────────────────────────────────────────────────────────────
    // WIDERSPRUCH BESEITIGT, 13.09.2026 im totalen Test gefunden.
    //
    // WAS FALSCH WAR: Die Gesamtbewertung (bew, oben) wird auch dann
    // "auffaellig", wenn Posten den Status "pruefen" haben, also solche ohne
    // offiziellen Vergleichswert. Der Zusammenfassungstext kannte diesen Fall
    // nicht und sprang nur bei statistischer Überschreitung um. Ergebnis im
    // Testfall: Bewertung "auffaellig", daneben der Satz "Weitgehend
    // unauffällig". Das Dokument widersprach sich selbst.
    //
    // ZWEITER FEHLER, der dabei auffiel: Einfach den Text auf "Auffällig"
    // umzustellen wäre auch falsch gewesen. Im Testfall lagen die Kosten bei
    // 5,93 €/m²/Jahr gegenüber einem Richtwert von 32,04 €, also weit
    // darunter. "Auffällig: 5,93/m2/Jahr. DMB-Richtwert: 32,04" hätte niemand
    // verstanden.
    //
    // Die beiden Gründe für "auffaellig" sind eben verschieden:
    //   a) Die Kosten sind statistisch zu hoch.
    //   b) Einzelne Posten brauchen einen Blick in den Mietvertrag, weil es
    //      für sie keinen Vergleichswert gibt. Über die Höhe sagt das nichts.
    // Der Text unterscheidet das jetzt, und er nennt bei b) ausdrücklich, dass
    // die Gesamtkosten in Ordnung sind, damit niemand erschrickt.
    // ─────────────────────────────────────────────────────────────────────
    zusammenfassung: (() => {
      const zuPruefen = posten_bewertung.filter(p => ["hoch", "pruefen"].includes(p.status)).length;
      const postenKritisch = posten_bewertung.some(p => p.status === "nicht_umlagefaehig");
      // Fehlt die Wohnfläche, kann und darf hier gar keine Einordnung stehen.
      // Der Text sagt stattdessen, was fehlt und was es bringt, es
      // nachzutragen.
      if (!flaechePlausibel) {
        return "Deine Wohnfläche fehlt, deshalb können wir die Kosten nicht mit dem DMB-Richtwert vergleichen. Alle Vergleichswerte gelten pro Quadratmeter. "
          + "Erfasst sind bisher " + fmt(gesamt) + ". Trage die Wohnfläche nach, dann bewerten wir jede Position." + saldoText;
      }
      const lage = proQmJahr > richtwertJahr
        ? "über dem DMB-Richtwert von " + fmt(richtwertJahr) + "/m2/Jahr"
        : "unter dem DMB-Richtwert von " + fmt(richtwertJahr) + "/m2/Jahr";
      // ZWEITE RUNDE DESSELBEN FEHLERS, 13.09.2026 im eigenen Testlauf
      // gefunden. Nach dem Einbau der Heizkostenprüfung konnte die
      // Gesamtbewertung erneut auf Gründe umspringen, die dieser Text nicht
      // kannte. Ergebnis im Test: "0 Posten brauchen deinen Blick in den
      // Mietvertrag" bei einem eindeutigen Verstoß gegen § 7 HeizkostenV.
      //
      // Damit das nicht ein drittes Mal passiert, ist die Reihenfolge hier
      // jetzt dieselbe wie bei der Berechnung von `bew` weiter oben, und der
      // Zähler zuPruefen wird nie mehr blind ausgegeben. Wer künftig einen
      // neuen Grund für "auffaellig" oder "kritisch" ergänzt, muss hier einen
      // passenden Zweig hinzufügen. scripts/pdf-konsistenz-test.mjs prüft das
      // Zusammenspiel über alle Eingabekonstellationen.
      // Der Betrag darf hier nur auftauchen, wenn er auch berechnet werden
      // konnte. Wer seine Heiz- und Warmwasserkosten nicht eingetragen hat,
      // bekam sonst "ein gesetzliches Kürzungsrecht von € 0,00" zu lesen, was
      // das Gegenteil dessen aussagt, was gemeint ist. Im Testlauf gefunden.
      if (heizHart && !postenKritisch) {
        return "Deine Heizkostenabrechnung verletzt die Heizkostenverordnung. Daraus folgt ein gesetzliches Kürzungsrecht"
          + (kuerzungBetrag > 0 ? " von " + fmt(kuerzungBetrag) : "")
          + ", das du selbst geltend machen kannst. Einzelheiten im Abschnitt zur Heizkostenabrechnung." + saldoText;
      }
      if (hatKritisch) {
        return "Kritisch: " + widerspruch.length + (widerspruch.length === 1 ? " fehlerhafter Punkt (" : " fehlerhafte Punkte (") + fmt(gesamt) + ", " + fmt(proQmJahr) + "/m2/Jahr)." + saldoText;
      }
      if (hatSehrHoch || gesamtZuHoch) {
        return "Auffällig: " + fmt(proQmJahr) + "/m2/Jahr. DMB-Richtwert: " + fmt(richtwertJahr) + "/m2/Jahr. " + widerspruch.length + " Posten zur Prüfung." + saldoText;
      }
      if (heizForm) {
        return "Deine Heizkostenabrechnung verteilt die Kosten nicht im vorgeschriebenen Verhältnis. Der Vermieter muss sie korrigieren. "
          + "Die Gesamtkosten selbst sind in Ordnung, sie liegen mit " + fmt(proQmJahr) + "/m2/Jahr " + lage + "." + saldoText;
      }
      if (bew === "auffaellig" && zuPruefen > 0) {
        return zuPruefen + (zuPruefen === 1 ? " Posten braucht" : " Posten brauchen") +
          " deinen Blick in den Mietvertrag. Die Gesamtkosten selbst sind in Ordnung, sie liegen mit " +
          fmt(proQmJahr) + "/m2/Jahr " + lage + "." + saldoText;
      }
      if (bew === "auffaellig") {
        return "Mehrere Punkte solltest du nachprüfen. Die Gesamtkosten selbst sind in Ordnung, sie liegen mit "
          + fmt(proQmJahr) + "/m2/Jahr " + lage + "." + saldoText;
      }
      return "Weitgehend unauffällig: " + fmt(proQmJahr) + "/m2/Jahr (DMB-Richtwert: " + fmt(richtwertJahr) + "/m2/Jahr)." + saldoText;
    })(),
    fehler_anzahl: widerspruch.length,
    moegliche_ersparnis: Math.round(ersparnis * 100) / 100,
    // Aufteilung nach Beweisstärke, siehe Kommentar oben. Für UI/PDF: Nur
    // ersparnis_hart ist eine belastbare Zahl, ersparnis_statistisch ist eine
    // Schätzung auf Basis von Durchschnittswerten.
    ersparnis_hart: Math.round(ersparnisHart * 100) / 100,
    ersparnis_statistisch: ersparnisStatistisch,
    // null statt einer Zahl, wenn die Wohnfläche fehlt. Sonst stünde in der
    // Kennzahlen-Kachel auf der Ergebnisseite und im PDF ein Wert, der aus
    // dem 5-m²-Notbehelf entstanden ist und mit der Wohnung nichts zu tun
    // hat. Result.jsx und AbrechnungPDF.jsx zeigen dann einen Strich.
    pro_qm_gesamt: flaechePlausibel ? parseFloat(proQmJahr.toFixed(2)) : null,
    richtwert_pro_qm_jahr: richtwertJahr,
    posten_bewertung,
    // Formale Prüfung der Heizkostenabrechnung (§§ 7, 8, 12 HeizkostenV).
    // Eigener Abschnitt statt Tabellenzeilen, Begründung siehe analysierePosten.
    // Leeres Array, wenn der Kunde die freiwilligen Angaben nicht gemacht hat.
    // Darauf verlassen sich Result.jsx und AbrechnungPDF.jsx: Sie zeigen den
    // Abschnitt nur, wenn er Inhalt hat, und sonst den Einladungstext.
    heiz_befunde: heizBefunde,
    heiz_kuerzung: Math.round(kuerzungBetrag * 100) / 100,
    widerspruchsgruende: widerspruch,
    widerspruchsgruende_hart: widerspruchHart,
    widerspruchsgruende_statistisch: widerspruchStatistisch,
    // Zwei unterschiedliche Fristen aus § 556 Abs. 3 BGB, nicht verwechseln:
    // (1) Vermieter -> Mieter: Abrechnung muss binnen 12 Monaten nach Ende
    //     des Abrechnungszeitraums zugehen (Satz 2) — dazu oben der
    //     "Abrechnungsfrist versäumt"-Befund, falls erhaltenAm gesetzt ist.
    // (2) Mieter -> Vermieter: Einwendungen (Widerspruch) müssen binnen 12
    //     Monaten NACH ERHALT der Abrechnung erhoben werden (Satz 3) — das
    //     ist die Frist, die hier ausgegeben wird. Neu 10.08.2026 (siehe
    //     CHANGELOG): Wenn erhaltenAm bekannt ist, exaktes Datum statt der
    //     bisherigen "typisch Ende (jahr+2)"-Näherung berechnen.
    fristen_hinweis: (() => {
      if (wohn.erhaltenAm) {
        const erhalten = new Date(wohn.erhaltenAm);
        if (!isNaN(erhalten.getTime())) {
          const einwendungsfrist = new Date(erhalten);
          einwendungsfrist.setFullYear(einwendungsfrist.getFullYear() + 1);
          const heute = new Date();
          const abgelaufen = heute > einwendungsfrist;
          return "Widerspruchsfrist: 12 Monate nach Erhalt der Abrechnung (§ 556 Abs. 3 Satz 3 BGB). Abrechnung erhalten am " + erhalten.toLocaleDateString("de-DE", { timeZone: "UTC" }) + ". Frist endet am " + einwendungsfrist.toLocaleDateString("de-DE", { timeZone: "UTC" }) + "."
            + (abgelaufen ? " Diese Frist ist bereits abgelaufen: ein Widerspruch ist dann grundsätzlich nicht mehr möglich, bitte anwaltlich prüfen lassen." : " Sofort handeln!");
        }
      }
      return "Widerspruchsfrist: 12 Monate nach Erhalt der Abrechnung (§ 556 Abs. 3 Satz 3 BGB). Für Abrechnungsjahr " + wohn.jahr + " endet die Frist typisch Ende " + (parseInt(wohn.jahr) + 2) + " (Näherungswert, trage oben das genaue Erhaltsdatum ein für eine exakte Frist). Sofort handeln!";
    })(),
    naechste_schritte: [
      widerspruch.length > 0 ? "Prüfbericht mit Mustertext per Einschreiben senden" : "Belege beim Vermieter anfordern (§ 259 BGB)",
      "Originalbelege einsehen, dieses Recht besteht unabhängig vom Ergebnis",
      "Bei Ablehnung: Deutschen Mieterbund einschalten (mieterbund.de · Tel. 030 223230)",
    ],
    co2_hinweis: toNum(w.co2_abgabe) > 0 ? "CO2-Abgabe abgerechnet: Vermieter muss je nach Energieklasse 0-95% selbst tragen. Energieausweis anfordern." : "",
  };
}
