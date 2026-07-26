#!/usr/bin/env node
/**
 * NebenkostenRadar — Automatischer Rechtsmonitor & SEO-Artikel Generator
 *
 * VERWENDUNG MIT CLAUDE CODE:
 *   claude "Führe scripts/rechtsmonitor.mjs aus, prüfe neue Rechtsprechung
 *            und erstelle wenn nötig neue Artikel"
 *
 * WAS DIESES SCRIPT TUT:
 * 1. Crawlt öffentliche Behördenquellen (BGH, Mieterbund) — 100% legal
 * 2. KI schreibt eigene Artikel in eigenen Worten — kein Copy-Paste
 * 3. Holt lizenzfreie Titelbilder von Unsplash API
 * 4. Verlinkt neue Artikel automatisch mit passenden bestehenden Artikeln
 *    (interne Verlinkung, "verweis"-Blöcke — nur vorwärts: neu → alt)
 * 5. Fügt fertige Artikel in src/artikel.js ein
 * 6. Aktualisiert sitemap.xml automatisch
 *
 * SETUP:
 *   npm install node-fetch
 *   export ANTHROPIC_API_KEY=sk-ant-...
 *   export UNSPLASH_ACCESS_KEY=...  (kostenlos: unsplash.com/developers)
 *   node scripts/rechtsmonitor.mjs
 *
 * AUTOMATISIERUNG (monatlich):
 *   GitHub Actions Workflow: .github/workflows/rechtsmonitor.yml
 *
 * FEHLERDIAGNOSE:
 *   Schlägt die KI-Generierung fehl, wird die echte Ursache geloggt
 *   (Stop-Grund + Antwort-Ausschnitt) — im GitHub-Actions-Log beim Schritt
 *   "Rechtsmonitor ausfuehren" sichtbar.
 *
 * VERLAUF:
 *   25.07.2026 — max_tokens 6000→8192 (Abbruch mitten im JSON behoben).
 *   25.07.2026 — system-Prompt ergänzt + robuste JSON-Extraktion, nachdem
 *   die KI bei Websuche-Nutzung entweder das ganze Token-Budget für
 *   Suchschritte verbraucht hat (leere Antwort) oder Fließtext vor dem
 *   JSON geschrieben hat ("Ich werde den Artikel jetzt liefern..."), was
 *   das reine JSON.parse gebrochen hat. max_tokens zusätzlich auf 12000
 *   erhöht als Puffer für Suchschritte.
 *   25.07.2026 — Verweis-Anweisung verschärft: KI hat bei 2 Testartikeln
 *   trotz thematischer Nähe (z.B. "häufigste Fehler" ↔ "Widerspruch")
 *   keinen einzigen verweis-Block gesetzt, weil die alte Formulierung
 *   ("nur wenn wirklich gut passt") zu zurückhaltend war.
 */
import fetch from 'node-fetch';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const UNSPLASH_KEY  = process.env.UNSPLASH_ACCESS_KEY;

