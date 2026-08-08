// ─────────────────────────────────────────────────────────────────────────
// Loading.jsx — Analyse-Fortschrittsanzeige während runAnalyse() in App.jsx läuft.
// ─────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { THEME } from "../config/theme.js";
import { pct } from "../lib/format.js";

const LOADING_MSGS = [
  "Prüfe Umlagefähigkeit nach § 2 BetrKV…",
  "Vergleiche mit DMB-Betriebskostenspiegel…",
  "Prüfe Heizkostenverordnung (50/70-Regel)…",
  "Prüfe CO2-Kostenteilung…",
  "Erkenne Rechenfehler und Doppelberechnung…",
  "Prüfe Verwaltungs- und Instandhaltungsanteile…",
  "Erstelle Widerspruchsbegründung…",
];

export default function Loading() {
  const C = THEME.color;
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setIdx(i => Math.min(i + 1, LOADING_MSGS.length - 1)), 900);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ fontFamily: THEME.font.body, background: C.bg, color: C.text, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 32 }}>
      <style>{`
        @keyframes nkrLogoPuls {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(61,122,92,0.38); }
          50% { transform: scale(1.09); box-shadow: 0 0 0 14px rgba(61,122,92,0); }
        }
      `}</style>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: C.brand, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, animation: "nkrLogoPuls 1.7s ease-in-out infinite" }}>
        <svg width="30" height="30" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="7" stroke="white" strokeWidth="2"/>
          <circle cx="9" cy="9" r="3.5" stroke="white" strokeWidth="1.5"/>
          <circle cx="9" cy="9" r="1" fill="white"/>
        </svg>
      </div>
      <div style={{ fontFamily: THEME.font.heading, fontSize: 20, fontWeight: 600, marginBottom: 6 }}>Nebenkosten<span style={{ color: C.accent }}>Radar</span></div>
      <div style={{ fontSize: 11, color: C.textDim, textTransform: "uppercase", marginBottom: 26 }}>Analyse läuft</div>
      <p style={{ fontSize: 13, color: C.textMuted, margin: "0 0 28px", textAlign: "center", minHeight: 20 }}>{LOADING_MSGS[idx]}</p>
      <div style={{ width: "100%", maxWidth: 260 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 10, color: C.textDim, textTransform: "uppercase" }}>Prüffortschritt</span>
          <span style={{ fontSize: 11, color: C.accent, fontWeight: 600 }}>{Math.round(pct(idx + 1, LOADING_MSGS.length))}%</span>
        </div>
        <div style={{ height: 5, background: C.border, borderRadius: 3, overflow: "hidden" }}>
          <div style={{ height: "100%", background: C.accent, width: pct(idx + 1, LOADING_MSGS.length) + "%", transition: "width 0.9s ease", borderRadius: 3 }} />
        </div>
      </div>
    </div>
  );
}
