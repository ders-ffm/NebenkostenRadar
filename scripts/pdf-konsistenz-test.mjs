// ─────────────────────────────────────────────────────────────────────────
// pdf-konsistenz-test.mjs — Systematischer Konsistenztest für Prüfbericht
// und Musterbrief über viele Eingabekonstellationen hinweg.
//
// ANLASS (09.09.2026): Zwei Testkäufe haben nacheinander drei inhaltliche
// Fehler im gekauften PDF offengelegt (leerer Brief, widersprüchliche
// Kopfzeile, Doppelnennung der CO2-Abgabe) — jedes Mal erst, NACHDEM ein
// echter Kauf stattgefunden hatte. Manuelles Durchklicken deckt nur die
// eine Konstellation ab, die man gerade eintippt. Dieses Skript prüft
// stattdessen viele Konstellationen auf einmal gegen feste Regeln, die in
// JEDEM Fall gelten müssen.
//
// AUSFÜHREN:  node scripts/pdf-konsistenz-test.mjs
// Exit-Code 0 = alle Regeln erfüllt, 1 = mindestens eine Verletzung.
//
// WICHTIG — was dieses Skript prüft und was nicht:
//   Geprüft wird die LOGIK hinter den PDFs, also das Ergebnis von
//   buildResult() und die daraus in BriefPDF.jsx / AbrechnungPDF.jsx /
//   SteuerbonusPDF.jsx abgeleiteten Entscheidungen. Die Regeln unten sind
//   deshalb bewusst 1:1 aus diesen drei Dateien nachgebaut. Wird dort etwas
//   geändert, muss es hier mitgezogen werden — der Kommentar in den
//   jeweiligen Dateien weist darauf hin.
//   NICHT geprüft wird das visuelle Layout (Seitenumbrüche, Abstände) —
//   dafür braucht es weiterhin einen Blick ins erzeugte PDF.
// ─────────────────────────────────────────────────────────────────────────
import { buildResult, ALLE_POSTEN } from "../src/lib/analyse.js";

const KEYS = ALLE_POSTEN.map(p => p.key);
const has = k => KEYS.includes(k) || (() => { throw new Error("Unbekannter Posten-Key im Test: " + k); })();

// ── Logik-Spiegel aus den PDF-Komponenten ────────────────────────────────
// Aus AbrechnungPDF.jsx
function kopfzeile(result) {
  const bew = result.posten_bewertung || [];
  const auffaellig = bew.filter(p => p.status !== "ok" && p.status !== "pruefen").length;
  const nichtBewertbar = bew.filter(p => p.status === "pruefen").length;
  const links =
    result.ersparnis_hart > 0 || result.ersparnis_statistisch > 0 ? "betrag" : "keine_auffaelligkeiten";
  const rechts =
    auffaellig > 0 ? "auffaellig" : nichtBewertbar > 0 ? "ohne_vergleichswert" : "alle_unauffaellig";
  return { links, rechts, auffaellig, nichtBewertbar, gesamt: bew.length };
}

// Aus BriefPDF.jsx
function brief(result) {
  const hart = result.widerspruchsgruende_hart || [];
  const stat = result.widerspruchsgruende_statistisch || [];
  const bereitsGenannt = [...hart, ...stat].map(g => (g.text || "").toLowerCase());
  const offene = (result.posten_bewertung || [])
    .filter(p => p.status === "pruefen")
    .filter(p => {
      const n = (p.posten || "").toLowerCase().trim();
      return n && !bereitsGenannt.some(t => t.includes(n));
    });
  const hatBeanstandungen = hart.length + stat.length > 0;
  const modus = hatBeanstandungen ? "einwendungen" : offene.length > 0 ? "auskunft" : "belegeinsicht";
  return {
    hart, stat, offene, hatBeanstandungen, modus,
    zeilen: hart.length + stat.length + offene.length,
    summeSichtbar: hatBeanstandungen,
    zeigtListe: modus !== "belegeinsicht",
    // Auch der Modus "belegeinsicht" hat Briefinhalt (Aufforderung zur
    // Belegeinsicht nach § 259 BGB), nur eben ohne Positionsliste.
    hatInhalt: hart.length + stat.length + offene.length > 0 || modus === "belegeinsicht",
  };
}

