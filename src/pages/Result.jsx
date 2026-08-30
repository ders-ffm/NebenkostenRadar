// ─────────────────────────────────────────────────────────────────────────
// Result.jsx — Ergebnis-Seite + Preisstufen-Auswahl. URL: "/pruefen/ergebnis"
//
// Zeigt eine kostenlose Vorschau (3 Positionen). Bei Kaufwunsch: Nutzer wählt
// Stufe (Preise siehe BUSINESS.PREIS_AUSWERTUNG/PREIS_VOLL), Widerrufs-Checkbox
// (Pflicht nach § 356 Abs. 5 BGB, Zustand liegt in App.jsx, siehe Kommentar
// dort), dann weiter zu Adressen (für beide Stufen, siehe weiterZumKauf()).
// ─────────────────────────────────────────────────────────────────────────
import { useState } from "react";
import { THEME } from "../config/theme.js";
import { BUSINESS } from "../config/business.js";
import { fmt } from "../lib/format.js";
import { BEWERTUNG } from "../lib/analyse.js";
import Btn from "../components/ui/Btn.jsx";
import LegalFooter from "../components/layout/LegalFooter.jsx";

const STATUS_LABEL = { ok: "✓ Unauffällig", hoch: "↑ Erhöht", sehr_hoch: "↑↑ Stark erhöht", nicht_umlagefaehig: "✗ Nicht zulässig", pruefen: "? Prüfen" };

