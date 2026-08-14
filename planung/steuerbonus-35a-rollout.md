# Steuer-Bonus (§ 35a EStG) — Rollout-Plan zur Freigabe

Stand: 14.08.2026. Entscheidung laut Stefan: on top, ohne Aufpreis, nur im 12,99-€-Paket ("Auswertung + Brief"), muss als zusätzlicher Kaufanreiz sichtbar sein, überall wo relevant (Startseite bis PDF, ggf. AGB/Datenschutz, Marketing). **Noch kein Code geändert — dies ist die Textgrundlage zur Freigabe, danach folgen Mockups.**

Feature-Name für alle Touchpoints einheitlich: **"Steuer-Bonus"** (kurz, marketingtauglich) bzw. **"Steuer-Bonus (§ 35a EStG)"** (dort, wo Präzision zählt: PDF, AGB).

## 0. Was das Feature konkret liefert

Neue, dritte PDF-Seite im "voll"-Paket (zusätzlich zu Seite 1 Auswertung, Seite 2 Musterbrief):

- Listet die bereits erkannten Kostenpositionen, die typischerweise unter § 35a EStG fallen können (Hausmeister, Gartenpflege, Hausreinigung, Winterdienst, Schornsteinfeger, Aufzug-/Heizungswartung, Rauchmelder-Wartung — Mapping siehe Businessplan Abschnitt 10.3), mit den erkannten Beträgen.
- Rechnerischer Hinweis: 20 % davon als mögliche Steuerermäßigung, mit den gesetzlichen Höchstbeträgen (4.000 €/1.200 €) — **ausdrücklich als Rechenbeispiel auf Basis des vollen Betrags, mit Hinweis, dass nur der Arbeitskostenanteil zählt.**
- Eine fertige **Anfrage-Vorlage an den Vermieter**, die genau die gefundenen Positionen und Beträge nennt und um Aufschlüsselung des Arbeitskostenanteils bittet (schließt die in der Recherche gefundene Lücke: die Abrechnung selbst weist das meist nicht getrennt aus).
- Pflicht-Disclaimer (siehe 1.).

## 1. Compliance-Check

**Was sich ändert:**
- **AGB § 2 Vertragsgegenstand** muss angepasst werden — die Leistungsbeschreibung für "Auswertung + Brief" nennt aktuell nur 2 PDF-Seiten, würde sonst nicht mehr zur tatsächlichen Leistung passen (Transparenzgebot, sonst Abmahnrisiko wegen irreführender Leistungsbeschreibung).
- **Jede Stelle, die das Feature im Detail beschreibt oder ausliefert** (PDF-Seite selbst, ausführlich; Produktseite, kurz), braucht einen sichtbaren Hinweis "keine Steuerberatung" — Modell: NebenkostenPros Formulierung "reine Rechenhilfe, keine Steuerberatung" (siehe Businessplan 10.4, § 5 StBerG). Auf reinen Teaser-Stellen (Startseite-Bullet, Social-Post) reicht ein kurzer Zusatz wie "unverbindlicher Hinweis", der volle Disclaimer gehört auf die PDF-Seite und in die AGB.

**Was sich NICHT ändert (geprüft, nicht angenommen):**
- **Datenschutzerklärung:** Keine neue Datenverarbeitung, kein neuer Dritter, keine neue Speicherkategorie — das Feature nutzt ausschließlich die bereits erkannten, bereits offengelegten Kostenpositionen aus der bestehenden Foto-/PDF-Erkennung (Art. 6 Abs. 1 lit. b DSGVO, Vertragserfüllung, bereits dokumentiert). Keine Änderung nötig.
- **Impressum:** keine Berührung.

## 2. Touchpoints mit Textentwurf

### 2.1 `src/pages/Welcome.jsx` — Feature-Liste (Zeile 36–39)

Neuer 5. Punkt, angehängt an die bestehende Liste:

> **Steuer-Bonus im Brief-Paket** — Im Paket "Auswertung + Brief" zeigen wir zusätzlich, welche Positionen deiner Abrechnung nach § 35a EStG steuerlich absetzbar sein können — inklusive fertiger Anfrage-Vorlage an deinen Vermieter.

### 2.2 `src/pages/Welcome.jsx` — Preisteaser (Zeile 60)

Alt: `Basisanalyse kostenlos · Auswertung als PDF {X} € · mit Brief {Y} € · Kein Abo`

Neu: `Basisanalyse kostenlos · Auswertung als PDF {X} € · mit Brief + Steuer-Bonus {Y} € · Kein Abo`

### 2.3 `src/pages/Welcome.jsx` — Preisvergleichs-Karten (Zeile 100–104)

Alt: "Auswertung + Brief" / "2-seitiges PDF: Auswertung plus versandfertiger Musterbrief an deinen Vermieter"

Neu: "Auswertung + Brief + Steuer-Bonus" / "3-seitiges PDF: Auswertung, versandfertiger Musterbrief an deinen Vermieter, plus Hinweis auf steuerlich absetzbare Positionen (§ 35a EStG)"

