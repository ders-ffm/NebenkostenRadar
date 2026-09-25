# Sichtbarkeit: konkrete Umsetzung

Stand: 19.09.2026. Baut auf `q4-sichtbarkeit.md` auf, das die Strategie und die Google-Ads-Rechnung enthält. Hier steht, was tatsächlich zu tun ist, mit geprüften Adressen.

---

## 1. Der wichtigste Fund: du rankst auf die falsche Jahreszahl

Das kostet vermutlich mehr Sichtbarkeit als Presse und Widget zusammen einbringen können, und es ist in zehn Minuten behoben.

### Der Befund

Dein stärkster Ratgeberartikel heißt:

| | |
|---|---|
| URL | `/ratgeber/betriebskostenspiegel-2024` |
| Titel | „DMB Betriebskostenspiegel 2024: Was ist normal?" |

Alle drei Wettbewerber, die für dieses Thema ranken, nennen dagegen das **laufende** Jahr:

| Anbieter | URL | Titel |
|---|---|---|
| mein-nebenkostenrechner.de | `/betriebskostenspiegel` | „Betriebskostenspiegel 2026: 2,67 €/m² im Schnitt" |
| nebenkostenpro.de | `/ratgeber/betriebskostenspiegel-2026` | „Betriebskostenspiegel 2026: Durchschnittliche Nebenkosten" |
| nebenkosten-verstehen.de | `/betriebskostenspiegel` | „Betriebskostenspiegel 2026: Nebenkosten pro m² & umlagefähige Kosten" |

### Warum das ein Problem ist

Ein Mieter, der im Herbst 2026 seine Abrechnung auf dem Tisch hat, tippt „Betriebskostenspiegel 2026" oder „Nebenkosten Durchschnitt 2026". Er tippt nicht 2024, weil er das Abrechnungsjahr seiner eigenen Abrechnung meint und nicht das Datenjahr des Mieterbunds.

Inhaltlich hast du völlig recht: Die aktuellen Zahlen des Mieterbunds stammen aus dem Abrechnungsjahr 2024, veröffentlicht am 18.12.2025. Die Jahreszahl im Titel ist sachlich korrekt. Sie beantwortet nur eine Frage, die niemand stellt.

**Wichtig zur Einordnung:** Dass die Wettbewerber es so machen, ist belegt, ich habe die drei Seiten gesehen. Dass daran auch dein Rückstand hängt, ist eine begründete Vermutung, kein Beweis. Belegt wäre es erst, wenn die Search Console nach der Änderung Impressionen für die 2026er Anfragen zeigt. Genau das ist der Test.

### Was zu tun ist, in zwei Stufen

**Stufe 1, sofort und ohne jedes Risiko: nur der Titel.**

```
alt:  DMB Betriebskostenspiegel 2024: Was ist normal?
neu:  Betriebskostenspiegel 2026: was ist normal? Aktuelle DMB-Zahlen
```

Im Text dann im ersten Absatz klarstellen, dass die Zahlen aus dem Abrechnungsjahr 2024 stammen. Damit bleibt die Aussage ehrlich und die Seite antwortet trotzdem auf die Frage, die gestellt wird. Die URL bleibt unverändert, es kann also nichts kaputtgehen.

**Stufe 2, danach: die Jahreszahl aus der URL nehmen.**

`mein-nebenkostenrechner.de` macht es richtig: Die URL heißt schlicht `/betriebskostenspiegel`, nur der Titel trägt das Jahr. Vorteil: Die URL veraltet nie, und die über Jahre gesammelte Verlinkung bleibt auf einer einzigen Adresse statt sich auf Jahrgänge zu verteilen.

Umsetzung: neue URL `/ratgeber/betriebskostenspiegel`, dazu eine dauerhafte Weiterleitung von der alten in `vercel.json`. Ohne diese Weiterleitung verlierst du den Platz, auf dem du heute stehst. Das ist kein Detail, sondern der ganze Punkt bei der Sache.

Stufe 2 erst machen, wenn Stufe 1 in der Search Console sichtbar gewirkt hat. Zwei Änderungen gleichzeitig, und du weißt hinterher nicht, welche geholfen hat.

### Die Jahreszahl wandert von selbst mit (ergänzt 19.09.2026)

