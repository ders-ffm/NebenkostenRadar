// ─────────────────────────────────────────────────────────────────────────
// Wohnung.jsx — Formular Schritt 1: Wohnungsdaten. URL: "/pruefen/wohnung"
// ─────────────────────────────────────────────────────────────────────────
import { useState } from "react";
import { THEME } from "../config/theme.js";
import { BUSINESS } from "../config/business.js";
import { toNum, fmt } from "../lib/format.js";
import Field from "../components/ui/Field.jsx";
import Btn from "../components/ui/Btn.jsx";
import StepBar from "../components/ui/StepBar.jsx";

export default function Wohnung({ navigateTo, wohnung, setWohnung }) {
  const C = THEME.color;
  const [errors, setErrors] = useState({});
  const setW = (k, v) => setWohnung(p => ({ ...p, [k]: v }));

  const vz = toNum(wohnung.vorauszahlung), fl = toNum(wohnung.flaeche);
  const vzQm = vz && fl ? vz / fl / 12 : null;

  const AKTUELLES_JAHR = new Date().getFullYear();

  function validate() {
    const e = {};
    const flaecheNum = toNum(wohnung.flaeche);
    if (!wohnung.flaeche || flaecheNum < 5) e.flaeche = "Gültige Wohnfläche erforderlich (mind. 5 m²)";
    else if (flaecheNum > 500) e.flaeche = "Bitte prüfen — über 500 m² ungewöhnlich";

    const jahrNum = parseInt(wohnung.jahr, 10);
    if (!wohnung.jahr || wohnung.jahr.length !== 4 || isNaN(jahrNum)) e.jahr = "Gültiges Jahr erforderlich (4-stellig)";
    else if (jahrNum < 2000 || jahrNum > AKTUELLES_JAHR) e.jahr = "Jahr zwischen 2000 und " + AKTUELLES_JAHR + " erwartet";

    const vzNum = toNum(wohnung.vorauszahlung);
    if (!wohnung.vorauszahlung || vzNum <= 0) e.vorauszahlung = "Bitte Vorauszahlungen eingeben";
    else if (vzNum > 50000) e.vorauszahlung = "Bitte prüfen — Betrag ungewöhnlich hoch";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  return (
    <div style={{ fontFamily: THEME.font.body, background: C.bg, color: C.text, minHeight: "100vh" }}>
      <div style={{ background: C.surface, borderBottom: "1px solid " + C.border }}>
        <div style={{ padding: "20px 20px 0", maxWidth: THEME.layout.formMax, margin: "0 auto", boxSizing: "border-box" }}>
          <button onClick={() => navigateTo("welcome")} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 13, padding: "0 0 12px", fontFamily: THEME.font.body }}>← Zurück</button>
          <StepBar current={1} total={3} label="Wohnungsdaten" />
        </div>
      </div>
      <div style={{ padding: "22px 20px 40px", maxWidth: THEME.layout.formMax, margin: "0 auto", boxSizing: "border-box" }}>
        <h2 style={{ fontFamily: THEME.font.heading, fontSize: 21, fontWeight: 600, margin: "0 0 6px" }}>Angaben zur Mietsache</h2>
        <p style={{ fontSize: 13, color: C.textMuted, margin: "0 0 16px", lineHeight: 1.55 }}>Steht auf dem Deckblatt deiner Abrechnung.</p>
        <div style={{ background: C.brandBg, borderRadius: THEME.radius.md, padding: "13px 14px", marginBottom: 20, fontSize: 12, color: C.textMuted, lineHeight: 1.75 }}>
          <div style={{ color: C.text, fontWeight: 600, marginBottom: 5, fontSize: 13, fontFamily: THEME.font.heading }}>Wie funktioniert eine Nebenkostenabrechnung?</div>
          Du zahlst monatlich Abschläge für Heizung, Wasser, Müll u. a. Einmal im Jahr rechnet dein Vermieter ab, was tatsächlich angefallen ist. Im nächsten Schritt trägst du jeden Posten ein — genau so wie er auf der Abrechnung steht.
        </div>
        <Field label="Wohnfläche laut Mietvertrag" value={wohnung.flaeche} onChange={v => setW("flaeche", v)} type="number" placeholder="z. B. 75" suffix="m²" width="short" required error={errors.flaeche} autoFocus tip="Steht auf dem Deckblatt oder im Mietvertrag" />
        <Field label="Abrechnungsjahr" value={wohnung.jahr} onChange={v => setW("jahr", v)} type="number" placeholder="z. B. 2025" width="short" required error={errors.jahr} tip="Das Kalenderjahr oben auf der Abrechnung" />
        <Field label="Geleistete Vorauszahlungen" value={wohnung.vorauszahlung} onChange={v => setW("vorauszahlung", v)} money placeholder="z. B. 2.400,00" prefix="€" width="medium" required error={errors.vorauszahlung} tip="Alle Abschläge des Jahres — steht als 'Summe Vorauszahlungen' auf der Abrechnung" />

        {vzQm !== null && vzQm < 0.5 && (
          <div style={{ background: C.warnBg, borderLeft: "3px solid " + C.warn, borderRadius: THEME.radius.md, padding: "12px 14px", marginBottom: 10, fontSize: 13, color: C.warn }}>
            Vorauszahlung sehr niedrig: {fmt(vzQm)}/m²/Monat — DMB-Richtwert: {fmt(BUSINESS.RICHTWERTE.gesamt)}/m²/Monat. Bitte Eingabe prüfen.
          </div>
        )}
        {vzQm !== null && vzQm > BUSINESS.RICHTWERTE.gesamt * 2 && (
          <div style={{ background: C.warnBg, borderLeft: "3px solid " + C.warn, borderRadius: THEME.radius.md, padding: "12px 14px", marginBottom: 10, fontSize: 13, color: C.warn }}>
            Vorauszahlung auffällig hoch: {fmt(vzQm)}/m²/Monat — mehr als doppelt so hoch wie der DMB-Richtwert.
          </div>
        )}

        <Btn onClick={() => { if (validate()) navigateTo("posten"); }}>Weiter zu den Posten →</Btn>
      </div>
    </div>
  );
}
