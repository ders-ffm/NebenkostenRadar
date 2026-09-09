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

## 8. Datenauswertung 09.09.2026 — GA4 + Search Console, nach der UX-Überarbeitung

Anlass: Weiterhin 0 Käufe, obwohl die Funnel-Überarbeitung vom 30./31.08.2026 (Bug-Fix, Upload-first, Zwischenspeichern, Startseite) live ist. Ziel: Traffic-Problem, Conversion-Problem oder Nachfrage-Problem unterscheiden.

### 8.1 Reichweite — Google Search Console (13.06.–06.09.2026, 3 Monate)

| Kennzahl | Wert |
|---|---|
| Impressionen | 974 |
| Klicks | 34 |
| CTR | 3,5 % |
| Ø Position | 39,2 |
| Seiten überhaupt in Suchergebnissen | 13 |

Suchanfragen (Top 10 nach Klicks):

| Suchanfrage | Klicks | Impressionen |
|---|---|---|
| nebenkostenradar | 7 | 20 |
| betriebskostenspiegel | 0 | 52 |
| dmb betriebskostenspiegel | 0 | 31 |
| betriebskostenspiegel dmb | 0 | 27 |
| widerspruch nebenkostenabrechnung | 0 | 26 |
| betriebskostenspiegel 2023 | 0 | 24 |
| nebenkostenspiegel 2024 | 0 | 23 |
| betriebskostenspiegel hessen 2024 | 0 | 21 |
| nebenkostenabrechnung prüfen lassen online | 0 | 21 |
| dmb betriebskostenspiegel 2024 | 0 | 20 |

Seiten:

| Seite | Klicks | Impressionen |
|---|---|---|
| / (Startseite) | 31 | 164 |
| /ratgeber | 2 | 51 |
| /ratgeber/betriebskostenspiegel-2024 | 1 | 548 |
| /ratgeber/betriebskostenabrechnung-fristen-und-verjaehrung-2026 | 1 | 63 |
| /ratgeber/widerspruch-nebenkostenabrechnung | 0 | 113 |
| übrige 8 Ratgeber-Seiten | 0 | je 29–62 |

**Fakten daraus, ohne Deutung:**
- Die einzige Suchanfrage mit Klicks ist der Markenname selbst. Alle generischen Suchanfragen haben 0 Klicks.
- `betriebskostenspiegel-2024` erzeugt mit 548 Impressionen mehr als die Hälfte der Gesamtsichtbarkeit, aber genau 1 Klick (CTR ~0,2 %).
- Ø Position 39,2 entspricht Seite 4 der Suchergebnisse.

### 8.2 Funnel — GA4 (12.08.–08.09.2026, 28 Tage)

Sitzungen gesamt: 96 · Aktive Nutzer: 45 · Aufrufe: 333 · Schlüsselereignisse: 0 · Umsatz: 0,00 €

Kanäle:

| Kanal | Sitzungen | Engagement-Rate | Ø Dauer |
|---|---|---|---|
| Organic Social | 27 (28,1 %) | 77,8 % | 26 Sek. |
| Organic Shopping | 22 (22,9 %) | 63,6 % | 1 m 18 s |
| Organic Search | 21 (21,9 %) | 66,7 % | 37 Sek. |
| Direct | 20 (20,8 %) | 85,0 % | 2 m 15 s |
| Referral | 6 (6,3 %) | 66,7 % | 3 m 28 s |

Funnel nach aktiven Nutzern:

| Schritt | Nutzer | Übergang vom Vorschritt | Anteil am Start |
|---|---|---|---|
| / (Startseite) | 42 | — | 100 % |
| /pruefen/wohnung | 23 | 55 % | 55 % |
| /pruefen/posten | 9 | **39 %** | 21 % |
| /pruefen/ergebnis | 7 | 78 % | 17 % |
| /pruefen/absender | 3 | 43 % | 7 % |
| Kauf | 0 | 0 % | 0 % |

