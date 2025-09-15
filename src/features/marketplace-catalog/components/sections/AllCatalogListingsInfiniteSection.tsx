"use client";

import Link from "next/link";
import { memo, useCallback, useRef } from "react";

import { useInfiniteQuery } from "@tanstack/react-query";

import { Skeleton } from "@/src/components/ui/skeleton";

import { fetchCatalogListingsPaginated } from "../../services/catalogQueryService";
import CatalogCard from "../CatalogCard";

/**
 * Infinite scroll version of AllCatalogListingsSection for always-visible bottom section.
 * Uses grid layout instead of carousel and supports true infinite scroll.
 * Uses backend pagination with take/skip for efficient data loading.
 */
export const AllCatalogListingsInfiniteSection = memo(() => {
  const PAGE_SIZE = 12;

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["catalogListingsInfinite"],
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

  /**
   * Loading state: Shows skeleton placeholders while initial data is being fetched.
   */
  if (isLoading) {
    return (
      <main className="max-w-8xl mx-auto px-6 py-4 sm:py-12">
        <div className="flex w-full min-w-0 flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-[500] tracking-tighter text-gray-900">
              All Listings
            </h2>
            <Link
              className="text-muted-foreground hover:text-primary text-sm transition-colors"
              href="/collections/catalog"
            >
              View All
            </Link>
          </div>
          <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-5 lg:gap-8">
            {Array.from({ length: 12 }, (_, index) => (
              <Skeleton
                className="aspect-square w-full rounded-lg"
                key={`catalog-infinite-skeleton-${index + 1}`}
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  /**
   * Error state: Shows a message if the API call fails.
   */
  if (isError) {
    return (
      <main className="max-w-8xl mx-auto px-6 py-4 sm:py-12">
        <div className="flex w-full min-w-0 flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-[500] tracking-tighter text-gray-900">
              All Listings
            </h2>
            <Link
              className="text-muted-foreground hover:text-primary text-sm transition-colors"
              href="/collections/catalog"
            >
              View All
            </Link>
          </div>
          <div className="col-span-full mt-4 text-center text-gray-500">
            <p>
              Failed to load catalog listings:{" "}
              {error?.message ?? "Unknown error"}
            </p>
            <p className="mt-1 text-sm">
              Please refresh the page to try again.
            </p>
          </div>
        </div>
      </main>
    );
  }

  /**
   * Empty state: Shows when no catalog listings are available.
   */
  if (!allListings || allListings.length === 0) {
    return (
      <main className="max-w-8xl mx-auto px-6 py-4 sm:py-12">
        <div className="flex w-full min-w-0 flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-[500] tracking-tighter text-gray-900">
              All Listings
            </h2>
            <Link
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              href="/collections/catalog"
            >
              View All
            </Link>
          </div>
          <div className="col-span-full mt-4 text-center text-gray-500">
            <p>No catalog listings available at the moment.</p>
            <p className="mt-1 text-sm">Please check back soon!</p>
          </div>
        </div>
      </main>
    );
  }

  /**
   * Main render: Displays catalog listing cards in a grid with infinite scroll.
   */
  return (
    <main className="max-w-8xl mx-auto px-6 py-4 sm:py-12">
      <div className="flex w-full min-w-0 flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-[500] tracking-tighter text-gray-900">
            All Listings
          </h2>
          <Link
            className="text-muted-foreground hover:text-primary text-sm transition-colors"
            href="/collections/catalog"
          >
            View All
          </Link>
        </div>

        {/* Grid layout for listings */}
        <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-5 lg:gap-8">
          {allListings.map((listing, index) => {
            const isLast = index === allListings.length - 1;
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

          {/* Loading indicator for fetching next page */}
          {isFetchingNextPage && (
            <div className="col-span-full flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-orange-600" />
            </div>
          )}
        </div>
      </div>
    </main>
  );
});

AllCatalogListingsInfiniteSection.displayName =
  "AllCatalogListingsInfiniteSection";
