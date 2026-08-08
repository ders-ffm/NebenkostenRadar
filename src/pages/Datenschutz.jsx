// ─────────────────────────────────────────────────────────────────────────
// Datenschutz.jsx — URL: "/datenschutz"
//
// WICHTIG, gegenüber der Vorversion inhaltlich korrigiert:
// - Abschnitt "Keine Datenspeicherung" ist NICHT MEHR ZUTREFFEND und wurde
//   entfernt. Seit der Kundenkonto-/PDF-Funktion werden Eingabedaten für
//   bis zu 1 Jahr in Supabase gespeichert (siehe Abschnitt 2 unten).
// - Abschnitt "Analyse-Service (Anthropic)" wurde ENTFERNT: Die Analyse
//   läuft seit dem Redesign 08/2026 vollständig regelbasiert im Browser,
//   es werden keine Nebenkosten-Daten mehr an Anthropic übermittelt.
// Diese Datei MUSS aktuell gehalten werden, wenn sich an der Datenverarbeitung
// etwas ändert — siehe CHANGELOG.md für die Historie.
// ─────────────────────────────────────────────────────────────────────────
import { THEME } from "../config/theme.js";
import BrandAnschrift from "../components/layout/BrandAnschrift.jsx";

const ABSCHNITTE = [
  { t: "1. Verantwortlicher", brand: true, lines: [
    "NebenkostenRadar — nebenkostenradar.com",
    "Inhaber: Stefan Hennig",
    "Ludwigstr. 33-37, 60327 Frankfurt am Main",
    "support@nebenkostenradar.com",
  ]},
  { t: "2. Speicherung deiner Eingabedaten", lines: [
    "Wenn du eine kostenpflichtige Auswertung erwirbst, speichern wir deine Angaben (E-Mail-Adresse, Wohnungsdaten, Kostenpositionen, Absender-/Vermieteradresse für das PDF) bei unserem Datenbank-Dienstleister Supabase (Supabase Inc., USA/EU-Region), um dir das PDF nach der Zahlung per E-Mail zustellen und bei Bedarf über dein Kundenkonto erneut zugänglich machen zu können.",
    "Mit Supabase besteht ein Auftragsverarbeitungsvertrag (Art. 28 DSGVO). Da Supabase Inc. in den USA ansässig ist, kann eine Datenübermittlung in Drittländer stattfinden — abgesichert über Standardvertragsklauseln der EU-Kommission (Art. 46 Abs. 2 lit. c DSGVO).",
    "Deine E-Mail-Adresse fragen wir bewusst zweimal ab (ohne Einfüge-Funktion), um Tippfehler zu vermeiden — sonst könnte dein Bericht an eine falsche Adresse gehen.",
    "Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).",
    "Speicherdauer: maximal 12 Monate ab Kaufdatum, danach automatisierte Löschung (Grundsatz der Speicherbegrenzung, Art. 5 Abs. 1 lit. e DSGVO).",
    "Nutzt du nur die kostenlose Basis-Analyse ohne Kauf, werden deine Eingaben ausschließlich lokal in deinem Browser verarbeitet und nicht an uns übermittelt.",
  ]},
  { t: "3. Kundenkonto (Magic-Link)", lines: [
    "Über \"Anmelden\" kannst du dich jederzeit mit deiner E-Mail-Adresse einloggen — per Bestätigungslink (Magic-Link), ohne Passwort. Dort siehst du alle Berichte, die mit dieser E-Mail-Adresse gekauft wurden, und kannst sie erneut als PDF herunterladen, z. B. falls die Bestell-E-Mail im Spam-Ordner gelandet ist.",
    "Für den Login-Vorgang selbst nutzen wir Supabase Auth (gleicher Anbieter wie unsere Datenbank, siehe Abschnitt 2). Es findet keine separate Registrierung mit Passwort statt. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.",
  ]},
  { t: "3a. Rabatt-Mail für die nächste Prüfung (optional)", lines: [
    "Beim Kauf kannst du freiwillig zustimmen, ca. 10 Monate später eine E-Mail mit einem Rabattcode für deine nächste Prüfung zu erhalten. Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).",
    "Ohne diese Zustimmung erhältst du keine solche E-Mail. Deine Einwilligung kannst du jederzeit mit einem Klick auf den Abmeldelink in der jeweiligen E-Mail widerrufen — die Verarbeitung bis zum Widerruf bleibt davon unberührt (Art. 7 Abs. 3 DSGVO).",
    "Deine E-Mail-Adresse und dein Vorname werden dafür separat in unserer Kaufhistorie hinterlegt, bis die Mail verschickt wurde oder du widerrufst.",
  ]},
  { t: "4. Cookies und Webanalyse", lines: [
    "Diese Website verwendet Google Analytics (Google Ireland Ltd., Gordon House, Barrow Street, Dublin 4, Irland) ausschließlich nach deiner ausdrücklichen Einwilligung (§ 25 Abs. 1 TDDDG, Art. 6 Abs. 1 lit. a DSGVO) — das Skript wird technisch erst nach deiner Zustimmung geladen. Du kannst die Einwilligung im Cookie-Banner ablehnen. Technisch notwendige Cookies sind gemäß § 25 Abs. 2 TDDDG ohne Einwilligung zulässig.",
    "Google Analytics Datenschutzerklärung: policies.google.com/privacy",
  ]},
  { t: "5. Hosting (Vercel)", lines: [
    "Unser Hosting-Anbieter Vercel (Vercel Inc., USA) erhebt automatisch Server-Log-Dateien (IP-Adresse, Browser, Zeitstempel). Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO. Datenschutzerklärung: vercel.com/legal/privacy-policy",
  ]},
  { t: "6. Zahlungsabwicklung (Stripe)", lines: [
    "Beim Kauf einer Auswertung (7,99 €) oder Auswertung mit Brief (9,99 €) leiten wir dich zur Zahlungsseite von Stripe Payments Europe, Ltd. (Dublin, Irland) weiter. Dabei werden Name, E-Mail-Adresse und Zahlungsdaten an Stripe übermittelt.",
    "Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO. Datenübermittlung in die USA auf Basis von Standardvertragsklauseln (Art. 46 Abs. 2 lit. c DSGVO). Datenschutzerklärung: stripe.com/de/privacy",
  ]},
  { t: "7. Bildmaterial (Unsplash)", lines: [
    "Einige Bilder in den Ratgeber-Artikeln werden direkt von Unsplash geladen, wobei deine IP-Adresse übermittelt wird. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO. Datenschutzerklärung: unsplash.com/privacy",
  ]},
  { t: "8. E-Mail-Versand (Resend)", lines: [
    "Nach einem Kauf verschicken wir deinen Prüfbericht als PDF-Anhang automatisch an deine E-Mail-Adresse — über den Dienstleister Resend (Resend, Inc., USA). Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).",
    "Bei Zustimmung (siehe Abschnitt 3a) verschicken wir darüber hinaus ca. 10 Monate nach Kauf eine Rabatt-Mail, ebenfalls über Resend. Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).",
    "Bei Nutzung des Kontaktformulars im Impressum übermitteln wir deine Angaben ebenfalls über Resend an support@nebenkostenradar.com. Rechtsgrundlage: Art. 6 Abs. 1 lit. f bzw. lit. b DSGVO.",
  ]},
  { t: "9. Deine Rechte (Art. 15–22 DSGVO)", lines: [
    "Auskunft (Art. 15) · Berichtigung (Art. 16) · Löschung (Art. 17) · Einschränkung (Art. 18) · Datenübertragbarkeit (Art. 20) · Widerspruch (Art. 21)",
    "Kontakt für Datenschutzanfragen: support@nebenkostenradar.com (Antwort innerhalb von 30 Tagen gemäß Art. 12 Abs. 3 DSGVO)",
  ]},
  { t: "10. Beschwerderecht", lines: [
    "Du hast das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren. Zuständig für Hessen: Der Hessische Beauftragte für Datenschutz und Informationsfreiheit, Postfach 3163, 65021 Wiesbaden.",
  ]},
  { t: "11. Aktualität", lines: [
    "Diese Datenschutzerklärung gilt ab " + new Date().toLocaleDateString("de-DE") + ".",
  ]},
];

export default function Datenschutz({ navigateTo }) {
  const C = THEME.color;
  return (
    <div style={{ fontFamily: THEME.font.body, background: C.bg, color: C.text, minHeight: "100vh" }}>
      <div style={{ background: C.surface, padding: "20px 20px 16px", borderBottom: "1px solid " + C.border }}>
        <button onClick={() => navigateTo("welcome")} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 13, padding: "0 0 10px", fontFamily: THEME.font.body }}>← Zurück</button>
        <h2 style={{ margin: 0, fontSize: 19, fontWeight: 600, fontFamily: THEME.font.heading }}>Datenschutzerklärung</h2>
      </div>
      <div style={{ padding: "24px 20px 60px", maxWidth: 720, margin: "0 auto" }}>
        {ABSCHNITTE.map((s, i) => (
          <div key={i} style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.accent, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.t}</div>
            {s.brand && <BrandAnschrift />}
            {s.lines.map((line, j) => (
              <div key={j} style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.8, marginBottom: 6 }}>{line}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
