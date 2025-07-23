// Import necessary libraries
import * as XLSX from "xlsx"; // For Excel export
import jsPDF from "jspdf"; // For PDF generation
import autoTable from "jspdf-autotable"; // For table layout in PDFs

// Field interface to represent form fields
interface Field {
  id: string | number;   // Unique ID for the field
  label?: string;        // Optional label
  title?: string;        // Optional title (fallback if label is not present)
}

// Helper function to get the label for a field ID from the fields array
const getFieldLabel = (fieldId: string, fields: Field[]) => {
  const field = fields.find((f) => String(f.id) === String(fieldId));
  return field?.label || field?.title || fieldId; // Return label > title > fallback to ID
};

// Converts different data types to a string value
const stringifyValue = (val: any): string => {
  if (Array.isArray(val)) return val.join(", "); // Join arrays with comma
  if (typeof val === "object" && val !== null) return JSON.stringify(val); // Stringify objects
  return String(val ?? ""); // Fallback for null/undefined
};

// Export responses as CSV
export const exportAsCSV = (
  title: string,                            // File title
  responses: Record<string, any>,          // Response data (key = field ID)
  fields: Field[]                           // Field definitions (to map label)
) => {
  // Generate header row using field labels
  const headers = Object.keys(responses).map((id) =>
    `"${getFieldLabel(id, fields)}"`
  );

  // Generate values row using stringified values
  const values = Object.keys(responses).map((id) =>
    `"${stringifyValue(responses[id])}"`
  );

  // Combine into CSV format string
  const csvContent = [headers.join(","), values.join(",")].join("\n");

  // Create a downloadable blob
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  // Trigger download using an anchor tag
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", `${title || "form"}_responses.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export form responses as XLSX (Excel)
 */
export const exportAsXLSX = (
  title: string,
  responses: Record<string, any>,
  fields: Field[]
) => {
  // Map headers and values just like in CSV
  const headers = Object.keys(responses).map((id) =>
    getFieldLabel(id, fields)
  );

  const values = Object.keys(responses).map((id) =>
    stringifyValue(responses[id])
  );

  // Create worksheet data: headers row + values row
  const worksheetData = [headers, values];

  // Create worksheet and workbook
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Form Responses");

  // Write file
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
  const doc = new jsPDF(); // Create new PDF document
  doc.setFontSize(14);
  doc.text(title || "Form Responses", 14, 15); // Add title to PDF

  // Map headers and values
  const headers = Object.keys(responses).map((id) =>
    getFieldLabel(id, fields)
  );

  const values = Object.keys(responses).map((id) =>
    stringifyValue(responses[id])
  );

  // Use autoTable to create a table in PDF
  autoTable(doc, {
    head: [headers],     // Single header row
    body: [values],      // Single values row
    startY: 20,          // Start below the title
  });

  // Save the generated PDF
  doc.save(`${title || "form"}_responses.pdf`);
};
