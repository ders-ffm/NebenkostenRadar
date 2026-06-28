// Stripe Webhook → Bericht aus Supabase holen → E-Mail mit Brief + Bericht senden
export const config = {
  api: { bodyParser: false }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const resendKey = process.env.RESEND_API_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks).toString('utf8');

  let event;
  try {
    if (webhookSecret) {
      const { createHmac } = await import('crypto');
      const sig = req.headers['stripe-signature'] || '';
      const parts = Object.fromEntries(sig.split(',').map(p => p.split('=')));
      const payload = `${parts.t}.${rawBody}`;
      const expected = createHmac('sha256', webhookSecret).update(payload).digest('hex');
      if (expected !== parts.v1) {
        console.error('Stripe Signatur ungültig');
        return res.status(400).json({ error: 'Invalid signature' });
      }
    }
    event = JSON.parse(rawBody);
  } catch (err) {
    console.error('Webhook Parse Fehler:', err.message);
    return res.status(400).json({ error: err.message });
  }

  console.log('Webhook Event:', event.type);

  if (event.type !== 'checkout.session.completed') {
    return res.status(200).json({ received: true, skipped: event.type });
  }

  const obj = event.data.object;
  const customerEmail =
    obj.customer_details?.email ||
    obj.receipt_email ||
    obj.metadata?.email ||
    null;

  const stripeSessionId = null; // client_reference_id nicht verfügbar bei Payment Links

  console.log('Kunde E-Mail:', customerEmail);
  console.log('Stripe Session ID:', stripeSessionId);

  if (!customerEmail || !resendKey) {
    console.log('Keine E-Mail oder kein Resend Key — überspringe');
    return res.status(200).json({ received: true });
  }

  // Supabase: Käufer speichern
  if (supabaseUrl && supabaseKey) {
    try {
      const supabaseRes = await fetch(`${supabaseUrl}/rest/v1/nkr_purchases`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=ignore-duplicates',
        },
        body: JSON.stringify({
          email: customerEmail,
          purchased_at: new Date().toISOString(),
          followup_sent: false,
        }),
      });
      if (!supabaseRes.ok) {
        console.error('Supabase Käufer-Fehler:', await supabaseRes.text());
      } else {
        console.log('Supabase: Käufer gespeichert');
      }
    } catch (err) {
      console.error('Supabase Fehler:', err.message);
    }
  }

  // Bericht aus nkr_reports holen — neuester Eintrag der letzten 15 Minuten
  let brief = null;
  let bericht = null;

  if (supabaseUrl && supabaseKey) {
    try {
      const since = new Date(Date.now() - 15 * 60 * 1000).toISOString();
      const reportRes = await fetch(
        `${supabaseUrl}/rest/v1/nkr_reports?created_at=gte.${encodeURIComponent(since)}&order=created_at.desc&limit=1&select=brief,bericht`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      );
      if (reportRes.ok) {
        const reports = await reportRes.json();
        if (reports.length > 0) {
          brief = reports[0].brief;
          bericht = reports[0].bericht;
          console.log('Bericht aus Supabase geladen');
        } else {
          console.log('Kein Bericht in den letzten 15 Minuten gefunden');
        }
      }
    } catch (err) {
      console.error('Bericht-Abruf Fehler:', err.message);
    }
  }

  // E-Mail senden
  try {
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'NebenkostenRadar <noreply@nebenkostenradar.com>',
        to: customerEmail,
        subject: 'Ihr NebenkostenRadar Prüfbericht und Musterschreiben',
        html: buildEmail(brief, bericht),
      }),
    });

    const emailData = await emailRes.json();
    if (!emailRes.ok) {
      console.error('Resend Fehler:', JSON.stringify(emailData));
    } else {
      console.log('E-Mail gesendet:', emailData.id);
    }
  } catch (err) {
    console.error('E-Mail Fehler:', err.message);
  }

  return res.status(200).json({ received: true });
}

