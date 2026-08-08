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

// ── DMB-Seite abrufen und den aktuell dort genannten Gesamt-Richtwert +
//    das Abrechnungsjahr per einfachem Text-Muster extrahieren ─────────────
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
  return {
    gesamt: parseFloat(betragMatch[1].replace(",", ".")),
    jahr: jahrMatch[1],
  };
}

// ── GitHub Issue erstellen, um Stefan auf die Abweichung hinzuweisen ────────
async function meldeAbweichung(alt, neu) {
  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    console.log("\nHINWEIS: GITHUB_TOKEN/GITHUB_REPO nicht gesetzt — Meldung nur in der Konsole:");
    console.log("Alter Wert (Code):", alt);
    console.log("Neuer Wert (DMB-Website):", neu);
    return;
  }
  const titel = "Neue DMB-Richtwerte verfügbar: " + neu.jahr + " (aktuell im Code: " + alt.jahr + ")";
  const body = [
    "Der Richtwerte-Monitor hat eine Abweichung zwischen dem im Code hinterlegten DMB-Betriebskostenspiegel und der aktuellen DMB-Website festgestellt.",
    "",
    "**Aktuell im Code (`src/config/business.js`):** " + alt.gesamt + " €/m²/Monat, Jahr " + alt.jahr,
    "**Auf der DMB-Website gefunden:** " + neu.gesamt + " €/m²/Monat, Jahr " + neu.jahr,
    "",
    "Bitte manuell prüfen und bei Bedarf ALLE Werte in `RICHTWERTE` aktualisieren (nicht nur den Gesamtwert — auch die Einzelpositionen ändern sich meist mit).",
    "Quelle: " + DMB_URL,
    "",
    "Dieses Issue wurde automatisch vom Richtwerte-Monitor erstellt (`scripts/richtwerte-monitor.mjs`). Es wird NICHTS automatisch geändert.",
  ].join("\n");

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

  if (alt.gesamt === neu.gesamt && alt.jahr === neu.jahr) {
    console.log("\nKeine Abweichung — Richtwerte sind aktuell.");
    return;
  }

  console.log("\nAbweichung gefunden!");
  await meldeAbweichung(alt, neu);
}

main();
