import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/** Download a landscape PDF table (admin exports). */
export function downloadAdminTablePdf(options: {
  title: string;
  periodLabel: string;
  columns: string[];
  rows: string[][];
  filenameBase: string;
}): void {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  doc.setFontSize(15);
  doc.text(options.title, 14, 16);
  doc.setFontSize(10);
  doc.setTextColor(70);
  doc.text(`Period: ${options.periodLabel}`, 14, 23);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 29);
  doc.setTextColor(0);
  autoTable(doc, {
    startY: 33,
    head: [options.columns],
    body: options.rows,
    styles: { fontSize: 7, cellPadding: 1.5, overflow: "linebreak" },
    headStyles: { fillColor: [37, 99, 235], textColor: 255 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });
  const safe = options.filenameBase.replace(/[^a-z0-9-_]+/gi, "-").replace(/^-|-$/g, "").slice(0, 72) || "export";
  doc.save(`${safe}.pdf`);
}
