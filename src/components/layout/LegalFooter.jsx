// ─────────────────────────────────────────────────────────────────────────
// LegalFooter.jsx — Fußzeile mit Links zu Impressum/AGB/Datenschutz.
// navigateTo kommt von App.jsx und setzt jetzt eine ECHTE URL (siehe dort),
// nicht mehr nur den internen State.
//
// 17.10.2026: Echte Links statt Buttons (siehe Verweis.jsx) und neuer
// Eintrag "Cookie-Einstellungen". Art. 7 Abs. 3 DSGVO: Der Widerruf einer
// Einwilligung muss so einfach sein wie ihre Erteilung. Vorher gab es nach
// dem ersten Klick im Banner keinen Weg zurück.
// ─────────────────────────────────────────────────────────────────────────
import { THEME } from "../../config/theme.js";
import Verweis from "../ui/Verweis.jsx";
import { pfadFuer } from "../../config/routen.js";
import { oeffneCookieEinstellungen } from "./CookieBanner.jsx";
import { WERKZEUGE } from "../../config/werkzeuge.js";

export default function LegalFooter({ navigateTo }) {
  const C = THEME.color;
  const items = [["Impressum", "impressum"], ["AGB", "agb"], ["Datenschutz", "datenschutz"]];
  const linkStil = { color: C.textDim, fontSize: 12, fontFamily: THEME.font.body, cursor: "pointer", textDecoration: "underline" };
  // Zweite Zeile mit den kostenlosen Werkzeugen (17.10.2026): Jede Seite
  // verlinkt sie damit einmal — wichtig, damit Google die neuen Seiten
  // schnell findet und als zusammengehörig erkennt.
  return (
    <div style={{ borderTop: "1px solid " + C.border }}>
    <div style={{ padding: "14px 20px 0", display: "flex", justifyContent: "center", gap: 18, flexWrap: "wrap" }}>
      <span style={{ ...linkStil, textDecoration: "none", fontWeight: 600 }}>Kostenlos:</span>
      {WERKZEUGE.map(w => (
        <Verweis key={w.step} href={w.pfad} onNavigate={() => navigateTo(w.step)} style={linkStil}>{w.menue}</Verweis>
      ))}
    </div>
    <div style={{ padding: "10px 20px 14px", display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
      {items.map(([label, target]) => (
        <Verweis key={target} href={pfadFuer(target)} onNavigate={() => navigateTo(target)} style={linkStil}>
          {label}
        </Verweis>
      ))}
      <button onClick={oeffneCookieEinstellungen}
        style={{ ...linkStil, background: "none", border: "none", padding: 0 }}>
        Cookie-Einstellungen
      </button>
    </div>
    </div>
  );
}