function buildEmail(brief, bericht) {
  const briefHtml = brief
    ? brief
        .split('\n')
        .map(line => line.trim() === ''
          ? '<div style="height:10px;"></div>'
          : `<div style="font-size:13px;color:#1a1a1a;line-height:1.8;font-family:\'Segoe UI\',Arial,sans-serif;">${line.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>`
        )
        .join('')
    : '';

  const berichtHtml = bericht
    ? bericht
        .split('\n')
        .map(line => {
          const escaped = line.replace(/</g,'&lt;').replace(/>/g,'&gt;');
          if (line.startsWith('===') || line.startsWith('---')) {
            return `<div style="border-bottom:1px solid #dde1e7;margin:6px 0;"></div>`;
          }
          if (line.startsWith('GESAMTBEWERTUNG') || line.startsWith('POSTEN-BEWERTUNG') || line.startsWith('WIDERSPRUCHSGRUENDE') || line.startsWith('FRISTEN') || line.startsWith('NEBENKOSTEN')) {
            return `<div style="font-size:11px;font-weight:700;color:#2d7a4f;text-transform:uppercase;letter-spacing:0.08em;margin:14px 0 4px;">${escaped}</div>`;
          }
          if (line.match(/^\d+\./)) {
            return `<div style="font-size:12px;color:#1a1a1a;line-height:1.7;padding:4px 0 4px 8px;border-left:3px solid #2d7a4f;margin:4px 0;">${escaped}</div>`;
          }
          if (line.trim() === '') {
            return `<div style="height:6px;"></div>`;
          }
          return `<div style="font-size:12px;color:#555e68;line-height:1.7;">${escaped}</div>`;
        })
        .join('')
    : '';

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:'Segoe UI','Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- Header -->
  <tr><td style="background:#ffffff;border-radius:12px 12px 0 0;padding:22px 32px;border-bottom:2px solid #dde1e7;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td>
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="background:#2d7a4f;border-radius:8px;width:38px;height:38px;text-align:center;vertical-align:middle;">
            <span style="color:#fff;font-size:20px;font-weight:bold;">&#9679;</span>
          </td>
          <td style="padding-left:10px;">
            <div style="font-size:17px;font-weight:800;color:#1a1a1a;">Nebenkosten<span style="color:#2d7a4f;">Radar</span></div>
            <div style="font-size:10px;color:#2d7a4f;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;">nebenkostenradar.com</div>
          </td>
        </tr></table>
      </td>
      <td align="right" style="font-size:11px;color:#8a9199;">Unabhängige Abrechnungsprüfung</td>
    </tr></table>
  </td></tr>

  <!-- Danke -->
  <tr><td style="background:#ffffff;padding:24px 32px 8px;">
    <div style="background:#eaf4ee;border-left:4px solid #2d7a4f;border-radius:8px;padding:14px 18px;">
      <div style="font-size:15px;font-weight:700;color:#1a1a1a;margin-bottom:3px;">&#10003; Vielen Dank für Ihre Bestellung</div>
      <div style="font-size:12px;color:#555e68;">Ihr Musterschreiben und Prüfbericht befinden sich unten in dieser E-Mail.</div>
    </div>
  </td></tr>

  <!-- Brief -->
  ${brief ? `
  <tr><td style="background:#ffffff;padding:24px 32px 8px;">
    <div style="border:1px solid #dde1e7;border-radius:10px;overflow:hidden;">
      <div style="background:#2d7a4f;padding:12px 20px;">
        <span style="color:#fff;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">&#9993; Ihr Musterschreiben</span>
      </div>
      <div style="background:#fffdf7;padding:6px 16px 4px;border-bottom:1px solid #dde1e7;">
        <p style="font-size:11px;color:#b45309;margin:6px 0;">
          <strong>So verwenden Sie diesen Brief:</strong> Text unten vollständig markieren &rarr;
          <strong>Cmd+C</strong> (Mac) oder <strong>Strg+C</strong> (Windows) &rarr; in Word oder Pages einfügen &rarr; drucken &rarr; per Einschreiben senden.
        </p>
      </div>
      <div style="background:#fafafa;padding:24px 28px;">
        ${briefHtml}
      </div>
    </div>
  </td></tr>
  ` : ''}

  <!-- Prüfbericht -->
  ${bericht ? `
  <tr><td style="background:#ffffff;padding:16px 32px 8px;">
    <div style="border:1px solid #dde1e7;border-radius:10px;overflow:hidden;">
      <div style="background:#1a3a2a;padding:12px 20px;">
        <span style="color:#fff;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">&#128203; Ihr Prüfbericht</span>
      </div>
      <div style="background:#fafafa;padding:20px 24px;">
        ${berichtHtml}
      </div>
    </div>
  </td></tr>
  ` : ''}

  <!-- CTA -->
  <tr><td style="background:#ffffff;padding:16px 32px 24px;text-align:center;">
    <a href="https://nebenkostenradar.com" style="display:inline-block;background:#2d7a4f;color:#ffffff;text-decoration:none;padding:13px 30px;border-radius:8px;font-size:14px;font-weight:700;">
      Neue Prüfung starten &#8594;
    </a>
  </td></tr>

  <!-- Hinweis -->
  <tr><td style="background:#fef3e2;padding:14px 32px;border-top:1px solid #dde1e7;">
    <p style="font-size:12px;color:#b45309;margin:0;line-height:1.6;">
      Unverbindliches Musterschreiben ohne Rechtsberatungscharakter (§ 2 RDG). Kein Ersatz für anwaltliche Beratung. Deutscher Mieterbund:
      <a href="https://www.mieterbund.de" style="color:#b45309;">mieterbund.de</a> &middot; Tel. 030 223230
    </p>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#f8f9fa;border-radius:0 0 12px 12px;padding:18px 32px;border-top:1px solid #dde1e7;">
    <p style="font-size:11px;color:#8a9199;margin:0;line-height:1.8;text-align:center;">
      NebenkostenRadar &middot; Stefan Hennig &middot; Ludwigstr. 33-37, 60327 Frankfurt am Main<br>
      <a href="https://nebenkostenradar.com" style="color:#8a9199;">Impressum</a> &middot;
      <a href="https://nebenkostenradar.com" style="color:#8a9199;">Datenschutz</a> &middot;
      support@nebenkostenradar.com
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}
