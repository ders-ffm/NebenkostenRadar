// ─────────────────────────────────────────────────────────────────────────
// marketing-abmelden.js — NEU (08/2026). Pflicht-Abmeldelink für die
// Rabatt-Mail (10 Monate nach Kauf, siehe scripts/marketing-rabatt-versand.mjs).
//
// Aufruf: GET /api/marketing-abmelden?s=<sessionId>  (sessionId = unsere
// eigene, in der Mail verlinkte session_id — nicht die Stripe-Session-ID).
//
// Setzt "abgemeldet" für ALLE nkr_purchases-Zeilen mit derselben
// E-Mail-Adresse (nicht nur die eine Bestellung), damit ein einmaliger Klick
// wirklich zuverlässig jede künftige Marketing-Mail an diese Adresse stoppt.
//
// Gibt direkt eine kleine Bestätigungsseite zurück (kein Login nötig, wie
// bei Abmeldelinks üblich) — bewusst KEINE React-Route, da eigenständig per
// E-Mail-Klick aufgerufen.
// ─────────────────────────────────────────────────────────────────────────
function seite(text) {
  return `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Abmeldung — NebenkostenRadar</title></head>
<body style="font-family:'Segoe UI',Arial,sans-serif;background:#FBF7F0;color:#2E2A22;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:24px;">
<div style="max-width:420px;text-align:center;background:#fff;border:1px solid #E3D9C6;border-radius:12px;padding:32px 28px;">
<div style="width:50px;height:50px;border-radius:50%;background:#EAF4EE;border:2px solid #3d7a5c;display:flex;align-items:center;justify-content:center;font-size:22px;margin:0 auto 16px;">✓</div>
<p style="font-size:14px;line-height:1.6;margin:0;">${text}</p>
<a href="https://nebenkostenradar.com" style="display:inline-block;margin-top:20px;color:#3d7a5c;font-size:13px;">Zur Startseite</a>
</div></body></html>`;
}

export default async function handler(req, res) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  const sessionId = req.query.s;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!sessionId || !supabaseUrl || !supabaseKey) {
    return res.status(400).send(seite("Dieser Abmeldelink ist ungültig. Schreib uns gerne: support@nebenkostenradar.com"));
  }

  try {
    // E-Mail-Adresse zur session_id ermitteln
    const findRes = await fetch(
      supabaseUrl + "/rest/v1/nkr_purchases?session_id=eq." + encodeURIComponent(sessionId) + "&select=email",
      { headers: { apikey: supabaseKey, Authorization: "Bearer " + supabaseKey } }
    );
    const rows = await findRes.json();
    if (!findRes.ok || !rows.length) {
      return res.status(200).send(seite("Dieser Abmeldelink wurde bereits verwendet oder ist abgelaufen. Du bekommst ohnehin keine weiteren Rabatt-Mails von uns."));
    }
    const email = rows[0].email;

    // Für ALLE Zeilen mit dieser E-Mail-Adresse abmelden (nicht nur diese eine Bestellung)
    await fetch(
      supabaseUrl + "/rest/v1/nkr_purchases?email=eq." + encodeURIComponent(email),
      {
        method: "PATCH",
        headers: {
          apikey: supabaseKey,
          Authorization: "Bearer " + supabaseKey,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ abgemeldet: true }),
      }
    );

    return res.status(200).send(seite("Du wurdest erfolgreich abgemeldet. Du erhältst keine Rabatt-Mails mehr von NebenkostenRadar."));
  } catch (err) {
    console.error("marketing-abmelden Fehler:", err.message);
    return res.status(500).send(seite("Da ist etwas schiefgelaufen. Schreib uns gerne: support@nebenkostenradar.com"));
  }
}
