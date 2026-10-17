// ─────────────────────────────────────────────────────────────────────────
// send-email.js — Verschickt den fertigen Prüfbericht als echten PDF-Anhang.
//
// SICHERHEITSKORREKTUR 17.10.2026 (siehe CHANGELOG.md):
// Bis zu diesem Datum nahm diese Funktion Empfängeradresse, PDF-Anhang,
// Vorname und Stufe ungeprüft aus dem Request entgegen. Der Kommentar ging
// davon aus, dass Download.jsx vorher die Zahlung prüft — das stimmt, schützt
// aber nur den normalen Weg durch unsere Seite. Wer die Funktion direkt
// aufrief (z. B. per curl), konnte über unseren Absender
// noreply@nebenkostenradar.com beliebige PDFs an beliebige Adressen
// verschicken. Folgen wären gewesen: Phishing unter unserem Namen, Sperrung
// des Resend-Kontos, Domain auf Spam-Listen (dann kämen auch echte
// Kundenmails nicht mehr an).
//
// JETZT:
//   1. Die Zahlung wird HIER bei Stripe geprüft (gleiche Logik wie
//      get-report.js). Ohne bezahlte Checkout-Session kein Versand.
//   2. Die Empfängeradresse kommt AUSSCHLIESSLICH aus unserer Datenbank
//      (per Doppel-Eingabe geprüfte Adresse aus Adressen.jsx), ersatzweise
//      von Stripe — nie aus dem Request.
//   3. Stufe und Vorname ebenfalls aus der Datenbank, die Stufe zusätzlich
//      gegen den tatsächlich bezahlten Betrag geprüft.
//   4. Der Anhang muss ein PDF sein (Dateisignatur "%PDF") und ist in der
//      Größe begrenzt. Er wird weiterhin im Browser erzeugt, kann aber nur
//      noch an den zahlenden Kunden selbst gehen, und nur einmal
//      (email_sent-Sperre).
//
// Aufgerufen aus: src/pages/Download.jsx mit { stripeSession, pdfBase64,
// pdfFilename }. stripeSession ist die Checkout-Session-ID von Stripe aus
// der URL (?session=cs_live_…), NICHT unsere eigene sessionId.
//
// Benötigte Vercel Environment Variables:
//   RESEND_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY
// ─────────────────────────────────────────────────────────────────────────

// Bezahlte Stufe aus dem tatsächlich gezahlten Betrag ableiten (17.10.2026).
// amount_subtotal ist der Betrag VOR Gutscheinen (NKR20 senkt nur den
// Endbetrag), in Cent: 999 = Auswertung, 1299 = Auswertung + Brief (siehe
// PREIS_AUSWERTUNG/PREIS_VOLL in src/config/business.js). Die Grenze liegt
// bewusst in der Mitte. ÄNDERN SICH DIE PREISE, MUSS DIESE GRENZE MIT —
// dieselbe Funktion steht in get-report.js und webhook.js (bewusst kopiert
// statt geteilt: jede Datei unter api/ zählt bei Vercel Hobby als eigene
// Function, Limit 12).
const STUFE_VOLL_AB_CENT = 1149;
function stufeLautZahlung(gespeicherteStufe, session) {
  if (gespeicherteStufe !== "voll") return "auswertung";
  const betrag = Number(session.amount_subtotal ?? session.amount_total ?? 0);
  return betrag >= STUFE_VOLL_AB_CENT ? "voll" : "auswertung";
}

const MAX_PDF_BASE64 = 6 * 1024 * 1024; // ~4,5 MB PDF; Vercel-Body-Limit liegt bei 4,5 MB

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://nebenkostenradar.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { stripeSession, pdfBase64, pdfFilename } = req.body || {};
  const resendKey = process.env.RESEND_API_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSession || !pdfBase64 || !resendKey || !supabaseUrl || !supabaseKey || !stripeKey) {
    return res.status(400).json({ error: 'Fehlende Parameter' });
  }
  if (typeof stripeSession !== 'string' || !/^cs_(live|test)_[A-Za-z0-9]+$/.test(stripeSession)) {
    return res.status(400).json({ error: 'Ungueltige Session' });
  }
  // "JVBER" ist Base64 für "%PDF" — alles andere ist kein PDF.
  if (typeof pdfBase64 !== 'string' || !pdfBase64.startsWith('JVBER') || pdfBase64.length > MAX_PDF_BASE64) {
    return res.status(400).json({ error: 'Ungueltiger Anhang' });
  }
  const dateiname = String(pdfFilename || '').replace(/[^A-Za-z0-9_.-]/g, '').slice(0, 80);
  const sichererDateiname = /\.pdf$/i.test(dateiname) ? dateiname : 'Nebenkosten-Pruefbericht.pdf';

  try {
    // 1. Zahlung bei Stripe verifizieren
    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions/' + encodeURIComponent(stripeSession), {
      headers: { Authorization: 'Bearer ' + stripeKey },
    });
    if (!stripeRes.ok) return res.status(404).json({ error: 'Session nicht gefunden' });
    const session = await stripeRes.json();
    if (session.payment_status !== 'paid') {
      return res.status(402).json({ error: 'Zahlung noch nicht abgeschlossen' });
    }
    const sessionId = session.client_reference_id;
    if (!sessionId) return res.status(400).json({ error: 'Keine Referenz-ID gefunden' });

    // 2. Empfänger, Stufe, Vorname und Doppelversand-Status aus der Datenbank
    const checkRes = await fetch(
      supabaseUrl + '/rest/v1/nkr_reports?session_id=eq.' + encodeURIComponent(sessionId) + '&select=email_sent,adressen,stufe',
      { headers: { apikey: supabaseKey, Authorization: 'Bearer ' + supabaseKey } }
    );
    if (!checkRes.ok) return res.status(500).json({ error: 'Datenbankfehler' });
    const rows = await checkRes.json();
    const row = rows[0];
    if (!row) return res.status(404).json({ error: 'Keine Daten gefunden' });
    if (row.email_sent) {
      return res.status(200).json({ success: true, alreadySent: true });
    }

    const email = row.adressen?.email || session.customer_details?.email || '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Keine gueltige E-Mail-Adresse hinterlegt' });
    }
    const stufe = stufeLautZahlung(row.stufe, session);
    const vorname = (row.adressen?.mieterName || '').trim().split(/\s+/)[0] || '';
    const anrede = vorname ? 'Hallo ' + String(vorname).slice(0, 100).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + ',' : 'Hallo,';

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

    // 3. E-Mail mit PDF-Anhang über Resend verschicken
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
            filename: sichererDateiname,
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

    // 4. Als verschickt markieren, damit kein Doppelversand entsteht
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
    console.error('send-email Fehler:', err.message);
    return res.status(500).json({ error: 'E-Mail konnte nicht gesendet werden' });
  }
}
