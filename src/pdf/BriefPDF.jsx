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
  // Unterer Rand 58 pt (17.10.2026): Die Fußzeile steht bei 24 pt und ist
  // rund 15 pt hoch, bei 40 pt lief Text in sie hinein (Testkauf).
  page: { padding: "36pt 46pt 58pt", fontFamily: "Work Sans", fontSize: 10, color: C.text, lineHeight: 1.5 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 16 },
  logoBox: { width: 12, height: 12, borderRadius: 3, backgroundColor: C.brand },
  logoText: { fontFamily: "Poppins", fontSize: 8, fontWeight: 600, color: C.textDim },
  block: { marginBottom: 12, fontSize: 9.5 },
  datum: { fontSize: 9.5, color: C.textMuted, marginBottom: 12 },
  betreff: { fontSize: 10.5, fontWeight: 500, marginBottom: 10 },
  absatz: { marginBottom: 8, fontSize: 10 },
  table: { marginBottom: 14, borderTop: "0.5pt solid " + C.border },
  tRow: { flexDirection: "row", borderBottom: "0.5pt solid " + C.border, paddingVertical: 4, fontSize: 9.5 },
  tRowSum: { flexDirection: "row", paddingVertical: 6, fontWeight: 500 },
  tLabel: { flex: 3, color: C.textMuted },
  tValue: { flex: 1, textAlign: "right" },
  gruppenTitel: { fontSize: 8.5, fontWeight: 600, color: C.textMuted, textTransform: "uppercase", marginTop: 8, marginBottom: 2 },
  gruss: { marginTop: 14, marginBottom: 10 },
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
  // (Belegeinsicht, § 556 Abs. 4 BGB), ohne dass irgendetwas behauptet wird.
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
  // NEU 17.10.2026 (Stefans Testkauf): Positionen mit Status "hoch" (41 bis
  // 80 Prozent über dem DMB-Richtwert) standen im Bericht als "Erhöht" und
  // flossen in die Kopfzahl "möglicherweise zu viel gezahlt" ein, fehlten
  // aber im Brief. Im Testkauf: Kopfzahl 456,87 €, im Brief nur 300,88 €,
  // Grundsteuer (+43 %) und Müllbeseitigung (+53 %) tauchten nicht auf.
  // Für einen förmlichen Einwand sind diese Abweichungen zu schwach (deshalb
  // nicht in der Liste oben), für eine Bitte um Belegeinsicht nach § 556 Abs. 4 BGB
  // reichen sie: Darauf hat der Mieter ohnehin Anspruch. Jetzt stehen sie
  // als eigene Gruppe im Brief, Bericht und Brief passen zusammen.
  const erhoehtePositionen = (result.posten_bewertung || [])
    .filter(p => p.status === "hoch")
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
  // Originalbelege. Auf deren Einsicht hat jeder Mieter nach § 556 Abs. 4 BGB
  // Anspruch, ohne einen Verdacht äußern zu müssen. Genau das ist hier der
  // Inhalt: eine sachliche, jederzeit berechtigte Aufforderung zur
  // Belegeinsicht — kein Vorwurf, keine Behauptung, kein leeres Blatt.
  const modus = hatBeanstandungen ? "einwendungen"
    : (offenePositionen.length > 0 || erhoehtePositionen.length > 0) ? "auskunft"
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
          12. August 2026". Eingabefehler, nicht im Formular verhindert;
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
          auskunft: "nach Prüfung der Betriebskostenabrechnung für den Zeitraum 01.01." + wohnung.jahr + " bis 31.12." + wohnung.jahr + " bitte ich Sie um Belegeinsicht nach § 556 Abs. 4 BGB sowie um Auskunft zu folgenden Positionen, deren vertragliche Grundlage sich aus der Abrechnung nicht ergibt:",
          belegeinsicht: "ich habe die Betriebskostenabrechnung für den Zeitraum 01.01." + wohnung.jahr + " bis 31.12." + wohnung.jahr + " geprüft. Die abgerechneten Beträge liegen im üblichen Rahmen; hierzu habe ich derzeit keine Einwendungen. Zur abschließenden Prüfung bitte ich Sie um Einsicht in die Belege nach § 556 Abs. 4 BGB.",
        }[modus]}
      </Text>
      {modus === "belegeinsicht" && (
        <Text style={s.absatz}>
          Aus der Abrechnung selbst ist nicht ersichtlich, ob die ausgewiesenen Kosten tatsächlich in dieser Höhe angefallen sind und ob der Umlageschlüssel korrekt angewendet wurde. Die Belegeinsicht dient allein dieser Nachvollziehbarkeit und ist nicht als Beanstandung zu verstehen.
        </Text>
      )}

      {/* Tabelle entfällt im Modus "belegeinsicht", dort gibt es keine
          Positionsliste, und eine leere Tabelle mit Rahmenlinie sähe nach
          einem Darstellungsfehler aus. */}
      <View style={zeigtListe ? s.table : { marginBottom: 4 }}>
        {gruendeHart.length > 0 && (
          <>
            {/* UMBENANNT 13.09.2026 (Task #104). Die Überschrift hieß
                "Eindeutig nicht umlagefähig". Solange hier nur Kabelanschluss
                und Verwaltungskosten standen, stimmte das. Seit die
                Heizkostenprüfung dazugekommen ist, stehen unter derselben
                Überschrift auch Punkte, bei denen die Kosten sehr wohl
                umlagefähig sind und nur falsch verteilt wurden oder ein
                gesetzliches Kürzungsrecht auslösen. Ein Vermieter, der oben
                "nicht umlagefähig" liest und darunter einen Verteilerschlüssel
                findet, hat sofort einen Einwand gegen das ganze Schreiben.
                Die neue Überschrift trägt alle drei Fälle. */}
            <Text style={s.gruppenTitel}>Rechtlich eindeutige Beanstandungen</Text>
            {gruendeHart.map((g, i) => (
              <View key={"h" + i} style={s.tRow}>
                <Text style={s.tLabel}>{i + 1}. {g.text}</Text>
              </View>
            ))}
          </>
        )}
        {gruendeStatistisch.length > 0 && (
          <>
            <Text style={s.gruppenTitel}>Auffällig im Vergleich zum DMB-Betriebskostenspiegel, bitte um Prüfung und Beleg</Text>
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
            Beanstandungen und bloßen Rückfragen, dort las sie sich, als
            summiere sie auch die Fragen mit, was sachlich falsch wäre. */}
        {/* BESCHRIFTUNG KORRIGIERT 11.09.2026 nach Stefans Echttest.
            Vorher stand hier "Summe der beanstandeten Positionen". Das war
            sachlich falsch und im Brief an den Vermieter besonders heikel.

            In Stefans Fall zeigte die Zeile 684,43 €. Die beanstandeten
            Positionen selbst summieren sich aber auf 1.584,79 €. Die 684,43 €
            sind der Betrag, um den diese Positionen ÜBER den DMB-Richtwerten
            liegen, nicht ihre Summe.

            Wer den Brief so abschickt, behauptet gegenüber dem Vermieter eine
            Zahl, die er auf Nachfrage nicht herleiten kann, weil sie weder
            der Summe der Positionen noch einer Forderung entspricht. Genau
            solche Angriffsflächen soll das Schreiben vermeiden. */}
        {/* ZWEITE KORREKTUR AM 11.09.2026, nach dem zweiten Echttest.
            Die Beschriftung stimmte jetzt, die ZAHL aber immer noch nicht.

            Der Brief führte nur die Versicherungen auf (300,88 € über dem
            Richtwert), die Summenzeile zeigte trotzdem 456,87 €. Die
            Differenz von 155,98 € stammte aus Grundsteuer und Müll, die in
            der Tabelle des Berichts als "Erhöht" stehen, aber die Schwelle
            für eine Beanstandung nicht erreichen und deshalb im Brief gar
            nicht vorkommen.

            result.moegliche_ersparnis summiert eben ALLE Überschreitungen,
            auch die nicht beanstandeten. Für den Bericht ist das richtig,
            für den Brief nicht: Dort darf nur stehen, was auch dasteht.
            Genau danach hätte der Vermieter gefragt, und der Mieter hätte
            die Zahl nicht erklären können.

            Deshalb wird die Summe jetzt aus den Gründen gebildet, die
            tatsächlich im Brief aufgeführt sind. Jeder Grund trägt dafür
            seinen eigenen Betrag (Feld "betrag", gesetzt in analyse.js).
            Fehlt er bei einem Grund, wird die Zeile ganz weggelassen, statt
            eine unvollständige Summe zu zeigen. */}
        {hatBeanstandungen && (() => {
          const gruende = [...gruendeHart, ...gruendeStatistisch];
          const alleMitBetrag = gruende.every(g => typeof g.betrag === "number" && g.betrag > 0);
          if (!alleMitBetrag) return null;
          const summe = gruende.reduce((a, g) => a + g.betrag, 0);
          return (
            <View style={s.tRowSum}>
              <Text style={s.tLabel}>Betrag oberhalb der DMB-Vergleichswerte</Text>
              <Text style={s.tValue}>{fmt(Math.round(summe * 100) / 100)}</Text>
            </View>
          );
        })()}
        {/* Positionen ohne offiziellen Vergleichswert, siehe Kommentar zu
            offenePositionen oben. Bewusst als Frage formuliert, nicht als
            Vorwurf: Wir wissen nicht, was im Mietvertrag steht. */}
        {erhoehtePositionen.length > 0 && (
          <>
            <Text style={s.gruppenTitel}>Über dem DMB-Durchschnitt, bitte um Belegeinsicht</Text>
            {erhoehtePositionen.map((p, i) => (
              <View key={"e" + i} style={s.tRow}>
                <Text style={s.tLabel}>
                  {gruendeHart.length + gruendeStatistisch.length + i + 1}. {p.posten} ({fmt(p.betrag)}) liegt {p.abweichung_prozent} % über dem Durchschnittswert des Deutschen Mieterbundes. Ich bitte um Vorlage der zugrunde liegenden Rechnungen und Bescheide.
                </Text>
              </View>
            ))}
          </>
        )}
        {offenePositionen.length > 0 && (
          <>
            <Text style={s.gruppenTitel}>Bitte um Angabe der vertraglichen Grundlage und um Belegeinsicht</Text>
            {offenePositionen.map((p, i) => (
              <View key={"o" + i} style={s.tRow}>
                <Text style={s.tLabel}>
                  {gruendeHart.length + gruendeStatistisch.length + erhoehtePositionen.length + i + 1}. {p.posten} ({fmt(p.betrag)}): Auf welcher vertraglichen Grundlage wurde diese Position umgelegt, und ist sie nach § 2 BetrKV umlagefähig?
                </Text>
              </View>
            ))}
          </>
        )}
      </View>

      {/* 12.08.2026, echter Bug: Hier stand vorher zusätzlich "...bis zum 30.
          September {fristJahr}" (fristJahr = Abrechnungsjahr + 2, feststehend
          "30. September"): eine grobe, längst durch die echte Fristprüfung
          in analyse.js (buildResult, Einwendungsfrist anhand erhaltenAm)
          ersetzte Näherung, die hier aber übersehen wurde und einen
          Widerspruch im selben Brief erzeugte: eine Zahlungsforderung erst
          in 13 Monaten, direkt gefolgt von der Bitte um Stellungnahme
          "innerhalb von 4 Wochen". Ersatzlos gestrichen: die 4-Wochen-Frist
          unten ist die einzige im Brief genannte Frist, wie von Stefan
          bestätigt (siehe CHANGELOG). */}
      {/* Schlussabsatz angepasst 09.09.2026: Ohne einzige Beanstandung darf
          hier keine Korrektur und keine Rückerstattung gefordert werden, 
          das wäre sachlich falsch und würde den Mieter angreifbar machen. */}
      {/* Belegeinsicht umgestellt 29.10.2026 (Freigabe Stefan): Seit 01.01.2025
          steht das Einsichtsrecht in § 556 Abs. 4 BGB (Viertes
          Bürokratieentlastungsgesetz, BGBl. 2024 I Nr. 323). Satz 2 erlaubt
          dem Vermieter, die Belege elektronisch bereitzustellen. Einen
          Anspruch auf "Übersendung der Originalbelege" gibt das Gesetz nicht
          her; der Brief bittet deshalb um Belegeinsicht "gern per E-Mail".
          Bewusst nicht länger als die alte Fassung: Ein längerer Satz schob
          im Probedruck ohne Heizkosten-Angaben die Grußformel allein auf
          eine neue Seite. Wortlaut geprüft auf gesetze-im-internet.de am
          29.10.2026. */}
      <Text style={s.absatz}>
        {{
          einwendungen: "Ich bitte um Belegeinsicht (§ 556 Abs. 4 BGB), gern per E-Mail, um nachvollziehbare Darlegung des Umlageschlüssels sowie um Korrektur der beanstandeten Positionen und Rückerstattung des zu viel gezahlten Betrags, soweit sich die Beanstandungen bestätigen.",
          auskunft: "Ich bitte um Belegeinsicht (§ 556 Abs. 4 BGB), gern per E-Mail, sowie um nachvollziehbare Darlegung des Umlageschlüssels für die oben genannten Positionen. Sollte sich daraus eine nicht umlagefähige Position ergeben, behalte ich mir vor, hierauf zurückzukommen.",
          belegeinsicht: "Bitte stellen Sie mir die Belege per E-Mail bereit oder nennen Sie mir einen Termin zur Einsicht. Ich bitte zusätzlich um nachvollziehbare Darlegung des angewendeten Umlageschlüssels. Sollten sich aus der Einsicht Beanstandungen ergeben, behalte ich mir vor, hierauf innerhalb der Frist des § 556 Abs. 3 BGB zurückzukommen.",
        }[modus]}
      </Text>
      {result.saldo > 0 && (
        <Text style={s.absatz}>Eine eventuelle Nachzahlung leiste ich ausdrücklich unter Vorbehalt.</Text>
      )}
      {/* Letzter Satz und Gruß bleiben zusammen (wrap={false}), damit eine
          zweite Briefseite nie nur aus Gruß und Name besteht. */}
      <View wrap={false}>
      <Text style={s.absatz}>Ich bitte um schriftliche Stellungnahme innerhalb von 4 Wochen.</Text>

      {/* wrap={false}: Gruß und Name bleiben zusammen (17.10.2026). Im
          Probedruck stand sonst der Name allein auf einer neuen Seite. Platz
          für die Unterschrift: eine Leerzeile statt zwei. */}
      <View style={s.gruss} wrap={false}>
        <Text>Mit freundlichen Grüßen</Text>
        <Text>{"\n"}{adressen.mieterName}</Text>
      </View>
      </View>

      <View style={s.footer} fixed>
        <Text>Unverbindliches Musterschreiben ohne Rechtsberatungscharakter (§ 2 RDG) · Deutscher Mieterbund: mieterbund.de · Tel. 030 223230</Text>
      </View>
    </Page>
  );
}
