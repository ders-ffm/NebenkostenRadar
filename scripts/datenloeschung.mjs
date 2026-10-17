// ─────────────────────────────────────────────────────────────────────────
// datenloeschung.mjs — NEU (08/2026)
//
// Setzt das in der Datenschutzerklärung versprochene Löschkonzept um
// (Grundsatz der Speicherbegrenzung, Art. 5 Abs. 1 lit. e DSGVO):
// Löscht wöchentlich alle Zeilen, die älter als 365 Tage sind, aus:
//   - nkr_reports    (Eingabedaten, created_at)
//   - nkr_purchases  (Kaufprotokoll/Marketing-Opt-in, purchased_at)
//
// Bewusst 365 Tage ab dem jeweiligen Zeitstempel, nicht "einmal im Jahr am
// Stichtag" — jede Zeile wird individuell nach ihrem eigenen Alter gelöscht.
//
// NEU 30.08.2026 (siehe api/save-draft.js): nkr_drafts sind unbezahlte
// Zwischenstände fürs "Später fortsetzen" — dafür reicht eine deutlich
// kürzere Frist von 30 Tagen, eine 365-Tage-Aufbewahrung wäre hier nicht durch
// einen erkennbaren Zweck gedeckt.
//
// NEU 17.10.2026 (Compliance-Check): Unbezahlte Zeilen in nkr_reports.
// Die Zeile entsteht beim Klick auf "Jetzt kaufen", also VOR der Zahlung
// (Adressen.jsx → api/save-report.js). Bricht jemand den Kauf ab, blieb sie
// bisher 365 Tage liegen, obwohl die Datenschutzerklärung Speicherung nur
// für Käufe beschreibt. Ohne Zahlung gibt es dafür keinen Zweck mehr.
// Jetzt: Zeilen ohne protokollierten Kauf in nkr_purchases werden nach
// 30 Tagen gelöscht (Frist wie bei den Entwürfen; lässt Zeit für verspätete
// Zahlungseingänge und Rückfragen zu Kaufabbrüchen).
//
// Läuft wöchentlich per GitHub Actions, $0 Zusatzkosten.
//
// Benötigte GitHub-Secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// (bereits vorhanden).
// ─────────────────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Fehlende Umgebungsvariablen (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).");
  process.exit(1);
}

function stichtagVor(tage) {
  const d = new Date();
  d.setDate(d.getDate() - tage);
  return d.toISOString();
}

async function loeschen(tabelle, spalte, tage) {
  const stichtagISO = stichtagVor(tage);
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${tabelle}?${spalte}=lt.${encodeURIComponent(stichtagISO)}`,
    {
      method: "DELETE",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: "Bearer " + SUPABASE_KEY,
        Prefer: "return=representation",
      },
    }
  );
  if (!res.ok) {
    console.error(`Löschen in ${tabelle} fehlgeschlagen:`, res.status, await res.text());
    return;
  }
  const geloescht = await res.json();
  console.log(`${tabelle}: ${geloescht.length} Zeile(n) älter als ${stichtagISO} gelöscht.`);
}

async function holeAlle(pfad) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${pfad}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY },
  });
  if (!res.ok) throw new Error(pfad + ": " + res.status + " " + (await res.text()));
  return res.json();
}

async function unbezahlteLoeschen(tage) {
  const stichtagISO = stichtagVor(tage);
  let alt;
  try {
    // Supabase liefert höchstens 1000 Zeilen pro Abfrage. Mehr unbezahlte
    // Altzeilen werden dann eben in den folgenden Wochen abgearbeitet.
    alt = (await holeAlle(`nkr_reports?created_at=lt.${encodeURIComponent(stichtagISO)}&select=session_id&limit=1000`))
      .map(z => z.session_id).filter(Boolean);
  } catch (err) {
    console.error("Unbezahlte Berichte: Abfrage fehlgeschlagen, nichts gelöscht:", err.message);
    return;
  }
  let summe = 0;
  for (let i = 0; i < alt.length; i += 100) {
    const teil = alt.slice(i, i + 100);
    const liste = encodeURIComponent(teil.map(id => '"' + String(id).replace(/"/g, "") + '"').join(","));
    // Kaufprüfung pro Block direkt in nkr_purchases (statt einer Gesamtliste
    // aller Käufe, die bei über 1000 Käufen abgeschnitten wäre). Schlägt die
    // Prüfung fehl, wird NICHTS gelöscht: lieber zu lange speichern als
    // versehentlich einen bezahlten Bericht entfernen.
    let gekauft;
    try {
      gekauft = new Set((await holeAlle(`nkr_purchases?select=session_id&session_id=in.(${liste})`)).map(z => z.session_id));
    } catch (err) {
      console.error("Kaufprüfung fehlgeschlagen, Block übersprungen:", err.message);
      continue;
    }
    const ohneKauf = teil.filter(id => !gekauft.has(id));
    if (!ohneKauf.length) continue;
    const loeschListe = encodeURIComponent(ohneKauf.map(id => '"' + String(id).replace(/"/g, "") + '"').join(","));
    const res = await fetch(`${SUPABASE_URL}/rest/v1/nkr_reports?session_id=in.(${loeschListe})`, {
      method: "DELETE",
      headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY, Prefer: "return=representation" },
    });
    if (!res.ok) { console.error("Löschen unbezahlter Berichte fehlgeschlagen:", res.status, await res.text()); return; }
    summe += (await res.json()).length;
  }
  console.log(`nkr_reports: ${summe} unbezahlte Zeile(n) älter als ${stichtagISO} gelöscht.`);
}

await unbezahlteLoeschen(30);
await loeschen("nkr_reports", "created_at", 365);
await loeschen("nkr_purchases", "purchased_at", 365);
await loeschen("nkr_drafts", "created_at", 30);
