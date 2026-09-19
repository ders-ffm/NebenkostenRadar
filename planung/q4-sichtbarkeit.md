# Sichtbarkeit für Q4: Google Ads, Widget, Redaktionen

Stand: 11.09.2026. Vorgeschichte: Reddit, Meta-Anzeigen und das Anschreiben von Mietervereinen haben jeweils nichts gebracht.

---

## 1. Google Ads: nein, und zwar deutlich

Die kurze Antwort: **Bei einem Verkaufspreis von 9,99 bis 12,99 € lässt sich Suchmaschinenwerbung nicht rechnen.** Das ist keine Einschätzung, sondern eine Rechnung.

### Was pro Verkauf übrig bleibt

| | |
|---|---|
| Mischpreis (65 % zu 9,99 €, 35 % zu 12,99 €) | 11,04 € |
| abzüglich Stripe (0,25 € + 1,5 %) | −0,42 € |
| **Netto je Verkauf** | **10,62 €** |

### Der Posten, den man leicht übersieht

Die KI-Erkennung läuft **vor** der Zahlung. Jeder Upload kostet Geld, auch wenn nie gekauft wird. Bei geschätzt 0,12 € pro Erkennungslauf und einer Kaufquote von 15 % unter den Hochladenden sind das rund 0,80 € je zustande gekommenem Verkauf.

**Deckungsbeitrag: 9,82 € je Verkauf.**

### Wie viele Klicks ein Verkauf kostet

Angenommen, 40 % der Klickenden laden etwas hoch und 15 % davon kaufen. Beides ist für einen unbekannten Anbieter optimistisch gegriffen. Dann braucht es **16,7 Klicks pro Verkauf**.

Daraus folgt der maximal tragbare Klickpreis: **0,59 €**. Darüber wird jeder Verkauf zum Verlustgeschäft.

### Was der Markt tatsächlich kostet

Branchenübliche Klickpreise in Deutschland, Stand 2026: quer über alle Branchen rund 1,32 €; Rechtsthemen liegen bei 5 bis 15 €. Nebenkostenprüfung fällt in die Nähe des Rechtsbereichs.

| Klickpreis | Werbekosten je Verkauf | Ergebnis je Verkauf |
|---|---|---|
| 1,32 € (Branchenschnitt) | 22,00 € | **−12,18 €** |
| 3,00 € (unteres Ende Recht) | 50,00 € | **−40,18 €** |
| 5,00 € (Rechtsberatung) | 83,33 € | **−73,51 €** |

### Gegenprobe

Welche Klick-zu-Kauf-Rate wäre nötig, damit es aufgeht?

| Klickpreis | nötige Rate | realistisch? |
|---|---|---|
| 0,50 € | 5,1 % | grenzwertig |
| 1,32 € | 13,4 % | nein |
| 3,00 € | 30,5 % | nein |
| 5,00 € | 50,9 % | nein |

Bei kalter Suchmaschinenwerbung gelten 1 bis 3 % als gut.

### Umgekehrt gefragt: welcher Preis wäre nötig?

Bei 3 % Konversion müsste der Verkaufspreis liegen bei:

- 45,22 € bei 1,32 € Klickpreis
- 101,22 € bei 3,00 € Klickpreis
- 167,89 € bei 5,00 € Klickpreis

Das erklärt nebenbei, warum Mineko bei 35 bis 50 € liegt und sich Werbung leisten kann. Wer für 9,99 € verkauft, kann keinen Traffic einkaufen.

### Was das strategisch bedeutet

Das ist kein Nebenbefund, sondern die wichtigste Zahl dieses Dokuments. **Bei diesem Preis ist bezahlte Reichweite grundsätzlich ausgeschlossen, nicht nur bei Google.** Auch Meta hat deshalb nicht funktionieren können, unabhängig von Zielgruppe und Motiv. Es bleiben nur Kanäle, die kein Geld pro Kontakt kosten: Suchmaschinen-Sichtbarkeit, Verweise von anderen Seiten, Presse, Weiterempfehlung.

Wer bezahlte Werbung will, muss vorher am Preis drehen. Das ist eine eigene Entscheidung mit eigenen Folgen und sollte nicht nebenbei getroffen werden.

### Die eine Ausnahme, die zu prüfen wäre

Markenbegriffe. Wer „nebenkostenradar" sucht, kennt den Namen bereits, konvertiert also weit besser als kalter Traffic, und der Klickpreis liegt für den eigenen Markennamen meist unter 0,20 €. Das ist Verteidigung gegen Wettbewerber, die auf deinen Namen bieten, kein Wachstum. Bei aktuell 20 Impressionen im Quartal lohnt es noch nicht.

---

## 2. Das Widget: Anschreiben und Adressaten

Das Einbett-Widget liegt seit dem 09.09.2026 unter `/widget.js` und wurde bisher niemandem angeboten. Es zeigt die DMB-Richtwerte-Tabelle und setzt darunter eine Quellenangabe mit Rückverlinkung.

