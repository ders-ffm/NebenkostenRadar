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
// Richtwerte kommen direkt aus derselben Datei wie die Analyse und die
// React-Ansicht (09.09.2026) — siehe renderRichtwerteTabelle() weiter unten.
import { BUSINESS } from "../src/config/business.js";

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
    // ── NEU 09.09.2026 (siehe CHANGELOG) ──────────────────────────────────
    // Diese drei Typen fehlten hier UND in Artikel.jsx. Der default-Zweig
    // gibt "" zurück, unbekannte Blöcke verschwanden also spurlos — ohne
    // Fehler, ohne Warnung. Betroffen war ausgerechnet das, was Google von
    // den beiden sichtbarsten Seiten zu sehen bekam: die komplette
    // DMB-Richtwerte-Tabelle (548 Impressionen) und die 5-Schritte-Anleitung
    // zum Widerspruch (113). Beide Überschriften standen im HTML, der Inhalt
    // darunter fehlte — aus Sicht einer Suchmaschine eine Seite, die ihr
    // eigenes Versprechen nicht einlöst.
    //
    // WICHTIG: Dieses vorgerenderte HTML ist das, was Google beim ersten
    // Crawl liest. Es zählt für die Bewertung mehr als das, was React
    // später im Browser nachliefert. Änderungen an den Block-Typen müssen
    // deshalb IMMER an beiden Stellen passieren (siehe Kommentar oben).
    case "richtwerte":
      return renderRichtwerteTabelle();
    case "tabelle": {
      const [kopf, ...rest] = block.zeilen || [];
      if (!kopf) return "";
      const thead = `<thead><tr>${kopf.map(z => `<th scope="col">${escapeHtml(z)}</th>`).join("")}</tr></thead>`;
      const tbody = `<tbody>${rest.map(zeile => `<tr>${zeile.map(z => `<td>${escapeHtml(z)}</td>`).join("")}</tr>`).join("")}</tbody>`;
      return `<table>${thead}${tbody}</table>`;
    }
    case "schritte":
      return `<ol>${(block.items || []).map(i => `<li>${escapeHtml(i)}</li>`).join("")}</ol>`;
    default:
      return "";
  }
}

