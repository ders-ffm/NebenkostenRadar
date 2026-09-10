// ─────────────────────────────────────────────────────────────────────────
// beispiel.js — Der Musterfall, der auf der Startseite gezeigt wird.
//
// WARUM ES DEN GIBT (Maßnahme V2):
// Wer NebenkostenRadar zum ersten Mal sieht, muss das Formular ausfüllen,
// bevor er weiß, wie das Ergebnis überhaupt aussieht. Das ist ein
// Vertrauensvorschuss, den viele nicht aufbringen. servicechargeaudit.uk (UK)
// und pruefenlassen.ch (Schweiz) zeigen beide einen vollständigen Musterfall
// auf der Startseite — unabhängig voneinander, was für die Wirksamkeit
// spricht. Recherche: planung/europa-potenzial-nkr.md, Abschnitt 5.1 c.
//
// WARUM DIE ZAHLEN BERECHNET UND NICHT EINGETIPPT SIND:
// Die Richtwerte kommen aus BUSINESS.RICHTWERTE und werden hier zur
// Jahressumme hochgerechnet. Wenn der Deutsche Mieterbund neue Werte
// veröffentlicht und business.js aktualisiert wird, wandert das Beispiel
// automatisch mit. Fest eingetippte Beträge wären beim nächsten Update
// still veraltet — und ein veraltetes Beispiel auf der Startseite wäre
// schlimmer als gar keines.
//
// WICHTIG — EHRLICHKEIT:
// Die Wohnung, die Beträge und der Vermieter sind erfunden. Das steht auch
// so auf der Startseite. Es sind KEINE echten Kundendaten und KEIN echtes
// Ergebnis. NebenkostenRadar hatte zum Zeitpunkt der Erstellung (10.09.2026)
// noch keinen einzigen Käufer — deshalb gibt es hier auch bewusst keine
// Testimonials, keine Bewertungen und keinen "schon X Abrechnungen geprüft"-
// Zähler. Sobald echte Zahlen existieren, sind sie legitim. Vorher nicht.
//
// EIN BEISPIEL ÄNDERN:
// Unten in BEISPIEL_POSTEN einen Eintrag anpassen. Die Felder:
//   name        Anzeigename der Position
//   betrag      was der (fiktive) Vermieter abgerechnet hat, in Euro/Jahr
//   richtwert   Schlüssel aus BUSINESS.RICHTWERTE, oder null wenn es
//               keinen Vergleichswert gibt (dann zählt nur die Rechtslage)
//   status      "unzulaessig" | "auffaellig" | "ok"
//   begruendung Klartext, der unter der Position steht
//   grundlage   die zitierte Vorschrift
// ─────────────────────────────────────────────────────────────────────────
import { BUSINESS } from "./business.js";

// Bezugsgröße des Musterfalls. 75 m² ist die Größenordnung einer typischen
// Drei-Zimmer-Mietwohnung und wird auch im Ratgeberartikel zum
// Betriebskostenspiegel als Rechenbeispiel verwendet — beide sollten
// dieselbe Zahl nutzen, damit nichts widersprüchlich wirkt.
export const BEISPIEL_QM = 75;

// Richtwerte stehen in €/m² und MONAT. Für den Jahresvergleich mal Fläche
// mal zwölf.
function jahresRichtwert(schluessel) {
  const proQmMonat = BUSINESS.RICHTWERTE[schluessel];
  if (typeof proQmMonat !== "number") return null;
  return Math.round(proQmMonat * BEISPIEL_QM * 12);
}

