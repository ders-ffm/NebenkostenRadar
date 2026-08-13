# NebenkostenRadar — Businessplan &amp; Umsatzprognose

Stand: 13.08.2026. Erstellt für die konkrete Entscheidung: Lohnt sich Marketing (insbesondere die geplante Meta-Ads-Kampagne) wirtschaftlich, gegeben 1–2 Std./Woche verfügbare Zeit? Alle Zahlen sind entweder aus dem Code/der Konfiguration belegt (mit Dateiverweis), aus externen Quellen recherchiert (mit Link), oder explizit als Annahme/Schätzung gekennzeichnet. Keine Zahl in diesem Dokument ist eine Garantie — das kann bei einer Seite ohne jede Verkaufshistorie niemand seriös versprechen.

Kein Ersatz für steuerliche/betriebswirtschaftliche Beratung — insbesondere die Umsatzsteuer-/Kleinunternehmer-Frage und etwaige Buchführungspflichten solltest du bei realem Umsatzwachstum mit einem Steuerberater absichern.

---

## 1. Ausgangslage (Fakten)

| Punkt | Wert | Quelle |
|---|---|---|
| Preis Stufe 1 (Auswertung) | 9,99 € | `src/config/business.js` |
| Preis Stufe 2 (Auswertung + Brief) | 12,99 € | `src/config/business.js` |
| Umsatzsteuer | Keine (Kleinunternehmer, § 19 UStG) | `AGB.jsx` § 4 |
| Bisherige echte Verkäufe | 0 (nur 1 Stripe-Testkauf) | `CHANGELOG.md` |
| Bisheriger Traffic | 0 (Seite erst seit kurzem live) | Stefan, mehrfach bestätigt |
| Hosting (Vercel) | Hobby-Plan, aktuell kostenlos | `CHANGELOG.md` |
| Datenbank (Supabase) | Free-Tier, 0 €/Monat (Pro-Plan ab 25 $/Monat wäre nötig bei mehr Last) | Code-Kommentare |
| Zeitbudget Betreiber | 1–2 Std./Woche | Deine Angabe |
| Bereits fertige Social-Assets | 6 Anzeigen-/Profilgrafiken, 10 Instagram-Posts, 15 fertig getextete Posts (ca. 7–8 Wochen Vorlauf bei 2x/Woche) | `marketing/meta-kampagne/` |
| Automatisierter Content-Nachschub | Monatlich bis zu 2 neue Ratgeber-Artikel per Cron+KI | `scripts/rechtsmonitor.mjs` |
| Wiederkehrender manueller Aufwand | Minimal — Datenlöschung, Rabatt-Mails, Supabase-Keepalive, Artikel-Generierung laufen automatisiert. Einzige regelmäßige Handarbeit: monatlicher Blick auf ein GitHub-Issue, falls sich Richtwerte ändern. | Code-Recherche |

---

## 2. Variable Kosten pro Verkauf (Unit Economics)

