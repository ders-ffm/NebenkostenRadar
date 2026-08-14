// ─────────────────────────────────────────────────────────────────────────
// Welcome.jsx — Startseite. URL: "/"
// ─────────────────────────────────────────────────────────────────────────
import { THEME } from "../config/theme.js";
import { BUSINESS } from "../config/business.js";
import Nav from "../components/layout/Nav.jsx";
import LegalFooter from "../components/layout/LegalFooter.jsx";

export default function Welcome({ navigateTo, IS_DEMO }) {
  const C = THEME.color;
  const root = { fontFamily: THEME.font.body, background: C.bg, color: C.text, minHeight: "100vh" };
  const PAGE_MAX = THEME.layout.pageMax;

  return (
    <div style={root}>
      <Nav activeStep="welcome" navigateTo={navigateTo} />

      <div style={{ padding: "56px 24px 48px", borderBottom: "1px solid " + C.border, textAlign: "center", maxWidth: PAGE_MAX, margin: "0 auto", boxSizing: "border-box" }}>
        <div style={{ display: "inline-block", background: C.brandBg, borderRadius: 4, padding: "4px 12px", fontSize: 11, color: C.brand, fontWeight: 700, marginBottom: 20, textTransform: "uppercase" }}>
          Unabhängige Prüfung · Keine versteckten Kosten
        </div>
        <h1 style={{ fontFamily: THEME.font.heading, fontSize: 30, fontWeight: 600, lineHeight: 1.35, margin: "0 0 14px", color: C.text, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
          {/* Zwei eigenständige Blöcke statt Text+<br/>+Text: jeder Block
              bricht bei Bedarf unabhängig um, statt dass ein harter
              Zeilenumbruch die erste Zeile auf schmalen Screens zu breit
              werden lässt (08/2026, Layout-Audit). */}
          <div>Deine Abrechnung</div>
          <div style={{ color: C.brand }}>Geprüft. Transparent. Rechtssicher.</div>
        </h1>
        <p style={{ fontSize: 16, color: C.textMuted, margin: "0 0 32px", lineHeight: 1.7, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
          {/* 14.08.2026, Stefans Vorgabe (siehe planung/steuerbonus-35a-rollout.md):
              muss klar trennen zwischen "wir prüfen deine Abrechnung" und dem
              zusätzlichen Steuervorteil — nicht nur eine von mehreren
              Feature-Bullets weiter unten, sondern schon im ersten Satz. */}
          Prüfe deine Nebenkosten in wenigen Schritten — und finde zusätzlich heraus, was du davon von der Steuer absetzen kannst. Vollautomatisch, nachvollziehbar, ohne juristische Vorkenntnisse.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 36 }}>
          {[
            ["Vollständige Prüfung aller Posten", "Jede Position wird mit dem DMB-Betriebskostenspiegel verglichen und auf rechtliche Zulässigkeit nach § 2 BetrKV geprüft."],
            ["Erkennung nicht umlagefähiger Kosten", "Wir erkennen Posten, die dein Vermieter nicht abrechnen darf — z. B. Verwaltungskosten oder seit Juli 2024 den Kabelanschluss."],
            ["Heizkostenverordnung & CO₂-Abgabe", "Prüfung der 50/70-Regel nach HeizkostenV sowie der korrekten Aufteilung der CO₂-Abgabe."],
            ["Versandfertiges PDF mit Mustertext", "Bei Auffälligkeiten erstellen wir einen vollständigen Prüfbericht mit Rechtsgrundlagen als PDF — sofort nutzbar."],
            ["Extra: Steuer-Bonus inklusive", "Nicht nur geprüft — im Paket \"Auswertung + Brief\" zeigen wir dir zusätzlich, welche Positionen du von der Steuer absetzen kannst, inklusive fertiger Anfrage-Vorlage an deinen Vermieter."],
          ].map(([title, desc]) => (
            <div key={title} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "14px 16px", background: C.surface, border: "1px solid " + C.border, borderRadius: THEME.radius.md, textAlign: "left" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: C.brand, flexShrink: 0, marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 8, height: 8, background: "#fff", borderRadius: "50%" }} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 3, fontFamily: THEME.font.heading }}>{title}</div>
                <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {IS_DEMO && <div style={{ background: C.warnBg, borderRadius: 6, padding: "8px 14px", marginBottom: 16, fontSize: 11, color: C.warn }}>Demo-Modus — Stripe nicht konfiguriert</div>}

        <button onClick={() => navigateTo("wohnung")}
          style={{ width: "100%", background: C.accent, color: C.accentText, border: "none", borderRadius: THEME.radius.lg, padding: "18px 40px", fontSize: 16, fontFamily: THEME.font.heading, fontWeight: 600, cursor: "pointer" }}>
          Jetzt kostenlos prüfen
        </button>
        <p style={{ textAlign: "center", fontSize: 12, color: C.textDim, marginTop: 10 }}>
          Basisanalyse kostenlos · Auswertung als PDF {BUSINESS.PREIS_AUSWERTUNG.toFixed(2)} € · mit Brief + Steuer-Bonus {BUSINESS.PREIS_VOLL.toFixed(2)} € · Kein Abo
        </p>
        <p style={{ textAlign: "center", fontSize: 12, color: C.textMuted, marginTop: 14 }}>
          Schon dabei?{" "}
          <a href="/login" onClick={e => { e.preventDefault(); navigateTo("login"); }} style={{ color: C.brand, fontWeight: 600 }}>Anmelden</a>
        </p>
      </div>

      {/* Dritte Kachel umformuliert (10.08.2026, siehe CHANGELOG): "Ø 320€
          mögliche Rückforderung" versprach einen Geldbetrag als Kernnutzen —
          das hält nicht, was es verspricht, wenn die meisten Auffälligkeiten
          Richtwert-Abweichungen sind (Anlass zur Nachfrage, kein Beweis).
          Kernversprechen jetzt: Klarheit über die eigene Abrechnung, nicht
          ein garantierter Geldbetrag — passend zu unserem eigenen Anspruch
          an Präzision, und näher an dem, was die Prüfung tatsächlich liefert. */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderBottom: "1px solid " + C.border, maxWidth: PAGE_MAX, margin: "0 auto" }}>
        {[
          ["50 %", "aller Abrechnungen enthalten Fehler", "Quelle: Deutscher Mieterbund"],
          ["§ 2 BetrKV", "Rechtsgrundlage unserer Prüfung", "inkl. HeizkostenV & CO₂KostAufG"],
          ["Klarheit", "ob deine Abrechnung stimmt", "unabhängig von Vermieter & Verwaltung"],
        ].map(([n, l, s]) => (
          <div key={l} style={{ padding: "20px 12px", textAlign: "center", borderRight: "1px solid " + C.border }}>
            <div style={{ fontFamily: THEME.font.heading, fontSize: 20, fontWeight: 600, color: C.brand, marginBottom: 4 }}>{n}</div>
            <div style={{ fontSize: 11, color: C.text, fontWeight: 600, marginBottom: 2 }}>{l}</div>
            <div style={{ fontSize: 10, color: C.textDim }}>{s}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: "36px 24px", borderBottom: "1px solid " + C.border, maxWidth: PAGE_MAX, margin: "0 auto", boxSizing: "border-box", textAlign: "center" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Was du erhältst</div>
        <p style={{ fontSize: 14, color: C.textMuted, margin: "0 0 24px", lineHeight: 1.6 }}>
          Die Basisanalyse ist kostenlos. Für die PDF-Auswertung zahlst du einmalig:
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, maxWidth: 560, margin: "0 auto" }}>
          <div style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: THEME.radius.lg, padding: "20px 18px", textAlign: "left" }}>
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 4 }}>Auswertung</div>
            <div style={{ fontFamily: THEME.font.heading, fontSize: 22, fontWeight: 600, color: C.text, marginBottom: 10 }}>{BUSINESS.PREIS_AUSWERTUNG.toFixed(2)} €</div>
            <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>Vollständiges 1-seitiges PDF mit allen Positionen, Richtwerten und Begründungen</div>
          </div>
          <div style={{ background: C.text, borderRadius: THEME.radius.lg, padding: "20px 18px", textAlign: "left" }}>
            <div style={{ fontSize: 12, color: "#D8D2C4", marginBottom: 4 }}>Auswertung + Brief + Steuer-Bonus</div>
            <div style={{ fontFamily: THEME.font.heading, fontSize: 22, fontWeight: 600, color: "#fff", marginBottom: 10 }}>{BUSINESS.PREIS_VOLL.toFixed(2)} €</div>
            <div style={{ fontSize: 12, color: "#D8D2C4", lineHeight: 1.6 }}>3-seitiges PDF: Auswertung, versandfertiger Musterbrief an deinen Vermieter, plus Hinweis auf steuerlich absetzbare Positionen (§ 35a EStG)</div>
          </div>
        </div>
        <button onClick={() => navigateTo("wohnung")}
          style={{ marginTop: 20, background: C.accent, border: "none", borderRadius: THEME.radius.md, padding: "14px 32px", fontSize: 14, fontFamily: THEME.font.heading, fontWeight: 600, color: C.accentText, cursor: "pointer" }}>
          Kostenlos prüfen — Preisstufe später wählen
        </button>
      </div>

      <LegalFooter navigateTo={navigateTo} />
    </div>
  );
}
