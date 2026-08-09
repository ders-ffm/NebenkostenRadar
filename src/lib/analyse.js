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

// `beispiel`: grauer Placeholder-Beispielwert je Posten, damit die Größen-
// ordnung sofort klar ist (08/2026, siehe Field.jsx/EuroInput.jsx). Wo ein
// DMB-Richtwert existiert, aus RICHTWERTE * 12 * 75m² (Referenzwohnung,
// gleiche Beispielgröße wie das Wohnfläche-Placeholder "z. B. 75")
// hergeleitet und kaufmännisch gerundet — bei Heizung/Warmwasser und Wasser/
// Abwasser anteilig aufgeteilt, da DMB nur den kombinierten Wert ausweist
// (siehe Kommentar unten bei analysierePosten). Für Posten ohne offiziellen
// Richtwert: grobe, plausible Hausnummer, klar als Beispiel ("z. B.")
// gekennzeichnet, keine belastbare Schätzung.
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
      { key: "grundsteuer", label: "Grundsteuer", tip: "Prüfe ob Betrag mit Bescheid übereinstimmt", beispiel: "160,00", aliases: ["Grundabgaben"] },
    ]},
  { id: "wasser", label: "Wasserversorgung", paragraf: "§ 2 Nr. 2 BetrKV", icon: "💧",
    posten: [
      { key: "kaltwasser", label: "Wasserversorgung (Kaltwasser)", tip: "Frischwasserkosten inkl. Grundgebühr", beispiel: "160,00", aliases: ["Frischwasser", "Kaltwasserkosten"] },
      { key: "wasserzaehler", label: "Miete und Wartung Wasserzähler", tip: "Zählermiete und Eichung", beispiel: "25,00", aliases: ["Zählermiete", "Eichung"], selten: true },
    ]},
  { id: "entwaesserung", label: "Entwässerung", paragraf: "§ 2 Nr. 3 BetrKV", icon: "💧",
    posten: [
      { key: "entwasserung", label: "Entwässerung / Abwasser", tip: "Kanalgebühren der Gemeinde", beispiel: "90,00", aliases: ["Kanalgebühr", "Abwasserkosten"] },
      { key: "niederschlagswasser", label: "Niederschlagswassergebühr", tip: "Manche Kommunen erheben dies separat", beispiel: "15,00", aliases: ["Regenwasser"], selten: true },
    ]},
  { id: "heizung", label: "Heizung", paragraf: "§ 2 Nr. 4 BetrKV", icon: "🔥",
    posten: [
      { key: "heizkosten_gesamt", label: "Heizkosten", pflicht: true, tip: "Gesamte Heizkosten lt. Abrechnung — auf vielen Abrechnungen als 'Heizung Grundanteil' + 'Heizung Verbrauchsanteil' getrennt ausgewiesen, dann beide Beträge zusammenzählen", beispiel: "890,00", aliases: ["Wärmeversorgung", "Zentralheizung", "Heizung Grundanteil", "Heizung Verbrauchsanteil"] },
      { key: "heizung_betriebsstrom", label: "Betriebsstrom Heizungsanlage", tip: "Strom für Pumpen, Steuerung", beispiel: "35,00", aliases: ["Stromkosten Heizung"], selten: true },
      { key: "heizung_wartung", label: "Wartung Heizungsanlage", tip: "Wartung ja, Reparaturen nein", beispiel: "60,00", aliases: ["Heizkosten Wartung", "Gerätemiete Heizung"], selten: true },
      { key: "co2_abgabe", label: "CO2-Abgabe / Kohlendioxidkosten", tip: "Vermieter trägt je nach Energieklasse 0-95%. Achtung: steht oft NICHT als eigene Zeile auf der Hauptseite, sondern nur auf einer Detail-Anlage weiter hinten in der Abrechnung ('CO2-Kosten', 'Aufteilung der CO2-Kosten') — dort nachschauen, wenn hier nichts auf den ersten Blick zu finden ist.", beispiel: "45,00", aliases: ["CO2-Kosten", "CO2KostAufG", "Kohlendioxidabgabe"] },
    ]},
  { id: "warmwasser", label: "Warmwasser", paragraf: "§ 2 Nr. 5 BetrKV", icon: "🔥",
    posten: [
      { key: "warmwasser_gesamt", label: "Warmwasserversorgung", pflicht: true, tip: "Muss separat ausgewiesen sein — auf manchen Abrechnungen als 'Warmwasser Grundanteil' + 'Warmwasser Verbrauchsanteil' getrennt, dann beide zusammenzählen", beispiel: "300,00", aliases: ["Warmwasser Grundanteil", "Warmwasser Verbrauchsanteil"] },
    ]},
  { id: "aufzug", label: "Aufzug", paragraf: "§ 2 Nr. 7 BetrKV", icon: "⚙️",
    posten: [
      { key: "aufzug", label: "Aufzug (Betrieb, Wartung, TÜV)", tip: "Nur Betrieb/Wartung, keine Reparaturen", beispiel: "180,00", aliases: ["Fahrstuhl"], selten: true },
    ]},
  { id: "strassenreinigung", label: "Straßenreinigung und Müllbeseitigung", paragraf: "§ 2 Nr. 8 BetrKV", icon: "🧹",
    posten: [
      { key: "strassenreinigung", label: "Straßenreinigung", tip: "Ohne Winterdienst — der hat auf vielen Abrechnungen eine eigene Zeile, siehe unten", beispiel: "20,00", aliases: ["Straßenreinigungsgebühr"] },
      { key: "schnee_eis_beseitigung", label: "Schnee- und Eisbeseitigung", tip: "Winterdienst — auf manchen Abrechnungen mit der Straßenreinigung zusammengefasst, auf anderen eigene Zeile", beispiel: "15,00", aliases: ["Winterdienst", "Räum- und Streudienst"] },
      { key: "muellbeseitigung", label: "Müllbeseitigung / Abfallentsorgung", tip: "Gebühren für alle Tonnen", beispiel: "140,00", aliases: ["Müllabfuhr", "Abfallgebühren"] },
    ]},
  { id: "gebaeude", label: "Gebäudereinigung und Ungezieferbekämpfung", paragraf: "§ 2 Nr. 9 BetrKV", icon: "🧹",
    posten: [
      { key: "hausreinigung", label: "Hausreinigung / Treppenhausreinigung", tip: "Nur umlagefähig wenn vertraglich vereinbart", beispiel: "190,00", aliases: ["Gebäudereinigung", "Treppenhausreinigung"] },
      { key: "ungezieferbekaempfung", label: "Ungezieferbekämpfung", tip: "Nur bei tatsächlichem Bedarf", beispiel: "20,00", aliases: ["Schädlingsbekämpfung"], selten: true },
    ]},
  { id: "garten", label: "Gartenpflege", paragraf: "§ 2 Nr. 10 BetrKV", icon: "🧹",
    posten: [
      { key: "gartenpflege", label: "Gartenpflege", tip: "Nur laufende Pflege, keine Neuanlage", beispiel: "135,00", aliases: ["Grünpflege", "Außenanlagen"] },
    ]},
  { id: "beleuchtung", label: "Beleuchtung", paragraf: "§ 2 Nr. 11 BetrKV", icon: "⚙️",
    posten: [
      { key: "allgemeinstrom", label: "Beleuchtung / Allgemeinstrom", tip: "Strom für Gemeinschaftsflächen", beispiel: "55,00", aliases: ["Gemeinschaftsstrom", "Hausstrom"] },
    ]},
  { id: "schornstein", label: "Schornsteinreinigung", paragraf: "§ 2 Nr. 12 BetrKV", icon: "🔥",
    posten: [
      { key: "schornsteinreinigung", label: "Schornsteinreinigung", tip: "Kehrgebühren", beispiel: "35,00", aliases: ["Kaminkehrer", "Kehrgebühr"], selten: true },
    ]},
  { id: "versicherungen", label: "Versicherungen", paragraf: "§ 2 Nr. 13 BetrKV", icon: "🛡",
    hint: "Nur Sachversicherungen des Gebäudes — nicht deine Hausratsversicherung",
    posten: [
      { key: "feuerversicherung", label: "Gebäude-/Feuerversicherung", tip: "Auf manchen Abrechnungen mit Sturm/Leitungswasser zu einer 'Gebäudeversicherung' zusammengefasst — dann hier den Gesamtbetrag eintragen", beispiel: "150,00", aliases: ["Gebäudeversicherung", "Brandversicherung"] },
      { key: "sturm_hagel_versicherung", label: "Sturm- und Hagelversicherung", tip: "Oft eigene Zeile, manchmal Teil der Gebäudeversicherung", beispiel: "25,00", aliases: ["Sturmversicherung", "Hagelversicherung"] },
      { key: "leitungswasser_versicherung", label: "Leitungswasserversicherung", tip: "Oft eigene Zeile, manchmal Teil der Gebäudeversicherung", beispiel: "40,00", aliases: ["Wasserschadenversicherung"] },
      { key: "haftpflichtversicherung", label: "Haftpflichtversicherung Gebäude", tip: "Haus- und Grundbesitzerhaftpflicht", beispiel: "15,00", aliases: ["Grundbesitzerhaftpflicht"] },
      { key: "glasversicherung", label: "Glasversicherung", tip: "Nur wenn vertraglich vereinbart", beispiel: "10,00", selten: true },
    ]},
  { id: "hauswart", label: "Hauswart", paragraf: "§ 2 Nr. 14 BetrKV", icon: "🏠",
    posten: [
      { key: "hauswart", label: "Hauswart / Hausmeister", tip: "Nur Betriebskostenanteile — keine Verwaltung/Instandhaltung", beispiel: "190,00", aliases: ["Hausmeisterkosten", "Concierge"] },
    ]},
  { id: "technik", label: "Gemeinschaftsantenne, Kabel und Waschräume", paragraf: "§ 2 Nr. 15 BetrKV", icon: "⚙️",
    posten: [
      { key: "gemeinschaftsantenne", label: "Gemeinschafts-Antenne / SAT-Anlage", tip: "Umlagefähig wenn Gemeinschaftsanlage", beispiel: "50,00", aliases: ["Antennenanlage"], selten: true },
      { key: "kabelanschluss", label: "Kabelanschluss / TV-Versorgung", tip: "Seit 01.07.2024 grundsätzlich nicht mehr umlagefähig — bei Abrechnungsjahr vor 2024 regulär zulässig", aliases: ["Breitbandkabelanschluss", "TV-Kabel"] },
      { key: "gemeinschaftswaschmaschine", label: "Waschmaschinen / Trockenräume", tip: "Betrieb der Gemeinschaftsgeräte", beispiel: "25,00", aliases: ["Waschküche", "Trockenraum"], selten: true },
      { key: "tiefgarage", label: "Tiefgaragenbelüftung / -entwässerung", tip: "Wenn im Mietvertrag vereinbart", beispiel: "40,00", aliases: ["Tiefgarage"], selten: true },
    ]},
  { id: "sonstiges", label: "Sonstige Betriebskosten", paragraf: "§ 2 Nr. 17 BetrKV", icon: "🏠",
    hint: "Achtung: Verwaltungskosten darf der Vermieter NICHT umlegen",
    posten: [
      { key: "rauchwarnmelder_wartung", label: "Wartung Rauchwarnmelder", tip: "Nur Wartung/Miete, keine Anschaffung", beispiel: "10,00", aliases: ["Rauchmelder"], selten: true },
      { key: "gasleitungspruefung", label: "Gasleitungs- / Gasgeräteprüfung", tip: "Wiederkehrende Prüfpflicht", beispiel: "5,00", aliases: ["Gasprüfung", "Gasleitungsprüfung Allgemein"], selten: true },
      { key: "sonstiges_vereinbart", label: "Sonstige vereinbarte Betriebskosten", tip: "Nur wenn explizit im Mietvertrag benannt", beispiel: "50,00", aliases: ["Wartung Sonstige"] },
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

export function analysierePosten(w, wohn) {
  const R = BUSINESS.RICHTWERTE;
  const flaeche = Math.max(toNum(wohn.flaeche), 5);
  const rj = m => m * flaeche * 12; // Monatsrichtwert -> Jahresrichtwert für die Wohnfläche

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
      widerspruch.push("Kabelanschlusskosten " + fmt(b) + ": Prüfe den abgerechneten Zeitraum auf der Abrechnung. Seit 01.07.2024 nicht mehr umlagefähig (§ 2 Nr. 15b TKG), nur der Anteil bis 30.06.2024 ist noch zulässig.");
    } else {
      // Abrechnungsjahr vollständig nach der Gesetzesänderung — hier ist die
      // Pauschalaussage tatsächlich sicher.
      posten_bewertung.push({ posten: "Kabelanschluss", betrag: b, richtwert: 0, abweichung_prozent: 100, status: "nicht_umlagefaehig", hinweis: "Seit 01.07.2024 nicht mehr umlagefähig. Voller Betrag rückforderbar.", paragraf: "§ 2 Nr. 15b TKG" });
      widerspruch.push("Kabelanschlusskosten " + fmt(b) + ": Nicht umlagefähig seit 01.07.2024 (§ 2 Nr. 15b TKG). Rückforderung des vollen Betrags.");
    }
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
      widerspruch.push("Heizkosten+Warmwasser " + fmt(kombi) + " übersteigen DMB-Höchstwert " + fmt(rwMax) + " für " + flaeche + "m². Belegeinsicht anfordern.");
      hi = aK + "% über DMB-Richtwert! Max. " + fmt(rwMax) + "/Jahr.";
    } else if (kombi > rwK * 1.3) {
      st = "hoch";
      widerspruch.push("Heizkosten+Warmwasser " + fmt(kombi) + " liegen " + aK + "% über DMB-Durchschnitt für " + flaeche + "m². Belege anfordern.");
      hi = aK + "% über DMB-Richtwert.";
    }
    posten_bewertung.push({ posten: "Heizkosten & Warmwasser (kombiniert)", betrag: kombi, richtwert: rwK, abweichung_prozent: aK, status: st, hinweis: hi, paragraf: "§ 2 Nr. 4+5 BetrKV, § 7 HeizkostenV" });
    if (ww > 0) posten_bewertung.push({ posten: "davon Warmwasserversorgung", betrag: ww, richtwert: 0, abweichung_prozent: 0, status: "ok", hinweis: "Bereits in der Vergleichsrechnung oben enthalten. Muss laut Gesetz separat ausgewiesen sein (§ 8 HeizkostenV).", paragraf: "§ 2 Nr. 5 BetrKV" });
  }

  // CO2-Abgabe
  if (toNum(w.co2_abgabe) > 0) {
    const b = toNum(w.co2_abgabe);
    posten_bewertung.push({ posten: "CO2-Abgabe", betrag: b, richtwert: 0, abweichung_prozent: 0, status: "pruefen", hinweis: "Vermieter muss 0-95% selbst tragen (10-Stufen-Modell). Energieausweis anfordern.", paragraf: "§ 5 CO2KostAufG" });
    widerspruch.push("CO2-Abgabe " + fmt(b) + ": Prüfe ob Vermieteranteil korrekt abgezogen wurde (§ 5 CO2KostAufG).");
  }

  // Hauswart — DMB-Wert "separat abgerechnet" (0,21), da Hausreinigung/Garten bei uns eigene Felder sind
  if (toNum(w.hauswart) > 0) {
    const b = toNum(w.hauswart), rw = rj(R.hausmeister), a = abw(b, rw);
    let st = "ok", hi = "Nur Betriebskostenanteile umlagefähig. Richtwert (separat abgerechnet): " + fmt(rw) + "/Jahr.";
    if (b > rw * 1.5) {
      st = "sehr_hoch";
      widerspruch.push("Hausmeisterkosten " + fmt(b) + " erheblich über Richtwert " + fmt(rw) + "/Jahr für " + flaeche + "m². Aufschlüsselung anfordern.");
      hi = a + "% über Richtwert! Aufschlüsselung anfordern.";
    } else if (b > rw * 1.3) {
      st = "hoch";
      widerspruch.push("Hausmeisterkosten " + fmt(b) + " (" + a + "% über Richtwert). Nachweis anfordern.");
    }
    posten_bewertung.push({ posten: "Hauswart/Hausmeister", betrag: b, richtwert: rw, abweichung_prozent: a, status: st, hinweis: hi, paragraf: "§ 2 Nr. 14 BetrKV" });
  }

  // Wasser + Abwasser
  const kw = toNum(w.kaltwasser), ew = toNum(w.entwasserung), nw = toNum(w.niederschlagswasser);
  const wg = kw + ew + nw;
  if (wg > 0) {
    const rw = rj(R.wasser_abwasser), a = abw(wg, rw);
    let st = "ok", hi = "Richtwert Wasser+Abwasser für " + flaeche + "m²: " + fmt(rw) + "/Jahr.";
    if (wg > rw * 1.6) { st = "sehr_hoch"; widerspruch.push("Wasser+Abwasser " + fmt(wg) + " (" + a + "% über Richtwert). Auf Doppelberechnung prüfen."); hi = a + "% über Richtwert — mögliche Doppelberechnung!"; }
    else if (wg > rw * 1.3) { st = "hoch"; hi = a + "% über Richtwert. Belege anfordern."; }
    if (kw > 0) posten_bewertung.push({ posten: "Wasserversorgung", betrag: kw, richtwert: rw * 0.5, abweichung_prozent: a, status: st, hinweis: hi, paragraf: "§ 2 Nr. 2 BetrKV" });
    if (ew > 0) posten_bewertung.push({ posten: "Entwässerung", betrag: ew, richtwert: rw * 0.5, abweichung_prozent: 0, status: "ok", hinweis: "Kanalgebühren der Gemeinde.", paragraf: "§ 2 Nr. 2 BetrKV" });
    if (nw > 0) posten_bewertung.push({ posten: "Niederschlagswasser", betrag: nw, richtwert: 0, abweichung_prozent: 0, status: "ok", hinweis: "Kommunale Gebühr.", paragraf: "§ 2 Nr. 2 BetrKV" });
  }

  // Straßenreinigung + Schnee-/Eisbeseitigung — DMB weist nur einen KOMBINIERTEN
  // Wert aus (Straßenreinigung inkl. Winterdienst). Manche Abrechnungen führen
  // beides als eine Zeile, andere trennen — deshalb zwei Eingabefelder, aber
  // eine gemeinsame Bewertung gegen den einen offiziellen Richtwert (08/2026).
  const sr = toNum(w.strassenreinigung), se = toNum(w.schnee_eis_beseitigung);
  const srg = sr + se;
  if (srg > 0) {
    const rw = rj(R.strassenreinigung), a = abw(srg, rw);
    let st = "ok", hi = "Richtwert Straßenreinigung inkl. Winterdienst für " + flaeche + "m²: " + fmt(rw) + "/Jahr.";
    if (srg > rw * 1.8) { st = "sehr_hoch"; widerspruch.push("Straßenreinigung/Winterdienst " + fmt(srg) + " liegen " + a + "% über DMB-Richtwert. Belege anfordern."); hi = a + "% über DMB-Richtwert! Belege anfordern."; }
    else if (srg > rw * 1.4) { st = "hoch"; hi = a + "% über DMB-Richtwert."; }
    if (sr > 0) posten_bewertung.push({ posten: "Straßenreinigung", betrag: sr, richtwert: 0, abweichung_prozent: a, status: st, hinweis: hi, paragraf: "§ 2 Nr. 8 BetrKV" });
    if (se > 0) posten_bewertung.push({ posten: "Schnee- und Eisbeseitigung", betrag: se, richtwert: 0, abweichung_prozent: a, status: st, hinweis: hi, paragraf: "§ 2 Nr. 8 BetrKV" });
  }

  // Versicherungen — DMB weist nur einen KOMBINIERTEN Wert für alle Gebäude-
  // Sachversicherungen aus. Fünf Eingabefelder (so wie viele Abrechnungen sie
  // tatsächlich einzeln ausweisen), aber bewusst KEINE erfundenen Einzel-
  // Richtwerte pro Versicherungsart — stattdessen Summe gegen den einen
  // offiziellen Kombiwert geprüft (08/2026, ersetzt die vorherige 65/25/10%-
  // Schätzung ohne Quelle).
  const vFeuer = toNum(w.feuerversicherung), vSturm = toNum(w.sturm_hagel_versicherung),
        vLeitung = toNum(w.leitungswasser_versicherung), vHaft = toNum(w.haftpflichtversicherung),
        vGlas = toNum(w.glasversicherung);
  const vg = vFeuer + vSturm + vLeitung + vHaft + vGlas;
  if (vg > 0) {
    const rw = rj(R.versicherungen), a = abw(vg, rw);
    let st = "ok", hi = "Richtwert für alle Gebäude-Sachversicherungen zusammen, " + flaeche + "m²: " + fmt(rw) + "/Jahr.";
    if (vg > rw * 1.8) { st = "sehr_hoch"; widerspruch.push("Versicherungskosten insgesamt " + fmt(vg) + " liegen " + a + "% über DMB-Richtwert. Versicherungspolicen/Prämiensteigerung anfordern."); hi = a + "% über DMB-Richtwert (alle Versicherungen zusammen)! Nachweis anfordern."; }
    else if (vg > rw * 1.4) { st = "hoch"; hi = a + "% über DMB-Richtwert (alle Versicherungen zusammen)."; }
    const vPosten = [["Gebäude-/Feuerversicherung", vFeuer], ["Sturm- und Hagelversicherung", vSturm], ["Leitungswasserversicherung", vLeitung], ["Haftpflichtversicherung Gebäude", vHaft], ["Glasversicherung", vGlas]];
    vPosten.forEach(([label, betrag]) => {
      if (betrag > 0) posten_bewertung.push({ posten: label, betrag, richtwert: 0, abweichung_prozent: a, status: st, hinweis: hi, paragraf: "§ 2 Nr. 13 BetrKV" });
    });
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
  ]);

  ALLE_POSTEN.forEach(p => {
    const b = toNum(w[p.key]);
    if (b <= 0 || skip.has(p.key)) return;
    const entry = bm[p.key];
    if (entry) {
      const [rm, para] = entry, rw = rj(rm), a = abw(b, rw);
      let st = "ok", hi = rw > 0 ? "Richtwert für " + flaeche + "m²: " + fmt(rw) + "/Jahr." : "Formale Zulässigkeit prüfen.";
      if (a > 80) { st = "sehr_hoch"; hi = a + "% über DMB-Richtwert! Belege anfordern."; widerspruch.push(p.label + " " + fmt(b) + " liegt " + a + "% über DMB-Richtwert. Belegeinsicht anfordern (§ 259 BGB)."); }
      else if (a > 40) { st = "hoch"; hi = a + "% über DMB-Richtwert. Prüfenswert."; }
      posten_bewertung.push({ posten: p.label, betrag: b, richtwert: rw, abweichung_prozent: Math.max(0, a), status: st, hinweis: hi, paragraf: para });
    } else {
      posten_bewertung.push({ posten: p.label, betrag: b, richtwert: 0, abweichung_prozent: 0, status: "pruefen", hinweis: "Kein offizieller Vergleichswert für diese Position verfügbar. Prüfe ob im Mietvertrag vereinbart und nach § 2 BetrKV zulässig.", paragraf: "§ 2 BetrKV" });
    }
  });

  return { posten_bewertung, widerspruch };
}

