"use client";

import { memo } from "react";

import { useQuery } from "@tanstack/react-query";

import { ErrorBoundary } from "@/src/components/ErrorBoundary";
import LotListingCardSkeleton from "@/src/components/skeletons/LotListingCardSkeleton";
import { ProductSection } from "@/src/features/marketplace-catalog/components/ProductSection";

import {
  fetchLotListings,
  type LotListing,
} from "../../services/lotListingQueryService";
import LotListingCard from "./LotListingCard";

/**
 * LotListingSection - Client Component for displaying lot listings
 * Shows active lot listings in a carousel layout on the marketplace page
 *
 * Features:
 * - Fetches lot listing data from API using the queryData function
 * - Service returns already transformed UI-ready LotListing objects
 * - Uses carousel layout for horizontal scrolling
 * - Error boundary for individual lot listing cards
 * - Loading states and empty states
 */
export const LotListingSection = memo(() => {
  const VIEW_ALL_PATH = "/collections/lots";
  const {
    data: lotListings,
    isLoading: loading,
    isError,
    error,
  } = useQuery({
    queryKey: ["lotListings"],
    queryFn: fetchLotListings,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30_000),
    throwOnError: false,
  });

  /**
   * Loading state - shows skeleton cards while data is being fetched
   */
  if (loading) {
    return (
      <ProductSection
        layout="carousel"
        title="Lot Listings"
        viewAllLink={VIEW_ALL_PATH}
      >
        {Array.from({ length: 4 }, (_, index) => (
          <LotListingCardSkeleton key={`lot-listing-skeleton-${index + 1}`} />
        ))}
      </ProductSection>
    );
  }

  /**
   * Error state - shows when API call fails
   */
  if (isError) {
    return (
      <ProductSection
        layout="carousel"
        title="Lot Listings"
        viewAllLink={VIEW_ALL_PATH}
      >
        <div className="col-span-full mt-4 text-center text-gray-500">
          <p>
            Failed to load lot listings: {error?.message ?? "Unknown error"}
          </p>
          <p className="mt-1 text-sm">Please refresh the page to try again.</p>
        </div>
      </ProductSection>
    );
  }

  /**
   * Empty state - shows when no lot listings are available
   */
  if (!lotListings || lotListings.length === 0) {
    return (
      <ProductSection
        layout="carousel"
        title="Lot Listings"
        viewAllLink={VIEW_ALL_PATH}
      >
        <div className="col-span-full mt-4 text-center text-gray-500">
          <p>No lot listings available at the moment.</p>
          <p className="mt-1 text-sm">Check back soon for new lot listings!</p>
        </div>
      </ProductSection>
    );
  }

  /**
   * Main render - displays lot listing cards with API data
   * Console logging included for data verification as requested
   */
  return (
    <ProductSection
      layout="carousel"
      title="Lot Listings"
      viewAllLink={VIEW_ALL_PATH}
    >
      {lotListings.map((lotListing: LotListing) => (
        <ErrorBoundary
          fallback={<LotListingCardSkeleton />}
          key={lotListing.id}
        >
          <LotListingCard lotListing={lotListing} />
        </ErrorBoundary>
      ))}
    </ProductSection>
  );
});

LotListingSection.displayName = "LotListingSection";
