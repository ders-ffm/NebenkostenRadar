// ─────────────────────────────────────────────────────────────────────────
// AbrechnungPDF.jsx — Seite 1: Nebenkosten-Prüfbericht (Positionsübersicht).
// Echtes Vektor-PDF via @react-pdf/renderer, läuft komplett im Browser
// (kein Server, keine laufenden Kosten) — kein Screenshot der Website,
// sondern eine eigene, für den Druck gebaute Vorlage im selben Design.
//
// Installation nötig (siehe Anleitung am Ende des Projekts):
//   npm install @react-pdf/renderer
// ─────────────────────────────────────────────────────────────────────────
import { Document, Page, View, Text, StyleSheet, Font } from "@react-pdf/renderer";
import { THEME } from "../config/theme.js";
import { fmt } from "../lib/format.js";

// Poppins/Work Sans müssen für react-pdf als Font-Dateien registriert werden
// (react-pdf kann keine Google-Fonts-<link>-Tags der Website nutzen).
// WICHTIG — Ursache eines echten Bugs (08/2026, siehe CHANGELOG): Vorher
// zeigten diese Font.register()-Aufrufe auf feste Google-Fonts-CDN-URLs
// (fonts.gstatic.com). Google verschiebt Schriftdateien irgendwann auf eine
// neue Versionsnummer und lässt die alte URL als 404 zurück, ohne
// Vorwarnung — genau das ist am 08.08./09.08.2026 passiert (v19/v21 -> v24)
// und hat die komplette PDF-Erzeugung (Download-Button UND Mailversand)
// lautlos scheitern lassen, weil react-pdf ohne Schriftdatei nicht rendern
// kann. Behoben, dauerhaft: die vier Schriftdateien liegen jetzt selbst im
// Projekt unter public/fonts/ (aus dem offiziellen npm-Paket @fontsource/
// work-sans bzw. @fontsource/poppins entnommen, nicht selbst erzeugt) und
// werden von hier aus lokal referenziert. Damit hängt die PDF-Erzeugung von
// keinem externen Dienst mehr ab — dieser Fehler kann so nicht wiederkehren.
// WICHTIG — bewusst .woff statt .woff2: Ein erster Versuch mit .woff2
// (Brotli-komprimiert) verursachte "RangeError: Out of bounds access" beim
// PDF-Erzeugen im Browser — die von react-pdf genutzte fontkit-Bibliothek
// entpackt Brotli client-seitig offenbar nicht zuverlässig. Das ältere,
// unkomprimierte .woff-Format (zlib/deflate, breiter unterstützt) behebt das.
Font.register({
  family: "Work Sans",
  fonts: [
    { src: "/fonts/WorkSans-Regular.woff", fontWeight: 400 },
    { src: "/fonts/WorkSans-Medium.woff", fontWeight: 500 },
  ],
});
Font.register({
  family: "Poppins",
  fonts: [
    { src: "/fonts/Poppins-Medium.woff", fontWeight: 500 },
    { src: "/fonts/Poppins-SemiBold.woff", fontWeight: 600 },
  ],
});

