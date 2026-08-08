// ─────────────────────────────────────────────────────────────────────────
// Field.jsx — generisches Textfeld mit Label, Tipp und Fehleranzeige.
//
// Erweitert 08/2026:
//   - `width="short"|"medium"` begrenzt die Feldbreite (statt immer 100%),
//     damit kurze Werte (Jahr, Fläche) nicht wie ein Freitextfeld wirken.
//   - `money` schaltet auf deutsche Tausenderpunkt-Anzeige um (z.B.
//     "1.200,00"), ohne die zugrunde liegende Eingabe zu verändern — beim
//     Fokussieren wird der Rohwert zum Weiterbearbeiten gezeigt, beim
//     Verlassen des Feldes formatiert dargestellt. Rechenlogik bleibt
//     unverändert, da toNum() beide Schreibweisen ("1200,50"/"1.200,50")
//     schon immer korrekt verarbeitet hat.
// ─────────────────────────────────────────────────────────────────────────
import { useState } from "react";
import { THEME } from "../../config/theme.js";
import { toNum, fmtInput } from "../../lib/format.js";

export default function Field({ label, value, onChange, type = "text", placeholder, error, tip, required, prefix, suffix, autoFocus, onPaste, onDrop, width, money }) {
  const C = THEME.color;
  const [focused, setFocused] = useState(false);
  const maxWidth = width === "short" ? 130 : width === "medium" ? 220 : undefined;

  const displayValue = money
    ? (focused ? (value || "") : (toNum(value) > 0 ? fmtInput(toNum(value)) : ""))
    : (value || "");

  function handleChange(e) {
    let v = e.target.value;
    if (money) v = v.replace(/[^0-9.,]/g, "");
    onChange(v);
  }

  return (
    <div style={{ marginBottom: 14, maxWidth }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
        <label style={{ fontSize: 12, color: error ? "#c0392b" : C.textMuted, fontFamily: THEME.font.body }}>
          {label}{required && <span style={{ color: C.accent, marginLeft: 3 }}>*</span>}
        </label>
        {tip && !error && <span style={{ fontSize: 10, color: C.textDim, maxWidth: 160, textAlign: "right" }}>{tip}</span>}
        {error && <span style={{ fontSize: 10, color: "#c0392b" }}>⚠ {error}</span>}
      </div>
      <div style={{ position: "relative" }}>
        {prefix && <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: C.textMuted, pointerEvents: "none" }}>{prefix}</span>}
        <input
          type={money ? "text" : type} inputMode={money ? "decimal" : undefined}
          placeholder={placeholder} value={displayValue} autoFocus={autoFocus}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onPaste={onPaste}
          onDrop={onDrop}
          style={{
            width: "100%", boxSizing: "border-box",
            background: error ? "#fdf0ee" : C.surface,
            border: "1.5px solid " + (error ? "#c0392b" : C.border),
            borderRadius: THEME.radius.md,
            padding: "12px " + (suffix ? "36px" : "14px") + " 12px " + (prefix ? "28px" : "14px"),
            fontSize: 15, fontFamily: THEME.font.body, color: C.text, outline: "none",
          }}
        />
        {suffix && <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: C.textMuted, pointerEvents: "none" }}>{suffix}</span>}
      </div>
    </div>
  );
}
