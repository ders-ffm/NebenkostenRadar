// ─────────────────────────────────────────────────────────────────────────
// Btn.jsx — generischer Button-Baustein. Farbe kommt ausschließlich aus
// theme.js. "primary" = Terrakotta-Akzent, nur für die eine Haupt-Handlung
// pro Ansicht verwenden (siehe Rollen-Prinzip in theme.js).
// ─────────────────────────────────────────────────────────────────────────
import { THEME } from "../../config/theme.js";

export default function Btn({ onClick, children, variant = "primary", disabled = false, style = {} }) {
  const C = THEME.color;
  const map = {
    primary:  { bg: C.accent, color: C.accentText, border: "none" },
    brand:    { bg: C.brand,  color: "#ffffff",     border: "none" },
    dark:     { bg: C.text,   color: "#ffffff",     border: "none" },
    outline:  { bg: "transparent", color: C.textMuted, border: "1px solid " + C.border },
  };
  const s = map[variant] || map.primary;
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        width: "100%",
        background: disabled ? C.border : s.bg,
        color: disabled ? C.textDim : s.color,
        border: s.border,
        borderRadius: THEME.radius.lg,
        padding: "16px",
        fontSize: 15,
        fontFamily: THEME.font.heading,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "opacity 0.15s",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
