// ─────────────────────────────────────────────────────────────────────────
// BrandAnschrift.jsx — kleines Logo + Markenname, für Impressum/Datenschutz.
// ─────────────────────────────────────────────────────────────────────────
import { THEME } from "../../config/theme.js";

export default function BrandAnschrift() {
  const C = THEME.color;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
      <div style={{ width: 34, height: 34, borderRadius: 8, background: C.brand, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="19" height="19" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <circle cx="9" cy="9" r="7" stroke="white" strokeWidth="2"/>
          <circle cx="9" cy="9" r="3.5" stroke="white" strokeWidth="1.5"/>
          <circle cx="9" cy="9" r="1" fill="white"/>
        </svg>
      </div>
      <div style={{ fontSize: 17, fontWeight: 700, color: C.text, fontFamily: THEME.font.heading }}>
        Nebenkosten<span style={{ color: C.brand }}>Radar</span>
      </div>
    </div>
  );
}
