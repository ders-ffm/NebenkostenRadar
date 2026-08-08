// ─────────────────────────────────────────────────────────────────────────
// Field.jsx — generisches Textfeld mit Label, Tipp und Fehleranzeige.
//
// Layout 08/2026 (nach Vorbild Taxfix u.ä.): Label oben, darunter der Tipp
// als eigene volle Zeile, dann das Feld, dann bei Bedarf die Fehlermeldung
// als eigene volle Zeile UNTER dem Feld. Vorherige Version stellte Tipp und
// Label in einer Flex-Zeile nebeneinander (mit maxWidth:160 rechtsbündig für
// den Tipp) — auf schmalen Viewports lief das ohne Zeilenumbruch aus dem
// Rahmen (Text rechts abgeschnitten), auf breiten Viewports quetschte es
// lange Tipptexte in eine schmale, hohe Spalte. Echter Layout-Bug, kein
// Stilproblem — durch reines Untereinander-Stapeln behoben.
//
// `width="short"|"medium"` begrenzt die Feldbreite moderat (statt winzig),
// `money` schaltet auf deutsche Tausenderpunkt-Anzeige um (z.B. "1.200,00"),
// ohne die zugrunde liegende Eingabe zu verändern — beim Fokussieren wird
// der Rohwert zum Weiterbearbeiten gezeigt, beim Verlassen des Feldes
// formatiert dargestellt. Rechenlogik bleibt unverändert, da toNum() beide
// Schreibweisen ("1200,50"/"1.200,50") schon immer korrekt verarbeitet hat.
// ─────────────────────────────────────────────────────────────────────────
import { useState } from "react";
import { THEME } from "../../config/theme.js";
import { toNum, fmtInput } from "../../lib/format.js";

export default function Field({ label, value, onChange, type = "text", placeholder, error, tip, required, prefix, suffix, autoFocus, onPaste, onDrop, width, money }) {
  const C = THEME.color;
  const [focused, setFocused] = useState(false);
  // Moderat begrenzt statt winzig — großzügige, gut lesbare Felder wie im
  // Vorbild, aber mit erkennbar begrenzter Erwartung bei kurzen Werten.
  const maxWidth = width === "short" ? 220 : width === "medium" ? 320 : undefined;

  const displayValue = money
    ? (focused ? (value || "") : (toNum(value) > 0 ? fmtInput(toNum(value)) : ""))
    : (value || "");

  function handleChange(e) {
    let v = e.target.value;
    if (money) v = v.replace(/[^0-9.,]/g, "");
    onChange(v);
  }

  return (
    <div style={{ marginBottom: 18, maxWidth, width: maxWidth ? "100%" : undefined }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: error ? "#c0392b" : C.text, fontFamily: THEME.font.body, marginBottom: tip ? 3 : 6 }}>
        {label}{required && <span style={{ color: C.accent, marginLeft: 3 }}>*</span>}
      </label>
      {tip && !error && <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.4, marginBottom: 6 }}>{tip}</div>}
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
      {error && <div style={{ fontSize: 12, color: "#c0392b", marginTop: 5, lineHeight: 1.4 }}>⚠ {error}</div>}
    </div>
  );
}
