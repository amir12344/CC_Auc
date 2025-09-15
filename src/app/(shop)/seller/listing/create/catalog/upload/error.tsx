"use client";

import Link from "next/link";

import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";

import { Button } from "@/src/components/ui/button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CatalogUploadError({ error, reset }: ErrorPageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="mx-4 w-full max-w-md">
        <div className="rounded-lg bg-white p-8 text-center shadow-lg">
          <div className="mb-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              Upload Error
            </h1>
            <p className="text-gray-600">
              Something went wrong while loading the catalog upload page.
            </p>
          </div>

          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">Error Details:</p>
            <p className="mt-1 text-sm text-red-700">
              {error.message || "An unexpected error occurred"}
            </p>
            {error.digest && (
              <p className="mt-2 text-xs text-red-600">
                Error ID: {error.digest}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Button
              onClick={reset}
              className="w-full bg-red-600 text-white hover:bg-red-700"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>

            <Link href="/seller/listing">
              <Button
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Listings
              </Button>
            </Link>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <p className="text-xs text-gray-500">
              If this problem persists, please contact our support team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