// Aus SteuerbonusPDF.jsx
const ohneDavon = n => (n || "").replace(/^davon\s+/i, "");
function steuerbonus(result) {
  const pos = (result.posten_bewertung || []).filter(p => p.steuerlich_35a && p.betrag > 0);
  return { positionen: pos, namen: pos.map(p => ohneDavon(p.posten)) };
}

// ── Regeln, die IMMER gelten müssen ──────────────────────────────────────
const REGELN = [
  // ── DIE WICHTIGSTE REGEL DES GANZEN PROJEKTS ──────────────────────────
  //
  // Ohne Wohnfläche darf NIE eine Beanstandung entstehen. Alle Richtwerte
  // des Deutschen Mieterbundes gelten pro Quadratmeter. Fehlt die Fläche,
  // rechnete die Auswertung früher mit einem Notbehelf von 5 m², und dann
  // liegt jeder normale Posten hunderte Prozent über seinem Richtwert. Im
  // Live-Test am 13.09.2026 kam dabei "Müllbeseitigung: 2365 % über
  // DMB-Richtwert! Belege anfordern." bei einem völlig unauffälligen Betrag
  // von 236,66 € heraus.
  //
  // Das ist der schlimmste Fehlertyp, den dieses Produkt haben kann: eine
  // Falschbeschuldigung gegenüber dem Vermieter, ausgelöst nicht durch eine
  // falsche Eingabe, sondern durch eine fehlende. Der Kunde merkt nichts,
  // der Vermieter antwortet mit einer Rechnung, und die Glaubwürdigkeit
  // aller übrigen Einwände ist dahin.
  //
  // Abgesichert ist das inzwischen an drei Stellen: App.jsx lässt den
  // Posten-Schritt ohne Fläche gar nicht erst zu, analysierePosten() gibt
  // ohne Fläche keine Bewertung ab, und buildResult() unterdrückt zusätzlich
  // den Quadratmeter-Vergleich in der Kopfzeile. Diese Regel hier stellt
  // sicher, dass keine dieser drei Stellen unbemerkt wieder wegfällt.
  {
    name: "Ohne Wohnfläche keine einzige Beanstandung",
    warum: "Aus einer fehlenden Fläche würden sonst 5 m², und jeder normale Posten läge hunderte Prozent über dem Richtwert. Falschbeschuldigung des Vermieters.",
    pruef: (r) => {
      if ((r.fehler_anzahl || 0) > 0) return { grund: r.fehler_anzahl + " Widerspruchsgründe trotz fehlender Wohnfläche" };
      if ((r.moegliche_ersparnis || 0) > 0) return { grund: "Rückforderung " + r.moegliche_ersparnis + " trotz fehlender Wohnfläche" };
      if (r.pro_qm_gesamt != null) return { grund: "€/m²-Wert " + r.pro_qm_gesamt + " trotz fehlender Wohnfläche" };
      const bewertet = (r.posten_bewertung || []).filter(p => p.status !== "pruefen");
      if (bewertet.length > 0) return { grund: "bewertete Posten trotz fehlender Wohnfläche: " + bewertet.map(p => p.posten + "=" + p.status).join(", ") };
      if (/m2\/Jahr|m²\/Jahr/.test(r.zusammenfassung || "")) return { grund: "Zusammenfassung nennt einen Quadratmeterwert: " + r.zusammenfassung };
      return true;
    },
    nurWenn: (r, f) => !(Number(String(f.wohnung.flaeche).replace(",", ".")) >= 5),
  },
  {
    name: "Brief ist nie inhaltlich leer",
    warum: "Ein Musterbrief ohne eine einzige Zeile ist das, wofür der Kunde 12,99 € zahlt.",
    pruef: (r, b) => b.hatInhalt || { grund: "Brief hätte weder Liste noch Belegeinsichts-Text" },
    // Ausnahme: gar keine Posten eingegeben -> es gibt legitim nichts zu schreiben.
    nurWenn: r => (r.posten_bewertung || []).length > 0,
  },
  {
    name: "Ohne Positionsliste steht kein Listen-Rahmen im Brief",
    warum: "Eine leere Tabelle mit Rahmenlinie sieht nach Darstellungsfehler aus.",
    pruef: (r, b) => (b.zeilen > 0) === b.zeigtListe || { grund: `zeigtListe=${b.zeigtListe} bei ${b.zeilen} Zeilen` },
  },
  {
    name: "Belegeinsichts-Modus nur wenn wirklich nichts zu melden ist",
    warum: "Sonst würde eine echte Beanstandung stillschweigend unterschlagen.",
    pruef: (r, b) =>
      (b.modus === "belegeinsicht") === (b.zeilen === 0) ||
      { grund: `modus=${b.modus} bei ${b.zeilen} Zeilen` },
  },
  {
    name: "Keine Position steht doppelt im Brief",
    warum: "CO2-Abgabe und Kabelanschluss können gleichzeitig Widerspruchsgrund und Status 'pruefen' haben.",
    pruef: (r, b) => {
      const genannt = [...b.hart, ...b.stat].map(g => (g.text || "").toLowerCase());
      const doppelt = b.offene.filter(p => genannt.some(t => t.includes((p.posten || "").toLowerCase())));
      return doppelt.length === 0 || { grund: "doppelt: " + doppelt.map(p => p.posten).join(", ") };
    },
  },
  {
    name: "Betreff passt zum Inhalt",
    warum: "'Einwendungen' ohne eine einzige Beanstandung wäre sachlich falsch gegenüber dem Vermieter.",
    pruef: (r, b) =>
      (b.modus === "einwendungen") === b.hatBeanstandungen ||
      { grund: `Modus '${b.modus}' bei hatBeanstandungen=${b.hatBeanstandungen}` },
    nurWenn: r => (r.posten_bewertung || []).length > 0,
  },
  {
    name: "Summenzeile nur bei echten Beanstandungen",
    warum: "'Summe der beanstandeten Positionen 0,00 €' war der auffälligste Fehler des Leer-Briefs.",
    pruef: (r, b) => b.summeSichtbar === b.hatBeanstandungen || { grund: "Summe sichtbar ohne Beanstandung" },
  },
  {
    name: "Summe ist nie negativ",
    warum: "Eine negative 'zu viel gezahlt'-Summe im Brief an den Vermieter wäre unerklärlich.",
    pruef: r => (r.moegliche_ersparnis || 0) >= 0 || { grund: "Summe = " + r.moegliche_ersparnis },
  },
  {
    name: "Summe passt zu hart + statistisch",
    warum: "Die ausgewiesene Summe muss der Summe der beiden Kategorien entsprechen.",
    pruef: r => {
      const soll = Math.round(((r.ersparnis_hart || 0) + (r.ersparnis_statistisch || 0)) * 100) / 100;
      const ist = Math.round((r.moegliche_ersparnis || 0) * 100) / 100;
      return Math.abs(soll - ist) < 0.02 || { grund: `${ist} statt ${soll}` };
    },
  },
  {
    name: "Kopfzeile widerspricht sich nicht",
    warum: "Links 'Keine Auffälligkeiten' und rechts 'x von y auffällig' stand real im gekauften PDF.",
    pruef: (r, b, k) =>
      !(k.links === "keine_auffaelligkeiten" && k.rechts === "auffaellig") ||
      { grund: "links 'Keine Auffälligkeiten', rechts 'auffällig'" },
  },
  {
    name: "Auffälligkeits-Zähler übersteigt nie die Positionszahl",
    warum: "Plausibilitätsgrenze.",
    pruef: (r, b, k) => k.auffaellig + k.nichtBewertbar <= k.gesamt || { grund: `${k.auffaellig}+${k.nichtBewertbar} > ${k.gesamt}` },
  },
  {
    name: "Kein 'davon '-Präfix im Steuer-Bonus",
    warum: "Landet sonst wörtlich im Anschreiben an den Vermieter.",
    pruef: r => {
      const s = steuerbonus(r);
      const schlecht = s.namen.filter(n => /^davon/i.test(n));
      return schlecht.length === 0 || { grund: schlecht.join(", ") };
    },
  },
  {
    name: "Jede Brief-Zeile hat einen Text",
    warum: "Leere Aufzählungspunkte im Brief wären sichtbarer Murks.",
    pruef: (r, b) => {
      const leer = [...b.hart, ...b.stat].filter(g => !(g.text || "").trim());
      return leer.length === 0 || { grund: leer.length + " Gründe ohne Text" };
    },
  },
  {
    name: "Keine Position ohne Namen im Brief",
    warum: "Würde als '4. (€ 12.00): Auf welcher vertraglichen Grundlage…' erscheinen.",
    pruef: (r, b) => {
      const leer = b.offene.filter(p => !(p.posten || "").trim());
      return leer.length === 0 || { grund: leer.length + " Positionen ohne Namen" };
    },
  },
  {
    name: "Keine NaN/undefined in Beträgen",
    warum: "Würde als 'NaN €' im gekauften PDF stehen.",
    pruef: r => {
      const bad = (r.posten_bewertung || []).filter(p => !Number.isFinite(p.betrag));
      const badSum = !Number.isFinite(r.moegliche_ersparnis || 0);
      return (bad.length === 0 && !badSum) || { grund: bad.map(p => p.posten).join(", ") + (badSum ? " + Summe" : "") };
    },
  },
];

