// ─────────────────────────────────────────────────────────────────────────
// seo.js — Titel, Beschreibung und Vorschaubild je Seite.
//
// WARUM DIESE DATEI EXISTIERT (Befund aus dem Live-Check am 10.09.2026):
//
// Es gab ZWEI Stellen, die Titel und Beschreibung gesetzt haben, und sie
// haben sich gegenseitig überschrieben:
//   1. scripts/prerender.mjs schreibt sie beim Build ins statische HTML.
//   2. Ein useEffect in App.jsx setzt sie im Browser noch einmal neu.
//
// Der Effekt in App.jsx kannte aber nur zwei Fälle: Artikelseiten und
// "alles andere". "Alles andere" bekam den Startseitentitel. Ergebnis: Die
// mühsam vorgerenderte FAQ-Seite hatte im Quelltext den richtigen Titel —
// und sobald React startete, wurde er durch den Startseitentitel ersetzt.
// Da Google JavaScript ausführt, hat Google den falschen Titel gesehen. Die
// Vorrender-Arbeit für /faq und /ratgeber war damit wirkungslos.
//
// Dasselbe galt für das Canonical: /ueber-uns steht in der Sitemap, hat im
// Quelltext aber auf "/" gezeigt — also "ich bin eine Kopie der Startseite".
// So wird die Seite nie indexiert.
//
// Jetzt gibt es genau eine Quelle. Beide Seiten — Build und Browser — lesen
// aus dieser Datei. Ein Widerspruch ist strukturell nicht mehr möglich.
//
// EINE NEUE SEITE ERGÄNZEN:
// Unten einen Eintrag hinzufügen, dessen Schlüssel dem "step"-Namen aus
// ROUTES in App.jsx entspricht. Fehlt ein Eintrag, greift STANDARD — das ist
// kein Fehler, aber die Seite bekommt dann den allgemeinen Text.
//
// LÄNGEN: Google zeigt in den Suchergebnissen rund 60 Zeichen Titel und
// rund 160 Zeichen Beschreibung. Längere Texte werden abgeschnitten. Die
// Werte unten halten sich daran.
// ─────────────────────────────────────────────────────────────────────────

export const BASIS_URL = "https://nebenkostenradar.com";

// Vorschaubild für geteilte Links (WhatsApp, Facebook, LinkedIn, Slack).
// BEFUND 10.09.2026: Es gab bis dahin GAR KEIN og:image — jeder geteilte
// Link zeigte eine leere Vorschau. Für ein Projekt, das über Social Media
// Reichweite aufbauen soll, ist das ein direkter Verlust.
// Das Bild liegt unter public/ und wird 1:1 nach dist/ kopiert.
// Format 1200x630 (Seitenverhältnis 1,91:1) ist der von Facebook, LinkedIn
// und X gemeinsam unterstützte Standard.
export const OG_BILD = BASIS_URL + "/og-bild.png";

// ZIELGRUPPE (Stefan, 10.09.2026): Auf der Seite stand nirgends, dass sich
// das Angebot an MIETER richtet — weder in der Überschrift noch im
// Seitentitel. Genau danach wird aber gesucht („nebenkostenabrechnung prüfen
// mieter"). Das Wort steht jetzt in Titel und Beschreibung der Startseite
// und wird auf den Unterseiten aufgegriffen.
export const SEO_STANDARD = {
  titel: "Nebenkostenabrechnung für Mieter prüfen | NebenkostenRadar",
  beschreibung:
    "Als Mieter die Nebenkostenabrechnung kostenlos prüfen: Jeder Posten wird mit dem Betriebskostenspiegel des Deutschen Mieterbundes verglichen. Ohne Registrierung.",
};

export const SEO_SEITEN = {
  welcome: SEO_STANDARD,

  ratgeber: {
    titel: "Ratgeber Nebenkosten & Mietrecht | NebenkostenRadar",
    beschreibung:
      "Verständliche Artikel für Mieter: Betriebskosten, Umlageschlüssel, Belegeinsicht und Fristen, mit Rechtsgrundlage und ohne Fachchinesisch.",
  },

  faq: {
    titel: "Häufige Fragen zur Nebenkostenprüfung | NebenkostenRadar",
    beschreibung:
      "Antworten für Mieter zu Unabhängigkeit, Genauigkeit der Vergleichswerte, Fristen, Datenschutz und Kosten der Nebenkostenprüfung.",
  },

  ueberuns: {
    titel: "Über NebenkostenRadar, wer dahintersteht",
    beschreibung:
      "Wer NebenkostenRadar betreibt, worauf die Prüfung beruht und warum das Angebot unabhängig von Vermietern und Hausverwaltungen ist.",
  },

  impressum: {
    titel: "Impressum | NebenkostenRadar",
    beschreibung:
      "Anbieterkennzeichnung nach § 5 DDG für nebenkostenradar.com: Betreiber, Anschrift, Kontaktmöglichkeiten und Angaben zur Streitbeilegung.",
  },

  agb: {
    titel: "AGB und Widerrufsbelehrung | NebenkostenRadar",
    beschreibung:
      "Allgemeine Geschäftsbedingungen, Leistungsbeschreibung, Preise und Widerrufsbelehrung für NebenkostenRadar.",
  },

  datenschutz: {
    titel: "Datenschutzerklärung | NebenkostenRadar",
    beschreibung:
      "Welche Daten NebenkostenRadar verarbeitet, wie lange sie gespeichert werden und welche Rechte du nach DSGVO hast.",
  },
};

