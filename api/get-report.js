// ─────────────────────────────────────────────────────────────────────────
// get-report.js — NEU (08/2026). Wird von Download.jsx nach dem Stripe-
// Redirect aufgerufen, um die zuvor gespeicherten Eingabedaten zurückzuholen.
//
// Ablauf:
//   1. Prüft über die Stripe-API, ob die Checkout-Session ("session"-Query-
//      Parameter, von Stripe an die success_url angehängt) tatsächlich
//      bezahlt wurde — OHNE das würde jeder durch Erraten einer beliebigen
//      Session-ID an fremde Daten kommen können.
//   2. Liest darüber die eigene sessionId (client_reference_id) aus.
//   3. Holt die zugehörige Zeile aus Supabase und gibt sie zurück.
//
// WICHTIG — Stripe-Konfiguration nötig (im Stripe-Dashboard, kein Code):
//   Bei beiden Payment Links unter "Nach der Zahlung" die Erfolgsseite auf
//   https://nebenkostenradar.com/pruefen/download?session={CHECKOUT_SESSION_ID}
//   setzen, damit die Session-ID hier ankommt.
//
// Benötigt Umgebungsvariable STRIPE_SECRET_KEY (im Vercel-Dashboard unter
// Environment Variables eintragen, NIEMALS im Code).
// ─────────────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://nebenkostenradar.com");
  if (req.method !== "GET") return res.status(405).end();

  const stripeSessionId = req.query.session;
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!stripeSessionId || !stripeKey || !supabaseUrl || !supabaseKey) {
    return res.status(400).json({ error: "Fehlende Parameter" });
  }

  try {
    // 1. Zahlung bei Stripe verifizieren
    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions/" + stripeSessionId, {
      headers: { Authorization: "Bearer " + stripeKey },
    });
    if (!stripeRes.ok) return res.status(404).json({ error: "Session nicht gefunden" });
    const session = await stripeRes.json();

    if (session.payment_status !== "paid") {
      return res.status(402).json({ error: "Zahlung noch nicht abgeschlossen" });
    }

    const ourSessionId = session.client_reference_id;
    if (!ourSessionId) return res.status(400).json({ error: "Keine Referenz-ID gefunden" });

    // 2. Gespeicherte Eingabedaten aus Supabase holen
    const supabaseRes = await fetch(
      supabaseUrl + "/rest/v1/nkr_reports?session_id=eq." + encodeURIComponent(ourSessionId) + "&select=*",
      { headers: { apikey: supabaseKey, Authorization: "Bearer " + supabaseKey } }
    );
    if (!supabaseRes.ok) return res.status(500).json({ error: "Datenbankfehler" });
    const rows = await supabaseRes.json();
    if (!rows.length) return res.status(404).json({ error: "Keine Daten gefunden" });

    const row = rows[0];
    // Marketing-Opt-in-Protokollierung (nkr_purchases) übernimmt seit der
    // Variante-B-Umstellung api/webhook.js — läuft server-seitig direkt bei
    // Zahlungseingang, unabhängig davon, ob/wann der Kunde diese Seite lädt.

    return res.status(200).json({
      sessionId: ourSessionId,
      werte: row.werte,
      wohnung: row.wohnung,
      adressen: row.adressen,
      stufe: row.stufe,
      // Eigene, per Doppel-Eingabe geprüfte E-Mail-Adresse (siehe Adressen.jsx) —
      // zuverlässiger als die von Stripe, die nicht gegengeprüft wird.
      email: row.adressen?.email || null,
      emailBereitsVersendet: !!row.email_sent,
    });
  } catch (err) {
    console.error("get-report Fehler:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