// ── Konstellationen ──────────────────────────────────────────────────────
const W = (flaeche, jahr, vorauszahlung, extra = {}) => ({ flaeche, jahr, vorauszahlung, ...extra });
const faelle = [];
const add = (name, werte, wohnung) => faelle.push({ name, werte, wohnung });

// 0. FEHLENDE WOHNFLÄCHE.
//
// Erreichbar, weil jeder Schritt eine eigene, frei aufrufbare URL hat: per
// Lesezeichen, alter Link oder Zurück-Button landet man auf dem
// Posten-Schritt, ohne je eine Fläche eingetragen zu haben. App.jsx
// unterbindet das inzwischen, diese Fälle sichern die Rechenschicht selbst
// ab. Siehe die erste Regel oben.
add("Wohnfläche fehlt ganz", { muellbeseitigung: "236.66", heizkosten_gesamt: "700", kabelanschluss: "60" }, W("", "2025", "900"));
add("Wohnfläche ist null", { muellbeseitigung: "236.66", grundsteuer: "248" }, W("0", "2025", "0"));
add("Wohnfläche unsinnig klein", { muellbeseitigung: "236.66", gartenpflege: "900" }, W("3", "2025", "1200"));
add("Wohnfläche fehlt, dazu Heizkostenangaben", { heizkosten_gesamt: "700.81", warmwasser_gesamt: "461.75" },
  W("", "2025", "1200", { heizGrundkosten: "140.16", heizVerbrauchskosten: "560.65", hkVerbrauchErfasst: "nein" }));

