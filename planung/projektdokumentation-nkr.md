# NebenkostenRadar — Projektdokumentation

Stand: 22.08.2026. Zweck dieses Dokuments: ein Ort, der den Gesamtzustand des Projekts zusammenfasst — Produkt, Technik, Recht, Geschäftsmodell, Marketing —, damit du und ich uns nicht bei jeder Frage durch Einzeldateien wühlen müssen. Detailtiefe bleibt bewusst in den verlinkten Fachdokumenten; hier steht nur, was wo zu finden ist und der aktuelle Kernstand.

Abgrenzung zu README.md: README.md ist reine Entwickler-Doku (lokales Setup, Build, Deployment). Dieses Dokument ist die Projekt-Ebene darüber — Produkt, Business, Recht, Marketing.

## 1. Was NebenkostenRadar ist

Eine Web-App, die Nebenkostenabrechnungen von Mieter:innen automatisiert gegen gesetzliche Vorgaben und Richtwerte prüft. Kernversprechen (Stand 19.08.2026, siehe `src/pages/Welcome.jsx`): "Geprüft. Transparent. Verständlich." — bewusst kein "rechtssicher" mehr, da das Tool keine individuelle anwaltliche Prüfung ersetzt.

Rechtliche Prüfgrundlage: § 2 BetrKV (Betriebskostenkatalog), HeizkostenV (50/70-Regel Heizkosten), CO2KostAufG (Aufteilung CO₂-Abgabe), Vergleich mit dem DMB-Betriebskostenspiegel (aktuell Abrechnungsjahr 2024, veröffentlicht 18.12.2025 — Quelle und Pflegehinweis in `src/config/business.js`).

Ablauf für die Nutzerin: Wohnung/Abrechnung erfassen (`Wohnung.jsx`) → Posten eintragen (`Posten.jsx`) → Ergebnis (`Result.jsx`) → optional PDF-Kauf → Danke-Seite (`Danke.jsx`).

## 2. Preismodell

Zwei Stufen (Entscheidung 08/2026, siehe `src/config/business.js`):

| Stufe | Preis | Inhalt |
|---|---|---|
| Auswertung | 9,99 € | 1-seitiges PDF mit allen Positionen, Richtwerten, Begründungen |
| Auswertung + Brief + Steuer-Bonus | 12,99 € | 3-seitiges PDF: Auswertung, versandfertiger Musterbrief an den Vermieter, Hinweis auf steuerlich absetzbare Positionen (§ 35a EStG) |

Basisanalyse (ohne PDF) ist kostenlos. Zahlungsabwicklung über zwei separate Stripe Payment Links (ein Link = ein Preis, technische Notwendigkeit, siehe Kommentar in `business.js`). Live-Webhook: `/api/webhook.js` (`checkout.session.completed`).

Der Steuer-Bonus (§ 35a EStG-Hinweis) betrifft ausschließlich Posten *innerhalb* der geprüften Abrechnung (z. B. Hausmeister-, Gartenpflege-, Wartungskosten) — **nicht** die eigene NKR-Gebühr. Ob die NKR-Gebühr selbst absetzbar wäre, wurde am 19.08.2026 geprüft und verneint (§35a EStG erfordert haushaltsnahe Dienstleistung am Objekt, Werbungskosten erfordern Einkünfte-Bezug, private Steuerberatungskosten sind seit 2006 nicht mehr als Sonderausgaben absetzbar — siehe Businessplan Abschnitt 10.4 und Chat-Verlauf 19.08.2026). Dieser Punkt wird bewusst **nicht** als Marketingaussage verwendet.

## 3. Tech-Stack & Architektur

- Frontend: React 18 (Vite), Single-Page-App, Vorrendern via `scripts/prerender.mjs` für SEO-relevante Seiten
- PDF-Erzeugung: `@react-pdf/renderer`
- Backend: Vercel Serverless Functions unter `api/` (`save-report.js`, `send-email.js`, `my-reports.js`, `get-report.js`, `webhook.js`, `analyse-foto.js`, `contact.js`, `marketing-abmelden.js`)
- Datenhaltung: Supabase (`@supabase/supabase-js`)
- KI-Analyse (Fotoerkennung von Abrechnungen): Anthropic API, Proxy über `api/analyse-foto.js`
- Hosting/Deployment: Vercel, verbunden mit GitHub `main` (öffentliches Repo `github.com/ders-ffm/NebenkostenRadar`)
- Tracking: Google Analytics 4 (`G-KE9LWG22QW`), kein Meta-Pixel installiert (Stand 22.08.2026)
- E-Mail-Versand: `send-email.js` (Resend, siehe Datenschutz-Hinweis Abschnitt 5)