| Posten | Auswertung (9,99 €) | Auswertung + Brief (12,99 €) | Quelle/Herleitung |
|---|---|---|---|
| Stripe-Gebühr (EU-Karte, 1,4 % + 0,25 €) | −0,39 € | −0,43 € | [stripe.com/pricing](https://stripe.com/pricing), aktueller DE-Satz |
| Anthropic-API bei Foto-Erkennung (optional, nicht bei jedem Kauf) | −0,07 bis −0,23 € | −0,07 bis −0,23 € | Schätzung, siehe unten |
| **Netto-Marge pro Verkauf** | **≈ 9,4–9,5 €** | **≈ 12,3–12,5 €** | |

**Anthropic-Schätzung, Herleitung:** `api/analyse-foto.js` nutzt `claude-sonnet-5`, `max_tokens: 20000`. Aktueller Preis: 2 $/Mio. Input-Token, 10 $/Mio. Output-Token ([Anthropic-Doku](https://platform.claude.com/docs/en/about-claude/pricing)). Bei geschätzt 8.000–15.000 Input-Token (mehrere Fotos/PDF-Seiten) und 3.000–8.000 Output-Token (Denken + Tool-Antwort) ergibt sich ca. 0,05–0,15 $, im ungünstigen Fall (nahe am 20.000-Token-Limit) bis ca. 0,23 $. **Das ist eine Schätzung, keine gemessene Zahl** — die echten Kosten kannst du in der Anthropic Console unter "Usage" nachsehen, das würde diese Zahl deutlich verlässlicher machen. Fällt nur an, wenn ein Kunde die optionale Foto-Erkennung nutzt, nicht bei manueller Eingabe.

**Faustregel für den Rest dieses Dokuments:** netto ca. **10 € Marge pro Verkauf**, gerundet und leicht konservativ.

---

## 3. Was mit 1–2 Std./Woche realistisch machbar ist

Das ist die eigentliche Einschränkung, nicht das Geld. Drei Kanäle stehen zur Wahl, mit sehr unterschiedlichem Zeit-/Geld-Verhältnis:

| Kanal | Laufender Zeitaufwand | Laufende Kosten | Realistischer Zeithorizont bis spürbar |
|---|---|---|---|
| **Organische Suche (SEO)** | Faktisch 0 (Artikel entstehen automatisiert) | 0 € | 6–12 Monate, siehe Einschränkung unten |
| **Social Media organisch (FB/Insta)** | ca. 10–20 Min./Woche (copy-paste aus fertigem Kalender) | 0 € | Wochen bis wenige Monate für Reichweite, aber kaum direkte Käufe ohne bestehende Followerschaft |
| **Bezahlte Ads (Meta)** | ca. 20–30 Min. pro Flight (einrichten + Zwischencheck) | Variabel, hier 200 € geplant | Sofort Klicks, aber siehe Break-even-Rechnung unten |

**Wichtiger technischer Befund zur SEO-Einschätzung:** Die Seite ist eine reine Client-seitig gerenderte React-App (Vite/React, kein serverseitiges Rendering). Titel/Beschreibung pro Artikel werden erst per JavaScript im Browser gesetzt (`App.jsx`, `useEffect`), es gibt kein artikelspezifisches strukturiertes Datenmarkup (nur ein globales JSON-LD für die ganze Seite, `index.html`). Das ist technisch ungünstiger für Google-Indexierung als vorgerenderte/serverseitig gerenderte Seiten — Google kann JS-Seiten zwar crawlen, aber langsamer und weniger zuverlässig. Für eine neue Domain ohne Backlinks ohnehin ambitioniert (laut Ahrefs-Daten schaffen es nur ca. 5,7 % neuer Seiten innerhalb eines Jahres in die Top 10, [Quelle](https://webbearsolutions.com/seo-dauer/)) — mit diesem technischen Nachteil eher am unteren Ende dieser Spanne zu erwarten, nicht am oberen.

**Bestätigt durch echte Google Search Console-Daten (13.08.2026, GSC ist bereits eingerichtet):**

| Kennzahl | Wert (letzte 3 Monate) |
|---|---|
| Klicks insgesamt | 16 |
| Impressionen insgesamt | 746 |
| Durchschnittliche CTR | 2,1 % |
| Sitemap eingereicht | Ja, `sitemap.xml`, 15 URLs, Status "Erfolgreich" |
| Indexierte Seiten | 9 von 16 erfassten |
| Nicht indexiert | 7 — davon 2x "Seite mit Weiterleitung" (Validierung fehlgeschlagen), 2x "Alternative Seite mit richtigem kanonischen Tag" (nicht gestartet), 3x "Gefunden – zurzeit nicht indexiert" |

Die Indexierungsprobleme passen genau zum oben beschriebenen technischen Befund: Wenn der kanonische Link-Tag erst per JavaScript gesetzt wird, sieht Googles erster (schneller) Crawl-Durchlauf ihn nicht — das erzeugt exakt solche "kanonischer Tag"-Warnungen.

**Korrektur einer eigenen früheren Einschätzung (13.08.2026):** Hier stand zunächst die Vermutung, mehrere Artikel seien inhaltlich fast dupliziert (Themen-Pool-Bug). Beim genauen Nachschauen in `artikel.js` stimmte das nicht: Nur 2 der 5 verdächtigen Sitemap-Einträge gehörten zu echten, einzigartigen Artikeln. Die anderen 3 waren **verwaiste Sitemap-Einträge ohne zugehörigen Artikel** (vermutlich Testlauf-Reste vom 25./26.07.) — Google listete sie, bekam beim Aufruf aber "Artikel nicht gefunden". Das erklärt die Indexierungsprobleme direkter als eine Inhalts-Dopplung. Details siehe CHANGELOG.md.

**Status "Vorrendern" — umgesetzt (13.08.2026):**

| | |
|---|---|
| **Ziel** | Für jede Artikel-Route beim Build eine eigene statische HTML-Datei mit korrektem Titel/Beschreibung/OG-Tags/kanonischem Link, artikelspezifischem `Article`-JSON-LD UND dem sichtbaren Artikeltext direkt im HTML erzeugen — nicht erst per JS im Browser. |
| **Umsetzung** | `scripts/prerender.mjs` (neu), läuft als Teil von `npm run build`. Getestet mit einer lokalen Testdatei (alle Inhalts-Block-Typen) gegen einen echten Build — Titel/Meta/JSON-LD/sichtbarer Text korrekt erzeugt, React kann beim Laden im Browser normal übernehmen. Kein Framework-Wechsel (kein Next.js/Astro). |
| **Sitemap-Fix** | `scripts/rechtsmonitor.mjs`: Sitemap wird jetzt bei jedem Lauf komplett neu aus der echten Artikelliste aufgebaut statt nur ergänzt — verwaiste Einträge können strukturell nicht mehr entstehen. `public/sitemap.xml` einmalig bereinigt (3 verwaiste Einträge entfernt). |
| **Laufende Kosten** | 0 € — etwas längere Build-Zeit (Sekunden), keine neue Infrastruktur. |
| **Noch zu tun (dein Teil)** | Dateien auf GitHub `main` hochladen, danach in der Google Search Console unter "URL-Prüfung" ein paar Artikel-URLs erneut prüfen lassen. Google braucht danach Tage bis Wochen, bis sich die Indexierung sichtbar ändert. |

---

## 4. Umsatzprognose

Drei Zeiträume, jeweils drei Szenarien. Alle Zahlen sind illustrativ, nicht prognostisch — bei 0 € Traffic-Historie kann das niemand seriös vorhersagen. Sie sollen dir helfen, die Größenordnung einzuschätzen, nicht als Zielvorgabe dienen.

### 3 Monate (bis Mitte November 2026)

Enthält die zwei geplanten Ad-Flights (200 €) + organische Kanäle im Aufbau, SEO zeigt in diesem Zeitraum laut obiger Recherche noch praktisch keine Wirkung.

| Szenario | Verkäufe | Umsatz (brutto) | Marge (≈10 €/Verkauf) | Ad-Ausgabe | Netto-Ergebnis |
|---|---|---|---|---|---|
| Pessimistisch | 0–2 | 0–26 € | 0–20 € | −200 € | **≈ −200 bis −180 €** |
| Mittel | 3–8 | 30–104 € | 30–80 € | −200 € | **≈ −170 bis −120 €** |
| Optimistisch | 9–15 | 90–195 € | 90–150 € | −200 € | **≈ −110 bis −50 €** |

### 6 Monate (bis Mitte Februar 2027)

SEO beginnt laut Recherche frühestens hier erste (kleine) Wirkung zu zeigen, sofern die technische Einschränkung oben nicht behoben wird eher am unteren Ende. Social-Reichweite ist gewachsen, falls durchgehend gepostet wurde.

| Szenario | Verkäufe/Monat (Monate 4–6) | Zusatzumsatz Monate 4–6 | Kumuliert seit Start |
|---|---|---|---|
| Pessimistisch | 0–1 | 0–30 € | weiterhin negativ |
| Mittel | 2–5 | 60–150 € | ungefähr ausgeglichen bis leicht negativ |
| Optimistisch | 5–12 | 150–360 € | leicht positiv |

### 12 Monate

Größte Unsicherheit, aber auch der Zeitraum, in dem SEO laut Recherche "volle Wirkung" entfalten könnte (12–18 Monate laut mehreren SEO-Quellen) — realistisch also eher ein Ausblick auf den Trend als eine belastbare Zahl.

| Szenario | Käufe/Monat (Ende Jahr 1) | Jahresumsatz (grobe Hochrechnung) |
|---|---|---|
| Pessimistisch | 0–2 | unter 300 € |
| Mittel | 3–10 | 500–1.500 € |
| Optimistisch | 10–30 | 1.500–4.500 € |

**Einordnung, damit diese Tabelle nicht zu viel Gewicht bekommt:** Der Markt existiert nachweislich — laut einer zitierten Quelle werden 93 % der Nebenkostenabrechnungen fehlerhaft erstellt, und es gibt bereits zahlende Kunden bei Wettbewerbern (siehe Abschnitt 5). Das heißt: Nachfrage ist grundsätzlich da. Ob NebenkostenRadar davon mit 1–2 Std./Woche Marketing-Aufwand einen relevanten Anteil erreicht, ist die eigentlich offene Frage, keine Frage der Marktexistenz.

---

## 5. Wettbewerb (kurz, zur Einordnung)

| Anbieter | Preis | Modell | Positionierung |
|---|---|---|---|
| **Mineko** | Ab 49 € (Vollprüfung), kostenlose Erstscheinschätzung | Manuelle Expertenprüfung, 24+ Prüfer | Marktführer, teuer, ausführlich (ca. 30-seitiger Bericht) |
| **NebenkostenPro** | 5 € | KI-basiert, Ergebnis in Minuten | Direkter KI-Konkurrent, günstiger als NebenkostenRadar |
| **NebenkostenRadar** | 9,99 € / 12,99 € | KI-basiert, automatisiert | Zwischen NebenkostenPro (billiger) und Mineko (teurer, aber Expertenprüfung) |

([Quelle: Anbietervergleich](https://www.heizkostenchecker.de/blog/nebenkostenabrechnung-pruefen-lassen-anbieter-test), nicht selbst verifiziert, nur eine externe Quelle — bei einer wichtigen Positionierungsentscheidung würde ich das noch mit 1–2 weiteren Quellen gegenchecken.)

Relevant für deine Positionierung: Es gibt bereits einen günstigeren KI-Wettbewerber. "Von Mieter für Mieter" (dein bereits gewählter Vertrauens-Claim) und die Qualität/Verständlichkeit deiner Analyse sind vermutlich wichtigere Differenzierungsmerkmale als der Preis allein — bei 5 € Konkurrenz gewinnst du den Preiskampf nicht.

---

## 6. Break-even-Rechnung: Lohnt sich die 200-€-Kampagne konkret?

Bei ≈10 € Marge/Verkauf brauchst du **ca. 20 zusätzliche, der Kampagne zurechenbare Verkäufe**, um die 200 € wieder hereinzuholen — nicht 20 Klicks, 20 tatsächliche Käufe.

Aus der letzten Rechnung zu dieser Kampagne (siehe frühere Unterhaltung): geschätzt 130–400 Klicks für die 200 €, bei einer für diese Nische nicht verlässlich bekannten Klick-zu-Kauf-Rate. Selbst am oberen Ende plausibler Annahmen (3 % Konversion) kommen dabei ca. 4–12 Käufe heraus — **das reicht im optimistischen Fall nicht ganz, im mittleren/pessimistischen Fall deutlich nicht, um die reinen Ad-Kosten wieder hereinzuholen.**

Das heißt nicht zwangsläufig "nicht sinnvoll" — es heißt: **als reine Direktumsatz-Rechnung ist ein Verlust der wahrscheinlichere Ausgang als ein Gewinn.** Was die Kampagne zusätzlich bringt, aber schwer in Euro zu fassen ist: Sichtbarkeit/Reichweite (Leute sehen die Marke, kaufen vielleicht später oder empfehlen weiter), Traffic für Google (kann SEO indirekt leicht helfen), und Lerndaten (welches Creative/welche Zielgruppe funktioniert, falls du später nochmal Budget einsetzt). Ob dir das die wahrscheinliche Differenz von 50–150 € wert ist, ist eine Entscheidung, die nur du treffen kannst — ich kann dir die Zahlen liefern, aber keine Kauf-/Investitionsempfehlung geben.

---

## 7. Konkreter Zeitplan für 1–2 Std./Woche

| Wann | Aufgabe | Dauer |
|---|---|---|
| Einmalig, diese Woche | Flight 1 der Meta-Kampagne einrichten (Anleitung liegt bereit) | 30–45 Min. |
| Einmalig, diese Woche | Erster LinkedIn-Post (Auftakt/Logbuch-Ankündigung, Text liegt fertig bereit — siehe Abschnitt 8) | 5 Min. (nur einfügen) |
| 2x/Woche, laufend | Nächsten Post aus `content-kalender.md` kopieren, auf FB/Insta einfügen | 10 Min./Post |
| Alle 1–2 Wochen, laufend | LinkedIn-Logbuch-Post: was diese Woche passiert ist, welches Problem gelöst wurde (siehe Abschnitt 8 für Format) | 15–20 Min./Post |
| 1x/Monat | GitHub-Issue prüfen, falls Richtwerte-Monitor eine Abweichung meldet | 10–15 Min., nur wenn ein Issue existiert |
| Anfang September | Zwischencheck Flight 1 (CPC/Klicks vergleichen), Flight 2 nur mit Sieger-Creative einrichten | 20–30 Min. |
| Ab November, optional | Erste SEO-Wirkung prüfen (Google Search Console einrichten, falls noch nicht geschehen — nicht im Code gefunden, vermutlich noch offen) | einmalig 20 Min. Einrichtung, danach 5 Min./Monat Blick auf Zahlen |

Das ist mit 1–2 Std./Woche im Rahmen deiner Zeitangabe machbar, mit Luft für Ausnahmen.

---

## 8. Zusätzliche Sichtbarkeits-Kanäle (13.08.2026, auf Stefans Wunsch ergänzt)

Bisher deckt dieser Plan SEO, organisches Social und Meta-Ads ab. Das ist zu eng — hier weitere Wege, mit Zeitaufwand und Einordnung, ob sie zu 1–2 Std./Woche passen.

| Kanal | Zeitaufwand | Einordnung |
|---|---|---|
| **LinkedIn (persönlich)** | 15–30 Min./Woche, 1 Post | Du hast das Projekt bereits in deiner Vita stehen — nutze das. "Building in public"-Posts (was du baust, warum, was du dabei lernst, echte Zahlen wie die GSC-Daten oben) funktionieren auf LinkedIn gut und passen zu einem Soloprojekt neben dem Hauptjob. Andere Zielgruppe als Insta/FB: eher beruflich interessierte Kontakte, potenziell auch Multiplikatoren (Personaler, die das an Mitarbeitende weitergeben, andere Solo-Gründer). Aufwand gering, da du bereits schreibst (Content-Kalender-Texte lassen sich mit wenig Anpassung auf LinkedIns reflektierenderen Ton umschreiben). |
| **In bestehenden Vergleichsartikeln gelistet werden** | Einmalig 30–60 Min. (E-Mails schreiben) | Es gibt bereits mindestens einen "5 Anbieter im Test"-Vergleichsartikel (heizkostenchecker.de, siehe Abschnitt 5), der Mineko und NebenkostenPro nennt, aber nicht NebenkostenRadar. Kurze E-Mail an solche Seiten mit Bitte um Aufnahme — bringt im besten Fall echten Backlink (gut für SEO) + direkten qualifizierten Traffic. Kein Erfolg garantiert, aber fast kostenlos im Aufwand. |
| **Reddit r/mietrecht, Facebook-Mietrecht-Gruppen** | 10–15 Min./Woche | Bereits im Content-Kalender als Idee notiert, aber noch nicht wirklich bespielt. Nicht den Link posten — auf echte Fragen antworten, Tool nur erwähnen, wenn es wirklich passt. Baut Vertrauen auf, bevor du wirbst. |
| **Eigene Geschichte als Content** | Kein Zusatzaufwand, nur Blickwinkel-Änderung | Du wohnst selbst zur Miete, das Tool kam aus einem echten Problem — dieser persönliche Winkel ist bisher nur im "Von Mieter für Mieter"-Ad-Claim genutzt, nicht in Long-Form-Content (LinkedIn-Artikel, Ratgeber-Intro). Authentische Gründer-Geschichten performen oft besser als reine Produkt-Posts, gerade auf LinkedIn. |
| **Lokale Frankfurt-Presse** | 1–2 Std. einmalig (Recherche + Anschreiben) | Deine reale Abrechnung (ABG Frankfurt, Kupferhammer 35) plus die Statistik "93 % fehlerhaft" sind eine nachvollziehbare, lokal verankerte Geschichte für Frankfurter Lokalmedien/Wirtschaftsblogs. Kein garantierter Erfolg, aber geringer Aufwand für potenziell hohe Reichweite auf einen Schlag. |

Das sind Vorschläge, keine Zusagen — welche davon zu deiner Zeit und deinem Geschmack passen, entscheidest du. Ich würde LinkedIn und die Vergleichsartikel-E-Mails als die zwei mit dem besten Aufwand-Nutzen-Verhältnis einstufen.

### LinkedIn — Schritt für Schritt (13.08.2026, auf Stefans Wunsch konkretisiert)

**Format, das auf LinkedIn funktioniert (anders als Insta/FB):** Kein Bild nötig, reiner Text reicht. Erste 2–3 Zeilen sind der Hook (LinkedIn blendet den Rest hinter "…mehr anzeigen" aus) — die wichtigste Aussage gehört an den Anfang. Kurze Absätze, Leerzeilen zwischen Gedanken. Kaum Hashtags (2–3 reichen, nicht 10+). Kein Verkaufston — auf LinkedIn wirkt "ich baue/lerne gerade etwas" glaubwürdiger als "kauft mein Produkt".

**Alle Post-Texte (Post 1 überarbeitet + 6 weitere, copy-paste-fertig) liegen jetzt in einer eigenen Datei: `marketing/linkedin-logbuch.md`.** Ausgelagert, damit dieses Dokument nicht mit Post-Texten überfrachtet wird und du dort laufend neue Posts ergänzen kannst, ohne den Businessplan anzufassen.

**Durchgehende Schiene der ganzen Serie (13.08.2026 präzisiert):** nicht "Umsatz/Produktlaunch", sondern das Experiment, wie weit man mit KI kommt, wenn man selbst kein Entwickler, Marketer oder Jurist ist — und wie stark gutes Prompten den Unterschied macht. Post 1 stellt das jetzt explizit voran.

Die 6 neuen Posts (2–7) sind reale, bereits gemeisterte Hürden aus diesem Projekt — der Live-Timeout-Bug, der doppelt gefixte CO2-Kosten-Bug (deine eigene Abrechnung), die unterschätzte Widerrufsrecht-Pflicht, die falsche erste Vermutung bei den Google-Indexierungsproblemen (echte Ursache: tote Sitemap-Links + reine JS-Rendering), der Kurswechsel kurz vor dem geplanten Start (Handeingabe erwies sich als unbrauchbar, weil jede Abrechnung anders aufgebaut ist → Umbau auf Foto-/PDF-Upload), und die konkreten Schritte für organisches Wachstum ohne Werbebudget (Ratgeber-Artikel, Vorrendern, Sitemap-Bereinigung). Jeweils ~80–120 Wörter, gleicher direkter Ton wie Post 1. Bewusst kein Post zu Break-even/Werbebudget-Kalkulation — das passt nicht zur "Lernen mit KI"-Schiene und bleibt intern in Abschnitt 6.

**Kadenz, laufend (alle 1–2 Wochen, nicht starr):** Nach den 6 vorbereiteten Posts dokumentiert jeder weitere Post einen echten neuen Schritt — die Rohstoffe liefert dieses Projekt laufend von selbst, kurz zusammenfassen reicht.

## 9. Einordnung: 250–1.000 Verkäufe/Jahr — realistisch?

Deine Ansage: mittelfristig 250–1.000 Verkäufe/Jahr als Nebeneinkommen, kein Ersatz für den Hauptjob, Lernen steht über allem. Ehrliche Einordnung mit der Marge aus Abschnitt 2 (≈10 €/Verkauf):

| Ziel | Verkäufe/Monat | Nötige Besucher/Monat (bei 1–3 % Kauf-Conversion, eigene Schätzung, keine Branchenzahl für diese Nische verfügbar) | Einordnung |
|---|---|---|---|
| 250/Jahr | ≈ 21 | ≈ 700–2.100 | Ambitioniert, aber nicht unrealistisch als 18–24-Monats-Ziel, wenn SEO nach den in Abschnitt 3 recherchierten Zeiträumen (6–12 Monate erste Wirkung) tatsächlich greift und LinkedIn/Vergleichsartikel/Presse einzelne Traffic-Spitzen bringen. Aktuell (16 Klicks in 3 Monaten organisch) ist das noch weit weg — die Vorrendern-Fixes von heute sollen genau diese Lücke schließen. |
| 1.000/Jahr | ≈ 83 | ≈ 2.800–8.300 | Deutlich ambitionierter. Bei 1–2 Std./Woche ohne nennenswertes laufendes Ad-Budget realistisch nur erreichbar, wenn entweder (a) SEO auf einem oder mehreren Begriffen mit spürbarem Suchvolumen wirklich gut rankt, was Jahre dauern kann, nicht Monate, oder (b) ein einzelnes Ereignis (Presseartikel, viraler Post, Aufnahme in einen stark frequentierten Vergleichsartikel) einen dauerhaften Traffic-Sockel hinterlässt. Mit deutlich mehr Ad-Budget (nicht 200 €, eher vierstellig/Jahr) wäre es planbarer erreichbar — das widerspräche aber deinem aktuellen Kosten-Rahmen. |

**Kurz:** 250/Jahr halte ich für ein plausibles, ambitioniertes Zwischenziel auf Sicht von 1,5–2 Jahren, wenn die technischen SEO-Fixes wirken und du 1–2 der oben genannten Zusatzkanäle wirklich bespielst. 1.000/Jahr würde ich eher als Vision für "wenn alles gut läuft" einordnen als als Planungsgrundlage — nicht unmöglich, aber mit den aktuellen Mitteln (Zeit, Budget) nicht zuverlässig herbeiführbar. Das ist keine Absage, nur eine ehrliche Erwartungssteuerung: Bei einer Seite ohne jede Traffic-Historie sind das Schätzungen aus Marktlogik, keine Prognose mit Gewähr.

## 10. Offene Punkte, die diese Prognose genauer machen würden

- **Echte Anthropic-API-Kosten** aus der Console statt meiner Schätzung (Abschnitt 2).
- ~~Google Search Console~~ — erledigt, bereits eingerichtet, echte Daten in Abschnitt 3 eingearbeitet (13.08.2026).
- ~~Technische SEO-Verbesserung (Vorrendern)~~ — umgesetzt (13.08.2026), siehe Abschnitt 3. Muss noch von dir auf GitHub `main` hochgeladen werden.
- ~~`src/artikel.js` fehlt lokal~~ — geprüft (13.08.2026): Die Datei existiert auf GitHub `main` mit vollem Inhalt (9 echte Artikel, zuletzt am 01.08. aktualisiert) — die automatische Generierung läuft. Sie fehlt nur in deinem lokalen iCloud-Ordner, weil der GitHub-Action-Bot direkt auf GitHub committet, nicht über deinen lokalen Upload-Workflow. Kein Problem, nur zur Kenntnis: dein lokaler Ordner ist bei automatisch generierten Dateien nicht automatisch aktuell.
