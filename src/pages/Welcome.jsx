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
//
// ZWEITER UMBAU 17.10.2026 (Stefan: "Startseite übersichtlicher, weniger
// überladen, Infos lieber ins Menü als Unterrubrik"). Nur VORSCHAU auf dem
// Branch startseite-vorschau, Freigabe durch Stefan steht aus.
//   - H1 zweite Zeile jetzt "kostenlos online prüfen" statt "in 3 Schritten
//     prüfen": Das sind die Begriffe, mit denen Mieter suchen ("nebenkosten-
//     abrechnung prüfen kostenlos", "… online prüfen", Marktrecherche vom
//     17.10.2026). Sichtbar im Text, nicht versteckt.
//   - Block "Mehr erfahren" entfällt: FAQ, Über uns, Ratgeber und die neuen
//     Werkzeuge stehen jetzt im Menü (mit Untermenüs) und in der Fußzeile.
//   - Beispielergebnis ist eingeklappt ("So sieht dein Ergebnis aus"), statt
//     die halbe Seite zu füllen. Es bleibt aber auf der Startseite, weil es
//     der stärkste Vertrauensbaustein ist (siehe beispiel.js).
//   - Preisblock beschreibt den Brief der 12,99-€-Stufe konkret. KORREKTUR
//     17.10.2026 (Compliance-Check): Es ist EIN Brief, dessen Inhalt vom
//     Ergebnis abhängt (Widerspruch, Rückfragen oder Belegeinsicht, siehe
//     src/pdf/BriefPDF.jsx), nicht zwei Briefe. "Zwei Schreiben" wäre
//     irreführende Werbung (§ 5 UWG).
// Ergebnis: vier sichtbare Blöcke statt fünf, davon einer eingeklappt.
//
// DRITTER UMBAU 18.10.2026: Redesign "Vorschlag A · klar & digital" (von
// Stefan aus zwei Entwürfen gewählt) und NUR NOCH EIN PAKET (12,99 €, die
// 9,99-€-Variante entfällt, Stefans Entscheidung). Messwerte und Quellen im
// CHANGELOG, Eintrag 18.10.2026. Kurz:
//   - Hero zweispaltig: links Text und Knopf, rechts das Beispielergebnis.
//     Vorher war es eingeklappt und damit für die meisten unsichtbar, obwohl
//     es der stärkste Beleg für das Produkt ist. Die neueren Wettbewerber
//     (z. B. mietchecker.app) zeigen eine Beispielabrechnung direkt oben.
//     Auf dem Handy rutscht das Beispiel unter den Knopf.
//   - Symbole statt Ziffernkreise, Fließtext 17–19 px statt 12–16 px.
//   - Vertrauenszeile mit den Prüfgrundlagen: nur nachprüfbare Fakten,
//     keine erfundenen Bewertungen oder Kundenzahlen (§ 5 UWG).
//   - Preisblock: ein Paket statt zwei.
// ─────────────────────────────────────────────────────────────────────────
import { THEME } from "../config/theme.js";
import { euro } from "../lib/format.js";
import { BUSINESS } from "../config/business.js";
import { BEISPIEL_QM, BEISPIEL_POSTEN, BEISPIEL_ANZAHL, BEISPIEL_UNZULAESSIG_SUMME } from "../config/beispiel.js";
import Nav from "../components/layout/Nav.jsx";
import LegalFooter from "../components/layout/LegalFooter.jsx";
import Verweis from "../components/ui/Verweis.jsx";
import Icon from "../components/ui/Icon.jsx";

// Darstellung je Status im Beispielergebnis. Bewusst Symbol UND Wort: Die
// Farbe allein darf die Bedeutung nicht tragen (WCAG 1.4.1).
function statusStil(C, status) {
  if (status === "unzulaessig") return { icon: "circle-x", farbe: C.critical, bg: C.criticalBg, wort: "nicht umlagefähig" };
  if (status === "auffaellig") return { icon: "triangle-alert", farbe: C.amber, bg: C.amberBg, wort: "auffällig" };
  return { icon: "circle-check", farbe: C.brandStrong, bg: C.brandBg, wort: "unauffällig" };
}

