// NebenkostenRadar — Ratgeber-Artikel
// Diese Datei wird vom Rechtsmonitor (scripts/rechtsmonitor.mjs) automatisch erweitert.
// Neue Artikel werden am Array-Anfang eingefügt (neueste zuerst).
// Alte Artikel NIEMALS löschen — sie ranken bei Google weiter.
//
// BEREINIGUNG 26.07.2026: Durch einen Bug im Rechtsmonitor-Skript (KI hat sich
// die "id" pro Lauf neu ausgedacht statt sie deterministisch aus dem Thema
// abzuleiten) sind beim Testen mehrfach Duplikate zum selben Thema entstanden
// ("Heizkostenabrechnung häufigste Fehler" 3x, "BGH-Urteile 2026" 2x). Da diese
// Duplikate erst Stunden alt waren und von Google noch nicht indexiert wurden,
// wurden die schwächeren Kopien entfernt (u.a. zwei mit kaputten <cite>-Tags
// aus der Websuche im sichtbaren Text). Der Root-Cause-Fix ist in
// scripts/rechtsmonitor.mjs umgesetzt (deterministische ID-Vergabe).
// ───────────────────────────────────────────────────────────────────────────
// PLATZHALTER {JAHR}, eingeführt 19.09.2026 auf Stefans Hinweis
//
// DAS PROBLEM: Der Artikel zum Betriebskostenspiegel trägt das laufende Jahr
// im Titel, weil Mieter danach suchen. Fest eingetippt wäre er ab dem
// 1. Januar falsch und jemand müsste jedes Jahr daran denken. Genau das
// passiert erfahrungsgemäß nicht.
//
// DIE LÖSUNG: Wo "das laufende Jahr" gemeint ist, steht {JAHR}. Die Ersetzung
// passiert ganz unten in dieser Datei, in einem Durchgang über alle Texte.
// Alle anderen Jahreszahlen bleiben fest eingetippt, und das ist Absicht:
// "Grundsteuerreform 2026" und "BGH-Urteile 2026" bezeichnen tatsächliche
// Ereignisse. Würden die mitwandern, stünde dort irgendwann etwas Falsches.
//
// FAUSTREGEL BEIM SCHREIBEN NEUER ARTIKEL:
//   Meint die Jahreszahl "jetzt gerade"?        -> {JAHR}
//   Meint sie ein bestimmtes Jahr oder Ereignis? -> Zahl ausschreiben
//
// WICHTIG ZUR WIRKUNG: Im Browser wird {JAHR} bei jedem Seitenaufruf ersetzt,
// dort stimmt es also immer. Google liest aber die vorgerenderten Dateien aus
// dem Build. Damit die Jahreszahl dort mitwandert, muss einmal im Jahr neu
// gebaut werden. Das erledigt .github/workflows/jahreswechsel.yml.
// ───────────────────────────────────────────────────────────────────────────
const ARTIKEL_ROH = [
    {
      id: "grundsteuerreform-2026-auswirkungen-auf-die-nebenkostenabrechnung",
      titelKurz: "Grundsteuerreform 2026 in der Abrechnung",
      titel: "Grundsteuerreform 2026: Auswirkungen auf die Nebenkostenabrechnung für Mieter",
      teaser: "Die neuen Grundsteuerwerte tauchen 2026 erstmals in vielen Nebenkostenabrechnungen auf, mit teils erheblichen Nachzahlungen. Dieser Ratgeber erklärt, welche Rechtsgrundlage gilt, was Sie prüfen sollten und wann Sie sich gegen eine überhöhte Umlage wehren können.",
      datum: "September 2026",
      lesezeit: "9 Min.",
      bild: "/artikelbilder/grundsteuerreform-2026-auswirkungen-auf-die-nebenkostenabrechnung.jpg",
      bildAlt: "Steuerformulare mit Taschenrechner auf einem Schreibtisch",
      kategorie: "Mietrecht",
      keywords: [],
      inhalt: [
        {
                "typ": "intro",
                "text": "Viele Mieter erhalten in diesen Wochen ihre Nebenkostenabrechnung für das Jahr 2025 und stoßen dort erstmals auf einen deutlich veränderten Posten: die Grundsteuer. Grund dafür ist die Grundsteuerreform, die zum 1. Januar 2025 in Kraft getreten ist und die Bemessungsgrundlage für praktisch jedes Grundstück in Deutschland neu berechnet hat. Wer eine überraschend hohe Nachforderung in seiner Abrechnung findet, sollte wissen, worauf sich diese stützt und wo die Grenzen der Umlage liegen."
        },
        {
                "typ": "h2",
                "text": "Warum wurde die Grundsteuer überhaupt reformiert?"
        },
        {
                "typ": "text",
                "text": "Auslöser der Reform war eine höchstrichterliche Entscheidung. Das Bundesverfassungsgericht erklärte die alte Grundsteuerbemessung 2018 für verfassungswidrig, weil sie auf völlig veralteten Einheitswerten aus dem Jahr 1964 in Westdeutschland und 1935 in Ostdeutschland beruhte. Der Gesetzgeber musste daraufhin eine neue Bewertungsgrundlage schaffen, die seit dem 1. Januar 2025 bundesweit gilt. Dabei durfte jedes Bundesland eigene Berechnungsmodelle festlegen: Bayern, Baden-Württemberg und einige weitere Länder wählten eigene Modelle, während in den übrigen Ländern das sogenannte Bundesmodell zur Anwendung kommt."
        },
        {
                "typ": "h2",
                "text": "Ändert sich die Umlagefähigkeit der Grundsteuer?"
        },
        {
                "typ": "text",
                "text": "Die Reform betrifft ausschließlich die Berechnung der Grundsteuer, nicht ihre grundsätzliche Umlagefähigkeit. Rechtsgrundlage bleibt § 2 Nr. 1 der Betriebskostenverordnung (BetrKV), der die Grundsteuer als erste von siebzehn Betriebskostenarten ausdrücklich als laufende öffentliche Last des Grundstücks benennt. Damit ein Vermieter diese Kosten tatsächlich auf Sie umlegen darf, muss die Umlage der Betriebskosten im Mietvertrag wirksam vereinbart worden sein, wobei bei Wohnraummietverhältnissen die strengeren Anforderungen des § 556 BGB gelten. Fehlt eine solche Klausel im Mietvertrag vollständig, etwa bei einer reinen Bruttomiete ohne jeden Betriebskostenbezug, bleibt die Grundsteuer beim Vermieter, unabhängig davon, wie stark sie durch die Reform gestiegen ist."
        },
        {
                "typ": "text",
                "text": "Praktisch reicht dabei häufig schon ein pauschaler Verweis im Mietvertrag auf § 2 BetrKV. Der Bundesgerichtshof hat bereits mit Urteil vom 7. April 2004 (Az. VIII ZR 167/03) entschieden, dass ein solcher Verweis genügt, damit alle dort aufgeführten Positionen und damit auch die Grundsteuer, als vereinbart gelten. Eine gesonderte, namentliche Nennung der Grundsteuer im Vertrag ist also nicht zwingend erforderlich."
        },
        {
                "typ": "h2",
                "text": "Wann taucht die neue Grundsteuer erstmals in Ihrer Abrechnung auf?"
        },
        {
                "typ": "text",
                "text": "Auch wenn die neuen Grundsteuerwerte bereits ab dem 1. Januar 2025 gelten, erfolgt die Abrechnung der Betriebskosten üblicherweise erst nach Ablauf des Kalenderjahres. Die konkreten finanziellen Veränderungen werden für Mieter deshalb erstmals mit der Nebenkostenabrechnung für das Kalenderjahr 2025 spürbar, die üblicherweise im Laufe des Jahres 2026 zugeht. Da viele Vermieter diese Abrechnung erst gegen Ende des Jahres verschicken, sehen viele Mieter die neue, höhere Grundsteuer zum ersten Mal in einer Abrechnung, die bereits ein ganzes Jahr zurückliegt, häufig verbunden mit einer Nachzahlung, die auf einen Schlag fällig wird."
        },
        {
                "typ": "verweis",
                "ziel": "betriebskostenabrechnung-fristen-und-verjaehrung-2026",
                "text": "Welche Frist Ihr Vermieter für die Zusendung der Jahresabrechnung überhaupt einhalten muss und wann Ansprüche verjähren, erfahren Sie im Ratgeber zu Fristen und Verjährung bei der Betriebskostenabrechnung."
        },
        {
                "typ": "h2",
                "text": "Regionale Unterschiede: Warum die Erhöhung so stark variiert"
        },
        {
                "typ": "text",
                "text": "Die Auswirkungen der Reform fallen je nach Region und Immobilienlage sehr unterschiedlich aus. In begehrten Metropolregionen und Ballungszentren wie München oder Berlin, wo die Bodenrichtwerte in den letzten Jahren erheblich gestiegen sind, ist tendenziell mit deutlichen Steigerungen der Grundsteuer zu rechnen. In der Praxis werden dabei mitunter Erhöhungen von teils 30 bis 100 Prozent in gefragten Lagen beobachtet, während die Grundsteuer in strukturschwächeren Regionen stagnieren oder sogar sinken kann. Ein pauschaler Vergleich mit dem Vorjahreswert ist deshalb wenig aussagekräftig, entscheidend ist der aktuelle Bescheid für Ihr konkretes Objekt."
        },
        {
                "typ": "h2",
                "text": "Wie die Grundsteuer auf Sie als Mieter verteilt wird"
        },
        {
                "typ": "text",
                "text": "Für die Verteilung der Grundsteuer auf einzelne Mietparteien gilt grundsätzlich der Verteilerschlüssel, der im Mietvertrag vereinbart wurde. Fehlt eine ausdrückliche Vereinbarung, wird üblicherweise die Wohnfläche als Maßstab herangezogen, wie es § 556a Abs. 1 Satz 1 BGB vorsieht. Bei gemischt genutzten Objekten mit Gewerbe- und Wohnflächen kann es zudem erforderlich sein, die Grundsteuer zu unterschiedlichen Anteilen umzulegen, da Gewerbeeinheiten häufig andere Bewertungsfaktoren haben als Wohnraum."
        },
        {
                "typ": "liste",
                "items": [
                        "Mietvertrag prüfen: Enthält er eine Betriebskostenklausel oder einen Verweis auf § 2 BetrKV?",
                        "Verteilerschlüssel nachvollziehen: Wurde die Grundsteuer nach Wohnfläche oder einem anderen vereinbarten Maßstab verteilt?",
                        "Grundsteuerbescheid einsehen: Sie können vom Vermieter Einsicht in den aktuellen Bescheid verlangen, der als Beleg der Abrechnung zugrunde liegt.",
                        "Abrechnungszeitraum kontrollieren: Wurde der neue, höhere Betrag nur für den Zeitraum angesetzt, in dem er tatsächlich galt?",
                        "Nachforderungen für mehrere Jahre hinterfragen: Fordert die Gemeinde Grundsteuer für vergangene Jahre nach, muss die periodengerechte Zuordnung zum jeweiligen Abrechnungsjahr stimmen."
                ]
        },
        {
                "typ": "h2",
                "text": "Zeitanteilige Berechnung, wenn sich der Hebesatz unterjährig ändert"
        },
        {
                "typ": "text",
                "text": "Eine Besonderheit ergibt sich, wenn eine Kommune den neuen Hebesatz nicht zum Jahresbeginn, sondern erst im Laufe des Jahres beschlossen hat. In solchen Fällen muss der Vermieter den Abrechnungszeitraum unter Umständen in zwei Teilperioden splitten und die alte sowie die neue Grundsteuer jeweils anteilig berechnen. Diese zeitanteilige Berechnung, auch pro rata temporis genannt, ist in der Betriebskostenabrechnung zulässig und im Streitfall auch geboten. Taucht in Ihrer Abrechnung ein einheitlicher Jahresbetrag auf, obwohl der Hebesatz sich unterjährig geändert hat, ist das ein berechtigter Prüfpunkt."
        },
        {
                "typ": "hinweis",
                "text": "Eine rückwirkende Umlage der Grundsteuer ist nur für Zeiträume zulässig, in denen bereits eine entsprechende vertragliche Vereinbarung bestand. Wurde die Betriebskostenklausel erst nachträglich in den Mietvertrag aufgenommen, darf der Vermieter die Grundsteuer nicht für Zeiträume davor nachfordern."
        },
        {
                "typ": "h2",
                "text": "Vorauszahlung anpassen: Was gilt nach § 560 Abs. 4 BGB?"
        },
        {
                "typ": "text",
                "text": "Liegt die erste Betriebskostenabrechnung mit der neuen, höheren Grundsteuer vor, kann der Vermieter die monatliche Vorauszahlung anpassen. Rechtsgrundlage dafür ist § 560 Abs. 4 BGB: Sind Betriebskostenvorauszahlungen vereinbart worden, kann jede Vertragspartei nach einer Abrechnung durch Erklärung in Textform eine Anpassung auf eine angemessene Höhe vornehmen. Die Erklärung muss also in Textform erfolgen und die neue Höhe nachvollziehbar auf die vorangegangene Abrechnung stützen. Eine Zustimmung Ihrerseits ist dafür nicht erforderlich: die Anpassung wirkt als einseitige Erklärung, sobald sie Ihnen zugeht."
        },
        {
                "typ": "text",
                "text": "Wichtig ist die Grenze der Angemessenheit. Bei der Berechnung des Erhöhungsbetrags ist die Grenze der angemessenen Höhe im Sinne des § 556 Abs. 2 Satz 2 BGB zu beachten, wonach die Nachforderung aus der Abrechnung durch zwölf Monate geteilt wird. Eine Vorauszahlungserhöhung, die deutlich über diesen rechnerischen Wert hinausgeht, etwa weil zusätzlich ein pauschaler Sicherheitszuschlag eingerechnet wurde, ist rechtlich angreifbar."
        },
        {
                "typ": "h2",
                "text": "Zusammenspiel mit anderen Betriebskostenarten"
        },
        {
                "typ": "text",
                "text": "Die Grundsteuer steht in der Abrechnung selten allein. Wer die Gesamtabrechnung prüft, sollte auch die übrigen Kostenpositionen im Blick behalten, da Fehler bei mehreren Posten gleichzeitig auftreten können."
        },
        {
                "typ": "verweis",
                "ziel": "hausmeisterkosten-in-der-nebenkostenabrechnung-was-ist-umlagefaehig",
                "text": "Welche Hausmeisterleistungen tatsächlich umlagefähig sind und wo die Grenze zu nicht umlagefähigen Verwaltungstätigkeiten liegt, lesen Sie im separaten Ratgeber dazu."
        },
        {
                "typ": "verweis",
                "ziel": "muellgebuehren-und-abfallentsorgung-als-betriebskosten-2026",
                "text": "Auch bei den Müllgebühren lohnt sich ein Blick auf die korrekte Verteilung, da hier ähnliche Prüfmaßstäbe wie bei der Grundsteuer gelten."
        },
        {
                "typ": "verweis",
                "ziel": "wasserkosten-und-kaltwasserzaehler-in-der-nebenkostenabrechnung",
                "text": "Wie Wasserkosten korrekt erfasst und verteilt werden müssen, erklärt der Ratgeber zu Kaltwasserzählern und Wasserkosten."
        },
        {
                "typ": "verweis",
                "ziel": "heizkostenabrechnung-vermieterfehler-2026-leitfaden",
                "text": "Bei der Heizkostenabrechnung passieren besonders häufig Fehler: ein Überblick zu den typischen Vermieterfehlern hilft, auch diesen Posten kritisch zu prüfen."
        },
        {
                "typ": "verweis",
                "ziel": "kabelanschluss-nicht-umlagefaehig",
                "text": "Dass sich der Katalog umlagefähiger Betriebskosten auch in anderer Richtung verändert, zeigt der Wegfall der Kabelanschlussgebühren als umlagefähige Position seit Juli 2024."
        },
        {
                "typ": "h2",
                "text": "Aktuelle Rechtsprechung im Blick behalten"
        },
        {
                "typ": "text",
                "text": "Da die Grundsteuerreform noch relativ neu ist, ist mit weiterer Rechtsprechung zu einzelnen Detailfragen zu rechnen, etwa zur zeitanteiligen Berechnung bei unterjährigen Hebesatzänderungen oder zur Angemessenheit von Vorauszahlungsanpassungen."
        },
        {
                "typ": "verweis",
                "ziel": "bgh-urteile-mietrecht-nebenkosten-2026",
                "text": "Eine laufend aktualisierte Übersicht aktueller BGH-Entscheidungen zum Nebenkostenrecht finden Sie in der Urteilsübersicht für 2026."
        },
        {
                "typ": "verweis",
                "ziel": "betriebskostenspiegel-2024",
                "text": "Ob der Gesamtbetrag Ihrer Nebenkosten trotz der Grundsteuererhöhung noch im üblichen Rahmen liegt, lässt sich anhand des Betriebskostenspiegels des Deutschen Mieterbunds einordnen."
        },
        {
                "typ": "h2",
                "text": "Was tun, wenn die Abrechnung fehlerhaft erscheint?"
        },
        {
                "typ": "text",
                "text": "Stellen Sie nach der Prüfung fest, dass die Grundsteuer falsch berechnet, ohne wirksame Vertragsgrundlage umgelegt oder nach dem falschen Schlüssel verteilt wurde, müssen Sie die Nachforderung nicht kommentarlos akzeptieren."
        },
        {
                "typ": "verweis",
                "ziel": "widerspruch-nebenkostenabrechnung",
                "text": "Wie Sie formal korrekt Widerspruch gegen eine fehlerhafte Nebenkostenabrechnung einlegen und welche Frist dabei gilt, erklärt die Schritt-für-Schritt-Anleitung mit Musterschreiben."
        },
        {
                "typ": "cta",
                "text": "Jetzt Abrechnung kostenlos prüfen lassen."
        }
],
    },
    {
      id: "hausmeisterkosten-in-der-nebenkostenabrechnung-was-ist-umlagefaehig",
      titelKurz: "Hausmeisterkosten: was ist umlagefähig?",
      titel: "Hausmeisterkosten in der Nebenkostenabrechnung 2026: Was ist umlagefähig und was nicht?",
      teaser: "Hausmeisterkosten zählen zu den häufigsten Streitpunkten in der Nebenkostenabrechnung, weil Vermieter oft Verwaltungs- und Reparaturarbeiten mit einrechnen, die Mieter gar nicht zahlen müssen. Dieser Ratgeber zeigt, welche Tätigkeiten wirklich umlagefähig sind und wie Sie typische Fehler in Ihrer Abrechnung erkennen.",
      datum: "August 2026",
      lesezeit: "8 Min.",
      bild: "/artikelbilder/hausmeisterkosten-in-der-nebenkostenabrechnung-was-ist-umlagefaehig.jpg",
      bildAlt: "Eimer und Besen im Hausflur",
      kategorie: "Mietrecht",
      keywords: [],
      inhalt: [
        {
                "typ": "intro",
                "text": "Kaum eine Position in der Nebenkostenabrechnung sorgt für so viel Verwirrung wie die Hausmeisterkosten. Das liegt daran, dass ein Hausmeister ganz unterschiedliche Aufgaben übernimmt, manche davon dürfen auf Sie als Mieter umgelegt werden, andere ausdrücklich nicht. Wer die Grenzen kennt, kann seine Abrechnung gezielt prüfen und überzahlte Beträge zurückfordern."
        },
        {
                "typ": "h2",
                "text": "Die rechtliche Grundlage: § 2 Nr. 14 BetrKV"
        },
        {
                "typ": "text",
                "text": "Die Umlage von Hausmeisterkosten stützt sich auf § 2 Nr. 14 der Betriebskostenverordnung. Die Vorschrift erlaubt ausdrücklich die Umlage der Kosten des Hauswarts, definiert jedoch gleichzeitig eine wichtige Einschränkung: Nur solche Tätigkeiten sind umlagefähig, die nicht bereits unter andere Betriebskostenpositionen fallen und keine Verwaltungs- oder Instandhaltungsarbeiten darstellen. Ergänzend gilt § 556 BGB, wonach nur vertraglich vereinbarte und tatsächlich laufend anfallende Betriebskosten auf Mieter umgelegt werden dürfen."
        },
        {
                "typ": "text",
                "text": "Wichtig ist außerdem der Grundsatz der Wirtschaftlichkeit: Die Kosten für den Hauswart dürfen nur umgelegt werden, wenn dieser Grundsatz eingehalten ist, schaltet der Vermieter eine externe Hausmeisterfirma ein, muss er auch dieses Gebot beachten. Überhöhte oder unangemessene Kosten können Mieter also grundsätzlich beanstanden."
        },
        {
                "typ": "h2",
                "text": "Diese Hausmeistertätigkeiten dürfen umgelegt werden"
        },
        {
                "typ": "text",
                "text": "Umlagefähig sind nach der Rechtsprechung nur Tätigkeiten, die laufend anfallen und dem Betrieb des Gebäudes dienen, nicht der Verwaltung oder der Instandsetzung. Als umlagefähige Kosten des Hauswarts kommen dabei Aufwendungen für bestimmte Wartungs-, Reinigungs- und Pflegetätigkeiten in Betracht, etwa die Überwachung, dass Rettungs- oder Fluchtwege frei bleiben, Außentüren ordnungsgemäß schließen, die Beleuchtung von Gemeinschaftsflächen funktioniert und haustechnische Anlagen in ordnungsgemäßem Zustand sind."
        },
        {
                "typ": "liste",
                "items": [
                        "Kontrolle und Überwachung technischer Anlagen (Heizung, Aufzug, Beleuchtung, Wasserversorgung)",
                        "Reinigung und Pflege von Treppenhaus, Gemeinschaftsflächen und Außenanlagen",
                        "Gartenpflege und Winterdienst, soweit vom Hausmeister übernommen",
                        "Kontrollgänge zur Verkehrssicherung (Frostschutz, Brandschutz, freie Fluchtwege)",
                        "Einweisung von Handwerkern im Rahmen umlagefähiger Wartungs- und Pflegearbeiten"
                ]
        },
        {
                "typ": "h2",
                "text": "Diese Kosten sind nicht umlagefähig"
        },
        {
                "typ": "text",
                "text": "Führt der Hauswart hingegen notwendige Reparaturen und Verwaltungstätigkeiten durch, so gehört dies zwar an sich zu seinem Aufgabenkreis, doch diese Tätigkeitsbereiche sind nicht umlagefähig. Verwaltungstätigkeiten werden auch nicht dadurch zu Betriebskosten, dass sie unter dem Sammelbegriff 'Hausmeister' abgerechnet werden."
        },
        {
                "typ": "liste",
                "items": [
                        "Verwaltungsaufgaben: Mieterwechsel organisieren, Schriftverkehr mit Behörden oder Mietern, Wohnungsabnahmen",
                        "Reparaturen und Instandhaltung: defekte Türen, Rohre oder Malerarbeiten im Treppenhaus",
                        "Bereitschafts- oder Notdienstpauschalen für die Entgegennahme von Störungsmeldungen außerhalb der regulären Arbeitszeit"
                ]
        },
        {
                "typ": "text",
                "text": "Besonders die Notdienstpauschale beschäftigt regelmäßig die Gerichte. Der BGH hat klargestellt, dass eine Notdienstpauschale des Hausmeisters nicht zu den umlagefähigen Betriebskosten zählt, da mit ihr Tätigkeiten abgegolten werden, die der Grundstücksverwaltung und nicht dem Sicherheits- oder Ordnungsbereich zuzuordnen sind. Ausnahmsweise können Notrufbereitschaften umlagefähig sein, soweit diese die Überwachung von Aufzügen betreffen, da hierfür besondere Sicherheitsvorschriften gelten."
        },
        {
                "typ": "h2",
                "text": "Doppelabrechnung: Der häufigste Fehler in der Praxis"
        },
        {
                "typ": "text",
                "text": "Übernimmt der Hausmeister zusätzlich die Gartenpflege oder die Treppenhausreinigung, dürfen diese Kosten zwar grundsätzlich umgelegt werden, aber nur einmal. Wenn der Hausmeister etwa die Treppenhausreinigung übernimmt, darf der Vermieter entweder die Reinigungskosten als Teil der Hausmeisterkosten abrechnen oder die Position Gebäudereinigung separat aufführen, nicht beides gleichzeitig. Findet sich in Ihrer Abrechnung sowohl eine eigene Position 'Gartenpflege' oder 'Reinigung' als auch Hausmeisterkosten, die diese Leistungen mit umfassen, sollten Sie genau nachrechnen."
        },
        {
                "typ": "h2",
                "text": "Gemischte Tätigkeiten: Aufteilung ist Pflicht"
        },
        {
                "typ": "text",
                "text": "Übernimmt der Hausmeister sowohl umlagefähige als auch nicht umlagefähige Aufgaben, muss der Vermieter die Kosten sachgerecht aufteilen. Wird eine klare Abgrenzung zwischen umlagefähigen und nicht umlagefähigen Tätigkeiten des Hauswarts nicht vorgenommen und ist dies für das Gericht nicht erkennbar, sind die vollständig angesetzten Kosten für den Hauswart insgesamt nicht umlagefähig. In Streitfällen muss der Vermieter den umlagefähigen Anteil nachvollziehbar darlegen und beweisen, üblicherweise über Zeitnachweise oder eine plausible Schätzung."
        },
        {
                "typ": "hinweis",
                "text": "Fehlt in Ihrer Abrechnung jede Erläuterung, wie sich die Hausmeisterkosten zusammensetzen, oder wirkt die Position im Vergleich zu ähnlichen Objekten auffällig hoch, ist das ein starkes Indiz für eine fehlerhafte Abrechnung. Prüfen Sie in diesem Fall Ihr Recht auf Belegeinsicht."
        },
        {
                "typ": "verweis",
                "ziel": "betriebskostenspiegel-2024",
                "text": "Mit dem DMB Betriebskostenspiegel können Sie einschätzen, ob die in Ihrer Abrechnung ausgewiesenen Hausmeisterkosten der Höhe nach überhaupt plausibel sind."
        },
        {
                "typ": "h2",
                "text": "Was Sie als Mieter tun können"
        },
        {
                "typ": "liste",
                "items": [
                        "Fordern Sie eine Aufschlüsselung der Hausmeistertätigkeiten, falls diese in der Abrechnung fehlt",
                        "Prüfen Sie, ob Reinigungs- oder Gartenpflegekosten doppelt abgerechnet werden",
                        "Achten Sie auf versteckte Notdienst- oder Bereitschaftspauschalen",
                        "Vergleichen Sie die Höhe mit dem örtlichen Betriebskostenspiegel",
                        "Legen Sie bei Zweifeln fristgerecht Widerspruch ein"
                ]
        },
        {
                "typ": "verweis",
                "ziel": "widerspruch-nebenkostenabrechnung",
                "text": "Wie Sie bei fehlerhaften Hausmeisterkosten formal richtig Widerspruch einlegen, erklärt unsere ausführliche Anleitung mit Muster."
        },
        {
                "typ": "verweis",
                "ziel": "betriebskostenabrechnung-fristen-und-verjaehrung-2026",
                "text": "Welche Fristen für Ihren Einwand gegen zu hohe Hausmeisterkosten gelten und wann Nachforderungen verjähren, lesen Sie im Beitrag zu Fristen und Verjährung."
        },
        {
                "typ": "verweis",
                "ziel": "bgh-urteile-mietrecht-nebenkosten-2026",
                "text": "Weitere aktuelle Gerichtsentscheidungen rund um umlagefähige und nicht umlagefähige Nebenkosten finden Sie in unserer Übersicht der wichtigsten BGH-Urteile."
        },
        {
                "typ": "verweis",
                "ziel": "heizkostenabrechnung-vermieterfehler-2026-leitfaden",
                "text": "Ähnlich wie bei den Hausmeisterkosten schleichen sich auch bei der Heizkostenabrechnung häufig typische Vermieterfehler ein: ein Vergleich lohnt sich."
        },
        {
                "typ": "verweis",
                "ziel": "muellgebuehren-und-abfallentsorgung-als-betriebskosten-2026",
                "text": "Auch bei den Müllgebühren gibt es klare Grenzen der Umlagefähigkeit, die Sie parallel zu den Hausmeisterkosten prüfen sollten."
        },
        {
                "typ": "verweis",
                "ziel": "kabelanschluss-nicht-umlagefaehig",
                "text": "Dass nicht jede vertraute Nebenkostenposition automatisch umlagefähig bleibt, zeigt auch die Rechtsänderung beim Kabelanschluss."
        },
        {
                "typ": "verweis",
                "ziel": "wasserkosten-und-kaltwasserzaehler-in-der-nebenkostenabrechnung",
                "text": "Wenn Sie Ihre gesamte Nebenkostenabrechnung Position für Position prüfen möchten, hilft Ihnen auch unser Ratgeber zu Wasserkosten und Kaltwasserzählern weiter."
        },
        {
                "typ": "cta",
                "text": "Jetzt Abrechnung kostenlos prüfen lassen."
        }
],
    },
    {
      id: "muellgebuehren-und-abfallentsorgung-als-betriebskosten-2026",
      titelKurz: "Müllgebühren als Betriebskosten",
      titel: "Müllgebühren und Abfallentsorgung als Betriebskosten 2026: Was Mieter zahlen müssen und was nicht",
      teaser: "Müllgebühren gehören zu den Nebenkosten, die fast jede Abrechnung enthält, doch nicht jede Position darf der Vermieter umlegen. Dieser Ratgeber zeigt, was 2026 rechtlich zulässig ist, welche Kosten Vermieter selbst tragen müssen und wie Sie eine überhöhte Müllabrechnung erkennen.",
      datum: "August 2026",
      lesezeit: "8 Min.",
      bild: "/artikelbilder/muellgebuehren-und-abfallentsorgung-als-betriebskosten-2026.jpg",
      bildAlt: "Mülltonnen an einer Wohnstraße",
      kategorie: "Mietrecht",
      keywords: [],
      inhalt: [
        {
                "typ": "intro",
                "text": "Kaum eine Position taucht in der Nebenkostenabrechnung so zuverlässig auf wie die Müllgebühren. Gleichzeitig zählt die Abfallentsorgung zu den Kostenarten, bei denen Mieter häufig zu viel zahlen, etwa weil ein falscher Verteilerschlüssel verwendet wird oder Kosten abgerechnet werden, die eigentlich der Vermieter tragen müsste. Dieser Artikel erklärt verständlich, welche Müllkosten 2026 umlagefähig sind, welche nicht, und wie Sie als Mieter reagieren, wenn etwas nicht stimmt."
        },
        {
                "typ": "h2",
                "text": "Rechtsgrundlage: Warum Müllgebühren überhaupt Nebenkosten sind"
        },
        {
                "typ": "text",
                "text": "Die gesetzliche Grundlage für die Umlage von Müllkosten findet sich in der Betriebskostenverordnung. Nach dieser Vorschrift zählen Müllgebühren zu den umlagefähigen Betriebskosten, wobei Voraussetzung eine wirksame Vereinbarung im Mietvertrag ist. Das bedeutet konkret: Nur wenn im Mietvertrag ausdrücklich Betriebskosten vereinbart wurden, auf die Betriebskostenverordnung verwiesen wird oder Müllgebühren dort konkret genannt sind, darf der Vermieter diese Kosten überhaupt auf Sie umlegen. Fehlt eine solche Klausel, sind Müllkosten grundsätzlich nicht umlagefähig und müssen vom Vermieter selbst getragen werden."
        },
        {
                "typ": "h2",
                "text": "Was gehört zu den umlagefähigen Müllkosten?"
        },
        {
                "typ": "text",
                "text": "Zu den umlagefähigen Kosten der Müllbeseitigung zählen die eigentliche Müllabfuhr durch kommunale Betriebe oder private Entsorger sowie nicht-öffentliche Maßnahmen zur Müllbeseitigung, der Betrieb von Müllkompressoren, Müllschluckern, Müllabsauganlagen und Müllmengenerfassungsanlagen einschließlich der Kosten für Berechnung und Aufteilung. Auch die Entsorgung von Gartenabfällen und die Reinigung der Mülltonnen bei Mietverträgen ab dem 1. Januar 2004 gehören dazu."
        },
        {
                "typ": "liste",
                "items": [
                        "Gebühren der kommunalen Müllabfuhr für Restmüll-, Bio- und Papiertonnen",
                        "Kosten privater Entsorgungsunternehmen, sofern beauftragt",
                        "Betrieb und Wartung von Müllkompressoren, Müllschluckern und Absauganlagen",
                        "Reinigung des Müllstandplatzes und der Tonnen",
                        "Entsorgung von Gartenabfällen auf dem Grundstück",
                        "Regelmäßige Sperrmüllabholungen, wenn Verursacher nicht ermittelbar sind"
                ]
        },
        {
                "typ": "h2",
                "text": "Was der Vermieter nicht umlegen darf"
        },
        {
                "typ": "text",
                "text": "Nicht alles rund um die Mülltonne darf abgerechnet werden. Nicht umlagefähig sind Anschaffungskosten für Mülltonnen, der Ersatz beschädigter Container, Bußgelder wegen falscher Mülltrennung oder einmalige Sondermaßnahmen wie Entrümpelungen. Auch Container für Gelben Sack oder Altpapier, die keiner Gebührenpflicht unterliegen, sind in der Regel nicht Bestandteil der umlagefähigen Müllkosten, da für diese meist kein direktes Entgelt anfällt."
        },
        {
                "typ": "liste",
                "items": [
                        "Anschaffung neuer Mülltonnen oder Container",
                        "Reparatur oder Ersatz beschädigter Behälter",
                        "Bußgelder wegen fehlerhafter Mülltrennung",
                        "Einmalige Entrümpelungen oder Sonderentsorgungen ohne erkennbaren Verursacher",
                        "Kosten, die durch unwirtschaftliches Handeln des Vermieters entstehen"
                ]
        },
        {
                "typ": "h2",
                "text": "Fehlwurf-Kontrollen und Mülltrennung: Was der BGH 2022 entschieden hat"
        },
        {
                "typ": "text",
                "text": "Ein praxisrelevantes Urteil betrifft die Kontrolle der Mülltrennung: Die Kosten eines externen Dienstleisters für die regelmäßige Kontrolle der Restmüllbehälter auf Einhaltung der satzungsmäßigen Vorgaben zur Mülltrennung und für die bei fehlerhafter Trennung erfolgende Nachsortierung von Hand sind im Wohnraummietverhältnis nach § 2 Nr. 8 der Betriebskostenverordnung umlegbare Betriebskosten. Diese Entscheidung geht auf ein BGH-Urteil vom 5. Oktober 2022 zurück. Für Mieter bedeutet das: Auch wenn Sie selbst korrekt trennen, können Sie über die Umlage indirekt an den Kosten beteiligt werden, die durch das Fehlverhalten anderer Hausbewohner entstehen."
        },
        {
                "typ": "verweis",
                "ziel": "bgh-urteile-mietrecht-nebenkosten-2026",
                "text": "Eine Übersicht weiterer aktueller Gerichtsentscheidungen zu Nebenkosten, nicht nur zu Müll, sondern zu allen Betriebskostenarten, finden Sie in unserer Zusammenfassung der wichtigsten BGH-Urteile."
        },
        {
                "typ": "h2",
                "text": "Der richtige Verteilerschlüssel: Wohnfläche, Personenzahl oder Tonnen?"
        },
        {
                "typ": "text",
                "text": "Ein häufiger Streitpunkt bei Müllgebühren ist der gewählte Verteilerschlüssel. Das Gesetz schreibt hierfür keinen festen Maßstab vor. Zulässig sind unter anderem die Verteilung nach Wohnfläche, nach Personenzahl oder nach Tonnen beziehungsweise Leerungen. Dabei gilt die Verteilung nach Personenzahl oft als sachgerechter, da das Müllaufkommen meist stärker von der Bewohnerzahl als von der Wohnungsgröße abhängt. Wichtig ist in jedem Fall, dass der einmal gewählte Schlüssel konsequent und einheitlich auf alle Mieteinheiten angewendet wird."
        },
        {
                "typ": "verweis",
                "ziel": "wasserkosten-und-kaltwasserzaehler-in-der-nebenkostenabrechnung",
                "text": "Wie Verteilerschlüssel bei einer anderen verbrauchsabhängigen Kostenart korrekt angewendet werden, erfahren Sie in unserem Ratgeber zu Wasserkosten und Kaltwasserzählern."
        },
        {
                "typ": "h2",
                "text": "Sonderfall: Direkte Gebührenveranlagung durch die Gemeinde"
        },
        {
                "typ": "text",
                "text": "In manchen Kommunen erhält jede Wohneinheit eine eigene Müllgebührenveranlagung direkt von der Gemeinde. In diesem Fall entfällt die Umlage über die Nebenkostenabrechnung, und Sie zahlen die Gebühr direkt an die Gemeinde, ohne dass ein weiterer Posten in der Abrechnung erscheint. Prüfen Sie daher, ob Ihre Kommune dieses Modell anwendet, dann sollte in der Nebenkostenabrechnung Ihres Vermieters keine zusätzliche Müllposition auftauchen."
        },
        {
                "typ": "h2",
                "text": "Wirtschaftlichkeitsgebot: Wenn der Vermieter unnötig teuer entsorgt"
        },
        {
                "typ": "text",
                "text": "Vermieter sind an das sogenannte Wirtschaftlichkeitsgebot gebunden. Bestellt der Vermieter zusätzliche Mülltonnen oder häufigere Leerungen, ohne dass dies erforderlich ist, kann dies gegen dieses Gebot verstoßen, und überhöhte Kosten sind als Klärungspunkt in der Abrechnung aufzunehmen. Auch der Einsatz eines externen Müllmanagements ist nur dann umlagefähig, wenn dieser tatsächlich zu einer Kostenersparnis führt, lässt sich das nicht nachweisen, muss der Vermieter die Mehrkosten selbst tragen."
        },
        {
                "typ": "verweis",
                "ziel": "heizkostenabrechnung-vermieterfehler-2026-leitfaden",
                "text": "Ähnliche Fehlerquellen wie unwirtschaftliches Handeln des Vermieters treten auch bei der Heizkostenabrechnung häufig auf, unser Leitfaden zeigt, wie Sie diese erkennen."
        },
        {
                "typ": "h2",
                "text": "Was ist ein normaler Betrag für Müllgebühren?"
        },
        {
                "typ": "text",
                "text": "Um einzuschätzen, ob Ihre Müllkosten im üblichen Rahmen liegen, hilft ein Blick auf regionale und bundesweite Vergleichswerte. Diese schwanken je nach Kommune, Objektgröße und Entsorgungsmodell teils deutlich, geben aber eine erste Orientierung, ob eine Nachforderung plausibel erscheint."
        },
        {
                "typ": "verweis",
                "ziel": "betriebskostenspiegel-2024",
                "text": "Im DMB Betriebskostenspiegel finden Sie bundesweite Durchschnittswerte, mit denen Sie Ihre eigenen Müllkosten realistisch einordnen können."
        },
        {
                "typ": "h2",
                "text": "Auch andere Betriebskostenarten verändern sich"
        },
        {
                "typ": "text",
                "text": "Nicht nur bei den Müllgebühren gibt es regelmäßig Änderungen in der Umlagefähigkeit einzelner Kostenpositionen. Ein bekanntes Beispiel aus jüngerer Zeit betrifft eine ganz andere Kostenart, die seit einer Gesetzesänderung nicht mehr pauschal umgelegt werden darf."
        },
        {
                "typ": "verweis",
                "ziel": "kabelanschluss-nicht-umlagefaehig",
                "text": "Welche Kostenart seit Juli 2024 nicht mehr auf Mieter umgelegt werden darf, lesen Sie in unserem Artikel zum Kabelanschluss."
        },
        {
                "typ": "h2",
                "text": "Was tun bei überhöhten oder unklaren Müllkosten?"
        },
        {
                "typ": "text",
                "text": "Wenn Sie den Eindruck haben, dass Ihre Müllkosten zu hoch angesetzt sind, ein falscher Verteilerschlüssel verwendet wurde oder nicht umlagefähige Posten enthalten sind, sollten Sie die Abrechnung genau prüfen und gegebenenfalls fristgerecht widersprechen. Wichtig ist dabei, die gesetzlichen Fristen im Blick zu behalten, da ein verspäteter Widerspruch Ihre Erfolgschancen erheblich mindern kann."
        },
        {
                "typ": "verweis",
                "ziel": "widerspruch-nebenkostenabrechnung",
                "text": "Eine konkrete Anleitung samt Musterformulierung für Ihren Widerspruch finden Sie in unserem Ratgeber zum Widerspruch gegen die Nebenkostenabrechnung."
        },
        {
                "typ": "verweis",
                "ziel": "betriebskostenabrechnung-fristen-und-verjaehrung-2026",
                "text": "Welche Fristen für Vermieter und Mieter bei der gesamten Betriebskostenabrechnung gelten, erklären wir ausführlich in unserem Fristen-Ratgeber."
        },
        {
                "typ": "hinweis",
                "text": "Prüfen Sie bei Ihrer nächsten Nebenkostenabrechnung gezielt, ob die Position Müll im Mietvertrag als umlagefähig genannt ist, welcher Verteilerschlüssel angewendet wurde und ob einmalige oder nicht umlagefähige Posten wie Bußgelder oder Anschaffungskosten enthalten sind."
        },
        {
                "typ": "cta",
                "text": "Jetzt Abrechnung kostenlos prüfen lassen."
        }
],
    },
    {
      id: "wasserkosten-und-kaltwasserzaehler-in-der-nebenkostenabrechnung",
      titelKurz: "Wasserkosten und Zähler prüfen",
      titel: "Wasserkosten und Kaltwasserzähler in der Nebenkostenabrechnung 2026: Was Mieter wissen müssen",
      teaser: "Wasserkosten zählen zu den größten Posten in der Nebenkostenabrechnung und Kaltwasserzähler sind dabei oft eine Fehlerquelle. Erfahren Sie, welche Kosten umlagefähig sind, wie die Eichpflicht funktioniert und wie Sie Ihre Abrechnung selbst prüfen.",
      datum: "Juli 2026",
      lesezeit: "8 Min.",
      bild: "/artikelbilder/wasserkosten-und-kaltwasserzaehler-in-der-nebenkostenabrechnung.jpg",
      bildAlt: "Mehrere Wasserzähler an Rohren an einer Wand",
      kategorie: "Mietrecht",
      keywords: [],
      inhalt: [
        {
                "typ": "intro",
                "text": "Nach den Heizkosten sind Wasserkosten der zweithäufigste Streitpunkt in der Nebenkostenabrechnung. Viele Mieter wissen nicht genau, welche Positionen rund um Kaltwasser und Kaltwasserzähler überhaupt umgelegt werden dürfen und worauf sie bei der Prüfung ihrer Abrechnung achten sollten. Dieser Ratgeber erklärt die aktuelle Rechtslage 2026 verständlich und zeigt, wie Sie typische Fehler erkennen."
        },
        {
                "typ": "h2",
                "text": "Welche Wasserkosten dürfen in der Nebenkostenabrechnung stehen?"
        },
        {
                "typ": "text",
                "text": "Die gesetzliche Grundlage für die Umlage von Wasserkosten bildet § 2 Nr. 2 der Betriebskostenverordnung (BetrKV). Danach dürfen die Kosten der Wasserversorgung auf Basis der Rechnung des Versorgers, Grundgebühren, die Miete für Wasserzähler sowie deren Ablesung auf die Mieter umgelegt werden. Ebenso zählen die Kosten der Verbrauchserfassung und -aufteilung durch externe Messdienstleister zu den umlagefähigen Positionen."
        },
        {
                "typ": "liste",
                "items": [
                        "Frischwasserkosten laut Rechnung des kommunalen Wasserversorgers",
                        "Grundgebühr für den Wasseranschluss",
                        "Miete für Kaltwasserzähler und deren Ablesung",
                        "Eichkosten für die Wasserzähler",
                        "Kosten der Verbrauchserfassung durch externe Dienstleister (z. B. Ista, Techem, Minol)"
                ]
        },
        {
                "typ": "text",
                "text": "Nicht umlagefähig sind dagegen einmalige Reparaturen an Wasserleitungen oder die Beseitigung von Wasserschäden, da es sich hierbei um Instandhaltungskosten handelt, die der Vermieter selbst tragen muss. Ebenfalls problematisch ist es, wenn Wasserkosten für ausschließlich gewerblich genutzte Flächen im selben Gebäude auf Wohnmieter mitverteilt werden, obwohl der Verbrauch klar zuordenbar wäre."
        },
        {
                "typ": "h2",
                "text": "Kaltwasserzähler: Eichpflicht und was bei abgelaufener Eichung gilt"
        },
        {
                "typ": "text",
                "text": "Kaltwasserzähler unterliegen einer gesetzlichen Eichpflicht nach dem Mess- und Eichgesetz (MessEG). Die Eichfrist für Kaltwasserzähler beträgt sechs Jahre, während Warmwasserzähler bereits nach fünf Jahren neu geeicht werden müssen. Ist diese Frist abgelaufen, gelten die abgelesenen Werte als anfechtbar, weil die Messgenauigkeit rechtlich nicht mehr gesichert ist."
        },
        {
                "typ": "text",
                "text": "Ist die Eichfrist bei den Zählern in Ihrer Wohnung überschritten, können Sie als Mieter die Abrechnung entsprechend kürzen. Verantwortlich für die rechtzeitige Erneuerung ist grundsätzlich der Vermieter beziehungsweise die von ihm beauftragte Hausverwaltung: ein abgelaufener Eichtermin geht nicht zulasten des Mieters."
        },
        {
                "typ": "hinweis",
                "text": "Prüfen Sie in Ihrer Abrechnung oder im Zählerprotokoll, ob ein Eichdatum bzw. Prüfjahr angegeben ist. Fehlt diese Angabe oder liegt sie mehr als sechs Jahre zurück, sollten Sie dies schriftlich gegenüber dem Vermieter ansprechen."
        },
        {
                "typ": "h2",
                "text": "Muss Kaltwasser überhaupt nach Verbrauch abgerechnet werden?"
        },
        {
                "typ": "text",
                "text": "Anders als bei Heizung und Warmwasser gibt es für Kaltwasser keine gesetzliche Pflicht zur verbrauchsabhängigen Abrechnung. Sind jedoch Wasserzähler in den Wohnungen installiert, sollte der tatsächliche Verbrauch als Verteilerschlüssel herangezogen werden, weil dies dem Wirtschaftlichkeitsgebot entspricht und die gerechteste Verteilung zwischen Wenig- und Vielverbrauchern ermöglicht."
        },
        {
                "typ": "text",
                "text": "Fehlen individuelle Wasserzähler, wird häufig ersatzweise nach der Personenzahl je Wohneinheit abgerechnet, da der Wasserverbrauch stark von der Anzahl der Bewohner abhängt. Eine Verteilung allein nach Wohnfläche ist zulässig, gilt aber als weniger gerecht, weil sie die tatsächliche Nutzung nicht berücksichtigt."
        },
        {
                "typ": "liste",
                "items": [
                        "Verbrauch nach geeichtem Wasserzähler, fairster und empfohlener Maßstab",
                        "Personenzahl pro Wohnung, gängiger Ersatzschlüssel ohne Einzelzähler",
                        "Wohnfläche, zulässig, aber weniger verursachungsgerecht"
                ]
        },
        {
                "typ": "text",
                "text": "Zur Orientierung: In Deutschland liegt der durchschnittliche Wasserverbrauch bei etwa 125 Litern pro Person und Tag, also rund 45 Kubikmetern im Jahr. Bei einem Durchschnittspreis von etwa 2,20 Euro pro Kubikmeter ergeben sich daraus grob geschätzte Kosten von rund 100 Euro pro Person und Jahr allein für Frischwasser: ein Wert, an dem Sie Ihre eigene Abrechnung grob spiegeln können."
        },
        {
                "typ": "verweis",
                "ziel": "betriebskostenspiegel-2024",
                "text": "Wie sich Ihre Wasserkosten im bundesweiten Vergleich einordnen, zeigt der aktuelle DMB Betriebskostenspiegel mit Durchschnittswerten für alle Kostenarten."
        },
        {
                "typ": "h2",
                "text": "Typische Fehler in der Wasserkostenabrechnung"
        },
        {
                "typ": "text",
                "text": "Ein häufiger Streitpunkt ist der nachträgliche Wechsel des Verteilerschlüssels. Ein Wechsel während der laufenden Vertragslaufzeit ist unzulässig, wenn er nicht vertraglich gedeckt ist, und darf nicht einseitig zulasten des Mieters erfolgen. Ebenso problematisch ist die Umlage von Wasserkosten für leerstehende Wohnungen: Diese Kosten trägt der Vermieter, sie dürfen nicht anteilig auf die übrigen Mieter verteilt werden."
        },
        {
                "typ": "liste",
                "items": [
                        "Verteilerschlüssel wurde ohne vertragliche Grundlage geändert",
                        "Kosten für Gartenbewässerung oder Gewerbeflächen wurden mitabgerechnet",
                        "Leerstehende Wohnungen wurden bei der Verteilung übergangen",
                        "Zählerstände von Einzelzählern plus Allgemeinverbrauch stimmen nicht mit dem Hauptzähler überein",
                        "Eichfrist der Kaltwasserzähler ist abgelaufen"
                ]
        },
        {
                "typ": "text",
                "text": "Auch die formellen Anforderungen an die Abrechnung selbst spielen eine Rolle: Nach § 556 Abs. 3 Satz 2 BGB muss die Abrechnung verständlich und nachvollziehbar sein. Der Bundesgerichtshof hat in seiner Rechtsprechung hohe Anforderungen an diese Transparenz gestellt, sodass unklare oder unvollständige Angaben zu Wasserkosten formell angreifbar sein können."
        },
        {
                "typ": "verweis",
                "ziel": "bgh-urteile-mietrecht-nebenkosten-2026",
                "text": "Welche weiteren aktuellen BGH-Entscheidungen für Nebenkostenabrechnungen relevant sind, lesen Sie in unserer Übersicht der wichtigsten Urteile 2026."
        },
        {
                "typ": "h2",
                "text": "Was tun bei Zweifeln an der Wasserkostenabrechnung?"
        },
        {
                "typ": "text",
                "text": "Wenn Ihnen die Wasserkosten in Ihrer Abrechnung zu hoch erscheinen oder Sie einen der oben genannten Fehler vermuten, haben Sie als Mieter das Recht, Einsicht in die Belege zu verlangen. Fordern Sie die Rechnung des Wasserversorgers sowie das Ablese- und Eichprotokoll der Zähler an und vergleichen Sie die dort genannten Werte mit den Angaben in Ihrer Abrechnung."
        },
        {
                "typ": "verweis",
                "ziel": "widerspruch-nebenkostenabrechnung",
                "text": "Wie Sie formal korrekt Widerspruch gegen eine fehlerhafte Abrechnung einlegen und welche Fristen dabei gelten, erklärt unsere ausführliche Anleitung mit Musterschreiben."
        },
        {
                "typ": "verweis",
                "ziel": "betriebskostenabrechnung-fristen-und-verjaehrung-2026",
                "text": "Wie lange Ihr Vermieter überhaupt Zeit hat, die Abrechnung zu erstellen, und wann Nachforderungen verjähren, erfahren Sie in unserem Beitrag zu Fristen und Verjährung."
        },
        {
                "typ": "text",
                "text": "Da Warmwasserkosten häufig gemeinsam mit Heizkosten abgerechnet werden und ähnliche Fehlerquellen wie bei Kaltwasserzählern aufweisen, lohnt sich bei gemischten Anlagen auch ein Blick auf die Heizkostenabrechnung."
        },
        {
                "typ": "verweis",
                "ziel": "heizkostenabrechnung-vermieterfehler-2026-leitfaden",
                "text": "Wenn Ihre Wohnung auch über eine zentrale Warmwasserversorgung verfügt, zeigt unser Leitfaden zu Vermieterfehlern bei der Heizkostenabrechnung weitere typische Stolperfallen."
        },
        {
                "typ": "verweis",
                "ziel": "kabelanschluss-nicht-umlagefaehig",
                "text": "Nicht jede Position, die im Mietvertrag als Nebenkosten aufgeführt wird, darf tatsächlich umgelegt werden: ein Beispiel dafür ist der Kabelanschluss, der seit Juli 2024 nicht mehr umlagefähig ist."
        },
        {
                "typ": "hinweis",
                "text": "Dieser Artikel ersetzt keine individuelle Rechtsberatung. Bei komplexen oder strittigen Fällen empfiehlt sich der Gang zu einem Fachanwalt für Mietrecht oder zum örtlichen Mieterverein."
        },
        {
                "typ": "cta",
                "text": "Jetzt Abrechnung kostenlos prüfen lassen."
        }
],
    },
    {
      id: "betriebskostenabrechnung-fristen-und-verjaehrung-2026",
      titelKurz: "Fristen und Verjährung 2026",
      titel: "Betriebskostenabrechnung 2026: Fristen und Verjährung: was Mieter wissen müssen",
      teaser: "Wann muss der Vermieter abrechnen, wie lange können Sie widersprechen und ab wann sind Nachforderungen verjährt? Der komplette Überblick über alle Fristen rund um die Betriebskostenabrechnung 2026.",
      datum: "Juli 2026",
      lesezeit: "9 Min.",
      bild: "/artikelbilder/betriebskostenabrechnung-fristen-und-verjaehrung-2026.jpg",
      bildAlt: "Kalender mit markierten Terminen",
      kategorie: "Mietrecht",
      keywords: [],
      inhalt: [
        {
                "typ": "intro",
                "text": "Die Betriebskostenabrechnung ist für viele Mieterinnen und Mieter ein jährliches Ärgernis: Zu spät zugestellt, unverständlich aufgebaut oder mit einer überraschenden Nachforderung versehen. Doch das Gesetz gibt klare Fristen vor, an die sich sowohl Vermieter als auch Mieter halten müssen. Wer diese Fristen kennt, kann unberechtigte Nachzahlungen abwehren und weiß genau, wie lange er selbst noch Ansprüche geltend machen kann."
        },
        {
                "typ": "h2",
                "text": "Die 12-Monats-Frist: Wann muss der Vermieter abrechnen?"
        },
        {
                "typ": "text",
                "text": "Grundlage für alle Fristen rund um die Betriebskostenabrechnung ist § 556 Abs. 3 BGB. Danach muss der Vermieter über die geleisteten Vorauszahlungen jährlich abrechnen und die Abrechnung dem Mieter spätestens bis zum Ablauf des zwölften Monats nach Ende des Abrechnungszeitraums zukommen lassen. Endet der Abrechnungszeitraum beispielsweise am 31. Dezember 2025, muss die Abrechnung spätestens am 31. Dezember 2026 im Briefkasten des Mieters liegen. Entscheidend ist dabei nicht das Datum auf der Abrechnung oder der Poststempel, sondern der tatsächliche Zugang beim Mieter."
        },
        {
                "typ": "text",
                "text": "Diese Zwölf-Monats-Frist ist eine sogenannte Ausschlussfrist. Das bedeutet: Es gibt keine Kulanz, keine automatische Verlängerung und keine Gnadenfrist. Versäumt der Vermieter diesen Termin, verliert er grundsätzlich das Recht, eine Nachzahlung von Ihnen zu verlangen, selbst wenn die Abrechnung inhaltlich korrekt wäre."
        },
        {
                "typ": "h2",
                "text": "Was passiert bei Fristversäumnis des Vermieters?"
        },
        {
                "typ": "text",
                "text": "Kommt die Betriebskostenabrechnung erst nach Ablauf der Zwölf-Monats-Frist bei Ihnen an, sind eventuelle Nachforderungen ausgeschlossen. Ein Guthaben aus derselben Abrechnung steht Ihnen als Mieter hingegen weiterhin zu: die Frist schützt nur Sie, nicht den Vermieter. Eine Ausnahme gilt nur dann, wenn der Vermieter die Verspätung nachweislich nicht zu vertreten hat, etwa weil ein Energieversorger selbst extrem spät abgerechnet hat. Solche Fälle sind in der Praxis jedoch selten und müssen vom Vermieter konkret belegt werden."
        },
        {
                "typ": "hinweis",
                "text": "Zahlen Sie eine verspätet zugestellte Nachforderung aus Unwissenheit, können Sie das Geld später zurückverlangen. Prüfen Sie daher bei jeder Abrechnung zuerst das Zugangsdatum, bevor Sie überweisen."
        },
        {
                "typ": "verweis",
                "ziel": "bgh-urteile-mietrecht-nebenkosten-2026",
                "text": "Wie der Bundesgerichtshof die Ausschlussfrist in der Praxis auslegt und welche aktuellen Urteile Mieter kennen sollten, erfahren Sie im Überblick zu den neuesten BGH-Entscheidungen zu Nebenkosten."
        },
        {
                "typ": "h2",
                "text": "Die Widerspruchsfrist: Wie lange können Sie sich wehren?"
        },
        {
                "typ": "text",
                "text": "Neben der Frist für den Vermieter gibt es auch eine Frist für Sie als Mieter: Sie haben ab Zugang der Abrechnung zwölf Monate Zeit, um formell oder inhaltlich begründete Einwendungen zu erheben, etwa wenn Kostenpositionen falsch berechnet, nicht umlagefähige Posten enthalten sind oder der Verteilerschlüssel nicht stimmt. Lassen Sie diese Frist verstreichen, gilt die Abrechnung grundsätzlich als anerkannt, auch wenn sie tatsächlich fehlerhaft war."
        },
        {
                "typ": "verweis",
                "ziel": "widerspruch-nebenkostenabrechnung",
                "text": "Eine konkrete Anleitung samt Musterformulierung für einen fristgerechten Widerspruch finden Sie im Ratgeber zum Widerspruch gegen die Nebenkostenabrechnung."
        },
        {
                "typ": "h2",
                "text": "Verjährung: Wann sind Ansprüche endgültig weg?"
        },
        {
                "typ": "text",
                "text": "Neben der Ausschlussfrist des § 556 BGB gibt es eine zweite, oft übersehene zeitliche Grenze: die reguläre Verjährung nach § 195 BGB. Sie beträgt drei Jahre und gilt sowohl für Nachforderungen des Vermieters als auch für Guthabenansprüche des Mieters. Der Fristbeginn richtet sich nach § 199 BGB und startet nicht mit dem Zugang der Abrechnung, sondern erst zum Ende des Kalenderjahres, in dem der Anspruch entstanden ist und die Gegenseite davon Kenntnis hatte oder hätte haben müssen."
        },
        {
                "typ": "liste",
                "items": [
                        "Beispiel: Die Abrechnung geht dem Mieter im Juni 2024 zu, der Zahlungsanspruch entsteht damit 2024.",
                        "Die dreijährige Verjährungsfrist beginnt zum 1. Januar 2025 und endet am 31. Dezember 2027.",
                        "Danach kann weder der Vermieter eine offene Nachzahlung noch der Mieter ein offenes Guthaben gerichtlich durchsetzen.",
                        "Verjährung tritt nicht automatisch ein, sie muss von der betroffenen Partei aktiv eingewendet werden.",
                        "Verhandlungen zwischen Mieter und Vermieter über die Abrechnung können die Verjährung vorübergehend hemmen, eine einfache Mahnung reicht dafür jedoch nicht aus."
                ]
        },
        {
                "typ": "hinweis",
                "text": "Wichtig für die Praxis: Die Zwölf-Monats-Ausschlussfrist und die dreijährige Verjährung sind zwei unterschiedliche Dinge und laufen unabhängig voneinander. Eine fristgerecht zugestellte Abrechnung mit berechtigter Nachforderung bleibt bis zu drei Jahre lang durchsetzbar, auch wenn seit Zustellung schon viel Zeit vergangen ist."
        },
        {
                "typ": "h2",
                "text": "Sonderfall: Auszug und Umzug"
        },
        {
                "typ": "text",
                "text": "Auch wenn Sie bereits ausgezogen sind, ändert sich an den Fristen grundsätzlich nichts. Der Vermieter hat weiterhin zwölf Monate nach Ende des Abrechnungszeitraums Zeit, Ihnen die Abrechnung an Ihre neue Adresse zuzustellen. Eine bereits zurückgezahlte Kaution schützt Sie dabei nicht automatisch vor einer fristgerecht geltend gemachten Nachforderung. Verjährte Ansprüche darf der Vermieter allerdings nicht mehr mit einer noch einbehaltenen Kaution verrechnen."
        },
        {
                "typ": "h2",
                "text": "Checkliste: So behalten Sie den Überblick"
        },
        {
                "typ": "liste",
                "items": [
                        "Zugangsdatum der Abrechnung sofort notieren, es ist der Startpunkt für Ihre Widerspruchsfrist.",
                        "Prüfen, ob der Abrechnungszeitraum korrekt zwölf Monate umfasst und ob die Zwölf-Monats-Frist des Vermieters eingehalten wurde.",
                        "Bei verspäteter Zustellung schriftlich und nachweisbar auf die Ausschlussfrist hinweisen, bevor Sie zahlen.",
                        "Einzelne Kostenpositionen mit üblichen Vergleichswerten abgleichen, um auffällig hohe Posten zu erkennen.",
                        "Innerhalb von zwölf Monaten nach Zugang schriftlich widersprechen, wenn Fehler auffallen.",
                        "Bei älteren Nachforderungen zusätzlich die dreijährige Verjährungsfrist im Blick behalten."
                ]
        },
        {
                "typ": "verweis",
                "ziel": "betriebskostenspiegel-2024",
                "text": "Ob Ihre Kostenpositionen im üblichen Rahmen liegen oder auffällig hoch sind, lässt sich am besten mit aktuellen Vergleichswerten aus dem Betriebskostenspiegel prüfen."
        },
        {
                "typ": "verweis",
                "ziel": "heizkostenabrechnung-vermieterfehler-2026-leitfaden",
                "text": "Da die Heizkostenabrechnung besonders fehleranfällig ist, lohnt sich ein Blick in den Leitfaden zu den häufigsten Vermieterfehlern bei der Heizkostenabrechnung, bevor die Widerspruchsfrist abläuft."
        },
        {
                "typ": "verweis",
                "ziel": "kabelanschluss-nicht-umlagefaehig",
                "text": "Tauchen in Ihrer Abrechnung noch Kosten für den Kabelanschluss auf, sollten Sie prüfen, ob diese seit der Gesetzesänderung überhaupt noch umlagefähig sind."
        },
        {
                "typ": "cta",
                "text": "Jetzt Abrechnung kostenlos prüfen lassen."
        }
],
    },
    {
      id: "heizkostenabrechnung-vermieterfehler-2026-leitfaden",
      titelKurz: "Heizkostenabrechnung: typische Fehler",
      titel: "Heizkostenabrechnung 2026: Die häufigsten Fehler der Vermieter und wie Sie als Mieter reagieren",
      teaser: "Fast jede zweite Heizkostenabrechnung enthält Fehler, die Mieter bares Geld kosten. Dieser Leitfaden zeigt die typischen Stolperfallen 2026 und erklärt, wie Sie Ihre Abrechnung Schritt für Schritt prüfen.",
      datum: "Juli 2026",
      lesezeit: "8 Min.",
      bild: "/artikelbilder/heizkostenabrechnung-vermieterfehler-2026-leitfaden.jpg",
      bildAlt: "Weißer Heizkörper an einer Zimmerwand",
      kategorie: "Mietrecht",
      keywords: [],
      inhalt: [
        {
                "typ": "intro",
                "text": "Jedes Jahr flattert sie ins Haus: die Heizkostenabrechnung. Und jedes Jahr sorgt sie für Kopfschmerzen, nicht nur wegen der Höhe der Nachzahlung, sondern weil sich in vielen Abrechnungen handfeste Fehler verstecken. Studien und Verbraucherzentralen gehen davon aus, dass ein erheblicher Teil aller Abrechnungen fehlerhaft ist. Dieser Ratgeber erklärt verständlich, welche Fehler Vermieter 2026 am häufigsten machen und wie Sie als Mieter davon profitieren können."
        },
        {
                "typ": "h2",
                "text": "Wie häufig sind Fehler in der Heizkostenabrechnung wirklich?"
        },
        {
                "typ": "text",
                "text": "Die Zahlen schwanken je nach Quelle, doch der Trend ist eindeutig: Ein sehr großer Teil der Abrechnungen weist Mängel auf. Verbraucherschützer sprechen konservativ von jeder zweiten Abrechnung, andere Auswertungen kommen sogar auf deutlich höhere Fehlerquoten. Wichtig für Sie: Nicht jeder Fehler ist böswillig, oft entstehen Ungenauigkeiten schlicht durch die komplizierte Rechtslage, die sich in den letzten Jahren durch CO2-Kostenaufteilung, neue Zählerpflichten und Änderungen bei den Nebenkosten spürbar verschärft hat."
        },
        {
                "typ": "h2",
                "text": "Fehler 1: Die 12-Monats-Frist wird nicht eingehalten"
        },
        {
                "typ": "text",
                "text": "Vermieter müssen die Heizkostenabrechnung fristgerecht zustellen. Wird diese Frist versäumt, hat das für Sie als Mieter erhebliche Vorteile."
        },
        {
                "typ": "liste",
                "items": [
                        "Die Abrechnung muss dem Mieter spätestens 12 Monate nach Ende des Abrechnungszeitraums vorliegen (§ 556 Abs. 3 BGB)",
                        "Verpasst der Vermieter diese Frist, verfällt sein Anspruch auf Nachzahlung",
                        "Ein bestehendes Guthaben muss dem Mieter aber trotzdem ausgezahlt werden"
                ]
        },
        {
                "typ": "text",
                "text": "Prüfen Sie also als Erstes das Datum: Für den Abrechnungszeitraum bis zum 31. Dezember 2025 muss die Abrechnung beispielsweise bis spätestens 31.12.2026 beim Mieter eingegangen sein. Kommt sie später, können Sie eine Nachzahlung verweigern."
        },
        {
                "typ": "h2",
                "text": "Fehler 2: Falscher Verteilerschlüssel zwischen Grund- und Verbrauchskosten"
        },
        {
                "typ": "text",
                "text": "Die Heizkostenverordnung schreibt eine feste Bandbreite vor, nach der Heizkosten aufgeteilt werden müssen. Viele Vermieter setzen hier einen falschen oder unzulässigen Wert an."
        },
        {
                "typ": "liste",
                "items": [
                        "Verbrauchsabhängige Abrechnung ist Pflicht: 50 bis 70 Prozent der Heiz- und Warmwasserkosten müssen nach erfasstem Verbrauch abgerechnet werden, der Rest nach Wohnfläche (§ 7 HeizkV)",
                        "Eine reine Verbrauchsabrechnung oder eine reine Flächenabrechnung ist unzulässig und kann auch nicht per Mietvertrag ausgeschlossen werden",
                        "Häufigster konkreter Schlüssel in der Praxis ist die 70/30-Aufteilung, die sparsames Heizen am stärksten belohnt"
                ]
        },
        {
                "typ": "hinweis",
                "text": "Verstößt der Vermieter gegen die Vorgaben der Heizkostenverordnung, haben Sie ein Kürzungsrecht: Die Heizkostenabrechnung darf um pauschal 15 Prozent gekürzt werden und zwar unabhängig davon, ob Ihnen dadurch tatsächlich ein Nachteil entstanden ist. Dieses Recht ist in § 12 HeizkostenV verankert."
        },
        {
                "typ": "h2",
                "text": "Fehler 3: CO2-Kosten werden komplett auf den Mieter abgewälzt"
        },
        {
                "typ": "text",
                "text": "Seit der Einführung des CO2-Kostenaufteilungsgesetzes müssen sich Vermieter und Mieter die CO2-Abgabe je nach energetischem Zustand des Gebäudes teilen. Genau hier passiert 2026 noch immer einer der häufigsten Fehler."
        },
        {
                "typ": "liste",
                "items": [
                        "Seit dem 01.01.2023 muss die CO2-Abgabe nach dem CO2-Kostenaufteilungsgesetz zwischen Mieter und Vermieter aufgeteilt werden, abhängig vom energetischen Zustand des Gebäudes",
                        "§ 5 CO2KostAufG schreibt eine 10-Stufen-Tabelle vor: Bei sehr schlecht gedämmten Gebäuden trägt der Vermieter bis zu 95 Prozent der CO2-Kosten, bei energetisch sehr guten Gebäuden 0 Prozent",
                        "Die Aufteilung muss in der Heizkostenabrechnung gesondert ausgewiesen werden (§ 8 CO2KostAufG)"
                ]
        },
        {
                "typ": "text",
                "text": "Viele Vermieter legen die CO2-Abgabe schlicht komplett als Teil der Brennstoffkosten um, ohne den eigenen Pflichtanteil abzuziehen: das ist rechtswidrig und kann zu Rückforderungen führen. Prüfen Sie deshalb genau, ob in Ihrer Abrechnung überhaupt eine gesonderte CO2-Kostenaufteilung ausgewiesen ist."
        },
        {
                "typ": "h2",
                "text": "Fehler 4: Warmwasser- und Heizkosten werden nicht sauber getrennt"
        },
        {
                "typ": "text",
                "text": "Besonders bei sogenannten Verbundanlagen, bei denen eine Heizungsanlage gleichzeitig Warmwasser erzeugt, passieren Rechenfehler. Nach der Heizkostenverordnung müssen Heizkosten und Warmwasserkosten getrennt abgerechnet werden, wenn die zentrale Wärmeanlage mit der zentralen Warmwasserversorgung verbunden ist, wobei die Aufteilung nach dem jeweiligen Energieverbrauch erfolgt. Wird hier geschätzt statt korrekt nach der gesetzlich vorgeschriebenen Formel gerechnet, ist die Abrechnung angreifbar."
        },
        {
                "typ": "h2",
                "text": "Fehler 5: Fehlende oder verspätete Verbrauchsinformationen"
        },
        {
                "typ": "text",
                "text": "Bei fernablesbaren Geräten gilt eine zusätzliche Informationspflicht: Seit Dezember 2021 müssen Vermieter bei fernablesbaren Heizkostenverteilern und Wasserzählern den Mietern monatlich eine Verbrauchsinformation bereitstellen. Fehlt diese monatliche Information dauerhaft, kann dies neben dem Kürzungsrecht nach § 12 HeizkV zusätzliche Ansprüche begründen. Bis Ende 2026 müssen zudem alle Messgeräte in Wohngebäuden auf fernauslesbare Technik umgerüstet sein: ein Punkt, der viele Vermieter aktuell noch beschäftigt."
        },
        {
                "typ": "h2",
                "text": "Fehler 6: Nicht umlagefähige Kosten werden versteckt mit abgerechnet"
        },
        {
                "typ": "text",
                "text": "Ein Klassiker, der nicht direkt die Heizung betrifft, aber häufig in derselben Abrechnung auftaucht: Kosten, die gesetzlich gar nicht auf Mieter umgelegt werden dürfen, etwa Verwaltungskosten oder Instandhaltungsaufwand. Ein bekanntes Beispiel der letzten Jahre sind Kabelanschlussgebühren, die seit der Abschaffung des sogenannten Nebenkostenprivilegs nicht mehr umlagefähig sind, aber in manchen Abrechnungen trotzdem weiter auftauchen."
        },
        {
                "typ": "verweis",
                "ziel": "kabelanschluss-nicht-umlagefaehig",
                "text": "Wie Sie erkennen, ob TV-Kabelgebühren zu Unrecht in Ihrer Abrechnung stehen und wie Sie zu viel gezahltes Geld zurückfordern, erfahren Sie im Detailartikel zum Kabelanschluss."
        },
        {
                "typ": "h2",
                "text": "Was tun, wenn Sie einen Fehler entdeckt haben?"
        },
        {
                "typ": "text",
                "text": "Haben Sie einen oder mehrere der genannten Fehler in Ihrer Abrechnung gefunden, sollten Sie nicht einfach zahlen. Sie haben das Recht, innerhalb von zwölf Monaten nach Zugang schriftlich Einwände zu erheben und Einsicht in die zugrunde liegenden Belege zu verlangen."
        },
        {
                "typ": "verweis",
                "ziel": "widerspruch-nebenkostenabrechnung",
                "text": "Eine Schritt-für-Schritt-Anleitung samt Musterschreiben für Ihren Widerspruch und die geltenden Fristen finden Sie im Artikel zum Widerspruch gegen die Nebenkostenabrechnung."
        },
        {
                "typ": "verweis",
                "ziel": "betriebskostenspiegel-2024",
                "text": "Um einzuschätzen, ob Ihre Heizkosten überhaupt im üblichen Rahmen liegen, hilft ein Blick in den Betriebskostenspiegel als Vergleichswert."
        },
        {
                "typ": "h2",
                "text": "Rückendeckung durch aktuelle Rechtsprechung"
        },
        {
                "typ": "text",
                "text": "Auch die Gerichte haben in den letzten Jahren mehrfach zugunsten von Mietern entschieden, etwa bei Fragen zum Wirtschaftlichkeitsgebot oder zur korrekten Anwendung des Kürzungsrechts. Diese Urteile stärken Ihre Position, wenn Sie gegen eine fehlerhafte Abrechnung vorgehen möchten."
        },
        {
                "typ": "verweis",
                "ziel": "bgh-urteile-mietrecht-nebenkosten-2026",
                "text": "Welche aktuellen BGH-Entscheidungen 2026 Ihre Rechte bei der Nebenkostenabrechnung stärken, lesen Sie im Überblick zu den wichtigsten Urteilen."
        },
        {
                "typ": "hinweis",
                "text": "Auch wenn viele Fehler auf Unwissen statt Absicht beruhen, ändert das nichts an Ihrem Recht auf eine korrekte Abrechnung. Prüfen Sie im Zweifel jede Position genau, bevor Sie eine Nachzahlung leisten."
        },
        {
                "typ": "cta",
                "text": "Jetzt Abrechnung kostenlos prüfen lassen."
        }
],
    },
    {
      id: "bgh-urteile-mietrecht-nebenkosten-2026",
      titelKurz: "BGH-Urteile zu Nebenkosten 2026",
      titel: "Aktuelle BGH-Urteile Mietrecht Nebenkosten 2026: Das müssen Mieter wissen",
      teaser: "Der Bundesgerichtshof hat 2026 mehrere wichtige Entscheidungen zur Betriebskostenabrechnung getroffen, von der Wirtschaftlichkeit der Kosten bis zur Grundsteuer. Wir erklären dir verständlich, was sich geändert hat und wie du davon profitierst.",
      datum: "Juli 2026",
      lesezeit: "8 Min.",
      bild: "/artikelbilder/bgh-urteile-mietrecht-nebenkosten-2026.jpg",
      bildAlt: "Gerichtsgebäude mit Säulenfront",
      kategorie: "Mietrecht",
      keywords: [],
      inhalt: [
        {
                "typ": "intro",
                "text": "Jedes Jahr entscheidet der Bundesgerichtshof (BGH) über strittige Fragen rund um die Nebenkostenabrechnung und diese Urteile wirken sich unmittelbar auf deine Rechte als Mieter aus. Im Jahr 2026 gab es gleich mehrere wichtige Entscheidungen, die klären, wann Vermieter Vergleichsangebote einholen müssen, wie sich Einsprüche gegen die Grundsteuer auf deine Abrechnungsfrist auswirken und welche Fehler eine Nachzahlung zu Fall bringen können. Dieser Ratgeber fasst die wichtigsten Urteile zusammen, verständlich erklärt, ohne Juristendeutsch."
        },
        {
                "typ": "h2",
                "text": "Warum BGH-Urteile für deine Abrechnung wichtig sind"
        },
        {
                "typ": "text",
                "text": "Der BGH ist die höchste Instanz für Zivilrecht in Deutschland und damit auch für Mietstreitigkeiten. Seine Entscheidungen sind zwar formal nur für den jeweiligen Einzelfall bindend, werden aber von Amtsgerichten und Landgerichten bundesweit als Maßstab herangezogen. Wenn du weißt, wie der BGH aktuell zu bestimmten Streitfragen urteilt, kannst du besser einschätzen, ob sich ein Widerspruch gegen deine Nebenkostenabrechnung lohnt."
        },
        {
                "typ": "h2",
                "text": "Wirtschaftlichkeitsgebot: Kein automatischer Fehler ohne Vergleichsangebote"
        },
        {
                "typ": "text",
                "text": "Eine der bedeutendsten Entscheidungen des Jahres 2026 betrifft das sogenannte Wirtschaftlichkeitsgebot. Der BGH hat am 20. Mai 2026 klargestellt, dass ein Verstoß gegen dieses Gebot nicht schon dann vorliegt, wenn dein Vermieter vor der Beauftragung von Dienstleistungen keine Vergleichsangebote eingeholt hat."
        },
        {
                "typ": "text",
                "text": "Entscheidend ist laut BGH vielmehr, ob dein Vermieter Leistungen zu nicht marktgerechten, objektiv überhöhten Preisen beauftragt hat und ob das Einholen von Vergleichsangeboten tatsächlich zu einer Kosteneinsparung geführt hätte. Das bedeutet: Es reicht nicht, im Widerspruch nur zu behaupten, es gebe günstigere Anbieter."
        },
        {
                "typ": "liste",
                "items": [
                        "Du musst konkret darlegen, dass der vereinbarte Preis objektiv überhöht war",
                        "Ein bloßer Verweis auf ein einzelnes günstigeres Angebot reicht meist nicht aus",
                        "Der BGH stellte zudem klar, dass die Regelungen zum Einwendungsausschluss auch für Einwände zur Wirtschaftlichkeit gelten, du musst also fristgerecht widersprechen"
                ]
        },
        {
                "typ": "hinweis",
                "text": "Wichtig: Auch wenn dieses Urteil auf den ersten Blick vermieterfreundlich wirkt, bleibt das Wirtschaftlichkeitsgebot bestehen. Bei tatsächlich überhöhten Preisen, etwa deutlich über dem Marktniveau, hast du weiterhin gute Chancen, eine Kürzung durchzusetzen."
        },
        {
                "typ": "h2",
                "text": "Grundsteuer-Einspruch verlängert die Abrechnungsfrist"
        },
        {
                "typ": "text",
                "text": "Ebenfalls im Urteil vom 20. Mai 2026 hat sich der BGH mit einer praxisrelevanten Frage befasst: Was passiert, wenn dein Vermieter gegen einen Grundsteuerbescheid Einspruch eingelegt hat? Der BGH entschied, dass die Frist für eine nachträgliche Abrechnung gegenüber dem Mieter in diesem Fall erst läuft, wenn über den Einspruch entschieden wurde."
        },
        {
                "typ": "text",
                "text": "Für dich als Mieter bedeutet das: Die übliche Zwölf-Monats-Frist zur Abrechnung nach § 556 Abs. 3 BGB kann sich in solchen Fällen ausnahmsweise verschieben. Grundsätzlich gilt aber weiterhin, dass dein Vermieter die Betriebskostenabrechnung spätestens bis zum Ablauf des zwölften Monats nach Ende des Abrechnungszeitraums zustellen muss."
        },
        {
                "typ": "verweis",
                "ziel": "widerspruch-nebenkostenabrechnung",
                "text": "Ob deine Abrechnung fristgerecht war und wie du bei Zweifeln richtig widersprichst, erfährst du in unserem ausführlichen Ratgeber zum Widerspruch gegen die Nebenkostenabrechnung."
        },
        {
                "typ": "h2",
                "text": "Wärmelieferung: Nicht jede Umstellung ist automatisch umlagefähig"
        },
        {
                "typ": "text",
                "text": "Stellt dein Vermieter die Wärmeversorgung von einer Selbstversorgung der Mieter auf eine gewerbliche Wärmelieferung (Contracting) um, dürfen die daraus entstehenden Kosten nicht ohne Weiteres auf dich als Nebenkosten umgelegt werden. Die entsprechende mietrechtliche Vorschrift des § 556c BGB greift laut BGH nur dann, wenn die Mieter bereits vor der Umstellung Heizkosten als Betriebskosten getragen haben."
        },
        {
                "typ": "text",
                "text": "Wurde in deinem Haus also erstmals ein externer Wärmelieferant eingeschaltet, obwohl vorher gar keine Heizkosten separat abgerechnet wurden, solltest du genau prüfen, ob die neuen Kosten überhaupt rechtmäßig umlagefähig sind."
        },
        {
                "typ": "h2",
                "text": "Formelle und materielle Fehler: Unterschiedliche Folgen für deine Nachzahlung"
        },
        {
                "typ": "text",
                "text": "Der BGH hat 2026 auch die Unterscheidung zwischen formellen und materiellen Fehlern in der Betriebskostenabrechnung präzisiert. Erstreckt sich ein formeller Fehler nicht auf alle Abrechnungspositionen, verbleibt dem Vermieter eine Nachforderung insoweit, als sich unwirksame Einzelpositionen unschwer herausrechnen lassen und die Nachforderung auch ohne diese Positionen gerechtfertigt ist."
        },
        {
                "typ": "text",
                "text": "Materiell-rechtliche Fehler, also inhaltliche Fehler bei der Berechnung, führen dagegen lediglich zu einer Kürzung des Nachzahlungsanspruchs, gegebenenfalls bis auf null Euro. Sie machen die Abrechnung aber nicht von vornherein insgesamt unwirksam, wie es bei schweren formellen Mängeln der Fall sein kann."
        },
        {
                "typ": "text",
                "text": "Ein klassisches Beispiel für einen materiellen Fehler, der aktuell noch immer häufig vorkommt: Kosten für einen Kabelanschluss, die seit einer Gesetzesänderung 2024 grundsätzlich nicht mehr als Betriebskosten umgelegt werden dürfen."
        },
        {
                "typ": "verweis",
                "ziel": "kabelanschluss-nicht-umlagefaehig",
                "text": "In unserem Artikel erfährst du, warum Kabelanschlusskosten seit Juli 2024 nicht mehr umlagefähig sind und wie du diesen Posten in deiner Abrechnung erkennst."
        },
        {
                "typ": "h2",
                "text": "Belegeinsicht: Dein Recht bleibt stark"
        },
        {
                "typ": "text",
                "text": "Auch wenn dieses Urteil nicht ganz neu ist, bestätigt sich die Linie des BGH 2026 weiter: Mieter haben Anspruch auf Einsicht in die Originalbelege der Nebenkostenabrechnung, Kopien gelten dabei nicht als gleichwertig. Für dieses Recht musst du kein besonderes Interesse nachweisen, es ergibt sich schon aus der grundsätzlichen Rechenschaftspflicht deines Vermieters."
        },
        {
                "typ": "text",
                "text": "Nur in seltenen Ausnahmefällen, etwa bei begründetem Verdacht auf Schikane, darf dein Vermieter die Einsicht einschränken."
        },
        {
                "typ": "h2",
                "text": "Was bedeutet das konkret für dich als Mieter?"
        },
        {
                "typ": "liste",
                "items": [
                        "Prüfe bei Verdacht auf überhöhte Kosten, ob die Preise objektiv marktunüblich sind: ein einzelnes günstigeres Angebot reicht als Beweis oft nicht",
                        "Achte bei Umstellungen auf Wärmelieferung darauf, ob vorher überhaupt Heizkosten separat abgerechnet wurden",
                        "Verlange bei Zweifeln Einsicht in die Originalbelege, dieses Recht steht dir uneingeschränkt zu",
                        "Vergleiche deine Abrechnung mit üblichen Werten, um schnell zu erkennen, ob einzelne Posten aus dem Rahmen fallen",
                        "Widerspreche fristgerecht, denn auch Einwände zur Wirtschaftlichkeit unterliegen dem Einwendungsausschluss"
                ]
        },
        {
                "typ": "verweis",
                "ziel": "betriebskostenspiegel-2024",
                "text": "Um einzuschätzen, ob einzelne Kostenpositionen in deiner Abrechnung überhöht sind, hilft ein Blick in den DMB Betriebskostenspiegel mit bundesweiten Vergleichswerten."
        },
        {
                "typ": "hinweis",
                "text": "Dieser Artikel ersetzt keine individuelle Rechtsberatung. Bei konkreten Streitfällen mit deinem Vermieter empfiehlt sich eine Prüfung durch den Mieterverein oder einen Fachanwalt für Mietrecht."
        },
        {
                "typ": "cta",
                "text": "Jetzt Abrechnung kostenlos prüfen lassen."
        }
],
    },
    {
      id: "widerspruch-nebenkostenabrechnung",
      titelKurz: "Widerspruch Nebenkostenabrechnung",
      titel: "Widerspruch Nebenkostenabrechnung 2026: Frist, Muster & Anleitung",
      teaser: "12 Monate Zeit, aber nur 30 Tage für die Nachzahlung, viele Mieter verwechseln diese Fristen. Was Sie jetzt wissen müssen.",
      datum: "Juni 2026",
      lesezeit: "6 Min.",
      bild: "/artikelbilder/widerspruch-nebenkostenabrechnung.jpg",
      bildAlt: "Person schreibt mit einem Stift auf einen Notizblock",
      kategorie: "Mietrecht",
      keywords: ["Widerspruch Nebenkostenabrechnung", "Frist", "Muster", "§ 556 BGB"],
      inhalt: [
        { typ: "intro", text: "Sie haben Ihre Nebenkostenabrechnung erhalten und vermuten Fehler? Dann haben Sie als Mieter das Recht, innerhalb von 12 Monaten Widerspruch einzulegen. Doch Vorsicht: Die Zahlungsfrist für eine Nachzahlung beträgt nur 30 Tage, unabhängig vom Widerspruch. Wer das verwechselt, riskiert Verzugszinsen oder schlimmstenfalls die Kündigung." },
        { typ: "h2", text: "Die zwei entscheidenden Fristen und warum viele Mieter sie verwechseln" },
        { typ: "text", text: "Das Mietrecht kennt zwei völlig unterschiedliche Fristen nach Erhalt der Nebenkostenabrechnung:" },
        { typ: "liste", items: [
          "30 Tage: Zahlungsfrist für eine Nachzahlung (§ 286 BGB). Diese Frist gilt unabhängig davon, ob Sie Widerspruch einlegen. Lösung: Zahlen Sie unter Vorbehalt, schreiben Sie auf die Überweisung: 'Zahlung unter Vorbehalt der Überprüfung'.",
          "12 Monate: Widerspruchsfrist gegen fehlerhafte Positionen (§ 556 Abs. 3 BGB). Die Frist beginnt mit dem Tag des Erhalts der Abrechnung.",
        ]},
        { typ: "hinweis", text: "Wichtig: Zahlung unter Vorbehalt schützt Sie. Auch wenn Sie die Nachzahlung leisten, können Sie innerhalb von 12 Monaten noch Widerspruch einlegen und zu viel gezahltes Geld zurückfordern." },
        { typ: "h2", text: "Wann lohnt sich ein Widerspruch?" },
        { typ: "text", text: "Ein Widerspruch ist sinnvoll wenn Ihre Abrechnung formelle oder inhaltliche Fehler enthält:" },
        { typ: "liste", items: [
          "Formelle Fehler (gravierend): Abrechnung fehlt ganz, wurde zu spät zugestellt (nach dem 31.12. des Folgejahres), oder enthält keinen nachvollziehbaren Verteilerschlüssel. Folge: Die gesamte Abrechnung ist unwirksam. Sie müssen keine Nachzahlung leisten.",
          "Inhaltliche Fehler: Nicht umlagefähige Posten (z.B. Kabelanschluss seit Juli 2024, Verwaltungskosten, Reparaturen), überhöhte Beträge über dem DMB-Richtwert, Verstoß gegen die Heizkostenverordnung.",
        ]},
        { typ: "verweis", ziel: "kabelanschluss-nicht-umlagefaehig", text: "Kabelanschluss in Ihrer Abrechnung? Seit Juli 2024 ist dieser Posten grundsätzlich nicht mehr umlagefähig. Details im Artikel zur Rechtsänderung." },
        { typ: "verweis", ziel: "betriebskostenspiegel-2024", text: "Nicht sicher, ob Ihre Beträge zu hoch sind? Der DMB-Betriebskostenspiegel 2024 zeigt die aktuellen Durchschnittswerte je Kostenart." },
        { typ: "h2", text: "Schritt-für-Schritt: So legen Sie wirksam Widerspruch ein" },
        { typ: "schritte", items: [
          "Abrechnung systematisch prüfen: Jeden Posten auf Umlagefähigkeit (§ 2 BetrKV) und Plausibilität (DMB-Betriebskostenspiegel) prüfen.",
          "Fehler konkret benennen: Pauschal 'die Abrechnung ist falsch' reicht nicht, benennen Sie jeden strittigen Posten mit Betrag und Begründung.",
          "Widerspruch schriftlich formulieren: Per Einschreiben mit Rückschein, nur so ist der Zugang beim Vermieter beweisbar.",
          "Belegeinsicht anfordern: Sie haben das Recht, alle Originalrechnungen einzusehen (§ 259 BGB). Verlangen Sie die Belege immer, auch wenn Sie zahlen.",
          "Frist im Blick behalten: Spätestens 12 Monate nach Erhalt der Abrechnung muss der Widerspruch beim Vermieter eingegangen sein.",
        ]},
        { typ: "h2", text: "Was gehört in den Widerspruchsbrief?" },
        { typ: "text", text: "Ein wirksamer Widerspruch muss folgende Elemente enthalten:" },
        { typ: "liste", items: [
          "Ihre vollständige Adresse und die des Vermieters",
          "Klarer Betreff: 'Widerspruch zur Betriebskostenabrechnung [Jahr]'",
          "Konkrete Benennung der beanstandeten Positionen mit Betrag",
          "Rechtsgrundlage (z.B. '§ 2 BetrKV, nicht umlagefähig')",
          "Aufforderung zur Belegeinsicht (§ 259 BGB)",
          "Vorbehalt für weitere Einwände nach Belegeinsicht",
          "Bitte um schriftliche Stellungnahme",
        ]},
        { typ: "cta", text: "NebenkostenRadar erstellt den Widerspruchsbrief automatisch, mit allen Rechtsgrundlagen, auf Basis Ihrer konkreten Abrechnung." },
        { typ: "h2", text: "Häufige Fehler beim Widerspruch und wie Sie sie vermeiden" },
        { typ: "liste", items: [
          "Nur mündlich widersprechen: Gilt rechtlich nicht, immer schriftlich.",
          "Zu pauschal formulieren: 'Die Abrechnung stimmt nicht' reicht nicht, konkrete Positionen nennen.",
          "Frist verpassen: Ab dem 13. Monat nach Erhalt sind Einwände in der Regel ausgeschlossen.",
          "Nicht unter Vorbehalt zahlen: Wer die Nachzahlung ohne Vorbehalt zahlt, erschwert eine spätere Rückforderung.",
        ]},
      ],
    },
    {
      id: "kabelanschluss-nicht-umlagefaehig",
      titelKurz: "Kabelanschluss nicht mehr umlagefähig",
      titel: "Kabelanschluss in Nebenkosten: Seit Juli 2024 nicht mehr umlagefähig",
      teaser: "Vermieter dürfen Kabelgebühren seit dem 01.07.2024 nicht mehr auf Mieter umlegen. Was das bedeutet und wie Sie zu viel gezahltes Geld zurückbekommen.",
      datum: "Juni 2026",
      lesezeit: "4 Min.",
      bild: "/artikelbilder/kabelanschluss-nicht-umlagefaehig.jpg",
      bildAlt: "Alte Fernsehantenne an einem Wohngebäude",
      kategorie: "Rechtsänderungen",
      keywords: ["Kabelanschluss Nebenkosten", "nicht umlagefähig 2024", "§ 2 TKG"],
      inhalt: [
        { typ: "intro", text: "Seit dem 1. Juli 2024 dürfen Vermieter die Kosten für einen Kabelanschluss nicht mehr als Betriebskosten auf Mieter umlegen. Das Telekommunikationsgesetz (TKG) schreibt dies klar vor, trotzdem findet sich der Posten noch in vielen Abrechnungen." },
        { typ: "h2", text: "Was hat sich geändert?" },
        { typ: "text", text: "Bis Juni 2024 war es Vermietern erlaubt, Kosten für einen Sammelkabelanschluss (§ 2 Nr. 15b BetrKV a.F.) auf die Mieter umzulegen: das sogenannte 'Nebenkostenprivileg'. Durch das Telekommunikationsmodernisierungsgesetz (TKMoG) wurde dieses Privileg abgeschafft." },
        { typ: "hinweis", text: "Ab dem 01.07.2024 gilt: Kabelanschlusskosten sind keine umlagefähigen Betriebskosten mehr. Jeder Betrag unter diesem Posten in einer Abrechnung für Zeiträume ab Juli 2024 kann vollständig zurückgefordert werden." },
        { typ: "h2", text: "Welche Abrechnungen sind betroffen?" },
        { typ: "liste", items: [
          "Abrechnungen für das gesamte Jahr 2025 und später: Kabelkosten komplett nicht umlagefähig.",
          "Abrechnungen für 2024 (gemischter Zeitraum): Nur der Anteil ab Juli 2024 ist nicht umlagefähig, also 6/12 des Jahresbetrags.",
          "Abrechnungen für 2023 und früher: Das alte Recht gilt. Kabelkosten waren umlagefähig.",
        ]},
        { typ: "verweis", ziel: "widerspruch-nebenkostenabrechnung", text: "So legen Sie formal Widerspruch ein und fordern zu viel gezahlte Kabelkosten zurück. Fristen und Muster im Widerspruchs-Ratgeber." },
        { typ: "cta", text: "NebenkostenRadar erkennt Kabelanschlusskosten automatisch und weist sie als nicht umlagefähig aus, mit der korrekten Rechtsgrundlage für Ihren Widerspruch." },
      ],
    },
    {
      id: "betriebskostenspiegel-2024",
      // WICHTIG: Dieses Feld, nicht "titel", landet im <title> der Seite und
      // damit in der Google-Trefferliste (siehe artikelTitel() in
      // src/config/seo.js). Beim Ändern der Jahreszahl am 19.09.2026 hätte
      // ich das beinahe übersehen und nur die Überschrift im Artikel
      // angefasst, die für die Suche nichts bringt. Gefunden, weil ich das
      // gebaute HTML nachgesehen habe.
      //
      // LÄNGE: Der Zusatz " | NebenkostenRadar" (19 Zeichen) kommt automatisch
      // dazu, bei einer Obergrenze von 60 bleiben also 41 Zeichen. Mein erster
      // Versuch "Betriebskostenspiegel 2026: was ist normal?" hatte 43 und ist
      // von scripts/seo-check.mjs mit "Titel 62 Zeichen (max 60)" abgelehnt
      // worden. Gut so, denn Google hätte ihn abgeschnitten.
      //
      // Die jetzige Fassung hat 37 Zeichen und bringt beide Begriffe unter,
      // auf die es ankommt: die gesuchte Jahreszahl und "Mieter". Die Frage
      // "was ist normal" steht weiterhin in der H1 und in der Beschreibung,
      // dort gibt es keine Längenbegrenzung.
      titelKurz: "Betriebskostenspiegel {JAHR} für Mieter",
      // JAHRESZAHL IM TITEL GEÄNDERT 19.09.2026, siehe
      // planung/sichtbarkeit-umsetzung.md Abschnitt 1.
      //
      // Vorher: "DMB Betriebskostenspiegel 2024: Was ist normal?" Sachlich
      // richtig, denn die Zahlen des Mieterbunds stammen aus dem
      // Abrechnungsjahr 2024. Nur sucht danach niemand. Ein Mieter mit der
      // Abrechnung auf dem Tisch tippt das laufende Jahr ein. Alle drei
      // Wettbewerber, die für das Thema ranken, machen das auch so:
      // mein-nebenkostenrechner.de, nebenkostenpro.de und
      // nebenkosten-verstehen.de führen sämtlich "2026" im Titel.
      //
      // Die URL bleibt bewusst unverändert. Sie trägt die Platzierung, die
      // wir heute haben, und ein Wechsel ohne Weiterleitung würde sie
      // verlieren. Das ist ein eigener Schritt, erst wenn messbar ist, ob
      // diese Änderung hier gewirkt hat.
      //
      // Dass die Daten aus 2024 stammen, steht weiterhin im ersten Absatz und
      // in der Tabelle. Der Titel verspricht Aktualität, der Text liefert die
      // Einordnung. Beides muss so bleiben.
      titel: "Betriebskostenspiegel {JAHR}: was ist normal? Aktuelle DMB-Zahlen",
      teaser: "Der Deutsche Mieterbund veröffentlicht jährlich Durchschnittswerte für alle Nebenkostenarten. Die aktuellen Zahlen stammen aus dem Abrechnungsjahr 2024. Hier erfahren Sie, was für Ihre Wohnungsgröße normal ist und wann Ihre Abrechnung zu teuer ist.",
      datum: "September 2026",
      lesezeit: "5 Min.",
      bild: "/artikelbilder/betriebskostenspiegel-2024.jpg",
      bildAlt: "Diagramme und Auswertungen auf einem Bildschirm",
      kategorie: "Richtwerte",
      keywords: ["Betriebskostenspiegel {JAHR}", "Betriebskostenspiegel 2024", "DMB Richtwerte", "Nebenkosten Durchschnitt {JAHR}"],
      inhalt: [
        // Der erste Absatz stellt sofort klar, aus welchem Jahr die Zahlen
        // stammen. Der Titel nennt das laufende Jahr, weil danach gesucht
        // wird; hier steht, worauf die Zahlen beruhen. Ohne diesen Satz wäre
        // die Überschrift irreführend, und das wollen wir nicht.
        { typ: "intro", text: "Der Deutsche Mieterbund (DMB) veröffentlicht jährlich den Betriebskostenspiegel: eine Auswertung realer Nebenkostenabrechnungen in Deutschland. Er zeigt Durchschnittswerte und Höchstwerte für alle umlagefähigen Kostenarten pro Quadratmeter und Monat. Die aktuell gültige Ausgabe wurde im Dezember 2025 veröffentlicht und wertet Abrechnungen des Jahres 2024 aus. Sie ist damit der Maßstab, an dem Sie eine Abrechnung messen, die Sie {JAHR} erhalten." },
        { typ: "h2", text: "Die wichtigsten Richtwerte im Überblick" },
        { typ: "richtwerte" },
        { typ: "hinweis", text: "Liegt Ihre Abrechnung deutlich über dem Durchschnitt, lohnt sich eine genauere Prüfung. Wichtig: Eine Abweichung nach oben ist ein Anlass zur Nachfrage, kein Beweis für einen Fehler, warum, erklärt der Abschnitt zu den Grenzen weiter unten." },
        { typ: "h2", text: "Wie nutze ich die Richtwerte?" },
        { typ: "text", text: "Multiplizieren Sie den €/m²/Monat-Wert mit Ihrer Wohnfläche und mit 12: das ergibt den erwarteten Jahresbetrag für Ihre Wohnung. Beispiel: Der Gesamtdurchschnitt von 2,67 €/m²/Monat bedeutet für eine 75-Quadratmeter-Wohnung rund 2.403 Euro im Jahr, also etwa 200 Euro im Monat." },
        { typ: "text", text: "Für einzelne Positionen funktioniert die Rechnung genauso. Liegt ein Posten deutlich über dem erwarteten Wert, ist das der Punkt, an dem Sie Belegeinsicht verlangen sollten, nicht, um sofort zu widersprechen, sondern um nachzuvollziehen, wie der Betrag zustande kommt." },

        { typ: "h2", text: "Was sich gegenüber dem Vorjahr verändert hat" },
        { typ: "text", text: "Der Betriebskostenspiegel für das Abrechnungsjahr 2024 wurde am 18. Dezember 2025 veröffentlicht. Gegenüber dem Abrechnungsjahr 2023 sind die durchschnittlichen Betriebskosten um mehr als sechs Prozent gestiegen. Fallen in einem Gebäude sämtliche denkbaren Betriebskostenarten an, kann die sogenannte zweite Miete laut DMB bis zu 3,68 €/m²/Monat betragen." },
        { typ: "liste", items: [
          "Für eine 80 Quadratmeter große Wohnung ergaben sich beim Anfallen aller Betriebskostenarten durchschnittlich 3.532,80 Euro für das Abrechnungsjahr 2024.",
          "Das sind 508,80 Euro mehr als im Vorjahr, bei unveränderter Wohnung und unverändertem Verhalten.",
          "Treiber sind vor allem die Energiepreise sowie die CO2-Abgabe, die fossile Energieträger zusätzlich verteuert.",
          "Gegenläufig entwickelte sich eine einzige Position: Antenne und Kabel sanken um rund 42 Prozent, weil das sogenannte Nebenkostenprivileg zum 1. Juli 2024 weggefallen ist.",
        ]},
        { typ: "verweis", ziel: "kabelanschluss-nicht-umlagefaehig", text: "Steht in Ihrer Abrechnung trotzdem noch ein Posten für Kabel oder Gemeinschaftsantenne? Seit Juli 2024 ist er grundsätzlich nicht mehr umlagefähig, was das für Sie bedeutet, steht im Detailartikel." },
        { typ: "verweis", ziel: "grundsteuerreform-2026-auswirkungen-auf-die-nebenkostenabrechnung", text: "Ein zweiter Kostentreiber kommt gerade erst in den Abrechnungen an: die reformierte Grundsteuer, die seit Januar 2025 neu berechnet wird." },

        { typ: "h2", text: "Die Grenzen des Betriebskostenspiegels, ehrlich betrachtet" },
        { typ: "text", text: "Der DMB-Betriebskostenspiegel ist ein bundesweiter Durchschnitt. Er unterscheidet nicht nach Region, Gebäudegröße oder Ausstattung. Das macht ihn zu einem guten ersten Anhaltspunkt, aber zu einem schlechten Beweismittel und wer ihn als Beweis benutzt, verliert im Zweifel die Diskussion mit dem Vermieter." },
        { typ: "text", text: "Ein Blick ins Ausland zeigt, wie es sonst gemacht wird: In Südkorea veröffentlicht ein staatliches Portal die Nebenkosten offenlegungspflichtiger Wohnanlagen, und Bewohner können ihre Kosten Position für Position gegen ähnlich große Anlagen stellen. In Japan weist die Wohnungseigentumserhebung des Ministeriums die Werte nach Einheitenzahl, Geschosszahl und Objekttyp getrennt aus. Verglichen wird dort also gegen eine Vergleichsgruppe, nicht gegen einen Landesdurchschnitt." },
        { typ: "liste", items: [
          "Regionale Unterschiede: Die Grundsteuer liegt in Großstädten mit hohen Bodenrichtwerten regelmäßig deutlich über dem Bundesdurchschnitt, ohne dass ein Abrechnungsfehler vorliegt.",
          "Gebäudegröße: Fixkosten wie Hausmeister oder Versicherungen verteilen sich in großen Häusern auf mehr Parteien, pro Quadratmeter sinkt der Anteil.",
          "Ausstattung: Ein Aufzug, eine Tiefgarage oder ein gepflegter Garten erzeugen Kosten, die in einem Haus ohne diese Ausstattung schlicht nicht anfallen.",
          "Verbrauch: Heizkosten hängen stark vom energetischen Zustand des Gebäudes ab, nicht nur vom eigenen Heizverhalten.",
          "Abrechnungszeitraum: Ein besonders kalter Winter verschiebt die Heizkosten aller Haushalte nach oben.",
        ]},
        { typ: "hinweis", text: "Praktische Folge: Eine Abweichung nach oben ist ein Grund, Belege anzufordern, nicht mehr und nicht weniger. Erst wenn sich aus den Belegen keine sachliche Erklärung ergibt, wird daraus ein begründeter Einwand." },

        { typ: "h2", text: "Häufige Fragen zum Betriebskostenspiegel" },
        { typ: "liste", items: [
          "Woher stammen die Daten? Vom Deutschen Mieterbund, ausgewertet aus bundesweit eingereichten realen Abrechnungen. Die Ausgabe für das Abrechnungsjahr 2024 wurde am 18.12.2025 veröffentlicht.",
          "Warum gibt es keine Werte für meine Stadt? Auf Stadt- oder Kreisebene existieren in Deutschland keine belastbaren Betriebskostendaten. Was dort veröffentlicht wird, sind Mietspiegel: die bilden die Kaltmiete ab, nicht die Nebenkosten.",
          "Ist eine Abweichung nach oben ein Beweis für einen Fehler? Nein. Sie ist ein Anlass, Belegeinsicht zu verlangen (§ 259 BGB). Diesen Anspruch haben Sie ohne Angabe von Gründen.",
          "Muss ich zahlen, wenn ich die Abrechnung anzweifle? Ja und zwar zuerst. Zahlen Sie unter Vorbehalt und widersprechen Sie parallel. Wer nicht zahlt, riskiert Verzugszinsen und im Extremfall die Kündigung, unabhängig davon, ob der Widerspruch später Erfolg hat.",
          "Wie aktuell sind die Werte auf dieser Seite? Sie stammen direkt aus der Konfiguration, mit der auch unsere Prüfung rechnet. Ratgeber und Prüfbericht können deshalb nicht auseinanderlaufen.",
          "Ist NebenkostenRadar unabhängig? Ja. Keine Verbindung zu Vermietern, Hausverwaltungen, Messdienstleistern oder Immobilienunternehmen. Wir verkaufen ausschließlich die Prüfung an Mieter.",
        ]},
        { typ: "hinweis", text: "Zahlung unter Vorbehalt: Schreiben Sie bei der Überweisung 'Zahlung unter Vorbehalt der Überprüfung' in den Verwendungszweck. Damit erhalten Sie sich den Rückforderungsanspruch, ohne in Zahlungsverzug zu geraten." },

        { typ: "h2", text: "Tabelle auf der eigenen Website einbinden" },
        { typ: "text", text: "Sie betreiben eine Website für Mieter, einen Mieterverein oder einen Blog und möchten diese Tabelle dort zeigen? Sie dürfen sie einbinden. Fügen Sie dazu die folgenden zwei Zeilen an der Stelle ein, an der die Tabelle erscheinen soll:" },
        { typ: "liste", items: [
          '<div id="nkr-betriebskostenspiegel"></div>',
          '<script src="https://nebenkostenradar.com/widget.js" async></script>',
        ]},
        { typ: "text", text: "Die Tabelle aktualisiert sich automatisch, sobald der Deutsche Mieterbund neue Werte veröffentlicht. Sie müssen nichts nachpflegen. Unter der Tabelle erscheint eine Quellenangabe mit Verweis auf diese Seite. Es werden keine Cookies gesetzt und keine Besucherdaten erhoben." },

        { typ: "verweis", ziel: "widerspruch-nebenkostenabrechnung", text: "Liegt Ihre Abrechnung deutlich über dem Durchschnitt? Der Widerspruchs-Ratgeber zeigt Fristen und den korrekten Ablauf." },
        { typ: "verweis", ziel: "betriebskostenabrechnung-fristen-und-verjaehrung-2026", text: "Wie lange Ihr Vermieter für die Abrechnung Zeit hat und bis wann Sie widersprechen können, erklärt der Ratgeber zu Fristen und Verjährung." },
        { typ: "cta", text: "NebenkostenRadar macht diesen Vergleich automatisch für jeden Posten Ihrer Abrechnung und sagt Ihnen dazu, wo eine Abweichung erklärbar ist und wo nicht." },
      ],
    },

    // ─────────────────────────────────────────────────────────────────────
    // THEMEN-CLUSTER, ergänzt am 10.09.2026 (Maßnahme V7).
    //
    // WARUM: Die Wettbewerbsrecherche (planung/europa-potenzial-nkr.md,
    // Abschnitt 5.1 g) hat gezeigt, dass pruefenlassen.ch rund 17
    // Unterseiten allein zum Thema Nebenkosten betreibt — je eine pro
    // konkreter Suchanfrage. NebenkostenRadar hatte 10 Artikel, teils sehr
    // breit angelegt. Breite Artikel ranken schlechter als Seiten, die
    // genau eine Frage beantworten.
    //
    // Die folgenden Artikel decken je einen eigenen Sucheinstieg ab und
    // überschneiden sich bewusst NICHT mit den bestehenden zehn (geprüft:
    // Grundsteuer, Hausmeister, Müll, Wasser, Fristen, Heizkosten, BGH,
    // Widerspruch, Kabel, Betriebskostenspiegel waren vorhanden).
    //
    // ALLE ZITIERTEN URTEILE SIND VERIFIZIERT. Keines stammt aus dem
    // Gedächtnis — jedes wurde am 10.09.2026 gegen eine Fundstelle geprüft.
    // Wer hier einen Artikel ergänzt: bitte genauso verfahren. Ein
    // erfundenes Aktenzeichen in einem Ratgeber wäre für die
    // Glaubwürdigkeit des ganzen Produkts fatal.
    // ─────────────────────────────────────────────────────────────────────
    {
      id: "umlageschluessel-nebenkostenabrechnung-pruefen",
      titelKurz: "Umlageschlüssel prüfen",
      titel: "Umlageschlüssel in der Nebenkostenabrechnung prüfen: Welcher Maßstab gilt?",
      teaser: "Wohnfläche, Personenzahl oder Verbrauch: der Umlageschlüssel entscheidet mit darüber, wie viel Sie zahlen. Was im Mietvertrag stehen muss, was ohne Vereinbarung gilt und wann Ihr Vermieter den Schlüssel ändern darf.",
      datum: "September 2026",
      lesezeit: "6 Min.",
      bild: "/artikelbilder/umlageschluessel-nebenkostenabrechnung-pruefen.jpg",
      bildAlt: "Grundriss eines Wohngebäudes",
      kategorie: "Mietrecht",
      keywords: ["Umlageschlüssel", "Verteilerschlüssel Nebenkosten", "§ 556a BGB", "Nebenkosten nach Personenzahl"],
      inhalt: [
        { typ: "intro", text: "Zwei Mieter im selben Haus, dieselben Gesamtkosten und trotzdem völlig unterschiedliche Beträge auf der Abrechnung. Der Grund liegt oft nicht bei den Kosten selbst, sondern beim Umlageschlüssel: der Regel, nach der die Gesamtkosten auf die einzelnen Wohnungen verteilt werden. Er ist eine der wenigen Stellschrauben, an denen ein Fehler mehrere Hundert Euro ausmachen kann." },
        { typ: "h2", text: "Was gilt, wenn im Mietvertrag nichts steht?" },
        { typ: "text", text: "Dann greift § 556a Abs. 1 Satz 1 BGB: Betriebskosten sind nach dem Anteil der Wohnfläche umzulegen. Der Flächenmaßstab ist also der gesetzliche Auffangmaßstab, er gilt immer dann, wenn die Parteien nichts anderes vereinbart haben. Wer eine Abrechnung nach Personenzahl oder nach Wohneinheiten erhält, sollte deshalb zuerst in den Mietvertrag schauen: Ohne entsprechende Vereinbarung ist dieser Maßstab nicht anwendbar." },
        { typ: "text", text: "Eine wichtige Ausnahme macht § 556a Abs. 1 Satz 2 BGB: Kosten, die von einem erfassten Verbrauch oder einer erfassten Verursachung abhängen, sind nach einem Maßstab umzulegen, der diesen Verbrauch berücksichtigt. Wo also Zähler vorhanden sind, typischerweise für Wasser und Wärme, darf nicht einfach nach Fläche verteilt werden." },
        { typ: "h2", text: "Die gebräuchlichen Umlageschlüssel im Überblick" },
        { typ: "liste", items: [
          "Wohnfläche: der gesetzliche Auffangmaßstab. Sachgerecht bei flächenabhängigen Kosten wie Grundsteuer, Versicherung oder Gebäudereinigung.",
          "Personenzahl: sachgerecht bei personenabhängigen Kosten wie Müllabfuhr oder teils Wasser. Setzt eine Vereinbarung voraus und dass der Vermieter die Personenzahl tatsächlich fortlaufend erfasst.",
          "Wohneinheiten: alle Wohnungen tragen gleich viel, unabhängig von der Größe. Für den Mieter einer kleinen Wohnung meist der ungünstigste Maßstab.",
          "Verbrauch: zwingend, soweit erfasst wird, bei Heizung und Warmwasser zusätzlich durch die Heizkostenverordnung vorgeschrieben.",
        ]},
        { typ: "h2", text: "Darf der Vermieter den Schlüssel einfach ändern?" },
        { typ: "text", text: "Nicht nach Belieben. Ein einmal vereinbarter Maßstab bindet beide Seiten. § 556a Abs. 2 BGB erlaubt dem Vermieter zwar, verbrauchsabhängige Kosten künftig auf einen Verbrauchsmaßstab umzustellen: das aber nur durch Erklärung in Textform und nur vor Beginn eines Abrechnungszeitraums, nicht rückwirkend mitten im Jahr." },
        { typ: "hinweis", text: "Besonders kritisch: eine Änderung, die genau dann kommt, wenn sie für den Vermieter günstiger wird. Der Bundesgerichtshof hat mit Urteil vom 31. Mai 2006 (Az. VIII ZR 159/05) entschieden, dass ein Vermieter die Flächen leerstehender Wohnungen nicht plötzlich aus der Verteilung herausnehmen darf, wenn zuvor nach Gesamtfläche verteilt wurde: die Kosten würden sonst auf die verbliebenen Mieter verschoben." },
        { typ: "h2", text: "Was Sie konkret prüfen sollten" },
        { typ: "schritte", items: [
          "Mietvertrag heraussuchen und nachlesen, welcher Umlageschlüssel dort vereinbart ist, oft in der Betriebskostenklausel oder einer Anlage.",
          "Abrechnung danebenlegen: Steht der verwendete Schlüssel überhaupt darauf? Er muss angegeben und verständlich sein.",
          "Prüfen, ob der Schlüssel gegenüber dem Vorjahr gewechselt hat. Ein stiller Wechsel ist ein starkes Warnsignal.",
          "Die eigene Wohnfläche in der Abrechnung mit der Fläche im Mietvertrag vergleichen. Abweichungen wirken sich auf jede einzelne Position aus.",
          "Bei Verbrauchskosten: Sind Zähler vorhanden? Dann darf nicht nach Fläche allein verteilt werden.",
        ]},
        { typ: "verweis", ziel: "belegeinsicht-nebenkostenabrechnung-verlangen", text: "Lässt sich der Schlüssel aus der Abrechnung nicht nachvollziehen, hilft die Belegeinsicht, wie Sie sie verlangen, steht im eigenen Ratgeber dazu." },
        { typ: "cta", text: "NebenkostenRadar prüft jede Position gegen die Richtwerte des Deutschen Mieterbundes und weist aus, wo eine Abweichung erklärbar ist und wo nicht." },
      ],
    },
    {
      id: "belegeinsicht-nebenkostenabrechnung-verlangen",
      titelKurz: "Belegeinsicht verlangen",
      titel: "Belegeinsicht bei der Nebenkostenabrechnung verlangen: So gehen Sie vor",
      teaser: "Sie dürfen alle Originalbelege zu Ihrer Abrechnung einsehen und die Nachzahlung bis dahin zurückhalten. Rechtsgrundlage, Ablauf und was der Vermieter Ihnen nicht abverlangen darf.",
      datum: "September 2026",
      lesezeit: "6 Min.",
      bild: "/artikelbilder/belegeinsicht-nebenkostenabrechnung-verlangen.jpg",
      bildAlt: "Rote Aktenordner in einem Regal",
      kategorie: "Mietrecht",
      keywords: ["Belegeinsicht", "Belege Nebenkostenabrechnung", "§ 259 BGB", "Zurückbehaltungsrecht"],
      inhalt: [
        { typ: "intro", text: "Eine Abrechnung nennt Ihnen Zahlen. Ob diese Zahlen stimmen, sagt sie Ihnen nicht. Genau dafür gibt es das Recht auf Belegeinsicht, den wirksamsten und zugleich am seltensten genutzten Hebel, den Mieter bei der Nebenkostenabrechnung haben." },
        { typ: "h2", text: "Worauf sich der Anspruch stützt" },
        { typ: "text", text: "Der Vermieter schuldet mit der Abrechnung eine Rechenschaftslegung. Nach § 259 Abs. 1 BGB umfasst diese auch die Vorlage der Belege, soweit Belege üblicherweise erteilt werden. Der Bundesgerichtshof hat dieses Recht mit Urteil vom 8. März 2006 (Az. VIII ZR 78/05) ausdrücklich bestätigt: Der Mieter darf die Unterlagen einsehen, die der Betriebskostenabrechnung zugrunde liegen." },
        { typ: "text", text: "Dazu gehören nicht nur die Rechnungen selbst, sondern auch die Unterlagen, aus denen sich die Verteilung nachvollziehen lässt, etwa Verträge mit Dienstleistern, Zählerablesungen oder die Flächenberechnung. Erst diese Unterlagen machen die Abrechnung überprüfbar." },
        { typ: "h2", text: "Der stärkste Punkt: das Zurückbehaltungsrecht" },
        { typ: "text", text: "Solange der Vermieter eine berechtigte Bitte um Belegeinsicht nicht erfüllt, können Sie die Nachzahlung nach § 273 Abs. 1 BGB zurückhalten. Auch das hat der Bundesgerichtshof in derselben Entscheidung (VIII ZR 78/05) festgestellt. Der Gedanke dahinter ist einfach: Wer eine Forderung stellt, muss sie auch belegen können." },
        { typ: "hinweis", text: "Zurückhalten heißt nicht: nicht zahlen und die Sache aussitzen. Das Zurückbehaltungsrecht endet, sobald die Einsicht gewährt wird, dann ist der Betrag fällig. Wer auf Nummer sicher gehen will, zahlt unter Vorbehalt und verlangt die Belege parallel. Damit vermeiden Sie jedes Verzugsrisiko und behalten trotzdem alle Rechte." },
        { typ: "h2", text: "Wo die Einsicht stattfinden muss" },
        { typ: "text", text: "Der Grundsatz lautet: am Ort der Verwaltung, also dort, wo die Unterlagen geführt werden. Liegt dieser Ort für Sie unzumutbar weit entfernt, kann ausnahmsweise die Übersendung von Kopien geschuldet sein. Kopien darf der Vermieter Ihnen grundsätzlich in Rechnung stellen: die Einsicht in die Originale selbst ist dagegen kostenlos." },
        { typ: "h2", text: "So formulieren Sie die Aufforderung" },
        { typ: "schritte", items: [
          "Schriftlich anfordern, am besten per Einschreiben, mündliche Bitten lassen sich später nicht nachweisen.",
          "Konkret benennen, welche Positionen Sie prüfen wollen. Eine pauschale Anforderung „aller Unterlagen“ ist zwar zulässig, führt aber oft zu Verzögerungen.",
          "Eine angemessene Frist setzen, üblich sind zwei bis vier Wochen.",
          "Auf § 259 BGB und auf das Zurückbehaltungsrecht nach § 273 BGB hinweisen.",
          "Parallel die Nachzahlung unter Vorbehalt überweisen, um Verzug auszuschließen.",
        ]},
        { typ: "verweis", ziel: "betriebskostenabrechnung-fristen-und-verjaehrung-2026", text: "Achten Sie dabei auf die Einwendungsfrist: Wie lange Sie Zeit haben, steht im Ratgeber zu Fristen und Verjährung." },
        { typ: "cta", text: "Im Paket „Auswertung + Brief“ erstellt NebenkostenRadar das Schreiben an Ihren Vermieter automatisch, mit den passenden Rechtsgrundlagen und den konkreten Positionen aus Ihrer Abrechnung." },
      ],
    },
    {
      id: "nebenkosten-nachzahlung-nicht-zahlen",
      titelKurz: "Nachzahlung nicht zahlen?",
      titel: "Nebenkosten-Nachzahlung nicht zahlen: Wann Sie dürfen und wann es riskant wird",
      teaser: "Eine hohe Nachforderung ist noch kein Grund, die Zahlung zu verweigern. Wann ein Zurückbehaltungsrecht besteht, warum die Zahlung unter Vorbehalt fast immer der bessere Weg ist und ab wann eine Kündigung droht.",
      datum: "September 2026",
      lesezeit: "6 Min.",
      bild: "/artikelbilder/nebenkosten-nachzahlung-nicht-zahlen.jpg",
      bildAlt: "Person am Laptop mit Bankkarte in der Hand",
      kategorie: "Mietrecht",
      keywords: ["Nachzahlung verweigern", "Zahlung unter Vorbehalt", "Nebenkosten nicht zahlen", "§ 273 BGB"],
      inhalt: [
        { typ: "intro", text: "Der häufigste Reflex bei einer überraschend hohen Nachforderung ist: erst mal nicht zahlen. Verständlich, aber in den meisten Fällen der teuerste Weg. Wer die Zahlung zu Unrecht verweigert, gerät in Verzug, schuldet Zinsen und riskiert im Extremfall die Wohnung. Es gibt einen deutlich besseren Weg, der Sie nichts kostet und alle Rechte erhält." },
        { typ: "h2", text: "Der sichere Standardweg: Zahlung unter Vorbehalt" },
        { typ: "text", text: "Sie überweisen die Nachforderung fristgerecht und schreiben in den Verwendungszweck: „Zahlung unter Vorbehalt der Überprüfung“. Damit erklären Sie ausdrücklich, dass die Zahlung kein Anerkenntnis der Forderung ist. Sie kommen nicht in Verzug, es entstehen keine Zinsen, und Sie können zu viel gezahlte Beträge weiterhin zurückfordern." },
        { typ: "hinweis", text: "Der umgekehrte Fall ist der gefährliche: Wer vorbehaltlos zahlt, erschwert eine spätere Rückforderung erheblich, weil die Zahlung als Anerkenntnis gewertet werden kann. Der eine Satz im Verwendungszweck kostet nichts und macht den Unterschied." },
        { typ: "h2", text: "Wann Sie tatsächlich zurückhalten dürfen" },
        { typ: "text", text: "Ein echtes Zurückbehaltungsrecht nach § 273 Abs. 1 BGB besteht, solange der Vermieter eine berechtigte Bitte um Belegeinsicht nicht erfüllt. Das hat der Bundesgerichtshof mit Urteil vom 8. März 2006 (Az. VIII ZR 78/05) entschieden. Sobald die Einsicht gewährt wird, entfällt das Recht und der Betrag wird fällig." },
        { typ: "text", text: "Daneben gibt es Fälle, in denen die Forderung von vornherein nicht besteht, etwa wenn die Abrechnung formell unwirksam ist oder die Abrechnungsfrist des § 556 Abs. 3 BGB abgelaufen ist. Dann geht es nicht um Zurückhalten, sondern darum, dass gar kein Anspruch entstanden ist. Das ist aber eine rechtliche Bewertung, die man nicht auf Verdacht treffen sollte." },
        { typ: "h2", text: "Ab wann es gefährlich wird" },
        { typ: "liste", items: [
          "Verzugszinsen: Ab Fälligkeit und Verzug entstehen Zinsen auf den offenen Betrag.",
          "Mahn- und Rechtsverfolgungskosten: Der Vermieter kann berechtigte Kosten weiterreichen.",
          "Kündigung: Ein Zahlungsrückstand kann eine Kündigung tragen. Das ist kein theoretisches Risiko, sondern der Hauptgrund, warum die Zahlung unter Vorbehalt der bessere Weg ist.",
          "Beweislast: Wer nicht zahlt, muss im Streitfall begründen, warum er nicht zahlen musste.",
        ]},
        { typ: "h2", text: "Die pragmatische Reihenfolge" },
        { typ: "schritte", items: [
          "Zustelldatum der Abrechnung notieren, davon hängen alle Fristen ab.",
          "Nachforderung fristgerecht unter Vorbehalt überweisen.",
          "Abrechnung prüfen oder prüfen lassen.",
          "Bei Auffälligkeiten schriftlich Einwendungen erheben und Belegeinsicht verlangen.",
          "Zu viel gezahlte Beträge zurückfordern, dafür haben Sie deutlich länger Zeit als für die Einwendungen selbst.",
        ]},
        { typ: "verweis", ziel: "belegeinsicht-nebenkostenabrechnung-verlangen", text: "Wie Sie die Belegeinsicht konkret anfordern und was der Vermieter vorlegen muss, steht im Ratgeber zur Belegeinsicht." },
        { typ: "cta", text: "NebenkostenRadar sagt Ihnen in wenigen Minuten, ob sich ein Widerspruch bei Ihrer Abrechnung überhaupt lohnt, bevor Sie eine Auseinandersetzung beginnen." },
      ],
    },
    {
      id: "keine-nebenkostenabrechnung-erhalten",
      titelKurz: "Keine Nebenkostenabrechnung erhalten",
      titel: "Keine Nebenkostenabrechnung erhalten: Was Mieter jetzt tun können",
      teaser: "Bleibt die Abrechnung aus, verliert der Vermieter nach Ablauf der Frist in der Regel seinen Anspruch auf eine Nachzahlung. Ihr Anspruch auf ein Guthaben bleibt dagegen bestehen. Was das genau bedeutet und wie Sie vorgehen.",
      datum: "September 2026",
      lesezeit: "5 Min.",
      bild: "/artikelbilder/keine-nebenkostenabrechnung-erhalten.jpg",
      bildAlt: "Reihe von Briefkästen an einer Hauswand",
      kategorie: "Mietrecht",
      keywords: ["keine Nebenkostenabrechnung", "Abrechnungsfrist versäumt", "§ 556 Abs. 3 BGB", "Guthaben einfordern"],
      inhalt: [
        { typ: "intro", text: "Es klingt nach einem Problem, ist aber oft ein Vorteil: Wenn Ihr Vermieter die Nebenkostenabrechnung nicht rechtzeitig erstellt, kann er eine Nachforderung in der Regel nicht mehr durchsetzen. Ihr eigener Anspruch auf ein mögliches Guthaben bleibt davon unberührt." },
        { typ: "h2", text: "Die Frist, auf die es ankommt" },
        { typ: "text", text: "Nach § 556 Abs. 3 Satz 2 BGB ist dem Mieter die Abrechnung spätestens bis zum Ablauf des zwölften Monats nach Ende des Abrechnungszeitraums mitzuteilen. Für ein Kalenderjahr als Abrechnungszeitraum heißt das: Die Abrechnung für 2025 muss Ihnen bis zum 31. Dezember 2026 zugegangen sein." },
        { typ: "text", text: "Versäumt der Vermieter diese Frist, ist die Geltendmachung einer Nachforderung nach § 556 Abs. 3 Satz 3 BGB ausgeschlossen, es sei denn, er hat die verspätete Geltendmachung nicht zu vertreten. Diese Ausnahme ist eng: Personalmangel oder Überlastung der Verwaltung genügen dafür regelmäßig nicht." },
        { typ: "hinweis", text: "Wichtig ist die Unterscheidung: Ausgeschlossen ist die NACHFORDERUNG. Ergibt die verspätete Abrechnung ein Guthaben zu Ihren Gunsten, können Sie es weiterhin verlangen. Der Vermieter bleibt zur Abrechnung verpflichtet, auch wenn er nichts mehr nachfordern kann." },
        { typ: "h2", text: "Was Sie tun sollten" },
        { typ: "schritte", items: [
          "Abrechnungszeitraum aus dem Mietvertrag ermitteln, meist das Kalenderjahr, es sind aber auch abweichende Zeiträume möglich.",
          "Frist berechnen: Ende des Abrechnungszeitraums plus zwölf Monate.",
          "Den Vermieter schriftlich zur Abrechnung auffordern und dabei eine Frist setzen. Das ist auch dann sinnvoll, wenn Sie ein Guthaben erwarten.",
          "Zugang dokumentieren: Einschreiben oder Zeuge. Im Streitfall muss der Vermieter den rechtzeitigen Zugang seiner Abrechnung beweisen. Ihre eigene Dokumentation hilft aber, den Sachverhalt sauber darzustellen.",
          "Kommt die Abrechnung verspätet und enthält eine Nachforderung: schriftlich auf § 556 Abs. 3 Satz 3 BGB hinweisen.",
        ]},
        { typ: "h2", text: "Und wenn gar nicht abgerechnet wird?" },
        { typ: "text", text: "Der Anspruch auf Abrechnung besteht unabhängig davon fort. Rechnet der Vermieter dauerhaft nicht ab, obwohl Sie Vorauszahlungen leisten, kann das auch ein Zurückbehaltungsrecht an künftigen Vorauszahlungen begründen. Das ist allerdings eine Einzelfallfrage, hier lohnt sich die Rücksprache mit einem Mieterverein oder einem Anwalt, bevor Sie laufende Zahlungen kürzen." },
        { typ: "verweis", ziel: "betriebskostenabrechnung-fristen-und-verjaehrung-2026", text: "Alle Fristen im Zusammenhang. Abrechnungsfrist, Einwendungsfrist und Verjährung, stehen im Ratgeber zu Fristen und Verjährung." },
        { typ: "cta", text: "Sobald die Abrechnung da ist, prüft NebenkostenRadar sie in wenigen Minuten, inklusive der Frage, ob die Fristen eingehalten wurden." },
      ],
    },
    {
      id: "nicht-umlagefaehige-nebenkosten",
      titelKurz: "Nicht umlagefähige Nebenkosten",
      titel: "Nicht umlagefähige Nebenkosten: Was Ihr Vermieter nicht abrechnen darf",
      teaser: "Verwaltungskosten, Reparaturen, Rücklagen: Es gibt Positionen, die in keiner Nebenkostenabrechnung etwas zu suchen haben, unabhängig davon, was im Mietvertrag steht. Die vollständige Übersicht mit Rechtsgrundlage.",
      datum: "September 2026",
      lesezeit: "7 Min.",
      bild: "/artikelbilder/nicht-umlagefaehige-nebenkosten.jpg",
      bildAlt: "Person hakt Punkte auf einer Liste ab",
      kategorie: "Mietrecht",
      keywords: ["nicht umlagefähige Nebenkosten", "Verwaltungskosten Nebenkosten", "Instandhaltung", "§ 1 BetrKV"],
      inhalt: [
        { typ: "intro", text: "Die meisten Streitfälle bei der Nebenkostenabrechnung drehen sich um die Höhe einzelner Posten. Die klareren Fälle liegen woanders: bei Positionen, die überhaupt nicht auf die Abrechnung gehören. Hier braucht es keinen Vergleichswert und keine Belegeinsicht: die Rechtslage ist eindeutig." },
        { typ: "h2", text: "Der Grundsatz: § 1 Abs. 2 BetrKV" },
        { typ: "text", text: "Die Betriebskostenverordnung nennt in § 1 Abs. 2 ausdrücklich zwei Kostenarten, die keine Betriebskosten sind: die Verwaltungskosten und die Instandhaltungs- und Instandsetzungskosten. Beide dürfen im Wohnraummietverhältnis nicht auf den Mieter umgelegt werden, auch dann nicht, wenn der Mietvertrag es vorsieht. Eine entgegenstehende Klausel ist unwirksam." },
        { typ: "h2", text: "Verwaltungskosten" },
        { typ: "text", text: "Dazu zählen die Kosten der Hausverwaltung, die Erstellung der Abrechnung selbst, Kontoführung, Porto und der Aufwand für die Geschäftsführung. Der Posten taucht in Abrechnungen unter verschiedenen Namen auf, „Verwaltungspauschale“, „Verwaltungshonorar“, „Verwaltergebühr“ oder als Prozentsatz auf die übrigen Kosten. Entscheidend ist nicht der Name, sondern die Sache." },
        { typ: "hinweis", text: "Achtung, häufige Verwechslung: Bei Eigentumswohnungen zahlt der Eigentümer sehr wohl ein Verwalterhonorar an die WEG-Verwaltung. Er darf es nur nicht an seinen Mieter weiterreichen. Steht es trotzdem auf Ihrer Abrechnung, wurde die Eigentümerabrechnung unbesehen durchgereicht: ein sehr verbreiteter Fehler." },
        { typ: "h2", text: "Instandhaltung und Instandsetzung" },
        { typ: "text", text: "Reparaturen sind keine Betriebskosten. Betriebskosten sind laufende Kosten des bestimmungsgemäßen Gebrauchs; die Erhaltung der Bausubstanz ist Sache des Vermieters. Die Abgrenzung ist im Einzelfall nicht immer trivial: Die Wartung einer Heizungsanlage ist umlagefähig, ihre Reparatur nicht. Die regelmäßige Prüfung eines Aufzugs ist umlagefähig, der Austausch eines defekten Teils nicht." },
        { typ: "h2", text: "Weitere Positionen, die nicht umlagefähig sind" },
        { typ: "liste", items: [
          "Rücklagen für künftige Arbeiten: Betriebskosten müssen tatsächlich angefallen sein. Eine Ansparung ist keine angefallene Kostenposition.",
          "Mietausfallwagnis und Leerstandskosten: Der Vermieter trägt die auf leerstehende Wohnungen entfallenden Anteile selbst (BGH, Urteil vom 31.05.2006, Az. VIII ZR 159/05).",
          "Rechtsschutz- und Mietausfallversicherung: § 2 Nr. 13 BetrKV erfasst die Sach- und Haftpflichtversicherung des Gebäudes, nicht Versicherungen, die allein das wirtschaftliche Interesse des Vermieters schützen.",
          "Kabelanschluss für Zeiträume ab dem 01.07.2024: Das Nebenkostenprivileg ist entfallen.",
          "Kosten der Wohnungseigentümerversammlung: Verwaltungsaufwand, kein Betriebskostenposten.",
          "Bankgebühren und Kontoführung: gehören zu den Verwaltungskosten.",
        ]},
        { typ: "h2", text: "Und die „sonstigen Betriebskosten“?" },
        { typ: "text", text: "Der Auffangposten des § 2 Nr. 17 BetrKV ist die häufigste Grauzone. Er ist nicht per se unzulässig, er ist aber an eine strenge Bedingung geknüpft, die viele Abrechnungen nicht erfüllen. Dazu gibt es einen eigenen Ratgeber." },
        { typ: "verweis", ziel: "sonstige-betriebskosten-nr-17-betrkv", text: "Warum „sonstige Betriebskosten“ nur bei einzelner Benennung im Mietvertrag umlagefähig sind, lesen Sie im Ratgeber dazu." },
        { typ: "cta", text: "NebenkostenRadar erkennt nicht umlagefähige Positionen automatisch und weist sie mit der zugehörigen Rechtsgrundlage aus, getrennt von bloßen Richtwertabweichungen." },
      ],
    },
    {
      id: "sonstige-betriebskosten-nr-17-betrkv",
      titelKurz: "Sonstige Betriebskosten (§ 2 Nr. 17)",
      titel: "„Sonstige Betriebskosten“ (§ 2 Nr. 17 BetrKV): Wann sie zulässig sind",
      teaser: "Der Auffangposten ist der häufigste Sammelplatz für Kosten, die nirgends sonst hineinpassen. Umlagefähig ist er nur unter einer klaren Bedingung und die erfüllen viele Mietverträge nicht.",
      datum: "September 2026",
      lesezeit: "5 Min.",
      bild: "/artikelbilder/sonstige-betriebskosten-nr-17-betrkv.jpg",
      bildAlt: "Lupe auf einem bedruckten Blatt Papier",
      kategorie: "Mietrecht",
      keywords: ["sonstige Betriebskosten", "§ 2 Nr. 17 BetrKV", "Sammelposition Nebenkosten"],
      inhalt: [
        { typ: "intro", text: "Wenn auf einer Abrechnung ein Posten „Sonstige Betriebskosten“ mit einem dreistelligen Betrag steht und sonst nichts, ist das kein Detail, sondern der wahrscheinlichste Angriffspunkt der ganzen Abrechnung." },
        { typ: "h2", text: "Was der Gesetzgeber gemeint hat" },
        { typ: "text", text: "§ 2 BetrKV listet sechzehn konkret benannte Betriebskostenarten auf, von der Grundsteuer bis zur Gemeinschaftsantenne. Nummer 17 ist ein Auffangtatbestand für Kosten, die sachlich Betriebskosten sind, aber in keine der sechzehn Kategorien passen: etwa die Wartung von Rauchwarnmeldern, die Reinigung einer Dachrinne oder die Pflege einer Zisterne." },
        { typ: "h2", text: "Die entscheidende Bedingung" },
        { typ: "text", text: "Für die sechzehn benannten Positionen genügt ein pauschaler Verweis auf § 2 BetrKV im Mietvertrag. Der Bundesgerichtshof hat dies mit Urteil vom 7. April 2004 (Az. VIII ZR 167/03) bestätigt: Ein solcher Verweis reicht aus, damit die dort aufgeführten Kosten als vereinbart gelten." },
        { typ: "hinweis", text: "Für die „sonstigen Betriebskosten“ nach Nummer 17 gilt das gerade nicht. Sie sind nur umlagefähig, wenn sie im Mietvertrag einzeln und konkret benannt sind. Ein allgemeiner Verweis auf die BetrKV oder die bloße Formulierung „sonstige Betriebskosten“ genügt dafür nicht, sonst könnte der Vermieter über diesen Posten beliebige Kosten nachschieben, die der Mieter bei Vertragsschluss nicht absehen konnte." },
        { typ: "h2", text: "So prüfen Sie den Posten" },
        { typ: "schritte", items: [
          "In der Abrechnung nachsehen, ob der Betrag aufgeschlüsselt ist. Eine reine Summe ohne Einzelaufstellung ist bereits ein Mangel. Sie können die Aufschlüsselung verlangen.",
          "Jede genannte Einzelposition daraufhin prüfen, ob sie nicht doch unter eine der Nummern 1 bis 16 fällt. Dann gehört sie dorthin und nicht in den Auffangposten.",
          "Den Mietvertrag prüfen: Ist genau diese Kostenart dort einzeln aufgeführt? Wenn nein, fehlt die Umlagevereinbarung.",
          "Prüfen, ob es sich in Wahrheit um Instandhaltung oder Verwaltung handelt, beides ist nach § 1 Abs. 2 BetrKV nie umlagefähig.",
          "Schriftlich Einwendungen erheben und die Streichung oder Aufschlüsselung verlangen.",
        ]},
        { typ: "h2", text: "Was typischerweise darin versteckt wird" },
        { typ: "liste", items: [
          "Reparaturen, als „Wartung“ oder „Instandhaltung Allgemein“ bezeichnet.",
          "Verwaltungsanteile, die in den benannten Positionen aufgefallen wären.",
          "Kosten, die erst nach Vertragsschluss neu entstanden sind und nie vereinbart wurden.",
          "Positionen aus der Eigentümerabrechnung, die unbesehen übernommen wurden.",
        ]},
        { typ: "verweis", ziel: "nicht-umlagefaehige-nebenkosten", text: "Welche Kostenarten grundsätzlich nie auf eine Nebenkostenabrechnung gehören, steht in der Übersicht zu nicht umlagefähigen Kosten." },
        { typ: "cta", text: "NebenkostenRadar weist Sammelpositionen ohne Aufschlüsselung gesondert aus, mit der Formulierung, mit der Sie die Aufschlüsselung anfordern können." },
      ],
    },
    {
      id: "aufzugskosten-nebenkostenabrechnung",
      titelKurz: "Aufzugskosten: zahlt das Erdgeschoss?",
      titel: "Aufzugskosten in der Nebenkostenabrechnung: Muss auch das Erdgeschoss zahlen?",
      teaser: "Ja: der Bundesgerichtshof hat das entschieden. Es gibt aber eine Ausnahme, die viele nicht kennen, und eine klare Grenze zwischen umlagefähigem Betrieb und nicht umlagefähiger Reparatur.",
      datum: "September 2026",
      lesezeit: "5 Min.",
      bild: "/artikelbilder/aufzugskosten-nebenkostenabrechnung.jpg",
      bildAlt: "Aufzugstür aus Edelstahl mit Bedienknöpfen",
      kategorie: "Mietrecht",
      keywords: ["Aufzugskosten", "Erdgeschoss Aufzug zahlen", "§ 2 Nr. 7 BetrKV", "VIII ZR 103/06"],
      inhalt: [
        { typ: "intro", text: "Kaum eine Position sorgt für so viel Unverständnis wie der Aufzug in der Abrechnung einer Erdgeschosswohnung. Die rechtliche Antwort ist eindeutig, sie fällt nur anders aus, als die meisten erwarten." },
        { typ: "h2", text: "Die Rechtslage" },
        { typ: "text", text: "§ 2 Nr. 7 BetrKV nennt die Kosten des Betriebs des Personen- oder Lastenaufzugs ausdrücklich als umlagefähige Betriebskosten. Eine Ausnahme für Erdgeschosswohnungen sieht die Verordnung nicht vor." },
        { typ: "text", text: "Der Bundesgerichtshof hat das mit Urteil vom 20. September 2006 (Az. VIII ZR 103/06) bestätigt: Die formularvertragliche Beteiligung des Mieters einer Erdgeschosswohnung an den Aufzugskosten benachteiligt diesen nicht unangemessen. Ob der Aufzug tatsächlich genutzt wird, spielt dabei keine Rolle, maßgeblich ist die Nutzungsmöglichkeit, etwa um Nachbarn zu besuchen oder in einen Keller im Untergeschoss zu gelangen." },
        { typ: "h2", text: "Die Ausnahme, die viele übersehen" },
        { typ: "hinweis", text: "Anders liegt der Fall, wenn der Mieter in einem anderen Gebäudeteil wohnt und den Aufzug gar nicht nutzen kann. Dazu hat der Bundesgerichtshof mit Urteil vom 8. April 2009 (Az. VIII ZR 128/08) entschieden. Wenn Ihr Hauseingang keinen Zugang zum Aufzug hat, lohnt sich der genaue Blick auf diese Position." },
        { typ: "h2", text: "Was zum Betrieb gehört und was nicht" },
        { typ: "liste", items: [
          "Umlagefähig: Betriebsstrom, regelmäßige Wartung, die vorgeschriebene Prüfung durch eine zugelassene Überwachungsstelle, Notrufbereitschaft, Reinigung der Kabine.",
          "Nicht umlagefähig: Reparaturen, Austausch von Bauteilen, Modernisierung der Anlage, Rücklagen für eine spätere Erneuerung.",
          "Grauzone: Ein Wartungsvertrag, der ausdrücklich auch Reparaturen abdeckt (Vollwartungsvertrag). Der darin enthaltene Reparaturanteil muss herausgerechnet werden.",
        ]},
        { typ: "text", text: "Gerade der letzte Punkt lohnt die Prüfung. Vollwartungsverträge sind verbreitet, und der Reparaturanteil wird häufig nicht abgezogen. Da der Anteil aus dem Vertrag hervorgeht, ist hier die Belegeinsicht der richtige Hebel." },
        { typ: "verweis", ziel: "belegeinsicht-nebenkostenabrechnung-verlangen", text: "So fordern Sie den Wartungsvertrag zur Einsicht an: die Anleitung steht im Ratgeber zur Belegeinsicht." },
        { typ: "cta", text: "NebenkostenRadar vergleicht Ihre Aufzugskosten mit dem Richtwert des Deutschen Mieterbundes und weist auffällige Abweichungen aus." },
      ],
    },
    {
      id: "gartenpflege-nebenkostenabrechnung",
      titelKurz: "Gartenpflege in der Abrechnung",
      titel: "Gartenpflege in der Nebenkostenabrechnung: Was umlagefähig ist",
      teaser: "Rasenmähen ja, neue Bäume nein: Bei der Gartenpflege verläuft die Grenze zwischen laufender Pflege und einmaliger Neuanlage. Was das für Ihre Abrechnung bedeutet, auch ohne eigenen Gartenzugang.",
      datum: "September 2026",
      lesezeit: "5 Min.",
      bild: "/artikelbilder/gartenpflege-nebenkostenabrechnung.jpg",
      bildAlt: "Gepflegter Rasen mit Hecke vor einem Wohngebäude",
      kategorie: "Mietrecht",
      keywords: ["Gartenpflege Nebenkosten", "§ 2 Nr. 10 BetrKV", "Gartenkosten umlagefähig"],
      inhalt: [
        { typ: "intro", text: "Die Gartenpflege ist einer der Posten, bei denen sich zwei Fragen überlagern: Darf sie überhaupt umgelegt werden und ist der Betrag angemessen? Die erste Frage ist rechtlich meist schnell beantwortet, die zweite lohnt den genaueren Blick." },
        { typ: "h2", text: "Grundsätzlich umlagefähig" },
        { typ: "text", text: "§ 2 Nr. 10 BetrKV nennt die Kosten der Gartenpflege ausdrücklich: die Pflege gärtnerisch angelegter Flächen einschließlich der Erneuerung von Pflanzen und Gehölzen, die Pflege von Spielplätzen einschließlich der Erneuerung von Sand sowie die Pflege von Plätzen, Zugängen und Zufahrten, die dem nicht öffentlichen Verkehr dienen." },
        { typ: "text", text: "Bemerkenswert ist der Zusatz „einschließlich der Erneuerung von Pflanzen und Gehölzen“. Das Ersetzen einer eingegangenen Hecke ist also umlagefähig, obwohl es einer Reparatur ähnelt. Der Verordnungsgeber hat das bewusst so geregelt." },
        { typ: "h2", text: "Wo die Grenze verläuft" },
        { typ: "liste", items: [
          "Umlagefähig: Rasenmähen, Heckenschnitt, Laubentfernung, Bewässerung, Düngung, Ersatz einzelner abgestorbener Pflanzen, Sand im Sandkasten.",
          "Nicht umlagefähig: die erstmalige Anlage eines Gartens, die Umgestaltung einer Fläche, das Anlegen neuer Wege oder Beete: das ist Investition, nicht laufende Pflege.",
          "Nicht umlagefähig: das Fällen eines Baumes aus Gründen der Verkehrssicherung ist umstritten; die Neupflanzung als Teil einer Umgestaltung ist es nicht.",
        ]},
        { typ: "h2", text: "Muss ich zahlen, wenn ich den Garten nicht nutzen darf?" },
        { typ: "text", text: "In der Regel ja. Maßgeblich ist, ob die Fläche zum gemeinschaftlichen Gebrauch bestimmt ist, nicht, ob Sie sie tatsächlich nutzen. Etwas anderes gilt, wenn eine Fläche einem einzelnen Mieter zur alleinigen Nutzung überlassen ist: Deren Pflegekosten dürfen dann nicht auf die übrigen Mieter umgelegt werden." },
        { typ: "hinweis", text: "Häufiger Prüfpunkt: Wenn der Hausmeister auch die Gartenpflege übernimmt, darf derselbe Aufwand nicht zweimal abgerechnet werden, einmal unter „Hausmeister“ und einmal unter „Gartenpflege“. Eine Doppelabrechnung lässt sich nur über die Belegeinsicht ausschließen." },
        { typ: "verweis", ziel: "hausmeisterkosten-in-der-nebenkostenabrechnung-was-ist-umlagefaehig", text: "Welche Tätigkeiten unter die Hausmeisterkosten fallen und welche nicht, steht im Ratgeber zu Hausmeisterkosten." },
        { typ: "cta", text: "NebenkostenRadar prüft Gartenpflege und Hausmeister getrennt gegen die jeweiligen Richtwerte, auffällige Kombinationen fallen dabei auf." },
      ],
    },
    {
      id: "versicherungen-nebenkostenabrechnung",
      titelKurz: "Versicherungen in der Abrechnung",
      titel: "Versicherungen in der Nebenkostenabrechnung: Welche der Vermieter umlegen darf",
      teaser: "Gebäude- und Haftpflichtversicherung ja, Rechtsschutz und Mietausfall nein. Die Unterscheidung ist einfach, sie wird in Abrechnungen aber regelmäßig übergangen.",
      datum: "September 2026",
      lesezeit: "4 Min.",
      bild: "/artikelbilder/versicherungen-nebenkostenabrechnung.jpg",
      bildAlt: "Aufgespannter Regenschirm als Sinnbild für Absicherung",
      kategorie: "Mietrecht",
      keywords: ["Versicherung Nebenkosten", "§ 2 Nr. 13 BetrKV", "Rechtsschutzversicherung umlagefähig"],
      inhalt: [
        { typ: "intro", text: "„Versicherungen“ steht auf fast jeder Abrechnung, meist als eine einzige Summe. Dahinter können sich sehr unterschiedliche Verträge verbergen und nicht alle davon dürfen auf Sie umgelegt werden." },
        { typ: "h2", text: "Was § 2 Nr. 13 BetrKV erlaubt" },
        { typ: "text", text: "Umlagefähig sind die Kosten der Sach- und Haftpflichtversicherung. Die Verordnung nennt dazu beispielhaft die Versicherung des Gebäudes gegen Feuer-, Sturm-, Wasser- sowie sonstige Elementarschäden, die Glasversicherung, die Haftpflichtversicherung für das Gebäude, den Öltank und den Aufzug." },
        { typ: "text", text: "Der gemeinsame Nenner: Diese Versicherungen schützen das Gebäude und schützen davor, dass aus dem Gebäude heraus Schäden bei Dritten entstehen. Sie dienen damit auch dem Mieter." },
        { typ: "h2", text: "Was nicht umlagefähig ist" },
        { typ: "liste", items: [
          "Rechtsschutzversicherung des Vermieters, sie schützt allein sein Interesse, unter Umständen sogar gegen Sie.",
          "Mietausfallversicherung, sichert das wirtschaftliche Risiko des Vermieters ab, nicht das Gebäude.",
          "Hausratversicherung: die betrifft das Eigentum in der Wohnung und ist Sache des jeweiligen Bewohners.",
          "Betriebsunterbrechungs- und Vermögensschadenversicherungen des Vermieters.",
        ]},
        { typ: "hinweis", text: "Weil auf der Abrechnung meist nur eine Summe steht, lässt sich von außen nicht erkennen, welche Verträge enthalten sind. Genau deshalb ist die Position ein guter Kandidat für eine Aufschlüsselungsanfrage: Verlangen Sie die Vorlage der Versicherungsscheine oder eine Aufstellung der enthaltenen Policen." },
        { typ: "h2", text: "Zwei weitere Prüfpunkte" },
        { typ: "text", text: "Erstens der Selbstbehalt: Trägt der Vermieter einen Selbstbehalt selbst, ist dieser Betrag eine Schadensposition und keine Versicherungsprämie, er gehört nicht in die Abrechnung. Zweitens die Höhe: Der Versicherungsposten ist verhältnismäßig gut mit dem Richtwert des Betriebskostenspiegels vergleichbar, weil er kaum von individuellem Verhalten abhängt. Eine deutliche Abweichung nach oben ist deshalb aussagekräftiger als bei verbrauchsabhängigen Positionen." },
        { typ: "verweis", ziel: "betriebskostenspiegel-2024", text: "Welcher Durchschnittswert für Versicherungen gilt, steht in der Übersicht zum DMB-Betriebskostenspiegel." },
        { typ: "cta", text: "NebenkostenRadar vergleicht Ihre Versicherungskosten mit dem bundesweiten Richtwert und nennt die Rechtsgrundlage für Ihre Nachfrage." },
      ],
    },
    {
      id: "leerstand-nebenkosten-wer-zahlt",
      titelKurz: "Leerstand: wer zahlt die Nebenkosten?",
      titel: "Leerstand und Nebenkosten: Wer zahlt für leerstehende Wohnungen?",
      teaser: "Nicht die verbliebenen Mieter. Der Bundesgerichtshof hat klargestellt, dass der Vermieter die auf leerstehende Wohnungen entfallenden Betriebskosten selbst trägt und den Verteilerschlüssel dafür nicht ändern darf.",
      datum: "September 2026",
      lesezeit: "5 Min.",
      bild: "/artikelbilder/leerstand-nebenkosten-wer-zahlt.jpg",
      bildAlt: "Leerer Raum mit Holzboden und weißen Wänden",
      kategorie: "Mietrecht",
      keywords: ["Leerstand Nebenkosten", "VIII ZR 159/05", "leerstehende Wohnung Betriebskosten"],
      inhalt: [
        { typ: "intro", text: "Wenn im Haus mehrere Wohnungen leer stehen, stellt sich eine naheliegende Frage: Steigen dadurch die Nebenkosten für alle anderen? Die Antwort des Bundesgerichtshofs ist klar und sie fällt zugunsten der Mieter aus." },
        { typ: "h2", text: "Die Grundregel" },
        { typ: "text", text: "Ist vereinbart, dass die Betriebskosten nach der Wohnfläche umgelegt werden, muss der Vermieter die auf leerstehende Wohnungen entfallenden Kosten grundsätzlich selbst tragen. Der Bundesgerichtshof hat das mit Urteil vom 31. Mai 2006 (Az. VIII ZR 159/05) entschieden." },
        { typ: "text", text: "Praktisch heißt das: Die Gesamtfläche in der Berechnung bleibt die Gesamtfläche des Hauses, auch dann, wenn ein Teil davon nicht vermietet ist. Ihr Anteil bemisst sich weiterhin an Ihrer Fläche im Verhältnis zur Gesamtfläche, nicht im Verhältnis zur vermieteten Fläche." },
        { typ: "hinweis", text: "Der Bundesgerichtshof hat in derselben Entscheidung auch klargestellt, dass der Vermieter den Verteilerschlüssel nicht einfach umstellen darf, um die Leerstandsflächen herauszurechnen. Genau das ist der typische Weg, auf dem Leerstandskosten doch bei den Mietern landen und er ist unzulässig." },
        { typ: "h2", text: "So erkennen Sie es in Ihrer Abrechnung" },
        { typ: "schritte", items: [
          "Die in der Abrechnung genannte Gesamtwohnfläche notieren.",
          "Mit der Gesamtfläche aus der Vorjahresabrechnung vergleichen. Ist sie gesunken, obwohl am Gebäude nichts verändert wurde, ist das ein deutliches Warnzeichen.",
          "Ihren eigenen Anteil nachrechnen: eigene Fläche geteilt durch Gesamtfläche. Weicht der in der Abrechnung angesetzte Prozentsatz davon ab, nachfragen.",
          "Bei Verdacht die Flächenaufstellung des Hauses zur Belegeinsicht anfordern.",
        ]},
        { typ: "h2", text: "Sonderfall Heizung und Warmwasser" },
        { typ: "text", text: "Bei erheblichem Leerstand entsteht ein zusätzliches Problem: Der Verbrauch der bewohnten Wohnungen steigt rechnerisch, weil die Grundkosten auf weniger Verbraucher entfallen. Der Bundesgerichtshof hat mit Urteil vom 10. Dezember 2014 (Az. VIII ZR 9/14) entschieden, dass auch bei erheblichem Leerstand grundsätzlich mindestens 50 Prozent der Warmwasserkosten nach dem erfassten Verbrauch umzulegen sind. Die Vorgaben der Heizkostenverordnung gelten also weiter." },
        { typ: "verweis", ziel: "umlageschluessel-nebenkostenabrechnung-pruefen", text: "Was ein zulässiger Umlageschlüssel ist und wann er geändert werden darf, steht im Ratgeber zum Umlageschlüssel." },
        { typ: "cta", text: "NebenkostenRadar rechnet Ihren Flächenanteil nach und weist aus, wenn die Verteilung nicht zu den angegebenen Flächen passt." },
      ],
    },
    {
      id: "nebenkostenabrechnung-bei-auszug",
      titelKurz: "Nebenkostenabrechnung nach Auszug",
      titel: "Nebenkostenabrechnung nach dem Auszug: Fristen, Kaution und Rückforderung",
      teaser: "Auch nach dem Auszug bekommen Sie noch eine Abrechnung und der Vermieter hat dafür deutlich länger Zeit, als die meisten annehmen. Was gilt, wenn er die Kaution deshalb einbehält.",
      datum: "September 2026",
      lesezeit: "5 Min.",
      bild: "/artikelbilder/nebenkostenabrechnung-bei-auszug.jpg",
      bildAlt: "Umzugskartons in einer Wohnung",
      kategorie: "Mietrecht",
      keywords: ["Nebenkostenabrechnung nach Auszug", "Kaution einbehalten Nebenkosten", "Abrechnung Mieterwechsel"],
      inhalt: [
        { typ: "intro", text: "Der Mietvertrag ist beendet, die Wohnung übergeben und Monate später liegt eine Nebenkostenabrechnung im Briefkasten. Das ist kein Versehen, sondern der Normalfall. Die Frist des Vermieters richtet sich nämlich nicht nach Ihrem Auszug." },
        { typ: "h2", text: "Wie lange der Vermieter Zeit hat" },
        { typ: "text", text: "Die Frist des § 556 Abs. 3 Satz 2 BGB knüpft an das Ende des Abrechnungszeitraums an, nicht an das Ende des Mietverhältnisses. Wer im März 2025 auszieht und dessen Abrechnungszeitraum das Kalenderjahr ist, kann die Abrechnung für 2025 noch bis zum 31. Dezember 2026 erhalten, also mehr als anderthalb Jahre nach dem Auszug." },
        { typ: "text", text: "Abgerechnet wird dabei zeitanteilig für die Monate, in denen Sie die Wohnung noch gemietet hatten. Prüfen Sie deshalb als Erstes, ob der zugrunde gelegte Zeitraum stimmt." },
        { typ: "hinweis", text: "Vergessen Sie nicht, dem Vermieter Ihre neue Anschrift mitzuteilen, schriftlich und nachweisbar. Erreicht Sie die Abrechnung nicht, weil die Adresse fehlt, hilft Ihnen das nicht: Sie bekommen dann möglicherweise ein Guthaben nicht ausgezahlt, das Ihnen zusteht." },
        { typ: "h2", text: "Darf die Kaution einbehalten werden?" },
        { typ: "text", text: "Der Vermieter darf einen angemessenen Teil der Kaution zurückbehalten, bis über die noch offene Nebenkostenabrechnung entschieden ist. Angemessen ist dabei ein Betrag in der Größenordnung einer zu erwartenden Nachforderung, nicht die gesamte Kaution auf unbestimmte Zeit." },
        { typ: "text", text: "Als Orientierung dient meist die Nachzahlung des Vorjahres. Wird deutlich mehr einbehalten oder liegt die Abrechnung längst vor, ohne dass abgerechnet wurde, sollten Sie die Auszahlung schriftlich unter Fristsetzung verlangen." },
        { typ: "h2", text: "Ihre Prüfpunkte nach dem Auszug" },
        { typ: "liste", items: [
          "Stimmt der abgerechnete Zeitraum mit Ihrer tatsächlichen Mietzeit überein?",
          "Wurden Ihre geleisteten Vorauszahlungen vollständig angerechnet, auch die des letzten Monats?",
          "Sind bei verbrauchsabhängigen Kosten die Zählerstände zum Auszugstag zugrunde gelegt worden? Eine Zwischenablesung ist der saubere Weg.",
          "Wurde die Abrechnung innerhalb der Frist zugestellt? Sonst ist eine Nachforderung in der Regel ausgeschlossen.",
          "Wurde ein Guthaben tatsächlich ausgezahlt oder nur mit der Kaution verrechnet?",
        ]},
        { typ: "verweis", ziel: "keine-nebenkostenabrechnung-erhalten", text: "Bleibt die Abrechnung ganz aus, gelten eigene Regeln, nachzulesen im Ratgeber dazu." },
        { typ: "cta", text: "NebenkostenRadar prüft auch Abrechnungen für Teilzeiträume und rechnet die anteiligen Richtwerte entsprechend um." },
      ],
    },
    {
      id: "nebenkostenabrechnung-formell-unwirksam",
      titelKurz: "Abrechnung formell unwirksam?",
      titel: "Nebenkostenabrechnung formell unwirksam: Diese vier Angaben müssen drinstehen",
      teaser: "Bevor Sie einzelne Beträge prüfen, lohnt der Blick auf die Form. Fehlt eine der vier Mindestangaben, ist die Abrechnung insgesamt angreifbar, unabhängig davon, ob die Zahlen stimmen.",
      datum: "September 2026",
      lesezeit: "5 Min.",
      bild: "/artikelbilder/nebenkostenabrechnung-formell-unwirksam.jpg",
      bildAlt: "Stapel von Dokumenten und Aktenordnern",
      kategorie: "Mietrecht",
      keywords: ["Nebenkostenabrechnung formell unwirksam", "Mindestangaben Betriebskostenabrechnung", "Abrechnung fehlerhaft"],
      inhalt: [
        { typ: "intro", text: "Es gibt zwei Arten von Fehlern in einer Nebenkostenabrechnung. Inhaltliche Fehler betreffen einzelne Beträge, sie führen dazu, dass die Abrechnung korrigiert wird. Formelle Fehler betreffen den Aufbau der Abrechnung selbst und können dazu führen, dass sie insgesamt keine wirksame Abrechnung ist. Deshalb sollte die Formprüfung immer am Anfang stehen." },
        { typ: "h2", text: "Die vier Mindestangaben" },
        { typ: "text", text: "Nach der ständigen Rechtsprechung des Bundesgerichtshofs muss eine Betriebskostenabrechnung für einen durchschnittlichen Mieter ohne besondere Vorkenntnisse gedanklich und rechnerisch nachvollziehbar sein. Daraus ergeben sich vier Bestandteile, die eine Abrechnung enthalten muss:" },
        { typ: "schritte", items: [
          "Eine Zusammenstellung der Gesamtkosten je Kostenart, also nicht nur Ihr Anteil, sondern der Gesamtbetrag für das ganze Haus.",
          "Die Angabe und Erläuterung des Verteilerschlüssels, nach dem umgelegt wird.",
          "Die Berechnung Ihres Anteils, sodass der Weg von den Gesamtkosten zu Ihrem Betrag nachvollziehbar ist.",
          "Der Abzug Ihrer geleisteten Vorauszahlungen.",
        ]},
        { typ: "hinweis", text: "Fehlen die Gesamtkosten und steht nur Ihr Anteil da, ist die Abrechnung nicht überprüfbar. Sie können weder den Schlüssel noch die Rechnung nachvollziehen. Das ist der mit Abstand häufigste Formfehler in der Praxis." },
        { typ: "h2", text: "Was ein Formfehler bewirkt" },
        { typ: "text", text: "Eine formell unwirksame Abrechnung setzt die Abrechnungsfrist des § 556 Abs. 3 BGB nicht wirksam in Gang. Läuft die Zwölfmonatsfrist ab, ohne dass eine formell ordnungsgemäße Abrechnung vorliegt, kann der Vermieter eine Nachforderung in der Regel nicht mehr durchsetzen. Ein Guthaben zu Ihren Gunsten können Sie dagegen weiterhin verlangen." },
        { typ: "text", text: "Davon zu unterscheiden sind inhaltliche Fehler, etwa ein zu hoher Betrag oder eine nicht umlagefähige Position. Diese kann der Vermieter auch nach Fristablauf noch zu Ihren Gunsten korrigieren; eine Erhöhung ist ihm dann aber verwehrt." },
        { typ: "h2", text: "Ihre Formprüfung in fünf Minuten" },
        { typ: "liste", items: [
          "Sind für jede Position die Gesamtkosten des Hauses angegeben?",
          "Steht der Verteilerschlüssel für jede Position dabei und ist er verständlich?",
          "Lässt sich Ihr Anteil aus Gesamtkosten und Schlüssel nachrechnen?",
          "Sind Ihre Vorauszahlungen aufgeführt und abgezogen?",
          "Sind Abrechnungszeitraum, Wohnung und Mieter eindeutig bezeichnet?",
        ]},
        { typ: "verweis", ziel: "betriebskostenabrechnung-fristen-und-verjaehrung-2026", text: "Warum die Frist bei Formfehlern so entscheidend ist, erklärt der Ratgeber zu Fristen und Verjährung." },
        { typ: "cta", text: "NebenkostenRadar prüft neben den Beträgen auch, ob Zeitraum und Fristen stimmen und weist fehlende Angaben aus." },
      ],
    },
];

