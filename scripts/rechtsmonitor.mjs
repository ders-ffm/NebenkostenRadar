#!/usr/bin/env node
/**
 * NebenkostenRadar — Automatischer Rechtsmonitor & SEO-Artikel Generator
 *
 * VERWENDUNG MIT CLAUDE CODE:
 *   claude "Führe scripts/rechtsmonitor.mjs aus, prüfe neue Rechtsprechung
 *            und erstelle wenn nötig neue Artikel"
 *
 * WAS DIESES SCRIPT TUT:
 * 1. Wählt aus der Themenliste (siehe THEMEN_POOL unten) automatisch bis zu
 *    2 Themen aus, die noch nicht als Artikel existieren
 * 2. KI schreibt eigene Artikel in eigenen Worten — kein Copy-Paste
 * 3. Holt lizenzfreie Titelbilder von Unsplash API (vermeidet Bild-Duplikate)
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
 * NEUE THEMEN HINZUFÜGEN (ohne Code-Kenntnisse):
 *   Einfach eine neue Zeile im Array "THEMEN_POOL" weiter unten ergänzen,
 *   z.B.: "Nebenkosten bei Untervermietung 2026",
 *   Das Skript verarbeitet pro Lauf automatisch bis zu 2 noch nicht
 *   behandelte Themen aus dieser Liste (von oben nach unten).
 *
 * FEHLERDIAGNOSE:
 *   Schlägt die KI-Generierung fehl, wird die echte Ursache geloggt
 *   (Stop-Grund + Antwort-Ausschnitt) — im GitHub-Actions-Log beim Schritt
 *   "Rechtsmonitor ausfuehren" sichtbar.
 *
 * VERLAUF:
 *   25.07.2026 — max_tokens 6000→8192→12000 (Abbruch mitten im JSON behoben).
 *   25.07.2026 — system-Prompt ergänzt + robuste JSON-Extraktion, nachdem
 *   die KI bei Websuche-Nutzung entweder das ganze Token-Budget für
 *   Suchschritte verbraucht hat (leere Antwort) oder Fließtext vor dem
 *   JSON geschrieben hat, was das reine JSON.parse gebrochen hat.
 *   25.07.2026 — Verweis-Anweisung verschärft (KI hat trotz thematischer
 *   Nähe keine Verweis-Blöcke gesetzt).
 *   26.07.2026 — ROOT-CAUSE-FIX: Die KI hat sich bisher die "id" für jeden
 *   Artikel frei ausgedacht (abgeleitet vom eigenen Titel). Dieselbe
 *   Themen-Eingabe führte dadurch bei jedem Lauf zu einer ANDEREN id, wodurch
 *   die Duplikat-Prüfung (Vergleich nur nach exakter id) versagt hat — es
 *   entstanden mehrfach Artikel zum selben Thema mit unterschiedlichen
 *   Titeln/IDs. Fix: Die id wird jetzt IMMER deterministisch aus dem
 *   Themen-Text berechnet (slugify), nicht mehr von der KI übernommen.
 *   Zusätzlich: fest programmierte 2-Themen-Liste durch größeren,
 *   erweiterbaren THEMEN_POOL ersetzt (sonst hätten alle künftigen
 *   Monatsläufe nach 2x "schon vorhanden" dauerhaft 0 Artikel erzeugt).
 *   Außerdem: <cite>-Tags aus Websuche-Zitaten werden automatisch aus dem
 *   Text entfernt (waren zuvor unsichtbar auf der Live-Seite sichtbar).
 *   08.08.2026 — STIL-FIX: Der Prompt machte keine Vorgabe zur Anrede
 *   (Sie/du) und keine Vorgabe zu KI-typischen Floskeln. Ergebnis: Ein
 *   Artikel (bgh-urteile-mietrecht-nebenkosten-2026) duzt durchgehend,
 *   während alle anderen Artikel siezen — Inkonsistenz auf der Live-Seite.
 *   Prompt um verbindlichen STIL-Abschnitt ergänzt (Sie-Form, zwei echte
 *   Satzbeispiele aus bestehenden Artikeln als Ton-Anker, Liste zu
 *   vermeidender KI-Floskeln, Pflicht zur §-Fundstelle bei Rechtsbehauptungen).
 *   Rein stilistisch, keine Änderung an JSON-Struktur oder ID-Logik.
 */
