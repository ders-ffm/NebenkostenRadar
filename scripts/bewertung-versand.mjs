// ─────────────────────────────────────────────────────────────────────────
// bewertung-versand.mjs — NEU 18.10.2026
//
// Schickt Käufern, die beim Kauf AUSDRÜCKLICH zugestimmt haben (zweite
// Checkbox in Adressen.jsx, Datenschutz.jsx Abschnitt 3b), einige Tage nach
// dem Kauf EINMALIG eine Bitte um eine Bewertung.
//
// Rechtlicher Rahmen (keine Rechtsberatung):
//   - Bewertungsbitten per E-Mail sind Werbung. Ohne Einwilligung verletzen
//     sie das allgemeine Persönlichkeitsrecht (BGH, 10.07.2018, VI ZR 225/17).
//     Deshalb nur mit eigener, zweckgebundener Einwilligung; die Zustimmung
//     zur Rabatt-Mail deckt das nicht ab.
//   - ALLE einwilligenden Käufer bekommen dieselbe Bitte, nicht nur
//     zufriedene. Die Mail bittet ausdrücklich um eine ehrliche Bewertung,
//     auch eine kritische. Keine Gegenleistung, kein Gutschein: Eine
//     belohnte Bewertung müsste offen als solche gekennzeichnet werden, und
//     Bewertungsportale verbieten sie meist ohnehin.
//   - Abmeldelink in jeder Mail (api/marketing-abmelden.js stoppt alle
//     Werbe-Mails an diese Adresse).
//
// Ablauf (täglich per GitHub Actions, gemeinsam mit der Rabatt-Mail):
//   1. Käufe aus nkr_purchases, die BEWERTUNG_NACH_TAGEN bis
//      BEWERTUNG_BIS_TAGE alt sind und nicht abgemeldet wurden.
//   2. Dazu aus nkr_reports nur die mit bewertung_opt_in = true und
//      bewertung_gesendet = false.
//   3. Mail über Resend, danach bewertung_gesendet = true (kein Doppelversand).
//
// Benötigte Secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY.
// ─────────────────────────────────────────────────────────────────────────
import { BUSINESS } from "../src/config/business.js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const H = { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY };

