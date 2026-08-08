# CHANGELOG — NebenkostenRadar

Alle wesentlichen Änderungen an diesem Projekt, mit Datum und Begründung. Dient der Nachvollziehbarkeit, damit auch ohne KI-Unterstützung verstanden werden kann, warum etwas so ist, wie es ist.

## 08/2026 — Modularer Neuaufbau + Korrekturen

### Architektur
- Komplette Umstellung von einer einzigen `App.jsx` (ca. 1500 Zeilen) auf eine modulare Struktur (`config/`, `lib/`, `components/`, `pages/`, `pdf/`) — Ziel: Wiederverwendbarkeit als Vorlage für künftige Projekte, kleinere Änderungen ohne KI möglich.
- Jede Seite bekommt jetzt eine echte, eigene URL (vorher teilten sich Impressum/AGB/Datenschutz/Formular-Schritte alle dieselbe URL) — wichtig für SEO, Verlinkbarkeit, Zurück-Button.

### Design
- Neues Farbschema: Cream/Terrakotta/Grün statt vorherigem Gold/Weiß-Schema. Terrakotta ausschließlich für Buttons, Grün für Marke/Logo/positive Ergebnisse.
- Neue Schriften: Poppins (Überschriften) + Work Sans (Fließtext) — freie Alternativen zu den lizenzpflichtigen Vorbildern Euclid Circular B (museumsufershop.de) und abcRomFonts (taxfix.de).
- Mehrstufiges Formular mit Fortschrittsanzeige beibehalten und optisch überarbeitet.

### Korrigierte Fehler in der Berechnungslogik
- **Richtwerte falsch:** Fast alle Einzelwerte in `CONFIG.RICHTWERTE` wichen vom offiziellen DMB-Betriebskostenspiegel ab (teils 20-40%). Gegen die offizielle Quelle (mieterbund.de, Ausgabe Abrechnungsjahr 2024, veröffentlicht 18.12.2025) geprüft und korrigiert.
- **Heizkosten-Prozentfehler:** Angezeigte Abweichungsprozent bezog sich auf einen erfundenen 75/25-Split zwischen Heizung und Warmwasser, obwohl DMB nur einen kombinierten Wert ausweist. Jetzt ein gemeinsamer, korrekt nachrechenbarer Vergleichswert.
- **Versicherungs-Split-Fehler:** Die drei Versicherungs-Unterpositionen summierten sich auf 115% statt 100% des Gesamtwerts. Korrigiert auf 65/25/10%.
- **Erfundene Richtwerte entfernt:** Heizungsbetriebsstrom, Heizungswartung und Wasserzähler hatten Richtwerte ohne jede offizielle Quelle. Entfernt — diese Positionen fallen jetzt korrekt auf den "prüfen"-Status.
- **KI-Analyse-Pfad entfernt:** `runAnalyse()` rief zuvor `/api/v1/messages` auf. **Korrektur (08/2026, nach Einsicht in `vercel.json`):** Frühere Annahme in diesem Changelog war, dieser Endpoint sei tot (404) gewesen — das stimmt so nicht sicher: `vercel.json` leitete `/api/v1/messages` per Rewrite auf `api/messages.js` weiter, und diese Datei existiert im Projekt. Ob sie tatsächlich funktionierte, ist unbekannt (Dateiinhalt nie eingesehen). Unabhängig davon: Der Pfad wurde entfernt, die App nutzt jetzt ausschließlich die lokale, regelbasierte Engine (bewusste Entscheidung, nicht wegen vermuteter Fehlfunktion — kein KI-Rätselraten, echter Mehrwert ggü. ChatGPT). `api/messages.js` und die zugehörige Rewrite-Regel/Function-Konfiguration in `vercel.json` sind dadurch verwaist; nicht ohne Rückfrage entfernt, siehe Projekt-Chat.

### Preismodell
- Von einem Preis (9,99 €, Auswertung + Brief) auf zwei Preisstufen umgestellt: Auswertung allein (7,99 €), Auswertung + Musterbrief (9,99 €).
- **Wichtig:** Ein Stripe Payment Link ist fest an einen Preis gebunden. Für zwei Preisstufen sind zwei separate Payment Links im Stripe-Dashboard nötig (siehe `src/config/business.js`, `STRIPE_LINK_AUSWERTUNG` muss noch angelegt werden).

