import React, { useState } from "react";
import type { Field } from "../types/types";
import { useTheme } from "./ThemeContext";

// Props interface for the Floating Action Button (FAB)
interface FABProps {
  mode: "add" | "toggle"; // 'add' shows field buttons, 'toggle' is just a '+' button
  onAddField?: (type: Field["type"]) => void; // Callback when a field type is selected
  onClick?: () => void; // Callback for toggle mode click
}

// List of all available field types for the form builder
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
  "section",
];

// Main FAB component
const FAB: React.FC<FABProps> = ({ mode, onAddField, onClick }) => {
  const [open, setOpen] = useState(false); // Controls if the add menu is open
  const { theme } = useTheme(); // Current theme (light/dark)

  const fabBaseStyle = "fixed bottom-5 right-5 z-[1050]"; // Common styles for FAB position

  // Mode: Only '+' button used for toggling toolbox
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

  // Mode: Show field add options in a floating popup
  return (
    <div className={fabBaseStyle}>
      {/* If menu is open, show the field list */}
      {open && (
        <div
          className={`absolute bottom-3 right-0 min-w-[220px] max-h-[92vh] p-3 rounded-lg shadow-lg transition-all duration-200 transform scale-100 overflow-auto ${
            theme === "dark"
              ? "bg-gray-800 text-white"
              : "bg-white text-gray-800"
          }`}
        >
          {/* Close (×) button */}
          <button
            className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 font-bold text-lg flex items-center justify-center shadow"
            onClick={() => setOpen(false)}
          >
            ×
          </button>

          {/* Header label */}
          <h6 className="mb-3 font-semibold text-sm uppercase">Add Field</h6>

          {/* Field buttons list */}
          {fieldTypes.map((type) => (
            <button
              key={type}
              className={`w-full h-10 mb-2 px-3 py-2 text-left text-sm border${
                theme === "light"
                  ? " rounded text-blue-500 hover:bg-blue-500 hover:text-white"
                  : " rounded text-white hover:bg-gray-700 hover:text-white"
              }`}
              onClick={() => {
                onAddField?.(type); // Notify parent to add selected field
                setOpen(false); // Close popup after selection
              }}
            >
              + {type}
            </button>
          ))}
        </div>
      )}

      {/* Main floating '+' button to open field menu */}
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
