// ─────────────────────────────────────────────────────────────────────────
// werkzeuge.js — Inhalte der drei kostenlosen Werkzeug-Seiten (17.10.2026).
//
// WARUM ES DIESE SEITEN GIBT (Marktrecherche vom 17.10.2026, google.de):
// Bei "Nebenkostenabrechnung prüfen kostenlos" und "… online prüfen" stehen
// zwei kleine KI-Anbieter auf Platz 1 und 2 — jeweils mit einer eigenen
// Werkzeug-Seite, deren Adresse und Überschrift genau den Suchbegriff
// enthalten. NebenkostenRadar hatte dafür nur die Startseite und kam in
// 28 Tagen auf 4 Impressionen (Ø Position 52,5). Fristenrechner und
// Kürzungs-Check sind zusätzlich Seiten, auf die andere gern verlinken
// (Vorbild: Mineko-Fristenrechner, von web.de zitiert), und sie führen
// direkt zur Prüfung.
//
// EINZIGE QUELLE: Diese Datei speist die React-Seite (src/pages/Werkzeug.jsx),
// den vorgerenderten Text (scripts/prerender.mjs) und das FAQPage-Markup.
// Wie bei faq.js: Wer hier etwas ändert, ändert alles mit.
//
// INHALTLICHE REGELN (siehe CHANGELOG und Arbeitsprinzipien):
//   - Nur Aussagen, die durch Gesetzestext belegt sind; Normen nennen.
//   - Keine erfundenen Zahlen ("x % aller Abrechnungen falsch"), keine
//     Erfolgsversprechen. Seriöse Neugier im Titel ja, Übertreibung nein.
//   - Keine Rechtsberatung im Einzelfall (RDG): Die Werkzeuge rechnen und
//     zeigen die gesetzliche Regel, sie bewerten nicht den Einzelfall.
//   - Gesetzestexte geprüft am 17.10.2026: § 556 Abs. 3 BGB; § 5 Abs. 2/3,
//     § 6a, § 12 Abs. 1 HeizkostenV; § 7 Abs. 3/4 CO2KostAufG.
// ─────────────────────────────────────────────────────────────────────────
import { BUSINESS } from "./business.js";
import { euro } from "../lib/format.js";
import { jahrEinsetzenTief, JAHR } from "../lib/jahr.js";