export default function Result({ navigateTo, result, wohnung, werte, gesamtsummeAbrechnung, setStufe, resetAll, widerrufOk, setWiderrufOk }) {
  const C = THEME.color;
  // "Später fortsetzen" 30.08.2026 (siehe projektdokumentation-nkr.md
  // Abschnitt 9, UX-Test-Nachtrag + api/draft.js): Wer nicht sofort
  // kaufen will (z.B. erst mit Partner:in besprechen oder Mieterverein
  // fragen), soll das nicht mit Datenverlust bezahlen. Erzeugt einen Link mit
  // unratbarer ID (crypto.randomUUID()), unter der der aktuelle Stand
  // (Wohnung/Posten/Gesamtsumme) serverseitig 30 Tage abrufbar bleibt. Rein
  // clientseitiges Zwischenspeichern (localStorage) läuft zusätzlich und
  // automatisch, unabhängig davon — siehe App.jsx.
  const [fortsetzenStatus, setFortsetzenStatus] = useState("idle"); // idle | speichert | fertig | fehler
  const [fortsetzenLink, setFortsetzenLink] = useState("");
  const [linkKopiert, setLinkKopiert] = useState(false);

  async function spaeterFortsetzen() {
    setFortsetzenStatus("speichert");
    try {
      const id = crypto.randomUUID();
      const res = await fetch("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, wohnung, werte, gesamtsummeAbrechnung }),
      });
      if (!res.ok) throw new Error();
      setFortsetzenLink(window.location.origin + "/pruefen/wohnung?fortsetzen=" + id);
      setFortsetzenStatus("fertig");
    } catch {
      setFortsetzenStatus("fehler");
    }
  }

  function linkKopieren() {
    navigator.clipboard?.writeText(fortsetzenLink).then(() => {
      setLinkKopiert(true);
      setTimeout(() => setLinkKopiert(false), 2500);
    });
  }
  // Empfehlung jetzt dreistufig statt nur "ok vs. nicht ok" (10.08.2026,
  // siehe CHANGELOG — Stefans Wunsch, den Brief nur zu empfehlen, wenn
  // wirklich ein eindeutiger Verstoß vorliegt):
  //   1. Keine Auffälligkeit ("ok")            → gar kein Kauf empfohlen
  //   2. Nur statistische Auffälligkeiten       → nur Auswertung empfohlen,
  //      (Richtwert-Abweichung, kein Beweis)      der Brief wäre auf einer
  //                                                unsicheren Grundlage
  //   3. Mind. ein "harter" Verstoß              → Auswertung + Brief
  //      (aus den Daten beweisbar)                 empfohlen, Brief ist
  //                                                gerechtfertigt
  const hatHart = result?.ersparnis_hart > 0;
  // Vorauswahl + "Empfohlen"-Badge fest auf "voll" (12,99 €) — nicht mehr
  // abhängig von hart/statistisch (11.08.2026, Stefans klare Vorgabe: "Die
  // Empfehlung muss wieder auf 12,99 sein und zwar immer", löst die
  // gestaffelte Preisstufen-Empfehlung vom 10.08.2026 wieder ab, siehe
  // CHANGELOG für die frühere Begründung).
  const [gewaehlteStufe, setGewaehlteStufe] = useState("voll");

  if (!result) {
    return (
      <div style={{ fontFamily: THEME.font.body, background: C.bg, minHeight: "100vh", padding: 40, textAlign: "center" }}>
        <p style={{ color: C.textMuted }}>Kein Ergebnis vorhanden.</p>
        <button onClick={() => navigateTo("wohnung")} style={{ background: C.accent, color: C.accentText, border: "none", borderRadius: THEME.radius.md, padding: "12px 28px", fontFamily: THEME.font.heading, cursor: "pointer" }}>Neu starten</button>
      </div>
    );
  }

  const bew = BEWERTUNG[result.gesamtbewertung] || BEWERTUNG.auffaellig;
  const statusFarbe = { ok: C.ok, hoch: C.warn, sehr_hoch: C.warn, nicht_umlagefaehig: C.critical, pruefen: C.warn };

  function weiterZumKauf() {
    if (!widerrufOk) return;
    setStufe(gewaehlteStufe);
    if (gewaehlteStufe === "voll") navigateTo("adressen");
    else navigateTo("adressen"); // Adressen-Seite wird für beide Stufen genutzt (Absenderdaten fürs PDF), Brief-Empfängerfelder dort optional
  }

  return (
    <div style={{ fontFamily: THEME.font.body, background: C.bg, color: C.text, minHeight: "100vh" }}>
      <div style={{ background: C.surface, padding: "22px 20px 18px", borderBottom: "1px solid " + C.border }}>
        <div style={{ fontSize: 10, color: C.textDim, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>NebenkostenRadar · Ergebnis {wohnung.jahr}</div>
        <h1 style={{ fontFamily: THEME.font.heading, fontSize: 22, fontWeight: 600, margin: 0 }}>Deine Analyse</h1>
      </div>

      <div style={{ padding: "16px 20px 60px", maxWidth: 640, margin: "0 auto" }}>
        <div style={{ background: bew.bg, borderLeft: "4px solid " + bew.farbe, borderRadius: THEME.radius.lg, padding: "14px 16px", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 22 }}>{bew.icon}</span>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: bew.farbe, fontFamily: THEME.font.heading }}>{bew.label}{result.fehler_anzahl > 0 ? " · " + result.fehler_anzahl + " Fehler" : ""}</div>
              <div style={{ fontSize: 11, color: C.textMuted }}>{bew.sub}</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: C.textMuted, lineHeight: 1.6 }}>{result.zusammenfassung}</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
          {[
            { l: "Dein €/m²/Jahr", v: fmt(result.pro_qm_gesamt) },
            { l: "DMB-Richtwert", v: fmt(result.richtwert_pro_qm_jahr) },
            { l: "Auffälligkeiten", v: result.moegliche_ersparnis > 0 ? fmt(result.moegliche_ersparnis) : "Keine", hi: result.moegliche_ersparnis > 0 },
            { l: "Geprüfte Posten", v: result.posten_bewertung.length },
          ].map(k => (
            <div key={k.l} style={{ background: k.hi ? C.brandBg : C.surface, border: "1px solid " + (k.hi ? C.brand : C.border), borderRadius: THEME.radius.md, padding: "11px 12px" }}>
              <div style={{ fontSize: 9, color: C.textDim, textTransform: "uppercase", marginBottom: 3 }}>{k.l}</div>
              <div style={{ fontFamily: THEME.font.heading, fontSize: 17, fontWeight: 600, color: k.hi ? C.brand : C.text }}>{k.v}</div>
            </div>
          ))}
        </div>

        <div style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: THEME.radius.md, marginBottom: 14, overflow: "hidden" }}>
          <div style={{ padding: "11px 16px", borderBottom: "1px solid " + C.border, fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase" }}>
            Positions-Vorschau (3 von {result.posten_bewertung.length})
          </div>
          {result.posten_bewertung.slice(0, 3).map((p, i, arr) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", padding: "11px 16px", borderBottom: i < arr.length - 1 ? "1px solid " + C.border : "none" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{p.posten}</div>
                <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2, lineHeight: 1.4 }}>{p.hinweis}</div>
              </div>
              <div style={{ textAlign: "right", marginLeft: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{fmt(p.betrag)}</div>
                <div style={{ fontSize: 10, fontWeight: 600, marginTop: 2, color: statusFarbe[p.status] || C.textMuted }}>{STATUS_LABEL[p.status] || p.status}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Bewusst andere Rahmung, wenn nichts gefunden wurde (08/2026, siehe
            CHANGELOG.md): "gesamtbewertung: ok" bedeutet laut buildResult()
            in lib/analyse.js, dass es WIRKLICH keinen einzigen Widerspruchs-
            grund gibt (kein hoch/sehr_hoch/pruefen/nicht_umlagefaehig, ≤ 1
            Widerspruch). Ein Kauf würde in diesem Fall niemandem beim
            Widerspruch helfen, es gäbe schlicht nichts, das ein Musterbrief
            enthalten könnte. Stefans ausdrücklicher Wunsch: nicht verkaufen,
            nur weil es technisch möglich ist, sondern ehrlich sagen, wenn ein
            Kauf keinen Mehrwert hätte — das ist wichtiger als die Conversion. */}
        {result.gesamtbewertung === "ok" && (
          <div style={{ background: C.okBg, border: "1px solid " + C.ok, borderRadius: THEME.radius.lg, padding: "16px 18px", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 18 }}>✅</span>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.ok, fontFamily: THEME.font.heading }}>Kein Widerspruch nötig</div>
            </div>
            <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>
              Wir haben keine Position gefunden, die einen Widerspruch beim Vermieter rechtfertigen würde. Ein kostenpflichtiger Bericht bringt dir hier wahrscheinlich keinen zusätzlichen Nutzen, du bräuchtest ihn nur, wenn du die Prüfung trotzdem schriftlich dokumentieren möchtest.
            </div>
          </div>
        )}

        <div style={{ background: C.surface, border: "2px solid " + C.text, borderRadius: THEME.radius.xl, padding: "20px 18px" }}>
          {/* Kurze, am Kundenwunsch orientierte Formulierung statt "hart"/
              "statistisch"-Fachsprache (10.08.2026, siehe CHANGELOG, Stefans
              Wunsch): Die Entscheidung Bericht vs. Brief hängt letztlich
              daran, was der Kunde als Nächstes tun will — Belege anfordern
              (Brief) oder nicht (Bericht reicht) —, nicht an unserer eigenen
              Beweisstärke-Einordnung. Die liefert nur die Grundlage für die
              Empfehlung, wird dem Kunden aber nicht mehr als Begriff gezeigt. */}
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <h3 style={{ margin: "0 0 6px", fontSize: 16, fontFamily: THEME.font.heading }}>
              {result.gesamtbewertung === "ok" ? "Trotzdem als PDF dokumentieren" : hatHart ? "Auswertung + Brief" : "Auswertung als PDF"}
            </h3>
            <p style={{ margin: 0, fontSize: 12, color: C.textMuted }}>
              {result.gesamtbewertung === "ok"
                ? "Optional — für deine eigenen Unterlagen, nicht für einen Widerspruch nötig"
                : hatHart
                  ? "Wir haben einen eindeutigen Verstoß gefunden. Willst du Belege vom Vermieter anfordern? Dann brauchst du den Brief."
                  : "Willst du Belege vom Vermieter anfordern? Dann hilft dir der Brief. Reicht dir die Auswertung — die genügt."}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            <button onClick={() => setGewaehlteStufe("auswertung")}
              style={{ textAlign: "left", background: gewaehlteStufe === "auswertung" ? C.brandBg : C.bg, border: "2px solid " + (gewaehlteStufe === "auswertung" ? C.brand : C.border), borderRadius: THEME.radius.md, padding: "14px", cursor: "pointer", position: "relative" }}>
              <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>Nur Auswertung</div>
              <div style={{ fontFamily: THEME.font.heading, fontSize: 19, fontWeight: 600, color: C.text }}>{BUSINESS.PREIS_AUSWERTUNG.toFixed(2)} €</div>
              <div style={{ fontSize: 10, color: C.textDim, marginTop: 4 }}>1-seitiges PDF</div>
            </button>
            <button onClick={() => setGewaehlteStufe("voll")}
              style={{ textAlign: "left", background: gewaehlteStufe === "voll" ? C.brandBg : C.bg, border: "2px solid " + (gewaehlteStufe === "voll" ? C.brand : C.border), borderRadius: THEME.radius.md, padding: "14px", cursor: "pointer", position: "relative" }}>
              {/* "Empfohlen"-Badge fest auf dieser Stufe, unabhängig von hart/
                  statistisch (11.08.2026, Stefans Vorgabe, siehe Kommentar oben
                  bei gewaehlteStufe). */}
              <div style={{ position: "absolute", top: -9, right: 10, background: C.accent, color: C.accentText, fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 10 }}>Empfohlen</div>
              <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>Auswertung + Brief</div>
              <div style={{ fontFamily: THEME.font.heading, fontSize: 19, fontWeight: 600, color: C.text }}>{BUSINESS.PREIS_VOLL.toFixed(2)} €</div>
              <div style={{ fontSize: 10, color: C.textDim, marginTop: 4 }}>3-seitiges PDF inkl. Musterbrief und Steuer-Bonus (§ 35a EStG)</div>
              {/* 14.08.2026, siehe planung/steuerbonus-35a-rollout.md: kleiner
                  eigener Badge für den Kaufanreiz, zusätzlich zum Beschreibungstext
                  — Stefan hat das Mockup mit diesem Badge freigegeben. */}
              <div style={{ display: "inline-block", marginTop: 8, background: C.accentBg, color: C.textDim, fontSize: 9, fontWeight: 600, padding: "3px 8px", borderRadius: 8 }}>+ Steuer-Bonus</div>
            </button>
          </div>


          {/* Umformuliert weg von "Mögliche Rückforderung" als Kernversprechen
              (10.08.2026, siehe CHANGELOG, Stefans Frage zur Plausibilität/
              Wiederkauf-Tragfähigkeit): Fast jede Position ist eine Richtwert-
              Abweichung — ein Anlass zur Nachfrage beim Vermieter, kein
              Beweis für einen Fehler. Das Kernversprechen ist jetzt in erster
              Linie Klarheit/Gewissheit über die eigene Abrechnung; ein
              möglicher Rückforderungsbetrag wird weiterhin genannt, aber nach
              Beweisstärke getrennt und nicht mehr als Garantie formuliert —
              ähnlich wie es z.B. NebenkostenPro handhabt (kein "Geld zurück"
              als Versprechen, sondern "Auffälligkeitshinweise"/"Prüfpotenzial"). */}
          {(result.ersparnis_hart > 0 || result.ersparnis_statistisch > 0) && (
            <div style={{ background: C.brandBg, borderLeft: "3px solid " + C.brand, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: C.brand, marginBottom: 14 }}>
              {result.ersparnis_hart > 0 && (
                <div><strong>{fmt(result.ersparnis_hart)}</strong> eindeutig zu viel gezahlt — unabhängig von Belegen nachweisbar.</div>
              )}
              {result.ersparnis_statistisch > 0 && (
                <div style={{ marginTop: result.ersparnis_hart > 0 ? 4 : 0 }}>
                  {result.ersparnis_hart > 0 ? "Zusätzlich " : ""}<strong>{fmt(result.ersparnis_statistisch)}</strong> {result.ersparnis_hart > 0 ? "möglich" : "möglicherweise zu viel gezahlt"} — liegt über dem DMB-Durchschnitt, dein Vermieter muss dazu Nachweise vorlegen. Das ist eine begründete Vermutung, keine Garantie.
                </div>
              )}
              {result.saldo != null && (
                <div style={{ fontWeight: 400, marginTop: 6 }}>
                  {result.saldo > 0
                    ? "Zusätzlich zu deiner Nachzahlung laut Abrechnung (" + fmt(result.saldo) + ") — bei Erfolg würde sich deine Nachzahlung um diesen Betrag verringern."
                    : "Zusätzlich zu deinem Guthaben laut Abrechnung (" + fmt(Math.abs(result.saldo)) + ") — nicht Teil davon, sondern obendrauf."}
                </div>
              )}
            </div>
          )}

          <div style={{ background: C.bg, border: "1px solid " + C.border, borderRadius: THEME.radius.md, padding: "12px 14px", marginBottom: 12 }}>
            <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
              <input type="checkbox" checked={widerrufOk} onChange={e => setWiderrufOk(e.target.checked)}
                style={{ marginTop: 3, flexShrink: 0, width: 16, height: 16, cursor: "pointer", accentColor: C.accent }} />
              <span style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.6 }}>
                Ich stimme zu, dass mit der Ausführung des Vertrags sofort begonnen wird, und ich habe zur Kenntnis genommen, dass ich mit Beginn der Ausführung mein <strong style={{ color: C.text }}>Widerrufsrecht verliere</strong> (§ 356 Abs. 5 BGB i. V. m. § 18 VRRL). Das PDF steht sofort nach Zahlung zur Verfügung.
              </span>
            </label>
          </div>

          <div style={{ fontSize: 11, color: C.textDim, marginBottom: 12, lineHeight: 1.7, textAlign: "center" }}>
            Anbieter: NebenkostenRadar · Inhaber: Stefan Hennig · Frankfurt am Main<br />
            Zahlung über Stripe · Kein Abo · Einmalige Zahlung
          </div>

          <Btn onClick={weiterZumKauf} disabled={!widerrufOk}>
            Weiter · {gewaehlteStufe === "voll" ? BUSINESS.PREIS_VOLL.toFixed(2) : BUSINESS.PREIS_AUSWERTUNG.toFixed(2)} €
          </Btn>
          {!widerrufOk && <div style={{ textAlign: "center", fontSize: 11, color: C.warn, marginTop: 6 }}>⚠ Bitte zuerst die Checkbox oben bestätigen</div>}

          <div style={{ textAlign: "center", marginTop: 8, fontSize: 10, color: C.textDim }}>
            Mit dem Kauf akzeptierst du unsere{" "}
            <button onClick={() => navigateTo("agb")} style={{ background: "none", border: "none", color: C.textDim, textDecoration: "underline", cursor: "pointer", fontSize: 10, padding: 0 }}>AGB</button>{" "}
            und{" "}
            <button onClick={() => navigateTo("datenschutz")} style={{ background: "none", border: "none", color: C.textDim, textDecoration: "underline", cursor: "pointer", fontSize: 10, padding: 0 }}>Datenschutzerklärung</button>
          </div>
        </div>

        <div style={{ marginTop: 14, background: C.surface, border: "1px solid " + C.border, borderRadius: THEME.radius.lg, padding: "14px 16px" }}>
          {fortsetzenStatus !== "fertig" ? (
            <>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4, fontFamily: THEME.font.heading }}>Noch nicht sicher?</div>
              <div style={{ fontSize: 12, color: C.textMuted, marginBottom: 10, lineHeight: 1.6 }}>
                Kein Konto nötig: Ein Link merkt sich deine Eingabe für 30 Tage, du kannst später auf jedem Gerät weitermachen.
              </div>
              <button onClick={spaeterFortsetzen} disabled={fortsetzenStatus === "speichert"}
                style={{ width: "100%", background: "none", border: "1px solid " + C.brand, color: C.brand, borderRadius: THEME.radius.md, padding: "11px", fontSize: 13, fontWeight: 600, fontFamily: THEME.font.heading, cursor: fortsetzenStatus === "speichert" ? "default" : "pointer" }}>
                {fortsetzenStatus === "speichert" ? "Wird gespeichert …" : "Link zum späteren Fortsetzen erstellen"}
              </button>
              {fortsetzenStatus === "fehler" && (
                <div style={{ fontSize: 11, color: C.warn, marginTop: 8 }}>Konnte nicht gespeichert werden. Bitte kurz erneut versuchen — deine Eingabe bleibt in diesem Browser trotzdem automatisch erhalten.</div>
              )}
            </>
          ) : (
            <>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.brand, marginBottom: 6, fontFamily: THEME.font.heading }}>✓ Link erstellt — 30 Tage gültig</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", background: C.bg, border: "1px solid " + C.border, borderRadius: THEME.radius.md, padding: "8px 10px" }}>
                <div style={{ flex: 1, fontSize: 11, color: C.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fortsetzenLink}</div>
                <button onClick={linkKopieren} style={{ flexShrink: 0, background: C.brand, color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                  {linkKopiert ? "Kopiert ✓" : "Kopieren"}
                </button>
              </div>
              <div style={{ fontSize: 11, color: C.textDim, marginTop: 8, lineHeight: 1.6 }}>Am besten gleich an dich selbst schicken (E-Mail/Notiz-App), z. B. um auf dem Computer weiterzumachen.</div>
            </>
          )}
        </div>

        <button onClick={resetAll} style={{ width: "100%", marginTop: 12, background: "transparent", border: "1px solid " + C.border, color: C.textMuted, borderRadius: THEME.radius.lg, padding: "14px", fontSize: 14, fontFamily: THEME.font.body, cursor: "pointer" }}>
          ← Neue Prüfung starten
        </button>
        <p style={{ textAlign: "center", fontSize: 10, color: C.textDim, marginTop: 12, lineHeight: 1.6 }}>Keine Rechtsberatung. Deutscher Mieterbund: mieterbund.de · Tel. 030 223230</p>
      </div>
      <LegalFooter navigateTo={navigateTo} />
    </div>
  );
}
