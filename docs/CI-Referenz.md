# NebenkostenRadar — CI-Referenzdokument

Kurze Referenz für kleine bis mittlere Design-Änderungen, die du selbst vornehmen kannst, ohne KI-Unterstützung. Alle hier genannten Werte stehen zusätzlich als Code in `src/config/theme.js` — Änderungen dort wirken sich automatisch auf die ganze Website aus.

## Farben

| Rolle | Hex | Verwendung |
|---|---|---|
| Cream (Hintergrund) | `#FBF7F0` | Seitenhintergrund |
| Weiß (Fläche) | `#FFFFFF` | Karten, Formulare |
| Ink (Text) | `#2E2A22` | Haupttext, Überschriften |
| Terrakotta (Akzent) | `#B5502C` | **Nur** Buttons/Handlungsaufforderungen |
| Grün (Marke) | `#3d7a5c` | Logo, Vertrauens-Elemente, "unauffällig"-Status |

**Wichtigste Regel:** Terrakotta ist ausschließlich für Buttons und Call-to-Actions reserviert. Wird diese Farbe auch für andere Elemente verwendet, verliert sie ihre Signalwirkung ("wo ist der Knopf?"). Grün steht für Marke und positive Ergebnisse, nicht für Handlungsaufforderungen.

## Schriften

- Überschriften/Buttons: **Poppins** (Google Fonts, Gewichte 500/600/700)
- Fließtext/Formulare: **Work Sans** (Google Fonts, Gewichte 400/500)

Beide sind kostenlose, freie Alternativen zu den lizenzpflichtigen Schriften Euclid Circular B und abcRomFonts (siehe Projekt-Historie), mit ähnlichem Charakter.

## Wording-Grundsätze

- Website (Kunde als Leser): **informelles "du"**
- PDF-Brief an den Vermieter: **förmliches "Sie"**, sachlich, zurückhaltend — kein Marketing-Ton
- Kurze, direkte Sätze (Taxfix-Stil), wenig Gedankenstriche
- Reddit/Social Media: authentisch, keine "Bauernschläue", keine erkennbaren KI-Textmuster

## Logo

Bestehendes Radar-Icon (konzentrische Kreise) bleibt unverändert — nicht neu gestalten. Wird bereits extern verwendet (Google Business Profile, Social-Media-Profile), eine Änderung würde diese Konsistenz zerstören.

Korrektur 23.08.2026: Trustpilot fälschlich mitgelistet — es existiert ein Trustpilot-Account, der aber bisher ungenutzt ist (keine Bewertungen, kein aktiver Auftritt). Kein Beleg für "bereits extern verwendet", daher hier entfernt.

## Eine Design-Änderung selbst vornehmen — Beispiel

Möchtest du z. B. die Akzentfarbe ändern:

1. Öffne `src/config/theme.js`
2. Ändere den Wert bei `accent: "#B5502C"` auf die neue Farbe
3. Fertig — alle Buttons auf der ganzen Website übernehmen automatisch die neue Farbe

Das ist der Sinn der modularen Struktur: Eine Datei ändern statt zwanzig.
