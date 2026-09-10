// ─────────────────────────────────────────────────────────────────────────
// UeberUns.jsx — URL: "/ueber-uns"
// ─────────────────────────────────────────────────────────────────────────
import { THEME } from "../config/theme.js";
import { euro } from "../lib/format.js";
import { BUSINESS } from "../config/business.js";
import Nav from "../components/layout/Nav.jsx";
import LegalFooter from "../components/layout/LegalFooter.jsx";
import BrandAnschrift from "../components/layout/BrandAnschrift.jsx";

export default function UeberUns({ navigateTo }) {
  const C = THEME.color;
  const PAGE_MAX = THEME.layout.pageMax;
  const ABSCHNITTE = [
    { titel: "Unser Ansatz", text: "Wir kombinieren systematische Regelprüfung nach BetrKV, HeizkostenV und CO₂KostAufG mit dem aktuellen DMB-Betriebskostenspiegel. Jeder Posten wird automatisch auf Zulässigkeit und Plausibilität geprüft — regelbasiert, nicht durch KI-Rätselraten. Das Ergebnis ist nachvollziehbar, mit konkreten Rechtsgrundlagen belegt." },
    { titel: "Unabhängigkeit", text: "NebenkostenRadar hat keine Verbindungen zu Vermietern, Hausverwaltungen oder Immobiliengesellschaften. Wir arbeiten ausschließlich im Interesse der Mieter. Unsere Prüfergebnisse sind nicht käuflich." },
    { titel: "Aktualität", text: "Gesetzliche Änderungen — wie das Ende des Kabelanschluss-Nebenkostenprivilegs im Juli 2024 — fließen unmittelbar in unsere Prüflogik ein. Richtwerte werden regelmäßig mit dem DMB-Betriebskostenspiegel abgeglichen." },
    { titel: "Transparenz bei den Kosten", text: "Die Basisanalyse ist kostenlos und ohne Registrierung verfügbar. Die vollständige Auswertung als PDF kostet einmalig " + euro(BUSINESS.PREIS_AUSWERTUNG) + ", mit Musterbrief " + euro(BUSINESS.PREIS_VOLL) + " — ohne Abo, ohne versteckte Folgekosten." },
  ];

  return (
    <div style={{ fontFamily: THEME.font.body, background: C.bg, color: C.text, minHeight: "100vh" }}>
      <Nav activeStep="ueberuns" navigateTo={navigateTo} />
      <div style={{ maxWidth: PAGE_MAX, margin: "0 auto", padding: "32px 20px 60px" }}>
        <button onClick={() => navigateTo("welcome")} style={{ background: "none", border: "none", color: C.textMuted, cursor: "pointer", fontSize: 13, padding: "0 0 20px" }}>← Startseite</button>
        <h1 style={{ fontFamily: THEME.font.heading, fontSize: 24, fontWeight: 600, margin: "0 0 16px" }}>Über NebenkostenRadar</h1>
        <p style={{ fontSize: 15, color: C.textMuted, lineHeight: 1.75, margin: "0 0 28px" }}>
          NebenkostenRadar ist ein unabhängiger digitaler Prüfdienst für Nebenkostenabrechnungen. Wir helfen Mietern in Deutschland, ihre Betriebskostenabrechnungen auf Fehler, überhöhte Posten und nicht umlagefähige Kosten zu überprüfen — schnell, transparent und ohne juristische Vorkenntnisse.
        </p>
        {ABSCHNITTE.map((s, i) => (
          <div key={i} style={{ marginBottom: 24, paddingBottom: 24, borderBottom: i < ABSCHNITTE.length - 1 ? "1px solid " + C.border : "none" }}>
            <h2 style={{ fontFamily: THEME.font.heading, fontSize: 17, fontWeight: 600, color: C.text, margin: "0 0 10px" }}>{s.titel}</h2>
            <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.75, margin: 0 }}>{s.text}</p>
          </div>
        ))}
        {/* ─────────────────────────────────────────────────────────────
            Die beiden folgenden Blöcke standen bis zum 10.09.2026 auf der
            Startseite. Sie wurden hierher verschoben, weil die Startseite
            zu voll war (Stefans Rückmeldung) — und weil sie inhaltlich
            hierher gehören: Wer wissen will, was genau geprüft wird und
            worauf sich das stützt, ist auf „Über uns" richtig.
            Gelöscht wurde nichts.
            ───────────────────────────────────────────────────────────── */}
        <div style={{ marginTop: 8, paddingTop: 24, borderTop: "1px solid " + C.border }}>
          <h2 style={{ fontFamily: THEME.font.heading, fontSize: 17, fontWeight: 600, color: C.text, margin: "0 0 12px" }}>Was genau geprüft wird</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              ["Vollständige Prüfung aller Posten", "Jede Position wird mit dem DMB-Betriebskostenspiegel verglichen und auf rechtliche Zulässigkeit nach § 2 BetrKV geprüft."],
              ["Erkennung nicht umlagefähiger Kosten", "Wir erkennen Posten, die dein Vermieter nicht abrechnen darf — z. B. Verwaltungskosten oder seit Juli 2024 den Kabelanschluss."],
              ["Heizkostenverordnung & CO₂-Abgabe", "Prüfung der 50/70-Regel nach HeizkostenV sowie der korrekten Aufteilung der CO₂-Abgabe."],
              ["Fristen", "Ob die Abrechnung rechtzeitig zugestellt wurde und bis wann du Einwendungen erheben kannst (§ 556 Abs. 3 BGB)."],
              ["Versandfertiges PDF mit Mustertext", "Bei Auffälligkeiten entsteht ein vollständiger Prüfbericht mit Rechtsgrundlagen — sofort nutzbar."],
              ["Extra: Steuer-Bonus", "Im Paket „Auswertung + Brief\" zusätzlich, welche Positionen du von der Steuer absetzen kannst, inklusive Anfrage-Vorlage an den Vermieter."],
            ].map(([titel, text]) => (
              <div key={titel} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "12px 14px", background: C.surface, border: "1px solid " + C.border, borderRadius: THEME.radius.md }}>
                <div style={{ width: 16, height: 16, borderRadius: "50%", background: C.brand, flexShrink: 0, marginTop: 3 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 3, fontFamily: THEME.font.heading }}>{titel}</div>
                  <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>{text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 28, paddingTop: 24, borderTop: "1px solid " + C.border }}>
          <h2 style={{ fontFamily: THEME.font.heading, fontSize: 17, fontWeight: 600, color: C.text, margin: "0 0 8px" }}>Worauf die Prüfung beruht</h2>
          <p style={{ fontSize: 14, color: C.textMuted, lineHeight: 1.75, margin: "0 0 16px" }}>
            Wir erfinden keine eigenen Maßstäbe. Jede Bewertung stützt sich auf eine benannte, öffentlich nachprüfbare Quelle.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              ["Deutscher Mieterbund — Betriebskostenspiegel",
               "Abrechnungsjahr " + BUSINESS.RICHTWERTE_JAHR + ". Bundesweite Durchschnittswerte in €/m² und Monat, je Betriebskostenart.",
               BUSINESS.RICHTWERTE_QUELLE],
              ["§ 2 Betriebskostenverordnung (BetrKV)",
               "Der abschließende Katalog der 17 umlagefähigen Betriebskostenarten. Was hier nicht steht, darf grundsätzlich nicht umgelegt werden.",
               "https://www.gesetze-im-internet.de/betrkv/__2.html"],
              ["Heizkostenverordnung (HeizkostenV)",
               "Regelt die Aufteilung zwischen Verbrauch und Wohnfläche (50/70-Regel).",
               "https://www.gesetze-im-internet.de/heizkostenv/"],
              ["CO₂-Kostenaufteilungsgesetz (CO₂KostAufG)",
               "Seit 2023: Das Zehn-Stufen-Modell bestimmt, welchen Anteil der CO₂-Abgabe der Vermieter selbst tragen muss.",
               "https://www.gesetze-im-internet.de/co2kostaufg/"],
              ["§ 35a EStG",
               "Grundlage für den Steuer-Bonus: welche Anteile als haushaltsnahe Dienstleistungen absetzbar sind.",
               "https://www.gesetze-im-internet.de/estg/__35a.html"],
            ].map(([titel, text, url]) => (
              <div key={titel} style={{ padding: "12px 14px", background: C.surface, border: "1px solid " + C.border, borderRadius: THEME.radius.md }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 3, fontFamily: THEME.font.heading }}>{titel}</div>
                <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6, marginBottom: 6 }}>{text}</div>
                <a href={url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: C.brand, fontWeight: 600 }}>Quelle ansehen →</a>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: C.textDim, lineHeight: 1.7, marginTop: 14 }}>
            Der Betriebskostenspiegel ist ein bundesweiter Durchschnitt ohne regionale Aufschlüsselung. Eine Abweichung nach oben ist deshalb ein <strong style={{ color: C.textMuted }}>Anlass zur Nachfrage</strong> — kein Nachweis eines Fehlers. Genau so weisen wir sie in der Auswertung auch aus.
          </p>
        </div>

        <div style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: THEME.radius.md, padding: "18px 20px", marginTop: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 10 }}>Kontakt</div>
          <BrandAnschrift />
          <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 2 }}>
            <div>Inhaber: Stefan Hennig</div>
            <div>Ludwigstr. 33-37, 60327 Frankfurt am Main</div>
            <div>support@nebenkostenradar.com</div>
          </div>
        </div>
      </div>
      <LegalFooter navigateTo={navigateTo} />
    </div>
  );
}
