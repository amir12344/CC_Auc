"use client";

import { notFound } from "next/navigation";
import React from "react";

import { useQuery } from "@tanstack/react-query";

import { DynamicBreadcrumb } from "@/src/components/ui/DynamicBreadcrumb";
import PageSkeleton from "@/src/components/ui/PageSkeleton";
import { CatalogDetailClient } from "@/src/features/marketplace-catalog";
import { fetchCatalogListingById } from "@/src/features/marketplace-catalog/services/catalogQueryService";

/**
 * Catalog Detail Page - Optimized with TanStack Query
 * URL Structure: /marketplace/catalog/[id]
 * Example: /marketplace/catalog/tKarAZZYZzmZ6m (real public_id)
 */

interface CatalogPageProps {
  params: Promise<{ id: string }>;
}

// Custom hook for catalog data with optimized caching
const useCatalogData = (id: string) => {
  return useQuery({
    queryKey: ["catalog", id],
    queryFn: () => fetchCatalogListingById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
    gcTime: 30 * 60 * 1000, // 30 minutes - cache retention
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30_000), // Exponential backoff
    throwOnError: false, // Handle errors gracefully
  });
};

// Main page component with proper parameter handling
export default function CatalogPage({ params }: CatalogPageProps) {
  // Extract id from params promise using React.use() - Next.js 15.3 pattern
  const { id } = React.use(params);

  const { data: catalogListing, isLoading, isError } = useCatalogData(id);

  if (isLoading) {
    // Use the reusable PageSkeleton component with 'catalog' type
    return <PageSkeleton type="catalog" />;
  }

  if (isError || !catalogListing) {
    notFound();
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-gray-100">
        <div className="max-w-8xl mx-auto px-6 py-4">
          <DynamicBreadcrumb
            items={[
              { label: "Home", href: "/marketplace" },
              { label: "Catalog", href: "/collections/catalog" },
              {
                label: catalogListing.title,
                href: `/marketplace/catalog/${id}`,
                current: true,
              },
            ]}
          />
        </div>
      </div>

      {/* Catalog Details Content */}
      <div className="max-w-8xl mx-auto px-4 py-6 lg:px-6">
        <CatalogDetailClient catalogListing={catalogListing} />
      </div>
    </div>
  );
}
