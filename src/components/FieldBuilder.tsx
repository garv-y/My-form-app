import React from "react";
import type { Field, SectionField, RowLayoutField } from "../types/types";
import { useTheme } from "./ThemeContext";
import SectionBuilder from "./SectionBuilder";
import RowLayoutBuilder from "./RowLayoutBuilder";

// Props for the FieldBuilder component
interface Props {
  field: Field;
  updateField: (updated: Field) => void;
  deleteField: (id: string) => void;
}

const FieldBuilder: React.FC<Props> = ({ field, updateField, deleteField }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Default label if not defined
  const defaultLabel = `${
    field.type.charAt(0).toUpperCase() + field.type.slice(1)
  } Field`;

  const inputClass = `w-full px-3 py-2 rounded border focus:outline-none ${
    isDark
      ? "bg-gray-800 text-white border-gray-600"
      : "bg-white text-black border-gray-300"
  }`;

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLabel = e.target.value;
    updateField({
      ...field,
      label: newLabel.trim() === "" ? defaultLabel : newLabel,
    });
  };

  const handleRequiredChange = () =>
    updateField({ ...field, required: !field.required });

  const handleOptionChange = (index: number, value: string) => {
    const options = [...(field.options || [])];
    options[index] = { label: value, value };
    updateField({ ...field, options });
  };

  const addOption = () =>
    updateField({
      ...field,
      options: [...(field.options || []), { label: "Option", value: "Option" }],
    });

  const deleteOption = (index: number) => {
    const options = field.options?.filter((_, i) => i !== index);
    updateField({ ...field, options });
  };

  if (field.type === "section") {
    return (
      <SectionBuilder
        field={field as SectionField}
        updateField={updateField}
        deleteField={deleteField}
      />
    );
  }

  if (field.type === "rowLayout") {
    return (
      <RowLayoutBuilder
        field={field as RowLayoutField}
        updateField={updateField}
        deleteField={deleteField}
      />
    );
  }

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
        value={field.label || defaultLabel}
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

      {/* Options editor */}
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

      {/* Delete button */}
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
