// ─────────────────────────────────────────────────────────────────────────
// format.js — Zahlen- und Betrags-Hilfsfunktionen
// Wiederverwendbar für andere Projekte (keine NebenkostenRadar-spezifische Logik).
// ─────────────────────────────────────────────────────────────────────────

// Wandelt Nutzereingaben (auch "1.200,50" oder "1200.50") sicher in eine Zahl um.
//
// ÜBERARBEITET 09.09.2026 (Fund aus scripts/pdf-konsistenz-test.mjs, siehe
// CHANGELOG). Die Vorversion behandelte nur ein einziges Sonderformat
// (deutsche Tausenderpunkte) und ersetzte sonst stur das ERSTE Komma durch
// einen Punkt. Das führte bei mehrdeutigen Eingaben still zu Werten, die um
// Faktor 1000 danebenlagen — ohne jede Fehlermeldung:
//
//   "1,234.56"  → 1,23 €        (gemeint: 1.234,56 €)   ← englisches Format
//   "1,2,3"     → 1,20 €        (Vertipper)
//   "1.2.3"     → 1,20 €        (Vertipper)
//
// Solche Werte landen unbemerkt im gekauften Prüfbericht und im Brief an den
// Vermieter. Der Eingabefilter in components/ui/EuroInput.jsx lässt Punkt
// UND Komma zu, beide Formate sind also erreichbar.
//
// NEUE REGEL — "das letzte Trennzeichen ist das Dezimaltrennzeichen":
// Das ist die übliche, robuste Auslegung, weil sie deutsche und englische
// Schreibweise gleichzeitig korrekt trifft, ohne die Sprache raten zu müssen.
// Sonderfall davor: Stehen NUR Punkte und bilden sie sauber Dreiergruppen
// ("1.234", "12.345.678"), sind es Tausenderpunkte — sonst wäre "1.234" als
// 1,234 gelesen worden, was bei einer Betragseingabe nie gemeint ist.
export function toNum(v) {
  if (v == null || v === "") return 0;
  const s = String(v).trim();
  if (!/\d/.test(s)) return 0;

  const letzterPunkt = s.lastIndexOf(".");
  const letztesKomma = s.lastIndexOf(",");
  let normalisiert;

  if (letzterPunkt === -1 && letztesKomma === -1) {
    normalisiert = s;
  } else if (letztesKomma === -1 && /^\d{1,3}(\.\d{3})+$/.test(s)) {
    // Reine Tausenderpunkte, z. B. "1.234" oder "12.345.678"
    normalisiert = s.replace(/\./g, "");
  } else {
    // Das zuletzt stehende Trennzeichen trennt die Nachkommastellen ab,
    // alle davor stehenden Trennzeichen sind Gruppierung und fliegen raus.
    const trennerPos = Math.max(letzterPunkt, letztesKomma);
    const ganz = s.slice(0, trennerPos).replace(/[.,]/g, "");
    const nachkomma = s.slice(trennerPos + 1).replace(/[.,]/g, "");
    normalisiert = nachkomma ? ganz + "." + nachkomma : ganz;
  }

  const n = parseFloat(normalisiert);
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
