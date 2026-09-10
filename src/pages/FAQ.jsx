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
import { BUSINESS } from "../config/business.js";
import { euro } from "../lib/format.js";
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

        {/* ─────────────────────────────────────────────────────────────
            Preiseinordnung. Stand bis zum 10.09.2026 auf der Startseite und
            wurde hierher verschoben, weil die Startseite zu voll war. Passt
            hier auch besser: Die Frage „warum zahlen, wenn ich auch selbst
            prüfen könnte" steht als FAQ-Eintrag direkt darüber.
            ALLE ZAHLEN SIND BELEGT, nichts geschätzt:
            - Mieterverein: Jahresbeiträge 2026 zwischen 60 € (Gelsenkirchen)
              und 132 € (Kiel), teils zzgl. einmaliger Aufnahmegebühr.
            - Anwalt: § 34 Abs. 1 S. 3 RVG deckelt die Erstberatung für
              Verbraucher auf 190 € netto (226,10 € brutto), sofern keine
              Vergütungsvereinbarung getroffen wurde.
            Bei Preisänderungen: Die NKR-Zeile zieht aus BUSINESS, die
            anderen drei müssen von Hand geprüft werden.
            ───────────────────────────────────────────────────────────── */}
        <div style={{ marginTop: 40 }}>
          <h2 style={{ fontFamily: THEME.font.heading, fontSize: 20, fontWeight: 600, color: C.text, margin: "0 0 8px" }}>Was die Alternativen kosten</h2>
          <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.7, margin: "0 0 18px" }}>
            Damit du den Preis einordnen kannst — einschließlich der kostenlosen Alternative.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              {
                titel: "Selbst prüfen", preis: "0 €", hervor: false,
                punkte: [
                  "Betriebskostenspiegel und BetrKV sind öffentlich zugänglich",
                  "Richtwert je Position selbst heraussuchen und umrechnen",
                  "Umlageschlüssel, 50/70-Regel und CO₂-Aufteilung selbst nachrechnen",
                  "Widerspruchsschreiben selbst formulieren, mit den richtigen Vorschriften",
                ],
              },
              {
                titel: "NebenkostenRadar", hervor: true,
                preis: euro(BUSINESS.PREIS_AUSWERTUNG) + " – " + euro(BUSINESS.PREIS_VOLL),
                punkte: [
                  "Einmalig, kein Abo, kein Kundenkonto nötig",
                  "Jede Position gegen Richtwert und Rechtsgrundlage geprüft",
                  "Versandfertiger Brief an den Vermieter (im größeren Paket)",
                  "Ergebnis in wenigen Minuten, keine Terminvereinbarung",
                ],
              },
              {
                titel: "Mieterverein", preis: "ca. 60 – 132 € / Jahr", hervor: false,
                punkte: [
                  "Beitrag je nach Ortsverein, teils zzgl. einmaliger Aufnahmegebühr",
                  "Persönliche Beratung durch Menschen — inhaltlich das Gründlichste",
                  "Deckt weit mehr ab als die Nebenkostenabrechnung",
                  "Meist Terminvereinbarung nötig, teils Wartezeit für Neumitglieder",
                ],
              },
              {
                titel: "Anwalt", preis: "bis 226,10 € nur für die Erstberatung", hervor: false,
                punkte: [
                  "Höchstbetrag nach § 34 Abs. 1 S. 3 RVG, wenn keine Vergütungsvereinbarung getroffen wurde",
                  "Ein Widerspruchsschreiben wird darüber hinaus nach Streitwert abgerechnet",
                  "Verbindliche Einschätzung des Einzelfalls — das kann keine Software",
                  "Bei kleineren Beträgen übersteigen die Kosten oft die Ersparnis",
                ],
              },
            ].map(({ titel, preis, hervor, punkte }) => (
              <div key={titel} style={{ padding: "16px 18px", background: hervor ? C.brandBg : C.surface, border: "1px solid " + (hervor ? C.brand : C.border), borderRadius: THEME.radius.md }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: C.text, fontFamily: THEME.font.heading }}>{titel}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: hervor ? C.brand : C.textMuted, textAlign: "right" }}>{preis}</div>
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: C.textMuted, lineHeight: 1.7 }}>
                  {punkte.map(punkt => <li key={punkt}>{punkt}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: C.textDim, lineHeight: 1.6, marginTop: 12 }}>
            Beiträge der Mietervereine nach den Beitragsordnungen 2026 einzelner Ortsvereine (Spanne von Gelsenkirchen bis Kiel); die Höhe unterscheidet sich je nach Verein. Anwaltsgebühr nach § 34 Abs. 1 S. 3 RVG, brutto inkl. 19 % Umsatzsteuer. Stand 09/2026.
          </p>
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
