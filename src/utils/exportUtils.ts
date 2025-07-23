import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Field {
  id: string | number;
  label?: string;
  title?: string;
}

const getFieldLabel = (fieldId: string, fields: Field[]) => {
  const field = fields.find((f) => String(f.id) === String(fieldId));
  return field?.label || field?.title || fieldId;
};

const stringifyValue = (val: any): string => {
  if (Array.isArray(val)) return val.join(", ");
  if (typeof val === "object" && val !== null) return JSON.stringify(val);
  return String(val ?? "");
};

export const exportAsCSV = (
  title: string,
  responses: Record<string, any>,
  fields: Field[]
) => {
  const headers = Object.keys(responses).map((id) =>
    `"${getFieldLabel(id, fields)}"`
  );

  const values = Object.keys(responses).map((id) =>
    `"${stringifyValue(responses[id])}"`
  );

  const csvContent = [headers.join(","), values.join(",")].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", `${title || "form"}_responses.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export form responses as XLSX
 */
export const exportAsXLSX = (
  title: string,
  responses: Record<string, any>,
  fields: Field[]
) => {
  const headers = Object.keys(responses).map((id) =>
    getFieldLabel(id, fields)
  );

  const values = Object.keys(responses).map((id) =>
    stringifyValue(responses[id])
  );

  const worksheetData = [headers, values];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Form Responses");

  XLSX.writeFile(workbook, `${title || "form"}_responses.xlsx`);
};

/**
 * Export form responses as PDF
 */
export const exportAsPDF = (
  title: string,
  responses: Record<string, any>,
  fields: Field[]
) => {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(title || "Form Responses", 14, 15);

  const headers = Object.keys(responses).map((id) =>
    getFieldLabel(id, fields)
  );

  const values = Object.keys(responses).map((id) =>
    stringifyValue(responses[id])
  );

  autoTable(doc, {
    head: [headers],
    body: [values],
    startY: 20,
  });

  doc.save(`${title || "form"}_responses.pdf`);
};