// Relative Jahreszahlen als {JAHR}/{VORJAHR}/{FOLGEJAHR}, siehe src/lib/jahr.js
// (17.10.2026: wandern zum Jahreswechsel automatisch mit).
const WERKZEUGE_ROH = [
  // ───────────────────────────────────────────────────────────────────────
  {
    step: "werkzeug-pruefen",
    pfad: "/nebenkostenabrechnung-pruefen",
    menue: "Nebenkostenabrechnung prüfen",
    kurz: "Kostenlos online prüfen",
    titel: "Nebenkostenabrechnung prüfen: kostenlos und online",
    seoTitel: "Nebenkostenabrechnung prüfen: kostenlos & online ({JAHR})",
    seoBeschreibung: "Abrechnung hochladen und in wenigen Minuten wissen, ob sie stimmt: Jeder Posten gegen DMB-Betriebskostenspiegel und § 2 BetrKV geprüft. Ohne Konto.",
    widget: "start",
    intro: "Du hast deine Nebenkostenabrechnung {VORJAHR} bekommen und fragst dich, ob die Nachzahlung stimmt? Lade sie als Foto oder PDF hoch. Wir lesen die Posten aus, prüfen jeden einzelnen gegen den Betriebskostenspiegel des Deutschen Mieterbundes und die Betriebskostenverordnung und zeigen dir kostenlos, wo etwas auffällt.",
    abschnitte: [
      {
        h2: "Diese 7 Fehler prüfen wir automatisch",
        liste: [
          "Kosten, die gar nicht umgelegt werden dürfen: Verwaltung (auch Kontoführung), Instandhaltung und Reparaturen (§ 1 Abs. 2 BetrKV).",
          "Kabelfernsehen: seit dem 1. Juli 2024 grundsätzlich nicht mehr umlagefähig. Steht es in der Abrechnung {VORJAHR}, ist das ein klarer Fund.",
          "Zu spät zugestellt: Die Abrechnung {VORJAHR} muss bis zum 31. Dezember {JAHR} bei dir sein (§ 556 Abs. 3 BGB). Sonst ist eine Nachforderung in der Regel ausgeschlossen.",
          "Heizkosten nicht nach Verbrauch verteilt: Dann darfst du deinen Anteil um 15 Prozent kürzen (§ 12 Abs. 1 HeizkostenV).",
          "Verteilung außerhalb von 50 bis 70 Prozent nach Verbrauch bei Heizung und Warmwasser (§§ 7, 8 HeizkostenV).",
          "Fehlender grafischer Vorjahresvergleich in der Heizkostenabrechnung: 3 Prozent Kürzungsrecht (§ 12 Abs. 1 Satz 3, § 6a HeizkostenV).",
          "Posten deutlich über dem bundesweiten Durchschnitt, etwa Grundsteuer, Versicherung oder Hausmeister. Das ist kein Beweis für einen Fehler, aber ein guter Grund, die Belege anzusehen.",
        ],
      },
      {
        h2: "So läuft die Prüfung ab",
        schritte: [
          "Abrechnung als Foto oder PDF hochladen. Die Posten werden automatisch erkannt, du bestätigst sie kurz.",
          "Kostenlose Basisanalyse: Für jeden Posten siehst du, ob er zulässig ist und wie er im Vergleich liegt. Ohne Konto, ohne Zahlung.",
          "Wenn du willst: Auswertung als PDF mit fertigem Brief an deinen Vermieter.",
        ],
      },
      {
        h2: "Was es kostet",
        text: () => `Die Basisanalyse ist kostenlos. Die Auswertung aller Posten als PDF kostet einmalig ${euro(BUSINESS.PREIS_VOLL)}. Darin enthalten ist ein fertiger Brief an deinen Vermieter, passend zum Ergebnis: den Widerspruch mit allen Beanstandungen oder, wenn nichts auffällt, die Aufforderung zur Belegeinsicht nach § 556 Abs. 4 BGB. Dazu kommt ein Hinweis auf steuerlich absetzbare Posten (§ 35a EStG). Kein Abo, keine Registrierung.`,
      },
      {
        h2: "Was wir nicht können",
        text: () => "Wir prüfen gegen Gesetz und bundesweite Durchschnittswerte, nicht gegen die Belege deines Vermieters. Eine Abweichung nach oben ist deshalb ein Anlass zur Nachfrage, kein Nachweis. Eine Rechtsberatung im Einzelfall ersetzt die Prüfung nicht. Bei hohen Beträgen oder Streit vor Gericht sind Mieterverein oder Anwalt der richtige Weg.",
      },
    ],
    faq: [
      { frage: "Ist die Prüfung der Nebenkostenabrechnung wirklich kostenlos?", antwort: "Ja, die Basisanalyse mit der Bewertung jedes Postens ist kostenlos und ohne Registrierung. Kostenpflichtig sind nur das PDF mit der ausführlichen Auswertung und der fertige Brief an den Vermieter." },
      { frage: "Welche Unterlagen brauche ich?", antwort: "Die Nebenkostenabrechnung selbst, als Foto oder PDF, und deine Wohnfläche. Für die Heizkosten hilft die Heizkostenabrechnung des Messdienstes, falls sie separat beiliegt." },
      { frage: "Bis wann kann ich der Abrechnung widersprechen?", antwort: "Einwendungen musst du bis zum Ablauf des zwölften Monats nach Zugang der Abrechnung mitteilen (§ 556 Abs. 3 Satz 5 BGB). Das genaue Datum für deinen Fall rechnet unser kostenloser Fristenrechner aus." },
      { frage: "Was passiert mit meiner Abrechnung?", antwort: "Fotos oder PDF werden nur zum Auslesen der Beträge verarbeitet (über die KI von Anthropic) und danach nicht gespeichert. Deine Eingaben speichern wir erst, wenn du eine kostenpflichtige Auswertung bestellst, und dann höchstens 12 Monate. Details stehen in der Datenschutzerklärung." },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────
  {
    step: "werkzeug-fristen",
    pfad: "/fristenrechner-nebenkostenabrechnung",
    menue: "Fristenrechner",
    kurz: "Zu spät? Frist berechnen",
    titel: "Fristenrechner: Kam deine Nebenkostenabrechnung zu spät?",
    seoTitel: "Fristenrechner Nebenkostenabrechnung: zu spät? ({JAHR})",
    seoBeschreibung: "Zwei Daten eingeben, sofort wissen: Durfte der Vermieter noch nachfordern, und bis wann kannst du widersprechen? Kostenlos, nach § 556 Abs. 3 BGB.",
    widget: "fristen",
    intro: "Für die Nebenkostenabrechnung gelten zwei Fristen, die viele verwechseln: Der Vermieter muss rechtzeitig abrechnen, und du musst rechtzeitig widersprechen. Trag unten ein, wann der Abrechnungszeitraum endete und wann die Abrechnung bei dir ankam. Der Rechner zeigt dir beide Fristen. Deine Eingaben bleiben in deinem Browser.",
    abschnitte: [
      {
        h2: "Frist 1: Bis wann muss der Vermieter abrechnen?",
        text: () => "Die Abrechnung muss dir spätestens bis zum Ablauf des zwölften Monats nach Ende des Abrechnungszeitraums zugehen (§ 556 Abs. 3 Satz 2 BGB). Für das Kalenderjahr {VORJAHR} heißt das: bis zum 31. Dezember {JAHR}. Entscheidend ist der Zugang bei dir, nicht das Datum auf dem Brief. Kommt die Abrechnung später, kann der Vermieter eine Nachzahlung in der Regel nicht mehr verlangen, es sei denn, er hat die Verspätung nicht zu vertreten (§ 556 Abs. 3 Satz 3 BGB). Ein Guthaben musst du trotzdem bekommen.",
      },
      {
        h2: "Frist 2: Bis wann kannst du widersprechen?",
        text: () => "Einwendungen gegen die Abrechnung musst du dem Vermieter spätestens bis zum Ablauf des zwölften Monats nach Zugang mitteilen (§ 556 Abs. 3 Satz 5 BGB). Danach kannst du Fehler in der Regel nicht mehr geltend machen, außer du hast die Verspätung nicht zu vertreten. Der Rechner nennt dir sicherheitshalber das frühestmögliche Fristende. Widersprich schriftlich und so, dass du den Zugang beweisen kannst.",
      },
      {
        h2: "Und die Nachzahlung?",
        text: () => "Die Einwendungsfrist ist keine Zahlungsfrist. Wann du eine Nachzahlung zahlen musst und wann du sie zurückhalten darfst, etwa solange du keine Einsicht in die Belege bekommen hast, steht im Ratgeber „Nachzahlung nicht zahlen“.",
        verweis: "nebenkosten-nachzahlung-nicht-zahlen",
      },
    ],
    faq: [
      { frage: "Bis wann muss die Nebenkostenabrechnung {VORJAHR} da sein?", antwort: "Bei einem Abrechnungszeitraum vom 1. Januar bis 31. Dezember {VORJAHR} muss die Abrechnung spätestens am 31. Dezember {JAHR} bei dir zugegangen sein (§ 556 Abs. 3 Satz 2 BGB)." },
      { frage: "Was passiert, wenn die Abrechnung zu spät kommt?", antwort: "Der Vermieter kann dann in der Regel keine Nachzahlung mehr verlangen, außer er hat die Verspätung nicht zu vertreten. Ein Guthaben zu deinen Gunsten muss er trotzdem auszahlen." },
      { frage: "Wie lange habe ich Zeit für einen Widerspruch?", antwort: "Bis zum Ablauf des zwölften Monats nach Zugang der Abrechnung (§ 556 Abs. 3 Satz 5 BGB). Kam sie zum Beispiel am 15. November {JAHR}, solltest du spätestens bis zum 15. November {FOLGEJAHR} widersprochen haben." },
      { frage: "Zählt das Datum auf der Abrechnung?", antwort: "Nein. Für beide Fristen kommt es darauf an, wann die Abrechnung tatsächlich bei dir angekommen ist (Zugang). Notiere dir das Datum, an dem du sie aus dem Briefkasten geholt hast." },
    ],
  },

  // ───────────────────────────────────────────────────────────────────────
  {
    step: "werkzeug-heizkosten",
    pfad: "/heizkosten-kuerzen-3-prozent",
    menue: "Heizkosten-Kürzungs-Check",
    kurz: "3 oder 15 % kürzen?",
    titel: "Heizkosten kürzen: Darfst du 3 oder sogar 15 Prozent abziehen?",
    seoTitel: "Heizkosten kürzen: 3 oder 15 % abziehen? Der Check",
    seoBeschreibung: "Fehlen Pflichtangaben in der Heizkostenabrechnung, dürfen Mieter kürzen. 5 Fragen, 1 Minute: Welche Kürzung nach HeizkostenV und CO2KostAufG infrage kommt.",
    widget: "heizkosten",
    intro: "Die Heizkostenverordnung und das CO₂-Kostenaufteilungsgesetz schreiben vor, was in deiner Heizkostenabrechnung stehen muss. Fehlt etwas, darfst du deinen Anteil an den Heizkosten kürzen, ohne dem Vermieter einen Rechenfehler nachweisen zu müssen. Beantworte die Fragen mit einem Blick in deine Abrechnung. Deine Antworten bleiben in deinem Browser.",
    abschnitte: [
      {
        h2: "Wann du um 15 Prozent kürzen darfst",
        text: () => "Werden die Kosten für Heizung oder Warmwasser entgegen der Verordnung nicht nach Verbrauch verteilt, sondern zum Beispiel nur nach Wohnfläche, darfst du den auf dich entfallenden Anteil um 15 Prozent kürzen (§ 12 Abs. 1 Satz 1 HeizkostenV).",
      },
      {
        h2: "Wann du um 3 Prozent kürzen darfst",
        liste: [
          "Es fehlen Pflichtinformationen nach § 6a HeizkostenV, zum Beispiel der grafische Vergleich deines Verbrauchs mit dem Vorjahr (§ 12 Abs. 1 Satz 3 HeizkostenV).",
          "Der Vermieter hat nach dem 1. Dezember 2021 neue Zähler oder Heizkostenverteiler eingebaut, die nicht per Funk fernablesbar sind (§ 5 Abs. 2, § 12 Abs. 1 Satz 2 HeizkostenV).",
          "Die Abrechnung enthält CO₂-Kosten, weist aber nicht aus, wie sie zwischen dir und dem Vermieter aufgeteilt wurden (§ 7 Abs. 3 und 4 CO2KostAufG).",
        ],
      },
      {
        // Gesetzliches Stichdatum 31.12.2026 (§ 5 Abs. 3 HeizkostenV) bleibt
        // fest. Ab 2027 wechselt der Text von "wird" zu "gilt" (17.10.2026).
        h2: Number(JAHR) >= 2027 ? "Seit 2027 gilt es auch für alte Zähler" : "Ab 2027 wird es strenger",
        text: () => Number(JAHR) >= 2027
          ? "Alte, nicht fernablesbare Zähler mussten bis zum 31. Dezember 2026 nachgerüstet oder ausgetauscht werden (§ 5 Abs. 3 HeizkostenV), außer in begründeten Ausnahmefällen. Ab dem Abrechnungsjahr 2027 kann deshalb auch ein alter, nicht nachgerüsteter Zähler das 3-Prozent-Kürzungsrecht auslösen."
          : "Alte, nicht fernablesbare Zähler müssen bis zum 31. Dezember 2026 nachgerüstet oder ausgetauscht werden (§ 5 Abs. 3 HeizkostenV), außer in begründeten Ausnahmefällen. Ab dem Abrechnungsjahr 2027 kann deshalb auch ein alter, nicht nachgerüsteter Zähler das 3-Prozent-Kürzungsrecht auslösen.",
      },
    ],
    faq: [
      { frage: "Muss ich dem Vermieter einen Fehler nachweisen, um zu kürzen?", antwort: "Nein. Die Kürzungsrechte knüpfen an formale Pflichten an: Fehlt die vorgeschriebene Angabe oder wird nicht nach Verbrauch abgerechnet, darfst du den Anteil kürzen. Du musst dem Vermieter mitteilen, warum." },
      { frage: "Gilt das auch, wenn ich eine eigene Gastherme habe?", antwort: "Nein. Die Heizkostenverordnung gilt bei einer zentralen Heizung für mehrere Wohnungen oder bei Wärmelieferung, zum Beispiel Fernwärme. Mit eigener Etagenheizung rechnest du in der Regel direkt mit dem Gasversorger ab." },
      { frage: "Darf ich mehrere Kürzungen zusammenrechnen?", antwort: "Ob mehrere 3-Prozent-Kürzungen nebeneinander gelten, ist gerichtlich nicht abschließend geklärt. Wurde gar nicht nach Verbrauch abgerechnet, greift die 15-Prozent-Kürzung; zusätzlich 3 Prozent zu fordern, wäre angreifbar." },
      { frage: "Gilt das Kürzungsrecht auch für Eigentümer?", antwort: "Nicht im Verhältnis eines Wohnungseigentümers zur Eigentümergemeinschaft (§ 12 Abs. 1 Satz 4 HeizkostenV). Für Mieter gilt es." },
    ],
  },
];

export const WERKZEUGE = jahrEinsetzenTief(WERKZEUGE_ROH);

export function werkzeugFuerStep(step) {
  return WERKZEUGE.find(w => w.step === step) || null;
}