// 1. Grenzfälle der Eingabemenge
add("gar nichts eingegeben", {}, W("75", "2024", "0"));
add("nur Pflichtfelder, unauffällig", { heizkosten_gesamt: "800", warmwasser_gesamt: "300" }, W("75", "2024", "1200"));
add("ein einziger Posten", { heizkosten_gesamt: "500" }, W("75", "2024", "500"));
add("alle 34 Posten mit Kleinbetrag", Object.fromEntries(KEYS.map(k => [k, "5"])), W("75", "2024", "200"));
add("alle 34 Posten mit Großbetrag", Object.fromEntries(KEYS.map(k => [k, "5000"])), W("75", "2024", "200"));

// 2. Reine Befundlagen
add("nur 'pruefen'-Positionen (kein Vergleichswert)", {
  heizkosten_gesamt: "800", warmwasser_gesamt: "300",
  gemeinschaftsantenne: "78", rauchwarnmelder_wartung: "27", sonstiges_vereinbart: "328",
}, W("76", "2025", "1200"));
add("nur harte Verstöße (Verwaltung + Instandhaltung)", {
  heizkosten_gesamt: "800", warmwasser_gesamt: "300", verwaltungskosten: "250", instandhaltung: "400",
}, W("75", "2024", "1500"));
add("nur statistische Ausreißer", {
  heizkosten_gesamt: "800", warmwasser_gesamt: "300", grundsteuer: "1500", gartenpflege: "900",
}, W("75", "2024", "1500"));
add("alles zusammen (hart + statistisch + pruefen)", {
  heizkosten_gesamt: "800", warmwasser_gesamt: "300", verwaltungskosten: "250",
  grundsteuer: "1500", gemeinschaftsantenne: "78", co2_abgabe: "12",
}, W("75", "2024", "1500"));

