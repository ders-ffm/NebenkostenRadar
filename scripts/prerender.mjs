#!/usr/bin/env node
/**
 * NebenkostenRadar — Vorrendern der Ratgeber-Artikel
 *
 * WARUM (13.08.2026, siehe planung/businessplan-umsatzprognose.md):
 * Die App ist eine reine Client-seitig gerenderte React-SPA. Titel,
 * Beschreibung und Inhalt jedes Artikels entstehen bisher erst per
 * JavaScript im Browser (App.jsx-useEffect, Artikel.jsx). Google sieht
 * beim ersten, schnellen Crawl-Durchlauf davon nichts — bestätigt durch
 * echte Google Search Console-Daten: mehrere Artikel-URLs mit dem Fehler
 * "Alternative Seite mit richtigem kanonischen Tag" (nicht gestartet).
 *
 * WAS DIESES SCRIPT TUT:
 * Läuft NACH "vite build" (siehe package.json, Skript "postbuild"). Liest
 * dist/index.html als Vorlage und erzeugt für jeden Artikel aus
 * src/artikel.js eine eigene statische Datei unter
 * dist/ratgeber/<id>/index.html — mit korrektem <title>, <meta
 * description>, OG-Tags, kanonischem Link, einem artikelspezifischen
 * Article-JSON-LD-Block UND dem sichtbaren Artikeltext direkt im HTML
 * (nicht nur Meta-Daten) — Google sieht damit auch ohne JavaScript-
 * Ausführung den echten Inhalt.
 *
 * Sobald der echte Nutzer die Seite im Browser lädt, übernimmt React
 * (main.jsx, createRoot) ganz normal und ersetzt den vorgerenderten
 * Inhalt durch die interaktive Version — kein Hydration-Mechanismus
 * nötig, bewusst einfach gehalten (kein Framework-Wechsel).
 *
 * ZUSÄTZLICH erzeugt: dist/ratgeber/index.html (Übersichtsseite, nur
 * Meta-Daten, kein Volltext-Snapshot — geringerer SEO-Wert, mehr Aufwand
 * für wenig Zusatznutzen bei der Artikelliste).
 *
 * EINBINDUNG: package.json → "build": "vite build && node scripts/prerender.mjs"
 * (bewusst direkt verkettet, nicht über npms "postbuild"-Konvention — die
 * greift nur zuverlässig, wenn exakt "npm run build" aufgerufen wird, was
 * sich von hier aus nicht in Vercels Projekteinstellungen verifizieren
 * ließ). Läuft dadurch bei jedem Vercel-Deploy automatisch mit, kein
 * manueller Schritt.
 *
 * NEUE ARTIKEL: brauchen NICHTS extra — beim nächsten Deploy nimmt dieses
 * Script automatisch jeden Eintrag aus src/artikel.js mit.
 *
 * GETESTET 13.08.2026: Mit einer lokalen 2-Artikel-Testdatei (alle
 * Block-Typen: intro, h2, text, liste, hinweis, verweis, cta) gegen einen
 * echten "vite build" laufen lassen — Titel/Description/OG/Canonical/
 * JSON-LD wurden korrekt ersetzt, sichtbarer Artikeltext korrekt escaped
 * im HTML, #root-Attribut blieb erhalten (React kann normal mounten).
 */
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, "dist");
const BASE = "https://nebenkostenradar.com";

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Spiegelt die Block-Typen aus Artikel.jsx (render-Switch) als einfaches,
// serverseitiges HTML — bewusst dieselben Typnamen, damit beide Stellen
// bei einer künftigen Änderung an den Inhalts-Blöcken zusammen im Blick
// bleiben (keine doppelte Datenquelle, nur doppelte Darstellung).
function renderBlock(block, artikelById) {
  switch (block.typ) {
    case "intro":
      return `<p>${escapeHtml(block.text)}</p>`;
    case "h2":
      return `<h2>${escapeHtml(block.text)}</h2>`;
    case "text":
      return `<p>${escapeHtml(block.text)}</p>`;
    case "liste":
      return `<ul>${(block.items || []).map(i => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`;
    case "hinweis":
      return `<p><strong>Hinweis:</strong> ${escapeHtml(block.text)}</p>`;
    case "verweis": {
      const ziel = artikelById.get(block.ziel);
      if (!ziel) return "";
      return `<p><a href="/ratgeber/${ziel.id}">${escapeHtml(block.text)}</a></p>`;
    }
    case "cta":
      return `<p>${escapeHtml(block.text)} <a href="/pruefen/wohnung">Kostenlos prüfen →</a></p>`;
    default:
      return "";
  }
}

