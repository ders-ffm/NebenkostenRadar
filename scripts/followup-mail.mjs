#!/usr/bin/env node
/**
 * NebenkostenRadar — Follow-up-E-Mail nach 11 Monaten
 *
 * WAS DIESES SCRIPT TUT:
 * 1. Sucht in Supabase (nkr_purchases) Käufer, deren Kauf 11–12 Monate zurückliegt
 *    und die noch keine Follow-up-Mail erhalten haben (followup_sent = false)
 * 2. Sendet ihnen per Resend eine Erinnerungs-Mail mit 20% Rabattcode NKR20
 * 3. Markiert sie in Supabase als followup_sent = true — läuft dadurch nie doppelt
 *
 * WARUM EIN ZEITFENSTER (11–12 Monate) STATT "GENAU 11 MONATE":
 * Läuft der Job an einem anderen Tag als geplant (Feiertag, Ausfall, manueller
 * Nachtrag), würde ein exaktes Datum einzelne Käufer für immer durchrutschen
 * lassen. Das Fenster fängt sie im nächsten Lauf trotzdem ab.
 *
 * SETUP (GitHub → Settings → Secrets and variables → Actions):
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY
 *   (dieselben Werte wie in Vercel — dort unter "Environment Variables" nachschlagen,
 *   GitHub Actions hat KEINEN automatischen Zugriff auf Vercel-Variablen, sie
 *   müssen hier separat als Repo-Secrets hinterlegt werden)
 *
 * AUTOMATISIERUNG:
 *   GitHub Actions Workflow: .github/workflows/followup-mail.yml (monatlich am 1.)
 *   Manuell testen: node scripts/followup-mail.mjs
 */
import fetch from 'node-fetch';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_KEY = process.env.RESEND_API_KEY;
const RABATTCODE = 'NKR20';

// ── Zeitfenster: Käufe von vor 11–12 Monaten ─────────────────────────────────
function berechneZeitfenster() {
  const jetzt = new Date();
  const vorElfMonaten = new Date(jetzt);
  vorElfMonaten.setMonth(vorElfMonaten.getMonth() - 11);
  const vorZwoelfMonaten = new Date(jetzt);
  vorZwoelfMonaten.setMonth(vorZwoelfMonaten.getMonth() - 12);
  return { von: vorZwoelfMonaten.toISOString(), bis: vorElfMonaten.toISOString() };
}

// ── Fällige Käufer aus Supabase holen ────────────────────────────────────────
async function findeFaelligeKaeufer() {
  const { von, bis } = berechneZeitfenster();
  const url = SUPABASE_URL + '/rest/v1/nkr_purchases'
    + '?followup_sent=eq.false'
    + '&purchased_at=gte.' + encodeURIComponent(von)
    + '&purchased_at=lte.' + encodeURIComponent(bis)
    + '&select=id,email,purchased_at';
  const res = await fetch(url, {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
    },
  });
  if (!res.ok) {
    throw new Error('Supabase Abfrage fehlgeschlagen: ' + await res.text());
  }
  return res.json();
}