Stefans Einwand: Eine fest eingetippte Jahreszahl ist ab dem 1. Januar falsch, und daran denkt niemand. Stimmt. Deshalb steht in `src/artikel.js` jetzt der Platzhalter `{JAHR}` statt einer Zahl, aufgelöst am Dateiende in einem Durchgang über alle Texte.

**Nur dort, wo „das laufende Jahr" gemeint ist.** „Grundsteuerreform 2026" und „BGH-Urteile 2026" bleiben fest eingetippt, weil sie tatsächliche Ereignisse bezeichnen. Würden die mitwandern, stünde dort irgendwann etwas Falsches. Die Faustregel steht als Kommentar in der Datei.

Geprüft durch einen Testlauf mit auf 2027 vorgestellter Uhr:

| | heute | simuliert 2027 |
|---|---|---|
| Betriebskostenspiegel | 2026 | **2027** |
| Grundsteuerreform | 2026 | 2026 |
| BGH-Urteile | 2026 | 2026 |

**Zwei Dinge waren dafür nötig, nicht eins.** Im Browser wird der Platzhalter bei jedem Seitenaufruf aufgelöst, dort stimmt es immer. Google liest aber die vorgerenderten Dateien aus dem Build, und gebaut wird nur, wenn etwas ins Repository kommt. Deshalb gibt es `.github/workflows/jahreswechsel.yml`: Der Workflow läuft am 2. Januar, schreibt das neue Jahr in `scripts/jahr-stand.json`, committet und löst damit den Vercel-Build aus. Anschließend legt er ein GitHub-Issue mit den betroffenen URLs an, weil die Neuindexierung in der Search Console von Hand angestoßen werden muss.

Die Liste der betroffenen Seiten holt sich der Workflow aus `ARTIKEL_MIT_JAHR`, also aus den Daten selbst. Kommt später ein zweiter Artikel mit `{JAHR}` dazu, steht er automatisch mit im Issue.

### Dasselbe prüfen bei den übrigen Artikeln

Vier Artikel tragen schon 2026 im Namen, der Rest ist jahresneutral. Nur dieser eine Artikel hängt an einer veralteten Jahreszahl, und ausgerechnet das ist der, für den du am besten rankst.

---

## 2. Widget: eine Aussage im Anschreiben stimmt nicht

### Was ich geprüft habe

`/widget.js` wird beim Bauen aus `business.js` erzeugt (`scripts/prerender.mjs`, Zeile 129 ff.) und liegt deshalb nicht als Datei im Ordner. Das ist in Ordnung so, die Tabelle bleibt dadurch automatisch aktuell, wenn der Mieterbund neue Zahlen veröffentlicht.

Der Inhalt ist sauber: keine Cookies, kein `localStorage`, kein Nachladen von Daten, kein Zählpixel. Die Zahlen stecken fest in der Datei.

### Der Fehler im geplanten Anschreiben

Im Entwurf steht „keine Nachverfolgung Ihrer Besucher". Das ist so nicht haltbar.

Wer `<script src="https://nebenkostenradar.com/widget.js">` einbindet, lässt den Browser jedes Besuchers eine Datei von deinem Server holen. Dabei geht dessen **IP-Adresse an deinen Server**, und Vercel protokolliert Zugriffe. Das ist exakt derselbe Sachverhalt, den wir vor sechs Tagen bei den Unsplash-Bildern beseitigt haben, nur mit umgekehrten Rollen.

Ein Studierendenwerk oder eine Verbraucherzentrale hat einen Datenschutzbeauftragten. Der prüft genau das. Ein Anschreiben, das etwas Falsches behauptet, verbrennt den Kontakt dauerhaft.

### Die Lösung macht das Angebot sogar stärker

Weil die Zahlen fest in der Datei stehen, braucht das Widget **gar keine Verbindung zu dir.** Der Empfänger kann die Datei herunterladen und von seinem eigenen Server ausliefern. Dann fließt kein einziges Byte zu uns.

Für datenschutzbewusste deutsche Einrichtungen, und das ist genau unsere Zielgruppe, ist das ein stärkeres Argument als jedes Feature. Der Rücklink bleibt in beiden Fällen in der Tabelle stehen.

### Anschreiben, korrigierte Fassung

Betreff: **Kostenlose Betriebskosten-Tabelle zum Einbinden auf Ihrer Seite**

