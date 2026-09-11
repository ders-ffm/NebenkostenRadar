// ─────────────────────────────────────────────────────────────────────────
// NachladeFehler.jsx — Auffangnetz für nachgeladene Seiten.
//
// WARUM ES DAS GIBT (11.09.2026):
// Seit dem Verkleinern des Startbundles werden die Seiten Download und Konto
// per lazy() nachgeladen (siehe Kommentar in src/App.jsx). Das bringt einen
// neuen Fehlerfall mit sich, den es vorher nicht gab: Wenn der Nachladeversuch
// fehlschlägt — kurzer Netzwerkaussetzer, Tunnel, oder ein Deploy, der die
// alte Datei ersetzt hat, während die Seite noch offen war — wirft React einen
// Fehler und die gesamte Anwendung bleibt weiß.
//
// Das wäre ausgerechnet auf der Download-Seite passiert, also unmittelbar
// NACH der Bezahlung. Ein weißer Bildschirm an dieser Stelle ist der
// denkbar schlechteste Moment.
//
// Diese Komponente fängt den Fehler ab und zeigt stattdessen einen ruhigen
// Hinweis mit einem Knopf zum Neuladen. Wichtig ist die zweite Zeile: Der
// Bericht ist bereits erzeugt und wurde per E-Mail verschickt — der Kunde
// hat sein Produkt also auch dann, wenn diese Seite gerade klemmt. Ohne
// diesen Satz müsste er annehmen, sein Geld sei weg.
//
// Fehlergrenzen (Error Boundaries) müssen in React Klassenkomponenten sein;
// mit Hooks lässt sich componentDidCatch nicht abbilden. Das ist der einzige
// Grund für die Klassenschreibweise hier.
// ─────────────────────────────────────────────────────────────────────────
import { Component } from "react";
import { THEME } from "../../config/theme.js";

export default class NachladeFehler extends Component {
  constructor(props) {
    super(props);
    this.state = { fehler: false };
  }

  static getDerivedStateFromError() {
    return { fehler: true };
  }

  componentDidCatch(fehler) {
    // Bewusst nur auf die Konsole: Kein Fehler-Tracking-Dienst eingebunden,
    // und für einen solchen wäre eine eigene Rechtsgrundlage nötig.
    console.error("Nachladen einer Seite fehlgeschlagen:", fehler);
  }

  render() {
    if (!this.state.fehler) return this.props.children;

    const C = THEME.color;
    return (
      <div style={{ fontFamily: THEME.font.body, background: C.bg, minHeight: "100vh", padding: "64px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 460, margin: "0 auto" }}>
          <h1 style={{ fontFamily: THEME.font.heading, fontSize: 22, fontWeight: 600, color: C.text, margin: "0 0 12px" }}>
            Diese Seite konnte nicht geladen werden
          </h1>
          <p style={{ fontSize: 15, color: C.textMuted, lineHeight: 1.7, margin: "0 0 8px" }}>
            Wahrscheinlich war die Verbindung kurz unterbrochen. Ein Neuladen behebt das in aller Regel.
          </p>
          <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.7, margin: "0 0 24px" }}>
            Falls du bereits bezahlt hast: Deine Auswertung ist erstellt und wurde dir per E-Mail geschickt. Es ist nichts verloren gegangen.
          </p>
          <button onClick={() => window.location.reload()}
            style={{ background: C.accent, color: C.accentText, border: "none", borderRadius: THEME.radius.md, padding: "14px 32px", fontSize: 15, fontFamily: THEME.font.heading, fontWeight: 600, cursor: "pointer" }}>
            Seite neu laden
          </button>
          <p style={{ fontSize: 13, color: C.textDim, marginTop: 20 }}>
            Bleibt das Problem bestehen: <a href="mailto:support@nebenkostenradar.com" style={{ color: C.brand, fontWeight: 600 }}>support@nebenkostenradar.com</a>
          </p>
        </div>
      </div>
    );
  }
}
