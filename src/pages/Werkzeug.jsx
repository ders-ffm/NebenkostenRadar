// ─────────────────────────────────────────────────────────────────────────
// Werkzeug.jsx — Die drei kostenlosen Werkzeug-Seiten (17.10.2026):
//   /nebenkostenabrechnung-pruefen        → Einstieg in die Prüfung
//   /fristenrechner-nebenkostenabrechnung → Fristenrechner (§ 556 Abs. 3 BGB)
//   /heizkosten-kuerzen-3-prozent         → Kürzungs-Check (HeizkostenV, CO2KostAufG)
//
// Inhalte (Texte, FAQ) stehen in src/config/werkzeuge.js, nicht hier — siehe
// Begründung dort. Diese Datei enthält nur Darstellung und die beiden
// Rechner. Beide rechnen ausschließlich im Browser: keine Anfrage an den
// Server, nichts wird gespeichert. Das ist Absicht (Datensparsamkeit,
// Art. 5 Abs. 1 lit. c DSGVO) und steht so auch im Seitentext.
// ─────────────────────────────────────────────────────────────────────────
import { useState } from "react";
import { THEME } from "../config/theme.js";
import { werkzeugFuerStep, WERKZEUGE } from "../config/werkzeuge.js";
import { ARTIKEL } from "../artikel.js";
import Nav from "../components/layout/Nav.jsx";
import LegalFooter from "../components/layout/LegalFooter.jsx";
import Verweis from "../components/ui/Verweis.jsx";

// ── Datumsrechnung ────────────────────────────────────────────────────────
// Bewusst ohne Bibliothek. Alle Daten als lokale Kalenderdaten (12:00 Uhr,
// damit Zeitumstellungen nie einen Tag verschieben).
function ausIso(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  if (!m) return null;
  return new Date(+m[1], +m[2] - 1, +m[3], 12);
}
function letzterTag(jahr, monat) { return new Date(jahr, monat + 1, 0, 12).getDate(); }
function istMonatsende(d) { return d.getDate() === letzterTag(d.getFullYear(), d.getMonth()); }
// Datum + n Monate nach §§ 187, 188 BGB: gleicher Tag im Zielmonat; gibt es
// ihn dort nicht (31. → 30.; 29.02. → 28.02.), der letzte Tag des Monats
// (§ 188 Abs. 3 BGB).
function plusMonate(d, n) {
  const jahr = d.getFullYear() + Math.floor((d.getMonth() + n) / 12);
  const monat = (d.getMonth() + n) % 12;
  return new Date(jahr, monat, Math.min(d.getDate(), letzterTag(jahr, monat)), 12);
}
const fmtDatum = d => d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
function tageBis(d) {
  const heute = new Date(); heute.setHours(12, 0, 0, 0);
  return Math.round((d - heute) / 86400000);
}

// § 556 Abs. 3 Satz 2 BGB: "bis zum Ablauf des zwölften Monats nach Ende
// des Abrechnungszeitraums". Endet der Zeitraum am Monatsende (der
// Normalfall, z. B. 31.12.), endet die Frist am Monatsende zwölf Monate
// später. Bei einem Zeitraumende mitten im Monat rechnen wir den gleichen
// Tag zwölf Monate später; das ist die frühere und damit für die Aussage
// "zu spät" vorsichtigere Lesart (der Hinweis steht im Ergebnis).
export function abrechnungsfrist(ende) {
  if (istMonatsende(ende)) {
    const z = plusMonate(new Date(ende.getFullYear(), ende.getMonth(), 1, 12), 12);
    return new Date(z.getFullYear(), z.getMonth(), letzterTag(z.getFullYear(), z.getMonth()), 12);
  }
  return plusMonate(ende, 12);
}
// § 556 Abs. 3 Satz 5 BGB: "bis zum Ablauf des zwölften Monats nach Zugang".
// Wir nennen bewusst das FRÜHESTE vertretbare Ende (Zugang + 12 Monate).
// Für den Mieter ist das die sichere Seite: Wer bis dahin widerspricht, ist
// nach jeder Lesart rechtzeitig.
export function einwendungsfrist(zugang) {
  return plusMonate(zugang, 12);
}

// ── Gemeinsame Bausteine ──────────────────────────────────────────────────
function Kasten({ children, C }) {
  return <div style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: THEME.radius.lg, padding: "18px 18px", margin: "0 0 28px" }}>{children}</div>;
}

