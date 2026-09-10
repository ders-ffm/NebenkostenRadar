#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// seo-check.mjs — Prüft den fertigen Build auf technische SEO-Fehler.
//
// AUSFÜHREN:  npm run build  &&  node scripts/seo-check.mjs
//
// WARUM ES DIESES SKRIPT GIBT:
// Beim Live-Check am 10.09.2026 kamen sechs Fehler zusammen, die alle
// unsichtbar waren — man sieht sie der Website im Browser nicht an, nur im
// Quelltext:
//   1. /ueber-uns trug das Canonical der Startseite. Die Seite stand in der
//      Sitemap und hätte sich damit selbst wegkanonisiert.
//   2. Startseite und /ueber-uns lieferten null Zeichen Text im Quelltext.
//   3. Auf /faq und /ratgeber stand im twitter:title der Startseitentitel.
//   4. Es gab überhaupt kein og:image — geteilte Links zeigten leere Vorschauen.
//   5. Alle 22 Artikeltitel waren zu lang für die Suchergebnisse.
//   6. Ein useEffect in App.jsx hat die vorgerenderten Titel im Browser
//      wieder überschrieben.
//
// Solche Fehler entstehen leise und bleiben lange unentdeckt. Dieses Skript
// findet sie in wenigen Sekunden. Es ist bewusst nach demselben Muster
// gebaut wie scripts/pdf-konsistenz-test.mjs und scripts/eingaben-test.mjs:
// Regeln oben, Ausgabe als Liste, Rückgabewert 1 bei Verstößen.
//
// EINE REGEL ÄNDERN: unten in REGELN anpassen. Wer eine Seite bewusst
// anders haben will, ergänzt sie in AUSNAHMEN mit Begründung.
// ─────────────────────────────────────────────────────────────────────────
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DIST = join(ROOT, "dist");
const BASE = "https://nebenkostenradar.com";

// Google zeigt rund 60 Zeichen Titel und rund 160 Zeichen Beschreibung.
// Beim Titel wird die Grenze hart geprüft — ein abgeschnittener Titel kostet
// Klicks. Bei der Beschreibung ist die Obergrenze bewusst großzügig: Ein
// vollständiger Gedanke, der in der Anzeige gekürzt wird, ist besser als ein
// Fragment. Die Untergrenze ist dagegen wichtig — eine 30 Zeichen kurze
// Beschreibung sagt nichts über die Seite aus (genau diesen Fall hat dieses
// Skript bei seinem ersten Lauf gefunden).
const REGELN = {
  titelMax: 60,
  beschreibungMax: 230,
  beschreibungMin: 90,
  textMin: 250,        // sichtbarer Text im Quelltext
  textMinRechtstexte: 60, // Rechtstexte liefern bewusst nur einen Stub
};

// Seiten, die zusätzlich zur Sitemap geprüft werden. Sie sollen nicht
// indexiert werden müssen, brauchen aber ein eigenes Canonical.
const ZUSATZSEITEN = ["/impressum", "/agb", "/datenschutz"];
const RECHTSTEXTE = new Set(ZUSATZSEITEN);

function lies(pfad) {
  const datei = pfad === "/" ? join(DIST, "index.html") : join(DIST, pfad.slice(1), "index.html");
  return existsSync(datei) ? readFileSync(datei, "utf8") : null;
}

function hole(html, muster) {
  const treffer = html.match(muster);
  return treffer ? treffer[1] : null;
}

