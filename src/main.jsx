import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import Admin from "./Admin.jsx";

// /admin bekommt bewusst KEINE eigene Vite-Einstiegsdatei — vercel.json
// leitet /admin und /admin/* per Rewrite auf dieselbe index.html wie die
// Hauptseite. Die Weiche passiert deshalb hier, vor jedem Hook-basierten
// Code in App.jsx (Admin.jsx hat einen komplett eigenen Zustand/Login,
// nichts von App.jsx wird dafür gebraucht).
const istAdmin = window.location.pathname.startsWith("/admin");

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {istAdmin ? <Admin /> : <App />}
  </StrictMode>
);
