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

Die 6 neuen Posts (2–7) sind chronologisch nach dem tatsächlichen Zeitpunkt der jeweiligen Geschichte sortiert, nicht nach Post-Nummer-Belieben: der Kurswechsel kurz vor dem geplanten Start (Handeingabe erwies sich als unbrauchbar, weil jede Abrechnung anders aufgebaut ist → Umbau auf Foto-/PDF-Upload, früheste Geschichte), der doppelt gefixte CO2-Kosten-Bug (12.–13.08.), der Live-Timeout-Bug (13.08.), die unterschätzte Widerrufsrecht-Pflicht (13.08.), die falsche erste Vermutung bei den Google-Indexierungsproblemen (13.08., echte Ursache: tote Sitemap-Links + reine JS-Rendering), und zuletzt die konkreten, aktuellen Schritte für organisches Wachstum ohne Werbebudget (Ratgeber-Artikel, Vorrendern, Sitemap-Bereinigung). Jeder Post endet mit einer offenen Frage zum Erfahrungsaustausch statt nur zu senden. Jeweils ~80–120 Wörter, gleicher direkter Ton wie Post 1. Bewusst kein Post zu Break-even/Werbebudget-Kalkulation — das passt nicht zur "Lernen mit KI"-Schiene und bleibt intern in Abschnitt 6.

**Kadenz, laufend (alle 1–2 Wochen, nicht starr):** Nach den 6 vorbereiteten Posts dokumentiert jeder weitere Post einen echten neuen Schritt — die Rohstoffe liefert dieses Projekt laufend von selbst, kurz zusammenfassen reicht.

## 9. Einordnung: 250–1.000 Verkäufe/Jahr — realistisch?

Deine Ansage: mittelfristig 250–1.000 Verkäufe/Jahr als Nebeneinkommen, kein Ersatz für den Hauptjob, Lernen steht über allem. Ehrliche Einordnung mit der Marge aus Abschnitt 2 (≈10 €/Verkauf):

| Ziel | Verkäufe/Monat | Nötige Besucher/Monat (bei 1–3 % Kauf-Conversion, eigene Schätzung, keine Branchenzahl für diese Nische verfügbar) | Einordnung |
|---|---|---|---|
| 250/Jahr | ≈ 21 | ≈ 700–2.100 | Ambitioniert, aber nicht unrealistisch als 18–24-Monats-Ziel, wenn SEO nach den in Abschnitt 3 recherchierten Zeiträumen (6–12 Monate erste Wirkung) tatsächlich greift und LinkedIn/Vergleichsartikel/Presse einzelne Traffic-Spitzen bringen. Aktuell (16 Klicks in 3 Monaten organisch) ist das noch weit weg — die Vorrendern-Fixes von heute sollen genau diese Lücke schließen. |
| 1.000/Jahr | ≈ 83 | ≈ 2.800–8.300 | Deutlich ambitionierter. Bei 1–2 Std./Woche ohne nennenswertes laufendes Ad-Budget realistisch nur erreichbar, wenn entweder (a) SEO auf einem oder mehreren Begriffen mit spürbarem Suchvolumen wirklich gut rankt, was Jahre dauern kann, nicht Monate, oder (b) ein einzelnes Ereignis (Presseartikel, viraler Post, Aufnahme in einen stark frequentierten Vergleichsartikel) einen dauerhaften Traffic-Sockel hinterlässt. Mit deutlich mehr Ad-Budget (nicht 200 €, eher vierstellig/Jahr) wäre es planbarer erreichbar — das widerspräche aber deinem aktuellen Kosten-Rahmen. |

**Kurz:** 250/Jahr halte ich für ein plausibles, ambitioniertes Zwischenziel auf Sicht von 1,5–2 Jahren, wenn die technischen SEO-Fixes wirken und du 1–2 der oben genannten Zusatzkanäle wirklich bespielst. 1.000/Jahr würde ich eher als Vision für "wenn alles gut läuft" einordnen als als Planungsgrundlage — nicht unmöglich, aber mit den aktuellen Mitteln (Zeit, Budget) nicht zuverlässig herbeiführbar. Das ist keine Absage, nur eine ehrliche Erwartungssteuerung: Bei einer Seite ohne jede Traffic-Historie sind das Schätzungen aus Marktlogik, keine Prognose mit Gewähr.

