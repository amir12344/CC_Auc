import type { Metadata } from "next";
import { Suspense } from "react";

import { DynamicBreadcrumb } from "@/src/components/ui/DynamicBreadcrumb";

import NearYouClientWrapper from "./NearYouClientWrapper";

export const metadata: Metadata = {
  title: "Near You",
  description:
    "Browse listings from sellers in your preferred regions. Quality products from nearby trusted sellers at unbeatable prices.",
  openGraph: {
    title: "Near You",
    description:
      "Browse listings from sellers in your preferred regions. Quality products from nearby trusted sellers at unbeatable prices.",
  },
};

const NearYouPage = () => {
  const breadcrumbItems = [
    { label: "Home", href: "/marketplace" },
    { label: "Near You", href: "" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-gray-100">
        <div className="max-w-8xl mx-auto px-4 py-4">
          <DynamicBreadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* Collections Grid with Integrated Filter Sidebar */}
      <div className="py-8">
        <div className="max-w-8xl mx-auto px-4">
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
              </div>
            }
          >
            <NearYouClientWrapper />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default NearYouPage;