// ── E-Mail-Template ──────────────────────────────────────────────────────────
function buildFollowupEmail() {
  return '<!DOCTYPE html>'
    + '<html lang="de">'
    + '<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>'
    + '<body style="margin:0;padding:0;background:#f0f2f5;font-family:\'Segoe UI\',\'Helvetica Neue\',Arial,sans-serif;">'
    + '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f2f5;padding:32px 16px;">'
    + '<tr><td align="center">'
    + '<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">'
    + '<tr><td style="background:#ffffff;border-radius:12px 12px 0 0;padding:22px 32px;border-bottom:2px solid #dde1e7;">'
    + '<table width="100%" cellpadding="0" cellspacing="0"><tr>'
    + '<td><table cellpadding="0" cellspacing="0"><tr>'
    + '<td style="background:#2d7a4f;border-radius:8px;width:38px;height:38px;text-align:center;vertical-align:middle;">'
    + '<span style="color:#fff;font-size:20px;font-weight:bold;">&#9679;</span></td>'
    + '<td style="padding-left:10px;">'
    + '<div style="font-size:17px;font-weight:800;color:#1a1a1a;">Nebenkosten<span style="color:#2d7a4f;">Radar</span></div>'
    + '<div style="font-size:10px;color:#2d7a4f;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;">nebenkostenradar.com</div>'
    + '</td></tr></table></td>'
    + '<td align="right" style="font-size:11px;color:#8a9199;">Unabhängige Abrechnungsprüfung</td>'
    + '</tr></table></td></tr>'
    + '<tr><td style="background:#ffffff;padding:28px 32px 8px;">'
    + '<div style="font-size:18px;font-weight:700;color:#1a1a1a;margin-bottom:10px;">Ihre nächste Nebenkostenabrechnung kommt bald wieder</div>'
    + '<p style="font-size:13px;color:#555e68;line-height:1.7;margin:0 0 18px;">Vor etwa einem Jahr haben Sie Ihre Nebenkostenabrechnung mit NebenkostenRadar geprüft. Meist landet die nächste Abrechnung Ihres Vermieters um diese Jahreszeit im Briefkasten — auch die lohnt sich zu prüfen, denn laut Deutschem Mieterbund enthält jede zweite Abrechnung Fehler.</p>'
    + '<div style="background:#eaf4ee;border:1.5px dashed #2d7a4f;border-radius:10px;padding:16px 20px;text-align:center;margin-bottom:20px;">'
    + '<div style="font-size:11px;color:#555e68;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;">Ihr Rabattcode</div>'
    + '<div style="font-size:22px;font-weight:800;color:#2d7a4f;letter-spacing:0.04em;">' + RABATTCODE + '</div>'
    + '<div style="font-size:11px;color:#8a9199;margin-top:4px;">20% Rabatt auf den Vollbericht, einmalig einlösbar</div>'
    + '</div>'
    + '<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">'
    + '<a href="https://nebenkostenradar.com" style="display:inline-block;background:#2d7a4f;color:#ffffff;text-decoration:none;padding:13px 30px;border-radius:8px;font-size:14px;font-weight:700;">Jetzt Abrechnung prüfen &#8594;</a>'
    + '</td></tr></table>'
    + '</td></tr>'
    + '<tr><td style="background:#fef3e2;padding:14px 32px;border-top:1px solid #dde1e7;">'
    + '<p style="font-size:11px;color:#b45309;margin:0;line-height:1.6;">Diese E-Mail erhalten Sie als Bestandskunde zu einem ähnlichen Produkt gemäß § 7 Abs. 3 UWG. Widerspruch jederzeit formlos an <a href="mailto:support@nebenkostenradar.com" style="color:#b45309;">support@nebenkostenradar.com</a>.</p>'
    + '</td></tr>'
    + '<tr><td style="background:#f8f9fa;border-radius:0 0 12px 12px;padding:18px 32px;border-top:1px solid #dde1e7;">'
    + '<p style="font-size:11px;color:#8a9199;margin:0;line-height:1.8;text-align:center;">NebenkostenRadar &middot; Stefan Hennig &middot; Ludwigstr. 33-37, 60327 Frankfurt am Main<br>support@nebenkostenradar.com</p>'
    + '</td></tr>'
    + '</table></td></tr></table></body></html>';
}

// ── E-Mail versenden ──────────────────────────────────────────────────────────
async function sendeMail(email) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + RESEND_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'NebenkostenRadar <noreply@nebenkostenradar.com>',
      to: email,
      subject: 'Ihre Abrechnung kommt bald wieder — 20% Rabatt mit ' + RABATTCODE,
      html: buildFollowupEmail(),
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error('Resend Fehler: ' + JSON.stringify(data));
  return data;
}

// ── Käufer als "Follow-up gesendet" markieren ────────────────────────────────
async function markiereGesendet(id) {
  const res = await fetch(SUPABASE_URL + '/rest/v1/nkr_purchases?id=eq.' + id, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ followup_sent: true }),
  });
  if (!res.ok) throw new Error('Supabase Update fehlgeschlagen: ' + await res.text());
}

// ── Hauptprogramm ─────────────────────────────────────────────────────────────
async function main() {
  console.log('NebenkostenRadar Follow-up-Mail\n' + '='.repeat(40));
  if (!SUPABASE_URL || !SUPABASE_KEY || !RESEND_KEY) {
    console.error('SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY oder RESEND_API_KEY fehlt');
    process.exit(1);
  }

  const kaeufer = await findeFaelligeKaeufer();
  console.log(kaeufer.length + ' fällige Käufer gefunden');

  let versendet = 0;
  for (const k of kaeufer) {
    try {
      await sendeMail(k.email);
      await markiereGesendet(k.id);
      versendet++;
      console.log('  → gesendet an ' + k.email);
    } catch (e) {
      console.error('  → Fehler bei ' + k.email + ': ' + e.message);
    }
    // Kleine Pause zwischen Mails — schont Resend-Rate-Limits
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\n' + '='.repeat(40));
  console.log(versendet + ' von ' + kaeufer.length + ' Follow-up-Mails versendet.');
}

main().catch(err => {
  console.error('Unerwarteter Fehler:', err.message);
  process.exit(1);
});
