// ─────────────────────────────────────────────────────────────────────────
// Adressen.jsx — Absender-/Empfänger-Daten fürs PDF. URL: "/pruefen/absender"
// Bei Stufe "auswertung" werden nur Absenderdaten für den PDF-Kopf gebraucht,
// die Vermieter-Felder bleiben optional (kein Brief nötig).
// ─────────────────────────────────────────────────────────────────────────
import { useState } from "react";
import { THEME } from "../config/theme.js";
import { BUSINESS } from "../config/business.js";
import Field from "../components/ui/Field.jsx";
import Btn from "../components/ui/Btn.jsx";
import StepBar from "../components/ui/StepBar.jsx";

export default function Adressen({ navigateTo, adressen, setAdressen, stufe, werte, wohnung, marketingOptIn, setMarketingOptIn }) {
  const C = THEME.color;
  const [errors, setErrors] = useState({});
  const [emailWiederholen, setEmailWiederholen] = useState("");
  const setA = (k, v) => setAdressen(p => ({ ...p, [k]: v }));
  const brauchtVermieter = stufe === "voll";
  // Paste bewusst blockiert (Copy&Paste UND Drag&Drop) — sonst würde eine
  // einmal falsch eingegebene Adresse einfach in beide Felder übertragen,
  // und die doppelte Eingabe würde ihren Zweck (Tippfehler abfangen) verfehlen.
  const keinPaste = e => e.preventDefault();

  function validate() {
    const e = {};
    if (!adressen.email.trim()) e.email = "Pflichtfeld";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adressen.email.trim())) e.email = "Ungültige E-Mail-Adresse";
    if (!emailWiederholen.trim()) e.emailWiederholen = "Pflichtfeld";
    else if (adressen.email.trim().toLowerCase() !== emailWiederholen.trim().toLowerCase()) e.emailWiederholen = "E-Mail-Adressen stimmen nicht überein";
    if (!adressen.mieterName.trim()) e.mieterName = "Pflichtfeld";
    if (!adressen.mieterStrasse.trim()) e.mieterStrasse = "Pflichtfeld";
    if (!/^\d{5}$/.test(adressen.mieterPlz)) e.mieterPlz = "5-stellige PLZ";
    if (!adressen.mieterOrt.trim()) e.mieterOrt = "Pflichtfeld";
    if (brauchtVermieter) {
      if (!adressen.vermieterName.trim()) e.vermieterName = "Pflichtfeld";
      if (!adressen.vermieterStrasse.trim()) e.vermieterStrasse = "Pflichtfeld";
      if (!/^\d{5}$/.test(adressen.vermieterPlz)) e.vermieterPlz = "5-stellige PLZ";
      if (!adressen.vermieterOrt.trim()) e.vermieterOrt = "Pflichtfeld";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  return (
    <div style={{ fontFamily: THEME.font.body, background: C.bg, color: C.text, minHeight: "100vh" }}>
      <div style={{ background: C.surface, borderBottom: "1px solid " + C.border }}>
        <div style={{ padding: "20px 20px 0", maxWidth: THEME.layout.formMax, margin: "0 auto", boxSizing: "border-box" }}>
          <button onClick={() => navigateTo("result")} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 13, padding: "0 0 12px", fontFamily: THEME.font.body }}>← Zurück</button>
          <StepBar current={3} total={3} label="Absender" />
        </div>
      </div>
      <div style={{ padding: "22px 20px 40px", maxWidth: THEME.layout.formMax, margin: "0 auto", boxSizing: "border-box" }}>
        <h2 style={{ fontFamily: THEME.font.heading, fontSize: 21, fontWeight: 600, margin: "0 0 6px" }}>Angaben für dein PDF</h2>
        <p style={{ fontSize: 13, color: C.textMuted, margin: "0 0 22px" }}>Für dein PDF und den Versand per E-Mail. Speicherdauer maximal 12 Monate, siehe Datenschutzerklärung.</p>

        <div style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: THEME.radius.lg, padding: "16px", marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: C.accent, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>Kontakt</div>
          <Field label="E-Mail-Adresse" type="email" value={adressen.email} onChange={v => setA("email", v)} placeholder="max@beispiel.de" required error={errors.email} autoFocus />
          <Field label="E-Mail-Adresse wiederholen" type="email" value={emailWiederholen} onChange={setEmailWiederholen} placeholder="max@beispiel.de" required error={errors.emailWiederholen} onPaste={keinPaste} onDrop={keinPaste} tip="Zum Abgleich bitte erneut eintippen" />
        </div>

        <div style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: THEME.radius.lg, padding: "16px", marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: C.accent, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>Deine Adresse</div>
          <Field label="Vor- und Nachname" value={adressen.mieterName} onChange={v => setA("mieterName", v)} placeholder="Max Mustermann" required error={errors.mieterName} />
          <Field label="Straße und Hausnummer" value={adressen.mieterStrasse} onChange={v => setA("mieterStrasse", v)} placeholder="Musterstraße 12" required error={errors.mieterStrasse} />
          <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 10 }}>
            <Field label="PLZ" value={adressen.mieterPlz} onChange={v => setA("mieterPlz", v)} placeholder="12345" required error={errors.mieterPlz} />
            <Field label="Ort" value={adressen.mieterOrt} onChange={v => setA("mieterOrt", v)} placeholder="Musterstadt" required error={errors.mieterOrt} />
          </div>
        </div>

        {brauchtVermieter && (
          <div style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: THEME.radius.lg, padding: "16px", marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>Vermieter / Hausverwaltung (für den Brief)</div>
            <Field label="Name oder Firma" value={adressen.vermieterName} onChange={v => setA("vermieterName", v)} placeholder="Muster Verwaltungs GmbH" required error={errors.vermieterName} />
            <Field label="Straße und Hausnummer" value={adressen.vermieterStrasse} onChange={v => setA("vermieterStrasse", v)} placeholder="Verwalterstraße 1" required error={errors.vermieterStrasse} />
            <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 10 }}>
              <Field label="PLZ" value={adressen.vermieterPlz} onChange={v => setA("vermieterPlz", v)} placeholder="12345" required error={errors.vermieterPlz} />
              <Field label="Ort" value={adressen.vermieterOrt} onChange={v => setA("vermieterOrt", v)} placeholder="Musterstadt" required error={errors.vermieterOrt} />
            </div>
          </div>
        )}

        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 18, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={!!marketingOptIn}
            onChange={e => setMarketingOptIn(e.target.checked)}
            style={{ marginTop: 3, width: 16, height: 16, accentColor: C.brand, flexShrink: 0 }}
          />
          <span style={{ fontSize: 12.5, color: C.textMuted, lineHeight: 1.6 }}>
            Ja, ich möchte gelegentlich einen Rabattcode für die nächste Prüfung per E-Mail erhalten. Freiwillig, jederzeit mit einem Klick in der Mail widerrufbar. Details in der{" "}
            <a href="/datenschutz" onClick={e => { e.preventDefault(); navigateTo("datenschutz"); }} style={{ color: C.brand }}>Datenschutzerklärung</a>.
          </span>
        </label>

        <Btn onClick={async () => {
          if (!validate()) return;
          const sessionId = crypto.randomUUID();
          // Adress- und Ergebnisdaten vor dem Stripe-Redirect speichern, damit
          // nach der Zahlung (Download.jsx) das PDF erzeugt werden kann.
          try {
            await fetch("/api/save-report", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sessionId, stufe, adressen, werte, wohnung, marketingOptIn: !!marketingOptIn }),
            });
          } catch (e) {
            console.error("Zwischenspeichern fehlgeschlagen:", e);
          }
          const link = stufe === "voll" ? BUSINESS.STRIPE_LINK_VOLL : BUSINESS.STRIPE_LINK_AUSWERTUNG;
          window.location.href = link + "?client_reference_id=" + sessionId;
        }}>
          Jetzt kaufen → Weiter zu Stripe
        </Btn>
      </div>
    </div>
  );
}