// ── Unsplash: lizenzfreies Titelbild ─────────────────────────────────────────
// Unsplash-Lizenz: kostenlos, kommerzielle Nutzung erlaubt
// Pflicht: UTM-Parameter im URL (Attribution)
async function getBild(query) {
  const fallbacks = {
    default:    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
    wohnung:    "https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=800&q=80",
    gericht:    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80",
    dokument:   "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=800&q=80",
    heizung:    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    gebaeude:   "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
  };
  if (!UNSPLASH_KEY) {
    const key = Object.keys(fallbacks).find(k => query.toLowerCase().includes(k)) || 'default';
    return fallbacks[key];
  }
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape&content_filter=high`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } }
    );
    const data = await res.json();
    const foto = data.results?.[0];
    // UTM-Parameter Pflicht laut Unsplash Lizenz
    return foto ? `${foto.urls.regular}&utm_source=nebenkostenradar&utm_medium=referral` : fallbacks.default;
  } catch {
    return fallbacks.default;
  }
}

// ── Bestehende Artikel laden (für interne Verlinkung) ────────────────────────
// Dynamischer Import statt Text-Parsing: robuster, da die Datei eine echte
// ES-Module-Struktur hat und sich Formatierungsänderungen so nicht auf das
// Skript auswirken.
async function ladeBestehendeArtikel() {
  const pfad = join(__dirname, '../src/artikel.js');
  const modul = await import(pfad + '?t=' + Date.now()); // Cache-Bypass bei mehrfachem Lauf im selben Prozess
  return modul.ARTIKEL.map(a => ({ id: a.id, titel: a.titel }));
}

// ── verweis-Blöcke gegen Halluzinationen absichern ───────────────────────────
// Die KI kann sich eine "ziel"-ID ausdenken, die es nicht gibt. Damit sowas
// nie auf der Live-Seite landet (App.jsx würde den Block zwar nur stumm
// ignorieren, aber besser: gar nicht erst einfügen), wird hier gegen die
// echte Liste bestehender IDs geprüft.
function bereinigeVerweise(inhalt, bekannteIds) {
  return inhalt.filter(block => {
    if (block.typ !== "verweis") return true;
    return bekannteIds.includes(block.ziel);
  });
}

// ── JSON robust aus dem Antworttext extrahieren ──────────────────────────────
// Die KI hält sich trotz Anweisung manchmal nicht an "nur JSON" und schreibt
// Fließtext davor/danach (z.B. "Ich werde den Artikel jetzt liefern..." oder
// eine Markdown-Überschrift). Statt den kompletten Text als JSON zu parsen,
// wird hier nur der Bereich zwischen der ersten "{" und der letzten "}"
// extrahiert — das übersteht Kommentare drumherum.
function extrahiereJSON(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) {
    throw new Error('Kein JSON-Objekt im Antworttext gefunden.');
  }
  return text.slice(start, end + 1);
}

// ── KI-Artikel generieren ─────────────────────────────────────────────────────
async function generiereArtikel(thema, bestehendeArtikel) {
  console.log(`  → KI schreibt Artikel über: ${thema}`);

  const artikelListe = bestehendeArtikel.length
    ? bestehendeArtikel.map(a => `- id: "${a.id}" — ${a.titel}`).join('\n')
    : '(noch keine bestehenden Artikel)';

  const system = `Du antwortest ausschließlich mit einem einzigen validen JSON-Objekt.
Keine Einleitung, keine Erklärung, keine Markdown-Überschrift, kein Kommentar vor oder nach dem JSON.
Die allererste Zeichenfolge deiner Antwort muss "{" sein, die letzte muss "}" sein.
Falls du die Websuche nutzt: nutze sie sparsam (maximal 2-3 Anfragen), fasse Ergebnisse knapp zusammen,
und liefere danach sofort und ausschließlich das JSON-Objekt — ohne einen einzigen Satz Kommentar davor.`;

  const prompt = `Du bist Mietrechtsexperte und schreibst für NebenkostenRadar.com.
Schreibe einen SEO-Ratgeber-Artikel zum Thema: "${thema}"
Wichtig:
- Eigene Formulierungen, keine Kopien fremder Texte
- Zielgruppe: Mieter ohne Rechtskenntnisse
- Sachlich, verständlich, vertrauenswürdig
- Aktuelle Rechtslage 2026 berücksichtigen (nutze Websuche sparsam)

Bestehende Artikel auf der Seite (für interne Verlinkung — PFLICHTSCHRITT):
${artikelListe}

Geh die Liste oben Punkt für Punkt durch und prüfe für JEDEN bestehenden Artikel, ob er
auch nur entfernt thematisch mit dem neuen Artikel zusammenhängt (gleiche Kostenart, gleiches
Rechtsgebiet, angrenzendes Thema — nicht nur bei exakter Übereinstimmung). Interne Verlinkung
ist für SEO wichtig, deshalb: verlinke im Zweifel eher zu viel als zu wenig.
Füge für jeden thematisch verwandten bestehenden Artikel einen Block ein:
{"typ":"verweis","ziel":"<exakte id aus der Liste oben>","text":"1 Satz, warum der Leser dort weiterlesen sollte"}
Nutze "ziel" NUR mit einer ID exakt aus der Liste oben. Nur wenn WIRKLICH KEIN einziger
bestehender Artikel einen erkennbaren Bezug hat, lass "verweis"-Blöcke komplett weg.

Antworte NUR mit diesem JSON, keine Backticks, kein einleitender Satz:
{
  "id": "url-slug",
  "titel": "SEO-Titel mit Keyword",
  "teaser": "2 Sätze Teaser",
  "datum": "` + new Date().toLocaleDateString('de-DE', {month:'long',year:'numeric'}) + `",
  "lesezeit": "X Min.",
  "kategorie": "Mietrecht",
  "unsplash_query": "english search term for image",
  "inhalt": [
    {"typ":"intro","text":"..."},
    {"typ":"h2","text":"..."},
    {"typ":"text","text":"..."},
    {"typ":"liste","items":["...","..."]},
    {"typ":"verweis","ziel":"bestehende-artikel-id","text":"..."},
    {"typ":"hinweis","text":"..."},
    {"typ":"cta","text":"Jetzt Abrechnung kostenlos prüfen lassen."}
  ]
}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: 12000,
      system,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await res.json();

  // Echte API-Fehler (falsches Modell, ungültiger Key, Rate-Limit etc.)
  // erzeugen eine {type:"error", error:{...}}-Antwort statt content-Blöcken.
  if (!res.ok || data.type === 'error') {
    throw new Error('Anthropic API Fehler (HTTP ' + res.status + '): ' + JSON.stringify(data.error || data));
  }

  const raw = data.content?.filter(b => b.type === 'text').map(b => b.text).join('') || '';

  if (!raw) {
    throw new Error('Leere Antwort von der KI (stop_reason: ' + data.stop_reason + '). Die KI hat vermutlich das ganze Token-Budget für Websuche-Schritte verbraucht, ohne einen finalen Text zu schreiben.');
  }

  let artikel;
  try {
    artikel = JSON.parse(extrahiereJSON(raw));
  } catch (e) {
    throw new Error('JSON-Parse-Fehler: ' + e.message + ' (stop_reason: ' + data.stop_reason + '). Rohtext (erste 500 Zeichen): ' + raw.slice(0, 500));
  }

  const bekannteIds = bestehendeArtikel.map(a => a.id);
  artikel.inhalt = bereinigeVerweise(artikel.inhalt, bekannteIds);

  return artikel;
}