**Fakten daraus, ohne Deutung:**
- Der größte relative Absprung liegt zwischen Wohnung und Posten: 61 % der Nutzer, die den ersten Formularschritt öffnen, erreichen den zweiten nicht.
- 3 Nutzer haben `/pruefen/absender` erreicht. Dieser Schritt liegt laut `src/App.jsx` (ROUTES) und `src/pages/Result.jsx` **nach** der Preiswahl und nach dem Bestätigen der Widerrufs-Checkbox — diese 3 Nutzer hatten also eine dokumentierte Kaufabsicht.
- Von diesen 3 hat keiner gekauft.
- Wichtige Messeinschränkung: GA4 misst wegen des Consent-Gates (`CookieBanner.jsx` lädt gtag.js erst nach aktivem "Akzeptieren") nur eingewilligte Nutzer. Die echten Zahlen liegen über den hier genannten, das Verhältnis der Schritte zueinander bleibt aber aussagekräftig.

### 8.3 Befund am Absender-Schritt (Code-Prüfung, nicht Statistik)

`src/pages/Adressen.jsx` verlangt vor der Zahlung bis zu **10 Pflichtfelder**: E-Mail, E-Mail-Wiederholung, Vor-/Nachname, Straße, PLZ, Ort — und beim 12,99-€-Paket zusätzlich Vermietername, -straße, -PLZ, -Ort. Das Wiederholungsfeld blockiert Einfügen per Zwischenablage aktiv (`onPaste={keinPaste}`).

Einordnung (Inferenz, nicht Messung): Das ist der letzte Schritt vor der Zahlung und gleichzeitig der aufwendigste. Nielsen Norman Group und Baymard Institute führen sowohl die Zahl der Pflichtfelder als auch deaktiviertes Einfügen in Bestätigungsfeldern als bekannte Abbruchtreiber. Ob die drei beobachteten Nutzer genau hier abgesprungen sind, ist mit den vorhandenen Daten **nicht** belegbar — GA4 zeigt nur, dass sie die Seite erreichten und nicht kauften.

### 8.4 Diagnose

Die Zahlen erlauben eine klare Trennung:

1. **Reichweitenproblem, belegt.** 45 aktive Nutzer in 28 Tagen und Ø Position 39,2 in der Suche bedeuten: Es gibt schlicht zu wenig Publikum, um Kaufverhalten überhaupt zu messen. Bei einer für diese Produktklasse plausiblen Conversion von 1–3 % wären aus 42 Startseiten-Nutzern rechnerisch 0,4–1,3 Käufe zu erwarten — 0 Käufe ist damit **statistisch nicht von der Erwartung unterscheidbar**. Aus "0 Käufe" lässt sich bei dieser Stichprobengröße kein Urteil über das Produkt ableiten.
2. **Conversion-Hinweis, schwach belegt.** Der Absprung Wohnung → Posten (61 %) und die 3 Nutzer mit Kaufabsicht ohne Abschluss sind Auffälligkeiten, aber bei n=23 bzw. n=3 keine belastbaren Befunde.
3. **Nachfrage-/Produktproblem: unbewiesen in beide Richtungen.** Dafür fehlt die Datengrundlage vollständig.

Die dominierende Größe ist eindeutig die Reichweite, nicht die Conversion.

### 8.5 Nachtrag 09.09.2026 — Supabase-Zahlen ändern die Diagnose erheblich

Die serverseitigen Zahlen (kein Consent-Gate, daher vollständig) widersprechen der reinen "zu wenig Traffic"-Deutung aus 8.4:

| Tabelle | Anzahl | Bedeutung |
|---|---|---|
| `nkr_reports` | **26** | Nutzer, die das Absender-Formular **vollständig** ausgefüllt und zu Stripe weitergeleitet wurden |
| `nkr_drafts` | 1 | ausschließlich mein eigener Testlauf (ID `a49fcc33-…`, 30.08.2026) |
| `nkr_foto_ratelimit` | 1 | als Nutzungsmaß wertlos — Tabelle löscht Zeilen älter als 24 h selbst (siehe `analyse-foto.js`) |

