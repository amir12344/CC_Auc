"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { AlertCircle } from "lucide-react";

import { Button } from "@/src/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function UploadOfferError({ error, reset }: ErrorProps) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to your error reporting service
    console.error("Upload Offer Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-gray-900">
                Something went wrong
              </h1>
              <p className="text-gray-600">
                We encountered an error while setting up the upload interface.
              </p>
            </div>

            <div className="space-x-4">
              <Button
                onClick={() => reset()}
                className="bg-gray-900 text-white hover:bg-gray-800"
              >
                Try again
              </Button>
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="text-gray-600 hover:text-gray-800"
              >
                Go back
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
