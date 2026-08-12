// ─────────────────────────────────────────────────────────────────────────
// BriefPDF.jsx — Seite 2 (nur Stufe "voll"): Musterbrief an den Vermieter,
// DIN-5008-Format. Bewusst zurückhaltend gestaltet (fast nur Schwarz/Weiß,
// Logo klein) — der Brief kommt vom Mieter, nicht von NebenkostenRadar,
// und muss beim Vermieter seriös ankommen, nicht wie Werbematerial wirken.
// ─────────────────────────────────────────────────────────────────────────
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { THEME } from "../config/theme.js";
import { fmt } from "../lib/format.js";

const C = THEME.color;
const s = StyleSheet.create({
  page: { padding: "40pt 46pt", fontFamily: "Work Sans", fontSize: 10, color: C.text, lineHeight: 1.55 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 24 },
  logoBox: { width: 12, height: 12, borderRadius: 3, backgroundColor: C.brand },
  logoText: { fontFamily: "Poppins", fontSize: 8, fontWeight: 600, color: C.textDim },
  block: { marginBottom: 18, fontSize: 9.5 },
  datum: { fontSize: 9.5, color: C.textMuted, marginBottom: 16 },
  betreff: { fontSize: 10.5, fontWeight: 500, marginBottom: 14 },
  absatz: { marginBottom: 10, fontSize: 10 },
  table: { marginBottom: 14, borderTop: "0.5pt solid " + C.border },
  tRow: { flexDirection: "row", borderBottom: "0.5pt solid " + C.border, paddingVertical: 6 },
  tRowSum: { flexDirection: "row", paddingVertical: 6, fontWeight: 500 },
  tLabel: { flex: 3, color: C.textMuted },
  tValue: { flex: 1, textAlign: "right" },
  gruppenTitel: { fontSize: 8.5, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", marginTop: 10, marginBottom: 2 },
  gruss: { marginTop: 20, marginBottom: 30 },
  footer: { position: "absolute", bottom: 24, left: 46, right: 46, borderTop: "0.5pt solid " + C.border, paddingTop: 6, fontSize: 7, color: C.textDim, textAlign: "center" },
});

export default function BriefPDF({ result, wohnung, adressen }) {
  // Zweigeteilt statt einer einzigen Liste (10.08.2026, siehe CHANGELOG):
  // "hart" = aus den Angaben allein beweisbarer Rechtsverstoß, "statistisch"
  // = Abweichung vom DMB-Durchschnitt bzw. offene Frage — ein Anlass zur
  // Nachfrage, kein Beweis. Damit steht im Anschreiben an den Vermieter nie
  // mehr Sicherheit, als die zugrunde liegende Methode tatsächlich hergibt.
  const gruendeHart = result.widerspruchsgruende_hart || [];
  const gruendeStatistisch = result.widerspruchsgruende_statistisch || (result.widerspruchsgruende || []).filter(g => g.typ !== "hart");
  const heute = new Date().toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" });

  return (
    <Page size="A4" style={s.page}>
      <View style={s.logoRow}>
        <View style={s.logoBox} />
        <Text style={s.logoText}>Erstellt mit NebenkostenRadar</Text>
      </View>

      <View style={s.block}>
        <Text>{adressen.mieterName}</Text>
        <Text>{adressen.mieterStrasse}</Text>
        <Text>{adressen.mieterPlz} {adressen.mieterOrt}</Text>
      </View>

      <View style={s.block}>
        <Text>{adressen.vermieterName}</Text>
        <Text>{adressen.vermieterStrasse}</Text>
        <Text>{adressen.vermieterPlz} {adressen.vermieterOrt}</Text>
      </View>

      {/* .trim() 12.08.2026: ein Leerzeichen im eingegebenen Ort-Feld
          erzeugte sichtbar "Frankfurt , 12. August 2026" statt "Frankfurt,
          12. August 2026" — Eingabefehler, nicht im Formular verhindert;
          hier defensiv abgefangen statt nur an der Formularvalidierung. */}
      <Text style={s.datum}>{(adressen.mieterOrt || "").trim()}, {heute}</Text>
      <Text style={s.betreff}>Betreff: Einwendungen gegen die Betriebskostenabrechnung {wohnung.jahr}</Text>

      <Text style={s.absatz}>Sehr geehrte Damen und Herren,</Text>
      <Text style={s.absatz}>
        nach Prüfung der Betriebskostenabrechnung für den Zeitraum 01.01.{wohnung.jahr} bis 31.12.{wohnung.jahr} erhebe ich gemäß § 556 Abs. 3 BGB fristgerecht Einwendungen gegen folgende Positionen:
      </Text>

      <View style={s.table}>
        {gruendeHart.length > 0 && (
          <>
            <Text style={s.gruppenTitel}>Eindeutig nicht umlagefähig</Text>
            {gruendeHart.map((g, i) => (
              <View key={"h" + i} style={s.tRow}>
                <Text style={s.tLabel}>{i + 1}. {g.text}</Text>
              </View>
            ))}
          </>
        )}
        {gruendeStatistisch.length > 0 && (
          <>
            <Text style={s.gruppenTitel}>Auffällig im Vergleich zum DMB-Betriebskostenspiegel — bitte um Prüfung und Beleg</Text>
            {gruendeStatistisch.map((g, i) => (
              <View key={"s" + i} style={s.tRow}>
                <Text style={s.tLabel}>{gruendeHart.length + i + 1}. {g.text}</Text>
              </View>
            ))}
          </>
        )}
        <View style={s.tRowSum}>
          <Text style={s.tLabel}>Summe der beanstandeten Positionen</Text>
          <Text style={s.tValue}>{fmt(result.moegliche_ersparnis)}</Text>
        </View>
      </View>

      {/* 12.08.2026, echter Bug: Hier stand vorher zusätzlich "...bis zum 30.
          September {fristJahr}" (fristJahr = Abrechnungsjahr + 2, feststehend
          "30. September") — eine grobe, längst durch die echte Fristprüfung
          in analyse.js (buildResult, Einwendungsfrist anhand erhaltenAm)
          ersetzte Näherung, die hier aber übersehen wurde und einen
          Widerspruch im selben Brief erzeugte: eine Zahlungsforderung erst
          in 13 Monaten, direkt gefolgt von der Bitte um Stellungnahme
          "innerhalb von 4 Wochen". Ersatzlos gestrichen — die 4-Wochen-Frist
          unten ist die einzige im Brief genannte Frist, wie von Stefan
          bestätigt (siehe CHANGELOG). */}
      <Text style={s.absatz}>
        Ich bitte um Übersendung der Originalbelege zur Einsichtnahme (§ 259 BGB), um nachvollziehbare Darlegung des Umlageschlüssels sowie um Korrektur der beanstandeten Positionen und Rückerstattung des zu viel gezahlten Betrags, soweit sich die Beanstandungen bestätigen.
      </Text>
      {result.saldo > 0 && (
        <Text style={s.absatz}>Eine eventuelle Nachzahlung leiste ich ausdrücklich unter Vorbehalt.</Text>
      )}
      <Text style={s.absatz}>Ich bitte um schriftliche Stellungnahme innerhalb von 4 Wochen.</Text>

      <View style={s.gruss}>
        <Text>Mit freundlichen Grüßen</Text>
        <Text>{"\n\n"}{adressen.mieterName}</Text>
      </View>

      <View style={s.footer} fixed>
        <Text>Unverbindliches Musterschreiben ohne Rechtsberatungscharakter (§ 2 RDG) · Deutscher Mieterbund: mieterbund.de · Tel. 030 223230</Text>
      </View>
    </Page>
  );
}
