// ─────────────────────────────────────────────────────────────────────────
// Verweis.jsx — Echter Link (<a href>) mit Navigation ohne Neuladen.
//
// WARUM (Befund aus dem technischen Gesamttest vom 17.10.2026):
// Menü, Fußzeile, Ratgeber-Karten und Querverweise waren <button> oder
// <div onClick>. Für Besucher sah das aus wie ein Link, für Google nicht:
// Im gerenderten DOM der Ratgeber-Übersicht gab es 0 Links, in einem Artikel
// ebenfalls 0. Google folgt aber nur <a href>. Interne Links sind bei einer
// jungen Domain das wichtigste Signal, das wir selbst in der Hand haben:
// Sie zeigen Google, welche Seiten zusammengehören und welche wichtig sind.
//
// Verhalten:
//   - normaler Klick: wie bisher ohne Neuladen (preventDefault + onNavigate),
//   - Klick mit Strg/Cmd/Shift oder Mittelklick: Browser-Standard, also
//     neuer Tab — das ging mit Buttons vorher gar nicht.
//
// Aussehen: Ohne eigenen style wird der Link nicht unterstrichen und erbt
// die Farbe. Wer einen Button-Look braucht, gibt style mit.
// ─────────────────────────────────────────────────────────────────────────
export default function Verweis({ href, onNavigate, style, children, ...rest }) {
  function onClick(e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    onNavigate && onNavigate();
  }
  return (
    <a href={href} onClick={onClick} style={{ color: "inherit", textDecoration: "none", ...style }} {...rest}>
      {children}
    </a>
  );
}
