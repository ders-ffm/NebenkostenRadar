# Wo es wirklich klemmt

Stand: 11.09.2026. Anlass: Stefans Satz „Mir gehen für NebenkostenRadar die Ideen aus. Ich denke mehr Innovation kommt nicht mehr in das Produkt."

Kurzantwort vorab: **Mit der Einschätzung liegst du richtig, und das ist kein schlechtes Zeichen.** Das Produkt ist nicht der Engpass. Die Zahlen zeigen sehr genau, was der Engpass ist, und es ist nichts, was man durch ein weiteres Feature löst.

---

## 1. Die Zahl, um die es geht

Aus der Google Search Console, Zeitraum 13.06. bis 08.09.2026:

| Kennzahl | Wert |
|---|---|
| Impressionen | 992 |
| Klicks | 34 |
| Klickrate | 3,4 % |
| **Durchschnittliche Position** | **38,6** |

Position 38,6 bedeutet: Die Seite erscheint im Schnitt auf **Seite 4** der Suchergebnisse. Dorthin klickt praktisch niemand. Die Klickrate von 3,4 % täuscht, sie entsteht fast vollständig durch eine einzige Suchanfrage.

### Die Suchanfragen im Einzelnen

| Suchanfrage | Impressionen | Klicks |
|---|---|---|
| nebenkostenradar | 20 | **7** |
| betriebskostenspiegel | 52 | 0 |
| dmb betriebskostenspiegel | 31 | 0 |
| betriebskostenspiegel dmb | 27 | 0 |
| widerspruch nebenkostenabrechnung | 26 | 0 |
| betriebskostenspiegel 2023 | 24 | 0 |
| nebenkostenspiegel 2024 | 23 | 0 |
| betriebskostenspiegel hessen 2024 | 21 | 0 |
| **nebenkostenabrechnung prüfen lassen online** | **21** | **0** |
| dmb betriebskostenspiegel 2024 | 20 | 0 |

Die einzige Anfrage mit Klicks ist der **eigene Markenname**. Das sind Leute, die die Seite bereits kennen: du selbst, und vermutlich Menschen, die eine Meta-Anzeige gesehen und den Namen später gegoogelt haben.

Alle inhaltlichen Anfragen: **null Klicks bei Impressionen.**

Besonders bitter ist die neunte Zeile. „nebenkostenabrechnung prüfen lassen online" ist exakt die Anfrage eines Menschen, der genau dieses Produkt sucht und bereit ist, dafür zu zahlen. Er hat die Seite 21-mal angezeigt bekommen und ist 21-mal woanders hingegangen, weil sie auf Seite 4 stand.

---

## 2. Was daraus folgt

**Es ist kein Produktproblem.** Niemand hat das Produkt abgelehnt. Es hat noch fast niemand gesehen.

**Es ist auch kein Konversionsproblem.** Über eine Konversionsrate lässt sich erst reden, wenn Menschen ankommen. Bei 42 Startseitenbesuchern im Monat ist jede Aussage über Konversion statistisches Rauschen.

**Es ist ein Rangproblem.** Google kennt die Seite, ordnet sie aber niedrig ein. Das hat bei einer jungen Domain fast immer denselben Grund: zu wenig thematische Tiefe und zu wenig Verweise von anderen Seiten.

Deshalb ist deine Einschätzung, dass ins Produkt nicht mehr viel Innovation gehört, sachlich richtig. Weitere Funktionen würden an einer Stelle ansetzen, die gar nicht klemmt.

---

## 3. Der Teil, der bisher fehlt: was sich gerade erst geändert hat

Die 992 Impressionen und Position 38,6 stammen aus einem Zeitraum, in dem die Seite hatte:

- 10 Ratgeberartikel, davon zwei mit unsichtbarem Inhalt (der Rendering-Fehler bei Tabellen und Schritt-Anleitungen)
- kein Vorschaubild für geteilte Links
- eine Startseite ohne einen einzigen Satz im Quelltext
- Titel, die im Browser wieder überschrieben wurden
- eine Sitemap mit 13 statt 26 Einträgen

Das alles ist **seit gestern behoben**. Der Ratgeber ist von 10 auf 22 Artikel gewachsen, jeder mit eigener Rechtsgrundlage und eigenem Sucheinstieg.

