# NebenkostenRadar — Werbeplan

Stand: 22.08.2026. Zweck: strategische Klammer über alle Marketing-/Werbe-Aktivitäten — Kanäle, Budget, Zeitplan, Erfolgsmessung, Positionierung. Operative Umsetzung (Texte, konkrete Anleitungen) bleibt in den Fachdateien; hier steht nur die Übersicht und der Grund für jede Entscheidung.

## 1. Positionierung

NebenkostenRadar grenzt sich bewusst zurückhaltend ab: keine Geld-zurück-Garantie, keine "100% sicher"-Versprechen. Die Prüfung vergleicht mit Richtwerten — eine Abweichung ist ein Anlass zur Nachfrage, kein Beweis für einen Fehler. Diese Position ist eine bewusste Entscheidung gegenüber aggressiveren Wettbewerbern (nebify: Geld-zurück-Garantie; Details in `planung/businessplan-umsatzprognose.md` Abschnitt 5) — ehrlich statt ein Versprechen, das die automatisierte Prüfung im Einzelfall nicht halten kann.

Tonalität (siehe Stilnotizen in `marketing/meta-kampagne/content-kalender.md`): kurze, funktionale Sätze, keine Ausrufezeichen, keine Emojis, Ergebnis zuerst.

## 2. Kanal-Übersicht

| Kanal | Status | Rolle | Datei |
|---|---|---|---|
| Facebook (organisch) | aktiv, erster Post live seit 22.08.2026 | Vertrauen aufbauen, Seite "lebendig" halten für Ad-Traffic | `marketing/meta-kampagne/content-kalender.md` |
| Instagram (organisch) | aktiv | wie FB, plus Reels geplant | `marketing/meta-kampagne/content-kalender.md`, `marketing/meta-kampagne/anleitung-instagram-reels.md` |
| Meta Ads (bezahlt) | Flight 1 läuft | bezahlte Reichweite, Creative-Test | `marketing/meta-kampagne/anleitung-meta-ads-kampagne.md` |
| LinkedIn (persönlich, Stefan) | aktiv | Build-in-public, Reichweite über persönliches Netzwerk | `marketing/linkedin-logbuch.md` |
| SEO / Ratgeber-Artikel | 9 Artikel live | organischer Langfrist-Traffic | `public/sitemap.xml`, `src/pages/Ratgeber.jsx` |
| Google Ads | noch nicht getestet | Kandidat für spätere Erweiterung, keine Entscheidung getroffen | — |
| Facebook-/Reddit-Communities | nicht automatisierbar, Stefans eigener Aufwand | zusätzliche organische Reichweite, nur bei echten Fragen antworten, kein Spam | `marketing/meta-kampagne/content-kalender.md` Abschnitt "Communities" |

## 3. Budget-Übersicht Meta Ads

| Flight | Zeitraum | Budget | Status |
|---|---|---|---|
| Flight 1 | kommendes Wochenende (Datum von Stefan festgelegt) | 120 € Laufzeitbudget | gestartet 22.08.2026, 3 Creatives im selben Ad Set |
| Flight 2 | September (Vorschlag 01.–07.09., anpassbar) | 80 € Laufzeitbudget | geplant, nur Sieger-Creative(s) aus Flight 1 |

Gesamt 2026 bisher eingeplant: 200 €. Das ist ein Test, kein Wachstumsbudget — realistisch ein paar hundert bis niedrig vierstellig Linkklicks, abhängig vom CPC (Richtwert Nische: 0,50–1,50 €/Klick).

Kein festes Budget für weitere Flights (z. B. "Flight 3") — erst nach Auswertung von Flight 1 und 2 entscheiden, nicht vorab festlegen.

## 4. Saison-Kalender

Nebenkostenabrechnungen werden in Deutschland überwiegend zwischen Herbst und Jahresende versendet (Abrechnungszeitraum meist Kalenderjahr, 12-Monats-Frist nach § 556 Abs. 3 BGB). Daraus ergibt sich ein grober Rhythmus:

- **August**: Vorbereitung, Content-Kalender aufbauen, erste kleine Ad-Tests (Flight 1)
- **September**: zweiter, etwas größerer Test (Flight 2) mit gelerntem Sieger-Creative
- **Oktober–Dezember**: Hauptsaison — die meisten Nutzer erhalten in diesem Zeitraum ihre Abrechnung und suchen aktiv nach Prüfmöglichkeiten. Rechtzeitig vor Oktober sollte der Content-Kalender für diese Phase stehen und eine Entscheidung über zusätzliches Budget getroffen sein — das ist eine spätere Entscheidung, keine jetzt schon feststehende Planung.

## 5. Erfolgsmessung

Kein Meta-Pixel installiert (Stand 22.08.2026) — Erfolgsmessung läuft über zwei Ebenen:

1. **Ads Manager**: Linkklicks und CPC pro Anzeige (Annäherung, kein Conversion-Nachweis)
2. **Google Analytics 4** (`G-KE9LWG22QW`): tatsächliche Seitenaufrufe über UTM-Parameter pro Creative — Aufbau-Anleitung in `marketing/meta-kampagne/anleitung-meta-ads-kampagne.md`, Abschnitt "GA4 Auswertung"

Zwischencheck nach jedem Flight: CPC/Linkklicks der Creatives vergleichen, Sieger für den nächsten Flight übernehmen, Rest einstellen.

Ein Meta-Pixel wäre der nächste sinnvolle Ausbauschritt, sobald über die reine Testphase hinaus regelmäßig Budget eingesetzt wird — noch nicht umgesetzt, da für die aktuellen zwei Test-Flights nicht notwendig.

## 6. Bewusst nicht verfolgte Ansätze

Zur Nachvollziehbarkeit, damit dieselbe Idee nicht wiederholt neu diskutiert werden muss:

- **"100% von der Steuer absetzbar"-Werbeaussage für die eigene NKR-Gebühr**: rechtlich geprüft und verworfen (19.08.2026) — die Gebühr selbst fällt nicht unter § 35a EStG oder abzugsfähige Werbungskosten/Sonderausgaben. Der Steuer-Bonus bezieht sich nur auf Posten *innerhalb* der geprüften Abrechnung, nicht auf NKR selbst.
- **KI-generierte Anzeigenbilder (Meta Advantage+ Bildgenerierung)**: bewusst nicht für Flight 1 verwendet — Stilbruch zum einheitlichen weißen Marken-Look, und Metas eigene "10% CTR-Lift"-Zahl ist eine unverifizierte, produktbewerbende Aussage von Meta selbst, keine für diese Nische validierte Zahl.
- **Aggressive Geld-zurück-Positionierung wie nebify**: bewusst nicht übernommen, siehe Abschnitt 1.

## 7. Offene Entscheidungen

- Google Ads als zweiter bezahlter Kanal: noch nicht getestet, keine Entscheidung
- Meta-Pixel-Einbau: sinnvoll ab regelmäßigem Werbebudget, aktuell nicht dringend
- Budget/Ausbau für die Hauptsaison Okt–Dez: nach Auswertung von Flight 1 und 2 zu entscheiden
- Trustpilot: Account existiert (Stand 23.08.2026), aber ungenutzt — keine Bewertungen, kein aktiver Auftritt. Aktivierung (erste Kunden gezielt um Bewertung bitten, Widget einbauen) noch nicht entschieden.
