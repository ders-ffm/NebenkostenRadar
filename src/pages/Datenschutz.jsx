// ─────────────────────────────────────────────────────────────────────────
// Datenschutz.jsx — URL: "/datenschutz"
//
// WICHTIG, gegenüber der Vorversion inhaltlich korrigiert:
// - Abschnitt "Keine Datenspeicherung" ist NICHT MEHR ZUTREFFEND und wurde
//   entfernt. Seit der Kundenkonto-/PDF-Funktion werden Eingabedaten für
//   bis zu 1 Jahr in Supabase gespeichert (siehe Abschnitt 2 unten).
// - KORREKTUR 08/2026 (vorheriger Kommentar hier war veraltet/falsch, siehe
//   CHANGELOG.md): Die Foto-/PDF-Erkennung wurde im selben Monat neu gebaut
//   und sendet Abrechnungsfotos SEHR WOHL an Anthropic (siehe Abschnitt 2a
//   unten) — die frühere Aussage "keine Daten mehr an Anthropic übermittelt"
//   bezog sich auf die REGELBASIERTE Analyse (buildResult() in lib/analyse.js,
//   läuft weiterhin komplett lokal im Browser), nicht auf die optionale
//   Foto-Erkennung, die als separates, neueres Feature hinzukam. Beide
//   Aussagen unabhängig voneinander korrekt, der alte Kommentar hier hat das
//   nur missverständlich vermischt.
// Diese Datei MUSS aktuell gehalten werden, wenn sich an der Datenverarbeitung
// etwas ändert — siehe CHANGELOG.md für die Historie.
// ─────────────────────────────────────────────────────────────────────────
import { THEME } from "../config/theme.js";
// Fußzeile auch auf den Rechtsseiten (17.10.2026): Dort steht der Link
// "Cookie-Einstellungen" zum Widerruf der Einwilligung (Art. 7 Abs. 3 DSGVO).
import LegalFooter from "../components/layout/LegalFooter.jsx";
import { euro } from "../lib/format.js";
import { BUSINESS } from "../config/business.js";
import BrandAnschrift from "../components/layout/BrandAnschrift.jsx";

