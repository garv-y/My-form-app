import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import GridLayout from "react-grid-layout";
import FieldBuilder from "./FieldBuilder";
import FieldRenderer from "./FieldRenderer";
import { useTheme } from "./ThemeContext";
import type { FieldConfig, FieldType, RowLayoutField } from "../types/types";
import RowLayoutBuilder from "./RowLayoutBuilder";
import RowLayoutRenderer from "./RowLayoutRenderer";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const defaultHeightMap: Record<FieldType, number> = {
  header: 7,
  label: 7,
  paragraph: 7,
  linebreak: 7,
  text: 7,
  number: 7,
  dropdown: 11,
  tags: 11,
  checkboxes: 11,
  multipleChoice: 11,
  date: 7,
  rowLayout: 18,
};

type LayoutItem = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  static?: boolean;
};

// const extractResponses = (field: FieldConfig, data: Record<string, any>): any =>
//   data[field.id] ?? "";

const FormBuilder: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1000);
  const [formTitle, setFormTitle] = useState("My Custom Form");
  const [fields, setFields] = useState<FieldConfig[]>([]);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [layout, setLayout] = useState<LayoutItem[]>([]);
  const [formResponses, setFormResponses] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [, setSubmittedData] = useState<Record<string, any> | null>(null);
  const [useShortForm, setUseShortForm] = useState(false);

  useEffect(() => {
    document.body.classList.remove("light-mode", "dark-mode");
    document.body.classList.add(`${theme}-mode`);
  }, [theme]);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const addField = (type: FieldType) => {
    const id = Date.now().toString();

    // Special config for rowLayout
    const newField: FieldConfig =
      type === "rowLayout"
        ? {
            id,
            type,
            label: "Row Layout",
            required: false,
            displayOnShortForm: false,
            layout: ["1/2", "1/2"], // default two-column layout
            columns: [{ fields: [] }, { fields: [] }],
          }
        : {
            id,
            type,
            label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
            required: false,
            displayOnShortForm: false,
            options: [
              "dropdown",
              "tags",
              "checkboxes",
              "multipleChoice",
            ].includes(type)
              ? [
                  { label: "Option 1", value: "option_1" },
                  { label: "Option 2", value: "option_2" },
                ]
              : undefined,
          };

    const height = defaultHeightMap[type] || 6;

    const baseLayout: LayoutItem = {
      i: id,
      x: (layout.length * 2) % 12,
      y: Infinity,
      w: 6,
      h: height,
    };

    setFields((prev) => [...prev, newField]);
    setLayout((prev) => [...prev, baseLayout]);
  };

  const updateField = (updatedField: FieldConfig) => {
    setFields((prevFields) =>
      prevFields.map((f) => (f.id === updatedField.id ? updatedField : f))
    );
  };

  const removeField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
    setLayout((prev) => prev.filter((l) => l.i !== id));
  };

  const [leftWidth, setLeftWidth] = useState(50);
  const isDragging = useRef(false);

  const startDragging = () => {
    isDragging.current = true;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const offsetX = e.clientX - containerRect.left;
      const newPercent = (offsetX / containerRect.width) * 100;

      if (newPercent > 25 && newPercent < 75) {
        setLeftWidth(newPercent);
      }
    };

    const stopDragging = () => {
      isDragging.current = false;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopDragging);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopDragging);
    };
  }, []);

  const extractResponses = (
    field: FieldConfig,
    responses: Record<string, any>
  ): any => {
    if (field.type === "rowLayout" && "columns" in field) {
      const combined: Record<string, any> = {};
      field.columns.forEach((col) => {
        col.fields.forEach((subField) => {
          const label = subField.label || `Field ${subField.id}`;
          combined[label] = {
            value: responses[subField.id] ?? "",
            source: "rowLayout",
          };
        });
      });
      return combined;
    }

    return {
      value: responses[field.id] ?? "",
      source: "root",
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, boolean> = {};
    const result: Record<string, any> = {};

    fields.forEach((field) => {
      if (!useShortForm || field.displayOnShortForm) {
        const value = extractResponses(field, formResponses);
        const isEmpty =
          value === undefined ||
          value === "" ||
          (Array.isArray(value) && value.length === 0);

        if (field.required && isEmpty) {
          newErrors[field.id] = true;
        }

        if (field.type === "rowLayout" && "columns" in field) {
          // Flatten rowLayout fields into main result
          Object.entries(value).forEach(([key, val]) => {
            result[key] = val;
          });
        } else {
          result[field.label || `Field ${field.id}`] = value;
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmittedData(result);
    localStorage.setItem("submittedData", JSON.stringify(result));

    const newEntry = {
      id: Date.now().toString(),
      title: formTitle,
      timestamp: new Date().toISOString(),
      responses: result,
      fields,
    };

    const existing = JSON.parse(localStorage.getItem("recentForms") || "[]");
    localStorage.setItem(
      "recentForms",
      JSON.stringify([newEntry, ...existing])
    );

    setFormSubmitted(true);
    setTimeout(() => setFormSubmitted(false), 3000);
  };

  return (
    <div className="flex w-full">
      <div className="flex-grow w-full" ref={containerRef}>
        {/* Header */}
        <div
          className={`flex justify-between items-center mb-4 px-4 py-4 shadow-sm w-full ${
            theme === "dark"
              ? "bg-gray-800 text-white"
              : "bg-white text-gray-800"
          }`}
        >
          <h3 className="text-2xl p-3 font-bold">Form Builder</h3>

          <div className="flex flex-col md:flex-row items-end md:items-center gap-2">
            <button
              className={`border px-4 py-2 rounded ${
                theme === "light"
                  ? "border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white"
                  : "border-white text-white hover:bg-white hover:text-black"
              }`}
              onClick={toggleTheme}
            >
              Switch to {theme === "light" ? "Dark" : "Light"} Theme
            </button>
            <button
              className={`border px-4 py-2 rounded ${
                theme === "light"
                  ? "border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white"
                  : "border-white text-white hover:bg-white hover:text-black"
              }`}
              onClick={() => navigate("/")}
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        <div className="flex w-full h-full relative">
          {/* Left Panel */}
          <div
            style={{
              width: `${leftWidth}%`,
              paddingRight: "10px",
              borderRight: "1px solid #ccc",
              overflowY: "auto",
            }}
          >
            <div>
              <div className="px-4 mb-4">
                <div className="flex flex-wrap gap-2">
                  {[
                    "header",
                    "paragraph",
                    "label",
                    "text",
                    "number",
                    "dropdown",
                    "checkboxes",
                    "multipleChoice",
                    "tags",
                    "linebreak",
                    "date",
                    "rowLayout",
                  ].map((type) => (
                    <button
                      key={type}
                      className={`border px-3 py-2 rounded shadow-sm form-preview ${
                        theme === "dark"
                          ? "bg-gray-800 text-white"
                          : "bg-white text-gray-800"
                      }`}
                      onClick={() => addField(type as FieldType)}
                    >
                      + {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4 px-4">
                <label className="block font-medium mb-1">Form Title</label>
                <input
                  type="text"
                  className="border px-3 py-2 w-full rounded"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>

              <GridLayout
                className="layout mb-5 px-3"
                layout={layout}
                cols={12}
                rowHeight={35}
                width={(containerWidth * leftWidth) / 100 - 30}
                onLayoutChange={(newLayout: LayoutItem[]) =>
                  setLayout(newLayout)
                }
                isDraggable
                isResizable
                draggableCancel=".non-draggable"
              >
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className={`border rounded p-3 ${
                      theme === "dark"
                        ? "bg-gray-800 text-white border-gray-700"
                        : "bg-white text-gray-800 border-gray-300"
                    }`}
                    style={{ overflow: "visible", minHeight: "140px" }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="non-draggable font-semibold">
                        Field #{index + 1} - {field.type}
                      </h5>
                      <button
                        className="text-red-600 border border-red-600 rounded px-2 py-1 text-sm non-draggable"
                        onClick={() => removeField(field.id)}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="non-draggable">
                      {field.type === "rowLayout" ? (
                        <RowLayoutBuilder
                          field={field as any}
                          updateField={updateField}
                          deleteField={removeField}
                        />
                      ) : (
                        <FieldBuilder
                          field={field}
                          updateField={updateField}
                          deleteField={removeField}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </GridLayout>
            </div>
          </div>

          {/* Divider */}
          <div
            onMouseDown={startDragging}
            className="w-1 cursor-col-resize bg-gray-300 z-10"
          />

          {/* Right Panel */}
          <div
            style={{
              width: `${100 - leftWidth}%`,
              paddingLeft: "10px",
              overflowY: "auto",
            }}
          >
            <div>
              <div className="flex items-center px-6 gap-2 whitespace-nowrap text-left">
                <input
                  type="checkbox"
                  id="toggleShortForm"
                  checked={useShortForm}
                  onChange={() => setUseShortForm((prev) => !prev)}
                  className="mr-2"
                />
                <label htmlFor="toggleShortForm" className="text-sm">
                  Show Short Form
                </label>
              </div>
              <div
                className={`shadow-sm m-4 p-4 rounded form-preview ${
                  theme === "dark"
                    ? "bg-gray-800 text-white"
                    : "bg-white text-gray-800"
                }`}
                style={{
                  maxHeight: "700px",
                  overflowY: "auto",
                  resize: "both",
                }}
              >
                <h4 className="mb-3 font-semibold">Live Preview</h4>
                <h5 className="mb-4">{formTitle}</h5>
                <form onSubmit={handleSubmit}>
                  {(() => {
                    const filteredLayout = layout.filter((item) => {
                      const field = fields.find((f) => f.id === item.i);
                      return (
                        field && (!useShortForm || field.displayOnShortForm)
                      );
                    });

                    const maxY = Math.max(
                      ...filteredLayout.map((item) => item.y + item.h),
                      0
                    );

                    return (
                      <GridLayout
                        className="layout"
                        layout={[
                          ...filteredLayout,
                          {
                            i: "submit-button",
                            x: 0,
                            y: maxY + 1,
                            w: 12,
                            h: 2,
                            static: true,
                          },
                        ]}
                        cols={12}
                        rowHeight={1}
                        width={(containerWidth * (100 - leftWidth)) / 100 - 100}
                        isDraggable={false}
                        isResizable={false}
                        compactType={null}
                      >
                        {fields
                          .filter((f) => !useShortForm || f.displayOnShortForm)
                          .map((f) => (
                            <div key={f.id} className="non-draggable h-full">
                              {f.type === "rowLayout" ? (
                                <RowLayoutRenderer
                                  field={f as RowLayoutField}
                                  responses={formResponses}
                                  onChange={(id: string, val: any) =>
                                    setFormResponses((prev) => ({
                                      ...prev,
                                      [id]: val,
                                    }))
                                  }
                                  errors={errors}
                                />
                              ) : (
                                <FieldRenderer
                                  field={f}
                                  value={formResponses[f.id]}
                                  onChange={(val) =>
                                    setFormResponses((prev) => ({
                                      ...prev,
                                      [f.id]: val,
                                    }))
                                  }
                                  error={errors[f.id] || false}
                                />
                              )}
                            </div>
                          ))}

                        <div key="submit-button" className="non-draggable mb-5">
                          <button
                            type="submit"
                            className="border border-green-600 text-green-600 px-4 py-2 rounded hover:bg-green-600 hover:text-white"
                          >
                            Submit
                          </button>
                        </div>
                      </GridLayout>
                    );
                  })()}
                </form>
                <div className="mt-4 flex flex-wrap gap-2">
                  {formSubmitted && (
                    <div className="mt-4 p-3 rounded bg-green-100 text-green-800">
                      Form submitted successfully!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormBuilder;
