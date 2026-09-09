// ─────────────────────────────────────────────────────────────────────────
// Adressen.jsx — letzter Schritt vor der Zahlung. URL: "/pruefen/absender"
//
// GRUNDLEGEND UMGEBAUT 09.09.2026 (siehe planung/werbeplan-nkr.md Abschnitt
// 8.6 und CHANGELOG.md). Auslöser: Auswertung der Supabase-Daten hat gezeigt,
// dass ALLE 26 Zeilen in nkr_reports aus Stefans eigener Testphase
// (08.–14.08.2026) stammen. Seither: kein einziger echter Nutzer, der dieses
// Formular abgeschickt hat — obwohl laut GA4 drei Nutzer es geöffnet hatten.
// Drei von drei sind hier ausgestiegen.
//
// VORHER standen hier bis zu 10 Pflichtfelder VOR der Zahlung:
//   E-Mail, E-Mail-Wiederholung (mit blockiertem Einfügen!), Name, Straße,
//   PLZ, Ort — und bei Stufe "voll" zusätzlich die komplette Vermieteradresse.
// Damit wurde dem Nutzer im Moment der größten Kaufbereitschaft Hausaufgaben
// aufgegeben: Für die Vermieteranschrift muss man erst den Mietvertrag oder
// die Abrechnung heraussuchen.
//
// JETZT: genau EIN Pflichtfeld vor der Zahlung — die E-Mail-Adresse, weil wir
// ohne sie nichts zustellen können. Alles andere wird NACH der Zahlung in
// Download.jsx erhoben. Das ist auch fachlich korrekt: Die Adressdaten werden
// ausschließlich fürs PDF gebraucht (Briefkopf in PruefberichtDocument.jsx,
// Empfängerblock in BriefPDF.jsx) — und das PDF entsteht ohnehin erst nach
// der Zahlung.
//
// Wiederholungsfeld + Paste-Sperre ersatzlos gestrichen: Die doppelte Eingabe
// sollte Tippfehler abfangen, kostet aber jeden ehrlichen Nutzer einen
// zusätzlichen Arbeitsschritt. Ersatz ist die deutlich sichtbare Rückmeldung
// unten ("Wir schicken es an: …"), die denselben Zweck ohne Zusatzaufwand
// erfüllt. Zusätzliche Absicherung: Das PDF liegt nach der Zahlung ohnehin
// direkt auf der Download-Seite zum Herunterladen bereit — eine vertippte
// E-Mail führt also nicht zum Totalverlust.
// ─────────────────────────────────────────────────────────────────────────
import { useState } from "react";
import { THEME } from "../config/theme.js";
import Field from "../components/ui/Field.jsx";
import Btn from "../components/ui/Btn.jsx";
import StepBar from "../components/ui/StepBar.jsx";
import { BUSINESS } from "../config/business.js";

export default function Adressen({ navigateTo, adressen, setAdressen, stufe, werte, wohnung, marketingOptIn, setMarketingOptIn, widerrufOk }) {
  const C = THEME.color;
  const [errors, setErrors] = useState({});
  const [laeuft, setLaeuft] = useState(false);
  const setA = (k, v) => setAdressen(p => ({ ...p, [k]: v }));
  const preis = stufe === "voll" ? BUSINESS.PREIS_VOLL : BUSINESS.PREIS_AUSWERTUNG;

  function validate() {
    const e = {};
    const mail = (adressen.email || "").trim();
    if (!mail) e.email = "Pflichtfeld";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) e.email = "Ungültige E-Mail-Adresse";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  const mailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((adressen.email || "").trim());

  return (
    <div style={{ fontFamily: THEME.font.body, background: C.bg, color: C.text, minHeight: "100vh" }}>
      <div style={{ background: C.surface, borderBottom: "1px solid " + C.border }}>
        <div style={{ padding: "20px 20px 0", maxWidth: THEME.layout.formMax, margin: "0 auto", boxSizing: "border-box" }}>
          <button onClick={() => navigateTo("result")} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 13, padding: "0 0 12px", fontFamily: THEME.font.body }}>← Zurück</button>
          <StepBar current={3} total={3} label="Zahlung" />
        </div>
      </div>

      <div style={{ padding: "22px 20px 40px", maxWidth: THEME.layout.formMax, margin: "0 auto", boxSizing: "border-box" }}>
        <h2 style={{ fontFamily: THEME.font.heading, fontSize: 21, fontWeight: 600, margin: "0 0 6px", textAlign: "center" }}>Wohin sollen wir dein PDF schicken?</h2>
        <p style={{ fontSize: 13, color: C.textMuted, margin: "0 0 22px", textAlign: "center" }}>
          Nur die E-Mail-Adresse. Deine Anschrift für den Bericht fragen wir direkt nach der Zahlung ab — das dauert keine Minute.
        </p>

        <div style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: THEME.radius.lg, padding: "16px", marginBottom: 14 }}>
          <Field
            label="E-Mail-Adresse"
            type="email"
            value={adressen.email}
            onChange={v => setA("email", v)}
            placeholder="max@beispiel.de"
            required
            error={errors.email}
            autoFocus
          />
          {/* Ersetzt das frühere Wiederholungsfeld: sichtbare Rückmeldung statt
              zweitem Tippen. Erscheint erst, wenn die Adresse formal gültig ist. */}
          {mailOk && !errors.email && (
            <div style={{ fontSize: 12.5, color: C.textMuted, marginTop: -4, lineHeight: 1.6 }}>
              Wir schicken es an: <strong style={{ color: C.text }}>{adressen.email.trim()}</strong> — bitte kurz prüfen.
            </div>
          )}
        </div>

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

        <Btn disabled={laeuft} onClick={async () => {
          if (!validate()) return;
          setLaeuft(true);
          const sessionId = crypto.randomUUID();
          // Ergebnisdaten vor dem Stripe-Redirect speichern, damit Download.jsx
          // nach der Zahlung das PDF erzeugen kann. Die Adressfelder sind an
          // dieser Stelle absichtlich noch leer — sie werden dort nachgetragen
          // (PATCH auf dieselbe Zeile, siehe api/save-report.js).
          try {
            await fetch("/api/save-report", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sessionId, stufe, adressen, werte, wohnung, marketingOptIn: !!marketingOptIn, widerrufOk: !!widerrufOk }),
            });
          } catch (e) {
            console.error("Zwischenspeichern fehlgeschlagen:", e);
          }
          const link = stufe === "voll" ? BUSINESS.STRIPE_LINK_VOLL : BUSINESS.STRIPE_LINK_AUSWERTUNG;
          window.location.href = link + "?client_reference_id=" + sessionId;
        }}>
          {laeuft ? "Einen Moment …" : "Jetzt kaufen · " + preis.toFixed(2).replace(".", ",") + " € →"}
        </Btn>

        <p style={{ fontSize: 11.5, color: C.textDim, textAlign: "center", marginTop: 12, lineHeight: 1.6 }}>
          Zahlung über Stripe · Einmalig, kein Abo · Speicherdauer der Daten maximal 12 Monate, siehe{" "}
          <a href="/datenschutz" onClick={e => { e.preventDefault(); navigateTo("datenschutz"); }} style={{ color: C.brand }}>Datenschutzerklärung</a>.
        </p>
      </div>
    </div>
  );
}
