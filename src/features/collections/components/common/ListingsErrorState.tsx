import React from "react";

interface ListingsErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export const ListingsErrorState = ({
  message = "Failed to load listings",
  onRetry,
}: ListingsErrorStateProps) => {
  return (
    <div className="py-20 text-center">
      <div className="mb-4 text-xl text-red-600">{message}</div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
        >
          Try Again
        </button>
      )}
    </div>
  );
};
