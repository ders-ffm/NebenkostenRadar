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

const stichtag = new Date();
stichtag.setDate(stichtag.getDate() - 365);
const stichtagISO = stichtag.toISOString();

async function loeschen(tabelle, spalte) {
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

await loeschen("nkr_reports", "created_at");
await loeschen("nkr_purchases", "purchased_at");
