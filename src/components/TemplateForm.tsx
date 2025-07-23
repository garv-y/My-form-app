import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FieldRenderer from "./FieldRenderer";
import FieldBuilder from "./FieldBuilder";
import { useTheme } from "./ThemeContext";
import { getTemplateFields } from "../utils/templateUtils";
import type { Field, FieldConfig, FieldOption } from "../types/types";
import FAB from "./FAB";

import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";

const TemplateForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [fields, setFields] = useState<Field[]>([]);
  const [formTitle, setFormTitle] = useState("Template Form");
  const [submittedData, setSubmittedData] = useState<
    Record<string, string | string[] | Record<string, any>>
  >({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [showAlert, setShowAlert] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [templateSaved, setTemplateSaved] = useState(false);

  useEffect(() => {
    if (id) {
      const loadedFields = getTemplateFields(id)
        .filter((field: any) => field.type !== "section")
        .map(
          (field: any): Field => ({
            ...field,
            id: String(field.id),
            options: field.options?.map((opt: any) =>
              typeof opt === "string" ? { label: opt, value: opt } : opt
            ) as FieldOption[],
          })
        );
      setFields(loadedFields);
      setFormTitle(
        loadedFields.find((f) => f.type === "header")?.label || "Template Form"
      );
    }
  }, [id]);

  const handleInputChange = (
    fieldId: string,
    value: string | string[] | Record<string, any>
  ) => {
    setSubmittedData((prev) => ({ ...prev, [fieldId]: value }));
    setErrors((prev) => ({ ...prev, [fieldId]: false }));
  };

  const handleSubmit = () => {
    const newErrors: Record<string, boolean> = {};

    fields.forEach((field) => {
      if (field.required) {
        const val = submittedData[field.id];
        const isEmpty =
          val === undefined ||
          val === "" ||
          (Array.isArray(val) && val.length === 0) ||
          (typeof val === "object" &&
            !Array.isArray(val) &&
            Object.keys(val).length === 0);

        if (isEmpty) newErrors[field.id] = true;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    const submissionFields = fields.map((f) => ({
      id: f.id,
      label: f.label || `Field ${f.id}`,
    }));

    const formSubmission = {
      id: Date.now().toString(),
      title: formTitle,
      timestamp: new Date().toISOString(),
      responses: submittedData,
      fields: submissionFields,
      isDeleted: false,
    };

    const existingForms = JSON.parse(
      localStorage.getItem("recentForms") || "[]"
    );
    localStorage.setItem(
      "recentForms",
      JSON.stringify([formSubmission, ...existingForms])
    );

    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 2000);
    navigate(`/view/${formSubmission.id}`);
  };

  const addField = (type: Field["type"]) => {
    const id = Date.now().toString();

    let newField: Field;

    if (type === "rowLayout") {
      newField = {
        id,
        type: "rowLayout",
        label: "Row Layout",
        required: false,
        layout: ["1/2", "1/2"], // default 2-column layout
        columns: [{ fields: [] }, { fields: [] }],
      };
    } else {
      newField = {
        id,
        type,
        label: `${type.charAt(0).toUpperCase() + type.slice(1)} Label`,
        required: false,
        options: ["dropdown", "checkboxes", "multipleChoice"].includes(type)
          ? [
              { label: "Option 1", value: "option1" },
              { label: "Option 2", value: "option2" },
            ]
          : undefined,
      };
    }

    setFields((prev) => [...prev, newField]);
  };

  const updateField = (updatedField: FieldConfig) => {
    setFields((prev) =>
      prev.map((f) =>
        f.id === updatedField.id
          ? {
              ...updatedField,
              id: updatedField.id,
              required: updatedField.required ?? false,
              options: updatedField.options?.map((opt) =>
                typeof opt === "string" ? { label: opt, value: opt } : opt
              ),
            }
          : f
      )
    );
  };

  const deleteField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSaveAsNewTemplate = () => {
    if (fields.length === 0) {
      alert("Cannot save an empty template.");
      return;
    }

    const templates = JSON.parse(localStorage.getItem("templates") || "[]");
    const newTemplate = {
      id: Date.now().toString(),
      title: formTitle.trim() || "Untitled Template",
      fields: [...fields],
    };

    try {
      localStorage.setItem(
        "templates",
        JSON.stringify([newTemplate, ...templates])
      );
      setTemplateSaved(true);
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      alert("Failed to save the template. Please try again.");
    }
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const updated = [...fields];
    const [movedItem] = updated.splice(result.source.index, 1);
    updated.splice(result.destination.index, 0, movedItem);
    setFields(updated);
  };
  return (
    <div
      className={`py-10 min-h-screen ${
        theme === "dark"
          ? "bg-gray-900 text-white"
          : "bg-[#f3f4f6] text-gray-900"
      }`}
    >
      <div className="flex justify-center">
        <div className="w-full max-w-5xl px-4">
          {/* Top Button Panel */}
          <div className="flex justify-end mb-6">
            <div className="flex flex-wrap gap-3 p-3 rounded">
              <button
                onClick={() => setEditMode((prev) => !prev)}
                className={`border rounded px-4 py-2 text-sm transition ${
                  theme === "dark"
                    ? "border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white"
                    : "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                }`}
              >
                {editMode ? "Exit Edit Mode" : "Edit Template"}
              </button>
              <button
                onClick={toggleTheme}
                className={`border rounded px-4 py-2 text-sm transition ${
                  theme === "dark"
                    ? "border-gray-300 text-gray-200 hover:bg-white hover:text-black"
                    : "border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white"
                }`}
              >
                Switch to {theme === "dark" ? "Light" : "Dark"} Mode
              </button>
              <button
                onClick={() => navigate("/")}
                className={`border rounded px-4 py-2 text-sm transition ${
                  theme === "dark"
                    ? "border-gray-300 text-gray-200 hover:bg-white hover:text-black"
                    : "border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white"
                }`}
              >
                Back to Dashboard
              </button>
            </div>
          </div>

          {/* Form Area */}
          {editMode ? (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="fields-droppable">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="flex flex-col gap-4"
                  >
                    {fields.map((field, index) => (
                      <Draggable
                        key={field.id}
                        draggableId={field.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <FieldBuilder
                              field={field}
                              updateField={updateField}
                              deleteField={deleteField}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          ) : fields.length === 0 ? (
            <div
              className={` px-4 py-3 rounded mb-4 ${
                theme === "dark"
                  ? "bg-gray-800 text-white"
                  : "bg-white text-black"
              }`}
            >
              No fields available in this template.
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="space-y-6"
            >
              {fields.map((field) => {
                const value = submittedData[field.id];
                const safeValue =
                  typeof value === "string" || Array.isArray(value)
                    ? value
                    : "";

                return (
                  <FieldRenderer
                    key={field.id}
                    field={field}
                    value={safeValue}
                    onChange={(val) => handleInputChange(field.id, val)}
                    error={errors[field.id] || false}
                  />
                );
              })}

              <button
                type="submit"
                className="mt-4 border border-green-600 text-green-600 px-4 py-2 rounded hover:bg-green-600 hover:text-white"
              >
                Submit
              </button>
            </form>
          )}

          {/* Save Button */}
          {editMode && (
            <div className="mt-6">
              <button
                className="border border-green-600 text-green-600 px-4 py-2 rounded hover:bg-green-600 hover:text-white"
                onClick={handleSaveAsNewTemplate}
              >
                Save as New Template
              </button>
            </div>
          )}

          {/* Alerts */}
          {showAlert && (
            <div className="mt-6 bg-green-100 text-green-800 px-4 py-3 rounded">
              Form submitted and saved!
            </div>
          )}
          {templateSaved && (
            <div className="mt-6 bg-green-100 text-green-800 px-4 py-3 rounded">
              Template saved as new!
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button (FAB) */}
      {editMode && <FAB onAddField={addField} mode="add" />}
    </div>
  );
};

export default TemplateForm;
