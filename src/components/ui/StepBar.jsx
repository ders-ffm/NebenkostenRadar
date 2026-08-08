// ─────────────────────────────────────────────────────────────────────────
// StepBar.jsx — Fortschrittsanzeige für den mehrstufigen Prüf-Assistenten.
// ─────────────────────────────────────────────────────────────────────────
import { THEME } from "../../config/theme.js";
import { pct } from "../../lib/format.js";

export default function StepBar({ current, total, label }) {
  const C = THEME.color;
  return (
    <div style={{ padding: "0 20px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: C.textMuted }}>Schritt {current} / {total}</span>
        <span style={{ fontSize: 11, color: C.accent }}>{label}</span>
      </div>
      <div style={{ height: 4, background: C.border, borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 2, background: C.accent, width: pct(current, total) + "%", transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}
