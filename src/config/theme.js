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
  // ── REDESIGN 18.10.2026 ("Vorschlag A · klar & digital", von Stefan
  // ausgewählt). Begründung und Messwerte: CHANGELOG.md, Eintrag 18.10.2026.
  // Kurz: Die alten beigen Grautöne (#8A7A5C u. a.) lagen mit 4,18:1 unter
  // dem WCAG-Mindestkontrast 4,5:1, Fließtext war 11–14 px. Neutrale Töne
  // haben jetzt einen leichten Grünstich passend zur Markenfarbe; jeder
  // Text-Ton erreicht auf Weiß mindestens 5,6:1. Rollen unverändert:
  // brand = Grün (Logo, Vertrauen), accent = Terrakotta (NUR Buttons/CTAs).
  color: {
    // Flächen
    bg: "#FFFFFF",        // Seitenhintergrund
    surface: "#FFFFFF",   // Karten, Formulare
    alt: "#F5F8F6",       // ruhige Abschnittsfläche (z. B. "So läuft es ab")
    border: "#E1E7E3",    // Trennlinien und Kartenränder (dekorativ)
    // Rand von Eingabefeldern. Muss sich nach WCAG 1.4.11 mit mind. 3:1
    // vom Hintergrund abheben (gemessen 3,07:1 auf Weiß), sonst sehen
    // Sehschwache nicht, wo sie tippen sollen. "border" oben erreicht das
    // bewusst nicht, es ist nur Dekoration.
    inputBorder: "#8A968F",

    // Text (Kontrast auf Weiß: 15,9 / 8,1 / 5,7 : 1)
    text: "#16201B",
    textMuted: "#47534C",
    textDim: "#5E6A63",

    // Marke (Logo, Vertrauen, "unauffällig")
    brand: "#3d7a5c",     // Logofarbe, unverändert
    brandStrong: "#2D6649", // Grün für Text auf hellgrüner Fläche (5,9:1)
    brandBg: "#E9F2EC",

    // Akzent (NUR Buttons/CTAs, siehe Kommentar oben)
    accent: "#B5502C",
    accentHover: "#9E4424",
    accentBg: "#F3ECDC",   // nur noch im PDF (AbrechnungPDF summaryBox)
    accentText: "#FFFFFF", // Text auf accent-Fläche (5,1:1)

    // Status (Ergebnis-Bewertung)
    ok: "#3d7a5c",
    okBg: "#E9F2EC",
    warn: "#B5502C",
    warnBg: "#FDF0EE",
    critical: "#B03A2E",
    criticalBg: "#FBEAE7",
    // "auffällig" (Richtwert überschritten, kein Beweis) in Bernstein statt
    // Rot: optisch klar von "nicht umlagefähig" getrennt.
    amber: "#8A5A0B",
    amberBg: "#FBF1DC",
  },

  font: {
    // Inter für alles (Überschriften und Fließtext), selbst gehostet über
    // das npm-Paket @fontsource/inter (Import in src/main.jsx). Kein Abruf
    // bei Google, siehe index.html (LG München I, 3 O 17493/20).
    heading: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
    body: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
    // Das LOGO bleibt unverändert in Poppins/Work Sans (Stefans Vorgabe:
    // "das Logo muss bleiben"). Nur Nav und BrandAnschrift nutzen diese.
    logo: "'Poppins', sans-serif",
    logoSub: "'Work Sans', sans-serif",
  },

  // Schriftgrößen-Stufen (px). Fließtext 17, nie unter 13.
  size: { xs: 13, sm: 14.5, base: 17, lg: 19, xl: 22, h2: 30, h1: 48 },

  radius: {
    sm: 10,
    md: 12,
    lg: 14,
    xl: 18,
  },

  shadow: "0 1px 2px rgba(16,32,24,.05), 0 8px 24px rgba(16,32,24,.06)",

  layout: {
    pageMax: 1200,
    // 12.08.2026: von 560 auf 680 erhöht. Grund: 560px wirkte auf breiten
    // Desktop-Bildschirmen als sehr schmale, isolierte Spalte (Stefans
    // Rückmeldung). formMax wird per inline maxWidth (kein CSS-Media-Query)
    // gesetzt und dadurch NIE erzwungen — auf schmalen/mobilen Viewports
    // greift automatisch die Bildschirmbreite selbst (Div hat kein festes
    // width, nur maxWidth). Diese Änderung wirkt sich daher ausschließlich
    // auf Bildschirme >680px aus, das mobile Verhalten bleibt unverändert.
    // 680 statt z.B. 900+, weil ein einspaltiges Formular (Label + Feld
    // untereinander) bei größerer Breite unruhig zu lesen wird — üblicher
    // Richtwert für Formular-Spalten liegt bei 600–750px.
    formMax: 680, // einspaltige Formular-Schritte (Wohnung/Posten/Adressen), schmaler als pageMax, nach Vorbild Taxfix
    mobileBreakpoint: 760,
  },
};
