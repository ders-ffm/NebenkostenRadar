// ─────────────────────────────────────────────────────────────────────────
// Result.jsx — Ergebnis-Seite + Preisstufen-Auswahl. URL: "/pruefen/ergebnis"
//
// Zeigt eine kostenlose Vorschau (3 Positionen). Bei Kaufwunsch: Nutzer wählt
// Stufe (Auswertung 7,99€ / Auswertung+Brief 9,99€), Widerrufs-Checkbox
// (Pflicht nach § 356 Abs. 5 BGB), dann weiter zu Adressen (nur bei "voll")
// oder direkt zu handleKaufen() (bei "auswertung").
// ─────────────────────────────────────────────────────────────────────────
import { useState } from "react";
import { THEME } from "../config/theme.js";
import { BUSINESS } from "../config/business.js";
import { fmt } from "../lib/format.js";
import { BEWERTUNG } from "../lib/analyse.js";
import Btn from "../components/ui/Btn.jsx";
import LegalFooter from "../components/layout/LegalFooter.jsx";

const STATUS_LABEL = { ok: "✓ Unauffällig", hoch: "↑ Erhöht", sehr_hoch: "↑↑ Stark erhöht", nicht_umlagefaehig: "✗ Nicht zulässig", pruefen: "? Prüfen" };

