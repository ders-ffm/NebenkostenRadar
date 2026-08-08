// ─────────────────────────────────────────────────────────────────────────
// marketing-rabatt-versand.mjs — NEU (08/2026)
//
// Verschickt automatisch einen Rabattcode für die nächste Prüfung, 10 Monate
// nach dem Kauf — ausschließlich an Kunden, die beim Kauf aktiv zugestimmt
// haben (Opt-in-Checkbox in Adressen.jsx, Art. 6 Abs. 1 lit. a DSGVO).
//
// Rechtlicher Hintergrund (siehe Projekt-Chat 08/2026, keine Rechtsberatung):
// Bewusst als Opt-in (statt § 7 Abs. 3 UWG "Bestandskundenwerbung" ohne
// Einwilligung) umgesetzt, weil die E-Mail-Adresse auf der Stripe-Checkout-
// Seite erhoben wird, die wir nicht gestalten — die dafür laut Rechtsprechung
// (LG Paderborn, 22.02.2024, 2 O 325/23) nötige, gut sichtbare Hinweispflicht
// "in unmittelbarer Nähe des Eingabefelds bei Erhebung" wäre dort nicht
// zuverlässig umsetzbar gewesen.
//
// Läuft täglich per GitHub Actions (siehe .github/workflows/, $0 Zusatzkosten,
// gleiches Muster wie richtwerte-monitor.mjs), NICHT als Vercel Cron.
//
// Ablauf:
//   1. Holt aus Supabase (Tabelle nkr_purchases, befüllt von api/webhook.js)
//      alle Zeilen mit versand_faellig_am <= jetzt, marketing_opt_in = true,
//      followup_sent = false, abgemeldet = false.
//   2. Verschickt pro Zeile eine personalisierte E-Mail mit dem festen
//      Rabattcode (BUSINESS.MARKETING_RABATT_CODE) über Resend, inkl.
//      Pflicht-Abmeldelink.
//   3. Markiert die Zeile als followup_sent = true — verhindert Doppelversand
//      bei jedem weiteren Lauf.
//
// Benötigte GitHub-Secrets (identisch zu denen von richtwerte-monitor.mjs,
// zusätzlich RESEND_API_KEY):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY
// ─────────────────────────────────────────────────────────────────────────
import { BUSINESS } from "../src/config/business.js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || !RESEND_API_KEY) {
  console.error("Fehlende Umgebungsvariablen (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY).");
  process.exit(1);
}

function mailHtml(sessionId, vorname) {
  const abmeldeLink = "https://nebenkostenradar.com/api/marketing-abmelden?s=" + encodeURIComponent(sessionId);
  const anrede = vorname ? "Hallo " + vorname + "," : "Hallo,";
  return `<!DOCTYPE html>
<html lang="de"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:'Segoe UI','Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
  <tr><td style="background:#ffffff;border-radius:12px 12px 0 0;padding:24px 32px;border-bottom:2px solid #dde1e7;">
    <table cellpadding="0" cellspacing="0"><tr>
      <td style="width:38px;height:38px;"><img src="https://nebenkostenradar.com/logo-email.png" width="38" height="38" alt="NebenkostenRadar" style="display:block;border-radius:8px;"></td>
      <td style="padding-left:10px;">
        <div style="font-size:17px;font-weight:800;color:#1a1a1a;">Nebenkosten<span style="color:#3d7a5c;">Radar</span></div>
        <div style="font-size:10px;color:#3d7a5c;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;">nebenkostenradar.com</div>
      </td>
    </tr></table>
  </td></tr>
  <tr><td style="background:#ffffff;padding:28px 32px;">
    <p style="font-size:14px;color:#1a1a1a;margin:0 0 16px;">${anrede}</p>
    <p style="font-size:13px;color:#555e68;line-height:1.7;margin:0 0 16px;">
      danke, dass du NebenkostenRadar genutzt hast. Falls deine nächste Nebenkostenabrechnung ansteht: Mit diesem Code sparst du 10&nbsp;% bei der nächsten Prüfung.
    </p>
    <div style="background:#F3ECDC;border-radius:8px;padding:16px;text-align:center;margin-bottom:20px;">
      <div style="font-size:11px;color:#8a7a5c;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;">Dein Rabattcode</div>
      <div style="font-size:20px;font-weight:800;color:#B5502C;letter-spacing:0.05em;">${BUSINESS.MARKETING_RABATT_CODE}</div>
    </div>
    <p style="font-size:13px;color:#1a1a1a;line-height:1.7;margin:0 0 20px;">
      Viele Grüße aus Frankfurt sendet dir das Team von<br>NebenkostenRadar
    </p>
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
      <a href="https://nebenkostenradar.com" style="display:inline-block;background:#B5502C;color:#ffffff;text-decoration:none;padding:13px 30px;border-radius:8px;font-size:14px;font-weight:700;">Jetzt prüfen &#8594;</a>
    </td></tr></table>
    <p style="font-size:11px;color:#8a9199;text-align:center;margin:14px 0 0;">
      Du kannst dich jederzeit unter <a href="https://nebenkostenradar.com/login" style="color:#3d7a5c;">nebenkostenradar.com/login</a> anmelden, um deine bisherigen Prüfberichte erneut herunterzuladen.
    </p>
  </td></tr>
  <tr><td style="background:#f8f9fa;border-radius:0 0 12px 12px;padding:16px 32px;border-top:1px solid #dde1e7;">
    <p style="font-size:11px;color:#8a9199;margin:0;line-height:1.8;text-align:center;">
      NebenkostenRadar &middot; Stefan Hennig &middot; Ludwigstr. 33-37, 60327 Frankfurt am Main<br>
      Du erhältst diese Mail, weil du beim Kauf zugestimmt hast.
      <a href="${abmeldeLink}" style="color:#8a9199;">Abmelden</a>
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

async function main() {
  const jetzt = new Date().toISOString();
  const faelligeRes = await fetch(
    SUPABASE_URL +
      "/rest/v1/nkr_purchases?marketing_opt_in=eq.true&followup_sent=eq.false&abgemeldet=eq.false&versand_faellig_am=lte." +
      encodeURIComponent(jetzt) +
      "&select=session_id,email,vorname",
    { headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY } }
  );
  if (!faelligeRes.ok) {
    console.error("Supabase-Abfrage fehlgeschlagen:", await faelligeRes.text());
    process.exit(1);
  }
  const faellige = await faelligeRes.json();
  console.log(`${faellige.length} fällige Rabatt-Mail(s) gefunden.`);

  let erfolgreich = 0;
  for (const row of faellige) {
    try {
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: "Bearer " + RESEND_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "NebenkostenRadar <noreply@nebenkostenradar.com>",
          to: row.email,
          subject: "10 % Rabatt für deine nächste Prüfung",
          html: mailHtml(row.session_id, row.vorname),
        }),
      });
      if (!resendRes.ok) {
        console.error(`Fehler beim Versand an ${row.session_id}:`, await resendRes.text());
        continue;
      }
      await fetch(
        SUPABASE_URL + "/rest/v1/nkr_purchases?session_id=eq." + encodeURIComponent(row.session_id),
        {
          method: "PATCH",
          headers: {
            apikey: SUPABASE_KEY,
            Authorization: "Bearer " + SUPABASE_KEY,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({ followup_sent: true }),
        }
      );
      erfolgreich++;
    } catch (err) {
      console.error(`Fehler bei ${row.session_id}:`, err.message);
    }
  }
  console.log(`${erfolgreich}/${faellige.length} Rabatt-Mail(s) erfolgreich verschickt.`);
}

main();
