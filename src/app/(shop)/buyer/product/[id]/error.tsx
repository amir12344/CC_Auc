"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Error state for product page
 */
export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Product page error:", error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-lg text-center">
        <h1 className="mb-4 text-3xl font-bold text-gray-900">
          Something went wrong
        </h1>
        <p className="mb-8 text-lg text-gray-600">
          We encountered an error while loading this product. Please try again
          or browse other products.
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <button onClick={reset} className="btn btn-primary">
            Try again
          </button>
          <Link href="/buyer/shop" className="btn btn-outline">
            Return to shop
          </Link>
        </div>
      </div>
    </div>
  );
}
