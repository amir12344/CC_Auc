"use client";

import Link from "next/link";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md overflow-hidden rounded-lg bg-white shadow-lg">
        <div className="bg-red-50 p-6">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-center text-lg font-medium text-red-800">
            Authentication Error
          </h3>
          <p className="mt-2 text-center text-sm text-red-700">
            We encountered a problem while processing your request.
          </p>
        </div>
        <div className="flex justify-between px-6 py-4">
          <button
            onClick={reset}
            className="bg-primary hover:bg-primary/90 rounded-md px-4 py-2 font-medium text-white transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-md bg-gray-200 px-4 py-2 font-medium text-gray-800 transition-colors hover:bg-gray-300"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
