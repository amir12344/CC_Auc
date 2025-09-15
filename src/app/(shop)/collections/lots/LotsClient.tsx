"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

import { CollectionFilters as CollectionFilterControls } from "@/src/features/collections/components/CollectionFilters";
import LotListingCard from "@/src/features/marketplace-catalog/components/lot-listing/LotListingCard";
import {
  fetchAllLotListingsForFiltering,
  fetchLotListings,
  type LotListing,
} from "@/src/features/marketplace-catalog/services/lotListingQueryService";
import { getImageUrl } from "@/src/features/marketplace-catalog/services/imageService";
import type { CombinedListing } from "@/src/features/marketplace-catalog/types/combined-listing";

/**
 * LotsClient - Grid view for /collections/lots
 *
 * Mirrors the Catalog collection behavior: loads all items (client-side filtering later).
 * Filters sidebar intentionally omitted for now. TODO added below.
 */
const LotsClient: React.FC = () => {
  const router = useRouter();
  const [allListings, setAllListings] = useState<LotListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1) Try the comprehensive filter-ready fetch (ACTIVE lots)
        const all = await fetchAllLotListingsForFiltering();
        let lots: LotListing[] = [];
        if (all.listings.length > 0) {
          // Transform CombinedListing -> LotListing for proper lot routing and UI
          lots = await Promise.all(
            all.listings.map(async (l: CombinedListing): Promise<LotListing> => ({
              id: l.public_id,
              title: l.title,
              description: l.description || undefined,
              category: l.category || "Uncategorized",
              subcategory: l.subcategory ?? null,
              image_url:
                (l.images && l.images.length > 0
                  ? (await getImageUrl(l.images[0].s3_key)) || ""
                  : "") || "",
              asking_price: l.minimum_order_value || 0,
              asking_price_currency: "USD",
              total_units:
                typeof l.total_units === "number" ? l.total_units : undefined,
              discount_percent:
                typeof l.msrp_discount_percent === "number"
                  ? l.msrp_discount_percent
                  : 0,
              listing_source: "lot",
            }))
          );
        }

        // 2) Fallback for environments where lots are in DRAFT (used by homepage section)
        if (lots.length === 0) {
          // Fallback to the marketplace helper (currently reads DRAFT status in some envs)
          lots = await fetchLotListings();
        }

        setAllListings(lots);
      } catch (_e) {
        setError("Failed to load lot listings. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Basic sorting to match other collection pages
  const displayedListings = useMemo(() => {
    const copy = [...allListings];
    switch (sortBy) {
      case "price-low":
        return copy.sort(
          (a, b) => (a.asking_price || 0) - (b.asking_price || 0)
        );
      case "price-high":
        return copy.sort(
          (a, b) => (b.asking_price || 0) - (a.asking_price || 0)
        );
      case "units-high":
        return copy.sort(
          (a, b) => (b.total_units || 0) - (a.total_units || 0)
        );
      case "units-low":
        return copy.sort(
          (a, b) => (a.total_units || 0) - (b.total_units || 0)
        );
      case "newest":
      default:
        return copy; // keep incoming order
    }
  }, [allListings, sortBy]);

  const handleFilterChange = (value: string) => setSortBy(value);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div className="animate-pulse" key={i}>
              <div className="mb-4 aspect-square rounded-2xl bg-gray-200" />
              <div className="mb-2 h-4 rounded bg-gray-200" />
              <div className="mb-2 h-3 w-2/3 rounded bg-gray-200" />
              <div className="h-3 w-1/2 rounded bg-gray-200" />
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
            No lot listings are available right now.
          </div>
          <p className="mb-6 text-gray-500">
            Check back later or browse our catalog collections.
          </p>
          <button
            className="rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700"
            onClick={() => router.push("/collections/catalog")}
            type="button"
          >
            Browse Catalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6">
      {/* Controls */}
      <div className="mb-6">
        <CollectionFilterControls
          defaultFilter={sortBy}
          filterOptions={[
            { label: "Newest", value: "newest" },
            { label: "Price: Low to High", value: "price-low" },
            { label: "Price: High to Low", value: "price-high" },
            { label: "Units: High to Low", value: "units-high" },
            { label: "Units: Low to High", value: "units-low" },
          ]}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* TODO: Add preference-based filter sidebar like Catalog once filters are finalized. */}

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
        {displayedListings.map((listing) => (
          <div className="min-w-0" key={listing.id}>
            <LotListingCard lotListing={listing} />
          </div>
        ))}
      </div>

      {/* Results summary */}
      <div className="flex items-center justify-center pt-8 text-sm text-gray-500">
        Showing {displayedListings.length.toLocaleString()} lot listings
      </div>
    </div>
  );
};

export default LotsClient;
