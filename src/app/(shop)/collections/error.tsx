"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";

interface CollectionsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const CollectionsError = ({ error, reset }: CollectionsErrorProps) => {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md space-y-4 p-6 text-center">
        <div className="flex justify-center">
          <AlertTriangle className="text-destructive h-12 w-12" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Something went wrong</h2>
          <p className="text-muted-foreground">
            We couldn&apos;t load the collections. Please try again.
          </p>
        </div>

        {process.env.NODE_ENV === "development" && (
          <details className="text-muted-foreground bg-muted rounded p-3 text-left text-sm">
            <summary className="cursor-pointer">Error Details</summary>
            <pre className="mt-2 break-words whitespace-pre-wrap">
              {error.message}
            </pre>
          </details>
        )}

        <div className="flex flex-col justify-center gap-2 sm:flex-row">
          <Button onClick={reset} variant="default">
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/marketplace")}
          >
            Go to Marketplace
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CollectionsError;