### PDF-Erzeugung
- Von reinem Klartext-Copy-Paste auf echte, client-seitig erzeugte Vektor-PDFs umgestellt (`@react-pdf/renderer`), im Website-Design, kein Screenshot. Läuft komplett im Browser — keine laufenden Serverkosten.
- Seite 1 (beide Preisstufen): Positionsübersicht mit Richtwerten und Begründungen.
- Seite 2 (nur Stufe "voll"): Musterbrief an den Vermieter, DIN-5008-Format, bewusst zurückhaltend gestaltet (kaum Farbe), damit er beim Vermieter seriös ankommt.

### Kundenkonto
- Automatischer, passwortloser Zugang per Magic-Link nach Kauf (kein separates Registrierungsformular vor dem Checkout, um die Conversion nicht zu gefährden). Nutzt die bereits vorhandene Supabase-Infrastruktur (`nkr_reports`-Tabelle).
- Geplante automatisierte Löschung gespeicherter Kundendaten nach 12 Monaten (Grundsatz der Speicherbegrenzung, Art. 5 Abs. 1 lit. e DSGVO) — noch umzusetzen als Cron-Job.

### Datenschutzerklärung
- Abschnitt "Keine Datenspeicherung" entfernt — inzwischen sachlich falsch, da Eingabedaten für die PDF-Erzeugung/das Kundenkonto bis zu 12 Monate gespeichert werden.
- Abschnitt "Analyse-Service (Anthropic)" entfernt — die Analyse läuft vollständig regelbasiert im Browser, es werden keine Nebenkosten-Daten mehr an Anthropic übermittelt.
- Neue Abschnitte zu Supabase-Speicherung und Kundenkonto/Magic-Link ergänzt.

### E-Mail-Versand korrigiert (echter Fehler behoben)
- **Gefunden:** `Download.jsx` behauptete bereits "wir haben es dir per E-Mail geschickt", obwohl `api/send-email.js` im gesamten Code nirgendwo aufgerufen wurde — es wurde also nie tatsächlich eine E-Mail verschickt. Leeres Versprechen an zahlende Kunden.
- **Behoben:** `api/send-email.js` verschickt jetzt das identische PDF (nicht mehr nur Text) als echten Anhang über Resend, wird tatsächlich aus `Download.jsx` heraus aufgerufen. Serverseitig per `email_sent`-Flag in Supabase gegen Doppelversand abgesichert (z. B. bei erneutem Laden der Download-Seite).
- **E-Mail-Adresse:** kommt nicht aus einem eigenen Formularfeld, sondern wird von Stripe übernommen (dort ohnehin beim Checkout Pflicht) — wird nicht zusätzlich in Supabase gespeichert (Datensparsamkeit). `api/get-report.js` liest sie aus der verifizierten Stripe-Session.
- Datenschutzerklärung entsprechend korrigiert (Abschnitt 2 und 8).
- Fehler-Text auf der Download-Seite entschärft: behauptet nicht mehr fälschlich, eine E-Mail sei bereits verschickt worden, wenn die Daten gar nicht erst geladen werden konnten.

