// ─────────────────────────────────────────────────────────────────────────
// UeberUns.jsx — URL: "/ueber-uns"
// ─────────────────────────────────────────────────────────────────────────
import { THEME } from "../config/theme.js";
import { BUSINESS } from "../config/business.js";
import Nav from "../components/layout/Nav.jsx";
import LegalFooter from "../components/layout/LegalFooter.jsx";
import BrandAnschrift from "../components/layout/BrandAnschrift.jsx";

export default function UeberUns({ navigateTo }) {
  const C = THEME.color;
  const PAGE_MAX = THEME.layout.pageMax;
  const ABSCHNITTE = [
    { titel: "Unser Ansatz", text: "Wir kombinieren systematische Regelprüfung nach BetrKV, HeizkostenV und CO₂KostAufG mit dem aktuellen DMB-Betriebskostenspiegel. Jeder Posten wird automatisch auf Zulässigkeit und Plausibilität geprüft — regelbasiert, nicht durch KI-Rätselraten. Das Ergebnis ist nachvollziehbar, mit konkreten Rechtsgrundlagen belegt." },
    { titel: "Unabhängigkeit", text: "NebenkostenRadar hat keine Verbindungen zu Vermietern, Hausverwaltungen oder Immobiliengesellschaften. Wir arbeiten ausschließlich im Interesse der Mieter. Unsere Prüfergebnisse sind nicht käuflich." },
    { titel: "Aktualität", text: "Gesetzliche Änderungen — wie das Ende des Kabelanschluss-Nebenkostenprivilegs im Juli 2024 — fließen unmittelbar in unsere Prüflogik ein. Richtwerte werden regelmäßig mit dem DMB-Betriebskostenspiegel abgeglichen." },
    { titel: "Transparenz bei den Kosten", text: "Die Basisanalyse ist kostenlos und ohne Registrierung verfügbar. Die vollständige Auswertung als PDF kostet einmalig " + BUSINESS.PREIS_AUSWERTUNG.toFixed(2) + " €, mit Musterbrief " + BUSINESS.PREIS_VOLL.toFixed(2) + " € — ohne Abo, ohne versteckte Folgekosten." },
  ];

  return (
    <div style={{ fontFamily: THEME.font.body, background: C.bg, color: C.text, minHeight: "100vh" }}>
      <Nav activeStep="ueberuns" navigateTo={navigateTo} />
      <div style={{ maxWidth: PAGE_MAX, margin: "0 auto", padding: "32px 20px 60px" }}>
        <button onClick={() => navigateTo("welcome")} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 13, padding: "0 0 20px" }}>← Startseite</button>
        <h1 style={{ fontFamily: THEME.font.heading, fontSize: 24, fontWeight: 600, margin: "0 0 16px" }}>Über NebenkostenRadar</h1>
        <p style={{ fontSize: 15, color: C.textMuted, lineHeight: 1.75, margin: "0 0 28px" }}>
          NebenkostenRadar ist ein unabhängiger digitaler Prüfdienst für Nebenkostenabrechnungen. Wir helfen Mietern in Deutschland, ihre Betriebskostenabrechnungen auf Fehler, überhöhte Posten und nicht umlagefähige Kosten zu überprüfen — schnell, transparent und ohne juristische Vorkenntnisse.
        </p>
        {ABSCHNITTE.map((s, i) => (
          <div key={i} style={{ marginBottom: 24, paddingBottom: 24, borderBottom: i < ABSCHNITTE.length - 1 ? "1px solid " + C.border : "none" }}>
            <h2 style={{ fontFamily: THEME.font.heading, fontSize: 17, fontWeight: 600, color: C.text, margin: "0 0 10px" }}>{s.titel}</h2>
            <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.75, margin: 0 }}>{s.text}</p>
          </div>
        ))}
        <div style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: THEME.radius.md, padding: "18px 20px", marginTop: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10 }}>Kontakt</div>
          <BrandAnschrift />
          <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 2 }}>
            <div>Inhaber: Stefan Hennig</div>
            <div>Ludwigstr. 33-37, 60327 Frankfurt am Main</div>
            <div>support@nebenkostenradar.com</div>
          </div>
        </div>
      </div>
      <LegalFooter navigateTo={navigateTo} />
    </div>
  );
}
