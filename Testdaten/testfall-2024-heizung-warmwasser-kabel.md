# Testfall: Betriebskostenabrechnung 2024, Wohnungsbaugesellschaft (ABG Frankfurt Holding), 14 Seiten

Anonymisierte Referenzwerte aus der von Stefan am 08.08.2026 hochgeladenen echten Abrechnung (Abrechnungsjahr 2024). Dient als Regressions-Vorlage für `api/analyse-foto.js` und `src/lib/analyse.js` — bei künftigen Änderungen an der Foto-Erkennung oder der Prüflogik sollten diese Werte weiterhin korrekt herauskommen.

**Bewusst KEINE personenbezogenen Daten in dieser Datei:** kein Name, keine Adresse, keine Mietvertragsnummer, keine IBAN — nur die für die Logik relevanten Zahlen und Kategorien. Die Original-Fotos selbst wurden NICHT in dieses Projektverzeichnis übernommen (siehe Begründung im Projekt-Chat, 09.08.2026): Seite 1 der Abrechnung zeigt u. a. eine vollständige IBAN, das gehört nicht in ein Git-Repository, auch kein privates.

## Abrechnungsergebnis (Seite 1)

| Kategorie | Kosten | Vorauszahlung | Saldo |
|---|---|---|---|
| Betriebskosten | 1.722,56 € | 1.403,49 € | 319,07 € Nachbelastung |
| Heizkosten/Wasserkosten | 1.002,51 € | 1.469,00 € | 466,49 € Guthaben |
| Wasser/Entwässerung (Kaltwasser) | 465,75 € | 710,00 € | 244,25 € Guthaben |
| **Summe** | **3.190,82 €** | **3.582,49 €** | **391,67 € Guthaben** |

→ `gesamtsummeLautAbrechnung` sollte 3190.82 ergeben.

## Betriebskosten, Einzelpositionen (Seite 3, Spalte "Ihre Kosten €")

Grundsteuer 437,15 · Niederschlagswasser 15,13 · Straßenreinigung 29,53 · Müllabfuhr 213,49 · Gartenpflege 40,14 · Schnee-/Eisbeseitigung 18,14 · Beleuchtung 48,53 · Feuerversicherung 332,38 · Haftpflichtversicherung 4,02 · Sturm-/Hagelversicherung 73,46 · Leitungswasserversicherung 151,72 · Hauswart 52,91 · Hausreinigung 194,70 · Breitbandkabelanschluss (nur 01.01.–30.06.2024) 81,18 · Wartung Rauchwarnmelder 7,89 · Gasleitungsprüfung 1,89 · Wartung Sonstige 20,30. Summe: 1.722,56 €.

**Wichtig, von Stefan bestätigt:** Der Kabelanschluss-Betrag (81,18 €) ist nur für 01.01.–30.06.2024 abgerechnet — das ist rechtlich korrekt (TKG-Novelle, Umlagefähigkeit endet 01.07.2024), kein Fehler der Abrechnung. Ein Prüf-Ergebnis, das hier "voller Betrag rückforderbar" behauptet, wäre falsch.

## Heizkosten/Wasserkosten (Seite 3)

Heizung Grundanteil 186,48 + Heizung Verbrauchsanteil 340,88 + Warmwasser Grundanteil 116,63 + Warmwasser Verbrauchsanteil 358,52 = Summe 1.002,51 €.

→ `heizkosten_gesamt` sollte 527.36 ergeben (186.48+340.88), `warmwasser_gesamt` sollte 475.15 ergeben (116.63+358.52). Die gedruckte Zwischensumme 1.002,51 € darf NICHT direkt in `heizkosten_gesamt` landen.

## Kaltwasserkosten (Seite 4)

Kaltwasser 266,38 + Kaltwasser Gerätemiete 25,56 + Kaltwasser Kanal 168,86 + Kaltwasser Servicegebühren 4,95 = Summe 465,75 €.

→ `kaltwasser` sollte 465.75 ergeben (deckt laut Feld-Definition "inkl. Grundgebühr" bereits die Gerätemiete mit ab). `wasserzaehler` sollte NICHT zusätzlich befüllt werden, sonst Doppelzählung der 25,56 €.

## Bekannter, noch nicht behobener Datenmakel dieser Abrechnung selbst

CO2-Abgabe wird auf einer Detail-Anlage weiter hinten in der Abrechnung mit zwei widersprüchlichen Summen für denselben Posten ausgewiesen (2.285,87 € vs. 2.887,93 €) — nicht durch uns auflösbar, wäre eine echte Rückfrage beim Vermieter. Zeigt: auch eine Abrechnung einer großen, professionellen Wohnungsbaugesellschaft ist nicht automatisch fehlerfrei, das Tool sollte nie von "seriöser Absender = korrekte Zahlen" ausgehen.

## Noch nicht gegen dieses Testfall verifiziert

Seiten 5–14 (Heizkosten-Verbrauchsdetails, Wärmemengen) wurden für diese Korrektur nicht ausgewertet — falls künftig Bugs im Heizkosten-Verbrauchsanteil auftreten, lohnt ein erneuter Blick dorthin.
