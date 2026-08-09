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
// gegenüber Vercels 4,5-MB-Body-Limit (siehe MAX_DATEIEN unten).
const MAX_DATEIEN = 6;
const MIN_AUFLOESUNG = 500; // px, kürzere Seite — darunter ist Text erfahrungsgemäß nicht zuverlässig lesbar

// PDF-Unterstützung (08/2026, siehe CHANGELOG.md): Wer seine Abrechnung digital
// zugeschickt bekommt, hat oft ein PDF statt Fotos — meist sogar besser lesbar
// als ein Handyfoto. Anthropics API erlaubt PDFs bis 32 MB/100 Seiten, das ist
// hier nicht die Grenze. Die eigentliche Grenze ist Vercels FESTES 4,5-MB-
// Body-Limit für die gesamte Anfrage (nicht änderbar, siehe api/analyse-foto.js).
// Base64 vergrößert eine Datei um ca. 1/3 — 3 MB Rohdatei werden so zu ca.
// 4 MB kodiert, lässt noch Puffer für weitere Dateien/Overhead im selben
// Durchlauf. Anders als bei Fotos gibt es kein client-seitiges Verkleinern
// für PDFs (das würde die Textqualität verschlechtern) — bei Überschreitung
// wird stattdessen erklärt, dass nur die Seite mit der Kostenaufstellung
// nötig ist (siehe Fehlermeldung unten).
const MAX_PDF_MB = 3;

// Rotierende Zwischenmeldungen während der Foto-Analyse (08/2026, siehe
// CHANGELOG.md und Kommentar bei analyseSek unten) — inhaltlich an das
// tatsächliche Zwei-Schritt-Vorgehen aus dem Prompt (api/analyse-foto.js)
// angelehnt, damit die Anzeige nicht frei erfunden wirkt.
const ANALYSE_MSGS = [
  "Fotos werden gelesen…",
  "Jede Kostenzeile wird einzeln erfasst…",
  "Beträge werden den passenden Positionen zugeordnet…",
  "Kaltwasser- und Heizkosten werden geprüft…",
  "Fast fertig…",
];

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

function pdfAufBase64(file) {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_PDF_MB * 1024 * 1024) {
      reject(new Error("pdf_zu_gross"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = () => reject(new Error("PDF konnte nicht gelesen werden"));
    reader.readAsDataURL(file);
  });
}

