// NebenkostenRadar — Kontaktformular (Impressum) → E-Mail an support@nebenkostenradar.com
// Zweiter Kontaktweg neben der direkten E-Mail-Adresse, Pflicht nach § 5 DDG
// (EuGH-Rechtsprechung: zwei Kontaktmöglichkeiten erforderlich).
// Vercel Environment Variable: RESEND_API_KEY (bereits gesetzt, gleiche wie send-email.js)
//
// UNVERÄNDERT übernommen (08/2026) — passt exakt zum Datenformat, das
// src/pages/Impressum.jsx sendet ({ name, email, message }). Keine Anpassung nötig.
//
// ERWEITERT 17.10.2026: zweiter Typ "widerruf" für die elektronische
// Widerrufsfunktion (§ 356a BGB, src/pages/Widerruf.jsx). Bewusst in DIESER
// Datei statt einer neuen: Der Vercel-Hobby-Plan erlaubt höchstens 12
// Serverless Functions (siehe api/draft.js), belegt sind 10.
// Beim Widerruf gehen ZWEI Mails raus: die Erklärung an support@ und eine
// Eingangsbestätigung mit Inhalt, Datum und Uhrzeit an den Kunden — die
// Eingangsbestätigung schreibt das Gesetz vor.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://nebenkostenradar.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();
  const { name, email, message, typ, bestellung } = req.body || {};
  const resendKey = process.env.RESEND_API_KEY;
  if (typ === 'widerruf') return widerruf(req, res, { name, email, message, bestellung, resendKey });
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

// ─────────────────────────────────────────────────────────────────────────
// Widerruf (§ 356a BGB). Siehe Kopfkommentar und src/pages/Widerruf.jsx.
// ─────────────────────────────────────────────────────────────────────────
function esc(s, max) {
  return String(s || '').slice(0, max).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function widerruf(req, res, { name, email, message, bestellung, resendKey }) {
  if (!resendKey) return res.status(500).json({ error: 'Versand nicht konfiguriert' });
  if (!name || !String(name).trim()) return res.status(400).json({ error: 'Name fehlt' });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || String(email).length > 200) return res.status(400).json({ error: 'Ungueltige E-Mail-Adresse' });
  if (!bestellung || !String(bestellung).trim()) return res.status(400).json({ error: 'Angaben zur Bestellung fehlen' });

  const eingang = new Intl.DateTimeFormat('de-DE', {
    timeZone: 'Europe/Berlin', day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).format(new Date()) + ' Uhr';
  const n = esc(name, 200), e = esc(email, 200), b = esc(bestellung, 500), m = esc(message, 3000);

  const inhalt = `
    <p style="font-size:13px;color:#1a1a1a;line-height:1.7;margin:0 0 12px;"><strong>Erklärung:</strong> Hiermit widerrufe ich den folgenden Vertrag.</p>
    <table cellpadding="0" cellspacing="0" style="width:100%;border-top:1px solid #dde1e7;border-bottom:1px solid #dde1e7;margin:0 0 12px;">
      <tr><td style="font-size:12px;color:#8a9199;padding:6px 12px 6px 0;">Name</td><td style="font-size:13px;color:#1a1a1a;">${n}</td></tr>
      <tr><td style="font-size:12px;color:#8a9199;padding:6px 12px 6px 0;">Bestellung</td><td style="font-size:13px;color:#1a1a1a;">${b}</td></tr>
      <tr><td style="font-size:12px;color:#8a9199;padding:6px 12px 6px 0;">E-Mail</td><td style="font-size:13px;color:#1a1a1a;">${e}</td></tr>
      ${m ? `<tr><td style="font-size:12px;color:#8a9199;padding:6px 12px 6px 0;vertical-align:top;">Nachricht</td><td style="font-size:13px;color:#1a1a1a;white-space:pre-wrap;">${m}</td></tr>` : ''}
      <tr><td style="font-size:12px;color:#8a9199;padding:6px 12px 6px 0;">Eingang</td><td style="font-size:13px;color:#1a1a1a;">${eingang}</td></tr>
    </table>`;
  const rahmen = (titel, text) => `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:24px 16px;background:#f8f9fa;font-family:'Segoe UI','Helvetica Neue',Arial,sans-serif;">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;margin:0 auto;background:#ffffff;border-radius:12px;">
<tr><td style="padding:24px 32px;">
  <div style="font-size:17px;font-weight:800;color:#1a1a1a;margin-bottom:12px;">Nebenkosten<span style="color:#3d7a5c;">Radar</span> &middot; ${titel}</div>
  ${text}
  ${inhalt}
  <p style="font-size:11px;color:#8a9199;margin:16px 0 0;">NebenkostenRadar &middot; Stefan Hennig &middot; Ludwigstr. 33-37, 60327 Frankfurt am Main &middot; support@nebenkostenradar.com</p>
</td></tr></table></body></html>`;

  const senden = body => fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  try {
    // 1. Erklärung an uns. Scheitert das, gilt der Widerruf als nicht
    //    übermittelt, und der Kunde bekommt eine Fehlermeldung mit dem
    //    Hinweis auf den E-Mail-Weg (Widerruf.jsx).
    const an = await senden({
      from: 'NebenkostenRadar Widerruf <noreply@nebenkostenradar.com>',
      to: 'support@nebenkostenradar.com',
      reply_to: email,
      subject: 'WIDERRUF eingegangen: ' + String(name).slice(0, 80),
      html: rahmen('Widerruf eingegangen', '<p style="font-size:13px;color:#b45309;line-height:1.7;margin:0 0 12px;">Über die Widerrufsfunktion auf nebenkostenradar.com/widerruf. Bitte Bestellung prüfen (Stripe, Kundenkonto) und dem Kunden antworten. Bei wirksamem Widerruf Erstattung binnen 14 Tagen.</p>'),
    });
    if (!an.ok) {
      console.error('Resend Fehler (widerruf an support):', await an.text());
      return res.status(500).json({ error: 'Widerruf konnte nicht übermittelt werden' });
    }
    // 2. Eingangsbestätigung an den Kunden (dauerhafter Datenträger).
    const best = await senden({
      from: 'NebenkostenRadar <noreply@nebenkostenradar.com>',
      to: email,
      reply_to: 'support@nebenkostenradar.com',
      subject: 'Eingangsbestätigung deines Widerrufs',
      html: rahmen('Eingangsbestätigung', `<p style="font-size:13px;color:#1a1a1a;line-height:1.7;margin:0 0 12px;">Hallo ${n},<br>dein Widerruf ist am ${eingang} bei uns eingegangen. Hier ist der Inhalt deiner Erklärung. Wir prüfen die Bestellung und melden uns bei dir.</p>`),
    });
    if (!best.ok) console.error('Resend Fehler (widerruf Bestätigung):', await best.text());
    return res.status(200).json({ success: true, eingang, bestaetigungVersendet: best.ok });
  } catch (err) {
    console.error('Fehler (widerruf):', err.message);
    return res.status(500).json({ error: 'Widerruf konnte nicht übermittelt werden' });
  }
}
