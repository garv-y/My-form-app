import React, { useState } from "react";
import type { Field, FieldType, RowLayoutField } from "../types/types";
import FieldBuilder from "./FieldBuilder";
import { useTheme } from "./ThemeContext";

interface Props {
  field: RowLayoutField;
  updateField: (updated: RowLayoutField) => void;
  deleteField: (id: string) => void;
}

const FIELD_TYPES: FieldType[] = [
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
  "date",
];

const parseLayout = (layout: string): string[] => {
  return layout
    .split("+")
    .map((part) => part.trim())
    .filter((part) => part !== "");
};

const getFractionAsPercent = (fraction: string): number => {
  const [numerator, denominator] = fraction.split("/").map(Number);
  if (!numerator || !denominator) return 100;
  return (numerator / denominator) * 100;
};

const getDefaultLabel = (type: FieldType) =>
  `${type.charAt(0).toUpperCase() + type.slice(1)} Field`;

const RowLayoutBuilder: React.FC<Props> = ({
  field,
  updateField,
  deleteField,
}) => {
  const { theme } = useTheme();

  const [layoutInput, setLayoutInput] = useState(
    field.columns.map((col) => col.width ?? "1/2").join(" + ")
  );

  const [selectedFieldTypes, setSelectedFieldTypes] = useState<FieldType[]>(
    field.columns.map(() => "text")
  );

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

    setSelectedFieldTypes(widths.map(() => "text"));
  };

  const updateNestedField = (columnIndex: number, updated: Field) => {
    const updatedColumns = [...field.columns];
    updatedColumns[columnIndex].fields = updatedColumns[columnIndex].fields.map(
      (f) => (f.id === updated.id ? updated : f)
    );
    updateField({ ...field, columns: updatedColumns });
  };

  const deleteNestedField = (columnIndex: number, fieldId: string) => {
    const updatedColumns = [...field.columns];
    updatedColumns[columnIndex].fields = updatedColumns[
      columnIndex
    ].fields.filter((f) => f.id !== fieldId);
    updateField({ ...field, columns: updatedColumns });
  };

  const addFieldToColumn = (columnIndex: number) => {
    const selectedType = selectedFieldTypes[columnIndex] || "text";

    const newField: Field = {
      id: `${Date.now()}`,
      type: selectedType,
      label: getDefaultLabel(selectedType),
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
              <h4 className="text-sm font-semibold mb-2">
                Column {colIndex + 1}
              </h4>

              <div className="flex items-center gap-2 mb-2">
                <select
                  value={selectedFieldTypes[colIndex]}
                  onChange={(e) => {
                    const updated = [...selectedFieldTypes];
                    updated[colIndex] = e.target.value as FieldType;
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
