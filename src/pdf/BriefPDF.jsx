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

  // NEU 09.09.2026 (Fund aus Stefans Testkauf-PDF, siehe CHANGELOG):
  // Positionen mit Status "pruefen" haben keinen offiziellen Vergleichswert
  // (siehe lib/analyse.js, Fallzweig ohne Richtwert) und erzeugen deshalb
  // KEINEN Widerspruchsgrund. Waren gleichzeitig keine harten oder
  // statistischen Gründe vorhanden, entstand daraus ein inhaltlich LEERER
  // Brief: die Zeile "erhebe ich Einwendungen gegen folgende Positionen:"
  // gefolgt von einer leeren Tabelle und "Summe der beanstandeten
  // Positionen 0,00 €". Für 12,99 € ein unbrauchbares Dokument.
  //
  // Lösung: Diese Positionen kommen jetzt als eigene, klar als FRAGE
  // gekennzeichnete Gruppe in den Brief. Das ist inhaltlich korrekt — ob
  // eine solche Position umlagefähig ist, hängt am Mietvertrag, den wir
  // nicht kennen. Der Mieter hat auf diese Auskunft einen Anspruch
  // (§ 259 BGB Belegeinsicht), ohne dass irgendetwas behauptet wird.
  //
  // NACHBESSERUNG 09.09.2026 (zweiter Testkauf mit echten Daten): Manche
  // Positionen haben Status "pruefen" UND erzeugen zusätzlich einen
  // Widerspruchsgrund — konkret die CO2-Abgabe (lib/analyse.js: status
  // "pruefen" + widerspruch "statistisch") und der Kabelanschluss im
  // Übergangsjahr 2024. Die standen dadurch ZWEIMAL im selben Brief, einmal
  // als Beanstandung und einmal als Frage. Deshalb werden hier alle
  // Positionen aussortiert, deren Name bereits in einem Widerspruchsgrund
  // vorkommt. Namensabgleich statt ID, weil die Gründe reine Textzeilen sind
  // (siehe analyse.js) — der Abgleich ist deshalb bewusst großzügig in
  // Kleinschreibung und per "enthält", damit auch "Kabelanschlusskosten …"
  // die Position "Kabelanschluss" trifft.
  const bereitsGenannt = [...gruendeHart, ...gruendeStatistisch].map(g => (g.text || "").toLowerCase());
  const offenePositionen = (result.posten_bewertung || [])
    .filter(p => p.status === "pruefen")
    .filter(p => {
      const name = (p.posten || "").toLowerCase().trim();
      return name && !bereitsGenannt.some(t => t.includes(name));
    });
  const hatBeanstandungen = gruendeHart.length > 0 || gruendeStatistisch.length > 0;

  // DREI BRIEFMODI (Stand 09.09.2026, aufgedeckt durch
  // scripts/pdf-konsistenz-test.mjs — dort schlug die Regel "Brief ist nie
  // inhaltlich leer" in 27 von 68 Konstellationen fehl):
  //
  //   "einwendungen"   — es gibt harte oder statistische Beanstandungen.
  //   "auskunft"       — keine Beanstandung, aber Positionen ohne offiziellen
  //                      Vergleichswert: gezielte Rückfragen dazu.
  //   "belegeinsicht"  — WEDER Beanstandung NOCH offene Position, also jede
  //                      Position im Rahmen. Vorher entstand hier ein
  //                      vollständig leerer Brief ("Einwendungen gegen
  //                      folgende Positionen:" + nichts). Das ist der
  //                      häufigste Fall überhaupt, wenn eine Abrechnung
  //                      schlicht unauffällig ist.
  //
  // Warum im dritten Fall trotzdem ein sinnvoller Brief möglich ist: Unsere
  // Prüfung vergleicht mit Durchschnittswerten. Ein unauffälliger Vergleich
  // beweist NICHT, dass die abgerechneten Kosten tatsächlich angefallen sind
  // oder der Umlageschlüssel richtig angewendet wurde — das zeigen nur die
  // Originalbelege. Auf deren Einsicht hat jeder Mieter nach § 259 BGB
  // Anspruch, ohne einen Verdacht äußern zu müssen. Genau das ist hier der
  // Inhalt: eine sachliche, jederzeit berechtigte Aufforderung zur
  // Belegeinsicht — kein Vorwurf, keine Behauptung, kein leeres Blatt.
  const modus = hatBeanstandungen ? "einwendungen"
    : offenePositionen.length > 0 ? "auskunft"
    : "belegeinsicht";
  const istAuskunftsschreiben = modus === "auskunft";
  const zeigtListe = modus !== "belegeinsicht";

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
      <Text style={s.betreff}>
        Betreff: {{
          einwendungen: "Einwendungen gegen die Betriebskostenabrechnung " + wohnung.jahr,
          auskunft: "Belegeinsicht und Rückfragen zur Betriebskostenabrechnung " + wohnung.jahr,
          belegeinsicht: "Belegeinsicht zur Betriebskostenabrechnung " + wohnung.jahr,
        }[modus]}
      </Text>

      <Text style={s.absatz}>Sehr geehrte Damen und Herren,</Text>
      <Text style={s.absatz}>
        {{
          einwendungen: "nach Prüfung der Betriebskostenabrechnung für den Zeitraum 01.01." + wohnung.jahr + " bis 31.12." + wohnung.jahr + " erhebe ich gemäß § 556 Abs. 3 BGB fristgerecht Einwendungen gegen folgende Positionen:",
          auskunft: "nach Prüfung der Betriebskostenabrechnung für den Zeitraum 01.01." + wohnung.jahr + " bis 31.12." + wohnung.jahr + " bitte ich Sie um Belegeinsicht nach § 259 BGB sowie um Auskunft zu folgenden Positionen, deren vertragliche Grundlage sich aus der Abrechnung nicht ergibt:",
          belegeinsicht: "ich habe die Betriebskostenabrechnung für den Zeitraum 01.01." + wohnung.jahr + " bis 31.12." + wohnung.jahr + " geprüft. Die abgerechneten Beträge liegen im üblichen Rahmen; hierzu habe ich derzeit keine Einwendungen. Zur abschließenden Prüfung bitte ich Sie um Einsicht in die Originalbelege nach § 259 BGB.",
        }[modus]}
      </Text>
      {modus === "belegeinsicht" && (
        <Text style={s.absatz}>
          Aus der Abrechnung selbst ist nicht ersichtlich, ob die ausgewiesenen Kosten tatsächlich in dieser Höhe angefallen sind und ob der Umlageschlüssel korrekt angewendet wurde. Die Belegeinsicht dient allein dieser Nachvollziehbarkeit und ist nicht als Beanstandung zu verstehen.
        </Text>
      )}

      {/* Tabelle entfällt im Modus "belegeinsicht" — dort gibt es keine
          Positionsliste, und eine leere Tabelle mit Rahmenlinie sähe nach
          einem Darstellungsfehler aus. */}
      <View style={zeigtListe ? s.table : { marginBottom: 4 }}>
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
        {/* Summenzeile steht DIREKT unter den Beanstandungen und VOR dem
            Fragen-Block (Reihenfolge geändert 09.09.2026, zweiter Testkauf):
            vorher stand sie ganz unten unter einer gemischten Liste aus
            Beanstandungen und bloßen Rückfragen — dort las sie sich, als
            summiere sie auch die Fragen mit, was sachlich falsch wäre. */}
        {hatBeanstandungen && (
          <View style={s.tRowSum}>
            <Text style={s.tLabel}>Summe der beanstandeten Positionen</Text>
            <Text style={s.tValue}>{fmt(result.moegliche_ersparnis)}</Text>
          </View>
        )}
        {/* Positionen ohne offiziellen Vergleichswert — siehe Kommentar zu
            offenePositionen oben. Bewusst als Frage formuliert, nicht als
            Vorwurf: Wir wissen nicht, was im Mietvertrag steht. */}
        {offenePositionen.length > 0 && (
          <>
            <Text style={s.gruppenTitel}>Bitte um Angabe der vertraglichen Grundlage und um Belegeinsicht</Text>
            {offenePositionen.map((p, i) => (
              <View key={"o" + i} style={s.tRow}>
                <Text style={s.tLabel}>
                  {gruendeHart.length + gruendeStatistisch.length + i + 1}. {p.posten} ({fmt(p.betrag)}): Auf welcher vertraglichen Grundlage wurde diese Position umgelegt, und ist sie nach § 2 BetrKV umlagefähig?
                </Text>
              </View>
            ))}
          </>
        )}
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
      {/* Schlussabsatz angepasst 09.09.2026: Ohne einzige Beanstandung darf
          hier keine Korrektur und keine Rückerstattung gefordert werden —
          das wäre sachlich falsch und würde den Mieter angreifbar machen. */}
      <Text style={s.absatz}>
        {{
          einwendungen: "Ich bitte um Übersendung der Originalbelege zur Einsichtnahme (§ 259 BGB), um nachvollziehbare Darlegung des Umlageschlüssels sowie um Korrektur der beanstandeten Positionen und Rückerstattung des zu viel gezahlten Betrags, soweit sich die Beanstandungen bestätigen.",
          auskunft: "Ich bitte um Übersendung der Originalbelege zur Einsichtnahme (§ 259 BGB) sowie um nachvollziehbare Darlegung des Umlageschlüssels für die oben genannten Positionen. Sollte sich daraus eine nicht umlagefähige Position ergeben, behalte ich mir vor, hierauf zurückzukommen.",
          belegeinsicht: "Bitte teilen Sie mir mit, wann und wo ich die Originalbelege einsehen kann, oder übersenden Sie mir Kopien. Ich bitte zusätzlich um nachvollziehbare Darlegung des angewendeten Umlageschlüssels. Sollten sich aus der Einsicht Beanstandungen ergeben, behalte ich mir vor, hierauf innerhalb der Frist des § 556 Abs. 3 BGB zurückzukommen.",
        }[modus]}
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
