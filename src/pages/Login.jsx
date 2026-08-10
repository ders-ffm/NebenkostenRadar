// ─────────────────────────────────────────────────────────────────────────
// Login.jsx — Kundenkonto-Zugang per Magic-Link. URL: "/login"
// Kein Passwort: Supabase Auth verschickt einen einmaligen Anmeldelink per
// E-Mail. Klick auf den Link führt zu "/pruefen/konto" (siehe Konto.jsx).
// ─────────────────────────────────────────────────────────────────────────
import { useState } from "react";
import { THEME } from "../config/theme.js";
import { supabase } from "../config/supabaseClient.js";
import Field from "../components/ui/Field.jsx";
import Btn from "../components/ui/Btn.jsx";

export default function Login({ navigateTo }) {
  const C = THEME.color;
  const [email, setEmail] = useState("");
  // Doppelte E-Mail-Eingabe ohne Copy&Paste (08/2026, siehe CHANGELOG.md) —
  // gleiches Muster wie in Adressen.jsx: ein Tippfehler hier führt nicht nur
  // dazu, dass der Nutzer selbst keinen Link bekommt, sondern könnte den
  // Anmeldelink an eine tatsächlich existierende FREMDE Adresse schicken,
  // falls der Tippfehler zufällig eine echte E-Mail ergibt — ein echtes
  // Sicherheitsargument, nicht nur Komfort.
  const [emailWiederholen, setEmailWiederholen] = useState("");
  const [status, setStatus] = useState("eingabe"); // eingabe | sende | verschickt | fehler
  const [error, setError] = useState("");
  const [errorWiederholen, setErrorWiederholen] = useState("");
  const keinPaste = e => e.preventDefault();

  async function senden() {
    let ok = true;
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Bitte gültige E-Mail-Adresse eingeben");
      ok = false;
    } else {
      setError("");
    }
    if (!emailWiederholen.trim()) {
      setErrorWiederholen("Pflichtfeld");
      ok = false;
    } else if (email.trim().toLowerCase() !== emailWiederholen.trim().toLowerCase()) {
      setErrorWiederholen("E-Mail-Adressen stimmen nicht überein");
      ok = false;
    } else {
      setErrorWiederholen("");
    }
    if (!ok) return;
    if (!supabase) { setStatus("fehler"); return; }
    setStatus("sende"); setError("");
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin + "/pruefen/konto" },
    });
    if (err) { setStatus("fehler"); setError(err.message); return; }
    setStatus("verschickt");
  }

  return (
    <div style={{ fontFamily: THEME.font.body, background: C.bg, color: C.text, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 400, width: "100%", background: C.surface, border: "1px solid " + C.border, borderRadius: THEME.radius.lg, padding: "32px 28px" }}>
        <h1 style={{ fontFamily: THEME.font.heading, fontSize: 20, fontWeight: 600, margin: "0 0 6px" }}>Anmelden</h1>
        <p style={{ fontSize: 13, color: C.textMuted, margin: "0 0 22px", lineHeight: 1.6 }}>Kein Passwort nötig. Gib deine E-Mail-Adresse ein, wir schicken dir einen Anmeldelink.</p>

        {status === "verschickt" ? (
          <div style={{ background: C.brandBg, borderRadius: 8, padding: "16px 18px" }}>
            <div style={{ fontSize: 14, color: C.brand, fontWeight: 700, marginBottom: 4 }}>✓ Link verschickt</div>
            <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.6 }}>
              Prüf dein Postfach ({email}) und klick auf den Link. Er ist eine Stunde gültig. Nichts erhalten? Schau auch im Spam- oder Werbeordner nach.
            </div>
            <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.6, marginTop: 10 }}>
              Der Link führt dich direkt in dein Kundenkonto — dort findest du alle deine bisherigen Prüfberichte zum jederzeit erneuten Download.
            </div>
          </div>
        ) : (
          <>
            <Field label="E-Mail-Adresse" type="email" value={email} onChange={v => { setEmail(v); setError(""); }} placeholder="deine@email.de" required error={error} autoFocus />
            <Field label="E-Mail-Adresse wiederholen" type="email" value={emailWiederholen} onChange={v => { setEmailWiederholen(v); setErrorWiederholen(""); }} placeholder="deine@email.de" required error={errorWiederholen} onPaste={keinPaste} onDrop={keinPaste} tip="Zum Abgleich bitte erneut eintippen" />
            <div style={{ marginTop: 8 }}>
              <Btn onClick={senden} disabled={status === "sende"}>{status === "sende" ? "Wird verschickt …" : "Anmeldelink anfordern"}</Btn>
            </div>
            {status === "fehler" && !error && (
              <div style={{ fontSize: 12, color: "#c0392b", marginTop: 10 }}>⚠ Der Link konnte nicht verschickt werden. Bitte später erneut versuchen oder support@nebenkostenradar.com schreiben.</div>
            )}
          </>
        )}

        <p style={{ fontSize: 11, color: C.textDim, lineHeight: 1.6, marginTop: 16 }}>
          Für die sichere Anmeldung nutzen wir Supabase, einen etablierten Anbieter für Nutzerkonten — DSGVO-konform, siehe{" "}
          <a href="/datenschutz" onClick={e => { e.preventDefault(); navigateTo("datenschutz"); }} style={{ color: C.brand }}>Datenschutzerklärung</a>.
        </p>

        <button onClick={() => navigateTo("welcome")} style={{ marginTop: 14, background: "transparent", border: "none", color: C.textMuted, fontSize: 13, textDecoration: "underline", cursor: "pointer" }}>
          Zur Startseite
        </button>
      </div>
    </div>
  );
}
