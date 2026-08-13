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
import { useState, useCallback, useEffect } from "react";
import { ARTIKEL } from "./artikel.js";
import { IS_DEMO } from "./config/business.js";
import { buildResult, ALLE_POSTEN } from "./lib/analyse.js";
import { toNum } from "./lib/format.js";

import CookieBanner from "./components/layout/CookieBanner.jsx";
import Welcome from "./pages/Welcome.jsx";
import Wohnung from "./pages/Wohnung.jsx";
import Posten from "./pages/Posten.jsx";
import Loading from "./pages/Loading.jsx";
import Result from "./pages/Result.jsx";
import Adressen from "./pages/Adressen.jsx";
import Download from "./pages/Download.jsx";
import Login from "./pages/Login.jsx";
import Konto from "./pages/Konto.jsx";
import Danke from "./pages/Danke.jsx";
import Impressum from "./pages/Impressum.jsx";
import AGB from "./pages/AGB.jsx";
import Datenschutz from "./pages/Datenschutz.jsx";
import Ratgeber from "./pages/Ratgeber.jsx";
import Artikel from "./pages/Artikel.jsx";
import UeberUns from "./pages/UeberUns.jsx";

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
    window.history.replaceState({ step }, "", window.location.pathname);
    const onPop = (e) => {
      const p = window.location.pathname;
      if (p.startsWith("/ratgeber/")) { setRatgeberArtikel(p.replace("/ratgeber/", "")); setStep("artikel"); }
      else setStep(pfadZuStep(p));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // SEO: Titel/Meta pro Route aktualisieren (Vite baut nur eine index.html)
  useEffect(() => {
    const BASE = "https://nebenkostenradar.com";
    let title = "Nebenkostenabrechnung prüfen — kostenlos | NebenkostenRadar";
    let description = "Nebenkostenabrechnung kostenlos prüfen: NebenkostenRadar vergleicht jeden Posten mit dem DMB-Betriebskostenspiegel, erkennt Fehler und erstellt ein PDF mit Mustertext.";
    let pfad = STEP_ZU_PFAD[step] || "/";
    if (step === "artikel") {
      const a = ARTIKEL.find(a => a.id === ratgeberArtikel);
      if (a) { title = a.titel + " | NebenkostenRadar Ratgeber"; description = a.teaser; pfad = "/ratgeber/" + a.id; }
    }
    document.title = title;
    const setMeta = (sel, attr, value) => { const el = document.querySelector(sel); if (el) el.setAttribute(attr, value); };
    setMeta('meta[name="description"]', "content", description);
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:url"]', "content", BASE + pfad);
    setMeta('link[rel="canonical"]', "href", BASE + pfad);
  }, [step, ratgeberArtikel]);

  // Gemeinsamer Zustand
  const [wohnung, setWohnung] = useState({ flaeche: "", jahr: String(new Date().getFullYear() - 1), vorauszahlung: "" });
  const [werte, setWerte] = useState({});
  // Gesamtsumme laut Abrechnung (08/2026, siehe CHANGELOG.md): vorher reiner
  // lokaler State in Posten.jsx, nur manuell befüllbar. Jetzt hier oben, damit
  // die Foto-/PDF-Erkennung (Wohnung.jsx) sie ebenfalls setzen kann — macht den
  // ohnehin schon vorhandenen Plausibilitäts-Abgleich in Posten.jsx automatisch
  // wirksam, auch wenn die Werte per Foto vorausgefüllt wurden, nicht nur bei
  // manueller Eingabe.
  const [gesamtsummeAbrechnung, setGesamtsummeAbrechnung] = useState("");
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
  const [result, setResult] = useState(null);
  const [gekauft, setGekauft] = useState(() => window.location.pathname === "/danke" || window.location.pathname === "/pruefen/download");
  const [stufe, setStufe] = useState(null); // "auswertung" | "voll"

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
      {renderPage()}
    </>
  );
}
