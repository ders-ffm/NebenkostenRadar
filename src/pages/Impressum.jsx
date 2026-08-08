// ─────────────────────────────────────────────────────────────────────────
// Impressum.jsx — URL: "/impressum"
// § 5 DDG. Enthält zwei Kontaktwege (E-Mail + Formular), das war bereits im
// Vorgängerprojekt korrekt gelöst (EuGH-Pflicht zu zwei Kontaktmöglichkeiten).
// ─────────────────────────────────────────────────────────────────────────
import { useState } from "react";
import { THEME } from "../config/theme.js";
import BrandAnschrift from "../components/layout/BrandAnschrift.jsx";
import Field from "../components/ui/Field.jsx";

const ABSCHNITTE = [
  { t: "Angaben gemäß § 5 DDG", brand: true, lines: ["NebenkostenRadar — nebenkostenradar.com", "Inhaber: Stefan Hennig", "Ludwigstr. 33-37", "60327 Frankfurt am Main"] },
  { t: "Kontakt", lines: ["E-Mail: support@nebenkostenradar.com", "Für eine schnelle Antwort nutze bitte auch unser Kontaktformular unten auf dieser Seite."] },
  { t: "Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV", lines: ["Inhaber: Stefan Hennig", "Ludwigstr. 33-37", "60327 Frankfurt am Main"] },
  { t: "Haftungsausschluss", lines: ["Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität können wir keine Gewähr übernehmen."] },
  { t: "Haftung für Links", lines: ["Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben."] },
  { t: "Streitschlichtung", lines: ["Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen (§ 36 VSBG)."] },
];

export default function Impressum({ navigateTo }) {
  const C = THEME.color;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function senden() {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Bitte gültige E-Mail-Adresse eingeben"); return; }
    if (!message.trim()) { setError("Bitte eine Nachricht eingeben"); return; }
    setSending(true); setError("");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email, message }) });
      if (res.ok) setSent(true);
      else setError("Fehler beim Senden — bitte später nochmal versuchen oder direkt an support@nebenkostenradar.com schreiben");
    } catch { setError("Netzwerkfehler — bitte prüfen ob du online bist"); }
    setSending(false);
  }

  return (
    <div style={{ fontFamily: THEME.font.body, background: C.bg, color: C.text, minHeight: "100vh" }}>
      <div style={{ background: C.surface, padding: "20px 20px 16px", borderBottom: "1px solid " + C.border }}>
        <button onClick={() => navigateTo("welcome")} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 13, padding: "0 0 10px", fontFamily: THEME.font.body }}>← Zurück</button>
        <h2 style={{ margin: 0, fontSize: 19, fontWeight: 600, fontFamily: THEME.font.heading }}>Impressum</h2>
      </div>
      <div style={{ padding: "24px 20px 60px", maxWidth: 720, margin: "0 auto" }}>
        {ABSCHNITTE.map((s, i) => (
          <div key={i} style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.accent, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.t}</div>
            {s.brand && <BrandAnschrift />}
            {s.lines.map((line, j) => <div key={j} style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.8 }}>{line}</div>)}
          </div>
        ))}

        <div style={{ marginTop: 8, background: C.surface, border: "1px solid " + C.border, borderRadius: THEME.radius.lg, padding: "20px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.accent, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>Kontaktformular</div>
          <p style={{ fontSize: 12, color: C.textMuted, margin: "0 0 16px", lineHeight: 1.6 }}>Schreib uns direkt — wir antworten in der Regel innerhalb weniger Werktage.</p>
          {sent ? (
            <div style={{ background: C.brandBg, borderRadius: 8, padding: "14px 16px" }}>
              <div style={{ fontSize: 13, color: C.brand, fontWeight: 700 }}>✓ Nachricht wurde gesendet</div>
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 4 }}>Danke für deine Nachricht. Wir melden uns so bald wie möglich.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Field label="Name (optional)" value={name} onChange={setName} placeholder="Dein Name" />
              <Field label="E-Mail-Adresse" value={email} onChange={v => { setEmail(v); setError(""); }} type="email" placeholder="deine@email.de" required />
              <div>
                <label style={{ fontSize: 12, color: C.textMuted, display: "block", marginBottom: 5 }}>Nachricht<span style={{ color: C.accent, marginLeft: 3 }}>*</span></label>
                <textarea value={message} onChange={e => { setMessage(e.target.value); setError(""); }} rows={5} placeholder="Deine Nachricht an uns"
                  style={{ width: "100%", boxSizing: "border-box", background: C.surface, border: "1.5px solid " + C.border, borderRadius: THEME.radius.md, padding: "12px 14px", fontSize: 14, fontFamily: THEME.font.body, color: C.text, outline: "none", resize: "vertical" }} />
              </div>
              {error && <div style={{ fontSize: 12, color: "#c0392b" }}>⚠ {error}</div>}
              <button onClick={senden} disabled={sending}
                style={{ background: sending ? C.border : C.accent, color: sending ? C.textDim : C.accentText, border: "none", borderRadius: THEME.radius.md, padding: "13px 16px", fontSize: 14, fontFamily: THEME.font.heading, fontWeight: 600, cursor: sending ? "not-allowed" : "pointer" }}>
                {sending ? "Wird gesendet…" : "Nachricht senden"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
