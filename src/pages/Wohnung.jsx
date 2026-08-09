// ─────────────────────────────────────────────────────────────────────────
// Wohnung.jsx — Formular Schritt 1: Wohnungsdaten. URL: "/pruefen/wohnung"
//
// Foto-Upload 08/2026 (siehe CHANGELOG.md): Optionale automatische Vorbe-
// füllung über api/analyse-foto.js. Bewusst nur eine Vorausfüllung, kein
// Ersatz fürs Formular — der Nutzer landet danach in denselben editierbaren
// Feldern (hier und auf Posten.jsx) und muss die Werte bestätigen/korrigieren.
// Fotos werden vor dem Versand im Browser verkleinert (Canvas-Resize), damit
// sie unter Vercels 4,5-MB-Body-Limit bleiben, und nach der Erkennung nicht
// weiter aufbewahrt (weder hier noch serverseitig, siehe analyse-foto.js).
// ─────────────────────────────────────────────────────────────────────────
import { useState } from "react";
import { THEME } from "../config/theme.js";
import { BUSINESS } from "../config/business.js";
import { toNum, fmt } from "../lib/format.js";
import Field from "../components/ui/Field.jsx";
import Btn from "../components/ui/Btn.jsx";
import StepBar from "../components/ui/StepBar.jsx";

// Verkleinert ein Bild im Browser (Canvas) und liefert es als Base64-JPEG
// zurück, ohne Datenpräfix — hält den Upload klein und schnell.
// Auflösung/Qualität bewusst nah an dem gewählt, was sich beim manuellen
// Praxistest (14-seitige Abrechnung, HEIC->JPEG bei 1800px/Qualität 85 im
// Chat gelesen) als zuverlässig lesbar erwiesen hat, mit etwas Reserve
// gegenüber Vercels 4,5-MB-Body-Limit (siehe MAX_BILDER unten).
const MAX_BILDER = 6;
const MIN_AUFLOESUNG = 500; // px, kürzere Seite — darunter ist Text erfahrungsgemäß nicht zuverlässig lesbar

function bildAufBase64(file, maxDim = 1800, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let { width, height } = img;
      // Grobe clientseitige Qualitätsprüfung VOR dem Versand: ein Foto, dessen
      // kürzere Seite schon in Originalauflösung unter MIN_AUFLOESUNG liegt,
      // wird auch nach Verkleinerung nicht lesbar — spart einen unnötigen
      // API-Aufruf und gibt sofort verständliches Feedback statt eines
      // stillschweigend schlechten Ergebnisses.
      if (Math.min(width, height) < MIN_AUFLOESUNG) {
        URL.revokeObjectURL(url);
        reject(new Error("zu_niedrig_aufgeloest"));
        return;
      }
      if (width > maxDim || height > maxDim) {
        const scale = maxDim / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", quality).split(",")[1]);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Bild konnte nicht gelesen werden")); };
    img.src = url;
  });
}

