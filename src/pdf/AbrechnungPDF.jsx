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
// WORTTRENNUNG ABGESCHALTET, 11.09.2026, gefunden beim ersten echten
// Probedruck des PDFs. react-pdf trennt lange Wörter automatisch, kennt aber
// keine deutschen Trennregeln. Im Testdruck stand wörtlich
// "Versicherungspoli-cen" und "Arbeit-skostenanteil". In einem Dokument, das
// der Kunde unverändert an seinen Vermieter schickt, sieht das nach
// Schlamperei aus und beschädigt genau die Sorgfalt, die das Produkt
// verkauft. Der Callback gibt jedes Wort ungetrennt zurück.
// Folge: Sehr lange Wörter können eine Zeile etwas luftiger machen. Das ist
// deutlich besser als eine falsche Trennung.
// SCHRIFTPFAD, umgestellt 11.09.2026, damit das PDF auch außerhalb des
// Browsers erzeugt werden kann (scripts/pdf-probedruck.mjs).
//
// WARUM: Bis dahin standen hier feste Pfade wie "/fonts/WorkSans-Regular.woff".
// Im Browser löst das gegen die Website auf und funktioniert. Auf der
// Kommandozeile gibt es dieses Wurzelverzeichnis nicht, das Erzeugen brach mit
// "ENOENT: /fonts/WorkSans-Regular.woff" ab. Folge: Das fertige PDF ließ sich
// nur durch einen echten Testkauf prüfen, und Satzfehler blieben deshalb lange
// unentdeckt (siehe CHANGELOG 11.09.2026, vier Funde im ersten Probedruck).
//
// Die Weiche prüft, ob ein Browser-Dokument existiert. Das ist zuverlässiger
// als eine Umgebungsvariable, weil sie niemand setzen muss und weil sie in
// beiden Richtungen automatisch richtig liegt.
//
// WARUM process.cwd() UND NICHT import.meta.url: Für den Probedruck wird diese
// Datei mit esbuild gebündelt. import.meta.url zeigt dann auf das Bündel, nicht
// auf diese Quelldatei, und ein relativer Pfad wie "../../public/fonts/" landet
// im Nichts. process.cwd() ist dagegen das Projektverzeichnis, weil npm jedes
// Skript von dort startet.
//
// BEIM ÄNDERN BEACHTEN: Der Ordner public/fonts muss beide Wege bedienen, im
// Browser unter /fonts/ ausgeliefert (macht Vite von selbst) und lokal unter
// public/fonts vorhanden.
const FONT_BASIS = typeof document === "undefined"
  ? process.cwd() + "/public/fonts/"
  : "/fonts/";

Font.registerHyphenationCallback(wort => [wort]);

