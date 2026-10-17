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
// NUR BEZAHLTE BERICHTE (17.10.2026, siehe CHANGELOG.md):
// nkr_reports bekommt seine Zeile schon VOR der Zahlung (Adressen.jsx →
// save-report.js, danach Weiterleitung zu Stripe). Wer den Checkout
// abbrach und sich danach mit derselben E-Mail anmeldete, sah den Bericht
// trotzdem im Kundenkonto ("gekauft am …") und konnte das volle PDF samt
// Musterbrief kostenlos herunterladen. Jetzt werden nur Zeilen
// zurückgegeben, zu denen der Stripe-Webhook (webhook.js, signaturgeprüft)
// einen Kauf in nkr_purchases protokolliert hat.
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

    // 3. Nur Berichte mit protokolliertem Kauf (siehe Kopfkommentar)
    let bezahlt = new Set();
    if (rows.length) {
      const ids = rows.map(r => '"' + String(r.session_id).replace(/"/g, "") + '"').join(",");
      const kaufRes = await fetch(
        supabaseUrl + "/rest/v1/nkr_purchases?select=session_id&session_id=in.(" + encodeURIComponent(ids) + ")",
        { headers: { apikey: supabaseKey, Authorization: "Bearer " + supabaseKey } }
      );
      if (!kaufRes.ok) return res.status(500).json({ error: "Datenbankfehler" });
      bezahlt = new Set((await kaufRes.json()).map(k => k.session_id));
    }

    return res.status(200).json({ email, berichte: rows.filter(r => bezahlt.has(r.session_id)) });
  } catch (err) {
    console.error("my-reports Fehler:", err.message);
    return res.status(500).json({ error: "Interner Fehler" });
  }
}