Google braucht für so etwas typischerweise vier bis zwölf Wochen, bis es sich in Positionen niederschlägt. Die größte Änderung, die die Seite je an ihrer Sichtbarkeit erfahren hat, ist also **24 Stunden alt und noch nicht gemessen.**

Aus diesem Grund halte ich „mir gehen die Ideen aus" für verfrüht. Es ist eher: die letzte Idee ist gerade erst scharf gestellt worden und wartet auf ihr Ergebnis.

---

## 4. Warum die nächsten Wochen zählen

Der Abrechnungszeitraum ist bei den meisten Mietverhältnissen das Kalenderjahr. Nach § 556 Abs. 3 Satz 2 BGB muss die Abrechnung dem Mieter **spätestens zwölf Monate nach Ende des Abrechnungszeitraums** zugehen. Für das Jahr 2025 heißt das: bis zum **31.12.2026**.

Versäumt der Vermieter diese Frist, kann er eine Nachforderung in der Regel nicht mehr durchsetzen. Vermieter und Verwaltungen haben also einen harten wirtschaftlichen Anreiz, rechtzeitig zu verschicken.

**Belegter Teil:** die Frist selbst und ihre Rechtsfolge.
**Schlussfolgerung, nicht belegt:** dass sich der Versand dadurch im vierten Quartal ballt und die Nachfrage nach Prüfung entsprechend zwischen November und Februar am höchsten ist. Das ist plausibel, aber ich habe dazu keine belastbare Statistik gefunden. Wer es genau wissen will, kann es im Dezember an den eigenen Zahlen ablesen.

Falls die Annahme stimmt, ergibt sich daraus ein klarer Zeitplan: Was bis Anfang November nicht rankt, verpasst die Saison. Das sind rund acht Wochen.

---

## 5. Was tatsächlich am Rang dreht

Für eine junge Domain ohne Verweise gibt es genau drei Hebel. Zwei sind erledigt.

| Hebel | Stand |
|---|---|
| Technik (Indexierbarkeit, Titel, Sitemap, Ladezeit) | **erledigt**, abgesichert durch `npm run check` |
| Thematische Tiefe | **erledigt**, 22 Artikel statt 10 |
| **Verweise von anderen Seiten** | **offen**, und das ist der eigentliche Engpass |

Zum dritten Punkt: Google bewertet, wer sonst auf eine Seite verweist. NebenkostenRadar hat davon praktisch nichts. Genau deshalb steht die Seite bei „betriebskostenspiegel" auf Seite 4, während mieterbund.de, mineko.de und diverse Verlagsseiten davor stehen. Inhaltlich ist die eigene Seite dabei nicht schlechter. Sie ist nur unbekannt.

### Was dagegen hilft, in der Reihenfolge des Aufwands

**a) Das Einbett-Widget verteilen.**
Es existiert seit dem 09.09. unter `/widget.js` und wurde bisher niemandem angeboten. Es zeigt die DMB-Richtwerte-Tabelle und setzt darunter eine sichtbare Quellenangabe mit Rückverlinkung. Wer es einbindet, verlinkt auf nebenkostenradar.com.

Sinnvolle Adressaten: Blogs zu Immobilien und Verbraucherthemen, Wohnungsgenossenschaften, Studentenwerke, Betreiber von Mietrechts-Ratgebern ohne eigene Datenaufbereitung. Der Aufwand ist eine gut formulierte E-Mail pro Adressat.

**b) Dort auftauchen, wo Mieter tatsächlich fragen.**
Wenn eine Abrechnung ankommt und Fragen aufwirft, landen Menschen in Foren, nicht auf Google-Seite vier: gutefrage.net, das Forum von Wohnung-jetzt, Reddit r/de und r/Mietrecht, Facebook-Gruppen zu Mietrecht. Dort inhaltlich zu antworten, ohne Werbung, mit dem Link nur wo er wirklich passt, ist mühsam und funktioniert trotzdem, weil es eine der wenigen Methoden ist, die kein Budget braucht.

Wichtig: Das ist Arbeit von Hand und in der Ich-Form. Massenhaft platzierte Links wirken sofort wie Spam und schaden mehr, als sie nutzen.

