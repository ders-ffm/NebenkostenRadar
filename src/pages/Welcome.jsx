// ─────────────────────────────────────────────────────────────────────────
// Welcome.jsx — Startseite. URL: "/"
//
// NEUAUFBAU 10.09.2026 auf Stefans Rückmeldung: „Die Hauptseite ist viel zu
// voll gepackt und unübersichtlich, da verliert der User die Lust und die
// Übersicht. Außerdem steht nirgends, dass es sich um die
// Nebenkostenabrechnung für Mieter handelt."
//
// WAS SICH GEÄNDERT HAT:
// Vorher standen acht Blöcke mit zusammen rund 7.900 Zeichen auf der Seite.
// Jetzt sind es fünf, und jeder beantwortet genau eine Frage:
//   1. Hero        — Für wen ist das, und was bekomme ich?
//   2. Drei Schritte — Wie läuft das ab?
//   3. Beispiel    — Wie sieht das Ergebnis aus?
//   4. Preise      — Was kostet es?
//   5. Weiterlesen — Wo erfahre ich mehr?
//
// Die ausführlichen Blöcke wurden NICHT gelöscht, sondern dorthin verschoben,
// wo sie hingehören:
//   „Was genau geprüft wird"      → /ueber-uns
//   „Worauf die Prüfung beruht"   → /ueber-uns
//   „Was die Alternativen kosten" → /faq
//   „Zahlung unter Vorbehalt"     → /faq (eigene Frage)
// Das entlastet die Startseite und stärkt zugleich die Unterseiten, die
// dadurch eigenständigen Inhalt bekommen.
//
// ZIELGRUPPE: Das Wort „Mieter" steht jetzt im Badge, in der Überschrift und
// im ersten Satz. Wichtig auch juristisch: Das Angebot bezieht sich auf
// WOHNRAUMmiete. Für Gewerbemietverträge und für Eigentümer gelten andere
// Regeln — deshalb steht das ausdrücklich dabei und nicht nur implizit.
// ─────────────────────────────────────────────────────────────────────────
import { THEME } from "../config/theme.js";
import { euro } from "../lib/format.js";
import { BUSINESS } from "../config/business.js";
import { BEISPIEL_QM, BEISPIEL_POSTEN, BEISPIEL_ANZAHL, BEISPIEL_UNZULAESSIG_SUMME } from "../config/beispiel.js";
import Nav from "../components/layout/Nav.jsx";
import LegalFooter from "../components/layout/LegalFooter.jsx";

