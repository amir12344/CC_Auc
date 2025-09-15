"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

import { transformCombinedListingToCatalogListing } from "@/src/features/marketplace-catalog/services/catalogPreferenceQueryService";
import type { CatalogListing } from "@/src/features/marketplace-catalog/types/catalog";
import type { CombinedListing } from "@/src/features/marketplace-catalog/types/combined-listing";

import PrivateOffersClient from "./PrivateOffersClient";

// Lazy-load the heavy filter sidebar to keep initial JS light
const PageSpecificFilterSidebar = dynamic(
  () =>
    import("@/src/features/filters/components/PageSpecificFilterSidebar").then(
      (m) => m.PageSpecificFilterSidebar
    ),
  { ssr: false }
);

const PrivateOffersClientWrapper: React.FC = () => {
  const router = useRouter();
  const [allListings, setAllListings] = useState<CombinedListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<CombinedListing[]>(
    []
  );
  const [displayListings, setDisplayListings] = useState<CatalogListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch private offers listings on mount
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch listings via server API with ISR
        const res = await fetch("/api/collections/private-offers", {
          method: "GET",
        });
        const response = await res.json();

        // Store raw listings for filtering (all are catalog listings with isPrivate: true)
        const rawListings = response.listings;
        setAllListings(rawListings);

        // Initially, filtered listings = all listings (no filters applied yet)
        setFilteredListings(rawListings);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load private offers"
        );
        setAllListings([]);
        setFilteredListings([]);
        setDisplayListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  // Transform filtered listings to display format whenever they change
  useEffect(() => {
    const transformListings = async () => {
      if (filteredListings.length === 0) {
        setDisplayListings([]);
        return;
      }

      try {
        // Transform filtered listings to catalog format for display
        const transformedListings = await Promise.all(
          filteredListings.map((listing) =>
            transformCombinedListingToCatalogListing(listing)
          )
        );
        setDisplayListings(transformedListings);
      } catch (err) {
        setDisplayListings([]);
      }
    };

    transformListings();
  }, [filteredListings]);

  // Handle filtered listings change from sidebar
  const handleFilteredListingsChange = useCallback(
    (newFilteredListings: CombinedListing[]) => {
      setFilteredListings(newFilteredListings);
    },
    []
  );

  if (loading) {
    return (
      <div className="flex gap-8">
        {/* Filter Sidebar Skeleton */}
        <div className="hidden w-80 flex-shrink-0 lg:block">
          <div className="sticky top-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="mb-4 h-6 w-24 animate-pulse rounded bg-gray-200" />
              <div className="space-y-3">
                <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex gap-8">
        {/* Empty Filter Sidebar */}
        <div className="hidden w-80 flex-shrink-0 lg:block">
          <div className="sticky top-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="text-center text-sm text-gray-500">
                No listings available for filtering
              </div>
            </div>
          </div>
        </div>

        {/* Error Content */}
        <div className="min-w-0 flex-1">
          <div className="py-20 text-center">
            <div className="mb-2 text-lg font-medium text-red-600">
              Error Loading Private Offers
            </div>
            <div className="mb-4 text-gray-600">{error}</div>
            <button
              className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-8">
      {/* Filter Sidebar */}
      <div className="hidden w-80 flex-shrink-0 lg:block">
        <div className="sticky top-6">
          <PageSpecificFilterSidebar
            listings={allListings}
            onFilteredListingsChangeAction={handleFilteredListingsChange}
            pageContext={{
              type: "private-offers",
              title: "Private Offers",
            }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="min-w-0 flex-1">
        <PrivateOffersClient
          error={null}
          listings={displayListings}
          loading={false}
        />
      </div>
    </div>
  );
};

export default PrivateOffersClientWrapper;