export default function Welcome({ navigateTo, navigateToArtikel, IS_DEMO }) {
  const C = THEME.color;
  const PAGE_MAX = THEME.layout.pageMax;
  const innen = { maxWidth: PAGE_MAX, margin: "0 auto", padding: "0 24px", boxSizing: "border-box" };
  const h2 = { fontFamily: THEME.font.heading, fontWeight: 700, letterSpacing: "-0.02em", fontSize: "clamp(26px, 5vw, 34px)", lineHeight: 1.15, margin: "0 0 12px", textAlign: "center", color: C.text, textWrap: "balance" };
  const h2Unter = { fontSize: 17, color: C.textMuted, lineHeight: 1.6, maxWidth: 560, margin: "0 auto 36px", textAlign: "center" };
  const karte = { background: C.surface, border: "1px solid " + C.border, borderRadius: THEME.radius.xl, boxShadow: THEME.shadow };
  const ctaGross = { display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10, width: "100%", maxWidth: 420, boxSizing: "border-box", background: C.accent, color: C.accentText, borderRadius: THEME.radius.lg, padding: "18px 28px", fontSize: 17, fontFamily: THEME.font.heading, fontWeight: 600, cursor: "pointer", textDecoration: "none" };

  // Im Beispiel: die drei beanstandeten Posten plus der erste unauffällige,
  // damit sichtbar ist, dass auch "alles in Ordnung" ein Ergebnis sein kann.
  const beispielZeilen = [...BEISPIEL_POSTEN.filter(p => p.status !== "ok"), ...BEISPIEL_POSTEN.filter(p => p.status === "ok").slice(0, 1)];

  return (
    <div style={{ fontFamily: THEME.font.body, background: C.bg, color: C.text, minHeight: "100vh" }}>
      <Nav activeStep="welcome" navigateTo={navigateTo} />

      {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
      <div style={{ ...innen, padding: "clamp(36px, 6vw, 64px) 24px clamp(44px, 6vw, 72px)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 440px), 1fr))", gap: "clamp(36px, 5vw, 56px)", alignItems: "center" }}>
        <div style={{ containerType: "inline-size", minWidth: 0 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.brandBg, color: C.brandStrong, borderRadius: 999, padding: "6px 14px", fontSize: 14, fontWeight: 600 }}>
            <Icon name="shield-check" size={16} /> Unabhängig · ohne Registrierung
          </div>

          {/* ÜBERSCHRIFT. Die Schlagwörter "Nebenkostenabrechnung" und
              "Mieter" müssen in der H1 bleiben (Suchbegriffe, siehe
              Kommentar-Historie im CHANGELOG 11.09. und 17.10.2026). Die
              Vorzeile "Für Mieter" steht bewusst INNERHALB der h1.
              prerender.mjs enthält dieselbe H1 als Fließsatz, bei Änderungen
              beide Stellen anpassen.

              UMBRUCH: Gemessen am 18.10.2026 brach "Nebenkostenabrechnung"
              in der alten Fassung auf 360- und 390-px-Displays mitten im Wort
              um ("…abrechnun / g"), weil die Rechnung im alten Kommentar mit
              einem zu kleinen Breitenfaktor arbeitete. Jetzt zwei Sicherungen:
              1. Die Größe hängt an der Breite der Textspalte (Einheit cqi,
                 Container-Query, die Spalte ist der Container): 7,9 % der
                 Spaltenbreite. Gemessen: "Nebenkostenabrechnung" ist in
                 Inter 700 genau 12,25-mal so breit wie die Schriftgröße,
                 bei 7,9 % also 96,8 % der Spalte. Das passt auf jedem Gerät
                 und auch in der zweispaltigen Desktop-Ansicht. Höchstens
                 46 px. Browser ohne cqi (vor 2022/23) nehmen die
                 Standardgröße der h1; dort greift Sicherung 2.
              2. Ein weiches Trennzeichen (&shy;) erlaubt auf noch schmaleren
                 Geräten eine saubere Trennung "Nebenkosten-/abrechnung"
                 statt eines Umbruchs an beliebiger Stelle. Für Google ist
                 das Wort unverändert. */}
          <h1 style={{ fontFamily: THEME.font.heading, fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.08, margin: "18px 0 20px", color: C.text }}>
            <span style={{ display: "block", fontSize: 15, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: C.brandStrong, marginBottom: 12, lineHeight: 1.4 }}>
              Für Mieter
            </span>
            <span style={{ display: "block", fontSize: "clamp(20px, 7.9cqi, 46px)" }}>Nebenkosten{"\u00AD"}abrechnung</span>
            <span style={{ display: "block", fontSize: "clamp(20px, 7.9cqi, 46px)", color: C.brand }}>kostenlos online prüfen</span>
          </h1>

          <p style={{ fontSize: "clamp(17px, 2.2vw, 19px)", color: C.textMuted, margin: "0 0 10px", lineHeight: 1.6, maxWidth: 560 }}>
            Foto oder PDF deiner Nebenkostenabrechnung hochladen. Wir prüfen jeden Posten gegen den Betriebskostenspiegel des Deutschen Mieterbundes und die Betriebskostenverordnung und zeigen dir in wenigen Minuten, was dein Vermieter umlegen darf und was nicht.
          </p>
          <p style={{ fontSize: 14.5, color: C.textDim, margin: "0 0 28px", lineHeight: 1.6, maxWidth: 560 }}>
            Für Wohnraummiete in Deutschland. Für Gewerbemietverträge und für Eigentümer gelten andere Regeln.
          </p>

          {IS_DEMO && <div style={{ background: C.warnBg, borderRadius: 8, padding: "8px 14px", marginBottom: 16, fontSize: 14, color: C.warn }}>Demo-Modus. Stripe nicht konfiguriert</div>}

          <Verweis href="/pruefen/wohnung" onNavigate={() => navigateTo("wohnung")} style={ctaGross}>
            Jetzt kostenlos prüfen <Icon name="arrow-right" size={20} />
          </Verweis>
          <p style={{ fontSize: 15, color: C.textMuted, margin: "12px 0 0", lineHeight: 1.6 }}>
            Basisanalyse kostenlos · Ergebnis in wenigen Minuten · Schon dabei?{" "}
            <a href="/login" onClick={e => { e.preventDefault(); navigateTo("login"); }} style={{ color: C.brandStrong, fontWeight: 600 }}>Anmelden</a>
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 22px", marginTop: 28, paddingTop: 22, borderTop: "1px solid " + C.border, fontSize: 15, color: C.textMuted }}>
            {[["book-open-check", "DMB-Betriebskostenspiegel"], ["scale", "BetrKV, BGB, HeizkostenV"], ["badge-euro", "Einmalpreis, kein Abo"]].map(([ic, t]) => (
              <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><span style={{ color: C.brand, display: "inline-flex" }}><Icon name={ic} size={18} /></span>{t}</span>
            ))}
          </div>
        </div>

        {/* Beispielergebnis. Erfundener Fall (siehe config/beispiel.js),
            deshalb zweifach gekennzeichnet: im Kopf und darunter. */}
        <div>
          <div style={{ ...karte, overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: "1px solid " + C.border }}>
              <div style={{ fontSize: 14.5, color: C.textDim, lineHeight: 1.4 }}>
                <strong style={{ color: C.text, fontSize: 16 }}>Beispiel-Ergebnis</strong> · {BEISPIEL_QM} m², Abrechnung 2024
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.textMuted, background: C.alt, borderRadius: 6, padding: "3px 8px", whiteSpace: "nowrap" }}>erfundener Fall</span>
            </div>
            {beispielZeilen.map(p => {
              const s = statusStil(C, p.status);
              return (
                <div key={p.name} style={{ display: "grid", gridTemplateColumns: "26px 1fr auto", gap: 12, padding: "14px 20px", borderBottom: "1px solid " + C.border, alignItems: "start" }}>
                  <span style={{ color: s.farbe, display: "inline-flex", marginTop: 1 }}><Icon name={s.icon} size={22} /></span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{p.name}</div>
                    <div style={{ fontSize: 14, color: C.textDim, marginTop: 2 }}>
                      {p.vergleich != null ? "Richtwert " + euro(p.vergleich) + " · " + (p.abweichung > 0 ? "+" : "") + p.abweichung + " %" : p.grundlage}
                    </div>
                    <span style={{ display: "inline-block", marginTop: 6, fontSize: 13, fontWeight: 600, borderRadius: 6, padding: "2px 8px", background: s.bg, color: s.farbe }}>{s.wort}</span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 16, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{euro(p.betrag)}</div>
                </div>
              );
            })}
            <div style={{ padding: "16px 20px", background: C.brandBg, fontSize: 15.5, lineHeight: 1.5 }}>
              <strong>{euro(BEISPIEL_UNZULAESSIG_SUMME)} zu Unrecht abgerechnet</strong>, dazu {BEISPIEL_ANZAHL.auffaellig === 1 ? "ein auffälliger Posten" : BEISPIEL_ANZAHL.auffaellig + " auffällige Posten"} zum Nachfragen. Den Brief an den Vermieter bekommst du fertig formuliert dazu.
            </div>
          </div>
          <p style={{ fontSize: 14, color: C.textDim, lineHeight: 1.6, margin: "10px 4px 0" }}>
            Erfundener Beispielfall, keine echten Kundendaten. Dein Ergebnis hängt von deinen eigenen Zahlen ab und kann auch lauten: alles in Ordnung.
          </p>
        </div>
      </div>

      {/* ── 2. So läuft es ab ───────────────────────────────────────────── */}
      <div style={{ background: C.alt, borderTop: "1px solid " + C.border, borderBottom: "1px solid " + C.border }}>
        <div style={{ ...innen, padding: "clamp(48px, 7vw, 72px) 24px" }}>
          <h2 style={h2}>So läuft es ab</h2>
          <p style={h2Unter}>Drei Schritte, ohne Konto. Bezahlt wird nur, wenn du die ausführliche Auswertung möchtest.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 20 }}>
            {[
              ["camera", "Abrechnung hochladen", "Foto oder PDF. Die Posten werden automatisch ausgelesen, du bestätigst sie nur kurz."],
              ["list-checks", "Kostenlose Basisanalyse", "Jeder Posten wird gegen Richtwerte und Rechtsgrundlagen geprüft. Ohne Konto, ohne Zahlung."],
              ["file-text", "Auswertung als PDF", "Alle Positionen mit Begründung und ein versandfertiger Brief an den Vermieter."],
            ].map(([ic, titel, text], i) => (
              <div key={titel} style={{ ...karte, padding: 28 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: C.brandBg, color: C.brandStrong, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}><Icon name={ic} size={24} strokeWidth={1.75} /></div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.textDim, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Schritt {i + 1}</div>
                <h3 style={{ fontSize: 19, fontWeight: 650, letterSpacing: "-0.01em", margin: "0 0 8px", fontFamily: THEME.font.heading }}>{titel}</h3>
                <p style={{ margin: 0, color: C.textMuted, fontSize: 16, lineHeight: 1.6 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3. Was es kostet (ein Paket seit 18.10.2026) ───────────────── */}
      <div style={{ ...innen, padding: "clamp(48px, 7vw, 72px) 24px" }}>
        <h2 style={h2}>Was es kostet</h2>
        <p style={h2Unter}>Die Basisanalyse ist kostenlos. Erst wenn du die ausführliche Auswertung mit Brief möchtest, zahlst du einmalig, ohne Abo.</p>
        <div style={{ ...karte, border: "2px solid " + C.brand, maxWidth: 820, margin: "0 auto", padding: 28, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: "18px 32px", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 600, color: C.textMuted, fontSize: 15.5 }}>Auswertung + Brief + Steuer-Bonus</div>
            <div style={{ fontFamily: THEME.font.heading, fontWeight: 700, fontSize: 42, letterSpacing: "-0.02em", margin: "6px 0 4px", fontVariantNumeric: "tabular-nums" }}>{euro(BUSINESS.PREIS_VOLL)}</div>
            <div style={{ fontSize: 14.5, color: C.textDim }}>Endpreis · einmalig · kein Abo</div>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12, fontSize: 16, color: C.textMuted, lineHeight: 1.5 }}>
            {[
              "Alle Positionen mit Richtwerten und Begründungen als PDF",
              "Fertiger Brief an den Vermieter, passend zum Ergebnis: Widerspruch gegen auffällige Posten oder Aufforderung zur Belegeinsicht (§\u00A0259\u00A0BGB)",
              "Hinweis auf steuerlich absetzbare Posten (§\u00A035a\u00A0EStG)",
            ].map(t => (
              <li key={t} style={{ display: "grid", gridTemplateColumns: "22px 1fr", gap: 10 }}><span style={{ color: C.brand, display: "inline-flex", marginTop: 2 }}><Icon name="circle-check" size={18} /></span><span>{t}</span></li>
            ))}
          </ul>
        </div>
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <Verweis href="/pruefen/wohnung" onNavigate={() => navigateTo("wohnung")} style={ctaGross}>
            Jetzt kostenlos prüfen <Icon name="arrow-right" size={20} />
          </Verweis>
          <p style={{ fontSize: 15, color: C.textMuted, marginTop: 14 }}>
            <a href="/ratgeber/nebenkostenabrechnung-pruefen-lassen" onClick={e => { e.preventDefault(); navigateToArtikel("nebenkostenabrechnung-pruefen-lassen"); }} style={{ color: C.brandStrong, fontWeight: 600 }}>Nebenkostenabrechnung prüfen lassen: was kosten die Alternativen?</a>
          </p>
        </div>
        <p style={{ fontSize: 14, color: C.textDim, lineHeight: 1.7, margin: "28px auto 0", maxWidth: 620, textAlign: "center" }}>
          Grundlage ist der Betriebskostenspiegel des Deutschen Mieterbundes ({BUSINESS.RICHTWERTE_JAHR}), ein bundesweiter Durchschnitt: Eine Abweichung nach oben ist ein Anlass zur Nachfrage, kein Nachweis eines Fehlers.
        </p>
      </div>

      <LegalFooter navigateTo={navigateTo} />
    </div>
  );
}
