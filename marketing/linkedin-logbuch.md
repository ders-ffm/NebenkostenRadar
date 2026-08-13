# LinkedIn-Logbuch: NebenkostenRadar

Stand: 13.08.2026. Persönliche Posts (nicht die Marke, sondern Stefan als Person) — dokumentieren den Bau von NebenkostenRadar als Experiment: wie weit kommt man mit KI, wenn man selbst kein Entwickler/Marketer/Jurist ist, und wie wichtig ist dabei gutes Prompten. Das ist die durchgehende Schiene der ganzen Serie, nicht nur des Auftakt-Posts. Kadenz: alle 1–2 Wochen, dann wenn es einen echten Schritt zu berichten gibt, kein starrer Plan. Reihenfolge unten ist ein Vorschlag, keine Pflicht — nimm, was gerade passt.

**Format-Hinweise für LinkedIn (anders als Insta/FB):** Kein Bild nötig, reiner Text reicht. Erste 2–3 Zeilen sind der Hook (der Rest wird hinter "…mehr anzeigen" versteckt) — wichtigste Aussage nach vorne. Kurze Absätze, Leerzeilen zwischen Gedanken. 2–3 Hashtags reichen, nicht mehr. Kein Verkaufston.

---

## Post 1 — Auftakt

> Neue Aufgabe bei der MMG: Als Produktmanager bringe ich mit einem starken Team bestehende Produkte und deren Websites aufs nächste Level. Wir arbeiten seit Jahren zusammen, ich freue mich auf viele weitere Jahre.
>
> Parallel dazu, in meiner Freizeit, ein kleines eigenes Projekt: NebenkostenRadar, ein Tool, das Nebenkostenabrechnungen automatisch prüft.
>
> Mit Programmieren, Rechtstexten oder Online-Marketing hatte ich vorher keinerlei Berührungspunkte. Der eigentliche Antrieb: herausfinden, wie weit man mit KI tatsächlich kommt, wenn man selbst keine dieser Fähigkeiten mitbringt. Wie wichtig gutes Prompten wirklich ist. Wo die Grenzen liegen — und wo nicht.
>
> Nicht mit dem Ziel, große Umsätze zu machen — sondern um Scheuklappen abzulegen und Prozesse zu begleiten, die außerhalb meiner eigentlichen Kompetenz liegen, administrativ wie exekutiv, von A bis Z. Grenzen ausloten, Hürden überwinden — und das hier als Logbuch dokumentieren.
>
> Die nächsten Posts: Schritt für Schritt, was passiert ist, welche Probleme auftauchen, wie KI dabei geholfen hat (und wo nicht). Ausgang ungewiss. Über Tipps, Tricks und Denkanstöße freue ich mich.
>
> #buildinpublic #ki #sideproject

## Post 2 — Der erste echte Bug (Live-Timeout)

> Erste echte Nebenkostenabrechnung hochgeladen, dreimal hintereinander gescheitert. Meldung: "kann nicht ausgewertet werden".
>
> Ursache: Die Foto-Erkennung lief serverseitig gegen ein Zeitlimit von 60 Sekunden. Bei einer dichten Abrechnung mit 15+ Einzelpositionen reicht das nicht immer.
>
> Fix: Limit auf 180 Sekunden hochgesetzt — vorher geprüft, ob der Hosting-Plan das überhaupt zulässt. Tat er, mit einer Einstellung, die ich vorher nicht kannte.
>
> Der erste echte Nutzer meines eigenen Tools war ich selbst. Hat sich gelohnt.

## Post 3 — Der Bug, den ich zweimal fixen musste

> Beim Testen mit meiner eigenen Abrechnung stimmte die Summe nicht: 80,87 € Differenz, die sich nicht erklären ließ.
>
> Ursache gefunden: Die CO2-Kosten standen auf einer Extra-Seite der Abrechnung (Pflichtangabe seit diesem Jahr), waren aber rechnerisch schon in den Heizkosten enthalten. Wer sie zusätzlich einträgt, zählt doppelt.
>
> Ein paar Tage später derselbe Fehler nochmal — diesmal an einer anderen Stelle im Code, die ich beim ersten Fix übersehen hatte. Gleicher Bug, zweites Mal richtig gefixt.
>
> Eigene Daten zum Testen zu benutzen, ist unbequem. Aber es findet Dinge, die kein synthetischer Testfall findet.

