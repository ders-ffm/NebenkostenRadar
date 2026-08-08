// NebenkostenRadar — Kontaktformular (Impressum) → E-Mail an support@nebenkostenradar.com
// Zweiter Kontaktweg neben der direkten E-Mail-Adresse, Pflicht nach § 5 DDG
// (EuGH-Rechtsprechung: zwei Kontaktmöglichkeiten erforderlich).
// Vercel Environment Variable: RESEND_API_KEY (bereits gesetzt, gleiche wie send-email.js)
//
// UNVERÄNDERT übernommen (08/2026) — passt exakt zum Datenformat, das
// src/pages/Impressum.jsx sendet ({ name, email, message }). Keine Anpassung nötig.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://nebenkostenradar.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();
  const { name, email, message } = req.body || {};
  const resendKey = process.env.RESEND_API_KEY;
  if (!email || !resendKey) {
    return res.status(400).json({ error: 'E-Mail oder API Key fehlt' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Ungueltige E-Mail-Adresse' });
  }
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Nachricht fehlt' });
  }
  // Einfacher Schutz gegen übermäßig lange Eingaben (kein Rate-Limiting, aber genügt für 1-Personen-Betrieb)
  const safeName = String(name || 'Kein Name angegeben').slice(0, 200).replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeEmail = String(email).slice(0, 200).replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeMessage = String(message).slice(0, 5000).replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const html = `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:'Segoe UI','Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
  <tr><td style="background:#ffffff;border-radius:12px 12px 0 0;padding:24px 32px;border-bottom:2px solid #dde1e7;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td><table cellpadding="0" cellspacing="0"><tr>
        <td style="width:38px;height:38px;">
          <img src="https://nebenkostenradar.com/logo-email.png" width="38" height="38" alt="NebenkostenRadar" style="display:block;border-radius:8px;">
        </td>
        <td style="padding-left:10px;">
          <div style="font-size:17px;font-weight:800;color:#1a1a1a;">Nebenkosten<span style="color:#2d7a4f;">Radar</span></div>
          <div style="font-size:10px;color:#2d7a4f;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;">Neue Kontaktanfrage</div>
        </td>
      </tr></table></td>
    </tr></table>
  </td></tr>
  <tr><td style="background:#ffffff;padding:28px 32px;">
    <div style="background:#F3ECDC;border:1px solid #E3D9C6;border-radius:8px;padding:14px 18px;margin-bottom:20px;">
      <div style="font-size:15px;font-weight:700;color:#2d7a4f;margin-bottom:3px;">Neue Nachricht über das Kontaktformular</div>
      <div style="font-size:12px;color:#555e68;">Eingegangen über nebenkostenradar.com/impressum</div>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
      <tr><td style="font-size:12px;color:#8a9199;padding-bottom:4px;">Name</td></tr>
      <tr><td style="font-size:14px;color:#1a1a1a;font-weight:600;padding-bottom:14px;">${safeName}</td></tr>
      <tr><td style="font-size:12px;color:#8a9199;padding-bottom:4px;">E-Mail (Antwort an)</td></tr>
      <tr><td style="font-size:14px;color:#1a1a1a;font-weight:600;padding-bottom:14px;"><a href="mailto:${safeEmail}" style="color:#2d7a4f;">${safeEmail}</a></td></tr>
    </table>
    <div style="font-size:12px;font-weight:700;color:#1a1a1a;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px;">Nachricht</div>
    <div style="background:#fafafa;border:1px solid #dde1e7;border-radius:8px;padding:16px;font-size:14px;color:#1a1a1a;line-height:1.7;white-space:pre-wrap;">${safeMessage}</div>
  </td></tr>
  <tr><td style="background:#f8f9fa;border-radius:0 0 12px 12px;padding:18px 32px;border-top:1px solid #dde1e7;">
    <p style="font-size:11px;color:#8a9199;margin:0;line-height:1.8;text-align:center;">
      Automatisch generiert vom Kontaktformular auf nebenkostenradar.com/impressum
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'NebenkostenRadar Kontaktformular <noreply@nebenkostenradar.com>',
        to: 'support@nebenkostenradar.com',
        reply_to: email,
        subject: 'Neue Kontaktanfrage von ' + safeName,
        html,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error('Resend Fehler (contact):', JSON.stringify(data));
      return res.status(500).json({ error: 'Nachricht konnte nicht gesendet werden' });
    }
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Fehler (contact):', err.message);
    return res.status(500).json({ error: err.message });
  }
}
