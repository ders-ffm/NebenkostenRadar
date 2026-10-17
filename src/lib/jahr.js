// ─────────────────────────────────────────────────────────────────────────
// jahr.js — Jahreszahlen, die mit dem Kalender mitwandern (17.10.2026)
//
// Stefans Vorgabe: "Bei jedem Jahreswechsel muss alles auf das nächste Jahr
// umgestellt werden." Deshalb stehen relative Jahresangaben im Text nicht
// fest, sondern als Platzhalter:
//
//   {JAHR}       laufendes Kalenderjahr           (z. B. Titel "… (2026)")
//   {VORJAHR}    Vorjahr = das Abrechnungsjahr, um das es gerade geht
//                ("Die Abrechnung {VORJAHR} muss bis 31.12.{JAHR} da sein")
//   {FOLGEJAHR}  nächstes Jahr (z. B. Widerspruchsfrist im Beispiel)
//
// FESTE Daten aus Gesetzen (z. B. "1. Juli 2024" beim Kabelanschluss oder
// "31. Dezember 2026" als Nachrüstfrist der HeizkostenV) bleiben feste
// Zahlen: Die ändern sich nicht mit dem Kalender.
//
// WIE DIE NEUE ZAHL ONLINE KOMMT: Im Browser wird bei jedem Seitenaufruf
// ersetzt. Die vorgerenderten Seiten, die Google liest, entstehen beim
// Build; dafür sorgt der Workflow .github/workflows/jahreswechsel.yml, der
// am 2. Januar automatisch einen neuen Build auslöst.
//
// Verwendet in: src/artikel.js, src/config/werkzeuge.js,
// src/components/layout/Nav.jsx.
// ─────────────────────────────────────────────────────────────────────────
const J = new Date().getFullYear();

export const JAHR = String(J);
export const VORJAHR = String(J - 1);
export const FOLGEJAHR = String(J + 1);

export function mitJahr(text) {
  return String(text)
    .split("{JAHR}").join(JAHR)
    .split("{VORJAHR}").join(VORJAHR)
    .split("{FOLGEJAHR}").join(FOLGEJAHR);
}

// Ersetzt rekursiv in Strings, Arrays, Objekten. Funktionen, die Text
// liefern (z. B. text: () => …), werden so umhüllt, dass auch ihr Ergebnis
// ersetzt wird.
export function jahrEinsetzenTief(wert) {
  if (typeof wert === "string") return mitJahr(wert);
  if (typeof wert === "function") return (...args) => jahrEinsetzenTief(wert(...args));
  if (Array.isArray(wert)) return wert.map(jahrEinsetzenTief);
  if (wert && typeof wert === "object") {
    const neu = {};
    for (const k of Object.keys(wert)) neu[k] = jahrEinsetzenTief(wert[k]);
    return neu;
  }
  return wert;
}

export function enthaeltJahrPlatzhalter(wert) {
  return /\{(JAHR|VORJAHR|FOLGEJAHR)\}/.test(JSON.stringify(wert));
}
