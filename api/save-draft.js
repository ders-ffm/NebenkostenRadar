// ─────────────────────────────────────────────────────────────────────────
// save-draft.js — NEU (30.08.2026, siehe projektdokumentation-nkr.md
// Abschnitt 9, UX-Test-Nachtrag): Speichert einen NICHT bezahlten Zwischen-
// stand (Wohnung/Posten/Gesamtsumme), damit ein Nutzer die Prüfung über den
// "Später fortsetzen"-Link (Result.jsx) auf einem anderen Gerät oder zu
// einem späteren Zeitpunkt fortsetzen kann, ohne alles neu einzutippen.
//
// BEWUSST GETRENNT von save-report.js/get-report.js/nkr_reports:
//   - nkr_reports ist an eine bezahlte Stripe-Session gebunden und braucht
//     deshalb eine serverseitige Zahlungsprüfung (siehe get-report.js).
//   - Ein Entwurf hier ist NICHT bezahlt, hat keinen Bezug zu einer Zahlung
//     und braucht deshalb auch keine Zahlungsprüfung — Sicherheit kommt
//     stattdessen allein aus der Unratbarkeit der ID (siehe unten).
//   - Getrennte Tabelle (nkr_drafts) mit eigener, kurzer Löschfrist (siehe
//     scripts/datenloeschung.mjs) — ein Entwurf ist per Definition flüchtig,
//     eine 365-Tage-Aufbewahrung wie bei bezahlten Berichten wäre hier nicht
//     durch einen Zweck gedeckt (Grundsatz der Speicherbegrenzung, Art. 5
//     Abs. 1 lit. e DSGVO).
//
// Sicherheit der ID: Wird clientseitig per crypto.randomUUID() erzeugt
// (122 Bit Zufall) — praktisch nicht erratbar, vergleichbar mit einem
// Freigabe-Link bei Google Drive/Dropbox. Kein Konto, kein Passwort nötig.
//
// EINMALIGER MANUELLER SCHRITT (Stefan, im Supabase-Dashboard → SQL Editor):
//   create table nkr_drafts (
//     id text primary key,
//     wohnung jsonb,
//     werte jsonb,
//     gesamtsumme_abrechnung text,
//     created_at timestamptz default now()
//   );
// Ohne diese Tabelle schlägt der Insert unten fehl (Supabase lehnt unbekannte
// Tabellen ab) — analog zum bereits bekannten Muster bei nkr_reports/
// widerruf_ok (siehe CHANGELOG.md).
// ─────────────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://nebenkostenradar.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { id, wohnung, werte, gesamtsummeAbrechnung } = req.body || {};
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Grobe Formprüfung der ID: muss vom Client als UUID erzeugt worden sein,
  // kein frei wählbarer/kurzer Wert — sonst könnte jemand gezielt kurze IDs
  // durchprobieren und fremde Entwürfe lesen.
  const gueltigeId = typeof id === "string" && /^[0-9a-f-]{20,60}$/i.test(id);

  if (!gueltigeId || !supabaseUrl || !supabaseKey) {
    return res.status(400).json({ error: "Fehlende oder ungültige Parameter" });
  }

  try {
    const supabaseRes = await fetch(supabaseUrl + "/rest/v1/nkr_drafts", {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: "Bearer " + supabaseKey,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        id,
        wohnung,
        werte,
        gesamtsumme_abrechnung: gesamtsummeAbrechnung || null,
        created_at: new Date().toISOString(),
      }),
    });
    if (!supabaseRes.ok) {
      const err = await supabaseRes.text();
      console.error("Supabase Fehler (save-draft):", err);
      return res.status(500).json({ error: "Speichern fehlgeschlagen" });
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Fehler (save-draft):", err.message);
    return res.status(500).json({ error: err.message });
  }
}
