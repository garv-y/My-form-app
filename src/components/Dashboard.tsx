import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "./ThemeContext";
import RecentFormCard from "./RecentFormCard";

// Interfaces for type safety
interface RecentForm {
  id: number;
  title: string;
  timestamp: string;
  isDeleted?: boolean;
}

interface SavedTemplate {
  id: string;
  title: string;
  fields: any[];
  isDeleted?: boolean;
}

interface SubmittedTemplate {
  id: string;
  title: string;
  submittedAt: string;
  responses: Record<string, string | string[]>;
  fields: any[];
  isDeleted?: boolean;
}

const Dashboard: React.FC = () => {
  const { theme, toggleTheme } = useTheme(); // Light/Dark mode toggle

  // State to store forms/templates/submissions
  const [recentForms, setRecentForms] = useState<RecentForm[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [submittedTemplates, setSubmittedTemplates] = useState<
    SubmittedTemplate[]
  >([]);

  // Load data from localStorage on initial mount
  useEffect(() => {
    const forms = (
      JSON.parse(localStorage.getItem("recentForms") || "[]") as any[]
    ).map((f) => ({ ...f, id: Number(f.id) }));
    setRecentForms(forms.filter((f) => !f.isDeleted));

    const templates = JSON.parse(localStorage.getItem("templates") || "[]");
    setSavedTemplates(templates.filter((t: SavedTemplate) => !t.isDeleted));

    const submissions = JSON.parse(
      localStorage.getItem("submittedTemplates") || "[]"
    );
    setSubmittedTemplates(
      submissions.filter((s: SubmittedTemplate) => !s.isDeleted)
    );
  }, []);

  // Soft-delete a recent form (mark as deleted in localStorage)
  const softDeleteForm = (id: number) => {
    const forms = (
      JSON.parse(localStorage.getItem("recentForms") || "[]") as any[]
    ).map((f) => ({ ...f, id: Number(f.id) }));
    const updated = forms.map((f) =>
      f.id === id ? { ...f, isDeleted: true, deletedAt: Date.now() } : f
    );
    localStorage.setItem("recentForms", JSON.stringify(updated));
    setRecentForms(updated.filter((f) => !f.isDeleted));
  };

  // Soft-delete a saved template
  const softDeleteTemplate = (id: string) => {
    const templates = JSON.parse(localStorage.getItem("templates") || "[]");
    const updated = templates.map((t: SavedTemplate) =>
      t.id === id ? { ...t, isDeleted: true, deletedAt: Date.now() } : t
    );
    localStorage.setItem("templates", JSON.stringify(updated));
    setSavedTemplates(updated.filter((t: SavedTemplate) => !t.isDeleted));
  };

  // Soft-delete a submitted form
  const softDeleteSubmission = (id: string) => {
    const submissions = JSON.parse(
      localStorage.getItem("submittedTemplates") || "[]"
    );
    const updated = submissions.map((s: SubmittedTemplate) =>
      s.id === id ? { ...s, isDeleted: true, deletedAt: Date.now() } : s
    );
    localStorage.setItem("submittedTemplates", JSON.stringify(updated));
    setSubmittedTemplates(
      updated.filter((s: SubmittedTemplate) => !s.isDeleted)
    );
  };

  // Preset default templates shown at the top
  const defaultTemplates = [
    { id: "feedback", name: "Feedback Form" },
    { id: "registration", name: "Registration Form" },
    { id: "survey", name: "Survey Form" },
  ];

  return (
    <div
      className={`pb-4 min-h-screen ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      {/* Top Navigation Bar */}
      <nav
        className={`flex justify-between items-center px-4 py-3 shadow ${
          theme === "dark" ? "bg-gray-800" : "bg-white"
        }`}
      >
        <span className="text-2xl p-3 font-bold">Forms Dashboard</span>
        <div className="flex gap-2">
          {/* Link to form builder */}
          <Link to="/form-builder">
            <button className="border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white px-3 py-1 rounded">
              + Blank Form
            </button>
          </Link>

          {/* Theme toggle button */}
          <button
            className={`border px-3 py-1 rounded ${
              theme === "light"
                ? "border-black text-black hover:bg-gray-800 hover:text-white"
                : "border-white text-white hover:bg-white hover:text-black"
            }`}
            onClick={toggleTheme}
          >
            Switch to {theme === "light" ? "Dark" : "Light"} Mode
          </button>

          {/* Link to trash */}
          <Link to="/trash">
            <button className="border border-red-500 text-red-500 hover:bg-red-500 hover:text-white px-3 py-1 rounded">
              View Trash
            </button>
          </Link>
        </div>
      </nav>

      {/* Template Cards */}
      <h4 className="text-lg font-semibold mt-3 p-6">Start with a Template</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 p-4 gap-4 px-4">
        {defaultTemplates.map((template) => (
          <div
            key={template.id}
            className={`rounded shadow p-4 ${
              theme === "dark"
                ? "bg-gray-800 text-white"
                : "bg-white text-black"
            }`}
          >
            <h5 className="text-lg font-bold mb-2">{template.name}</h5>
            <p className="mb-4">
              {template.name === "Feedback Form" &&
                "We’d love to hear your thoughts!"}
              {template.name === "Registration Form" &&
                "Tell us about yourself to get started!"}
              {template.name === "Survey Form" &&
                "Share your experience to help us get better!"}
            </p>
            <Link to={`/template/${template.id}`}>
              <button className="text-blue-500 border border-blue-500 px-3 py-1 text-sm rounded hover:bg-blue-500 hover:text-white">
                Use Template
              </button>
            </Link>
          </div>
        ))}
      </div>

      {/* Saved Templates Section */}
      {savedTemplates.length > 0 && (
        <>
          <h4 className="text-lg font-semibold mt-10 mb-4 px-4">
            Your Saved Templates
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4">
            {savedTemplates.map((template) => (
              <div
                key={template.id}
                className={`rounded shadow p-4 flex flex-col justify-between ${
                  theme === "dark"
                    ? "bg-gray-800 text-white"
                    : "bg-white text-black"
                }`}
              >
                <div>
                  <h5 className="font-bold text-lg">{template.title}</h5>
                  <p className="text-sm">Custom template you created.</p>
                </div>
                <div className="flex justify-between mt-4">
                  <Link to={`/template/${template.id}`}>
                    <button className="text-blue-500 border border-blue-500 px-3 py-1 text-sm rounded hover:bg-blue-500 hover:text-white">
                      Use
                    </button>
                  </Link>
                  <button
                    className="text-red-500 border border-red-500 px-3 py-1 text-sm rounded hover:bg-red-500 hover:text-white"
                    onClick={() => softDeleteTemplate(template.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Submitted Templates Section */}
      {submittedTemplates.length > 0 && (
        <>
          <h4 className="text-lg font-semibold mt-10 mb-4 px-4">
            Submitted Templates
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4">
            {submittedTemplates.map((submission) => (
              <div
                key={submission.id}
                className={`rounded shadow p-4 flex flex-col justify-between ${
                  theme === "dark"
                    ? "bg-gray-800 text-white"
                    : "bg-white text-black"
                }`}
              >
                <div>
                  <h5 className="font-bold text-lg">{submission.title}</h5>
                  <p className="text-sm">
                    Submitted at:{" "}
                    {new Date(submission.submittedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex justify-between mt-4">
                  <Link to={`/submission/${submission.id}`}>
                    <button className="text-blue-500 border border-blue-500 px-3 py-1 text-sm rounded hover:bg-blue-500 hover:text-white">
                      View
                    </button>
                  </Link>
                  <button
                    className="text-red-500 border border-red-500 px-3 py-1 text-sm rounded hover:bg-red-500 hover:text-white"
                    onClick={() => softDeleteSubmission(submission.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Recent Forms Section */}
      <hr className="my-10 border-gray-400" />
      <h4 className="text-lg font-semibold px-6 py-2">Recent Forms</h4>
      {recentForms.length === 0 ? (
        <div
          className={`m-5 p-4 rounded ${
            theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"
          }`}
        >
          No recent forms yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-4">
          {recentForms.map((form) => {
            const submission = submittedTemplates.find(
              (s) => s.id === String(form.id)
            );
            return (
              <RecentFormCard
                key={form.id}
                form={{
                  id: form.id,
                  title: form.title,
                  timestamp: form.timestamp,
                  data: submission?.responses || {},
                  fields: submission?.fields || [],
                }}
                onDelete={softDeleteForm}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
