// ─────────────────────────────────────────────────────────────────────────
// Artikel.jsx — Einzelner Ratgeber-Artikel. URL: "/ratgeber/:id"
// ─────────────────────────────────────────────────────────────────────────
import { useState } from "react";
import { THEME } from "../config/theme.js";
import { ARTIKEL } from "../artikel.js";
import { BUSINESS } from "../config/business.js";
// Echte Links statt div/button (17.10.2026), siehe Verweis.jsx.
import Verweis from "../components/ui/Verweis.jsx";
import Icon from "../components/ui/Icon.jsx";
import { WERKZEUGE } from "../config/werkzeuge.js";
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

// ─────────────────────────────────────────────────────────────────────────
// Musterbrief-Block (18.10.2026, SEO-Lauf): Vorlage als sichtbarer,
// kopierbarer Text. Anlass: Die Widerspruchs-Seite versprach im Titel ein
// "Muster", enthielt aber keins; alle vorne rankenden Seiten haben eins.
// Gleicher Inhalt im vorgerenderten HTML (scripts/prerender.mjs, "muster").
function MusterBlock({ block }) {
  const C = THEME.color;
  const [kopiert, setKopiert] = useState(false);
  const kopieren = () => {
    try {
      navigator.clipboard.writeText(block.text).then(() => { setKopiert(true); setTimeout(() => setKopiert(false), 2500); }, () => {});
    } catch (e) { /* Zwischenablage nicht verfügbar: Text bleibt markierbar */ }
  };
  return (
    <div style={{ border: "1px solid " + C.border, borderRadius: THEME.radius.sm, margin: "0 0 20px", background: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "10px 14px", borderBottom: "1px solid " + C.border }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: C.text }}>{block.titel}</span>
        <button type="button" onClick={kopieren} style={{ background: C.brand, color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 14.5, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>{kopiert ? "Kopiert ✓" : "Text kopieren"}</button>
      </div>
      <div style={{ whiteSpace: "pre-wrap", fontSize: 15, color: C.text, lineHeight: 1.65, padding: "14px 16px", overflowWrap: "anywhere" }}>{block.text}</div>
    </div>
  );
}
const eur = n => n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

export default function Artikel({ navigateTo, navigateToArtikel, ratgeberArtikel }) {
  const C = THEME.color;
  const PAGE_MAX = THEME.layout.pageMax;
  const artikel = ARTIKEL.find(a => a.id === ratgeberArtikel);
  // Unbekannter Pfad (17.10.2026): Seit vercel.json die Artikel-Rewrites
  // nicht mehr hat, liefert Vercel für unbekannte /ratgeber/…-Adressen beim
  // ersten Aufruf eine echte 404-Seite. Diese Anzeige greift nur noch bei
  // Navigation innerhalb der App; App.jsx setzt dann noindex.
  if (!artikel) return (
    <div style={{ fontFamily: THEME.font.body, background: C.bg, color: C.text, minHeight: "100vh" }}>
      <Nav activeStep="ratgeber" navigateTo={navigateTo} />
      <div style={{ maxWidth: PAGE_MAX, margin: "0 auto", padding: "40px 20px" }}>
        <h1 style={{ fontFamily: THEME.font.heading, fontSize: 24, fontWeight: 600 }}>Artikel nicht gefunden</h1>
        <p style={{ fontSize: 16, color: C.textMuted, lineHeight: 1.7 }}>Diesen Artikel gibt es nicht (mehr). Alle Artikel findest du im <Verweis href="/ratgeber" onNavigate={() => navigateTo("ratgeber")} style={{ color: C.brand, textDecoration: "underline" }}>Ratgeber</Verweis>.</p>
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: THEME.font.body, background: C.bg, color: C.text, minHeight: "100vh" }}>
      <Nav activeStep="ratgeber" navigateTo={navigateTo} />
      {/* 18.10.2026 (Redesign): Textspalte auf 760 px begrenzt. Vorher lief der
          Text über bis zu 1.200 px, also deutlich über 90 Zeichen je Zeile.
          Empfohlen sind 45–90 Zeichen, Ziel um 66 (U.S. Web Design System,
          designsystem.digital.gov/components/typography). Bei 18 px Inter sind
          das gut 75 Zeichen. */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "28px 20px 64px" }}>
        <Verweis href="/ratgeber" onNavigate={() => navigateTo("ratgeber")} style={{ display: "inline-block", color: C.textMuted, cursor: "pointer", fontSize: 15, padding: "0 0 20px" }}>← Ratgeber</Verweis>
        <img src={artikel.bild} alt={artikel.bildAlt} style={{ width: "100%", height: 220, objectFit: "cover", borderRadius: THEME.radius.lg, marginBottom: 24 }} />
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
          <span style={{ background: C.brandBg, color: C.brand, fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 4 }}>{artikel.kategorie}</span>
          <span style={{ color: C.textDim, fontSize: 14 }}>{artikel.datum}{artikel.aktualisiert ? " · aktualisiert " + artikel.aktualisiert : ""} · {artikel.lesezeit}</span>
        </div>
        <h1 style={{ fontFamily: THEME.font.heading, fontSize: "clamp(28px, 5.2vw, 40px)", fontWeight: 700, letterSpacing: "-0.022em", margin: "0 0 10px", lineHeight: 1.15, textWrap: "balance" }}>{artikel.titel}</h1>
        {/* KI-HINWEIS (17.10.2026, Compliance-Check): Die Ratgeber-Artikel
            entstehen per KI (scripts/rechtsmonitor.mjs) und werden vor der
            Veröffentlichung NICHT redaktionell gegengelesen (Stefans Angabe
            vom 17.10.2026). Für KI-erzeugte Texte, die die Öffentlichkeit
            über Angelegenheiten von öffentlichem Interesse informieren, ist
            die Offenlegung nach Art. 50 Abs. 4 KI-Verordnung (gilt seit
            02.08.2026) nur entbehrlich, wenn ein Mensch sie prüft und
            redaktionell verantwortet. Unabhängig davon ist der Hinweis
            ehrlich und schadet nicht. Wird künftig jeder Artikel vor dem
            Mergen inhaltlich geprüft, kann der Satz entsprechend angepasst
            werden. Gleicher Text im vorgerenderten HTML (prerender.mjs). */}
        <p style={{ fontSize: 13.5, color: C.textDim, margin: "0 0 16px", lineHeight: 1.6 }}>Mit Unterstützung künstlicher Intelligenz erstellt. Kein Ersatz für eine Rechtsberatung.</p>

        {artikel.inhalt.map((block, i) => {
          if (block.typ === "intro") return <p key={i} style={{ fontSize: 19, color: C.text, lineHeight: 1.7, margin: "0 0 24px", borderLeft: "3px solid " + C.brand, paddingLeft: 16 }}>{block.text}</p>;
          if (block.typ === "h2") return <h2 key={i} style={{ fontFamily: THEME.font.heading, fontSize: "clamp(22px, 3.6vw, 27px)", fontWeight: 700, letterSpacing: "-0.015em", lineHeight: 1.25, color: C.text, margin: "40px 0 14px" }}>{block.text}</h2>;
          if (block.typ === "text") return <p key={i} style={{ fontSize: 18, color: C.text, lineHeight: 1.7, margin: "0 0 20px" }}>{block.text}</p>;
          if (block.typ === "liste") return (
            <ul key={i} style={{ margin: "0 0 20px", paddingLeft: 0, listStyle: "none" }}>
              {block.items.map((item, j) => (
                <li key={j} style={{ display: "flex", gap: 12, marginBottom: 12, fontSize: 18, color: C.text, lineHeight: 1.65 }}>
                  <span style={{ color: C.brand, flexShrink: 0, display: "inline-flex", marginTop: 4 }}><Icon name="circle-check" size={19} /></span><span>{item}</span>
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
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15.5 }}>
                <caption style={{ captionSide: "bottom", fontSize: 13.5, color: C.textDim, textAlign: "left", paddingTop: 8, lineHeight: 1.5 }}>
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
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 15.5 }}>
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
                <li key={j} style={{ display: "flex", gap: 12, marginBottom: 14, fontSize: 18, color: C.text, lineHeight: 1.65 }}>
                  <span style={{
                    flexShrink: 0, width: 24, height: 24, borderRadius: "50%",
                    background: C.brandBg, color: C.brand, fontSize: 14, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1,
                  }}>{j + 1}</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          );
          if (block.typ === "hinweis") return (
            <div key={i} style={{ background: C.brandBg, borderLeft: "3px solid " + C.brand, borderRadius: THEME.radius.sm, padding: "14px 16px", margin: "0 0 20px", fontSize: 15, color: C.text, lineHeight: 1.65 }}>{block.text}</div>
          );
          if (block.typ === "verweis") {
            const ziel = ARTIKEL.find(a => a.id === block.ziel);
            if (!ziel) return null;
            return (
              <Verweis key={i} href={"/ratgeber/" + ziel.id} onNavigate={() => navigateToArtikel(ziel.id)}
                style={{ display: "flex", gap: 14, alignItems: "center", background: C.surface, border: "1px solid " + C.border, borderRadius: THEME.radius.md, padding: "16px 20px", margin: "0 0 16px", cursor: "pointer", textDecoration: "none" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: C.textDim, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 3 }}>Weiterführender Artikel</div>
                  <div style={{ fontSize: 16.5, color: C.text, fontWeight: 500, lineHeight: 1.5 }}>{block.text}</div>
                </div>
                <span style={{ color: C.brandStrong, display: "inline-flex" }}><Icon name="arrow-right" size={20} /></span>
              </Verweis>
            );
          }
          if (block.typ === "muster") return <MusterBlock key={i} block={block} />;
          if (block.typ === "cta") return (
            <div key={i} style={{ background: C.brandBg, borderRadius: THEME.radius.lg, padding: "22px 24px", margin: "28px 0" }}>
              <p style={{ color: C.text, fontSize: 17, margin: "0 0 14px", lineHeight: 1.6 }}>{block.text}</p>
              <Verweis href="/pruefen/wohnung" onNavigate={() => navigateTo("wohnung")} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.accent, borderRadius: THEME.radius.md, padding: "13px 22px", fontSize: 16, fontFamily: THEME.font.heading, fontWeight: 600, color: C.accentText, cursor: "pointer", textDecoration: "none" }}>Kostenlos prüfen <Icon name="arrow-right" size={18} /></Verweis>
              {/* SEO-LAUF 23.10.2026: Textlink mit beschreibendem Ankertext auf
                  die Werkzeug-Seite. Sie ist seit 17.10. indexiert, hatte aber
                  in 28 Tagen 0 Impressionen; die URL-Prüfung fand keine
                  verweisende Seite. Gegenstück in scripts/prerender.mjs. */}
              <p style={{ fontSize: 15, margin: "12px 0 0", lineHeight: 1.6 }}>
                <Verweis href="/nebenkostenabrechnung-pruefen" onNavigate={() => navigateTo("werkzeug-pruefen")} style={{ color: C.brand, textDecoration: "underline" }}>So funktioniert die kostenlose Online-Prüfung der Nebenkostenabrechnung</Verweis>
              </p>
            </div>
          );
          return null;
        })}

        {/* Fragenblock (18.10.2026, SEO-Lauf): sichtbare Fragen und Antworten
            je Artikel (Feld "faq" in artikel.js). Dieselben Fragen stehen als
            FAQPage-Markup im vorgerenderten HTML; seo-check.mjs prüft, dass
            jede Frage dort auch sichtbar ist. */}
        {Array.isArray(artikel.faq) && artikel.faq.length > 0 && (
          <section style={{ marginTop: 32 }}>
            <h2 style={{ fontFamily: THEME.font.heading, fontSize: 21, fontWeight: 600, color: C.text, margin: "0 0 12px" }}>Häufige Fragen</h2>
            {artikel.faq.map((f, j) => (
              <div key={j} style={{ borderTop: "1px solid " + C.border, padding: "14px 0" }}>
                <h3 style={{ fontSize: 17, fontWeight: 600, color: C.text, margin: "0 0 6px", lineHeight: 1.45 }}>{f.frage}</h3>
                <p style={{ fontSize: 16, color: C.textMuted, lineHeight: 1.75, margin: 0 }}>{f.antwort}</p>
              </div>
            ))}
          </section>
        )}

        {/* Kostenlose Werkzeuge (17.10.2026): interne Verlinkung von jedem
            Artikel auf die drei Werkzeug-Seiten, siehe werkzeuge.js. */}
        <div style={{ borderTop: "1px solid " + C.border, paddingTop: 24, marginTop: 32 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 12, textTransform: "uppercase" }}>Kostenlose Werkzeuge</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
            {WERKZEUGE.map(w => (
              <Verweis key={w.step} href={w.pfad} onNavigate={() => navigateTo(w.step)}
                style={{ display: "block", padding: "12px 14px", border: "1px solid " + C.border, borderRadius: THEME.radius.sm }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.brand, marginBottom: 2 }}>{w.menue} →</div>
                <div style={{ fontSize: 13.5, color: C.textDim }}>{w.kurz}</div>
              </Verweis>
            ))}
          </div>
        </div>

        <div style={{ borderTop: "1px solid " + C.border, paddingTop: 24, marginTop: 32 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 16, textTransform: "uppercase" }}>Weitere Artikel</div>
          {ARTIKEL.filter(a => a.id !== artikel.id).map(a => (
            <Verweis key={a.id} href={"/ratgeber/" + a.id} onNavigate={() => navigateToArtikel(a.id)}
              style={{ display: "flex", gap: 12, marginBottom: 12, cursor: "pointer", padding: 10, borderRadius: THEME.radius.sm, border: "1px solid " + C.border }}>
              <img src={a.bild} alt={a.bildAlt} style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} loading="lazy" />
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.text, lineHeight: 1.4, marginBottom: 4 }}>{a.titel}</div>
                <div style={{ fontSize: 13, color: C.textDim }}>{a.datum} · {a.lesezeit}</div>
              </div>
            </Verweis>
          ))}
        </div>
      </div>
      <LegalFooter navigateTo={navigateTo} />
    </div>
  );
}