> Sehr geehrte Damen und Herren,
>
> auf Ihrer Seite [konkrete Seite nennen] geht es um [konkretes Thema]. Dazu passt ein Baustein, den wir kostenlos zur Verfügung stellen.
>
> Wir pflegen eine Tabelle mit den Vergleichswerten des Deutschen Mieterbundes für alle Betriebskostenarten, jährlich aktualisiert, sobald der Mieterbund neue Zahlen veröffentlicht. Sie lässt sich mit zwei Zeilen HTML einbinden:
>
> `<div id="nkr-betriebskostenspiegel"></div>`
> `<script src="https://nebenkostenradar.com/widget.js" async></script>`
>
> Die Tabelle setzt keine Cookies und lädt keine weiteren Daten nach. Weil sie aber von unserem Server geholt wird, erreicht uns dabei die IP-Adresse Ihrer Besucher, wie bei jeder eingebundenen fremden Datei.
>
> Falls Ihnen das nicht recht ist, und ich halte das für einen berechtigten Einwand: Die Datei enthält die Zahlen fest eingebaut und braucht keine Verbindung zu uns. Laden Sie sie einfach herunter und liefern Sie sie von Ihrem eigenen Server aus. Dann fließen überhaupt keine Daten zu uns ab. Wenn der Mieterbund neue Zahlen veröffentlicht, sage ich Ihnen Bescheid.
>
> Unter der Tabelle steht eine Quellenangabe mit Link zu uns, das ist unser einziger Gegenwert.
>
> Ansehen können Sie sich die Tabelle hier: https://nebenkostenradar.com/ratgeber/betriebskostenspiegel-2024
>
> Wenn es nicht passt, ignorieren Sie diese Mail einfach, ich hake nicht nach.
>
> Viele Grüße
> Stefan Hennig, NebenkostenRadar

**Warum der Datenschutz-Absatz nicht schadet, sondern hilft:** Er nimmt den Einwand vorweg, den der Empfänger ohnehin prüfen lässt, und beantwortet ihn besser, als der Empfänger erwartet. Ein Absender, der von selbst auf die IP-Übertragung hinweist, wirkt vertrauenswürdig. Einer, der behauptet, es gebe keine, wirkt es nur so lange, bis jemand nachsieht.

### Wen anschreiben

Die Kategorien stehen in `q4-sichtbarkeit.md`. Die konkreten Empfänger müssen von Hand gesucht werden, und der Suchweg ist wichtiger als eine fertige Liste, weil er wiederholbar ist:

1. Bei Google `betriebskostenspiegel` suchen und die Treffer auf den Seiten 2 bis 5 durchgehen. Dort stehen die Seiten, die über das Thema schreiben, ohne dafür optimiert zu sein. Genau die brauchen die Tabelle.
2. Jeden Treffer auf zwei Fragen prüfen: Verdient die Seite Geld mit Nebenkostenprüfung? Hat sie schon eine eigene Tabelle? Zweimal nein bedeutet: anschreiben.
3. Mietervereine überspringen, das hat schon nicht funktioniert und sie sind Wettbewerber um dieselbe Zielgruppe.

Zehn bis zwanzig gut ausgewählte Empfänger mit jeweils einem echten ersten Satz bringen mehr als hundert Serienmails.

---

## 3. Redaktionskontakte, am 19.09.2026 auf den Seiten der Häuser geprüft

| Haus | Adresse | Telefon | Wofür dieser Weg gedacht ist |
|---|---|---|---|
| Verbraucherzentrale Hessen | presse@verbraucherzentrale-hessen.de | 069 972010-31 | Ute Bitter, Teamleitung Kommunikation. **Bester erster Kontakt**, siehe unten |
| Stiftung Warentest | kommunikation@stiftung-warentest.de | 030 2631-2345 | Kommunikations-Team. Ausdrücklich für Berichte **über** die Stiftung, nicht für Themenvorschläge |
| Verbraucherzentrale Bundesverband | presse@vzbv.de | 030 25800-525 | **Verweist für Servicethemen ausdrücklich an die Landesverbände**, also an die Zeile darüber |
| Haufe | pressehaufe@haufe-lexware.com | — | Konzern-Pressestelle. Keine direkte Adresse der Immobilien-Redaktion auffindbar |
| Finanztip | presse@finanztip.de | 030 220 56 09 80 | Felix Riesenberg. Ebenfalls die eigene Pressestelle, nicht die Redaktion. Der Weg über finanztip.de/kontakt ist für Themenvorschläge passender |

