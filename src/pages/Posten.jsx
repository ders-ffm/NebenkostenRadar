// ─────────────────────────────────────────────────────────────────────────
// Posten.jsx — Formular Schritt 2: Kostenposten. URL: "/pruefen/posten"
// ─────────────────────────────────────────────────────────────────────────
import { useState } from "react";
import { THEME } from "../config/theme.js";
import { toNum, fmt } from "../lib/format.js";
import { POSTEN_GRUPPEN, ALLE_POSTEN } from "../lib/analyse.js";
import EuroInput from "../components/ui/EuroInput.jsx";
import StepBar from "../components/ui/StepBar.jsx";

export default function Posten({ navigateTo, werte, setWerte, runAnalyse }) {
  const C = THEME.color;
  const [errors, setErrors] = useState({});
  const [openGruppe, setOpenGruppe] = useState("heizung");
  const setPosten = (k, v) => setWerte(p => ({ ...p, [k]: v }));

  const total = ALLE_POSTEN.reduce((s, p) => s + toNum(werte[p.key]), 0);
  const filledPosten = ALLE_POSTEN.filter(p => toNum(werte[p.key]) > 0).length;

  function validate() {
    const e = {};
    const pflichtfehlend = POSTEN_GRUPPEN[0].posten.filter(p => p.pflicht && toNum(werte[p.key]) <= 0);
    if (pflichtfehlend.length > 0) e.pflicht = "Pflichtfelder fehlen: " + pflichtfehlend.map(p => p.label).join(", ");
    if (filledPosten === 0) e.gesamt = "Mindestens einen Posten eingeben";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  return (
    <div style={{ fontFamily: THEME.font.body, background: C.bg, color: C.text, minHeight: "100vh" }}>
      <div style={{ background: C.surface, borderBottom: "1px solid " + C.border }}>
        <div style={{ padding: "20px 20px 0", maxWidth: THEME.layout.formMax, margin: "0 auto", boxSizing: "border-box" }}>
          <button onClick={() => navigateTo("wohnung")} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 13, padding: "0 0 12px", fontFamily: THEME.font.body }}>← Zurück</button>
          <StepBar current={2} total={3} label="Kostenposten" />
        </div>
      </div>
      <div style={{ padding: "14px 20px 0", maxWidth: THEME.layout.formMax, margin: "0 auto", boxSizing: "border-box" }}>
        <h2 style={{ fontFamily: THEME.font.heading, fontSize: 20, fontWeight: 600, margin: "0 0 4px" }}>Posten aus deiner Abrechnung</h2>
        <p style={{ fontSize: 12, color: C.textMuted, margin: "0 0 12px" }}>Trage die Beträge so ein wie sie auf der Abrechnung stehen. ✦ = Pflichtfeld. Bei den grau hinterlegten Zahlen handelt es sich um Beispielzahlen.</p>
        <div style={{ background: C.surface, border: "1px solid " + (total > 0 ? C.brand : C.border), borderRadius: THEME.radius.md, padding: "11px 16px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase" }}>Eingegeben</div>
            <div style={{ fontFamily: THEME.font.heading, fontSize: 21, fontWeight: 600, color: total > 0 ? C.accent : C.textDim }}>{total > 0 ? fmt(total) : "€ 0,00"}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: C.textMuted, textTransform: "uppercase" }}>Posten</div>
            <div style={{ fontFamily: THEME.font.heading, fontSize: 21, fontWeight: 600, color: C.textMuted }}>{filledPosten}</div>
          </div>
        </div>
        {(errors.pflicht || errors.gesamt) && (
          <div style={{ background: C.warnBg, borderLeft: "3px solid " + C.warn, borderRadius: THEME.radius.md, padding: "10px 14px", marginBottom: 12, fontSize: 12, color: C.warn }}>
            {errors.pflicht || errors.gesamt}
          </div>
        )}
      </div>
      <div style={{ padding: "0 20px 120px", maxWidth: THEME.layout.formMax, margin: "0 auto", boxSizing: "border-box" }}>
        {POSTEN_GRUPPEN.map(gruppe => {
          const groupSum = gruppe.posten.reduce((s, p) => s + toNum(werte[p.key]), 0);
          const isOpen = openGruppe === gruppe.id;
          return (
            <div key={gruppe.id} style={{ marginBottom: 8 }}>
              <button onClick={() => setOpenGruppe(isOpen ? null : gruppe.id)}
                style={{ width: "100%", background: C.surface, border: "1px solid " + (groupSum > 0 ? C.brand : C.border), borderRadius: isOpen ? "10px 10px 0 0" : THEME.radius.md, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", textAlign: "left" }}>
                <span style={{ fontSize: 19 }}>{gruppe.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{gruppe.label}</div>
                  <div style={{ fontSize: 10, color: C.textDim, marginTop: 2 }}>{gruppe.hint}</div>
                </div>
                {groupSum > 0 && <span style={{ fontSize: 12, color: C.accent, fontWeight: 600 }}>{fmt(groupSum)}</span>}
                <span style={{ color: C.textDim, fontSize: 15, transform: isOpen ? "rotate(90deg)" : "none" }}>›</span>
              </button>
              {isOpen && (
                <div style={{ background: C.surface, border: "1px solid " + C.border, borderTop: "none", borderRadius: "0 0 10px 10px", padding: "10px 12px" }}>
                  {gruppe.posten.map(p => (
                    <EuroInput key={p.key} label={p.label} value={werte[p.key]} tip={p.tip} pflicht={p.pflicht} beispiel={p.beispiel}
                      warn={p.key === "kabelanschluss" && toNum(werte[p.key]) > 0}
                      onChange={v => setPosten(p.key, v)} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: C.surface, borderTop: "1px solid " + C.border, boxShadow: "0 -4px 20px rgba(0,0,0,0.06)" }}>
        <div style={{ padding: "20px 20px 24px", maxWidth: THEME.layout.formMax, margin: "0 auto", boxSizing: "border-box" }}>
          <button
            onClick={() => { if (validate()) runAnalyse(); }}
            style={{ width: "100%", background: filledPosten > 0 ? C.accent : C.border, color: filledPosten > 0 ? C.accentText : C.textDim, border: "none", borderRadius: THEME.radius.lg, padding: "16px", fontSize: 15, fontFamily: THEME.font.heading, fontWeight: 600, cursor: filledPosten > 0 ? "pointer" : "default" }}>
            {filledPosten === 0 ? "Posten eingeben um fortzufahren" : filledPosten + " Posten analysieren →"}
          </button>
        </div>
      </div>
    </div>
  );
}