### Wen es NICHT lohnt anzuschreiben

Mietervereine. Das hat schon nicht funktioniert, und der Grund ist strukturell: Sie sind Wettbewerber um dieselbe Zielgruppe und haben die Daten selbst. Drei der acht Treffer auf Seite 1 für „betriebskostenspiegel 2024" sind lokale Mietervereine mit eigener Aufbereitung.

### Wen es lohnt

Die Zielgruppe sind Seiten, die **über das Thema schreiben, aber keine eigene Datenaufbereitung haben** und kein Geld mit Nebenkostenprüfung verdienen:

1. **Studierendenwerke und Hochschul-Wohnberatungen.** Haben eine klar definierte Zielgruppe mit genau diesem Problem und keinerlei eigenes Angebot dazu.
2. **Verbraucher- und Finanzblogs**, die Mietthemen streifen, aber keine Redaktion für Datenpflege haben.
3. **Umzugs- und Wohnungsportale.** Nebenkosten sind für sie ein Randthema, das trotzdem Fragen erzeugt.
4. **Betriebs- und Personalräte, Gewerkschaftsgliederungen**, die Mitglieder in Alltagsfragen beraten.
5. **Sozial- und Schuldnerberatungen.** Sehen regelmäßig Menschen mit genau diesem Problem.

Die Recherche der konkreten Empfänger gehört an den Anfang der Umsetzung und muss von Hand passieren. Eine erfundene Liste wäre wertlos.

### Anschreiben

Betreff: **Kostenlose Betriebskosten-Tabelle zum Einbinden auf Ihrer Seite**

> Sehr geehrte Damen und Herren,
>
> auf Ihrer Seite [konkrete Seite nennen] geht es um [konkretes Thema]. Dazu passt ein Baustein, den wir kostenlos zur Verfügung stellen.
>
> Wir pflegen eine Tabelle mit den Vergleichswerten des Deutschen Mieterbundes für alle Betriebskostenarten, aufbereitet und jährlich aktualisiert, sobald der Mieterbund neue Zahlen veröffentlicht. Sie lässt sich mit einer Zeile HTML in jede Seite einbinden:
>
> `<script src="https://nebenkostenradar.com/widget.js"></script>`
>
> Kein Konto, keine Anmeldung, keine Kosten, keine Nachverfolgung Ihrer Besucher. Unter der Tabelle steht eine Quellenangabe mit Link zu uns, das ist unser einziger Gegenwert.
>
> Sie können sich die Tabelle hier ansehen: [Beispielseite]
>
> Wenn es nicht passt, ignorieren Sie diese Mail einfach, ich hake nicht nach.
>
> Viele Grüße
> Stefan Hennig, NebenkostenRadar

**Warum dieser Aufbau:** Der konkrete Bezug auf die Seite im ersten Satz entscheidet darüber, ob weitergelesen wird. Der Verzicht aufs Nachhaken ist kein Verhandlungstrick, sondern verhindert, dass die Mail wie Kaltakquise wirkt. Die Nennung des Gegenwerts (Link) ist Ehrlichkeit und wird als solche gelesen.

**Datenschutz, wichtig vor dem Versenden:** Die Behauptung „keine Nachverfolgung Ihrer Besucher" muss stimmen. Das Widget darf keine Cookies setzen und keine IP-Adressen protokollieren, sonst bräuchte die einbindende Seite eine Einwilligung ihrer Besucher, und der Vorschlag wäre für seriöse Empfänger unbrauchbar. Vor dem ersten Anschreiben ist `/widget.js` genau daraufhin zu prüfen.

---

## 3. Die Redaktions-Story

### Der falsche und der richtige Aufhänger

Falsch wäre: „Neues Tool zur Nebenkostenprüfung gestartet." Eine Produktmeldung ohne Kunden, ohne Zahlen und ohne Neuigkeitswert. Das landet ungelesen im Papierkorb, zu Recht.

Richtig ist der **Datenbefund**, der bei der Arbeit am Produkt entstanden ist:

> Der Betriebskostenspiegel des Deutschen Mieterbundes ist der einzige bundesweit verfügbare Vergleichsmaßstab für Mieter. Er ist ein **bundesweiter Durchschnitt ohne regionale Aufschlüsselung**. Wer ihn zur Prüfung der eigenen Abrechnung benutzt, wie es Mieterbund und Verbraucherportale empfehlen, erhält in teuren Regionen systematisch Fehlalarme und in günstigen Regionen falsche Entwarnung.

Das ist belegbar, betrifft Millionen Haushalte, und es ist eine Kritik am Instrument, nicht an einem Unternehmen. Genau das interessiert Verbraucherredaktionen.

