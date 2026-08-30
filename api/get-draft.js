// ─────────────────────────────────────────────────────────────────────────
// get-draft.js — NEU (30.08.2026). Gegenstück zu save-draft.js: liest einen
// zuvor gespeicherten, NICHT bezahlten Zwischenstand über seine ID zurück.
// Aufruf: GET /api/get-draft?id=<uuid> (siehe App.jsx, "?fortsetzen="-Link).
//
// Kein Zahlungs-/Login-Check nötig (siehe ausführliche Begründung in
// save-draft.js) — die ID selbst ist das einzige "Geheimnis", genau wie bei
// einem Cloud-Freigabe-Link. Wer die ID nicht kennt, kann sie nicht erraten.
// ─────────────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://nebenkostenradar.com");
  if (req.method !== "GET") return res.status(405).end();

  const id = req.query.id;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!id || !supabaseUrl || !supabaseKey) {
    return res.status(400).json({ error: "Fehlende Parameter" });
  }

  try {
    const supabaseRes = await fetch(
      supabaseUrl + "/rest/v1/nkr_drafts?id=eq." + encodeURIComponent(id) + "&select=*",
      { headers: { apikey: supabaseKey, Authorization: "Bearer " + supabaseKey } }
    );
    if (!supabaseRes.ok) return res.status(500).json({ error: "Datenbankfehler" });
    const rows = await supabaseRes.json();
    if (!rows.length) return res.status(404).json({ error: "Entwurf nicht gefunden" });

    const row = rows[0];
    return res.status(200).json({
      wohnung: row.wohnung,
      werte: row.werte,
      gesamtsummeAbrechnung: row.gesamtsumme_abrechnung,
    });
  } catch (err) {
    console.error("Fehler (get-draft):", err.message);
    return res.status(500).json({ error: err.message });
  }
}
