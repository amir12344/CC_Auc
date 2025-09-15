"use client";

import { memo } from "react";

interface PageSkeletonProps {
  type?: "default" | "product" | "marketplace" | "dashboard" | "catalog" | "lot";
}

const PageSkeleton = ({ type = "default" }: PageSkeletonProps) => {
  // For dashboard type, don't wrap in MainLayout since it's already in the dashboard layout
  if (type === "dashboard") {
    return <DashboardSkeleton />;
  }

  if (type === "marketplace") {
    return <MarketplaceSkeleton />;
  }
  if (type === "product") {
    return <ProductSkeleton />;
  }
  if (type === "catalog") {
    return <CatalogSkeleton />;
  }
  if (type === "lot") {
    return <LotSkeleton />;
  }
  // Default case
  return <DefaultSkeleton />;
};
const DefaultSkeleton = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <div className="border-primary-600 mx-auto h-12 w-12 animate-spin rounded-full border-4 border-solid border-t-transparent"></div>
      </div>
    </div>
  </div>
);

const MarketplaceSkeleton = () => (
  <>
    <div className="mb-4 flex w-full justify-center bg-white pt-3">
      <div className="no-scrollbar flex flex-row items-center gap-4 overflow-x-auto py-3 md:gap-8 lg:gap-20">
        {Array(8)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="mb-1 h-8 w-8 animate-pulse rounded-full bg-gray-200"></div>
              <div className="h-3 w-12 animate-pulse rounded bg-gray-200"></div>
            </div>
          ))}
      </div>
    </div>

    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 h-20 w-full animate-pulse rounded-2xl bg-gray-100"></div>

      <div className="no-scrollbar mb-8 flex gap-2 overflow-x-auto">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="h-8 w-24 animate-pulse rounded-full bg-gray-200"
            ></div>
          ))}
      </div>

      {Array(3)
        .fill(0)
        .map((_, sectionIndex) => (
          <div key={`section-${sectionIndex}`} className="mb-12">
            <div className="mb-6 flex items-center justify-between">
              <div className="h-8 w-48 animate-pulse rounded bg-gray-200"></div>
              <div className="h-6 w-24 animate-pulse rounded bg-gray-200"></div>
            </div>

            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={`product-${sectionIndex}-${i}`}
                    className="animate-pulse"
                  >
                    <div className="mb-3 aspect-square w-full rounded-2xl bg-gray-200"></div>
                    <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
                    <div className="h-4 w-1/2 rounded bg-gray-200"></div>
                  </div>
                ))}
            </div>
          </div>
        ))}

      {/* Pagination skeleton */}
      <div className="mt-12 flex justify-center">
        <div className="h-10 w-64 animate-pulse rounded bg-gray-200"></div>
      </div>
    </div>
  </>
);

const ProductSkeleton = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="mb-6">
      <div className="h-8 w-32 animate-pulse rounded bg-gray-200"></div>
    </div>

    <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
      {/* Product Gallery Skeleton */}
      <div className="space-y-4">
        <div className="aspect-square animate-pulse rounded-2xl bg-gray-200"></div>
        <div className="grid grid-cols-4 gap-2">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded bg-gray-200"
              ></div>
            ))}
        </div>
      </div>

      {/* Product Info Skeleton */}
      <div>
        <div className="space-y-4">
          <div className="h-10 w-3/4 animate-pulse rounded bg-gray-200"></div>
          <div className="h-8 w-1/4 animate-pulse rounded bg-gray-200"></div>
          <div className="h-24 animate-pulse rounded bg-gray-200"></div>
          <div className="grid grid-cols-2 gap-4">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded bg-gray-200"
                ></div>
              ))}
          </div>
          <div className="h-40 animate-pulse rounded bg-gray-200"></div>
          <div className="h-12 animate-pulse rounded bg-gray-200"></div>
          <div className="h-12 animate-pulse rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  </div>
);

