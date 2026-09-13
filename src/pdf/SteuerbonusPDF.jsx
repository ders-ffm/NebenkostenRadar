// ─────────────────────────────────────────────────────────────────────────
// SteuerbonusPDF.jsx — Seite 3 (nur Stufe "voll"): unverbindlicher Hinweis
// auf potenziell nach § 35a EStG absetzbare Positionen aus der Abrechnung,
// plus fertige Anfrage-Vorlage an den Vermieter für die fehlende
// Arbeitskosten-Aufschlüsselung (siehe Recherche in
// planung/businessplan-umsatzprognose.md Abschnitt 10 und
// planung/steuerbonus-35a-rollout.md, 14.08.2026, Stefans Entscheidung:
// on top, kein Aufpreis, nur im 12,99-€-Paket).
//
// RECHTLICHES: Reine Rechenhilfe, keine Steuerberatung — siehe § 5 StBerG
// (Verbot der unbefugten Hilfeleistung in Steuersachen), § 6 Nr. 3 StBerG
// (mechanische Rechenarbeiten erlaubt). Formulierung angelehnt an die bei
// einem direkten Wettbewerber (NebenkostenPro) beobachtete, in dieser
// Nische offenbar akzeptierte Praxis (siehe Businessplan 10.4). Deshalb an
// zwei Stellen ein expliziter Disclaimer: kurz oben, ausführlich im Footer.
//
// DATENQUELLE: Filtert result.posten_bewertung nach dem Flag
// `steuerlich_35a` (gesetzt in lib/analyse.js, siehe Kommentar dort) — KEIN
// separater Datenfluss, keine neue Supabase-Spalte, nutzt ausschließlich
// Daten, die für Seite 1/2 ohnehin schon vorhanden und persistiert sind.
// ─────────────────────────────────────────────────────────────────────────
import { Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { THEME } from "../config/theme.js";
import { fmt } from "../lib/format.js";
import { BUSINESS } from "../config/business.js";

const C = THEME.color;
const s = StyleSheet.create({
  page: { padding: "40pt 46pt", fontFamily: "Work Sans", fontSize: 10, color: C.text, lineHeight: 1.55 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 24 },
  logoBox: { width: 12, height: 12, borderRadius: 3, backgroundColor: C.brand },
  logoText: { fontFamily: "Poppins", fontSize: 8, fontWeight: 600, color: C.textDim },
  titel: { fontFamily: "Poppins", fontSize: 14, fontWeight: 600, marginBottom: 3 },
  untertitel: { fontSize: 8.5, color: C.textDim, marginBottom: 16 },
  absatz: { marginBottom: 10, fontSize: 10 },
  table: { marginBottom: 12, borderTop: "0.5pt solid " + C.border },
  tRow: { flexDirection: "row", borderBottom: "0.5pt solid " + C.border, paddingVertical: 6 },
  tRowSum: { flexDirection: "row", paddingVertical: 6, fontWeight: 500 },
  tLabel: { flex: 3, color: C.textMuted },
  tValue: { flex: 1, textAlign: "right" },
  hinweisBox: { backgroundColor: C.brandBg, borderRadius: 6, padding: "10pt 12pt", marginBottom: 16, fontSize: 9.5, color: C.text, lineHeight: 1.5 },
  anfrageTitel: { fontSize: 10, fontWeight: 500, marginBottom: 6 },
  anfrageBox: { border: "0.5pt solid " + C.border, borderRadius: 6, padding: "10pt 12pt", marginBottom: 16, fontSize: 9.5, color: C.textMuted, lineHeight: 1.6 },
  footer: { position: "absolute", bottom: 24, left: 46, right: 46, borderTop: "0.5pt solid " + C.border, paddingTop: 6, fontSize: 7, color: C.textDim, textAlign: "center" },
});

// 20 % Grenzwerte aus § 35a Abs. 2/3 EStG — siehe Businessplan Abschnitt
// 10.1 für die primärquellengestützte Herleitung. Bewusst als reiner
// Rechenwert auf den VOLLEN gefundenen Betrag ausgewiesen (nicht nur
// Arbeitskosten, die die Abrechnung meist nicht getrennt ausweist) — daher
// im Text klar als Obergrenze/Ausgangswert gekennzeichnet, nicht als
// feststehendes Ergebnis.
const PROZENTSATZ = BUSINESS.STEUER_35A.SATZ;

// Entfernt das "davon "-Präfix aus Positionsnamen (09.09.2026, Fund aus dem
// zweiten Testkauf). In der Haupttabelle von AbrechnungPDF.jsx ist "davon
// Schnee-/Eisbeseitigung" korrekt — dort steht direkt darüber die
// zusammengefasste Elternzeile, auf die sich das "davon" bezieht. Hier gibt
// es diese Elternzeile nicht, und im Anschreiben an den Vermieter landete
// dadurch der Satz "… für folgende Positionen: davon Schnee-/Eisbeseitigung
// (€ 22.00)". Das liest sich wie ein Textbaustein-Fehler in einem Dokument,
// das der Kunde unverändert weiterschickt.
function ohneDavon(name) {
  return (name || "").replace(/^davon\s+/i, "");
}

export default function SteuerbonusPDF({ result, wohnung, adressen }) {
  const positionen = (result.posten_bewertung || []).filter(p => p.steuerlich_35a && p.betrag > 0);
  // Alle Posten MIT Einordnung, also auch die nicht begünstigten. Grundlage
  // der Einzeltabelle weiter unten. Sammelzeilen ("(kombiniert)") tragen
  // bewusst keine Einordnung, weil sie begünstigte und nicht begünstigte
  // Anteile mischen; für sie stehen die "davon"-Zeilen in der Liste.
  const positionenAlle = (result.posten_bewertung || []).filter(p => p.steuerArt && p.betrag > 0);
  const summe = Math.round(positionen.reduce((s2, p) => s2 + p.betrag, 0) * 100) / 100;
  const rechnerischerHinweis = Math.round(summe * PROZENTSATZ * 100) / 100;
  const heute = new Date().toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" });

  return (
    <Page size="A4" style={s.page}>
      <View style={s.logoRow}>
        <View style={s.logoBox} />
        <Text style={s.logoText}>Erstellt mit NebenkostenRadar</Text>
      </View>

      <Text style={s.titel}>Steuer-Bonus: was du absetzen kannst</Text>
      <Text style={s.untertitel}>Unverbindlicher Hinweis nach § 35a EStG, reine Rechenhilfe, keine Steuerberatung.</Text>

      {positionen.length === 0 ? (
        <Text style={s.absatz}>
          In deiner Abrechnung wurden keine Positionen gefunden, die typischerweise unter § 35a EStG fallen (z. B. Hausmeister, Gartenpflege, Hausreinigung, Winterdienst, Schornsteinfeger, Aufzug- oder Heizungswartung). Das heißt nicht zwingend, dass es nichts Absetzbares gibt, frag im Zweifel direkt bei deinem Vermieter nach.
        </Text>
      ) : (
        (() => {
          /* UMGEBAUT AM 11.09.2026 auf Stefans Vorgabe:
             "Hier nochmal den Vermieter anzuschreiben ist doch unnötig. Hier
             soll der Kunde nur sehen welche Posten er in seiner
             Steuererklärung [einträgt] und an welcher Stelle."

             WAS ENTFERNT WURDE: Das zweite Musterschreiben an den Vermieter.
             Begründung: Der Kunde hat auf der Seite davor bereits ein
             Schreiben, das Belegeinsicht verlangt. Ein zweites Schreiben in
             derselben Sache wirkt umständlich und erzeugt Arbeit, die in den
             allermeisten Fällen unnötig ist, weil viele Abrechnungen den
             Arbeitskostenanteil ohnehin gesondert ausweisen.

             WAS STATTDESSEN KOMMT: Die beiden Töpfe des § 35a EStG getrennt,
             mit den Beträgen und dem Ort in der Steuererklärung. Wer ein
             Steuerprogramm nutzt, wird dort ohnehin nach genau diesen zwei
             Zahlen gefragt und bekommt die Ermäßigung automatisch berechnet.

             WARUM HIER KEINE ZEILENNUMMER STEHT: Die Formulare haben sich
             zuletzt 2023 geändert, seitdem gibt es die eigene "Anlage
             Haushaltsnahe Aufwendungen". Quellen nennen widersprüchliche
             Zeilennummern, je nachdem, auf welches Jahr sie sich beziehen.
             Eine falsche Zeilennummer wäre schlimmer als keine, deshalb wird
             nur das Formular benannt, das seit 2023 stabil so heißt. */
          const S35A = BUSINESS.STEUER_35A;
          const dienst = positionen.filter(p => p.steuerArt === "dienstleistung");
          const handw  = positionen.filter(p => p.steuerArt === "handwerker");
          const sumD = dienst.reduce((a, p) => a + p.betrag, 0);
          const sumH = handw.reduce((a, p) => a + p.betrag, 0);
          // Nur die tatsächlich absetzbaren Posten kommen in die Listen.
          const absetzbar = positionenAlle.filter(p => p.steuerArt === "dienstleistung" || p.steuerArt === "handwerker");
          // NICHT ABSETZBARE POSTEN ERSCHEINEN GAR NICHT MEHR, 13.09.2026.
          // Stefans Vorgabe: "Nur Posten auflisten, die absetzbar sind. Posten,
          // die gemäß Steuerrecht nicht absetzbar sind, gar nicht listen, auch
          // nicht extra."
          //
          // Zwischenstand war eine Sammelzeile "Nicht absetzbar und deshalb
          // oben nicht aufgeführt: ...". Die ist ebenfalls weg. Die Seite heißt
          // "was du absetzen kannst" und beantwortet genau das, nichts sonst.
          //
          // Die Einordnung selbst bleibt in src/lib/analyse.js erhalten und
          // wird weiter gepflegt. Sie entscheidet hier nur noch darüber, was
          // NICHT gezeigt wird.
          // Tatsächliche Ermäßigung: 20 % je Topf, gedeckelt auf die
          // gesetzlichen Höchstbeträge (§ 35a Abs. 2 und 3 EStG). Ohne den
          // Deckel stünde bei großen Abrechnungen eine Zahl da, die es so
          // nie gibt.
          const ermaessigung = Math.round((Math.min(sumD * S35A.SATZ, S35A.HOECHST_DIENSTLEISTUNG) + Math.min(sumH * S35A.SATZ, S35A.HOECHST_HANDWERKER)) * 100) / 100;
          return (
            <>
              {/* ZWEI GETRENNTE DARSTELLUNGEN, umgebaut 13.09.2026 auf Stefans
                  Vorgabe: "In der Steuerauflistung dürfen nur Posten
                  aufgelistet werden, welche wirklich von der Steuer absetzbar
                  sind, und zwar in 2 Versionen: einmal die Einzelauflistung
                  für Steuer-Apps wie Taxfix, und einmal so wie man sie selbst
                  in die Steuerformulare eingibt. Da ist es zusammengefasst."

                  Beides stimmt und ist wirklich verschieden:
                  Steuerprogramme fragen Posten für Posten ab. Das amtliche
                  Formular (Anlage Haushaltsnahe Aufwendungen) will dagegen je
                  einen Gesamtbetrag pro Topf.

                  Vorher standen in einer gemeinsamen Tabelle auch alle nicht
                  absetzbaren Posten mit dem Vermerk "zählt nicht". Bei Stefans
                  Abrechnung waren das elf von siebzehn Zeilen. Wer abtippt,
                  muss dann bei jeder Zeile prüfen, ob sie überhaupt gemeint
                  ist, und genau dabei passieren Fehler.

                  Die nicht absetzbaren Posten sind trotzdem nicht verschwunden,
                  sie stehen unten als eine Zeile. Damit bleibt die Frage
                  beantwortet, die sonst offen wäre: Fragt Taxfix nach den
                  Müllgebühren, findet der Kunde dort, dass sie nicht zählen. */}

              <Text style={s.anfrageTitel}>Version 1: für Steuerprogramme, Posten für Posten</Text>
              <Text style={{ fontSize: 8.5, color: C.textDim, marginBottom: 6 }}>
                Taxfix, WISO, Check24 und ähnliche Programme fragen die Posten einzeln ab.
                Trage sie so ein, wie sie hier stehen. Die Zuordnung und die Berechnung
                übernimmt das Programm.
              </Text>
              <View style={s.table}>
                {absetzbar.map((p, i) => (
                  <View key={i} style={s.tRow}>
                    <Text style={[s.tLabel, { flex: 2.1 }]}>{ohneDavon(p.posten)}</Text>
                    <Text style={[s.tValue, { flex: 0.9 }]}>{fmt(p.betrag)}</Text>
                    <Text style={[s.tValue, { flex: 1.5 }]}>
                      {p.steuerArt === "dienstleistung" ? "haushaltsnah" : "Handwerker"}
                    </Text>
                  </View>
                ))}
              </View>

              {/* wrap={false} hält Überschrift, Tabelle und Erläuterung
                  zusammen auf einer Seite. Im Probedruck vom 11.09. stand der
                  Satz zu den 20 % allein oben auf der Folgeseite, abgerissen
                  von den Zahlen, auf die er sich bezieht. */}
              <View wrap={false}>
                <Text style={s.anfrageTitel}>Version 2: für das Steuerformular, zusammengefasst</Text>
                <Text style={{ fontSize: 8.5, color: C.textDim, marginBottom: 6 }}>
                  Die Anlage Haushaltsnahe Aufwendungen will je einen Gesamtbetrag, nicht die
                  Einzelposten. Diese beiden Zahlen trägst du dort ein.
                </Text>
                <View style={s.table}>
                  <View style={s.tRow}>
                    <Text style={s.tLabel}>Haushaltsnahe Dienstleistungen (§ 35a Abs. 2 EStG)</Text>
                    <Text style={s.tValue}>{fmt(sumD)}</Text>
                  </View>
                  <View style={s.tRow}>
                    <Text style={s.tLabel}>Handwerkerleistungen (§ 35a Abs. 3 EStG)</Text>
                    <Text style={s.tValue}>{fmt(sumH)}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 8.5, color: C.textDim, marginBottom: 12 }}>
                  Angerechnet werden davon jeweils {Math.round(S35A.SATZ * 100)} %, höchstens {S35A.HOECHST_DIENSTLEISTUNG.toLocaleString("de-DE")} € im Jahr bei den
                  Dienstleistungen und {S35A.HOECHST_HANDWERKER.toLocaleString("de-DE")} € bei den Handwerkerleistungen.
                </Text>
              </View>

              {/* GEKÜRZT 13.09.2026: Dieser Block erklärte nochmal, dass Programme
                  einzeln abfragen und das Formular zusammengefasst will. Genau
                  das steht seit dem Umbau schon über den beiden Versionen.
                  Übrig bleibt der eine Punkt, der sonst nirgends steht und den
                  viele nicht wissen. */}
              <View style={s.hinweisBox}>
                <Text>
                  Gut zu wissen: Die Ermäßigung zieht das Finanzamt <Text style={{ fontFamily: "Poppins", fontWeight: 600 }}>direkt
                  von deiner Steuerschuld</Text> ab, nicht vom zu versteuernden Einkommen. In deinem Fall
                  wären das {Math.round(S35A.SATZ * 100)} % von {fmt(sumD)} und {Math.round(S35A.SATZ * 100)} % von {fmt(sumH)}, zusammen {fmt(ermaessigung)}, um
                  die sich deine Steuer verringert.
                </Text>
              </View>

              <Text style={s.anfrageTitel}>Ein Punkt, den du vorher prüfen solltest</Text>
              <View style={s.hinweisBox}>
                <Text>
                  Absetzbar ist nur der reine Arbeits-, Fahrt- und Maschinenkostenanteil, nicht das
                  Material (§ 35a Abs. 2 und 3 EStG). Die Beträge oben sind die vollen Positionen aus
                  deiner Abrechnung.
                  {"\n\n"}
                  Schau deshalb zuerst in deine Abrechnung: Viele Vermieter und Hausverwaltungen weisen
                  den Arbeitskostenanteil bereits gesondert aus, oft in einem eigenen Abschnitt mit der
                  Überschrift „§ 35a EStG“, „haushaltsnahe Dienstleistungen“ oder „Bescheinigung“.
                  Findest du das, nimm diese Zahlen statt der Beträge oben. Findest du es nicht, kannst
                  du die Bescheinigung bei deinem Vermieter anfordern; er ist dazu zwar nicht
                  ausdrücklich verpflichtet, stellt sie aber in der Regel aus.
                </Text>
              </View>
            </>
          );
        })()
      )}

      <Text style={{ fontSize: 8.5, color: C.textDim }}>{(adressen.mieterOrt || "").trim()}, {heute}</Text>

      <View style={s.footer} fixed>
        <Text>Reine Rechenhilfe, keine Steuerberatung. Automatisiert erstellter Hinweis, keine Gewähr für Richtigkeit oder Vollständigkeit, ob und in welcher Höhe die Ermäßigung im Einzelfall greift, hängt von deiner individuellen Steuererklärung ab.</Text>
      </View>
    </Page>
  );
}
