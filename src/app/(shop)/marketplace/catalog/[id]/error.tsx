"use client";

import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CatalogError({ reset }: ErrorProps) {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-lg text-center">
        <h1 className="mb-4 text-3xl font-bold text-gray-900">
          Something went wrong
        </h1>
        <p className="mb-8 text-lg text-gray-600">
          We encountered an error while loading this catalog. Please try again
          or browse other catalogs.
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <button className="btn btn-primary" onClick={reset} type="button">
            Try again
          </button>
          <Link className="btn btn-outline" href="/marketplace">
            Return to marketplace
          </Link>
        </div>
      </div>
    </div>
  );
}