### Automatischer Rabattcode-Versand (10 Monate nach Kauf)
- Neue Opt-in-Checkbox auf der Absender-Seite (`Adressen.jsx`, standardmäßig NICHT vorausgewählt): Kunde kann zustimmen, 10 Monate nach dem Kauf einen Rabattcode für die nächste Prüfung per E-Mail zu erhalten.
- **Rechtliche Einordnung (keine Rechtsberatung):** Bewusst als echtes Opt-in (Art. 6 Abs. 1 lit. a DSGVO) umgesetzt statt über die Ausnahme für Bestandskundenwerbung (§ 7 Abs. 3 UWG) ohne Einwilligung. Grund: Die Hinweispflicht nach § 7 Abs. 3 Nr. 4 UWG muss laut Rechtsprechung (LG Paderborn, 22.02.2024, 2 O 325/23) klar sichtbar direkt bei der Erhebung erfolgen — unsere E-Mail-Adresse wird aber auf der Stripe-Checkout-Seite erhoben, die wir nicht gestalten. Ein Verweis in der Datenschutzerklärung allein reicht laut diesem Urteil nicht aus. Empfehlung: vor Live-Gang einmal von einem Anwalt/Datenschutzbeauftragten gegenprüfen lassen.
- Neue Supabase-Tabelle `marketing_optins`, neuer Cron-Job `scripts/marketing-rabatt-versand.mjs` (täglich, GitHub Actions, $0 Zusatzkosten), neuer Abmelde-Endpoint `api/marketing-abmelden.js` (Pflicht-Abmeldelink in jeder Mail).
- Fester Rabattcode `DANKE10` (`BUSINESS.MARKETING_RABATT_CODE`), muss zusätzlich manuell im Stripe-Dashboard angelegt werden. Notiz für die geplante Preisanpassung 2028: dann eher fester Euro-Betrag statt Prozent-Rabatt verwenden, um zielgenau auf den heutigen Preis zu kommen (siehe Kommentar in `business.js`).
- **Nebenbefund:** Für `scripts/richtwerte-monitor.mjs` existierte bisher gar kein GitHub-Actions-Workflow — das Skript lag im Repo, wurde aber nie automatisch ausgeführt. Mit `.github/workflows/richtwerte-monitor.yml` jetzt nachgeholt (monatlich).

### Kundenkonto per Magic-Link (Supabase Auth)
- Neue Seiten `Login.jsx` (E-Mail eingeben) und `Konto.jsx` (frühere Berichte ansehen und PDF erneut herunterladen), verlinkt über "Schon dabei? Anmelden" auf der Startseite.
- Login läuft über Supabase Auth (bereits vorhandenes Supabase-Projekt, keine Zusatzkosten im Rahmen der üblichen Nutzung). Neue serverseitige Route `api/my-reports.js` verifiziert das Zugangs-Token direkt bei Supabase und liefert nur Berichte, deren E-Mail-Adresse zur bestätigten Login-E-Mail passt — die E-Mail-Adresse wird nicht ungeprüft vom Client übernommen.
- Wichtig für den Produktivbetrieb: Der eingebaute Supabase-Mailversand ist auf 2 E-Mails/Stunde limitiert, deshalb ist eine eigene SMTP-Anbindung über Resend im Supabase-Dashboard erforderlich (siehe ANLEITUNG-UPLOAD.md).

### Supabase Keep-Alive
- Kostenlose Supabase-Projekte pausieren automatisch nach 7 Tagen ohne echte Datenbank-Anfragen. Neues, eigenständiges Skript `scripts/supabase-keepalive.mjs` (täglich per GitHub Actions) stellt sicher, dass das nie passiert — unabhängig von anderen Jobs.

### Automatisierte Datenlöschung nach 12 Monaten
- Bisher nur in der Datenschutzerklärung versprochen, jetzt umgesetzt: `scripts/datenloeschung.mjs` (wöchentlich) löscht Zeilen älter als 365 Tage aus `nkr_reports` und `nkr_purchases`.

### Eingabefelder: Format, Breite und Plausibilität
- **Problem:** Kurze Werte (Wohnfläche, Abrechnungsjahr, Vorauszahlung) standen in voll breiten Feldern und wirkten dadurch wie Freitextfelder statt wie klar begrenzte Zahleneingaben. Große Beträge (z. B. Heizkosten über 1.000 €) hatten keine Tausendertrennung. Kostenposten-Felder zeigten immer nur "0,00" als Platzhalter, ohne Anhaltspunkt für die zu erwartende Größenordnung.
- **Behoben:** `Field.jsx` und `EuroInput.jsx` unterstützen jetzt `width="short"/"medium"` (kompaktere Feldbreite) und einen `money`-Modus (deutsche Tausenderpunkt-Anzeige, z. B. "2.400,00" — die Rechenlogik selbst war schon vorher tolerant gegenüber beiden Schreibweisen, siehe `toNum()` in `lib/format.js`). Jeder Kostenposten in `lib/analyse.js` hat jetzt einen `beispiel`-Wert als grauen Placeholder, hergeleitet aus den DMB-Richtwerten für eine 75m²-Referenzwohnung (bei Posten ohne offiziellen Richtwert: grobe, klar als Beispiel gekennzeichnete Hausnummer).
- **Plausibilitätsprüfung ergänzt** (`Wohnung.jsx`): Abrechnungsjahr muss zwischen 2000 und dem aktuellen Jahr liegen, Wohnfläche max. 500 m², Vorauszahlung max. 50.000 € — mit verständlicher Fehlermeldung statt stillem Akzeptieren offensichtlicher Tippfehler. E-Mail-Format-Prüfung (`@`, Punkt) und doppelte E-Mail-Eingabe bestanden bereits.