import fetch from 'node-fetch';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const UNSPLASH_KEY  = process.env.UNSPLASH_ACCESS_KEY;
// ── Themenliste — hier bei Bedarf einfach neue Zeilen ergänzen ──────────────
// Reihenfolge = Priorität (von oben nach unten). Bereits behandelte Themen
// werden automatisch erkannt und übersprungen (über die deterministische id,
// siehe slugify()) — hier darf also auch mal ein Thema doppelt auftauchen,
// ohne dass ein Duplikat entsteht.
const THEMEN_POOL = [
  "Betriebskostenabrechnung Fristen und Verjährung 2026",
  "Wasserkosten und Kaltwasserzähler in der Nebenkostenabrechnung",
  "Müllgebühren und Abfallentsorgung als Betriebskosten 2026",
  "Hausmeisterkosten in der Nebenkostenabrechnung: Was ist umlagefähig",
  "Versicherungskosten in der Nebenkostenabrechnung erklärt",
  "Grundsteuerreform 2026 Auswirkungen auf die Nebenkostenabrechnung",
  "Modernisierungsumlage vs Betriebskosten der Unterschied",
  "Leerstand und Nebenkosten wer zahlt was",
  "Mieterhöhung durch Betriebskostenanpassung Ihre Rechte",
  "Verbrauchsablesung per Funk Datenschutz bei Smart Metern",
  "Gartenpflege und Außenanlagen Umlagefähigkeit pruefen",
  "Aufzugskosten in der Nebenkostenabrechnung wann sind sie zu hoch",
  "Schornsteinfeger und Kaminkehrer Kosten richtig abrechnen",
  "Nebenkostenabrechnung bei Auszug was gilt bei Mieterwechsel",
  "WEG Verwaltungskosten vs umlagefaehige Betriebskosten",
];
// ── Text-Slug aus einem beliebigen deutschen String erzeugen ────────────────
// Wird für die deterministische Artikel-id genutzt: dieselbe Themen-Eingabe
// erzeugt IMMER dieselbe id, unabhängig davon, wie die KI den Artikel betitelt.
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[äöüß]/g, c => ({ ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' }[c]))
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
// ── <cite>-Tags aus Websuche-Zitaten rekursiv entfernen ──────────────────────
// Die KI übernimmt bei Websuche-Nutzung manchmal rohe Zitat-Markierungen wie
// <cite index="1-6,1-7">...</cite> direkt in den Antworttext. Ungefiltert
// würde das auf der Live-Seite als kaputtes HTML-Fragment sichtbar sein.
function bereinigeCiteTags(wert) {
  if (typeof wert === 'string') {
    return wert.replace(/<\/?cite[^>]*>/gi, '');
  }
  if (Array.isArray(wert)) {
    return wert.map(bereinigeCiteTags);
  }
  if (wert && typeof wert === 'object') {
    const out = {};
    for (const k in wert) out[k] = bereinigeCiteTags(wert[k]);
    return out;
  }
  return wert;
}
// ── Unsplash: lizenzfreies Titelbild ─────────────────────────────────────────
//
// KOMPLETT ÜBERARBEITET AM 10.09.2026. Vorgabe von Stefan: „Bitte dafür
// sorgen, dass die Bilder immer einzigartig sind und sich nie wiederholen."
//
// In der alten Fassung konnte die Duplikatsperre GAR NICHT GREIFEN. Sie
// verglich so:
//     bekannteBilder.some(url => url.includes(foto.id))
// `foto.id` ist die Unsplash-Foto-ID wie "VZDzvfLnuBw". Die kommt in der
// Bild-URL aber überhaupt nicht vor — die sieht so aus:
//     https://images.unsplash.com/photo-1772588627342-5ec373e236d8
// Der Vergleich war also immer falsch, die Sperre nie aktiv, und es wurde
// stets das erste Suchergebnis genommen. Genau dadurch teilten sich am
// 10.09.2026 zweiundzwanzig Artikel acht Bilder.
//
// Verglichen wird jetzt über den URL-Bestandteil `photo-...`, der das Bild
// tatsächlich identifiziert (siehe bildKennung()).
//
// DREI WEITERE PROBLEME, die dabei mit behoben wurden:
//
// 1. PREMIUM-BILDER. Die Unsplash-Suche liefert auch Unsplash+ Treffer
//    (`plus.unsplash.com/premium_photo-...`). Die setzen ein kostenpflichtiges
//    Abo voraus und dürfen hier nicht verwendet werden. Sie werden jetzt
//    herausgefiltert.
//
// 2. FESTE RÜCKFALLBILDER. Ohne API-Schlüssel gab es sechs feste URLs — bei
//    mehreren Artikeln zum selben Thema also garantiert Dubletten. Jetzt gibt
//    es einen Pool, aus dem nur noch nicht verwendete Bilder genommen werden.
//
// 3. STILLES AUFGEBEN. Fand die Suche kein freies Bild, nahm die alte Fassung
//    trotzdem `kandidaten[0]` — also womöglich ein Duplikat. Jetzt wird
//    stattdessen mit breiteren Suchbegriffen nachgefasst, und wenn auch das
//    nichts bringt, gibt die Funktion null zurück. Der Artikel wird dann
//    NICHT eingefügt, mit deutlicher Meldung im Log. Lieber ein Artikel
//    weniger als ein wiederholtes Bild.
//
// Unsplash-Lizenz: kostenlos, kommerzielle Nutzung erlaubt.
// Pflicht laut Lizenz: UTM-Parameter in der URL (Attribution).

// Identität eines Bildes = der Pfadbestandteil "photo-...". Query-Parameter
// (Breite, Qualität, UTM) gehören nicht dazu, sonst gälten zwei Varianten
// desselben Bildes als verschieden.
function bildKennung(url) {
  const treffer = String(url || '').match(/photo-[0-9a-zA-Z_-]+/);
  return treffer ? treffer[0] : null;
}

function istFreieLizenz(url) {
  return String(url || '').startsWith('https://images.unsplash.com/photo-');
}

// Rückfallbilder für den Fall, dass kein UNSPLASH_ACCESS_KEY gesetzt ist.
// Alle am 10.09.2026 geprüft: freie Lizenz, ladbar, und keines davon wird
// bereits von einem Artikel verwendet. Wer hier ergänzt: bitte vorher gegen
// die Bilder in src/artikel.js abgleichen.
const RUECKFALL_BILDER = [
  'https://images.unsplash.com/photo-1460408037948-b89a5e837b41',
  'https://images.unsplash.com/photo-1560518883-ce09059eeffa',
  'https://images.unsplash.com/photo-1721932423849-e9033192b190',
  'https://images.unsplash.com/photo-1784407272647-2c452493dd9f',
  'https://images.unsplash.com/photo-1707902665498-a202981fb5ac',
  'https://images.unsplash.com/photo-1460317442991-0ec209397118',
  'https://images.unsplash.com/photo-1768158989131-64cbff67f292',
  'https://images.unsplash.com/photo-1625225230517-7426c1be750c',
];

async function sucheBild(query, verbraucht) {
  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=30&orientation=landscape&content_filter=high`,
    { headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  for (const foto of (data.results || [])) {
    const url = (foto.urls?.raw || foto.urls?.regular || '').split('?')[0];
    if (!istFreieLizenz(url)) continue;            // kein Unsplash+ Premium
    const kennung = bildKennung(url);
    if (!kennung || verbraucht.has(kennung)) continue;
    return url;
  }
  return null;
}

async function getBild(query, bekannteBilder = []) {
  const verbraucht = new Set(bekannteBilder.map(bildKennung).filter(Boolean));
  const fertig = url => `${url}?w=800&q=80&utm_source=nebenkostenradar&utm_medium=referral`;

  if (UNSPLASH_KEY) {
    // Erst der thematische Begriff, dann zwei breitere Versuche.
    for (const versuch of [query, `${query} building`, 'apartment building germany']) {
      try {
        const gefunden = await sucheBild(versuch, verbraucht);
        if (gefunden) return fertig(gefunden);
      } catch { /* nächster Versuch */ }
    }
  }

  const frei = RUECKFALL_BILDER.find(url => !verbraucht.has(bildKennung(url)));
  if (frei) return fertig(frei);

  // Bewusst null: Der Aufrufer fügt den Artikel dann nicht ein.
  console.error(`  ! Kein unverbrauchtes Bild für "${query}" gefunden — Artikel wird übersprungen.`);
  console.error('    Abhilfe: UNSPLASH_ACCESS_KEY setzen oder RUECKFALL_BILDER in scripts/rechtsmonitor.mjs erweitern.');
  return null;
}
// ── Bestehende Artikel laden (für Duplikat-Prüfung + interne Verlinkung) ─────
// Dynamischer Import statt Text-Parsing: robuster, da die Datei eine echte
// ES-Module-Struktur hat und sich Formatierungsänderungen so nicht auf das
// Skript auswirken.
async function ladeBestehendeArtikel() {
  const pfad = join(__dirname, '../src/artikel.js');
  const modul = await import(pfad + '?t=' + Date.now()); // Cache-Bypass bei mehrfachem Lauf im selben Prozess
  return modul.ARTIKEL.map(a => ({ id: a.id, titel: a.titel, bild: a.bild, datum: a.datum }));
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
async function generiereArtikel(thema, erwarteteId, bestehendeArtikel) {
  console.log(`  → KI schreibt Artikel über: ${thema}`);
  const artikelListe = bestehendeArtikel.length
    ? bestehendeArtikel.map(a => `- id: "${a.id}" — ${a.titel}`).join('\n')
    : '(noch keine bestehenden Artikel)';
  const system = `Du antwortest ausschließlich mit einem einzigen validen JSON-Objekt.
Keine Einleitung, keine Erklärung, keine Markdown-Überschrift, kein Kommentar vor oder nach dem JSON.
Die allererste Zeichenfolge deiner Antwort muss "{" sein, die letzte muss "}" sein.
Gib niemals rohe Zitat-Markierungen wie <cite>...</cite> im Text aus — schreibe alles in eigenen,
vollständigen Sätzen ohne Zitat-Tags.
Falls du die Websuche nutzt: nutze sie sparsam (maximal 2-3 Anfragen), fasse Ergebnisse knapp zusammen,
und liefere danach sofort und ausschließlich das JSON-Objekt — ohne einen einzigen Satz Kommentar davor.`;
  const prompt = `Du bist Mietrechtsexperte und schreibst für NebenkostenRadar.com.
Schreibe einen SEO-Ratgeber-Artikel zum Thema: "${thema}"

STIL — unbedingt einhalten, damit der Artikel zum Rest der Seite passt:
- Anrede durchgehend in der Sie-Form. Niemals "du" oder "dein" verwenden — frühere Artikel
  sind hier inkonsistent gewesen, das darf sich nicht wiederholen.
- Ton: sachlich-präzise, wie ein Fachanwalt, der einem Laien einen Sachverhalt erklärt — nicht
  wie ein Marketing-Blog. Zwei Beispiele für den vorhandenen Ton auf dieser Seite, an Satzbau
  und Präzision orientieren (nicht am Thema):
  "Die Umlage von Hausmeisterkosten stützt sich auf § 2 Nr. 14 der Betriebskostenverordnung.
  Die Vorschrift erlaubt ausdrücklich die Umlage der Kosten des Hauswarts, definiert jedoch
  gleichzeitig eine wichtige Einschränkung."
  "Diese Zwölf-Monats-Frist ist eine sogenannte Ausschlussfrist. Das bedeutet: Es gibt keine
  Kulanz, keine automatische Verlängerung und keine Gnadenfrist."
- Jede Rechtsbehauptung braucht eine konkrete Grundlage (§-Angabe, Gesetz, oder BGH-Datum/Az.
  falls per Websuche ermittelt) — keine vagen Aussagen wie "laut Gesetz" ohne Fundstelle.
- Vermeide Formulierungen, die nach KI-Text klingen: "In der heutigen Zeit", "Es ist wichtig
  zu beachten/betonen, dass", "Zusammenfassend lässt sich sagen", "Dies zeigt deutlich",
  "Nicht zuletzt", "Darüber hinaus" als Standard-Konnektor, inflationäre Gedankenstriche als
  Stilmittel, sowie inhaltsleere Dreier-Adjektivreihen (z. B. "schnell, einfach und zuverlässig").
- Variiere die Satzlänge und die Absatz-Einstiege. Nicht jeder Absatz darf mit "Wichtig ist..."
  oder "Prüfen Sie..." beginnen.
- "hinweis"-Blöcke sparsam einsetzen, nur für wirklich zentrale Handlungsempfehlungen.

INHALT:
- Eigene Formulierungen, keine Kopien fremder Texte, keine Zitat-Tags wie <cite>
- Zielgruppe: Mieter ohne Rechtskenntnisse
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
Das Feld "id" im JSON unten wird von unserem System ohnehin überschrieben — trag dort
einfach "${erwarteteId}" ein.
Antworte NUR mit diesem JSON, keine Backticks, kein einleitender Satz:
{
  "id": "${erwarteteId}",
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
  // Root-Cause-Fix: die von der KI vorgeschlagene id wird NICHT übernommen.
  // Stattdessen wird immer die deterministisch aus dem Thema berechnete id
  // verwendet — das garantiert, dass dasselbe Thema nie zweimal zu
  // unterschiedlichen IDs (und damit Duplikaten) führt.
  artikel.id = erwarteteId;
  // Zitat-Tags aus der Websuche defensiv entfernen, egal was die KI geliefert hat
  artikel = bereinigeCiteTags(artikel);
  const bekannteIds = bestehendeArtikel.map(a => a.id);
  artikel.inhalt = bereinigeVerweise(artikel.inhalt, bekannteIds);
  return artikel;
}
// ── Artikel in artikel.js einfügen ────────────────────────────────────────────
function fuegeArtikelEin(artikel, bildUrl) {
  // Artikel liegen in eigener Datei — App.jsx bleibt unverändert klein
  let app = readFileSync(join(__dirname, '../src/artikel.js'), 'utf8');
  // Prüfen ob Artikel schon existiert (zusätzliche Absicherung neben der
  // Vorab-Prüfung in main() — sollte durch die deterministische id nie mehr greifen)
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
// ── Sitemap NEU AUFBAUEN (nicht mehr nur anhängen) ───────────────────────────
// GEÄNDERT 13.08.2026 — ROOT-CAUSE-FIX für einen in der echten Google Search
// Console gefundenen Bug: Die alte Version hat bei jedem neuen Artikel nur
// eine <url>-Zeile ANGEHÄNGT, aber nie geprüft, ob alle bisherigen Einträge
// noch zu echten Artikeln in artikel.js gehören. Wurde ein Artikel jemals von
// Hand entfernt/umbenannt (kam bei Testläufen während der Entwicklung dieses
// Scripts vor), blieb sein Sitemap-Eintrag für immer als toter Link stehen —
// Google listete ihn als Seite, die "Artikel nicht gefunden" zeigt. Drei
// solcher verwaisten Einträge wurden am 13.08.2026 in der Google Search
// Console gefunden und über einen manuellen sitemap.xml-Ersatz entfernt.
// Diese Funktion baut die Sitemap jetzt bei JEDEM Lauf komplett neu aus der
// aktuellen, echten Artikelliste auf — ein verwaister Eintrag kann dadurch
// strukturell nicht mehr entstehen, unabhängig davon, wie ein Artikel entfernt
// wurde.
function parseDatumZuISO(datum) {
  const monate = { januar:1, februar:2, märz:3, april:4, mai:5, juni:6, juli:7, august:8, september:9, oktober:10, november:11, dezember:12 };
  const [monatName, jahr] = (datum || '').toLowerCase().split(' ');
  const monat = monate[monatName];
  if (!monat || !jahr) return new Date().toISOString().split('T')[0];
  return `${jahr}-${String(monat).padStart(2, '0')}-01`;
}
// STILLGELEGT 10.09.2026 — die Funktion bleibt als Dokumentation stehen,
// wird aber nicht mehr aufgerufen.
//
// Grund: Seit dem 10.09.2026 erzeugt scripts/prerender.mjs die sitemap.xml
// bei JEDEM Build direkt in dist/ und überschreibt dabei die aus public/
// kopierte Datei. Damit gab es zwei Stellen, die dieselbe Datei schreiben.
// Gewonnen hat immer der Build — die Arbeit hier war also wirkungslos, aber
// verwirrend.
//
// Warum der Build die richtige Stelle ist: Der Rechtsmonitor läuft nur
// monatlich und kennt nur die Artikel, die er selbst anlegt. Werden Artikel
// von Hand ergänzt (am 10.09.2026 kamen zwölf auf einmal dazu), stünden sie
// bis zum nächsten Monitorlauf nicht in der Sitemap. Beim Build ist die
// Sitemap dagegen immer auf dem Stand von artikel.js, egal wer den Artikel
// hinzugefügt hat.
//
// Die Schutzlogik von hier ist übernommen: Auch prerender.mjs baut die
// Sitemap bei jedem Lauf komplett aus der echten Artikelliste neu auf, ein
// verwaister Eintrag kann also weiterhin nicht entstehen.
//
// eslint-disable-next-line no-unused-vars
function baueSitemap(alleArtikel) {
  const pfad = join(__dirname, '../public/sitemap.xml');
  const statischeSeiten = [
    { loc: 'https://nebenkostenradar.com/', changefreq: 'weekly', priority: '1.0' },
    { loc: 'https://nebenkostenradar.com/ratgeber', changefreq: 'monthly', priority: '0.8' },
    { loc: 'https://nebenkostenradar.com/ueber-uns', changefreq: 'yearly', priority: '0.5' },
  ];
  const artikelUrls = alleArtikel.map(a => ({
    loc: `https://nebenkostenradar.com/ratgeber/${a.id}`,
    changefreq: 'monthly',
    priority: '0.8',
    lastmod: parseDatumZuISO(a.datum),
  }));
  const alleUrls = [...statischeSeiten, ...artikelUrls];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${alleUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
  </url>`).join('\n')}
</urlset>
`;
  writeFileSync(pfad, xml);
}
// ── Hauptprogramm ─────────────────────────────────────────────────────────────
async function main() {
  console.log('NebenkostenRadar Rechtsmonitor\n' + '='.repeat(40));
  if (!ANTHROPIC_KEY) { console.error('ANTHROPIC_API_KEY fehlt'); process.exit(1); }
  const bestehendeArtikel = await ladeBestehendeArtikel();
  console.log(`  → ${bestehendeArtikel.length} bestehende Artikel geladen (für interne Verlinkung)`);
  const bekannteIds = bestehendeArtikel.map(a => a.id);
  // Themen wählen: entweder ein einzelnes Thema per Kommandozeile (Test/Claude Code),
  // oder automatisch bis zu 2 Themen aus THEMEN_POOL, deren deterministische id
  // noch NICHT existiert. Das verhindert Duplikate schon VOR dem teuren API-Call.
  let themenMitId;
  if (process.argv[2]) {
    themenMitId = [{ thema: process.argv[2], id: slugify(process.argv[2]) }];
  } else {
    themenMitId = THEMEN_POOL
      .map(thema => ({ thema, id: slugify(thema) }))
      .filter(t => !bekannteIds.includes(t.id))
      .slice(0, 2);
  }
  if (themenMitId.length === 0) {
    console.log('\nAlle Themen aus THEMEN_POOL sind bereits als Artikel vorhanden.');
    console.log('Bitte in scripts/rechtsmonitor.mjs neue Zeilen zu THEMEN_POOL hinzufügen.');
  }
  const bekannteBilder = bestehendeArtikel.map(a => a.bild).filter(Boolean);
  let neuArtikel = 0;
  for (const { thema, id } of themenMitId) {
    console.log(`\nThema: ${thema}`);
    try {
      const artikel = await generiereArtikel(thema, id, bestehendeArtikel);
      const bild = await getBild(artikel.unsplash_query || 'apartment building', bekannteBilder);
      // Ohne eigenes Bild wird der Artikel NICHT angelegt (Vorgabe vom
      // 10.09.2026: Bilder dürfen sich nie wiederholen). getBild() hat den
      // Grund bereits ausgegeben.
      if (!bild) {
        console.error(`  ! Artikel "${artikel.titel}" nicht eingefügt, weil kein eigenes Bild verfügbar war.`);
        continue;
      }
      const eingefuegt = fuegeArtikelEin(artikel, bild);
      if (eingefuegt) {
        bestehendeArtikel.push({ id: artikel.id, titel: artikel.titel, bild, datum: artikel.datum }); // für evtl. weitere Themen im selben Lauf
        bekannteBilder.push(bild);
        neuArtikel++;
        console.log(`  Titel: ${artikel.titel}`);
      }
      await new Promise(r => setTimeout(r, 1500));
    } catch (e) {
      console.error(`  Fehler: ${e.message}`);
    }
  }
  // Die Sitemap wird hier NICHT mehr geschrieben (siehe Kommentar bei
  // baueSitemap()). Sie entsteht bei jedem Build in scripts/prerender.mjs
  // und enthält damit auch von Hand ergänzte Artikel.
  console.log(`\n${'='.repeat(40)}`);
  console.log(`${neuArtikel} neue Artikel erstellt. Die Sitemap wird beim nächsten Build automatisch neu erzeugt.`);
  if (neuArtikel > 0) console.log('Bitte: git add . && git commit -m "Neue Artikel" && git push');
}
main();
