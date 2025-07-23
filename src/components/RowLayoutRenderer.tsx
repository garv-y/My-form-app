import React from "react";
import FieldRenderer from "./FieldRenderer";
import type { RowLayoutField } from "../types/types";
import { useTheme } from "./ThemeContext";

interface Props {
  field: RowLayoutField;
  responses: { [fieldId: string]: any };
  onChange: (id: string, value: any) => void;
  errors: { [fieldId: string]: boolean };
}

// ✅ Utility function to support values like "1/3", "25%", 33, etc.
const getWidthPercentage = (width: string | number | undefined): string => {
  if (!width) return "50%";
  if (typeof width === "number") return `${width}%`;
  if (typeof width === "string" && width.includes("/")) {
    const [num, denom] = width.split("/").map(Number);
    if (!isNaN(num) && !isNaN(denom)) {
      return `${(num / denom) * 100}%`;
    }
  }
  return width; // assume it's already a valid percentage like "33%"
};

const RowLayoutRenderer: React.FC<Props> = ({
  field,
  responses,
  onChange,
  errors,
}) => {
  const { theme } = useTheme();

  if (
    field.type !== "rowLayout" ||
    !field.columns ||
    !Array.isArray(field.columns)
  ) {
    return null;
  }

  return (
    <div
      className={` p-4 border ${
        theme === "dark"
          ? "bg-gray-800 border-gray-700"
          : "bg-white border-gray-200"
      }`}
    >
      {field.label && (
        <h3
          className={`text-lg font-semibold mb-3 ${
            theme === "dark" ? "text-white" : "text-gray-800"
          }`}
        >
          {field.label}
        </h3>
      )}

      <div className="flex gap-4 w-full overflow-x-auto">
        {field.columns.map((col, colIndex) => {
          const width = getWidthPercentage(col.width); // ✅ use helper here

          return (
            <div
              key={colIndex}
              className="space-y-4"
              style={{
                flex: `0 0 ${width}`,
                maxWidth: width,
                minWidth: "0px",
              }}
            >
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
