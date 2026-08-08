// ─────────────────────────────────────────────────────────────────────────
// Artikel.jsx — Einzelner Ratgeber-Artikel. URL: "/ratgeber/:id"
// ─────────────────────────────────────────────────────────────────────────
import { THEME } from "../config/theme.js";
import { ARTIKEL } from "../artikel.js";
import Nav from "../components/layout/Nav.jsx";
import LegalFooter from "../components/layout/LegalFooter.jsx";

export default function Artikel({ navigateTo, navigateToArtikel, ratgeberArtikel }) {
  const C = THEME.color;
  const PAGE_MAX = THEME.layout.pageMax;
  const artikel = ARTIKEL.find(a => a.id === ratgeberArtikel);
  if (!artikel) return <div style={{ fontFamily: THEME.font.body, padding: 40 }}><p>Artikel nicht gefunden.</p></div>;

  return (
    <div style={{ fontFamily: THEME.font.body, background: C.bg, color: C.text, minHeight: "100vh" }}>
      <Nav activeStep="ratgeber" navigateTo={navigateTo} />
      <div style={{ maxWidth: PAGE_MAX, margin: "0 auto", padding: "24px 20px 60px" }}>
        <button onClick={() => navigateTo("ratgeber")} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 13, padding: "0 0 20px" }}>← Ratgeber</button>
        <img src={artikel.bild} alt={artikel.bildAlt} style={{ width: "100%", height: 220, objectFit: "cover", borderRadius: THEME.radius.lg, marginBottom: 24 }} />
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
          <span style={{ background: C.brandBg, color: C.brand, fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 4 }}>{artikel.kategorie}</span>
          <span style={{ color: C.textDim, fontSize: 12 }}>{artikel.datum} · {artikel.lesezeit}</span>
        </div>
        <h1 style={{ fontFamily: THEME.font.heading, fontSize: 24, fontWeight: 600, margin: "0 0 16px", lineHeight: 1.3 }}>{artikel.titel}</h1>

        {artikel.inhalt.map((block, i) => {
          if (block.typ === "intro") return <p key={i} style={{ fontSize: 16, color: C.text, lineHeight: 1.75, margin: "0 0 24px", borderLeft: "3px solid " + C.brand, paddingLeft: 16 }}>{block.text}</p>;
          if (block.typ === "h2") return <h2 key={i} style={{ fontFamily: THEME.font.heading, fontSize: 19, fontWeight: 600, color: C.text, margin: "32px 0 12px" }}>{block.text}</h2>;
          if (block.typ === "text") return <p key={i} style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.75, margin: "0 0 16px" }}>{block.text}</p>;
          if (block.typ === "liste") return (
            <ul key={i} style={{ margin: "0 0 20px", paddingLeft: 0, listStyle: "none" }}>
              {block.items.map((item, j) => (
                <li key={j} style={{ display: "flex", gap: 10, marginBottom: 10, fontSize: 14, color: C.textMuted, lineHeight: 1.65 }}>
                  <span style={{ color: C.brand, flexShrink: 0, marginTop: 3, fontSize: 12, fontWeight: 700 }}>✓</span>{item}
                </li>
              ))}
            </ul>
          );
          if (block.typ === "hinweis") return (
            <div key={i} style={{ background: C.brandBg, borderLeft: "3px solid " + C.brand, borderRadius: THEME.radius.sm, padding: "14px 16px", margin: "0 0 20px", fontSize: 13, color: C.text, lineHeight: 1.65 }}>{block.text}</div>
          );
          if (block.typ === "verweis") {
            const ziel = ARTIKEL.find(a => a.id === block.ziel);
            if (!ziel) return null;
            return (
              <div key={i} onClick={() => navigateToArtikel(ziel.id)}
                style={{ display: "flex", gap: 12, alignItems: "center", background: C.accentBg, borderLeft: "3px solid " + C.accent, borderRadius: THEME.radius.sm, padding: "14px 16px", margin: "0 0 20px", cursor: "pointer" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: C.accent, fontWeight: 700, textTransform: "uppercase", marginBottom: 3 }}>Weiterführender Artikel</div>
                  <div style={{ fontSize: 13, color: C.text, lineHeight: 1.5 }}>{block.text}</div>
                </div>
                <span style={{ color: C.accent, fontSize: 16 }}>→</span>
              </div>
            );
          }
          if (block.typ === "cta") return (
            <div key={i} style={{ background: C.brand, borderRadius: THEME.radius.md, padding: "18px 20px", margin: "24px 0", textAlign: "center" }}>
              <p style={{ color: "#fff", fontSize: 14, margin: "0 0 12px", lineHeight: 1.6 }}>{block.text}</p>
              <button onClick={() => navigateTo("wohnung")} style={{ background: "#fff", border: "none", borderRadius: 6, padding: "10px 24px", fontSize: 14, fontFamily: THEME.font.heading, fontWeight: 600, color: C.brand, cursor: "pointer" }}>Kostenlos prüfen →</button>
            </div>
          );
          return null;
        })}

        <div style={{ borderTop: "1px solid " + C.border, paddingTop: 24, marginTop: 32 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 16, textTransform: "uppercase" }}>Weitere Artikel</div>
          {ARTIKEL.filter(a => a.id !== artikel.id).map(a => (
            <div key={a.id} onClick={() => navigateToArtikel(a.id)}
              style={{ display: "flex", gap: 12, marginBottom: 12, cursor: "pointer", padding: 10, borderRadius: THEME.radius.sm, border: "1px solid " + C.border }}>
              <img src={a.bild} alt={a.bildAlt} style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} loading="lazy" />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, lineHeight: 1.4, marginBottom: 4 }}>{a.titel}</div>
                <div style={{ fontSize: 11, color: C.textDim }}>{a.datum} · {a.lesezeit}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <LegalFooter navigateTo={navigateTo} />
    </div>
  );
}