export default function Wohnung({ navigateTo, wohnung, setWohnung, werte, setWerte, gesamtsummeAbrechnung, setGesamtsummeAbrechnung }) {
  const C = THEME.color;
  const [errors, setErrors] = useState({});

  // Foto-/PDF-Upload 08/2026, Überarbeitung nach Praxistest von Stefan (siehe
  // CHANGELOG.md): Ursprünglich löste jede Dateiauswahl SOFORT eine Analyse
  // aus. Auf dem Handy bedeutet das: ein Kamera-Foto = ein sofortiger,
  // isolierter API-Aufruf — es gab keine Möglichkeit, mehrere Fotos (z.B.
  // Seite für Seite fotografiert) erst zu sammeln, zu sehen was schon
  // ausgewählt ist, und dann gemeinsam auszuwerten. Das führte zu genau der
  // Verwirrung, die gemeldet wurde ("welches Foto ist jetzt im Upload?").
  // Jetzt zweistufig: 1) Dateien sammeln (mit sichtbarer Vorschau + Status
  // pro Datei, mehrfach nacheinander möglich), 2) explizit "analysieren".
  // "dateien" statt "fotos" benannt, seit auch PDFs möglich sind (typ: 'bild'|'pdf').
  const [dateien, setDateien] = useState([]); // { id, name, typ, previewUrl, status: 'laedt'|'bereit'|'fehler', fehlerText, base64 }
  // Karte startet eingeklappt (08/2026, siehe CHANGELOG.md): Das Feature ist
  // optional, wer es ignoriert soll nicht erst an sieben UI-Elementen
  // vorbeiscrollen, bevor das erste echte Formularfeld kommt. Dateien können
  // nur ausgewählt werden, wenn aufgeklappt (der Upload-Button steckt im
  // ausgeklappten Bereich) — daher kein Sonderfall nötig, der die Karte von
  // selbst wieder öffnet.
  const [aufgeklappt, setAufgeklappt] = useState(false);
  const [fotoStatus, setFotoStatus] = useState("idle"); // idle | analysiert | fertig | fehler — bezieht sich nur auf den Analyse-Schritt
  const [fotoAnzahl, setFotoAnzahl] = useState(0);
  const [analyseFehler, setAnalyseFehler] = useState(""); // konkrete Server-/Netzwerk-Fehlermeldung statt generischem Text
  const [hinweise, setHinweise] = useState([]); // Bild-/Lesbarkeitsprobleme laut KI-Antwort
  const setW = (k, v) => setWohnung(p => ({ ...p, [k]: v }));

  // Fortschrittsanzeige während der Foto-Analyse (08/2026, siehe CHANGELOG.md):
  // Stefans berechtigter Einwand — seit effort:"high"/"max" kann ein Aufruf
  // 30 Sek. bis über 2 Min. dauern, vorher waren es 1-3 Sek. Ohne sichtbaren
  // Fortschritt wirkt das wie ein hängengebliebenes Tool. Sekunden-Zähler +
  // rotierende Zwischenmeldungen (gleiches Muster wie Loading.jsx) schaffen
  // Transparenz, dass im Hintergrund noch gearbeitet wird.
  const [analyseSek, setAnalyseSek] = useState(0);
  const [analyseMsgIdx, setAnalyseMsgIdx] = useState(0);
  useEffect(() => {
    if (fotoStatus !== "analysiere") { setAnalyseSek(0); setAnalyseMsgIdx(0); return; }
    const sekIv = setInterval(() => setAnalyseSek(s => s + 1), 1000);
    // Bleibt bei der letzten Meldung stehen (kein Zurückspringen), auch wenn
    // die Analyse länger dauert als die Summe der Intervalle unten.
    const msgIv = setInterval(() => setAnalyseMsgIdx(i => Math.min(i + 1, ANALYSE_MSGS.length - 1)), 8000);
    return () => { clearInterval(sekIv); clearInterval(msgIv); };
  }, [fotoStatus]);

  // Blob-URLs (für die Vorschaubilder) beim Verlassen der Seite wieder
  // freigeben, statt sie bis zum Tab-Schließen im Speicher zu halten.
  const dateienRef = useRef(dateien);
  useEffect(() => { dateienRef.current = dateien; }, [dateien]);
  useEffect(() => () => { dateienRef.current.forEach(f => URL.revokeObjectURL(f.previewUrl)); }, []);

  function neueDateiId() {
    return (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now() + Math.random());
  }

  // Nimmt neu ausgewählte Dateien entgegen (Kamera-Aufnahme = 1 Datei, Galerie-
  // Mehrfachauswahl = mehrere, oder eine einzelne PDF) und FÜGT sie der
  // bestehenden Liste hinzu, statt sie sofort zu verschicken. Jede Datei wird
  // unabhängig von den anderen client-seitig verarbeitet/geprüft, damit eine
  // einzelne schlechte Datei die Bearbeitung der übrigen nicht blockiert.
  function handleDateiAuswahl(e) {
    const neueDateien = Array.from(e.target.files || []);
    e.target.value = ""; // sofort zurücksetzen — sonst lässt sich dieselbe Datei kein zweites Mal auswählen
    if (neueDateien.length === 0) return;

    const freiePlaetze = MAX_DATEIEN - dateien.length;
    if (freiePlaetze <= 0) return;
    const zuVerarbeiten = neueDateien.slice(0, freiePlaetze);

    const neueEintraege = zuVerarbeiten.map(file => ({
      id: neueDateiId(),
      name: file.name,
      typ: file.type === "application/pdf" ? "pdf" : "bild",
      previewUrl: file.type === "application/pdf" ? null : URL.createObjectURL(file),
      status: "laedt",
      fehlerText: "",
      base64: null,
    }));
    setDateien(prev => [...prev, ...neueEintraege]);
    // Wie bei entferneDatei(): ein vorheriges Analyse-Ergebnis bezieht sich auf
    // eine jetzt andere Datei-Zusammenstellung und sollte nicht mehr als aktuell
    // erscheinen, bis neu analysiert wurde.
    if (fotoStatus === "fertig" || fotoStatus === "fehler") setFotoStatus("idle");

    neueEintraege.forEach((eintrag, i) => {
      const verarbeiten = eintrag.typ === "pdf" ? pdfAufBase64(zuVerarbeiten[i]) : bildAufBase64(zuVerarbeiten[i]);
      verarbeiten
        .then(base64 => {
          setDateien(prev => prev.map(f => f.id === eintrag.id ? { ...f, status: "bereit", base64 } : f));
        })
        .catch(err => {
          const text = err?.message === "zu_niedrig_aufgeloest"
            ? "Auflösung zu niedrig. Bitte näher heran und schärfer fotografieren."
            : err?.message === "pdf_zu_gross"
            ? `Datei über ${MAX_PDF_MB} MB. Bitte nur die Seite(n) mit der Kostenaufstellung hochladen, Einzel- oder Detailaufstellungen zu bestimmten Positionen werden für die Erkennung nicht benötigt.`
            : "Konnte nicht gelesen werden.";
          setDateien(prev => prev.map(f => f.id === eintrag.id ? { ...f, status: "fehler", fehlerText: text } : f));
        });
    });
  }

  function entferneDatei(id) {
    setDateien(prev => {
      const eintrag = prev.find(f => f.id === id);
      if (eintrag?.previewUrl) URL.revokeObjectURL(eintrag.previewUrl);
      return prev.filter(f => f.id !== id);
    });
    // Ergebnis eines vorherigen Durchlaufs nicht mehr als aktuell ausweisen,
    // sobald sich die Datei-Auswahl ändert — verhindert veraltete "✓ erkannt"-
    // Anzeige, die sich auf eine inzwischen andere Zusammenstellung bezieht.
    if (fotoStatus === "fertig" || fotoStatus === "fehler") setFotoStatus("idle");
  }

  async function handleAnalysieren() {
    const bereite = dateien.filter(f => f.status === "bereit");
    if (bereite.length === 0) return;
    setFotoStatus("analysiere");
    setAnalyseFehler("");
    setHinweise([]);
    try {
      const res = await fetch("/api/analyse-foto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dateien: bereite.map(f => ({ typ: f.typ, daten: f.base64 })) }),
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
      // Gesamtsumme laut Abrechnung (08/2026, siehe CHANGELOG.md): macht den
      // bereits vorhandenen Plausibilitäts-Abgleich in Posten.jsx automatisch
      // wirksam, auch bei per Foto vorausgefüllten Werten — genau der
      // Abgleich, der Stefans gemeldeten Doppelzählungs-Fehler beim nächsten
      // Mal automatisch sichtbar gemacht hätte, statt erst beim Ergebnis.
      if (setGesamtsummeAbrechnung && data.wohnung?.gesamtsummeLautAbrechnung) {
        setGesamtsummeAbrechnung(data.wohnung.gesamtsummeLautAbrechnung);
      }
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
    else if (flaecheNum > 500) e.flaeche = "Bitte prüfen: über 500 m² ungewöhnlich";

    const jahrNum = parseInt(wohnung.jahr, 10);
    if (!wohnung.jahr || wohnung.jahr.length !== 4 || isNaN(jahrNum)) e.jahr = "Gültiges Jahr erforderlich (4-stellig)";
    else if (jahrNum < 2000 || jahrNum > AKTUELLES_JAHR) e.jahr = "Jahr zwischen 2000 und " + AKTUELLES_JAHR + " erwartet";

    const vzNum = toNum(wohnung.vorauszahlung);
    if (!wohnung.vorauszahlung || vzNum <= 0) e.vorauszahlung = "Bitte Vorauszahlungen eingeben";
    else if (vzNum > 50000) e.vorauszahlung = "Bitte prüfen: Betrag ungewöhnlich hoch";

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
          Du zahlst monatlich Abschläge für Heizung, Wasser, Müll u. a. Einmal im Jahr rechnet dein Vermieter ab, was tatsächlich angefallen ist. Im nächsten Schritt siehst du jeden Posten zur Prüfung: per Foto- oder PDF-Upload automatisch befüllt oder komplett manuell, genau so wie er auf der Abrechnung steht.
        </div>

        <div style={{ background: C.surface, border: "1px solid " + (fotoStatus === "fertig" ? C.brand : C.border), borderRadius: THEME.radius.lg, padding: "16px", marginBottom: 16 }}>
          {/* Ganze Kopfzeile ist der Auf-/Zuklapp-Schalter — als <button> statt
              <div onClick>, damit Tastatur/Screenreader die Interaktivität
              korrekt erkennen (aria-expanded). Icon kleiner als vorher (26px
              statt 40px): die Kopfzeile soll im eingeklappten Zustand so
              kompakt wie möglich sein, ein einzeiliger Titel plus Chevron
              reichen als Einladung zum Aufklappen. */}
          <button
            onClick={() => setAufgeklappt(a => !a)}
            aria-expanded={aufgeklappt}
            style={{
              display: "flex", alignItems: "center", gap: 10, width: "100%",
              background: "none", border: "none", padding: 0, margin: 0,
              cursor: "pointer", textAlign: "left", fontFamily: THEME.font.body,
            }}
          >
            <div style={{ fontSize: 26, lineHeight: 1, flexShrink: 0 }}>📱</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, fontFamily: THEME.font.heading }}>Keine Lust abzutippen?<br />Mach Fotos!</div>
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>Optional. Felder automatisch ausfüllen lassen.</div>
            </div>
            <div style={{ fontSize: 16, color: C.textDim, flexShrink: 0, transform: aufgeklappt ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>⌄</div>
          </button>

          {aufgeklappt && (
          <div style={{ marginTop: 16 }}>
          {/* Zwei Wege, klar getrennt, mit hängendem Einzug (Icon in fester Spalte,
              Text danebengesetzt) statt Blocksatz oder Zentrierung — bei dieser
              Spaltenbreite würde Blocksatz nur unschöne, ungleiche Wortabstände
              erzeugen und Zentrierung lässt Icon/Fettung ohne klare Kante wirken.
              Label (fett) und Beschreibung jetzt in getrennten Zeilen statt in
              einer Zeile mit Doppelpunkt — auf Wunsch, die Fettung allein reicht
              als Kennzeichnung des Labels. */}
          <div style={{ background: C.bg, borderRadius: THEME.radius.md, padding: "10px 12px", marginBottom: 10 }}>
            <div style={{ display: "grid", gridTemplateColumns: "20px 1fr", columnGap: 8, rowGap: 10, fontSize: 12, color: C.text, lineHeight: 1.55 }}>
              <span>📱</span>
              <div>
                <div style={{ fontWeight: 700 }}>Smartphone</div>
                <div>Foto aufnehmen oder aus der Fotomediathek wählen.</div>
              </div>
              <span>💻</span>
              <div>
                <div style={{ fontWeight: 700 }}>PC/Mac</div>
                <div>Aus der Mediathek wählen oder als PDF hochladen.</div>
              </div>
            </div>
          </div>

          {/* Als Bulletpoints statt zwei getrennter Icon-Zeilen — bessere
              Lesbarkeit für zwei kurze, gleichrangige Hinweise. Bullet in
              fester Spalte (hängender Einzug, gleiches Muster wie beim
              Smartphone/PC-Block oben) statt Bullet+Text im Fließtext — sonst
              rutscht eine umgebrochene zweite Zeile unter das Bullet-Zeichen
              statt unter den Textanfang. */}
          <div style={{ display: "grid", gridTemplateColumns: "10px 1fr", columnGap: 6, rowGap: 4, fontSize: 11, color: C.textDim, marginBottom: 10, lineHeight: 1.6 }}>
            <span>•</span><span>Bis zu {MAX_DATEIEN} Seiten hochladen, die Kostenaufstellung reicht aus.</span>
            <span>•</span><span>Alle Uploads werden ausschließlich zur Analyse genutzt und nicht gespeichert.</span>
          </div>

          {dateien.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
              {dateien.map((f, i) => (
                <div key={f.id} style={{ position: "relative", width: 60, height: 60, borderRadius: THEME.radius.sm, overflow: "hidden", border: "1px solid " + C.border, flexShrink: 0, background: C.brandBg }}>
                  {f.typ === "pdf" ? (
                    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ fontSize: 20 }}>📄</div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: C.brand }}>PDF</div>
                    </div>
                  ) : (
                    <img src={f.previewUrl} alt={"Datei " + (i + 1)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  )}
                  <div title={f.status === "bereit" ? "Bereit" : f.status === "fehler" ? f.fehlerText : "Wird geprüft …"} style={{
                    position: "absolute", top: 3, left: 3, width: 16, height: 16, borderRadius: "50%",
                    background: f.status === "bereit" ? C.brand : f.status === "fehler" ? C.warn : C.textDim,
                    color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
                  }}>
                    {f.status === "bereit" ? "✓" : f.status === "fehler" ? "!" : "…"}
                  </div>
                  <button
                    onClick={() => entferneDatei(f.id)}
                    aria-label={"Datei " + (i + 1) + " entfernen"}
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

          {dateien.some(f => f.status === "fehler") && (
            <div style={{ marginBottom: 10, fontSize: 12, color: C.warn, lineHeight: 1.7 }}>
              {dateien.map((f, i) => f.status === "fehler" ? <div key={f.id}>⚠ Datei {i + 1}: {f.fehlerText}</div> : null)}
            </div>
          )}

          {/* Upload- und Analysieren-Button verschwinden, sobald fotoStatus
              "fertig" ist (08/2026, siehe CHANGELOG.md — Stefans Meldung: ohne
              diese Sperre ließ sich "analysieren" beliebig oft erneut klicken,
              jedes Mal ein neuer, echter API-Aufruf mit echten Kosten, obwohl
              das Ergebnis schon vorlag). Statt die Karte komplett zu sperren,
              gibt es einen bewussten zweiten Schritt ("Andere Datei hochladen"),
              der fotoStatus zurück auf "idle" setzt — ein versehentlicher
              Doppelklick löst dadurch nichts mehr aus, ein ABSICHTLICHES "ich
              will nochmal" bleibt aber möglich. */}
          {dateien.length < MAX_DATEIEN && fotoStatus !== "fertig" && (
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
              📎 {dateien.length === 0 ? "Foto oder PDF hinzufügen" : "Weitere Datei hinzufügen"}
            </label>
          )}
          {/* Label+input-Kopplung statt Klick-Handler in JS: löst auf iOS/Android zuverlässig
              denselben nativen Dialog aus (Kamera direkt fotografieren, aus der Galerie wählen
              ODER eine Datei/PDF wählen), mit großem, gut sichtbarem Tap-Ziel. onChange FÜGT der
              Liste oben hinzu, statt sofort zu analysieren — siehe Kommentar bei handleDateiAuswahl(). */}
          {/* accept mit LEERZEICHEN statt Komma getrennt (08/2026, siehe
              CHANGELOG.md): Stefan konnte in der iOS-Fotomediathek nur ein
              Foto auf einmal auswählen statt mehrere. Dokumentierter iOS-
              Safari-Bug: bei kommagetrennten MIME-Typen im accept-Attribut
              fällt iOS teils auf einen eingeschränkten Auswahl-Modus zurück,
              leerzeichen-getrennt funktioniert zuverlässiger. Noch nicht
              erneut auf dem iPhone verifiziert. */}
          <input id="foto-upload-input" type="file" accept="image/* application/pdf" multiple onChange={handleDateiAuswahl}
            style={{ display: "none" }} />

          {fotoStatus !== "fertig" && (
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 8 }}>
              {dateien.length} von {MAX_DATEIEN} Dateien ausgewählt{dateien.length >= MAX_DATEIEN ? " · Maximum erreicht" : ""}
            </div>
          )}

          {dateien.some(f => f.status === "bereit") && fotoStatus !== "fertig" && fotoStatus !== "analysiere" && (
            <button
              onClick={handleAnalysieren}
              style={{
                marginTop: 10, width: "100%",
                background: C.brand, color: "#fff",
                border: "none", borderRadius: THEME.radius.md, padding: "13px",
                fontSize: 14, fontWeight: 600, fontFamily: THEME.font.heading,
                cursor: "pointer",
              }}
            >
              ✓ {dateien.filter(f => f.status === "bereit").length} Datei(en) analysieren
            </button>
          )}

          {/* Eigener Fortschritts-Block statt nur geänderter Button-Text
              (08/2026, siehe CHANGELOG.md): seit effort:"high" kann ein
              Durchlauf 30 Sek. bis über 2 Min. dauern (vorher 1-3 Sek.) —
              ohne sichtbaren Fortschritt sieht das nach einem hängenden Tool
              aus. Sekunden-Zähler ist bewusst grob (volle Sekunden reichen),
              rotierende Meldungen sind an den tatsächlichen Prompt-Ablauf
              angelehnt (siehe ANALYSE_MSGS oben). */}
          {fotoStatus === "analysiere" && (
            <div style={{ marginTop: 10, background: C.brandBg, borderRadius: THEME.radius.md, padding: "14px 16px", textAlign: "center" }}>
              <style>{`
                @keyframes nkrFotoSpin { to { transform: rotate(360deg); } }
              `}</style>
              <div style={{
                width: 22, height: 22, margin: "0 auto 10px", borderRadius: "50%",
                border: "3px solid " + C.border, borderTopColor: C.brand,
                animation: "nkrFotoSpin 0.8s linear infinite",
              }} />
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>
                Wird analysiert … ({analyseSek}s)
              </div>
              <div style={{ fontSize: 12, color: C.textMuted, minHeight: 16 }}>{ANALYSE_MSGS[analyseMsgIdx]}</div>
              <div style={{ fontSize: 11, color: C.textDim, marginTop: 8 }}>
                Das kann bis zu 2 Minuten dauern — wir prüfen jede Zeile einzeln, um Verwechslungen zu vermeiden. Bitte die Seite offen lassen.
              </div>
            </div>
          )}

          {fotoStatus === "fertig" && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 12, color: C.brand, fontWeight: 600 }}>
                ✓ {fotoAnzahl > 0 ? fotoAnzahl + " Posten erkannt und unten ausgefüllt." : "Wohnungsdaten übernommen, aber keine Posten sicher erkannt."} Bitte prüfen.
              </div>
              <button
                onClick={() => setFotoStatus("idle")}
                style={{
                  marginTop: 8, background: "none", border: "none", padding: 0,
                  color: C.textMuted, fontSize: 12, textDecoration: "underline",
                  cursor: "pointer", fontFamily: THEME.font.body,
                }}
              >
                Andere Datei hochladen / erneut analysieren
              </button>
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
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "0 0 16px" }}>
          <div style={{ flex: 1, height: 1, background: C.border }} />
          <div style={{ fontSize: 11, color: C.textDim, textTransform: "uppercase" }}>oder manuell</div>
          <div style={{ flex: 1, height: 1, background: C.border }} />
        </div>

        <Field label="Wohnfläche laut Mietvertrag" value={wohnung.flaeche} onChange={v => setW("flaeche", v)} type="number" placeholder="z. B. 75" suffix="m²" width="short" required error={errors.flaeche} tip="Steht auf dem Deckblatt oder im Mietvertrag" />
        <Field label="Abrechnungsjahr" value={wohnung.jahr} onChange={v => setW("jahr", v)} type="number" placeholder="z. B. 2025" width="short" required error={errors.jahr} tip="Das Kalenderjahr oben auf der Abrechnung" />
        <Field label="Geleistete Vorauszahlungen" value={wohnung.vorauszahlung} onChange={v => setW("vorauszahlung", v)} money placeholder="z. B. 2.400,00" prefix="€" width="medium" required error={errors.vorauszahlung} tip="Alle Abschläge des Jahres, steht als 'Summe Vorauszahlungen' auf der Abrechnung" />

        {vzQm !== null && vzQm < 0.5 && (
          <div style={{ background: C.warnBg, borderLeft: "3px solid " + C.warn, borderRadius: THEME.radius.md, padding: "12px 14px", marginBottom: 10, fontSize: 13, color: C.warn }}>
            Vorauszahlung sehr niedrig: {fmt(vzQm)}/m²/Monat. DMB-Richtwert: {fmt(BUSINESS.RICHTWERTE.gesamt)}/m²/Monat. Bitte Eingabe prüfen.
          </div>
        )}
        {vzQm !== null && vzQm > BUSINESS.RICHTWERTE.gesamt * 2 && (
          <div style={{ background: C.warnBg, borderLeft: "3px solid " + C.warn, borderRadius: THEME.radius.md, padding: "12px 14px", marginBottom: 10, fontSize: 13, color: C.warn }}>
            Vorauszahlung auffällig hoch: {fmt(vzQm)}/m²/Monat, mehr als doppelt so hoch wie der DMB-Richtwert.
          </div>
        )}

        <Btn onClick={() => { if (validate()) navigateTo("posten"); }}>Weiter zu den Posten →</Btn>
      </div>
    </div>
  );
}
