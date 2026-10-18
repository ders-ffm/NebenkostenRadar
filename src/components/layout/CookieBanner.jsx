// ─────────────────────────────────────────────────────────────────────────
// CookieBanner.jsx — GA4 wird ausschließlich nach erteilter Einwilligung
// geladen (Google Consent Mode v2). Siehe ladeGA4(): das Skript wird erst
// hier per document.createElement injiziert, NICHT im <head> von index.html
// — das war der ursprüngliche Abmahn-/Bußgeld-Risikopunkt (Cookieless Ping
// mit IP-Adresse vor Einwilligung), siehe CHANGELOG.md.
//
// WIDERRUF (17.10.2026, Art. 7 Abs. 3 DSGVO): Der Banner lässt sich jetzt
// über "Cookie-Einstellungen" in der Fußzeile jederzeit wieder öffnen
// (oeffneCookieEinstellungen). Wer dort ablehnt — auch nach einer früheren
// Zustimmung —, bekommt: Consent "denied", GA4 für diese Seite deaktiviert
// (ga-disable-Schalter von Google) und die _ga-Cookies gelöscht. Vorher
// blieben die Cookies bei "Nur notwendige" einfach liegen, und es gab nach
// dem ersten Klick keinen Weg mehr zurück.
// Außerdem führte "Mehr erfahren" auf "#datenschutz", was nirgends
// ausgewertet wurde; jetzt auf /datenschutz.
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

const OEFFNEN_EVENT = "nkr-cookie-einstellungen";

export function oeffneCookieEinstellungen() {
  window.dispatchEvent(new Event(OEFFNEN_EVENT));
}

// Löscht alle Google-Analytics-Cookies (_ga, _ga_<ID>) für diese Domain.
// GA setzt sie auf der Hauptdomain mit führendem Punkt, deshalb beide
// Varianten.
function loescheGaCookies() {
  const host = window.location.hostname;
  const domains = ["", host, "." + host, "." + host.replace(/^www\./, "")];
  document.cookie.split(";").map(c => c.split("=")[0].trim()).filter(n => /^_ga/.test(n)).forEach(name => {
    domains.forEach(d => {
      document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/" + (d ? "; domain=" + d : "");
    });
  });
}

export default function CookieBanner() {
  const C = THEME.color;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const oeffnen = () => setVisible(true);
    window.addEventListener(OEFFNEN_EVENT, oeffnen);
    return () => window.removeEventListener(OEFFNEN_EVENT, oeffnen);
  }, []);

  useEffect(() => {
    let consent = null;
    try { consent = localStorage.getItem("nkr-ck"); } catch { /* privater Modus */ }
    if (!consent) {
      setVisible(true);
    } else if (consent === "1") {
      window.gtag && window.gtag("consent", "update", { analytics_storage: "granted" });
      ladeGA4();
    }
  }, []);

  function accept() {
    try { localStorage.setItem("nkr-ck", "1"); } catch { /* privater Modus */ }
    window["ga-disable-" + GA4_ID] = false;
    setVisible(false);
    window.gtag && window.gtag("consent", "update", { analytics_storage: "granted" });
    ladeGA4();
  }
  function reject() {
    try { localStorage.setItem("nkr-ck", "0"); } catch { /* privater Modus */ }
    setVisible(false);
    window.gtag && window.gtag("consent", "update", { analytics_storage: "denied" });
    window["ga-disable-" + GA4_ID] = true;
    loescheGaCookies();
  }

  if (!visible) return null;
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9999, background: C.text, borderTop: "3px solid " + C.brand, padding: "16px 20px", fontFamily: THEME.font.body }}>
      <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 240, fontSize: 15, color: "#E3E9E5", lineHeight: 1.6 }}>
          <strong style={{ color: "#fff" }}>Ihre Privatsphäre</strong><br />
          Wir verwenden Google Analytics nur mit Ihrer Einwilligung. Technisch notwendige Cookies sind immer aktiv.{" "}
          <a href="/datenschutz" style={{ color: "#FFFFFF", fontWeight: 600 }}>Mehr erfahren</a>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
          {/* 18.10.2026: Beide Knöpfe gleich gestaltet. Vorher war "Akzeptieren"
              farbig und "Nur notwendige" ein blasser Rahmen-Knopf (Kontrast
              unter 4,5:1). Die Datenschutzbehörden (DSK-Orientierungshilfe
              Telemedien) verlangen, dass Ablehnen nicht schwerer zu finden
              ist als Zustimmen; eine optische Lenkung zur Zustimmung macht
              die Einwilligung angreifbar. */}
          <button onClick={reject} style={{ background: "#FFFFFF", color: C.text, border: "none", borderRadius: 10, padding: "11px 18px", fontSize: 15, fontWeight: 600, fontFamily: THEME.font.body, cursor: "pointer" }}>Nur notwendige</button>
          <button onClick={accept} style={{ background: "#FFFFFF", color: C.text, border: "none", borderRadius: 10, padding: "11px 18px", fontSize: 15, fontWeight: 600, fontFamily: THEME.font.body, cursor: "pointer" }}>Akzeptieren</button>
        </div>
      </div>
    </div>
  );
}