// ── Artikel in artikel.js einfügen ────────────────────────────────────────────
function fuegeArtikelEin(artikel, bildUrl) {
  // Artikel liegen in eigener Datei — App.jsx bleibt unverändert klein
  let app = readFileSync(join(__dirname, '../src/artikel.js'), 'utf8');
  // Prüfen ob Artikel schon existiert
  if (app.includes(`id: "${artikel.id}"`)) {
    console.log(`  → Artikel existiert bereits: ${artikel.id}`);
    return false;
  }
  const artikelJS = `
    {
      id: "${artikel.id}",
      titel: "${artikel.titel.replace(/"/g, '\\"')}",
      teaser: "${artikel.teaser.replace(/"/g, '\\"')}",
      datum: "${artikel.datum}",
      lesezeit: "${artikel.lesezeit}",
      bild: "${bildUrl}",
      bildAlt: "${artikel.titel.replace(/"/g, '\\"')}",
      kategorie: "${artikel.kategorie}",
      keywords: [],
      inhalt: ${JSON.stringify(artikel.inhalt, null, 8)},
    },`;
  // Am Anfang des Arrays einfügen (neueste zuerst) — alte Artikel bleiben für SEO erhalten
  app = app.replace('const ARTIKEL = [', `const ARTIKEL = [${artikelJS}`);
  writeFileSync(join(__dirname, '../src/artikel.js'), app);
  return true;
}

// ── Sitemap aktualisieren ─────────────────────────────────────────────────────
function aktualisiereSitemap(artikelId) {
  const pfad = join(__dirname, '../public/sitemap.xml');
  if (!existsSync(pfad)) return;
  let sitemap = readFileSync(pfad, 'utf8');
  if (sitemap.includes(artikelId)) return;
  const neuerEintrag = `  <url>
    <loc>https://nebenkostenradar.com/ratgeber/${artikelId}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>
</urlset>`;
  writeFileSync(pfad, sitemap.replace('</urlset>', neuerEintrag));
}

// ── Hauptprogramm ─────────────────────────────────────────────────────────────
async function main() {
  console.log('NebenkostenRadar Rechtsmonitor\n' + '='.repeat(40));
  if (!ANTHROPIC_KEY) { console.error('ANTHROPIC_API_KEY fehlt'); process.exit(1); }

  const bestehendeArtikel = await ladeBestehendeArtikel();
  console.log(`  → ${bestehendeArtikel.length} bestehende Artikel geladen (für interne Verlinkung)`);

  // Themen für neue Artikel — monatlich anpassen
  // Claude Code: "Ergänze aktuelle BGH-Urteile vom [Monat]"
  const themen = process.argv[2]
    ? [process.argv[2]]  // Einzelnes Thema via Kommandozeile
    : [
      "Aktuelle BGH Urteile Mietrecht Nebenkosten 2026",
      "Heizkostenabrechnung häufigste Fehler Vermieter 2026",
    ];

  let neuArtikel = 0;
  for (const thema of themen) {
    console.log(`\nThema: ${thema}`);
    try {
      const artikel = await generiereArtikel(thema, bestehendeArtikel);
      const bild = await getBild(artikel.unsplash_query || 'apartment building');
      const eingefuegt = fuegeArtikelEin(artikel, bild);
      if (eingefuegt) {
        aktualisiereSitemap(artikel.id);
        bestehendeArtikel.push({ id: artikel.id, titel: artikel.titel }); // für evtl. weitere Themen im selben Lauf
        neuArtikel++;
        console.log(`  Titel: ${artikel.titel}`);
      }
      await new Promise(r => setTimeout(r, 1500));
    } catch (e) {
      console.error(`  Fehler: ${e.message}`);
    }
  }

  console.log(`\n${'='.repeat(40)}`);
  console.log(`${neuArtikel} neue Artikel erstellt.`);
  if (neuArtikel > 0) console.log('Bitte: git add . && git commit -m "Neue Artikel" && git push');
}

main();
