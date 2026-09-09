// ─────────────────────────────────────────────────────────────────────────
// Artikel.jsx — Einzelner Ratgeber-Artikel. URL: "/ratgeber/:id"
// ─────────────────────────────────────────────────────────────────────────
import { THEME } from "../config/theme.js";
import { ARTIKEL } from "../artikel.js";
import { BUSINESS } from "../config/business.js";
import Nav from "../components/layout/Nav.jsx";
import LegalFooter from "../components/layout/LegalFooter.jsx";

// ─────────────────────────────────────────────────────────────────────────
// Richtwerte-Tabelle für den Betriebskostenspiegel-Artikel.
//
// BEWUSST AUS business.js ERZEUGT statt im Artikel fest eingetippt
// (09.09.2026, siehe CHANGELOG). Grund: Der Artikel enthielt eine fest
// verdrahtete Tabelle, deren Werte inzwischen bei 8 von 10 Kostenarten von
// den geprüften DMB-Werten in business.js abwichen (z. B. Hausmeister 0,30 €
// statt 0,21 €, Müll 0,20 € statt 0,16 €). Ratgeber und Prüfbericht hätten
// dem Kunden also unterschiedliche Richtwerte gezeigt — bei einem Produkt,
// dessen ganzer Zweck der Vergleich mit genau diesen Werten ist, wäre das
// der schlimmstmögliche Widerspruch.
//
// Wird business.js künftig aktualisiert (siehe scripts/richtwerte-monitor.mjs,
// das auf neue DMB-Ausgaben hinweist), zieht diese Tabelle automatisch mit.
// Die Reihenfolge unten bestimmt die Reihenfolge in der Tabelle.
const RICHTWERT_ZEILEN = [
  ["Heizung + Warmwasser", "heizung_warmwasser"],
  ["Heizung + Warmwasser (Höchstwert)", "heizung_max"],
  ["Wasser + Abwasser", "wasser_abwasser"],
  ["Grundsteuer", "grundsteuer"],
  ["Müllbeseitigung", "muell"],
  ["Hausmeister", "hausmeister"],
  ["Versicherungen", "versicherungen"],
  ["Gebäudereinigung", "gebaeudereinigung"],
  ["Aufzug", "aufzug"],
  ["Gartenpflege", "gartenpflege"],
  ["Allgemeinstrom", "allgemeinstrom"],
  ["Straßenreinigung", "strassenreinigung"],
  ["Schornsteinreinigung", "schornstein"],
  ["Sonstige Betriebskosten", "sonstiges"],
];
const BEISPIEL_QM = 75;
const eur = n => n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

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
          // ── NEU 09.09.2026 (siehe CHANGELOG) ──────────────────────────
          // Diese drei Block-Typen fehlten hier. Nicht unterstützte Typen
          // fielen bisher stillschweigend hinten runter (kein Fehler, kein
          // Hinweis — sie waren einfach weg). Betroffen waren ausgerechnet
          // die beiden sichtbarsten Seiten: die komplette DMB-Tabelle im
          // Betriebskostenspiegel-Artikel (548 Google-Impressionen) und die
          // 5-Schritte-Anleitung im Widerspruchs-Artikel (113). Beide Seiten
          // versprachen in der Überschrift genau das, was dann fehlte.
          //
          // Bewusst echte <table>/<ol>-Elemente statt Divs: Eine Datentabelle
          // als Tabelle auszuzeichnen ist für Google inhaltlich verwertbar
          // (Chance auf Rich Results) und für Screenreader überhaupt erst
          // navigierbar.
          if (block.typ === "richtwerte") return (
            <div key={i} style={{ overflowX: "auto", margin: "0 0 20px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
                <caption style={{ captionSide: "bottom", fontSize: 11.5, color: C.textDim, textAlign: "left", paddingTop: 8, lineHeight: 1.5 }}>
                  Quelle: Deutscher Mieterbund, Betriebskostenspiegel für das Abrechnungsjahr {BUSINESS.RICHTWERTE_JAHR}. Jahresbeträge beispielhaft für {BEISPIEL_QM} m².
                </caption>
                <thead>
                  <tr style={{ borderBottom: "2px solid " + C.border }}>
                    <th scope="col" style={{ textAlign: "left", padding: "8px 10px 8px 0", fontWeight: 600, color: C.text }}>Kostenart</th>
                    <th scope="col" style={{ textAlign: "right", padding: "8px 10px", fontWeight: 600, color: C.text, whiteSpace: "nowrap" }}>€/m²/Monat</th>
                    <th scope="col" style={{ textAlign: "right", padding: "8px 0 8px 10px", fontWeight: 600, color: C.text, whiteSpace: "nowrap" }}>Jahr, {BEISPIEL_QM} m²</th>
                  </tr>
                </thead>
                <tbody>
                  {RICHTWERT_ZEILEN.map(([label, key]) => {
                    const wert = BUSINESS.RICHTWERTE[key];
                    if (wert == null) return null;
                    return (
                      <tr key={key} style={{ borderBottom: "1px solid " + C.border }}>
                        <th scope="row" style={{ textAlign: "left", padding: "8px 10px 8px 0", fontWeight: 400, color: C.textMuted }}>{label}</th>
                        <td style={{ textAlign: "right", padding: "8px 10px", color: C.textMuted, whiteSpace: "nowrap" }}>{eur(wert)}</td>
                        <td style={{ textAlign: "right", padding: "8px 0 8px 10px", color: C.textMuted, whiteSpace: "nowrap" }}>{eur(wert * BEISPIEL_QM * 12)}</td>
                      </tr>
                    );
                  })}
                  <tr style={{ borderTop: "2px solid " + C.border }}>
                    <th scope="row" style={{ textAlign: "left", padding: "10px 10px 10px 0", fontWeight: 700, color: C.text }}>Gesamt (Durchschnitt)</th>
                    <td style={{ textAlign: "right", padding: "10px", fontWeight: 700, color: C.text, whiteSpace: "nowrap" }}>{eur(BUSINESS.RICHTWERTE.gesamt)}</td>
                    <td style={{ textAlign: "right", padding: "10px 0 10px 10px", fontWeight: 700, color: C.text, whiteSpace: "nowrap" }}>{eur(BUSINESS.RICHTWERTE.gesamt * BEISPIEL_QM * 12)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
          if (block.typ === "tabelle") {
            const [kopf, ...rest] = block.zeilen || [];
            if (!kopf) return null;
            return (
              <div key={i} style={{ overflowX: "auto", margin: "0 0 20px" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid " + C.border }}>
                      {kopf.map((z, j) => (
                        <th key={j} scope="col" style={{ textAlign: j === 0 ? "left" : "right", padding: "8px 10px", fontWeight: 600, color: C.text }}>{z}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rest.map((zeile, j) => (
                      <tr key={j} style={{ borderBottom: "1px solid " + C.border }}>
                        {zeile.map((z, k) => (
                          <td key={k} style={{ textAlign: k === 0 ? "left" : "right", padding: "8px 10px", color: C.textMuted }}>{z}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
          if (block.typ === "schritte") return (
            <ol key={i} style={{ margin: "0 0 20px", paddingLeft: 0, listStyle: "none", counterReset: "schritt" }}>
              {block.items.map((item, j) => (
                <li key={j} style={{ display: "flex", gap: 12, marginBottom: 14, fontSize: 14, color: C.textMuted, lineHeight: 1.65 }}>
                  <span style={{
                    flexShrink: 0, width: 24, height: 24, borderRadius: "50%",
                    background: C.brandBg, color: C.brand, fontSize: 12, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1,
                  }}>{j + 1}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
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
