// ─────────────────────────────────────────────────────────────────────────
// messung.js — Partnercode und anonyme Zähler (18.10.2026)
//
// WARUM: Bis heute wusste niemand, wie viele Besucher die kostenlose Prüfung
// starten, wie viele ein Ergebnis sehen und wie viele auf "Jetzt kaufen"
// klicken. GA4 läuft nur mit Einwilligung und zählt deshalb nur einen Teil.
// Ohne diese Zahlen lässt sich die Frage "lohnt sich das Projekt?" nicht
// beantworten (Prüftermin 31.03.2027, siehe CHANGELOG).
//
// DATENSCHUTZ, bewusst so gebaut:
//   - Kein Cookie, kein localStorage, kein sessionStorage. Ob ein Ereignis in
//     diesem Seitenaufruf schon gezählt wurde, steht nur im Arbeitsspeicher
//     (Variable unten) und ist beim Schließen des Tabs weg. Damit wird nichts
//     auf dem Endgerät gespeichert oder ausgelesen (§ 25 TDDDG greift nicht).
//   - Übertragen wird nur der Name des Ereignisses und ggf. der Partnercode.
//     Keine Nutzerkennung, keine Eingaben. Der Server (api/zaehler.js)
//     speichert nur Tageszahlen, keine IP.
//
// PARTNERCODE: Partner verlinken auf nebenkostenradar.com/?p=<code>. Der
// Code wird beim Laden gelesen, aus der Adresszeile entfernt (damit er nicht
// weiterkopiert oder als eigene URL indexiert wird) und bis zum Kauf im
// Arbeitsspeicher gehalten. Beim Kauf geht er mit an api/save-report.js.
// Wer die Seite schließt und später ohne Link wiederkommt, wird nicht mehr
// zugeordnet. Das ist der Preis dafür, ohne Cookie auszukommen.
// Keine Provision, kein Rabatt (Stefans Ausgabengrundsatz, 25.09.2026).
// ─────────────────────────────────────────────────────────────────────────

export const EREIGNISSE = ["partner", "start", "ergebnis", "kauf_klick"];
const CODE_MUSTER = /^[a-z0-9-]{2,30}$/;

export function partnerCodeBereinigen(roh) {
  const c = String(roh || "").trim().toLowerCase();
  return CODE_MUSTER.test(c) ? c : "";
}

let partnerCode = "";
const gezaehlt = new Set();

function istBot() {
  try {
    return navigator.webdriver === true || /bot|crawl|spider|slurp|lighthouse|headless/i.test(navigator.userAgent || "");
  } catch { return true; }
}

// Liest ?p= einmalig beim Start und entfernt den Parameter aus der URL.
// Andere Parameter (z. B. ?fortsetzen=) bleiben unberührt.
export function partnerAusUrlLesen() {
  try {
    const url = new URL(window.location.href);
    const roh = url.searchParams.get("p");
    if (roh === null) return partnerCode;
    url.searchParams.delete("p");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
    const c = partnerCodeBereinigen(roh);
    if (c) {
      partnerCode = c;
      zaehle("partner");
    }
  } catch { /* ohne URL-API: kein Partnercode */ }
  return partnerCode;
}

export function aktuellerPartner() {
  return partnerCode;
}

// Zählt ein Ereignis höchstens einmal pro Seitenaufruf. Fehler werden
// verschluckt: Eine Zählung darf nie den Ablauf für den Nutzer stören.
export function zaehle(ereignis) {
  if (!EREIGNISSE.includes(ereignis) || gezaehlt.has(ereignis) || istBot()) return;
  gezaehlt.add(ereignis);
  try {
    const body = JSON.stringify({ e: ereignis, p: partnerCode });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/zaehler", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/zaehler", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
    }
  } catch { /* nichts tun */ }
}

// Nur für Tests: Zustand zurücksetzen.
export function _zuruecksetzen() {
  partnerCode = "";
  gezaehlt.clear();
}
