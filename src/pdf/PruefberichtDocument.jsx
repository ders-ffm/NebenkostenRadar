// ─────────────────────────────────────────────────────────────────────────
// PruefberichtDocument.jsx — kombiniert Abrechnung (Seite 1) und optional
// Brief (Seite 2, nur Stufe "voll") zu einem einzigen PDF-Dokument.
// ─────────────────────────────────────────────────────────────────────────
import { Document } from "@react-pdf/renderer";
import AbrechnungPDF from "./AbrechnungPDF.jsx";
import BriefPDF from "./BriefPDF.jsx";
import SteuerbonusPDF from "./SteuerbonusPDF.jsx";

// 14.08.2026: dritte Seite "Steuer-Bonus" (§ 35a EStG) ergänzt, nur Stufe
// "voll" — siehe planung/steuerbonus-35a-rollout.md. seitenGesamt entsprechend
// von 2 auf 3 erhöht (wird in AbrechnungPDF.jsx als "Seite 1 von X" angezeigt).
export default function PruefberichtDocument({ result, wohnung, adressen, stufe }) {
  const seitenGesamt = stufe === "voll" ? 3 : 1;
  return (
    <Document title={"Nebenkosten-Pruefbericht_" + wohnung.jahr}>
      <AbrechnungPDF result={result} wohnung={wohnung} seite={1} seitenGesamt={seitenGesamt} />
      {stufe === "voll" && <BriefPDF result={result} wohnung={wohnung} adressen={adressen} />}
      {stufe === "voll" && <SteuerbonusPDF result={result} wohnung={wohnung} adressen={adressen} />}
    </Document>
  );
}