// Seiten des Prüfungs-Ablaufs und interne Seiten: Sie sollen NICHT einzeln
// in der Suche auftauchen. Sie stehen nicht in der Sitemap und bekommen
// beim Vorrendern ein noindex mit, damit ein zufällig gefundener
// Zwischenschritt nicht als eigenständiges Suchergebnis erscheint.
export const NICHT_INDEXIEREN = [
  "wohnung", "posten", "loading", "result", "adressen",
  "download", "konto", "login", "danke",
];

export function seoFuer(step) {
  return SEO_SEITEN[step] || SEO_STANDARD;
}

// ───────────────────────────────────────────────────────────────────────────
// Titel und Beschreibung für Ratgeberartikel.
//
// BEFUND 10.09.2026: ALLE 22 Artikel hatten einen <title> zwischen 75 und
// 127 Zeichen — Google zeigt rund 60. Jeder Titel wurde also mitten im Wort
// abgeschnitten. Zwei Ursachen:
//   1. Der Zusatz " | NebenkostenRadar Ratgeber" allein frisst 28 Zeichen.
//      Er ist jetzt " | NebenkostenRadar" (19 Zeichen) — die Wortmarke reicht.
//   2. Die Artikelüberschriften selbst sind lang, weil sie auf der Seite als
//      H1 gut lesbar sein sollen. Das ist richtig so — die Überschrift auf
//      der Seite darf länger sein als der Titel im Suchergebnis.
//
// Deshalb kann ein Artikel optional ein Feld "titelKurz" haben. Ist es
// gesetzt, wird es für den <title> verwendet; sonst die normale Überschrift.
// Ein Artikel ohne titelKurz funktioniert also weiterhin.
//
// Die Beschreibung wird aus dem Teaser gebildet: ganze Sätze statt eines
// mitten im Wort abgeschnittenen Textes. Dadurch braucht kein Artikel ein
// zusätzliches Feld.
//
// NACHGEBESSERT am 10.09.2026, weil scripts/seo-check.mjs die erste Fassung
// sofort widerlegt hat: Sie nahm nur so viele Sätze, wie in 160 Zeichen
// passen. Bei Artikeln, die mit einem kurzen Satz einsteigen — „Nicht die
// verbliebenen Mieter." — kam dabei eine 30 Zeichen lange Beschreibung
// heraus. Eine zu kurze Beschreibung ist in den Suchergebnissen schlechter
// als eine etwas zu lange, weil sie nichts über den Inhalt sagt.
//
// Die Regel lautet jetzt: Sätze anhängen, bis der Text lang genug ist
// (MIN_SINNVOLL), aber nie über MAX hinaus. Der erste Satz kommt immer mit,
// auch wenn er allein schon länger ist als MAX.
// ───────────────────────────────────────────────────────────────────────────
const TITEL_ZUSATZ = " | NebenkostenRadar";
const BESCHREIBUNG_MAX = 200;
const BESCHREIBUNG_MIN_SINNVOLL = 120;

export function artikelTitel(artikel) {
  return (artikel.titelKurz || artikel.titel) + TITEL_ZUSATZ;
}

export function artikelBeschreibung(artikel) {
  const teaser = (artikel.teaser || "").trim();
  if (teaser.length <= BESCHREIBUNG_MAX) return teaser;

  // An Satzenden trennen. Das Satzzeichen bleibt beim Satz, damit nichts fehlt.
  const saetze = teaser.match(/[^.!?]+[.!?]+(\s|$)/g);
  if (!saetze || saetze.length === 0) return teaser;

  let ergebnis = saetze[0].trim();
  for (let i = 1; i < saetze.length; i++) {
    if (ergebnis.length >= BESCHREIBUNG_MIN_SINNVOLL) break;
    const naechster = (ergebnis + " " + saetze[i].trim()).trim();
    // Zu kurz ist schlimmer als zu lang: Solange die Beschreibung noch
    // nichtssagend kurz ist, wird der nächste Satz auch dann angehängt,
    // wenn er über BESCHREIBUNG_MAX hinausgeht. Google kürzt die Anzeige
    // ohnehin — aber aus „Nicht die verbliebenen Mieter." erfährt niemand,
    // worum es auf der Seite geht.
    if (naechster.length > BESCHREIBUNG_MAX && ergebnis.length >= BESCHREIBUNG_MIN_SINNVOLL) break;
    ergebnis = naechster;
  }
  return ergebnis;
}