// ───────────────────────────────────────────────────────────────────────────
// EINBETT-WIDGET (NEU 09.09.2026, siehe planung/internationale-recherche-nkr.md)
//
// Erzeugt dist/widget.js — eine eigenständige Datei, die fremde Websites per
// <script>-Tag einbinden können, um die DMB-Richtwerte-Tabelle anzuzeigen.
// Zweck ist nicht die Tabelle selbst, sondern die sichtbare Quellenangabe mit
// Rückverlinkung darunter: Wer die Tabelle einbindet, verlinkt automatisch auf
// nebenkostenradar.com. Das ist ein legitimer, in der Branche üblicher Weg zu
// Rückverlinkungen — im Gegensatz zu gekauften Links.
//
// BEWUSST STATISCHE DATEI, KEINE SERVERLESS FUNCTION: Vercel zählt jede Datei
// unter api/ als eigene Function, der Hobby-Plan erlaubt 12 (daran ist schon
// ein Deploy gescheitert, siehe CHANGELOG 31.08.2026). Eine statische Datei
// kostet keinen dieser Plätze und wird zusätzlich vom CDN ausgeliefert.
//
// Die Werte kommen aus business.js und werden beim Build fest eingebacken —
// aktualisiert jemand die Richtwerte, aktualisiert sich das Widget beim
// nächsten Deploy von selbst mit. Es kann nicht veralten.
function schreibeWidget() {
  const R = BUSINESS.RICHTWERTE;
  const zeilen = [
    ["Heizung + Warmwasser", "heizung_warmwasser"],
    ["Wasser + Abwasser", "wasser_abwasser"],
    ["Grundsteuer", "grundsteuer"],
    ["Müllbeseitigung", "muell"],
    ["Hausmeister", "hausmeister"],
    ["Versicherungen", "versicherungen"],
    ["Gebäudereinigung", "gebaeudereinigung"],
    ["Aufzug", "aufzug"],
    ["Gartenpflege", "gartenpflege"],
    ["Allgemeinstrom", "allgemeinstrom"],
  ].filter(([, k]) => R[k] != null).map(([label, k]) => ({ label, wert: R[k] }));

  const daten = JSON.stringify({ zeilen, gesamt: R.gesamt, jahr: BUSINESS.RICHTWERTE_JAHR });

  const js = `/* NebenkostenRadar — Richtwerte-Widget
 * Einbinden mit:  <div id="nkr-betriebskostenspiegel"></div>
 *                 <script src="${BASE}/widget.js" async></script>
 * Quelle: Deutscher Mieterbund, Betriebskostenspiegel. Automatisch erzeugt,
 * nicht von Hand bearbeiten (siehe scripts/prerender.mjs).
 */
(function () {
  var D = ${daten};
  function eur(n) { return n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " \\u20AC"; }
  function render(ziel) {
    var t = '<table style="width:100%;border-collapse:collapse;font:14px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;color:#2E2A22">';
    t += '<caption style="caption-side:top;text-align:left;font-weight:600;padding:0 0 8px">Betriebskostenspiegel ' + D.jahr + ' \\u2014 Durchschnitt je m\\u00B2 und Monat</caption>';
    t += '<thead><tr style="border-bottom:2px solid #E3D9C6"><th scope="col" style="text-align:left;padding:6px 8px 6px 0;font-weight:600">Kostenart</th><th scope="col" style="text-align:right;padding:6px 0 6px 8px;font-weight:600">\\u20AC/m\\u00B2/Monat</th></tr></thead><tbody>';
    D.zeilen.forEach(function (z) {
      t += '<tr style="border-bottom:1px solid #E3D9C6"><th scope="row" style="text-align:left;padding:6px 8px 6px 0;font-weight:400">' + z.label + '</th><td style="text-align:right;padding:6px 0 6px 8px;white-space:nowrap">' + eur(z.wert) + '</td></tr>';
    });
    t += '<tr style="border-top:2px solid #E3D9C6"><th scope="row" style="text-align:left;padding:8px 8px 8px 0;font-weight:700">Gesamt</th><td style="text-align:right;padding:8px 0 8px 8px;font-weight:700;white-space:nowrap">' + eur(D.gesamt) + '</td></tr>';
    t += '</tbody></table>';
    t += '<p style="font:12px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;color:#6B6355;margin:8px 0 0">Quelle: Deutscher Mieterbund, Betriebskostenspiegel ' + D.jahr + '. Tabelle bereitgestellt von <a href="${BASE}/ratgeber/betriebskostenspiegel-2024" style="color:#3d7a5c">NebenkostenRadar</a>.</p>';
    ziel.innerHTML = t;
  }
  function start() {
    var ziel = document.getElementById("nkr-betriebskostenspiegel");
    if (ziel) render(ziel);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
`;
  writeFileSync(join(DIST, "widget.js"), js);
  console.log("  ✓ /widget.js (Einbett-Widget, " + zeilen.length + " Kostenarten)");
}

