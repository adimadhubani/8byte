import React from "react";

interface FetchErrorProps {
  message: string;
  onDismiss?: () => void;
}

export const FetchError: React.FC<FetchErrorProps> = ({ message, onDismiss }) => {
  return (
    <div className="flex items-center justify-between p-4 mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg shadow-sm">
      <div className="flex items-center space-x-3">
        <svg
          className="w-5 h-5 text-red-500 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <span className="text-sm font-medium">{message}</span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-500 hover:text-red-800 text-sm font-semibold ml-4 transition"
        >
          Dismiss
        </button>
      )}
    </div>
  );
};

export const ErrorBanner = FetchError;
