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
const PROZENTSATZ = 0.2;

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
          const dienst = positionen.filter(p => p.steuerArt === "dienstleistung");
          const handw  = positionen.filter(p => p.steuerArt === "handwerker");
          const sumD = dienst.reduce((a, p) => a + p.betrag, 0);
          const sumH = handw.reduce((a, p) => a + p.betrag, 0);
          const Block = ({ titel, paragraf, hoechst, liste, summeTopf }) => liste.length === 0 ? null : (
            <>
              <Text style={s.anfrageTitel}>{titel}</Text>
              <Text style={{ fontSize: 8.5, color: C.textDim, marginBottom: 4 }}>
                {paragraf} · 20 % der Arbeitskosten, höchstens {hoechst} Ermäßigung im Jahr
              </Text>
              <View style={s.table}>
                {liste.map((p, i) => (
                  <View key={i} style={s.tRow}>
                    <Text style={s.tLabel}>{ohneDavon(p.posten)}</Text>
                    <Text style={s.tValue}>{fmt(p.betrag)}</Text>
                  </View>
                ))}
                <View style={s.tRowSum}>
                  <Text style={s.tLabel}>In die Steuererklärung eintragen</Text>
                  <Text style={s.tValue}>{fmt(summeTopf)}</Text>
                </View>
              </View>
            </>
          );
          return (
            <>
              <Text style={s.absatz}>
                Diese Positionen aus deiner Abrechnung fallen unter § 35a EStG. Das Gesetz kennt zwei
                getrennte Töpfe mit unterschiedlichen Höchstbeträgen, deshalb stehen sie hier einzeln.
              </Text>

              <Block titel="Haushaltsnahe Dienstleistungen" paragraf="§ 35a Abs. 2 EStG"
                hoechst="4.000 €" liste={dienst} summeTopf={sumD} />
              <Block titel="Handwerkerleistungen" paragraf="§ 35a Abs. 3 EStG"
                hoechst="1.200 €" liste={handw} summeTopf={sumH} />

              {/* TABELLE ALLER POSTEN, ergänzt 11.09.2026 auf Stefans Hinweis:
                  "Posten wie Winterdienst, Rauchmelder etc. werden einzeln
                  abgefragt, zumindest bei den Apps und Steuerhelfern."

                  Genau deshalb reicht es nicht, nur zwei Summen auszuweisen.
                  Wenn das Programm nach den Müllgebühren fragt und im Bericht
                  steht nichts dazu, weiß der Kunde nicht, ob er sie vergessen
                  hat oder ob sie nicht zählen. Diese Tabelle beantwortet jede
                  Einzelfrage, auch die nach nicht begünstigten Posten. */}
              <Text style={s.anfrageTitel}>Jeder Posten einzeln, für die Abfrage im Steuerprogramm</Text>
              <Text style={{ fontSize: 8.5, color: C.textDim, marginBottom: 4 }}>
                Programme wie Taxfix, WISO, Check24 oder Elster fragen Posten einzeln ab.
                Hier steht zu jedem, ob und wohin er gehört.
              </Text>
              <View style={s.table}>
                {positionenAlle.map((p, i) => (
                  <View key={i} style={s.tRow}>
                    <Text style={[s.tLabel, { flex: 2 }]}>{ohneDavon(p.posten)}</Text>
                    <Text style={[s.tValue, { flex: 0.8 }]}>{fmt(p.betrag)}</Text>
                    <Text style={[s.tValue, { flex: 1.6, textAlign: "right",
                      color: p.steuerArt === "nicht" ? C.textDim : C.text }]}>
                      {p.steuerArt === "dienstleistung" ? "haushaltsnahe Dienstleistung"
                        : p.steuerArt === "handwerker" ? "Handwerkerleistung"
                        : p.steuerArt === "unklar" ? "kommt darauf an" : "zählt nicht"}
                    </Text>
                  </View>
                ))}
              </View>

              {positionenAlle.some(p => (p.steuerArt === "nicht" || p.steuerArt === "unklar") && p.steuerGrund) && (
                <View style={{ marginTop: 2, marginBottom: 8 }}>
                  {positionenAlle.filter(p => (p.steuerArt === "nicht" || p.steuerArt === "unklar") && p.steuerGrund)
                    .filter((p, i, arr) => arr.findIndex(q => q.steuerGrund === p.steuerGrund) === i)
                    .map((p, i) => (
                      <Text key={i} style={{ fontSize: 7.5, color: C.textDim, lineHeight: 1.4 }}>
                        {ohneDavon(p.posten)}: {p.steuerGrund}
                      </Text>
                    ))}
                </View>
              )}

              <Text style={s.anfrageTitel}>Wo das in die Steuererklärung gehört</Text>
              <View style={s.hinweisBox}>
                <Text>
                  Die begünstigten Posten gehören in die <Text style={{ fontFamily: "Poppins", fontWeight: 600 }}>Anlage
                  Haushaltsnahe Aufwendungen</Text>, getrennt nach den beiden Töpfen oben. Die Ermäßigung
                  zieht das Finanzamt direkt von deiner Steuerschuld ab, nicht nur vom zu versteuernden
                  Einkommen. Sie wirkt also voll.
                  {"\n\n"}
                  Benutzt du ein Steuerprogramm, trägst du die Posten einzeln ein, so wie das Programm
                  sie abfragt. Die Einordnung in die richtige Kategorie, die Berechnung der 20 Prozent
                  und die Prüfung der Höchstbeträge übernimmt es selbst. Selbst rechnen musst du nichts.
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