// Richtwerte-Tabelle aus business.js — gleiche Datenquelle und gleiche
// Zeilenreihenfolge wie in src/pages/Artikel.jsx, damit vorgerendertes HTML
// und die spätere React-Darstellung identisch sind. Bewusst NICHT aus dem
// Artikeltext gespeist: Dort standen fest eingetippte Werte, die bei 8 von
// 10 Kostenarten von den geprüften DMB-Werten abwichen.
function renderRichtwerteTabelle() {
  const R = BUSINESS.RICHTWERTE;
  const QM = 75;
  const eur = n => n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
  const zeilen = [
    ["Heizung + Warmwasser", "heizung_warmwasser"],
    ["Heizung + Warmwasser (Höchstwert)", "heizung_max"],
    ["Wasser + Abwasser", "wasser_abwasser"],
    ["Grundsteuer", "grundsteuer"],
    ["Müllbeseitigung", "muell"],
    ["Hausmeister", "hausmeister"],
    ["Versicherungen", "versicherungen"],
    ["Gebäudereinigung", "gebaeudereinigung"],
    ["Aufzug", "aufzug"],
    ["Gartenpflege", "gartenpflege"],
    ["Allgemeinstrom", "allgemeinstrom"],
    ["Straßenreinigung", "strassenreinigung"],
    ["Schornsteinreinigung", "schornstein"],
    ["Sonstige Betriebskosten", "sonstiges"],
  ];
  const body = zeilen
    .filter(([, key]) => R[key] != null)
    .map(([label, key]) => `<tr><th scope="row">${escapeHtml(label)}</th><td>${eur(R[key])}</td><td>${eur(R[key] * QM * 12)}</td></tr>`)
    .join("");
  const summe = `<tr><th scope="row">Gesamt (Durchschnitt)</th><td>${eur(R.gesamt)}</td><td>${eur(R.gesamt * QM * 12)}</td></tr>`;
  return `<table>` +
    `<caption>Quelle: Deutscher Mieterbund, Betriebskostenspiegel für das Abrechnungsjahr ${escapeHtml(BUSINESS.RICHTWERTE_JAHR)}. Jahresbeträge beispielhaft für ${QM} m².</caption>` +
    `<thead><tr><th scope="col">Kostenart</th><th scope="col">€/m²/Monat</th><th scope="col">Jahr, ${QM} m²</th></tr></thead>` +
    `<tbody>${body}${summe}</tbody></table>`;
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

// ───────────────────────────────────────────────────────────────────────────
// Vorgerenderte FAQ-Seite unter /faq.
//
// WARUM ÜBERHAUPT VORRENDERN: Die App ist eine React-SPA — im ausgelieferten
// HTML steht nur <div id="root"></div>. Der Seiteninhalt entsteht erst im
// Browser. Google rendert JavaScript inzwischen zwar, tut es aber verzögert
// und nicht garantiert. Deshalb bekommt /faq — wie schon die Ratgeberseiten —
// eine statische HTML-Fassung mit sichtbarem Text, eigenem <title>, eigener
// Beschreibung und eigenem Canonical.
//
// ZUSÄTZLICH FAQPage-MARKUP: Strukturierte Daten im Quelltext können als
// FAQ-Rich-Result in den Suchergebnissen erscheinen. Bedingung von Google:
// Das Markup muss dem sichtbaren Seiteninhalt entsprechen — deshalb wird
// beides hier aus derselben Quelle erzeugt.
//
// EINZIGE QUELLE: src/config/faq.js. Wer dort eine Frage ändert, ändert
// automatisch alle drei Ausgaben — die React-Seite (src/pages/FAQ.jsx), den
// vorgerenderten Text und das Markup.
//
// GESCHICHTE (10.09.2026): Der FAQ-Block stand zunächst auf der Startseite,
// das Markup entsprechend in dist/index.html. Auf Stefans Wunsch ist die FAQ
// jetzt eine eigene Menüseite. Das Markup wandert mit — es gehört auf die
// Seite, auf der die Fragen auch sichtbar stehen.
// ───────────────────────────────────────────────────────────────────────────
function baueFaqJsonLd(faqListe) {
  const daten = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqListe.map(({ frage, antwort }) => ({
      "@type": "Question",
      name: frage,
      acceptedAnswer: { "@type": "Answer", text: antwort },
    })),
  };
  // </script> im Antworttext würde den Script-Block vorzeitig schließen.
  // JSON.stringify escaped das nicht, deshalb hier von Hand.
  const json = JSON.stringify(daten, null, 2).replace(/<\//g, "<\\/");
  return `<script type="application/ld+json">\n${json}\n</script>`;
}

function buildFaqHtml(template, faqListe) {
  const url = `${BASE}/faq`;
  const title = "Häufige Fragen zur Nebenkostenprüfung | NebenkostenRadar";
  const description =
    "Antworten auf die häufigsten Fragen zur Prüfung der Nebenkostenabrechnung: Unabhängigkeit, Genauigkeit der Vergleichswerte, Fristen, Datenschutz und Kosten.";

  let html = template
    .replace(/<title>.*?<\/title>/s, `<title>${escapeHtml(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${escapeHtml(description)}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escapeHtml(title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${escapeHtml(description)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`);

  html = html.replace("</head>", baueFaqJsonLd(faqListe) + "\n</head>");

  // Sichtbarer Text für Suchmaschinen und für Nutzer ohne JavaScript.
  // React ersetzt den Inhalt beim Start vollständig, deshalb reicht hier
  // einfaches, semantisches HTML ohne Styling.
  const eintraege = faqListe
    .map(({ frage, antwort }) => `<h2>${escapeHtml(frage)}</h2>\n<p>${escapeHtml(antwort)}</p>`)
    .join("\n");
  html = html.replace(
    '<div id="root"></div>',
    `<div id="root"><h1>Häufige Fragen</h1>\n${eintraege}</div>`
  );
  return html;
}

// ───────────────────────────────────────────────────────────────────────────
// sitemap.xml aus den echten Artikeln erzeugen.
//
// WARUM (Befund vom 10.09.2026): public/sitemap.xml wurde bisher VON HAND
// gepflegt. Beim Zählen fiel auf, dass sie nur 9 der 10 Artikel enthielt —
// der im September vom Rechtsmonitor ergänzte Grundsteuer-Artikel fehlte,
// war für Google über die Sitemap also nie angemeldet.
//
// Das ist strukturell und nicht durch Sorgfalt lösbar: Der Rechtsmonitor
// (scripts/rechtsmonitor.mjs) fügt automatisch Artikel hinzu, kennt die
// Sitemap aber nicht. Jeder neue Artikel hätte einen zweiten, manuellen
// Handgriff gebraucht — der irgendwann vergessen wird.
//
// Ab jetzt wird dist/sitemap.xml bei jedem Build aus ARTIKEL erzeugt und
// überschreibt die aus public/ kopierte Datei. Neue Artikel landen damit
// automatisch drin. public/sitemap.xml bleibt als Rückfallebene liegen,
// falls das Vorrendern einmal fehlschlägt.
//
// EINE STATISCHE SEITE ERGÄNZEN: unten in STATISCHE_SEITEN eine Zeile
// hinzufügen. Formular- und Rechtsseiten gehören bewusst NICHT hinein —
// Zwischenschritte des Formulars sollen nicht einzeln indexiert werden.
// ───────────────────────────────────────────────────────────────────────────
const STATISCHE_SEITEN = [
  { pfad: "/", changefreq: "weekly", priority: "1.0" },
  { pfad: "/ratgeber", changefreq: "monthly", priority: "0.8" },
  { pfad: "/faq", changefreq: "monthly", priority: "0.7" },
  { pfad: "/ueber-uns", changefreq: "yearly", priority: "0.5" },
];

const MONATE = {
  januar: "01", februar: "02", "märz": "03", maerz: "03", april: "04",
  mai: "05", juni: "06", juli: "07", august: "08", september: "09",
  oktober: "10", november: "11", dezember: "12",
};

// Artikel tragen ihr Datum als Text ("September 2026"). Für <lastmod> braucht
// die Sitemap ein ISO-Datum. Lässt sich das Datum nicht lesen, wird lastmod
// weggelassen — ein fehlendes lastmod ist zulässig, ein falsches nicht.
function lastmodAus(datumText) {
  const treffer = String(datumText || "").trim().match(/^([A-Za-zäÄöÖüÜ]+)\s+(\d{4})$/);
  if (!treffer) return null;
  const monat = MONATE[treffer[1].toLowerCase()];
  if (!monat) return null;
  return `${treffer[2]}-${monat}-01`;
}

function schreibeSitemap(artikelListe) {
  const eintraege = [];

  for (const seite of STATISCHE_SEITEN) {
    eintraege.push(
      `  <url>\n    <loc>${BASE}${seite.pfad}</loc>\n    <changefreq>${seite.changefreq}</changefreq>\n    <priority>${seite.priority}</priority>\n  </url>`
    );
  }

  for (const artikel of artikelListe) {
    const lastmod = lastmodAus(artikel.datum);
    eintraege.push(
      `  <url>\n    <loc>${BASE}/ratgeber/${artikel.id}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>` +
        (lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : "") +
        `\n  </url>`
    );
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    eintraege.join("\n") +
    `\n</urlset>\n`;

  writeFileSync(join(DIST, "sitemap.xml"), xml);
  console.log(`  ✓ /sitemap.xml (${eintraege.length} URLs: ${STATISCHE_SEITEN.length} feste + ${artikelListe.length} Artikel)`);
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

  const { FAQ_STARTSEITE } = await import(join(ROOT, "src/config/faq.js") + "?t=" + Date.now());
  const faqDir = join(DIST, "faq");
  mkdirSync(faqDir, { recursive: true });
  writeFileSync(join(faqDir, "index.html"), buildFaqHtml(template, FAQ_STARTSEITE));
  console.log(`  ✓ /faq (${FAQ_STARTSEITE.length} Fragen, inkl. FAQPage-Markup)`);

  schreibeSitemap(ARTIKEL);
  schreibeWidget();
  console.log("Vorrendern abgeschlossen.");
}

main().catch(e => {
  // Bewusst NICHT den ganzen Build abbrechen (process.exit(1)) — eine
  // fehlerhafte Vorrender-Ausgabe darf niemals die eigentliche App-
  // Auslieferung verhindern. Nur laut loggen, damit es im Vercel-Build-Log
  // auffällt.
  console.error("Vorrendern fehlgeschlagen (Build läuft trotzdem weiter):", e.message);
});
