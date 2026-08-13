// ─────────────────────────────────────────────────────────────────────────
// Posten.jsx — Formular Schritt 2: Kostenposten. URL: "/pruefen/posten"
//
// UMBAU 08/2026 (siehe CHANGELOG.md + Kommentar in lib/analyse.js): vorher
// 7 einzeln auf-/zuklappbare Kategorien, die zum ständigen Umschalten
// zwischen Formular-Kategorie und Abrechnungszeile zwangen. Jetzt eine
// durchlaufende Liste in § 2 BetrKV-Reihenfolge (amtliche, vermieter-
// unabhängige Gliederung) plus Live-Suche über Bezeichnung, Alternativ-
// Begriffe (aliases) und Tipp-Text — damit findet man einen Posten unabhängig
// davon, wie die eigene Abrechnung ihn nennt oder wo sie ihn einsortiert.
// ─────────────────────────────────────────────────────────────────────────
import { useState, useMemo } from "react";
import { THEME } from "../config/theme.js";
import { toNum, fmt } from "../lib/format.js";
import { POSTEN_GRUPPEN, ALLE_POSTEN } from "../lib/analyse.js";
import EuroInput from "../components/ui/EuroInput.jsx";
import StepBar from "../components/ui/StepBar.jsx";

function normalisiere(s) {
  return (s || "").toLowerCase();
}

