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
import { BUSINESS } from "../src/config/business.js";

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

async function main() {
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

  // ── Größe des Startbundles ──────────────────────────────────────────────
  // BEFUND 11.09.2026: Beim Aufruf der Seite blitzte kurz der ungestaltete
  // Text auf. Ursache war ein 1,72 MB großes Startbundle — React brauchte zu
  // lange zum Starten, und solange war der vorgerenderte Rohtext sichtbar.
  // Der Grund für die Größe: @react-pdf/renderer lag im Startbundle, obwohl
  // es nur nach dem Kauf gebraucht wird. Nach dem Auslagern: 428 kB.
  //
  // Diese Prüfung verhindert, dass so etwas unbemerkt zurückkommt. Ein
  // einziger falsch platzierter Import einer schweren Bibliothek genügt,
  // und niemand merkt es — außer an einem Aufblitzen, das man leicht für
  // eine Eigenheit des Browsers hält.
  //
  // GRENZE ANHEBEN ist erlaubt, aber bitte bewusst: Erst prüfen, welche
  // Bibliothek dazugekommen ist und ob sie wirklich beim ersten Aufruf
  // gebraucht wird. `npm run build` listet die Dateigrößen auf.
  //
  // ZUR HÖHE DER GRENZE (nachjustiert am 11.09.2026):
  // Zuerst stand hier 600 kB — kalibriert auf einen lokalen Build (423 kB).
  // Der Build auf Vercel ist mit denselben Quelldateien aber 638 kB groß,
  // vermutlich weil dort frisch installierte, leicht andere Paketversionen
  // verwendet werden. Die Grenze hätte beim echten Deploy also fälschlich
  // angeschlagen. Sie liegt jetzt bei 900 kB: genug Luft für solche
  // Schwankungen, aber weit unter den 1,7 MB, bei denen das Problem
  // aufgetreten ist. Ein versehentlich eingebundenes @react-pdf/renderer
  // (allein rund 1,3 MB) schlägt damit weiterhin sicher an.
  //
  // Für die Ladezeit zählt ohnehin die übertragene Größe, nicht die
  // entpackte: Live sind es 188 kB (Brotli) gegenüber rund 600 kB vorher.
  // Die Dateigröße wird hier trotzdem geprüft, weil sie ohne Netzwerkzugriff
  // messbar ist und sich proportional verhält.
  const START_BUNDLE_MAX_KB = 900;
  const assetsPfad = join(DIST, "assets");
  if (existsSync(assetsPfad)) {
    const { readdirSync, statSync } = await import("node:fs");
    const startDateien = readdirSync(assetsPfad).filter(n => /^index-.*\.js$/.test(n));
    for (const datei of startDateien) {
      const kb = statSync(join(assetsPfad, datei)).size / 1024;
      if (kb > START_BUNDLE_MAX_KB)
        verstoesse.push(`Startbundle ${datei} ist ${Math.round(kb)} kB groß (Grenze ${START_BUNDLE_MAX_KB} kB) — vermutlich wurde eine schwere Bibliothek versehentlich fest eingebunden`);
    }
    if (startDateien.length === 0) verstoesse.push("Kein Startbundle in dist/assets gefunden");
  }

  // ── Artikelbilder ───────────────────────────────────────────────────────
  // Vorgabe von Stefan am 10.09.2026: „Bitte dafür sorgen, dass die Bilder
  // immer einzigartig sind und sich nie wiederholen."
  //
  // Der Rechtsmonitor legt monatlich automatisch Artikel an. Seine
  // Duplikatsperre war jahrelang defekt (sie verglich die Unsplash-Foto-ID
  // gegen die Bild-URL, in der diese ID gar nicht vorkommt) — deshalb reicht
  // es nicht, das Skript zu reparieren. Hier wird zusätzlich geprüft, damit
  // ein Duplikat nicht unbemerkt live gehen kann.
  //
  // Verglichen wird der Pfadbestandteil "photo-...", nicht die ganze URL:
  // Sonst würden zwei Varianten desselben Bildes (andere Breite, anderer
  // UTM-Parameter) fälschlich als verschieden durchgehen.
  const artikelPfad = join(ROOT, "src/artikel.js");
  if (existsSync(artikelPfad)) {
    const quelle = readFileSync(artikelPfad, "utf8");
    const bilder = [...quelle.matchAll(/"?bild"?:\s*"([^"]+)"/g)].map(m => m[1]);
    const altTexte = [...quelle.matchAll(/"?bildAlt"?:\s*"([^"]*)"/g)].map(m => m[1]);
    const kennungen = bilder.map(u => (u.match(/photo-[0-9a-zA-Z_-]+/) || [u])[0]);

    const gesehen = new Map();
    kennungen.forEach((k, i) => {
      if (gesehen.has(k)) verstoesse.push(`Artikelbild doppelt verwendet: ${k} (Artikel ${gesehen.get(k) + 1} und ${i + 1})`);
      else gesehen.set(k, i);
    });

    bilder.forEach((u, i) => {
      if (u.includes("premium_photo") || u.includes("plus.unsplash.com"))
        verstoesse.push(`Artikel ${i + 1}: Unsplash+ Premium-Bild — kostenpflichtig, nicht zulässig (${u.slice(0, 60)})`);
    });

    altTexte.forEach((a, i) => {
      if (!a || a.trim().length < 8) verstoesse.push(`Artikel ${i + 1}: bildAlt fehlt oder ist zu kurz`);
    });

    if (bilder.length !== altTexte.length)
      verstoesse.push(`Artikelbilder: ${bilder.length} bild-Einträge, aber ${altTexte.length} bildAlt-Einträge`);
  }

  // FAQPage-Markup gehört genau auf /faq und nirgendwo sonst: strukturierte
  // Daten ohne passenden sichtbaren Inhalt wertet Google ab.
  const faqHtml = lies("/faq");
  if (!faqHtml || !faqHtml.includes("FAQPage")) verstoesse.push("/faq: FAQPage-Markup fehlt");
  for (const pfad of alle) {
    if (pfad === "/faq") continue;
    const html = lies(pfad);
    if (html && html.includes("FAQPage")) verstoesse.push(`${pfad}: FAQPage-Markup gehört hier nicht hin`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // KEINE FREMDEN SERVER OHNE EINWILLIGUNG (13.09.2026)
  //
  // Jeder Server, der beim bloßen Seitenaufruf kontaktiert wird, bekommt die
  // IP-Adresse des Besuchers. Ohne Einwilligung ist das ohne Rechtsgrundlage.
  // Bei Google Fonts hat das LG München I deshalb Schadensersatz zugesprochen
  // (Urteil vom 20.01.2022, Az. 3 O 17493/20), seitdem ist es ein verbreiteter
  // Abmahngrund.
  //
  // Geprüft wird das GEBAUTE HTML, nicht die Quelldatei: Nur was am Ende
  // ausgeliefert wird, zählt. Kommentare werden vorher entfernt, sonst meldet
  // die Prüfung die Dokumentation der Behebung als Fehler (genau das ist beim
  // Einbauen passiert).
  //
  // GA4 steht bewusst NICHT auf dieser Liste: Das Skript wird erst nach
  // Einwilligung nachgeladen (siehe CookieBanner.jsx), im ausgelieferten HTML
  // steht nur der Consent-Stub ohne Abruf.
  {
    const verboten = ["fonts.googleapis.com", "fonts.gstatic.com", "images.unsplash.com", "cdn.jsdelivr.net", "unpkg.com"];
    for (const pfad of ["index.html", "faq/index.html", "ratgeber/index.html"]) {
      const datei = join(DIST, pfad);
      if (!existsSync(datei)) continue;
      const html = readFileSync(datei, "utf8").replace(/<!--[\s\S]*?-->/g, "");
      for (const server of verboten) {
        if (html.includes(server)) {
          verstoesse.push(`${pfad}: Verweis auf ${server} im ausgelieferten HTML. Das überträgt die IP des Besuchers ohne Einwilligung an einen Dritten.`);
        }
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PREISE IM JSON-LD MÜSSEN ZU business.js PASSEN (13.09.2026)
  //
  // index.html ist statisches HTML und kann business.js nicht importieren. Die
  // Preise im Angebots-Markup stehen dort deshalb fest eingetippt. Genau daraus
  // ist schon einmal ein Fehler entstanden: Nach einer Preisänderung standen im
  // Markup monatelang 7,99 und 9,99, während tatsächlich 9,99 und 12,99
  // abgerechnet wurden (korrigiert am 13.08.2026).
  //
  // Falsche Preise im strukturierten Markup sind keine Kleinigkeit: Google
  // zeigt sie in den Suchergebnissen an, und ein dort genannter Preis, der an
  // der Kasse nicht gilt, ist ein Wettbewerbsverstoß.
  //
  // Diese Prüfung vergleicht beide Stellen bei jedem Build.
  {
    const html = readFileSync(join(ROOT, "index.html"), "utf8");
    const gefunden = [...html.matchAll(/"price":\s*"([\d.]+)"/g)].map(m => parseFloat(m[1]));
    const erwartet = [BUSINESS.PREIS_AUSWERTUNG, BUSINESS.PREIS_VOLL];
    if (gefunden.length !== erwartet.length || gefunden.some((p, i) => p !== erwartet[i])) {
      verstoesse.push(
        `index.html: Preise im JSON-LD (${gefunden.join(", ") || "keine"}) weichen von business.js ab (${erwartet.join(", ")}). ` +
        `Google zeigt diese Preise in den Suchergebnissen an.`
      );
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RÜCKFALLSICHERUNG: Erkannte Werte dürfen nie in die vorhandenen gemischt
  // werden (13.09.2026).
  //
  // Stefan hat seine eigene Abrechnung geprüft und zwei Tage später die seiner
  // Mutter. Das Ergebnis war eine Mischung aus beiden: Positionen, die es in
  // der zweiten Abrechnung nicht gab, standen mit den Beträgen der ersten im
  // Bericht. Ursache war ein Einzeiler in Wohnung.jsx:
  //
  //     setWerte(p => ({ ...p, ...data.werte }))
  //
  // Das ist die schwerste Fehlerart in diesem Produkt, weil Daten einer Person
  // im Schreiben einer anderen landen und es niemandem auffällt. Der Einzeiler
  // sieht harmlos aus und würde beim nächsten Umbau leicht wieder entstehen.
  // Deshalb diese Prüfung, die nicht das Verhalten testet, sondern das Muster
  // im Quelltext verbietet.
  {
    // Kommentarzeilen ausnehmen: Der Kommentar bei der Korrektur zitiert den
    // alten Code als Beleg. Ohne diese Filterung meldet die Prüfung genau die
    // Dokumentation der Behebung als Fehler (beim ersten Lauf passiert).
    const quelle = readFileSync(join(ROOT, "src/pages/Wohnung.jsx"), "utf8")
      .split("\n")
      .filter(z => { const s = z.trim(); return !s.startsWith("//") && !s.startsWith("*") && !s.startsWith("/*"); })
      .join("\n");
    const gefaehrlich = /setWerte\s*\(\s*[a-zA-Z]+\s*=>\s*\(\s*\{\s*\.\.\./;
    if (gefaehrlich.test(quelle)) {
      verstoesse.push("Wohnung.jsx: Erkannte Werte werden wieder in die vorhandenen gemischt (setWerte(p => ({ ...p, ... }))). Das vermischt zwei Abrechnungen. Richtig ist setWerte(data.werte).");
    }
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

await main();