### Kundenkonto: Klarheit über jederzeitigen Zugriff + Spam-Hinweis
- **Problem:** Nirgends stand explizit, dass ein Kunde sich nach dem Kauf jederzeit anmelden kann, um seinen Bericht erneut herunterzuladen — das Kundenkonto existierte technisch, war aber kommunikativ unsichtbar. Die Magic-Link-Bestätigung erwähnte keinen Spam-Ordner, obwohl der Link nur eine Stunde gültig ist.
- **Behoben:** `Login.jsx` (Bestätigungstext nach Linkversand), `Download.jsx` (Hinweis direkt nach dem Kauf), `Konto.jsx` (Erklärsatz im Konto selbst), `api/send-email.js` und `scripts/marketing-rabatt-versand.mjs` (Fußzeile beider automatischer Mails) weisen jetzt konsistent auf den jederzeitigen Zugriff übers Kundenkonto hin. Spam-Ordner-Hinweis in `Login.jsx` ergänzt.
- **Offen, außerhalb unseres Codes:** Die eigentliche Magic-Link-Mail wird von Supabase selbst verschickt (Dashboard-Vorlage, kein Repo-Code). Empfohlener Text inkl. Spam-Hinweis liegt jetzt in `ANLEITUNG-UPLOAD.md` unter "Supabase — Auth", muss aber manuell im Supabase-Dashboard eingetragen werden.

### Magic-Link-Mail: Vertrauenswirkung geprüft (Scam-Eindruck vermeiden)
- **Recherchiert (Supabase-Doku, siehe Projekt-Chat 08/2026):** Absendername/-adresse lassen sich in denselben SMTP-Einstellungen setzen wie beim übrigen Mailversand — jetzt auf `NebenkostenRadar <noreply@nebenkostenradar.com>` festgelegt, identisch zu den beiden anderen Mails. Der Vorlagen-Editor akzeptiert vollständiges HTML — die empfohlene Vorlage in `ANLEITUNG-UPLOAD.md` übernimmt jetzt Logo, Farben und Fußzeile 1:1 aus `send-email.js`, plus einen Vertrauens-Absatz (Grund der Zustellung, Verhalten falls nicht angefordert, Spam-Hinweis).
- **Bewusste Grenze, offen kommuniziert:** Diese Maßnahmen ändern nichts an der tatsächlichen Link-Domain (`{{ .ConfirmationURL }}` zeigt standardmäßig auf `<projekt-id>.supabase.co`, nicht auf `nebenkostenradar.com`). Eine eigene Domain für die Supabase-Auth-API ("Custom Domain") würde das beheben, kostet laut aktueller Supabase-Preisseite aber 10 $/Monat zusätzlich zu einem kostenpflichtigen Plan (Pro ab 25 $/Monat) — bewusst nicht umgesetzt, da im Widerspruch zur Vorgabe "Supabase soll nichts kosten" (siehe Projekt-Chat, Entscheidung für Supabase Auth).
- **Stattdessen:** Magic-Link-Mail und `Login.jsx` erklären jetzt in einfacher Sprache, dass Supabase als etablierter Anbieter für Nutzerkonten genutzt wird, vertraglich abgesichert (Art. 28 DSGVO) und DSGVO-konform, mit Verweis auf die Datenschutzerklärung.
- **Dabei aufgefallene Lücke behoben:** In `Datenschutz.jsx`, Abschnitt 2, fehlte bislang der Hinweis auf die Standardvertragsklauseln bei der Datenübermittlung an Supabase Inc. (USA) — anders als bei Stripe und Vercel, wo dieser Passus bereits stand. Ergänzt: "Datenübermittlung in Drittländer … auf Basis von Standardvertragsklauseln der EU-Kommission (Art. 46 Abs. 2 lit. c DSGVO)", recherchegestützt (Supabase bietet laut eigener Dokumentation einen Auftragsverarbeitungsvertrag mit SCCs an).

