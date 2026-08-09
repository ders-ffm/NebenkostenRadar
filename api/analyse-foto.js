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
// get-report.js für den Stripe-Aufruf nach demselben Muster). Genutzt wird
// die "tools"/tool_choice-Option der normalen Messages-API — kein separates
// Produkt, keine zusätzliche Abhängigkeit, siehe Kommentar bei TOOLS unten.
//
// RATE-LIMITING (08/2026, siehe CHANGELOG.md): Dieser Endpoint war bis
// dahin öffentlich ohne jede Begrenzung erreichbar — jeder Aufruf kostet
// echtes Geld (Anthropic-API), unabhängig davon, ob am Ende gekauft wird.
// Der CORS-Header oben schützt NICHT davor: er wird nur vom Browser bei
// Aufrufen AUS einer Webseite heraus beachtet, nicht von direkten Skript-
// Aufrufen (curl o.ä.). Deshalb serverseitiges IP-basiertes Limit über die
// Supabase-Tabelle nkr_foto_ratelimit (siehe ANLEITUNG-UPLOAD.md 1.1 für
// das SQL). Bewusst FAIL-OPEN: schlägt die Limit-Prüfung selbst technisch
// fehl (z.B. Tabelle noch nicht angelegt), wird der Aufruf trotzdem
// durchgelassen statt die ganze Funktion lahmzulegen — das Limit ist eine
// Kosten-Bremse, kein Sicherheitsmerkmal, und soll die Kernfunktion nicht
// gefährden. Zusätzlich empfohlen (nicht Teil des Codes): ein Spending
// Limit direkt in der Anthropic Console als harte Obergrenze.
// ─────────────────────────────────────────────────────────────────────────
import crypto from "crypto";
import { ALLE_POSTEN } from "../src/lib/analyse.js";
import { toNum } from "../src/lib/format.js";

export const config = {
  // 4,5mb statt vorher 4mb: Vercels tatsächliches, festes Infrastruktur-Limit
  // liegt bei 4,5 MB pro Anfrage (nicht änderbar). Mit PDF-Unterstützung
  // (bis zu ~4 MB Base64 für eine 3-MB-PDF, siehe MAX_PDF_MB unten) sollte
  // unser eigener bodyParser nicht enger sein als Vercels echte Grenze —
  // sonst würde ein Body-Parser-Fehler die eigene, hilfreichere Fehlermeldung
  // weiter unten verhindern.
  api: { bodyParser: { sizeLimit: "4.5mb" } },
};

const GUELTIGE_KEYS = new Set(ALLE_POSTEN.map(p => p.key));

const RATE_LIMIT_MAX_AUFRUFE = 8;   // Analysen pro IP...
const RATE_LIMIT_FENSTER_MIN = 60;  // ...innerhalb dieser Zeitspanne (Minuten)

// Rohe IP-Adressen sind personenbezogene Daten (DSGVO) — statt sie im Klartext
// zu speichern, wird nur ein Einweg-Hash abgelegt. Kein dediziertes Secret
// als Salt nötig: Zweck ist Kosten-/Missbrauchsschutz, keine kryptografische
// Anonymisierung, und Zeilen werden ohnehin nach 24h wieder gelöscht (unten).
function ipHash(ip) {
  return crypto.createHash("sha256").update("nkr-ratelimit-2026:" + ip).digest("hex");
}

