import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { DynamicBreadcrumb } from "@/src/components/ui/DynamicBreadcrumb";
import CollectionListingsGrid from "@/src/features/collections/components/CollectionListingsGrid";
import { FilterSidebar } from "@/src/features/navigation/components/FilterSidebar";
import { unslugify } from "@/src/utils/slugify";
import { parseCollectionPath, type CollectionScope } from "@/src/utils/url";

interface CollectionPageProps {
  params: Promise<{
    scope: string;
    slug: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const CollectionPage = async ({
  params,
  searchParams,
}: CollectionPageProps) => {
  const { scope, slug } = await params;
  const resolvedSearchParams = await searchParams;

  // Validate scope
  const validScopes: CollectionScope[] = ["category", "subcategory", "segment"];
  if (!validScopes.includes(scope as CollectionScope)) {
    notFound();
  }

  try {
    // Parse the collection path to get filters
    const { filter: baseFilter } = parseCollectionPath(scope, slug);

    // Parse additional search params
    const additionalFilters: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(resolvedSearchParams)) {
      if (value) {
        const stringValue = Array.isArray(value) ? value[0] : value;
        additionalFilters[key] = stringValue
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean);
      }
    }

    // Combine filters
    const allFilters = { ...baseFilter, ...additionalFilters };

    const displayName = unslugify(slug);
    const scopeLabel = scope.charAt(0).toUpperCase() + scope.slice(1);

    return (
      <div className="min-h-screen bg-white">
        {/* Breadcrumb Navigation */}
        <div className="border-b border-gray-100">
          <div className="max-w-8xl mx-auto px-4 py-4">
            <DynamicBreadcrumb />
          </div>
        </div>

        {/* Page Header */}
        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50/80 to-indigo-50/80">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="mb-6 text-5xl font-bold text-gray-900">
                {displayName} {scopeLabel}
              </h1>
              <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-gray-600">
                Discover premium surplus inventory in our{" "}
                {displayName.toLowerCase()} collection. Quality products from
                trusted brands at unbeatable prices.
              </p>

              {/* Collection Stats */}
              <div className="mx-auto grid max-w-2xl grid-cols-1 gap-8 md:grid-cols-3">
                <div className="text-center">
                  <div className="mb-2 text-3xl font-bold text-blue-600">
                    Curated
                  </div>
                  <div className="text-sm text-gray-600">Selection</div>
                </div>
                <div className="text-center">
                  <div className="mb-2 text-3xl font-bold text-green-600">
                    Quality
                  </div>
                  <div className="text-sm text-gray-600">Products</div>
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

        {/* Collections Grid with Sidebar Filters */}
        <div className="py-12">
          <div className="max-w-8xl mx-auto px-6">
            <div className="flex gap-8">
              {/* Filter Sidebar */}
              <div className="hidden w-80 flex-shrink-0 lg:block">
                <div className="sticky top-6">
                  <FilterSidebar category={displayName} />
                </div>
              </div>

              {/* Main Content */}
              <div className="min-w-0 flex-1">
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center py-20">
                      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
                    </div>
                  }
                >
                  <CollectionListingsGrid
                    filters={allFilters}
                    scope={scope as CollectionScope}
                    searchParams={resolvedSearchParams}
                  />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
};

export default CollectionPage;
