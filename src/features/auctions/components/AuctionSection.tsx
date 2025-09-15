"use client";

import { memo } from "react";

import { useQuery } from "@tanstack/react-query";

import { ErrorBoundary } from "@/src/components/ErrorBoundary";
import { Skeleton } from "@/src/components/ui/skeleton";
import { ProductSection } from "@/src/features/marketplace-catalog/components/ProductSection";

import { fetchAuctionListings } from "../services/auctionQueryService";
import type { AuctionListingItem } from "../types";
import AuctionCard from "./AuctionCard";

/**
 * AuctionSection - Client Component for displaying auction listings
 * Shows active auctions in a carousel layout on the marketplace page
 *
 * Features:
 * - Fetches auction data from API using the queryData function
 * - Service returns already transformed UI-ready AuctionListingItem objects
 * - Uses carousel layout for horizontal scrolling
 * - Error boundary for individual auction cards
 * - Loading states and empty states
 */
export const AuctionSection = memo(() => {
  const {
    data: auctionList,
    isLoading: loading,
    isError,
    error,
  } = useQuery({
    queryKey: ["auctionListings"],
    queryFn: fetchAuctionListings,
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
        title="Live Auctions"
        viewAllLink="/collections/auctions"
      >
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton
            className="aspect-square w-full rounded-lg"
            key={`auction-skeleton-${index + 1}`}
          />
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
        title="Live Auctions"
        viewAllLink="/collections/auctions"
      >
        <div className="col-span-full mt-4 text-center text-gray-500">
          <p>Failed to load auctions: {error?.message ?? "Unknown error"}</p>
          <p className="mt-1 text-sm">Please refresh the page to try again.</p>
        </div>
      </ProductSection>
    );
  }

  /**
   * Empty state - shows when no auctions are available
   */
  if (!auctionList || auctionList.length === 0) {
    return (
      <ProductSection
        layout="carousel"
        title="Live Auctions"
        viewAllLink="/collections/auctions"
      >
        <div className="col-span-full mt-4 text-center text-gray-500">
          <p>No active auctions at the moment.</p>
          <p className="mt-1 text-sm">
            Check back soon for new auction listings!
          </p>
        </div>
      </ProductSection>
    );
  }

  /**
   * Main render - displays auction cards with API data
   */
  return (
    <ProductSection
      layout="carousel"
      title="Live Auctions"
      viewAllLink="/collections/auctions"
    >
      {auctionList.map((auction: AuctionListingItem) => (
        <ErrorBoundary
          fallback={<Skeleton className="aspect-square w-full rounded-lg" />}
          key={auction.id}
        >
          <AuctionCard auction={auction} />
        </ErrorBoundary>
      ))}
    </ProductSection>
  );
});

AuctionSection.displayName = "AuctionSection";
