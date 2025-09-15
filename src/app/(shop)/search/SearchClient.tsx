"use client";

import React, { useState } from "react";

import { Search, SearchX, Sparkles, TrendingUp } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Skeleton } from "@/src/components/ui/skeleton";
import AuctionCard from "@/src/features/auctions/components/AuctionCard";
import type { AuctionListingItem } from "@/src/features/auctions/types";
import CatalogCard from "@/src/features/marketplace-catalog/components/CatalogCard";
import type { CatalogListing } from "@/src/features/marketplace-catalog/types/catalog";

/**
 * SearchClient Props Interface
 */
export interface SearchClientProps {
  catalogs: CatalogListing[];
  auctions: AuctionListingItem[];
  query: string;
  loading: boolean;
  error: string | null;
  totalCount: number;
  filteredCount: number;
  onSortingChange: (sortBy: string) => void;
  searchParams?: URLSearchParams; // Add search params to determine search context
}

/**
 * Loading skeleton for search results
 */
const SearchResultsSkeleton = () => (
  <div className="space-y-6">
    {/* Header Skeleton */}
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-6 w-48 md:h-7 md:w-64" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-10 w-32" />
    </div>

    {/* Grid Skeleton */}
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 12 }).map((_, index) => (
        <div className="space-y-4" key={index}>
          <div className="aspect-square w-full animate-pulse rounded-lg bg-gray-200" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Empty state component for no search results
 */
const EmptySearchResults = ({ query }: { query: string }) => (
  <div className="py-16 text-center md:py-24">
    <div className="mx-auto max-w-md">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
        <SearchX className="h-10 w-10 text-gray-400" />
      </div>
      <h3 className="mb-4 text-xl font-semibold text-gray-900 md:text-2xl">
        No results found
      </h3>
      <p className="mb-8 text-gray-600">
        We couldn&apos;t find any listings matching &quot;{query}&quot;. Try
        adjusting your search terms or filters.
      </p>
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Suggestions:</h4>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Check your spelling</li>
          <li>• Try broader search terms</li>
          <li>• Remove some filters</li>
          <li>• Browse our categories instead</li>
        </ul>
      </div>
    </div>
  </div>
);

/**
 * Error state component for search failures
 */
const SearchErrorState = ({
  error,
  onRetry,
}: {
  error: string;
  onRetry?: () => void;
}) => (
  <div className="py-16 text-center md:py-24">
    <div className="mx-auto max-w-md">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
        <SearchX className="h-10 w-10 text-red-500" />
      </div>
      <h3 className="mb-4 text-xl font-semibold text-gray-900 md:text-2xl">
        Search Error
      </h3>
      <p className="mb-8 text-gray-600">{error}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Try Again
        </Button>
      )}
    </div>
  </div>
);

/**
 * SearchClient Component
 *
 * Displays search results for both catalog and auction listings.
 * Handles sorting, loading states, and error states.
 * Maintains the same UI/UX as the original SearchResults component.
 */
const SearchClient: React.FC<SearchClientProps> = ({
  catalogs,
  auctions,
  query,
  loading,
  error,
  totalCount,
  filteredCount,
  onSortingChange,
  searchParams,
}) => {
  const [currentSort, setCurrentSort] = useState("relevance");

  // Generate meaningful search description based on query and filters
  const getSearchDescription = (): string => {
    if (query && query.trim()) {
      return query;
    }

    // Handle mega menu searches with filter parameters
    if (searchParams) {
      const categories = searchParams.get("categories");
      const subcategory = searchParams.get("subcategory");
      const condition = searchParams.get("condition");
      const region = searchParams.get("region");

      const parts: string[] = [];

      if (categories) {
        // Convert category enum to user-friendly text
        const categoryText = categories
          .replace(/_/g, " ")
          .toLowerCase()
          .replace(/\b\w/g, (l) => l.toUpperCase());
        parts.push(categoryText);
      }

      if (subcategory) {
        const subcategoryText = subcategory
          .replace(/_/g, " ")
          .toLowerCase()
          .replace(/\b\w/g, (l) => l.toUpperCase());
        parts.push(subcategoryText);
      }

      if (condition && condition !== "all") {
        parts.push(`${condition} condition`);
      }

      if (region) {
        parts.push(`in ${region}`);
      }

      if (parts.length > 0) {
        return parts.join(" - ");
      }
    }

    return "All Products";
  };

  // Handle sorting change
  const handleSortChange = (sortBy: string) => {
    setCurrentSort(sortBy);
    onSortingChange(sortBy);
  };

  // Show loading state
  if (loading) {
    return <SearchResultsSkeleton />;
  }

  // Show error state
  if (error) {
    return <SearchErrorState error={error} />;
  }

  // Show empty state only if no query AND no results (handles both query and filter-based searches)
  if (!query.trim() && catalogs.length === 0 && auctions.length === 0) {
    return (
      <div className="py-16 text-center md:py-24">
        <div className="mx-auto max-w-md">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
            <Search className="h-10 w-10 text-blue-500" />
          </div>
          <h3 className="mb-4 text-xl font-semibold text-gray-900 md:text-2xl">
            Start Your Search
          </h3>
          <p className="text-gray-600">
            Enter search terms above to find products and auctions.
          </p>
        </div>
      </div>
    );
  }

  // Show empty results if no listings found
  if (filteredCount === 0) {
    return <EmptySearchResults query={query} />;
  }

  return (
    <div className="space-y-6">
      {/* Search Results Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Search Results for &quot;{getSearchDescription()}&quot;
          </h1>
          <p className="text-gray-600">
            {filteredCount} {filteredCount === 1 ? "result" : "results"}
            {filteredCount !== totalCount && ` (${totalCount} total)`}
          </p>
        </div>
        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <Select onValueChange={handleSortChange} value={currentSort}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Relevance
                </div>
              </SelectItem>
              <SelectItem value="price_low">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 rotate-180" />
                  Price: Low to High
                </div>
              </SelectItem>
              <SelectItem value="price_high">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Price: High to Low
                </div>
              </SelectItem>
              <SelectItem value="newest">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Newest First
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Combined Search Results */}
      {(catalogs.length > 0 || auctions.length > 0) && (
        <section>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* Render Catalog Listings */}
            {catalogs.map((catalog) => (
              <div className="group" key={catalog.id}>
                <CatalogCard listing={catalog} />
              </div>
            ))}

            {/* Render Auction Listings */}
            {auctions.map((auction) => (
              <div className="group" key={auction.id}>
                <AuctionCard auction={auction} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default SearchClient;
