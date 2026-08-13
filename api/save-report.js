// ─────────────────────────────────────────────────────────────────────────
// save-report.js — Speichert Eingabedaten VOR dem Stripe-Redirect.
//
// Geändert 08/2026: Speichert jetzt die Roh-Eingabedaten (werte, wohnung,
// adressen, stufe) statt fertigen Text — das PDF wird erst nach der Zahlung
// in Download.jsx aus diesen Daten erzeugt (client-seitig, react-pdf).
// Löschung nach 1 Jahr: siehe geplanten Cron-Job (Task "Automatisierte
// Löschung von Kundendaten nach 1 Jahr") — separat einzurichten, z.B. als
// täglicher Vercel Cron Job, der Zeilen älter als 365 Tage löscht.
// ─────────────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://nebenkostenradar.com");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const { sessionId, stufe, adressen, werte, wohnung, marketingOptIn, widerrufOk } = req.body || {};
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!sessionId || !supabaseUrl || !supabaseKey) {
    return res.status(400).json({ error: "Fehlende Parameter" });
  }

  try {
    const supabaseRes = await fetch(supabaseUrl + "/rest/v1/nkr_reports", {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: "Bearer " + supabaseKey,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        session_id: sessionId,
        stufe,
        adressen,
        werte,
        wohnung,
        marketing_opt_in: !!marketingOptIn,
        // Nachweis der Zustimmung zum vorzeitigen Erlöschen des Widerrufsrechts
        // (§ 356 Abs. 5 BGB) — Zeitstempel ist server-seitig (created_at unten),
        // nicht vom Client übernommen, damit er im Streitfall belastbar ist.
        widerruf_ok: !!widerrufOk,
        created_at: new Date().toISOString(),
      }),
    });
    if (!supabaseRes.ok) {
      const err = await supabaseRes.text();
      console.error("Supabase Fehler:", err);
      return res.status(500).json({ error: "Speichern fehlgeschlagen" });
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Fehler:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
