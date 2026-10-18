// ─────────────────────────────────────────────────────────────────────────
// monatsauswertung.mjs — NEU 18.10.2026
//
// Läuft am 1. jedes Monats (GitHub Actions) und legt ein GitHub-Issue mit
// dem Label "auswertung" an. Inhalt, alles anonym und nur als Summen:
//   1. Trichter des Vormonats aus den anonymen Zählern (nkr_zaehler):
//      Partnerbesuche, gestartete Prüfungen, Ergebnisse, Kaufklicks.
//   2. Echte Käufe des Vormonats (nkr_purchases), nach Stufe und Partnercode.
//   3. Befund-Statistik über alle gespeicherten bezahlten Prüfungen
//      (höchstens 12 Monate, danach werden sie gelöscht): Anteil mit
//      auffälligen Posten, häufigste auffällige Posten, Median der möglichen
//      Rückforderung. Erst ab MIN_FAELLE Prüfungen, darunter wären die Zahlen
//      zufällig und könnten im Einzelfall Rückschlüsse zulassen.
//
// Wozu: Prüftermin 31.03.2027 (lohnt sich das Projekt?), Bericht der
// SEO/GEO-Aufgabe, Pressetext-Entwürfe mit eigenen Zahlen.
//
// Datenschutz: Die Befunde werden aus den gespeicherten Eingaben mit den
// AKTUELLEN Prüfregeln neu berechnet (buildResult). Ausgegeben werden nur
// Summen und Anteile, nie einzelne Prüfungen. Siehe Datenschutz.jsx 3c.
//
// Secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY; GITHUB_TOKEN und
// GITHUB_REPO stellt GitHub Actions bereit. Ohne GITHUB_TOKEN wird der
// Bericht nur in der Konsole ausgegeben (lokaler Test).
// ─────────────────────────────────────────────────────────────────────────
import { buildResult } from "../src/lib/analyse.js";
import { BUSINESS } from "../src/config/business.js";

export const MIN_FAELLE = 30;
const AUFFAELLIG = ["hoch", "sehr_hoch", "nicht_umlagefaehig", "verstoss"];

// Vormonat als [erster Tag, erster Tag des Folgemonats] (Kalender Berlin
// reicht hier auf Tagesgenauigkeit, die Zähler sind ohnehin Tageswerte).
export function vormonat(heute = new Date()) {
  const j = heute.getUTCFullYear(), m = heute.getUTCMonth();
  const von = new Date(Date.UTC(j, m - 1, 1));
  const bis = new Date(Date.UTC(j, m, 1));
  const iso = d => d.toISOString().slice(0, 10);
  const name = von.toLocaleDateString("de-DE", { month: "long", year: "numeric", timeZone: "UTC" });
  return { von: iso(von), bis: iso(bis), name };
}

const pct = (a, b) => (b > 0 ? (Math.round((a / b) * 1000) / 10).toLocaleString("de-DE") + " %" : "–");
const euro = x => x.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";

export function median(werte) {
  if (!werte.length) return 0;
  const s = [...werte].sort((a, b) => a - b);
  const i = Math.floor(s.length / 2);
  return s.length % 2 ? s[i] : (s[i - 1] + s[i]) / 2;
}

