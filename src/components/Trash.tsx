import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "./ThemeContext";

const Trash: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [forms, setForms] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);

  useEffect(() => {
    const allForms = JSON.parse(localStorage.getItem("recentForms") || "[]");
    setForms(allForms.filter((f: any) => f.isDeleted));

    const allTemplates = JSON.parse(localStorage.getItem("templates") || "[]");
    setTemplates(allTemplates.filter((t: any) => t.isDeleted));
  }, []);

  const restoreForm = (id: number) => {
    const all = JSON.parse(localStorage.getItem("recentForms") || "[]");
    const updated = all.map((f: any) =>
      f.id === id ? { ...f, isDeleted: false } : f
    );
    localStorage.setItem("recentForms", JSON.stringify(updated));
    setForms(updated.filter((f: any) => f.isDeleted));
  };

  const deleteFormPermanently = (id: number) => {
    const all = JSON.parse(localStorage.getItem("recentForms") || "[]");
    const updated = all.filter((f: any) => f.id !== id);
    localStorage.setItem("recentForms", JSON.stringify(updated));
    setForms(updated.filter((f: any) => f.isDeleted));
  };

  const restoreTemplate = (id: string) => {
    const all = JSON.parse(localStorage.getItem("templates") || "[]");
    const updated = all.map((t: any) =>
      t.id === id ? { ...t, isDeleted: false } : t
    );
    localStorage.setItem("templates", JSON.stringify(updated));
    setTemplates(updated.filter((t: any) => t.isDeleted));
  };

  const deleteTemplatePermanently = (id: string) => {
    const all = JSON.parse(localStorage.getItem("templates") || "[]");
    const updated = all.filter((t: any) => t.id !== id);
    localStorage.setItem("templates", JSON.stringify(updated));
    setTemplates(updated.filter((t: any) => t.isDeleted));
  };

  return (
    <div
      className={`min-h-screen py-6 px-4 ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <h2 className="text-3xl font-semibold">Trash</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={toggleTheme}
            className={`px-4 py-2 border rounded ${
              theme === "dark"
                ? "border-white text-white hover:bg-white hover:text-black"
                : "border-black text-black hover:bg-black hover:text-white"
            }`}
          >
            Switch to {theme === "dark" ? "Light" : "Dark"} Mode
          </button>
          <button
            onClick={() => navigate("/")}
            className={`px-4 py-2 border rounded ${
              theme === "dark"
                ? "border-white text-white hover:bg-white hover:text-black"
                : "border-black text-black hover:bg-black hover:text-white"
            }`}
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Deleted Templates */}
      <h4 className="text-xl font-semibold mb-4">Deleted Templates</h4>
      {templates.length === 0 ? (
        <div
          className={`p-4 rounded border ${
            theme === "dark"
              ? "bg-gray-800 text-gray-200 border-gray-700"
              : "bg-white text-gray-700 border-gray-200"
          }`}
        >
          No deleted Templates.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {templates.map((t) => (
            <div
              key={t.id}
              className={`rounded shadow p-4 h-full flex flex-col justify-between ${
                theme === "dark" ? "bg-gray-800 text-white" : "bg-white"
              }`}
            >
              <h5 className="text-lg font-medium">{t.title}</h5>
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => restoreTemplate(t.id)}
                  className="text-green-600 border border-green-600 px-3 py-1 rounded hover:bg-green-600 hover:text-white text-sm"
                >
                  Restore
                </button>
                <button
                  onClick={() => deleteTemplatePermanently(t.id)}
                  className="text-red-600 border border-red-600 px-3 py-1 rounded hover:bg-red-600 hover:text-white text-sm"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <hr className="my-8 border-gray-400" />

      {/* Deleted Forms */}
      <h4 className="text-xl font-semibold mb-4">Deleted Forms</h4>
      {forms.length === 0 ? (
        <div
          className={`p-4 rounded border ${
            theme === "dark"
              ? "bg-gray-800 text-gray-200 border-gray-700"
              : "bg-white text-gray-700 border-gray-200"
          }`}
        >
          No deleted forms.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {forms.map((form) => (
            <div
              key={form.id}
              className={`rounded shadow p-4 h-full flex flex-col justify-between ${
                theme === "dark" ? "bg-gray-800 text-white" : "bg-white"
              }`}
            >
              <h5 className="text-lg font-medium">{form.title}</h5>
              <p className="text-sm mt-2">
                Deleted on:{" "}
                {new Date(form.deletedAt || form.timestamp).toLocaleString()}
              </p>
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => restoreForm(form.id)}
                  className="text-green-600 border border-green-600 px-3 py-1 rounded hover:bg-green-600 hover:text-white text-sm"
                >
                  Restore
                </button>
                <button
                  onClick={() => deleteFormPermanently(form.id)}
                  className="text-red-600 border border-red-600 px-3 py-1 rounded hover:bg-red-600 hover:text-white text-sm"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Trash;
