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
const STEUERLICH_35A = new Set([
  "gartenpflege", "hausreinigung", "schornsteinreinigung", "aufzug",
  "heizung_wartung", "rauchwarnmelder_wartung",
]);

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
      { key: "entwasserung", label: "Entwässerung / Abwasser", tip: "Kanalgebühren der Gemeinde", aliases: ["Kanalgebühr", "Abwasserkosten"] },
      { key: "niederschlagswasser", label: "Niederschlagswassergebühr", tip: "Manche Kommunen erheben dies separat", aliases: ["Regenwasser"], selten: true },
    ]},
  { id: "heizung", label: "Heizung", paragraf: "§ 2 Nr. 4 BetrKV", icon: "🔥",
    posten: [
      { key: "heizkosten_gesamt", label: "Heizkosten", pflicht: true, tip: "Gesamte Heizkosten lt. Abrechnung — auf vielen Abrechnungen als 'Heizung Grundanteil' + 'Heizung Verbrauchsanteil' getrennt ausgewiesen, dann beide Beträge zusammenzählen", aliases: ["Wärmeversorgung", "Zentralheizung", "Heizung Grundanteil", "Heizung Verbrauchsanteil"] },
      { key: "heizung_betriebsstrom", label: "Betriebsstrom Heizungsanlage", tip: "Strom für Pumpen, Steuerung", aliases: ["Stromkosten Heizung"], selten: true },
      { key: "heizung_wartung", label: "Wartung Heizungsanlage", tip: "Wartung ja, Reparaturen nein", aliases: ["Heizkosten Wartung", "Gerätemiete Heizung"], selten: true },
      { key: "co2_abgabe", label: "CO2-Abgabe / Kohlendioxidkosten", tip: "Vermieter trägt je nach Energieklasse 0-95%. Achtung: steht oft NICHT als eigene Zeile auf der Hauptseite, sondern nur auf einer Detail-Anlage weiter hinten in der Abrechnung ('CO2-Kosten', 'Aufteilung der CO2-Kosten') — dort nachschauen, wenn hier nichts auf den ersten Blick zu finden ist.", aliases: ["CO2-Kosten", "CO2KostAufG", "Kohlendioxidabgabe"] },
    ]},
  { id: "warmwasser", label: "Warmwasser", paragraf: "§ 2 Nr. 5 BetrKV", icon: "🔥",
    posten: [
      { key: "warmwasser_gesamt", label: "Warmwasserversorgung", pflicht: true, tip: "Muss separat ausgewiesen sein — auf manchen Abrechnungen als 'Warmwasser Grundanteil' + 'Warmwasser Verbrauchsanteil' getrennt, dann beide zusammenzählen", aliases: ["Warmwasser Grundanteil", "Warmwasser Verbrauchsanteil"] },
    ]},
  { id: "aufzug", label: "Aufzug", paragraf: "§ 2 Nr. 7 BetrKV", icon: "⚙️",
    posten: [
      { key: "aufzug", label: "Aufzug (Betrieb, Wartung, TÜV)", tip: "Nur Betrieb/Wartung, keine Reparaturen", aliases: ["Fahrstuhl"], selten: true },
    ]},
  { id: "strassenreinigung", label: "Straßenreinigung und Müllbeseitigung", paragraf: "§ 2 Nr. 8 BetrKV", icon: "🧹",
    posten: [
      { key: "strassenreinigung", label: "Straßenreinigung", tip: "Ohne Winterdienst — der hat auf vielen Abrechnungen eine eigene Zeile, siehe unten", aliases: ["Straßenreinigungsgebühr"] },
      { key: "schnee_eis_beseitigung", label: "Schnee- und Eisbeseitigung", tip: "Winterdienst — auf manchen Abrechnungen mit der Straßenreinigung zusammengefasst, auf anderen eigene Zeile", aliases: ["Winterdienst", "Räum- und Streudienst"] },
      { key: "muellbeseitigung", label: "Müllbeseitigung / Abfallentsorgung", tip: "Gebühren für alle Tonnen", aliases: ["Müllabfuhr", "Abfallgebühren"] },
    ]},
  { id: "gebaeude", label: "Gebäudereinigung und Ungezieferbekämpfung", paragraf: "§ 2 Nr. 9 BetrKV", icon: "🧹",
    posten: [
      { key: "hausreinigung", label: "Hausreinigung / Treppenhausreinigung", tip: "Nur umlagefähig wenn vertraglich vereinbart", aliases: ["Gebäudereinigung", "Treppenhausreinigung"] },
      { key: "ungezieferbekaempfung", label: "Ungezieferbekämpfung", tip: "Nur bei tatsächlichem Bedarf", aliases: ["Schädlingsbekämpfung"], selten: true },
    ]},
  { id: "garten", label: "Gartenpflege", paragraf: "§ 2 Nr. 10 BetrKV", icon: "🧹",
    posten: [
      { key: "gartenpflege", label: "Gartenpflege", tip: "Nur laufende Pflege, keine Neuanlage", aliases: ["Grünpflege", "Außenanlagen"] },
    ]},
  { id: "beleuchtung", label: "Beleuchtung", paragraf: "§ 2 Nr. 11 BetrKV", icon: "⚙️",
    posten: [
      { key: "allgemeinstrom", label: "Beleuchtung / Allgemeinstrom", tip: "Strom für Gemeinschaftsflächen", aliases: ["Gemeinschaftsstrom", "Hausstrom"] },
    ]},
  { id: "schornstein", label: "Schornsteinreinigung", paragraf: "§ 2 Nr. 12 BetrKV", icon: "🔥",
    posten: [
      { key: "schornsteinreinigung", label: "Schornsteinreinigung", tip: "Kehrgebühren", aliases: ["Kaminkehrer", "Kehrgebühr"], selten: true },
    ]},
  { id: "versicherungen", label: "Versicherungen", paragraf: "§ 2 Nr. 13 BetrKV", icon: "🛡",
    hint: "Nur Sachversicherungen des Gebäudes — nicht deine Hausratsversicherung",
    posten: [
      { key: "feuerversicherung", label: "Gebäude-/Feuerversicherung", tip: "Auf manchen Abrechnungen mit Sturm/Leitungswasser zu einer 'Gebäudeversicherung' zusammengefasst — dann hier den Gesamtbetrag eintragen", aliases: ["Gebäudeversicherung", "Brandversicherung"] },
      { key: "sturm_hagel_versicherung", label: "Sturm- und Hagelversicherung", tip: "Oft eigene Zeile, manchmal Teil der Gebäudeversicherung", aliases: ["Sturmversicherung", "Hagelversicherung"] },
      { key: "leitungswasser_versicherung", label: "Leitungswasserversicherung", tip: "Oft eigene Zeile, manchmal Teil der Gebäudeversicherung", aliases: ["Wasserschadenversicherung"] },
      { key: "haftpflichtversicherung", label: "Haftpflichtversicherung Gebäude", tip: "Haus- und Grundbesitzerhaftpflicht", aliases: ["Grundbesitzerhaftpflicht"] },
      { key: "glasversicherung", label: "Glasversicherung", tip: "Nur wenn vertraglich vereinbart", selten: true },
    ]},
  { id: "hauswart", label: "Hauswart", paragraf: "§ 2 Nr. 14 BetrKV", icon: "🏠",
    posten: [
      { key: "hauswart", label: "Hauswart / Hausmeister", tip: "Nur Betriebskostenanteile — keine Verwaltung/Instandhaltung", aliases: ["Hausmeisterkosten", "Concierge"] },
    ]},
  { id: "technik", label: "Gemeinschaftsantenne, Kabel und Waschräume", paragraf: "§ 2 Nr. 15 BetrKV", icon: "⚙️",
    posten: [
      { key: "gemeinschaftsantenne", label: "Gemeinschafts-Antenne / SAT-Anlage", tip: "Umlagefähig wenn Gemeinschaftsanlage", aliases: ["Antennenanlage"], selten: true },
      { key: "kabelanschluss", label: "Kabelanschluss / TV-Versorgung", tip: "Seit 01.07.2024 grundsätzlich nicht mehr umlagefähig — bei Abrechnungsjahr vor 2024 regulär zulässig", aliases: ["Breitbandkabelanschluss", "TV-Kabel"] },
      { key: "gemeinschaftswaschmaschine", label: "Waschmaschinen / Trockenräume", tip: "Betrieb der Gemeinschaftsgeräte", aliases: ["Waschküche", "Trockenraum"], selten: true },
      { key: "tiefgarage", label: "Tiefgaragenbelüftung / -entwässerung", tip: "Wenn im Mietvertrag vereinbart", aliases: ["Tiefgarage"], selten: true },
    ]},
  { id: "sonstiges", label: "Sonstige Betriebskosten", paragraf: "§ 2 Nr. 17 BetrKV", icon: "🏠",
    hint: "Achtung: Verwaltungskosten darf der Vermieter NICHT umlegen",
    posten: [
      { key: "rauchwarnmelder_wartung", label: "Wartung Rauchwarnmelder", tip: "Nur Wartung/Miete, keine Anschaffung", aliases: ["Rauchmelder"], selten: true },
      { key: "gasleitungspruefung", label: "Gasleitungs- / Gasgeräteprüfung", tip: "Wiederkehrende Prüfpflicht", aliases: ["Gasprüfung", "Gasleitungsprüfung Allgemein"], selten: true },
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
    hint: "Nur ausfüllen, falls auf der Abrechnung separat ausgewiesen — diese Kosten darf dein Vermieter nach dem Gesetz nie umlegen",
    posten: [
      { key: "verwaltungskosten", label: "Verwaltungskosten", tip: "Kaufmännische/technische Verwaltung — nie umlagefähig (§ 1 Abs. 2 Nr. 1 BetrKV)", aliases: ["Verwaltungsgebühr", "Verwaltungspauschale", "Verwaltungskostenpauschale"], selten: true },
      { key: "instandhaltung", label: "Instandhaltung / Instandsetzung", tip: "Reparaturen, Erhaltungsaufwand — nie umlagefähig (§ 1 Abs. 2 Nr. 2 BetrKV)", aliases: ["Reparaturkosten", "Instandsetzungskosten", "Erhaltungsaufwand"], selten: true },
    ]},
];

