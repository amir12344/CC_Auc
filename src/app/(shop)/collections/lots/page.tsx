import type { Metadata } from "next";
import { Suspense } from "react";

import { DynamicBreadcrumb } from "@/src/components/ui/DynamicBreadcrumb";

import LotsClient from "./LotsClient";

export const metadata: Metadata = {
  title: "Lot Listings | Collections",
  description:
    "Browse active lot listings with detailed manifests and transparent pricing.",
};

const LotsCollectionPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-gray-100">
        <div className="max-w-8xl mx-auto px-6 py-4">
          <DynamicBreadcrumb />
        </div>
      </div>

      {/* Lots Grid */}
      <div className="py-8">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
            </div>
          }
        >
          <LotsClient />
        </Suspense>
      </div>
    </div>
  );
};

export default LotsCollectionPage;