function buildArticleHtml(template, artikel, artikelById) {
  const url = `${BASE}/ratgeber/${artikel.id}`;
  const title = `${artikel.titel} | NebenkostenRadar Ratgeber`;
  const description = artikel.teaser;

  let html = template
    .replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${escapeHtml(description)}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escapeHtml(title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${escapeHtml(description)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${escapeHtml(title)}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${escapeHtml(description)}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`);

  // Falls eines der obigen Meta-Tags in index.html (noch) nicht existiert,
  // still überspringen statt Fehler zu werfen — Prerendering darf den
  // Build nie zum Absturz bringen, nur bestmöglich verbessern.

  const artikelJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: artikel.titel,
    description: artikel.teaser,
    url,
    image: artikel.bild,
  };

  const inhaltHtml = (artikel.inhalt || []).map(b => renderBlock(b, artikelById)).join("\n");

  const sichtbarerInhalt = `
    <article>
      <p><a href="/ratgeber">← Ratgeber</a></p>
      <p>${escapeHtml(artikel.kategorie)} · ${escapeHtml(artikel.datum)} · ${escapeHtml(artikel.lesezeit)}</p>
      <h1>${escapeHtml(artikel.titel)}</h1>
      ${inhaltHtml}
    </article>
    <script type="application/ld+json">${JSON.stringify(artikelJsonLd)}</script>
  `;

  // Sichtbaren Inhalt in #root einfügen — React (main.jsx, createRoot)
  // ersetzt das beim Laden im Browser vollständig durch die interaktive
  // Version. Kein Hydration-Mismatch möglich, da createRoot (nicht
  // hydrateRoot) verwendet wird und den Inhalt komplett neu aufbaut.
  html = html.replace('<div id="root"></div>', `<div id="root">${sichtbarerInhalt}</div>`);

  return html;
}

function buildRatgeberIndexHtml(template, artikelListe) {
  const url = `${BASE}/ratgeber`;
  const title = "Ratgeber | NebenkostenRadar";
  const description = "Verständliche Artikel rund um Nebenkostenabrechnung, Betriebskosten und Mieterrechte.";
  let html = template
    .replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${escapeHtml(description)}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escapeHtml(title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${escapeHtml(description)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`);

  const liste = artikelListe
    .map(a => `<li><a href="/ratgeber/${a.id}">${escapeHtml(a.titel)}</a></li>`)
    .join("\n");
  html = html.replace('<div id="root"></div>', `<div id="root"><h1>Ratgeber</h1><ul>${liste}</ul></div>`);
  return html;
}

async function main() {
  const template = readFileSync(join(DIST, "index.html"), "utf8");
  const artikelModul = await import(join(ROOT, "src/artikel.js") + "?t=" + Date.now());
  const ARTIKEL = artikelModul.ARTIKEL;
  const artikelById = new Map(ARTIKEL.map(a => [a.id, a]));

  console.log(`Vorrendern: ${ARTIKEL.length} Artikel gefunden.`);

  for (const artikel of ARTIKEL) {
    const outDir = join(DIST, "ratgeber", artikel.id);
    mkdirSync(outDir, { recursive: true });
    const html = buildArticleHtml(template, artikel, artikelById);
    writeFileSync(join(outDir, "index.html"), html);
    console.log(`  ✓ /ratgeber/${artikel.id}`);
  }

  const ratgeberIndexDir = join(DIST, "ratgeber");
  mkdirSync(ratgeberIndexDir, { recursive: true });
  writeFileSync(join(ratgeberIndexDir, "index.html"), buildRatgeberIndexHtml(template, ARTIKEL));
  console.log(`  ✓ /ratgeber (Übersicht)`);

  console.log("Vorrendern abgeschlossen.");
}

main().catch(e => {
  // Bewusst NICHT den ganzen Build abbrechen (process.exit(1)) — eine
  // fehlerhafte Vorrender-Ausgabe darf niemals die eigentliche App-
  // Auslieferung verhindern. Nur laut loggen, damit es im Vercel-Build-Log
  // auffällt.
  console.error("Vorrendern fehlgeschlagen (Build läuft trotzdem weiter):", e.message);
});
