// ─────────────────────────────────────────────────────────────────────────
// FAQ.jsx — Häufige Fragen. URL: "/faq"
//
// WARUM EIGENE SEITE STATT BLOCK AUF DER STARTSEITE (Stefan, 10.09.2026):
// Die FAQ stand zunächst als Abschnitt unten auf der Startseite. Als eigene
// Seite hat sie drei Vorteile:
//   1. Sie ist über das Menü jederzeit erreichbar, auch mitten im Formular.
//   2. Sie bekommt eine eigene URL, einen eigenen <title> und eine eigene
//      Beschreibung — sie kann also selbst bei Google ranken, statt nur ein
//      Abschnitt einer Seite zu sein, die auf ein anderes Keyword optimiert
//      ist.
//   3. Die Startseite bleibt kurz. Je weniger zwischen Einstieg und
//      Startknopf steht, desto besser (siehe UX-Research-Nachtrag in
//      projektdokumentation-nkr.md, Abschnitt 9).
//
// Der Inhalt kommt aus src/config/faq.js — eine Datei, aus der sowohl diese
// Seite als auch das FAQPage-Markup für Google gespeist wird. Zum Ändern
// einer Frage also NICHT hier, sondern dort.
// ─────────────────────────────────────────────────────────────────────────
import { THEME } from "../config/theme.js";
import { FAQ_STARTSEITE } from "../config/faq.js";
import Nav from "../components/layout/Nav.jsx";
import LegalFooter from "../components/layout/LegalFooter.jsx";

export default function FAQ({ navigateTo }) {
  const C = THEME.color;
  const PAGE_MAX = THEME.layout.pageMax;

  return (
    <div style={{ fontFamily: THEME.font.body, background: C.bg, color: C.text, minHeight: "100vh" }}>
      <Nav activeStep="faq" navigateTo={navigateTo} />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "48px 24px 40px", boxSizing: "border-box" }}>
        <h1 style={{ fontFamily: THEME.font.heading, fontSize: 28, fontWeight: 600, color: C.text, margin: "0 0 12px", lineHeight: 1.3 }}>
          Häufige Fragen
        </h1>
        <p style={{ fontSize: 15, color: C.textMuted, lineHeight: 1.7, margin: "0 0 32px" }}>
          Hier stehen die Fragen, die wir uns selbst stellen würden — auch die unbequemen. Wenn deine Frage fehlt, schreib uns; wir nehmen sie auf.
        </p>

        {/* Bewusst natives <details>/<summary> statt React-State:
            funktioniert ohne JavaScript, ist von Haus aus tastaturbedienbar
            und screenreader-tauglich, und lässt sich ohne weitere Kenntnisse
            erweitern. */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {FAQ_STARTSEITE.map(({ frage, antwort }) => (
            <details key={frage} style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: THEME.radius.md, padding: "16px 18px" }}>
              <summary style={{ fontSize: 15, fontWeight: 600, color: C.text, fontFamily: THEME.font.heading, cursor: "pointer", lineHeight: 1.5 }}>
                {frage}
              </summary>
              <div style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.75, marginTop: 12 }}>{antwort}</div>
            </details>
          ))}
        </div>

        <div style={{ marginTop: 32, padding: "20px 20px", background: C.brandBg, border: "1px solid " + C.border, borderRadius: THEME.radius.lg, textAlign: "center" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: C.text, fontFamily: THEME.font.heading, marginBottom: 6 }}>
            Noch unsicher?
          </div>
          <p style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.65, margin: "0 0 16px" }}>
            Die Basisanalyse kostet nichts und verlangt kein Kundenkonto. Du kannst sie ausprobieren und danach immer noch entscheiden.
          </p>
          <button onClick={() => navigateTo("wohnung")}
            style={{ background: C.accent, border: "none", borderRadius: THEME.radius.md, padding: "14px 32px", fontSize: 14, fontFamily: THEME.font.heading, fontWeight: 600, color: C.accentText, cursor: "pointer" }}>
            Jetzt kostenlos prüfen
          </button>
        </div>
      </div>

      <LegalFooter navigateTo={navigateTo} />
    </div>
  );
}
