import type { Metadata } from "next";
import { Suspense } from "react";

import { DynamicBreadcrumb } from "@/src/components/ui/DynamicBreadcrumb";

import PrivateOffersClientWrapper from "./PrivateOffersClientWrapper";

export const metadata: Metadata = {
  title: "Private Offers | Collections",
  description:
    "Discover exclusive private offers and deals from our curated collection of premium products.",
};

const PrivateOffersPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-gray-100">
        <div className="max-w-8xl mx-auto px-4 py-4">
          <DynamicBreadcrumb />
        </div>
      </div>

      {/* Private Offers with Integrated Filters */}
      <div className="py-8">
        <div className="max-w-8xl mx-auto px-4">
          <PrivateOffersClientWrapper />
        </div>
      </div>
    </div>
  );
};

export default PrivateOffersPage;