function Ergebniszeile({ C, ton, titel, text }) {
  const farbe = ton === "gut" ? C.brand : ton === "warn" ? C.warn : C.textMuted;
  const hg = ton === "gut" ? C.brandBg : ton === "warn" ? C.warnBg : C.alt;
  return (
    <div style={{ background: hg, borderLeft: "3px solid " + farbe, borderRadius: THEME.radius.sm, padding: "12px 14px", marginBottom: 10 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: C.text, fontFamily: THEME.font.heading, marginBottom: 4 }}>{titel}</div>
      <div style={{ fontSize: 15, color: C.text, lineHeight: 1.65 }}>{text}</div>
    </div>
  );
}

function PruefenKnopf({ C, navigateTo, text = "Ganze Abrechnung kostenlos prüfen →" }) {
  return (
    <Verweis href="/pruefen/wohnung" onNavigate={() => navigateTo("wohnung")}
      style={{ display: "inline-block", background: C.accent, color: C.accentText, borderRadius: THEME.radius.lg, padding: "14px 26px", fontSize: 17, fontFamily: THEME.font.heading, fontWeight: 600, cursor: "pointer" }}>
      {text}
    </Verweis>
  );
}

const feldStil = C => ({ width: "100%", boxSizing: "border-box", padding: "11px 12px", fontSize: 17, border: "1px solid " + C.border, borderRadius: THEME.radius.sm, fontFamily: THEME.font.body, color: C.text, background: "#fff" });
const labelStil = C => ({ display: "block", fontSize: 15, fontWeight: 600, color: C.text, margin: "0 0 6px" });

// ── Widget 1: Einstieg Prüfung ───────────────────────────────────────────
function StartWidget({ C, navigateTo }) {
  return (
    <Kasten C={C}>
      <div style={{ textAlign: "center" }}>
        <PruefenKnopf C={C} navigateTo={navigateTo} text="Abrechnung hochladen und kostenlos prüfen →" />
        <p style={{ fontSize: 14, color: C.textDim, margin: "12px 0 0", lineHeight: 1.6 }}>
          Foto oder PDF · ohne Konto · Basisanalyse kostenlos · für Wohnraummieter in Deutschland
        </p>
      </div>
    </Kasten>
  );
}