### Ladeanzeige: pulsierendes Logo
- `Loading.jsx` hatte bereits eine prozentuale Fortschrittsanzeige (7 Prüfschritte à 900 ms = 6,3 Sekunden Gesamtdauer, synchron zur künstlichen Verzögerung in `App.jsx`). Ergänzt: sanft pulsierende Animation auf dem Logo-Quadrat (CSS-Keyframes direkt in der Komponente, kein neues Asset/Datei nötig) — soll die Wertigkeit der Prüfung unterstreichen, ohne die Dauer zu verändern.

### Vor-Upload-Check (08/2026): Syntax- und Konsistenzprüfung aller Dateien
- Alle 46 JS/JSX/MJS-Dateien (`src/`, `api/`, `scripts/`) automatisiert auf Syntaxfehler geprüft (esbuild) — fehlerfrei.
- Alle `navigateTo(...)`-Ziele gegen die Routen-Liste in `App.jsx` abgeglichen — konsistent. Alle Einträge aus `ROUTES` haben eine passende Rewrite-Regel in `vercel.json`.
- **Echte Lücke gefunden und behoben:** `CookieBanner` wurde bisher ausschließlich in `Welcome.jsx` gerendert. Besucher, die über eine andere URL einsteigen (z. B. ein Ratgeber-Artikel über Google — genau der Traffic, für den die Ratgeber-Sektion gebaut ist — oder ein direkter Link zu `/pruefen/wohnung`), haben die Einwilligungsabfrage nie gesehen, GA4 wäre für diese Besuche nie geladen worden. Rechtlich unproblematisch (kein Opt-in = keine Ladung, fail-safe), aber ein echtes Analytics-Loch. Behoben: `CookieBanner` jetzt in `App.jsx` auf oberster Ebene gerendert, unabhängig von der Einstiegsseite.
- **Echte Lücke gefunden, in `ANLEITUNG-UPLOAD.md` ergänzt:** Der Stripe-Webhook-Endpunkt (`Developers → Webhooks`, Ziel-URL `/api/webhook`, Event `checkout.session.completed`) fehlte komplett in der bisherigen Checkliste — ohne diesen manuellen Schritt bei Stripe wird `api/webhook.js` nie aufgerufen, `nkr_purchases` bliebe leer, und die automatische Rabatt-Mail nach 10 Monaten hätte für niemanden eine Grundlage. Der PDF-Versand selbst ist davon nicht betroffen (unabhängiger Pfad über `get-report.js`). Zusätzlich fehlte `STRIPE_WEBHOOK_SECRET` in der Vercel-Umgebungsvariablen-Liste — ohne ihn läuft der Webhook ungeprüft (keine Signaturprüfung).
- **Vermeintliche Diskrepanz, geklärt:** `public/logo-email.png` fehlte im lokalen, synchronisierten Ordner — Stefan hat per Screenshot bestätigt, dass die Datei direkt im GitHub-Repo liegt (Upload vor 6 Stunden), nicht über diesen lokalen Ordner. Kein echtes Problem, nur unterschiedliche Ablageorte.
- GitHub-Secrets-Checkliste war ungenau ("werden von allen vier Workflows gebraucht", tatsächlich braucht nur `marketing-rabatt-versand.yml` alle drei; `richtwerte-monitor.yml` keins davon) — präzisiert.
- Neuer Testschritt in `ANLEITUNG-UPLOAD.md`: nach Testkauf prüfen, ob tatsächlich eine Zeile in `nkr_purchases` erscheint.

