// ─────────────────────────────────────────────────────────────────────────
// Danke.jsx — einfache Dank-Seite. URL: "/danke"
// Wird nur angezeigt, falls der Stripe-Erfolgslink ohne Session-Parameter
// konfiguriert ist. Die eigentliche PDF-Auslieferung läuft über Download.jsx
// ("/pruefen/download?session=..."), das ist die empfohlene Stripe-Konfiguration.
// ─────────────────────────────────────────────────────────────────────────
import { THEME } from "../config/theme.js";
import Btn from "../components/ui/Btn.jsx";

export default function Danke({ navigateTo }) {
  const C = THEME.color;
  return (
    <div style={{ fontFamily: THEME.font.body, background: C.bg, color: C.text, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ maxWidth: 480, width: "100%", textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: C.brandBg, border: "2px solid " + C.brand, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 24px" }}>✓</div>
        <h1 style={{ fontFamily: THEME.font.heading, fontSize: 22, fontWeight: 600, margin: "0 0 12px" }}>Vielen Dank für deine Bestellung!</h1>
        <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.7, margin: "0 0 24px" }}>
          Dein Prüfbericht als PDF wurde an deine E-Mail-Adresse gesendet.<br />
          Bitte prüfe auch deinen Spam-Ordner.
        </p>
        <div style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: THEME.radius.md, padding: "16px 20px", marginBottom: 24, fontSize: 13, color: C.textMuted, lineHeight: 1.6 }}>
          Du kannst das PDF direkt ausdrucken und den Musterbrief (falls gebucht) per Einschreiben an deinen Vermieter senden.
        </div>
        <Btn onClick={() => navigateTo("welcome")}>Neue Prüfung starten</Btn>
      </div>
    </div>
  );
}
