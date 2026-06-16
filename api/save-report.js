// Bericht + Brief vor Stripe-Redirect speichern
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://nebenkostenradar.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { sessionId, email, brief, bericht } = req.body || {};
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!sessionId || !supabaseUrl || !supabaseKey) {
    return res.status(400).json({ error: 'Fehlende Parameter' });
  }

  try {
    const supabaseRes = await fetch(`${supabaseUrl}/rest/v1/nkr_reports`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify({ session_id: sessionId, email, brief, bericht }),
    });

    if (!supabaseRes.ok) {
      const err = await supabaseRes.text();
      console.error('Supabase Fehler:', err);
      return res.status(500).json({ error: 'Speichern fehlgeschlagen' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Fehler:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
