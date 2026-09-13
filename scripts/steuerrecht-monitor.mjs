#!/usr/bin/env node
/**
 * NebenkostenRadar — Steuerrecht-Monitor (§ 35a EStG)
 *
 * WAS DIESES SKRIPT TUT:
 * Liest den amtlichen Gesetzestext von § 35a EStG bei gesetze-im-internet.de
 * und vergleicht ihn mit den Werten in src/config/business.js (STEUER_35A).
 * Weichen sie ab, wird eine GitHub-Issue erstellt.
 *
 * WARUM ES DIESES SKRIPT GIBT:
 * Stefans Vorgabe vom 13.09.2026: "Sollte sich was im Steuerrecht ändern, muss
 * das natürlich automatisch angepasst werden."
 *
 * WARUM ES TROTZDEM NICHTS AUTOMATISCH ÜBERSCHREIBT:
 * Aus demselben Grund wie beim Richtwerte-Monitor. Die Zahlen hier landen in
 * einem Dokument, mit dem Kunden gegenüber dem Finanzamt auftreten. Ein
 * automatisch übernommener Fehlwert, etwa weil die Seite umgebaut wurde und
 * die Texterkennung danebengreift, hätte reale steuerliche Folgen und würde
 * niemandem auffallen. Automatisch ist deshalb die ERKENNUNG, nicht die
 * Änderung. Das ist die verlässlichere Auslegung von "automatisch angepasst":
 * Es kann nicht passieren, dass eine Gesetzesänderung monatelang unbemerkt
 * bleibt, und es kann ebenso wenig passieren, dass ein Parser-Fehler still in
 * die Kundendokumente wandert.
 *
 * WAS GEPRÜFT WIRD:
 *   1. Der Prozentsatz (heute 20 %).
 *   2. Der Höchstbetrag für haushaltsnahe Dienstleistungen, § 35a Abs. 2
 *      (heute 4.000 Euro).
 *   3. Der Höchstbetrag für Handwerkerleistungen, § 35a Abs. 3
 *      (heute 1.200 Euro).
 *   4. Ob sich der Wortlaut der Absätze 2 und 3 überhaupt geändert hat. Das
 *      fängt auch Änderungen ab, die keine Zahl betreffen, etwa wenn der
 *      Gesetzgeber den Kreis der begünstigten Leistungen neu fasst. Dann
 *      müsste die Zuordnung in src/lib/analyse.js überprüft werden
 *      (STEUER_DIENSTLEISTUNG, STEUER_HANDWERKER, STEUER_NICHT).
 *
 * WAS ES NICHT PRÜFT:
 * Neue Rechtsprechung. Ein BFH-Urteil ändert den Gesetzestext nicht, kann die
 * Zuordnung einzelner Posten aber sehr wohl kippen, so geschehen bei der
 * Straßenreinigung (BFH VI R 4/18). Dafür ist scripts/rechtsmonitor.mjs
 * zuständig, der ohnehin monatlich nach neuer Rechtsprechung sucht.
 *
 * SETUP:
 *   export GITHUB_TOKEN=ghp_...          (Personal Access Token mit "repo"-Recht)
 *   export GITHUB_REPO=DEIN_USERNAME/NebenkostenRadar
 *   node scripts/steuerrecht-monitor.mjs
 *
 * Ohne Token läuft es trotzdem und meldet in der Konsole. So lässt es sich
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
const QUELLE = BUSINESS.STEUER_35A.QUELLE;

// Der zuletzt gesehene Wortlaut wird hier abgelegt, damit reine Textänderungen
// auffallen. Die Datei gehört ins Repo, sonst meldet jeder Lauf eine Änderung.
const STAND_DATEI = join(ROOT, "scripts", "steuerrecht-stand.json");

async function holeGesetzestext() {
  const res = await fetch(QUELLE, {
    headers: { "User-Agent": "Mozilla/5.0 (NebenkostenRadar Steuerrecht-Monitor)" },
  });
  if (!res.ok) throw new Error(`Gesetzestext nicht abrufbar (HTTP ${res.status})`);
  const html = await res.text();
  // Tags entfernen, Entities auflösen, Leerraum vereinheitlichen. Bewusst kein
  // HTML-Parser als Abhängigkeit: Der Text ist simpel aufgebaut und das Skript
  // soll ohne npm-Installation laufen.
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&auml;/g, "ä").replace(/&ouml;/g, "ö")
    .replace(/&uuml;/g, "ü").replace(/&szlig;/g, "ß").replace(/&amp;/g, "&")
    .replace(/&sect;/g, "§")
    .replace(/\s+/g, " ")
    .trim();
}

// Schneidet einen Absatz heraus, z.B. "(2) ... " bis zum Beginn von "(3)".
function absatz(text, nummer) {
  const start = text.indexOf(`(${nummer})`);
  if (start === -1) return "";
  const naechster = text.indexOf(`(${nummer + 1})`, start);
  return text.slice(start, naechster === -1 ? start + 2000 : naechster).trim();
}

// "4 000" oder "4.000" -> 4000
function zuZahl(s) {
  return parseInt(String(s).replace(/[.\s]/g, ""), 10);
}

function pruefe(text) {
  const befunde = [];
  const abs2 = absatz(text, 2);
  const abs3 = absatz(text, 3);

  if (!abs2 || !abs3) {
    befunde.push({
      art: "struktur",
      text: "Die Absätze 2 und 3 waren im abgerufenen Text nicht auffindbar. Entweder wurde die Seite umgebaut oder das Gesetz neu gegliedert. In beiden Fällen muss jemand draufschauen, bevor die Zahlen im Produkt weiter verwendet werden.",
    });
    return { befunde, abs2, abs3 };
  }

  // Prozentsatz. Beide Absätze nennen ihn, geprüft werden beide.
  for (const [nr, abs] of [[2, abs2], [3, abs3]]) {
    const m = /um (\d+) Prozent/.exec(abs);
    const erwartet = Math.round(BUSINESS.STEUER_35A.SATZ * 100);
    if (!m) {
      befunde.push({ art: "prozent", text: `§ 35a Abs. ${nr}: Prozentsatz nicht gefunden. Wortlaut geändert?` });
    } else if (parseInt(m[1], 10) !== erwartet) {
      befunde.push({ art: "prozent", text: `§ 35a Abs. ${nr}: Gesetz nennt ${m[1]} %, im Produkt stehen ${erwartet} %.` });
    }
  }

  // Höchstbeträge. Die Satzstellung ist in den beiden Absätzen verschieden:
  //   Abs. 2: "um 20 Prozent, höchstens 4 000 Euro, der Aufwendungen"
  //   Abs. 3: "um 20 Prozent der Aufwendungen ..., höchstens jedoch um 1 200 Euro"
  // Deshalb ein Muster, das beide Formen erfasst.
  const hoechstMuster = /höchstens(?: jedoch)?(?: um)? ([\d][\d.\s]*) Euro/;
  const paare = [
    [2, abs2, BUSINESS.STEUER_35A.HOECHST_DIENSTLEISTUNG, "haushaltsnahe Dienstleistungen"],
    [3, abs3, BUSINESS.STEUER_35A.HOECHST_HANDWERKER, "Handwerkerleistungen"],
  ];
  for (const [nr, abs, erwartet, bezeichnung] of paare) {
    const m = hoechstMuster.exec(abs);
    if (!m) {
      befunde.push({ art: "hoechstbetrag", text: `§ 35a Abs. ${nr} (${bezeichnung}): Höchstbetrag nicht gefunden. Wortlaut geändert?` });
      continue;
    }
    const gefunden = zuZahl(m[1]);
    if (gefunden !== erwartet) {
      befunde.push({
        art: "hoechstbetrag",
        text: `§ 35a Abs. ${nr} (${bezeichnung}): Gesetz nennt ${gefunden.toLocaleString("de-DE")} Euro, im Produkt stehen ${erwartet.toLocaleString("de-DE")} Euro.`,
      });
    }
  }
  return { befunde, abs2, abs3 };
}

async function meldeIssue(titel, body) {
  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    console.log("\nHINWEIS: GITHUB_TOKEN/GITHUB_REPO nicht gesetzt, Meldung nur in der Konsole:\n");
    console.log(titel + "\n");
    console.log(body);
    return;
  }
  const res = await fetch("https://api.github.com/repos/" + GITHUB_REPO + "/issues", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + GITHUB_TOKEN,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title: titel, body, labels: ["steuerrecht", "manuelle-pruefung-noetig"] }),
  });
  if (!res.ok) throw new Error("GitHub Issue konnte nicht erstellt werden: " + (await res.text()));
  console.log("GitHub Issue erstellt.");
}

async function main() {
  const text = await holeGesetzestext();
  const { befunde, abs2, abs3 } = pruefe(text);

  // Wortlaut-Vergleich über einen Fingerabdruck der beiden Absätze.
  const fingerabdruck = createHash("sha256").update(abs2 + "|" + abs3).digest("hex").slice(0, 16);
  const stand = existsSync(STAND_DATEI) ? JSON.parse(readFileSync(STAND_DATEI, "utf8")) : null;
  const wortlautGeaendert = stand && stand.fingerabdruck && stand.fingerabdruck !== fingerabdruck;

  if (befunde.length === 0 && !wortlautGeaendert) {
    console.log("§ 35a EStG unverändert.");
    console.log(`  Satz: ${Math.round(BUSINESS.STEUER_35A.SATZ * 100)} %`);
    console.log(`  Höchstbetrag Dienstleistungen: ${BUSINESS.STEUER_35A.HOECHST_DIENSTLEISTUNG.toLocaleString("de-DE")} Euro`);
    console.log(`  Höchstbetrag Handwerker:       ${BUSINESS.STEUER_35A.HOECHST_HANDWERKER.toLocaleString("de-DE")} Euro`);
    if (!stand) {
      writeFileSync(STAND_DATEI, JSON.stringify({ fingerabdruck, geprueft: new Date().toISOString().slice(0, 10) }, null, 2) + "\n");
      console.log("Erster Lauf: Wortlaut-Fingerabdruck angelegt.");
    }
    return;
  }

  const zeilen = [];
  zeilen.push("Der Steuerrecht-Monitor hat eine Änderung an **§ 35a EStG** festgestellt.\n");
  zeilen.push("Quelle: " + QUELLE + "\n");
  if (befunde.length) {
    zeilen.push("## Abweichende Werte\n");
    befunde.forEach(b => zeilen.push("- " + b.text));
    zeilen.push("");
  }
  if (wortlautGeaendert) {
    zeilen.push("## Wortlaut geändert\n");
    zeilen.push("Der Text der Absätze 2 und 3 weicht vom zuletzt geprüften Stand ab, auch wenn die Zahlen gleich geblieben sein sollten.");
    zeilen.push("Das kann bedeuten, dass der Kreis der begünstigten Leistungen neu gefasst wurde.\n");
  }
  zeilen.push("## Was zu tun ist\n");
  zeilen.push("1. Den Gesetzestext an der Quelle oben lesen und die Änderung einordnen.");
  zeilen.push("2. Bei geänderten Zahlen: `src/config/business.js`, Abschnitt `STEUER_35A`, anpassen. Die PDF-Seite zieht ihre Werte von dort, es gibt keine zweite Stelle.");
  zeilen.push("3. Bei geändertem Wortlaut zusätzlich prüfen, ob die Zuordnung der Posten noch stimmt: `src/lib/analyse.js`, die Listen `STEUER_DIENSTLEISTUNG`, `STEUER_HANDWERKER` und `STEUER_NICHT`.");
  zeilen.push("4. `GEPRUEFT_AM` in `business.js` aktualisieren.");
  zeilen.push("5. `scripts/steuerrecht-stand.json` löschen, damit beim nächsten Lauf ein neuer Fingerabdruck angelegt wird.");
  zeilen.push("6. `npm run check` und `npm run probedruck` laufen lassen.\n");
  zeilen.push("Dieses Skript ändert bewusst nichts von selbst. Die Zahlen landen in einem Dokument, mit dem Kunden gegenüber dem Finanzamt auftreten.");

  await meldeIssue("§ 35a EStG hat sich geändert, Steuerseite prüfen", zeilen.join("\n"));
  process.exitCode = 1;
}

main().catch(err => {
  console.error("Steuerrecht-Monitor fehlgeschlagen:", err.message);
  process.exitCode = 1;
});
