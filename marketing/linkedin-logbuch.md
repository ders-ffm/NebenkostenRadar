# LinkedIn-Logbuch: NebenkostenRadar

Stand: 13.08.2026. Persönliche Posts (nicht die Marke, sondern Stefan als Person) — dokumentieren den Bau von NebenkostenRadar als Experiment: wie weit kommt man mit KI, wenn man selbst kein Entwickler/Marketer/Jurist ist, und wie wichtig ist dabei gutes Prompten. Das ist die durchgehende Schiene der ganzen Serie, nicht nur des Auftakt-Posts.

**Reihenfolge:** Post 1 zuerst (Auftakt), danach chronologisch nach dem tatsächlichen Zeitpunkt der jeweiligen Geschichte im Projekt (Datum steht jeweils in der Überschrift, nicht im Post-Text selbst — auf LinkedIn wirken Datumsangaben im Fließtext unnatürlich). Kadenz: alle 1–2 Wochen, dann wenn es einen echten Schritt zu berichten gibt, kein starrer Plan.

**Jeder Post endet bewusst mit einer offenen Frage** — Ziel ist Erfahrungsaustausch in den Kommentaren ("wer kennt das", "wie macht ihr das"), nicht nur Senden.

**Format-Hinweise für LinkedIn (anders als Insta/FB):** Kein Bild nötig, reiner Text reicht. Erste 2–3 Zeilen sind der Hook (der Rest wird hinter "…mehr anzeigen" versteckt) — wichtigste Aussage nach vorne. Kurze Absätze, Leerzeilen zwischen Gedanken. 2–3 Hashtags reichen, nicht mehr. Kein Verkaufston.

---

## Post 1 — Auftakt (gepostet 14.08.2026)

> Yeah, eine neue Aufgabe innerhalb der MMG! Langweilig wird's ohnehin nie. Angefangen im Kunden-Support, dann Abteilungsleitung und die Verantwortung für die interne Organisation. Jetzt kommt mit dem Produktmanagement ein weiterer Baustein hinzu. Mit dem tollsten Team der Welt (when you know, you know) werden wir unsere bestehenden Produkte und deren Websites aufs nächste Level heben. Wir arbeiten alle seit Jahren zusammen und ich freue mich auf viele weitere und bin ehrlich dankbar dafür.
>
> Parallel dazu und ausschließlich in meiner Freizeit habe ich außerdem ein kleines eigenes Projekt begonnen: NebenkostenRadar, ein Tool, das Nebenkostenabrechnungen automatisch prüft.
>
> Mit Programmieren, Compliance oder Online-Marketing hatte ich vorher keinerlei Berührungspunkte. Mein Antrieb: Herausfinden, wie weit ich tatsächlich komme, obwohl ich mich hier auf unbekanntes Terrain begebe. Wo die Grenzen liegen und wo nicht.
>
> Nicht mit dem Ziel große Umsätze zu machen sondern um Scheuklappen abzulegen und Prozesse zu begleiten, die außerhalb meiner eigentlichen Kompetenz liegen, administrativ wie operativ, einmal "mit Allem bitte" und zwar von A bis Z.
>
> Vielleicht schreibe ich über beide Themen künftig auch öfter — eine Art Logbuch über aktuelle Probleme, Hürden und Lösungsansätze, sowohl aus dem neuen Job als auch aus dem kleinen sideproject.
>
> Über Erfahrungen, Tipps und Denkanstöße freue ich mich - sowohl was Produktmanagement als auch das komplett selbstständige begleiten solcher Prozesse angeht.
>
> #produktmanagement #lebenslangeslernen #buildinpublic #sideproject #neuerjob

## Post 2 — Der Kurswechsel vor dem Start (früh in der Entwicklung)

> Mein ursprünglicher Plan: Nutzer tippen jede Position ihrer Nebenkostenabrechnung von Hand ein. Klang simpel.
>
> Dann hab ich's mit echten Abrechnungen getestet — und gemerkt: unrealistisch. Jeder Vermieter, jede Hausverwaltung macht das anders. Andere Positionsnamen, andere Reihenfolge, andere Detailtiefe. Kein starres Formular passt da wirklich drauf.
>
> Konsequenz, kurz vor dem geplanten Start: zurück auf Anfang. Statt Handeingabe hab ich eine Foto-/PDF-Upload-Funktion gebaut, die die Abrechnung automatisch ausliest.
>
> Ungeplanter Umweg, keine Frage. Aber ehrlich — das alte Formular hätte in der Praxis kaum jemand zu Ende ausgefüllt.
>
> Wer kennt das: eine erste Idee verworfen, weil die Realität komplexer war als am Schreibtisch gedacht? Wie seid ihr da rangegangen?

## Post 3 — Der Bug, den ich zweimal fixen musste (12.–13.08.2026)

> Beim Testen mit meiner eigenen Abrechnung stimmte die Summe nicht. 80,87 € Differenz, die sich einfach nicht erklären ließ. Erstmal ratlos.
>
> Dann die Ursache gefunden: Die CO2-Kosten standen auf einer Extra-Seite (Pflichtangabe seit diesem Jahr), waren aber rechnerisch schon in den Heizkosten drin. Wer sie zusätzlich einträgt, zählt doppelt.
>
> Am nächsten Tag — derselbe Fehler nochmal. Diesmal an einer anderen Stelle im Code, die ich beim ersten Fix übersehen hatte. Gleicher Bug, zweites Mal richtig gefixt.
>
> Eigene Daten zum Testen zu nehmen ist unbequem, ehrlich gesagt auch etwas nervig. Aber genau das findet Dinge, die kein synthetischer Testfall findet.
>
> Testet ihr eigene Tools mit echten eigenen Daten, oder reicht euch synthetisches Testmaterial? Was habt ihr dabei schon übersehen?

