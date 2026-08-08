// ─────────────────────────────────────────────────────────────────────────
// send-email.js — Verschickt den fertigen Prüfbericht als echten PDF-Anhang.
//
// Geändert 08/2026 (wichtige Korrektur):
// Die Vorversion verschickte nur reinen Text (briefText/berichtText), der
// in HTML eingebettet wurde — es gab jedoch KEINEN einzigen Aufruf dieser
// Funktion irgendwo im Code. Download.jsx behauptete schon "wir haben es
// dir per E-Mail geschickt", obwohl nie eine E-Mail verschickt wurde
// (leeres Versprechen). Jetzt: echter PDF-Anhang (identisch mit dem
// Download-PDF), tatsächlich aus Download.jsx aufgerufen.
//
// Aufgerufen aus: src/pages/Download.jsx, NACHDEM die Zahlung über
// api/get-report.js verifiziert wurde. Deshalb hier KEINE eigene
// Zahlungsprüfung nötig — wird aber zusätzlich per sessionId+email_sent
// gegen doppeltes Verschicken abgesichert (z. B. wenn der Kunde die
// Download-Seite neu lädt oder den Link erneut öffnet).
//
// Benötigte Vercel Environment Variables:
//   RESEND_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//
// Benötigte Supabase-Spalte (falls noch nicht vorhanden):
//   ALTER TABLE nkr_reports ADD COLUMN email_sent boolean DEFAULT false;
// ─────────────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://nebenkostenradar.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { sessionId, email, pdfBase64, pdfFilename, stufe, vorname } = req.body || {};
  const resendKey = process.env.RESEND_API_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!sessionId || !email || !pdfBase64 || !resendKey || !supabaseUrl || !supabaseKey) {
    return res.status(400).json({ error: 'Fehlende Parameter' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Ungueltige E-Mail-Adresse' });
  }

  const anrede = vorname ? 'Hallo ' + String(vorname).slice(0, 100).replace(/</g, '&lt;').replace(/>/g, '&gt;') + ',' : 'Hallo,';

  try {
    // 1. Doppelversand verhindern: wurde für diese Session bereits verschickt?
    const checkRes = await fetch(
      supabaseUrl + '/rest/v1/nkr_reports?session_id=eq.' + encodeURIComponent(sessionId) + '&select=email_sent',
      { headers: { apikey: supabaseKey, Authorization: 'Bearer ' + supabaseKey } }
    );
    if (checkRes.ok) {
      const rows = await checkRes.json();
      if (rows[0]?.email_sent) {
        return res.status(200).json({ success: true, alreadySent: true });
      }
    }

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
          <div style="font-size:17px;font-weight:800;color:#1a1a1a;">Nebenkosten<span style="color:#3d7a5c;">Radar</span></div>
          <div style="font-size:10px;color:#3d7a5c;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;">nebenkostenradar.com</div>
        </td>
      </tr></table></td>
      <td align="right" style="font-size:11px;color:#8a9199;">Unabhängige Abrechnungsprüfung</td>
    </tr></table>
  </td></tr>
  <tr><td style="background:#ffffff;padding:28px 32px;">
    <p style="font-size:14px;color:#1a1a1a;margin:0 0 16px;">${anrede}</p>
    <div style="background:#F3ECDC;border:1px solid #E3D9C6;border-radius:8px;padding:14px 18px;margin-bottom:16px;">
      <div style="font-size:15px;font-weight:700;color:#3d7a5c;margin-bottom:3px;">&#10003; Dein Prüfbericht ist fertig</div>
      <div style="font-size:12px;color:#555e68;">
        ${stufe === 'voll'
          ? 'Im Anhang findest du dein PDF mit vollständiger Positionsübersicht und dem Musterbrief an deinen Vermieter.'
          : 'Im Anhang findest du dein PDF mit der vollständigen Positionsübersicht.'}
      </div>
    </div>
    <p style="font-size:13px;color:#1a1a1a;line-height:1.7;margin:0 0 20px;">
      Viele Grüße aus Frankfurt sendet dir das Team von<br>NebenkostenRadar
    </p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center">
        <a href="https://nebenkostenradar.com" style="display:inline-block;background:#B5502C;color:#ffffff;text-decoration:none;padding:13px 30px;border-radius:8px;font-size:14px;font-weight:700;">
          Neue Prüfung starten &#8594;
        </a>
      </td></tr>
    </table>
    <p style="font-size:11px;color:#8a9199;text-align:center;margin:14px 0 0;">
      Du kannst dich jederzeit unter <a href="https://nebenkostenradar.com/login" style="color:#3d7a5c;">nebenkostenradar.com/login</a> anmelden, um diesen Bericht erneut herunterzuladen.
    </p>
  </td></tr>
  <tr><td style="background:#fef3e2;padding:14px 32px;border-top:1px solid #dde1e7;">
    <p style="font-size:12px;color:#b45309;margin:0;line-height:1.6;">
      Kein Ersatz für Rechtsberatung. Deutscher Mieterbund:
      <a href="https://www.mieterbund.de" style="color:#b45309;">mieterbund.de</a> &middot; Tel. 030 223230
    </p>
  </td></tr>
  <tr><td style="background:#f8f9fa;border-radius:0 0 12px 12px;padding:18px 32px;border-top:1px solid #dde1e7;">
    <p style="font-size:11px;color:#8a9199;margin:0;line-height:1.8;text-align:center;">
      NebenkostenRadar &middot; Stefan Hennig &middot; Ludwigstr. 33-37, 60327 Frankfurt am Main<br>
      support@nebenkostenradar.com
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

    // 2. E-Mail mit PDF-Anhang über Resend verschicken
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'NebenkostenRadar <noreply@nebenkostenradar.com>',
        to: email,
        subject: 'Dein NebenkostenRadar Prüfbericht',
        html,
        attachments: [
          {
            filename: pdfFilename || 'Nebenkosten-Pruefbericht.pdf',
            content: pdfBase64,
            content_type: 'application/pdf',
          },
        ],
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      console.error('Resend Fehler:', JSON.stringify(data));
      return res.status(500).json({ error: 'E-Mail konnte nicht gesendet werden' });
    }

    // 3. Als verschickt markieren, damit kein Doppelversand entsteht
    await fetch(
      supabaseUrl + '/rest/v1/nkr_reports?session_id=eq.' + encodeURIComponent(sessionId),
      {
        method: 'PATCH',
        headers: {
          apikey: supabaseKey,
          Authorization: 'Bearer ' + supabaseKey,
          'Content-Type': 'application/json',
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({ email_sent: true }),
      }
    ).catch(err => console.error('email_sent-Flag konnte nicht gesetzt werden:', err.message));

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Fehler:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
