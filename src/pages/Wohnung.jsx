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
import { useState, useRef, useEffect } from "react";
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

  // Foto-Upload 08/2026, Überarbeitung nach Praxistest von Stefan (siehe
  // CHANGELOG.md): Ursprünglich löste jede Dateiauswahl SOFORT eine Analyse
  // aus. Auf dem Handy bedeutet das: ein Kamera-Foto = ein sofortiger,
  // isolierter API-Aufruf — es gab keine Möglichkeit, mehrere Fotos (z.B.
  // Seite für Seite fotografiert) erst zu sammeln, zu sehen was schon
  // ausgewählt ist, und dann gemeinsam auszuwerten. Das führte zu genau der
  // Verwirrung, die gemeldet wurde ("welches Foto ist jetzt im Upload?").
  // Jetzt zweistufig: 1) Fotos sammeln (mit sichtbarer Vorschau + Status pro
  // Foto, mehrfach nacheinander möglich), 2) explizit "Fotos analysieren".
  const [fotos, setFotos] = useState([]); // { id, name, previewUrl, status: 'laedt'|'bereit'|'fehler', fehlerText, base64 }
  const [fotoStatus, setFotoStatus] = useState("idle"); // idle | analysiert | fertig | fehler — bezieht sich nur noch auf den Analyse-Schritt
  const [fotoAnzahl, setFotoAnzahl] = useState(0);
  const [analyseFehler, setAnalyseFehler] = useState(""); // konkrete Server-/Netzwerk-Fehlermeldung statt generischem Text
  const [hinweise, setHinweise] = useState([]); // Bild-/Lesbarkeitsprobleme laut KI-Antwort
  const setW = (k, v) => setWohnung(p => ({ ...p, [k]: v }));

  // Blob-URLs (für die Vorschaubilder) beim Verlassen der Seite wieder
  // freigeben, statt sie bis zum Tab-Schließen im Speicher zu halten.
  const fotosRef = useRef(fotos);
  useEffect(() => { fotosRef.current = fotos; }, [fotos]);
  useEffect(() => () => { fotosRef.current.forEach(f => URL.revokeObjectURL(f.previewUrl)); }, []);

  function neueFotoId() {
    return (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now() + Math.random());
  }

  // Nimmt neu ausgewählte Dateien entgegen (Kamera-Aufnahme = 1 Datei, Galerie-
  // Mehrfachauswahl = mehrere) und FÜGT sie der bestehenden Liste hinzu, statt
  // sie sofort zu verschicken. Jedes Foto wird unabhängig von den anderen
  // client-seitig verkleinert/geprüft, damit ein einzelnes schlechtes Foto
  // die Bearbeitung der übrigen nicht verzögert oder blockiert.
  function handleDateiAuswahl(e) {
    const neueDateien = Array.from(e.target.files || []);
    e.target.value = ""; // sofort zurücksetzen — sonst lässt sich dieselbe Datei kein zweites Mal auswählen
    if (neueDateien.length === 0) return;

    const freiePlaetze = MAX_BILDER - fotos.length;
    if (freiePlaetze <= 0) return;
    const zuVerarbeiten = neueDateien.slice(0, freiePlaetze);

    const neueEintraege = zuVerarbeiten.map(file => ({
      id: neueFotoId(),
      name: file.name,
      previewUrl: URL.createObjectURL(file),
      status: "laedt",
      fehlerText: "",
      base64: null,
    }));
    setFotos(prev => [...prev, ...neueEintraege]);
    // Wie bei entferneFoto(): ein vorheriges Analyse-Ergebnis bezieht sich auf
    // eine jetzt andere Foto-Zusammenstellung und sollte nicht mehr als aktuell
    // erscheinen, bis neu analysiert wurde.
    if (fotoStatus === "fertig" || fotoStatus === "fehler") setFotoStatus("idle");

    neueEintraege.forEach((eintrag, i) => {
      bildAufBase64(zuVerarbeiten[i])
        .then(base64 => {
          setFotos(prev => prev.map(f => f.id === eintrag.id ? { ...f, status: "bereit", base64 } : f));
        })
        .catch(err => {
          const text = err?.message === "zu_niedrig_aufgeloest"
            ? "Auflösung zu niedrig — bitte näher heran und schärfer fotografieren."
            : "Konnte nicht gelesen werden.";
          setFotos(prev => prev.map(f => f.id === eintrag.id ? { ...f, status: "fehler", fehlerText: text } : f));
        });
    });
  }

  function entferneFoto(id) {
    setFotos(prev => {
      const eintrag = prev.find(f => f.id === id);
      if (eintrag) URL.revokeObjectURL(eintrag.previewUrl);
      return prev.filter(f => f.id !== id);
    });
    // Ergebnis eines vorherigen Durchlaufs nicht mehr als aktuell ausweisen,
    // sobald sich die Foto-Auswahl ändert — verhindert veraltete "✓ erkannt"-
    // Anzeige, die sich auf eine inzwischen andere Foto-Zusammenstellung bezieht.
    if (fotoStatus === "fertig" || fotoStatus === "fehler") setFotoStatus("idle");
  }

  async function handleAnalysieren() {
    const bereite = fotos.filter(f => f.status === "bereit");
    if (bereite.length === 0) return;
    setFotoStatus("analysiere");
    setAnalyseFehler("");
    setHinweise([]);
    try {
      const res = await fetch("/api/analyse-foto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bilder: bereite.map(f => f.base64) }),
      });
      // Antwort-Body auch bei Fehlern lesen — die API liefert dort eine
      // konkrete Fehlermeldung (siehe analyse-foto.js), die bisher verworfen
      // und durch einen generischen Text ersetzt wurde. Genau das machte die
      // Fehlersuche unnötig schwer ("Foto konnte nicht gelesen werden" auch
      // dann, wenn z.B. die Antwort der KI abgeschnitten war).
      let data = null;
      try { data = await res.json(); } catch { /* keine/kein gültiges JSON, z.B. bei Timeout-Fehlerseite */ }
      if (!res.ok) throw new Error(data?.error || "Die Erkennung ist fehlgeschlagen.");

      setWohnung(p => ({
        ...p,
        ...(data.wohnung?.flaeche ? { flaeche: data.wohnung.flaeche } : {}),
        ...(data.wohnung?.jahr ? { jahr: data.wohnung.jahr } : {}),
        ...(data.wohnung?.vorauszahlung ? { vorauszahlung: data.wohnung.vorauszahlung } : {}),
      }));
      if (setWerte && data.werte) setWerte(p => ({ ...p, ...data.werte }));
      setFotoAnzahl(data.anzahlErkannt || 0);
      setHinweise(data.hinweise || []);
      setFotoStatus("fertig");
    } catch (err) {
      console.error("Foto-Erkennung fehlgeschlagen:", err.message);
      setAnalyseFehler(err.message || "");
      setFotoStatus("fehler");
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
            Bis zu {MAX_BILDER} Fotos hinzufügen — auch nacheinander, z. B. Seite für Seite. Am besten die Übersichtsseite mit der Kostenaufstellung fotografieren (meist die ersten Seiten der Abrechnung), gerne zusätzlich weitere Seiten, falls z. B. CO2-Kosten separat aufgeführt sind. Sobald alle Fotos da sind, unten auf "Fotos analysieren" tippen. Die Fotos werden nur zur Erkennung genutzt, nicht gespeichert.
          </div>

          {fotos.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
              {fotos.map((f, i) => (
                <div key={f.id} style={{ position: "relative", width: 60, height: 60, borderRadius: THEME.radius.sm, overflow: "hidden", border: "1px solid " + C.border, flexShrink: 0 }}>
                  <img src={f.previewUrl} alt={"Foto " + (i + 1)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  <div title={f.status === "bereit" ? "Bereit" : f.status === "fehler" ? f.fehlerText : "Wird geprüft …"} style={{
                    position: "absolute", top: 3, left: 3, width: 16, height: 16, borderRadius: "50%",
                    background: f.status === "bereit" ? C.brand : f.status === "fehler" ? C.warn : C.textDim,
                    color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
                  }}>
                    {f.status === "bereit" ? "✓" : f.status === "fehler" ? "!" : "…"}
                  </div>
                  <button
                    onClick={() => entferneFoto(f.id)}
                    aria-label={"Foto " + (i + 1) + " entfernen"}
                    style={{
                      position: "absolute", top: 3, right: 3, width: 18, height: 18, borderRadius: "50%",
                      background: "rgba(0,0,0,0.6)", color: "#fff", border: "none", fontSize: 12, lineHeight: "17px",
                      cursor: "pointer", padding: 0, fontFamily: "system-ui, sans-serif",
                    }}
                  >×</button>
                </div>
              ))}
            </div>
          )}

          {fotos.some(f => f.status === "fehler") && (
            <div style={{ marginBottom: 10, fontSize: 12, color: C.warn, lineHeight: 1.7 }}>
              {fotos.map((f, i) => f.status === "fehler" ? <div key={f.id}>⚠ Foto {i + 1}: {f.fehlerText}</div> : null)}
            </div>
          )}

          {fotos.length < MAX_BILDER && (
            <label
              htmlFor="foto-upload-input"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                background: C.accent,
                color: C.accentText,
                fontFamily: THEME.font.heading,
                fontWeight: 600,
                fontSize: 14,
                padding: "14px 20px",
                borderRadius: THEME.radius.md,
                cursor: "pointer",
                userSelect: "none",
                boxSizing: "border-box",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              📷 {fotos.length === 0 ? "Foto aufnehmen oder auswählen" : "Weiteres Foto hinzufügen"}
            </label>
          )}
          {/* Label+input-Kopplung statt Klick-Handler in JS: löst auf iOS/Android zuverlässig
              denselben nativen Dialog aus (Kamera direkt fotografieren ODER aus der Galerie
              wählen), mit großem, gut sichtbarem Tap-Ziel. onChange FÜGT der Liste oben hinzu,
              statt sofort zu analysieren — siehe Kommentar bei handleDateiAuswahl(). */}
          <input id="foto-upload-input" type="file" accept="image/*" multiple onChange={handleDateiAuswahl}
            style={{ display: "none" }} />

          <div style={{ fontSize: 11, color: C.textDim, marginTop: 8 }}>
            {fotos.length} von {MAX_BILDER} Fotos ausgewählt{fotos.length >= MAX_BILDER ? " — Maximum erreicht" : ""}
          </div>

          {fotos.some(f => f.status === "bereit") && (
            <button
              onClick={handleAnalysieren}
              disabled={fotoStatus === "analysiere"}
              style={{
                marginTop: 10, width: "100%",
                background: fotoStatus === "analysiere" ? C.border : C.brand,
                color: fotoStatus === "analysiere" ? C.textDim : "#fff",
                border: "none", borderRadius: THEME.radius.md, padding: "13px",
                fontSize: 14, fontWeight: 600, fontFamily: THEME.font.heading,
                cursor: fotoStatus === "analysiere" ? "default" : "pointer",
              }}
            >
              {fotoStatus === "analysiere" ? "Wird analysiert …" : "✓ " + fotos.filter(f => f.status === "bereit").length + " Foto(s) analysieren"}
            </button>
          )}

          {fotoStatus === "fertig" && (
            <div style={{ marginTop: 10, fontSize: 12, color: C.brand, fontWeight: 600 }}>
              ✓ {fotoAnzahl > 0 ? fotoAnzahl + " Posten erkannt und unten ausgefüllt" : "Wohnungsdaten übernommen, aber keine Posten sicher erkannt"} — bitte prüfen.
            </div>
          )}
          {fotoStatus === "fehler" && (
            <div style={{ marginTop: 10, fontSize: 12, color: C.warn }}>
              {analyseFehler || "Erkennung fehlgeschlagen."} Bitte Werte manuell eingeben (unten und auf der nächsten Seite) oder erneut versuchen.
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