### Rechtsmonitor (unverändert, aber eingeordnet)
- `scripts/rechtsmonitor.mjs` (SEO-Artikel-Generator) deckt NICHT die Richtwerte-Aktualität ab — das ist ein separates System für Blog-/Ratgeber-Inhalte, keine strukturierte Zahlen-Datenbank.
- Neu gebaut: `scripts/richtwerte-monitor.mjs` — prüft monatlich, ob eine neue DMB-Ausgabe vorliegt, meldet Abweichungen als GitHub Issue, überschreibt nichts automatisch (Zahlen mit direkter finanzieller Wirkung erfordern menschliche Prüfung).

### `.github/workflows` — Bestandsaufnahme beim Hochladen der 4 neuen Workflow-Dateien (08/2026)
- Beim manuellen Anlegen von `datenloeschung.yml`, `marketing-rabatt-versand.yml`, `richtwerte-monitor.yml`, `supabase-keepalive.yml` im Repo zeigten sich zwei bereits vorhandene, ältere Dateien mit ähnlich klingenden Namen — Inhalt geprüft, nicht angenommen:
  - **`followup-email.yml` — gelöscht.** Alte, vor dieser Session gebaute Rabatt-Mail-Automatisierung mit drei konkreten Problemen: (1) Cron `0 8 1 * *` überschneidet sich mit `marketing-rabatt-versand.yml` (`0 8 * * *`) exakt am 1. jedes Monats um 08:00 UTC — beide Workflows hätten beim selben Lauf `nkr_purchases` mit `followup_sent=false` abfragen und potenziell doppelt an denselben Kunden senden können, da GitHub Actions keine Ausführungsreihenfolge zwischen Workflows garantiert. (2) Prüfte `marketing_opt_in` nicht — hätte an alle Käufer im 10-12-Monats-Fenster verschickt, unabhängig von Einwilligung; widerspricht dem in dieser Session bewusst auf Opt-in umgestellten Verfahren (siehe Abschnitt "Kundenkonto"/Adressen.jsx). (3) Enthielt einen hartkodierten Rabattcode `NKR20`, der nicht mit dem tatsächlich in Stripe angelegten Code `DANKE10` (`BUSINESS.MARKETING_RABATT_CODE`) übereinstimmt — wäre beim Einlösen fehlgeschlagen.
  - **`rechtsmonitor.yml` — behalten, kein Duplikat.** Ruft `scripts/rechtsmonitor.mjs` auf (SEO-Artikel-Generator, siehe Abschnitt oben), committet automatisch neue Artikel in `src/artikel.js` und `public/sitemap.xml`. Läuft unabhängig von `richtwerte-monitor.yml` trotz ähnlichem Namen. **Klarstellung zu einer offenen Frage aus dem Projekt-Chat:** `ANTHROPIC_API_KEY` und `UNSPLASH_ACCESS_KEY` sind entgegen einer früheren Vermutung NICHT verwaist — beide werden aktiv von diesem Workflow benötigt.

### Rechtsmonitor — Stil-Konsistenz der SEO-Artikel (08/2026)
- **Echte Inkonsistenz gefunden:** Der Artikel `bgh-urteile-mietrecht-nebenkosten-2026` duzt durchgehend ("für dich als Mieter"), alle anderen Artikel siezen. Ursache: Der Prompt in `scripts/rechtsmonitor.mjs` machte keine Vorgabe zur Anrede, die KI hat sie sich pro Lauf neu ausgesucht.
- Prompt in `generiereArtikel()` um einen STIL-Abschnitt ergänzt: verbindliche Sie-Form, zwei echte Satzbeispiele aus bestehenden Artikeln als Ton-Anker, Liste zu vermeidender KI-typischer Floskeln ("In der heutigen Zeit", "Zusammenfassend lässt sich sagen" u. Ä.), Pflicht zur konkreten §-Fundstelle bei jeder Rechtsbehauptung, Hinweis auf zu variierende Satz-/Absatzeinstiege. Rein stilistisch — JSON-Struktur, deterministische ID-Vergabe und Verweis-Logik unverändert.
- Datei liegt nicht im lokalen Ordner (wie `package.json`), Änderung wurde direkt als Ersetzungs-Block für GitHub bereitgestellt.

