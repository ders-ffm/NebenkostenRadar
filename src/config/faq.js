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
import { euro } from "../lib/format.js";

export const FAQ_STARTSEITE = [
  {
    frage: "Seid ihr unabhängig von Vermietern, Verwaltungen oder Abrechnungsdienstleistern?",
    antwort:
      "Ja. NebenkostenRadar gehört keinem Vermieterverband, keiner Hausverwaltung, keinem Messdienstleister und keinem Abrechnungsunternehmen an und erhält von keiner dieser Seiten Geld. Es gibt keine Provisionen und keine Vermittlungsvereinbarungen. Die einzige Einnahmequelle ist der Preis, den du für die Auswertung zahlst.",
  },
  {
    frage: "Wie genau sind die Vergleichswerte für meine konkrete Wohnung?",
    antwort:
      "Der Betriebskostenspiegel des Deutschen Mieterbundes ist ein bundesweiter Durchschnitt ohne regionale Aufschlüsselung. In teuren Großstädten liegen einzelne Positionen, vor allem die Grundsteuer, regelmäßig deutlich darüber, ohne dass etwas falsch ist. Eine Abweichung nach oben ist deshalb ein Anlass zur Nachfrage, kein Nachweis eines Fehlers. Genau so weisen wir es in der Auswertung auch aus: Wir trennen ausdrücklich zwischen rechtlich unzulässigen Positionen (harte Beanstandung) und statistischen Auffälligkeiten (Nachfrage).",
  },
  {
    frage: "Ist das eine Rechtsberatung?",
    antwort:
      "Nein. NebenkostenRadar ist ein automatisiertes Prüfwerkzeug. Es gleicht deine Angaben mit veröffentlichten Richtwerten und den einschlägigen Vorschriften ab (§ 2 BetrKV, HeizkostenV, CO₂KostAufG) und erstellt daraus einen Bericht sowie einen Musterbrief. Eine Bewertung deines Einzelfalls, wie sie ein Anwalt oder ein Mieterverein vornimmt, ersetzt das nicht. Bei hohen Streitwerten oder einer Auseinandersetzung vor Gericht solltest du anwaltlichen Rat einholen.",
  },
  {
    frage: "Was passiert, wenn die Prüfung nichts findet?",
    antwort:
      "Dann bekommst du das ausdrücklich bestätigt, mit allen geprüften Positionen und ihren Richtwerten. Das ist kein Fehlkauf: Du weißt danach belegbar, dass deine Abrechnung im üblichen Rahmen liegt, und hast die Unterlage für deine Akten. Der beigelegte Brief ist in diesem Fall ein Antrag auf Belegeinsicht, mit dem du die Abrechnung selbst gegenprüfen kannst.",
  },
  {
    frage: "Bekomme ich mein Geld zurück, wenn ich unzufrieden bin?",
    antwort:
      "Bei der Auswertung handelt es sich um einen digitalen Inhalt, der sofort nach dem Kauf bereitgestellt wird. Mit dem Kauf stimmst du der sofortigen Ausführung zu und erklärst dein Erlöschen des Widerrufsrechts (§ 356 Abs. 5 BGB): das ist die gesetzliche Folge und steht so auch in den AGB. Wenn technisch etwas schiefgeht oder die Auswertung erkennbar fehlerhaft ist, melde dich: Solche Fälle klären wir direkt.",
  },
  {
    frage: "Was passiert mit meinen Daten und meiner hochgeladenen Abrechnung?",
    antwort:
      "Für die Prüfung brauchen wir kein Kundenkonto und keine Angaben zu deiner Person. Die Basisanalyse läuft ohne Registrierung. Deine Adressdaten fragen wir erst nach der Zahlung ab, und auch nur, damit sie im Musterbrief stehen. Hochgeladene Dateien werden zur Texterkennung verarbeitet und nicht für das Training von KI-Modellen verwendet. Details, Speicherfristen und deine Rechte stehen in der Datenschutzerklärung.",
  },
  {
    frage: "Warum sollte ich zahlen, wenn ich auch selbst prüfen könnte?",
    antwort:
      "Könntest du. Der Betriebskostenspiegel ist öffentlich, die BetrKV ebenfalls. Was du dafür brauchst: den Richtwert je Position finden und umrechnen, den Umlageschlüssel und die 50/70-Regel nachvollziehen, die CO₂-Aufteilung nachrechnen und daraus einen Brief formulieren, der die richtigen Vorschriften nennt. Genau diese Arbeit nimmt dir die Auswertung ab, für " +
      euro(BUSINESS.PREIS_AUSWERTUNG) +
      " bzw. " +
      euro(BUSINESS.PREIS_VOLL) +
      " mit Brief. Ein Mieterverein kostet Jahresbeitrag, eine anwaltliche Prüfung meist ein Vielfaches des Streitwerts bei kleineren Beträgen.",
  },
  {
    // Verschoben von der Startseite am 10.09.2026 (Stefans Rückmeldung: die
    // Startseite war zu voll). Inhaltlich gehört der Hinweis hierher — er
    // beantwortet die Frage, die sich beim Blick auf die Nachzahlung stellt.
    frage: "Muss ich die Nachzahlung bezahlen, wenn ich der Abrechnung widerspreche?",
    antwort:
      "Ja und zwar fristgerecht, sonst drohen Verzugszinsen und im Extremfall eine Kündigung wegen Zahlungsverzugs. Der richtige Weg: Überweise den Betrag und schreibe in den Verwendungszweck „Zahlung unter Vorbehalt der Überprüfung“. Damit ist die Zahlung ausdrücklich kein Anerkenntnis der Forderung. Du kommst nicht in Verzug und kannst zu viel gezahlte Beträge trotzdem zurückfordern. Wer dagegen vorbehaltlos zahlt, erschwert eine spätere Rückforderung erheblich. Ein echtes Zurückbehaltungsrecht besteht nur, solange der Vermieter dir die Belegeinsicht verweigert (§ 273 Abs. 1 BGB, BGH VIII ZR 78/05).",
  },
  {
    frage: "Welche Frist habe ich, um zu widersprechen?",
    antwort:
      "Nach § 556 Abs. 3 BGB kannst du Einwendungen bis zum Ablauf des zwölften Monats nach Zugang der Abrechnung geltend machen. Danach sind sie in der Regel ausgeschlossen, außer du hast die Verspätung nicht zu vertreten. Unabhängig davon muss der Vermieter dir die Abrechnung spätestens zwölf Monate nach Ende des Abrechnungszeitraums zustellen, versäumt er das, kann er eine Nachforderung meist nicht mehr durchsetzen. Beide Fristen prüfen wir mit.",
  },
  {
    // ERGÄNZT 11.09.2026 auf Stefans Vorgabe, nachdem der Echttest mit seiner
    // eigenen Abrechnung gezeigt hat, dass Wasser allein wegen der Höhe
    // beanstandet wurde. Die Frage muss beantwortet werden, BEVOR ein Kunde
    // sich wundert, warum sein auffällig hoher Heizkostenposten nicht im
    // Schreiben auftaucht.
    frage: "Warum werden Heizung, Warmwasser und Wasser bei euch nicht beanstandet?",
    antwort:
      "Weil diese Kosten nach deinem tatsächlichen Verbrauch abgerechnet werden und jeder Haushalt anders verbraucht. Die Vergleichswerte des Deutschen Mieterbundes sind Durchschnitte pro Quadratmeter. Wie viel Wasser und Wärme verbraucht wird, hängt aber an der Personenzahl, am Verhalten und am Zustand des Gebäudes, nicht an der Wohnfläche. Ein Vierpersonenhaushalt auf 70 Quadratmetern liegt zwangsläufig über dem Durchschnitt, ohne dass die Abrechnung einen Fehler hätte. Würden wir das trotzdem beanstanden, bekämst du vom Vermieter zu Recht die Antwort, dass die Zähler eben diesen Verbrauch anzeigen, und das würde deine berechtigten Einwände unglaubwürdig machen. Wir weisen diese Posten deshalb aus und ordnen sie ein, erheben aber keine Einwendung allein wegen ihrer Höhe.",
  },
  {
    // ÜBERARBEITET 13.09.2026 (Task #104). Vorher stand hier eine Aufzählung
    // von Rechten, die wir gar nicht geprüft haben, plus die 3 Prozent für
    // fehlende fernablesbare Zähler ohne den entscheidenden Zusatz, dass die
    // Nachrüstfrist erst am 31.12.2026 endet. Beides ist jetzt korrigiert:
    // Die Prüfung gibt es wirklich, und behauptet wird nur, was auch gilt.
    frage: "Heißt das, bei Heizkosten kann man gar nichts prüfen?",
    antwort:
      "Nein, im Gegenteil. Nicht prüfbar ist die Höhe deines Verbrauchs, sehr wohl prüfbar ist die Art der Abrechnung, und das sind die stärksten Rechte, die Mieter überhaupt haben. Wir prüfen drei Dinge, wenn du uns die Zahlen deiner Heizkostenabrechnung gibst. Erstens den Verbrauchsanteil: Der Vermieter muss mindestens 50 und höchstens 70 Prozent der Heizkosten nach dem erfassten Verbrauch verteilen (§ 7 Abs. 1 Satz 1 HeizkostenV), für Warmwasser gilt dasselbe (§ 8 Abs. 1 HeizkostenV). Wir rechnen dir aus, wo deine Abrechnung liegt. Zweitens, ob überhaupt nach Verbrauch abgerechnet wurde: Wenn nicht, darfst du deinen Anteil um 15 Prozent kürzen (§ 12 Abs. 1 Satz 1 HeizkostenV). Drittens den vorgeschriebenen Vergleich mit dem Vorjahr, der seit dem Abrechnungsjahr 2022 zwingend als Grafik beiliegen muss (§ 6a Abs. 3 Nr. 5 HeizkostenV). Fehlt er, sind es 3 Prozent (§ 12 Abs. 1 Satz 3 HeizkostenV). Das sind feste Vorgaben mit klarer Rechtsfolge, über die sich nicht streiten lässt, anders als über eine statistische Abweichung. Genau solche Punkte nehmen wir in das Schreiben auf.",
  },
  {
    // Bewusst selbst angesprochen: Es gibt eine vierte Kürzungsmöglichkeit,
    // die wir NICHT prüfen. Wer sie anderswo liest und bei uns nicht findet,
    // soll den Grund erfahren, statt einen Mangel zu vermuten.
    frage: "Warum prüft ihr die 3 Prozent für fehlende fernablesbare Zähler nicht?",
    antwort:
      "Weil sie für die meisten Abrechnungen noch gar nicht greift und wir dich nicht mit einer Forderung zum Vermieter schicken, die er in einem Satz abräumt. § 12 Abs. 1 Satz 2 HeizkostenV gibt ein Kürzungsrecht von 3 Prozent, wenn keine fernablesbare Ausstattung installiert ist. Für bereits vorhandene Geräte läuft die Frist zum Nachrüsten aber erst am 31. Dezember 2026 ab (§ 5 Abs. 3 HeizkostenV). Bis dahin gilt das Kürzungsrecht nur für Geräte, die nach dem 1. Dezember 2021 neu eingebaut wurden, und dieses Einbaudatum kennt kaum ein Mieter. Wir müssten also raten. Ab dem Abrechnungsjahr 2027 ist die Lage eindeutig, dann nehmen wir die Prüfung auf. Die 3 Prozent für den fehlenden Vorjahresvergleich prüfen wir dagegen schon heute, weil sich das an deiner Abrechnung eindeutig sehen lässt.",
  },
  {
    frage: "Wann nennt ihr einen Posten überhaupt auffällig?",
    antwort:
      "Nur wenn wir es belegen können. Wir unterscheiden drei Arten von Befunden. Erstens rechtlich eindeutige: Positionen, die gar nicht umlagefähig sind, etwa Verwaltungskosten und Instandhaltung (§ 1 Abs. 2 BetrKV) oder der Kabelanschluss seit dem 1. Juli 2024. Da gibt es nichts zu diskutieren. Zweitens formal prüfbare: Fristen und Verteilungsvorgaben, deren Einhaltung sich eindeutig feststellen lässt. Drittens statistisch auffällige: deutliche Abweichungen vom Vergleichswert des Deutschen Mieterbundes, und das ausschließlich bei festen Kostenarten wie Grundsteuer, Versicherungen, Müllgebühren oder Hausreinigung, die nicht vom Verbrauch abhängen. In dieser dritten Gruppe behaupten wir keinen Fehler, sondern stützen uns auf dein Recht auf Belegeinsicht nach § 259 BGB. Das steht dir unabhängig davon zu, ob am Ende tatsächlich ein Fehler vorliegt.",
  },
];
