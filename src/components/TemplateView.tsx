import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeContext";
import { exportAsCSV, exportAsXLSX, exportAsPDF } from "../utils/exportUtils";
import { saveAs } from "file-saver";

// Define the structure of a submitted template
interface SubmittedTemplate {
  id: string;
  title: string;
  submittedAt: string;
  responses: Record<string, string | string[]>;
  fields: { id: string; label?: string; title?: string }[];
}

const TemplateView: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Get template ID from URL
  const navigate = useNavigate(); // Navigate programmatically
  const { theme } = useTheme(); // Access theme context

  const [form, setForm] = useState<SubmittedTemplate | null>(null); // Store the matched submitted template

  // Fetch the template from localStorage based on ID
  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem("submittedTemplates") || "[]"
    );
    const match = saved.find((f: SubmittedTemplate) => f.id === id);
    setForm(match || null);
  }, [id]);

  // Theme-specific classes
  const isDark = theme === "dark";
  const baseBg = isDark ? "bg-gray-900 text-white" : "bg-white text-black";
  const panelBg = isDark ? "bg-gray-800 text-white" : "bg-gray-100 text-black";
  const btnStyle = isDark
    ? "border border-white text-white hover:bg-white hover:text-black"
    : "border border-black text-black hover:bg-black hover:text-white";

  // Download template as JSON
  const handleJSONDownload = () => {
    if (!form) return;
    const blob = new Blob([JSON.stringify(form, null, 2)], {
      type: "application/json",
    });
    saveAs(blob, `${form.title}.json`);
  };

  // If template is not found, show fallback UI
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
      {/* ✅ Title and Download Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-semibold">{form.title}</h2>

        {/* 📥 Export Buttons */}
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

      {/* 🕓 Submission Time */}
      <p className="mb-4">
        <span className="font-semibold">Submission Time:</span>{" "}
        {form.submittedAt
          ? new Date(form.submittedAt).toLocaleString()
          : "Unknown"}
      </p>

      {/* 📄 Submitted Data Display */}
      <div>
        <h5 className="text-lg font-medium mb-2">Submitted Data:</h5>
        <div
          className={`p-4 rounded-md ${panelBg}`}
          style={{ whiteSpace: "pre-wrap" }}
        >
          {/* 🔁 Loop over submitted responses */}
          {Object.entries(form.responses).map(([id, value]) => {
            // Find the matching field label
            const field = form.fields.find((f) => String(f.id) === String(id));
            const label = field?.label || field?.title || `Field ${id}`;
            return (
              <div key={id} className="mb-3">
                <span className="font-semibold">{label}:</span>{" "}
                {Array.isArray(value) ? value.join(", ") : value}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TemplateView;