### Layout-Bug in Formular-Feldern behoben (08/2026)
- **Echter Bug, live entdeckt (Desktop und Mobil):** In `Field.jsx` standen Label und Tipp in einer `display:"flex"`-Zeile ohne Zeilenumbruch, der Tipp zusätzlich auf `maxWidth:160` rechtsbündig begrenzt. Folge: Auf breiten Bildschirmen quetschte sich längerer Tipptext in eine schmale, hohe Spalte (siehe Screenshot "Wohnfläche laut Mietvertrag"); auf schmalen Mobil-Viewports lief die Zeile ohne Umbruch aus dem Rahmen — Text rechts abgeschnitten. Behoben durch Stapeln: Label → Tipp (volle Breite) → Feld → Fehlermeldung (volle Breite, jetzt unter statt neben dem Feld).
- Zusätzlich fehlte den Formular-Schritten (`Wohnung.jsx`, `Posten.jsx`) die zentrierte Max-Breite, die der Rest der Seite (`Welcome.jsx`, `UeberUns.jsx`, `Artikel.jsx`, `Ratgeber.jsx`) über `THEME.layout.pageMax` bereits nutzt — auf Desktop lief der Inhalt dadurch randlos über die volle Fensterbreite ("katastrophal", O-Ton). `Adressen.jsx` hatte das bereits für den Content-Bereich (nicht aber die Kopfzeile) gelöst gehabt — jetzt einheitlich: neuer Token `THEME.layout.formMax` (560px, schmaler als das 1200px-`pageMax` der Marketing-Seiten, nach Vorbild Taxfix), angewendet auf Kopfzeile UND Content in allen drei Formular-Schritten.
- `width="short"/"medium"`-Feldbreiten in `Field.jsx` von 130/220px auf 220/320px erweitert — die ursprünglich sehr schmalen Werte wirkten trotz Label/Rahmen noch gedrungen; Taxfix-Referenz zeigt großzügiger bemessene Felder trotz kurzer erwarteter Eingabe.

### Zentrierung & Mobil-Absicherung Formular-Schritte (08/2026)
- Titel + Intro-Text auf `Wohnung.jsx`, `Posten.jsx`, `Adressen.jsx` zentriert (`textAlign: "center"`), analog zum bereits zentrierten Hero-Bereich der Startseite (`Welcome.jsx`). Felder/Karten darunter bleiben bewusst linksbündig — gleiches Muster wie auf der Startseite (zentrierter Hero-Text, linksbündige Feature-Karten darunter), entspricht auch dem Taxfix-Vorbild (zentrierte Frage oben, linksbündige Eingabefelder darunter).
- Grund für die vorherige Wahrnehmung "Seite 2 wirkt linksbündig, Seite 1 zentriert": Beide Container waren technisch bereits identisch zentriert (`maxWidth`+`margin:auto`, code-seitig geprüft, Zeile für Zeile gleich) — der Unterschied kam daher, dass Seite 1 schmalere Felder hatte, die den Container nicht ausfüllten, während Seite 2 randfüllende Karten hat. Titel-Zentrierung schafft jetzt eine einheitliche visuelle Anker-Linie oben auf allen Formular-Schritten, unabhängig von der Feldbreite darunter.
- **Kein horizontales Scrollen auf Mobil, global abgesichert:** `index.html` bekommt `html, body { max-width: 100%; overflow-x: hidden; }` als Sicherheitsnetz gegen jede Art von seitlichem Überlauf, unabhängig von der Ursache.
- **Wahrscheinlichster konkreter Auslöser behoben:** Die H1-Überschrift der Startseite nutzte einen harten `<br />` zwischen "Deine Nebenkostenabrechnung." und dem grünen Teil — auf sehr schmalen Viewports kann eine so lange erste Zeile (bei 30px Schrift ca. 490px Textbreite) knapp werden. Ersetzt durch zwei eigenständige Block-Elemente, die unabhängig voneinander sicher umbrechen, statt sich auf einen festen Umbruchpunkt zu verlassen.