const ROH_POSTEN = [
  {
    name: "Kabelanschluss",
    betrag: 138,
    richtwert: null,
    status: "unzulaessig",
    begruendung:
      "Seit dem 1. Juli 2024 dürfen die Kosten für einen Kabelanschluss nicht mehr pauschal über die Nebenkosten auf alle Mieter umgelegt werden. Das sogenannte Nebenkostenprivileg ist entfallen.",
    grundlage: "§ 2 Nr. 15 BetrKV i. V. m. § 71 TKG",
  },
  {
    name: "Verwaltungskosten",
    betrag: 96,
    richtwert: null,
    status: "unzulaessig",
    begruendung:
      "Verwaltungskosten gehören ausdrücklich nicht zu den Betriebskosten und dürfen im Wohnraummietverhältnis nicht umgelegt werden — auch nicht als „Verwaltungspauschale“ oder unter anderem Namen.",
    grundlage: "§ 1 Abs. 2 Nr. 1 BetrKV",
  },
  {
    name: "Hausmeister",
    betrag: 420,
    richtwert: "hausmeister",
    status: "auffaellig",
    begruendung:
      "Deutlich über dem bundesweiten Durchschnitt. Das kann an einem hohen Leistungsumfang liegen — es können aber auch Instandhaltungs- oder Reparaturarbeiten enthalten sein, die der Vermieter selbst tragen muss. Das lässt sich nur über die Belege klären.",
    grundlage: "§ 2 Nr. 14 BetrKV",
  },
  {
    name: "Heizung und Warmwasser",
    betrag: 1210,
    richtwert: "heizung_warmwasser",
    status: "ok",
    begruendung:
      "Liegt im üblichen Rahmen. Zusätzlich geprüft: die Aufteilung zwischen Verbrauch und Wohnfläche nach der Heizkostenverordnung.",
    grundlage: "§ 7 HeizkostenV",
  },
  {
    name: "Grundsteuer",
    betrag: 168,
    richtwert: "grundsteuer",
    status: "ok",
    begruendung: "Liegt im üblichen Rahmen.",
    grundlage: "§ 2 Nr. 1 BetrKV",
  },
];

export const BEISPIEL_POSTEN = ROH_POSTEN.map(p => {
  const vergleich = p.richtwert ? jahresRichtwert(p.richtwert) : null;
  const abweichung =
    vergleich && vergleich > 0 ? Math.round(((p.betrag - vergleich) / vergleich) * 100) : null;
  return { ...p, vergleich, abweichung };
});

export const BEISPIEL_UNZULAESSIG_SUMME = BEISPIEL_POSTEN
  .filter(p => p.status === "unzulaessig")
  .reduce((summe, p) => summe + p.betrag, 0);

export const BEISPIEL_ANZAHL = {
  unzulaessig: BEISPIEL_POSTEN.filter(p => p.status === "unzulaessig").length,
  auffaellig: BEISPIEL_POSTEN.filter(p => p.status === "auffaellig").length,
  ok: BEISPIEL_POSTEN.filter(p => p.status === "ok").length,
};

// Ausschnitt aus dem Musterbrief. Bewusst nur ein Ausschnitt — der
// vollständige Brief ist Teil der kostenpflichtigen Stufe. Formulierung und
// Rechtsgrundlagen entsprechen dem, was BriefPDF.jsx tatsächlich erzeugt;
// wer den Brief dort ändert, sollte diesen Ausschnitt mit anpassen.
export const BEISPIEL_BRIEF =
  "Sehr geehrte Damen und Herren,\n\n" +
  "gegen Ihre Betriebskostenabrechnung für das Jahr 2024, zugegangen am 14.03.2025, erhebe ich fristgerecht Einwendungen.\n\n" +
  "Die Position „Kabelanschluss“ über 138,00 € ist nicht umlagefähig. Das Nebenkostenprivileg ist zum 1. Juli 2024 entfallen (§ 2 Nr. 15 BetrKV i. V. m. § 71 TKG). Die Position „Verwaltungskosten“ über 96,00 € gehört nach § 1 Abs. 2 Nr. 1 BetrKV ausdrücklich nicht zu den Betriebskosten.\n\n" +
  "Ich fordere Sie auf, die Abrechnung um diese Positionen zu korrigieren. Für die Position „Hausmeister“ beantrage ich zudem Einsicht in die zugrunde liegenden Belege (§ 259 BGB).";
