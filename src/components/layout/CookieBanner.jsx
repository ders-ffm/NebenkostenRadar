// ─────────────────────────────────────────────────────────────────────────
// CookieBanner.jsx — GA4 wird ausschließlich nach erteilter Einwilligung
// geladen (Google Consent Mode v2). Siehe ladeGA4(): das Skript wird erst
// hier per document.createElement injiziert, NICHT im <head> von index.html
// — das war der ursprüngliche Abmahn-/Bußgeld-Risikopunkt (Cookieless Ping
// mit IP-Adresse vor Einwilligung), siehe CHANGELOG.md.
// ─────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { THEME } from "../../config/theme.js";

const GA4_ID = "G-KE9LWG22QW";

export function ladeGA4() {
  if (window.__nkrGaLoaded) return;
  window.__nkrGaLoaded = true;
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://www.googletagmanager.com/gtag/js?id=" + GA4_ID;
  document.head.appendChild(script);
  window.gtag("js", new Date());
  window.gtag("config", GA4_ID);
}

export default function CookieBanner() {
  const C = THEME.color;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("nkr-ck");
    if (!consent) {
      setVisible(true);
    } else if (consent === "1") {
      window.gtag && window.gtag("consent", "update", { analytics_storage: "granted" });
      ladeGA4();
    }
  }, []);

  function accept() {
    localStorage.setItem("nkr-ck", "1");
    setVisible(false);
    window.gtag && window.gtag("consent", "update", { analytics_storage: "granted" });
    ladeGA4();
  }
  function reject() {
    localStorage.setItem("nkr-ck", "0");
    setVisible(false);
  }

  if (!visible) return null;
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9999, background: C.text, borderTop: "3px solid " + C.accent, padding: "16px 20px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1, fontSize: 12, color: "#D8D2C4", lineHeight: 1.6 }}>
          <strong style={{ color: "#fff" }}>Ihre Privatsphäre</strong><br />
          Wir verwenden Google Analytics nur mit Ihrer Einwilligung. Technisch notwendige Cookies sind immer aktiv.{" "}
          <a href="#datenschutz" style={{ color: C.accent }}>Mehr erfahren</a>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
          <button onClick={accept} style={{ background: C.accent, color: C.accentText, border: "none", borderRadius: 6, padding: "9px 18px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Akzeptieren</button>
          <button onClick={reject} style={{ background: "transparent", color: "#9B9284", border: "1px solid #4A4335", borderRadius: 6, padding: "9px 14px", fontSize: 12, cursor: "pointer" }}>Nur notwendige</button>
        </div>
      </div>
    </div>
  );
}
