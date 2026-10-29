// ─────────────────────────────────────────────────────────────────────────
// vertrag.js — NEU 17.10.2026 (Compliance-Check, siehe CHANGELOG.md)
//
// EINZIGE QUELLE für den Vertragstext (AGB inkl. Widerrufsbelehrung und
// Muster-Widerrufsformular). Wird an zwei Stellen verwendet:
//   1. src/pages/AGB.jsx           → Anzeige auf nebenkostenradar.com/agb
//   2. api/webhook.js              → Vertragsbestätigung per E-Mail nach
//                                     jedem Kauf (§ 312f Abs. 2 und 3 BGB)
//
// WARUM ZWEI STELLEN, EINE QUELLE: Die Vertragsbestätigung muss den
// Vertragsinhalt einschließlich AGB auf einem dauerhaften Datenträger
// enthalten (§ 312f Abs. 2 BGB). Eine Webseite ist kein dauerhafter
// Datenträger, eine E-Mail schon. Stünden die AGB doppelt im Code, würden
// Webseite und Mail früher oder später auseinanderlaufen.
//
// BEI JEDER INHALTLICHEN ÄNDERUNG: AGB_STAND unten anpassen.
//
// Bewusst reines JavaScript ohne React-Abhängigkeit, damit auch die
// Serverless-Funktion in api/ diese Datei importieren kann (wie bereits
// api/analyse-foto.js mit src/lib/analyse.js).
// ─────────────────────────────────────────────────────────────────────────
import { BUSINESS } from "./business.js";
import { euro } from "../lib/format.js";

// 18.10.2026: Nur noch eine Ausführung (Auswertung + Brief, 12,99 €), die
// Variante "nur Auswertung" (9,99 €) wird nicht mehr verkauft (Stefans
// Entscheidung). Wer sie vorher gekauft hat, behält sie; deshalb bleibt
// leistungsbeschreibung("auswertung") für Bestandsbestellungen erhalten.
// 29.10.2026: § 2 nennt für die Belegeinsicht § 556 Abs. 4 BGB statt § 259 BGB
// (Rechtsgrundlage seit 01.01.2025), Freigabe Stefan 29.10.2026.
export const AGB_STAND = "29.10.2026";

export const ANBIETER = {
  name: "NebenkostenRadar",
  inhaber: "Stefan Hennig",
  strasse: "Ludwigstr. 33-37",
  ort: "60327 Frankfurt am Main",
  email: "support@nebenkostenradar.com",
  web: "nebenkostenradar.com",
};

const ANBIETER_ZEILE = `${ANBIETER.name}, ${ANBIETER.inhaber}, ${ANBIETER.strasse}, ${ANBIETER.ort}, ${ANBIETER.email}`;

// Kurzbeschreibung je Stufe. Wird auch in der Vertragsbestätigung verwendet,
// deshalb hier zentral. "auswertung" nur noch für Käufe vor dem 18.10.2026.
export function leistungsbeschreibung(stufe) {
  return stufe === "voll"
    ? "Auswertung + Brief: PDF-Prüfbericht mit vollständiger Positionsübersicht, Richtwerten und Begründungen, dazu ein versandfertiger Brief an den Vermieter (Inhalt je nach Prüfergebnis: Einwendungen, Rückfragen mit Bitte um Belegeinsicht oder Aufforderung zur Belegeinsicht nach § 556 Abs. 4 BGB) und ein unverbindlicher Hinweis zu möglicherweise steuerlich absetzbaren Positionen nach § 35a EStG."
    : "Auswertung: PDF-Prüfbericht mit vollständiger Positionsübersicht, Richtwerten und Begründungen.";
}

