import React from "react";
import { useNavigate } from "react-router-dom";

interface TemplateCardProps {
  template: {
    id: string;
    title: string;
    fields: any[];
    submittedAt?: string;
    responses?: Record<string, any>;
  };
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template }) => {
  const navigate = useNavigate();

  const formattedDate = template.submittedAt
    ? new Date(template.submittedAt).toLocaleString()
    : "N/A";

  return (
    <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-md p-4 flex flex-col justify-between h-full transition-all border border-gray-300">
      <div>
        <h5 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
          {template.title}
        </h5>

        {template.submittedAt && (
          <p className="text-sm text-gray-500 mb-2">
            Submitted on: {formattedDate}
          </p>
        )}

        {template.responses && Object.keys(template.responses).length > 0 && (
          <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded">
            <h6 className="text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
              Submitted Data:
            </h6>
            <pre className="text-xs text-gray-700 dark:text-gray-200 whitespace-pre-wrap break-words">
              {JSON.stringify(template.responses, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <button
        onClick={() => navigate(`/template/${template.id}`)}
        className="mt-4 text-sm border border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white px-4 py-2 rounded transition-colors"
      >
        Open Template
      </button>
    </div>
  );
};

export default TemplateCard;
