#!/usr/bin/env node
/**
 * NebenkostenRadar — Richtwerte-Monitor
 *
 * WAS DIESES SKRIPT TUT:
 * Prüft monatlich, ob der Deutsche Mieterbund einen neuen Betriebskostenspiegel
 * veröffentlicht hat, der von den Werten in src/config/business.js (RICHTWERTE)
 * abweicht. Überschreibt NICHTS automatisch — meldet nur eine Abweichung.
 *
 * WARUM KEIN AUTOMATISCHES ÜBERSCHREIBEN:
 * Die Richtwerte fließen direkt in Rückforderungsbeträge ein, die Kunden
 * gegenüber ihrem Vermieter geltend machen. Eine fehlerhafte automatische
 * Änderung hier hätte reale finanzielle/rechtliche Folgen für Kunden — das
 * erfordert menschliche Prüfung vor jeder Übernahme (Stefans Prinzip:
 * 0-Fehler-Toleranz bei Zahlen).
 *
 * WIE ES MELDET:
 * Bei Abweichung wird eine GitHub Issue im Repo erstellt (über die GitHub
 * REST API) mit den alten und neuen Werten im Klartext. Stefan bekommt dann
 * automatisch eine E-Mail-Benachrichtigung von GitHub (Standard-Verhalten
 * bei neuen Issues, sofern "Watch" für das Repo aktiv ist).
 *
 * SETUP:
 *   export GITHUB_TOKEN=ghp_...          (Personal Access Token mit "repo"-Recht)
 *   export GITHUB_REPO=DEIN_USERNAME/NebenkostenRadar
 *   node scripts/richtwerte-monitor.mjs
 *
 * AUTOMATISIERUNG (monatlich, nach Vorbild von rechtsmonitor.yml):
 *   Eigener GitHub-Actions-Workflow mit Cron-Trigger, z.B. am 1. jedes Monats.
 *
 * NEUE MONATE HINZUFÜGEN / QUELLE ÄNDERN (ohne Code-Kenntnisse):
 *   DMB_URL unten anpassen, falls sich die Quelladresse einmal ändert.
 */
import fetch from "node-fetch";
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO; // z.B. "stefan/NebenkostenRadar"
const DMB_URL = "https://mieterbund.de/service/checks-formulare/betriebskosten/betriebskostenspiegel/";
const BUSINESS_PFAD = join(__dirname, "../src/config/business.js");

// ── Aktuell im Code hinterlegten Gesamt-Richtwert + Jahr auslesen ───────────
function leseAktuelleWerte() {
  const inhalt = readFileSync(BUSINESS_PFAD, "utf8");
  const gesamtMatch = inhalt.match(/gesamt:\s*([\d.]+)/);
  const jahrMatch = inhalt.match(/RICHTWERTE_JAHR:\s*"([^"]+)"/);
  return {
    gesamt: gesamtMatch ? parseFloat(gesamtMatch[1]) : null,
    jahr: jahrMatch ? jahrMatch[1] : null,
  };
}

