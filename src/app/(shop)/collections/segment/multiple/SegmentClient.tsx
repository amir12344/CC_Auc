"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import { CollectionFilters as CollectionFilterControls } from "@/src/features/collections/components/CollectionFilters";
import CatalogCard from "@/src/features/marketplace-catalog/components/CatalogCard";
import { transformCombinedListingToCatalogListing } from "@/src/features/marketplace-catalog/services/catalogPreferenceQueryService";
import type { CatalogListing } from "@/src/features/marketplace-catalog/types/catalog";
import type { CombinedListing } from "@/src/features/marketplace-catalog/types/combined-listing";

interface SegmentClientProps {
  listings: CombinedListing[];
  allListingsCount: number;
  loading: boolean;
  error: string | null;
  segmentEnumValues: string[];
  title: string;
}

const SegmentClient: React.FC<SegmentClientProps> = ({
  listings,
  allListingsCount,
  loading,
  error,
  segmentEnumValues,
  title,
}) => {
  const router = useRouter();
  const [sortBy, setSortBy] = useState("newest");
  const [transformedListings, setTransformedListings] = useState<
    CatalogListing[]
  >([]);
  const [transforming, setTransforming] = useState(false);

  // Transform listings to catalog format when listings change
  useEffect(() => {
    const transformListings = async () => {
      if (listings.length > 0) {
        setTransforming(true);
        try {
          const transformed = await Promise.all(
            listings
              .filter((l) => l.listing_source === "catalog")
              .map(transformCombinedListingToCatalogListing)
          );
          setTransformedListings(transformed);
        } catch (err) {
          setTransformedListings([]);
        }
        setTransforming(false);
      } else {
        setTransformedListings([]);
      }
    };

    transformListings();
  }, [listings]);

  // Sort listings based on selected sort option
  const sortListings = (listingsToSort: CatalogListing[]) => {
    const sortedListings = [...listingsToSort];

    switch (sortBy) {
      case "price-asc":
        return sortedListings.sort(
          (a, b) => a.minimum_order_value - b.minimum_order_value
        );
      case "price-desc":
        return sortedListings.sort(
          (a, b) => b.minimum_order_value - a.minimum_order_value
        );
      case "name-asc":
        return sortedListings.sort((a, b) => a.title.localeCompare(b.title));
      case "name-desc":
        return sortedListings.sort((a, b) => b.title.localeCompare(a.title));
      default:
        return sortedListings;
    }
  };

  const handleFilterChange = (filterValue: string) => {
    setSortBy(filterValue);
  };

  const displayedListings = sortListings(transformedListings);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="mb-8 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="h-10 w-40 animate-pulse rounded-lg bg-gray-200" />
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div className="space-y-4" key={i}>
              <div className="aspect-square w-full animate-pulse rounded-lg bg-gray-200" />
              <div className="space-y-2">
                <div className="h-4 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-6 w-20 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
            <p className="mt-1 text-sm text-gray-600">
              Browse segments from trusted sellers
            </p>
          </div>
        </div>

        {/* Error State */}
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 text-xl text-red-600">{error}</div>
          <button
            className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
            onClick={() => window.location.reload()}
            type="button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No segments state
  if (!segmentEnumValues?.length) {
    return (
      <div className="py-20 text-center">
        <div className="mb-4 text-gray-400">
          <svg
            className="mx-auto h-12 w-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 515.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          No Segments Specified
        </h3>
        <p className="mb-6 max-w-md text-gray-600">
          Please select buyer segments to see relevant listings.
        </p>
        <button
          className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
          onClick={() => router.push("/marketplace")}
        >
          Go to Marketplace
        </button>
      </div>
    );
  }

  // No results state
  if (displayedListings.length === 0 && !transforming) {
    return (
      <div className="py-20 text-center">
        <div className="mb-4 text-xl text-gray-600">
          No listings found for these segments
        </div>
        <p className="mb-6 text-gray-500">
          Try browsing other collections or check back later for new items.
        </p>
        <button
          className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
          onClick={() => router.push("/collections")}
        >
          Browse All Collections
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          <p className="mt-1 text-sm text-gray-600">
            {displayedListings.length} listings
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center">
          <CollectionFilterControls
            defaultFilter={sortBy}
            filterOptions={[
              { label: "Recently added", value: "newest" },
              { label: "Price: Low to High", value: "price-asc" },
              { label: "Price: High to Low", value: "price-desc" },
              { label: "Name: A to Z", value: "name-asc" },
              { label: "Name: Z to A", value: "name-desc" },
            ]}
            onFilterChange={handleFilterChange}
          />
        </div>
      </div>

      {/* Grid */}
      {transforming ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div className="space-y-4" key={i}>
              <div className="aspect-square w-full animate-pulse rounded-lg bg-gray-200" />
              <div className="space-y-2">
                <div className="h-4 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-6 w-20 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayedListings.map((listing) => (
            <div className="min-w-0" key={`listing-${listing.id}`}>
              <CatalogCard listing={listing} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SegmentClient;
