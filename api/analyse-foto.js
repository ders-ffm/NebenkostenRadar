// ─────────────────────────────────────────────────────────────────────────
// analyse-foto.js — Optionale Foto-Erkennung einer Nebenkostenabrechnung.
//
// NEU 08/2026 (siehe CHANGELOG.md). Auslöser: Praxistest mit einer echten
// Abrechnung zeigte, dass das manuelle Abtippen aller Posten der größte
// verbleibende Reibungspunkt im Formular ist. Wer sein Handy fotografieren
// lassen kann (wie in diesem Chat geschehen), kann auch automatisch Beträge
// vorausfüllen lassen.
//
// WICHTIG — Grenzen bewusst gesetzt:
//   1. Diese Funktion füllt das Formular nur VOR — sie ersetzt es nicht. Der
//      Nutzer landet danach im normalen, editierbaren Formular und muss die
//      erkannten Werte bestätigen/korrigieren. Nie eine automatische Analyse
//      ohne menschliche Prüfung dazwischen — das würde dem eigentlichen
//      Wertversprechen (nachvollziehbare, genaue Prüfung) widersprechen.
//   2. Die hochgeladenen Fotos werden AUSSCHLIESSLICH im Arbeitsspeicher
//      dieser Funktion verarbeitet und NIRGENDS gespeichert — nicht in
//      Supabase, nicht auf Platte, nicht geloggt. Nach der Antwort sind sie
//      weg. Datensparsamkeit (Art. 5 Abs. 1 lit. c DSGVO).
//   3. Erkennt die KI einen Betrag nicht sicher einem unserer Posten zu, lässt
//      sie ihn laut Prompt bewusst weg statt zu raten — lieber ein leeres
//      Feld als ein falsch zugeordneter Betrag, den der Nutzer übersieht.
//   4. Nur Posten-Keys aus lib/analyse.js (ALLE_POSTEN) werden akzeptiert —
//      zusätzliche serverseitige Absicherung gegen von der KI erfundene Keys,
//      die im Frontend nicht existieren.
//   5. Bild-Qualität wird aktiv geprüft, nicht nur stillschweigend hingenommen:
//      Die KI wird angewiesen, unscharfe/abgeschnittene/schlecht lesbare Fotos
//      explizit zu benennen (`hinweise`), statt bei schlechter Lesbarkeit
//      einfach weniger Posten zurückzugeben, ohne dass der Nutzer den Grund
//      erfährt. Diese Hinweise werden im Frontend sichtbar angezeigt.
//
// Braucht ANTHROPIC_API_KEY als Vercel-Umgebungsvariable (Production UND
// Preview, falls auf Vorschau-Branches getestet wird) — das ist ein
// eigener Eintrag zusätzlich zum gleichnamigen GitHub-Actions-Secret, das
// scripts/rechtsmonitor.mjs verwendet; beide sind unabhängig voneinander.
//
// Kein neues npm-Package: reiner fetch-Aufruf an die Anthropic-REST-API,
// analog zu allen anderen api/*.js-Dateien in diesem Projekt (siehe z.B.
// get-report.js für den Stripe-Aufruf nach demselben Muster).
// ─────────────────────────────────────────────────────────────────────────
import { ALLE_POSTEN } from "../src/lib/analyse.js";
import { toNum } from "../src/lib/format.js";

export const config = {
  api: { bodyParser: { sizeLimit: "4mb" } },
};

const GUELTIGE_KEYS = new Set(ALLE_POSTEN.map(p => p.key));

function posteneKatalogFuerPrompt() {
  return ALLE_POSTEN
    .map(p => `- ${p.key}: "${p.label}"${p.aliases ? " (auch genannt: " + p.aliases.join(", ") + ")" : ""}`)
    .join("\n");
}

