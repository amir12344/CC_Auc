"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

import { getStateCodesForRegions } from "@/src/features/buyer-preferences/data/preferenceOptions";
import { REGION_ENUM_TO_KEY } from "@/src/features/buyer-preferences/data/regions";
import {
  fetchBuyerPreferences,
  selectBuyerPreferences,
  selectBuyerPreferencesStatus,
} from "@/src/features/buyer-preferences/store/buyerPreferencesSlice";
import { transformCombinedListingToCatalogListing } from "@/src/features/marketplace-catalog/services/catalogPreferenceQueryService";
import type { CatalogListing } from "@/src/features/marketplace-catalog/types/catalog";
import type { CombinedListing } from "@/src/features/marketplace-catalog/types/combined-listing";
import { useAppDispatch, useAppSelector } from "@/src/lib/store";

import NearYouClient from "./NearYouClient";

// Lazy-load the heavy filter sidebar to keep initial JS light
const PageSpecificFilterSidebar = dynamic(
  () =>
    import("@/src/features/filters/components/PageSpecificFilterSidebar").then(
      (m) => m.PageSpecificFilterSidebar
    ),
  { ssr: false }
);

const NearYouClientWrapper: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [allListings, setAllListings] = useState<CombinedListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<CombinedListing[]>(
    []
  );
  const [displayListings, setDisplayListings] = useState<CatalogListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get user's region preferences from Redux
  const userPreferences = useAppSelector(selectBuyerPreferences);
  const preferencesStatus = useAppSelector(selectBuyerPreferencesStatus);

  // Fetch preferences on mount if not already loaded
  useEffect(() => {
    if (preferencesStatus === "idle") {
      dispatch(fetchBuyerPreferences());
    }
  }, [dispatch, preferencesStatus]);

  // Fetch region-only listings on mount and when preferences change
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);

        // Wait for preferences to be loaded before proceeding
        if (preferencesStatus === "loading" || preferencesStatus === "idle") {
          return; // Don't fetch listings while preferences are still loading
        }

        // Check if preferences failed to load
        if (preferencesStatus === "failed") {
          setError("Failed to load user preferences");
          setAllListings([]);
          setFilteredListings([]);
          setDisplayListings([]);
          setLoading(false);
          return;
        }

        // Check if user has region preferences
        if (!userPreferences?.preferredRegions?.length) {
          setAllListings([]);
          setFilteredListings([]);
          setDisplayListings([]);
          setLoading(false);
          return;
        }

        // Convert regions to state codes using shared mapping
        const regionKeys = userPreferences.preferredRegions
          .map((enumValue) => REGION_ENUM_TO_KEY[enumValue])
          .filter(Boolean);

        const stateCodes = getStateCodesForRegions(regionKeys);

        if (!stateCodes?.length) {
          setAllListings([]);
          setFilteredListings([]);
          setDisplayListings([]);
          setLoading(false);
          return;
        }

        // Fetch listings via server API with ISR
        const res = await fetch("/api/collections/near-you", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stateCodes }),
        });
        const response = await res.json();

        // Store raw listings for filtering
        const rawListings = (
          response.listings as Array<{ listing_source: string }>
        ).filter(
          (l) => l.listing_source === "catalog"
        ) as unknown as CombinedListing[];
        setAllListings(rawListings);

        // Initially, filtered listings = all listings (no filters applied yet)
        setFilteredListings(rawListings);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load listings"
        );
        setAllListings([]);
        setFilteredListings([]);
        setDisplayListings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [userPreferences, preferencesStatus]);

  // Transform filtered listings to catalog listings for display
  useEffect(() => {
    const transformListings = async () => {
      if (filteredListings.length === 0) {
        setDisplayListings([]);
        return;
      }

      try {
        const transformedListings = await Promise.all(
          filteredListings.map(transformCombinedListingToCatalogListing)
        );
        setDisplayListings(transformedListings);
      } catch (err) {
        setDisplayListings([]);
      }
    };

    transformListings();
  }, [filteredListings]);

  // Handle filtered listings change from filter sidebar
  const handleFilteredListingsChange = useCallback(
    (newFilteredListings: CombinedListing[]) => {
      setFilteredListings(newFilteredListings);
    },
    []
  );

  // Loading state
  if (loading) {
    return (
      <div className="flex gap-8">
        {/* Filter Sidebar Skeleton */}
        <div className="hidden w-80 flex-shrink-0 lg:block">
          <div className="sticky top-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="mb-4 h-6 w-24 animate-pulse rounded bg-gray-200" />
              <div className="space-y-4">
                <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="min-w-0 flex-1">
          <NearYouClient
            allListings={[] as CombinedListing[]}
            displayListings={[] as CatalogListing[]}
            error={null}
            loading={true}
          />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex gap-8">
        <div className="min-w-0 flex-1">
          <NearYouClient
            allListings={[] as CombinedListing[]}
            displayListings={[] as CatalogListing[]}
            error={error}
            loading={false}
          />
        </div>
      </div>
    );
  }

  // No preferences state
  if (!userPreferences?.preferredRegions?.length) {
    return (
      <div className="flex gap-8">
        <div className="min-w-0 flex-1">
          <div className="mx-auto max-w-7xl px-6">
            <div className="py-20 text-center">
              <div className="mb-4 text-xl text-gray-600">
                No region preferences set
              </div>
              <p className="mb-6 text-gray-500">
                Please set your region preferences to see listings near you.
              </p>
              <button
                className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
                onClick={() => router.push("/marketplace")}
              >
                Go to Marketplace
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-8">
      {/* Page-Specific Filter Sidebar */}
      <div className="hidden w-80 flex-shrink-0 lg:block">
        <div className="sticky top-6">
          <PageSpecificFilterSidebar
            listings={allListings}
            onFilteredListingsChangeAction={handleFilteredListingsChange}
            pageContext={{
              type: "near-you",
              title: "Near You",
              hideCategories: false, // Show categories for Near You page
            }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="min-w-0 flex-1">
        <NearYouClient
          allListings={allListings}
          displayListings={displayListings}
          error={null}
          loading={false}
        />
      </div>
    </div>
  );
};

export default NearYouClientWrapper;
