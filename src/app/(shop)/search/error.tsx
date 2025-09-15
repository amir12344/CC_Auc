"use client";

import { AlertTriangle, Home, RefreshCw } from "lucide-react";

import { Button } from "@/src/components/ui/button";

interface SearchErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const SearchError = ({ error, reset }: SearchErrorProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50/50 p-4">
      <div className="w-full max-w-lg space-y-8 rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-lg">
        <div className="flex justify-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-50 to-orange-50 shadow-sm">
            <AlertTriangle className="h-10 w-10 text-red-500" />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">
            Oops! Search Failed
          </h2>
          <p className="text-lg leading-relaxed text-gray-600">
            We encountered an unexpected error while searching. Don&apos;t
            worry, this happens sometimes.
          </p>
        </div>

        {process.env.NODE_ENV === "development" && (
          <details className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-left text-sm text-gray-600">
            <summary className="mb-3 cursor-pointer font-medium text-gray-800">
              🔍 Technical Details
            </summary>
            <div className="mt-2 rounded-lg border border-gray-200 bg-white p-3">
              <pre className="font-mono text-xs break-words whitespace-pre-wrap text-gray-700">
                {error.message}
              </pre>
            </div>
          </details>
        )}

        <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
          <Button
            onClick={reset}
            className="bg-blue-600 text-white shadow-sm hover:bg-blue-700"
            size="lg"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/marketplace")}
            className="border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            size="lg"
          >
            <Home className="mr-2 h-4 w-4" />
            Browse Products
          </Button>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-sm text-gray-500">
            If this problem persists, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SearchError;
