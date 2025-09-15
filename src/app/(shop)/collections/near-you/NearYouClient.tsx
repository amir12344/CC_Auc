"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";

import { CollectionFilters as CollectionFilterControls } from "@/src/features/collections/components/CollectionFilters";
import CatalogCard from "@/src/features/marketplace-catalog/components/CatalogCard";
import type { CatalogListing } from "@/src/features/marketplace-catalog/types/catalog";
import type { CombinedListing } from "@/src/features/marketplace-catalog/types/combined-listing";

export interface NearYouClientProps {
  allListings: CombinedListing[];
  displayListings: CatalogListing[];
  loading: boolean;
  error: string | null;
}

const NearYouClient: React.FC<NearYouClientProps> = ({
  allListings,
  displayListings,
  loading,
  error,
}) => {
  const router = useRouter();
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

  const handleFilterChange = (filterValue: string) => {
    setSortBy(filterValue);
  };

  const displayedListings = sortListings(displayListings);

  if (displayedListings.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-6">
        <div className="py-20 text-center">
          <div className="mb-4 text-xl text-gray-600">
            No listings found in your region
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

  // Simple title - just "Near You"
  const getTitle = () => {
    return "Near You";
  };

  return (
    <div className="mx-auto max-w-7xl px-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{getTitle()}</h1>
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

export default NearYouClient;
