"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { selectBuyerPreferences } from "@/src/features/buyer-preferences/store/buyerPreferencesSlice";
import {
  fetchBasicCollectionListings,
  fetchPreferenceAwareListings,
  type PreferenceAwareFilters,
} from "@/src/features/collections/services/preferenceAwareCollectionService";
import {
  selectIsViewAllContextFresh,
  selectViewAllContext,
} from "@/src/features/collections/store/viewAllContextSlice";
import CatalogCard from "@/src/features/marketplace-catalog/components/CatalogCard";
import type { CatalogListing } from "@/src/features/marketplace-catalog/types/catalog";
import { useAppSelector } from "@/src/lib/store";
import type { CollectionScope } from "@/src/utils/url";

import { CollectionFilters as CollectionFilterControls } from "./CollectionFilters";

interface CollectionListingsGridProps {
  scope: CollectionScope;
  filters: Record<string, string[]>;
  searchParams: { [key: string]: string | string[] | undefined };
  title?: string;
}

const CollectionListingsGrid = ({
  scope,
  filters,
  title,
}: CollectionListingsGridProps) => {
  const router = useRouter();
  const [allListings, setAllListings] = useState<CatalogListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("newest");

  // Redux selectors for preference context
  const viewAllContext = useAppSelector(selectViewAllContext);
  const isContextFresh = useAppSelector(selectIsViewAllContextFresh);
  const userPreferences = useAppSelector(selectBuyerPreferences);

  // Determine if we should use preference-aware fetching
  const shouldUsePreferences =
    viewAllContext && isContextFresh && userPreferences;

  // Sort listings based on selected sort option
  const sortListings = (listings: CatalogListing[]) => {
    const sortedListings = [...listings];

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

  // Fetch listings based on filters and preference context
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);

        let response;

        if (shouldUsePreferences) {
          const contextPreferences = viewAllContext!.userPreferences;

          const preferenceFilters: PreferenceAwareFilters = {
            categories: filters.categories,
            subcategories: filters.subcategories,
            segments: filters.segments,
            userPreferences: contextPreferences, // Use filtered preferences!
          };

          response = await fetchPreferenceAwareListings(preferenceFilters);
        } else {
          response = await fetchBasicCollectionListings({
            categories: filters.categories,
            subcategories: filters.subcategories,
            segments: filters.segments,
          });
        }

        setAllListings(response.listings);
      } catch (err) {
        setError("Failed to load listings. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [filters, scope, shouldUsePreferences, viewAllContext, userPreferences]);

  const handleFilterChange = (filterValue: string) => {
    setSortBy(filterValue);
  };

  // Apply sorting client-side (no search filtering needed)
  const displayedListings = sortListings(allListings);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div className="animate-pulse" key={index}>
              <div className="mb-4 aspect-square rounded-2xl bg-gray-200" />
              <div className="h-4 rounded bg-gray-200" />
              <div className="mt-2 h-4 w-3/4 rounded bg-gray-200" />
              <div className="mt-4 h-8 rounded-lg bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-6">
        <div className="py-20 text-center">
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

  if (displayedListings.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-6">
        <div className="py-20 text-center">
          <div className="mb-4 text-xl text-gray-600">
            No listings found for this collection.
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
      </div>
    );
  }

  // Get collection display name from scope and filters
  const getCollectionDisplayName = () => {
    // Use the title prop if provided (from page component)
    if (title) {
      return title;
    }

    // Fallback to generating from scope and filters
    if (scope === "category" && filters.categories?.length) {
      if (filters.categories.length === 1) {
        return filters.categories[0]
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
      }
      return "Featured Categories";
    }
    if (scope === "subcategory" && filters.subcategories?.length) {
      if (filters.subcategories.length === 1) {
        return filters.subcategories[0]
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
      }
      return "Featured Subcategories";
    }
    if (scope === "segment" && filters.segments?.length) {
      if (filters.segments.length === 1) {
        return filters.segments[0]
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
      }
      return "Featured Segments";
    }
    if (scope === "catalog") {
      return "All Catalog Listings";
    }
    if (scope === "auctions") {
      return "Live Auctions";
    }
    return "Featured";
  };

  return (
    <div className="mx-auto max-w-7xl px-6">
      {/* Simple Header - Match Reference Design */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {getCollectionDisplayName()}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {displayedListings.length} listings
          </p>
        </div>

        {/* Filter Dropdown - Match Reference Style */}
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

      {/* Grid - Using exact same layout as marketplace */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
        {displayedListings.map((listing) => (
          <div className="min-w-0" key={`listing-${listing.id}`}>
            <CatalogCard listing={listing} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollectionListingsGrid;
