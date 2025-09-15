import type { Metadata } from "next";
import { Suspense } from "react";

import { DynamicBreadcrumb } from "@/src/components/ui/DynamicBreadcrumb";
import { CollectionGrid } from "@/src/features/collections/components/CollectionGrid";

export const metadata: Metadata = {
  title: "Collections | Commerce Central",
  description:
    "Browse our curated collections of surplus inventory. Find electronics, furniture, home goods, and more organized by category at unbeatable prices.",
  openGraph: {
    title: "Collections | Commerce Central",
    description:
      "Browse our curated collections of surplus inventory. Quality products organized by category at unbeatable prices.",
  },
};

const CollectionsPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-gray-100">
        <div className="max-w-8xl mx-auto px-6 py-4">
          <DynamicBreadcrumb />
        </div>
      </div>

      {/* Enhanced Page Header */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50/80 to-purple-50/80">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-5xl font-bold text-gray-900">
              Our Collections
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-gray-600">
              Discover curated collections of premium surplus inventory. Each
              collection features hand-picked products from trusted brands,
              organized to help you find exactly what you need.
            </p>

            {/* Collection Stats */}
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-blue-600">8+</div>
                <div className="text-sm text-gray-600">Curated Collections</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-green-600">
                  1000+
                </div>
                <div className="text-sm text-gray-600">Quality Products</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-3xl font-bold text-purple-600">
                  70%
                </div>
                <div className="text-sm text-gray-600">Average Savings</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="py-12">
        <Suspense fallback={<div>Loading collections...</div>}>
          <CollectionGrid />
        </Suspense>
      </div>
    </div>
  );
};

export default CollectionsPage;