Seitenstruktur (`src/pages/`): `Welcome`, `Wohnung`, `Posten`, `Result`, `Login`, `Konto`, `Adressen`, `Download`, `Danke`, `Ratgeber`, `Artikel`, `UeberUns`, `Impressum`, `Datenschutz`, `AGB`, `Loading`.

## 4. Rechtliches & Datenschutz

- `AGB.jsx`: enthält vollständige Widerrufsbelehrung (ergänzt, siehe CHANGELOG), Widerruf-Zustimmung wird nachweisbar gespeichert
- `Datenschutz.jsx`: Preisangaben korrigiert (CHANGELOG), SCC-Hinweis für Vercel/Resend als Auftragsverarbeiter außerhalb der EU ergänzt
- `Impressum.jsx`: Pflichtangaben
- Rechtsform: Einzelunternehmen (Kleinunternehmerregelung), siehe Steuerleitfaden

Offene/laufend zu pflegende Punkte stehen im CHANGELOG.md mit Datum — das bleibt die chronologische Quelle für "was wurde wann geändert und warum".

## 5. Business & Wettbewerb

Vollständige Analyse (Kosten, Umsatzprognose, Break-even, Wettbewerbsvergleich Mineko/NebenkostenPro/nebify, Zeitplan): **`planung/businessplan-umsatzprognose.md`**. Wichtigste Eckpunkte von dort:

- Ziel realistisch eingeordnet: 250–1.000 Verkäufe/Jahr (Abschnitt 9), nicht als Behauptung, sondern als Spanne mit Annahmen
- Wettbewerb: Mineko (≥49€, manuelle Prüfung), NebenkostenPro (5€, KI-basiert), nebify (kostenloser Vorab-Check, Prüfbericht ab 14,90€, Geld-zurück-Garantie, betrieben von Kolibri eCommerce GbR) — NKR positioniert sich bewusst zurückhaltender (keine Geld-zurück-Garantie, da diese ein Versprechen macht, das die automatisierte Prüfung nicht in jedem Fall halten kann)

## 6. Marketing & Werbung

Strategische Klammer: **`planung/werbeplan-nkr.md`** (neu, siehe dort für Kanäle, Budget, Saisonplan, KPIs).

Taktische Umsetzungsdateien (bleiben die operative Arbeitsebene, nicht duplizieren):

- `marketing/content-kalender.md` → organische FB/Instagram-Posts, Stilnotizen
- `marketing/meta-kampagne/anleitung-meta-ads-kampagne.md` → Meta-Ads-Kampagnen-Setup, Flight-Planung, GA4-Auswertung
- `marketing/meta-kampagne/seitentexte_fb-instagram.md` → Bio-/Seitentexte
- `marketing/meta-kampagne/anleitung-instagram-reels.md` → Reels-Skripte und Produktions-Anleitung (neu)
- `marketing/linkedin-logbuch.md` → LinkedIn-Postverlauf (persönliche Posts von Stefan)

## 7. Steuerliche Behandlung (Stefans eigene Steuer, nicht Kundenberatung)

Stefans persönliche Aufwands-/Ertragsdokumentation für die eigene Steuererklärung: **`NebenkostenRadar_Steuerleitfaden_2026.docx`** (im Projektordner-Root). Wird laufend aktualisiert, wenn sich Preise, Kosten oder Status ändern.

## 8. Aktueller Status (22.08.2026)

- Produkt live, Preise 9,99€/12,99€, Steuer-Bonus-Feature ausgerollt
- Meta-Ads Flight 1 gestartet (120€, drei Creatives, Zeitraum kommendes Wochenende)
- Flight 2 (80€) für September geplant, noch kein festes Datum
- FB-Seite hat ersten Post live, Instagram-Content-Kalender läuft, alte inkonsistente (cremefarbene) Insta-Posts entfernt
- Instagram Reels: Skripte vorhanden, Produktion noch offen
- Kein Meta-Pixel, keine bezahlte Google-Werbung bisher

## 9. Offene Punkte

- ~~Neue weiße Hintergrundbilder für 6 geplante Werbe-Posts~~ — erledigt 22.08.2026: alle 13 benötigten Bilder per Python/Pillow (lokale Poppins-Schriftart, kein externes Tool) erzeugt. Ordner `marketing/meta-kampagne/instagram-content/` ist jetzt in `online gestellt/` (6 Dateien, tatsächlich live, Wortlaut mit echtem Insta-Stand abgeglichen) und `noch nicht online/` (8 Dateien) unterteilt.
- nebify-Primärquelle (Mieterverein Düsseldorf, behauptetes Pressemitteilungsdatum 08.10.2025) nicht verifiziert — Fetch zweimal fehlgeschlagen
- Stefans persönliche Steuerdaten (ShopWatcher-Status, Stripe-Umsätze, Gewerbeschein, laufende Abo-Kosten) noch nicht vollständig für Steuerleitfaden erfasst