const C = THEME.color;
const s = StyleSheet.create({
  page: { padding: "36pt 42pt 28pt", fontFamily: "Work Sans", fontSize: 10, color: C.text },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottom: "1pt solid " + C.brandBg, paddingBottom: 12, marginBottom: 16 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  logoBox: { width: 20, height: 20, borderRadius: 5, backgroundColor: C.brand },
  brandText: { fontFamily: "Poppins", fontWeight: 600, fontSize: 11 },
  metaRight: { fontSize: 8, color: C.textDim, textAlign: "right" },
  eyebrow: { fontSize: 8, color: C.textDim, marginBottom: 3 },
  h1: { fontFamily: "Poppins", fontWeight: 600, fontSize: 15, marginBottom: 14 },
  summaryBox: { backgroundColor: C.accentBg, borderRadius: 8, padding: "10pt 14pt", marginBottom: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryLabel: { fontSize: 8, color: C.textDim, marginBottom: 2 },
  summaryValue: { fontFamily: "Poppins", fontWeight: 600, fontSize: 18, color: C.brand },
  summaryRight: { fontSize: 8, color: C.textDim, textAlign: "right" },
  table: { marginBottom: 14 },
  tHeadRow: { flexDirection: "row", borderBottom: "1pt solid " + C.text, paddingBottom: 4, marginBottom: 2 },
  tRow: { flexDirection: "row", borderBottom: "0.5pt solid " + C.border, paddingVertical: 5 },
  tHead: { fontFamily: "Poppins", fontWeight: 600, fontSize: 8 },
  colPosten: { flex: 3 },
  colBetrag: { flex: 1.3, textAlign: "right" },
  colRicht: { flex: 1.3, textAlign: "right", color: C.textDim },
  colStatus: { flex: 1.3, textAlign: "right", fontWeight: 500 },
  begruendung: { backgroundColor: C.bg, borderLeft: "2pt solid " + C.accent, borderRadius: 4, padding: "8pt 10pt", marginBottom: 10, fontSize: 8, color: C.textMuted, lineHeight: 1.5 },
  footer: { position: "absolute", bottom: 24, left: 42, right: 42, borderTop: "0.5pt solid " + C.border, paddingTop: 6, flexDirection: "row", justifyContent: "space-between", fontSize: 7, color: C.textDim },
});

const STATUS_LABEL = { ok: "Unauffällig", hoch: "Erhöht", sehr_hoch: "Stark erhöht", nicht_umlagefaehig: "Nicht zulässig", pruefen: "Prüfen" };
const STATUS_COLOR = { ok: C.brand, hoch: C.accent, sehr_hoch: C.accent, nicht_umlagefaehig: C.critical, pruefen: C.accent };

export default function AbrechnungPDF({ result, wohnung, seite = 1, seitenGesamt = 1 }) {
  const auffaelligeAnzahl = result.posten_bewertung.filter(p => p.status !== "ok").length;
  return (
    <Page size="A4" style={s.page}>
      <View style={s.header}>
        <View style={s.logoRow}>
          <View style={s.logoBox} />
          <Text style={s.brandText}>NebenkostenRadar</Text>
        </View>
        <View>
          <Text style={s.metaRight}>Prüfbericht · Seite {seite}/{seitenGesamt}</Text>
          <Text style={s.metaRight}>{new Date().toLocaleDateString("de-DE")}</Text>
        </View>
      </View>

      <Text style={s.eyebrow}>Nebenkosten-Prüfbericht · Wohnung {wohnung.flaeche} m² · Abrechnungsjahr {wohnung.jahr}</Text>
      <Text style={s.h1}>Deine vollständige Auswertung</Text>

      <View style={s.summaryBox}>
        <View>
          <Text style={s.summaryLabel}>Mögliche Rückforderung</Text>
          <Text style={s.summaryValue}>{result.moegliche_ersparnis > 0 ? fmt(result.moegliche_ersparnis) : "Keine"}</Text>
        </View>
        <Text style={s.summaryRight}>{auffaelligeAnzahl} von {result.posten_bewertung.length} Positionen{"\n"}auffällig</Text>
      </View>

      <View style={s.table}>
        <View style={s.tHeadRow}>
          <Text style={[s.tHead, s.colPosten]}>Position</Text>
          <Text style={[s.tHead, s.colBetrag]}>Betrag</Text>
          <Text style={[s.tHead, s.colRicht]}>Richtwert</Text>
          <Text style={[s.tHead, s.colStatus]}>Status</Text>
        </View>
        {result.posten_bewertung.map((p, i) => (
          <View key={i} style={s.tRow}>
            <Text style={s.colPosten}>{p.posten}</Text>
            <Text style={s.colBetrag}>{fmt(p.betrag)}</Text>
            <Text style={s.colRicht}>{p.richtwert > 0 ? fmt(p.richtwert) : "—"}</Text>
            <Text style={[s.colStatus, { color: STATUS_COLOR[p.status] }]}>{STATUS_LABEL[p.status] || p.status}</Text>
          </View>
        ))}
      </View>

      {result.posten_bewertung.filter(p => p.status !== "ok").map((p, i) => (
        <Text key={i} style={s.begruendung}>
          <Text style={{ fontFamily: "Poppins", fontWeight: 600 }}>{p.posten}: </Text>
          {p.hinweis} ({p.paragraf})
        </Text>
      ))}

      <View style={s.footer} fixed>
        <Text>Unverbindliche Auswertung, keine Rechtsberatung (§ 2 RDG) · nebenkostenradar.com</Text>
        <Text render={({ pageNumber, totalPages }) => `Seite ${pageNumber}`} />
      </View>
    </Page>
  );
}
