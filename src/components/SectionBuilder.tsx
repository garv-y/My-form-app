import React, { useEffect, useState } from "react";
import type { SectionField, RowLayoutField, Field } from "../types/types";
import RowLayoutBuilder from "./RowLayoutBuilder";

interface Props {
  field: SectionField;
  updateField: (updated: Field) => void;
  deleteField: (id: string) => void;
}

const SectionBuilder: React.FC<Props> = ({
  field,
  updateField,
  deleteField,
}) => {
  const safeRows = field.rows || [];

  // Assign default label if missing
  const [label, setLabel] = useState(field.label || "Section Field");

  useEffect(() => {
    if (!field.label) {
      updateField({ ...field, label: "Section Field" });
    }
  }, [field, updateField]);

  const handleAddRow = () => {
    const newRow: RowLayoutField = {
      id: Date.now().toString(),
      type: "rowLayout",
      layout: ["1/2", "1/2"],
      columns: [{ fields: [] }, { fields: [] }],
    };
    updateField({ ...field, rows: [...safeRows, newRow] });
  };

  const updateRow = (updatedRow: RowLayoutField) => {
    const newRows = safeRows.map((row) =>
      row.id === updatedRow.id ? updatedRow : row
    );
    updateField({ ...field, rows: newRows });
  };

  const deleteRow = (rowId: string) => {
    const updatedRows = safeRows.filter((row) => row.id !== rowId);
    updateField({ ...field, rows: updatedRows });
  };

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLabel = e.target.value;
    setLabel(newLabel);
    updateField({ ...field, label: newLabel });
  };

  return (
    <div className="rounded-lg p-4 mb-4 border shadow">
      <h3 className="font-semibold text-lg mb-2">{label}</h3>

      <input
        className="mb-4 border rounded px-2 py-1 w-full"
        value={label}
        onChange={handleLabelChange}
        placeholder="Section Label"
      />

      {safeRows.map((row) => (
        <RowLayoutBuilder
          key={row.id}
          field={row}
          updateField={(updated) => updateRow(updated as RowLayoutField)}
          deleteField={deleteRow}
        />
      ))}

      <div className="mt-4 flex gap-2">
        <button
          onClick={handleAddRow}
          className="px-3 py-1 text-blue-600 border border-blue-600 rounded text-sm hover:bg-blue-600 hover:text-white"
        >
          + Add Row
        </button>
        <button
          onClick={() => deleteField(field.id)}
          className="px-3 py-1 text-red-600 border border-red-600 rounded text-sm hover:bg-red-600 hover:text-white"
        >
          Delete Section
        </button>
      </div>
    </div>
  );
};

export default SectionBuilder;