// ── DMB-Seite abrufen und auswerten ────────────────────────────────────────
//
// ERWEITERT 09.09.2026 (siehe CHANGELOG). Vorher wurde ausschließlich der
// Gesamt-Richtwert (2,67 €) plus das Jahr verglichen. Das hatte eine echte
// Lücke: Ändert der DMB die EINZELpositionen — Grundsteuer, Müll, Hausmeister
// usw. —, der Gesamtdurchschnitt bleibt aber zufällig gleich, meldete der
// Monitor nichts. Genau diese Einzelwerte steuern aber die Posten-Bewertung
// im Prüfbericht.
//
// WARUM DIE EINZELWERTE NICHT DIREKT GEPRÜFT WERDEN KÖNNEN:
// Sie stehen auf der DMB-Seite NICHT als Text. Im Fließtext finden sich nur
// drei Zahlen (Gesamt, Heizung/Warmwasser Durchschnitt und Spitze). Alle
// übrigen Positionen existieren ausschließlich in einer Grafik
// ("BKS-2024-Deutschland.jpg") und zwei PDFs. Sie automatisch aus einem Bild
// zu lesen und in business.js zu schreiben, käme nicht in Frage: Ein
// OCR-Lesefehler (0,18 statt 0,13) würde still in jeden Prüfbericht und
// damit in Rückforderungen gegenüber Vermietern wandern.
//
// DIE LÖSUNG — auf das Erscheinen einer neuen Ausgabe prüfen statt auf Werte:
// Der DMB legt jede Jahresausgabe als Datei nach dem stabilen Muster
// "BKS-<Jahr>-Deutschland.jpg" ab (2024er Ausgabe: BKS-2024-Deutschland.jpg,
// hochgeladen unter /app/uploads/2025/12/). Taucht dort ein höheres Jahr auf
// als das in business.js hinterlegte, ist eine neue Ausgabe erschienen —
// unabhängig davon, ob sich der Gesamtwert geändert hat. Das ist das
// eigentliche Ereignis, auf das es ankommt.
async function leseDMBWerte() {
  const res = await fetch(DMB_URL, { headers: { "User-Agent": "Mozilla/5.0 (NebenkostenRadar Richtwerte-Monitor)" } });
  if (!res.ok) throw new Error("DMB-Seite nicht erreichbar (HTTP " + res.status + ")");
  const html = await res.text();

  // Muster wie "2,67 Euro/qm/Monat" bzw. "Abrechnungsjahr 2024" im Fließtext
  const betragMatch = html.match(/(\d,\d{2})\s*Euro\/qm\/Monat/);
  const jahrMatch = html.match(/Abrechnungsjahr[e]?\s*(\d{4})/);

  if (!betragMatch || !jahrMatch) {
    throw new Error("Konnte aktuellen Wert nicht aus der DMB-Seite extrahieren — Seitenstruktur hat sich vermutlich geändert, bitte manuell prüfen: " + DMB_URL);
  }

  // Alle "BKS-<Jahr>-Deutschland"-Dateien einsammeln und das höchste Jahr
  // nehmen. Bewusst tolerant geschrieben (Bindestrich oder Unterstrich,
  // Gross-/Kleinschreibung egal), weil ältere Ausgaben abweichend benannt
  // sind (z.B. "BKS_AJ2022_Deutschland.jpg"). Findet das Muster gar nichts,
  // ist das KEIN Fehler — dann greift weiterhin die Werteprüfung allein.
  const dateiJahre = [...html.matchAll(/BKS[-_](?:AJ)?(\d{4})[-_]Deutschland/gi)]
    .map(m => parseInt(m[1], 10))
    .filter(j => j >= 2000 && j <= 2100);
  const neuestesDateiJahr = dateiJahre.length ? Math.max(...dateiJahre) : null;

  // Zeitpunkt der letzten Seitenänderung — nur zur Information im Issue,
  // NICHT als Auslöser (die Seite ändert sich auch aus anderen Gründen).
  const geaendertMatch = html.match(/article:modified_time"\s+content="([^"]+)"/);

  return {
    gesamt: parseFloat(betragMatch[1].replace(",", ".")),
    jahr: jahrMatch[1],
    dateiJahr: neuestesDateiJahr,
    seiteGeaendert: geaendertMatch ? geaendertMatch[1] : null,
  };
}

// ── GitHub Issue erstellen, um Stefan auf die Abweichung hinzuweisen ────────
async function meldeAbweichung(alt, neu, gruende = []) {
  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    console.log("\nHINWEIS: GITHUB_TOKEN/GITHUB_REPO nicht gesetzt — Meldung nur in der Konsole:");
    console.log("Alter Wert (Code):", alt);
    console.log("Neuer Wert (DMB-Website):", neu);
    return;
  }
  const titel = "Neue DMB-Richtwerte verfügbar: " + (neu.dateiJahr ?? neu.jahr) + " (aktuell im Code: " + alt.jahr + ")";
  const body = [
    "Der Richtwerte-Monitor hat festgestellt, dass der im Code hinterlegte DMB-Betriebskostenspiegel nicht mehr dem aktuellen Stand entspricht.",
    "",
    "**Ausgelöst durch:**",
    ...gruende.map(g => "- " + g),
    "",
    "**Aktuell im Code (`src/config/business.js`):** " + alt.gesamt + " €/m²/Monat, Jahr " + alt.jahr,
    "**Auf der DMB-Website gefunden:** " + neu.gesamt + " €/m²/Monat, Abrechnungsjahr laut Text " + neu.jahr +
      (neu.dateiJahr != null ? ", neueste Jahresgrafik " + neu.dateiJahr : ""),
    neu.seiteGeaendert ? "**Seite zuletzt geändert:** " + neu.seiteGeaendert : "",
    "",
    "### Was jetzt zu tun ist",
    "",
    "Die Einzelwerte stehen auf der DMB-Seite **nicht als Text**, sondern nur in der Jahresgrafik und den verlinkten PDFs. Sie müssen deshalb von Hand abgelesen und übertragen werden — bewusst so, weil ein Lesefehler direkt in Rückforderungsbeträge gegenüber Vermietern einfließen würde.",
    "",
    "1. Grafik bzw. PDF \"Alle Betriebskostenarten im Überblick\" auf " + DMB_URL + " öffnen",
    "2. **ALLE** Werte in `RICHTWERTE` (`src/config/business.js`) übertragen — nicht nur den Gesamtwert, die Einzelpositionen ändern sich meist mit",
    "3. `RICHTWERTE_JAHR` auf das neue Abrechnungsjahr setzen",
    "4. `node scripts/pdf-konsistenz-test.mjs` laufen lassen",
    "5. Hochladen — die Ratgeber-Tabelle im Betriebskostenspiegel-Artikel zieht automatisch mit (Blocktyp `richtwerte`, speist sich aus derselben Datei)",
    "",
    "Dieses Issue wurde automatisch vom Richtwerte-Monitor erstellt (`scripts/richtwerte-monitor.mjs`). Es wird NICHTS automatisch geändert.",
  ].filter(z => z !== "").join("\n");

  const res = await fetch("https://api.github.com/repos/" + GITHUB_REPO + "/issues", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + GITHUB_TOKEN,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title: titel, body, labels: ["richtwerte", "manuelle-pruefung-noetig"] }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error("GitHub Issue konnte nicht erstellt werden: " + err);
  }
  console.log("GitHub Issue erstellt: Abweichung gemeldet.");
}

