// ─────────────────────────────────────────────────────────────────────────
// supabase-keepalive.mjs — NEU (08/2026)
//
// Supabase pausiert Free-Tier-Projekte automatisch nach 7 Tagen ohne echte
// Datenbank-Anfragen (nicht Dashboard-Besuche — es zählen nur tatsächliche
// Abfragen über die REST-API). Dieses Skript stellt EIGENSTÄNDIG sicher,
// dass täglich mindestens eine minimale Abfrage stattfindet — unabhängig
// von anderen Jobs (z. B. marketing-rabatt-versand.mjs), damit die Website
// auch dann nicht pausiert, wenn ihr an anderer Stelle mal etwas ändert
// oder abschaltet.
//
// Läuft täglich per GitHub Actions, $0 Zusatzkosten (siehe
// .github/workflows/supabase-keepalive.yml).
//
// Benötigte GitHub-Secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// (bereits vorhanden, gleiche wie bei den anderen Skripten).
// ─────────────────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Fehlende Umgebungsvariablen (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).");
  process.exit(1);
}

const res = await fetch(SUPABASE_URL + "/rest/v1/nkr_reports?select=session_id&limit=1", {
  headers: { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY },
});

if (!res.ok) {
  console.error("Keep-Alive-Abfrage fehlgeschlagen:", res.status, await res.text());
  process.exit(1);
}
console.log("Supabase Keep-Alive erfolgreich —", new Date().toISOString());