async function pruefeUndProtokolliereRateLimit(ip) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) return { erlaubt: true }; // fail-open, siehe Kommentar oben

  const hash = ipHash(ip);
  const headers = { apikey: supabaseKey, Authorization: "Bearer " + supabaseKey, "Content-Type": "application/json" };

  try {
    const seit = new Date(Date.now() - RATE_LIMIT_FENSTER_MIN * 60 * 1000).toISOString();
    const zaehlRes = await fetch(
      supabaseUrl + "/rest/v1/nkr_foto_ratelimit?ip_hash=eq." + hash + "&created_at=gte." + encodeURIComponent(seit) + "&select=id",
      { headers }
    );
    if (zaehlRes.ok) {
      const rows = await zaehlRes.json();
      if (rows.length >= RATE_LIMIT_MAX_AUFRUFE) return { erlaubt: false };
    }

    // Aufruf protokollieren (für die nächste Prüfung) — bewusst NICHT awaiten
    // lassen, das Ergebnis blockiert die Kernfunktion nicht.
    fetch(supabaseUrl + "/rest/v1/nkr_foto_ratelimit", {
      method: "POST", headers, body: JSON.stringify({ ip_hash: hash }),
    }).catch(() => {});

    // Best-effort-Aufräumen alter Zeilen (>24h) — kein eigener Cron-Job nötig,
    // läuft einfach bei Gelegenheit mit, Fehler hier sind unkritisch.
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    fetch(supabaseUrl + "/rest/v1/nkr_foto_ratelimit?created_at=lt." + encodeURIComponent(cutoff), {
      method: "DELETE", headers,
    }).catch(() => {});

    return { erlaubt: true };
  } catch (err) {
    console.error("Rate-Limit-Prüfung fehlgeschlagen (fail-open):", err.message);
    return { erlaubt: true };
  }
}

// Kürzt einen Hinweistext bei Bedarf am letzten Wortende vor dem Limit statt
// hart mitten im Wort (Ursache des früher gemeldeten "...und Feld heizu"-
// Abbruchs). Der Prompt verlangt ohnehin kurze Sätze (max. 12 Wörter, ca.
// 90-100 Zeichen) — 140 Zeichen lassen etwas Puffer, ohne dass diese
// Sicherheitsnetz-Kürzung im Normalfall überhaupt greifen sollte.
function kuerzeHinweis(text, max = 140) {
  if (text.length <= max) return text;
  const geschnitten = text.slice(0, max);
  const letzterLeerraum = geschnitten.lastIndexOf(" ");
  const basis = letzterLeerraum > 40 ? geschnitten.slice(0, letzterLeerraum) : geschnitten;
  return basis.trim() + "…";
}

function posteneKatalogFuerPrompt() {
  return ALLE_POSTEN
    .map(p => `- ${p.key}: "${p.label}"${p.aliases ? " (auch genannt: " + p.aliases.join(", ") + ")" : ""}`)
    .join("\n");
}

