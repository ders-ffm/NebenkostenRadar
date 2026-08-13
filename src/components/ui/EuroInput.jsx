// ─────────────────────────────────────────────────────────────────────────
// EuroInput.jsx — kompaktes Eingabefeld für einen einzelnen Kostenposten.
//
// Erweitert 08/2026: Tausenderpunkt-Anzeige (wie Field.jsx, "money"-Modus).
// KORREKTUR 13.08.2026: Zwischenzeitlich gab es hier je Posten einen grauen
// Beispielbetrag als Placeholder (z. B. "890,00" bei Heizkosten). Wieder
// entfernt — Stefans Einschätzung: Auch als reiner Placeholder (kein echter
// Wert im `value`, wird beim Absenden nicht mitgeschickt) sieht eine
// konkrete Zahl im Feld wie eine Vorgabe aus und kann Kunden in die Irre
// führen. Placeholder ist jetzt einheitlich "0,00", siehe lib/analyse.js
// für die Begründung.
// ─────────────────────────────────────────────────────────────────────────
import { useState } from "react";
import { THEME } from "../../config/theme.js";
import { toNum, fmtInput } from "../../lib/format.js";

export default function EuroInput({ label, value, onChange, tip, pflicht, warn }) {
  const C = THEME.color;
  const [focused, setFocused] = useState(false);
  const numVal = toNum(value);
  const filled = numVal > 0;
  const displayValue = focused ? (value || "") : (filled ? fmtInput(numVal) : "");

  function handleChange(e) {
    onChange(e.target.value.replace(/[^0-9.,]/g, ""));
  }

  return (
    <div style={{
      display: "flex", alignItems: "flex-start", justifyContent: "space-between",
      padding: "10px 12px", marginBottom: 6,
      background: warn ? "#fdf0ee" : filled ? C.brandBg : C.bg,
      border: "1.5px solid " + (warn ? "#c0392b" : focused ? C.brand : filled ? C.brand + "66" : C.border),
      borderRadius: THEME.radius.md,
    }}>
      <div style={{ flex: 1, minWidth: 0, marginRight: 10, paddingTop: 2 }}>
        <div style={{ fontSize: 13, color: filled ? C.text : C.textMuted, fontWeight: filled ? 500 : 400, fontFamily: THEME.font.body }}>
          {label}
          {pflicht && <span style={{ color: C.accent, marginLeft: 4, fontSize: 10 }}>✦ Pflicht</span>}
          {warn && <span style={{ color: "#c0392b", marginLeft: 6, fontSize: 10, fontWeight: 600 }}>⚠ nicht umlagefähig seit 07/2024!</span>}
        </div>
        {tip && <div style={{ fontSize: 10, color: C.textDim, marginTop: 3, lineHeight: 1.4 }}>{tip}</div>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0, paddingTop: 2 }}>
        <span style={{ fontSize: 12, color: C.textMuted }}>€</span>
        <input
          type="text" inputMode="decimal" placeholder="0,00" value={displayValue}
          onChange={handleChange}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{
            width: 108, background: C.surface, border: "1px solid " + (focused ? C.brand : C.border),
            borderRadius: 7, padding: "7px 8px", fontSize: 14, fontFamily: THEME.font.body,
            color: C.text, textAlign: "right", outline: "none",
          }}
        />
      </div>
    </div>
  );
}
