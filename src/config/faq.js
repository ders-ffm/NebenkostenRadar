// ─────────────────────────────────────────────────────────────────────────
// faq.js — Die Fragen-und-Antworten-Liste der Startseite.
//
// WARUM EINE EIGENE DATEI?
// Diese Liste wird an ZWEI Stellen gebraucht:
//   1. src/pages/Welcome.jsx  → sichtbarer FAQ-Block für den Nutzer
//   2. scripts/prerender.mjs  → FAQPage-JSON-LD in dist/index.html für Google
// Stünde sie in Welcome.jsx, müsste man sie doppelt pflegen — und Google
// wertet es ab, wenn das strukturierte Markup vom sichtbaren Seiteninhalt
// abweicht. Mit dieser Datei gibt es genau eine Stelle zum Ändern.
//
// EINE FRAGE ÄNDERN ODER ERGÄNZEN:
// Einfach unten einen Eintrag { frage, antwort } hinzufügen oder anpassen und
// neu bauen (npm run build). Beides — sichtbarer Block und JSON-LD — wandert
// automatisch mit. Kein weiterer Handgriff nötig.
//
// INHALTLICHE REGEL:
// Hier stehen bewusst die UNBEQUEMEN Fragen (Unabhängigkeit, Genauigkeit,
// Geld zurück, Datenschutz, Grenzen des Produkts). Befund aus der
// internationalen Wettbewerbsrecherche vom 09./10.09.2026: sowohl
// servicechargeaudit.uk als auch pruefenlassen.ch stellen die skeptischen
// Fragen selbst — das wirkt glaubwürdiger, als sie zu vermeiden.
// Antworten müssen zu den Rechtstexten (AGB.jsx, Datenschutz.jsx) passen.
// Nichts versprechen, was dort nicht steht.
// ─────────────────────────────────────────────────────────────────────────
import { BUSINESS } from "./business.js";

export const FAQ_STARTSEITE = [
  {
    frage: "Seid ihr unabhängig von Vermietern, Verwaltungen oder Abrechnungsdienstleistern?",
    antwort:
      "Ja. NebenkostenRadar gehört keinem Vermieterverband, keiner Hausverwaltung, keinem Messdienstleister und keinem Abrechnungsunternehmen an und erhält von keiner dieser Seiten Geld. Es gibt keine Provisionen und keine Vermittlungsvereinbarungen. Die einzige Einnahmequelle ist der Preis, den du für die Auswertung zahlst.",
  },
  {
    frage: "Wie genau sind die Vergleichswerte für meine konkrete Wohnung?",
    antwort:
      "Der Betriebskostenspiegel des Deutschen Mieterbundes ist ein bundesweiter Durchschnitt ohne regionale Aufschlüsselung. In teuren Großstädten liegen einzelne Positionen — vor allem die Grundsteuer — regelmäßig deutlich darüber, ohne dass etwas falsch ist. Eine Abweichung nach oben ist deshalb ein Anlass zur Nachfrage, kein Nachweis eines Fehlers. Genau so weisen wir es in der Auswertung auch aus: Wir trennen ausdrücklich zwischen rechtlich unzulässigen Positionen (harte Beanstandung) und statistischen Auffälligkeiten (Nachfrage).",
  },
  {
    frage: "Ist das eine Rechtsberatung?",
    antwort:
      "Nein. NebenkostenRadar ist ein automatisiertes Prüfwerkzeug. Es gleicht deine Angaben mit veröffentlichten Richtwerten und den einschlägigen Vorschriften ab (§ 2 BetrKV, HeizkostenV, CO₂KostAufG) und erstellt daraus einen Bericht sowie einen Musterbrief. Eine Bewertung deines Einzelfalls, wie sie ein Anwalt oder ein Mieterverein vornimmt, ersetzt das nicht. Bei hohen Streitwerten oder einer Auseinandersetzung vor Gericht solltest du anwaltlichen Rat einholen.",
  },
  {
    frage: "Was passiert, wenn die Prüfung nichts findet?",
    antwort:
      "Dann bekommst du das ausdrücklich bestätigt — mit allen geprüften Positionen und ihren Richtwerten. Das ist kein Fehlkauf: Du weißt danach belegbar, dass deine Abrechnung im üblichen Rahmen liegt, und hast die Unterlage für deine Akten. Der beigelegte Brief ist in diesem Fall ein Antrag auf Belegeinsicht, mit dem du die Abrechnung selbst gegenprüfen kannst.",
  },
  {
    frage: "Bekomme ich mein Geld zurück, wenn ich unzufrieden bin?",
    antwort:
      "Bei der Auswertung handelt es sich um einen digitalen Inhalt, der sofort nach dem Kauf bereitgestellt wird. Mit dem Kauf stimmst du der sofortigen Ausführung zu und erklärst dein Erlöschen des Widerrufsrechts (§ 356 Abs. 5 BGB) — das ist die gesetzliche Folge und steht so auch in den AGB. Wenn technisch etwas schiefgeht oder die Auswertung erkennbar fehlerhaft ist, melde dich: Solche Fälle klären wir direkt.",
  },
  {
    frage: "Was passiert mit meinen Daten und meiner hochgeladenen Abrechnung?",
    antwort:
      "Für die Prüfung brauchen wir kein Kundenkonto und keine Angaben zu deiner Person. Die Basisanalyse läuft ohne Registrierung. Deine Adressdaten fragen wir erst nach der Zahlung ab, und auch nur, damit sie im Musterbrief stehen. Hochgeladene Dateien werden zur Texterkennung verarbeitet und nicht für das Training von KI-Modellen verwendet. Details, Speicherfristen und deine Rechte stehen in der Datenschutzerklärung.",
  },
  {
    frage: "Warum sollte ich zahlen, wenn ich auch selbst prüfen könnte?",
    antwort:
      "Könntest du. Der Betriebskostenspiegel ist öffentlich, die BetrKV ebenfalls. Was du dafür brauchst: den Richtwert je Position finden und umrechnen, den Umlageschlüssel und die 50/70-Regel nachvollziehen, die CO₂-Aufteilung nachrechnen und daraus einen Brief formulieren, der die richtigen Vorschriften nennt. Genau diese Arbeit nimmt dir die Auswertung ab — für " +
      BUSINESS.PREIS_AUSWERTUNG.toFixed(2).replace(".", ",") +
      " € bzw. " +
      BUSINESS.PREIS_VOLL.toFixed(2).replace(".", ",") +
      " € mit Brief. Ein Mieterverein kostet Jahresbeitrag, eine anwaltliche Prüfung meist ein Vielfaches des Streitwerts bei kleineren Beträgen.",
  },
  {
    frage: "Welche Frist habe ich, um zu widersprechen?",
    antwort:
      "Nach § 556 Abs. 3 BGB kannst du Einwendungen bis zum Ablauf des zwölften Monats nach Zugang der Abrechnung geltend machen. Danach sind sie in der Regel ausgeschlossen, außer du hast die Verspätung nicht zu vertreten. Unabhängig davon muss der Vermieter dir die Abrechnung spätestens zwölf Monate nach Ende des Abrechnungszeitraums zustellen — versäumt er das, kann er eine Nachforderung meist nicht mehr durchsetzen. Beide Fristen prüfen wir mit.",
  },
];