async function main() {
  console.log("NebenkostenRadar Richtwerte-Monitor\n" + "=".repeat(40));
  const alt = leseAktuelleWerte();
  console.log("Aktuell im Code:", alt);

  let neu;
  try {
    neu = await leseDMBWerte();
  } catch (e) {
    console.error("Fehler beim Abrufen der DMB-Seite:", e.message);
    process.exit(1);
  }
  console.log("Auf der DMB-Website:", neu);

  // FIX 13.08.2026 (echter Fehlalarm in Issue #1 gefunden, siehe GitHub):
  // RICHTWERTE_JAHR in business.js ist ein Anzeigetext für die Website, z.B.
  // "2024 (veröffentlicht 12/2025)", kein reines Jahr. Der reine
  // String-Vergleich gegen die DMB-Seite (liefert nur "2024") schlug deshalb
  // IMMER fehl, obwohl der Betrag exakt übereinstimmte (2.67 = 2.67) und das
  // Jahr inhaltlich dasselbe war — hätte jeden Monat neu einen Fehlalarm
  // erzeugt. Business.js absichtlich nicht angefasst (der Anzeigetext wird
  // vermutlich auf der Website gebraucht) — stattdessen wird hier nur die
  // vierstellige Jahreszahl aus dem Anzeigetext herausgezogen, bevor
  // verglichen wird.
  const altJahrZahl = (alt.jahr || "").match(/\d{4}/)?.[0] || alt.jahr;

  // Drei unabhängige Auslöser (09.09.2026) — es genügt EINER:
  //   1. Gesamtwert weicht ab
  //   2. Im Fließtext genanntes Abrechnungsjahr weicht ab
  //   3. Es liegt eine Grafik zu einem NEUEREN Abrechnungsjahr vor als das
  //      im Code hinterlegte (siehe ausführliche Begründung bei leseDMBWerte)
  const gesamtAbweichung = alt.gesamt !== neu.gesamt;
  const jahrAbweichung = altJahrZahl !== neu.jahr;
  const neuereAusgabe = neu.dateiJahr != null && parseInt(altJahrZahl, 10) < neu.dateiJahr;

  console.log("Neueste Ausgabe laut Dateinamen:", neu.dateiJahr ?? "(Muster nicht gefunden)");

  if (!gesamtAbweichung && !jahrAbweichung && !neuereAusgabe) {
    console.log("\nKeine Abweichung — Richtwerte sind aktuell.");
    return;
  }

  const gruende = [
    gesamtAbweichung ? "Gesamtwert weicht ab (" + alt.gesamt + " → " + neu.gesamt + ")" : null,
    jahrAbweichung ? "Abrechnungsjahr im Text weicht ab (" + altJahrZahl + " → " + neu.jahr + ")" : null,
    neuereAusgabe ? "Neuere Jahresausgabe als Grafik vorhanden (Code: " + altJahrZahl + ", DMB: " + neu.dateiJahr + ")" : null,
  ].filter(Boolean);

  console.log("\nAbweichung gefunden!\n- " + gruende.join("\n- "));
  await meldeAbweichung(alt, neu, gruende);
}

main();