export function buildResult(w, wohn) {
  const R = BUSINESS.RICHTWERTE;
  const flaeche = Math.max(toNum(wohn.flaeche), 5);
  const gesamt = ALLE_POSTEN.reduce((s, p) => s + toNum(w[p.key]), 0);
  const proQmJahr = gesamt / flaeche;
  const richtwertJahr = R.gesamt * 12;
  const vorauszahlung = toNum(wohn.vorauszahlung);
  const saldo = vorauszahlung > 0 ? gesamt - vorauszahlung : null;

  const { posten_bewertung, widerspruch } = analysierePosten(w, wohn);
  const hatKritisch = posten_bewertung.some(p => p.status === "nicht_umlagefaehig");
  const hatSehrHoch = posten_bewertung.some(p => p.status === "sehr_hoch");
  const hatHoch = posten_bewertung.some(p => ["hoch", "pruefen"].includes(p.status));
  const gesamtZuHoch = proQmJahr > richtwertJahr * 1.25;
  const bew = hatKritisch ? "kritisch" : (hatSehrHoch || gesamtZuHoch || widerspruch.length > 1) ? "auffaellig" : hatHoch ? "auffaellig" : "ok";

  const ersparnis = posten_bewertung.reduce((s, p) => {
    if (p.status === "nicht_umlagefaehig") return s + p.betrag;
    if (p.richtwert > 0 && p.betrag > p.richtwert) return s + (p.betrag - p.richtwert);
    return s;
  }, 0);

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
    pro_qm_gesamt: parseFloat(proQmJahr.toFixed(2)),
    richtwert_pro_qm_jahr: richtwertJahr,
    posten_bewertung,
    widerspruchsgruende: widerspruch,
    fristen_hinweis: "Widerspruchsfrist: 12 Monate nach Erhalt der Abrechnung (§ 556 Abs. 3 BGB). Für Abrechnungsjahr " + wohn.jahr + " endet die Frist typisch Ende " + (parseInt(wohn.jahr) + 2) + ". Sofort handeln!",
    naechste_schritte: [
      widerspruch.length > 0 ? "Prüfbericht mit Mustertext per Einschreiben senden" : "Belege beim Vermieter anfordern (§ 259 BGB)",
      "Originalbelege einsehen — dieses Recht besteht unabhängig vom Ergebnis",
      "Bei Ablehnung: Deutschen Mieterbund einschalten (mieterbund.de · Tel. 030 223230)",
    ],
    co2_hinweis: toNum(w.co2_abgabe) > 0 ? "CO2-Abgabe abgerechnet: Vermieter muss je nach Energieklasse 0-95% selbst tragen. Energieausweis anfordern." : "",
  };
}
