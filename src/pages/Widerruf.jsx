// ─────────────────────────────────────────────────────────────────────────
// Widerruf.jsx — URL: "/widerruf". NEU 17.10.2026 (Compliance-Check)
//
// Elektronische Widerrufsfunktion ("Widerrufsbutton", § 356a BGB, gilt seit
// 19.06.2026 für online geschlossene Verbraucherverträge). Erreichbar über
// den Link "Vertrag widerrufen" in der Fußzeile jeder Seite.
//
// Ablauf, wie vom Gesetz vorgegeben:
//   1. Schaltfläche "Vertrag widerrufen" (Fußzeile) führt hierher.
//   2. Hier gibt der Kunde Name, Angaben zur Bestellung und die E-Mail-
//      Adresse für die Eingangsbestätigung an.
//   3. Schaltfläche "Widerruf bestätigen" schickt die Erklärung ab.
//   4. Der Kunde bekommt sofort eine Eingangsbestätigung mit Inhalt, Datum
//      und Uhrzeit per E-Mail (api/contact.js, typ "widerruf").
//
// Warum das auch bei uns nötig ist, obwohl das Widerrufsrecht bei digitalen
// Inhalten meist sofort erlischt: Es erlischt nur, wenn alle Bedingungen
// des § 356 Abs. 5 BGB erfüllt sind (siehe src/lib/vertragsmail.js). Ist
// das im Einzelfall nicht so, besteht das Widerrufsrecht 14 Tage, und dann
// muss der Kunde es über diese Funktion ausüben können. Ob ein Widerruf
// wirksam ist, prüft Stefan anhand der Bestellung und meldet sich.
// ─────────────────────────────────────────────────────────────────────────
import { useState } from "react";
import { THEME } from "../config/theme.js";
import LegalFooter from "../components/layout/LegalFooter.jsx";
import Field from "../components/ui/Field.jsx";

export default function Widerruf({ navigateTo }) {
  const C = THEME.color;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bestellung, setBestellung] = useState("");
  const [nachricht, setNachricht] = useState("");
  const [sending, setSending] = useState(false);
  const [eingang, setEingang] = useState(null); // Zeitstempel vom Server nach Erfolg
  const [error, setError] = useState("");

  async function bestaetigen() {
    if (!name.trim()) { setError("Bitte deinen Namen angeben"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Bitte eine gültige E-Mail-Adresse angeben, an die wir die Eingangsbestätigung schicken"); return; }
    if (!bestellung.trim()) { setError("Bitte die Bestellung angeben (z. B. Kaufdatum und gekaufte Stufe oder die Bestellnummer aus der Vertragsbestätigung)"); return; }
    setSending(true); setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ typ: "widerruf", name, email, bestellung, message: nachricht }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.eingang) setEingang(data.eingang);
      else setError("Das hat leider nicht geklappt. Bitte schreib deinen Widerruf direkt an support@nebenkostenradar.com, das ist genauso wirksam.");
    } catch {
      setError("Netzwerkfehler. Bitte schreib deinen Widerruf direkt an support@nebenkostenradar.com, das ist genauso wirksam.");
    }
    setSending(false);
  }

  return (
    <div style={{ fontFamily: THEME.font.body, background: C.bg, color: C.text, minHeight: "100vh" }}>
      <div style={{ background: C.surface, padding: "20px 20px 16px", borderBottom: "1px solid " + C.border }}>
        <button onClick={() => navigateTo("welcome")} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 13, padding: "0 0 10px", fontFamily: THEME.font.body }}>← Zurück</button>
        <h1 style={{ margin: 0, fontSize: 19, fontWeight: 600, fontFamily: THEME.font.heading }}>Vertrag widerrufen</h1>
      </div>
      <div style={{ padding: "24px 20px 60px", maxWidth: 620, margin: "0 auto" }}>
        {eingang ? (
          <div style={{ background: C.brandBg, borderRadius: THEME.radius.md, padding: "16px 18px" }}>
            <div style={{ fontSize: 15, color: C.brand, fontWeight: 700, marginBottom: 6 }}>✓ Dein Widerruf ist bei uns eingegangen</div>
            <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.7 }}>
              Eingang: {eingang}. Eine Bestätigung mit dem Inhalt deiner Erklärung haben wir an <strong style={{ color: C.text }}>{email.trim()}</strong> geschickt. Wir prüfen die Bestellung und melden uns bei dir.
            </div>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: C.text, margin: "0 0 12px" }}>
              Hier kannst du einen Vertrag widerrufen, den du über nebenkostenradar.com geschlossen hast. Gib dazu deinen Namen, die Bestellung und eine E-Mail-Adresse an. Wir schicken dir sofort eine Eingangsbestätigung.
            </p>
            <p style={{ fontSize: 12.5, lineHeight: 1.7, color: C.textMuted, margin: "0 0 20px" }}>
              Gut zu wissen: Bei unseren PDF-Berichten erlischt das Widerrufsrecht in der Regel, sobald das PDF bereitgestellt ist, wenn du beim Kauf der sofortigen Ausführung zugestimmt hast (siehe <a href="/agb" onClick={e => { e.preventDefault(); navigateTo("agb"); }} style={{ color: C.brand }}>AGB § 6</a>). Wir prüfen jeden Widerruf anhand der Bestellung und melden uns.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Field label="Name" value={name} onChange={v => { setName(v); setError(""); }} placeholder="Vor- und Nachname" required />
              <Field label="Bestellung" value={bestellung} onChange={v => { setBestellung(v); setError(""); }} placeholder="z. B. Kauf vom 12.10.2026, Auswertung + Brief" required />
              <Field label="E-Mail-Adresse für die Eingangsbestätigung" value={email} onChange={v => { setEmail(v); setError(""); }} type="email" placeholder="deine@email.de" required />
              <div>
                <label style={{ fontSize: 12, color: C.textMuted, display: "block", marginBottom: 5 }}>Nachricht (optional)</label>
                <textarea value={nachricht} onChange={e => setNachricht(e.target.value)} rows={3}
                  style={{ width: "100%", boxSizing: "border-box", background: C.surface, border: "1.5px solid " + C.border, borderRadius: THEME.radius.md, padding: "12px 14px", fontSize: 14, fontFamily: THEME.font.body, color: C.text, outline: "none", resize: "vertical" }} />
              </div>
              {error && <div style={{ fontSize: 12.5, color: "#c0392b", lineHeight: 1.6 }}>⚠ {error}</div>}
              <button onClick={bestaetigen} disabled={sending}
                style={{ background: sending ? C.border : C.accent, color: sending ? C.textDim : C.accentText, border: "none", borderRadius: THEME.radius.md, padding: "14px 16px", fontSize: 15, fontFamily: THEME.font.heading, fontWeight: 600, cursor: sending ? "not-allowed" : "pointer" }}>
                {sending ? "Wird gesendet…" : "Widerruf bestätigen"}
              </button>
              <p style={{ fontSize: 11.5, color: C.textDim, lineHeight: 1.6, margin: 0 }}>
                Du kannst den Widerruf auch formlos per E-Mail an support@nebenkostenradar.com erklären. Wie wir deine Angaben verarbeiten, steht in der <a href="/datenschutz" onClick={e => { e.preventDefault(); navigateTo("datenschutz"); }} style={{ color: C.brand }}>Datenschutzerklärung</a> (Abschnitt 8).
              </p>
            </div>
          </>
        )}
      </div>
      <LegalFooter navigateTo={navigateTo} />
    </div>
  );
}