## 10. Recherche: Steuer-Modul (§ 35a EStG) als Zusatzfunktion (14.08.2026, auf Stefans Anfrage)

Deine These: Mieter können Teile der Nebenkostenabrechnung steuerlich geltend machen (§ 35a EStG), kaum jemand weiß das, kein Tool berechnet den konkreten Vorteil, das ließe sich als Upsell-Modul (Einmalkauf ~4,99 €) direkt an NKR andocken, mit minimalem Zusatzaufwand, da die Upload-/Erkennungs-Architektur schon existiert. Geprüft: rechtliche Grundlage, Wettbewerbslage, technische Machbarkeit, rechtliches Risiko. Ergebnis vorweg: Grundidee trägt, zwei deiner Annahmen stimmen aber nicht — dazu unten mehr.

**Zur mitgeschickten Quelle:** Der verlinkte KPMG-Artikel behandelt die österreichische Mietpreisbremse für Altbauten 2025 — inhaltlich ohne jeden Bezug zu § 35a EStG oder deutschem Steuerrecht. Vermutlich versehentlich der falsche Link, für diese Recherche nicht verwertbar.

### 10.1 Rechtliche Grundlage — was Primärquellen belegen

| Kategorie | Rechtsgrundlage | Steuerermäßigung | Höchstbetrag/Jahr |
|---|---|---|---|
| Haushaltsnahe Dienstleistungen | § 35a Abs. 2 EStG | 20 % der Arbeitskosten | 4.000 € |
| Handwerkerleistungen | § 35a Abs. 3 EStG | 20 % der Arbeitskosten | 1.200 € |