function sichtbarerText(html) {
  const start = html.indexOf('<div id="root">');
  if (start === -1) return "";
  const ende = html.indexOf("</body>", start);
  return html
    .slice(start, ende === -1 ? undefined : ende)
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function main() {
  if (!existsSync(join(DIST, "sitemap.xml"))) {
    console.error("dist/sitemap.xml fehlt — bitte zuerst 'npm run build' ausführen.");
    process.exit(1);
  }

  const sitemap = readFileSync(join(DIST, "sitemap.xml"), "utf8");
  const seiten = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].replace(BASE, "") || "/");
  const alle = [...seiten, ...ZUSATZSEITEN];

  const verstoesse = [];
  const titel = new Map();
  const beschreibungen = new Map();

  for (const pfad of alle) {
    const html = lies(pfad);
    if (html === null) { verstoesse.push(`${pfad}: Datei fehlt im Build`); continue; }

    const t = hole(html, /<title>(.*?)<\/title>/s) || "";
    const d = hole(html, /<meta name="description" content="([^"]*)"/) || "";
    const canonical = (hole(html, /<link rel="canonical" href="([^"]*)"/) || "").replace(BASE, "") || "/";
    const ogUrl = (hole(html, /<meta property="og:url" content="([^"]*)"/) || "").replace(BASE, "") || "/";
    const ogTitel = hole(html, /<meta property="og:title" content="([^"]*)"/) || "";
    const twTitel = hole(html, /<meta name="twitter:title" content="([^"]*)"/) || "";
    const ogBild = hole(html, /<meta property="og:image" content="([^"]*)"/) || "";
    const text = sichtbarerText(html);
    const textGrenze = RECHTSTEXTE.has(pfad) ? REGELN.textMinRechtstexte : REGELN.textMin;

    if (canonical !== pfad) verstoesse.push(`${pfad}: Canonical zeigt auf "${canonical}"`);
    if (ogUrl !== pfad) verstoesse.push(`${pfad}: og:url zeigt auf "${ogUrl}"`);
    if (!t) verstoesse.push(`${pfad}: kein <title>`);
    if (t.length > REGELN.titelMax) verstoesse.push(`${pfad}: Titel ${t.length} Zeichen (max ${REGELN.titelMax})`);
    if (!d) verstoesse.push(`${pfad}: keine description`);
    if (d && d.length > REGELN.beschreibungMax) verstoesse.push(`${pfad}: Beschreibung ${d.length} Zeichen (max ${REGELN.beschreibungMax})`);
    if (d && d.length < REGELN.beschreibungMin) verstoesse.push(`${pfad}: Beschreibung nur ${d.length} Zeichen`);
    if (ogTitel !== t) verstoesse.push(`${pfad}: og:title weicht vom <title> ab`);
    if (twTitel !== t) verstoesse.push(`${pfad}: twitter:title weicht vom <title> ab`);
    if (!ogBild) verstoesse.push(`${pfad}: kein og:image`);
    if (text.length < textGrenze) verstoesse.push(`${pfad}: nur ${text.length} Zeichen Text im Quelltext (min ${textGrenze})`);

    if (!RECHTSTEXTE.has(pfad)) {
      if (titel.has(t)) verstoesse.push(`${pfad}: gleicher Titel wie ${titel.get(t)}`);
      else titel.set(t, pfad);
      if (beschreibungen.has(d)) verstoesse.push(`${pfad}: gleiche Beschreibung wie ${beschreibungen.get(d)}`);
      else beschreibungen.set(d, pfad);
    }
  }

  // Das Vorschaubild muss auch tatsächlich ausgeliefert werden.
  if (!existsSync(join(DIST, "og-bild.png"))) verstoesse.push("dist/og-bild.png fehlt — og:image zeigt ins Leere");

  // FAQPage-Markup gehört genau auf /faq und nirgendwo sonst: strukturierte
  // Daten ohne passenden sichtbaren Inhalt wertet Google ab.
  const faqHtml = lies("/faq");
  if (!faqHtml || !faqHtml.includes("FAQPage")) verstoesse.push("/faq: FAQPage-Markup fehlt");
  for (const pfad of alle) {
    if (pfad === "/faq") continue;
    const html = lies(pfad);
    if (html && html.includes("FAQPage")) verstoesse.push(`${pfad}: FAQPage-Markup gehört hier nicht hin`);
  }

  const strich = "─".repeat(64);
  console.log(strich);
  console.log(`Seiten geprüft: ${alle.length} · Verstöße: ${verstoesse.length}`);
  console.log(strich);
  if (verstoesse.length === 0) {
    console.log("✓ Keine technischen SEO-Fehler gefunden.");
    process.exit(0);
  }
  verstoesse.forEach(v => console.log("  ✗ " + v));
  process.exit(1);
}

main();
