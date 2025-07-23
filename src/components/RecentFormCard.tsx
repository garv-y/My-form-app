import React from "react";
import { useTheme } from "./ThemeContext";

interface RecentFormCardProps {
  form: {
    id: number;
    title: string;
    timestamp: string;
    data: Record<string, string | string[]>;
    fields: any[];
    isDeleted?: boolean;
  };
  onDelete: (id: number) => void;
}

const RecentFormCard: React.FC<RecentFormCardProps> = ({ form, onDelete }) => {
  const { theme } = useTheme();

  let formattedDate = "Unknown";
  if (form.timestamp) {
    const parsed = new Date(form.timestamp);
    if (!isNaN(parsed.getTime())) {
      formattedDate = parsed.toLocaleString();
    }
  }

  const formattedResponses = Object.fromEntries(
    Object.entries(form.data).map(([id, value]) => {
      const field = form.fields.find((f: any) => f.id?.toString() === id);
      const label = field?.label || field?.title || `Field ${id}`;
      return [label, value];
    })
  );

  return (
    <div
      className={`w-full h-full rounded-lg border ${
        theme === "dark"
          ? "bg-gray-800 text-white border-gray-700"
          : "bg-white text-gray-800 border-gray-300"
      } shadow-sm p-4 flex flex-col gap-3 transition`}
    >
      <div>
        <h5 className="text-lg font-semibold">{form.title}</h5>
        <p
          className={`text-sm ${
            theme === "dark" ? "text-gray-400" : "text-gray-600"
          }`}
        >
          Submitted on: {formattedDate}
        </p>
      </div>

      {form.data && Object.keys(form.data).length > 0 && (
        <div
          className={`rounded border px-3 py-2 text-sm ${
            theme === "dark"
              ? "bg-gray-800 text-white border-gray-600"
              : "bg-gray-100 text-gray-900 border-gray-200"
          }`}
        >
          <h6 className="mb-2 font-semibold">Submitted Data:</h6>
          <pre
            className={`whitespace-pre-wrap text-xs rounded p-3 ${
              theme === "dark"
                ? "bg-gray-800 text-gray-200"
                : "bg-white text-gray-800"
            }`}
          >
            {JSON.stringify(formattedResponses, null, 2)}
          </pre>
        </div>
      )}

      <div className="flex justify-between">
        <a
          href={`/view/${form.id}`}
          className="px-4 py-1.5 text-sm rounded border border-blue-500 text-blue-600 hover:text-white dark:hover:bg-blue-500 transition"
        >
          Open
        </a>
        <button
          onClick={() => onDelete(form.id)}
          className="px-4 py-1.5 text-sm rounded border border-red-500 text-red-600 hover:text-white dark:hover:bg-red-500 transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default RecentFormCard;
