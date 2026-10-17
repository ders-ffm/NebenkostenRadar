// ─────────────────────────────────────────────────────────────────────────
// routen.js — URL <-> Seiten-Name, an EINER Stelle (17.10.2026).
//
// Vorher stand diese Tabelle nur in App.jsx. Für echte Links (siehe
// components/ui/Verweis.jsx) braucht aber jede Navigation den Pfad, nicht
// nur den Seiten-Namen — deshalb liegt die Tabelle jetzt hier und wird von
// App.jsx und Verweis.jsx gemeinsam gelesen.
//
// EINE NEUE SEITE ERGÄNZEN: hier eine Zeile, in App.jsx renderPage() einen
// Zweig, in seo.js einen Eintrag, in vercel.json (falls nicht vorgerendert)
// ein Rewrite.
// ─────────────────────────────────────────────────────────────────────────
export const ROUTES = {
  "/": "welcome",
  "/pruefen/wohnung": "wohnung",
  "/pruefen/posten": "posten",
  "/pruefen/ergebnis": "result",
  "/pruefen/absender": "adressen",
  "/pruefen/download": "download",
  "/pruefen/konto": "konto",
  "/login": "login",
  "/danke": "danke",
  "/impressum": "impressum",
  "/agb": "agb",
  "/datenschutz": "datenschutz",
  "/ratgeber": "ratgeber",
  "/ueber-uns": "ueberuns",
  "/faq": "faq",
  // Kostenlose Werkzeuge (17.10.2026), Inhalte in src/config/werkzeuge.js
  "/nebenkostenabrechnung-pruefen": "werkzeug-pruefen",
  "/fristenrechner-nebenkostenabrechnung": "werkzeug-fristen",
  "/heizkosten-kuerzen-3-prozent": "werkzeug-heizkosten",
};

export const STEP_ZU_PFAD = Object.fromEntries(Object.entries(ROUTES).map(([pfad, step]) => [step, pfad]));

export function pfadFuer(step) {
  return STEP_ZU_PFAD[step] || "/";
}
