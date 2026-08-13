// ─────────────────────────────────────────────────────────────────────────
// AGB.jsx — URL: "/agb". Angepasst an 2-Stufen-Preismodell und PDF-Auslieferung.
// ─────────────────────────────────────────────────────────────────────────
import { THEME } from "../config/theme.js";
import { BUSINESS } from "../config/business.js";

export default function AGB({ navigateTo }) {
  const C = THEME.color;
  const ABSCHNITTE = [
    { t: "§ 1 Geltungsbereich", lines: [
      "Diese AGB gelten für alle Käufe digitaler Inhalte über nebenkostenradar.com.",
      "Anbieter: NebenkostenRadar (nebenkostenradar.com), Inhaber: Stefan Hennig, Ludwigstr. 33-37, 60327 Frankfurt am Main, support@nebenkostenradar.com",
    ]},
    { t: "§ 2 Vertragsgegenstand", lines: [
      "Gegenstand ist die einmalige Erstellung und Zusendung eines digitalen PDF-Prüfberichts zur Nebenkostenabrechnung, in zwei Ausführungen:",
      "Auswertung (" + BUSINESS.PREIS_AUSWERTUNG.toFixed(2) + " €): 1-seitiges PDF mit vollständiger Positionsübersicht, Richtwerten und Begründungen.",
      "Auswertung + Brief (" + BUSINESS.PREIS_VOLL.toFixed(2) + " €): zusätzlich ein 2. PDF-Seite mit versandfertigem Musterbrief an den Vermieter.",
      "Zur Erleichterung der Eingabe kann optional ein Foto- oder PDF-Upload genutzt werden, der Kostenpositionen automatisiert vorausfüllt. Die vollständige manuelle Eingabe steht davon unabhängig immer zur Verfügung und ist nicht Voraussetzung für den Kauf.",
    ]},
    { t: "§ 3 Vertragsschluss und Vertragsspeicherung", lines: [
      "Der Vertrag kommt mit Abschluss der Zahlung über Stripe zustande.",
      "Mit Klick auf 'Jetzt kaufen' und Abschluss der Zahlung erklärt der Käufer sein verbindliches Angebot.",
      "Vertragssprache: Deutsch.",
    ]},
    { t: "§ 4 Preise und Zahlung", lines: [
      "Die Preise betragen " + BUSINESS.PREIS_AUSWERTUNG.toFixed(2) + " € bzw. " + BUSINESS.PREIS_VOLL.toFixed(2) + " €. Stefan Hennig ist Kleinunternehmer gemäß § 19 UStG; es wird keine Umsatzsteuer ausgewiesen.",
      "Zahlung über Stripe Payments Europe, Ltd. Einmalzahlung — kein Abo, keine Folgekosten.",
      "Nach jeder Zahlung erhältst du automatisch einen Zahlungsbeleg per E-Mail. Auf Anfrage stellen wir gerne eine Rechnung aus: support@nebenkostenradar.com",
    ]},
    { t: "§ 5 Lieferung und Zugang", lines: [
      "Das PDF wird nach erfolgreicher Zahlung automatisch zum Download bereitgestellt und zusätzlich per E-Mail zugesandt.",
      "Es handelt sich um einen einmaligen Kauf — kein Abonnement, kein Dauerschuldverhältnis.",
    ]},
    { t: "§ 6 Widerrufsrecht", lines: [
      "Verbrauchern steht grundsätzlich ein gesetzliches Widerrufsrecht zu: Du hast das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsschlusses.",
      "Um dein Widerrufsrecht auszuüben, musst du uns (NebenkostenRadar, Stefan Hennig, Ludwigstr. 33-37, 60327 Frankfurt am Main, support@nebenkostenradar.com) mittels einer eindeutigen Erklärung (z. B. per E-Mail) über deinen Entschluss, diesen Vertrag zu widerrufen, informieren. Du kannst dafür das Muster-Widerrufsformular in § 6a verwenden, musst dies aber nicht. Zur Wahrung der Widerrufsfrist reicht es aus, dass du die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absendest.",
      "Folgen des Widerrufs: Im Falle eines wirksamen Widerrufs erstatten wir dir alle bereits erhaltenen Zahlungen unverzüglich, spätestens binnen 14 Tagen ab dem Tag, an dem deine Widerrufserklärung bei uns eingegangen ist. Für die Rückzahlung verwenden wir dasselbe Zahlungsmittel, das du bei der ursprünglichen Zahlung genutzt hast, sofern nicht ausdrücklich etwas anderes vereinbart wurde; es werden dir dafür keine zusätzlichen Entgelte berechnet.",
      "Vorzeitiges Erlöschen bei digitalen Inhalten (§ 356 Abs. 5 BGB): Da der Prüfbericht ein digitaler Inhalt ist, der nicht auf einem körperlichen Datenträger geliefert wird, erlischt dein Widerrufsrecht vorzeitig, sobald wir mit der Erstellung und Bereitstellung des PDFs begonnen haben — vorausgesetzt, du hast zuvor ausdrücklich zugestimmt, dass wir vor Ablauf der Widerrufsfrist mit der Ausführung beginnen, und gleichzeitig zur Kenntnis genommen, dass du dadurch dein Widerrufsrecht verlierst, sobald wir mit der Ausführung begonnen haben.",
      "Diese Zustimmung und Kenntnisnahme erteilst du im Bestellprozess durch Aktivierung der entsprechenden Checkbox vor Kaufabschluss. Ohne Aktivierung ist ein Kauf nicht möglich.",
    ]},
    { t: "§ 7 Haftungsausschluss", lines: [
      "Der Prüfbericht ersetzt keine Rechtsberatung im Sinne des RDG. Eine Haftung für rechtliche Richtigkeit oder Vollständigkeit der Analyseergebnisse wird ausgeschlossen.",
      "Für rechtssichere Prüfung empfehlen wir den Deutschen Mieterbund oder einen Rechtsanwalt.",
      "Die optionale automatische Foto-/PDF-Erkennung ist eine Ausfüllhilfe und ersetzt nicht die eigene Prüfung der Angaben durch den Käufer. Erkannte Werte werden vor dem Kauf im Formular angezeigt und müssen vom Käufer bestätigt bzw. korrigiert werden; für Fehler oder Auslassungen der automatischen Erkennung selbst wird keine Haftung übernommen.",
    ]},
    { t: "§ 8 Schlussbestimmungen", lines: [
      "Es gilt deutsches Recht. Gerichtsstand ist Frankfurt am Main, sofern gesetzlich zulässig.",
      "Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen unberührt.",
    ]},
  ];

  return (
    <div style={{ fontFamily: THEME.font.body, background: C.bg, color: C.text, minHeight: "100vh" }}>
      <div style={{ background: C.surface, padding: "20px 20px 16px", borderBottom: "1px solid " + C.border }}>
        <button onClick={() => navigateTo("welcome")} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 13, padding: "0 0 10px", fontFamily: THEME.font.body }}>← Zurück</button>
        <h2 style={{ margin: 0, fontSize: 19, fontWeight: 600, fontFamily: THEME.font.heading }}>Allgemeine Geschäftsbedingungen</h2>
      </div>
      <div style={{ padding: "24px 20px 60px", maxWidth: 720, margin: "0 auto" }}>
        {ABSCHNITTE.map((s, i) => (
          <div key={i} style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.accent, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.t}</div>
            {s.lines.map((line, j) => <div key={j} style={{ fontSize: 14, color: C.text, lineHeight: 1.85, marginBottom: 8 }}>{line}</div>)}
          </div>
        ))}
        <div style={{ fontSize: 11, color: C.textDim, marginTop: 16 }}>Stand: {new Date().toLocaleDateString("de-DE")} · Stefan Hennig, Frankfurt am Main</div>
      </div>
    </div>
  );
}
