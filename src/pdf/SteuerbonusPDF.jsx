// ─────────────────────────────────────────────────────────────────────────
// SteuerbonusPDF.jsx — Seite 3 (nur Stufe "voll"): unverbindlicher Hinweis
// auf potenziell nach § 35a EStG absetzbare Positionen aus der Abrechnung,
// plus fertige Anfrage-Vorlage an den Vermieter für die fehlende
// Arbeitskosten-Aufschlüsselung (siehe Recherche in
// planung/businessplan-umsatzprognose.md Abschnitt 10 und
// planung/steuerbonus-35a-rollout.md, 14.08.2026, Stefans Entscheidung:
// on top, kein Aufpreis, nur im 12,99-€-Paket).
//
// RECHTLICHES: Reine Rechenhilfe, keine Steuerberatung — siehe § 5 StBerG
// (Verbot der unbefugten Hilfeleistung in Steuersachen), § 6 Nr. 3 StBerG
// (mechanische Rechenarbeiten erlaubt). Formulierung angelehnt an die bei
// einem direkten Wettbewerber (NebenkostenPro) beobachtete, in dieser
// Nische offenbar akzeptierte Praxis (siehe Businessplan 10.4). Deshalb an
// zwei Stellen ein expliziter Disclaimer: kurz oben, ausführlich im Footer.
//
// DATENQUELLE: Filtert result.posten_bewertung nach dem Flag
// `steuerlich_35a` (gesetzt in lib/analyse.js, siehe Kommentar dort) — KEIN
// separater Datenfluss, keine neue Supabase-Spalte, nutzt ausschließlich
// Daten, die für Seite 1/2 ohnehin schon vorhanden und persistiert sind.
// ─────────────────────────────────────────────────────────────────────────
import { Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { THEME } from "../config/theme.js";
import { fmt } from "../lib/format.js";

const C = THEME.color;
const s = StyleSheet.create({
  page: { padding: "40pt 46pt", fontFamily: "Work Sans", fontSize: 10, color: C.text, lineHeight: 1.55 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 24 },
  logoBox: { width: 12, height: 12, borderRadius: 3, backgroundColor: C.brand },
  logoText: { fontFamily: "Poppins", fontSize: 8, fontWeight: 600, color: C.textDim },
  titel: { fontFamily: "Poppins", fontSize: 14, fontWeight: 600, marginBottom: 3 },
  untertitel: { fontSize: 8.5, color: C.textDim, marginBottom: 16 },
  absatz: { marginBottom: 10, fontSize: 10 },
  table: { marginBottom: 12, borderTop: "0.5pt solid " + C.border },
  tRow: { flexDirection: "row", borderBottom: "0.5pt solid " + C.border, paddingVertical: 6 },
  tRowSum: { flexDirection: "row", paddingVertical: 6, fontWeight: 500 },
  tLabel: { flex: 3, color: C.textMuted },
  tValue: { flex: 1, textAlign: "right" },
  hinweisBox: { backgroundColor: C.brandBg, borderRadius: 6, padding: "10pt 12pt", marginBottom: 16, fontSize: 9.5, color: C.text, lineHeight: 1.5 },
  anfrageTitel: { fontSize: 10, fontWeight: 500, marginBottom: 6 },
  anfrageBox: { border: "0.5pt solid " + C.border, borderRadius: 6, padding: "10pt 12pt", marginBottom: 16, fontSize: 9.5, color: C.textMuted, lineHeight: 1.6 },
  footer: { position: "absolute", bottom: 24, left: 46, right: 46, borderTop: "0.5pt solid " + C.border, paddingTop: 6, fontSize: 7, color: C.textDim, textAlign: "center" },
});

// 20 % Grenzwerte aus § 35a Abs. 2/3 EStG — siehe Businessplan Abschnitt
// 10.1 für die primärquellengestützte Herleitung. Bewusst als reiner
// Rechenwert auf den VOLLEN gefundenen Betrag ausgewiesen (nicht nur
// Arbeitskosten, die die Abrechnung meist nicht getrennt ausweist) — daher
// im Text klar als Obergrenze/Ausgangswert gekennzeichnet, nicht als
// feststehendes Ergebnis.
const PROZENTSATZ = 0.2;

export default function SteuerbonusPDF({ result, wohnung, adressen }) {
  const positionen = (result.posten_bewertung || []).filter(p => p.steuerlich_35a && p.betrag > 0);
  const summe = Math.round(positionen.reduce((s2, p) => s2 + p.betrag, 0) * 100) / 100;
  const rechnerischerHinweis = Math.round(summe * PROZENTSATZ * 100) / 100;
  const heute = new Date().toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" });

  return (
    <Page size="A4" style={s.page}>
      <View style={s.logoRow}>
        <View style={s.logoBox} />
        <Text style={s.logoText}>Erstellt mit NebenkostenRadar</Text>
      </View>

      <Text style={s.titel}>Steuer-Bonus: was du absetzen kannst</Text>
      <Text style={s.untertitel}>Unverbindlicher Hinweis nach § 35a EStG — reine Rechenhilfe, keine Steuerberatung.</Text>

      {positionen.length === 0 ? (
        <Text style={s.absatz}>
          In deiner Abrechnung wurden keine Positionen gefunden, die typischerweise unter § 35a EStG fallen (z. B. Hausmeister, Gartenpflege, Hausreinigung, Winterdienst, Schornsteinfeger, Aufzug- oder Heizungswartung). Das heißt nicht zwingend, dass es nichts Absetzbares gibt — frag im Zweifel direkt bei deinem Vermieter nach.
        </Text>
      ) : (
        <>
          <Text style={s.absatz}>
            Diese Positionen aus deiner Abrechnung können nach § 35a EStG als haushaltsnahe Dienstleistung oder Handwerkerleistung absetzbar sein:
          </Text>

          <View style={s.table}>
            {positionen.map((p, i) => (
              <View key={i} style={s.tRow}>
                <Text style={s.tLabel}>{p.posten}</Text>
                <Text style={s.tValue}>{fmt(p.betrag)}</Text>
              </View>
            ))}
            <View style={s.tRowSum}>
              <Text style={s.tLabel}>Summe</Text>
              <Text style={s.tValue}>{fmt(summe)}</Text>
            </View>
          </View>

          <View style={s.hinweisBox}>
            <Text>
              Rechnerischer Hinweis: 20 % davon wären {fmt(rechnerischerHinweis)} — als Ausgangswert auf Basis des vollen Betrags oben. Absetzbar ist aber nur der reine Arbeits-, Fahrt- und Maschinenkostenanteil, kein Material (§ 35a Abs. 2/3 EStG) — deine Abrechnung weist das meist nicht getrennt aus. Gesetzliche Höchstbeträge: 4.000 €/Jahr für haushaltsnahe Dienstleistungen, 1.200 €/Jahr für Handwerkerleistungen.
            </Text>
          </View>

          <Text style={s.anfrageTitel}>Anfrage an deinen Vermieter (zum Kopieren und Versenden)</Text>
          <View style={s.anfrageBox}>
            <Text>
              Sehr geehrte Damen und Herren,{"\n\n"}
              für meine Steuererklärung {wohnung.jahr} bitte ich um eine Aufschlüsselung des reinen Arbeitskostenanteils (ohne Material) für folgende Positionen aus der Betriebskostenabrechnung {wohnung.jahr}: {positionen.map(p => p.posten + " (" + fmt(p.betrag) + ")").join(", ")}.{"\n\n"}
              Eine Bescheinigung gemäß § 35a EStG bzw. nach dem Muster der Anlage 2 zum BMF-Schreiben vom 09.11.2016 genügt.{"\n\n"}
              Mit freundlichen Grüßen{"\n"}{adressen.mieterName}
            </Text>
          </View>
        </>
      )}

      <Text style={{ fontSize: 8.5, color: C.textDim }}>{(adressen.mieterOrt || "").trim()}, {heute}</Text>

      <View style={s.footer} fixed>
        <Text>Reine Rechenhilfe, keine Steuerberatung. Automatisiert erstellter Hinweis, keine Gewähr für Richtigkeit oder Vollständigkeit — ob und in welcher Höhe die Ermäßigung im Einzelfall greift, hängt von deiner individuellen Steuererklärung ab.</Text>
      </View>
    </Page>
  );
}
