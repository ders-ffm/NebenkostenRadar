#!/usr/bin/env node
/**
 * bilder-lokal-holen.mjs — Holt die Artikelbilder von Unsplash auf den eigenen
 * Server und stellt src/artikel.js auf die lokalen Dateien um.
 *
 * WARUM (13.09.2026, gefunden im totalen Test):
 * Alle 22 Artikelseiten luden ihr Titelbild direkt von images.unsplash.com.
 * Damit geht bei jedem Aufruf die IP-Adresse des Besuchers an Unsplash, ohne
 * Einwilligung und ohne Rechtsgrundlage. Es ist derselbe Sachverhalt, für den
 * das LG München I bei Google Fonts Schadensersatz zugesprochen hat (Urteil
 * vom 20.01.2022, Az. 3 O 17493/20).
 *
 * Nebeneffekt, der unabhängig davon nützt: Die Seiten laden schneller, weil
 * keine Verbindung zu einem fremden Server mehr aufgebaut werden muss, und sie
 * funktionieren auch dann noch, wenn Unsplash eine URL einmal ändert.
 *
 * ZUR LIZENZ: Die Unsplash-Lizenz erlaubt das Herunterladen und Weiterverwenden
 * ausdrücklich, auch gewerblich, auch ohne Namensnennung. Das Selbst-Ausliefern
 * ist also zulässig. Nur die Premium-Bilder ("Unsplash+") sind ausgenommen,
 * die prüft scripts/seo-check.mjs bereits gesondert.
 *
 * AUFRUF (braucht Internet, läuft deshalb auf Stefans Rechner, nicht im Sandkasten):
 *   node scripts/bilder-lokal-holen.mjs
 *
 * WAS ES TUT:
 *   1. Liest alle bild-URLs aus src/artikel.js.
 *   2. Lädt jedes Bild nach public/artikelbilder/<artikel-id>.jpg.
 *   3. Ersetzt die URL in src/artikel.js durch /artikelbilder/<id>.jpg.
 *   4. Lässt alles unangetastet, was schon lokal ist. Mehrfaches Ausführen
 *      ist gefahrlos.
 *
 * Es schreibt src/artikel.js nur, wenn ALLE Bilder erfolgreich geladen wurden.
 * Ein halber Durchlauf würde sonst einen Teil der Artikel auf Dateien zeigen
 * lassen, die es nicht gibt.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ARTIKEL_DATEI = join(ROOT, "src", "artikel.js");
const BILD_ORDNER = join(ROOT, "public", "artikelbilder");

const quelle = readFileSync(ARTIKEL_DATEI, "utf8");

// Jeden Eintrag als Paar aus Artikel-Kennung und Bild-URL einsammeln. Die
// Kennung steht als `id: "..."` vor dem zugehörigen `bild: "..."`.
const eintraege = [];
const idMuster = /id:\s*"([^"]+)"/g;
let letzteId = null, m;
const zeilen = quelle.split("\n");
for (const zeile of zeilen) {
  const id = /id:\s*"([^"]+)"/.exec(zeile);
  if (id) letzteId = id[1];
  const bild = /bild:\s*"(https:\/\/images\.unsplash\.com[^"]+)"/.exec(zeile);
  if (bild && letzteId) eintraege.push({ id: letzteId, url: bild[1] });
}

if (eintraege.length === 0) {
  console.log("Keine Unsplash-Bilder gefunden. Entweder schon erledigt oder nichts zu tun.");
  process.exit(0);
}

console.log(`${eintraege.length} Bilder zu holen.\n`);
mkdirSync(BILD_ORDNER, { recursive: true });

const ersetzungen = [];
let fehler = 0;

for (const { id, url } of eintraege) {
  const ziel = join(BILD_ORDNER, id + ".jpg");
  const oeffentlich = "/artikelbilder/" + id + ".jpg";
  if (existsSync(ziel)) {
    console.log(`  schon da   ${id}`);
    ersetzungen.push({ url, oeffentlich });
    continue;
  }
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (NebenkostenRadar Bildabruf)" } });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const daten = Buffer.from(await res.arrayBuffer());
    if (daten.length < 5000) throw new Error("Datei verdächtig klein (" + daten.length + " Byte)");
    writeFileSync(ziel, daten);
    console.log(`  geladen    ${id}  (${Math.round(daten.length / 1024)} kB)`);
    ersetzungen.push({ url, oeffentlich });
  } catch (err) {
    console.error(`  FEHLER     ${id}: ${err.message}`);
    fehler++;
  }
}

console.log();
if (fehler > 0) {
  console.error(`${fehler} Bild(er) konnten nicht geladen werden. src/artikel.js bleibt unverändert.`);
  console.error("Grund: Ein halber Durchlauf würde Artikel auf Dateien zeigen lassen, die es nicht gibt.");
  console.error("Nochmal starten, bereits geladene Bilder werden übersprungen.");
  process.exitCode = 1;
} else {
  let neu = quelle;
  for (const { url, oeffentlich } of ersetzungen) neu = neu.split(`"${url}"`).join(`"${oeffentlich}"`);
  writeFileSync(ARTIKEL_DATEI, neu);

  // DATENSCHUTZERKLÄRUNG MIT ANPASSEN.
  //
  // Sie sagt bisher, Bilder würden "direkt von Unsplash geladen" und dabei die
  // IP-Adresse übermittelt. Nach diesem Durchlauf stimmt das nicht mehr. Eine
  // Datenschutzerklärung, die mehr Übermittlung behauptet als stattfindet, ist
  // zwar nicht gefährlich, aber falsch, und sie fällt niemandem auf, wenn das
  // Umstellen und das Nachziehen des Textes zwei getrennte Aufgaben sind.
  // Deshalb macht das Skript beides in einem Schritt.
  const DSE = join(ROOT, "src", "pages", "Datenschutz.jsx");
  const dse = readFileSync(DSE, "utf8");
  const altText = "Einige Bilder in den Ratgeber-Artikeln werden direkt von Unsplash geladen, wobei deine IP-Adresse übermittelt wird. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO. Datenschutzerklärung: unsplash.com/privacy";
  const neuText = "Die Bilder in den Ratgeber-Artikeln liegen auf unserem eigenen Server und werden von dort ausgeliefert. Es wird dabei keine Verbindung zu einem fremden Anbieter aufgebaut und keine Daten an Dritte übermittelt. Die Bilder stammen ursprünglich von Unsplash und werden unter der Unsplash-Lizenz verwendet.";
  if (dse.includes(altText)) {
    writeFileSync(DSE, dse.replace(altText, neuText));
    console.log("Datenschutzerklärung, Abschnitt 7, auf die lokale Auslieferung umgestellt.");
  } else {
    console.log("HINWEIS: Abschnitt 7 der Datenschutzerklärung wurde nicht automatisch gefunden.");
    console.log("Bitte dort von Hand nachziehen, dass die Bilder jetzt vom eigenen Server kommen.");
  }
  console.log(`Alle ${ersetzungen.length} Bilder liegen jetzt unter public/artikelbilder/.`);
  console.log("src/artikel.js wurde auf die lokalen Pfade umgestellt.");
  console.log();
  console.log("Zum Abschluss bitte laufen lassen:  npm run check");
  console.log("Danach hochladen: die Ordner src/ und public/");
}
