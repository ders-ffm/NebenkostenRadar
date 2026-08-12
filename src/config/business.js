// ─────────────────────────────────────────────────────────────────────────
// business.js — Projektspezifische Geschäftskonfiguration (NebenkostenRadar)
//
// Im Unterschied zu theme.js ist diese Datei NICHT wiederverwendbar für ein
// anderes Projekt — hier stehen Preise, Zahlungslink und die fachlichen
// Vergleichswerte für die Nebenkosten-Prüfung.
//
// WICHTIG — Richtwerte-Pflege:
// Quelle: Deutscher Mieterbund, Betriebskostenspiegel Abrechnungsjahr 2024,
// veröffentlicht 18.12.2025 (aktuellste verfügbare Ausgabe, Stand 08/2026).
// https://mieterbund.de/service/checks-formulare/betriebskosten/betriebskostenspiegel/
// Diese Datei wird vom geplanten Skript scripts/richtwerte-monitor.mjs auf
// Aktualität geprüft (Benachrichtigung bei neuer DMB-Ausgabe, kein
// automatisches Überschreiben — siehe Skript-Kommentar dort).
// ─────────────────────────────────────────────────────────────────────────
export const BUSINESS = {
  // WICHTIG: Ein Stripe Payment Link ist fest an EINEN Preis gebunden — er lässt
  // sich nicht per URL-Parameter umschalten. Für die zwei Preisstufen braucht es
  // zwei separate Payment Links im Stripe-Dashboard (Produkte → Payment Link
  // erstellen), jeweils mit "Gutscheincodes zulassen" aktiviert (siehe Task
  // "Gutschein-Code-Funktion").
  // 11.08.2026 — Neue Live-Payment-Links zu den aktuellen Beträgen (9,99 €/
  // 12,99 €) angelegt und hier eingetragen. Auslöser: Stefan hatte versehentlich
  // den test-kauf-Branch-Stand (STRIPE_LINK_VOLL zeigte auf einen Stripe-
  // TESTMODUS-Link) auf main hochgeladen — echte Kunden wären beim Kauf von
  // "Auswertung + Brief" auf einer Test-Checkout-Seite gelandet, keine echte
  // Zahlung. Beide Links unten sind jetzt live geprüft (keine "test_"-URL).
  // Zugehöriger Live-Webhook-Endpunkt in Stripe: https://nebenkostenradar.com/api/webhook
  // (checkout.session.completed) — Signing Secret muss mit STRIPE_WEBHOOK_SECRET
  // in Vercel übereinstimmen, sonst schlägt die Rabatt-Mail-Protokollierung fehl.
  STRIPE_LINK_AUSWERTUNG: "https://buy.stripe.com/aFadR99SP26h3os0MzgUM03",
  STRIPE_LINK_VOLL: "https://buy.stripe.com/9B63cv0ifbGR8IMfHtgUM04",
  // Zwei Preisstufen (siehe Projekt-Entscheidung 08/2026):
  //   Stufe 1: nur Auswertung als 1-seitiges PDF
  //   Stufe 2: Auswertung + Musterbrief als 2-seitiges PDF
  PREIS_AUSWERTUNG: 9.99,
  PREIS_VOLL: 12.99,
  RICHTWERTE_JAHR: "2024 (veröffentlicht 12/2025)",
  RICHTWERTE_QUELLE:
    "https://mieterbund.de/service/checks-formulare/betriebskosten/betriebskostenspiegel/",
  // Alle Werte in €/m²/Monat, mit dem offiziellen DMB-Betriebskostenspiegel
  // abgeglichen (Stand 08/2026). Sub-Splits (Versicherung) sind interne
  // Schätzverhältnisse, da DMB hierzu keine Aufschlüsselung veröffentlicht —
  // Summe bewusst auf 100% gesetzt.
  RICHTWERTE: {
    gesamt: 2.67,
    heizung_warmwasser: 1.32,
    heizung_max: 2.18,
    wasser_abwasser: 0.29,
    grundsteuer: 0.18,
    muell: 0.16,
    hausmeister: 0.21, // DMB-Wert "separat abgerechnet" — passt zu unseren getrennten Feldern für Hausreinigung/Garten
    versicherungen: 0.31,
    allgemeinstrom: 0.06,
    gebaeudereinigung: 0.21,
    gartenpflege: 0.15,
    strassenreinigung: 0.04,
    aufzug: 0.20,
    schornstein: 0.04,
    sonstiges: 0.07,
  },
  // Fester Rabattcode für die automatische Mail 10 Monate nach Kauf (an
  // Kunden mit Opt-in, siehe Adressen.jsx + scripts/marketing-rabatt-versand.mjs).
  // WICHTIG: Dieser Code muss VORHER manuell im Stripe-Dashboard angelegt werden
  // (Produkte → Gutscheincodes → neuer Code), und zwar für BEIDE Payment Links
  // gültig. Der Wert hier muss exakt mit dem Stripe-Code übereinstimmen.
  //
  // Geplante Preisanpassung 2028 (Notiz aus Projekt-Chat 08/2026): Der Code
  // soll Bestandskunden dann wieder auf den heutigen Preis (9,99/12,99 €)
  // bringen. Ein PROZENTUALER Rabatt in Stripe trifft das nur zufällig genau —
  // treffsicherer ist dafür ein FESTER Euro-Betrag in Stripe (z. B. "2,00 €
  // Rabatt" statt "10% Rabatt"), exakt in Höhe der geplanten Preiserhöhung.
  // Bei einer Preisänderung: neuen Stripe-Rabattbetrag passend zur Differenz
  // zwischen altem und neuem Preis einstellen.
  MARKETING_RABATT_CODE: "DANKE10",
};
// IS_DEMO: true, solange mindestens ein Stripe-Link nicht konfiguriert ist (Platzhaltererkennung)
export const IS_DEMO = BUSINESS.STRIPE_LINK_AUSWERTUNG.includes("HIER") || BUSINESS.STRIPE_LINK_VOLL.includes("HIER");
