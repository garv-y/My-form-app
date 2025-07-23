// This defines all the possible types of fields a user can add to the form.
// These strings are used to control rendering logic and UI behavior.
export type FieldType =
  | "header"           // Large heading text (non-input)
  | "label"            // Static label text (non-input)
  | "paragraph"        // Descriptive paragraph text (non-input)
  | "linebreak"        // A visual break or separator (non-input)
  | "text"             // Text input field
  | "number"           // Numeric input field
  | "dropdown"         // Dropdown select with options
  | "checkboxes"       // Multiple selection (checkbox group)
  | "multipleChoice"   // Single selection (radio buttons)
  | "tags"             // Tag input (select or create multiple values)
  | "date"             // Date picker
  | "rowLayout";       // NEW: Custom row layout container

// Represents a single option in dropdowns, checkboxes, or multipleChoice
export interface FieldOption {
  label: string; // Text shown to the user
  value: string; // Internal value submitted
}

// Layout type for react-grid-layout (optional if using)
export interface LayoutItem {
  i: string;         // ID of the field
  x: number;
  y: number;
  w: number;
  h: number;
  static?: boolean;
}

// Base field interface used by all field types
export interface FieldBase {
  id: string;
  type: FieldType;
  label?: string;
  required?: boolean;
  displayOnShortForm?: boolean;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  options?: FieldOption[]; // Only used for choice-based fields
}

// Special structure for 'rowLayout' fields
export interface RowLayoutField extends FieldBase {
  type: "rowLayout";
  layout: string[]; // Example: ['1/3', '1/3', '1/3']
  columns: {
    width?: string; // Optional width for the column
    fields: Field[]; // Nested fields per column
  }[];
  
}

// Union type for all valid fields (RowLayout OR Normal Field)
export type Field = RowLayoutField | FieldBase;

// FieldConfig is identical to Field during creation
export type FieldConfig = Field;