// 3. Kabelanschluss — drei Rechtszustände
add("Kabel vor Gesetzesänderung (2023)", { heizkosten_gesamt: "800", warmwasser_gesamt: "300", kabelanschluss: "150" }, W("75", "2023", "1000"));
add("Kabel im Übergangsjahr (2024)", { heizkosten_gesamt: "800", warmwasser_gesamt: "300", kabelanschluss: "150" }, W("75", "2024", "1000"));
add("Kabel nach Gesetzesänderung (2025)", { heizkosten_gesamt: "800", warmwasser_gesamt: "300", kabelanschluss: "150" }, W("75", "2025", "1000"));

// 4. CO2-Abgabe (Status pruefen UND Widerspruchsgrund) — Doppelnennungs-Risiko
add("CO2 allein", { heizkosten_gesamt: "800", warmwasser_gesamt: "300", co2_abgabe: "45" }, W("75", "2024", "1200"));
add("CO2 + Kabel 2024 (beide doppeldeutig)", { heizkosten_gesamt: "800", warmwasser_gesamt: "300", co2_abgabe: "45", kabelanschluss: "150" }, W("75", "2024", "1200"));

// 5. Extreme Wohnungs-/Zahlwerte
add("winzige Wohnung", { heizkosten_gesamt: "300", warmwasser_gesamt: "100" }, W("1", "2024", "400"));
add("sehr große Wohnung", { heizkosten_gesamt: "3000", warmwasser_gesamt: "900" }, W("500", "2024", "4000"));
add("Wohnfläche 0", { heizkosten_gesamt: "800", warmwasser_gesamt: "300" }, W("0", "2024", "1000"));
add("Vorauszahlung 0 (volle Nachzahlung)", { heizkosten_gesamt: "800", warmwasser_gesamt: "300" }, W("75", "2024", "0"));
add("hohes Guthaben", { heizkosten_gesamt: "300", warmwasser_gesamt: "100" }, W("75", "2024", "9000"));
add("Cent-Beträge", { heizkosten_gesamt: "0.01", warmwasser_gesamt: "0.02" }, W("75", "2024", "0.03"));

// 6. Jahres-/Fristvarianten
["2019", "2022", "2023", "2024", "2025", "2026"].forEach(j =>
  add("Abrechnungsjahr " + j, { heizkosten_gesamt: "800", warmwasser_gesamt: "300", grundsteuer: "900" }, W("75", j, "1200")));
add("mit Empfangsdatum (Fristprüfung aktiv)", { heizkosten_gesamt: "800", warmwasser_gesamt: "300" }, W("75", "2024", "1200", { erhaltenAm: "2025-03-01" }));
add("Empfangsdatum weit in der Vergangenheit", { heizkosten_gesamt: "800", warmwasser_gesamt: "300", grundsteuer: "900" }, W("75", "2022", "1200", { erhaltenAm: "2023-01-15" }));

