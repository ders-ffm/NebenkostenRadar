# Totaler Test

Vollständige Prüfung aus allen Blickwinkeln: als Programmierer, als Nutzer, auf DSGVO und auf sonstige Rechtskonformität. Gedacht vor jedem größeren Schritt nach außen, also vor Werbung, Presse oder Partneransprache.

---

## Der Ablauf

### A. Technik und Code

```
npm run check        Build, 29 Seiten, 950 Konsistenzprüfungen, 31 Betragseingaben
npm run probedruck   erzeugt das fertige PDF und prüft es auf Satzfehler
```

Beides läuft auf Stefans Mac. Die KI baut in einer Kopie unter `/tmp`, nicht im iCloud-Ordner. Grund: `npm install` schreibt plattformabhängige Dateien, und ein Lauf in der Linux-Sandbox macht den Ordner auf dem Mac unbrauchbar (13.09.2026 passiert, siehe CHANGELOG).

Zusätzlich von Hand:

- Preise in `business.js` gegen alle fest eingetippten Stellen, besonders das JSON-LD in `index.html`
- Fehlerbehandlung in jeder Datei unter `api/`: gibt es `catch` und eine Antwort im Fehlerfall?
- Keine Zugangsdaten im Quelltext, keine personenbezogenen Daten in Protokollausgaben
- Interne Verweise zeigen auf existierende Seiten
- Reste aus dem Testbetrieb (`TODO`, Platzhalter, Testwerte)

### B. Nutzersicht, live

Nicht lokal, sondern auf nebenkostenradar.com:

- Alle Seiten aufrufen, Statuscode 200
- Den Funnel vollständig durchklicken, mit echten Zahlen aus einer realen Abrechnung
- Beide Wege der Entwurfs-Abfrage: „Dort weitermachen" und „Neue Abrechnung prüfen"
- Prüfen, ob das Ergebnis sich selbst widerspricht

**Wichtigste Regel hier:** Eine echte Abrechnung nehmen, keine ausgedachten runden Zahlen. Jeder ernste Fehler dieses Projekts kam aus einem realen Dokument.

### C. DSGVO

- Welche fremden Server werden beim reinen Seitenaufruf kontaktiert, **vor** jeder Einwilligung? Im Browser messbar über `performance.getEntriesByType('resource')`
- Lädt Analytics wirklich erst nach Zustimmung?
- Nennt die Datenschutzerklärung jeden tatsächlich eingesetzten Dienst?
- Sind alle Pflichtangaben vorhanden: Rechtsgrundlagen, Betroffenenrechte, Beschwerderecht, Löschfristen, Auftragsverarbeitung, Drittlandtransfer, Verantwortlicher

### D. Übrige Rechtskonformität

- Impressum nach § 5 DDG
- Widerrufsbelehrung samt Muster-Widerrufsformular (Art. 246a EGBGB, Anlage 2)
- Preisangaben, Umsatzsteuer oder Kleinunternehmerhinweis
- Grenzen von RDG und StBerG an jeder Stelle benannt
- Werbeaussagen auf Belegbarkeit

---

## Durchlauf vom 13.09.2026

Sechs Befunde, alle behoben.

### 1. Heizkosten blockierten gültige Abrechnungen (schwerwiegend)

`Heizkosten` und `Warmwasserversorgung` waren Pflichtfelder. Die Abrechnung von Stefans Mutter enthält beides nicht, weil Brunata separat abrechnet. Das Formular verweigerte die Auswertung. Betroffen sind alle Fälle mit separater Heizkostenabrechnung, eigener Gastherme, direktem Fernwärmebezug oder Warmmiete, also ein erheblicher Teil aller Mietverhältnisse.

Jetzt ein erklärender Hinweis statt einer Sperre.

### 2. Google Fonts von Google-Servern (rechtlich)

`index.html` lud Schriften bei jedem Aufruf von `fonts.googleapis.com` und `fonts.gstatic.com`, vor jeder Einwilligung. Dabei geht die IP-Adresse des Besuchers an Google. Das LG München I hat dafür Schadensersatz zugesprochen (Urteil vom 20.01.2022, Az. 3 O 17493/20).

