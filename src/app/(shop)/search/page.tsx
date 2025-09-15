import type { Metadata } from "next";
import { Suspense } from "react";

import { DynamicBreadcrumb } from "@/src/components/ui/DynamicBreadcrumb";
import { Skeleton } from "@/src/components/ui/skeleton";

import SearchClientWrapper from "./SearchClientWrapper";

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const generateMetadata = async ({
  searchParams,
}: SearchPageProps): Promise<Metadata> => {
  const params = await searchParams;
  const query = params.q as string;

  if (!query) {
    return {
      title: "Search Products | Commerce Central",
      description:
        "Search through thousands of surplus inventory products. Find electronics, furniture, home goods, and more at unbeatable prices.",
    };
  }

  return {
    title: `Search results for "${query}" | Commerce Central`,
    description: `Find "${query}" in our extensive collection of surplus inventory. Quality products at discounted prices with fast shipping.`,
    openGraph: {
      title: `Search results for "${query}" | Commerce Central`,
      description: `Find "${query}" in our extensive collection of surplus inventory.`,
    },
  };
};

const SearchResultsSkeleton = () => (
  <div className="space-y-6 md:space-y-8">
    {/* Header Skeleton */}
    <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm md:rounded-xl md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Skeleton className="h-6 w-48 md:h-7 md:w-64" />
        <Skeleton className="h-5 w-20 rounded-full md:h-6 md:w-24" />
      </div>
    </div>

    {/* Controls Skeleton */}
    <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm md:rounded-xl md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-5 w-40 md:w-48" />
        <Skeleton className="h-10 w-full sm:w-44" />
      </div>
    </div>

    {/* Grid Skeleton - Matching SimpleProductCard structure */}
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="space-y-3">
          {/* Product Image - matching rounded-[18px] from SimpleProductCard */}
          <Skeleton className="aspect-square w-full rounded-[18px]" />

          {/* Product Info - matching SimpleProductCard structure */}
          <div className="space-y-1">
            {/* Brand/Retailer */}
            <Skeleton className="h-3 w-1/2" />

            {/* Product Title - 2 lines */}
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />

            {/* Units and Discount Info */}
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SearchPage = async ({ searchParams }: SearchPageProps) => {
  const params = await searchParams;
  const query = (params.q as string) || "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/50">
      {/* Breadcrumb Navigation */}
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-8xl mx-auto px-4 py-3 sm:px-6 md:py-4 lg:px-8">
          <DynamicBreadcrumb />
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-4 py-4 sm:px-6 md:py-8 lg:px-8">
        <Suspense fallback={<SearchResultsSkeleton />}>
          <SearchClientWrapper query={query} initialFilters={params} />
        </Suspense>
      </div>
    </div>
  );
};

export default SearchPage;