**Zweiter, konkreterer Befund, aus dem Echttest vom 11.09.2026:** Der Spiegel verleitet dazu, verbrauchsabhängige Posten wie Wasser und Heizung nach Quadratmetern zu bewerten. Das ist methodisch falsch, weil Verbrauch an der Personenzahl hängt. Eine reale Abrechnung mit 113,64 m³ Jahresverbrauch, also einem völlig normalen Wert für zwei bis drei Personen, erscheint bei diesem Vergleich als 84 % über dem Richtwert.

### Pitch

Betreff: **Warum der Betriebskostenspiegel des Mieterbunds Mieter in die Irre führen kann**

> Sehr geehrte Damen und Herren,
>
> ich betreibe NebenkostenRadar, ein kleines Werkzeug zur Prüfung von Nebenkostenabrechnungen, und bin dabei auf ein Problem gestoßen, das über mein Produkt hinausgeht.
>
> Der Betriebskostenspiegel des Deutschen Mieterbundes ist der einzige bundesweite Vergleichsmaßstab, den Mieter haben. Verbraucherportale und der Mieterbund selbst empfehlen ihn zur Prüfung der eigenen Abrechnung. Er hat aber zwei Eigenschaften, die dabei kaum je erwähnt werden:
>
> Erstens ist er ein bundesweiter Durchschnitt ohne regionale Differenzierung. In Frankfurt oder München liegt fast jede Abrechnung darüber, in strukturschwachen Regionen fast jede darunter. Beides sagt über die Richtigkeit der Abrechnung nichts aus.
>
> Zweitens sind mehrere der aufgeführten Kostenarten verbrauchsabhängig, Wasser und Heizung etwa. Sie werden trotzdem pro Quadratmeter angegeben. Der Verbrauch hängt aber an der Personenzahl. Ein konkretes Beispiel aus einer echten Abrechnung: 113,64 Kubikmeter Wasser im Jahr, ein normaler Wert für zwei bis drei Personen, liegt beim Quadratmetervergleich 84 Prozent über dem Richtwert.
>
> Ich habe die Zahlen und die Primärquellen aufbereitet und stelle sie Ihnen gern zur Verfügung, auch ohne dass mein Produkt vorkommt.
>
> Viele Grüße
> Stefan Hennig

**Warum der letzte Satz entscheidend ist:** Er nimmt der Mail den Werbecharakter. Eine Redaktion, die den Befund aufgreift, nennt die Quelle meist ohnehin. Wer auf der Nennung besteht, wird nicht aufgegriffen.

### Kontakte

**Geprüft am 11.09.2026:**

| Redaktion | Weg | Anmerkung |
|---|---|---|
| Finanztip | presse@finanztip.de, Felix Riesenberg (Head of Communications), Tel. 030 220 56 09 80 | **Achtung:** Das ist Finanztips eigene Pressestelle für Journalisten, die über Finanztip berichten. Für einen Themenvorschlag AN die Redaktion ist der allgemeine Kontaktweg über finanztip.de/kontakt der passendere. Beides ausprobieren, die Pressestelle leitet erfahrungsgemäß weiter. |

**Noch zu recherchieren, bevor angeschrieben wird:**

- Stiftung Warentest / test.de, Ressort Recht und Wohnen
- Verbraucherzentrale Bundesverband, Fachbereich Wohnen
- Regionalpresse Frankfurt (Frankfurter Rundschau, Frankfurter Neue Presse), lokaler Bezug über die eigene Abrechnung
- Fachdienste für Immobilienwirtschaft (Haufe rankt für den Begriff auf Platz 3 und berichtet regelmäßig über den Spiegel)

Ich habe diese Kontakte **nicht** ins Dokument geschrieben, weil ich sie nicht verifizieren konnte. Erfundene Redaktionsadressen kosten im besten Fall nur Zeit, im schlechteren den Ruf.

### Zeitplan

Abrechnungen für 2025 müssen Mietern nach § 556 Abs. 3 BGB bis 31.12.2026 zugehen. Der Versand ballt sich erfahrungsgemäß im vierten Quartal, auch wenn ich dazu keine belastbare Statistik gefunden habe. Ein Themenvorschlag wirkt am besten, wenn er kurz vor der Welle kommt, also **Ende Oktober bis Mitte November**. Bis dahin sollten die Widget-Anschreiben raus sein, damit etwaige Verlinkungen schon wirken.

---

## 4. Reihenfolge

| # | Was | Warum zuerst |
|---|---|---|
| 1 | Prüfbericht nach dem Echttest verifizieren | Nichts bewerben, was falsche Aussagen erzeugt |
| 2 | `/widget.js` auf Cookie- und IP-Freiheit prüfen | Das Anschreiben behauptet es |
| 3 | 10 bis 20 Widget-Adressaten recherchieren und anschreiben | Wirkt langsam, muss also früh los |
| 4 | Redaktionskontakte verifizieren | Vor dem Pitch, nicht danach |
| 5 | Pitch Ende Oktober versenden | Timing zur Abrechnungswelle |
| 6 | Google Ads | nicht |
