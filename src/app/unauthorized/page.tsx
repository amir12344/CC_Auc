"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { ShieldAlert } from "lucide-react";

function UnauthorizedContent() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center">
        <ShieldAlert className="mx-auto h-16 w-16 text-red-500" />
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Access Denied
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          You do not have permission to access this page.
        </p>
        {from && (
          <p className="mt-2 text-sm text-gray-500">
            You were trying to access: <code>{from}</code>
          </p>
        )}
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/"
            className="bg-primary hover:bg-primary/80 focus:ring-primary inline-flex items-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
          >
            Go to Homepage
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
          >
            Login with a different account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UnauthorizedContent />
    </Suspense>
  );
}
