import React from "react";
import FieldRenderer from "./FieldRenderer"; // Renders individual fields inside a row layout
import type { RowLayoutField } from "../types/types"; // Import specific field type
import { useTheme } from "./ThemeContext"; // Custom theme hook for light/dark mode

// Props definition for the component
interface Props {
  field: RowLayoutField; // The row layout field object
  responses: { [fieldId: string]: any }; // Collected responses keyed by field ID
  onChange: (id: string, value: any) => void; // Handler to update a field's value
  errors: { [fieldId: string]: boolean }; // Error flags per field
}

// ✅ Utility function to convert width (e.g., "1/3", "25%", or 33) into a usable percentage string
const getWidthPercentage = (width: string | number | undefined): string => {
  if (!width) return "50%"; // default width
  if (typeof width === "number") return `${width}%`;
  if (typeof width === "string" && width.includes("/")) {
    const [num, denom] = width.split("/").map(Number);
    if (!isNaN(num) && !isNaN(denom)) {
      return `${(num / denom) * 100}%`;
    }
  }
  return width; // If already a valid percentage like "33%"
};

const RowLayoutRenderer: React.FC<Props> = ({
  field,
  responses,
  onChange,
  errors,
}) => {
  const { theme } = useTheme(); // Get current theme (light or dark)

  // Guard clause: ensure it's a valid row layout with columns
  if (
    field.type !== "rowLayout" ||
    !field.columns ||
    !Array.isArray(field.columns)
  ) {
    return null;
  }

  return (
    <div
      className={`p-4 border ${
        theme === "dark"
          ? "bg-gray-800 border-gray-700"
          : "bg-white border-gray-200"
      }`}
    >
      {/* Optional section label/title */}
      {field.label && (
        <h3
          className={`text-lg font-semibold mb-3 ${
            theme === "dark" ? "text-white" : "text-gray-800"
          }`}
        >
          {field.label}
        </h3>
      )}

      {/* Row layout: loop over each column */}
      <div className="flex gap-4 w-full overflow-x-auto">
        {field.columns.map((col, colIndex) => {
          const width = getWidthPercentage(col.width); // ✅ Convert width to percentage

          return (
            <div
              key={colIndex}
              className="space-y-4"
              style={{
                flex: `0 0 ${width}`, // fixed width per column
                maxWidth: width,
                minWidth: "0px",
              }}
            >
              {/* Render all fields inside this column */}
              {(col.fields || []).map((child) => (
                <FieldRenderer
                  key={child.id}
                  field={child}
                  value={responses[child.id]}
                  onChange={(val) => onChange(child.id, val)}
                  error={errors[child.id] || false}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RowLayoutRenderer;