const ABSCHNITTE = [
  { t: "1. Verantwortlicher", brand: true, lines: [
    "NebenkostenRadar, nebenkostenradar.com",
    "Inhaber: Stefan Hennig",
    "Ludwigstr. 33-37, 60327 Frankfurt am Main",
    "support@nebenkostenradar.com",
  ]},
  { t: "2. Speicherung deiner Eingabedaten", lines: [
    "Wenn du auf „Jetzt kaufen“ klickst, speichern wir deine Angaben (E-Mail-Adresse, Wohnungsdaten, Kostenpositionen, Absender-/Vermieteradresse für das PDF) bei unserem Datenbank-Dienstleister Supabase (Supabase Inc., Serverstandort Frankfurt am Main), um dir das PDF nach der Zahlung erstellen, per E-Mail zustellen und bei Bedarf über dein Kundenkonto erneut zugänglich machen zu können. Die Speicherung erfolgt schon vor der Weiterleitung zur Zahlung, weil das PDF direkt danach aus diesen Angaben erstellt wird.",
    "Mit Supabase besteht ein Auftragsverarbeitungsvertrag (Art. 28 DSGVO). Da Supabase Inc. in den USA ansässig ist, kann eine Datenübermittlung in Drittländer stattfinden, abgesichert über Standardvertragsklauseln der EU-Kommission (Art. 46 Abs. 2 lit. c DSGVO).",
    "Deine E-Mail-Adresse fragen wir bewusst zweimal ab (ohne Einfüge-Funktion), um Tippfehler zu vermeiden, sonst könnte dein Bericht an eine falsche Adresse gehen.",
    "Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).",
    "Speicherdauer: Nach einem Kauf maximal 12 Monate ab Kaufdatum. Kommt keine Zahlung zustande (z. B. weil du den Kauf abbrichst), löschen wir die Angaben nach 30 Tagen. Beides geschieht automatisiert (Grundsatz der Speicherbegrenzung, Art. 5 Abs. 1 lit. e DSGVO).",
    "Nutzt du nur die kostenlose Basis-Analyse ohne Kauf, werden deine Eingaben ausschließlich lokal in deinem Browser verarbeitet und nicht an uns übermittelt. Ausnahmen sind nur die Funktionen, die du selbst auslöst: die Foto-/PDF-Erkennung (Abschnitt 2a) und „Später fortsetzen“ (Abschnitt 2b).",
  ]},
  { t: "2a. Foto-/PDF-Erkennung deiner Abrechnung (optional)", lines: [
    "Auf der ersten Seite des Prüfformulars kannst du freiwillig ein oder mehrere Fotos oder eine PDF-Datei deiner Abrechnung hochladen, damit die Wohnungsdaten und Kostenpositionen automatisch vorausgefüllt werden. Diese Funktion ist eine reine Erleichterung, du musst sie nicht nutzen, alle Felder lassen sich auch komplett manuell ausfüllen.",
    "Nutzt du diese Funktion, werden die Fotos bzw. die PDF-Datei zur Texterkennung an Anthropic PBC (USA) übermittelt. Anthropic verarbeitet die Daten ausschließlich zur Erkennung der Beträge für diese eine Anfrage, nicht zum Training eigener KI-Modelle (gemäß Anthropics Nutzungsbedingungen für die API). Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (auf deinen Wunsch hin ausgeführte, vorvertragliche Maßnahme). Datenübermittlung in die USA auf Basis von Standardvertragsklauseln der EU-Kommission (Art. 46 Abs. 2 lit. c DSGVO).",
    "Die hochgeladenen Fotos bzw. die PDF-Datei selbst speichern wir nicht. Nach der Erkennung werden nur die daraus abgeleiteten Zahlenwerte in deinem Browser in die Formularfelder übernommen, die du wie jede andere Eingabe prüfen und korrigieren kannst. Anthropic löscht Eingaben und Ausgaben der Schnittstelle nach eigenen Angaben automatisch innerhalb von 30 Tagen; länger nur, soweit es zur Durchsetzung der eigenen Nutzungsrichtlinien oder gesetzlich erforderlich ist (privacy.claude.com, abgerufen am 17.10.2026).",
    "Um Kosten-Missbrauch dieser Funktion zu verhindern (z. B. automatisierte Massenabfragen), speichern wir zusätzlich einen Einweg-Hash deiner IP-Adresse (kein Klartext) für maximal 24 Stunden in unserer Datenbank, um die Anzahl deiner Anfragen pro Stunde zu begrenzen. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an Kosten-/Missbrauchsschutz). Diese Prüfung ist bewusst fehlertolerant: Funktioniert sie technisch nicht, wird die Foto-Erkennung trotzdem ausgeführt, sie ist eine Kosten-Bremse, keine Zugangskontrolle.",
  ]},
  { t: "2b. Später fortsetzen (optional)", lines: [
    "Auf der Ergebnisseite kannst du deinen Zwischenstand speichern, um die Prüfung später oder auf einem anderen Gerät fortzusetzen. Dafür speichern wir die Wohnungsangaben (z. B. Wohnfläche, Abrechnungsjahr, Vorauszahlung) und die eingegebenen Kostenpositionen bei Supabase (siehe Abschnitt 2), ohne Namen, Anschriften oder E-Mail-Adresse. Abrufbar ist der Stand nur über den Link mit einer zufälligen, nicht erratbaren Kennung, den du dabei erhältst.",
    "Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (auf deinen Wunsch hin ausgeführte, vorvertragliche Maßnahme). Speicherdauer: 30 Tage, danach automatisierte Löschung.",
  ]},
  { t: "3. Kundenkonto (Magic-Link)", lines: [
    "Über \"Anmelden\" kannst du dich jederzeit mit deiner E-Mail-Adresse einloggen, per Bestätigungslink (Magic-Link), ohne Passwort. Dort siehst du alle Berichte, die mit dieser E-Mail-Adresse gekauft wurden, und kannst sie erneut als PDF herunterladen, z. B. falls die Bestell-E-Mail im Spam-Ordner gelandet ist.",
    "Für den Login-Vorgang selbst nutzen wir Supabase Auth (gleicher Anbieter wie unsere Datenbank, siehe Abschnitt 2). Es findet keine separate Registrierung mit Passwort statt. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO.",
  ]},
  { t: "3a. Rabatt-Mail für die nächste Prüfung (optional)", lines: [
    "Beim Kauf kannst du freiwillig zustimmen, ca. 10 Monate später eine E-Mail mit einem Rabattcode für deine nächste Prüfung zu erhalten. Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).",
    "Ohne diese Zustimmung erhältst du keine solche E-Mail. Deine Einwilligung kannst du jederzeit mit einem Klick auf den Abmeldelink in der jeweiligen E-Mail widerrufen: die Verarbeitung bis zum Widerruf bleibt davon unberührt (Art. 7 Abs. 3 DSGVO).",
    "Deine E-Mail-Adresse und dein Vorname werden dafür separat in unserer Kaufhistorie hinterlegt, bis die Mail verschickt wurde oder du widerrufst.",
  ]},
  { t: "4. Cookies und Webanalyse", lines: [
    "Diese Website verwendet Google Analytics (Google Ireland Ltd., Gordon House, Barrow Street, Dublin 4, Irland) ausschließlich nach deiner ausdrücklichen Einwilligung (§ 25 Abs. 1 TDDDG, Art. 6 Abs. 1 lit. a DSGVO): das Skript wird technisch erst nach deiner Zustimmung geladen. Du kannst die Einwilligung im Cookie-Banner ablehnen und eine erteilte Einwilligung jederzeit über den Link „Cookie-Einstellungen“ unten auf jeder Seite widerrufen; dabei werden die Analytics-Cookies gelöscht (Art. 7 Abs. 3 DSGVO). Technisch notwendige Cookies sind gemäß § 25 Abs. 2 TDDDG ohne Einwilligung zulässig.",
    "Google Analytics Datenschutzerklärung: policies.google.com/privacy",
  ]},
  { t: "5. Hosting (Vercel)", lines: [
    "Unser Hosting-Anbieter Vercel (Vercel Inc., USA) erhebt automatisch Server-Log-Dateien (IP-Adresse, Browser, Zeitstempel). Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO. Datenübermittlung in die USA auf Basis von Standardvertragsklauseln der EU-Kommission (Art. 46 Abs. 2 lit. c DSGVO). Datenschutzerklärung: vercel.com/legal/privacy-policy",
  ]},
  { t: "6. Zahlungsabwicklung (Stripe)", lines: [
    "Beim Kauf einer Auswertung (" + euro(BUSINESS.PREIS_AUSWERTUNG) + ") oder Auswertung mit Brief (" + euro(BUSINESS.PREIS_VOLL) + ") leiten wir dich zur Zahlungsseite von Stripe Payments Europe, Ltd. (Dublin, Irland) weiter. Dabei werden Name, E-Mail-Adresse und Zahlungsdaten an Stripe übermittelt.",
    "Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO. Datenübermittlung in die USA auf Basis von Standardvertragsklauseln (Art. 46 Abs. 2 lit. c DSGVO). Datenschutzerklärung: stripe.com/de/privacy",
  ]},
  { t: "7. Bildmaterial (Unsplash)", lines: [
    "Die Bilder in den Ratgeber-Artikeln liegen auf unserem eigenen Server und werden von dort ausgeliefert. Es wird dabei keine Verbindung zu einem fremden Anbieter aufgebaut und keine Daten an Dritte übermittelt. Die Bilder stammen ursprünglich von Unsplash und werden unter der Unsplash-Lizenz verwendet.",
  ]},
  { t: "8. E-Mail-Versand (Resend)", lines: [
    "Nach einem Kauf verschicken wir deinen Prüfbericht als PDF-Anhang automatisch an deine E-Mail-Adresse, über den Dienstleister Resend (Resend, Inc., USA). Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung). Datenübermittlung in die USA auf Basis von Standardvertragsklauseln der EU-Kommission (Art. 46 Abs. 2 lit. c DSGVO).",
    "Bei Zustimmung (siehe Abschnitt 3a) verschicken wir darüber hinaus ca. 10 Monate nach Kauf eine Rabatt-Mail, ebenfalls über Resend. Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung).",
    "Nach jedem Kauf schicken wir dir außerdem eine Vertragsbestätigung mit deinen Bestelldaten und unseren AGB, ebenfalls über Resend. Dazu sind wir gesetzlich verpflichtet (§ 312f BGB). Rechtsgrundlage: Art. 6 Abs. 1 lit. c DSGVO.",
    "Bei Nutzung des Kontaktformulars im Impressum übermitteln wir deine Angaben ebenfalls über Resend an support@nebenkostenradar.com. Rechtsgrundlage: Art. 6 Abs. 1 lit. f bzw. lit. b DSGVO.",
    "Nutzt du die Schaltfläche „Vertrag widerrufen“, übermitteln wir deine Angaben (Name, E-Mail-Adresse, Angaben zur Bestellung) über Resend an support@nebenkostenradar.com und schicken dir eine Eingangsbestätigung an die angegebene E-Mail-Adresse. Rechtsgrundlage: Art. 6 Abs. 1 lit. c DSGVO (gesetzliche Pflicht, § 356a BGB). Wir bewahren die Widerrufserklärung auf, solange Ansprüche aus dem Vertrag geltend gemacht werden können (in der Regel 3 Jahre, § 195 BGB).",
  ]},
  { t: "9. Deine Rechte (Art. 15 bis 22 DSGVO)", lines: [
    "Auskunft (Art. 15) · Berichtigung (Art. 16) · Löschung (Art. 17) · Einschränkung (Art. 18) · Datenübertragbarkeit (Art. 20) · Widerspruch (Art. 21)",
    "Widerspruchsrecht (Art. 21 DSGVO): Soweit wir Daten auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO verarbeiten (Server-Logdateien, Missbrauchsschutz bei der Foto-Erkennung, Kontaktformular), kannst du dieser Verarbeitung aus Gründen, die sich aus deiner besonderen Situation ergeben, jederzeit widersprechen. Eine erteilte Einwilligung kannst du jederzeit mit Wirkung für die Zukunft widerrufen.",
    "Kontakt für Datenschutzanfragen: support@nebenkostenradar.com (Antwort innerhalb von 30 Tagen gemäß Art. 12 Abs. 3 DSGVO)",
  ]},
  { t: "10. Beschwerderecht", lines: [
    "Du hast das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren. Zuständig für Hessen: Der Hessische Beauftragte für Datenschutz und Informationsfreiheit, Postfach 3163, 65021 Wiesbaden.",
  ]},
  { t: "11. Aktualität", lines: [
    // Festes Datum (17.10.2026) statt "heute": siehe AGB.jsx. Bei inhaltlicher
    // Änderung anpassen. 17.10.2026: Abschnitt Cookie-Widerruf ergänzt.
    // 17.10.2026 (Compliance-Check, abends): Speicherbeginn vor Zahlung und
    // 30-Tage-Löschung unbezahlter Daten, Abschnitt 2b "Später fortsetzen"
    // (Funktion gab es seit 30.08.2026, war hier nicht beschrieben),
    // Vertragsbestätigung, Widerrufsbutton, Hinweis auf Art. 21 DSGVO.
    // Abschnitt 2a korrigiert: Bisher hieß es, auch Anthropic speichere die
    // Fotos nicht über die Anfrage hinaus. Laut Anthropic werden API-Daten
    // standardmäßig bis zu 30 Tage aufbewahrt (privacy.claude.com, geprüft
    // am 17.10.2026).
    "Diese Datenschutzerklärung gilt ab 17.10.2026.",
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
      <LegalFooter navigateTo={navigateTo} />
    </div>
  );
}
