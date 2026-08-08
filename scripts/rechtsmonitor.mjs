#!/usr/bin/env node
/**
 * NebenkostenRadar — Automatischer Rechtsmonitor & SEO-Artikel Generator
 *
 * VERWENDUNG MIT CLAUDE CODE:
 *   claude "Führe scripts/rechtsmonitor.mjs aus, prüfe neue Rechtsprechung
 *            und erstelle wenn nötig neue Artikel"
 *
 * WAS DIESES SCRIPT TUT:
 * 1. Wählt aus der Themenliste (siehe THEMEN_POOL unten) automatisch bis zu
 *    2 Themen aus, die noch nicht als Artikel existieren
 * 2. KI schreibt eigene Artikel in eigenen Worten — kein Copy-Paste
 * 3. Holt lizenzfreie Titelbilder von Unsplash API (vermeidet Bild-Duplikate)
 * 4. Verlinkt neue Artikel automatisch mit passenden bestehenden Artikeln
 *    (interne Verlinkung, "verweis"-Blöcke — nur vorwärts: neu → alt)
 * 5. Fügt fertige Artikel in src/artikel.js ein
 * 6. Aktualisiert sitemap.xml automatisch
 *
 * SETUP:
 *   npm install node-fetch
 *   export ANTHROPIC_API_KEY=sk-ant-...
 *   export UNSPLASH_ACCESS_KEY=...  (kostenlos: unsplash.com/developers)
 *   node scripts/rechtsmonitor.mjs
 *
 * AUTOMATISIERUNG (monatlich):
 *   GitHub Actions Workflow: .github/workflows/rechtsmonitor.yml
 *
 * NEUE THEMEN HINZUFÜGEN (ohne Code-Kenntnisse):
 *   Einfach eine neue Zeile im Array "THEMEN_POOL" weiter unten ergänzen,
 *   z.B.: "Nebenkosten bei Untervermietung 2026",
 *   Das Skript verarbeitet pro Lauf automatisch bis zu 2 noch nicht
 *   behandelte Themen aus dieser Liste (von oben nach unten).
 *
 * FEHLERDIAGNOSE:
 *   Schlägt die KI-Generierung fehl, wird die echte Ursache geloggt
 *   (Stop-Grund + Antwort-Ausschnitt) — im GitHub-Actions-Log beim Schritt
 *   "Rechtsmonitor ausfuehren" sichtbar.
 *
 * VERLAUF:
 *   25.07.2026 — max_tokens 6000→8192→12000 (Abbruch mitten im JSON behoben).
 *   25.07.2026 — system-Prompt ergänzt + robuste JSON-Extraktion, nachdem
 *   die KI bei Websuche-Nutzung entweder das ganze Token-Budget für
 *   Suchschritte verbraucht hat (leere Antwort) oder Fließtext vor dem
 *   JSON geschrieben hat, was das reine JSON.parse gebrochen hat.
 *   25.07.2026 — Verweis-Anweisung verschärft (KI hat trotz thematischer
 *   Nähe keine Verweis-Blöcke gesetzt).
 *   26.07.2026 — ROOT-CAUSE-FIX: Die KI hat sich bisher die "id" für jeden
 *   Artikel frei ausgedacht (abgeleitet vom eigenen Titel). Dieselbe
 *   Themen-Eingabe führte dadurch bei jedem Lauf zu einer ANDEREN id, wodurch
 *   die Duplikat-Prüfung (Vergleich nur nach exakter id) versagt hat — es
 *   entstanden mehrfach Artikel zum selben Thema mit unterschiedlichen
 *   Titeln/IDs. Fix: Die id wird jetzt IMMER deterministisch aus dem
 *   Themen-Text berechnet (slugify), nicht mehr von der KI übernommen.
 *   Zusätzlich: fest programmierte 2-Themen-Liste durch größeren,
 *   erweiterbaren THEMEN_POOL ersetzt
