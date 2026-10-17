// ─────────────────────────────────────────────────────────────────────────
// vertragsmail.js — NEU 17.10.2026 (Compliance-Check, siehe CHANGELOG.md)
//
// Baut die Vertragsbestätigung, die api/webhook.js nach jeder bezahlten
// Bestellung per E-Mail verschickt.
//
// WARUM DAS NÖTIG IST (in einfachen Worten):
// Bei digitalen Inhalten erlischt das Widerrufsrecht nur dann vorzeitig,
// wenn der Kunde (1) zugestimmt hat, dass wir sofort liefern, (2) bestätigt
// hat, dass er dadurch sein Widerrufsrecht verliert, UND (3) wir ihm danach
// eine Vertragsbestätigung auf einem dauerhaften Datenträger (E-Mail)
// geschickt haben, in der diese Zustimmung festgehalten ist
// (§ 356 Abs. 5 Nr. 3 i. V. m. § 312f Abs. 3 BGB). Punkt 1 und 2 deckt die
// Checkbox in Result.jsx ab. Punkt 3 fehlte bis 17.10.2026: Die Kaufmail aus
// api/send-email.js enthielt nur „Dein Prüfbericht ist fertig“ und das PDF.
// Folge war, dass Kunden 14 Tage lang widerrufen konnten, obwohl sie den
// Bericht schon hatten, und eine abmahnfähige Lücke.
//
// Außerdem verlangt § 312f Abs. 2 BGB, dass die Bestätigung den
// Vertragsinhalt einschließlich der AGB enthält. Deshalb hängen die AGB
// (aus src/config/vertrag.js, dieselbe Quelle wie die Webseite) vollständig
// unten an.
// ─────────────────────────────────────────────────────────────────────────
import { agbAbschnitte, AGB_STAND, ANBIETER, leistungsbeschreibung } from "../config/vertrag.js";

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function euroAusCent(cent) {
  const n = Number(cent);
  if (!Number.isFinite(n)) return "–";
  return (n / 100).toFixed(2).replace(".", ",") + " €";
}

function zeitBerlin(d) {
  return new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Berlin", day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(d) + " Uhr";
}

export function vertragsbestaetigungBetreff() {
  return "Deine Bestellung bei NebenkostenRadar: Vertragsbestätigung";
}

