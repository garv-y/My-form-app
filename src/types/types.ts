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
  | "rowLayout";       // Custom layout that holds multiple columns and fields

// Represents a single option in dropdowns, checkboxes, or multipleChoice fields
export interface FieldOption {
  label: string; // Text shown to the user
  value: string; // Value stored in form data
}

// Layout item structure (used optionally if working with react-grid-layout)
export interface LayoutItem {
  i: string;     // Unique ID for the layout item
  x: number;     // Horizontal position in grid
  y: number;     // Vertical position in grid
  w: number;     // Width (in columns)
  h: number;     // Height (in rows)
  static?: boolean; // If true, the item is not draggable/resizable
}

// Common base shared by all fields (used to avoid duplication)
export interface FieldBase {
  id: string;                     // Unique identifier
  type: FieldType;                // Type of field (from FieldType)
  label?: string;                 // Display label
  required?: boolean;             // Whether field is required
  displayOnShortForm?: boolean;  // If this should show in short/preview form
  x?: number;                    // Optional X coord in grid
  y?: number;                    // Optional Y coord in grid
  w?: number;                    // Optional width in grid
  h?: number;                    // Optional height in grid
  options?: FieldOption[];       // Used only in fields with selectable options
}

// Special structure for fields of type 'rowLayout'
// These contain multiple columns with their own nested fields
export interface RowLayoutField extends FieldBase {
  type: "rowLayout";             // Force type to be 'rowLayout'
  layout: string[];              // Column widths like ['1/2', '1/2']
  columns: {
    width?: string;              // Optional column width (used in layout)
    fields: Field[];             // Nested fields inside this column
  }[];
}

// A field can be either a simple field (FieldBase) or a rowLayout field
export type Field = RowLayoutField | FieldBase;

// Alias to be used during field configuration/editing
export type FieldConfig = Field;
