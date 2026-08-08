// ─────────────────────────────────────────────────────────────────────────
// Nav.jsx — Kopfzeile mit Logo, Navigation und Hamburger-Menü (mobil).
// Farben/Fonts aus theme.js, Interaktionslogik unverändert aus der
// vorherigen Version übernommen (isMobile/mobileOpen + Resize-Listener).
// ─────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { THEME } from "../../config/theme.js";

export default function Nav({ activeStep, navigateTo }) {
  const C = THEME.color;
  const [isMobile, setIsMobile] = useState(() => (typeof window !== "undefined" ? window.innerWidth < THEME.layout.mobileBreakpoint : false));
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < THEME.layout.mobileBreakpoint);
      if (window.innerWidth >= THEME.layout.mobileBreakpoint) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const items = [
    { label: "Prüfen", target: "wohnung" },
    { label: "Ratgeber", target: "ratgeber" },
    { label: "Über uns", target: "ueberuns" },
  ];

  const logo = (
    <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => { setMobileOpen(false); navigateTo("welcome"); }}>
      <div style={{ width: 42, height: 42, borderRadius: 10, background: C.brand, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="24" height="24" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="7" stroke="white" strokeWidth="2"/>
          <circle cx="9" cy="9" r="3.5" stroke="white" strokeWidth="1.5"/>
          <circle cx="9" cy="9" r="1" fill="white"/>
        </svg>
      </div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 700, color: C.text, fontFamily: THEME.font.heading, lineHeight: 1.1 }}>
          Nebenkosten<span style={{ color: C.brand }}>Radar</span>
        </div>
        <div style={{ fontSize: 10, color: C.textMuted, fontWeight: 500 }}>Unabhängige Abrechnungsprüfung</div>
      </div>
    </div>
  );

  const ctaButton = (onClickExtra) => (
    <button
      onClick={() => { onClickExtra && onClickExtra(); navigateTo("wohnung"); }}
      style={{ background: C.accent, border: "none", borderRadius: THEME.radius.sm, padding: "10px 18px", fontSize: 13, fontFamily: THEME.font.heading, fontWeight: 600, color: C.accentText, cursor: "pointer" }}>
      Kostenlos prüfen
    </button>
  );

  if (isMobile) {
    return (
      <div style={{ borderBottom: "1px solid " + C.border, padding: "0 16px", background: C.surface, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          {logo}
          <button onClick={() => setMobileOpen(o => !o)} aria-label="Menü öffnen" aria-expanded={mobileOpen}
            style={{ background: "none", border: "1px solid " + C.border, borderRadius: THEME.radius.sm, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span style={{ width: 18, height: 2, background: C.text, borderRadius: 1, transform: mobileOpen ? "translateY(6px) rotate(45deg)" : "none", transition: "transform 0.2s" }} />
              <span style={{ width: 18, height: 2, background: C.text, borderRadius: 1, opacity: mobileOpen ? 0 : 1, transition: "opacity 0.2s" }} />
              <span style={{ width: 18, height: 2, background: C.text, borderRadius: 1, transform: mobileOpen ? "translateY(-6px) rotate(-45deg)" : "none", transition: "transform 0.2s" }} />
            </div>
          </button>
        </div>
        {mobileOpen && (
          <div style={{ borderTop: "1px solid " + C.border, padding: "10px 0 16px", display: "flex", flexDirection: "column", gap: 2 }}>
            {items.map(item => (
              <button key={item.label}
                onClick={() => { setMobileOpen(false); navigateTo(item.target); }}
                style={{ background: "none", border: "none", textAlign: "left", padding: "12px 6px", fontSize: 15, fontFamily: THEME.font.body, color: activeStep === item.target ? C.brand : C.text, fontWeight: activeStep === item.target ? 600 : 400, cursor: "pointer" }}>
                {item.label}
              </button>
            ))}
            <div style={{ marginTop: 8 }}>{ctaButton(() => setMobileOpen(false))}</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ borderBottom: "1px solid " + C.border, padding: "0 20px", background: C.surface, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
      <div style={{ maxWidth: THEME.layout.pageMax, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 72 }}>
        {logo}
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {items.map(item => (
            <button key={item.label}
              onClick={() => navigateTo(item.target)}
              style={{ background: "none", border: "none", padding: "6px 10px", fontSize: 13, fontFamily: THEME.font.body, color: activeStep === item.target ? C.brand : C.textMuted, fontWeight: activeStep === item.target ? 600 : 400, cursor: "pointer", borderRadius: 6 }}>
              {item.label}
            </button>
          ))}
          <div style={{ marginLeft: 6 }}>{ctaButton()}</div>
        </div>
      </div>
    </div>
  );
}
