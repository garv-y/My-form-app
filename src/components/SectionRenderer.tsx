import React from "react";
import RowLayoutRenderer from "./RowLayoutRenderer";
import type { SectionField } from "../types/types";

interface Props {
  field: SectionField;
  value: Record<string, any>;
  onChange: (value: Record<string, any>) => void;
  errors: Record<string, boolean>;
}

const SectionRenderer: React.FC<Props> = ({
  field,
  value,
  onChange,
  errors,
}) => {
  const sectionValue = value[field.id] || {};

  const handleSubFieldChange = (subFieldId: string, subValue: any) => {
    const updatedSectionValue = {
      ...sectionValue,
      [subFieldId]: subValue,
    };
    onChange({
      ...value,
      [field.id]: updatedSectionValue,
    });
  };

  return (
    <div className="p-4 border rounded-lg mb-4">
      <h3 className="text-lg font-semibold mb-2">{field.label}</h3>
      {Array.isArray(field.rows) &&
        field.rows.map((row, rowIndex) => (
          <RowLayoutRenderer
            key={rowIndex}
            field={row}
            responses={sectionValue}
            errors={errors}
            onChange={handleSubFieldChange}
          />
        ))}
    </div>
  );
};

export default SectionRenderer;