### Was diese Recherche ergeben hat, und es ist unangenehm

**Vier von fünf dieser Adressen sind die falsche Tür.** Pressestellen großer Häuser sind dafür da, Journalisten zu bedienen, die über das Haus berichten. Ein Themenvorschlag von außen landet dort im besten Fall in einer Weiterleitung, im Normalfall nirgends.

Der vzbv sagt das auf seiner eigenen Presseseite sogar ausdrücklich: Bei Servicethemen und Verbrauchertipps möge man sich an die Pressestellen der Landes-Verbraucherzentralen wenden.

### Woraus folgt, wo anzufangen ist

**Verbraucherzentrale Hessen.** Kleines Haus mit zwei Personen in der Kommunikation, benannte Ansprechpartnerin, örtlicher Bezug, und dein Befund passt genau in ihren Auftrag. Wenn die den Befund aufgreifen, hast du erstens eine Veröffentlichung und zweitens etwas, worauf du dich bei den großen Häusern berufen kannst. Ohne eine solche Vorgeschichte ist ein Pitch an Stiftung Warentest chancenlos.

**Frankfurter Rundschau und Frankfurter Neue Presse** konnte ich nicht prüfen, die Seite ist für meinen Zugriff gesperrt. Regionalpresse erreicht man ohnehin besser mit einem Anruf in der Lokalredaktion als per Mail an eine allgemeine Adresse. Ein Frankfurter mit einer Frankfurter Abrechnung und einem Befund über ein bundesweites Instrument ist ein brauchbarer lokaler Aufhänger.

