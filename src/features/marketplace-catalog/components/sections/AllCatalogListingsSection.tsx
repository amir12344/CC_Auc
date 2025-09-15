"use client";

import { memo } from "react";

import { useQuery } from "@tanstack/react-query";

import { ErrorBoundary } from "@/src/components/ErrorBoundary";
import { Skeleton } from "@/src/components/ui/skeleton";

import { fetchCatalogListings } from "../../services/catalogQueryService";
import CatalogCard from "../CatalogCard";
import { ProductSection } from "../ProductSection";

/**
 * A self-contained component to display all catalog listings.
 * This is a temporary section until backend preference filtering is implemented.
 *
 * Features:
 * - Fetches all catalog listings using the catalogQueryService.
 * - Manages its own loading and error states.
 * - Displays listings in a carousel layout using the ProductSection component.
 * - Uses ErrorBoundary for individual card robustness.
 */
export const AllCatalogListingsSection = memo(() => {
  const {
    data: listings,
    isLoading: loading,
    isError,
    error,
  } = useQuery({
    queryKey: ["catalogListings"],
    queryFn: fetchCatalogListings,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30_000),
    throwOnError: false,
  });

  /**
   * Loading state: Shows skeleton placeholders while data is being fetched.
   */
  if (loading) {
    return (
      <ProductSection
        layout="carousel"
        title="All Listings"
        viewAllLink="/collections/catalog"
      >
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton
            className="aspect-square w-full rounded-lg"
            key={`catalog-skeleton-${index + 1}`}
          />
        ))}
      </ProductSection>
    );
  }

  /**
   * Error state: Shows a message if the API call fails.
   */
  if (isError) {
    return (
      <ProductSection
        layout="carousel"
        title="All Listings"
        viewAllLink="/collections/catalog"
      >
        <div className="col-span-full mt-4 text-center text-gray-500">
          <p>
            Failed to load catalog listings: {error?.message ?? "Unknown error"}
          </p>
          <p className="mt-1 text-sm">Please refresh the page to try again.</p>
        </div>
      </ProductSection>
    );
  }

  /**
   * Empty state: Shows when no catalog listings are available.
   */
  if (!listings || listings.length === 0) {
    return (
      <ProductSection
        layout="carousel"
        title="All Listings"
        viewAllLink="/collections/catalog"
      >
        <div className="col-span-full mt-4 text-center text-gray-500">
          <p>No catalog listings available at the moment.</p>
          <p className="mt-1 text-sm">Please check back soon!</p>
        </div>
      </ProductSection>
    );
  }

  /**
   * Main render: Displays the catalog listing cards.
   */
  return (
    <ProductSection
      layout="carousel"
      title="All Listings"
      viewAllLink="/collections/catalog"
    >
      {listings.map((listing) => (
        <ErrorBoundary
          fallback={<Skeleton className="aspect-square w-full rounded-lg" />}
          key={listing.id}
        >
          <CatalogCard listing={listing} />
        </ErrorBoundary>
      ))}
    </ProductSection>
  );
});

AllCatalogListingsSection.displayName = "AllCatalogListingsSection";
