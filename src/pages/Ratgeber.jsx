// ─────────────────────────────────────────────────────────────────────────
// Ratgeber.jsx — Übersichtsseite aller Artikel. URL: "/ratgeber"
// ─────────────────────────────────────────────────────────────────────────
import { THEME } from "../config/theme.js";
import { ARTIKEL } from "../artikel.js";
import Nav from "../components/layout/Nav.jsx";
import LegalFooter from "../components/layout/LegalFooter.jsx";
// Echte Links statt div onClick (17.10.2026): Vorher hatte die gerenderte
// Übersicht 0 Links, Google konnte von hier aus keinen Artikel finden.
import Verweis from "../components/ui/Verweis.jsx";

export default function Ratgeber({ navigateTo, navigateToArtikel }) {
  const C = THEME.color;
  const PAGE_MAX = THEME.layout.pageMax;
  return (
    <div style={{ fontFamily: THEME.font.body, background: C.bg, color: C.text, minHeight: "100vh" }}>
      <Nav activeStep="ratgeber" navigateTo={navigateTo} />
      <div style={{ maxWidth: PAGE_MAX, margin: "0 auto", padding: "32px 20px 60px" }}>
        <Verweis href="/" onNavigate={() => navigateTo("welcome")} style={{ display: "inline-block", color: C.textMuted, cursor: "pointer", fontSize: 13, padding: 0, marginBottom: 8 }}>← Startseite</Verweis>
        <h1 style={{ fontFamily: THEME.font.heading, fontSize: 26, fontWeight: 600, margin: "0 0 8px" }}>Ratgeber Mietrecht</h1>
        <p style={{ fontSize: 15, color: C.textMuted, margin: "0 0 32px", lineHeight: 1.6 }}>Fundierte Informationen zu Nebenkostenabrechnungen, Fristen und deinen Rechten als Mieter, kostenlos und aktuell.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {ARTIKEL.map(a => (
            <Verweis key={a.id} href={"/ratgeber/" + a.id} onNavigate={() => navigateToArtikel(a.id)}
              style={{ display: "block", background: C.surface, border: "1px solid " + C.border, borderRadius: THEME.radius.lg, overflow: "hidden", cursor: "pointer" }}>
              <img src={a.bild} alt={a.bildAlt} style={{ width: "100%", height: 180, objectFit: "cover" }} loading="lazy" />
              <div style={{ padding: "16px 18px" }}>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <span style={{ background: C.brandBg, color: C.brand, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>{a.kategorie}</span>
                  <span style={{ color: C.textDim, fontSize: 11 }}>{a.datum} · {a.lesezeit}</span>
                </div>
                <h2 style={{ fontFamily: THEME.font.heading, fontSize: 16, fontWeight: 600, color: C.text, margin: "0 0 8px", lineHeight: 1.35 }}>{a.titel}</h2>
                <p style={{ fontSize: 13, color: C.textMuted, margin: "0 0 12px", lineHeight: 1.6 }}>{a.teaser}</p>
                <span style={{ color: C.accent, fontSize: 13, fontWeight: 600 }}>Artikel lesen →</span>
              </div>
            </Verweis>
          ))}
        </div>
      </div>
      <LegalFooter navigateTo={navigateTo} />
    </div>
  );
}
