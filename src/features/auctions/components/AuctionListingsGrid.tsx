"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import AuctionCard from "@/src/features/auctions/components/AuctionCard";
// Switched to AuctionCard + auctions service to correctly render auction listings
import { fetchAuctionListings } from "@/src/features/auctions/services/auctionQueryService";
import type { AuctionListingItem } from "@/src/features/auctions/types";
import { CollectionFilters as CollectionFilterControls } from "@/src/features/collections/components/CollectionFilters";

const AuctionListingsGrid = () => {
  const router = useRouter();
  const [allListings, setAllListings] = useState<AuctionListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("newest");

  // No search filtering needed for auctions - show all listings
  const filterListings = (listings: AuctionListingItem[]) => {
    return listings;
  };

  // Sort listings based on selected sort option
  const sortListings = (listings: AuctionListingItem[]) => {
    const sortedListings = [...listings];

    switch (sortBy) {
      case "name-asc":
        return sortedListings.sort((a, b) => a.title.localeCompare(b.title));
      case "name-desc":
        return sortedListings.sort((a, b) => b.title.localeCompare(a.title));
      case "ending-soon":
        // Sort by nearest auction_end_time first (undefined go last)
        return sortedListings.sort((a, b) => {
          const aTime = a.auction_end_time
            ? new Date(a.auction_end_time).getTime()
            : Number.MAX_SAFE_INTEGER;
          const bTime = b.auction_end_time
            ? new Date(b.auction_end_time).getTime()
            : Number.MAX_SAFE_INTEGER;
          return aTime - bTime;
        });
      case "most-bids":
        return sortedListings.sort((a, b) => b.totalBids - a.totalBids);
      case "least-bids":
        return sortedListings.sort((a, b) => a.totalBids - b.totalBids);
      case "newest":
      default:
        return sortedListings; // Keep original order for newest
    }
  };

  // Fetch auction listings
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetchAuctionListings();
        setAllListings(response);
      } catch (err) {
        setError("Failed to load auction listings. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div className="animate-pulse" key={index}>
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
            className="rounded-lg bg-orange-600 px-6 py-2 text-white transition-colors hover:bg-orange-700"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const handleFilterChange = (filterValue: string) => {
    setSortBy(filterValue);
  };

  // Apply filters and sorting client-side
  const filteredListings = filterListings(allListings);
  const displayedListings = sortListings(filteredListings);

  if (displayedListings.length === 0 && !loading && !error) {
    return (
      <div className="mx-auto max-w-7xl px-6">
        <div className="py-20 text-center">
          <div className="mb-4 text-xl text-gray-600">
            No active auctions at the moment.
          </div>
          <p className="mb-6 text-gray-500">
            Check back later for new auction listings or browse our catalog
            collections.
          </p>
          <button
            className="rounded-lg bg-orange-600 px-6 py-2 text-white transition-colors hover:bg-orange-700"
            onClick={() => router.push("/collections")}
            type="button"
          >
            Browse Collections
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6">
      {/* Search and Filter Controls */}
      <div className="mb-6">
        <CollectionFilterControls
          defaultFilter={sortBy}
          filterOptions={[
            { label: "Newest", value: "newest" },
            { label: "Ending Soon", value: "ending-soon" },
            // Adjusted sort options for auction context (bids + name)
            { label: "Most Bids", value: "most-bids" },
            { label: "Least Bids", value: "least-bids" },
            { label: "Name: A to Z", value: "name-asc" },
            { label: "Name: Z to A", value: "name-desc" },
          ]}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Results Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="text-gray-600">
          <span className="text-2xl font-semibold text-gray-900">
            {displayedListings.length}
          </span>{" "}
          active auctions
        </div>
      </div>

      {/* Grid - Using exact same layout as marketplace */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
        {displayedListings.map((listing) => (
          <div className="min-w-0" key={listing.id}>
            <AuctionCard auction={listing} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AuctionListingsGrid;
