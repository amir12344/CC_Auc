import type { Metadata } from "next";
import { Suspense } from "react";

import { DynamicBreadcrumb } from "@/src/components/ui/DynamicBreadcrumb";

import CatalogClientWrapper from "./CatalogClientWrapper";

export const metadata: Metadata = {
  title: "All Catalog Listings | Collections",
  description:
    "Browse our complete catalog of products from trusted sellers. Find everything you need in one place.",
};

const CatalogPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-gray-100">
        <div className="max-w-8xl mx-auto px-4 py-4">
          <DynamicBreadcrumb />
        </div>
      </div>

      {/* Collections Grid with Integrated Preference-Based Filters */}
      <div className="py-8">
        <div className="max-w-8xl mx-auto px-4">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
              </div>
            }
          >
            <CatalogClientWrapper />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default CatalogPage;
