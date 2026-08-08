// ─────────────────────────────────────────────────────────────────────────
// LegalFooter.jsx — Fußzeile mit Links zu Impressum/AGB/Datenschutz.
// navigateTo kommt von App.jsx und setzt jetzt eine ECHTE URL (siehe dort),
// nicht mehr nur den internen State.
// ─────────────────────────────────────────────────────────────────────────
import { THEME } from "../../config/theme.js";

export default function LegalFooter({ navigateTo }) {
  const C = THEME.color;
  const items = [["Impressum", "impressum"], ["AGB", "agb"], ["Datenschutz", "datenschutz"]];
  return (
    <div style={{ borderTop: "1px solid " + C.border, padding: "14px 20px", display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
      {items.map(([label, target]) => (
        <button key={target} onClick={() => navigateTo(target)}
          style={{ background: "none", border: "none", color: C.textDim, fontSize: 12, fontFamily: THEME.font.body, cursor: "pointer", textDecoration: "underline" }}>
          {label}
        </button>
      ))}
    </div>
  );
}
