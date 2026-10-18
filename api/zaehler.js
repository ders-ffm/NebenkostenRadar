// ─────────────────────────────────────────────────────────────────────────
// zaehler.js — Anonyme Tageszähler (18.10.2026), Gegenstück zu
// src/lib/messung.js.
//
// Nimmt { e: <ereignis>, p: <partnercode> } entgegen und zählt in Supabase
// (Tabelle nkr_zaehler, Funktion nkr_zaehler_plus, siehe
// supabase/2026-10-18-wachstum.sql) einen Tageswert hoch. Gespeichert wird
// nur: Datum, Ereignis, Partnercode, Anzahl. Keine IP, keine Kennung.
//
// Antwortet IMMER mit 204, auch bei Fehlern: Der Browser schickt die
// Zählung per sendBeacon und wertet die Antwort ohnehin nicht aus, und ein
// Fehler hier darf nie sichtbar werden.
//
// Grenze, bewusst in Kauf genommen: Wer will, kann die Zähler künstlich
// hochtreiben (es gibt keine Anmeldung, an der man das festmachen könnte).
// Deshalb sind nur vier Ereignisnamen und kurze Partnercodes erlaubt, und
// die Käufe in der Monatsauswertung kommen NICHT aus diesen Zählern,
// sondern aus den echten Zahlungen (nkr_purchases).
//
// Function-Zählung Vercel Hobby (max. 12): mit dieser Datei 11.
// ─────────────────────────────────────────────────────────────────────────
import { EREIGNISSE, partnerCodeBereinigen } from "../src/lib/messung.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  let body = req.body;
  // sendBeacon schickt einen Blob; je nach Laufzeit kommt er als String an.
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const ereignis = String(body?.e || "");
  const partner = partnerCodeBereinigen(body?.p);

  if (!EREIGNISSE.includes(ereignis) || !supabaseUrl || !supabaseKey) {
    return res.status(204).end();
  }

  try {
    const r = await fetch(supabaseUrl + "/rest/v1/rpc/nkr_zaehler_plus", {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: "Bearer " + supabaseKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_ereignis: ereignis, p_partner: partner }),
    });
    if (!r.ok) console.error("Zähler Fehler:", r.status, await r.text());
  } catch (err) {
    console.error("Zähler Fehler:", err.message);
  }
  return res.status(204).end();
}
