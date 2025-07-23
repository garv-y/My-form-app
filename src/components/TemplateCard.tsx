// React & navigation imports
import React from "react";
import { useNavigate } from "react-router-dom"; // Hook to programmatically navigate between routes

// Define props interface for the template card
interface TemplateCardProps {
  template: {
    id: string; // Unique template ID
    title: string; // Template title
    fields: any[]; // List of fields (structure not enforced here)
    submittedAt?: string; // Optional submission date
    responses?: Record<string, any>; // Optional submitted responses
  };
}

// Functional component definition
const TemplateCard: React.FC<TemplateCardProps> = ({ template }) => {
  const navigate = useNavigate(); // Hook to navigate programmatically

  // Format the submittedAt date (if present) into a readable format
  const formattedDate = template.submittedAt
    ? new Date(template.submittedAt).toLocaleString()
    : "N/A"; // Fallback if no date is available

  return (
    // Card container with theme-aware background and border
    <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-md p-4 flex flex-col justify-between h-full transition-all border border-gray-300">
      <div>
        {/* Template Title */}
        <h5 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          {template.title}
        </h5>

        {/* Submission Date */}
        {template.submittedAt && (
          <p className="text-sm text-gray-500 mb-2">
            Submitted on: {formattedDate}
          </p>
        )}

        {/* Submitted Data Preview */}
        {template.responses && Object.keys(template.responses).length > 0 && (
          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
            <h6 className="text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
              Submitted Data:
            </h6>
            {/* JSON stringified response shown in a code block */}
            <pre className="text-xs text-gray-700 dark:text-gray-200 whitespace-pre-wrap break-words">
              {JSON.stringify(template.responses, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Button to open the template form */}
      <button
        onClick={() => navigate(`/template/${template.id}`)} // Navigate to template page on click
        className="mt-4 text-sm border border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-4 py-2 rounded transition-colors"
      >
        Open Template
      </button>
    </div>
  );
};

export default TemplateCard;
