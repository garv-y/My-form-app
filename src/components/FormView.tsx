import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../components/ThemeContext";
import { exportAsCSV, exportAsXLSX, exportAsPDF } from "../utils/exportUtils";

// Define the shape of the form data
interface FormData {
  id: string;
  title: string;
  timestamp?: string;
  responses?: Record<string, any>;
  fields?: {
    id: string | number;
    label?: string;
    title?: string;
    [key: string]: any;
  }[];
  isDeleted?: boolean;
}

const FormView: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Get form ID from route
  const { theme, toggleTheme } = useTheme(); // Theme context
  const navigate = useNavigate(); // For navigation

  const [form, setForm] = useState<FormData | null>(null); // Form state

  // Load the matching form data from localStorage based on URL param `id`
  useEffect(() => {
    const savedForms = JSON.parse(localStorage.getItem("recentForms") || "[]");
    const matchedForm = savedForms.find(
      (f: FormData) => f.id.toString() === id
    );
    setForm(matchedForm || null);
  }, [id]);

  // If no form is found, show fallback UI
  if (!form) {
    return (
      <div
        className={`min-h-screen py-8 px-4 ${
          theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"
        }`}
      >
        <h3 className="text-lg font-semibold mb-4">Form not found.</h3>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Extract responses and check if there are any
  const responses = form.responses || {};
  const hasResponses = Object.keys(responses).length > 0;

  // Format timestamp if available
  let formattedDate = "Unknown";
  if (form.timestamp) {
    const parsed = new Date(form.timestamp);
    if (!isNaN(parsed.getTime())) {
      formattedDate = parsed.toLocaleString();
    }
  }

  return (
    <div
      className={`min-h-screen py-8 px-4 ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"
      }`}
    >
      {/* ==== Header with Title and Controls ==== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">{form.title}</h2>
        <div className="flex gap-3">
          {/* Theme Switch */}
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
          {/* Back to Dashboard */}
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

      {/* ==== Download Buttons ==== */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          className="border px-3 py-2 rounded text-blue-500 border-blue-500 hover:bg-blue-500 hover:text-white"
          onClick={() =>
            exportAsCSV(form.title, form.responses || {}, form.fields || [])
          }
          disabled={!hasResponses}
        >
          Download CSV
        </button>
        <button
          className="border px-3 py-2 rounded text-green-500 border-green-500 hover:bg-green-500 hover:text-white"
          onClick={() =>
            exportAsXLSX(form.title, form.responses || {}, form.fields || [])
          }
          disabled={!hasResponses}
        >
          Download XLSX
        </button>
        <button
          className="border px-3 py-2 rounded text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
          onClick={() =>
            exportAsPDF(form.title, form.responses || {}, form.fields || [])
          }
          disabled={!hasResponses}
        >
          Download PDF
        </button>
      </div>

      {/* ==== Timestamp ==== */}
      <p className="mb-4">
        <strong>Submission Time:</strong> {formattedDate}
      </p>

      {/* ==== Display Submitted Responses ==== */}
      <div className="mt-6">
        <h5 className="text-lg font-semibold mb-2">Submitted Data:</h5>
        <div
          className={`rounded p-4 ${
            theme === "dark" ? "bg-gray-800 text-white" : "bg-gray-100"
          }`}
        >
          {hasResponses ? (
            <ul className="space-y-3">
              {Object.entries(responses).map(([responseId, val]) => {
                const field = form.fields?.find(
                  (f) => String(f.id) === String(responseId)
                );
                const rawLabel =
                  field?.label || field?.title || `Field ${responseId}`;
                const label = rawLabel.replace(/^Field\s+/i, ""); // Remove default 'Field' prefix if any

                return (
                  <li
                    key={responseId}
                    className={`border rounded p-3 ${
                      theme === "dark"
                        ? "border-gray-700 bg-grary-900" // typo: bg-grary-900 should probably be bg-gray-900
                        : "bg-white border-gray-300"
                    }`}
                  >
                    <strong>{label}:</strong>{" "}
                    {Array.isArray(val) ? (
                      val.join(", ")
                    ) : typeof val === "object" && val !== null ? (
                      <pre className="whitespace-pre-wrap break-all">
                        {JSON.stringify(val, null, 2)}
                      </pre>
                    ) : (
                      val
                    )}
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
