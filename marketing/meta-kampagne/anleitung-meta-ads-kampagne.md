# Anleitung: Meta-Ads-Kampagne (Flight 1: Wochenende, Flight 2: September)

Stand: 13.08.2026. Budget-Split wie besprochen: 120 € jetzt, 80 € im September. Zielregion: ganz Deutschland.

## Vorab: Wie du siehst, ob es wirkt

Auf der Website ist bereits Google Analytics (GA4) eingebaut (`src/components/layout/CookieBanner.jsx`) — kein Meta-Pixel vorhanden. Das heißt zwei Dinge:

1. In Ads Manager siehst du "Linkklicks" (wie oft auf die Anzeige geklickt wurde) — das ist eine Annäherung an Besucher, keine exakte Zahl (Klick ≠ garantierter Seitenaufruf).
2. Die tatsächlichen Besucherzahlen kannst du in Google Analytics nachsehen (Property ist verbunden, `G-KE9LWG22QW`) — dort aber nur für Besucher, die den Cookie-Banner akzeptiert haben, also eher eine Unter- als Übertreibung.

Für den Anfang reicht das. Wenn du später genauer wissen willst, welcher Klick tatsächlich zu einer Prüfung geführt hat, bräuchtest du zusätzlich einen Meta-Pixel — sag Bescheid, dann bauen wir den ein.

## iPhone-Hinweis (Stand 13.08.2026, da du Samstag unterwegs bist)

- **Bilder:** Der Ordner ist iCloud-synchronisiert, du findest `bildmaterial/` und `instagram-content/` also direkt in der Files-App unter iCloud Drive → NebenkostenRadar → marketing → meta-kampagne. Kein separater Download nötig.
- **Ads Manager in Safari:** Die volle Oberfläche (business.facebook.com/adsmanager) ist für kleine Bildschirme nicht optimiert — manuelle Platzierungen und Zielgruppen-Details können in der mobilen Ansicht fehlen oder schwer bedienbar sein. Aktiviere in Safari über das "Aa"-Menü (oben links in der Adresszeile) **"Desktop-Website anfordern"**, dann bekommst du die vollständige Oberfläche, nur kleiner skaliert.
- **Separate "Meta Ads Manager"-App:** Kann ich von hier aus nicht verlässlich prüfen (kein Zugriff auf dein Konto) — nach meiner Kenntnis ist die App-Oberfläche eingeschränkter als die Desktop-Ansicht, insbesondere bei manuellen Platzierungen. Falls die App die entsprechende Option nicht zeigt, ist der Safari-Weg mit Desktop-Anforderung die sicherere Variante. Bitte selbst gegenchecken, bevor du dich darauf verlässt.
- **Bild-Upload beim Anlegen der Anzeige:** Die PNGs liegen in Files, nicht automatisch in der Fotos-App. Beim Upload-Dialog in Safari auf "Durchsuchen" bzw. "Datei wählen" → "Auf meinem iPhone" → iCloud Drive gehen, falls sie nicht direkt zur Auswahl stehen.

## Flight 1 — Wochenende (Fr 14.08. abends bis So 16.08.)

1. **Ads Manager öffnen:** Facebook-Seite → "Werbung schalten" (kennst du schon vom Screenshot) oder direkt über business.facebook.com/adsmanager.
2. **Kampagne erstellen:**
   - Ziel: **Traffic** (nicht "Reichweite", nicht "Interaktion" — nur Traffic optimiert auf Linkklicks zur Website)
   - Kampagnenname: z. B. `NKR – Traffic – Wochenende Aug26`
   - Buying Type: Auktion (Standard, nichts ändern)
