// ─────────────────────────────────────────────────────────────────────────
// App.jsx — Zentrale: Routing (echte URL pro Seite) + globaler Zustand.
//
// Jede Seite hat jetzt eine eigene URL (wichtig für SEO, Verlinkbarkeit,
// Zurück-Button — vorher hatten nur "/", "/ratgeber" und "/ueber-uns" eigene
// URLs, alle anderen Schritte inkl. Impressum/AGB/Datenschutz teilten sich
// die zuletzt besuchte URL). Siehe CHANGELOG.md.
//
// Die eigentliche Seiten-Logik steckt in src/pages/*.jsx — diese Datei
// kennt nur noch die Zuordnung URL <-> Seite und hält den gemeinsam
// genutzten Zustand (Formulardaten, Ergebnis, Kaufstatus).
// ─────────────────────────────────────────────────────────────────────────
import { useState, useCallback, useEffect, lazy, Suspense } from "react";
import { ARTIKEL } from "./artikel.js";
import { IS_DEMO } from "./config/business.js";
import { buildResult, ALLE_POSTEN } from "./lib/analyse.js";
import { toNum } from "./lib/format.js";

import CookieBanner from "./components/layout/CookieBanner.jsx";
import NachladeFehler from "./components/layout/NachladeFehler.jsx";
import Welcome from "./pages/Welcome.jsx";
import Wohnung from "./pages/Wohnung.jsx";
import Posten from "./pages/Posten.jsx";
import Loading from "./pages/Loading.jsx";
import Result from "./pages/Result.jsx";
import Adressen from "./pages/Adressen.jsx";
import Login from "./pages/Login.jsx";

// ───────────────────────────────────────────────────────────────────────────
// NACHGELADENE SEITEN (11.09.2026)
//
// PROBLEM, das Stefan bemerkt hat: Beim Aufruf der Seite blitzte für den
// Bruchteil einer Sekunde der reine Text ohne Gestaltung auf — schwarz auf
// weiß. Ursache war eine Nebenwirkung des Vorrenderns vom Vortag: Seit dem
// 10.09. steht im ausgelieferten HTML echter Text (vorher war die Seite
// leer). Den zeigt der Browser sofort an; die Gestaltung entsteht aber erst,
// wenn React geladen und gestartet ist, weil sämtliche Stile als
// JavaScript-Objekte im Bundle stecken.
//
// Je länger React zum Starten braucht, desto länger ist der ungestaltete
// Moment sichtbar. Und React brauchte lange: Das Bundle war 1,72 MB groß.
//
// Der mit Abstand größte Brocken darin war @react-pdf/renderer (inklusive
// pdfkit und fontkit) — eine PDF-Maschine, die AUSSCHLIESSLICH nach dem Kauf
// gebraucht wird, auf den Seiten Download und Konto. Jeder Besucher der
// Startseite hat sie mitgeladen, ohne sie je zu benutzen.
//
// Download und Konto werden deshalb per lazy() nachgeladen. Vite legt sie
// dadurch in eigene Dateien, die erst beim Aufruf dieser Seiten geholt
// werden. Für den Nutzer ändert sich nichts außer einer kurzen Ladeanzeige
// beim ersten Öffnen — und die fällt dort nicht auf, weil das PDF ohnehin
// erst erzeugt werden muss.
//
// WICHTIG bei künftigen Änderungen: Keine weiteren Imports aus
// @react-pdf/renderer in Dateien, die App.jsx direkt lädt — sonst landet die
// Bibliothek wieder im Startbundle. scripts/seo-check.mjs prüft die
// Bundle-Größe und schlägt Alarm, wenn sie wieder über die Grenze wächst.
// ───────────────────────────────────────────────────────────────────────────
const Download = lazy(() => import("./pages/Download.jsx"));
const Konto = lazy(() => import("./pages/Konto.jsx"));
import Danke from "./pages/Danke.jsx";
import Impressum from "./pages/Impressum.jsx";
import AGB from "./pages/AGB.jsx";
import Datenschutz from "./pages/Datenschutz.jsx";
import Ratgeber from "./pages/Ratgeber.jsx";
import Artikel from "./pages/Artikel.jsx";
import UeberUns from "./pages/UeberUns.jsx";
import FAQ from "./pages/FAQ.jsx";
import { BASIS_URL, OG_BILD, NICHT_INDEXIEREN, seoFuer, artikelTitel, artikelBeschreibung } from "./config/seo.js";

