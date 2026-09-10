/* NebenkostenRadar — Richtwerte-Widget
 * Einbinden mit:  <div id="nkr-betriebskostenspiegel"></div>
 *                 <script src="https://nebenkostenradar.com/widget.js" async></script>
 * Quelle: Deutscher Mieterbund, Betriebskostenspiegel. Automatisch erzeugt,
 * nicht von Hand bearbeiten (siehe scripts/prerender.mjs).
 */
(function () {
  var D = {"zeilen":[{"label":"Heizung + Warmwasser","wert":1.32},{"label":"Wasser + Abwasser","wert":0.29},{"label":"Grundsteuer","wert":0.18},{"label":"Müllbeseitigung","wert":0.16},{"label":"Hausmeister","wert":0.21},{"label":"Versicherungen","wert":0.31},{"label":"Gebäudereinigung","wert":0.21},{"label":"Aufzug","wert":0.2},{"label":"Gartenpflege","wert":0.15},{"label":"Allgemeinstrom","wert":0.06}],"gesamt":2.67,"jahr":"2024 (veröffentlicht 12/2025)"};
  function eur(n) { return n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " \u20AC"; }
  function render(ziel) {
    var t = '<table style="width:100%;border-collapse:collapse;font:14px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;color:#2E2A22">';
    t += '<caption style="caption-side:top;text-align:left;font-weight:600;padding:0 0 8px">Betriebskostenspiegel ' + D.jahr + ' \u2014 Durchschnitt je m\u00B2 und Monat</caption>';
    t += '<thead><tr style="border-bottom:2px solid #E3D9C6"><th scope="col" style="text-align:left;padding:6px 8px 6px 0;font-weight:600">Kostenart</th><th scope="col" style="text-align:right;padding:6px 0 6px 8px;font-weight:600">\u20AC/m\u00B2/Monat</th></tr></thead><tbody>';
    D.zeilen.forEach(function (z) {
      t += '<tr style="border-bottom:1px solid #E3D9C6"><th scope="row" style="text-align:left;padding:6px 8px 6px 0;font-weight:400">' + z.label + '</th><td style="text-align:right;padding:6px 0 6px 8px;white-space:nowrap">' + eur(z.wert) + '</td></tr>';
    });
    t += '<tr style="border-top:2px solid #E3D9C6"><th scope="row" style="text-align:left;padding:8px 8px 8px 0;font-weight:700">Gesamt</th><td style="text-align:right;padding:8px 0 8px 8px;font-weight:700;white-space:nowrap">' + eur(D.gesamt) + '</td></tr>';
    t += '</tbody></table>';
    t += '<p style="font:12px/1.5 system-ui,-apple-system,Segoe UI,sans-serif;color:#6B6355;margin:8px 0 0">Quelle: Deutscher Mieterbund, Betriebskostenspiegel ' + D.jahr + '. Tabelle bereitgestellt von <a href="https://nebenkostenradar.com/ratgeber/betriebskostenspiegel-2024" style="color:#3d7a5c">NebenkostenRadar</a>.</p>';
    ziel.innerHTML = t;
  }
  function start() {
    var ziel = document.getElementById("nkr-betriebskostenspiegel");
    if (ziel) render(ziel);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