export const ALLE_POSTEN = POSTEN_GRUPPEN.flatMap(g => g.posten);

export const BEWERTUNG = {
  ok:         { label: "Unauffällig",  farbe: THEME.color.ok,       bg: THEME.color.okBg,       icon: "✅", sub: "Keine wesentlichen Fehler gefunden" },
  auffaellig: { label: "Prüfenswert",  farbe: THEME.color.warn,     bg: THEME.color.warnBg,     icon: "⚠️", sub: "Auffälligkeiten — Einwände ratsam" },
  kritisch:   { label: "Fehlerhaft",   farbe: THEME.color.critical, bg: THEME.color.criticalBg, icon: "🚨", sub: "Erhebliche Fehler — Einwände dringend empfohlen" },
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

export function analysierePosten(w, wohn) {
  const R = BUSINESS.RICHTWERTE;
  const flaeche = Math.max(toNum(wohn.flaeche), 5);
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
    posten_bewertung.push({ posten: "Instandhaltung / Instandsetzung", betrag: b, richtwert: 0, abweichung_prozent: 100, status: "nicht_umlagefaehig", hinweis: "Nie umlagefähig, unabhängig von der Höhe. Voller Betrag rückforderbar.", paragraf: "§ 1 Abs. 2 Nr. 2 BetrKV" });
    widerspruch.push({ typ: "hart", text: "Instandhaltungs-/Instandsetzungskosten " + fmt(b) + ": Nach § 1 Abs. 2 Nr. 2 BetrKV nicht umlagefähig. Rückforderung des vollen Betrags." });
  }

  // Heizung + Warmwasser — DMB weist nur einen KOMBINIERTEN Wert aus, daher hier
  // bewusst kein künstlicher Einzel-Split mehr (siehe Änderungs-Hinweis oben).
  const heiz = toNum(w.heizkosten_gesamt), ww = toNum(w.warmwasser_gesamt);
  if (heiz > 0 || ww > 0) {
    const kombi = heiz + ww;
    const rwK = rj(R.heizung_warmwasser), rwMax = rj(R.heizung_max);
    const aK = abw(kombi, rwK);
    let st = "ok", hi = "Richtwert Heizung+WW für " + flaeche + "m²: " + fmt(rwK) + "/Jahr. Verbrauchsanteil muss 50-70% betragen (§ 7 HeizkostenV).";
    if (kombi > rwMax) {
      st = "sehr_hoch";
      widerspruch.push({ typ: "statistisch", text: "Heizkosten+Warmwasser " + fmt(kombi) + " übersteigen DMB-Höchstwert " + fmt(rwMax) + " für " + flaeche + "m². Belegeinsicht anfordern." });
      hi = aK + "% über DMB-Richtwert! Max. " + fmt(rwMax) + "/Jahr.";
    } else if (kombi > rwK * 1.3) {
      st = "hoch";
      widerspruch.push({ typ: "statistisch", text: "Heizkosten+Warmwasser " + fmt(kombi) + " liegen " + aK + "% über DMB-Durchschnitt für " + flaeche + "m². Belege anfordern." });
      hi = aK + "% über DMB-Richtwert.";
    }
    posten_bewertung.push({ posten: "Heizkosten & Warmwasser (kombiniert)", betrag: kombi, richtwert: rwK, abweichung_prozent: aK, status: st, hinweis: hi, paragraf: "§ 2 Nr. 4+5 BetrKV, § 7 HeizkostenV" });
    if (ww > 0) posten_bewertung.push({ posten: "davon Warmwasserversorgung", betrag: ww, richtwert: 0, abweichung_prozent: 0, status: "ok", hinweis: "Bereits in der Vergleichsrechnung oben enthalten. Muss laut Gesetz separat ausgewiesen sein (§ 8 HeizkostenV).", paragraf: "§ 2 Nr. 5 BetrKV" });
  }

  // CO2-Abgabe
  if (toNum(w.co2_abgabe) > 0) {
    const b = toNum(w.co2_abgabe);
    posten_bewertung.push({ posten: "CO2-Abgabe", betrag: b, richtwert: 0, abweichung_prozent: 0, status: "pruefen", hinweis: "Vermieter muss 0-95% selbst tragen (10-Stufen-Modell). Energieausweis anfordern.", paragraf: "§ 5 CO2KostAufG" });
    widerspruch.push({ typ: "statistisch", text: "CO2-Abgabe " + fmt(b) + ": Prüfe ob Vermieteranteil korrekt abgezogen wurde (§ 5 CO2KostAufG)." });
  }

  // Hauswart — DMB-Wert "separat abgerechnet" (0,21), da Hausreinigung/Garten bei uns eigene Felder sind
  if (toNum(w.hauswart) > 0) {
    const b = toNum(w.hauswart), rw = rj(R.hausmeister), a = abw(b, rw);
    let st = "ok", hi = "Nur Betriebskostenanteile umlagefähig. Richtwert (separat abgerechnet): " + fmt(rw) + "/Jahr.";
    if (b > rw * 1.5) {
      st = "sehr_hoch";
      widerspruch.push({ typ: "statistisch", text: "Hausmeisterkosten " + fmt(b) + " erheblich über Richtwert " + fmt(rw) + "/Jahr für " + flaeche + "m². Aufschlüsselung anfordern." });
      hi = a + "% über Richtwert! Aufschlüsselung anfordern.";
    } else if (b > rw * 1.3) {
      st = "hoch";
      widerspruch.push({ typ: "statistisch", text: "Hausmeisterkosten " + fmt(b) + " (" + a + "% über Richtwert). Nachweis anfordern." });
    }
    posten_bewertung.push({ posten: "Hauswart/Hausmeister", betrag: b, richtwert: rw, abweichung_prozent: a, status: st, hinweis: hi, paragraf: "§ 2 Nr. 14 BetrKV", steuerlich_35a: true });
  }

  // Wasser + Abwasser
  const kw = toNum(w.kaltwasser), ew = toNum(w.entwasserung), nw = toNum(w.niederschlagswasser);
  const wg = kw + ew + nw;
  if (wg > 0) {
    const rw = rj(R.wasser_abwasser), a = abw(wg, rw);
    let st = "ok", hi = "Richtwert Wasser+Abwasser für " + flaeche + "m²: " + fmt(rw) + "/Jahr.";
    if (wg > rw * 1.6) { st = "sehr_hoch"; widerspruch.push({ typ: "statistisch", text: "Wasser+Abwasser " + fmt(wg) + " (" + a + "% über Richtwert). Auf Doppelberechnung prüfen." }); hi = a + "% über Richtwert — mögliche Doppelberechnung!"; }
    else if (wg > rw * 1.3) { st = "hoch"; hi = a + "% über Richtwert. Belege anfordern."; }
    // Richtwert-Anzeige proportional zum tatsächlichen Anteil an der Gesamtsumme wg aufteilen
    // (nicht pauschal 50/50) — bei pauschaler Aufteilung zeigte die Zeile "Wasserversorgung" einen
    // Richtwert, der zur oben berechneten Abweichung "a" nicht mehr passte, sobald nur eine der beiden
    // Positionen befüllt war (Normalfall: Kanalgebühren stecken schon im Kaltwasser-Sammelposten,
    // "Entwässerung" bleibt 0). Durch den proportionalen Anteil gilt für jede Zeile exakt
    // betrag/richtwert == wg/rw == a — mathematisch konsistent, unabhängig davon, wie sich wg auf
    // kw/ew verteilt. Gefunden + korrigiert 10.08.2026, siehe CHANGELOG.
    const richtwertKw = rw * (kw / wg);
    const richtwertEw = rw * (ew / wg);
    if (kw > 0) posten_bewertung.push({ posten: "Wasserversorgung", betrag: kw, richtwert: richtwertKw, abweichung_prozent: a, status: st, hinweis: hi, paragraf: "§ 2 Nr. 2 BetrKV" });
    if (ew > 0) posten_bewertung.push({ posten: "Entwässerung", betrag: ew, richtwert: richtwertEw, abweichung_prozent: a, status: st, hinweis: hi, paragraf: "§ 2 Nr. 2 BetrKV" });
    if (nw > 0) posten_bewertung.push({ posten: "Niederschlagswasser", betrag: nw, richtwert: 0, abweichung_prozent: 0, status: "ok", hinweis: "Kommunale Gebühr.", paragraf: "§ 2 Nr. 2 BetrKV" });
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
    if (srg > rw * 1.8) { st = "sehr_hoch"; widerspruch.push({ typ: "statistisch", text: bez + (sr > 0 && se > 0 ? " (zusammen " + fmt(srg) + ")" : "") + " liegen " + a + "% über dem DMB-Richtwert für Straßenreinigung inkl. Winterdienst. Belege anfordern." }); hi = a + "% über DMB-Richtwert! Belege anfordern."; }
    else if (srg > rw * 1.4) { st = "hoch"; hi = a + "% über DMB-Richtwert."; }
    if (sr > 0 && se > 0) {
      posten_bewertung.push({ posten: "Straßenreinigung & Winterdienst (kombiniert)", betrag: srg, richtwert: rw, abweichung_prozent: a, status: st, hinweis: hi, paragraf: "§ 2 Nr. 8 BetrKV" });
      posten_bewertung.push({ posten: "davon Straßenreinigung", betrag: sr, richtwert: 0, abweichung_prozent: 0, status: "ok", hinweis: "Bereits in der Vergleichsrechnung oben enthalten.", paragraf: "§ 2 Nr. 8 BetrKV" });
      posten_bewertung.push({ posten: "davon Schnee-/Eisbeseitigung", betrag: se, richtwert: 0, abweichung_prozent: 0, status: "ok", hinweis: "Bereits in der Vergleichsrechnung oben enthalten.", paragraf: "§ 2 Nr. 8 BetrKV", steuerlich_35a: true });
    } else if (sr > 0) {
      posten_bewertung.push({ posten: "Straßenreinigung", betrag: sr, richtwert: rw, abweichung_prozent: a, status: st, hinweis: hi, paragraf: "§ 2 Nr. 8 BetrKV" });
    } else {
      posten_bewertung.push({ posten: "Schnee- und Eisbeseitigung", betrag: se, richtwert: rw, abweichung_prozent: a, status: st, hinweis: hi, paragraf: "§ 2 Nr. 8 BetrKV", steuerlich_35a: true });
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
  const vEinzelpositionen = [["Gebäude-/Feuerversicherung", vFeuer], ["Sturm- und Hagelversicherung", vSturm], ["Leitungswasserversicherung", vLeitung], ["Haftpflichtversicherung Gebäude", vHaft], ["Glasversicherung", vGlas]];
  const vAnzahlBefuellt = vEinzelpositionen.filter(([, b]) => b > 0).length;
  if (vg > 0) {
    const rw = rj(R.versicherungen), a = abw(vg, rw);
    let st = "ok", hi = "Richtwert für alle Gebäude-Sachversicherungen zusammen, " + flaeche + "m²: " + fmt(rw) + "/Jahr.";
    if (vg > rw * 1.8) { st = "sehr_hoch"; widerspruch.push({ typ: "statistisch", text: listeText(vEinzelpositionen) + (vAnzahlBefuellt > 1 ? " (zusammen " + fmt(vg) + ")" : "") + " liegen " + a + "% über dem DMB-Richtwert für Gebäude-Sachversicherungen insgesamt. Versicherungspolicen/Prämiensteigerung anfordern." }); hi = a + "% über DMB-Richtwert (alle Versicherungen zusammen)! Nachweis anfordern."; }
    else if (vg > rw * 1.4) { st = "hoch"; hi = a + "% über DMB-Richtwert (alle Versicherungen zusammen)."; }
    if (vAnzahlBefuellt > 1) {
      posten_bewertung.push({ posten: "Versicherungen (kombiniert)", betrag: vg, richtwert: rw, abweichung_prozent: a, status: st, hinweis: hi, paragraf: "§ 2 Nr. 13 BetrKV" });
      vEinzelpositionen.forEach(([label, betrag]) => {
        if (betrag > 0) posten_bewertung.push({ posten: "davon " + label, betrag, richtwert: 0, abweichung_prozent: 0, status: "ok", hinweis: "Bereits in der Vergleichsrechnung oben enthalten.", paragraf: "§ 2 Nr. 13 BetrKV" });
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
      posten_bewertung.push({ posten: p.label, betrag: b, richtwert: rw, abweichung_prozent: Math.max(0, a), status: st, hinweis: hi, paragraf: para, steuerlich_35a: STEUERLICH_35A.has(p.key) });
    } else {
      posten_bewertung.push({ posten: p.label, betrag: b, richtwert: 0, abweichung_prozent: 0, status: "pruefen", hinweis: "Kein offizieller Vergleichswert für diese Position verfügbar. Prüfe ob im Mietvertrag vereinbart und nach § 2 BetrKV zulässig.", paragraf: "§ 2 BetrKV", steuerlich_35a: STEUERLICH_35A.has(p.key) });
    }
  });

  return { posten_bewertung, widerspruch };
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

  const { posten_bewertung, widerspruch } = analysierePosten(w, wohn);

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
          hinweis: "Die Abrechnung kam erst nach dem " + fristEndeText + " bei dir an — mehr als 12 Monate nach Ende des Abrechnungszeitraums " + jahrNum + ". Nach § 556 Abs. 3 Satz 2 BGB ist eine Nachforderung dann grundsätzlich ausgeschlossen, außer der Vermieter hat die Verspätung nicht zu vertreten.",
          paragraf: "§ 556 Abs. 3 S. 2 BGB",
        });
        widerspruch.push({
          typ: "hart",
          text: "Die Abrechnung ist erst nach dem " + fristEndeText + " bei mir eingegangen — mehr als 12 Monate nach Ende des Abrechnungszeitraums " + jahrNum + ". Nach § 556 Abs. 3 Satz 2 BGB ist eine Nachforderung damit ausgeschlossen. Ich widerspreche einer etwaigen Nachforderung aus diesem Grund"
            + (betroffenerBetrag > 0 ? " (" + fmt(betroffenerBetrag) + ")." : "."),
        });
      }
    }
  }

  const hatKritisch = posten_bewertung.some(p => p.status === "nicht_umlagefaehig");
  const hatSehrHoch = posten_bewertung.some(p => p.status === "sehr_hoch");
  const hatHoch = posten_bewertung.some(p => ["hoch", "pruefen"].includes(p.status));
  const gesamtZuHoch = proQmJahr > richtwertJahr * 1.25;
  const bew = hatKritisch ? "kritisch" : (hatSehrHoch || gesamtZuHoch || widerspruch.length > 1) ? "auffaellig" : hatHoch ? "auffaellig" : "ok";

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
  const ersparnis = posten_bewertung.reduce((s, p) => {
    if (p.status === "nicht_umlagefaehig") return s + p.betrag;
    if (p.status !== "ok" && p.richtwert > 0 && p.betrag > p.richtwert) return s + (p.betrag - p.richtwert);
    return s;
  }, 0);

  // Aufteilung nach Beweisstärke (10.08.2026, siehe CHANGELOG): "hart" = aus
  // den Eingabedaten allein beweisbar (aktuell: status "nicht_umlagefaehig",
  // bislang nur der Kabelanschluss-Fall). "statistisch" = Richtwert-Abweichung
  // oder offene Frage — ein Anlass zur Nachfrage, kein Beweis. Diese Trennung
  // zieht sich auch durch widerspruch[].typ (siehe analysierePosten oben) und
  // wird in BriefPDF.jsx/Result.jsx/AbrechnungPDF.jsx verwendet, um nicht mehr
  // Sicherheit zu suggerieren, als die Methode tatsächlich hergibt.
  const ersparnisHart = posten_bewertung.reduce((s, p) => p.status === "nicht_umlagefaehig" ? s + p.betrag : s, 0);
  const ersparnisStatistisch = Math.round((ersparnis - ersparnisHart) * 100) / 100;
  const widerspruchHart = widerspruch.filter(g => g.typ === "hart");
  const widerspruchStatistisch = widerspruch.filter(g => g.typ !== "hart");

  const saldoText = saldo !== null ? (saldo > 0 ? " Nachzahlung: " + fmt(saldo) + "." : " Guthaben: " + fmt(Math.abs(saldo)) + " — trotzdem inhaltlich prüfen!") : "";

  return {
    gesamtbewertung: bew,
    gesamt,
    // Saldo als eigenes Feld (nicht nur in zusammenfassung-Text eingebacken):
    // > 0 = Nachzahlung, < 0 = Guthaben, null = keine Vorauszahlung angegeben.
    // Wird von BriefPDF.jsx gebraucht, um den "Nachzahlung unter Vorbehalt"-
    // Satz nur bei tatsächlicher Nachzahlung anzuzeigen (echter Bug, 08/2026:
    // der Satz stand vorher immer im Brief, auch bei Guthaben, siehe CHANGELOG).
    saldo,
    zusammenfassung: hatKritisch
      ? "Kritisch: " + widerspruch.length + " fehlerhafte Posten (" + fmt(gesamt) + ", " + fmt(proQmJahr) + "/m2/Jahr)." + saldoText
      : (hatSehrHoch || gesamtZuHoch)
        ? "Auffällig: " + fmt(proQmJahr) + "/m2/Jahr — DMB-Richtwert: " + fmt(richtwertJahr) + "/m2/Jahr. " + widerspruch.length + " Posten zur Prüfung." + saldoText
        : "Weitgehend unauffällig: " + fmt(proQmJahr) + "/m2/Jahr (DMB-Richtwert: " + fmt(richtwertJahr) + "/m2/Jahr)." + saldoText,
    fehler_anzahl: widerspruch.length,
    moegliche_ersparnis: Math.round(ersparnis * 100) / 100,
    // Aufteilung nach Beweisstärke, siehe Kommentar oben. Für UI/PDF: Nur
    // ersparnis_hart ist eine belastbare Zahl, ersparnis_statistisch ist eine
    // Schätzung auf Basis von Durchschnittswerten.
    ersparnis_hart: Math.round(ersparnisHart * 100) / 100,
    ersparnis_statistisch: ersparnisStatistisch,
    pro_qm_gesamt: parseFloat(proQmJahr.toFixed(2)),
    richtwert_pro_qm_jahr: richtwertJahr,
    posten_bewertung,
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
          return "Widerspruchsfrist: 12 Monate nach Erhalt der Abrechnung (§ 556 Abs. 3 Satz 3 BGB). Abrechnung erhalten am " + erhalten.toLocaleDateString("de-DE", { timeZone: "UTC" }) + " — Frist endet am " + einwendungsfrist.toLocaleDateString("de-DE", { timeZone: "UTC" }) + "."
            + (abgelaufen ? " Diese Frist ist bereits abgelaufen — ein Widerspruch ist dann grundsätzlich nicht mehr möglich, bitte anwaltlich prüfen lassen." : " Sofort handeln!");
        }
      }
      return "Widerspruchsfrist: 12 Monate nach Erhalt der Abrechnung (§ 556 Abs. 3 Satz 3 BGB). Für Abrechnungsjahr " + wohn.jahr + " endet die Frist typisch Ende " + (parseInt(wohn.jahr) + 2) + " (Näherungswert — trage oben das genaue Erhaltsdatum ein für eine exakte Frist). Sofort handeln!";
    })(),
    naechste_schritte: [
      widerspruch.length > 0 ? "Prüfbericht mit Mustertext per Einschreiben senden" : "Belege beim Vermieter anfordern (§ 259 BGB)",
      "Originalbelege einsehen — dieses Recht besteht unabhängig vom Ergebnis",
      "Bei Ablehnung: Deutschen Mieterbund einschalten (mieterbund.de · Tel. 030 223230)",
    ],
    co2_hinweis: toNum(w.co2_abgabe) > 0 ? "CO2-Abgabe abgerechnet: Vermieter muss je nach Energieklasse 0-95% selbst tragen. Energieausweis anfordern." : "",
  };
}