// STRUKTURIERTE AUSGABE ÜBER TOOL-USE (08/2026, siehe CHANGELOG.md):
// Der ursprüngliche Ansatz ("gib nur JSON zurück" als Textanweisung + selbst
// die erste { bis letzte } aus dem Antworttext herausschneiden) scheiterte
// bei Stefans zweitem Live-Test erneut — diesmal nachweislich NICHT wegen
// abgeschnittener Antwort (stop_reason war nicht "max_tokens"), sondern
// vermutlich wegen eines Formatierungs-Ausreißers im freien Text (z.B.
// Markdown-Codeblock drumherum, ein Erklärsatz mit eigenen geschweiften
// Klammern, oder ein nicht sauber escapetes Zeichen in einem "hinweise"-Satz).
// Freitext-JSON ist strukturell fragil, das lässt sich nicht zuverlässig
// per Prompt-Wortwahl beheben.
// Stattdessen jetzt Anthropics "tool use": Der KI wird ein Werkzeug mit
// festem Eingabe-Schema vorgegeben und per tool_choice erzwungen — die
// Antwort kommt dann als von Anthropic selbst validiertes JSON-Objekt
// zurück (aiJson.content[].input), kein eigenes Parsen aus Freitext mehr
// nötig. Das ist der von Anthropic vorgesehene Weg für strukturierte
// Datenextraktion, nicht nur eine bessere Prompt-Formulierung.
const TOOL_NAME = "melde_abrechnungsdaten";
const TOOLS = [{
  name: TOOL_NAME,
  description: "Trägt die aus den Fotos der Nebenkostenabrechnung erkannten Daten strukturiert ein.",
  input_schema: {
    type: "object",
    properties: {
      wohnung: {
        type: "object",
        description: "Angaben zur Wohnung, falls auf den Fotos erkennbar. Unbekannte Werte als leerer String.",
        properties: {
          flaeche: { type: "string", description: "Wohnfläche in m² als Zahl-String, z.B. \"75.5\", oder \"\" wenn nicht gefunden" },
          jahr: { type: "string", description: "Abrechnungsjahr, 4-stellig, z.B. \"2024\", oder \"\" wenn nicht gefunden" },
          vorauszahlung: { type: "string", description: "Summe der geleisteten Vorauszahlungen/Abschläge als Zahl-String, z.B. \"2400\", oder \"\" wenn nicht gefunden" },
          gesamtsummeLautAbrechnung: { type: "string", description: "Die GEDRUCKTE Gesamt-/Endsumme aller umlagefähigen Kosten laut Abrechnungsergebnis (z.B. Zeile 'Summe' oder 'Gesamtkosten' im Abrechnungsergebnis, meist auf der ersten Seite). Nur eintragen, wenn eine einzelne, eindeutige Endsumme klar aufgedruckt ist — NICHT selbst berechnen oder aus Einzelposten zusammenzählen. Wenn es KEINE einzelne Gesamtsumme gibt, hier \"\" lassen und stattdessen teilsummenLautAbrechnung befüllen." },
          teilsummenLautAbrechnung: {
            type: "array",
            description: "NUR falls es KEINE einzelne Gesamtsumme gibt (siehe oben): Liste der auf der Abrechnung gedruckten Kategorie-Zwischensummen, z.B. 'Betriebskosten', 'Heizkosten/Wasserkosten', 'Kaltwasserkosten' — jede mit ihrer Bezeichnung wie gedruckt und ihrem Betrag. NUR eindeutig gedruckte Zwischensummen-Zeilen, NIEMALS selbst berechnete Summen. Wenn es sowohl eine Gesamtsumme als auch solche Kategorie-Zwischensummen gibt, hier ein leeres Array lassen (sonst würde beim Aufaddieren doppelt gezählt, da die Gesamtsumme diese Kategorien meist schon enthält). Leeres Array, wenn auch das nicht zu finden ist.",
            items: {
              type: "object",
              properties: {
                label: { type: "string", description: "Bezeichnung der Zwischensumme wie auf der Abrechnung gedruckt, z.B. \"Betriebskosten\"" },
                betrag: { type: "string", description: "Betrag als Zahl-String, z.B. \"1722.56\"" },
              },
              required: ["label", "betrag"],
            },
          },
        },
        required: ["flaeche", "jahr", "vorauszahlung", "gesamtsummeLautAbrechnung", "teilsummenLautAbrechnung"],
      },
      werte: {
        type: "object",
        description: "Erkannte Kostenpositionen. NUR die im Prompt genannten Keys verwenden, nur mit tatsächlich gefundenem Betrag > 0. Betrag als Zahl-String mit Punkt als Dezimaltrennzeichen, z.B. \"437.15\".",
        additionalProperties: { type: "string" },
      },
      hinweise: {
        type: "array",
        description: "Kurze, konkrete Sätze zu Bild-/Lesbarkeitsproblemen einzelner Fotos. Leeres Array, wenn alle Fotos gut lesbar waren.",
        items: { type: "string" },
      },
    },
    required: ["wohnung", "werte", "hinweise"],
  },
}];

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://nebenkostenradar.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Foto-Erkennung ist derzeit nicht verfügbar." });

  // "dateien" statt "bilder" (08/2026, siehe CHANGELOG.md) — PDF-Unterstützung
  // dazugekommen, jeder Eintrag { typ: "bild"|"pdf", daten: base64 }.
  const { dateien } = req.body || {};
  if (!Array.isArray(dateien) || dateien.length === 0) {
    return res.status(400).json({ error: "Keine Dateien übermittelt" });
  }
  if (dateien.length > 6) {
    return res.status(400).json({ error: "Maximal 6 Dateien pro Durchlauf" });
  }
  // Serverseitige Wiederholung der clientseitigen PDF-Größenprüfung (Wohnung.jsx,
  // MAX_PDF_MB) — der Client-Check lässt sich umgehen (z.B. direkter API-Aufruf),
  // hier greift er auf jeden Fall. Grenze: Vercels festes 4,5-MB-Body-Limit für
  // die GESAMTE Anfrage, nicht nur diese eine Datei; 3 MB Rohgröße (~4 MB nach
  // Base64) lässt Puffer für weitere Dateien im selben Durchlauf.
  const MAX_PDF_MB = 3;
  for (const d of dateien) {
    if (d?.typ === "pdf" && typeof d.daten === "string" && d.daten.length > MAX_PDF_MB * 1024 * 1024 * 1.4) {
      return res.status(400).json({
        error: `Eine PDF-Datei ist über ${MAX_PDF_MB} MB groß. Bitte nur die Seite(n) mit der Kostenaufstellung hochladen, Einzel- oder Detailaufstellungen zu bestimmten Positionen werden für die Erkennung nicht benötigt.`,
      });
    }
  }

  const clientIp = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket?.remoteAddress || "unbekannt";
  const rateLimit = await pruefeUndProtokolliereRateLimit(clientIp);
  if (!rateLimit.erlaubt) {
    return res.status(429).json({ error: "Zu viele Foto-Analysen von dieser Verbindung. Bitte in einer Stunde erneut versuchen oder die Werte manuell eingeben." });
  }

  const prompt = `Du liest Fotos und/oder PDF-Seiten einer deutschen Nebenkostenabrechnung (Betriebskostenabrechnung) und extrahierst daraus strukturierte Daten. Trage das Ergebnis über das Werkzeug "${TOOL_NAME}" ein.

Für "werte" darfst du AUSSCHLIESSLICH die folgenden Keys verwenden, gewählt nach der Bezeichnung/den Alternativbegriffen, wie sie auf der Abrechnung stehen. Nur Keys mit tatsächlich gefundenem Betrag > 0 aufnehmen, alle anderen weglassen:

${posteneKatalogFuerPrompt()}

Wichtige Regeln:
- Nebenkostenabrechnungen zeigen pro Zeile oft MEHRERE Beträge nebeneinander (z.B. "Gesamtkosten" für das ganze Gebäude/alle Einheiten, dann Umlageschlüssel/Verteilerangaben, dann erst der Anteil DIESES Mieters). Verwende IMMER nur die Spalte mit dem Anteil dieses einen Mieters (oft die letzte/rechte Spalte, beschriftet z.B. "Ihre Kosten", "Ihr Anteil", "Kosten Mieter" o.ä.). Verwende NIEMALS die Gesamtkosten-Spalte für das ganze Gebäude, auch wenn sie optisch näher an der Postenbezeichnung steht.
- Wenn ein Posten auf der Abrechnung in "Grundanteil" + "Verbrauchsanteil" aufgeteilt ist (z.B. bei Heizung oder Warmwasser), addiere beide zu einem Gesamtbetrag für den jeweiligen Key — aber NUR die Zeilen, die zu genau diesem einen Key gehören (z.B. nur "Heizung Grundanteil" + "Heizung Verbrauchsanteil" für Heizkosten, nur "Warmwasser Grundanteil" + "Warmwasser Verbrauchsanteil" für Warmwasser).
- Manche Abrechnungen drucken zusätzlich eine gemeinsame Zwischensumme, die mehrere unserer Keys zusammenfasst (z.B. eine Zeile "Summe Heizkosten/Warmwasserkosten", die Heizung UND Warmwasser gemeinsam enthält). Verwende eine solche gemeinsame Zwischensumme NIEMALS direkt als Wert für einen einzelnen Key — sie ist keine Erkennung für "Heizkosten" allein. Berechne stattdessen jeden Key ausschließlich aus seinen eigenen, klar mit ihm beschrifteten Unterzeilen. Wenn sich ein Betrag nur der gemeinsamen Zwischensumme entnehmen lässt, aber nicht den einzelnen Unterzeilen der betroffenen Keys, gilt die Regel unten (Key weglassen statt schätzen).
- Wenn du bei einem Betrag unsicher bist, welchem Key er zugeordnet werden soll, ODER wenn ein Gesamtbetrag auf mehrere unserer Keys aufgeteilt werden müsste, ohne dass die Abrechnung diese Aufteilung selbst vorgibt: LASS ALLE betroffenen Keys WEG statt zu schätzen oder zu raten. Ein fehlender Wert ist besser als ein falsch zugeordneter oder geschätzter.
- Erfinde keine Werte, die nicht auf den Fotos zu erkennen sind. Ein geschätzter Wert ist keine Erkennung.
- Zahlen im deutschen Format (z.B. "1.234,56") in reine Dezimalzahlen mit Punkt umwandeln (1234.56).
- Trage zusätzlich "gesamtsummeLautAbrechnung" ein, falls im Abrechnungsergebnis eine einzelne, eindeutig aufgedruckte Endsumme aller Kosten steht (oft ganz oben oder in einer Ergebnistabelle, Zeile "Summe"/"Gesamtkosten"/"Gesamtergebnis"). Diese Zahl dient NUR einem separaten Abgleich im Formular und beeinflusst "werte" nicht — verwende sie NICHT als Grundlage, um einzelne Keys in "werte" zu befüllen oder zu berechnen.

Lesbarkeit prüfen, aber die Hinweise EINFACH halten (wichtig, das lesen normale Nutzer, keine Techniker): Prüfe jedes Foto/jede PDF-Seite darauf, ob es vollständig lesbar ist. Bei Problemen (unscharf, zu dunkel, abgeschnitten, schräg fotografiert, überlagert, Beträge nicht eindeutig zuordenbar) trage GENAU EINEN kurzen Hinweis pro betroffener Datei in "hinweise" ein. Strikte Vorgaben für jeden Hinweis:
- Maximal 12 Wörter, ein einzelner kurzer Satz.
- Format: "Foto <Nummer>: <ein Grund in Alltagssprache>."
- KEINE Fachbegriffe, KEINE Posten-Namen, KEINE Beträge, KEINE Aufzählung mehrerer Probleme in einem Hinweis.
- Beispiele für den richtigen Ton: "Foto 2: war unscharf, bitte Werte unten prüfen." / "Foto 3: ein Betrag war nicht eindeutig zuzuordnen, bitte ergänzen."
Wenn dadurch einzelne Beträge unsicher sind, nimm sie NICHT in "werte" auf. Wenn alle Fotos gut lesbar sind, gib ein leeres Array für "hinweise" zurück. Falls eine zentrale Angabe (Wohnfläche, Abrechnungsjahr, Vorauszahlung, oder die Kostenaufstellung selbst) auf keinem Foto zu finden war, ebenfalls nur EIN kurzer Hinweis dazu, gleiche Vorgaben.`;

  // Bilder als "image"-Block, PDFs als eigener "document"-Block — beides
  // Standard-Content-Typen der Anthropic Messages API, Claude verarbeitet PDFs
  // nativ (jede Seite wird intern als Bild+Text gelesen), kein Umweg über eine
  // eigene PDF-zu-Bild-Konvertierung auf unserer Seite nötig.
  const content = [
    { type: "text", text: prompt },
    ...dateien.map(d => d.typ === "pdf"
      ? { type: "document", source: { type: "base64", media_type: "application/pdf", data: d.daten } }
      : { type: "image", source: { type: "base64", media_type: "image/jpeg", data: d.daten } }),
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
        // 4096 statt ursprünglich 3000 — bei echten, vollständigen Abrechnungen
        // mit vielen Posten braucht die strukturierte Antwort spürbar mehr
        // Platz als bei Testfotos ohne Abrechnungsinhalt.
        max_tokens: 4096,
        tools: TOOLS,
        tool_choice: { type: "tool", name: TOOL_NAME }, // erzwingt den Tool-Aufruf, keine freie Textantwort möglich
        messages: [{ role: "user", content }],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("Anthropic API Fehler:", aiRes.status, errText);
      return res.status(502).json({ error: "Die Erkennung war überlastet oder nicht erreichbar. Bitte erneut versuchen." });
    }

    const aiJson = await aiRes.json();
    const stopReason = aiJson?.stop_reason;
    // Bei erzwungenem tool_choice liefert Anthropic das Ergebnis als bereits
    // von Anthropic selbst validiertes JSON-Objekt im "input"-Feld des
    // tool_use-Blocks — kein eigenes Parsen von Freitext mehr nötig (siehe
    // Kommentar bei TOOLS oben, Grund für die Umstellung).
    const toolUse = (aiJson?.content || []).find(b => b.type === "tool_use" && b.name === TOOL_NAME);
    const parsed = toolUse?.input || null;
    if (!parsed) {
      // Diagnose fürs Vercel-Log: stop_reason "max_tokens" bedeutet, die Antwort
      // wurde mitten im Tool-Aufruf abgeschnitten (z.B. bei sehr vielen Fotos/
      // Posten gleichzeitig) — dann hilft nur weniger Fotos pro Durchlauf.
      // Jeder andere Grund ist bei erzwungenem Tool-Use unerwartet und sollte
      // im Log genauer angeschaut werden.
      console.error("analyse-foto: kein gültiger Tool-Aufruf in der Antwort. stop_reason:", stopReason);
      return res.status(502).json({
        error: stopReason === "max_tokens"
          ? "Die Abrechnung war zu umfangreich für einen Durchlauf. Bitte weniger Fotos gleichzeitig hochladen."
          : "Antwort konnte nicht gelesen werden. Bitte erneut versuchen.",
      });
    }

    // Serverseitige Absicherung: nur bekannte Keys, nur gültige Zahlen > 0 übernehmen.
    const werte = {};
    for (const [key, val] of Object.entries(parsed.werte || {})) {
      if (!GUELTIGE_KEYS.has(key)) continue;
      const n = toNum(val);
      if (n > 0) werte[key] = String(n);
    }

    const w = parsed.wohnung || {};
    // Gesamtsumme fürs Formular (siehe Wohnung.jsx/Posten.jsx): bevorzugt die
    // direkt gedruckte Gesamtsumme, falls vorhanden. Viele Abrechnungen haben
    // aber KEINE einzelne Endsumme, sondern nur Zwischensummen pro Kategorie
    // (z.B. "Betriebskosten", "Heizkosten/Wasserkosten") — in dem Fall werden
    // diese stattdessen aufaddiert. Der Prompt weist die KI ausdrücklich an,
    // nur EINE der beiden Quellen zu befüllen, nie beide gleichzeitig (sonst
    // Doppelzählung, wenn die Gesamtsumme die Kategorien schon enthält).
    const teilsummen = Array.isArray(w.teilsummenLautAbrechnung) ? w.teilsummenLautAbrechnung : [];
    const teilsummenSumme = teilsummen.reduce((s, t) => s + toNum(t?.betrag), 0);
    const gesamtsummeDirekt = toNum(w.gesamtsummeLautAbrechnung);
    const gesamtsummeLautAbrechnung = gesamtsummeDirekt > 0 ? gesamtsummeDirekt : teilsummenSumme;

    const wohnung = {
      flaeche: toNum(w.flaeche) > 0 ? String(toNum(w.flaeche)) : "",
      jahr: /^\d{4}$/.test(String(w.jahr || "").trim()) ? String(w.jahr).trim() : "",
      vorauszahlung: toNum(w.vorauszahlung) > 0 ? String(toNum(w.vorauszahlung)) : "",
      gesamtsummeLautAbrechnung: gesamtsummeLautAbrechnung > 0 ? String(gesamtsummeLautAbrechnung) : "",
    };

    // Hinweise zur Bildqualität: nur Strings, auf plausible Länge/Anzahl
    // begrenzt (Absicherung gegen unerwartete/übergroße Antworten). Der
    // Prompt verlangt jetzt ohnehin kurze, einfache Sätze (max. 12 Wörter) —
    // dieses Limit ist nur noch das Sicherheitsnetz, falls sich die KI trotzdem
    // nicht daran hält. Wichtig: mit sauberem Wortumbruch statt hartem
    // slice() mitten im Wort (kam vor: "...und Feld heizu" abgeschnitten).
    const hinweise = Array.isArray(parsed.hinweise)
      ? parsed.hinweise.filter(h => typeof h === "string" && h.trim()).slice(0, 10).map(h => kuerzeHinweis(h.trim()))
      : [];

    const anzahlErkannt = Object.keys(werte).length;
    return res.status(200).json({ wohnung, werte, anzahlErkannt, hinweise });
  } catch (err) {
    console.error("analyse-foto Fehler:", err.message);
    return res.status(500).json({ error: "Foto-Erkennung fehlgeschlagen" });
  }
}