// Liefert die AGB als Liste von Abschnitten { t: Überschrift, lines: [Absätze] }.
export function agbAbschnitte() {
  return [
    { t: "§ 1 Geltungsbereich", lines: [
      "Diese AGB gelten für alle Käufe digitaler Inhalte über nebenkostenradar.com.",
      "Anbieter: " + ANBIETER_ZEILE,
    ]},
    { t: "§ 2 Vertragsgegenstand", lines: [
      "Gegenstand ist die einmalige Erstellung und Bereitstellung eines digitalen PDF-Prüfberichts zu einer Nebenkostenabrechnung, deren Angaben du selbst eingibst oder per Foto-/PDF-Erkennung vorausfüllen lässt.",
      "Auswertung + Brief (" + euro(BUSINESS.PREIS_VOLL) + "): PDF mit vollständiger Positionsübersicht, Richtwerten und Begründungen sowie ein versandfertiger Brief an den Vermieter. Sein Inhalt richtet sich nach dem Prüfergebnis: Einwendungen gegen auffällige Positionen, Rückfragen mit Bitte um Belegeinsicht oder, wenn nichts auffällt, eine Aufforderung zur Belegeinsicht nach § 556 Abs. 4 BGB. Dazu kommt ein unverbindlicher Hinweis zu möglicherweise steuerlich absetzbaren Positionen nach § 35a EStG mit einer Anfrage-Vorlage an den Vermieter (reine Rechenhilfe, keine Steuerberatung).",
      "Die Prüfung läuft automatisiert: Sie vergleicht deine Angaben mit gesetzlichen Vorgaben (u. a. Betriebskostenverordnung, Heizkostenverordnung) und mit Durchschnittswerten aus dem Betriebskostenspiegel des Deutschen Mieterbundes. Eine Abweichung vom Durchschnitt ist ein Anlass zur Nachfrage, kein Nachweis eines Fehlers. Der Bericht ist keine Rechtsberatung und keine individuelle Prüfung durch eine Juristin oder einen Juristen.",
      "Die optionale Foto-/PDF-Erkennung ist eine Ausfüllhilfe. Die vollständige manuelle Eingabe steht immer zur Verfügung und ist keine Voraussetzung für den Kauf.",
    ]},
    { t: "§ 3 Vertragsschluss, Korrektur von Eingaben, Vertragstext", lines: [
      "Die Darstellung der Leistungen auf der Website ist noch kein verbindliches Angebot. Mit Klick auf „Jetzt kaufen“ wirst du zur Zahlungsseite von Stripe weitergeleitet. Mit Abschluss der Zahlung dort gibst du ein verbindliches Angebot ab. Wir nehmen es an, indem wir das PDF bereitstellen oder dir die Vertragsbestätigung per E-Mail schicken, je nachdem, was zuerst geschieht.",
      "Eingabefehler kannst du vor dem Kauf jederzeit in den Formularfeldern korrigieren. Auf der Zahlungsseite von Stripe kommst du über „Zurück“ wieder zu deinen Eingaben.",
      "Den Vertragstext (diese AGB und deine Bestelldaten) schicken wir dir nach dem Kauf mit der Vertragsbestätigung per E-Mail. Die aktuelle Fassung der AGB ist jederzeit unter nebenkostenradar.com/agb abrufbar; frühere Fassungen halten wir nicht gesondert zum Abruf bereit.",
      "Vertragssprache: Deutsch.",
    ]},
    { t: "§ 4 Preise und Zahlung", lines: [
      "Der Preis beträgt " + euro(BUSINESS.PREIS_VOLL) + ". Stefan Hennig ist Kleinunternehmer gemäß § 19 UStG; es wird keine Umsatzsteuer ausgewiesen.",
      "Zahlung über Stripe Payments Europe, Ltd. Einmalzahlung: kein Abo, keine Folgekosten.",
      "Nach jeder Zahlung erhältst du automatisch einen Zahlungsbeleg per E-Mail. Auf Anfrage stellen wir gerne eine Rechnung aus: " + ANBIETER.email,
    ]},
    { t: "§ 5 Bereitstellung", lines: [
      "Das PDF wird nach erfolgreicher Zahlung sofort zum Download bereitgestellt und zusätzlich per E-Mail an die angegebene Adresse geschickt. Über das Kundenkonto (Anmeldung per E-Mail-Link) kannst du es 12 Monate lang erneut herunterladen.",
      "Es handelt sich um einen einmaligen Kauf: kein Abonnement, kein Dauerschuldverhältnis.",
    ]},
    { t: "§ 6 Widerrufsrecht", lines: [
      "Verbrauchern steht grundsätzlich ein gesetzliches Widerrufsrecht zu: Du hast das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsschlusses.",
      "Um dein Widerrufsrecht auszuüben, musst du uns (" + ANBIETER_ZEILE + ") mittels einer eindeutigen Erklärung (z. B. per E-Mail) über deinen Entschluss, diesen Vertrag zu widerrufen, informieren. Du kannst dafür auch die Schaltfläche „Vertrag widerrufen“ unten auf jeder Seite von nebenkostenradar.com nutzen. Eine bestimmte Form ist nicht vorgeschrieben. Zur Wahrung der Widerrufsfrist reicht es aus, dass du die Mitteilung über die Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absendest.",
      "Folgen des Widerrufs: Im Falle eines wirksamen Widerrufs erstatten wir dir alle bereits erhaltenen Zahlungen unverzüglich, spätestens binnen 14 Tagen ab dem Tag, an dem deine Widerrufserklärung bei uns eingegangen ist. Für die Rückzahlung verwenden wir dasselbe Zahlungsmittel, das du bei der ursprünglichen Zahlung genutzt hast, sofern nicht ausdrücklich etwas anderes vereinbart wurde; es werden dir dafür keine zusätzlichen Entgelte berechnet.",
      "Vorzeitiges Erlöschen (§ 356 Abs. 5 BGB): Der Prüfbericht ist ein digitaler Inhalt, der nicht auf einem körperlichen Datenträger geliefert wird. Dein Widerrufsrecht erlischt deshalb vorzeitig, sobald wir mit der Bereitstellung des PDFs begonnen haben, wenn du zuvor ausdrücklich zugestimmt hast, dass wir vor Ablauf der Widerrufsfrist mit der Ausführung beginnen, du deine Kenntnis davon bestätigt hast, dass du dadurch dein Widerrufsrecht verlierst, und wir dir eine Bestätigung des Vertrags mit diesen Angaben per E-Mail zur Verfügung gestellt haben.",
      "Die Zustimmung und Bestätigung erteilst du im Bestellprozess durch Aktivierung der entsprechenden Checkbox vor dem Kauf. Ohne Aktivierung ist ein Kauf nicht möglich.",
    ]},
    { t: "§ 6a Muster-Widerrufsformular", lines: [
      "Wenn du den Vertrag widerrufen willst, kannst du dieses Formular ausfüllen und zurücksenden. Du musst es nicht benutzen, eine formlose eindeutige Erklärung genügt ebenfalls.",
      "An: " + ANBIETER_ZEILE,
      "Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren (*) / die Erbringung der folgenden Dienstleistung (*)",
      "Bestellt am (*) / erhalten am (*)",
      "Name des/der Verbraucher(s)",
      "Anschrift des/der Verbraucher(s)",
      "Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier)",
      "Datum",
      "(*) Unzutreffendes streichen.",
    ]},
    { t: "§ 7 Gewährleistung und Haftung", lines: [
      "Es gelten die gesetzlichen Gewährleistungsrechte für digitale Produkte (§§ 327 ff. BGB).",
      "Wir haften unbeschränkt bei Vorsatz und grober Fahrlässigkeit, bei Verletzung von Leben, Körper oder Gesundheit sowie nach dem Produkthaftungsgesetz. Bei leicht fahrlässiger Verletzung einer wesentlichen Vertragspflicht (einer Pflicht, deren Erfüllung die ordnungsgemäße Durchführung des Vertrags überhaupt erst ermöglicht und auf deren Einhaltung du regelmäßig vertrauen darfst) ist die Haftung auf den vertragstypischen, vorhersehbaren Schaden begrenzt. Im Übrigen ist die Haftung für leichte Fahrlässigkeit ausgeschlossen.",
      "Der Prüfbericht beruht auf deinen Angaben. Werte aus der Foto-/PDF-Erkennung werden dir vor dem Kauf angezeigt; bitte prüfe und korrigiere sie bei Bedarf. Für Ergebnisse, die auf unrichtigen oder unvollständigen Angaben beruhen, sind wir nicht verantwortlich.",
      "Wenn du eine verbindliche rechtliche Prüfung brauchst, wende dich an einen Mieterverein oder an eine Rechtsanwältin bzw. einen Rechtsanwalt.",
    ]},
    { t: "§ 8 Streitbeilegung", lines: [
      "Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen (§ 36 VSBG).",
    ]},
    { t: "§ 9 Schlussbestimmungen", lines: [
      "Es gilt deutsches Recht. Bist du Verbraucher mit gewöhnlichem Aufenthalt in einem anderen Staat, bleibt der Schutz durch zwingende Bestimmungen des Rechts dieses Staates unberührt.",
      "Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen unberührt.",
    ]},
  ];
}
