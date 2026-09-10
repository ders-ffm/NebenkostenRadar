// ─────────────────────────────────────────────────────────────────────────
// Welcome.jsx — Startseite. URL: "/"
// ─────────────────────────────────────────────────────────────────────────
import { THEME } from "../config/theme.js";
import { BUSINESS } from "../config/business.js";
import { BEISPIEL_QM, BEISPIEL_POSTEN, BEISPIEL_ANZAHL, BEISPIEL_UNZULAESSIG_SUMME, BEISPIEL_BRIEF } from "../config/beispiel.js";
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
              werden lässt (08/2026, Layout-Audit).
              "Rechtssicher" (bis 19.08.2026) durch "Verständlich" ersetzt:
              NebenkostenRadar macht keine individuelle anwaltliche Prüfung,
              "rechtssicher" konnte als Zusicherung missverstanden werden,
              die das automatisierte Tool nicht einlösen kann. */}
          <div>Deine Abrechnung</div>
          <div style={{ color: C.brand }}>Geprüft. Transparent. Verständlich.</div>
        </h1>
        <p style={{ fontSize: 16, color: C.textMuted, margin: "0 0 28px", lineHeight: 1.7, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
          {/* 14.08.2026, Stefans Vorgabe (siehe planung/steuerbonus-35a-rollout.md):
              muss klar trennen zwischen "wir prüfen deine Abrechnung" und dem
              zusätzlichen Steuervorteil — nicht nur eine von mehreren
              Feature-Bullets weiter unten, sondern schon im ersten Satz. */}
          Prüfe deine Nebenkosten in wenigen Schritten — und finde zusätzlich heraus, was du davon von der Steuer absetzen kannst. Vollautomatisch, nachvollziehbar, ohne juristische Vorkenntnisse.
        </p>

        {/* CTA 30.08.2026 nach oben gezogen (siehe projektdokumentation-nkr.md
            Abschnitt 9, UX-Research-Nachtrag): vorher stand der Button ERST
            nach 5 Feature-Karten — auf dem Handy damit oft erst nach 2-3
            Scrolls sichtbar. Nielsen-Norman- und CXL-Research zu Landingpages
            (siehe Quellen im Chat vom 30.08.2026) ist hier eindeutig: möglichst
            wenig Text/Inhalt zwischen Hero-Text und erstem Call-to-Action,
            Details dürfen unterhalb folgen — Scrollen ist kein Problem, ein
            verzögerter erster Button schon. Die Feature-Karten bleiben
            vollständig erhalten, nur weiter unten als Beleg/Vertiefung statt
            als Hürde vor dem Start. */}
        {IS_DEMO && <div style={{ background: C.warnBg, borderRadius: 6, padding: "8px 14px", marginBottom: 16, fontSize: 11, color: C.warn }}>Demo-Modus — Stripe nicht konfiguriert</div>}

        <button onClick={() => navigateTo("wohnung")}
          style={{ width: "100%", background: C.accent, color: C.accentText, border: "none", borderRadius: THEME.radius.lg, padding: "18px 40px", fontSize: 16, fontFamily: THEME.font.heading, fontWeight: 600, cursor: "pointer" }}>
          Jetzt kostenlos prüfen
        </button>
        <p style={{ textAlign: "center", fontSize: 12, color: C.textDim, marginTop: 10 }}>
          Basisanalyse kostenlos · Auswertung als PDF {BUSINESS.PREIS_AUSWERTUNG.toFixed(2)} € · mit Brief + Steuer-Bonus {BUSINESS.PREIS_VOLL.toFixed(2)} € · Kein Abo
        </p>
        <p style={{ textAlign: "center", fontSize: 12, color: C.textMuted, margin: "14px 0 36px" }}>
          Schon dabei?{" "}
          <a href="/login" onClick={e => { e.preventDefault(); navigateTo("login"); }} style={{ color: C.brand, fontWeight: 600 }}>Anmelden</a>
        </p>

        <div style={{ fontSize: 11, color: C.textDim, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14, textAlign: "left" }}>
          Was genau geprüft wird
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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

      {/* ───────────────────────────────────────────────────────────────────
          V2: Beispielergebnis VOR jeder Eingabe.
          Bisher sah man nichts, bevor man das ganze Formular ausgefüllt
          hatte — ein Vertrauensvorschuss, den viele nicht aufbringen.
          servicechargeaudit.uk und pruefenlassen.ch zeigen beide einen
          vollständigen Musterfall auf der Startseite.
          Die Zahlen werden in src/config/beispiel.js aus BUSINESS.RICHTWERTE
          BERECHNET, nicht eingetippt — beim nächsten DMB-Update wandert das
          Beispiel automatisch mit. Alles daran ist erfunden und als solches
          gekennzeichnet; bewusst keine Testimonials und kein Zähler, solange
          es keine echten Kunden gibt.
          ─────────────────────────────────────────────────────────────────── */}
      <div style={{ padding: "36px 24px", borderBottom: "1px solid " + C.border, maxWidth: PAGE_MAX, margin: "0 auto", boxSizing: "border-box" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "center" }}>So sieht dein Ergebnis aus</div>
        <p style={{ fontSize: 13, color: C.textMuted, margin: "0 auto 20px", lineHeight: 1.65, maxWidth: 520, textAlign: "center" }}>
          Ein erfundener Beispielfall: {BEISPIEL_QM} m², Abrechnungsjahr 2024. Damit du weißt, was am Ende herauskommt — bevor du irgendetwas eingibst.
        </p>

        <div style={{ maxWidth: 620, margin: "0 auto", border: "1px solid " + C.border, borderRadius: THEME.radius.lg, overflow: "hidden" }}>
          <div style={{ background: C.text, padding: "14px 18px" }}>
            <div style={{ fontSize: 12, color: "#D8D2C4", marginBottom: 3 }}>Prüfergebnis · Beispiel</div>
            <div style={{ fontFamily: THEME.font.heading, fontSize: 15, fontWeight: 600, color: "#fff" }}>
              {BEISPIEL_ANZAHL.unzulaessig} Position{BEISPIEL_ANZAHL.unzulaessig === 1 ? "" : "en"} rechtlich unzulässig · {BEISPIEL_ANZAHL.auffaellig} auffällig · {BEISPIEL_ANZAHL.ok} unauffällig
            </div>
          </div>

          {BEISPIEL_POSTEN.map(p => {
            const farbe = p.status === "unzulaessig" ? C.warn : p.status === "auffaellig" ? C.textDim : C.ok;
            const etikett = p.status === "unzulaessig" ? "nicht umlagefähig" : p.status === "auffaellig" ? "auffällig" : "unauffällig";
            return (
              <div key={p.name} style={{ padding: "14px 18px", borderTop: "1px solid " + C.border, background: C.surface }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: THEME.font.heading }}>{p.name}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, whiteSpace: "nowrap" }}>{p.betrag.toFixed(2).replace(".", ",")} €</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: farbe, border: "1px solid " + farbe, borderRadius: 3, padding: "2px 6px" }}>{etikett}</span>
                  {p.vergleich != null && (
                    <span style={{ fontSize: 11, color: C.textDim }}>
                      Richtwert {p.vergleich.toLocaleString("de-DE")} € · {p.abweichung > 0 ? "+" : ""}{p.abweichung} %
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>{p.begruendung}</div>
                <div style={{ fontSize: 11, color: C.textDim, marginTop: 4 }}>Rechtsgrundlage: {p.grundlage}</div>
              </div>
            );
          })}

          <div style={{ padding: "14px 18px", borderTop: "1px solid " + C.border, background: C.brandBg }}>
            <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>
              <strong>Summe der nicht umlagefähigen Positionen: {BEISPIEL_UNZULAESSIG_SUMME.toFixed(2).replace(".", ",")} €</strong> — dieser Betrag ist im Beispiel zu Unrecht abgerechnet worden. Die auffällige Position kommt möglicherweise dazu, das lässt sich erst nach Belegeinsicht sagen.
            </div>
          </div>

          <div style={{ padding: "16px 18px", borderTop: "1px solid " + C.border, background: C.surface }}>
            <div style={{ fontSize: 11, color: C.textDim, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Ausschnitt aus dem Musterbrief</div>
            <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.7, whiteSpace: "pre-line", fontFamily: THEME.font.body }}>{BEISPIEL_BRIEF}</div>
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 10 }}>Der vollständige Brief ist im Paket „Auswertung + Brief" enthalten.</div>
          </div>
        </div>

        <p style={{ fontSize: 11, color: C.textDim, lineHeight: 1.6, margin: "14px auto 0", maxWidth: 620, textAlign: "left" }}>
          Erfundener Beispielfall zur Veranschaulichung — keine echten Kundendaten. Die Richtwerte stammen aus dem DMB-Betriebskostenspiegel {BUSINESS.RICHTWERTE_JAHR} und sind auf {BEISPIEL_QM} m² und ein volles Jahr hochgerechnet. Dein Ergebnis hängt von deinen eigenen Zahlen ab und kann auch lauten: alles in Ordnung.
        </p>
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

        {/* ─────────────────────────────────────────────────────────────────
            V3: Preiseinordnung statt Preisbehauptung.
            Vorbild pruefenlassen.ch: die eigene Leistung wird nicht als
            "günstig" behauptet, sondern neben die echten Alternativen
            gestellt — inklusive der kostenlosen. Die Spalte "Selbst prüfen"
            ist bewusst ehrlich: sie ist gratis, kostet aber Zeit und lässt
            Unsicherheit zurück.
            ALLE ZAHLEN SIND BELEGT, nichts geschätzt:
            - Mieterverein: Jahresbeiträge 2026 zwischen 60 € (Gelsenkirchen)
              und 132 € (Kiel), teils zzgl. einmaliger Aufnahmegebühr.
              Quellen in planung/europa-potenzial-nkr.md.
            - Anwalt: § 34 Abs. 1 S. 3 RVG deckelt die Erstberatung für
              Verbraucher auf 190 € netto (226,10 € brutto), sofern keine
              Vergütungsvereinbarung getroffen wurde. Ein Widerspruchsschreiben
              wird darüber hinaus nach Streitwert abgerechnet.
            Bei Preisänderungen: die NKR-Spalte zieht aus BUSINESS, die
            anderen drei müssen von Hand geprüft werden.
            ───────────────────────────────────────────────────────────────── */}
        <div style={{ marginTop: 34, textAlign: "left", maxWidth: 620, marginLeft: "auto", marginRight: "auto" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "center" }}>Was die Alternativen kosten</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              {
                titel: "Selbst prüfen",
                preis: "0 €",
                hervor: false,
                punkte: [
                  "Betriebskostenspiegel und BetrKV sind öffentlich zugänglich",
                  "Richtwerte je Position selbst heraussuchen und umrechnen",
                  "Umlageschlüssel, 50/70-Regel und CO₂-Aufteilung selbst nachrechnen",
                  "Widerspruchsschreiben selbst formulieren, mit den richtigen Vorschriften",
                ],
              },
              {
                titel: "NebenkostenRadar",
                preis: BUSINESS.PREIS_AUSWERTUNG.toFixed(2).replace(".", ",") + " – " + BUSINESS.PREIS_VOLL.toFixed(2).replace(".", ",") + " €",
                hervor: true,
                punkte: [
                  "Einmalig, kein Abo, kein Kundenkonto nötig",
                  "Jede Position gegen Richtwert und Rechtsgrundlage geprüft",
                  "Versandfertiger Brief an den Vermieter (im 12,99-€-Paket)",
                  "Ergebnis in wenigen Minuten, keine Terminvereinbarung",
                ],
              },
              {
                titel: "Mieterverein",
                preis: "ca. 60 – 132 € / Jahr",
                hervor: false,
                punkte: [
                  "Beitrag je nach Ortsverein, teils zzgl. einmaliger Aufnahmegebühr",
                  "Persönliche Beratung durch Menschen — inhaltlich das Gründlichste",
                  "Deckt weit mehr ab als die Nebenkostenabrechnung",
                  "Meist Terminvereinbarung nötig; teils Wartezeit für Neumitglieder",
                ],
              },
              {
                titel: "Anwalt",
                preis: "bis 226,10 € nur für die Erstberatung",
                hervor: false,
                punkte: [
                  "Höchstbetrag nach § 34 Abs. 1 S. 3 RVG, wenn keine Vergütungsvereinbarung getroffen wurde",
                  "Ein Widerspruchsschreiben wird darüber hinaus nach Streitwert abgerechnet",
                  "Verbindliche Einschätzung des Einzelfalls — das kann keine Software",
                  "Bei kleineren Beträgen übersteigen die Kosten oft die Ersparnis",
                ],
              },
            ].map(({ titel, preis, hervor, punkte }) => (
              <div key={titel} style={{ padding: "16px 18px", background: hervor ? C.brandBg : C.surface, border: "1px solid " + (hervor ? C.brand : C.border), borderRadius: THEME.radius.md }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text, fontFamily: THEME.font.heading }}>{titel}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: hervor ? C.brand : C.textMuted, whiteSpace: "nowrap" }}>{preis}</div>
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: C.textMuted, lineHeight: 1.7 }}>
                  {punkte.map(punkt => <li key={punkt}>{punkt}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: C.textDim, lineHeight: 1.6, marginTop: 12 }}>
            Beiträge der Mietervereine nach den Beitragsordnungen 2026 einzelner Ortsvereine (Spanne von Gelsenkirchen bis Kiel); die Höhe unterscheidet sich je nach Verein. Anwaltsgebühr nach § 34 Abs. 1 S. 3 RVG, brutto inkl. 19 % Umsatzsteuer. Stand 09/2026.
          </p>
        </div>

        {/* Maßnahme 3 aus planung/internationale-recherche-nkr.md (UK-Vorbild
            "Always Pay First, Fight Second"): Der Hinweis "Zahlung unter
            Vorbehalt" stand bisher NUR in zwei Ratgeberartikeln. Er gehört
            aber dorthin, wo der Nutzer die Entscheidung trifft — direkt unter
            die Preisstufen. Nachgeholt am 10.09.2026, nachdem aufgefallen war,
            dass die Maßnahmen 1-3 im Recherchedokument als "umgesetzt"
            markiert waren, obwohl sie nur im Ratgeber, nicht auf der
            Startseite gelandet sind. */}
        <div style={{ marginTop: 26, background: C.warnBg, border: "1px solid " + C.border, borderRadius: THEME.radius.md, padding: "16px 18px", textAlign: "left", maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 6, fontFamily: THEME.font.heading }}>
            Wichtig: erst zahlen, dann widersprechen
          </div>
          <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.65 }}>
            Eine Nachzahlung wird auch dann fällig, wenn du die Abrechnung für falsch hältst — sonst drohen Verzugszinsen. Überweise deshalb fristgerecht und schreibe in den Verwendungszweck: <strong style={{ color: C.text }}>„Zahlung unter Vorbehalt der Überprüfung"</strong>. Damit bleibst du aus dem Zahlungsverzug und behältst deinen Rückforderungsanspruch. Widerspruch ist danach noch bis zu 12 Monate nach Zugang der Abrechnung möglich (§ 556 Abs. 3 BGB).
          </div>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────────────
          Maßnahme 1: Datenquellen als eigener Vertrauensbaustein.
          Vorbild servicechargeaudit.uk und pruefenlassen.ch: beide nennen
          ihre Quellen mit Umfang und Datum als eigenen Abschnitt, nicht als
          Fußnote. "Deutscher Mieterbund" ist für die Zielgruppe ein starker
          Name — bisher wurde er nur beiläufig in einer Kachel erwähnt.
          Das Jahr kommt aus BUSINESS.RICHTWERTE_JAHR, damit es beim nächsten
          DMB-Update automatisch mitwandert und nicht doppelt gepflegt
          werden muss.
          ─────────────────────────────────────────────────────────────────── */}
      <div style={{ padding: "36px 24px", borderBottom: "1px solid " + C.border, maxWidth: PAGE_MAX, margin: "0 auto", boxSizing: "border-box" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "center" }}>Worauf die Prüfung beruht</div>
        <p style={{ fontSize: 13, color: C.textMuted, margin: "0 auto 22px", lineHeight: 1.65, maxWidth: 520, textAlign: "center" }}>
          Wir erfinden keine eigenen Maßstäbe. Jede Bewertung stützt sich auf eine benannte, öffentlich nachprüfbare Quelle.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 620, margin: "0 auto" }}>
          {[
            [
              "Deutscher Mieterbund — Betriebskostenspiegel",
              "Abrechnungsjahr " + BUSINESS.RICHTWERTE_JAHR + ". Bundesweite Durchschnittswerte in €/m² und Monat, je Betriebskostenart. Grundlage für jeden Richtwertvergleich in deiner Auswertung.",
              BUSINESS.RICHTWERTE_QUELLE,
            ],
            [
              "§ 2 Betriebskostenverordnung (BetrKV)",
              "Der abschließende Katalog der 17 umlagefähigen Betriebskostenarten. Was hier nicht steht, darf dein Vermieter grundsätzlich nicht auf dich umlegen.",
              "https://www.gesetze-im-internet.de/betrkv/__2.html",
            ],
            [
              "Heizkostenverordnung (HeizkostenV)",
              "Regelt die Aufteilung zwischen Verbrauch und Wohnfläche (50/70-Regel). Grundlage der Prüfung deiner Heiz- und Warmwasserkosten.",
              "https://www.gesetze-im-internet.de/heizkostenv/",
            ],
            [
              "CO₂-Kostenaufteilungsgesetz (CO₂KostAufG)",
              "Seit 2023: Das Zehn-Stufen-Modell bestimmt, welchen Anteil der CO₂-Abgabe der Vermieter selbst tragen muss.",
              "https://www.gesetze-im-internet.de/co2kostaufg/",
            ],
            [
              "§ 35a EStG",
              "Grundlage für den Steuer-Bonus: welche Anteile deiner Nebenkosten als haushaltsnahe Dienstleistungen absetzbar sind.",
              "https://www.gesetze-im-internet.de/estg/__35a.html",
            ],
          ].map(([titel, beschreibung, url]) => (
            <div key={titel} style={{ padding: "14px 16px", background: C.surface, border: "1px solid " + C.border, borderRadius: THEME.radius.md, textAlign: "left" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4, fontFamily: THEME.font.heading }}>{titel}</div>
              <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6, marginBottom: 6 }}>{beschreibung}</div>
              <a href={url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: C.brand, fontWeight: 600 }}>Quelle ansehen →</a>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11, color: C.textDim, lineHeight: 1.6, margin: "16px auto 0", maxWidth: 620, textAlign: "left" }}>
          Der Betriebskostenspiegel ist ein bundesweiter Durchschnitt ohne regionale Aufschlüsselung. Eine Abweichung nach oben ist deshalb ein <strong style={{ color: C.textMuted }}>Anlass zur Nachfrage</strong> — kein Nachweis eines Fehlers. Genau so weisen wir sie in der Auswertung auch aus.
        </p>
      </div>

      {/* HINWEIS 10.09.2026 (Stefan): Die FAQ stand hier zunächst als Block.
          Sie ist jetzt eine eigene Seite unter /faq mit eigenem Menüeintrag
          (src/pages/FAQ.jsx). Gründe: eigene URL und eigener <title>, damit
          sie selbst ranken kann; aus dem Menü jederzeit erreichbar, auch
          mitten im Formular; und die Startseite bleibt kurz. Der Inhalt liegt
          unverändert in src/config/faq.js. */}

      <LegalFooter navigateTo={navigateTo} />
    </div>
  );
}
