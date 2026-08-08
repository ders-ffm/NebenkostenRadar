// ─────────────────────────────────────────────────────────────────────────
// PruefberichtDocument.jsx — kombiniert Abrechnung (Seite 1) und optional
// Brief (Seite 2, nur Stufe "voll") zu einem einzigen PDF-Dokument.
// ─────────────────────────────────────────────────────────────────────────
import { Document } from "@react-pdf/renderer";
import AbrechnungPDF from "./AbrechnungPDF.jsx";
import BriefPDF from "./BriefPDF.jsx";

export default function PruefberichtDocument({ result, wohnung, adressen, stufe }) {
  const seitenGesamt = stufe === "voll" ? 2 : 1;
  return (
    <Document title={"Nebenkosten-Pruefbericht_" + wohnung.jahr}>
      <AbrechnungPDF result={result} wohnung={wohnung} seite={1} seitenGesamt={seitenGesamt} />
      {stufe === "voll" && <BriefPDF result={result} wohnung={wohnung} adressen={adressen} />}
    </Document>
  );
}