export default function Posten({ navigateTo, werte, setWerte, runAnalyse, gesamtsummeAbrechnung, setGesamtsummeAbrechnung }) {
  const C = THEME.color;
  const [errors, setErrors] = useState({});
  const [suche, setSuche] = useState("");
  const [expandedGruppen, setExpandedGruppen] = useState(() => new Set());
  // Gesamtsumme laut Abrechnung — rein informativer Abgleich (siehe Kommentar
  // weiter unten bei der Hinweis-Anzeige). Bewusst eigener State in App.jsx,
  // NICHT Teil von `werte`/`errors` — darf niemals in validate() einfließen.
  // Seit 08/2026 in App.jsx gehoben (siehe CHANGELOG.md), damit die Foto-/
  // PDF-Erkennung in Wohnung.jsx diesen Wert ebenfalls automatisch setzen kann.
  const setPosten = (k, v) => setWerte(p => ({ ...p, [k]: v }));

  const total = ALLE_POSTEN.reduce((s, p) => s + toNum(werte[p.key]), 0);
  const filledPosten = ALLE_POSTEN.filter(p => toNum(werte[p.key]) > 0).length;

  const sucheNorm = normalisiere(suche.trim());
  const sucheAktiv = !!sucheNorm;
  const gefilterteGruppen = useMemo(() => {
    if (!sucheNorm) return POSTEN_GRUPPEN;
    return POSTEN_GRUPPEN
      .map(gruppe => ({
        ...gruppe,
        posten: gruppe.posten.filter(p => {
          const haystack = [p.label, p.tip, ...(p.aliases || [])].map(normalisiere).join(" · ");
          return haystack.includes(sucheNorm);
        }),
      }))
      .filter(gruppe => gruppe.posten.length > 0);
  }, [sucheNorm]);

  // Abgleich mit der auf der Abrechnung aufgedruckten Gesamtsumme. Bewusst NUR
  // ein Hinweis, KEIN Blocker: Eine Abrechnung kann selbst fehlerhaft/unplausibel
  // sein — genau das ist oft der Grund, weshalb jemand prüfen lässt. Ein Kunde
  // darf deshalb nie am Abschließen gehindert werden, nur weil seine Eingabe
  // nicht zur (möglicherweise falschen) Summe des Vermieters passt.
  const gesamtsummeNum = toNum(gesamtsummeAbrechnung);
  const summenDiff = gesamtsummeNum > 0 && total > 0 ? Math.abs(gesamtsummeNum - total) : 0;
  const summenAbweichung = summenDiff > 1;

  function toggleGruppe(id) {
    setExpandedGruppen(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function validate() {
    const e = {};
    const pflichtfehlend = ALLE_POSTEN.filter(p => p.pflicht && toNum(werte[p.key]) <= 0);
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
        <h2 style={{ fontFamily: THEME.font.heading, fontSize: 20, fontWeight: 600, margin: "0 0 4px", textAlign: "center" }}>Posten aus deiner Abrechnung</h2>
        <p style={{ fontSize: 12, color: C.textMuted, margin: "0 0 12px", textAlign: "center" }}>Trage die Beträge so ein wie sie auf der Abrechnung stehen. ✦ = Pflichtfeld.</p>
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
        <div style={{ marginBottom: 12 }}>
          <EuroInput label="Gesamtsumme laut Abrechnung" value={gesamtsummeAbrechnung} tip="Optional — steht meist oben auf der Abrechnung als 'Summe'. Dient nur dem Abgleich, hat keinen Einfluss aufs Fortfahren."
            onChange={setGesamtsummeAbrechnung} />
          {summenAbweichung && (
            <div style={{ background: C.warnBg, borderLeft: "3px solid " + C.warn, borderRadius: THEME.radius.md, padding: "10px 14px", marginTop: -4, fontSize: 12, color: C.warn, lineHeight: 1.6 }}>
              Hinweis: Deine eingetragenen Posten ({fmt(total)}) weichen von der Gesamtsumme laut Abrechnung ({fmt(gesamtsummeNum)}) ab — möglicherweise fehlt ein Posten. Reine Information, hindert dich nicht am Fortfahren: Eine Abrechnung kann auch selbst fehlerhaft sein, genau das würden wir dann prüfen.
            </div>
          )}
        </div>
        <div style={{ position: "relative", marginBottom: 4 }}>
          <input
            type="text"
            value={suche}
            onChange={e => setSuche(e.target.value)}
            placeholder="Suche z. B. 'Sturm', 'Kabel', 'Müll' … oder Begriff von deiner Abrechnung"
            style={{ width: "100%", boxSizing: "border-box", background: C.surface, border: "1px solid " + C.border, borderRadius: THEME.radius.md, padding: "11px 14px", fontSize: 13, fontFamily: THEME.font.body, color: C.text }}
          />
          {suche && (
            <button onClick={() => setSuche("")} aria-label="Suche löschen"
              style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: C.textDim, fontSize: 16, cursor: "pointer", padding: 4 }}>
              ×
            </button>
          )}
        </div>
      </div>
      <div style={{ padding: "10px 20px 120px", maxWidth: THEME.layout.formMax, margin: "0 auto", boxSizing: "border-box" }}>
        {gefilterteGruppen.length === 0 && (
          <div style={{ textAlign: "center", padding: "24px 12px", fontSize: 13, color: C.textMuted }}>
            Kein Posten gefunden für "{suche}". Falls du den Begriff auf deiner Abrechnung nicht wiederfindest, trage ihn unter "Sonstige vereinbarte Betriebskosten" ein.
          </div>
        )}
        {gefilterteGruppen.map(gruppe => {
          const groupSum = gruppe.posten.reduce((s, p) => s + toNum(werte[p.key]), 0);
          // Seltene Posten (Aufzug, Tiefgarage, Glasversicherung u.Ä.) sind
          // standardmäßig hinter einem Link versteckt, damit die Liste nicht
          // erschlägt — außer die Suche ist aktiv (dann sollen Treffer immer
          // sichtbar sein) oder die Gruppe wurde manuell aufgeklappt, oder
          // bereits ein Wert eingetragen ist (sonst würde ein befüllter Posten
          // beim Neuladen/Zurückkommen plötzlich "verschwinden").
          const gruppeExpandiert = sucheAktiv || expandedGruppen.has(gruppe.id);
          const sichtbarePosten = gruppe.posten.filter(p => !p.selten || gruppeExpandiert || toNum(werte[p.key]) > 0);
          const versteckteAnzahl = gruppe.posten.length - sichtbarePosten.length;
          return (
            <div key={gruppe.id} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, padding: "0 2px", marginBottom: 6 }}>
                <span style={{ fontSize: 15 }}>{gruppe.icon}</span>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text, textTransform: "uppercase", letterSpacing: "0.03em" }}>{gruppe.label}</div>
                <div style={{ fontSize: 10, color: C.textDim }}>{gruppe.paragraf}</div>
                {groupSum > 0 && <div style={{ marginLeft: "auto", fontSize: 12, color: C.accent, fontWeight: 600 }}>{fmt(groupSum)}</div>}
              </div>
              {gruppe.hint && <div style={{ fontSize: 10, color: C.textDim, margin: "-2px 2px 8px" }}>{gruppe.hint}</div>}
              <div style={{ background: C.surface, border: "1px solid " + (groupSum > 0 ? C.brand : C.border), borderRadius: THEME.radius.md, padding: "10px 12px" }}>
                {sichtbarePosten.map(p => (
                  <EuroInput key={p.key} label={p.label} value={werte[p.key]} tip={p.tip} pflicht={p.pflicht}
                    warn={p.key === "kabelanschluss" && toNum(werte[p.key]) > 0}
                    onChange={v => setPosten(p.key, v)} />
                ))}
                {versteckteAnzahl > 0 && (
                  <button onClick={() => toggleGruppe(gruppe.id)}
                    style={{ background: "none", border: "none", color: C.brand, fontSize: 12, fontWeight: 600, cursor: "pointer", padding: "4px 0 2px", fontFamily: THEME.font.body }}>
                    + {versteckteAnzahl} weitere{versteckteAnzahl === 1 ? "r" : ""} Posten in dieser Kategorie anzeigen
                  </button>
                )}
              </div>
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