3. **Anzeigengruppe:**
   - Conversion-Ort: Website
   - Performance-Ziel: „Anzahl der Linkklicks maximieren"
   - Budget: **Laufzeitbudget 120 €**
   - Zeitraum: Fr 14.08. 18:00 Uhr – So 16.08. 23:59 Uhr (gibt der Auslieferung etwas mehr Zeit als nur Sa/So — bei so kurzen Flights kommt die Lernphase kaum in Schwung, das ist normal, kein Fehler)
   - Zielgruppe: Standort Deutschland, Alter 22–55, alle Geschlechter, Sprache Deutsch — **keine** engen Interessen-Filter setzen. Bei kleinem Budget liefert Meta mit breiter Zielgruppe zuverlässiger aus als mit eng gefasstem Interessen-Targeting (und eine treffende Kategorie wie "Mietrecht" gibt es im Interessen-Katalog ohnehin nicht).
   - Placements: **Manuell**, nur Facebook Feed + Instagram Feed auswählen (kein "Erweiterte/automatische Platzierungen"). Grund: Es gibt bisher nur 1:1-Creatives — in Stories/Reels (9:16) würden die schlecht zugeschnitten.
4. **Anzeige (im selben Ad Set alle drei anlegen — Meta testet automatisch, welche am besten läuft):**
   - Format: Einzelbild
   - Bild 1: `anzeige_feed_provokant-drauf_1080x1080.png` — Primärtext: „Jede zweite Nebenkostenabrechnung enthält Fehler. Prüf deine kostenlos — dauert 3 Minuten."
   - Bild 2: `anzeige_feed_provokant-glaubnicht_1080x1080.png` — Primärtext: „Nicht alles, was auf deiner Abrechnung steht, stimmt automatisch. Unabhängiger Check, kostenlos, in 3 Minuten."
   - Bild 3: `anzeige_feed_vertrauen-mieter-fuer-mieter_1080x1080.png` — Primärtext: „Von einem Mieter für Mieter gebaut. Kein Vermieter-Interesse, keine versteckten Kosten. Kostenlos prüfen."
   - Website-URL: `https://nebenkostenradar.com`
   - CTA-Button: **Mehr dazu**
   - Falls dein Instagram-Profil noch nicht mit der Facebook-Seite verknüpft ist: Seiteneinstellungen → Verlinkte Konten → Instagram verbinden, sonst läuft die Anzeige nicht auch dort.
5. **Veröffentlichen.**

## Zwischencheck (Sonntagabend oder Montag)

In Ads Manager pro Anzeige: Linkklicks und CPC (Kosten pro Klick) vergleichen. Das Creative mit dem günstigsten CPC/den meisten Klicks ist dein Sieger für Flight 2 — die anderen dann nicht mehr mitlaufen lassen.

## Flight 2 — September (Vorschlag: 01.09.–07.09., anpassbar)

1. Kampagne aus Flight 1 duplizieren (spart Neuaufbau) oder neu anlegen.
2. Nur das/die beste(n) Creative(s) aus Flight 1 verwenden — nicht wieder alle drei, außer die Ergebnisse lagen sehr nah beieinander.
3. Laufzeitbudget: 80 €, Zeitraum eine ganze Woche statt nur ein Wochenende (stabilere Auslieferung bei kleinerem Tagesbudget als ein sehr kurzer Flight).
4. Gleiche Zielgruppen- und Placement-Einstellungen wie Flight 1.

## Kurz zur Einordnung

200 € über zwei kurze Flights sind ein Test, kein Wachstumsbudget — realistisch sind damit ein paar hundert bis niedrig vierstellig Linkklicks, abhängig vom CPC (grober Richtwert für diese Nische: 0,50–1,50 € pro Klick). Das reicht, um zu sehen, welches Creative funktioniert und ob die Zielgruppe grundsätzlich passt — nicht, um allein daraus schon eine große, bekannte Marke zu machen. Der Content-Kalender (organisch) und die Anzeigen ergänzen sich: Ads bringen die ersten Besucher, die Content-Posts sorgen dafür, dass die Seite nicht leer wirkt, wenn jemand draufklickt.