Fakten, primärquellengestützt:
- Nur **Arbeits-, Fahrt- und Maschinenkosten** sind begünstigt, **keine Materialkosten** — die Abrechnung müsste beides getrennt ausweisen ([juraforum.de, Gesetzestext § 35a EStG](https://www.juraforum.de/gesetze/estg/35a-steuerermaessigung-bei-aufwendungen-fuer-haushaltsnahe-beschaeftigungsverhaeltnisse-haushaltsnah)).
- Die Ermäßigung wird **direkt von der Steuerschuld abgezogen**, nicht vom zu versteuernden Einkommen — deutlich wirksamer als ein Werbungskostenabzug.
- **BFH-Urteil vom 20.04.2023, VI R 24/20** ([bundesfinanzhof.de](https://www.bundesfinanzhof.de/en/entscheidungen/entscheidungen-online/decision-detail/STRE202310138/)): Mieter können § 35a EStG auch geltend machen, wenn sie die Verträge mit den Dienstleistern nicht selbst abgeschlossen haben. Als Nachweis genügt regelmäßig die **Nebenkostenabrechnung selbst** (oder eine gesonderte Vermieterbescheinigung), **sofern die begünstigten Positionen und deren Arbeitskostenanteil gesondert ausgewiesen sind** — "es sei denn, es drängen sich Zweifel an deren Richtigkeit auf".
- Der Vermieter ist **nicht gesetzlich verpflichtet**, eine gesonderte Bescheinigung auszustellen, muss aber auf Anfrage Auskunft geben; in der Praxis stellen die meisten Hausverwaltungen das auf Anfrage aus ([mineko.de-Ratgeber](https://www.mineko.de/ratgeber/nebenkosten-steuererklaerung)).

Typischerweise begünstigte vs. ausgeschlossene Positionen (Abgleich mehrerer Quellen, s.u.):

| Begünstigt (Arbeitskostenanteil) | Nicht begünstigt |
|---|---|
| Hausmeister/Hauswart | Grundsteuer |
| Gartenpflege | Gebäudeversicherung |
| Treppenhaus-/Hausreinigung | Müllabfuhr als solche |
| Winterdienst/Schneeräumung | reine Energiekosten (Gas, Öl, Fernwärme) |
| Schornsteinfeger (seit BMF-Schreiben 10.11.2015 **auch** Mess-/Prüfarbeiten, nicht mehr nur Kehrarbeiten — BFH-Urteil 06.11.2014 hatte das vorher eingeschränkt) | Verwaltungskosten |
| Wartung Heizung/Aufzug/Rauchmelder | Materialanteil jeder Position |
| Ungezieferbekämpfung, Dachrinnen-/Rohrreinigung | — |

Quellen: [nebenkostenpro.de-Ratgeber](https://nebenkostenpro.de/ratgeber/nebenkosten-steuererklaerung), [mineko.de-Ratgeber](https://www.mineko.de/ratgeber/nebenkosten-steuererklaerung), [lohnsteuer-kompakt.de zu Schornsteinfeger](https://www.lohnsteuer-kompakt.de/steuerwissen/schornsteinfeger-kosten-wieder-voll-abzugsfaehig/).

**Offen/nicht abschließend geklärt:** Ob unser bestehendes `hauswart`-Feld in `analyse.js` ("nur Betriebskostenanteile") schon sauber vom nicht-umlagefähigen Verwaltungsanteil getrennt ist, reicht für die BetrKV-Prüfung — für § 35a bräuchte es zusätzlich die Trennung Arbeits- vs. Materialkosten, die in keiner der beiden Prüfungen bisher erfasst wird (siehe 10.3).

### 10.2 Wettbewerbslage — deine Annahme "das bietet noch niemand an" trifft so nicht zu

Direkt geprüft (Live-Fetch der Seiten, nicht nur Suchergebnis-Snippets):

**NebenkostenPro hat dieses Feature bereits produktiv im Einsatz.** Auf `nebenkostenpro.de/ratgeber/nebenkosten-steuererklaerung` liegt ein vollständiger, interaktiver § 35a-Rechner: Nutzer geben "Haushaltsnahe Dienstleistungen – nur Arbeitskosten" und "Handwerkerleistungen – nur Lohnanteil" ein, der Rechner zeigt die Steuerermäßigung live. Zusätzlich wirbt die Seite ausdrücklich: "Unsere KI erkennt absetzbare Positionen in Ihrer Nebenkostenabrechnung und zeigt Ihre Prüfpunkte" — inklusive ELSTER-Feldzuordnung (Zeile 5/6 der Haupterklärung) und Rechtsgrundlagen-Hinweis auf BFH VI R 24/20. Das ist inhaltlich fast deckungsgleich mit deiner Modul-Idee.

**Mineko** hat zum selben Thema nur einen informativen Ratgeber-Artikel (seit 2023, zuletzt aktualisiert 03/2026) — Empfehlung, beim Vermieter eine Bescheinigung anzufordern, aber kein Hinweis auf einen interaktiven Rechner oder eine automatische Erkennung in ihrem eigenen Prüf-Flow.

**Einordnung:** Das Feature ist damit kein Alleinstellungsmerkmal, sondern beim direktesten Wettbewerber (NebenkostenPro) bereits Marktstandard. Sinnvoll bleibt es trotzdem — aber als **Aufholen zur Konkurrenz**, nicht als Abgrenzung. Die Kommunikation "damit heben wir uns ab" wäre auf dieser Faktenlage nicht haltbar.

### 10.3 Technische Machbarkeit — was der bestehende Code schon hergibt

Geprüft: `api/analyse-foto.js`, `src/lib/analyse.js`.

**Guter Ausgangspunkt, unerwartet vorhanden:** Das Feld `zeilenErfasst` im Foto-Erkennungs-Schema erfasst schon heute **jede einzelne Kostenzeile mit Originalbezeichnung** (`bezeichnungLautAbrechnung`) und Betrag, bevor irgendeine Zuordnung zu unseren BetrKV-Kategorien passiert (eingeführt 08/2026 gegen Fehlzuordnungen, siehe CHANGELOG). Diese Rohdaten werden aktuell nur als Zwischenschritt genutzt und nicht an die UI durchgereicht — für ein Steuer-Modul wäre genau das aber die Grundlage, um Positionen wie "Kaminkehrer Kehrgebühr 2025" oder "Winterdienst Nov-Mär" texterkennbar zu identifizieren.

**Bestehende Kategorie-Keys decken die meisten § 35a-relevanten Positionen bereits ab:** `hauswart`, `gartenpflege`, `hausreinigung`, `schnee_eis_beseitigung`, `schornsteinreinigung`, `aufzug`, `heizung_wartung`, `rauchwarnmelder_wartung` — praktisch deckungsgleich mit der Liste in 11.1.

**Echte Lücke:** Keiner dieser Keys trennt bisher Arbeits-/Lohnkosten von Materialkosten — genau die Trennung, die § 35a verlangt. Die Nebenkostenabrechnung selbst weist das oft nicht getrennt aus (siehe 11.1, "muss Vermieter auf Anfrage liefern"). Ein Modul, das den vollen Kategorie-Betrag pauschal mit 20 % multipliziert, würde den Steuervorteil systematisch **überschätzen** — ein Zahlenfehler in einem Bereich, den Nutzer direkt gegenüber dem Finanzamt verwenden. Bei deinem eigenen Prinzip "0-Fehler-Toleranz bei Zahlen" (siehe `richtwerte-monitor.mjs`) wäre das nicht akzeptabel.

**Pragmatische Lösung, orientiert an NebenkostenPro:** Nicht den vollen Betrag automatisch als Steuervorteil ausweisen, sondern das automatisch erkannte Kategorie-Ergebnis als **vorbefüllten, aber vom Nutzer zu bestätigenden Ausgangswert** anzeigen ("Wir haben X € Gartenpflege gefunden — wie viel davon ist laut deiner Abrechnung/Bescheinigung reiner Arbeitslohn?"), Endberechnung erst nach Nutzereingabe. Reduziert sowohl das Zahlenfehler-Risiko als auch — siehe 10.4 — das rechtliche Risiko.

### 10.4 Rechtliches Risiko: Steuerberatungsgesetz (§ 5 StBerG)

Nicht in deiner Anfrage erwähnt, aber relevant: **§ 5 StBerG verbietet die unbefugte geschäftsmäßige Hilfeleistung in Steuersachen** ([juraforum.de](https://www.juraforum.de/gesetze/stberg/5-verbot-der-unbefugten-hilfeleistung-in-steuersachen-missbrauch-von-berufsbezeichnungen)). § 6 Nr. 3 StBerG erlaubt zwar "mechanische Rechenarbeiten" ohne besondere Qualifikation, individuelle steuerliche Beurteilung des Einzelfalls bleibt aber Steuerberatern vorbehalten.

**Wie der direkte Wettbewerber das offenbar löst:** NebenkostenPro positioniert sein Modul explizit als "**reine Rechenhilfe, keine Steuerberatung**: ob und in welcher Höhe die Ermäßigung im Einzelfall greift, hängt von Ihrer Steuererklärung ab" — verbunden mit dem Hinweis, dass Ergebnisse automatisiert per KI erstellt werden, ohne Gewähr. Diese Positionierung (reine Berechnung nach öffentlich bekannten Prozentsätzen/Höchstbeträgen, keine Aussage zum Einzelfall, keine Übernahme der Steuererklärung) scheint in dieser Nische verbreitet akzeptierte Praxis zu sein.

**Einordnung, keine Rechtsberatung:** Ein NKR-Steuer-Modul nach demselben Muster (reine Prozentrechnung, expliziter Hinweis "keine Steuerberatung", keine Übernahme der Steuererklärung, kein automatischer ELSTER-Export) bewegt sich vermutlich im selben, in der Praxis akzeptierten Rahmen wie bei NebenkostenPro. Eine Garantie dafür kann ich nicht geben — bei einem Produkt mit direktem Bezug zur Steuererklärung würde sich, genau wie beim Widerrufsrecht in Abschnitt zu den Rechtstexten, eine kurze anwaltliche Prüfung der genauen Formulierung lohnen, bevor das Modul live geht.

### 10.5 Einschätzung

Grundidee bleibt sinnvoll: niedriger Zusatzaufwand (die Roh-Erkennung existiert bereits), passt zur bestehenden Architektur, kein neues Produkt, keine neue Zielgruppe — deine Einschätzung "günstigster Zusatzumsatz" stimmt der Größenordnung nach. Zwei Korrekturen an der Ausgangsthese: Es ist kein Alleinstellungsmerkmal (10.2), und die reine Kategorie-Summe reicht ohne Lohn-/Material-Abfrage nicht für eine belastbare Zahl (10.3) — beides ändert nichts an der Machbarkeit, nur an der Kommunikation ("wir bieten das jetzt auch" statt "das bietet sonst niemand") und am nötigen Umsetzungsschritt (ein zusätzliches Eingabefeld statt reiner Automatik).

**Zu deiner Preisfrage:** Ob 4,99 € on top realistisch sind, konnte ich nicht verifizieren — unklar, ob NebenkostenPro dieses Feature separat bezahlt anbietet oder kostenlos in den bestehenden Prüf-Flow integriert (auf der Seite selbst kein Preis für das Steuer-Modul sichtbar, nur der allgemeine Prüf-Flow). Bevor du einen Preis festlegst, lohnt sich ein kurzer Blick, ob NebenkostenPro das Modul kostenlos als Lead-Magnet nutzt — falls ja, würde ein separater Aufpreis bei uns im Vergleich auffallen.

## 11. Offene Punkte, die diese Prognose genauer machen würden

- **Echte Anthropic-API-Kosten** aus der Console statt meiner Schätzung (Abschnitt 2).
- ~~Google Search Console~~ — erledigt, bereits eingerichtet, echte Daten in Abschnitt 3 eingearbeitet (13.08.2026).
- ~~Technische SEO-Verbesserung (Vorrendern)~~ — umgesetzt (13.08.2026), siehe Abschnitt 3. Muss noch von dir auf GitHub `main` hochgeladen werden.
- ~~`src/artikel.js` fehlt lokal~~ — geprüft (13.08.2026): Die Datei existiert auf GitHub `main` mit vollem Inhalt (9 echte Artikel, zuletzt am 01.08. aktualisiert) — die automatische Generierung läuft. Sie fehlt nur in deinem lokalen iCloud-Ordner, weil der GitHub-Action-Bot direkt auf GitHub committet, nicht über deinen lokalen Upload-Workflow. Kein Problem, nur zur Kenntnis: dein lokaler Ordner ist bei automatisch generierten Dateien nicht automatisch aktuell.

## 12. Presse-Anfrage: sinnvoll, und wenn ja, wie? (14.08.2026)

**Aktueller Nachrichten-Hook, verifiziert:** Für 2026 wechselt der CO2-Preis von einem Festpreis auf ein Auktionssystem mit Preiskorridor 55–65 €/Tonne, zusätzlich sollen künftig auch Netzentgelte/Biogasaufschläge hälftig zwischen Vermieter und Mieter aufgeteilt werden — beides treibt die Heizkosten in den 2026er-Abrechnungen weiter nach oben (Nebenkosten stiegen bereits 2024 um 6 % auf 2,67 €/m²/Monat). Das ist ein echter, aktuell laufender Aufhänger für ein Presse-Thema — nicht erfunden, nicht saisonal aus der Luft gegriffen ([nebenkosten-assistent.de, Heizkostenverordnung 2026](https://www.nebenkosten-assistent.de/wissen/heizkostenverordnung-2026-diese-aenderungen-musst-du-kennen), [calvest.de, CO2-Steuer 2026](https://calvest.de/nebenkosten-explosion-2026-was-auf-immobilienbesitzer-zukommt/)).

**Bild direkt anzuschreiben: aktuell nicht realistisch.** Keine Hinweise gefunden, dass Bild dieses Thema in der Vergangenheit redaktionell besetzt hat, und ohne Nutzerzahlen, eigene Auswertungsdaten ("X% aller geprüften Abrechnungen enthalten Fehler Y") oder bestehenden Presse-Track-Record ist die Chance auf eine Antwort einer Redaktion dieser Größe sehr gering. Aktuell: 16 Klicks in 3 Monaten organisch — keine Grundlage für eine "wir haben tausende Abrechnungen ausgewertet"-Story, die eine große Redaktion bräuchte.

**Realistischerer Vergleichsfall:** Mineko (der etablierte Wettbewerber) wurde ab 2015 in Gründerszene, FOCUS Online, FAZ und Handelsblatt erwähnt — dort aber über die **Startup-Szene-Schiene** (Gründerszene, deutsche-startups.de berichten aktiv über neue Tools/Gründungen, gerade mit persönlicher Geschichte), nicht über eine Kaltakquise beim Boulevard. Das ist ein deutlich niedrigerer Einstieg als Bild ([deutsche-startups.de, Mineko-Historie](https://www.deutsche-startups.de/tag/mineko/)).

**Empfehlung:** Nicht Bild zuerst. Stattdessen: (1) 1–2 Startup-Szene-Blogs (deutsche-startups.de, Gründerszene) mit genau der Geschichte anschreiben, die schon im LinkedIn-Logbuch steht (Produktmanager baut nebenbei ein Tool, lernt KI-gestützt Recht/Marketing/Programmieren) plus dem aktuellen CO2-Kosten-Hook als Nachrichtenanlass. (2) Lokale Frankfurt-Presse (bereits in Abschnitt 8 vorgeschlagen) — niedrigere Hürde, regionaler Bezug vorhanden. (3) Bild/große Publikumsmedien erst, wenn es echte Nutzerzahlen oder eine Auswertungsstatistik als Aufhänger gibt — dann aber mit besseren Erfolgsaussichten. Pitch-Grundregel dabei: kurz, auf der Meta-Ebene (gesellschaftliche/wirtschaftliche Relevanz), nicht werblich ([Cision-Whitepaper zu Medien-Pitches](https://www.cision.com/content/dam/cision/Cision-Whitepaper-Themen-richtig-pitchen-NEW-DESIGN.pdf)).

## 13. Aufrechnung: Arbeitsstunden, Potential, Marktwert (14.08.2026)

**Methodik, vorab transparent gemacht:** Es gibt kein Zeit-Tracking für dieses Projekt — weder für deine noch für meine tatsächlich aufgewandte Zeit. Was folgt, ist deshalb KEINE Abrechnung geleisteter Stunden, sondern eine Schätzung des **Wiederbeschaffungswerts**: wie viele Personenstunden zu marktüblichen deutschen Freelancer-/Beratungssätzen es gekostet hätte, exakt das zu bauen, was laut `CHANGELOG.md` tatsächlich entstanden ist — wenn du dafür Freelancer/eine Kanzlei bezahlt hättest, statt es KI-gestützt selbst zu begleiten. Grundlage: die rund 60 datierten CHANGELOG-Einträge (13.06.–14.08.2026), nach Themenblöcken gruppiert. Stundenzahlen sind Schätzungen aus dem Umfang der jeweiligen Einträge, keine exakte Messung — wo die Spannbreite groß ist, sage ich das.

| Themenblock | Was tatsächlich entstanden ist (Auszug) | Geschätzte Std. | Marktsatz (Quelle) | Wert |
|---|---|---|---|---|
| Architektur & Grundgerüst | Modularer Neuaufbau (config/lib/components/pages/pdf), Design-System, mehrstufiges Formular, Routing | 50 | 100 €/h (Full-Stack, Mid-Senior) | 5.000 € |
| Foto-/PDF-Erkennung (KI) | Tool-Use-Umstellung, mehrere Effort-Level-Experimente, Zwei-Schritt-Schema gegen Fehlzuordnung, Rate-Limiting, Timeout-Fix, diverse Erkennungsbugs | 40 | 110 €/h (Full-Stack + KI-Integration) | 4.400 € |
| Prüf-Engine / Berechnungslogik | BetrKV-Kategorien, DMB-Richtwerte-Abgleich, HeizkostenV 50/70-Regel, CO2KostAufG, Versicherungs-Splits, Fristprüfung § 556 BGB, Steuer-Bonus-Logik | 35 | 95 €/h (Full-Stack + Domain-Recherche) | 3.325 € |
| PDF-Erzeugung | Prüfbericht, Musterbrief, Steuer-Bonus-Seite, Font-Bug, DIN-5008-Layout | 18 | 85 €/h (Full-Stack Mid) | 1.530 € |
| Kundenkonto & Zahlungsabwicklung | Stripe, Supabase Auth/Magic-Link, E-Mail-Versand, Rabatt-Automatisierung, Keep-Alive, Datenlöschung, GitHub-Actions | 30 | 95 €/h (Backend/Infra) | 2.850 € |
| Rechtstexte & DSGVO | AGB, Datenschutzerklärung, Widerrufsbelehrung (§ 356 Abs. 5 BGB), SCC-Klauseln, mehrere DSGVO-Audits, StBerG-Einordnung | 18 | 200 €/h (IT-/Datenschutzrecht, Schätzung — Marktspanne 150–350 €/h, keine belastbare Durchschnittsquelle gefunden) | 3.600 € |
| SEO & Content-Automatisierung | Ratgeber-Generator, Vorrendern, Sitemap-Fix, Richtwerte-Monitor, GSC-Auswertung | 16 | 90 €/h (Full-Stack + SEO) | 1.440 € |
| Marketing & Design | Meta-Kampagne (Anzeigen, FB/Insta-Bildmaterial, Content-Kalender), Farbschema/Fonts, LinkedIn-Logbuch (7 Posts) | 22 | 82 €/h (Grafik/Content, DACH-Schnitt) | 1.804 € |
| Business-Strategie & Recherche | Businessplan, Umsatzprognose, Wettbewerbsanalyse, Steuer-Bonus-Marktrecherche inkl. Primärquellen | 15 | 120 €/h (Strategieberatung) | 1.800 € |
| QA aus echten Nutzertests | Realtests mit echten Abrechnungen, Vor-Upload-Konsistenzprüfung aller 46 Dateien, diverse Live-Bug-Funde | 12 | 75 €/h (QA/Full-Stack) | 900 € |
| **Summe** | | **≈ 256 Std.** | | **≈ 26.650 €** |

Quellen Stundensätze: [saasrebels.de, Stundensatz Software-Entwickler 2026](https://saasrebels.de/blog/stundensatz-software-entwickler-2026), [Freelancer-Kompass via redforest.de, Grafikdesign-Stundensatz](https://redforest.de/blog/grafikdesign-stundensatz/). Rechtsanwalts-Stundensatz: Suche lieferte keine belastbare Durchschnittsquelle für reine Beratungsmandate (ein gefundener Einzelwert von 750 €/h wirkte wie ein Ausreißer aus einem anderen Marktsegment, deshalb nicht übernommen) — 200 €/h ist eine eigene, konservative Schätzung innerhalb der allgemein bekannten Marktspanne, keine zitierfähige Quelle.

**Einordnung, drei getrennte Aussagen — nicht verwechseln:**

1. **Wiederbeschaffungswert (oben, ≈ 26.650 €):** was es gekostet hätte, das klassisch einkaufen zu lassen. Eine reale, belastbare Zahl im Sinne von "das hast du dir erspart".
2. **Aktueller Verkaufswert des Projekts: nahe null.** Ein Käufer zahlt für ein Micro-SaaS-Projekt nicht für investierte Entwicklungsstunden, sondern für nachgewiesenen Umsatz/Traktion. Bei aktuell praktisch keinem zahlenden Kundenstamm (Umsatzprognose Abschnitt 4 ist eine Schätzung, kein Nachweis) wäre ein realistischer Verkaufspreis heute nicht an der Wiederbeschaffungssumme zu bemessen, sondern nahe am reinen Code-/Domain-Wert — ehrlich eingeordnet: eher niedriger dreistelliger bis niedriger vierstelliger Bereich, nicht die oben genannten ~26.650 €. Das ist keine Schätzung, die ich mit einer Quelle belegen kann, sondern eine Einordnung aus der allgemein bekannten Logik von Micro-SaaS-Bewertungen (Vielfache des MRR, nicht der Baukosten) — bei MRR ≈ 0 ergibt sich daraus fast zwangsläufig ein sehr niedriger Wert.
3. **Potential:** bereits in Abschnitt 4 und 9 mit konkreten 3-/6-/12-Monats-Szenarien und der 250–1.000-Verkäufe/Jahr-Einordnung behandelt — wird hier nicht dupliziert, nur referenziert.

**Die eigentlich interessante Zahl aus dieser Aufrechnung:** ≈ 256 marktübliche Stunden, entstanden bei einem von dir selbst budgetierten Aufwand von 1–2 Std./Woche über gut zwei Monate (≈ 15–20 echte Stunden deinerseits, grob geschätzt). Das ist der Hebel, den dieses Projekt laut deiner eigenen Zielsetzung ganz am Anfang testen sollte ("wie weit kommt man mit KI") — unabhängig davon, was das Projekt heute verkäuflich wert ist.
