#!/usr/bin/env node
/**
 * NebenkostenRadar — Steuerrecht-Monitor (§ 35a EStG)
 *
 * WAS DIESES SKRIPT TUT:
 * Liest den Gesetzestext von § 35a EStG und vergleicht ihn mit den Werten in
 * src/config/business.js (STEUER_35A). Weichen sie ab, wird eine GitHub-Issue
 * erstellt.
 *
 * WARUM ES DIESES SKRIPT GIBT:
 * Stefans Vorgabe vom 13.09.2026: "Sollte sich was im Steuerrecht ändern, muss
 * das natürlich automatisch angepasst werden."
 *
 * WARUM ES TROTZDEM NICHTS AUTOMATISCH ÜBERSCHREIBT:
 * Aus demselben Grund wie beim Richtwerte-Monitor. Die Zahlen hier landen in
 * einem Dokument, mit dem Kunden gegenüber dem Finanzamt auftreten. Ein
 * automatisch übernommener Fehlwert, etwa weil eine Seite umgebaut wurde und
 * die Texterkennung danebengreift, hätte reale steuerliche Folgen und würde
 * niemandem auffallen. Automatisch ist deshalb die ERKENNUNG, nicht die
 * Änderung.
 *
 * WAS GEPRÜFT WIRD:
 *   1. Der Prozentsatz (heute 20 %) in Absatz 2 und Absatz 3.
 *   2. Der Höchstbetrag für haushaltsnahe Dienstleistungen, Abs. 2 (4.000 €).
 *   3. Der Höchstbetrag für Handwerkerleistungen, Abs. 3 (1.200 €).
 *   4. Ob sich der Wortlaut der Absätze 2 und 3 geändert hat. Das fängt auch
 *      Änderungen ab, die keine Zahl betreffen, etwa eine Neufassung des
 *      begünstigten Leistungskreises. Dann wäre die Zuordnung in
 *      src/lib/analyse.js zu prüfen (STEUER_DIENSTLEISTUNG, STEUER_HANDWERKER,
 *      STEUER_NICHT).
 *
 * WAS ES NICHT PRÜFT:
 * Neue Rechtsprechung. Ein BFH-Urteil ändert den Gesetzestext nicht, kann die
 * Zuordnung einzelner Posten aber kippen, so geschehen bei der Straßenreinigung
 * (BFH VI R 4/18). Dafür ist scripts/rechtsmonitor.mjs zuständig.
 *
 * AUFRUF:
 *   node scripts/steuerrecht-monitor.mjs
 * Ohne GITHUB_TOKEN/GITHUB_REPO meldet es nur in der Konsole, lässt sich also
 * gefahrlos von Hand ausprobieren.
 *
 * AUTOMATISIERUNG: .github/workflows/steuerrecht-monitor.yml, monatlich.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { BUSINESS } from "../src/config/business.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO;
const STAND_DATEI = join(ROOT, "scripts", "steuerrecht-stand.json");

// ───────────────────────────────────────────────────────────────────────────
// MEHRERE QUELLEN, ergänzt 13.09.2026 nach dem ersten echten Lauf auf GitHub.
//
// WAS PASSIERT IST: Der Lauf scheiterte mit "fetch failed".
// gesetze-im-internet.de nimmt Anfragen aus Rechenzentren offenbar nicht an.
// Dasselbe Verhalten zeigte sich am selben Tag bei zwei weiteren automatisierten
// Abrufen; nur ein echter Browser kam durch. Daran lässt sich von außen nichts
// ändern, also braucht es Ausweichquellen.
//
// Die amtliche Quelle steht bewusst vorn. Die beiden anderen sind etablierte
// Gesetzesportale, die denselben Wortlaut wiedergeben.
//
// SCHUTZ VOR FEHLALARM: Eine Quelle wird nur verwendet, wenn sich in ihrem Text
// BEIDE erwarteten Stellen vollständig finden lassen, also Absatz 2 und
// Absatz 3 mit jeweils Prozentsatz und Höchstbetrag. Liefert eine Quelle nur
// Bruchstücke, weil sie den Paragrafen anders gliedert oder nur Auszüge zeigt,
// wird sie übersprungen statt halb ausgewertet. Eine halb gelesene Quelle wäre
// schlimmer als gar keine, weil sie eine Änderung melden würde, die es nicht
// gibt.
// ───────────────────────────────────────────────────────────────────────────
const QUELLEN = [
  { name: "gesetze-im-internet.de (amtlich)", url: "https://www.gesetze-im-internet.de/estg/__35a.html" },
  { name: "buzer.de",                          url: "https://www.buzer.de/35a_EStG.htm" },
  { name: "dejure.org",                        url: "https://dejure.org/gesetze/EStG/35a.html" },
];

// Browserähnliche Kopfzeilen. Manche Portale weisen Anfragen ohne sie ab.
const KOPFZEILEN = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "de-DE,de;q=0.9",
};

function textAusHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&auml;/g, "ä").replace(/&ouml;/g, "ö")
    .replace(/&uuml;/g, "ü").replace(/&szlig;/g, "ß").replace(/&amp;/g, "&")
    .replace(/&sect;/g, "§").replace(/&#167;/g, "§")
    .replace(/\s+/g, " ")
    .trim();
}

// Schneidet einen Absatz heraus, z.B. "(2) ..." bis zum Beginn von "(3)".
function absatz(text, nummer) {
  const start = text.indexOf(`(${nummer})`);
  if (start === -1) return "";
  const naechster = text.indexOf(`(${nummer + 1})`, start);
  return text.slice(start, naechster === -1 ? start + 2500 : naechster).trim();
}

// "4 000" oder "4.000" -> 4000
function zuZahl(s) {
  return parseInt(String(s).replace(/[.\s]/g, ""), 10);
}

// Die Satzstellung unterscheidet sich zwischen den Absätzen:
//   Abs. 2: "um 20 Prozent, höchstens 4 000 Euro, der Aufwendungen"
//   Abs. 3: "um 20 Prozent der Aufwendungen ..., höchstens jedoch um 1 200 Euro"
// Ein Muster, das beide Formen erfasst.
const PROZENT_MUSTER = /um (\d+) Prozent/;
const HOECHST_MUSTER = /höchstens(?: jedoch)?(?: um)? ([\d][\d.\s]*) Euro/;

// Liest die vier Kennzahlen aus einem Text. Gibt null zurück, wenn auch nur
// eine davon fehlt. Damit entscheidet sich, ob eine Quelle brauchbar ist.
function leseKennzahlen(text) {
  const abs2 = absatz(text, 2);
  const abs3 = absatz(text, 3);
  if (!abs2 || !abs3) return null;
  const p2 = PROZENT_MUSTER.exec(abs2), p3 = PROZENT_MUSTER.exec(abs3);
  const h2 = HOECHST_MUSTER.exec(abs2), h3 = HOECHST_MUSTER.exec(abs3);
  if (!p2 || !p3 || !h2 || !h3) return null;
  return {
    abs2, abs3,
    prozent2: parseInt(p2[1], 10), prozent3: parseInt(p3[1], 10),
    hoechst2: zuZahl(h2[1]), hoechst3: zuZahl(h3[1]),
  };
}

async function holeKennzahlen() {
  const fehlversuche = [];
  for (const q of QUELLEN) {
    try {
      const res = await fetch(q.url, { headers: KOPFZEILEN, signal: AbortSignal.timeout(20000) });
      if (!res.ok) { fehlversuche.push(`${q.name}: HTTP ${res.status}`); continue; }
      const kennzahlen = leseKennzahlen(textAusHtml(await res.text()));
      if (!kennzahlen) { fehlversuche.push(`${q.name}: Text abrufbar, aber § 35a Abs. 2 und 3 nicht vollständig darin auffindbar`); continue; }
      console.log(`Quelle verwendet: ${q.name}`);
      return { kennzahlen, quelle: q, fehlversuche };
    } catch (err) {
      fehlversuche.push(`${q.name}: ${err.message}`);
    }
  }
  return { kennzahlen: null, quelle: null, fehlversuche };
}

function vergleiche(k) {
  const befunde = [];
  const erwarteterSatz = Math.round(BUSINESS.STEUER_35A.SATZ * 100);
  if (k.prozent2 !== erwarteterSatz) befunde.push(`§ 35a Abs. 2: Gesetz nennt ${k.prozent2} %, im Produkt stehen ${erwarteterSatz} %.`);
  if (k.prozent3 !== erwarteterSatz) befunde.push(`§ 35a Abs. 3: Gesetz nennt ${k.prozent3} %, im Produkt stehen ${erwarteterSatz} %.`);
  if (k.hoechst2 !== BUSINESS.STEUER_35A.HOECHST_DIENSTLEISTUNG) {
    befunde.push(`§ 35a Abs. 2 (haushaltsnahe Dienstleistungen): Gesetz nennt ${k.hoechst2.toLocaleString("de-DE")} Euro, im Produkt stehen ${BUSINESS.STEUER_35A.HOECHST_DIENSTLEISTUNG.toLocaleString("de-DE")} Euro.`);
  }
  if (k.hoechst3 !== BUSINESS.STEUER_35A.HOECHST_HANDWERKER) {
    befunde.push(`§ 35a Abs. 3 (Handwerkerleistungen): Gesetz nennt ${k.hoechst3.toLocaleString("de-DE")} Euro, im Produkt stehen ${BUSINESS.STEUER_35A.HOECHST_HANDWERKER.toLocaleString("de-DE")} Euro.`);
  }
  return befunde;
}

async function meldeIssue(titel, body, label) {
  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    console.log("\nHINWEIS: GITHUB_TOKEN/GITHUB_REPO nicht gesetzt, Meldung nur in der Konsole:\n");
    console.log(titel + "\n" + body);
    return;
  }
  const res = await fetch("https://api.github.com/repos/" + GITHUB_REPO + "/issues", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + GITHUB_TOKEN,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title: titel, body, labels: ["steuerrecht", label] }),
  });
  if (!res.ok) throw new Error("GitHub Issue konnte nicht erstellt werden: " + (await res.text()));
  console.log("GitHub Issue erstellt.");
}

async function main() {
  const { kennzahlen, quelle, fehlversuche } = await holeKennzahlen();

  // KEINE QUELLE ERREICHBAR. Das ist kein stiller Fehler, sondern wird
  // gemeldet: Ein Monitor, der monatelang nichts prüfen kann, ohne dass es
  // jemand merkt, ist schlimmer als gar keiner.
  if (!kennzahlen) {
    const body = [
      "Der Steuerrecht-Monitor konnte § 35a EStG bei **keiner** der hinterlegten Quellen auslesen.",
      "",
      "## Was versucht wurde",
      ...fehlversuche.map(f => "- " + f),
      "",
      "## Was das bedeutet",
      "Die Zahlen im Produkt sind deshalb nicht falsch, sie sind nur ungeprüft. Zuletzt von Hand bestätigt am " + BUSINESS.STEUER_35A.GEPRUEFT_AM + ".",
      "",
      "## Was zu tun ist",
      "1. " + QUELLEN[0].url + " im Browser öffnen und die drei Werte ablesen: Prozentsatz, Höchstbetrag Absatz 2, Höchstbetrag Absatz 3.",
      "2. Stimmen sie mit `STEUER_35A` in `src/config/business.js` überein, nur `GEPRUEFT_AM` aktualisieren.",
      "3. Blockt eine Quelle dauerhaft, in `scripts/steuerrecht-monitor.mjs` die Liste `QUELLEN` um eine erreichbare ergänzen.",
    ].join("\n");
    console.error("Keine Quelle erreichbar:");
    fehlversuche.forEach(f => console.error("  " + f));
    await meldeIssue("Steuerrecht-Monitor kommt an keine Quelle heran", body, "pruefung-nicht-moeglich");
    process.exitCode = 1;
    return;
  }

  const befunde = vergleiche(kennzahlen);

  // Wortlaut-Vergleich über einen Fingerabdruck der beiden Absätze. Der Abdruck
  // wird je Quelle gespeichert, weil verschiedene Portale denselben Paragrafen
  // unterschiedlich formatieren. Ein Quellenwechsel darf keinen Fehlalarm geben.
  const fingerabdruck = createHash("sha256").update(kennzahlen.abs2 + "|" + kennzahlen.abs3).digest("hex").slice(0, 16);
  const stand = existsSync(STAND_DATEI) ? JSON.parse(readFileSync(STAND_DATEI, "utf8")) : null;
  const wortlautGeaendert = Boolean(stand && stand.quelle === quelle.name && stand.fingerabdruck && stand.fingerabdruck !== fingerabdruck);

  if (befunde.length === 0 && !wortlautGeaendert) {
    console.log("§ 35a EStG unverändert.");
    console.log(`  Satz:                          ${kennzahlen.prozent2} %`);
    console.log(`  Höchstbetrag Dienstleistungen: ${kennzahlen.hoechst2.toLocaleString("de-DE")} Euro`);
    console.log(`  Höchstbetrag Handwerker:       ${kennzahlen.hoechst3.toLocaleString("de-DE")} Euro`);
    if (!stand || stand.quelle !== quelle.name) {
      writeFileSync(STAND_DATEI, JSON.stringify({ quelle: quelle.name, fingerabdruck, geprueft: new Date().toISOString().slice(0, 10) }, null, 2) + "\n");
      console.log(`Wortlaut-Fingerabdruck für "${quelle.name}" angelegt. Datei scripts/steuerrecht-stand.json ins Repo aufnehmen, sonst greift der Wortlautvergleich beim nächsten Lauf nicht.`);
    }
    return;
  }

  const zeilen = ["Der Steuerrecht-Monitor hat eine Änderung an **§ 35a EStG** festgestellt.", "", `Quelle: ${quelle.name}, ${quelle.url}`, ""];
  if (befunde.length) {
    zeilen.push("## Abweichende Werte", "");
    befunde.forEach(b => zeilen.push("- " + b));
    zeilen.push("");
  }
  if (wortlautGeaendert) {
    zeilen.push("## Wortlaut geändert", "");
    zeilen.push("Der Text der Absätze 2 und 3 weicht vom zuletzt geprüften Stand derselben Quelle ab, auch wenn die Zahlen gleich geblieben sein sollten.");
    zeilen.push("Das kann bedeuten, dass der Kreis der begünstigten Leistungen neu gefasst wurde.", "");
  }
  zeilen.push("## Was zu tun ist", "");
  zeilen.push("1. Den Gesetzestext an der Quelle oben lesen und die Änderung einordnen.");
  zeilen.push("2. Bei geänderten Zahlen: `src/config/business.js`, Abschnitt `STEUER_35A`, anpassen. Die PDF-Seite zieht ihre Werte von dort, es gibt keine zweite Stelle.");
  zeilen.push("3. Bei geändertem Wortlaut zusätzlich prüfen, ob die Zuordnung der Posten noch stimmt: `src/lib/analyse.js`, die Listen `STEUER_DIENSTLEISTUNG`, `STEUER_HANDWERKER` und `STEUER_NICHT`.");
  zeilen.push("4. `GEPRUEFT_AM` in `business.js` aktualisieren.");
  zeilen.push("5. `scripts/steuerrecht-stand.json` löschen, damit beim nächsten Lauf ein neuer Fingerabdruck angelegt wird.");
  zeilen.push("6. `npm run check` und `npm run probedruck` laufen lassen.", "");
  zeilen.push("Dieses Skript ändert bewusst nichts von selbst. Die Zahlen landen in einem Dokument, mit dem Kunden gegenüber dem Finanzamt auftreten.");

  await meldeIssue("§ 35a EStG hat sich geändert, Steuerseite prüfen", zeilen.join("\n"), "manuelle-pruefung-noetig");
  process.exitCode = 1;
}

main().catch(err => {
  console.error("Steuerrecht-Monitor fehlgeschlagen:", err.message);
  process.exitCode = 1;
});
