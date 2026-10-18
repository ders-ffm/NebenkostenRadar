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
import Icon from "./Icon.jsx";

export default function Field({ label, value, onChange, type = "text", placeholder, error, tip, required, prefix, suffix, autoFocus, onPaste, onDrop, width, money, maxLength }) {
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
    // 18.10.2026: maxWidth nur noch am Eingabefeld, nicht mehr am ganzen
    // Block. Sonst brach die Beschriftung bei schmalen Feldern unnötig um
    // ("Wohnfläche laut / Mietvertrag").
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: "block", fontSize: 16, fontWeight: 600, color: error ? "#B03A2E" : C.text, fontFamily: THEME.font.body, marginBottom: tip ? 3 : 6 }}>
        {label}{required && <span style={{ color: C.critical, marginLeft: 3 }}>*</span>}
      </label>
      {tip && !error && <div style={{ fontSize: 14, color: C.textDim, lineHeight: 1.4, marginBottom: 6 }}>{tip}</div>}
      <div style={{ position: "relative", maxWidth }}>
        {prefix && <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: C.textMuted, pointerEvents: "none" }}>{prefix}</span>}
        <input
          type={money ? "text" : type} inputMode={money ? "decimal" : undefined}
          placeholder={placeholder} value={displayValue} autoFocus={autoFocus} maxLength={maxLength}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onPaste={onPaste}
          onDrop={onDrop}
          style={{
            width: "100%", boxSizing: "border-box",
            background: error ? "#FBEAE7" : C.surface,
            border: "1.5px solid " + (error ? "#B03A2E" : focused ? C.brand : C.inputBorder),
            boxShadow: focused && !error ? "0 0 0 3px " + C.brandBg : "none",
            borderRadius: THEME.radius.md,
            padding: "13px " + (suffix ? "40px" : "16px") + " 13px " + (prefix ? "32px" : "16px"),
            fontSize: 17, fontFamily: THEME.font.body, color: C.text, outline: "none",
          }}
        />
        {suffix && <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: C.textMuted, pointerEvents: "none" }}>{suffix}</span>}
      </div>
      {error && <div style={{ fontSize: 14, color: "#B03A2E", marginTop: 6, lineHeight: 1.4, display: "flex", gap: 6, alignItems: "flex-start" }}><Icon name="circle-alert" size={16} style={{ marginTop: 1 }} /><span>{error}</span></div>}
    </div>
  );
}
