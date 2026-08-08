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
export const POSTEN_GRUPPEN = [
  { id: "heizung", label: "Heizung und Warmwasser", icon: "🔥",
    hint: "Größten Posten findest du unter 'Heizkosten' oder 'Wärmeversorgung'",
    posten: [
      { key: "heizkosten_gesamt", label: "Heizkosten", pflicht: true, tip: "Gesamte Heizkosten lt. Abrechnung", beispiel: "890,00" },
      { key: "warmwasser_gesamt", label: "Warmwasserversorgung", pflicht: true, tip: "Muss separat ausgewiesen sein", beispiel: "300,00" },
      { key: "heizung_betriebsstrom", label: "Betriebsstrom Heizungsanlage", tip: "Strom für Pumpen, Steuerung", beispiel: "35,00" },
      { key: "heizung_wartung", label: "Wartung Heizungsanlage", tip: "Wartung ja, Reparaturen nein", beispiel: "60,00" },
      { key: "schornsteinreinigung", label: "Schornsteinreinigung", tip: "§ 2 Nr. 12 BetrKV", beispiel: "35,00" },
      { key: "co2_abgabe", label: "CO2-Abgabe / Kohlendioxidkosten", tip: "Vermieter trägt je nach Energieklasse 0-95%", beispiel: "45,00" },
    ]},
  { id: "wasser", label: "Wasserversorgung und Entwässerung", icon: "💧",
    hint: "Suche nach Wasser, Abwasser oder Entwässerung",
    posten: [
      { key: "kaltwasser", label: "Wasserversorgung (Kaltwasser)", tip: "Frischwasserkosten inkl. Grundgebühr", beispiel: "160,00" },
      { key: "entwasserung", label: "Entwässerung / Abwasser", tip: "Kanalgebühren der Gemeinde", beispiel: "90,00" },
      { key: "niederschlagswasser", label: "Niederschlagswassergebühr", tip: "Manche Kommunen erheben dies separat", beispiel: "15,00" },
      { key: "wasserzaehler", label: "Miete und Wartung Wasserzähler", tip: "Zählermiete und Eichung", beispiel: "25,00" },
    ]},
  { id: "grundbesitz", label: "Grundbesitzabgaben", icon: "🏛",
    hint: "Gemeindliche Gebühren — Grundsteuer, Müll und Straßenreinigung",
    posten: [
      { key: "grundsteuer", label: "Grundsteuer", tip: "Prüfe ob Betrag mit Bescheid übereinstimmt", beispiel: "160,00" },
      { key: "strassenreinigung", label: "Straßenreinigung und Winterdienst", tip: "§ 2 Nr. 8 BetrKV", beispiel: "35,00" },
      { key: "muellbeseitigung", label: "Müllbeseitigung / Abfallentsorgung", tip: "Gebühren für alle Tonnen", beispiel: "140,00" },
    ]},
  { id: "gebaeude", label: "Gebäudereinigung und Pflege", icon: "🧹",
    hint: "Nur wenn im Mietvertrag vereinbart",
    posten: [
      { key: "hausreinigung", label: "Hausreinigung / Treppenhausreinigung", tip: "Nur umlagefähig wenn vertraglich vereinbart", beispiel: "190,00" },
      { key: "gartenpflege", label: "Gartenpflege", tip: "Nur laufende Pflege, keine Neuanlage", beispiel: "135,00" },
      { key: "ungezieferbekaempfung", label: "Ungezieferbekämpfung", tip: "§ 2 Nr. 9 BetrKV", beispiel: "20,00" },
    ]},
  { id: "technik", label: "Technische Anlagen", icon: "⚙️",
    hint: "Betrieb und Wartung - keine Reparaturen",
    posten: [
      { key: "aufzug", label: "Aufzug (Betrieb, Wartung, TÜV)", tip: "§ 2 Nr. 7 BetrKV", beispiel: "180,00" },
      { key: "allgemeinstrom", label: "Beleuchtung / Allgemeinstrom", tip: "Strom für Gemeinschaftsflächen", beispiel: "55,00" },
      { key: "tiefgarage", label: "Tiefgaragenbelüftung / -entwässerung", tip: "§ 2 Nr. 13 BetrKV wenn vorhanden", beispiel: "40,00" },
      { key: "gemeinschaftsantenne", label: "Gemeinschafts-Antenne / SAT-Anlage", tip: "Umlagefähig wenn Gemeinschaftsanlage", beispiel: "50,00" },
    ]},
  { id: "versicherungen", label: "Versicherungen", icon: "🛡",
    hint: "Nur Sachversicherungen des Gebäudes — nicht deine Hausratsversicherung",
    posten: [
      { key: "gebaeudeversicherung", label: "Gebäudeversicherung", tip: "Feuer, Sturm, Leitungswasser", beispiel: "180,00" },
      { key: "haftpflichtversicherung", label: "Haftpflichtversicherung Gebäude", tip: "Haus- und Grundbesitzerhaftpflicht", beispiel: "70,00" },
      { key: "glasversicherung", label: "Glasversicherung", tip: "Nur wenn vertraglich vereinbart", beispiel: "30,00" },
    ]},
  { id: "sonstiges", label: "Hauswart und Sonstiges", icon: "🏠",
    hint: "Achtung: Verwaltungskosten darf der Vermieter NICHT umlegen",
    posten: [
      { key: "hauswart", label: "Hauswart / Hausmeister", tip: "Nur Betriebskostenanteile — keine Verwaltung/Instandhaltung", beispiel: "190,00" },
      { key: "kabelanschluss", label: "Kabelanschluss / TV-Versorgung", tip: "Seit 01.07.2024 NICHT mehr umlagefähig!" },
      { key: "gemeinschaftswaschmaschine", label: "Waschmaschinen / Trockenräume", tip: "§ 2 Nr. 15 BetrKV", beispiel: "25,00" },
      { key: "sonstiges_vereinbart", label: "Sonstige vereinbarte Betriebskosten", tip: "Nur wenn explizit im Mietvertrag", beispiel: "50,00" },
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

  // Kabelanschluss — seit 01.07.2024 grundsätzlich nicht mehr umlagefähig
  if (toNum(w.kabelanschluss) > 0) {
    const b = toNum(w.kabelanschluss);
    posten_bewertung.push({ posten: "Kabelanschluss", betrag: b, richtwert: 0, abweichung_prozent: 100, status: "nicht_umlagefaehig", hinweis: "Seit 01.07.2024 nicht mehr umlagefähig. Voller Betrag rückforderbar.", paragraf: "§ 2 Nr. 15b TKG" });
    widerspruch.push("Kabelanschlusskosten " + fmt(b) + ": Nicht umlagefähig seit 01.07.2024 (§ 2 Nr. 15b TKG). Rückforderung des vollen Betrags.");
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

  // Generische Positionen mit direktem Richtwert-Mapping.
  // heizung_betriebsstrom, heizung_wartung, wasserzaehler bewusst NICHT enthalten:
  // kein offizieller Einzel-Vergleichswert vorhanden (siehe Änderungs-Hinweis oben) —
  // fallen dadurch unten korrekt auf den generischen "prüfen"-Zweig.
  const bm = {
    grundsteuer: [R.grundsteuer, "§ 2 Nr. 1 BetrKV"],
    muellbeseitigung: [R.muell, "§ 2 Nr. 8 BetrKV"],
    strassenreinigung: [R.strassenreinigung, "§ 2 Nr. 8 BetrKV"],
    allgemeinstrom: [R.allgemeinstrom, "§ 2 Nr. 11 BetrKV"],
    gartenpflege: [R.gartenpflege, "§ 2 Nr. 10 BetrKV"],
    aufzug: [R.aufzug, "§ 2 Nr. 7 BetrKV"],
    schornsteinreinigung: [R.schornstein, "§ 2 Nr. 12 BetrKV"],
    // Versicherungs-Unterpositionen: interne Schätzverhältnisse (65/25/10%), da DMB
    // hierzu keine Aufschlüsselung veröffentlicht — Summe korrekt auf 100% (vorher 115%-Bug).
    gebaeudeversicherung: [R.versicherungen * 0.65, "§ 2 Nr. 13 BetrKV"],
    haftpflichtversicherung: [R.versicherungen * 0.25, "§ 2 Nr. 13 BetrKV"],
    glasversicherung: [R.versicherungen * 0.10, "§ 2 Nr. 13 BetrKV"],
    hausreinigung: [R.gebaeudereinigung, "§ 2 Nr. 9 BetrKV"],
  };

  const skip = new Set(["heizkosten_gesamt", "warmwasser_gesamt", "co2_abgabe", "hauswart", "kaltwasser", "entwasserung", "niederschlagswasser", "kabelanschluss"]);

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