const CatalogSkeleton = () => (
  <div className="min-h-screen bg-white">
    {/* Skeleton Breadcrumb */}
    <div className="border-b border-gray-100">
      <div className="max-w-8xl mx-auto px-6 py-4">
        <div className="animate-pulse">
          <div className="h-6 w-64 rounded bg-gray-200" />
        </div>
      </div>
    </div>

    {/* Skeleton Catalog Content */}
    <div className="max-w-8xl mx-auto px-4 py-6 lg:px-6">
      <div className="space-y-6">
        {/* Skeleton CatalogDisplay */}
        <div className="animate-pulse">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="h-64 rounded-2xl bg-gray-200"></div>
            <div className="space-y-4">
              <div className="h-8 w-3/4 rounded bg-gray-200"></div>
              <div className="h-4 w-1/2 rounded bg-gray-200"></div>
              <div className="h-24 rounded bg-gray-200"></div>
              <div className="mt-4 flex gap-3">
                <div className="h-10 w-32 rounded bg-gray-200"></div>
                <div className="h-10 w-32 rounded bg-gray-200"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Skeleton CatalogMetrics */}
        <div className="animate-pulse">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="h-20 rounded-2xl bg-gray-200"></div>
            <div className="h-20 rounded-2xl bg-gray-200"></div>
            <div className="h-20 rounded-2xl bg-gray-200"></div>
            <div className="h-20 rounded-2xl bg-gray-200"></div>
          </div>
        </div>

        {/* Skeleton CatalogProductsTable */}
        <div className="animate-pulse">
          <div className="mb-4 flex items-center justify-between">
            <div className="h-9 w-40 rounded bg-gray-200"></div>
            <div className="h-9 w-32 rounded bg-gray-200"></div>
          </div>
          <div className="space-y-4">
            <div className="h-20 rounded-2xl bg-gray-200"></div>
            <div className="h-20 rounded-2xl bg-gray-200"></div>
            <div className="h-20 rounded-2xl bg-gray-200"></div>
          </div>
          <div className="mt-6 flex justify-center">
            <div className="h-10 w-32 rounded-full bg-gray-200"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const LotSkeleton = () => (
  <div className="min-h-screen bg-white">
    {/* Breadcrumb */}
    <div className="border-b border-gray-100">
      <div className="max-w-8xl mx-auto px-6 py-4">
        <div className="animate-pulse">
          <div className="h-6 w-64 rounded bg-gray-200" />
        </div>
      </div>
    </div>

    {/* Lot Detail Content */}
    <div className="max-w-8xl mx-auto px-4 py-6 lg:px-6">
      <div className="space-y-8">
        {/* Hero: Gallery + Title/Meta */}
        <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-5">
          {/* Left: Image gallery placeholder */}
          <div className="lg:col-span-2">
            <div className="aspect-square animate-pulse rounded-2xl bg-gray-200" />
          </div>
          {/* Right: Info card */}
          <div className="lg:col-span-3">
            <div className="animate-pulse">
              <div className="mb-3 h-8 w-4/5 rounded bg-gray-200" />
              <div className="mb-4 h-4 w-1/3 rounded bg-gray-200" />

              {/* Key metrics rows */}
              <div className="space-y-3">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-gray-100 py-3 last:border-0">
                    <div className="h-4 w-28 rounded bg-gray-200" />
                    <div className="h-4 w-40 rounded bg-gray-200" />
                  </div>
                ))}
              </div>

              {/* CTA buttons */}
              <div className="mt-4 flex gap-3">
                <div className="h-10 w-36 rounded-full bg-gray-200" />
                <div className="h-10 w-36 rounded-full bg-gray-200" />
              </div>
            </div>
          </div>
        </div>

        {/* Category + Estimates Section */}
        <div className="animate-pulse">
          <div className="mb-3 h-6 w-40 rounded bg-gray-200" />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-gray-200" />
            ))}
          </div>
        </div>

        {/* Load Details Section */}
        <div className="animate-pulse">
          <div className="mb-3 h-6 w-48 rounded bg-gray-200" />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-16 rounded-2xl bg-gray-200" />
            ))}
          </div>
        </div>

        {/* Shipping & Additional Details */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="h-40 animate-pulse rounded-2xl bg-gray-200" />
          <div className="h-40 animate-pulse rounded-2xl bg-gray-200" />
        </div>
      </div>
    </div>
  </div>
);
const DashboardSkeleton = () => (
  <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
    {/* Dashboard stats cards */}
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {Array(4)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border bg-white p-6"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="h-5 w-24 rounded bg-gray-200"></div>
              <div className="h-10 w-10 rounded-full bg-gray-200"></div>
            </div>
            <div className="mb-2 h-8 w-20 rounded bg-gray-200"></div>
            <div className="h-4 w-32 rounded bg-gray-200"></div>
          </div>
        ))}
    </div>

    {/* Dashboard content skeleton */}
    <div className="mb-6 px-4 lg:px-6">
      <div className="rounded-2xl border bg-white p-6">
        <div className="mb-6 h-6 w-48 rounded bg-gray-200"></div>
        <div className="h-64 rounded bg-gray-200"></div>
      </div>
    </div>

    {/* Data table skeleton */}
    <div className="px-3">
      <div className="rounded-2xl border bg-white">
        <div className="p-6">
          <div className="mb-4 h-6 w-32 rounded bg-gray-200"></div>
          <div className="space-y-3">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                  <div className="grid flex-1 grid-cols-4 gap-4">
                    <div className="h-4 rounded bg-gray-200"></div>
                    <div className="h-4 rounded bg-gray-200"></div>
                    <div className="h-4 rounded bg-gray-200"></div>
                    <div className="h-4 rounded bg-gray-200"></div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default memo(PageSkeleton);