## Post 4 — Der Live-Timeout-Bug (13.08.2026)

> Erste echte Nebenkostenabrechnung hochgeladen — dreimal hintereinander gescheitert. Meldung: "kann nicht ausgewertet werden". Kein gutes Gefühl.
>
> Ursache: Die Foto-Erkennung lief serverseitig gegen ein Zeitlimit von 60 Sekunden. Bei einer dichten Abrechnung mit 15+ Einzelpositionen reicht das einfach nicht immer.
>
> Fix: Limit auf 180 Sekunden hochgesetzt — vorher natürlich geprüft, ob der Hosting-Plan das überhaupt zulässt. Tat er, über eine Einstellung, die ich vorher gar nicht kannte.
>
> Der erste echte Nutzer meines eigenen Tools war übrigens ich selbst. Hat sich gelohnt.
>
> Wer kennt das: ein Wert, der in den meisten Fällen passt, aber beim komplexeren Rest reißt? Wie geht ihr mit solchen Grenzfällen um?

## Post 5 — Die rechtliche Seite, die ich unterschätzt habe (13.08.2026)

> Wer online etwas verkauft, muss über das Widerrufsrecht informieren — auch wenn man es später ausschließen will. Klingt banal, war's für mich nicht.
>
> Hatte ich zunächst falsch im Kopf: einfach behaupten, es gelte keins. Falsch. Es gilt grundsätzlich, außer der Kunde stimmt aktiv zu, dass sofort mit der Leistung begonnen wird — und wird klar darüber informiert, dass er dadurch sein Recht verliert.
>
> Und dann kommt noch dazu: Die Beweislast liegt bei mir. Also reicht keine Checkbox im Formular, sondern es braucht eine nachweisbare, serverseitig gespeicherte Zustimmung mit Zeitstempel.
>
> Nichts davon stand auf meinem Schirm, bevor ich es gebraucht habe.
>
> Wer hat sich auch schon mal durch deutsches Verbraucherrecht gekämpft, ohne Jurist zu sein? Was war eure größte Überraschung?

## Post 6 — Falsche erste Vermutung, dann der echte Befund (13.08.2026)

> Google hatte nur 9 von 16 Seiten meines kleinen Projekts indexiert. Erste Vermutung: doppelte Inhalte.
>
> Falsch. Beim genauen Nachschauen waren es tote Links in der Sitemap — Reste aus Testläufen, die nie aufgeräumt wurden. Google fand die URL, bekam aber nur "Seite nicht gefunden".
>
> Zweiter, echter Befund: Die Seite ist eine reine JavaScript-App. Google sieht beim ersten, schnellen Scan erstmal nur eine leere Hülle, den eigentlichen Inhalt erst in einem zweiten, langsameren Durchlauf — wenn überhaupt zuverlässig.
>
> Beides jetzt behoben. Ob's wirkt, sehe ich in den nächsten Wochen in der Search Console.
>
> Erste Vermutung falsch, zweite dann richtig — kennt ihr das aus eigenen Debugging-Geschichten? Wie oft lag eure erste Theorie daneben?

## Post 7 — Was ich für organisches Wachstum tue, ganz ohne Werbebudget (13.08.2026, aktueller Stand)

> Kein Marketingbudget, also bleibt nur eine Stellschraube: organisch gefunden werden.
>
> Konkret bisher: Ratgeber-Artikel zu echten Nutzerfragen (Fristen, Rechte, häufige Fehler in Abrechnungen) statt nur Produktseiten. Die Artikel serverseitig vorgerendert, damit Google den Inhalt auch ohne JavaScript sofort sieht. Tote Links aus der Sitemap entfernt, damit keine Crawl-Kapazität an Seiten verschwendet wird, die es gar nicht mehr gibt.
>
> Nächster Schritt: beobachten, was in der Search Console tatsächlich ankommt, und nachschärfen statt raten.
>
> 1–2 Stunden pro Woche, kein Budget — heißt im Klartext: jede Maßnahme muss sich mehrfach auszahlen. Einmal bauen, nicht dauerhaft betreuen.
>
> Wie macht ihr das mit organischem Wachstum ohne Budget? Was hat bei euch am meisten gebracht — und was war am Ende Zeitverschwendung?

---

## Ideen für weitere Posts (noch nicht ausformuliert)

- Der Fehlalarm im automatischen Richtwerte-Monitor (Google-Suche-Jahr vs. Anzeigetext im Code, 13.08.2026) — kleine, aber lehrreiche Geschichte über String-Vergleiche und Alarm-Müdigkeit.
- Erste echte GSC-Zahlen (16 Klicks, 746 Impressionen) — roh und ungeschönt zeigen, wie klein der Start ist.
- Entscheidung, wie viel Widerrufsrecht/AGB von einer fremden Vorlage übernommen werden darf und wie viel angepasst werden musste (§ 356 Abs. 5 vs. Abs. 4 BGB — falsche Vorlage hätte falsche Rechtsgrundlage bedeutet).