## Post 4 — Die rechtliche Seite, die ich unterschätzt habe

> Wer online etwas verkauft, muss über das Widerrufsrecht informieren — auch wenn man es später ausschließen will.
>
> Hatte ich zunächst falsch im Kopf: einfach behaupten, es gelte keins. Falsch. Es gilt grundsätzlich, es sei denn, der Kunde stimmt aktiv zu, dass sofort mit der Leistung begonnen wird, und wird darüber informiert, dass er dadurch sein Recht verliert.
>
> Und: Die Beweislast dafür liegt bei mir. Also nicht nur eine Checkbox im Formular, sondern eine nachweisbare, serverseitig gespeicherte Zustimmung mit Zeitstempel.
>
> Nichts davon stand auf meinem Schirm, bevor ich es gebraucht habe.

## Post 5 — Falsche erste Vermutung, dann der echte Befund

> Google hatte nur 9 von 16 Seiten meines kleinen Projekts indexiert. Erste Vermutung: doppelte Inhalte.
>
> Falsch. Beim genauen Nachschauen waren es tote Links in der Sitemap — Reste aus Testläufen, die nie aufgeräumt wurden. Google fand die URL, bekam aber "Seite nicht gefunden".
>
> Zweiter, echter Befund: Die Seite ist eine reine JavaScript-App. Google sieht beim ersten, schnellen Scan nur eine leere Hülle, den Inhalt erst in einem zweiten, langsameren Durchlauf — wenn überhaupt zuverlässig.
>
> Beides jetzt behoben. Ob es wirkt, sehe ich in den nächsten Wochen in der Search Console.

## Post 6 — Der Kurswechsel kurz vor dem geplanten Start

> Kurz vor dem geplanten Launch der erste echte Reality-Check: Nutzer sollten jede Position ihrer Nebenkostenabrechnung von Hand eintippen.
>
> Beim Testen mit echten Abrechnungen wurde klar: unrealistisch. Jeder Vermieter, jede Hausverwaltung strukturiert anders — andere Positionsnamen, andere Reihenfolge, andere Detailtiefe. Ein starres Eingabeformular passt zu keiner echten Abrechnung wirklich.
>
> Konsequenz: zurück auf Anfang, kurz vor dem geplanten Start. Statt Handeingabe eine Foto-/PDF-Upload-Funktion gebaut, die die Abrechnung automatisch ausliest.
>
> Ungeplanter Umweg. Aber das ursprüngliche Formular hätte in der Praxis kaum jemand zu Ende ausgefüllt.

## Post 7 — Was ich für organisches Wachstum tue (ohne Werbebudget)

> Kein Marketingbudget, also die einzige Stellschraube: organisch gefunden werden.
>
> Konkret bisher: Ratgeber-Artikel zu echten Nutzerfragen (Fristen, Rechte, häufige Fehler in Abrechnungen) statt nur Produktseiten. Die Artikel serverseitig vorgerendert, damit Google den Inhalt auch ohne JavaScript sofort sieht. Tote Links aus der Sitemap entfernt, damit keine Crawl-Kapazität an Seiten verschwendet wird, die es gar nicht gibt.
>
> Nächster Schritt: beobachten, was in der Search Console tatsächlich ankommt, und nachschärfen statt raten.
>
> 1–2 Stunden pro Woche, kein Budget — heißt: jede Maßnahme muss sich mehrfach auszahlen, einmalig bauen statt dauerhaft betreuen.

---

## Ideen für weitere Posts (noch nicht ausformuliert)

- Der Fehlalarm im automatischen Richtwerte-Monitor (Google-Suche-Jahr vs. Anzeigetext im Code) — kleine, aber lehrreiche Geschichte über String-Vergleiche und Alarm-Müdigkeit.
- Erste echte GSC-Zahlen (16 Klicks, 746 Impressionen) — roh und ungeschönt zeigen, wie klein der Start ist.
- Entscheidung, wie viel Widerrufsrecht/AGB von einer fremden Vorlage übernommen werden darf und wie viel angepasst werden musste (§ 356 Abs. 5 vs. Abs. 4 BGB — falsche Vorlage hätte falsche Rechtsgrundlage bedeutet).