// widerrufOk: ob die Checkbox zum vorzeitigen Erlöschen gesetzt war
// (nkr_reports.widerruf_ok). Ohne sie ist ein Kauf in der Oberfläche nicht
// möglich; fehlt der Wert trotzdem (z. B. alte Datensätze), nennen wir das
// volle Widerrufsrecht, statt etwas zu bestätigen, das nicht belegt ist.
export function vertragsbestaetigungHtml({ vorname, stufe, betragCent, zeitpunkt, bestellnummer, widerrufOk }) {
  const anrede = vorname ? `Hallo ${esc(vorname)},` : "Hallo,";
  const produkt = stufe === "voll" ? "Auswertung + Brief" : "Auswertung";
  const zeile = (k, v) =>
    `<tr><td style="font-size:12px;color:#8a9199;padding:6px 12px 6px 0;vertical-align:top;white-space:nowrap;">${k}</td><td style="font-size:13px;color:#1a1a1a;padding:6px 0;">${v}</td></tr>`;

  const widerrufAbsatz = widerrufOk
    ? `<p style="font-size:13px;color:#1a1a1a;line-height:1.7;margin:0 0 14px;"><strong>Bestätigung deiner Erklärung zum Widerrufsrecht:</strong> Du hast vor dem Kauf ausdrücklich zugestimmt, dass wir vor Ablauf der Widerrufsfrist mit der Ausführung des Vertrags beginnen. Außerdem hast du bestätigt, dass du weißt, dass du dadurch dein Widerrufsrecht verlierst, sobald wir mit der Ausführung begonnen haben (§ 356 Abs. 5 BGB). Mit der Bereitstellung deines PDFs ist die Ausführung begonnen.</p>`
    : `<p style="font-size:13px;color:#1a1a1a;line-height:1.7;margin:0 0 14px;"><strong>Widerrufsrecht:</strong> Dir steht ein 14-tägiges Widerrufsrecht zu. Die Einzelheiten stehen in § 6 der AGB unten.</p>`;

  const agb = agbAbschnitte().map(a =>
    `<div style="font-size:11px;font-weight:700;color:#1a1a1a;margin:14px 0 4px;">${esc(a.t)}</div>` +
    a.lines.map(l => `<p style="font-size:11px;color:#555e68;line-height:1.6;margin:0 0 6px;">${esc(l)}</p>`).join("")
  ).join("");

  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8f9fa;font-family:'Segoe UI','Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
  <tr><td style="background:#ffffff;border-radius:12px 12px 0 0;padding:24px 32px;border-bottom:2px solid #dde1e7;">
    <div style="font-size:17px;font-weight:800;color:#1a1a1a;">Nebenkosten<span style="color:#3d7a5c;">Radar</span></div>
    <div style="font-size:10px;color:#3d7a5c;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;">Vertragsbestätigung</div>
  </td></tr>
  <tr><td style="background:#ffffff;padding:28px 32px;">
    <p style="font-size:14px;color:#1a1a1a;margin:0 0 14px;">${anrede}</p>
    <p style="font-size:13px;color:#1a1a1a;line-height:1.7;margin:0 0 14px;">vielen Dank für deinen Kauf. Hiermit bestätigen wir dir den Vertrag. Dein PDF bekommst du direkt nach der Zahlung zum Download und in einer separaten E-Mail; unter <a href="https://nebenkostenradar.com/login" style="color:#3d7a5c;">nebenkostenradar.com/login</a> kannst du es 12 Monate lang erneut herunterladen.</p>
    <table cellpadding="0" cellspacing="0" style="margin:0 0 16px;border-top:1px solid #dde1e7;border-bottom:1px solid #dde1e7;width:100%;">
      ${zeile("Anbieter", `${esc(ANBIETER.name)}, Inhaber ${esc(ANBIETER.inhaber)}, ${esc(ANBIETER.strasse)}, ${esc(ANBIETER.ort)}, ${esc(ANBIETER.email)}`)}
      ${zeile("Leistung", `<strong>${esc(produkt)}</strong><br><span style="font-size:12px;color:#555e68;">${esc(leistungsbeschreibung(stufe))}</span>`)}
      ${zeile("Preis", `${euroAusCent(betragCent)} (Einmalzahlung, kein Abo). Kleinunternehmer gemäß § 19 UStG, es wird keine Umsatzsteuer ausgewiesen.`)}
      ${zeile("Vertragsschluss", esc(zeitBerlin(zeitpunkt)))}
      ${zeile("Bestellnummer", esc(bestellnummer))}
    </table>
    ${widerrufAbsatz}
    <p style="font-size:12px;color:#555e68;line-height:1.7;margin:0 0 6px;">Der Prüfbericht ist eine automatisierte Einschätzung auf Grundlage deiner Angaben und ersetzt keine Rechtsberatung.</p>
    <p style="font-size:12px;color:#555e68;line-height:1.7;margin:0;">Fragen? Antworte einfach auf diese E-Mail oder schreib an ${esc(ANBIETER.email)}.</p>
  </td></tr>
  <tr><td style="background:#f8f9fa;padding:20px 32px;border-top:1px solid #dde1e7;">
    <div style="font-size:12px;font-weight:700;color:#1a1a1a;">Allgemeine Geschäftsbedingungen (Stand ${esc(AGB_STAND)}), Teil dieses Vertrags</div>
    ${agb}
  </td></tr>
  <tr><td style="background:#f8f9fa;border-radius:0 0 12px 12px;padding:14px 32px;border-top:1px solid #dde1e7;">
    <p style="font-size:11px;color:#8a9199;margin:0;line-height:1.8;text-align:center;">${esc(ANBIETER.name)} &middot; ${esc(ANBIETER.inhaber)} &middot; ${esc(ANBIETER.strasse)}, ${esc(ANBIETER.ort)} &middot; ${esc(ANBIETER.email)}</p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}
