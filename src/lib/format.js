// ─────────────────────────────────────────────────────────────────────────
// format.js — Zahlen- und Betrags-Hilfsfunktionen
// Wiederverwendbar für andere Projekte (keine NebenkostenRadar-spezifische Logik).
// ─────────────────────────────────────────────────────────────────────────

// Wandelt Nutzereingaben (auch "1.200,50" oder "1200.50") sicher in eine Zahl um.
export function toNum(v) {
  if (v == null || v === "") return 0;
  let s = String(v).trim();
  if (/^\d{1,3}(\.\d{3})+(,\d*)?$/.test(s)) s = s.replace(/\./g, "").replace(",", ".");
  else s = s.replace(",", ".");
  const n = parseFloat(s);
  return !isNaN(n) && n > 0 ? n : 0;
}

// Formatiert eine Zahl als Euro-Betrag, z.B. "€ 142,00"
export function fmt(n) {
  return n != null && !isNaN(n) ? "€ " + parseFloat(n || 0).toFixed(2) : "€ 0,00";
}

// Prozentanteil a von b, gerundet
export function pct(a, b) {
  return b > 0 ? Math.round((a / b) * 100) : 0;
}

// Formatiert eine Zahl fürs Eingabefeld mit deutschem Tausenderpunkt und
// Komma-Dezimaltrennzeichen, z.B. 1200.5 -> "1.200,50". Nur fürs Anzeigen,
// nicht fürs Rechnen (dafür toNum verwenden).
export function fmtInput(n, decimals = 2) {
  if (n == null || n === "" || isNaN(n)) return "";
  return Number(n).toLocaleString("de-DE", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}
