import React, { useState } from "react";
import type { Field } from "../types/types";
import { useTheme } from "./ThemeContext";

interface FABProps {
  mode: "add" | "toggle";
  onAddField?: (type: Field["type"]) => void;
  onClick?: () => void;
}

const fieldTypes: Field["type"][] = [
  "header",
  "label",
  "paragraph",
  "linebreak",
  "text",
  "number",
  "date",
  "dropdown",
  "checkboxes",
  "multipleChoice",
  "tags",
  "rowLayout",
];

const FAB: React.FC<FABProps> = ({ mode, onAddField, onClick }) => {
  const [open, setOpen] = useState(false);
  const { theme } = useTheme();

  const fabBaseStyle = "fixed bottom-5 right-5 z-[1050]";

  if (mode === "toggle") {
    return (
      <button
        className={`${fabBaseStyle} w-14 h-14 rounded-full bg-green-500 text-white hover:bg-green-600 shadow-lg transition`}
        onClick={onClick}
        title="Open Toolbox"
      >
        +
      </button>
    );
  }

  return (
    <div className={fabBaseStyle}>
      {open && (
        <div
          className={`absolute bottom-3 right-0 min-w-[220px] max-h-[92vh] p-3 rounded-lg shadow-lg transition-all duration-200 transform scale-100 ${
            theme === "dark"
              ? "bg-gray-800 text-white"
              : "bg-white text-gray-800"
          }`}
        >
          {/* Close button */}
          <button
            className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 font-bold text-lg flex items-center justify-center shadow"
            onClick={() => setOpen(false)}
          >
            ×
          </button>

          <h6 className="mb-3 font-semibold text-sm uppercase">Add Field</h6>

          {fieldTypes.map((type) => (
            <button
              key={type}
              className="w-full h-10 mb-2 px-3 py-2 text-left text-sm border border-blue-500 rounded hover:bg-blue-50 dark:hover:bg-gray-700"
              onClick={() => {
                onAddField?.(type);
                setOpen(false);
              }}
            >
              + {type}
            </button>
          ))}
        </div>
      )}

      {!open && (
        <button
          className="w-14 h-14 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-lg transition"
          onClick={() => setOpen(true)}
          title="Add Field"
        >
          +
        </button>
      )}
    </div>
  );
};

export default FAB;