Besonders unnötig: Die Schriftdateien lagen längst in `public/fonts` und werden für die PDF-Erzeugung von dort gelesen.

Umgestellt auf lokale Auslieferung. `npm run check` verbietet die Wiedereinführung.

### 3. Das Ergebnis widersprach sich selbst

Bei der Abrechnung der Mutter: Bewertung „auffällig", daneben der Satz „Weitgehend unauffällig". Ursache: Die Gesamtbewertung berücksichtigt Posten mit Status „prüfen", der Zusammenfassungstext nicht.

Beim Beheben fiel ein zweiter Fehler auf: Einfach auf „Auffällig" umzustellen wäre auch falsch gewesen, denn die Kosten lagen mit 5,93 €/m²/Jahr weit **unter** dem Richtwert von 32,04 €. Die beiden Gründe für „auffällig" sind verschieden und werden jetzt getrennt formuliert.

### 4. Muster-Widerrufsformular fehlte (rechtlich)

Die Widerrufsbelehrung war inhaltlich vollständig, aber das Formular nach Anlage 2 zu Art. 246a § 1 Abs. 2 Satz 1 Nr. 1 EGBGB fehlte. Die Pflicht besteht auch dann, wenn das Widerrufsrecht nach § 356 Abs. 5 BGB vorzeitig erlischt, denn die Information ist beim Vertragsschluss geschuldet. Als § 6a ergänzt.

### 5. Preise im JSON-LD ohne Absicherung

`index.html` ist statisches HTML und kann `business.js` nicht einlesen, die Preise im Angebots-Markup stehen dort fest eingetippt. Aktuell stimmten sie, aber schon einmal standen dort monatelang veraltete Werte. Google zeigt diese Preise in den Suchergebnissen an, ein dort genannter Preis, der an der Kasse nicht gilt, ist ein Wettbewerbsverstoß. `npm run check` vergleicht jetzt beide Stellen.

### 6. Artikelbilder von Unsplash (rechtlich)

Alle 22 Artikelseiten laden ihr Titelbild von `images.unsplash.com`, damit geht die IP jedes Lesers an Unsplash. Die Datenschutzerklärung stützt das auf berechtigtes Interesse, was vertretbar, aber schwach ist: Genau dieses Argument hat das LG München bei Google Fonts verworfen, weil die Übermittlung vermeidbar ist.

`scripts/bilder-lokal-holen.mjs` holt die Bilder auf den eigenen Server und zieht die Datenschutzerklärung mit nach.

**Erledigt am 13.09.2026.** Alle 22 Bilder liegen unter `public/artikelbilder/`, keine einzige Unsplash-URL mehr in `src/artikel.js`, Abschnitt 7 der Datenschutzerklärung nachgezogen. Zwei Hindernisse auf dem Weg, beide außerhalb des Codes, siehe CHANGELOG: fehlender Festplattenvollzugriff für das Terminal und plattformfremde `node_modules` aus der Sandbox.

---

## Was geprüft wurde und in Ordnung war

- Google Analytics lädt erst nach Einwilligung, der Consent-Stub in `index.html` setzt vorher `analytics_storage: denied`
- Die Datenschutzerklärung nennt alle eingesetzten Dienste und enthält sämtliche Pflichtangaben
- Impressum vollständig; keine USt-IdNr. nötig, da Kleinunternehmer nach § 19 UStG, in § 4 der AGB ausgewiesen
- Alle Serverfunktionen haben Fehlerbehandlung, keine Zugangsdaten im Quelltext, keine personenbezogenen Daten in Protokollen
- Keine toten internen Verweise
- Die Startseite formuliert vorsichtig und benennt ausdrücklich, dass eine Abweichung vom Richtwert kein Nachweis eines Fehlers ist

## Offener Kleinpunkt

`og:image:alt` in `index.html` behauptet „jede zweite Abrechnung enthält Fehler", ohne Quelle. Die Zahl stammt vom Deutschen Mieterbund und ist verbreitet, steht dort aber ohne Beleg. Betrifft nur die Vorschau beim Teilen von Links, nicht die Seite selbst. Bei Gelegenheit entweder Quelle ergänzen oder abschwächen.
