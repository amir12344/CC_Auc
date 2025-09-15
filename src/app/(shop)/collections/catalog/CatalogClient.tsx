"use client";

import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";

import { CollectionFilters as CollectionFilterControls } from "@/src/features/collections/components/CollectionFilters";
import CatalogCard from "@/src/features/marketplace-catalog/components/CatalogCard";
import type { CatalogListing } from "@/src/features/marketplace-catalog/types/catalog";

export interface CatalogClientProps {
  allListings: CatalogListing[];
  displayListings: CatalogListing[];
  loading: boolean;
  error: string | null;
}

/**
 * Catalog display component for the catalog collection page.
 * Handles sorting, display, and user interactions for catalog listings.
 * Separated from CatalogClientWrapper for clean separation of concerns.
 */
const CatalogClient: React.FC<CatalogClientProps> = ({
  allListings,
  displayListings,
  loading,
  error,
}) => {
  const router = useRouter();
  const [sortBy, setSortBy] = useState("newest");

  // Sort listings based on selected sort option
  const sortedListings = useMemo(() => {
    const listingsToSort = [...displayListings];

    switch (sortBy) {
      case "price-low":
        return listingsToSort.sort((a, b) => {
          const priceA = a.minimum_order_value || 0;
          const priceB = b.minimum_order_value || 0;
          return priceA - priceB;
        });
      case "price-high":
        return listingsToSort.sort((a, b) => {
          const priceA = a.minimum_order_value || 0;
          const priceB = b.minimum_order_value || 0;
          return priceB - priceA;
        });
      case "newest":
      default:
        return listingsToSort; // Keep original order (assumed to be newest first)
    }
  }, [displayListings, sortBy]);

  /**
   * Handle filter changes from collection filter controls
   */
  const handleFilterChange = (filterValue: string) => {
    // Note: Main filtering is handled by PageSpecificFilterSidebar in parent wrapper
    // This handler is for any additional controls like sort order
  };

  /**
   * Loading state: Shows skeleton placeholders while initial data is being fetched.
   */
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-64 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="h-10 w-32 animate-pulse rounded bg-gray-200" />
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="space-y-4">
              <div className="aspect-square animate-pulse rounded-lg bg-gray-200" />
              <div className="space-y-2">
                <div className="h-4 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-6 w-1/2 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /**
   * Error state: Shows error message with retry option.
   */
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 text-red-600">
          <svg
            className="mx-auto h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          Unable to Load Listings
        </h3>
        <p className="mb-6 max-w-md text-gray-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  /**
   * Empty state: Shows when no listings match the current filters.
   */
  if (sortedListings.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-gray-900">
              All Catalog Listings
            </h1>
            <p className="text-gray-600">
              Browse our complete catalog of products from trusted sellers
            </p>
          </div>
          <CollectionFilterControls onFilterChange={handleFilterChange} />
        </div>

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 text-gray-400">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            No Listings Found
          </h3>
          <p className="max-w-md text-gray-600">
            No products match your current filter criteria. Try adjusting your
            filters or check back later for new listings.
          </p>
        </div>
      </div>
    );
  }

  /**
   * Main content: Shows filtered and sorted listings in a responsive grid.
   */
  return (
    <div className="space-y-6">
      {/* Header with title and controls */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">
            All Catalog Listings
          </h1>
          <p className="text-gray-600">
            Browse our complete catalog of products from trusted sellers
            {sortedListings.length !== allListings.length && (
              <span className="ml-1">
                • Showing {sortedListings.length.toLocaleString()} of{" "}
                {allListings.length.toLocaleString()} results
              </span>
            )}
          </p>
        </div>
        <CollectionFilterControls onFilterChange={handleFilterChange} />
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sortedListings.map((listing) => (
          <div key={listing.id} className="group">
            <CatalogCard listing={listing} />
          </div>
        ))}
      </div>

      {/* Results Summary */}
      {sortedListings.length > 0 && (
        <div className="flex items-center justify-center pt-8 text-sm text-gray-500">
          Showing {sortedListings.length.toLocaleString()}
          {sortedListings.length !== allListings.length
            ? ` of ${allListings.length.toLocaleString()} total`
            : ""}{" "}
          catalog listings
        </div>
      )}
    </div>
  );
};

export default CatalogClient;
