// ─────────────────────────────────────────────────────────────────────────
// Nav.jsx — Kopfzeile mit Logo, Navigation und Hamburger-Menü (mobil).
// Farben/Fonts aus theme.js.
//
// UMBAU 17.10.2026 (Stefans Vorgabe): "Startseite übersichtlicher, weniger
// überladen — Infos lieber ins Menü als Unterrubrik ziehen, statt den
// Kunden zu überfordern." Das Menü hat deshalb jetzt Untermenüs:
//   Prüfen   → Nebenkostenabrechnung prüfen, Fristenrechner, Kürzungs-Check
//   Ratgeber → Alle Artikel + die meistgesuchten Themen
//   FAQ, Über uns
// Desktop: Aufklappen per Klick oder Maus. Mobil: Gruppen untereinander mit
// Zwischenüberschrift, kein zweites Aufklappen nötig.
//
// SEO: Alle Untermenü-Links stehen immer im DOM (nur optisch eingeklappt,
// echtes <a href>). Das ist bei Menüs üblich und kein "versteckter Text":
// Der Nutzer sieht dieselben Links beim Aufklappen. Google findet darüber
// die Werkzeug-Seiten und die wichtigsten Artikel von jeder Seite aus.
// ─────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from "react";
import { THEME } from "../../config/theme.js";
import Verweis from "../ui/Verweis.jsx";
import { pfadFuer } from "../../config/routen.js";
import { WERKZEUGE } from "../../config/werkzeuge.js";
import { JAHR } from "../../lib/jahr.js";
import Icon from "../ui/Icon.jsx";

// Artikel im Ratgeber-Untermenü: die Themen mit den meisten Impressionen in
// der Search Console (Stand 14.10.2026) plus die Grundlagen-Artikel.
// Artikel-Links laden die vorgerenderte Seite normal (ohne onNavigate), weil
// Nav die Artikel-Navigation von App.jsx nicht kennt; das ist schnell, die
// Seiten liegen statisch vor.
const RATGEBER_THEMEN = [
  ["Widerspruch einlegen", "/ratgeber/widerspruch-nebenkostenabrechnung"],
  ["Alle Fristen " + JAHR, "/ratgeber/betriebskostenabrechnung-fristen-und-verjaehrung-2026"], // Jahr wandert mit (src/lib/jahr.js)
  ["Betriebskostenspiegel", "/ratgeber/betriebskostenspiegel-2024"],
  ["Nicht umlagefähige Kosten", "/ratgeber/nicht-umlagefaehige-nebenkosten"],
  ["Heizkostenabrechnung", "/ratgeber/heizkostenabrechnung-vermieterfehler-2026-leitfaden"],
];

function gruppen() {
  return [
    {
      label: "Prüfen", target: "werkzeug-pruefen",
      kinder: WERKZEUGE.map(w => ({ label: w.menue, hinweis: w.kurz, href: w.pfad, step: w.step })),
    },
    {
      label: "Ratgeber", target: "ratgeber",
      kinder: [{ label: "Alle Artikel", href: "/ratgeber", step: "ratgeber" }, ...RATGEBER_THEMEN.map(([label, href]) => ({ label, href }))],
    },
    { label: "FAQ", target: "faq" },
    { label: "Über uns", target: "ueberuns" },
  ];
}