**Warum `nkr_reports` = 26 aussagekräftig ist:** In `src/pages/Adressen.jsx` (Zeilen 97–112) wird `/api/save-report` aufgerufen und **unmittelbar danach** `window.location.href` auf den Stripe-Link gesetzt. Eine Zeile in `nkr_reports` entsteht also erst, wenn jemand alle bis zu 10 Pflichtfelder ausgefüllt, die Validierung bestanden und auf "Jetzt kaufen → Weiter zu Stripe" geklickt hat. Das ist dokumentierte, vollständige Kaufabsicht — nicht nur ein Seitenaufruf.

26 solche Vorgänge, 0 Zahlungen.

**Stripe-Checkout live geprüft (09.09.2026), beide Links funktionieren:**

| Link | Preis | Status |
|---|---|---|
| `STRIPE_LINK_AUSWERTUNG` | 9,99 € | lädt korrekt, Live-Modus (kein `test_`), Produktname korrekt |
| `STRIPE_LINK_VOLL` | 12,99 € | lädt korrekt, Live-Modus, Produktname korrekt |

Der Checkout ist also **nicht defekt**. Der Fehler von 08/2026 (Testmodus-Link auf main) wiederholt sich nicht.

**Befund: angebotene Zahlungsmethoden.** Die Stripe-Checkout-Seite bietet an: Kreditkarte, Apple Pay, Link (Stripe-eigen), Amazon Pay. **Nicht angeboten: PayPal, Kauf auf Rechnung, SEPA-Lastschrift, Klarna.**

Gegenüberstellung mit den tatsächlichen Marktanteilen im deutschen E-Commerce (EHI-Studie "Online-Payment 2026"):

| Zahlungsmethode | Marktanteil DE | bei NKR verfügbar |
|---|---|---|
| PayPal | 28,7 % | **nein** |
| Kauf auf Rechnung | 26,1 % | **nein** |
| Lastschrift | 14,4 % | **nein** |
| Kredit-/Debitkarte | 13,7 % | ja |
| Apple Pay | 1,3 % | ja |

Rechnerisch decken die angebotenen Methoden rund 15 % der im deutschen Markt bevorzugten Zahlungswege ab; auf etwa 69 % (PayPal + Rechnung + Lastschrift) hat NKR keine Antwort. Für ein 9,99-€-Impulsprodukt an Privatkunden ist das ein struktureller Nachteil, kein Randdetail.

**Wichtige, noch offene Einschränkung:** Unbekannt ist, wie viele der 26 Zeilen aus Stefans eigenen Entwicklungs-/Testläufen stammen. `nkr_reports` hat 365 Tage Aufbewahrung, die Zahl ist also kumulativ seit Bestehen der Tabelle und umfasst zwingend auch die Testkäufe aus der Entwicklungsphase. Ohne diese Aufschlüsselung ist die reale Zahl echter Kaufabbrecher unbekannt. Zu klären mit:

```sql
select date(created_at) as tag, stufe, count(*) from nkr_reports group by 1,2 order by 1;
```

**Vorläufige Neubewertung gegenüber 8.4:** Die Aussage "das Problem ist ausschließlich Reichweite" ist so nicht mehr haltbar. Es gibt einen zweiten, unabhängigen und konkret behebbaren Engpass am Zahlungsübergang. Wie schwer er wiegt, hängt an der obigen Aufschlüsselung.

### 8.6 Auflösung 09.09.2026 — die 26 Zeilen sind Eigen-Tests, der echte Abbruch liegt im Absender-Formular

Aufschlüsselung von `nkr_reports` nach Tag:

| Tag | Stufe | Anzahl |
|---|---|---|
| 08.08.2026 | voll | 2 |
| 09.08.2026 | voll | 15 |
| 10.08.2026 | voll | 3 |
| 11.08.2026 | voll | 1 |
| 12.08.2026 | voll | 2 |
| 13.08.2026 | voll | 1 |
| 13.08.2026 | auswertung | 1 |
| 14.08.2026 | voll | 1 |
| **ab 15.08.2026** | — | **0** |