Der Pitch-Text selbst steht unverändert in `q4-sichtbarkeit.md`, Abschnitt 3. Er ist gut, der letzte Satz („auch ohne dass mein Produkt vorkommt") ist das Wichtigste daran.

---

## 3a. Versandfertiges Anschreiben an die Verbraucherzentrale Hessen

Empfängerin: **Ute Bitter**, Teamleitung Kommunikation, presse@verbraucherzentrale-hessen.de, 069 972010-31. Am 19.09.2026 auf verbraucherzentrale-hessen.de/presse geprüft.

### Warum dieses Anschreiben anders ist als der Redaktions-Pitch

Eine Verbraucherzentrale ist keine Redaktion. Sie sucht keine Geschichten, sie hat einen Beratungsauftrag. Der Hebel ist deshalb nicht „hier ist ein interessanter Befund", sondern: **Sie empfiehlt den Betriebskostenspiegel selbst, und ihre Ratsuchenden können ihn missverstehen.** Das betrifft unmittelbar ihre eigene Arbeit.

Zweiter Unterschied: Der Absender verkauft ein Konkurrenzprodukt zur kostenlosen Mietrechtsberatung. Das muss im ersten Absatz stehen, nicht im letzten. Wer es verschweigt und dabei ertappt wird, ist dauerhaft verbrannt.

### Der Text

Betreff: **Hinweis zum Betriebskostenspiegel: zwei Fallstricke für Ratsuchende**

> Sehr geehrte Frau Bitter,
>
> ich betreibe NebenkostenRadar, ein kostenpflichtiges Online-Werkzeug zur Prüfung von Nebenkostenabrechnungen. Ich schreibe Ihnen nicht, um dafür zu werben, sondern weil mir bei der Arbeit daran zwei Dinge aufgefallen sind, die Ihre Ratsuchenden betreffen.
>
> Der Betriebskostenspiegel des Deutschen Mieterbundes ist der einzige bundesweit verfügbare Vergleichsmaßstab für Mieter, und er wird breit zur Selbstprüfung empfohlen. Zwei seiner Eigenschaften werden dabei selten mitgenannt.
>
> **Erstens ist er ein bundesweiter Durchschnitt ohne regionale Aufschlüsselung.** In Frankfurt liegt fast jede Abrechnung darüber, in strukturschwachen Regionen fast jede darunter. Beides sagt über die Richtigkeit der Abrechnung nichts aus. Wer den Spiegel wörtlich nimmt, beanstandet in teuren Städten zu viel und in günstigen Regionen zu wenig.
>
> **Zweitens werden verbrauchsabhängige Kosten pro Quadratmeter angegeben.** Wasser und Heizung hängen aber an der Personenzahl, nicht an der Wohnfläche. Ein Beispiel aus einer echten Frankfurter Abrechnung: 80,55 Quadratmeter, 113,64 Kubikmeter Wasser im Jahr. Das entspricht bei etwa 45 Kubikmetern pro Person einem Zweieinhalb-Personen-Haushalt, also einem völlig normalen Verbrauch. Gegen den Richtwert von 0,29 Euro je Quadratmeter und Monat gerechnet, erscheinen die 514,76 Euro dieser Abrechnung trotzdem als 84 Prozent über dem Durchschnitt.
>
> Ein Mieter, der daraufhin Einspruch erhebt, bekommt vom Vermieter zu Recht die Antwort, dass die Zähler eben diesen Verbrauch anzeigen. Das kostet ihn Glaubwürdigkeit für die Punkte, bei denen er tatsächlich recht hat.
>
> Falls das für Ihre Beratung oder eine Veröffentlichung nützlich ist, stelle ich Ihnen die Zahlen und die Primärquellen gern zur Verfügung, selbstverständlich auch ohne dass mein Angebot vorkommt. Wenn es für Sie nicht relevant ist, ignorieren Sie diese Mail bitte einfach, ich hake nicht nach.
>
> Mit freundlichen Grüßen
> Stefan Hennig
> NebenkostenRadar, Ludwigstr. 33-37, 60327 Frankfurt am Main
> nebenkostenradar.com

### Belegbarkeit der genannten Zahlen

Nichts davon ist geschätzt. Wer nachfragt, bekommt:

| Angabe | Herkunft |
|---|---|
| 2,67 €/m²/Monat gesamt, 0,29 € für Wasser und Abwasser | DMB-Betriebskostenspiegel, veröffentlicht 18.12.2025, Abrechnungsjahr 2024 |
| 80,55 m², 514,76 €, 113,64 m³ | reale Abrechnung, ABG Frankfurt, Abrechnungsjahr 2025 |
| 45 m³ pro Person und Jahr | gängiger Orientierungswert, im Anschreiben bewusst als „etwa" gekennzeichnet |
| 84 Prozent | 514,76 geteilt durch (0,29 × 80,55 × 12) = 280,31, nachgerechnet am 19.09.2026 |

### Was vor dem Absenden zu klären ist

Die Abrechnung stammt aus Stefans eigenem Haushalt. Wird daraus ein veröffentlichtes Beispiel, steht implizit sein Wasserverbrauch in der Zeitung. Das ist unproblematisch, sollte ihm aber bewusst sein. Alternativ lassen sich dieselben Verhältnisse mit gerundeten Werten darstellen, das kostet etwas Überzeugungskraft.

### Erwartung

Verbraucherzentralen antworten oft gar nicht, und wenn, dann nach Wochen. Kein Nachfassen, so steht es auch im Text. Der Wert liegt nicht in dieser einen Mail, sondern darin, bei einer späteren Veröffentlichung zum Thema als Hinweisgeber bekannt zu sein.

## 4. Reihenfolge, nach Aufwand und Ertrag

| # | Was | Aufwand | Erwarteter Ertrag |
|---|---|---|---|
| 1 | Titel des Betriebskostenspiegel-Artikels auf 2026 ändern | 10 Minuten | hoch, und messbar in der Search Console |
| 2 | Zwei bis drei Wochen warten, Search Console ansehen | — | zeigt, ob Punkt 1 gewirkt hat |
| 3 | URL jahresneutral machen, mit Weiterleitung | 30 Minuten | mittel, dauerhaft |
| 4 | 10 bis 20 Widget-Empfänger suchen und anschreiben | mehrere Stunden | unsicher, wirkt langsam, kostet nichts |
| 5 | Verbraucherzentrale Hessen anschreiben | 30 Minuten | unsicher, aber der einzige realistische Presse-Einstieg |
| 6 | Bei Erfolg: Stiftung Warentest, Finanztip, Haufe | — | erst mit Vorgeschichte sinnvoll |
| 7 | Google Ads | — | nein, siehe `q4-sichtbarkeit.md` |

Punkt 1 zuerst, weil er der einzige ist, der sofort wirkt, nichts kostet und sich eindeutig messen lässt.