export default function Welcome({ navigateTo, IS_DEMO }) {
  const C = THEME.color;
  const PAGE_MAX = THEME.layout.pageMax;
  const abschnitt = { padding: "40px 24px", borderBottom: "1px solid " + C.border, maxWidth: PAGE_MAX, margin: "0 auto", boxSizing: "border-box" };
  const ueberschrift = { fontSize: 12, fontWeight: 700, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16, textAlign: "center" };

  // Auf der Startseite werden nur die beanstandeten Positionen gezeigt.
  // Die unauffälligen stehen als Zahl darunter — das kürzt den Block von
  // fünf auf drei Zeilen, ohne das Ergebnis zu beschönigen.
  const beanstandet = BEISPIEL_POSTEN.filter(p => p.status !== "ok");

  return (
    <div style={{ fontFamily: THEME.font.body, background: C.bg, color: C.text, minHeight: "100vh" }}>
      <Nav activeStep="welcome" navigateTo={navigateTo} />

      {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
      <div style={{ ...abschnitt, padding: "48px 24px 40px", textAlign: "center" }}>
        <div style={{ display: "inline-block", background: C.brandBg, borderRadius: 4, padding: "4px 12px", fontSize: 11, color: C.brand, fontWeight: 700, marginBottom: 20, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Für Mieter · Unabhängig · Ohne Registrierung
        </div>

        {/* ÜBERSCHRIFT, Stand 11.09.2026.
            Die beiden Schlagwörter "Nebenkostenabrechnung" und "Mieter"
            MÜSSEN hier stehen bleiben. Das sind die Begriffe, nach denen
            gesucht wird, und die H1 ist für Google das wichtigste Signal
            einer Seite. Eine Zwischenfassung an diesem Tag hatte
            "Nebenkostenabrechnung" durch "Deine Nebenkosten" ersetzt, um
            einen Umbruch zu vermeiden. Das war der falsche Weg: Es hätte das
            Ranking-Problem verschlimmert, das die Search Console für genau
            diese Begriffe zeigt (Position 38,6).

            DAS EIGENTLICHE PROBLEM war die feste Schriftgröße von 30 px.
            Gemessen in der echten Schrift (Poppins 600) ist das Wort
            "Nebenkostenabrechnung" bei 30 px 391 Pixel breit. Auf einem
            360-Pixel-Display bleiben nach den 48 px Seitenpolster nur
            312 Pixel übrig. Das Wort passte also nicht und wurde mitten
            im Wort getrennt.

            LÖSUNG: Die Schriftgröße skaliert mit der Bildschirmbreite.
            clamp(20px, 6.4vw, 30px) heißt: nie kleiner als 20 px, nie
            größer als 30 px, dazwischen 6,4 Prozent der Fensterbreite.
            Nachgerechnet für die üblichen Gerätebreiten:

              Breite   verfügbar   Schrift   Wortbreite   passt
              320 px   272 px      20,5 px   267 px       ja
              360 px   312 px      23,0 px   300 px       ja
              390 px   342 px      25,0 px   326 px       ja
              430 px   382 px      27,5 px   358 px       ja
              ab 469   421+ px     30,0 px   391 px       ja

            AUFBAU, von Stefan am 11.09.2026 so ausgewählt: eine kleine
            Vorzeile "Für Mieter", darunter zwei kräftige Zeilen. Der Vorteil
            dieser Form gegenüber einer durchlaufenden Überschrift ist, dass
            keine Kommas nötig sind, um die Teile zu trennen. Frühere
            Fassungen lasen sich wie eine Aufzählung von Bruchstücken
            ("Nebenkostenabrechnung prüfen, für Mieter, in wenigen Minuten").

            Die Vorzeile steht bewusst INNERHALB des h1-Elements. Dadurch
            zählt "Mieter" für Google zur Überschrift, obwohl es optisch
            kleiner gesetzt ist. Stünde sie als eigenes Element darüber,
            ginge dieses Signal verloren.

            "in 3 Schritten" ist keine Werbefloskel, sondern deckt sich mit
            dem Block "So läuft es ab" direkt darunter, der genau drei
            Schritte zeigt. Wer die Anzahl dort ändert, muss diese Zeile
            mitändern, sonst widerspricht sich die Seite selbst.

            GEMESSENE BREITEN (Poppins 600, im Browser nachgemessen):
            "Nebenkostenabrechnung" ist die längste Zeile, 391 px bei 30 px
            Schrift und 300 px bei 23 px. Beide Zeilen passen damit von
            320 px Displaybreite aufwärts ohne jeden Umbruch.

            WER HIER ETWAS ÄNDERT: Faustregel für Poppins 600, Breite in
            Pixeln ist ungefähr Zeichenzahl mal Schriftgröße mal 0,62.
            Bleibt die längste Zeile bei 20 px unter 272 Pixeln, passt sie
            auf jedem gängigen Gerät. */}
        <h1 style={{ fontFamily: THEME.font.heading, fontWeight: 600, lineHeight: 1.3, margin: "0 0 16px", color: C.text, maxWidth: 540, marginLeft: "auto", marginRight: "auto" }}>
          <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: C.brand, marginBottom: 8 }}>
            Für Mieter
          </div>
          <div style={{ fontSize: "clamp(20px, 6.4vw, 30px)" }}>Nebenkostenabrechnung</div>
          <div style={{ fontSize: "clamp(20px, 6.4vw, 30px)", color: C.brand }}>in 3 Schritten prüfen</div>
        </h1>

        <p style={{ fontSize: 16, color: C.textMuted, margin: "0 0 8px", lineHeight: 1.7, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
          Du hast als Mieter deine Nebenkostenabrechnung bekommen und weißt nicht, ob sie stimmt? Wir vergleichen jeden Posten der Betriebskostenabrechnung mit den Richtwerten des Deutschen Mieterbundes und prüfen, was dein Vermieter überhaupt umlegen darf.
        </p>
        <p style={{ fontSize: 12, color: C.textDim, margin: "0 0 28px", lineHeight: 1.6, maxWidth: 520, marginLeft: "auto", marginRight: "auto" }}>
          Für Wohnraummiete in Deutschland. Für Gewerbemietverträge und für Eigentümer gelten andere Regeln.
        </p>

        {IS_DEMO && <div style={{ background: C.warnBg, borderRadius: 6, padding: "8px 14px", marginBottom: 16, fontSize: 11, color: C.warn }}>Demo-Modus. Stripe nicht konfiguriert</div>}

        <button onClick={() => navigateTo("wohnung")}
          style={{ width: "100%", maxWidth: 420, background: C.accent, color: C.accentText, border: "none", borderRadius: THEME.radius.lg, padding: "18px 40px", fontSize: 16, fontFamily: THEME.font.heading, fontWeight: 600, cursor: "pointer" }}>
          Jetzt kostenlos prüfen
        </button>
        <p style={{ fontSize: 12, color: C.textDim, marginTop: 10 }}>
          Basisanalyse kostenlos · Auswertung als PDF ab {euro(BUSINESS.PREIS_AUSWERTUNG)} · kein Abo
        </p>
        <p style={{ fontSize: 12, color: C.textMuted, margin: "12px 0 0" }}>
          Schon dabei?{" "}
          <a href="/login" onClick={e => { e.preventDefault(); navigateTo("login"); }} style={{ color: C.brand, fontWeight: 600 }}>Anmelden</a>
        </p>
      </div>

      {/* ── 2. Drei Schritte ────────────────────────────────────────────── */}
      <div style={abschnitt}>
        <div style={ueberschrift}>So läuft es ab</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, maxWidth: 640, margin: "0 auto" }}>
          {[
            ["1", "Abrechnung hochladen", "Foto oder PDF. Die Posten werden automatisch ausgelesen, du bestätigst sie nur kurz."],
            ["2", "Kostenlose Basisanalyse", "Jeder Posten wird gegen Richtwerte und Rechtsgrundlagen geprüft. Ohne Konto, ohne Zahlung."],
            ["3", "Auswertung als PDF", "Alle Positionen mit Begründung, auf Wunsch mit versandfertigem Brief an den Vermieter."],
          ].map(([nr, titel, text]) => (
            <div key={nr} style={{ padding: "16px 18px", background: C.surface, border: "1px solid " + C.border, borderRadius: THEME.radius.md }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: C.brand, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, fontFamily: THEME.font.heading, marginBottom: 10 }}>{nr}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4, fontFamily: THEME.font.heading }}>{titel}</div>
              <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>{text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. Beispielergebnis ─────────────────────────────────────────── */}
      <div style={abschnitt}>
        <div style={ueberschrift}>So sieht dein Ergebnis aus</div>
        <p style={{ fontSize: 13, color: C.textMuted, margin: "0 auto 18px", lineHeight: 1.65, maxWidth: 480, textAlign: "center" }}>
          Ein erfundener Beispielfall: {BEISPIEL_QM} m², Abrechnungsjahr 2024.
        </p>

        <div style={{ maxWidth: 560, margin: "0 auto", border: "1px solid " + C.border, borderRadius: THEME.radius.lg, overflow: "hidden" }}>
          <div style={{ background: C.text, padding: "12px 16px" }}>
            <div style={{ fontFamily: THEME.font.heading, fontSize: 14, fontWeight: 600, color: "#fff" }}>
              {BEISPIEL_ANZAHL.unzulaessig} nicht umlagefähig · {BEISPIEL_ANZAHL.auffaellig} auffällig · {BEISPIEL_ANZAHL.ok} unauffällig
            </div>
          </div>

          {beanstandet.map(p => {
            const farbe = p.status === "unzulaessig" ? C.warn : C.textDim;
            const etikett = p.status === "unzulaessig" ? "nicht umlagefähig" : "auffällig";
            return (
              <div key={p.name} style={{ padding: "12px 16px", borderTop: "1px solid " + C.border, background: C.surface, textAlign: "left" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: THEME.font.heading }}>{p.name}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, whiteSpace: "nowrap" }}>{euro(p.betrag)}</div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: farbe, border: "1px solid " + farbe, borderRadius: 3, padding: "1px 6px" }}>{etikett}</span>
                  {p.vergleich != null && (
                    <span style={{ fontSize: 11, color: C.textDim }}>Richtwert {euro(p.vergleich)} · {p.abweichung > 0 ? "+" : ""}{p.abweichung} %</span>
                  )}
                  <span style={{ fontSize: 11, color: C.textDim }}>{p.grundlage}</span>
                </div>
              </div>
            );
          })}

          <div style={{ padding: "12px 16px", borderTop: "1px solid " + C.border, background: C.brandBg, textAlign: "left" }}>
            <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>
              <strong>{euro(BEISPIEL_UNZULAESSIG_SUMME)} zu Unrecht abgerechnet.</strong> Dazu {BEISPIEL_ANZAHL.ok} Positionen ohne Beanstandung. Im Paket mit Brief bekommst du das Schreiben an den Vermieter fertig formuliert dazu.
            </div>
          </div>
        </div>

        <p style={{ fontSize: 11, color: C.textDim, lineHeight: 1.6, margin: "12px auto 0", maxWidth: 560, textAlign: "left" }}>
          Erfundener Beispielfall, keine echten Kundendaten. Dein Ergebnis hängt von deinen eigenen Zahlen ab und kann auch lauten: alles in Ordnung.
        </p>
      </div>

      {/* ── 4. Preise ───────────────────────────────────────────────────── */}
      <div style={{ ...abschnitt, textAlign: "center" }}>
        <div style={ueberschrift}>Was es kostet</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, maxWidth: 560, margin: "0 auto" }}>
          <div style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: THEME.radius.lg, padding: "20px 18px", textAlign: "left" }}>
            <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 4 }}>Auswertung</div>
            <div style={{ fontFamily: THEME.font.heading, fontSize: 22, fontWeight: 600, color: C.text, marginBottom: 10 }}>{euro(BUSINESS.PREIS_AUSWERTUNG)}</div>
            <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>Alle Positionen mit Richtwerten und Begründungen als PDF</div>
          </div>
          <div style={{ background: C.text, borderRadius: THEME.radius.lg, padding: "20px 18px", textAlign: "left" }}>
            <div style={{ fontSize: 12, color: "#D8D2C4", marginBottom: 4 }}>Auswertung + Brief + Steuer-Bonus</div>
            <div style={{ fontFamily: THEME.font.heading, fontSize: 22, fontWeight: 600, color: "#fff", marginBottom: 10 }}>{euro(BUSINESS.PREIS_VOLL)}</div>
            <div style={{ fontSize: 12, color: "#D8D2C4", lineHeight: 1.6 }}>Zusätzlich der versandfertige Brief an deinen Vermieter und ein Hinweis auf steuerlich absetzbare Positionen (§ 35a EStG)</div>
          </div>
        </div>
        <button onClick={() => navigateTo("wohnung")}
          style={{ marginTop: 20, background: C.accent, border: "none", borderRadius: THEME.radius.md, padding: "14px 32px", fontSize: 14, fontFamily: THEME.font.heading, fontWeight: 600, color: C.accentText, cursor: "pointer" }}>
          Kostenlos starten. Preis später wählen
        </button>
        <p style={{ fontSize: 12, color: C.textDim, marginTop: 10 }}>
          Einmalig, kein Abo. <a href="/faq" onClick={e => { e.preventDefault(); navigateTo("faq"); }} style={{ color: C.brand, fontWeight: 600 }}>Was kosten die Alternativen?</a>
        </p>
      </div>

      {/* ── 5. Weiterlesen ──────────────────────────────────────────────── */}
      <div style={abschnitt}>
        <div style={ueberschrift}>Mehr erfahren</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, maxWidth: 640, margin: "0 auto" }}>
          {[
            ["Häufige Fragen", "Unabhängigkeit, Genauigkeit, Fristen, Datenschutz, auch die unbequemen Fragen.", "faq"],
            ["Worauf die Prüfung beruht", "DMB-Betriebskostenspiegel, § 2 BetrKV, HeizkostenV, CO₂KostAufG, alle Quellen benannt.", "ueberuns"],
            ["Ratgeber", "Umlageschlüssel, Belegeinsicht, Fristen und mehr, verständlich erklärt.", "ratgeber"],
          ].map(([titel, text, ziel]) => (
            <a key={ziel} href={"/" + (ziel === "ueberuns" ? "ueber-uns" : ziel)}
              onClick={e => { e.preventDefault(); navigateTo(ziel); }}
              style={{ display: "block", padding: "16px 18px", background: C.surface, border: "1px solid " + C.border, borderRadius: THEME.radius.md, textDecoration: "none" }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.brand, marginBottom: 4, fontFamily: THEME.font.heading }}>{titel} →</div>
              <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>{text}</div>
            </a>
          ))}
        </div>

        <p style={{ fontSize: 12, color: C.textDim, lineHeight: 1.7, margin: "20px auto 0", maxWidth: 560, textAlign: "center" }}>
          Grundlage der Prüfung ist der Betriebskostenspiegel des Deutschen Mieterbundes ({BUSINESS.RICHTWERTE_JAHR}). Er ist ein bundesweiter Durchschnitt: Eine Abweichung nach oben ist ein Anlass zur Nachfrage: kein Nachweis eines Fehlers. Genau so weisen wir es auch aus.
        </p>
      </div>

      <LegalFooter navigateTo={navigateTo} />
    </div>
  );
}