export default function Wohnung({ navigateTo, wohnung, setWohnung, werte, setWerte }) {
  const C = THEME.color;
  const [errors, setErrors] = useState({});
  const [fotoStatus, setFotoStatus] = useState("idle"); // idle | laden | fertig | fehler
  const [fotoAnzahl, setFotoAnzahl] = useState(0);
  const [hinweise, setHinweise] = useState([]); // Bild-/Lesbarkeitsprobleme, client- und serverseitig
  const setW = (k, v) => setWohnung(p => ({ ...p, [k]: v }));

  async function handleFotoUpload(e) {
    const files = Array.from(e.target.files || []).slice(0, MAX_BILDER);
    if (files.length === 0) return;
    setFotoStatus("laden");
    setHinweise([]);
    try {
      // allSettled statt all: ein einzelnes unscharfes/zu kleines Foto soll
      // nicht den ganzen Durchlauf abbrechen, sondern nur für sich selbst
      // einen Hinweis erzeugen — die restlichen, guten Fotos werden trotzdem
      // ausgewertet (siehe "wenn Fotos unscharf sind, muss das geprüft werden").
      const ergebnisse = await Promise.allSettled(files.map(f => bildAufBase64(f)));
      const bilder = [];
      const clientHinweise = [];
      ergebnisse.forEach((r, i) => {
        if (r.status === "fulfilled") bilder.push(r.value);
        else clientHinweise.push(
          "Foto " + (i + 1) + ": " + (r.reason?.message === "zu_niedrig_aufgeloest"
            ? "Auflösung zu niedrig — bitte näher heran und schärfer fotografieren."
            : "konnte nicht gelesen werden.")
        );
      });

      if (bilder.length === 0) {
        setHinweise(clientHinweise);
        setFotoStatus("fehler");
        return;
      }

      const res = await fetch("/api/analyse-foto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bilder }),
      });
      if (!res.ok) throw new Error("Erkennung fehlgeschlagen");
      const data = await res.json();
      setWohnung(p => ({
        ...p,
        ...(data.wohnung?.flaeche ? { flaeche: data.wohnung.flaeche } : {}),
        ...(data.wohnung?.jahr ? { jahr: data.wohnung.jahr } : {}),
        ...(data.wohnung?.vorauszahlung ? { vorauszahlung: data.wohnung.vorauszahlung } : {}),
      }));
      if (setWerte && data.werte) setWerte(p => ({ ...p, ...data.werte }));
      setFotoAnzahl(data.anzahlErkannt || 0);
      setHinweise([...clientHinweise, ...(data.hinweise || [])]);
      setFotoStatus("fertig");
    } catch (err) {
      console.error("Foto-Erkennung fehlgeschlagen:", err.message);
      setFotoStatus("fehler");
    } finally {
      e.target.value = "";
    }
  }

  const vz = toNum(wohnung.vorauszahlung), fl = toNum(wohnung.flaeche);
  const vzQm = vz && fl ? vz / fl / 12 : null;

  const AKTUELLES_JAHR = new Date().getFullYear();

  function validate() {
    const e = {};
    const flaecheNum = toNum(wohnung.flaeche);
    if (!wohnung.flaeche || flaecheNum < 5) e.flaeche = "Gültige Wohnfläche erforderlich (mind. 5 m²)";
    else if (flaecheNum > 500) e.flaeche = "Bitte prüfen — über 500 m² ungewöhnlich";

    const jahrNum = parseInt(wohnung.jahr, 10);
    if (!wohnung.jahr || wohnung.jahr.length !== 4 || isNaN(jahrNum)) e.jahr = "Gültiges Jahr erforderlich (4-stellig)";
    else if (jahrNum < 2000 || jahrNum > AKTUELLES_JAHR) e.jahr = "Jahr zwischen 2000 und " + AKTUELLES_JAHR + " erwartet";

    const vzNum = toNum(wohnung.vorauszahlung);
    if (!wohnung.vorauszahlung || vzNum <= 0) e.vorauszahlung = "Bitte Vorauszahlungen eingeben";
    else if (vzNum > 50000) e.vorauszahlung = "Bitte prüfen — Betrag ungewöhnlich hoch";

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  return (
    <div style={{ fontFamily: THEME.font.body, background: C.bg, color: C.text, minHeight: "100vh" }}>
      <div style={{ background: C.surface, borderBottom: "1px solid " + C.border }}>
        <div style={{ padding: "20px 20px 0", maxWidth: THEME.layout.formMax, margin: "0 auto", boxSizing: "border-box" }}>
          <button onClick={() => navigateTo("welcome")} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 13, padding: "0 0 12px", fontFamily: THEME.font.body }}>← Zurück</button>
          <StepBar current={1} total={3} label="Wohnungsdaten" />
        </div>
      </div>
      <div style={{ padding: "22px 20px 40px", maxWidth: THEME.layout.formMax, margin: "0 auto", boxSizing: "border-box" }}>
        <h2 style={{ fontFamily: THEME.font.heading, fontSize: 21, fontWeight: 600, margin: "0 0 6px", textAlign: "center" }}>Angaben zur Mietsache</h2>
        <p style={{ fontSize: 13, color: C.textMuted, margin: "0 0 16px", lineHeight: 1.55, textAlign: "center" }}>Steht auf dem Deckblatt deiner Abrechnung.</p>
        <div style={{ background: C.brandBg, borderRadius: THEME.radius.md, padding: "13px 14px", marginBottom: 20, fontSize: 12, color: C.textMuted, lineHeight: 1.75 }}>
          <div style={{ color: C.text, fontWeight: 600, marginBottom: 5, fontSize: 13, fontFamily: THEME.font.heading }}>Wie funktioniert eine Nebenkostenabrechnung?</div>
          Du zahlst monatlich Abschläge für Heizung, Wasser, Müll u. a. Einmal im Jahr rechnet dein Vermieter ab, was tatsächlich angefallen ist. Im nächsten Schritt siehst du jeden Posten zur Prüfung — per Fotoupload automatisch befüllt oder komplett manuell, genau so wie er auf der Abrechnung steht.
        </div>

        <div style={{ background: C.surface, border: "1px solid " + (fotoStatus === "fertig" ? C.brand : C.border), borderRadius: THEME.radius.lg, padding: "16px", marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4, fontFamily: THEME.font.heading }}>📷 Abrechnung fotografieren (optional)</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 10, lineHeight: 1.6 }}>
            Bis zu {MAX_BILDER} Fotos hochladen — wir füllen Wohnungsdaten und Posten automatisch aus, du prüfst und korrigierst danach wie gewohnt. Am besten die Übersichtsseite mit der Kostenaufstellung fotografieren (meist die ersten Seiten der Abrechnung), gerne zusätzlich weitere Seiten, falls z. B. CO2-Kosten separat aufgeführt sind. Die Fotos werden nur zur Erkennung genutzt, nicht gespeichert.
          </div>
          <label
            htmlFor="foto-upload-input"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: fotoStatus === "laden" ? C.textDim : C.accent,
              color: C.accentText,
              fontFamily: THEME.font.heading,
              fontWeight: 600,
              fontSize: 14,
              padding: "14px 20px",
              borderRadius: THEME.radius.md,
              cursor: fotoStatus === "laden" ? "default" : "pointer",
              opacity: fotoStatus === "laden" ? 0.75 : 1,
              userSelect: "none",
              boxSizing: "border-box",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            📷 Foto aufnehmen oder auswählen
          </label>
          {/* Label+input-Kopplung statt Klick-Handler in JS: löst auf iOS/Android zuverlässig
              denselben nativen Dialog aus (Kamera direkt fotografieren ODER aus der Galerie
              wählen), aber mit deutlich größerem, gut sichtbarem Tap-Ziel als das nackte
              System-<input type=file> vorher — wichtig, da der Großteil der Nutzer laut
              Stefan über Smartphone kommt (siehe CHANGELOG.md für die Einordnung der 75%-These). */}
          <input id="foto-upload-input" type="file" accept="image/*" multiple onChange={handleFotoUpload} disabled={fotoStatus === "laden"}
            style={{ display: "none" }} />
          {fotoStatus === "laden" && (
            <div style={{ marginTop: 10, fontSize: 12, color: C.textMuted }}>Abrechnung wird gelesen …</div>
          )}
          {fotoStatus === "fertig" && (
            <div style={{ marginTop: 10, fontSize: 12, color: C.brand, fontWeight: 600 }}>
              ✓ {fotoAnzahl > 0 ? fotoAnzahl + " Posten erkannt und unten ausgefüllt" : "Wohnungsdaten übernommen, aber keine Posten sicher erkannt"} — bitte prüfen.
            </div>
          )}
          {fotoStatus === "fehler" && (
            <div style={{ marginTop: 10, fontSize: 12, color: C.warn }}>
              Foto konnte nicht gelesen werden. Bitte Werte manuell eingeben (unten und auf der nächsten Seite) oder ein anderes Foto versuchen.
            </div>
          )}
          {hinweise.length > 0 && (
            <div style={{ marginTop: 10, background: C.warnBg, borderLeft: "3px solid " + C.warn, borderRadius: THEME.radius.md, padding: "10px 12px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.warn, marginBottom: 4, textTransform: "uppercase" }}>Bitte zusätzlich prüfen</div>
              {hinweise.map((h, i) => (
                <div key={i} style={{ fontSize: 12, color: C.warn, lineHeight: 1.6 }}>• {h}</div>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "0 0 16px" }}>
          <div style={{ flex: 1, height: 1, background: C.border }} />
          <div style={{ fontSize: 11, color: C.textDim, textTransform: "uppercase" }}>oder manuell</div>
          <div style={{ flex: 1, height: 1, background: C.border }} />
        </div>

        <Field label="Wohnfläche laut Mietvertrag" value={wohnung.flaeche} onChange={v => setW("flaeche", v)} type="number" placeholder="z. B. 75" suffix="m²" width="short" required error={errors.flaeche} tip="Steht auf dem Deckblatt oder im Mietvertrag" />
        <Field label="Abrechnungsjahr" value={wohnung.jahr} onChange={v => setW("jahr", v)} type="number" placeholder="z. B. 2025" width="short" required error={errors.jahr} tip="Das Kalenderjahr oben auf der Abrechnung" />
        <Field label="Geleistete Vorauszahlungen" value={wohnung.vorauszahlung} onChange={v => setW("vorauszahlung", v)} money placeholder="z. B. 2.400,00" prefix="€" width="medium" required error={errors.vorauszahlung} tip="Alle Abschläge des Jahres — steht als 'Summe Vorauszahlungen' auf der Abrechnung" />

        {vzQm !== null && vzQm < 0.5 && (
          <div style={{ background: C.warnBg, borderLeft: "3px solid " + C.warn, borderRadius: THEME.radius.md, padding: "12px 14px", marginBottom: 10, fontSize: 13, color: C.warn }}>
            Vorauszahlung sehr niedrig: {fmt(vzQm)}/m²/Monat — DMB-Richtwert: {fmt(BUSINESS.RICHTWERTE.gesamt)}/m²/Monat. Bitte Eingabe prüfen.
          </div>
        )}
        {vzQm !== null && vzQm > BUSINESS.RICHTWERTE.gesamt * 2 && (
          <div style={{ background: C.warnBg, borderLeft: "3px solid " + C.warn, borderRadius: THEME.radius.md, padding: "12px 14px", marginBottom: 10, fontSize: 13, color: C.warn }}>
            Vorauszahlung auffällig hoch: {fmt(vzQm)}/m²/Monat — mehr als doppelt so hoch wie der DMB-Richtwert.
          </div>
        )}

        <Btn onClick={() => { if (validate()) navigateTo("posten"); }}>Weiter zu den Posten →</Btn>
      </div>
    </div>
  );
}