const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export function bewertungMailHtml(sessionId, vorname, url) {
  const abmeldeLink = "https://nebenkostenradar.com/api/marketing-abmelden?s=" + encodeURIComponent(sessionId);
  const anrede = vorname ? "Hallo " + esc(vorname) + "," : "Hallo,";
  return `<!DOCTYPE html>
<html lang="de"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:'Segoe UI','Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
  <tr><td style="background:#ffffff;border-radius:12px 12px 0 0;padding:24px 32px;border-bottom:2px solid #dde1e7;">
    <div style="font-size:17px;font-weight:800;color:#1a1a1a;">Nebenkosten<span style="color:#3d7a5c;">Radar</span></div>
  </td></tr>
  <tr><td style="background:#ffffff;padding:28px 32px;">
    <p style="font-size:14px;color:#1a1a1a;margin:0 0 16px;">${anrede}</p>
    <p style="font-size:13px;color:#555e68;line-height:1.7;margin:0 0 16px;">
      vor ein paar Tagen hast du deine Nebenkostenabrechnung mit NebenkostenRadar geprüft. Wie war es für dich?
    </p>
    <p style="font-size:13px;color:#555e68;line-height:1.7;margin:0 0 20px;">
      Wir sind ein kleines Angebot aus Frankfurt und freuen uns über eine ehrliche Bewertung, ob gut oder kritisch. Sie hilft anderen Mietern bei der Entscheidung und uns dabei, besser zu werden. Es dauert etwa eine Minute.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
      <a href="${esc(url)}" style="display:inline-block;background:#B5502C;color:#ffffff;text-decoration:none;padding:13px 30px;border-radius:8px;font-size:14px;font-weight:700;">Jetzt bewerten &#8594;</a>
    </td></tr></table>
    <p style="font-size:12px;color:#8a9199;line-height:1.7;margin:20px 0 0;">
      Etwas hat nicht gepasst? Antworte einfach auf diese Mail oder schreib an support@nebenkostenradar.com, wir kümmern uns darum.
    </p>
  </td></tr>
  <tr><td style="background:#f8f9fa;border-radius:0 0 12px 12px;padding:16px 32px;border-top:1px solid #dde1e7;">
    <p style="font-size:11px;color:#8a9199;margin:0;line-height:1.8;text-align:center;">
      NebenkostenRadar &middot; Stefan Hennig &middot; Ludwigstr. 33-37, 60327 Frankfurt am Main<br>
      Du erhältst diese einmalige Mail, weil du beim Kauf zugestimmt hast.
      <a href="${abmeldeLink}" style="color:#8a9199;">Abmelden</a>
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

export async function main() {
  if (!SUPABASE_URL || !SUPABASE_KEY || !RESEND_API_KEY) {
    console.error("Fehlende Umgebungsvariablen (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY).");
    process.exit(1);
  }
  const url = BUSINESS.BEWERTUNG_URL;
  if (!url) { console.log("BEWERTUNG_URL ist leer, keine Bewertungsbitten."); return; }

  const tag = 24 * 60 * 60 * 1000;
  const von = new Date(Date.now() - BUSINESS.BEWERTUNG_BIS_TAGE * tag).toISOString();
  const bis = new Date(Date.now() - BUSINESS.BEWERTUNG_NACH_TAGEN * tag).toISOString();

  const kaufRes = await fetch(
    SUPABASE_URL + "/rest/v1/nkr_purchases?abgemeldet=eq.false&purchased_at=gte." + encodeURIComponent(von) +
      "&purchased_at=lte." + encodeURIComponent(bis) + "&select=session_id,email,vorname",
    { headers: H }
  );
  if (!kaufRes.ok) { console.error("Supabase-Abfrage (Käufe) fehlgeschlagen:", await kaufRes.text()); process.exit(1); }
  const kaeufe = await kaufRes.json();
  if (!kaeufe.length) { console.log("Keine Käufe im Zeitfenster."); return; }

  // Einwilligung steht in nkr_reports. In Blöcken abfragen (URL-Länge).
  const mitEinwilligung = new Set();
  for (let i = 0; i < kaeufe.length; i += 100) {
    const ids = kaeufe.slice(i, i + 100).map(k => '"' + k.session_id + '"').join(",");
    const r = await fetch(
      SUPABASE_URL + "/rest/v1/nkr_reports?session_id=in.(" + encodeURIComponent(ids) + ")&bewertung_opt_in=eq.true&bewertung_gesendet=eq.false&select=session_id",
      { headers: H }
    );
    if (!r.ok) {
      const t = await r.text();
      if (/column|PGRST/i.test(t)) { console.log("Spalten fehlen noch (supabase/2026-10-18-wachstum.sql). Nichts zu tun."); return; }
      console.error("Supabase-Abfrage (Einwilligung) fehlgeschlagen:", t); process.exit(1);
    }
    for (const z of await r.json()) mitEinwilligung.add(z.session_id);
  }

  const faellig = kaeufe.filter(k => mitEinwilligung.has(k.session_id));
  console.log(`${faellig.length} fällige Bewertungsbitte(n).`);
  let ok = 0;
  for (const k of faellig) {
    try {
      const m = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: "Bearer " + RESEND_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "NebenkostenRadar <noreply@nebenkostenradar.com>",
          to: k.email,
          reply_to: "support@nebenkostenradar.com",
          subject: "Wie war deine Prüfung mit NebenkostenRadar?",
          html: bewertungMailHtml(k.session_id, k.vorname, url),
        }),
      });
      if (!m.ok) { console.error("Versand fehlgeschlagen:", k.session_id, await m.text()); continue; }
      await fetch(SUPABASE_URL + "/rest/v1/nkr_reports?session_id=eq." + encodeURIComponent(k.session_id), {
        method: "PATCH",
        headers: { ...H, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ bewertung_gesendet: true }),
      });
      ok++;
    } catch (err) {
      console.error("Fehler bei", k.session_id, err.message);
    }
  }
  console.log(`${ok}/${faellig.length} Bewertungsbitte(n) verschickt.`);
}

// Nur ausführen, wenn direkt gestartet (nicht beim Import in Tests).
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop())) main();
