#!/usr/bin/env node
/**
 * pdf-probedruck.mjs — Erzeugt das fertige Prüfbericht-PDF und prüft es
 * automatisch auf Satzfehler.
 *
 * WARUM ES DIESES SKRIPT GIBT (11.09.2026):
 * Bis heute konnte das PDF nur geprüft werden, indem jemand einen echten
 * Testkauf durchführt und die Datei ansieht. Das ist umständlich, kostet Geld
 * und passiert deshalb selten. Folge: Fehler, die nur im gedruckten Ergebnis
 * sichtbar sind, blieben lange unentdeckt. Beim ersten Lauf dieses Skripts
 * kamen sofort vier heraus:
 *
 *   1. Jeder Posten stand auf der Steuerseite bis zu dreimal (drei Tabellen
 *      mit überlappendem Inhalt).
 *   2. "Versicherungspoli-cen" und "Arbeit-skostenanteil": react-pdf trennt
 *      lange Wörter automatisch, kennt aber keine deutschen Trennregeln.
 *   3. "Wie Heizkosten: Lieferung, keine Dienstleistung." mit zwei
 *      Doppelpunkten im selben Satz.
 *   4. Ein Schrägstrich im Brief an den Vermieter.
 *
 * Alle vier waren im Quelltext unsichtbar und nur im Satz erkennbar.
 *
 * AUFRUF:
 *   node scripts/pdf-probedruck.mjs
 *
 * Legt /tmp/nkr-probedruck.pdf an und meldet gefundene Probleme. Beendet sich
 * mit Code 1, wenn etwas gefunden wurde, damit es in eine automatische Prüfung
 * eingebunden werden kann.
 *
 * WIE ES LÄUFT: Über "npm run probedruck". Der Umweg über esbuild ist nötig,
 * weil Node die .jsx-Dateien der PDF-Bausteine nicht direkt lesen kann. Das
 * Bündel landet in .probedruck.mjs und wird danach wieder gelöscht.
 *
 * Die Schriften findet das Skript von selbst: AbrechnungPDF.jsx erkennt seit
 * dem 11.09.2026, ob es im Browser oder auf der Kommandozeile läuft, und wählt
 * den passenden Pfad (siehe FONT_BASIS dort).
 */
import React from "react";
import { readFileSync } from "fs";
import { renderToFile } from "@react-pdf/renderer";
// Statische Importe, damit esbuild sie einbündelt. Mit dynamischem import()
// würde zur Laufzeit gegen den Ort des Bündels aufgelöst, nicht gegen diese
// Datei, und die Pfade gingen ins Leere.
import { buildResult } from "../src/lib/analyse.js";
import PruefberichtDocument from "../src/pdf/PruefberichtDocument.jsx";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

globalThis.React = React;

// TESTFALL: Stefans echte Abrechnung (ABG Frankfurt, 80,55 m², 2025). Bewusst
// ein realer Fall statt erfundener Zahlen — er hat schon mehrere Fehler
// aufgedeckt, die mit runden Wunschwerten nie aufgefallen wären.
const werte = {
  heizkosten_gesamt: "700.81", warmwasser_gesamt: "461.75", kaltwasser: "474.63",
  hauswart: "48.60", niederschlagswasser: "15.13", strassenreinigung: "29.53",
  schnee_eis_beseitigung: "18.89", feuerversicherung: "355.59",
  haftpflichtversicherung: "4.02", sturm_hagel_versicherung: "78.59",
  leitungswasser_versicherung: "162.33", grundsteuer: "247.97",
  muellbeseitigung: "236.66", hausreinigung: "232.66", gartenpflege: "41.40",
  allgemeinstrom: "33.86", schornsteinreinigung: "1.86",
  rauchwarnmelder_wartung: "7.89", sonstiges_vereinbart: "12.67",
};
const wohnung = { flaeche: "80.55", jahr: "2025", vorauszahlung: "3360.00" };
const adressen = {
  mieterName: "Max Mustermann", mieterStrasse: "Musterweg 1",
  mieterPlz: "60439", mieterOrt: "Frankfurt am Main",
  vermieterName: "Musterverwaltung GmbH", vermieterStrasse: "Musterstraße 107",
  vermieterPlz: "60329", vermieterOrt: "Frankfurt am Main",
};