// 7. Aufgeteilte Positionen (erzeugen "davon "-Zeilen)
add("Straßenreinigung + Winterdienst getrennt", {
  heizkosten_gesamt: "800", warmwasser_gesamt: "300", strassenreinigung: "42", schnee_eis_beseitigung: "22",
}, W("76", "2025", "1200"));
add("alle vier Versicherungen einzeln", {
  heizkosten_gesamt: "800", warmwasser_gesamt: "300",
  feuerversicherung: "120", sturm_hagel_versicherung: "40", leitungswasser_versicherung: "35", haftpflichtversicherung: "25",
}, W("75", "2024", "1200"));
add("Straßenreinigung + Versicherungen + Warmwasser (viele 'davon')", {
  heizkosten_gesamt: "800", warmwasser_gesamt: "300", strassenreinigung: "42", schnee_eis_beseitigung: "22",
  feuerversicherung: "120", sturm_hagel_versicherung: "40",
}, W("75", "2024", "1200"));

// 8. Nur steuerlich relevante Posten (Steuer-Bonus-Seite)
add("nur §35a-Posten", {
  heizkosten_gesamt: "800", warmwasser_gesamt: "300",
  hausreinigung: "200", gartenpflege: "150", hauswart: "300", schnee_eis_beseitigung: "50", rauchwarnmelder_wartung: "30",
}, W("75", "2024", "1200"));

// 9. Stefans beide echten Testfälle
add("Testkauf 1 (Stefan, ohne Auffälligkeiten)", {
  heizkosten_gesamt: "256", warmwasser_gesamt: "450", muellbeseitigung: "44.40",
  gemeinschaftsantenne: "78", rauchwarnmelder_wartung: "26.80", sonstiges_vereinbart: "328.32",
}, W("76", "2025", "1500"));
add("Testkauf 2 (Stefan, echte Abrechnung)", {
  heizkosten_gesamt: "256", warmwasser_gesamt: "450", co2_abgabe: "12",
  kaltwasser: "263", entwasserung: "25", strassenreinigung: "42", schnee_eis_beseitigung: "22",
  feuerversicherung: "25", grundsteuer: "1228", muellbeseitigung: "44.40",
  hausreinigung: "80", gartenpflege: "258", allgemeinstrom: "36",
  gemeinschaftsantenne: "78", rauchwarnmelder_wartung: "26.80", sonstiges_vereinbart: "328.32",
}, W("76", "2025", "1500"));

// 10. Jeder Posten einzeln — findet Positionen, die für sich genommen Probleme machen
KEYS.forEach(k => add("nur " + k, { heizkosten_gesamt: "800", warmwasser_gesamt: "300", [k]: "200" }, W("75", "2024", "1200")));

// ── Ausführung ───────────────────────────────────────────────────────────
let verletzungen = 0;
let geprueft = 0;
const proRegel = {};

for (const f of faelle) {
  let r;
  try {
    r = buildResult(f.werte, f.wohnung);
  } catch (err) {
    console.log(`✗ ABSTURZ  ${f.name}: ${err.message}`);
    verletzungen++;
    continue;
  }
  const b = brief(r);
  const k = kopfzeile(r);
  for (const regel of REGELN) {
    // `f` mit übergeben (13.09.2026): Manche Regeln müssen nicht nur das
    // Ergebnis kennen, sondern auch die EINGABE, aus der es entstanden ist.
    // Die Wohnflächen-Regel gilt zum Beispiel nur für Fälle ohne Fläche, und
    // die Fläche steht nur in f.wohnung, nicht mehr im Ergebnis.
    if (regel.nurWenn && !regel.nurWenn(r, f)) continue;
    geprueft++;
    const res = regel.pruef(r, b, k);
    if (res !== true) {
      verletzungen++;
      proRegel[regel.name] = (proRegel[regel.name] || 0) + 1;
      console.log(`✗ ${regel.name}\n    Fall: ${f.name}\n    ${res.grund || ""}`);
    }
  }
}

console.log("\n" + "─".repeat(64));
console.log(`Konstellationen: ${faelle.length} · Einzelprüfungen: ${geprueft} · Verletzungen: ${verletzungen}`);
if (verletzungen > 0) {
  console.log("\nVerletzungen nach Regel:");
  Object.entries(proRegel).forEach(([n, c]) => console.log(`  ${c}x  ${n}`));
}
console.log(verletzungen === 0 ? "✓ Alle Regeln in allen Konstellationen erfüllt." : "✗ Bitte oben ansehen.");
process.exit(verletzungen === 0 ? 0 : 1);