### Echte Ursache des Mobil-Abschneidens gefunden (08/2026)
- Nach dem `overflow-x:hidden`-Fix änderte sich das Symptom von "Seite seitlich wegziehbar" zu "Text mitten im Wort abgeschnitten" (auf echtem iPhone verifiziert) — das bestätigte: der vorherige Fix (Block-Elemente statt `<br/>`) hatte die eigentliche Ursache nicht getroffen.
- Ursache: "Nebenkostenabrechnung." ist ein langes deutsches Kompositum ohne Leerzeichen. Browser brechen Wörter ohne Leerzeichen standardmäßig nicht um, selbst wenn sie breiter sind als der verfügbare Platz — auf einem 375px-Screen bei 30px Schrift war das Wort schlicht zu breit für eine Zeile.
- Fix: `overflow-wrap: break-word` global in `index.html` ergänzt (erlaubt als letzten Ausweg einen Umbruch mitten im Wort, nur wenn nötig). Betrifft nicht nur die Startseiten-Überschrift, sondern schützt vor demselben Problem bei jedem künftigen langen Wort (z.B. in Ratgeber-Artikeln, Fehlermeldungen).

### Silbentrennung statt hässlichem Wortabbruch (08/2026)
- `overflow-wrap: break-word` behob zwar das Abschneiden, brach aber mitten im Wort ohne Bindestrich und ohne Rücksicht auf Silbengrenzen ("Nebenkostenabrec-hnung") — technisch kein Überlauf mehr, optisch aber schlechter als vorher.
- Sauberer Fix: `hyphens: auto` auf `h1, h2, h3, p` ergänzt (nutzt `lang="de"` auf `<html>` für sprachbewusste, echte Silbentrennung mit Bindestrich an korrekter Stelle). `overflow-wrap` bleibt als reines Sicherheitsnetz für Extremfälle erhalten, greift aber im Normalfall nicht mehr vor `hyphens`.
- Zusätzlich: Hero-Überschrift auf der Startseite bekommt unter 420px Breite eine kleinere Schriftgröße (25px statt 30px, per `@media`-Query), damit "Nebenkostenabrechnung" auf den meisten Handys gar nicht erst getrennt werden muss.
- Punkt nach "Deine Nebenkostenabrechnung" entfernt (Kundenwunsch).
- Auf Kundenwunsch zusätzlich pragmatisch gelöst: Hero-Überschrift von "Deine Nebenkostenabrechnung" auf "Deine Abrechnung" gekürzt — vermeidet das lange Kompositum in der Überschrift von vornherein, unabhängig von CSS-Lösungen. `hyphens` in `index.html` bleibt trotzdem als generelle Absicherung für andere lange Wörter auf der Seite (Ratgeber-Artikel etc.).
- Die mobile Schriftgrößen-Reduzierung (30px→25px unter 420px) ist mit dem kürzeren Text nicht mehr nötig und wurde wieder entfernt — wirkte sonst kleiner als beabsichtigt, obwohl "Deine Abrechnung" auch bei voller Größe problemlos passt.

### Zusätzliche Absicherung gegen horizontales Scrollen (08/2026)
- Stefan meldete erneut seitliches Scrollen auf Mobil, obwohl `overflow-x:hidden` auf `html, body` bereits gesetzt war (Code lokal verifiziert, Regel war korrekt vorhanden). Wahrscheinlichste Ursache weiterhin: Deployment-Verzug wie zuvor bei diesem Projekt beobachtet (GitHub-Push und Vercel-Production-Deploy liefen zeitlich auseinander).
- Zusätzlich, unabhängig vom Deployment-Verdacht, eine bekannte iOS-Safari-Lücke geschlossen: `overflow-x:hidden` auf `body` allein verhindert bei elastischem Rubber-Band-Scrollen nicht immer zuverlässig das seitliche Wegziehen — jetzt zusätzlich auf `#root` (den eigentlichen React-App-Container) angewendet.

## Frühere Änderungen

Siehe Kommentar-Historie in `scripts/rechtsmonitor.mjs` für die Entwicklung des SEO-Artikel-Systems (25.–26.07.2026: JSON-Extraktion, deterministische Artikel-IDs, Duplikat-Vermeidung).