// ── Widget 2: Fristenrechner ─────────────────────────────────────────────
function FristenWidget({ C, navigateTo }) {
  const [ende, setEnde] = useState("2025-12-31");
  const [zugang, setZugang] = useState("");
  const e = ausIso(ende), z = ausIso(zugang);
  const frist1 = e ? abrechnungsfrist(e) : null;
  const frist2 = z ? einwendungsfrist(z) : null;

  let ergebnis = [];
  if (frist1) {
    if (!z) {
      const t = tageBis(frist1);
      ergebnis.push({ ton: "neutral", titel: "Abrechnungsfrist: " + fmtDatum(frist1),
        text: t >= 0
          ? "Bis zu diesem Tag muss die Abrechnung bei dir angekommen sein (noch " + t + " Tage). Trag oben ein, wann sie angekommen ist, dann prüfen wir, ob sie rechtzeitig war."
          : "Diese Frist ist abgelaufen. Ist bis heute keine Abrechnung angekommen, kann der Vermieter für diesen Zeitraum in der Regel keine Nachzahlung mehr verlangen. Ein Guthaben steht dir trotzdem zu." });
    } else if (z <= frist1) {
      ergebnis.push({ ton: "neutral", titel: "Rechtzeitig zugestellt",
        text: "Die Abrechnung kam am " + fmtDatum(z) + " und damit vor Ablauf der Abrechnungsfrist am " + fmtDatum(frist1) + ". Eine Nachforderung ist nicht schon wegen der Frist ausgeschlossen. Ob die Abrechnung inhaltlich stimmt, ist eine andere Frage." });
    } else {
      ergebnis.push({ ton: "gut", titel: "Zu spät zugestellt: Nachzahlung in der Regel ausgeschlossen",
        text: "Die Frist endete am " + fmtDatum(frist1) + ", die Abrechnung kam erst am " + fmtDatum(z) + ". Nach § 556 Abs. 3 Satz 3 BGB kann der Vermieter dann keine Nachzahlung mehr verlangen, es sei denn, er hat die Verspätung nicht zu vertreten. Ein Guthaben muss er dir trotzdem auszahlen." });
    }
    if (!istMonatsende(e)) {
      ergebnis.push({ ton: "neutral", titel: "Hinweis zum Zeitraum",
        text: "Dein Abrechnungszeitraum endet nicht am Monatsende. Wir haben die frühere mögliche Lesart der Frist verwendet; im Grenzfall lass das Datum von einem Mieterverein bestätigen." });
    }
  }
  if (frist2) {
    const t = tageBis(frist2);
    ergebnis.push({ ton: t >= 0 ? "warn" : "neutral", titel: "Widerspruch spätestens bis " + fmtDatum(frist2),
      text: t >= 0
        ? "So lange kannst du Einwendungen gegen die Abrechnung erheben (§ 556 Abs. 3 Satz 5 BGB), noch " + t + " Tage. Wir nennen sicherheitshalber das früheste mögliche Fristende. Widersprich schriftlich und so, dass du den Zugang beweisen kannst."
        : "Diese Frist ist abgelaufen. Einwendungen sind in der Regel ausgeschlossen, außer du hattest die Verspätung nicht zu vertreten." });
  }

  return (
    <Kasten C={C}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 18 }}>
        <label>
          <span style={labelStil(C)}>Ende des Abrechnungszeitraums</span>
          <input type="date" value={ende} onChange={ev => setEnde(ev.target.value)} style={feldStil(C)} />
          <span style={{ display: "block", fontSize: 13.5, color: C.textDim, marginTop: 4 }}>Meist der 31.12., steht oben auf der Abrechnung.</span>
        </label>
        <label>
          <span style={labelStil(C)}>Abrechnung angekommen am</span>
          <input type="date" value={zugang} onChange={ev => setZugang(ev.target.value)} style={feldStil(C)} />
          <span style={{ display: "block", fontSize: 13.5, color: C.textDim, marginTop: 4 }}>Tag, an dem sie in deinem Briefkasten lag.</span>
        </label>
      </div>
      <div aria-live="polite">
        {ergebnis.map((r, i) => <Ergebniszeile key={i} C={C} {...r} />)}
      </div>
      <p style={{ fontSize: 13.5, color: C.textDim, lineHeight: 1.6, margin: "12px 0 16px" }}>
        Allgemeine Berechnung nach § 556 Abs. 3 BGB, keine Rechtsberatung im Einzelfall. Abweichende Vereinbarungen zum Nachteil des Mieters sind unwirksam (§ 556 Abs. 4 BGB).
      </p>
      <div style={{ textAlign: "center" }}><PruefenKnopf C={C} navigateTo={navigateTo} text="Jetzt die Abrechnung selbst prüfen →" /></div>
    </Kasten>
  );
}

