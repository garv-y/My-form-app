import React from "react";
import type { Field, RowLayoutField } from "../types/types";
import { useTheme } from "./ThemeContext";

// Props for the FieldBuilder component
interface Props {
  field: Field; // Current field data
  updateField: (updated: Field) => void; // Callback to update field
  deleteField: (id: string) => void; // Callback to delete field by ID
}

// FieldBuilder is responsible for editing field configuration
const FieldBuilder: React.FC<Props> = ({ field, updateField, deleteField }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Common input styles based on theme
  const inputClass = `w-full px-3 py-2 rounded border focus:outline-none ${
    isDark
      ? "bg-gray-800 text-white border-gray-600"
      : "bg-white text-black border-gray-300"
  }`;

  // Handle label input changes
  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    updateField({ ...field, label: e.target.value });

  // Toggle required field
  const handleRequiredChange = () =>
    updateField({ ...field, required: !field.required });

  // Update option label/value by index
  const handleOptionChange = (index: number, value: string) => {
    const options = [...(field.options || [])];
    options[index] = { label: value, value };
    updateField({ ...field, options });
  };

  // Add a new option
  const addOption = () =>
    updateField({
      ...field,
      options: [...(field.options || []), { label: "Option", value: "Option" }],
    });

  // Delete an option by index
  const deleteOption = (index: number) => {
    const options = field.options?.filter((_, i) => i !== index);
    updateField({ ...field, options });
  };

  // === SPECIAL CASE: ROW LAYOUT FIELD ===
  if (field.type === "rowLayout") {
    const rowField = field as RowLayoutField;

    // Update a column's width
    const handleColumnChange = (index: number, width: string) => {
      const newLayout = [...rowField.layout];
      newLayout[index] = width;
      updateField({ ...rowField, layout: newLayout });
    };

    // Add a new column
    const addColumn = () => {
      const newLayout = [...rowField.layout, "1/2"];
      const newColumns = [...rowField.columns, { fields: [] }];
      updateField({ ...rowField, layout: newLayout, columns: newColumns });
    };

    // Remove a column
    const removeColumn = (index: number) => {
      const newLayout = rowField.layout.filter((_, i) => i !== index);
      const newColumns = rowField.columns.filter((_, i) => i !== index);
      updateField({ ...rowField, layout: newLayout, columns: newColumns });
    };

    // Add new nested field inside a column
    const addFieldToColumn = (columnIndex: number) => {
      const newField: Field = {
        id: Date.now().toString(),
        type: "text",
        label: "New Field",
        required: false,
        displayOnShortForm: false,
      };

      const newColumns = [...rowField.columns];
      newColumns[columnIndex].fields = [
        ...newColumns[columnIndex].fields,
        newField,
      ];

      updateField({ ...rowField, columns: newColumns });
    };

    // Update a nested field inside a column
    const updateNestedField = (columnIndex: number, updatedField: Field) => {
      const newColumns = [...rowField.columns];
      const fieldIndex = newColumns[columnIndex].fields.findIndex(
        (f) => f.id === updatedField.id
      );
      newColumns[columnIndex].fields[fieldIndex] = updatedField;
      updateField({ ...rowField, columns: newColumns });
    };

    // Delete a nested field inside a column
    const deleteNestedField = (columnIndex: number, fieldId: string) => {
      const newColumns = [...rowField.columns];
      newColumns[columnIndex].fields = newColumns[columnIndex].fields.filter(
        (f) => f.id !== fieldId
      );
      updateField({ ...rowField, columns: newColumns });
    };

    // === RENDER ROW LAYOUT FIELD ===
    return (
      <div
        className={`rounded-lg p-4 mb-4 shadow-md ${
          isDark
            ? "bg-gray-900 text-white border border-gray-700"
            : "bg-white text-black border border-gray-200"
        }`}
      >
        <h3 className="font-semibold mb-3">Row Layout Configuration</h3>

        <p className="text-sm mb-4">
          Number of columns: {rowField.layout.length}
        </p>

        {rowField.layout.map((col, idx) => (
          <div key={idx} className="mb-4">
            {/* Column width input */}
            <div className="flex items-center gap-2 mb-1">
              <input
                className={inputClass}
                value={col}
                onChange={(e) => handleColumnChange(idx, e.target.value)}
                placeholder="e.g. 1/2 or 50%"
              />
              <button
                type="button"
                className="text-red-600 border border-red-600 rounded px-2 py-1 text-sm hover:bg-red-600 hover:text-white transition"
                onClick={() => removeColumn(idx)}
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-2">
              Use fraction (e.g. 1/2, 1/3) or percentage (e.g. 50%)
            </p>

            {/* Nested field list inside column */}
            <div
              className={`border rounded-lg p-4 space-y-3 ${
                isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-gray-50 border-gray-300"
              }`}
              style={{ width: "100%", minHeight: "50px" }}
            >
              {rowField.columns[idx].fields.map((nestedField) => (
                <FieldBuilder
                  key={nestedField.id}
                  field={{
                    ...nestedField,
                    options:
                      [
                        "tags",
                        "checkbox",
                        "radio",
                        "checkboxes",
                        "multipleChoice",
                        "dropdown",
                      ].includes(nestedField.type) &&
                      !nestedField.options?.length
                        ? [{ label: "Option 1", value: "Option 1" }]
                        : nestedField.options,
                  }}
                  updateField={(updated) => updateNestedField(idx, updated)}
                  deleteField={(id) => deleteNestedField(idx, id)}
                />
              ))}
              <button
                type="button"
                className="mt-2 text-blue-600 text-sm border border-blue-600 rounded px-2 py-1 hover:bg-blue-600 hover:text-white transition"
                onClick={() => addFieldToColumn(idx)}
              >
                + Add Field to Column {idx + 1}
              </button>
            </div>
          </div>
        ))}

        {/* Row layout controls */}
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            className="px-3 py-1 text-blue-600 border border-blue-600 rounded text-sm hover:bg-blue-600 hover:text-white transition"
            onClick={addColumn}
          >
            + Add Column
          </button>

          <button
            type="button"
            className="px-3 py-1 text-red-600 border border-red-600 rounded text-sm hover:bg-red-600 hover:text-white transition"
            onClick={() => deleteField(field.id)}
          >
            Delete Row Layout
          </button>
        </div>
      </div>
    );
  }

  // === RENDER STANDARD FIELDS ===
  return (
    <div
      className={`rounded-lg p-4 mb-4 shadow-md ${
        isDark
          ? "bg-gray-900 text-white border border-gray-700"
          : "bg-white text-black border border-gray-200"
      }`}
    >
      {/* Label input */}
      <label className="block mb-2 font-medium">Field Label</label>
      <input
        className={`${inputClass} mb-3`}
        value={field.label}
        onChange={handleLabelChange}
        placeholder="Enter field label"
      />

      {/* Required + Short Form checkboxes */}
      <div className="flex flex-col gap-2 mb-3">
        <label
          htmlFor={`required-${field.id}`}
          className="flex items-center gap-2 text-left"
        >
          <input
            type="checkbox"
            className="accent-blue-500"
            checked={field.required}
            onChange={handleRequiredChange}
            id={`required-${field.id}`}
          />
          <span>Required</span>
        </label>

        <label
          htmlFor={`shortform-${field.id}`}
          className="flex items-center gap-2 text-left"
        >
          <input
            type="checkbox"
            className="accent-blue-500"
            checked={field.displayOnShortForm ?? false}
            onChange={() =>
              updateField({
                ...field,
                displayOnShortForm: !field.displayOnShortForm,
              })
            }
            id={`shortform-${field.id}`}
          />
          <span>Show in Short Form</span>
        </label>
      </div>

      {/* Render options editor for multi-choice field types */}
      {[
        "tags",
        "checkbox",
        "radio",
        "checkboxes",
        "multipleChoice",
        "dropdown",
      ].includes(field.type) && (
        <div className="mb-4">
          <label className="block mb-2 font-medium">Options</label>
          {(field.options ?? []).map((opt, i) => (
            <div key={i} className="flex items-center gap-2 mb-2 w-full">
              <input
                className={inputClass}
                value={opt.label}
                onChange={(e) => handleOptionChange(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
              />
              <button
                type="button"
                className="text-red-600 border border-red-600 rounded px-2 py-1 text-sm hover:bg-red-600 hover:text-white transition"
                onClick={() => deleteOption(i)}
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            className="mt-2 px-3 py-1 text-blue-600 border border-blue-600 rounded text-sm hover:bg-blue-600 hover:text-white transition"
            onClick={addOption}
          >
            + Add Option
          </button>
        </div>
      )}

      {/* Delete entire field */}
      <button
        type="button"
        className="mt-4 px-3 py-1 text-red-600 border border-red-600 rounded text-sm hover:bg-red-600 hover:text-white transition"
        onClick={() => deleteField(field.id)}
      >
        Delete Field
      </button>
    </div>
  );
};

export default FieldBuilder;
