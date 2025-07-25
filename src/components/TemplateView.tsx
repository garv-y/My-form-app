import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeContext";
import { exportAsCSV, exportAsXLSX, exportAsPDF } from "../utils/exportUtils";
import { saveAs } from "file-saver";

// Types
interface BaseField {
  id: string;
  label?: string;
  title?: string;
  type: string;
}

interface RowLayoutField extends BaseField {
  type: "rowLayout";
  columns: { width?: string | number; fields?: SubmittedField[] }[];
}

interface SectionField extends BaseField {
  type: "section";
  subFields?: SubmittedField[];
}

type SubmittedField = BaseField | RowLayoutField | SectionField;

interface SubmittedTemplate {
  id: string;
  title: string;
  submittedAt: string;
  responses: Record<string, string | string[]>;
  fields: SubmittedField[];
}

const TemplateView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [form, setForm] = useState<SubmittedTemplate | null>(null);

  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem("submittedTemplates") || "[]"
    );
    const match = saved.find((f: SubmittedTemplate) => f.id === id);
    setForm(match || null);
  }, [id]);

  const isDark = theme === "dark";
  const baseBg = isDark ? "bg-gray-900 text-white" : "bg-white text-black";
  const panelBg = isDark ? "bg-gray-800 text-white" : "bg-gray-100 text-black";
  const btnStyle = isDark
    ? "border border-white text-white hover:bg-white hover:text-black"
    : "border border-black text-black hover:bg-black hover:text-white";

  const handleJSONDownload = () => {
    if (!form) return;
    const blob = new Blob([JSON.stringify(form, null, 2)], {
      type: "application/json",
    });
    saveAs(blob, `${form.title}.json`);
  };

  const isSection = (field: SubmittedField): field is SectionField =>
    field.type === "section";

  const isRowLayout = (field: SubmittedField): field is RowLayoutField =>
    field.type === "rowLayout";

  const renderFields = (fields: SubmittedField[]): React.ReactNode => {
    return fields.map((field) => {
      const label = field.label || field.title || `Field ${field.id}`;
      const value = form?.responses[field.id];

      if (isSection(field)) {
        return (
          <div key={field.id} className="mb-4">
            <h4 className="font-semibold mb-2">{label}</h4>
            <div className="ml-4">
              {field.subFields && field.subFields.length > 0
                ? renderFields(field.subFields)
                : "No data"}
            </div>
          </div>
        );
      }

      if (isRowLayout(field)) {
        return (
          <div key={field.id} className="mb-4">
            <h4 className="font-semibold mb-2">{label}</h4>
            <div className="ml-4">
              {field.columns.map((col, colIndex) => (
                <div key={colIndex} className="mb-2">
                  {col.fields ? renderFields(col.fields) : null}
                </div>
              ))}
            </div>
          </div>
        );
      }

      return (
        <div key={field.id} className="mb-2">
          <span className="font-medium">{label}:</span>{" "}
          {Array.isArray(value) ? value.join(", ") : value || "—"}
        </div>
      );
    });
  };

  if (!form) {
    return (
      <div className={`min-h-screen py-10 px-6 ${baseBg}`}>
        <h3 className="text-xl font-semibold mb-4">Template not found</h3>
        <button
          onClick={() => navigate("/")}
          className={`px-4 py-2 rounded ${btnStyle}`}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-28 px-6 py-10 ${baseBg}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-semibold">{form.title}</h2>
        <div className="flex flex-wrap gap-2">
          <button
            className="border px-3 py-2 rounded text-blue-600 border-blue-600 hover:bg-blue-100"
            onClick={() =>
              exportAsCSV(form.title, [form.responses], form.fields)
            }
          >
            Download CSV
          </button>
          <button
            className="border px-3 py-2 rounded text-green-600 border-green-600 hover:bg-green-100"
            onClick={() =>
              exportAsXLSX(form.title, [form.responses], form.fields)
            }
          >
            Download XLSX
          </button>
          <button
            className="border px-3 py-2 rounded text-red-600 border-red-600 hover:bg-red-100"
            onClick={() =>
              exportAsPDF(form.title, [form.responses], form.fields)
            }
          >
            Download PDF
          </button>
          <button
            onClick={handleJSONDownload}
            className={`px-3 py-2 rounded ${btnStyle}`}
          >
            Download JSON
          </button>
        </div>
      </div>

      <p className="mb-4">
        <span className="font-semibold">Submission Time:</span>{" "}
        {form.submittedAt
          ? new Date(form.submittedAt).toLocaleString()
          : "Unknown"}
      </p>

      <div>
        <h5 className="text-lg font-medium mb-2">Submitted Data:</h5>
        <div
          className={`p-4 rounded-md ${panelBg}`}
          style={{ whiteSpace: "pre-wrap" }}
        >
          {renderFields(form.fields)}
        </div>
      </div>
    </div>
  );
};

export default TemplateView;