**Alle 26 Zeilen fallen in das Fenster 08.–14.08.2026.** Dieses Fenster deckt sich exakt mit der dokumentierten Entwicklungs- und Testphase laut `CHANGELOG.md`: End-to-End-Tests der Foto-Erkennung (10.08.), Erneuerung der Stripe-Live-Links nach dem Testmodus-Vorfall (11./12.08.), Realtest mit Stefans eigener Abrechnung (12.08.), Widerruf-Zustimmung (13.08.), Steuer-Bonus (14.08.). 15 Vorgänge an einem einzigen Tag sind kein Kundenverhalten, sondern iteratives Testen.

**Schlussfolgerung: Es hat noch nie ein echter Nutzer die Stripe-Seite erreicht.**

**Damit korrigiere ich meine eigene Gewichtung aus 8.5.** Die fehlenden Zahlungsmethoden (PayPal, Rechnung, Lastschrift) sind ein realer struktureller Nachteil, aber sie sind **nicht** die aktuelle Ursache für 0 Käufe — bis dorthin kommt schlicht niemand. Ich hatte den Befund in der ersten Reaktion zu hoch gehängt. Er bleibt richtig, wird aber erst relevant, wenn wieder jemand die Kasse erreicht.

**Der tatsächliche Abbruchpunkt, jetzt datenbelegt:**

| Schritt (GA4, 12.08.–08.09.) | Nutzer |
|---|---|
| /pruefen/ergebnis | 7 |
| /pruefen/absender (Formular geöffnet) | 3 |
| Formular abgeschickt (= `nkr_reports`-Zeile) | **0** |
| Kauf | 0 |

Drei Nutzer haben Preis gewählt, Widerrufs-Checkbox bestätigt, das Absender-Formular geöffnet — und es nicht abgeschickt. Bei n=3 ist das statistisch schwach, die Richtung aber eindeutig und deckungsgleich mit der Struktur des Formulars (`Adressen.jsx`):

- bis zu **10 Pflichtfelder** vor der Zahlung, davon 4 für die Vermieteradresse
- E-Mail muss **zweimal getippt** werden, Einfügen aus der Zwischenablage ist aktiv blockiert (`onPaste={keinPaste}`, `onDrop={keinPaste}`)
- die vollständige Vermieteranschrift wird verlangt, bevor der Nutzer irgendetwas bezahlt hat — viele Mieter müssen dafür erst den Mietvertrag oder die Abrechnung heraussuchen

Die Vermieteradresse wird technisch erst **nach** der Zahlung gebraucht: `Download.jsx` erzeugt das PDF aus `daten.adressen`, die es über `api/get-report.js` aus `nkr_reports` lädt. Eine Erhebung nach der Zahlung ist architektonisch möglich.

### 8.7 Korrigierte Gesamtdiagnose (09.09.2026)

Zwei voneinander unabhängige Engpässe, in dieser Reihenfolge:

1. **Reichweite (dominant, belegt).** 42 Startseiten-Nutzer in 28 Tagen, Ø Google-Position 39,2, alle generischen Suchanfragen mit 0 Klicks. Selbst ein perfekter Funnel erzeugt aus dieser Menge rechnerisch unter 1 Kauf.
2. **Letzte Hürde vor der Kasse (konkret, schwach belegt, aber billig zu beheben).** 3 von 3 Nutzern mit Kaufabsicht sind im Absender-Formular ausgestiegen.

Weiterhin **nicht** beurteilbar: ob das Produkt selbst überzeugt und ob zahlungsbereite Nachfrage besteht. Dafür braucht es zuerst Nutzer, die überhaupt bis zur Kasse kommen.

## 9. SEO-Wettbewerbsanalyse "Betriebskostenspiegel" (09.09.2026)

Anlass: Die eigene Seite `/ratgeber/betriebskostenspiegel-2024` erzeugt 548 von 974 Impressionen, steht aber auf Ø-Position 39. Nach dem Beheben des Rendering-Fehlers (siehe CHANGELOG) hat sie erstmals überhaupt Inhalt. Frage: Was fehlt noch gegenüber den Seiten, die dort ranken?

### Wer dort rankt