export default function Nav({ activeStep, navigateTo }) {
  const C = THEME.color;
  const [isMobile, setIsMobile] = useState(() => (typeof window !== "undefined" ? window.innerWidth < THEME.layout.mobileBreakpoint : false));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [offen, setOffen] = useState(null); // Label des aufgeklappten Untermenüs (Desktop)
  const navRef = useRef(null);
  const items = gruppen();

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < THEME.layout.mobileBreakpoint);
      if (window.innerWidth >= THEME.layout.mobileBreakpoint) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Untermenü schließt bei Klick außerhalb und mit Escape.
  useEffect(() => {
    if (!offen) return;
    const zu = e => { if (navRef.current && !navRef.current.contains(e.target)) setOffen(null); };
    const esc = e => { if (e.key === "Escape") setOffen(null); };
    document.addEventListener("mousedown", zu);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", zu); document.removeEventListener("keydown", esc); };
  }, [offen]);

  const istAktiv = item => activeStep === item.target || (item.kinder || []).some(k => k.step && k.step === activeStep);

  const gehe = (kind, extra) => {
    extra && extra();
    setOffen(null);
    if (kind.step) navigateTo(kind.step);
  };

  const logo = (
    <Verweis href="/" aria-label="NebenkostenRadar Startseite" onNavigate={() => { setMobileOpen(false); navigateTo("welcome"); }} style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
      <div style={{ width: 42, height: 42, borderRadius: 10, background: C.brand, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <svg width="24" height="24" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="7" stroke="white" strokeWidth="2"/>
          <circle cx="9" cy="9" r="3.5" stroke="white" strokeWidth="1.5"/>
          <circle cx="9" cy="9" r="1" fill="white"/>
        </svg>
      </div>
      <div>
        {/* LOGO: Schrift, Größe und Farben bewusst fest (Stefans Vorgabe beim
            Redesign 18.10.2026: "das Logo muss bleiben"). Nicht an THEME.size
            oder die allgemeine Textfarbe koppeln. */}
        <div style={{ fontSize: 20, fontWeight: 700, color: "#2E2A22", fontFamily: THEME.font.logo, lineHeight: 1.1 }}>
          Nebenkosten<span style={{ color: C.brand }}>Radar</span>
        </div>
        <div style={{ fontSize: 10, color: "#6B6152", fontWeight: 500, fontFamily: THEME.font.logoSub }}>Nebenkosten prüfen, für Mieter</div>
      </div>
    </Verweis>
  );

  const ctaButton = (onClickExtra) => (
    <Verweis href={pfadFuer("wohnung")}
      onNavigate={() => { onClickExtra && onClickExtra(); navigateTo("wohnung"); }}
      style={{ display: "inline-block", background: C.accent, border: "none", borderRadius: THEME.radius.sm, padding: "11px 18px", fontSize: 15, fontFamily: THEME.font.heading, fontWeight: 600, color: C.accentText, cursor: "pointer", whiteSpace: "nowrap" }}>
      Kostenlos prüfen
    </Verweis>
  );

  // Ein Untermenü-Link: mit step → Navigation ohne Neuladen, sonst normaler Link.
  const kindLink = (kind, stil, extra) => kind.step
    ? <Verweis key={kind.href} href={kind.href} onNavigate={() => gehe(kind, extra)} style={stil}>{kind.label}{kind.hinweis && <span style={{ display: "block", fontSize: 13.5, color: C.textDim, fontWeight: 400 }}>{kind.hinweis}</span>}</Verweis>
    : <a key={kind.href} href={kind.href} style={{ color: "inherit", textDecoration: "none", ...stil }}>{kind.label}</a>;

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
        <div style={{ display: mobileOpen ? "flex" : "none", borderTop: "1px solid " + C.border, padding: "10px 0 16px", flexDirection: "column", gap: 2, maxHeight: "calc(100vh - 64px)", overflowY: "auto" }}>
          {items.map(item => item.kinder ? (
            <div key={item.label} style={{ padding: "6px 0" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.06em", padding: "6px 6px 4px" }}>{item.label}</div>
              {item.kinder.map(k => kindLink(k, { display: "block", padding: "10px 6px", fontSize: 17, color: k.step === activeStep ? C.brand : C.text, fontWeight: k.step === activeStep ? 600 : 400 }, () => setMobileOpen(false)))}
            </div>
          ) : (
            <Verweis key={item.label} href={pfadFuer(item.target)}
              onNavigate={() => { setMobileOpen(false); navigateTo(item.target); }}
              style={{ display: "block", textAlign: "left", padding: "12px 6px", fontSize: 17, fontFamily: THEME.font.body, color: activeStep === item.target ? C.brand : C.text, fontWeight: activeStep === item.target ? 600 : 400, cursor: "pointer" }}>
              {item.label}
            </Verweis>
          ))}
          <div style={{ marginTop: 8 }}>{ctaButton(() => setMobileOpen(false))}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ borderBottom: "1px solid " + C.border, padding: "0 20px", background: C.surface, position: "sticky", top: 0, zIndex: 100, boxShadow: "none" }}>
      <div ref={navRef} style={{ maxWidth: THEME.layout.pageMax, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 76 }}>
        {logo}
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {items.map(item => {
            const stil = { display: "inline-flex", alignItems: "center", gap: 4, background: "none", border: "none", padding: "8px 12px", fontSize: 15, fontFamily: THEME.font.body, color: istAktiv(item) ? C.brandStrong : C.textMuted, fontWeight: istAktiv(item) ? 600 : 500, cursor: "pointer", borderRadius: 6 };
            if (!item.kinder) {
              return (
                <Verweis key={item.label} href={pfadFuer(item.target)} onNavigate={() => navigateTo(item.target)} style={stil}>
                  {item.label}
                </Verweis>
              );
            }
            const auf = offen === item.label;
            return (
              <div key={item.label} style={{ position: "relative" }}
                onMouseEnter={() => setOffen(item.label)} onMouseLeave={() => setOffen(o => (o === item.label ? null : o))}>
                <button type="button" aria-expanded={auf} aria-haspopup="true" onClick={() => setOffen(auf ? null : item.label)} style={stil}>
                  {item.label} <Icon name="chevron-down" size={16} style={{ marginTop: -2, transform: auf ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
                </button>
                <div style={{ display: auf ? "block" : "none", position: "absolute", top: "100%", left: 0, minWidth: 260, background: C.surface, border: "1px solid " + C.border, borderRadius: THEME.radius.md, boxShadow: "0 8px 24px rgba(0,0,0,0.08)", padding: "8px 0", zIndex: 200 }}>
                  {item.kinder.map(k => kindLink(k, { display: "block", padding: "9px 16px", fontSize: 15.5, color: k.step === activeStep ? C.brand : C.text, fontWeight: 500, lineHeight: 1.4 }))}
                </div>
              </div>
            );
          })}
          <div style={{ marginLeft: 6 }}>{ctaButton()}</div>
        </div>
      </div>
    </div>
  );
}