**c) Presse und Verbraucherredaktionen.**
Der Aufhänger ist nicht das Produkt, sondern die Datenlage: „Der Betriebskostenspiegel des Deutschen Mieterbundes ist ein bundesweiter Durchschnitt ohne regionale Aufschlüsselung, deshalb erzeugt er systematisch Fehlalarme." Das ist ein echter, belegbarer Befund aus deiner eigenen Analyse und für eine Verbraucherredaktion interessanter als „neues Prüftool gestartet". Eine einzige Erwähnung bei Finanztip, test.de oder einer Regionalzeitung wiegt hundert Foreneinträge auf.

**d) Verteilung über Dritte statt über Suche.**
Mietervereine sind Wettbewerber und fallen aus. Aber: Verbraucherzentralen, Schuldner- und Sozialberatungen, Betriebs- und Personalräte, Studierendenwerke. Alle haben regelmäßig Menschen vor sich, die genau dieses Problem haben, und keine eigene Lösung dafür. Ein einziger solcher Partner ersetzt sehr viel SEO.

---

## 6. Die eine Produktänderung, die ich weiterhin für die wichtigste halte

Du hast V1 (kostenlose Vorprüfung mit sichtbarem Ergebnis vor der Zahlung) zurückgestellt. Das respektiere ich, und mit den obigen Zahlen im Rücken relativiert es sich sogar: Solange kaum jemand ankommt, ist die Konversion nicht das drängendste Problem.

Aber wenn der Rang steigt und Menschen ankommen, wird sie es sofort. Und dann gilt weiterhin, was zwei unabhängige Wettbewerber vormachen (servicechargeaudit.uk in Großbritannien, pruefenlassen.ch in der Schweiz): Beide zeigen ein Ergebnis, bevor sie Geld verlangen. Ein Unbekannter, der 9,99 € verlangt, bevor er irgendetwas gezeigt hat, verliert gegen einen Unbekannten, der erst zeigt und dann fragt.

Mein Vorschlag zum Zeitpunkt: **nicht jetzt, sondern sobald die Besucherzahl anzieht.** Dann ist der Umbau begründet durch Daten statt durch meine Vermutung, und du siehst am Vorher-Nachher, ob er wirkt.

---

## 7. Was ich konkret als Nächstes vorschlage

| # | Was | Warum jetzt | Aufwand |
|---|---|---|---|
| 1 | Nichts am Produkt ändern, vier Wochen warten | Die Wirkung der 22 Artikel ist noch nicht gemessen | keiner |
| 2 | Wöchentlich Position und Impressionen in der Search Console ablesen | Nur so lässt sich sehen, ob die Änderung greift | 5 Minuten |
| 3 | Widget aktiv anbieten, 10 bis 20 gut ausgewählte Adressaten | Der einzige fertige Baustein für Verweise, der brachliegt | mittel |
| 4 | Presse-Anschreiben zum Befund über den Betriebskostenspiegel | Höchster Hebel pro Aufwand, wenn es zieht | mittel |
| 5 | Foren, kontinuierlich und von Hand | Braucht kein Budget, wirkt langsam, aber echt | laufend |
| 6 | V1 vorbereiten, aber erst umsetzen, wenn Besucher da sind | Richtige Reihenfolge: erst Reichweite, dann Konversion | hoch, später |

---

## 8. Ein ehrliches Wort zum Schluss

Die Seite ist technisch und inhaltlich in einem Zustand, den viele kommerzielle Angebote in diesem Feld nicht haben: 22 fachlich korrekte Artikel mit belegten Urteilen, drei automatische Testreihen, saubere Rechtstexte, korrekte Datenquellen, ein Prüfbericht, der zwischen harter Beanstandung und statistischer Auffälligkeit unterscheidet, statt alles als Skandal zu verkaufen.

Was fehlt, ist nicht Substanz. Es ist Bekanntheit. Das ist die unangenehmere der beiden Lücken, weil sie sich nicht durch eine Nacht am Rechner schließen lässt. Aber sie ist auch die ehrlichere Ausgangslage: Ein gutes Produkt ohne Reichweite ist ein lösbares Problem. Reichweite für ein schlechtes Produkt wäre keines.
