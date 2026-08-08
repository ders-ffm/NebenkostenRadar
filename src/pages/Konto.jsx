// ─────────────────────────────────────────────────────────────────────────
// Konto.jsx — Kundenkonto. URL: "/pruefen/konto"
// Wird sowohl direkt nach Klick auf den Magic-Link angesteuert (Supabase
// hängt das Zugangs-Token automatisch an die URL) als auch bei jedem
// späteren Besuch, solange die Sitzung im Browser gespeichert ist.
// ─────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { THEME } from "../config/theme.js";
import { supabase } from "../config/supabaseClient.js";
import { buildResult } from "../lib/analyse.js";
import PruefberichtDocument from "../pdf/PruefberichtDocument.jsx";
import Btn from "../components/ui/Btn.jsx";

export default function Konto({ navigateTo }) {
  const C = THEME.color;
  const [status, setStatus] = useState("laden"); // laden | angemeldet | abgemeldet | fehler
  const [email, setEmail] = useState("");
  const [berichte, setBerichte] = useState([]);

  useEffect(() => {
    if (!supabase) { setStatus("fehler"); return; }

    async function laden(session) {
      if (!session) { setStatus("abgemeldet"); return; }
      try {
        const res = await fetch("/api/my-reports", {
          headers: { Authorization: "Bearer " + session.access_token },
        });
        if (!res.ok) { setStatus("abgemeldet"); return; }
        const data = await res.json();
        setEmail(data.email);
        setBerichte(
          (data.berichte || []).map(b => ({ ...b, result: buildResult(b.werte, b.wohnung) }))
        );
        setStatus("angemeldet");
      } catch {
        setStatus("fehler");
      }
    }

    supabase.auth.getSession().then(({ data }) => laden(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => laden(session));
    return () => listener.subscription.unsubscribe();
  }, []);

  async function abmelden() {
    if (supabase) await supabase.auth.signOut();
    navigateTo("welcome");
  }

  return (
    <div style={{ fontFamily: THEME.font.body, background: C.bg, color: C.text, minHeight: "100vh" }}>
      <div style={{ background: C.surface, padding: "20px 20px 16px", borderBottom: "1px solid " + C.border }}>
        <button onClick={() => navigateTo("welcome")} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 13, padding: "0 0 10px", fontFamily: THEME.font.body }}>← Zurück</button>
        <h2 style={{ margin: 0, fontSize: 19, fontWeight: 600, fontFamily: THEME.font.heading }}>Mein Konto</h2>
      </div>

      <div style={{ padding: "24px 20px 60px", maxWidth: 640, margin: "0 auto" }}>
        {status === "laden" && <p style={{ fontSize: 14, color: C.textMuted }}>Einen Moment …</p>}

        {status === "fehler" && (
          <div style={{ background: "#fdf0ee", borderRadius: THEME.radius.md, padding: "16px 20px", fontSize: 13, lineHeight: 1.6 }}>
            Da ist etwas schiefgelaufen. Bitte lade die Seite neu oder schreib uns: support@nebenkostenradar.com
          </div>
        )}

        {status === "abgemeldet" && (
          <div>
            <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 16 }}>Du bist nicht angemeldet oder der Link ist abgelaufen.</p>
            <Btn onClick={() => navigateTo("login")}>Zum Login</Btn>
          </div>
        )}

        {status === "angemeldet" && (
          <>
            <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 4 }}>Angemeldet als {email}</p>
            <p style={{ fontSize: 12, color: C.textDim, marginBottom: 20 }}>Hier findest du alle deine bisherigen Prüfberichte — jederzeit zum erneuten Download.</p>

            {berichte.length === 0 ? (
              <p style={{ fontSize: 14, color: C.textMuted }}>Noch keine Prüfung gekauft.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                {berichte.map(b => (
                  <div key={b.session_id} style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: THEME.radius.lg, padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>Nebenkostenabrechnung {b.wohnung?.jahr}</div>
                      <div style={{ fontSize: 12, color: C.textMuted }}>
                        {b.stufe === "voll" ? "Auswertung + Brief" : "Auswertung"} · gekauft am {new Date(b.created_at).toLocaleDateString("de-DE")}
                      </div>
                    </div>
                    <PDFDownloadLink
                      document={<PruefberichtDocument result={b.result} wohnung={b.wohnung} adressen={b.adressen} stufe={b.stufe} />}
                      fileName={"Nebenkosten-Pruefbericht_" + b.wohnung?.jahr + ".pdf"}
                    >
                      {({ loading }) => (
                        <Btn style={{ width: "auto", padding: "10px 18px", fontSize: 13 }}>
                          {loading ? "PDF wird erstellt …" : "PDF herunterladen"}
                        </Btn>
                      )}
                    </PDFDownloadLink>
                  </div>
                ))}
              </div>
            )}

            <button onClick={abmelden} style={{ background: "transparent", border: "none", color: C.textMuted, fontSize: 13, textDecoration: "underline", cursor: "pointer" }}>
              Abmelden
            </button>
          </>
        )}
      </div>
    </div>
  );
}
