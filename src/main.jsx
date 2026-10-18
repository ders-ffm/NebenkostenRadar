// Schrift Inter (Redesign 18.10.2026), selbst gehostet: Vite übernimmt die
// woff2-Dateien aus dem npm-Paket in den Build, sie kommen von unserer
// eigenen Domain. Nur der Zeichensatz "latin" (enthält Umlaute, ß, €, §).
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import Admin from "./Admin.jsx";
import { partnerAusUrlLesen } from "./lib/messung.js";

// /admin bekommt bewusst KEINE eigene Vite-Einstiegsdatei — vercel.json
// leitet /admin und /admin/* per Rewrite auf dieselbe index.html wie die
// Hauptseite. Die Weiche passiert deshalb hier, vor jedem Hook-basierten
// Code in App.jsx (Admin.jsx hat einen komplett eigenen Zustand/Login,
// nichts von App.jsx wird dafür gebraucht).
const istAdmin = window.location.pathname.startsWith("/admin");

// Partnercode (?p=) lesen, BEVOR App.jsx startet (18.10.2026). App.jsx
// schreibt beim Start die aktuelle URL in die Browser-Historie; bis dahin
// muss der Parameter schon entfernt sein. Siehe src/lib/messung.js.
if (!istAdmin) partnerAusUrlLesen();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {istAdmin ? <Admin /> : <App />}
  </StrictMode>
);
