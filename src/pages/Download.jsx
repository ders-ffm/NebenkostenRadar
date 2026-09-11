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
import { pdf } from "@react-pdf/renderer";
import { THEME } from "../config/theme.js";
import { buildResult } from "../lib/analyse.js";
import PruefberichtDocument from "../pdf/PruefberichtDocument.jsx";
import Btn from "../components/ui/Btn.jsx";
import Field from "../components/ui/Field.jsx";

// Prüft, ob die fürs PDF nötigen Adressdaten vollständig sind (09.09.2026,
// siehe Kopfkommentar zum Umbau unten). Bei Stufe "voll" wird zusätzlich die
// Vermieteranschrift gebraucht — nur die erscheint im Empfängerblock von
// BriefPDF.jsx; bei Stufe "auswertung" gibt es gar keinen Brief.
function adressenVollstaendig(adressen, stufe) {
  if (!adressen) return false;
  const da = v => !!(v || "").trim();
  const absenderOk = da(adressen.mieterName) && da(adressen.mieterStrasse) && da(adressen.mieterPlz) && da(adressen.mieterOrt);
  if (!absenderOk) return false;
  if (stufe !== "voll") return true;
  return da(adressen.vermieterName) && da(adressen.vermieterStrasse) && da(adressen.vermieterPlz) && da(adressen.vermieterOrt);
}

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
  const [pdfWirdErstellt, setPdfWirdErstellt] = useState(false);
  const emailVersendetRef = useRef(false); // verhindert Doppelversand bei Re-Render/StrictMode
  // Adressabfrage NACH der Zahlung (09.09.2026, siehe CHANGELOG.md und
  // planung/werbeplan-nkr.md Abschnitt 8.6). Vorher standen diese Felder als
  // bis zu 10 Pflichtfelder VOR der Bezahlung in Adressen.jsx — nachweislich
  // die einzige Stelle, an der zahlungsbereite Nutzer ausgestiegen sind.
  // Hier kosten dieselben Felder keinen Verkauf mehr: bezahlt ist bezahlt.
  const [adressEntwurf, setAdressEntwurf] = useState(null);
  const [adressFehler, setAdressFehler] = useState({});
  const [adressSpeichert, setAdressSpeichert] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session");
    if (!sessionId) { setStatus("fehler"); return; }

    fetch("/api/get-report?session=" + encodeURIComponent(sessionId))
      .then(r => { if (!r.ok) throw new Error("nicht gefunden"); return r.json(); })
      .then(d => {
        const result = buildResult(d.werte, d.wohnung);
        setDaten({ ...d, result });
        // Formular mit dem vorbefüllen, was schon da ist (bei Altbestellungen
        // aus der Zeit vor dem Umbau sind die Felder bereits vollständig).
        setAdressEntwurf({
          mieterName: d.adressen?.mieterName || "",
          mieterStrasse: d.adressen?.mieterStrasse || "",
          mieterPlz: d.adressen?.mieterPlz || "",
          mieterOrt: d.adressen?.mieterOrt || "",
          vermieterName: d.adressen?.vermieterName || "",
          vermieterStrasse: d.adressen?.vermieterStrasse || "",
          vermieterPlz: d.adressen?.vermieterPlz || "",
          vermieterOrt: d.adressen?.vermieterOrt || "",
        });
        setStatus("bereit");
      })
      .catch(() => setStatus("fehler"));
  }, []);

  // Adressdaten nachtragen und in derselben nkr_reports-Zeile speichern
  // (PATCH-Zweig in api/save-report.js — bewusst keine eigene api-Datei
  // wegen des Vercel-Hobby-Limits von 12 Functions).
  async function adressenSpeichern() {
    const e = {};
    const da = v => !!(v || "").trim();
    if (!da(adressEntwurf.mieterName)) e.mieterName = "Pflichtfeld";
    if (!da(adressEntwurf.mieterStrasse)) e.mieterStrasse = "Pflichtfeld";
    if (!/^\d{5}$/.test(adressEntwurf.mieterPlz)) e.mieterPlz = "5-stellige PLZ";
    if (!da(adressEntwurf.mieterOrt)) e.mieterOrt = "Pflichtfeld";
    if (daten.stufe === "voll") {
      if (!da(adressEntwurf.vermieterName)) e.vermieterName = "Pflichtfeld";
      if (!da(adressEntwurf.vermieterStrasse)) e.vermieterStrasse = "Pflichtfeld";
      if (!/^\d{5}$/.test(adressEntwurf.vermieterPlz)) e.vermieterPlz = "5-stellige PLZ";
      if (!da(adressEntwurf.vermieterOrt)) e.vermieterOrt = "Pflichtfeld";
    }
    setAdressFehler(e);
    if (Object.keys(e).length > 0) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }

    setAdressSpeichert(true);
    const neueAdressen = { ...(daten.adressen || {}), ...adressEntwurf };
    try {
      await fetch("/api/save-report", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: daten.sessionId, adressen: neueAdressen }),
      });
    } catch (err) {
      // Bewusst nicht blockierend: Das PDF wird clientseitig erzeugt und
      // funktioniert auch ohne erfolgreichen Serverspeicher. Verloren ginge
      // nur der spätere Zweit-Download über das Kundenkonto.
      console.error("Adressen konnten nicht gespeichert werden:", err);
    }
    setDaten(d => ({ ...d, adressen: neueAdressen }));
    setAdressSpeichert(false);
  }

  const brauchtAdressen = status === "bereit" && daten && !adressenVollstaendig(daten.adressen, daten.stufe);

  // Nach dem Laden: identisches PDF automatisch per E-Mail zuschicken —
  // best effort, blockiert den Download-Button nicht bei Fehlschlag.
  // Serverseitig zusätzlich gegen Doppelversand abgesichert (api/send-email.js).
  useEffect(() => {
    if (status !== "bereit" || !daten || emailVersendetRef.current) return;
    if (!daten.email || daten.emailBereitsVersendet) return;
    // NEU 09.09.2026: erst versenden, wenn die Adressdaten vollständig sind —
    // sonst ginge ein PDF mit leerem Briefkopf und (bei Stufe "voll") leerem
    // Empfängerblock raus, und der Doppelversand-Schutz in api/send-email.js
    // würde einen späteren, korrekten Versand dauerhaft verhindern.
    if (!adressenVollstaendig(daten.adressen, daten.stufe)) return;
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

  // PDF-Button: bewusst KEIN <a download> / PDFDownloadLink mehr (siehe unten).
  // iOS Safari (jeder Browser auf iOS läuft auf WebKit) unterstützt das
  // HTML-"download"-Attribut grundsätzlich nicht — ein Tap tat vorher
  // schlicht nichts, unabhängig von den Daten (bestätigtes WebKit-Verhalten,
  // siehe react-pdf-Projekt-Diskussion #1743). Stattdessen: leeren Tab SOFORT
  // im Klick-Handler öffnen (das braucht Safaris Popup-Blocker, ein window.open()
  // NACH einem await wird sonst als Popup geblockt), danach die fertige
  // PDF-Blob-URL in diesen Tab nachladen, sobald sie erzeugt ist. Funktioniert
  // browserübergreifend, nicht nur auf iOS.
  async function handlePdfDownload() {
    setPdfWirdErstellt(true);
    const neuesFenster = window.open("", "_blank");
    try {
      const blob = await pdf(
        <PruefberichtDocument result={daten.result} wohnung={daten.wohnung} adressen={daten.adressen} stufe={daten.stufe} />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      if (neuesFenster) {
        neuesFenster.location.href = url;
      } else {
        // Auch der leere Tab wurde geblockt (selten) — Fallback: aktuelle Seite.
        window.location.href = url;
      }
    } catch (e) {
      console.error("PDF-Erstellung fehlgeschlagen:", e);
      if (neuesFenster) neuesFenster.close();
      alert("Das PDF konnte nicht erstellt werden. Bitte schreib uns kurz: support@nebenkostenradar.com");
    } finally {
      setPdfWirdErstellt(false);
    }
  }

  return (
    <div style={{ fontFamily: THEME.font.body, background: C.bg, color: C.text, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}>
      <div style={{ maxWidth: 460, width: "100%", textAlign: "center" }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: C.brandBg, border: "2px solid " + C.brand, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, margin: "0 auto 22px" }}>✓</div>
        <h1 style={{ fontFamily: THEME.font.heading, fontSize: 22, fontWeight: 600, margin: "0 0 10px" }}>Zahlung erfolgreich</h1>

        {status === "laden" && <p style={{ fontSize: 14, color: C.textMuted }}>Dein PDF wird vorbereitet …</p>}

        {status === "fehler" && (
          <div style={{ background: "#fdf0ee", borderRadius: THEME.radius.md, padding: "16px 20px", fontSize: 13, color: C.text, lineHeight: 1.6 }}>
            Dein PDF konnte nicht automatisch geladen werden. Bitte schreib uns kurz: support@nebenkostenradar.com, wir schicken es dir umgehend nach.
          </div>
        )}

        {/* Adressabfrage nach der Zahlung, siehe Kommentar bei adressEntwurf oben. */}
        {brauchtAdressen && adressEntwurf && (
          <div style={{ textAlign: "left", marginTop: 8 }}>
            <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 18, textAlign: "center", lineHeight: 1.6 }}>
              Letzter Schritt: Diese Angaben kommen in deinen Bericht{daten.stufe === "voll" ? " und in den Musterbrief" : ""}. Danach steht dein PDF sofort bereit.
            </p>

            <div style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: THEME.radius.lg, padding: "16px", marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: C.accent, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>Deine Adresse</div>
              <Field label="Vor- und Nachname" value={adressEntwurf.mieterName} onChange={v => setAdressEntwurf(p => ({ ...p, mieterName: v }))} placeholder="Max Mustermann" required error={adressFehler.mieterName} autoFocus />
              <Field label="Straße und Hausnummer" value={adressEntwurf.mieterStrasse} onChange={v => setAdressEntwurf(p => ({ ...p, mieterStrasse: v }))} placeholder="Musterstraße 12" required error={adressFehler.mieterStrasse} />
              <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 10 }}>
                <Field label="PLZ" value={adressEntwurf.mieterPlz} onChange={v => setAdressEntwurf(p => ({ ...p, mieterPlz: v }))} placeholder="12345" required error={adressFehler.mieterPlz} maxLength={5} />
                <Field label="Ort" value={adressEntwurf.mieterOrt} onChange={v => setAdressEntwurf(p => ({ ...p, mieterOrt: v }))} placeholder="Musterstadt" required error={adressFehler.mieterOrt} />
              </div>
            </div>

            {daten.stufe === "voll" && (
              <div style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: THEME.radius.lg, padding: "16px", marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>Vermieter oder Hausverwaltung</div>
                <p style={{ fontSize: 12, color: C.textDim, margin: "0 0 14px", lineHeight: 1.6 }}>Steht auf deiner Abrechnung oder im Mietvertrag, kommt als Empfänger auf den Musterbrief.</p>
                <Field label="Name oder Firma" value={adressEntwurf.vermieterName} onChange={v => setAdressEntwurf(p => ({ ...p, vermieterName: v }))} placeholder="Muster Verwaltungs GmbH" required error={adressFehler.vermieterName} />
                <Field label="Straße und Hausnummer" value={adressEntwurf.vermieterStrasse} onChange={v => setAdressEntwurf(p => ({ ...p, vermieterStrasse: v }))} placeholder="Verwalterstraße 1" required error={adressFehler.vermieterStrasse} />
                <div style={{ display: "grid", gridTemplateColumns: "100px 1fr", gap: 10 }}>
                  <Field label="PLZ" value={adressEntwurf.vermieterPlz} onChange={v => setAdressEntwurf(p => ({ ...p, vermieterPlz: v }))} placeholder="12345" required error={adressFehler.vermieterPlz} maxLength={5} />
                  <Field label="Ort" value={adressEntwurf.vermieterOrt} onChange={v => setAdressEntwurf(p => ({ ...p, vermieterOrt: v }))} placeholder="Musterstadt" required error={adressFehler.vermieterOrt} />
                </div>
              </div>
            )}

            <Btn onClick={adressenSpeichern} disabled={adressSpeichert}>
              {adressSpeichert ? "Einen Moment …" : "Weiter zum PDF →"}
            </Btn>
          </div>
        )}

        {status === "bereit" && daten && !brauchtAdressen && (
          <>
            <p style={{ fontSize: 14, color: C.textMuted, marginBottom: 22 }}>
              Dein PDF ist fertig.{daten.email ? " Zusätzlich schicken wir es dir gerade an deine E-Mail-Adresse." : ""}
            </p>
            <Btn onClick={handlePdfDownload} disabled={pdfWirdErstellt}>
              {pdfWirdErstellt ? "PDF wird erstellt …" : "PDF herunterladen"}
            </Btn>

            {daten.email && (
              <p style={{ fontSize: 12, color: C.textDim, lineHeight: 1.6, marginTop: 16 }}>
                Tipp: Mit einem kostenlosen Kundenkonto kannst du diesen Bericht jederzeit erneut herunterladen, einfach mit deiner E-Mail-Adresse{" "}
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
