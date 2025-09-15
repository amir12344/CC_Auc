"use client";

import dynamic from "next/dynamic";
import React, { useCallback, useEffect, useState } from "react";

import { selectBuyerPreferences } from "@/src/features/buyer-preferences/store/buyerPreferencesSlice";
import { transformCombinedListingToCatalogListing } from "@/src/features/marketplace-catalog/services/catalogPreferenceQueryService";
import { fetchAllCatalogListingsForFiltering } from "@/src/features/marketplace-catalog/services/catalogQueryService";
import type { CatalogListing } from "@/src/features/marketplace-catalog/types/catalog";
import type { CombinedListing } from "@/src/features/marketplace-catalog/types/combined-listing";
import { useAppSelector } from "@/src/lib/store";

import CatalogClient, { type CatalogClientProps } from "./CatalogClient";

// Lazy-load the heavy filter sidebar to keep initial JS light
const PageSpecificFilterSidebar = dynamic(
  () =>
    import("@/src/features/filters/components/PageSpecificFilterSidebar").then(
      (m) => m.PageSpecificFilterSidebar
    ),
  { ssr: false }
);

/**
 * Client wrapper component for catalog collection page with preference-based filtering.
 * Follows the established pattern from NearYouClientWrapper.
 *
 * Features:
 * - Fetches all listings based on user preferences
 * - Integrates with PageSpecificFilterSidebar for client-side filtering
 * - Transforms data between CombinedListing and CatalogListing formats
 * - Manages loading states and error handling
 */
const CatalogClientWrapper: React.FC = () => {
  const [allListings, setAllListings] = useState<CombinedListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<CombinedListing[]>(
    []
  );
  const [displayListings, setDisplayListings] = useState<CatalogListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get user's preferences from Redux
  const userPreferences = useAppSelector(selectBuyerPreferences);

  // Fetch all catalog listings on mount (preferences used for client-side filtering only)
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch ALL catalog listings (not preference-filtered)
        const response = await fetchAllCatalogListingsForFiltering();

        setAllListings(response.listings);
        setFilteredListings(response.listings); // Initially show all fetched listings
        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch listings"
        );
        setLoading(false);
      }
    };

    fetchListings();
  }, []); // No dependency on userPreferences - fetch all listings once

  // Transform filtered listings to display format whenever filteredListings changes
  useEffect(() => {
    const transformListings = async () => {
      if (filteredListings.length === 0) {
        setDisplayListings([]);
        return;
      }

      try {
        // Transform all filtered listings to CatalogListing format
        const transformed = await Promise.all(
          filteredListings.map((listing) =>
            transformCombinedListingToCatalogListing(listing)
          )
        );

        setDisplayListings(transformed);
      } catch (err) {
        setError("Failed to process listings for display");
      }
    };

    transformListings();
  }, [filteredListings]);

  // Handle filter changes from PageSpecificFilterSidebar
  const handleFilteredListingsChange = useCallback(
    (newFilteredListings: CombinedListing[]) => {
      setFilteredListings(newFilteredListings);
    },
    []
  );

  // Prepare props for CatalogClient
  const catalogClientProps: CatalogClientProps = {
    allListings: displayListings,
    displayListings,
    loading,
    error,
  };

  return (
    <div className="flex gap-8">
      {/* Filter Sidebar */}
      <div className="hidden w-80 flex-shrink-0 lg:block">
        <div className="sticky top-6">
          <PageSpecificFilterSidebar
            listings={allListings}
            onFilteredListingsChangeAction={handleFilteredListingsChange}
            pageContext={{ type: "catalog", title: "All Categories" }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="min-w-0 flex-1">
        <CatalogClient {...catalogClientProps} />
      </div>
    </div>
  );
};

export default CatalogClientWrapper;
