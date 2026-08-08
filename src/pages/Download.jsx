// ─────────────────────────────────────────────────────────────────────────
// Download.jsx — Nach erfolgreicher Zahlung. URL: "/pruefen/download?session=..."
//
// WICHTIG: Nach dem Stripe-Redirect ist der React-Zustand (werte, wohnung,
// adressen) verloren — der Browser hat die Seite komplett verlassen und ist
// zurückgekommen. Diese Seite lädt die zuvor gespeicherten Daten deshalb
// über die Session-ID aus der URL neu vom Server (api/get-report.js), statt
// sich auf In-Memory-State zu verlassen.
// ─────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from "react";
import { PDFDownloadLink, pdf } from "@react-pdf/renderer";
import { THEME } from "../config/theme.js";
import { buildResult } from "../lib/analyse.js";
import PruefberichtDocument from "../pdf/PruefberichtDocument.jsx";
import Btn from "../components/ui/Btn.jsx";

// Blob -> Base64 (ohne "data:application/pdf;base64,"-Präfix), für den Versand ans Backend.
function blobZuBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function Download({ navigateTo }) {
  const C = THEME.color;
  const [status, setStatus] = useState("laden"); // laden | bereit | fehler
  const [daten, setDaten] = useState(null);
  const emailVersendetRef = useRef(false); // verhindert Doppelversand bei Re-Render/StrictMode

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session");
    if (!sessionId) { setStatus("fehler"); return; }

    fetch("/api/get-report?session=" + encodeURIComponent(sessionId))
      .then(r => { if (!r.ok) throw new Error("nicht gefunden"); return r.json(); })
      .then(d => {
        const result = buildResult(d.werte, d.wohnung);
        setDaten({ ...d, result });
        setStatus("bereit");
      })
      .catch(() => setStatus("fehler"));
  }, []);

  // Nach dem Laden: identisches PDF automatisch per E-Mail zuschicken —
  // best effort, blockiert den Download-Button nicht bei Fehlschlag.
  // Serverseitig zusätzlich gegen Doppelversand abgesichert (api/send-email.js).
  useEffect(() => {
    if (status !== "bereit" || !daten || emailVersendetRef.current) return;
    if (!daten.email || daten.emailBereitsVersendet) return;
    emailVersendetRef.current = true;

    (async () => {
      try {
        const blob = await pdf(
          <PruefberichtDocument result={daten.result} wohnung={daten.wohnung} adressen={daten.adressen} stufe={daten.stufe} />
        ).toBlob();
        const pdfBase64 = await blobZuBase64(blob);
        await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: daten.sessionId,
            email: daten.email,
            pdfBase64,
            pdfFilename: "Nebenkosten-Pruefbericht_" + daten.wohnung.jahr + ".pdf",
            stufe: daten.stufe,
            vorname: (daten.adressen?.mieterName || "").trim().split(/\s+/)[0] || "",
          }),
        });
      } catch (e) {
        console.error("E-Mail-Versand fehlgeschlagen:", e);
      }
    })();
  }, [status, daten]);

  return (
    <div style={{ fontFamily: THEME.font.body, background: C.bg, color: C.text, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <div style={{ maxWidth: 460, width: "100%", textAlign: "center" }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: C.brandBg, border: "2px solid " + C.brand, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto 22px" }}>✓</div>
        <h1 style={{ fontFamily: THEME.font.heading, fontSize: 22, fontWeight: 600, margin: "0 0 10px" }}>Zahlung erfolgreich</h1>

        {status === "laden" && <p style={{ fontSize: 14, color: C.textMuted }}>Dein PDF wird vorbereitet …</p>}

        {status === "fehler" && (
          <div style={{ background: "#fdf0ee", borderRadius: THEME.radius.md, padding: "16px 20px", fontSize: 13, color: C.text, lineHeight: 1.6 }}>
            Dein PDF konnte nicht automatisch geladen werden. Bitte schreib uns kurz: support@nebenkostenradar.com — wir schicken es dir umgehend nach.
          </div>
        )}

        {status === "bereit" && daten && (
          <>
            <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 22 }}>
              Dein PDF ist fertig.{daten.email ? " Zusätzlich schicken wir es dir gerade an deine E-Mail-Adresse." : ""}
            </p>
            <PDFDownloadLink
              document={<PruefberichtDocument result={daten.result} wohnung={daten.wohnung} adressen={daten.adressen} stufe={daten.stufe} />}
              fileName={"Nebenkosten-Pruefbericht_" + daten.wohnung.jahr + ".pdf"}
            >
              {({ loading }) => (
                <Btn>{loading ? "PDF wird erstellt …" : "PDF herunterladen"}</Btn>
              )}
            </PDFDownloadLink>

            {daten.email && (
              <p style={{ fontSize: 12, color: C.textDim, lineHeight: 1.6, marginTop: 16 }}>
                Tipp: Mit einem kostenlosen Kundenkonto kannst du diesen Bericht jederzeit erneut herunterladen — einfach mit deiner E-Mail-Adresse{" "}
                <button onClick={() => navigateTo("login")} style={{ background: "none", border: "none", padding: 0, color: C.brand, fontSize: 12, textDecoration: "underline", cursor: "pointer", fontFamily: THEME.font.body }}>anmelden</button>.
              </p>
            )}
          </>
        )}

        <button onClick={() => navigateTo("welcome")} style={{ marginTop: 20, background: "transparent", border: "none", color: C.textMuted, fontSize: 13, textDecoration: "underline", cursor: "pointer" }}>
          Zur Startseite
        </button>
      </div>
    </div>
  );
}