// ── Widget 3: Heizkosten-Kürzungs-Check ──────────────────────────────────
function Frage({ C, frage, hilfe, wert, setWert, optionen = [["ja", "Ja"], ["nein", "Nein"], ["unklar", "Weiß nicht"]] }) {
  return (
    <fieldset style={{ border: "none", padding: 0, margin: "0 0 16px" }}>
      <legend style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 4, lineHeight: 1.5 }}>{frage}</legend>
      {hilfe && <div style={{ fontSize: 14, color: C.textDim, marginBottom: 8, lineHeight: 1.55 }}>{hilfe}</div>}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {optionen.map(([v, l]) => (
          <button key={v} type="button" onClick={() => setWert(v)} aria-pressed={wert === v}
            style={{ padding: "8px 16px", fontSize: 15, borderRadius: THEME.radius.sm, cursor: "pointer", fontFamily: THEME.font.body,
              border: "1px solid " + (wert === v ? C.brand : C.border), background: wert === v ? C.brandBg : "#fff", color: wert === v ? C.brand : C.text, fontWeight: wert === v ? 600 : 400 }}>
            {l}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function HeizkostenWidget({ C, navigateTo }) {
  const [jahr, setJahr] = useState("2025");
  const [verbrauch, setVerbrauch] = useState("");
  const [grafik, setGrafik] = useState("");
  const [funk, setFunk] = useState("");
  const [neu, setNeu] = useState("");
  const [co2, setCo2] = useState("");
  const [co2Aufteilung, setCo2Aufteilung] = useState("");
  const [betrag, setBetrag] = useState("");

  const j = Number(jahr);
  const anteil = Number(String(betrag).replace(/\./g, "").replace(",", "."));
  const euroText = p => (anteil > 0 ? " Bei " + anteil.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " € Heizkostenanteil sind das " + (anteil * p / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €." : "");

  const befunde = [];
  const offen = [];
  if (verbrauch === "nein") {
    befunde.push({ ton: "gut", titel: "15 Prozent Kürzung möglich", text: "Wird nicht nach Verbrauch verteilt, darfst du deinen Anteil an den Heiz- und Warmwasserkosten um 15 Prozent kürzen (§ 12 Abs. 1 Satz 1 HeizkostenV)." + euroText(15) });
  }
  if (verbrauch === "ja" && j >= 2022 && grafik === "nein") {
    befunde.push({ ton: "gut", titel: "3 Prozent Kürzung möglich: Vorjahresvergleich fehlt", text: "Seit dem Abrechnungsjahr 2022 muss die Abrechnung deinen Verbrauch grafisch mit dem Vorjahr vergleichen (§ 6a Abs. 3 HeizkostenV). Fehlt das, darfst du um 3 Prozent kürzen (§ 12 Abs. 1 Satz 3 HeizkostenV)." + euroText(3) });
  }
  if (verbrauch !== "nein" && funk === "nein") {
    if (j >= 2027) {
      befunde.push({ ton: "gut", titel: "3 Prozent Kürzung möglich: keine Funkzähler", text: "Nicht fernablesbare Geräte mussten bis 31.12.2026 nachgerüstet werden (§ 5 Abs. 3 HeizkostenV). Ist das nicht geschehen, darfst du um 3 Prozent kürzen (§ 12 Abs. 1 Satz 2 HeizkostenV), außer in begründeten Ausnahmefällen." + euroText(3) });
    } else if (neu === "ja") {
      befunde.push({ ton: "gut", titel: "3 Prozent Kürzung möglich: neue Zähler ohne Funk", text: "Seit dem 1. Dezember 2021 eingebaute Zähler müssen fernablesbar sein (§ 5 Abs. 2 HeizkostenV). Ist das nicht so, darfst du um 3 Prozent kürzen (§ 12 Abs. 1 Satz 2 HeizkostenV)." + euroText(3) });
    } else if (neu === "unklar") {
      offen.push("Ob die Zähler nach dem 1. Dezember 2021 eingebaut wurden, kannst du beim Vermieter oder Messdienst erfragen. Nur dann greift für " + jahr + " schon das Kürzungsrecht wegen fehlender Fernablesbarkeit.");
    }
  }
  if (co2 === "ja" && j >= 2023 && co2Aufteilung === "nein") {
    befunde.push({ ton: "gut", titel: "3 Prozent Kürzung möglich: CO₂-Aufteilung fehlt", text: "Der Vermieter muss in der Heizkostenabrechnung ausweisen, wie die CO₂-Kosten aufgeteilt werden, mit Einstufung und Berechnungsgrundlagen (§ 7 Abs. 3 CO2KostAufG). Fehlt das, darfst du deinen Anteil an den Heizkosten um 3 Prozent kürzen (§ 7 Abs. 4 CO2KostAufG)." + euroText(3) });
  }
  if (verbrauch === "unklar") offen.push("Nach Verbrauch verteilt ist erkennbar an Zählerständen, Einheiten oder Strichen pro Heizkörper in der Abrechnung des Messdienstes (zum Beispiel ista, Techem, Brunata, Minol).");
  if (grafik === "unklar") offen.push("Der Vorjahresvergleich ist meist ein kleines Balkendiagramm auf der Heizkostenabrechnung des Messdienstes. Eine reine Zahl genügt nicht.");
  if (co2Aufteilung === "unklar") offen.push("Die CO₂-Aufteilung steht oft auf einer eigenen Seite (\"Aufteilung der Kohlendioxidkosten\"), mit einer Stufe von 1 bis 10 und dem Prozentanteil, den der Vermieter trägt.");

  const fertig = verbrauch && (verbrauch === "nein" || grafik || j < 2022) && (verbrauch === "nein" || funk) && co2;

  return (
    <Kasten C={C}>
      <label style={{ display: "block", marginBottom: 16 }}>
        <span style={labelStil(C)}>Für welches Jahr ist die Abrechnung?</span>
        <select value={jahr} onChange={ev => setJahr(ev.target.value)} style={{ ...feldStil(C), maxWidth: 160 }}>
          {["2022", "2023", "2024", "2025", "2026", "2027"].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </label>
      <Frage C={C} frage="Werden Heiz- und Warmwasserkosten nach Verbrauch verteilt?" hilfe="Erkennbar an Zählerständen oder Einheiten pro Heizkörper in der Abrechnung des Messdienstes." wert={verbrauch} setWert={setVerbrauch} />
      {verbrauch === "ja" && j >= 2022 && (
        <Frage C={C} frage="Enthält die Abrechnung einen grafischen Vergleich deines Verbrauchs mit dem Vorjahr?" hilfe="Meist ein kleines Balkendiagramm. Eine reine Zahlenangabe zählt nicht." wert={grafik} setWert={setGrafik} />
      )}
      {verbrauch !== "nein" && (
        <Frage C={C} frage="Werden deine Zähler per Funk abgelesen (ohne Ablesetermin in der Wohnung)?" wert={funk} setWert={setFunk} />
      )}
      {verbrauch !== "nein" && funk === "nein" && j < 2027 && (
        <Frage C={C} frage="Wurden die Zähler nach dem 1. Dezember 2021 neu eingebaut?" wert={neu} setWert={setNeu} />
      )}
      <Frage C={C} frage="Stehen in der Heizkostenabrechnung CO₂-Kosten?" hilfe="Bei Heizung mit Gas, Öl oder Fernwärme in der Regel ja." wert={co2} setWert={setCo2} optionen={[["ja", "Ja"], ["nein", "Nein"]]} />
      {co2 === "ja" && j >= 2023 && (
        <Frage C={C} frage="Ist ausgewiesen, wie die CO₂-Kosten zwischen dir und dem Vermieter aufgeteilt werden?" hilfe="Mit Einstufung des Gebäudes (Stufe 1 bis 10) und Anteil des Vermieters." wert={co2Aufteilung} setWert={setCo2Aufteilung} />
      )}
      <label style={{ display: "block", margin: "4px 0 18px" }}>
        <span style={labelStil(C)}>Dein Anteil an Heiz- und Warmwasserkosten in € (optional)</span>
        <input inputMode="decimal" value={betrag} onChange={ev => setBetrag(ev.target.value.replace(/[^0-9.,]/g, ""))} placeholder="z. B. 1.170,00" style={{ ...feldStil(C), maxWidth: 220 }} />
      </label>

      <div aria-live="polite">
        {befunde.map((b, i) => <Ergebniszeile key={i} C={C} {...b} />)}
        {fertig && befunde.length === 0 && offen.length === 0 && (
          <Ergebniszeile C={C} ton="neutral" titel="Nach deinen Angaben kein Kürzungsrecht" text="Nach deinen Antworten fehlt keine der Pflichtangaben, die ein Kürzungsrecht auslösen. Die Kosten selbst können trotzdem zu hoch sein, das prüft die ganze Abrechnung." />
        )}
        {offen.map((t, i) => <Ergebniszeile key={"o" + i} C={C} ton="neutral" titel="Noch offen" text={t} />)}
      </div>
      <p style={{ fontSize: 13.5, color: C.textDim, lineHeight: 1.6, margin: "12px 0 16px" }}>
        Allgemeine Auswertung nach HeizkostenV und CO2KostAufG, keine Rechtsberatung im Einzelfall. Die Kürzung musst du dem Vermieter mit Begründung mitteilen. Im Paket „Auswertung + Brief“ formulieren wir das für dich.
      </p>
      <div style={{ textAlign: "center" }}><PruefenKnopf C={C} navigateTo={navigateTo} /></div>
    </Kasten>
  );
}

// ── Seite ────────────────────────────────────────────────────────────────
export default function Werkzeug({ step, navigateTo, navigateToArtikel }) {
  const C = THEME.color;
  const w = werkzeugFuerStep(step);
  if (!w) return null;
  const andere = WERKZEUGE.filter(x => x.step !== w.step);

  return (
    <div style={{ fontFamily: THEME.font.body, background: C.bg, color: C.text, minHeight: "100vh" }}>
      <Nav activeStep={step} navigateTo={navigateTo} />
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "28px 20px 60px" }}>
        <div style={{ display: "inline-block", background: C.brandBg, borderRadius: 4, padding: "3px 10px", fontSize: 13, color: C.brand, fontWeight: 700, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Kostenloses Werkzeug für Mieter
        </div>
        <h1 style={{ fontFamily: THEME.font.heading, fontSize: "clamp(22px, 5.4vw, 30px)", fontWeight: 600, lineHeight: 1.3, margin: "0 0 14px" }}>{w.titel}</h1>
        <p style={{ fontSize: 17.5, color: C.textMuted, lineHeight: 1.7, margin: "0 0 24px" }}>{w.intro}</p>

        {w.widget === "start" && <StartWidget C={C} navigateTo={navigateTo} />}
        {w.widget === "fristen" && <FristenWidget C={C} navigateTo={navigateTo} />}
        {w.widget === "heizkosten" && <HeizkostenWidget C={C} navigateTo={navigateTo} />}

        {w.abschnitte.map((a, i) => {
          const ziel = a.verweis ? ARTIKEL.find(x => x.id === a.verweis) : null;
          return (
            <section key={i}>
              <h2 style={{ fontFamily: THEME.font.heading, fontSize: 21, fontWeight: 600, margin: "28px 0 12px" }}>{a.h2}</h2>
              {a.text && <p style={{ fontSize: 16.5, color: C.textMuted, lineHeight: 1.75, margin: "0 0 14px" }}>{a.text()}</p>}
              {a.liste && (
                <ul style={{ margin: "0 0 14px", paddingLeft: 0, listStyle: "none" }}>
                  {a.liste.map((t, j) => (
                    <li key={j} style={{ display: "flex", gap: 10, marginBottom: 10, fontSize: 16.5, color: C.textMuted, lineHeight: 1.65 }}>
                      <span style={{ color: C.brand, flexShrink: 0, fontWeight: 700 }}>{j + 1}.</span><span>{t}</span>
                    </li>
                  ))}
                </ul>
              )}
              {a.schritte && (
                <ol style={{ margin: "0 0 14px", paddingLeft: 20, color: C.textMuted, fontSize: 16.5, lineHeight: 1.7 }}>
                  {a.schritte.map((t, j) => <li key={j} style={{ marginBottom: 8 }}>{t}</li>)}
                </ol>
              )}
              {ziel && (
                <p style={{ margin: "0 0 14px" }}>
                  <Verweis href={"/ratgeber/" + ziel.id} onNavigate={() => navigateToArtikel(ziel.id)} style={{ color: C.brand, fontWeight: 600, fontSize: 16, textDecoration: "underline" }}>
                    Ratgeber: {ziel.titelKurz || ziel.titel} →
                  </Verweis>
                </p>
              )}
            </section>
          );
        })}

        <h2 style={{ fontFamily: THEME.font.heading, fontSize: 21, fontWeight: 600, margin: "32px 0 12px" }}>Häufige Fragen</h2>
        {w.faq.map((f, i) => (
          <details key={i} style={{ borderBottom: "1px solid " + C.border, padding: "12px 0" }}>
            <summary style={{ fontSize: 17, fontWeight: 600, color: C.text, cursor: "pointer", lineHeight: 1.5 }}>{f.frage}</summary>
            <p style={{ fontSize: 16, color: C.textMuted, lineHeight: 1.7, margin: "10px 0 0" }}>{f.antwort}</p>
          </details>
        ))}

        <div style={{ marginTop: 36, paddingTop: 20, borderTop: "1px solid " + C.border }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Weitere kostenlose Werkzeuge</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            {andere.map(x => (
              <Verweis key={x.step} href={x.pfad} onNavigate={() => navigateTo(x.step)}
                style={{ display: "block", padding: "14px 16px", border: "1px solid " + C.border, borderRadius: THEME.radius.md }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: C.brand, fontFamily: THEME.font.heading, marginBottom: 2 }}>{x.menue} →</div>
                <div style={{ fontSize: 14, color: C.textMuted }}>{x.kurz}</div>
              </Verweis>
            ))}
          </div>
        </div>
      </div>
      <LegalFooter navigateTo={navigateTo} />
    </div>
  );
}
