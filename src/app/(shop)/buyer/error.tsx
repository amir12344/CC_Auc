"use client";

import Link from "next/link";
import { useEffect } from "react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function BuyerError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Buyer page error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-6 w-6 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        <div className="mt-4 text-center">
          <h1 className="text-lg font-medium text-gray-900">
            Something went wrong!
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            We encountered an error while loading your deals. Please try again.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={reset}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
          >
            Try again
          </button>
          <Link
            href="/marketplace"
            className="flex-1 rounded-lg bg-gray-100 px-4 py-2 text-center font-medium text-gray-900 transition-colors hover:bg-gray-200"
          >
            Go to Marketplace
          </Link>
        </div>

        {process.env.NODE_ENV === "development" && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-gray-500">
              Error Details (Dev Only)
            </summary>
            <pre className="mt-2 overflow-auto rounded bg-gray-100 p-2 text-xs">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