// Reine Rechenfunktion, ohne Netzwerk (wird in den Tests direkt geprüft).
export function berichtErstellen({ zeitraum, zaehler, kaeufe, reportsMonat, reportsAlle }) {
  const summe = e => zaehler.filter(z => z.ereignis === e).reduce((s, z) => s + z.anzahl, 0);
  const start = summe("start"), ergebnis = summe("ergebnis"), klick = summe("kauf_klick"), partnerBesuche = summe("partner");
  const nKauf = kaeufe.length;

  const stufeVon = new Map(reportsMonat.map(r => [r.session_id, r]));
  let voll = 0, auswertung = 0, unbekannt = 0;
  const kaeufeJePartner = {};
  for (const k of kaeufe) {
    const r = stufeVon.get(k.session_id);
    if (!r) { unbekannt++; continue; }
    if (r.stufe === "voll") voll++; else auswertung++;
    if (r.partner) kaeufeJePartner[r.partner] = (kaeufeJePartner[r.partner] || 0) + 1;
  }
  const umsatzListe = voll * BUSINESS.PREIS_VOLL + auswertung * BUSINESS.PREIS_AUSWERTUNG;

  const besucheJePartner = {};
  for (const z of zaehler) if (z.ereignis === "partner" && z.partner) besucheJePartner[z.partner] = (besucheJePartner[z.partner] || 0) + z.anzahl;
  const partnerCodes = [...new Set([...Object.keys(besucheJePartner), ...Object.keys(kaeufeJePartner)])].sort();

  const z = [];
  z.push(`## Monatsauswertung ${zeitraum.name}`, "");
  z.push(`Zeitraum: ${zeitraum.von} bis vor ${zeitraum.bis}. Erstellt automatisch von scripts/monatsauswertung.mjs.`, "");
  z.push("### 1. Trichter (anonyme Zähler)", "");
  z.push("| Schritt | Anzahl | Quote zum Schritt davor |", "|---|---|---|");
  z.push(`| Prüfung gestartet | ${start} | |`);
  z.push(`| Ergebnis angezeigt | ${ergebnis} | ${pct(ergebnis, start)} |`);
  z.push(`| „Jetzt kaufen“ geklickt | ${klick} | ${pct(klick, ergebnis)} |`);
  z.push(`| Bezahlt (echte Zahlungen) | ${nKauf} | ${pct(nKauf, klick)} |`);
  z.push("", `Kauf je gestarteter Prüfung: **${pct(nKauf, start)}**. Kauf je angezeigtem Ergebnis: **${pct(nKauf, ergebnis)}**.`, "");
  z.push("Hinweis: Die Zähler laufen ohne Cookie und zählen jedes Ereignis einmal pro Seitenaufruf. Wer die Seite neu lädt, wird erneut gezählt. Bots werden grob herausgefiltert. Käufe stammen dagegen aus den echten Zahlungen.", "");
  z.push("### 2. Käufe", "");
  z.push(`| Stufe | Anzahl |`, "|---|---|");
  z.push(`| Auswertung + Brief (${euro(BUSINESS.PREIS_VOLL)}) | ${voll} |`);
  z.push(`| Auswertung (${euro(BUSINESS.PREIS_AUSWERTUNG)}) | ${auswertung} |`);
  if (unbekannt) z.push(`| Stufe unbekannt (Bericht bereits gelöscht) | ${unbekannt} |`);
  z.push("", `Umsatz zu Listenpreisen: **${euro(umsatzListe)}** (ohne Abzug von Gutscheinen; der tatsächlich bezahlte Betrag steht in Stripe).`, "");
  z.push("### 3. Partner", "");
  if (!partnerCodes.length) z.push("Keine Besuche oder Käufe über Partnerlinks.", "");
  else {
    z.push("| Partnercode | Besuche über Link | Käufe |", "|---|---|---|");
    for (const c of partnerCodes) z.push(`| ${c} | ${besucheJePartner[c] || 0} | ${kaeufeJePartner[c] || 0} |`);
    z.push("");
  }
  z.push("### 4. Befunde aus bezahlten Prüfungen (anonym, für Pressetexte)", "");
  const gueltig = reportsAlle.filter(r => r.werte && r.wohnung);
  if (gueltig.length < MIN_FAELLE) {
    z.push(`Mindestfallzahl nicht erreicht: ${gueltig.length} von ${MIN_FAELLE} bezahlten Prüfungen. Keine Kennzahlen, damit keine Zufallswerte oder Rückschlüsse auf Einzelfälle entstehen.`, "");
  } else {
    let mitBefund = 0;
    const haeufigkeit = {};
    const ersparnisse = [];
    for (const r of gueltig) {
      let e;
      try { e = buildResult(r.werte, r.wohnung); } catch { continue; }
      const auff = (e.posten_bewertung || []).filter(p => AUFFAELLIG.includes(p.status));
      if (auff.length) mitBefund++;
      for (const p of new Set(auff.map(p => p.posten))) haeufigkeit[p] = (haeufigkeit[p] || 0) + 1;
      if (typeof e.moegliche_ersparnis === "number") ersparnisse.push(e.moegliche_ersparnis);
    }
    const top = Object.entries(haeufigkeit).sort((a, b) => b[1] - a[1]).slice(0, 5);
    z.push(`Grundlage: ${gueltig.length} bezahlte Prüfungen der letzten bis zu 12 Monate, neu berechnet mit den aktuellen Prüfregeln.`, "");
    z.push(`- Mit mindestens einem auffälligen Posten: **${pct(mitBefund, gueltig.length)}**`);
    z.push(`- Median der möglicherweise zu viel gezahlten Summe: **${euro(median(ersparnisse))}**`);
    z.push("- Häufigste auffällige Posten:");
    for (const [p, n] of top) z.push(`  - ${p}: ${pct(n, gueltig.length)} der Prüfungen`);
    z.push("", "Einschränkung für jede Veröffentlichung: Die Zahlen stammen nur von Mietern, die ihre Abrechnung selbst prüfen wollten (keine Zufallsstichprobe). „Auffällig“ heißt: über dem DMB-Vergleichswert oder formal angreifbar, nicht: nachweislich falsch.", "");
  }
  return z.join("\n");
}

