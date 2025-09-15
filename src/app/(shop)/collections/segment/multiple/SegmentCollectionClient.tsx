"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { CollectionFilters as CollectionFilterControls } from "@/src/features/collections/components/CollectionFilters";
import CatalogCard from "@/src/features/marketplace-catalog/components/CatalogCard";
import {
  fetchSegmentOnlyListings,
  transformCombinedListingToCatalogListing,
} from "@/src/features/marketplace-catalog/services/catalogPreferenceQueryService";
import type { CatalogListing } from "@/src/features/marketplace-catalog/types/catalog";

interface SegmentCollectionClientProps {
  segmentEnumValues: string[];
  title: string;
}

const SegmentCollectionClient = ({
  segmentEnumValues,
  title,
}: SegmentCollectionClientProps) => {
  const router = useRouter();
  const [allListings, setAllListings] = useState<CatalogListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("newest");

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

  // Fetch segment-only listings
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if we have segments
        if (!segmentEnumValues?.length) {
          setAllListings([]);
          setLoading(false);
          return;
        }

        // Use specialized segment-only function
        const response = await fetchSegmentOnlyListings(segmentEnumValues);

        // Transform combined listings to catalog listings
        const transformedListings = await Promise.all(
          response.listings
            .filter((l) => l.listing_source === "catalog")
            .map(transformCombinedListingToCatalogListing)
        );

        setAllListings(transformedListings);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load listings"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [segmentEnumValues]);

  const handleFilterChange = (filterValue: string) => {
    setSortBy(filterValue);
  };

  const displayedListings = sortListings(allListings);

  if (!segmentEnumValues?.length) {
    return (
      <div className="mx-auto max-w-7xl px-6">
        <div className="py-20 text-center">
          <div className="mb-4 text-xl text-gray-600">
            No segments specified
          </div>
          <p className="mb-6 text-gray-500">
            Please select buyer segments to see relevant listings.
          </p>
          <button
            className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
            onClick={() => router.push("/marketplace")}
          >
            Go to Marketplace
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
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
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="min-w-0">
              <div className="aspect-square w-full animate-pulse rounded-lg bg-gray-200" />
              <div className="mt-4 h-4 rounded bg-gray-200" />
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
            No listings found for these segments
          </div>
          <p className="mb-6 text-gray-500">
            Try browsing other collections or check back later for new items.
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

  return (
    <div className="mx-auto max-w-7xl px-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
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

export default SegmentCollectionClient;
