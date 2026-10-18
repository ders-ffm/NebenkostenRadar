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
        <span style={{ fontSize: 14, color: C.textMuted }}>Schritt <strong style={{ color: C.text }}>{current}</strong> von {total}</span>
        <span style={{ fontSize: 14, color: C.brandStrong, fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ height: 6, background: C.border, borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", borderRadius: 99, background: C.brand, width: pct(current, total) + "%", transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}