async function holen(pfad) {
  const r = await fetch(process.env.SUPABASE_URL + "/rest/v1/" + pfad, {
    headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY, Authorization: "Bearer " + process.env.SUPABASE_SERVICE_ROLE_KEY },
  });
  if (!r.ok) throw new Error(pfad.split("?")[0] + ": " + (await r.text()));
  return r.json();
}

async function reportsZu(ids, felder) {
  const out = [];
  for (let i = 0; i < ids.length; i += 100) {
    const teil = ids.slice(i, i + 100).map(id => '"' + id + '"').join(",");
    out.push(...(await holen("nkr_reports?session_id=in.(" + encodeURIComponent(teil) + ")&select=" + felder)));
  }
  return out;
}

export async function main() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY fehlen."); process.exit(1);
  }
  const zeitraum = vormonat();
  let zaehler = [];
  try {
    zaehler = await holen(`nkr_zaehler?tag=gte.${zeitraum.von}&tag=lt.${zeitraum.bis}&select=ereignis,partner,anzahl`);
  } catch (e) {
    console.warn("Zähler nicht lesbar (Tabelle angelegt? supabase/2026-10-18-wachstum.sql):", e.message);
  }
  const kaeufe = await holen(`nkr_purchases?purchased_at=gte.${zeitraum.von}&purchased_at=lt.${zeitraum.bis}&select=session_id`);
  let reportsMonat;
  try { reportsMonat = await reportsZu(kaeufe.map(k => k.session_id), "session_id,stufe,partner"); }
  catch { reportsMonat = await reportsZu(kaeufe.map(k => k.session_id), "session_id,stufe"); }
  const alleKaeufe = await holen("nkr_purchases?select=session_id");
  const reportsAlle = await reportsZu(alleKaeufe.map(k => k.session_id), "session_id,werte,wohnung");

  const text = berichtErstellen({ zeitraum, zaehler, kaeufe, reportsMonat, reportsAlle });
  const token = process.env.GITHUB_TOKEN, repo = process.env.GITHUB_REPO;
  if (!token || !repo) { console.log(text); return; }
  const r = await fetch("https://api.github.com/repos/" + repo + "/issues", {
    method: "POST",
    headers: { Authorization: "Bearer " + token, Accept: "application/vnd.github+json", "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Monatsauswertung " + zeitraum.name, body: text, labels: ["auswertung"] }),
  });
  if (!r.ok) { console.error("Issue konnte nicht angelegt werden:", await r.text()); console.log(text); process.exit(1); }
  console.log("Issue angelegt:", (await r.json()).html_url);
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop())) main();