export default function Result({ navigateTo, result, wohnung, setStufe, resetAll }) {
  const C = THEME.color;
  const [widerrufOk, setWiderrufOk] = useState(false);
  // Vorauswahl "voll" (inkl. Musterbrief) nur, wenn es laut Analyse überhaupt
  // etwas gibt, das ein Brief ansprechen könnte — bei "ok" wäre ein
  // Widerspruchsbrief ohne Widerspruchsgrund unpassend, daher dort die
  // günstigere Stufe ohne Brief vorausgewählt (Nutzer kann trotzdem wechseln).
  const [gewaehlteStufe, setGewaehlteStufe] = useState(() => result?.gesamtbewertung === "ok" ? "auswertung" : "voll");

  if (!result) {
    return (
      <div style={{ fontFamily: THEME.font.body, background: C.bg, minHeight: "100vh", padding: 40, textAlign: "center" }}>
        <p style={{ color: C.textMuted }}>Kein Ergebnis vorhanden.</p>
        <button onClick={() => navigateTo("wohnung")} style={{ background: C.accent, color: C.accentText, border: "none", borderRadius: THEME.radius.md, padding: "12px 28px", fontFamily: THEME.font.heading, cursor: "pointer" }}>Neu starten</button>
      </div>
    );
  }

  const bew = BEWERTUNG[result.gesamtbewertung] || BEWERTUNG.auffaellig;
  const statusFarbe = { ok: C.ok, hoch: C.warn, sehr_hoch: C.warn, nicht_umlagefaehig: C.critical, pruefen: C.warn };

  function weiterZumKauf() {
    if (!widerrufOk) return;
    setStufe(gewaehlteStufe);
    if (gewaehlteStufe === "voll") navigateTo("adressen");
    else navigateTo("adressen"); // Adressen-Seite wird für beide Stufen genutzt (Absenderdaten fürs PDF), Brief-Empfängerfelder dort optional
  }

  return (
    <div style={{ fontFamily: THEME.font.body, background: C.bg, color: C.text, minHeight: "100vh" }}>
      <div style={{ background: C.surface, padding: "22px 20px 18px", borderBottom: "1px solid " + C.border }}>
        <div style={{ fontSize: 10, color: C.textDim, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>NebenkostenRadar · Ergebnis {wohnung.jahr}</div>
        <h1 style={{ fontFamily: THEME.font.heading, fontSize: 22, fontWeight: 600, margin: 0 }}>Deine Analyse</h1>
      </div>

      <div style={{ padding: "16px 20px 60px", maxWidth: 640, margin: "0 auto" }}>
        <div style={{ background: bew.bg, borderLeft: "4px solid " + bew.farbe, borderRadius: THEME.radius.lg, padding: "14px 16px", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 22 }}>{bew.icon}</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: bew.farbe, fontFamily: THEME.font.heading }}>{bew.label}{result.fehler_anzahl > 0 ? " · " + result.fehler_anzahl + " Fehler" : ""}</div>
              <div style={{ fontSize: 11, color: C.textMuted }}>{bew.sub}</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.6 }}>{result.zusammenfassung}</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
          {[
            { l: "Dein €/m²/Jahr", v: fmt(result.pro_qm_gesamt) },
            { l: "DMB-Richtwert", v: fmt(result.richtwert_pro_qm_jahr) },
            { l: "Mögl. Ersparnis", v: result.moegliche_ersparnis > 0 ? fmt(result.moegliche_ersparnis) : "Keine", hi: result.moegliche_ersparnis > 0 },
            { l: "Geprüfte Posten", v: result.posten_bewertung.length },
          ].map(k => (
            <div key={k.l} style={{ background: k.hi ? C.brandBg : C.surface, border: "1px solid " + (k.hi ? C.brand : C.border), borderRadius: THEME.radius.md, padding: "11px 12px" }}>
              <div style={{ fontSize: 9, color: C.textDim, textTransform: "uppercase", marginBottom: 3 }}>{k.l}</div>
              <div style={{ fontFamily: THEME.font.heading, fontSize: 17, fontWeight: 600, color: k.hi ? C.brand : C.text }}>{k.v}</div>
            </div>
          ))}
        </div>

        <div style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: THEME.radius.md, marginBottom: 14, overflow: "hidden" }}>
          <div style={{ padding: "11px 16px", borderBottom: "1px solid " + C.border, fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>
            Positions-Vorschau (3 von {result.posten_bewertung.length})
          </div>
          {result.posten_bewertung.slice(0, 3).map((p, i, arr) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", padding: "11px 16px", borderBottom: i < arr.length - 1 ? "1px solid " + C.border : "none" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{p.posten}</div>
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2, lineHeight: 1.4 }}>{p.hinweis}</div>
              </div>
              <div style={{ textAlign: "right", marginLeft: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{fmt(p.betrag)}</div>
                <div style={{ fontSize: 10, fontWeight: 600, marginTop: 2, color: statusFarbe[p.status] || C.textMuted }}>{STATUS_LABEL[p.status] || p.status}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Bewusst andere Rahmung, wenn nichts gefunden wurde (08/2026, siehe
            CHANGELOG.md): "gesamtbewertung: ok" bedeutet laut buildResult()
            in lib/analyse.js, dass es WIRKLICH keinen einzigen Widerspruchs-
            grund gibt (kein hoch/sehr_hoch/pruefen/nicht_umlagefaehig, ≤ 1
            Widerspruch). Ein Kauf würde in diesem Fall niemandem beim
            Widerspruch helfen, es gäbe schlicht nichts, das ein Musterbrief
            enthalten könnte. Stefans ausdrücklicher Wunsch: nicht verkaufen,
            nur weil es technisch möglich ist, sondern ehrlich sagen, wenn ein
            Kauf keinen Mehrwert hätte — das ist wichtiger als die Conversion. */}
        {result.gesamtbewertung === "ok" && (
          <div style={{ background: C.okBg, border: "1px solid " + C.ok, borderRadius: THEME.radius.lg, padding: "16px 18px", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 18 }}>✅</span>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.ok, fontFamily: THEME.font.heading }}>Kein Widerspruch nötig</div>
            </div>
            <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>
              Wir haben keine Position gefunden, die einen Widerspruch beim Vermieter rechtfertigen würde. Ein kostenpflichtiger Bericht bringt dir hier wahrscheinlich keinen zusätzlichen Nutzen, du bräuchtest ihn nur, wenn du die Prüfung trotzdem schriftlich dokumentieren möchtest.
            </div>
          </div>
        )}

        <div style={{ background: C.surface, border: "2px solid " + C.text, borderRadius: THEME.radius.xl, padding: "20px 18px" }}>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <h3 style={{ margin: "0 0 6px", fontSize: 16, fontFamily: THEME.font.heading }}>
              {result.gesamtbewertung === "ok" ? "Trotzdem als PDF dokumentieren" : "Vollständige Auswertung als PDF"}
            </h3>
            <p style={{ margin: 0, fontSize: 12, color: C.textMuted }}>
              {result.gesamtbewertung === "ok"
                ? "Optional — für deine eigenen Unterlagen, nicht für einen Widerspruch nötig"
                : "Alle " + result.posten_bewertung.length + " Positionen mit Richtwerten und Begründungen"}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            <button onClick={() => setGewaehlteStufe("auswertung")}
              style={{ textAlign: "left", background: gewaehlteStufe === "auswertung" ? C.brandBg : C.bg, border: "2px solid " + (gewaehlteStufe === "auswertung" ? C.brand : C.border), borderRadius: THEME.radius.md, padding: "14px", cursor: "pointer" }}>
              <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>Nur Auswertung</div>
              <div style={{ fontFamily: THEME.font.heading, fontSize: 19, fontWeight: 600, color: C.text }}>{BUSINESS.PREIS_AUSWERTUNG.toFixed(2)} €</div>
              <div style={{ fontSize: 10, color: C.textDim, marginTop: 4 }}>1-seitiges PDF</div>
            </button>
            <button onClick={() => setGewaehlteStufe("voll")}
              style={{ textAlign: "left", background: gewaehlteStufe === "voll" ? C.brandBg : C.bg, border: "2px solid " + (gewaehlteStufe === "voll" ? C.brand : C.border), borderRadius: THEME.radius.md, padding: "14px", cursor: "pointer", position: "relative" }}>
              {/* "Empfohlen"-Badge nur, wenn es laut Analyse auch etwas gibt, das ein
                  Widerspruchsbrief ansprechen könnte — bei "ok" wäre der Brief ohne
                  Widerspruchsgrund keine echte Empfehlung, siehe Kommentar oben. */}
              {result.gesamtbewertung !== "ok" && (
                <div style={{ position: "absolute", top: -9, right: 10, background: C.accent, color: C.accentText, fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>Empfohlen</div>
              )}
              <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>Auswertung + Brief</div>
              <div style={{ fontFamily: THEME.font.heading, fontSize: 19, fontWeight: 600, color: C.text }}>{BUSINESS.PREIS_VOLL.toFixed(2)} €</div>
              <div style={{ fontSize: 10, color: C.textDim, marginTop: 4 }}>2-seitiges PDF inkl. Musterbrief</div>
            </button>
          </div>

          {result.moegliche_ersparnis > 0 && (
            <div style={{ background: C.brandBg, borderLeft: "3px solid " + C.brand, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: C.brand, marginBottom: 14 }}>
              Mögliche Rückforderung laut Analyse: <strong>{fmt(result.moegliche_ersparnis)}</strong>
            </div>
          )}

          <div style={{ background: C.bg, border: "1px solid " + C.border, borderRadius: THEME.radius.md, padding: "12px 14px", marginBottom: 12 }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
              <input type="checkbox" checked={widerrufOk} onChange={e => setWiderrufOk(e.target.checked)}
                style={{ marginTop: 3, flexShrink: 0, width: 16, height: 16, cursor: "pointer", accentColor: C.accent }} />
              <span style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.6 }}>
                Ich stimme zu, dass mit der Ausführung des Vertrags sofort begonnen wird, und ich habe zur Kenntnis genommen, dass ich mit Beginn der Ausführung mein <strong style={{ color: C.text }}>Widerrufsrecht verliere</strong> (§ 356 Abs. 5 BGB i. V. m. § 18 VRRL). Das PDF steht sofort nach Zahlung zur Verfügung.
              </span>
            </label>
          </div>

          <div style={{ fontSize: 11, color: C.textDim, marginBottom: 12, lineHeight: 1.7, textAlign: "center" }}>
            Anbieter: NebenkostenRadar · Inhaber: Stefan Hennig · Frankfurt am Main<br />
            Zahlung über Stripe · Kein Abo · Einmalige Zahlung
          </div>

          <Btn onClick={weiterZumKauf} disabled={!widerrufOk}>
            Weiter · {gewaehlteStufe === "voll" ? BUSINESS.PREIS_VOLL.toFixed(2) : BUSINESS.PREIS_AUSWERTUNG.toFixed(2)} €
          </Btn>
          {!widerrufOk && <div style={{ textAlign: "center", fontSize: 11, color: C.warn, marginTop: 6 }}>⚠ Bitte zuerst die Checkbox oben bestätigen</div>}

          <div style={{ textAlign: "center", marginTop: 8, fontSize: 10, color: C.textDim }}>
            Mit dem Kauf akzeptierst du unsere{" "}
            <button onClick={() => navigateTo("agb")} style={{ background: "none", border: "none", color: C.textDim, textDecoration: "underline", cursor: "pointer", fontSize: 10, padding: 0 }}>AGB</button>{" "}
            und{" "}
            <button onClick={() => navigateTo("datenschutz")} style={{ background: "none", border: "none", color: C.textDim, textDecoration: "underline", cursor: "pointer", fontSize: 10, padding: 0 }}>Datenschutzerklärung</button>
          </div>
        </div>

        <button onClick={resetAll} style={{ width: "100%", marginTop: 12, background: "transparent", border: "1px solid " + C.border, color: C.textMuted, borderRadius: THEME.radius.lg, padding: "14px", fontSize: 14, fontFamily: THEME.font.body, cursor: "pointer" }}>
          ← Neue Prüfung starten
        </button>
        <p style={{ textAlign: "center", fontSize: 10, color: C.textDim, marginTop: 12, lineHeight: 1.6 }}>Keine Rechtsberatung. Deutscher Mieterbund: mieterbund.de · Tel. 030 223230</p>
      </div>
      <LegalFooter navigateTo={navigateTo} />
    </div>
  );
}
