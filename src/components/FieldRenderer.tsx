import React from "react";
import type { FieldConfig, RowLayoutField, SectionField } from "../types/types";
import { useTheme } from "./ThemeContext";
import RowLayoutRenderer from "./RowLayoutRenderer";

interface FieldRendererProps {
  field: FieldConfig;
  value?: string | string[] | Record<string, any>;
  onChange?: (value: string | string[] | Record<string, any>) => void;
  error?:
    | boolean
    | Record<string, boolean>
    | Record<string, Record<string, boolean>>;
  updateField?: (updated: FieldConfig) => void;
  deleteField?: (id: string) => void;
}

const Renderer: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  error = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const textColor = isDark ? "text-white" : "text-black";

  const label =
    field?.label !== undefined && field?.label !== null
      ? field.label
      : field?.title ?? `Field ${field.id}`;

  const renderError = () =>
    error &&
    typeof error === "boolean" && (
      <small className="text-red-500 text-sm block mt-1">
        This field is required.
      </small>
    );

  const baseInputClass = `px-3 py-2 rounded border ${
    error ? "border-red-500" : "border-gray-300"
  } ${isDark ? "bg-gray-800 text-white" : "bg-white text-black"}`;

  switch (field.type) {
    case "header":
      return (
        <div className="mb-4">
          <h4
            className={`mb-2 font-semibold text-xl ${textColor}`}
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onChange?.(e.currentTarget.textContent || "")}
          >
            {(typeof value === "string" && value) || label}
          </h4>
          {renderError()}
        </div>
      );

    case "label":
      return (
        <div className="mb-4">
          <label
            className={`font-semibold block mb-1 ${textColor}`}
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onChange?.(e.currentTarget.textContent || "")}
          >
            {(typeof value === "string" && value) || label}
          </label>
          {renderError()}
        </div>
      );

    case "paragraph":
      return (
        <div className="mb-4">
          <p
            className={`mb-2 ${textColor}`}
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onChange?.(e.currentTarget.textContent || "")}
          >
            {(typeof value === "string" && value) || label}
          </p>
          {renderError()}
        </div>
      );

    case "linebreak":
      return <hr className="my-6 border-gray-300" />;

    case "text":
    case "number":
    case "date":
      return (
        <div className="mb-4">
          <label className={`block mb-1 ${textColor}`}>{label}</label>
          <input
            type={field.type}
            className={baseInputClass}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange?.(e.target.value)}
            max={
              field.type === "date"
                ? new Date().toISOString().split("T")[0]
                : undefined
            }
          />
          {renderError()}
        </div>
      );

    case "dropdown":
      return (
        <div className="mb-4">
          <label className={`block mb-1 ${textColor}`}>{label}</label>
          <select
            className={baseInputClass}
            value={typeof value === "string" ? value : ""}
            onChange={(e) => onChange?.(e.target.value)}
          >
            <option value="">Select...</option>
            {field.options?.map((opt, i) => (
              <option key={i} value={opt.value ?? ""}>
                {opt.label ?? ""}
              </option>
            ))}
          </select>
          {renderError()}
        </div>
      );

    case "checkboxes":
      return (
        <div className="mb-4 w-full text-left">
          <label className={`block mb-2 ${textColor}`}>{label}</label>
          <div className="flex flex-col gap-2 w-fit">
            {field.options?.map((opt, i) => {
              const val = opt.value ?? "";
              return (
                <label
                  key={i}
                  className="flex items-center gap-2 whitespace-nowrap text-left"
                >
                  <input
                    type="checkbox"
                    className={`accent-blue-600 ${
                      error ? "border-red-500" : ""
                    }`}
                    checked={Array.isArray(value) && value.includes(val)}
                    onChange={(e) => {
                      const current = Array.isArray(value) ? value : [];
                      onChange?.(
                        e.target.checked
                          ? [...current, val]
                          : current.filter((v) => v !== val)
                      );
                    }}
                  />
                  <span className={textColor}>{opt.label ?? ""}</span>
                </label>
              );
            })}
          </div>
          {renderError()}
        </div>
      );

    case "multipleChoice":
      return (
        <div className="mb-4 w-full text-left">
          <label className={`block mb-2 ${textColor}`}>{label}</label>
          <div className="flex flex-col gap-2 w-fit">
            {field.options?.map((opt, i) => {
              const val = opt.value ?? "";
              return (
                <label
                  key={i}
                  className="flex items-center gap-2 whitespace-nowrap text-left"
                >
                  <input
                    type="radio"
                    name={`field-${field.id}`}
                    value={val}
                    checked={typeof value === "string" && value === val}
                    onChange={() => onChange?.(val)}
                    className={`accent-blue-600 ${
                      error ? "border-red-500" : ""
                    }`}
                  />
                  <span className={textColor}>{opt.label ?? ""}</span>
                </label>
              );
            })}
          </div>
          {renderError()}
        </div>
      );

    case "tags":
      const actualValue =
        value && typeof value === "object" && "value" in value
          ? value.value
          : value;

      return (
        <div className="mb-4">
          <label className={`block mb-2 font-medium ${textColor}`}>
            {label}
          </label>
          <div className="flex flex-wrap gap-2">
            {field.options?.map((opt, idx) => {
              const val = opt.value ?? "";
              const selected =
                Array.isArray(actualValue) && actualValue.includes(val);
              return (
                <span
                  key={idx}
                  className={`cursor-pointer px-3 py-1 rounded-full text-sm font-medium ${
                    selected
                      ? "bg-blue-600 text-white"
                      : isDark
                      ? "bg-gray-700 text-white"
                      : "bg-gray-200 text-black"
                  }`}
                  onClick={() => {
                    const current = Array.isArray(actualValue)
                      ? actualValue
                      : [];
                    onChange?.(
                      selected
                        ? current.filter((v) => v !== val)
                        : [...current, val]
                    );
                  }}
                >
                  {opt.label ?? ""}
                </span>
              );
            })}
          </div>
          {renderError()}
        </div>
      );

    case "section": {
      const sectionValue = (value as Record<string, any>) ?? {};
      const sectionErrors =
        typeof error === "object" && error !== null && !Array.isArray(error)
          ? (error as Record<string, any>)
          : {};

      return (
        <div
          className="p-4 border rounded mb-4 bg-white dark:bg-dark-card-bg"
          key={field.id}
        >
          <h3 className="font-semibold text-lg mb-2">{label}</h3>
          {((field as SectionField).rows || []).map((row: RowLayoutField) => (
            <RowLayoutRenderer
              key={row.id}
              field={row}
              responses={sectionValue[row.id] || {}}
              onChange={(colId, colVal) => {
                onChange?.({
                  ...sectionValue,
                  [row.id]: {
                    ...(sectionValue[row.id] || {}),
                    [colId]: colVal,
                  },
                });
              }}
              errors={sectionErrors[row.id] || {}}
            />
          ))}
        </div>
      );
    }

    case "rowLayout": {
      const rowResponses = (value as Record<string, any>) ?? {};
      const rowErrors =
        typeof error === "object" && error !== null && !Array.isArray(error)
          ? (error as Record<string, any>)
          : {};

      return (
        <RowLayoutRenderer
          key={field.id}
          field={field as RowLayoutField}
          responses={rowResponses}
          onChange={(colId: string, colVal: any) => {
            onChange?.({
              ...rowResponses,
              [colId]: colVal,
            });
          }}
          errors={rowErrors}
        />
      );
    }

    default:
      return (
        <div className="text-red-500 text-sm">
          Unknown field type: <strong>{(field as FieldConfig).type}</strong>
        </div>
      );
  }
};

export default Renderer;
