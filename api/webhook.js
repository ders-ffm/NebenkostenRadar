// ─────────────────────────────────────────────────────────────────────────
// webhook.js — Stripe Webhook (checkout.session.completed)
//
// GEÄNDERT 08/2026 (Variante B, siehe Projekt-Chat):
// Verschickt KEINE E-Mail mehr selbst. Grund: Diese Funktion las bisher
// `brief`/`bericht` (fertigen Text) aus nkr_reports — diese Spalten gibt es
// seit dem Redesign nicht mehr (die Analyse liefert jetzt Rohdaten, aus
// denen das PDF client-seitig erzeugt wird, siehe Download.jsx). Der
// Webhook hätte sonst eine leere Mail verschickt, parallel zur echten aus
// api/send-email.js — zwei E-Mail-Systeme, eins davon kaputt.
//
// Neue, alleinige Aufgabe dieser Funktion:
//   1. Zahlung server-seitig bestätigen (unabhängig vom Browser des Kunden
//      — läuft auch, wenn der Kunde den Tab direkt nach der Zahlung schließt).
//   2. Kauf in nkr_purchases protokollieren (E-Mail, Vorname, Zeitpunkt).
//   3. Falls beim Kauf zugestimmt (marketing_opt_in, siehe Adressen.jsx-
//      Checkbox): Fälligkeitsdatum für die Rabatt-Mail (Kauf + 10 Monate)
//      setzen. Der eigentliche Versand läuft separat über
//      scripts/marketing-rabatt-versand.mjs (täglicher Cron).
//
// Die eigentliche PDF-Zustellung an den Kunden übernimmt weiterhin
// api/send-email.js, ausgelöst aus Download.jsx.
// ─────────────────────────────────────────────────────────────────────────
// Siehe gleichnamige Funktion in send-email.js (dort ausführlich erklärt).
// ÄNDERN SICH DIE PREISE, MUSS DIESE GRENZE MIT.
const STUFE_VOLL_AB_CENT = 1149;
function stufeLautZahlung(gespeicherteStufe, session) {
  if (gespeicherteStufe !== 'voll') return 'auswertung';
  const betrag = Number(session.amount_subtotal ?? session.amount_total ?? 0);
  return betrag >= STUFE_VOLL_AB_CENT ? 'voll' : 'auswertung';
}