const ZIEL = "/tmp/nkr-probedruck.pdf";
const result = buildResult(werte, wohnung);
await renderToFile(
  React.createElement(PruefberichtDocument, { result, wohnung, werte, adressen, stufe: "voll" }),
  ZIEL
);

// ── Automatische Prüfungen auf dem fertigen PDF ──────────────────────────
// pdfjs statt pdfplumber, damit keine Python-Abhängigkeit nötig ist.
const doc = await getDocument({ data: new Uint8Array(readFileSync(ZIEL)) }).promise;
let text = "";
for (let i = 1; i <= doc.numPages; i++) {
  const inhalt = await doc.getPage(i).then(p => p.getTextContent());
  text += inhalt.items.map(x => x.str).join(" ") + "\n";
}

const probleme = [];
const pruefe = (name, bedingung, fund) => { if (bedingung) probleme.push(name + (fund ? ": " + fund : "")); };

// 1. Falsche Worttrennung. react-pdf trennt ohne deutsche Regeln.
//    Ausgenommen die Ergänzungsbindestriche: "Gebäude- und Feuerversicherung",
//    "Sturm- und Hagelversicherung" sind korrektes Deutsch und dürfen nicht
//    als Fehler gemeldet werden. Sie sind daran erkennbar, dass nach dem
//    Bindestrich eine Konjunktion folgt.
const trennung = (text.match(/[a-zäöüß]{3,}-\s+[a-zäöüß]{2,}/g) || [])
  .filter(s => !/-\s+(und|oder|bzw|sowie|wie)\b/.test(s));
pruefe("Falsche Worttrennung", trennung.length > 0, trennung.slice(0, 3).join(" | "));

// 2. Gedankenstriche. Stefans Vorgabe, sie sollen nirgends im Kundendokument stehen.
pruefe("Gedankenstrich im Dokument", /[—–]/.test(text), (text.match(/.{0,30}[—–].{0,30}/) || [])[0]);

// 3. Schrägstriche zwischen Wörtern. Ebenfalls Stefans Vorgabe.
const schraeg = text.match(/[a-zäöüßA-ZÄÖÜ]{4,}\/[a-zäöüßA-ZÄÖÜ]{4,}/g) || [];
pruefe("Schrägstrich zwischen Wörtern", schraeg.length > 0, schraeg.slice(0, 3).join(" | "));

// 4. Zwei Doppelpunkte im selben Satz. Entsteht leicht, wenn ein Label und ein
//    Begründungstext zusammengesetzt werden, die beide schon einen enthalten.
const doppelt = (text.match(/[^.\n]{0,60}:[^.\n]{0,40}:[^.\n]{0,40}/g) || [])
  .filter(s => !/https?:/.test(s));
pruefe("Zwei Doppelpunkte in einem Satz", doppelt.length > 0, doppelt.slice(0, 2).join(" | "));

// 5. Dopplung: Kein Posten darf auf der Steuerseite mehrfach auftauchen.
const steuerSeite = text.split("Steuer-Bonus").slice(1).join(" ");
for (const posten of ["Hauswart", "Gartenpflege", "Schornsteinreinigung", "Wartung Rauchwarnmelder"]) {
  const n = (steuerSeite.match(new RegExp(posten, "g")) || []).length;
  pruefe(`Posten "${posten}" steht ${n}x auf der Steuerseite`, n > 1);
}

console.log(`PDF erzeugt: ${ZIEL} · ${doc.numPages} Seiten`);
if (probleme.length === 0) {
  console.log("✓ Keine Satzfehler gefunden.");
} else {
  console.log(`✗ ${probleme.length} Problem(e):`);
  probleme.forEach(p => console.log("  " + p));
  process.exitCode = 1;
}