// Extrahiert das JSON-Objekt zwischen der ersten { und letzten } — überlebt
// so überschüssigen Fließtext der KI drumherum (gleiches Vorgehen wie
// extrahiereJSON() in scripts/rechtsmonitor.mjs).
function extrahiereJSON(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return null;
  try { return JSON.parse(text.slice(start, end + 1)); } catch { return null; }
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://nebenkostenradar.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Foto-Erkennung ist derzeit nicht verfügbar." });

  const { bilder } = req.body || {};
  if (!Array.isArray(bilder) || bilder.length === 0) {
    return res.status(400).json({ error: "Keine Bilder übermittelt" });
  }
  if (bilder.length > 6) {
    return res.status(400).json({ error: "Maximal 6 Fotos pro Durchlauf" });
  }

  const prompt = `Du liest Fotos einer deutschen Nebenkostenabrechnung (Betriebskostenabrechnung) und extrahierst daraus strukturierte Daten.

Gib AUSSCHLIESSLICH ein einziges JSON-Objekt zurück, keinen weiteren Text, kein Markdown, keine Erklärung. Format:

{
  "wohnung": {
    "flaeche": "<Wohnfläche in m² als Zahl, z.B. 75.5, oder leer wenn nicht gefunden>",
    "jahr": "<Abrechnungsjahr, 4-stellig, z.B. 2024>",
    "vorauszahlung": "<Summe der geleisteten Vorauszahlungen/Abschläge als Zahl, z.B. 2400>"
  },
  "werte": {
    "<posten_key>": "<Betrag als Zahl mit Punkt als Dezimaltrennzeichen, ohne Tausenderpunkte, z.B. 437.15>"
  },
  "hinweise": ["<kurzer Satz zu Bild-/Lesbarkeitsproblemen, siehe unten>"]
}

Für "werte" darfst du AUSSCHLIESSLICH die folgenden Keys verwenden, gewählt nach der Bezeichnung/den Alternativbegriffen, wie sie auf der Abrechnung stehen. Nur Keys mit tatsächlich gefundenem Betrag > 0 aufnehmen, alle anderen weglassen:

${posteneKatalogFuerPrompt()}

Wichtige Regeln:
- Wenn ein Posten auf der Abrechnung in "Grundanteil" + "Verbrauchsanteil" aufgeteilt ist (z.B. bei Heizung oder Warmwasser), addiere beide zu einem Gesamtbetrag für den jeweiligen Key.
- Wenn du bei einem Betrag unsicher bist, welchem Key er zugeordnet werden soll, LASS IHN WEG statt zu raten. Ein fehlender Wert ist besser als ein falsch zugeordneter.
- Erfinde keine Werte, die nicht auf den Fotos zu erkennen sind.
- Zahlen im deutschen Format (z.B. "1.234,56") in reine Dezimalzahlen mit Punkt umwandeln (1234.56).

Bild-Qualität aktiv prüfen (wichtig): Prüfe jedes Foto darauf, ob es vollständig lesbar ist. Falls ein Foto unscharf, zu dunkel, abgeschnitten, aus zu großem Winkel fotografiert oder aus einem anderen Grund teilweise nicht lesbar ist, trage dazu einen kurzen, konkreten Satz in "hinweise" ein (z.B. "Foto 2: unscharf, Beträge in der rechten Spalte nicht sicher lesbar" oder "Foto 3: oberer Rand abgeschnitten, Kopfdaten evtl. unvollständig"). Wenn dadurch einzelne Beträge unsicher sind, nimm sie NICHT in "werte" auf, sondern erwähne sie im jeweiligen Hinweis. Wenn alle Fotos gut lesbar sind, gib ein leeres Array für "hinweise" zurück. Melde außerdem, falls eine für die Prüfung zentrale Angabe (Wohnfläche, Abrechnungsjahr, Vorauszahlung, oder die Kostenaufstellung selbst) auf keinem der Fotos zu finden war.

Gib nur das JSON-Objekt zurück, sonst nichts.`;

  const content = [
    { type: "text", text: prompt },
    ...bilder.map(b => ({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: b } })),
  ];

  try {
    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 3000,
        messages: [{ role: "user", content }],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("Anthropic API Fehler:", aiRes.status, errText);
      return res.status(502).json({ error: "Foto-Erkennung fehlgeschlagen" });
    }

    const aiJson = await aiRes.json();
    const text = aiJson?.content?.[0]?.text || "";
    const parsed = extrahiereJSON(text);
    if (!parsed) return res.status(502).json({ error: "Antwort konnte nicht gelesen werden" });

    // Serverseitige Absicherung: nur bekannte Keys, nur gültige Zahlen > 0 übernehmen.
    const werte = {};
    for (const [key, val] of Object.entries(parsed.werte || {})) {
      if (!GUELTIGE_KEYS.has(key)) continue;
      const n = toNum(val);
      if (n > 0) werte[key] = String(n);
    }

    const w = parsed.wohnung || {};
    const wohnung = {
      flaeche: toNum(w.flaeche) > 0 ? String(toNum(w.flaeche)) : "",
      jahr: /^\d{4}$/.test(String(w.jahr || "").trim()) ? String(w.jahr).trim() : "",
      vorauszahlung: toNum(w.vorauszahlung) > 0 ? String(toNum(w.vorauszahlung)) : "",
    };

    // Hinweise zur Bildqualität: nur Strings, auf plausible Länge/Anzahl
    // begrenzt (Absicherung gegen unerwartete/übergroße Antworten).
    const hinweise = Array.isArray(parsed.hinweise)
      ? parsed.hinweise.filter(h => typeof h === "string" && h.trim()).slice(0, 10).map(h => h.trim().slice(0, 300))
      : [];

    const anzahlErkannt = Object.keys(werte).length;
    return res.status(200).json({ wohnung, werte, anzahlErkannt, hinweise });
  } catch (err) {
    console.error("analyse-foto Fehler:", err.message);
    return res.status(500).json({ error: "Foto-Erkennung fehlgeschlagen" });
  }
}
