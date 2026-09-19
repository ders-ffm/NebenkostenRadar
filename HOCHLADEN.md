# Was hochgeladen wird und was nicht

Kurzfassung für den Alltag. Stefan lädt ganze Ordner hoch, nicht einzelne Dateien, deshalb ist diese Liste nach Ordnern sortiert.

---

## Immer hochladen

| Ordner | Was drin ist |
|---|---|
| `src/` | Die gesamte Anwendung: Seiten, Analyse, PDF-Bausteine, Texte, Farben |
| `api/` | Die Serverfunktionen: Foto-Erkennung, Zahlung, E-Mail-Versand, Entwürfe |
| `scripts/` | Bauhilfen und Prüfungen: Vorrendern, SEO-Prüfung, Monitore, Probedruck |
| `public/` | Dateien, die unverändert ausgeliefert werden: Schriften, Vorschaubild, Favicon |
| `.github/` | Die automatischen Abläufe, etwa die monatlichen Monitore |

Dazu diese **Einzeldateien im Hauptverzeichnis**, weil sie in keinem Ordner liegen:

```
index.html          package.json        package-lock.json
vercel.json         vite.config.js      CHANGELOG.md
```

`package-lock.json` gehört wirklich dazu. Sie legt die exakten Paketversionen fest, mit denen gebaut wird. Fehlt sie, kann ein Deploy mit anderen Versionen laufen als die geprüfte Fassung.

### `.github` ist im Finder unsichtbar

Der Ordner fängt mit einem Punkt an, und macOS blendet solche Ordner grundsätzlich aus. Er ist da, man sieht ihn nur nicht. Das ist schon zweimal aufgefallen (13.09. und 19.09.2026), deshalb steht es hier.

**Sichtbar machen:** im Finder `Cmd + Shift + .` drücken, also Befehlstaste, Umschalttaste und Punkt. Danach ist `.github` da und lässt sich wie jeder andere Ordner ins GitHub-Fenster ziehen. Nochmal dieselbe Tastenkombination blendet ihn wieder aus. Das funktioniert auch im Öffnen-Dialog eines Programms.

**Bei einer einzelnen neuen Datei ist es einfacher, sie gar nicht hochzuladen,** sondern direkt in GitHub anzulegen:

1. Im Repository auf **Add file → Create new file**
2. In das Namensfeld den vollen Pfad tippen, zum Beispiel `.github/workflows/jahreswechsel.yml`. Beim Tippen des Schrägstrichs legt GitHub die Ordner selbst an.
3. Inhalt hineinkopieren, unten **Commit changes**

Öffnen lässt sich eine `.yml`-Datei mit Rechtsklick → Öffnen mit → TextEdit.

**Die Meldung „this file is hidden"** erscheint, wenn man versucht, eine Punkt-Datei per Drag-and-drop einzeln hochzuladen. GitHub lehnt das ab. Den ganzen Ordner zu ziehen funktioniert dagegen, und der Weg über „Create new file" ebenfalls.

---

## Niemals hochladen

| Ordner | Warum nicht |
|---|---|
| `dist/` und `dist.nosync/` | Bauausgabe. Vercel erzeugt sie bei jedem Deploy selbst neu aus `src/`. |
| `node_modules/` und `node_modules.nosync/` | 193 MB in rund 5.900 Dateien, vollständig aus `package.json` wiederherstellbar. |
| Alles mit „ 2" am Ende | iCloud-Konfliktkopien, siehe unten. |

### Der eine Fall, der wirklich einen Deploy zerstört

`dist` ist seit dem 11.09.2026 keine echter Ordner mehr, sondern eine Verknüpfung auf `dist.nosync` (Grund: iCloud, siehe `.gitignore`). Wird diese Verknüpfung hochgeladen, das Ziel aber nicht, zeigt sie beim Deploy ins Leere und der Build bricht ab:

```
error during build:
  at copyDir (...)
  at prepareOutDir (...)
```

Getestet am 13.09.2026. Die Seite bleibt dann auf dem alten Stand, kaputt geht nichts Bestehendes, aber die Änderung kommt nicht an.

`dist.nosync` allein hochzuladen ist dagegen nur unnötig, nicht schädlich: Vercel überschreibt den Ordner ohnehin.

---

## Nur Dokumentation, kein Einfluss auf die Seite

Diese Ordner müssen nicht mit, schaden aber auch nicht. Sinnvoll, sie gelegentlich mitzunehmen, damit auf beiden Seiten derselbe Stand liegt:

| Ordner | Inhalt |
|---|---|
| `planung/` | Analysen, Businessplan, Recherchen, Strategiepapiere |
| `docs/` | Referenzen, etwa die Gestaltungsrichtlinien |
| `marketing/` | Anzeigenmotive, Content-Kalender, Bildmaterial |
| `Testdaten/` | Beispieldaten für eigene Tests |

---

## Woran du merkst, dass etwas schiefging

Nach dem Deploy ins Vercel-Log schauen. Steht dort `error during build`, ist einer der verbotenen Ordner mitgegangen. Die alte Fassung der Seite läuft dann einfach weiter.

Vor dem Hochladen lohnt sich ein Blick, ob im Projektordner Ordner mit „ 2" am Ende aufgetaucht sind. Das sind iCloud-Konfliktkopien, und aus genau denen ist am 11.09.2026 ein abgebrochener Build entstanden. Löschen, dann hochladen.
