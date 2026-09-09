// ─────────────────────────────────────────────────────────────────────────
// eingaben-test.mjs — Prüft die Betragsauswertung (toNum) gegen alles, was
// ein Kunde in ein Geldfeld tippen kann.
//
// ANLASS (09.09.2026): Die Vorversion von toNum() las "1,234.56" als 1,23 €
// statt 1.234,56 € — ein stiller Fehler um Faktor 1000, der unbemerkt im
// gekauften Prüfbericht und im Brief an den Vermieter gelandet wäre.
//
// AUSFÜHREN:  node scripts/eingaben-test.mjs
// Exit-Code 0 = alle Erwartungen erfüllt, 1 = mindestens eine Abweichung.
//
// Die Spalte "eingetippt" ist die ROHE Tastatureingabe. Was davon im Feld
// ankommt, entscheidet der Filter aus components/ui/EuroInput.jsx
// (alles außer 0-9 . , wird verworfen) — der ist hier nachgebaut, damit der
// Test denselben Weg nimmt wie ein echter Nutzer.
// ─────────────────────────────────────────────────────────────────────────
import { toNum, fmtInput } from "../src/lib/format.js";

// Exakt der Filter aus EuroInput.handleChange
const eingabefilter = s => String(s).replace(/[^0-9.,]/g, "");

const FAELLE = [
  // [Tastatureingabe, erwarteter Wert, Beschreibung]
  ["1234,56", 1234.56, "deutsches Komma"],
  ["1.234,56", 1234.56, "deutsch mit Tausenderpunkt"],
  ["12.345.678,90", 12345678.9, "deutsch, mehrere Tausendergruppen"],
  ["1234.56", 1234.56, "Punkt als Dezimaltrenner"],
  ["1,234.56", 1234.56, "englisches Format (war vorher 1,23!)"],
  ["1.234", 1234, "deutscher Tausenderpunkt ohne Cent"],
  ["12.345.678", 12345678, "mehrere Tausendergruppen ohne Cent"],
  ["1.23", 1.23, "Punkt, zwei Nachkommastellen"],
  ["1,2,3", 12.3, "zwei Kommas (Vertipper, war vorher 1,20)"],
  ["1.2.3", 12.3, "zwei Punkte (Vertipper, war vorher 1,20)"],
  ["50,", 50, "Komma am Ende"],
  [",50", 0.5, "Komma am Anfang"],
  ["50.", 50, "Punkt am Ende"],
  ["00050", 50, "führende Nullen"],
  ["0", 0, "Null"],
  ["0,00", 0, "Null mit Nachkommastellen"],
  ["", 0, "leeres Feld"],
  ["   ", 0, "nur Leerzeichen"],
  ["abc", 0, "reiner Text (Filter entfernt alles)"],
  ["12abc", 12, "Zahl mit Text dahinter"],
  ["-50", 50, "Minus (Filter entfernt es, Kosten sind nie negativ)"],
  ["€ 50", 50, "Währungszeichen vorn"],
  ["50 €", 50, "Währungszeichen hinten"],
  ["1 234,56", 1234.56, "Leerzeichen als Tausendertrenner"],
  ["99999999999", 99999999999, "unrealistisch groß (Tippfehler)"],
  ["0,001", 0.001, "unter einem Cent"],
  [",", 0, "nur ein Komma"],
  [".", 0, "nur ein Punkt"],
  [",,,", 0, "nur Kommas"],
  ["1.000.000,00", 1000000, "eine Million deutsch"],
  ["1,000,000.00", 1000000, "eine Million englisch"],
];

let fehler = 0;
console.log("eingetippt".padEnd(18) + "im Feld".padEnd(16) + "verstanden".padEnd(16) + "Anzeige".padEnd(16) + "Status");
console.log("─".repeat(84));
for (const [roh, erwartet, beschreibung] of FAELLE) {
  const imFeld = eingabefilter(roh);
  const ist = toNum(imFeld);
  const ok = Math.abs(ist - erwartet) < 1e-9;
  if (!ok) fehler++;
  console.log(
    `"${roh}"`.padEnd(18) +
    `"${imFeld}"`.padEnd(16) +
    String(ist).padEnd(16) +
    (ist > 0 ? fmtInput(ist) : "(leer)").padEnd(16) +
    (ok ? "✓" : `✗ erwartet ${erwartet}`) +
    "   " + beschreibung
  );
}

console.log("─".repeat(84));
console.log(`${FAELLE.length} Eingaben geprüft · ${fehler} Abweichungen`);
console.log(fehler === 0 ? "✓ Alle Betragseingaben werden wie erwartet ausgewertet." : "✗ Bitte oben ansehen.");
process.exit(fehler === 0 ? 0 : 1);
