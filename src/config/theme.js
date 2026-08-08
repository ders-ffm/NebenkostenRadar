// ─────────────────────────────────────────────────────────────────────────
// theme.js — Design-Tokens (das CI als Code)
//
// Zentrale Stelle für Farben, Fonts und Design-Grundwerte. Ändert sich das
// Erscheinungsbild (z.B. Akzentfarbe), reicht eine Änderung hier — alle
// Komponenten und Seiten ziehen ihre Farben ausschließlich aus diesem Objekt.
//
// Rollen-Prinzip (wichtig, nicht vermischen):
//   - accent (Terrakotta)  → AUSSCHLIESSLICH Handlungsaufforderungen (Buttons, CTAs)
//   - brand (Grün)         → Logo, Marken-/Vertrauenselemente, "unauffällig"-Status
//   - warn (Terrakotta)    → Ausnahme: auffällige/beanstandete Positionen in
//                             Ergebnislisten dürfen die Akzentfarbe zur Warnung nutzen
//
// Für ein neues Projekt auf Basis dieser Vorlage: nur diese Datei anpassen,
// der Rest (Komponenten, Seiten-Struktur) bleibt unverändert wiederverwendbar.
// ─────────────────────────────────────────────────────────────────────────

export const THEME = {
  color: {
    // Flächen
    bg: "#FBF7F0",       // Cream — Seitenhintergrund
    surface: "#FFFFFF",   // Karten, Formulare
    border: "#E3D9C6",

    // Text
    text: "#2E2A22",      // Ink — Haupttext
    textMuted: "#6B6152",
    textDim: "#8A7A5C",

    // Marke (Logo, Vertrauen, "unauffällig")
    brand: "#3d7a5c",
    brandBg: "#EAF4EE",

    // Akzent (NUR Buttons/CTAs, siehe Kommentar oben)
    accent: "#B5502C",
    accentBg: "#F3ECDC",
    accentText: "#FBF3EA", // Text auf accent-Fläche

    // Status (Ergebnis-Bewertung)
    ok: "#3d7a5c",
    okBg: "#EAF4EE",
    warn: "#B5502C",
    warnBg: "#FDF0EE",
    critical: "#c0392b",
    criticalBg: "#fdf0ee",
  },

  font: {
    heading: "'Poppins', sans-serif",
    body: "'Work Sans', sans-serif",
    googleFontsUrl:
      "https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&family=Work+Sans:wght@400;500&display=swap",
  },

  radius: {
    sm: 8,
    md: 10,
    lg: 12,
    xl: 16,
  },

  layout: {
    pageMax: 1200,
    formMax: 560, // einspaltige Formular-Schritte (Wohnung/Posten/Adressen) — schmaler als pageMax, nach Vorbild Taxfix
    mobileBreakpoint: 760,
  },
};