### 2.4 `src/pages/Result.jsx` — Stufenwahl-Karte "voll" (Zeile 164–166), der eigentliche Kaufmoment

Alt: "Auswertung + Brief" / "2-seitiges PDF inkl. Musterbrief"

Neu: "Auswertung + Brief + Steuer-Bonus" / "3-seitiges PDF inkl. Musterbrief und Steuer-Bonus (§ 35a EStG)"

Zusätzlich: kleiner zweiter Badge neben "Empfohlen" erwägenswert, z. B. "+ Steuer-Bonus" — siehe Mockup, dort visuell entscheiden statt nur textlich.

### 2.5 `src/pdf/BriefPDF.jsx` (oder neue Datei `SteuerbonusPDF.jsx`) — neue Seite 3, nur "voll"

Volltext-Entwurf:

> **Steuer-Bonus: Was du absetzen kannst**
>
> Diese Positionen deiner Abrechnung können nach § 35a EStG steuerlich absetzbar sein:
> [Liste der erkannten Positionen mit Beträgen, aus den bereits erkannten Werten]
>
> Rechnerischer Hinweis: 20 % der reinen Arbeitskosten sind direkt von deiner Steuerschuld abziehbar (max. 4.000 €/Jahr für haushaltsnahe Dienstleistungen, max. 1.200 €/Jahr für Handwerkerleistungen, § 35a Abs. 2/3 EStG). Nur der Arbeits-, Fahrt- und Maschinenkostenanteil zählt, kein Material — deine Abrechnung weist das meist nicht getrennt aus.
>
> **Anfrage an deinen Vermieter** (Textvorschlag zum Kopieren/Versenden):
> "Sehr geehrte/r [Vermieter], für meine Steuererklärung benötige ich eine Aufschlüsselung des Arbeitskostenanteils folgender Positionen aus der Nebenkostenabrechnung [Zeitraum]: [Positionen mit Beträgen]. Ich bitte um eine Bescheinigung gemäß § 35a EStG bzw. Anlage 2 des BMF-Schreibens vom 09.11.2016."
>
> *Reine Rechenhilfe, keine Steuerberatung. Ob und in welcher Höhe die Ermäßigung im Einzelfall greift, hängt von deiner individuellen Steuererklärung ab. Automatisiert erstellter Hinweis, keine Gewähr für Richtigkeit oder Vollständigkeit.*

### 2.6 `src/pages/AGB.jsx` § 2 Vertragsgegenstand (Zeile 17)

Alt: `"Auswertung + Brief (" + PREIS_VOLL + " €): zusätzlich ein 2. PDF-Seite mit versandfertigem Musterbrief an den Vermieter."`

Neu: `"Auswertung + Brief (" + PREIS_VOLL + " €): zusätzlich eine 2. PDF-Seite mit versandfertigem Musterbrief an den Vermieter sowie eine 3. PDF-Seite mit einem unverbindlichen Hinweis zu möglicherweise steuerlich absetzbaren Positionen nach § 35a EStG inkl. Anfrage-Vorlage an den Vermieter (reine Rechenhilfe, keine Steuerberatung)."`

### 2.7 `src/pages/Datenschutz.jsx`

Keine Änderung (siehe 1.).

### 2.8 `src/pages/UeberUns.jsx` (Zeile 17)

Optional, nicht zwingend: "Transparenz bei den Kosten"-Absatz könnte den Steuer-Bonus beiläufig erwähnen. Niedrige Priorität, würde ich zurückstellen bis der Rest steht.

### 2.9 Marketing

- **`marketing/meta-kampagne/content-kalender.md`**: neuer Post-Entwurf ("Fakt: Steuer-Bonus inklusive") für die Instagram/FB-Reihe — schreibe ich nach Freigabe des Kernfeatures, damit der Post die finale Formulierung trifft.
- **`marketing/linkedin-logbuch.md`**: neuer Logbuch-Post ("Post 8 — Steuer-Bonus gebaut") nach demselben Muster wie die bestehenden 7, sobald live.
- **`marketing/meta-kampagne/seitentexte_fb-instagram.md`**: Bio-Ergänzung möglich, aber Zeichenlimit bei Instagram-Bios eng — prüfe ich konkret, sobald der Feature-Name final ist.
- **Statische Anzeigen-Grafiken (PNG unter `marketing/meta-kampagne/bildmaterial/`, `instagram-content/`)**: Text ist in die Bilder eingebrannt, lässt sich nicht per Texttool ändern — bräuchte eine neue Grafik-Generierung (gleiche Pipeline wie beim ursprünglichen Bildmaterial). Bestehende Anzeigen bleiben weiterhin sachlich korrekt (sie behaupten nichts Falsches, erwähnen den Bonus nur nicht) — kein Compliance-Problem, nur verpasste Werbefläche. Empfehlung: separater Schritt, nicht Teil dieses Rollouts.

## 3. Offene Entscheidung vor der Umsetzung

Badge-Frage aus 2.4 (zusätzlicher visueller Hinweis neben "Empfohlen" oder nur Textzeile) kläre ich am besten per Mockup statt nur im Text — folgt separat.