DMB selbst und Haufe (beide mit Domain-Autorität, gegen die realistisch nicht anzukommen ist), NebenkostenPro sowie `mein-nebenkostenrechner.de` mit gleich drei Seiten. Letzterer war in der bisherigen Konkurrenzdokumentation (Mineko, NebenkostenPro, nebify) **nicht erfasst** — ist aber auf diesem Suchbegriff der direkteste Gegner.

### Größenvergleich

| | NKR (nach dem Fix) | mein-nebenkostenrechner.de |
|---|---|---|
| Zeichen | ~11.000 | **62.800** |
| Überschriften | 3 | **44** |
| Kostenarten in Tabelle | 14 + Summe | alle 17 nach BetrKV |
| Bundesland-Abschnitte | keine | Bayern, Sachsen/Dresden, Berlin, Hessen, NRW |
| Jahresvergleiche | keine | 2018, 2021, 2022, 2023, 2024, Prognose 2025 |
| FAQ | nein | ja |
| Einbett-Widget für Fremdseiten | nein | ja |

### Einordnung — was davon nachahmenswert ist und was nicht

**Nicht nachahmen:** Ein erheblicher Teil der 44 Überschriften sind inhaltliche Dubletten mit variierten Suchbegriffen ("Durchschnittliche Betriebskosten 2024", "Betriebskosten Durchschnitt 2024 in Deutschland", "Durchschnittswert Nebenkosten 2024", "Nebenkosten Durchschnitt", "Durchschnittliche Nebenkosten pro qm 2023"). Das ist klassische Keyword-Variation, die Google mit den Helpful-Content-Updates gezielt abwertet. Es rankt derzeit, ist aber kein tragfähiges Fundament — und passt nicht zur zurückhaltenden Positionierung von NKR (siehe Abschnitt 1).

**Nachahmenswert, weil echter Nutzen:**

1. **Alle 17 Kostenarten** statt 14, jeweils mit kurzer Erklärung, was die Position umfasst. Die Daten liegen bereits in `business.js`.
2. **Jahresvergleich 2023 → 2024.** Der DMB weist beide aus, die Steigerung von über 6 % ist ein starker Aufhänger. Realer Informationswert, keine Dublette.
3. **FAQ-Abschnitt.** Entspricht dem, wie Menschen tatsächlich suchen, und ist strukturiert auszeichnbar.
4. **Bundesland-Abschnitte.** Dazu unten mehr.
5. **Einbett-Widget.** Legitimer Weg zu Rückverlinkungen: Fremdseiten binden die Tabelle ein und verlinken auf die Quelle. Die Daten sind bereits strukturiert vorhanden, der Aufwand wäre gering.

### Zur Datenlage bei Bundesland-Seiten

Laut CHANGELOG-Eintrag zur regionalen Richtwerte-Recherche gilt: Auf **Stadt-/Kreis-Ebene** existieren keine Betriebskosten-Daten (nur Mietspiegel zur Kaltmiete). Auf **Bundesland-Ebene** dagegen existieren real 13 landesweite DMB-Betriebskostenspiegel — bisher aber nicht primärquellen-verifiziert und nirgends im Code hinterlegt.

Die Suchanfrage "betriebskostenspiegel hessen 2024" erzeugt bereits 21 Impressionen ohne passende Seite. Das Feld ist also real, erfordert aber zuerst die Beschaffung und Verifikation der Landesdaten — keine erfundenen Werte (Grundsatz siehe CHANGELOG).

### Ehrliche Einordnung zum Zeithorizont

**Für die Saison Okt–Dez 2026 wird SEO nichts mehr bewegen.** Von Position 39 auf Seite 1 zu kommen dauert bei einer jungen Domain Monate, nicht Wochen — und der Rendering-Fehler wurde erst heute behoben, Google muss die Seiten überhaupt erst neu bewerten. Wer etwas anderes verspricht, verkauft Hoffnung.

Was das bedeutet: Die diesjährige Saison wird von der bestehenden, sehr kleinen Reichweite bestimmt. Der Aufbau lohnt sich trotzdem — er zahlt auf die Saison 2027 und auf den ganzjährigen Grundverkehr ein. Aber er ist keine Rettung für die kommenden drei Wochen.
