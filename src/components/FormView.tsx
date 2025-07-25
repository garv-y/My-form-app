import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../components/ThemeContext";
import { exportAsCSV, exportAsXLSX, exportAsPDF } from "../utils/exportUtils";

// ==== Type Definitions ====
interface BaseField {
  id: string | number;
  label?: string;
  title?: string;
  type: string;
  [key: string]: any;
}

interface RowLayoutField extends BaseField {
  type: "rowLayout";
  columns: { width?: string | number; fields?: FormField[] }[];
}

interface SectionField extends BaseField {
  type: "section";
  subFields?: FormField[];
}

type FormField = BaseField | RowLayoutField | SectionField;

interface FormData {
  id: string;
  title: string;
  timestamp?: string;
  responses?: Record<string, any>;
  fields?: FormField[];
  isDeleted?: boolean;
}

const FormView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormData | null>(null);

  useEffect(() => {
    const savedForms = JSON.parse(localStorage.getItem("recentForms") || "[]");
    const matchedForm = savedForms.find(
      (f: FormData) => f.id.toString() === id
    );
    setForm(matchedForm || null);
  }, [id]);

  const responses = form?.responses || {};
  const hasResponses = Object.keys(responses).length > 0;

  const formattedDate = form?.timestamp
    ? new Date(form.timestamp).toLocaleString()
    : "Unknown";

  // === Flatten all fields recursively ===

  const flattenFields = (fields: FormField[]): BaseField[] => {
    const result: BaseField[] = [];

    const process = (field: FormField) => {
      result.push({ ...field, id: String(field.id) });

      // If it's a section, process subFields recursively
      if (field.type === "section" && Array.isArray(field.subFields)) {
        field.subFields.forEach(process);
      }

      // If it's a rowLayout, process each column and their nested fields
      if (field.type === "rowLayout" && Array.isArray(field.columns)) {
        field.columns.forEach((col) => {
          col.fields?.forEach(process);
        });
      }

      // In case 'fields' exist outside of 'subFields' (just in case)
      if ("fields" in field && Array.isArray((field as any).fields)) {
        ((field as any).fields as FormField[]).forEach(process);
      }
    };

    fields.forEach(process);
    return result;
  };

  const flatFields = flattenFields(form?.fields || []);

  // === Recursively render any value ===
  const renderFieldValue = (val: any): React.ReactNode => {
    if (Array.isArray(val)) {
      return val.join(", ");
    } else if (typeof val === "object" && val !== null) {
      return (
        <ul className="pl-4 list-disc space-y-1">
          {Object.entries(val).map(([childId, childVal]) => {
            const childField = flatFields.find(
              (f) => String(f.id) === String(childId)
            );
            const label =
              childField?.label || childField?.title || `Field ${childId}`;
            return (
              <li key={childId}>
                <strong>{label}:</strong>
                <div className="ml-2">{renderFieldValue(childVal)}</div>
              </li>
            );
          })}
        </ul>
      );
    } else if (val !== undefined && val !== null) {
      return String(val);
    } else {
      return "—";
    }
  };

  return (
    <div
      className={`min-h-screen py-8 px-4 ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">{form?.title}</h2>
        <div className="flex gap-3">
          <button
            onClick={toggleTheme}
            className={`px-4 py-2 rounded border ${
              theme === "dark"
                ? "border-white text-white hover:bg-white hover:text-black"
                : "border-black text-black hover:bg-black hover:text-white"
            }`}
          >
            Switch to {theme === "dark" ? "Light" : "Dark"} Mode
          </button>
          <button
            onClick={() => navigate("/")}
            className={`px-4 py-2 rounded border ${
              theme === "dark"
                ? "border-white text-white hover:bg-white hover:text-black"
                : "border-black text-black hover:bg-black hover:text-white"
            }`}
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Download Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          className="border px-3 py-2 rounded text-blue-500 border-blue-500 hover:bg-blue-500 hover:text-white"
          onClick={() => exportAsCSV(form!.title, responses, flatFields)}
          disabled={!hasResponses}
        >
          Download CSV
        </button>
        <button
          className="border px-3 py-2 rounded text-green-500 border-green-500 hover:bg-green-500 hover:text-white"
          onClick={() => exportAsXLSX(form!.title, responses, flatFields)}
          disabled={!hasResponses}
        >
          Download XLSX
        </button>
        <button
          className="border px-3 py-2 rounded text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
          onClick={() => exportAsPDF(form!.title, responses, flatFields)}
          disabled={!hasResponses}
        >
          Download PDF
        </button>
      </div>

      {/* Submission Time */}
      <p className="mb-4">
        <strong>Submission Time:</strong> {formattedDate}
      </p>

      {/* Rendered Response */}
      <div className="mt-6">
        <h5 className="text-lg font-semibold mb-2">Submitted Data:</h5>
        <div
          className={`rounded p-4 ${
            theme === "dark" ? "bg-gray-800" : "bg-gray-100"
          }`}
        >
          {hasResponses ? (
            <ul className="space-y-3">
              {Object.entries(responses).map(([id, val]) => {
                const field = flatFields.find(
                  (f) => String(f.id) === String(id)
                );
                const label = field?.label || field?.title || `Field ${id}`;
                return (
                  <li
                    key={id}
                    className={`border rounded p-3 ${
                      theme === "dark"
                        ? "bg-gray-900 border-gray-700"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    <strong>{label}:</strong>
                    <div className="ml-2">{renderFieldValue(val)}</div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p>No responses submitted.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormView;
