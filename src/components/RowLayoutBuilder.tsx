import React, { useState } from "react";
import type { Field, RowLayoutField } from "../types/types";
import FieldBuilder from "./FieldBuilder";
import { useTheme } from "./ThemeContext";

interface Props {
  field: RowLayoutField;
  updateField: (updated: Field) => void;
  deleteField: (id: string) => void;
}

// Define allowed field types that can be added in columns
const FIELD_TYPES = [
  "text",
  "number",
  "dropdown",
  "checkboxes",
  "multipleChoice",
  "label",
  "header",
  "paragraph",
  "linebreak",
  "tags",
];

// Helper function to parse layout string like "1/2 + 1/2" into array
const parseLayout = (layout: string): string[] => {
  return layout
    .split("+")
    .map((part) => part.trim())
    .filter((part) => part !== "");
};

// Convert fraction like "1/2" to percentage (e.g. 50)
const getFractionAsPercent = (fraction: string): number => {
  const [numerator, denominator] = fraction.split("/").map(Number);
  if (!numerator || !denominator) return 100;
  return (numerator / denominator) * 100;
};

const RowLayoutBuilder: React.FC<Props> = ({
  field,
  updateField,
  deleteField,
}) => {
  const { theme } = useTheme();

  // Layout input value for the layout string ("1/2 + 1/2")
  const [layoutInput, setLayoutInput] = useState(
    field.columns.map((col) => col.width ?? "1/2").join(" + ")
  );

  // Store selected field types for each column before adding
  const [selectedFieldTypes, setSelectedFieldTypes] = useState<string[]>(
    field.columns.map(() => "text")
  );

  // Apply layout changes from the layoutInput
  const handleUpdateLayout = () => {
    const widths = parseLayout(layoutInput);
    if (widths.length === 0) return;

    const newColumns = widths.map((width, idx) => ({
      width,
      fields: field.columns[idx]?.fields ?? [],
    }));

    updateField({
      ...field,
      columns: newColumns,
    });

    // Reset field types after layout change
    setSelectedFieldTypes(widths.map(() => "text"));
  };

  // Update a field inside a specific column
  const updateNestedField = (columnIndex: number, updated: Field) => {
    const updatedColumns = [...field.columns];
    updatedColumns[columnIndex].fields = updatedColumns[columnIndex].fields.map(
      (f) => (f.id === updated.id ? updated : f)
    );
    updateField({ ...field, columns: updatedColumns });
  };

  // Delete a field from a column
  const deleteNestedField = (columnIndex: number, fieldId: string) => {
    const updatedColumns = [...field.columns];
    updatedColumns[columnIndex].fields = updatedColumns[
      columnIndex
    ].fields.filter((f) => f.id !== fieldId);
    updateField({ ...field, columns: updatedColumns });
  };

  // Add new field to a column
  const addFieldToColumn = (columnIndex: number) => {
    const selectedType = selectedFieldTypes[columnIndex] || "text";

    const newField: Field = {
      id: `${Date.now()}`,
      type: selectedType as Field["type"],
      label:
        selectedType.charAt(0).toUpperCase() + selectedType.slice(1) + " Field",
      options:
        selectedType === "dropdown" ||
        selectedType === "multipleChoice" ||
        selectedType === "checkboxes"
          ? [
              { label: "Option 1", value: "option1" },
              { label: "Option 2", value: "option2" },
            ]
          : undefined,
    };

    const updatedColumns = [...field.columns];
    updatedColumns[columnIndex].fields.push(newField);
    updateField({ ...field, columns: updatedColumns });
  };

  return (
    <div
      className={`mb-6 p-4 border rounded ${
        theme === "dark"
          ? "bg-gray-800 text-white border-gray-700"
          : "bg-white text-gray-800 border-gray-300"
      }`}
    >
      {/* Input for Layout String */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Layout (e.g., 1/2 + 1/2):
        </label>
        <input
          type="text"
          value={layoutInput}
          onChange={(e) => setLayoutInput(e.target.value)}
          className={`w-full p-2 border rounded ${
            theme === "dark"
              ? "bg-gray-800 text-white border-gray-700"
              : "bg-white text-gray-800 border-gray-300"
          }`}
        />
        <button
          onClick={handleUpdateLayout}
          className="mt-2 px-4 py-1 bg-blue-600 text-white rounded"
        >
          Apply Layout
        </button>
      </div>

      {/* Render Columns Horizontally */}
      <div className="flex gap-2 w-full overflow-x-auto">
        {field.columns.map((column, colIndex) => {
          const widthPercent = getFractionAsPercent(column.width ?? "1/2");

          return (
            <div
              key={colIndex}
              className="p-2 rounded-md border shrink-0"
              style={{
                flex: `0 0 ${widthPercent}%`,
                maxWidth: `${widthPercent}%`,
                minWidth: "0px",
                backgroundColor: theme === "dark" ? "#1e1e1e" : "#fff",
                color: theme === "dark" ? "#fff" : "#000",
                borderColor: theme === "dark" ? "#444" : "#ccc",
              }}
            >
              {/* Column Title */}
              <h4 className="text-sm font-semibold mb-2">
                Column {colIndex + 1}
              </h4>

              {/* Field Type Selector + Add Button */}
              <div className="flex items-center gap-2 mb-2">
                <select
                  value={selectedFieldTypes[colIndex]}
                  onChange={(e) => {
                    const updated = [...selectedFieldTypes];
                    updated[colIndex] = e.target.value;
                    setSelectedFieldTypes(updated);
                  }}
                  className="px-2 py-1 border rounded text-sm"
                >
                  {FIELD_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => addFieldToColumn(colIndex)}
                  className="px-3 py-1 bg-green-600 text-white rounded text-xs"
                >
                  + Add Field
                </button>
              </div>

              {/* Render Fields in Each Column */}
              <div className="space-y-3">
                {column.fields.map((f) => (
                  <FieldBuilder
                    key={f.id}
                    field={f}
                    updateField={(updated) =>
                      updateNestedField(colIndex, updated)
                    }
                    deleteField={(id) => deleteNestedField(colIndex, id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete the Entire Section */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => deleteField(field.id)}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Delete Section
        </button>
      </div>
    </div>
  );
};

export default RowLayoutBuilder;
