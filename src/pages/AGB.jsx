// ─────────────────────────────────────────────────────────────────────────
// AGB.jsx — URL: "/agb". Angepasst an 2-Stufen-Preismodell und PDF-Auslieferung.
// 17.10.2026: Text ausgelagert nach src/config/vertrag.js (wird auch für die
// Vertragsbestätigungs-Mail nach dem Kauf gebraucht, § 312f BGB).
// ─────────────────────────────────────────────────────────────────────────
import { THEME } from "../config/theme.js";
// Fußzeile auch auf den Rechtsseiten (17.10.2026): Dort steht der Link
// "Cookie-Einstellungen" zum Widerruf der Einwilligung (Art. 7 Abs. 3 DSGVO).
import LegalFooter from "../components/layout/LegalFooter.jsx";
import { agbAbschnitte, AGB_STAND } from "../config/vertrag.js";

export default function AGB({ navigateTo }) {
  const C = THEME.color;
  // Inhalt seit 17.10.2026 aus src/config/vertrag.js (eine Quelle für
  // Webseite UND Vertragsbestätigungs-Mail, siehe dort).
  const ABSCHNITTE = agbAbschnitte();

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
        <div style={{ fontSize: 11, color: C.textDim, marginTop: 16 }}>{/* Festes Datum (17.10.2026): Vorher stand hier immer das heutige Datum,
            dadurch war nie erkennbar, welche Fassung ein Kunde akzeptiert hat.
            Bei jeder inhaltlichen Änderung der AGB hier mit anpassen. */}
        Stand: {AGB_STAND} · Stefan Hennig, Frankfurt am Main</div>
      </div>
      <LegalFooter navigateTo={navigateTo} />
    </div>
  );
}