export const config = {
  api: { bodyParser: false }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks).toString('utf8');

  // ───────────────────────────────────────────────────────────────────────
  // SIGNATURPRÜFUNG VERSCHÄRFT (17.10.2026, siehe CHANGELOG.md)
  // Vorher: Fehlte STRIPE_WEBHOOK_SECRET, wurde JEDE Anfrage ungeprüft
  // verarbeitet ("fail-open"). Außerdem kein Schutz gegen das erneute
  // Einspielen einer alten, echten Stripe-Nachricht und ein normaler
  // String-Vergleich. Jetzt:
  //   - ohne Secret: Abbruch mit 500 (Stripe wiederholt dann und zeigt den
  //     Fehler im Dashboard, statt dass still ungeprüfte Daten durchgehen),
  //   - Zeitstempel höchstens 5 Minuten alt (Empfehlung von Stripe),
  //   - zeitkonstanter Vergleich, mehrere v1-Signaturen erlaubt (Stripe
  //     schickt beim Wechsel des Secrets zwei).
  // Live geprüft am 17.10.2026: Das Secret IST in Vercel gesetzt (eine
  // Anfrage mit falscher Signatur wurde mit 400 abgewiesen). Für echte
  // Stripe-Aufrufe ändert sich also nichts.
  // ───────────────────────────────────────────────────────────────────────
  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET fehlt — Webhook verweigert');
    return res.status(500).json({ error: 'Webhook nicht konfiguriert' });
  }

  let event;
  try {
    const { createHmac, timingSafeEqual } = await import('crypto');
    const sig = String(req.headers['stripe-signature'] || '');
    let t = null;
    const v1 = [];
    for (const teil of sig.split(',')) {
      const [k, v] = teil.split('=');
      if (k === 't') t = v;
      if (k === 'v1' && v) v1.push(v);
    }
    const alterSek = Math.abs(Date.now() / 1000 - Number(t));
    if (!t || !Number.isFinite(alterSek) || alterSek > 300 || v1.length === 0) {
      console.error('Stripe Signatur fehlt oder Zeitstempel zu alt');
      return res.status(400).json({ error: 'Invalid signature' });
    }
    const expected = Buffer.from(createHmac('sha256', webhookSecret).update(`${t}.${rawBody}`).digest('hex'), 'utf8');
    const gueltig = v1.some(s => {
      const b = Buffer.from(s, 'utf8');
      return b.length === expected.length && timingSafeEqual(b, expected);
    });
    if (!gueltig) {
      console.error('Stripe Signatur ungültig');
      return res.status(400).json({ error: 'Invalid signature' });
    }
    event = JSON.parse(rawBody);
  } catch (err) {
    console.error('Webhook Parse Fehler:', err.message);
    return res.status(400).json({ error: 'Ungueltige Anfrage' });
  }

  if (event.type !== 'checkout.session.completed') {
    return res.status(200).json({ received: true, skipped: event.type });
  }

  const obj = event.data.object;
  if (obj.payment_status && obj.payment_status !== 'paid') {
    console.log('Session noch nicht bezahlt (z. B. ausstehende Banküberweisung) — überspringe:', obj.id);
    return res.status(200).json({ received: true, skipped: 'not paid yet' });
  }

  const ourSessionId = obj.client_reference_id || null;
  const stripeEmail = obj.customer_details?.email || obj.receipt_email || null;

  if (!ourSessionId || !supabaseUrl || !supabaseKey) {
    console.log('Keine session_id oder keine Supabase-Zugangsdaten — überspringe Protokollierung');
    return res.status(200).json({ received: true });
  }

  try {
    // Eigene, per Doppel-Eingabe geprüfte Adressdaten + Opt-in-Status holen
    // (zuverlässiger als die Stripe-E-Mail, die nicht gegengeprüft wird).
    const reportRes = await fetch(
      supabaseUrl + '/rest/v1/nkr_reports?session_id=eq.' + encodeURIComponent(ourSessionId) + '&select=adressen,marketing_opt_in,created_at,stufe',
      { headers: { apikey: supabaseKey, Authorization: 'Bearer ' + supabaseKey } }
    );
    const reportRows = reportRes.ok ? await reportRes.json() : [];
    const report = reportRows[0] || null;

    // Stufe an den tatsächlich bezahlten Betrag angleichen (17.10.2026).
    // Wichtig für das Kundenkonto (my-reports.js/Konto.jsx), das die Stufe
    // direkt aus nkr_reports liest und keine Stripe-Session kennt.
    if (report && report.stufe === 'voll' && stufeLautZahlung(report.stufe, obj) !== 'voll') {
      console.warn('Stufe "voll" gespeichert, aber nur Auswertung bezahlt — korrigiere:', ourSessionId);
      await fetch(supabaseUrl + '/rest/v1/nkr_reports?session_id=eq.' + encodeURIComponent(ourSessionId), {
        method: 'PATCH',
        headers: { apikey: supabaseKey, Authorization: 'Bearer ' + supabaseKey, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({ stufe: 'auswertung' }),
      }).catch(err => console.error('Stufe konnte nicht korrigiert werden:', err.message));
    }

    const email = report?.adressen?.email || stripeEmail;
    const vorname = (report?.adressen?.mieterName || '').trim().split(/\s+/)[0] || '';
    const marketingOptIn = !!report?.marketing_opt_in;

    if (!email) {
      console.log('Keine E-Mail-Adresse ermittelbar — überspringe Protokollierung:', ourSessionId);
      return res.status(200).json({ received: true });
    }

    let versandFaelligAm = null;
    if (marketingOptIn) {
      const basis = new Date(report?.created_at || Date.now());
      basis.setMonth(basis.getMonth() + 10);
      versandFaelligAm = basis.toISOString();
    }

    const purchaseRes = await fetch(supabaseUrl + '/rest/v1/nkr_purchases', {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: 'Bearer ' + supabaseKey,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        session_id: ourSessionId,
        email,
        vorname,
        purchased_at: new Date().toISOString(),
        marketing_opt_in: marketingOptIn,
        versand_faellig_am: versandFaelligAm,
        followup_sent: false,
        abgemeldet: false,
      }),
    });
    if (!purchaseRes.ok) {
      console.error('nkr_purchases Fehler:', await purchaseRes.text());
    } else {
      console.log('Kauf protokolliert:', ourSessionId, marketingOptIn ? '(mit Opt-in)' : '(ohne Opt-in)');
    }
  } catch (err) {
    console.error('Webhook-Verarbeitung fehlgeschlagen:', err.message);
  }

  return res.status(200).json({ received: true });
}
