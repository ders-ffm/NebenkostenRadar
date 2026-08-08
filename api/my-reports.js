// ─────────────────────────────────────────────────────────────────────────
// my-reports.js — NEU (08/2026). Liefert alle früheren Berichte des
// eingeloggten Kunden (Kundenkonto, siehe Konto.jsx).
//
// Sicherheit: Die E-Mail-Adresse kommt NICHT vom Client (wäre fälschbar —
// jeder könnte behaupten, eine fremde E-Mail-Adresse zu sein). Stattdessen
// wird das Supabase-Auth-Access-Token, das der Client nach dem Magic-Link-
// Login besitzt, gegen Supabase selbst verifiziert (GoTrue /auth/v1/user).
// Erst die von Supabase bestätigte E-Mail-Adresse wird für die Abfrage
// verwendet.
//
// Aufruf: GET /api/my-reports, Header "Authorization: Bearer <access_token>"
//
// Benötigt SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (bereits vorhanden).
// ─────────────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://nebenkostenradar.com");
  if (req.method !== "GET") return res.status(405).end();

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const authHeader = req.headers.authorization || "";
  const accessToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!accessToken || !supabaseUrl || !supabaseKey) {
    return res.status(401).json({ error: "Nicht angemeldet" });
  }

  try {
    // 1. Access-Token bei Supabase selbst verifizieren und die ECHTE,
    // bestätigte E-Mail-Adresse holen — niemals einer vom Client
    // mitgeschickten E-Mail-Adresse vertrauen.
    const userRes = await fetch(supabaseUrl + "/auth/v1/user", {
      headers: { apikey: supabaseKey, Authorization: "Bearer " + accessToken },
    });
    if (!userRes.ok) return res.status(401).json({ error: "Sitzung abgelaufen — bitte erneut anmelden" });
    const user = await userRes.json();
    const email = user.email;
    if (!email) return res.status(401).json({ error: "Keine E-Mail-Adresse in der Sitzung gefunden" });

    // 2. Alle Berichte holen, deren gespeicherte Absender-E-Mail dazu passt
    const reportsRes = await fetch(
      supabaseUrl + "/rest/v1/nkr_reports?adressen->>email=eq." + encodeURIComponent(email) +
        "&select=session_id,werte,wohnung,adressen,stufe,created_at&order=created_at.desc",
      { headers: { apikey: supabaseKey, Authorization: "Bearer " + supabaseKey } }
    );
    if (!reportsRes.ok) return res.status(500).json({ error: "Datenbankfehler" });
    const rows = await reportsRes.json();

    return res.status(200).json({ email, berichte: rows });
  } catch (err) {
    console.error("my-reports Fehler:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