// Ersetzt {JAHR} in allen Texten durch das laufende Kalenderjahr.
//
// Rekursiv über Strings, Arrays und Objekte, damit auch Überschriften und
// Absätze tief im "inhalt"-Array erfasst werden und niemand daran denken muss,
// diese Funktion zu erweitern, wenn ein Artikel ein neues Feld bekommt.
//
// Wird beim Laden des Moduls genau einmal ausgeführt, also im Browser beim
// Seitenaufruf und in scripts/prerender.mjs beim Bauen.
const AKTUELLES_JAHR = String(new Date().getFullYear());

function jahrEinsetzen(wert) {
  if (typeof wert === "string") return wert.split("{JAHR}").join(AKTUELLES_JAHR);
  if (Array.isArray(wert)) return wert.map(jahrEinsetzen);
  if (wert && typeof wert === "object") {
    const neu = {};
    for (const k of Object.keys(wert)) neu[k] = jahrEinsetzen(wert[k]);
    return neu;
  }
  return wert;
}

export const ARTIKEL = ARTIKEL_ROH.map(jahrEinsetzen);

// Welche Artikel hängen am laufenden Jahr? Braucht der Jahreswechsel-Workflow,
// um hinterher gezielt die Neuindexierung dieser Seiten anzustoßen, statt
// blind alle 22 einzureichen.
export const ARTIKEL_MIT_JAHR = ARTIKEL_ROH
  .filter(a => JSON.stringify(a).includes("{JAHR}"))
  .map(a => a.id);