// URL <-> Seiten-Name. Jeder Eintrag hier bekommt eine echte, eigene URL.
const ROUTES = {
  "/": "welcome",
  "/pruefen/wohnung": "wohnung",
  "/pruefen/posten": "posten",
  "/pruefen/ergebnis": "result",
  "/pruefen/absender": "adressen",
  "/pruefen/download": "download",
  "/pruefen/konto": "konto",
  "/login": "login",
  "/danke": "danke",
  "/impressum": "impressum",
  "/agb": "agb",
  "/datenschutz": "datenschutz",
  "/ratgeber": "ratgeber",
  "/ueber-uns": "ueberuns",
  "/faq": "faq",
};
const STEP_ZU_PFAD = Object.fromEntries(Object.entries(ROUTES).map(([pfad, step]) => [step, pfad]));

function pfadZuStep(pfad) {
  if (pfad.startsWith("/ratgeber/")) return "artikel";
  return ROUTES[pfad] || "welcome";
}

export default function App() {
  const [step, setStep] = useState(() => pfadZuStep(window.location.pathname));
  const [ratgeberArtikel, setRatgeberArtikel] = useState(() => {
    const p = window.location.pathname;
    return p.startsWith("/ratgeber/") ? p.replace("/ratgeber/", "") : null;
  });

  const navigateTo = useCallback((newStep) => {
    const pfad = newStep === "artikel" ? window.location.pathname : (STEP_ZU_PFAD[newStep] || "/");
    window.history.pushState({ step: newStep }, "", pfad);
    setStep(newStep);
    window.scrollTo(0, 0);
  }, []);

  const navigateToArtikel = useCallback((artikelId) => {
    setRatgeberArtikel(artikelId);
    window.history.pushState({ step: "artikel" }, "", "/ratgeber/" + artikelId);
    setStep("artikel");
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    // BUG-FIX 31.08.2026 (siehe CHANGELOG.md): Vorher hier nur pathname ohne
    // Query-String — das hat "?fortsetzen=<id>" (Später-fortsetzen-Link,
    // siehe App.jsx weiter unten) SOFORT aus der URL entfernt, bevor die
    // spätere useEffect ihn überhaupt lesen konnte. Live bestätigt: der Link
    // wurde geöffnet, aber api/draft.js nie aufgerufen — reiner Datenverlust
    // für den Nutzer, ohne jede Fehlermeldung. Jetzt bleibt der Query-String
    // erhalten, das Entfernen übernimmt weiterhin gezielt die fortsetzen-
    // Effekt selbst, NACHDEM der Entwurf geladen wurde (siehe unten).
    window.history.replaceState({ step }, "", window.location.pathname + window.location.search);
    const onPop = (e) => {
      const p = window.location.pathname;
      if (p.startsWith("/ratgeber/")) { setRatgeberArtikel(p.replace("/ratgeber/", "")); setStep("artikel"); }
      else setStep(pfadZuStep(p));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // SEO: Titel/Meta pro Route aktualisieren (Vite baut nur eine index.html)
  //
  // KORRIGIERT 10.09.2026 nach dem Live-Check. Der Fehler vorher: Dieser
  // Effekt kannte nur zwei Fälle — Artikelseiten und "alles andere". "Alles
  // andere" bekam den Startseitentitel. Damit hat er die korrekt
  // vorgerenderten Titel von /faq und /ratgeber im Browser wieder
  // überschrieben, und weil Google JavaScript ausführt, hat Google den
  // falschen Titel gesehen. Auch das Canonical von /ueber-uns zeigte
  // dadurch auf "/" — die Seite hätte sich selbst wegkanonisiert.
  //
  // Jetzt kommen die Texte aus src/config/seo.js, aus der auch
  // scripts/prerender.mjs liest. Beide Wege können nicht mehr auseinander
  // laufen.
  useEffect(() => {
    let { titel, beschreibung } = seoFuer(step);
    let pfad = STEP_ZU_PFAD[step] || "/";
    if (step === "artikel") {
      const a = ARTIKEL.find(a => a.id === ratgeberArtikel);
      if (a) { titel = artikelTitel(a); beschreibung = artikelBeschreibung(a); pfad = "/ratgeber/" + a.id; }
    }
    document.title = titel;
    const setMeta = (sel, attr, value) => { const el = document.querySelector(sel); if (el) el.setAttribute(attr, value); };
    setMeta('meta[name="description"]', "content", beschreibung);
    setMeta('meta[property="og:title"]', "content", titel);
    setMeta('meta[property="og:description"]', "content", beschreibung);
    setMeta('meta[property="og:url"]', "content", BASIS_URL + pfad);
    setMeta('meta[property="og:image"]', "content", OG_BILD);
    setMeta('meta[name="twitter:title"]', "content", titel);
    setMeta('meta[name="twitter:description"]', "content", beschreibung);
    setMeta('link[rel="canonical"]', "href", BASIS_URL + pfad);

    // Zwischenschritte des Formulars und interne Seiten sollen nicht einzeln
    // in der Suche landen. Das robots-Meta wird dafür bei Bedarf angelegt
    // und sonst wieder entfernt — sonst bliebe ein einmal gesetztes noindex
    // beim Weiterklicken auf einer indexierbaren Seite stehen.
    const vorhanden = document.querySelector('meta[name="robots"]');
    if (NICHT_INDEXIEREN.includes(step)) {
      const el = vorhanden || document.head.appendChild(Object.assign(document.createElement("meta"), { name: "robots" }));
      el.setAttribute("content", "noindex, follow");
    } else if (vorhanden) {
      vorhanden.remove();
    }
  }, [step, ratgeberArtikel]);

  // Zwischenspeichern 30.08.2026 (siehe projektdokumentation-nkr.md Abschnitt 9,
  // UX-Test-Nachtrag): Ohne diese Funktion verlor ein Nutzer, der die Seite
  // versehentlich neu lädt, den Tab schließt oder das Handy sperrt, die
  // komplette Eingabe und musste bei Null anfangen — ein plausibler Grund für
  // einen Teil der Formular-Abbrüche. Automatisches, unsichtbares Speichern im
  // Browser (localStorage) als erste, einfachste Stufe: kein Konto, keine
  // E-Mail, kein Serverzugriff nötig. Für geräteübergreifendes Fortsetzen siehe
  // den separaten "Später fortsetzen"-Link auf der Ergebnis-Seite (Result.jsx,
  // nutzt api/draft.js).
  const NKR_DRAFT_KEY = "nkr-entwurf";

  function ladeEntwurf() {
    try {
      const raw = localStorage.getItem(NKR_DRAFT_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      // Grobe Alterprüfung clientseitig (30 Tage) — verhindert, dass ein sehr
      // alter, längst irrelevanter Entwurf (z.B. altes Abrechnungsjahr) Monate
      // später überraschend wieder auftaucht. Server-seitige Entwürfe (siehe
      // api/draft.js) haben zusätzlich eine eigene, kürzere Löschfrist.
      if (!data?.savedAt || Date.now() - data.savedAt > 30 * 24 * 60 * 60 * 1000) return null;
      return data;
    } catch { return null; }
  }

  // Gemeinsamer Zustand — bei Erststart wird ein evtl. vorhandener, noch
  // frischer Entwurf sofort geladen (siehe ladeEntwurf() oben). Kommt der
  // Nutzer über einen "Später fortsetzen"-Link (?fortsetzen=…) einer anderen
  // Sitzung, überschreibt der Fetch in der useEffect weiter unten das hier
  // ohnehin gleich wieder.
  const [wohnung, setWohnung] = useState(() => ladeEntwurf()?.wohnung || { flaeche: "", jahr: String(new Date().getFullYear() - 1), vorauszahlung: "" });
  const [werte, setWerte] = useState(() => ladeEntwurf()?.werte || {});
  // Gesamtsumme laut Abrechnung (08/2026, siehe CHANGELOG.md): vorher reiner
  // lokaler State in Posten.jsx, nur manuell befüllbar. Jetzt hier oben, damit
  // die Foto-/PDF-Erkennung (Wohnung.jsx) sie ebenfalls setzen kann — macht den
  // ohnehin schon vorhandenen Plausibilitäts-Abgleich in Posten.jsx automatisch
  // wirksam, auch wenn die Werte per Foto vorausgefüllt wurden, nicht nur bei
  // manueller Eingabe.
  const [gesamtsummeAbrechnung, setGesamtsummeAbrechnung] = useState(() => ladeEntwurf()?.gesamtsummeAbrechnung || "");
  // "Später fortsetzen"-Link: /pruefen/wohnung?fortsetzen=<id> (siehe Button in
  // Result.jsx). Lädt den serverseitig gespeicherten Entwurf (api/draft.js)
  // und ERSETZT den lokalen Stand damit — bewusst nur bei explizitem Aufruf
  // über diesen Link, nicht automatisch, damit ein Gerätewechsel nie
  // stillschweigend eine andere Eingabe überschreibt.
  const [entwurfLadeFehler, setEntwurfLadeFehler] = useState("");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("fortsetzen");
    if (!id) return;
    fetch("/api/draft?id=" + encodeURIComponent(id))
      .then(res => res.ok ? res.json() : Promise.reject(new Error(res.status === 404 ? "Dieser Link ist abgelaufen oder ungültig." : "Entwurf konnte nicht geladen werden.")))
      .then(data => {
        if (data.wohnung) setWohnung(data.wohnung);
        if (data.werte) setWerte(data.werte);
        if (data.gesamtsummeAbrechnung) setGesamtsummeAbrechnung(data.gesamtsummeAbrechnung);
        // Query-Parameter aus der URL entfernen, sonst würde ein Neuladen der
        // Seite denselben (evtl. längst weiterbearbeiteten) Entwurf erneut laden.
        window.history.replaceState({}, "", window.location.pathname);
      })
      .catch(err => setEntwurfLadeFehler(err.message));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [adressen, setAdressen] = useState({ email: "", mieterName: "", mieterStrasse: "", mieterPlz: "", mieterOrt: "", vermieterName: "", vermieterStrasse: "", vermieterPlz: "", vermieterOrt: "", datum: new Date().toLocaleDateString("de-DE") });
  // Opt-in für Rabatt-Mail 10 Monate nach Kauf (Art. 6 Abs. 1 lit. a DSGVO — siehe Datenschutz.jsx Abschnitt 3a).
  // Bewusst NICHT vorausgewählt (echtes Opt-in, keine Vorbelegung).
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  // Zustimmung zum vorzeitigen Erlöschen des Widerrufsrechts (§ 356 Abs. 5 BGB,
  // siehe Result.jsx-Checkbox). Bewusst hier oben statt lokal in Result.jsx,
  // damit der Wert bis zum Kauf-Request in Adressen.jsx erhalten bleibt und
  // dort mit an /api/save-report gesendet werden kann (Nachweispflicht liegt
  // im Streitfall bei uns als Anbieter, siehe CHANGELOG 13.08.2026).
  const [widerrufOk, setWiderrufOk] = useState(false);
  // Anzahl der per Foto/PDF erkannten Posten (09.09.2026, siehe CHANGELOG).
  // Wird in Wohnung.jsx nach erfolgreicher Erkennung gesetzt und in Posten.jsx
  // gelesen: Wer ein Foto hochgeladen hat, bekommt dort nur noch die erkannten
  // Positionen zur Bestätigung statt aller 19 sichtbaren Felder. Bewusst hier
  // oben statt lokal in Wohnung.jsx, weil beide Schritte den Wert brauchen.
  // 0 = kein Foto genutzt (rein manueller Weg, unveränderte Darstellung).
  const [fotoErkannt, setFotoErkannt] = useState(0);
  const [result, setResult] = useState(null);
  const [gekauft, setGekauft] = useState(() => window.location.pathname === "/danke" || window.location.pathname === "/pruefen/download");
  const [stufe, setStufe] = useState(null); // "auswertung" | "voll"

  // Automatisches Zwischenspeichern (siehe ladeEntwurf() weiter oben): bei
  // jeder Änderung an Wohnung/Posten/Gesamtsumme wird der aktuelle Stand lokal
  // gesichert. Bewusst NICHT gespeichert, sobald ein Kauf abgeschlossen ist
  // (gekauft === true) — nach der Zahlung ist der Entwurf nicht mehr relevant.
  useEffect(() => {
    if (gekauft) return;
    const hatInhalt = wohnung.flaeche || wohnung.vorauszahlung || Object.keys(werte).length > 0;
    if (!hatInhalt) return;
    try {
      localStorage.setItem(NKR_DRAFT_KEY, JSON.stringify({ wohnung, werte, gesamtsummeAbrechnung, savedAt: Date.now() }));
    } catch { /* z.B. Safari privater Modus ohne localStorage: kein Blocker, Entwurf bleibt dann nur im Speicher */ }
  }, [wohnung, werte, gesamtsummeAbrechnung, gekauft]);

  async function runAnalyse() {
    navigateTo("loading");
    const ergebnis = buildResult(werte, wohnung);
    // Kurze künstliche Verzögerung für den Prüf-Fortschritt (siehe Loading.jsx) —
    // die Analyse selbst ist regelbasiert und läuft sofort, ohne externen Aufruf.
    await new Promise(r => setTimeout(r, 6300));
    setResult(ergebnis);
    navigateTo("result");
  }

  function resetAll() {
    navigateTo("welcome");
    setResult(null); setWerte({}); setGekauft(false); setStufe(null); setGesamtsummeAbrechnung(""); setWiderrufOk(false);
    // Zwischengespeicherten Entwurf ebenfalls löschen (siehe Zwischenspeichern-
    // Kommentar weiter oben) — sonst würde eine neue Prüfung auf demselben Gerät
    // beim nächsten Laden versehentlich die alten Werte wieder vorschlagen.
    try { localStorage.removeItem(NKR_DRAFT_KEY); } catch { /* siehe Kommentar oben */ }
  }

  const pageProps = {
    navigateTo, navigateToArtikel,
    wohnung, setWohnung, werte, setWerte, adressen, setAdressen,
    gesamtsummeAbrechnung, setGesamtsummeAbrechnung,
    result, setResult, runAnalyse, resetAll,
    gekauft, setGekauft, stufe, setStufe,
    marketingOptIn, setMarketingOptIn,
    widerrufOk, setWiderrufOk,
    ratgeberArtikel, IS_DEMO,
    entwurfLadeFehler,
    fotoErkannt, setFotoErkannt,
  };

  function renderPage() {
    if (step === "welcome") return <Welcome {...pageProps} />;
    if (step === "wohnung") return <Wohnung {...pageProps} />;
    if (step === "posten") return <Posten {...pageProps} />;
    if (step === "loading") return <Loading {...pageProps} />;
    if (step === "result") return <Result {...pageProps} />;
    if (step === "adressen") return <Adressen {...pageProps} />;
    if (step === "download") return <Download {...pageProps} />;
    if (step === "login") return <Login {...pageProps} />;
    if (step === "konto") return <Konto {...pageProps} />;
    if (step === "danke") return <Danke {...pageProps} />;
    if (step === "impressum") return <Impressum {...pageProps} />;
    if (step === "agb") return <AGB {...pageProps} />;
    if (step === "datenschutz") return <Datenschutz {...pageProps} />;
    if (step === "faq") return <FAQ {...pageProps} />;
    if (step === "ratgeber") return <Ratgeber {...pageProps} />;
    if (step === "artikel") return <Artikel {...pageProps} />;
    if (step === "ueberuns") return <UeberUns {...pageProps} />;
    return null;
  }

  // CookieBanner bewusst hier auf oberster Ebene gerendert (nicht mehr nur in
  // Welcome.jsx) — sonst hätte ein Besucher, der über eine andere URL als "/"
  // einsteigt (z.B. ein Ratgeber-Artikel über Google, oder ein direkter Link
  // zu /pruefen/wohnung), nie die Einwilligungsabfrage gesehen und GA4 wäre
  // für diesen Besuch nie geladen worden — technisch nicht rechtswidrig (Opt-in
  // fehlt = keine Ladung, "fail-safe"), aber ein echtes Analytics-Loch gerade
  // beim SEO-Traffic auf die Ratgeber-Artikel, für den die Seite ausdrücklich
  // gebaut ist. Gefunden beim Vor-Upload-Check 08/2026.
  return (
    <>
      <CookieBanner />
      {/* Suspense wird nur für die nachgeladenen Seiten (Download, Konto)
          gebraucht. Alle anderen Seiten sind fest eingebunden und lösen es
          nie aus. Der Rückfalltext ist bewusst schlicht und kurz: Er ist
          höchstens einen Wimpernschlag zu sehen, während die PDF-Bibliothek
          nachgeladen wird. */}
      <NachladeFehler>
        <Suspense fallback={<div style={{ padding: 40, textAlign: "center", fontFamily: "system-ui, sans-serif", color: "#6B6152" }}>Wird geladen …</div>}>
          {renderPage()}
        </Suspense>
      </NachladeFehler>
    </>
  );
}
