"use client";

import { useRouter } from "next/navigation";
import { memo, useCallback, useRef, useState } from "react";

import { useInfiniteQuery } from "@tanstack/react-query";

import { Skeleton } from "@/src/components/ui/skeleton";
import { CollectionFilters as CollectionFilterControls } from "@/src/features/collections/components/CollectionFilters";
import CatalogCard from "@/src/features/marketplace-catalog/components/CatalogCard";
import { fetchCatalogListingsPaginated } from "@/src/features/marketplace-catalog/services/catalogQueryService";
import type { CatalogListing } from "@/src/features/marketplace-catalog/types/catalog";

/**
 * Full-page catalog listings component with infinite scroll and filtering.
 * Similar to AllCatalogListingsInfiniteSection but designed for dedicated catalog page.
 */
const AllCatalogClientWrapper = memo(() => {
  const router = useRouter();
  const [sortBy, setSortBy] = useState("newest");
  const PAGE_SIZE = 16; // Slightly larger page size for full-page view

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["allCatalogListings"],
    queryFn: ({ pageParam = 0 }) =>
      fetchCatalogListingsPaginated({
        take: PAGE_SIZE,
        skip: pageParam * PAGE_SIZE,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length : undefined;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Flatten all pages into a single array
  const allListings = data?.pages.flatMap((page) => page.listings) ?? [];

  // Sort listings based on selected sort option
  const sortListings = (listings: CatalogListing[]) => {
    const {
      sortCatalogListings,
    } = require("@/src/features/collections/utils/sort");
    return sortCatalogListings(listings, sortBy);
  };

  const displayedListings = sortListings(allListings);

  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer for infinite scroll
  const lastElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (isLoading || isFetchingNextPage) {
        return;
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });

      if (node) {
        observerRef.current.observe(node);
      }
    },
    [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  const handleFilterChange = (filterValue: string) => {
    setSortBy(filterValue);
  };

  /**
   * Loading state: Shows skeleton placeholders while initial data is being fetched.
   */
  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200" />
            <div className="mt-2 h-4 w-24 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200" />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
          {Array.from({ length: 16 }).map((_, i) => (
            <Skeleton
              className="aspect-square w-full rounded-lg"
              key={`catalog-skeleton-${i.toString()}-grid`}
            />
          ))}
        </div>
      </div>
    );
  }

  /**
   * Error state: Shows a message if the API call fails.
   */
  if (isError) {
    return (
      <div className="mx-auto max-w-7xl px-6">
        <div className="py-20 text-center">
          <div className="mb-4 text-xl text-red-600">
            Failed to load catalog listings: {error?.message ?? "Unknown error"}
          </div>
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

  /**
   * Empty state: Shows when no catalog listings are available.
   */
  if (!displayedListings || displayedListings.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-6">
        <div className="py-20 text-center">
          <div className="mb-4 text-xl text-gray-600">
            No catalog listings found
          </div>
          <p className="mb-6 text-gray-500">
            Check back later for new listings from our sellers.
          </p>
          <button
            className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
            onClick={() => router.push("/collections")}
            type="button"
          >
            Browse All Collections
          </button>
        </div>
      </div>
    );
  }

  /**
   * Main render: Displays catalog listing cards in a grid with infinite scroll and filtering.
   */
  return (
    <div className="mx-auto max-w-7xl px-6">
      {/* Header with title and filter controls */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            All Catalog Listings
          </h1>
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

      {/* Grid layout for listings */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
        {displayedListings.map((listing: CatalogListing, index: number) => {
          const isLast = index === displayedListings.length - 1;
          return (
            <div
              className="min-w-0"
              key={`catalog-listing-${listing.id}`}
              ref={isLast ? lastElementRef : null}
            >
              <CatalogCard listing={listing} />
            </div>
          );
        })}
      </div>

      {/* Loading indicator for fetching next page */}
      {isFetchingNextPage && (
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
        </div>
      )}

      {/* End of results indicator */}
      {!hasNextPage && displayedListings.length > 0 && (
        <div className="py-8 text-center text-gray-500">
          <p>You&apos;ve reached the end of all catalog listings</p>
        </div>
      )}
    </div>
  );
});

AllCatalogClientWrapper.displayName = "AllCatalogClientWrapper";

export default AllCatalogClientWrapper;