Font.register({
  family: "Work Sans",
  fonts: [
    { src: FONT_BASIS + "WorkSans-Regular.woff", fontWeight: 400 },
    { src: FONT_BASIS + "WorkSans-Medium.woff", fontWeight: 500 },
  ],
});
Font.register({
  family: "Poppins",
  fonts: [
    { src: FONT_BASIS + "Poppins-Medium.woff", fontWeight: 500 },
    { src: FONT_BASIS + "Poppins-SemiBold.woff", fontWeight: 600 },
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
  // KORREKTUR 09.09.2026 (gefunden in Stefans Testkauf-PDF, siehe CHANGELOG):
  // Vorher zählte `filter(p => p.status !== "ok")` auch den Status "pruefen"
  // als auffällig. "pruefen" heißt aber gerade NICHT "auffällig", sondern
  // "für diese Position gibt es keinen offiziellen Vergleichswert, wir können
  // sie nicht bewerten". Ergebnis war ein direkter Selbstwiderspruch in
  // derselben Kopfzeile: links groß "Keine Auffälligkeiten", rechts daneben
  // "3 von 6 Positionen auffällig". Jetzt getrennt gezählt und getrennt
  // benannt — nicht bewertbar ist eine eigene Aussage, kein Befund.
  const auffaelligeAnzahl = result.posten_bewertung.filter(p => p.status !== "ok" && p.status !== "pruefen").length;
  const nichtBewertbarAnzahl = result.posten_bewertung.filter(p => p.status === "pruefen").length;
  const gesamtAnzahl = result.posten_bewertung.length;
  // Ältere gespeicherte Berichte kennen das Feld noch nicht. Ein fehlendes
  // Feld darf keinen Absturz erzeugen, sondern muss sich verhalten wie "keine
  // Angaben gemacht". Betrifft Wiederherstellungen aus api/draft.js und aus
  // der Bestellhistorie im Konto.
  const heizBefunde = Array.isArray(result.heiz_befunde) ? result.heiz_befunde : [];
  const kopfRechts =
    auffaelligeAnzahl > 0
      ? auffaelligeAnzahl + " von " + gesamtAnzahl + " Positionen\nauffällig"
      : nichtBewertbarAnzahl > 0
        ? nichtBewertbarAnzahl + " von " + gesamtAnzahl + " Positionen\nohne Vergleichswert"
        : "alle " + gesamtAnzahl + " Positionen\nunauffällig";
  return (
    <Page size="A4" style={s.page}>
      <View style={s.header}>
        <View style={s.logoRow}>
          <View style={s.logoBox} />
          <Text style={s.brandText}>NebenkostenRadar</Text>
        </View>
        <View>
          {/* KORRIGIERT 11.09.2026. Vorher stand hier eine fest gezählte
              Seitenzahl ("Seite 1/3"), die aus PruefberichtDocument.jsx kam
              und die Anzahl der ENTHALTENEN DOKUMENTE zählte, nicht die der
              gedruckten Seiten. Sobald die Postentabelle über eine Seite
              hinauslief, hatte das PDF vier Seiten und trug trotzdem "1/3"
              im Kopf. Das fiel im zweiten Echttest auf.

              react-pdf kennt die echte Seitenzahl erst beim Setzen, deshalb
              muss sie über die render-Funktion kommen, wie im Fußbereich
              dieser Datei auch. seite/seitenGesamt bleiben als Parameter
              erhalten, werden hier aber nicht mehr für die Anzeige benutzt. */}
          <Text style={s.metaRight} render={({ pageNumber, totalPages }) => `Prüfbericht · Seite ${pageNumber} von ${totalPages}`} />
          <Text style={s.metaRight}>{new Date().toLocaleDateString("de-DE")}</Text>
        </View>
      </View>

      <Text style={s.eyebrow}>Nebenkosten-Prüfbericht · Wohnung {wohnung.flaeche} m² · Abrechnungsjahr {wohnung.jahr}</Text>
      <Text style={s.h1}>Deine vollständige Auswertung</Text>

      {/* Umbenannt von "Mögliche Rückforderung" (10.08.2026, siehe CHANGELOG):
          Eine einzelne Kopfzahl suggerierte mehr Sicherheit, als die Methode
          hergibt, fast alle Positionen sind Richtwert-Abweichungen (Anlass
          zur Nachfrage), keine bewiesenen Fehler. Jetzt Prüfergebnis mit den
          beiden Kategorien getrennt, "eindeutig" nur wenn tatsächlich > 0. */}
      <View style={s.summaryBox}>
        <View>
          <Text style={s.summaryLabel}>Prüfergebnis</Text>
          {result.ersparnis_hart > 0 && (
            <Text style={s.summaryValue}>{fmt(result.ersparnis_hart)} <Text style={{ fontSize: 9, fontWeight: 400 }}>eindeutig zu viel gezahlt</Text></Text>
          )}
          {result.ersparnis_statistisch > 0 && (
            <Text style={result.ersparnis_hart > 0 ? { fontSize: 11, marginTop: 2 } : s.summaryValue}>
              {fmt(result.ersparnis_statistisch)} <Text style={{ fontSize: 9, fontWeight: 400 }}>{result.ersparnis_hart > 0 ? "zusätzlich möglich (Beleg nötig)" : "möglicherweise zu viel gezahlt (Beleg nötig)"}</Text>
            </Text>
          )}
          {result.ersparnis_hart <= 0 && result.ersparnis_statistisch <= 0 && (
            <Text style={s.summaryValue}>Keine Auffälligkeiten</Text>
          )}
        </View>
        <Text style={s.summaryRight}>{kopfRechts}</Text>
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
            <Text style={s.colRicht}>{p.richtwert > 0 ? fmt(p.richtwert) : ", "}</Text>
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

      {/* ────────────────────────────────────────────────────────────────────
          FORMALE PRÜFUNG DER HEIZKOSTENABRECHNUNG (13.09.2026, Task #104)

          Eigener Abschnitt statt Zeilen in der Postentabelle. Die Tabelle
          beantwortet die Frage "ist dieser Betrag der Höhe nach in Ordnung",
          hier geht es um die Art der Abrechnung. Zusammengemischt hätten die
          Grundkosten neben den ohnehin gelisteten Heizkosten gestanden und
          wie eine Doppelzählung ausgesehen.

          Erscheint nur, wenn der Kunde die freiwilligen Angaben gemacht hat.
          Sonst greift der Einladungstext im Block darunter.
          ──────────────────────────────────────────────────────────────────── */}
      {heizBefunde.length > 0 && (
        <View style={{ marginTop: 4, marginBottom: 10 }} wrap={false}>
          <Text style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 11, marginBottom: 2 }}>
            Formale Prüfung der Heizkostenabrechnung
          </Text>
          <Text style={{ fontSize: 8, color: C.textDim, marginBottom: 7, lineHeight: 1.5 }}>
            Hier geht es nicht um die Höhe deiner Heizkosten, sondern darum, ob der Vermieter sie
            richtig verteilt hat. Diese Vorgaben stehen in der Heizkostenverordnung und gelten
            unabhängig davon, wie viel du verbraucht hast.
          </Text>
          {heizBefunde.map((b, i) => (
            <View key={i} style={{
              borderLeft: "2pt solid " + (b.status === "verstoss" ? C.critical : C.brand),
              backgroundColor: C.bg, borderRadius: 4, padding: "8pt 10pt", marginBottom: 6,
            }}>
              <Text style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 9, marginBottom: 3, color: b.status === "verstoss" ? C.critical : C.text }}>
                {b.status === "verstoss" ? "Beanstandung: " : "In Ordnung: "}{b.titel}
              </Text>
              <Text style={{ fontSize: 8, color: C.textMuted, lineHeight: 1.5 }}>{b.text}</Text>
            </View>
          ))}
          {result.heiz_kuerzung > 0 && (
            <Text style={{ fontSize: 8, color: C.text, lineHeight: 1.5, marginTop: 2 }}>
              Summe der Kürzungsrechte aus der Heizkostenverordnung: {fmt(result.heiz_kuerzung)}. Dieser Betrag
              ist oben im Prüfergebnis bereits enthalten. Du kürzt ihn selbst von deinem Anteil, du musst ihn
              nicht beim Vermieter beantragen. Teile ihm die Kürzung schriftlich mit und nenne die Vorschrift.
            </Text>
          )}
        </View>
      )}

      {/* ERKLÄRUNG ZU VERBRAUCHSPOSTEN, ergänzt 11.09.2026 auf Stefans Vorgabe.

          WARUM DIESER BLOCK IM BERICHT STEHEN MUSS: Seit die Prüfung Heizung,
          Warmwasser und Wasser nicht mehr beanstandet, sieht der Kunde bei
          diesen Posten den Status "unauffällig", obwohl der Betrag sichtbar
          über dem Richtwert liegt. Ohne Erklärung wirkt das wie ein Fehler im
          Bericht, und der Kunde verliert genau dort Vertrauen, wo wir
          besonders sorgfältig waren.

          Der Text erscheint nur, wenn tatsächlich Verbrauchsposten erfasst
          sind. Sonst steht hier eine Erklärung für etwas, das gar nicht
          auftaucht.

          Der gleiche Inhalt steht in der FAQ (src/config/faq.js, zwei
          Einträge). Bei Änderungen bitte beide Stellen angleichen, sonst
          widerspricht sich die Seite ihrem eigenen Bericht. */}
      {result.posten_bewertung.some(p => /Heizkosten|Warmwasser|Wasserversorgung/i.test(p.posten)) && (
        <View style={{ marginTop: 14, padding: "10 12", backgroundColor: "#F7F3EC", borderRadius: 4 }}>
          <Text style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 9, marginBottom: 4 }}>
            Warum Heizung, Warmwasser und Wasser hier nicht beanstandet werden
          </Text>
          <Text style={{ fontSize: 8, lineHeight: 1.5 }}>
            Diese Kosten werden nach deinem tatsächlichen Verbrauch abgerechnet. Die Vergleichswerte
            des Deutschen Mieterbundes sind dagegen Durchschnitte pro Quadratmeter. Wie viel verbraucht
            wird, hängt aber an der Personenzahl, am Verhalten und am Zustand des Gebäudes, nicht an der
            Wohnfläche. Eine Abweichung nach oben ist deshalb kein Nachweis für einen Abrechnungsfehler,
            und eine Beanstandung allein wegen der Höhe würde deine übrigen Einwände schwächen.
          </Text>
          {/* GEÄNDERT 13.09.2026: Hier stand bisher eine Aufzählung der Rechte
              aus der Heizkostenverordnung, die nirgends geprüft wurden. Der
              Bericht hat also etwas versprochen und nicht geliefert. Seit
              heute gibt es die Prüfung wirklich, deshalb verweist der Text
              jetzt entweder auf den Befund oben oder erklärt, wie man ihn
              bekommt. */}
          {heizBefunde.length > 0 ? (
            <Text style={{ fontSize: 8, lineHeight: 1.5, marginTop: 5 }}>
              Prüfbar ist dagegen die Art der Abrechnung, und genau das haben wir getan. Das Ergebnis
              steht weiter oben im Abschnitt "Formale Prüfung der Heizkostenabrechnung".
            </Text>
          ) : (
            <Text style={{ fontSize: 8, lineHeight: 1.5, marginTop: 5 }}>
              Prüfbar ist dagegen die Art der Abrechnung, und das sind starke Rechte: Der Vermieter muss
              mindestens 50 und höchstens 70 Prozent der Heizkosten nach erfasstem Verbrauch verteilen
              (§ 7 Abs. 1 HeizkostenV). Wird gar nicht verbrauchsabhängig abgerechnet, darfst du deinen
              Anteil um 15 Prozent kürzen (§ 12 Abs. 1 Satz 1 HeizkostenV). Fehlt der vorgeschriebene
              grafische Vergleich mit dem Vorjahr, sind es 3 Prozent (§ 6a Abs. 3 Nr. 5 und
              § 12 Abs. 1 Satz 3 HeizkostenV). Dafür brauchen wir zwei Zahlen von deiner
              Heizkostenabrechnung. Du kannst die Prüfung jederzeit kostenlos nachholen: Gehe auf
              nebenkostenradar.com zurück in den Schritt "Posten" und öffne dort den Block
              "Heizkostenabrechnung zusätzlich prüfen".
            </Text>
          )}
          <Text style={{ fontSize: 8, lineHeight: 1.5, marginTop: 5 }}>
            Was du selbst tun kannst: Vergleiche die Zählerstände mit dem Vorjahr. Als grobe
            Orientierung gelten etwa 45 Kubikmeter Wasser pro Person und Jahr. Erscheint dir der
            Verbrauch unerklärlich hoch, fordere die Ablesewerte an und lass prüfen, ob ein Defekt
            oder ein Leck vorliegt.
          </Text>
        </View>
      )}

      <View style={s.footer} fixed>
        <Text>Unverbindliche Auswertung, keine Rechtsberatung (§ 2 RDG) · nebenkostenradar.com</Text>
        <Text render={({ pageNumber, totalPages }) => `Seite ${pageNumber}`} />
      </View>
    </Page>
  );
}
