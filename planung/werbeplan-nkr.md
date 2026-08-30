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

**Flight 1 — Endergebnis (Stand 30.08.2026, Kampagne "Abgeschlossen"):** 411 Link-Klicks, 0,24 €/Klick, 24.930 Impressionen, 21.496 Reichweite, 99,94 € von 120 € Budget ausgegeben (Rest nicht verbraucht, da Kampagne planmäßig am 25.08.2026 endete). CPC damit deutlich unter dem vorab angenommenen Richtwert von 0,50–1,50 €/Klick — güns­tiger als erwartet, nicht weiter verifizierte Ursache (Nische, Creatives, Zielgruppe). GA4 bestätigt einen echten Traffic-Anstieg über "Organic Social" im selben Zeitraum, exakte Zahl der daraus resultierenden Käufe wurde nicht geprüft (Stripe-Login nicht Teil dieser Sitzung) — das sollte Stefan selbst im Stripe-Dashboard gegenchecken, um die Kampagne wirklich abschließend zu bewerten (Klicks sind kein Kaufnachweis).

**Zusätzlicher, ungeplanter Flight — "Beitrag: Von Mieter zu Mieter" (ab 29.08.2026, Stand 30.08.2026 noch aktiv, endet 31.08.2026):** Anderer Kampagnentyp als Flight 1 (Beitrags-Boost statt Traffic-Kampagne), Ziel "Landingpage-Aufrufe" statt Linkklicks, 25 €/Tag Tagesbudget (nicht Laufzeitbudget). Bisher 107 Landingpage-Aufrufe, 0,31 €/Aufruf, 33,21 € ausgegeben, 5.717 Impressionen, 5.470 Reichweite. Ein Landingpage-Aufruf ist ein strengerer Nachweis als ein reiner Linkklick (Seite muss tatsächlich geladen haben), die beiden Kennzahlen sind daher nicht 1:1 vergleichbar. Da Tagesbudget statt Laufzeitbudget: Enddatum 31.08.2026 ist im Anzeigenmanager hinterlegt, sollte aber von Stefan im Blick behalten werden, damit die Kampagne nicht über den geplanten ~50-€-Rahmen hinaus weiterläuft.

**Käufe bis 30.08.2026 (von Stefan im Stripe-Dashboard geprüft): 0.** Gegenüber 133,15 € Gesamtausgabe (Flight 1 + Zusatz-Flight) und 518 Nutzerinteraktionen (411 Klicks + 107 Landingpage-Aufrufe) stehen damit bislang keine Verkäufe. Fakt: 0 Käufe. Einordnung (Inferenz, keine Gewissheit): Bei einer angenommenen Conversion-Rate von 1–3 % (grober E-Commerce-Richtwert, nicht für diese Nische validiert) wären bei ~500 Interaktionen 5–15 Käufe statistisch plausibel gewesen — 0 ist damit auffällig, aber die Stichprobe ist klein genug, dass auch Zufall/Varianz nicht ausgeschlossen ist. Ohne Meta-Pixel und ohne Funnel-Tracking (wo brechen Nutzer ab: Wohnung-Formular, Posten-Eingabe, Zahlungsseite?) lässt sich die Ursache nicht eingrenzen — reine Klickzahlen sagen nichts über den Grund für 0 Conversions. Nächster sinnvoller Schritt vor weiterem Ad-Budget: Funnel-Absprungpunkte in GA4 prüfen (Seitenaufrufe pro Schritt: Welcome → Wohnung → Posten → Result → Danke), bevor weiteres Geld in Reichweite gesteckt wird.

**GA4-Funnel-Check 30.08.2026:**

Zeitraum 2.–29.08. (28 Tage, gesamte Website, nicht nur Ad-Traffic): / 251 Aufrufe/38 aktive Nutzer → /pruefen/wohnung 111/18 → /pruefen/posten 38/7 → /pruefen/ergebnis 31/6 → /pruefen/absender 21/5 → /pruefen/download 18/4. Fakt: größter Einzel-Abbruch zwischen Startseite und Formularstart (38→18 Nutzer, –53 %) und zwischen Wohnung- und Posten-Schritt (18→7, –61 %). Nur 4 von 40 Nutzern (10 %) erreichten in 28 Tagen die Download-Seite.

**Wichtigerer Befund, Zeitraum 25.–30.08. (überschneidet mit Ende Flight 1 und dem kompletten Beitrag-Flight):** GA4 zeigt für die gesamte Website in diesem Fenster nur 12 aktive Nutzer, 17 Startseiten-Aufrufe, 5 Aufrufe von /pruefen/wohnung — und **null** Aufrufe von /pruefen/posten, /ergebnis, /absender oder /download. Fakt: Meta Ads Manager meldet für den Beitrag-Flight allein in einem sehr ähnlichen Zeitraum (29.–30.08., 2 der 3 Flight-Tage) 107 "Landingpage-Aufrufe". 12 aktive Nutzer gesamt stehen also 107 gemeldeten Landingpage-Aufrufen einer einzelnen Kampagne gegenüber — eine Größenordnung Unterschied.

Einordnung (Inferenz, nicht verifiziert): Diese Lücke ist zu groß, um allein durch Funnel-Abbrüche erklärt zu werden — die Nutzer erscheinen in GA4 größtenteils gar nicht erst als Sitzung. Drei mögliche Erklärungen wurden geprüft:

1. **Cookie-Consent-Gate (bestätigt als Ursache, im Code verifiziert 30.08.2026):** `src/components/layout/CookieBanner.jsx` lädt das GA4-Skript (`gtag/js`) erst nach aktivem Klick auf "Akzeptieren" per `document.createElement("script")`. Vor der Einwilligung ist `analytics_storage: denied` gesetzt (`index.html` Zeile 111) und es wird **kein** Skript geladen — auch kein Consent-Mode-Ping mit modellierten/anonymisierten Daten, obwohl der Code-Kommentar "Google Consent Mode v2" nennt. Wer den Banner ablehnt oder ihn wegklickt ohne zu entscheiden und die Seite verlässt, wird von GA4 nicht gezählt — Meta zählt den Seitenaufruf aber trotzdem. Das ist rechtlich der richtige, DSGVO-konforme Ansatz (bewusst so gebaut, siehe Code-Kommentar zum "Abmahn-/Bußgeld-Risikopunkt"), erklärt aber technisch einen großen Teil der Lücke zwischen Meta- und GA4-Zahlen.
2. **Falsche Ziel-URL der Anzeige (geprüft und ausgeschlossen, 30.08.2026):** Im Ads Manager direkt an der Beitrag-Anzeige nachgesehen — Call-to-Action-Link zeigt korrekt auf `nebenkostenradar.com`, Linkvorschau zeigt den echten Seitentitel ("Nebenkostenabrechnung prüfen — kostenlos | NebenkostenRadar"). Die Anzeige verlinkt also auf die richtige, von GA4 grundsätzlich erfassbare Domain — das ist nicht die Ursache.
3. **Meta zählt "Landingpage-Aufruf" großzügiger als ein vollständiges Laden (nicht geprüft, bleibt offen):** Bekanntes Branchenproblem (Ladeabbrüche, Bots, Klick ohne vollständigen Seitenaufbau werden teils mitgezählt), nicht spezifisch für NKR verifiziert.

Fazit: Ursache 1 ist die am besten belegte Erklärung. Sie ist zugleich eine bewusste, rechtlich richtige Entscheidung (kein Tracking ohne Einwilligung) — das heißt aber auch: Ein Teil der "0 Käufe" ist vermutlich kein Conversion-Problem, sondern schlicht ein blinder Fleck in der Erfolgsmessung bei Nutzern, die die Analyse-Cookies ablehnen. Das ändert nichts an der Rechtslage (Consent-Gate bleibt richtig so), aber es bedeutet: die reale Reichweite der Kampagnen ist wahrscheinlich höher als GA4 zeigt, und ob daraus Käufe wurden, lässt sich für diese Nutzergruppe grundsätzlich nicht nachträglich rekonstruieren — nur über Stripe direkt (dort landen alle tatsächlichen Käufe, unabhängig vom Cookie-Consent).

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

**23.08.2026, ca. 2 Std. nach Flight-Start noch keine Auslieferung — Meta-Support direkt kontaktiert:** Kampagne "NKR – Traffic – Flight 1 (Linkklicks)" zeigte am Nachmittag des Start-Tags (Start 13:55 Uhr) weiterhin 0 Impressionen, 0 Ausgaben. Korrektur zu einer vorherigen, fehlerhaften Notiz in diesem Dokument: Ich hatte das Datum falsch verfolgt und fälschlich von "zweitem Flight-Tag" gesprochen — tatsächlich war es noch derselbe Tag, nur wenige Stunden nach Start. Geprüft und für in Ordnung befunden: Anzeigengruppe und alle drei Anzeigen stehen auf "Aktiv", Zeitplan korrekt (23.08. 13:55 bis 25.08. 13:06 Uhr), Laufzeitbudget korrekt bei 120,00 €, Zahlungsmethode PayPal ohne Fehlermeldung, kein Konto-Restriktionshinweis, Anzeigenvorschau rendert korrekt.

Direkt im Meta AI Business Assistant (business.facebook.com Support-Center) nachgefragt, mit Verweis auf Kampagnen-ID 120250699077490749, Anzeigengruppen-ID 120250699077840749, Werbekonto-ID 709830315057956. Antwort (nach Rückfrage zur Zeitrechnung gegengeprüft, Systemzeit-Angabe der KI stimmte exakt mit der tatsächlichen UTC-Zeit überein): Werbekonto wurde am 22.08.2026, 13:08 Uhr erstellt und durchläuft eine reguläre 24–48-Stunden-"Warming-up"-Phase für neue Konten (Tageslimit 44,15 €, Abrechnungsschwelle 2,00 € sind Standard für neue Konten). Keine Identitätsbestätigung ausstehend (explizit geprüft: "Nicht erforderlich/Nicht gefunden"). Erwartete Auslieferung ab ca. 24.08., nach 13:08 Uhr UTC (ca. 15:08 Uhr MESZ). Ausdrücklicher Rat der KI: keine Änderungen an der Kampagne vornehmen, da das den Prüfprozess theoretisch neu starten könnte. Einordnung: Eine KI-Antwort im Support-Chat ist keine harte Garantie, aber in sich stimmig und durch die exakte Zeitangabe glaubwürdiger als die vorherige, vagere Antwort zum Optimierungsziel. Falls bis 25.08. weiterhin 0 Impressionen: erneut nachfragen, diesmal nach manueller Synchronisierung fragen (wurde im Chat bereits als Option genannt).

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
