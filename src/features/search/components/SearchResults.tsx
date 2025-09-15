/**
 * SearchResults Component
 *
 * This component displays search results for both catalog listings and auction listings.
 * It integrates with the search API to show real-time results using Prisma full-text search
 * and provides consistent UI components matching the marketplace design.
 *
 * Key Features:
 * - Displays catalog listings using CatalogCard components
 * - TODO: Add auction listings using AuctionCard components
 * - Real-time search with debounced queries
 * - Client-side sorting and filtering
 * - Responsive grid layout matching marketplace design
 * - Loading states and error handling
 * - Empty state handling with helpful suggestions
 *
 * Component Structure:
 * - SearchResultsSkeleton: Loading state with proper aspect ratios
 * - Results header with count and filter indicators
 * - Sorting controls integrated with existing filter system
 * - Grid display using same layout as marketplace sections
 * - Error states with retry functionality
 */

"use client";

import { useState } from "react";

import {
  Search,
  SearchX,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
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

import { useSearch, type SearchFilters } from "../hooks/useSearch";

/**
 * SearchResults Component
 *
 * This component displays search results for both catalog listings and auction listings.
 * It integrates with the search API to show real-time results using Prisma full-text search
 * and provides consistent UI components matching the marketplace design.
 *
 * Key Features:
 * - Displays catalog listings using CatalogCard components
 * - TODO: Add auction listings using AuctionCard components
 * - Real-time search with debounced queries
 * - Client-side sorting and filtering
 * - Responsive grid layout matching marketplace design
 * - Loading states and error handling
 * - Empty state handling with helpful suggestions
 *
 * Component Structure:
 * - SearchResultsSkeleton: Loading state with proper aspect ratios
 * - Results header with count and filter indicators
 * - Sorting controls integrated with existing filter system
 * - Grid display using same layout as marketplace sections
 * - Error states with retry functionality
 */

/**
 * SearchResults Component
 *
 * This component displays search results for both catalog listings and auction listings.
 * It integrates with the search API to show real-time results using Prisma full-text search
 * and provides consistent UI components matching the marketplace design.
 *
 * Key Features:
 * - Displays catalog listings using CatalogCard components
 * - TODO: Add auction listings using AuctionCard components
 * - Real-time search with debounced queries
 * - Client-side sorting and filtering
 * - Responsive grid layout matching marketplace design
 * - Loading states and error handling
 * - Empty state handling with helpful suggestions
 *
 * Component Structure:
 * - SearchResultsSkeleton: Loading state with proper aspect ratios
 * - Results header with count and filter indicators
 * - Sorting controls integrated with existing filter system
 * - Grid display using same layout as marketplace sections
 * - Error states with retry functionality
 */

/**
 * SearchResults Component
 *
 * This component displays search results for both catalog listings and auction listings.
 * It integrates with the search API to show real-time results using Prisma full-text search
 * and provides consistent UI components matching the marketplace design.
 *
 * Key Features:
 * - Displays catalog listings using CatalogCard components
 * - TODO: Add auction listings using AuctionCard components
 * - Real-time search with debounced queries
 * - Client-side sorting and filtering
 * - Responsive grid layout matching marketplace design
 * - Loading states and error handling
 * - Empty state handling with helpful suggestions
 *
 * Component Structure:
 * - SearchResultsSkeleton: Loading state with proper aspect ratios
 * - Results header with count and filter indicators
 * - Sorting controls integrated with existing filter system
 * - Grid display using same layout as marketplace sections
 * - Error states with retry functionality
 */

/**
 * SearchResults Component
 *
 * This component displays search results for both catalog listings and auction listings.
 * It integrates with the search API to show real-time results using Prisma full-text search
 * and provides consistent UI components matching the marketplace design.
 *
 * Key Features:
 * - Displays catalog listings using CatalogCard components
 * - TODO: Add auction listings using AuctionCard components
 * - Real-time search with debounced queries
 * - Client-side sorting and filtering
 * - Responsive grid layout matching marketplace design
 * - Loading states and error handling
 * - Empty state handling with helpful suggestions
 *
 * Component Structure:
 * - SearchResultsSkeleton: Loading state with proper aspect ratios
 * - Results header with count and filter indicators
 * - Sorting controls integrated with existing filter system
 * - Grid display using same layout as marketplace sections
 * - Error states with retry functionality
 */

/**
 * SearchResults Component
 *
 * This component displays search results for both catalog listings and auction listings.
 * It integrates with the search API to show real-time results using Prisma full-text search
 * and provides consistent UI components matching the marketplace design.
 *
 * Key Features:
 * - Displays catalog listings using CatalogCard components
 * - TODO: Add auction listings using AuctionCard components
 * - Real-time search with debounced queries
 * - Client-side sorting and filtering
 * - Responsive grid layout matching marketplace design
 * - Loading states and error handling
 * - Empty state handling with helpful suggestions
 *
 * Component Structure:
 * - SearchResultsSkeleton: Loading state with proper aspect ratios
 * - Results header with count and filter indicators
 * - Sorting controls integrated with existing filter system
 * - Grid display using same layout as marketplace sections
 * - Error states with retry functionality
 */

/**
 * SearchResults Component
 *
 * This component displays search results for both catalog listings and auction listings.
 * It integrates with the search API to show real-time results using Prisma full-text search
 * and provides consistent UI components matching the marketplace design.
 *
 * Key Features:
 * - Displays catalog listings using CatalogCard components
 * - TODO: Add auction listings using AuctionCard components
 * - Real-time search with debounced queries
 * - Client-side sorting and filtering
 * - Responsive grid layout matching marketplace design
 * - Loading states and error handling
 * - Empty state handling with helpful suggestions
 *
 * Component Structure:
 * - SearchResultsSkeleton: Loading state with proper aspect ratios
 * - Results header with count and filter indicators
 * - Sorting controls integrated with existing filter system
 * - Grid display using same layout as marketplace sections
 * - Error states with retry functionality
 */

/**
 * SearchResults Component
 *
 * This component displays search results for both catalog listings and auction listings.
 * It integrates with the search API to show real-time results using Prisma full-text search
 * and provides consistent UI components matching the marketplace design.
 *
 * Key Features:
 * - Displays catalog listings using CatalogCard components
 * - TODO: Add auction listings using AuctionCard components
 * - Real-time search with debounced queries
 * - Client-side sorting and filtering
 * - Responsive grid layout matching marketplace design
 * - Loading states and error handling
 * - Empty state handling with helpful suggestions
 *
 * Component Structure:
 * - SearchResultsSkeleton: Loading state with proper aspect ratios
 * - Results header with count and filter indicators
 * - Sorting controls integrated with existing filter system
 * - Grid display using same layout as marketplace sections
 * - Error states with retry functionality
 */

/**
 * SearchResults Component
 *
 * This component displays search results for both catalog listings and auction listings.
 * It integrates with the search API to show real-time results using Prisma full-text search
 * and provides consistent UI components matching the marketplace design.
 *
 * Key Features:
 * - Displays catalog listings using CatalogCard components
 * - TODO: Add auction listings using AuctionCard components
 * - Real-time search with debounced queries
 * - Client-side sorting and filtering
 * - Responsive grid layout matching marketplace design
 * - Loading states and error handling
 * - Empty state handling with helpful suggestions
 *
 * Component Structure:
 * - SearchResultsSkeleton: Loading state with proper aspect ratios
 * - Results header with count and filter indicators
 * - Sorting controls integrated with existing filter system
 * - Grid display using same layout as marketplace sections
 * - Error states with retry functionality
 */

/**
 * SearchResults Component
 *
 * This component displays search results for both catalog listings and auction listings.
 * It integrates with the search API to show real-time results using Prisma full-text search
 * and provides consistent UI components matching the marketplace design.
 *
 * Key Features:
 * - Displays catalog listings using CatalogCard components
 * - TODO: Add auction listings using AuctionCard components
 * - Real-time search with debounced queries
 * - Client-side sorting and filtering
 * - Responsive grid layout matching marketplace design
 * - Loading states and error handling
 * - Empty state handling with helpful suggestions
 *
 * Component Structure:
 * - SearchResultsSkeleton: Loading state with proper aspect ratios
 * - Results header with count and filter indicators
 * - Sorting controls integrated with existing filter system
 * - Grid display using same layout as marketplace sections
 * - Error states with retry functionality
 */

/**
 * SearchResults Component
 *
 * This component displays search results for both catalog listings and auction listings.
 * It integrates with the search API to show real-time results using Prisma full-text search
 * and provides consistent UI components matching the marketplace design.
 *
 * Key Features:
 * - Displays catalog listings using CatalogCard components
 * - TODO: Add auction listings using AuctionCard components
 * - Real-time search with debounced queries
 * - Client-side sorting and filtering
 * - Responsive grid layout matching marketplace design
 * - Loading states and error handling
 * - Empty state handling with helpful suggestions
 *
 * Component Structure:
 * - SearchResultsSkeleton: Loading state with proper aspect ratios
 * - Results header with count and filter indicators
 * - Sorting controls integrated with existing filter system
 * - Grid display using same layout as marketplace sections
 * - Error states with retry functionality
 */

/**
 * SearchResults Component
 *
 * This component displays search results for both catalog listings and auction listings.
 * It integrates with the search API to show real-time results using Prisma full-text search
 * and provides consistent UI components matching the marketplace design.
 *
 * Key Features:
 * - Displays catalog listings using CatalogCard components
 * - TODO: Add auction listings using AuctionCard components
 * - Real-time search with debounced queries
 * - Client-side sorting and filtering
 * - Responsive grid layout matching marketplace design
 * - Loading states and error handling
 * - Empty state handling with helpful suggestions
 *
 * Component Structure:
 * - SearchResultsSkeleton: Loading state with proper aspect ratios
 * - Results header with count and filter indicators
 * - Sorting controls integrated with existing filter system
 * - Grid display using same layout as marketplace sections
 * - Error states with retry functionality
 */

/**
 * SearchResults Component
 *
 * This component displays search results for both catalog listings and auction listings.
 * It integrates with the search API to show real-time results using Prisma full-text search
 * and provides consistent UI components matching the marketplace design.
 *
 * Key Features:
 * - Displays catalog listings using CatalogCard components
 * - TODO: Add auction listings using AuctionCard components
 * - Real-time search with debounced queries
 * - Client-side sorting and filtering
 * - Responsive grid layout matching marketplace design
 * - Loading states and error handling
 * - Empty state handling with helpful suggestions
 *
 * Component Structure:
 * - SearchResultsSkeleton: Loading state with proper aspect ratios
 * - Results header with count and filter indicators
 * - Sorting controls integrated with existing filter system
 * - Grid display using same layout as marketplace sections
 * - Error states with retry functionality
 */

/**
 * SearchResults Component
 *
 * This component displays search results for both catalog listings and auction listings.
 * It integrates with the search API to show real-time results using Prisma full-text search
 * and provides consistent UI components matching the marketplace design.
 *
 * Key Features:
 * - Displays catalog listings using CatalogCard components
 * - TODO: Add auction listings using AuctionCard components
 * - Real-time search with debounced queries
 * - Client-side sorting and filtering
 * - Responsive grid layout matching marketplace design
 * - Loading states and error handling
 * - Empty state handling with helpful suggestions
 *
 * Component Structure:
 * - SearchResultsSkeleton: Loading state with proper aspect ratios
 * - Results header with count and filter indicators
 * - Sorting controls integrated with existing filter system
 * - Grid display using same layout as marketplace sections
 * - Error states with retry functionality
 */

/**
 * SearchResults Component
 *
 * This component displays search results for both catalog listings and auction listings.
 * It integrates with the search API to show real-time results using Prisma full-text search
 * and provides consistent UI components matching the marketplace design.
 *
 * Key Features:
 * - Displays catalog listings using CatalogCard components
 * - TODO: Add auction listings using AuctionCard components
 * - Real-time search with debounced queries
 * - Client-side sorting and filtering
 * - Responsive grid layout matching marketplace design
 * - Loading states and error handling
 * - Empty state handling with helpful suggestions
 *
 * Component Structure:
 * - SearchResultsSkeleton: Loading state with proper aspect ratios
 * - Results header with count and filter indicators
 * - Sorting controls integrated with existing filter system
 * - Grid display using same layout as marketplace sections
 * - Error states with retry functionality
 */

interface SearchResultsProps {
  query: string;
  filters?: { [key: string]: string | string[] | undefined };
}

const SearchResultsSkeleton = () => (
  <div className="space-y-6 md:space-y-8">
    {/* Header Skeleton */}
    <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm md:rounded-xl md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Skeleton className="h-6 w-48 md:h-7 md:w-64" />
        <Skeleton className="h-5 w-20 rounded-full md:h-6 md:w-24" />
      </div>
    </div>

    {/* Controls Skeleton */}
    <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm md:rounded-xl md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-5 w-40 md:w-48" />
        <Skeleton className="h-10 w-full sm:w-44" />
      </div>
    </div>

    {/* Grid Skeleton - Matching CatalogCard structure */}
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div className="space-y-3" key={`skeleton-${i}`}>
          {/* Catalog Image - matching aspect-square */}
          <Skeleton className="aspect-square w-full rounded-lg" />

          {/* Catalog Info */}
          <div className="space-y-1">
            {/* Title */}
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />

            {/* Category and Price Info */}
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const SearchResults = ({ query, filters }: SearchResultsProps) => {
  const [sortBy, setSortBy] = useState<string>("relevance");

  // Parse filters from URL params to match SearchFilters interface
  const parsedFilters: SearchFilters = {};

  if (filters?.price && typeof filters.price === "string") {
    const [min, max] = filters.price.split("-").map(Number);
    if (!(Number.isNaN(min) || Number.isNaN(max))) {
      parsedFilters.priceRange = [min, max];
    }
  }

  if (filters?.condition && typeof filters.condition === "string") {
    parsedFilters.condition = filters.condition;
  }

  if (filters?.discount && typeof filters.discount === "string") {
    const [min, max] = filters.discount.split("-").map(Number);
    if (!(Number.isNaN(min) || Number.isNaN(max))) {
      parsedFilters.discountRange = [min, max];
    }
  }

  if (filters?.categories && typeof filters.categories === "string") {
    parsedFilters.categories = filters.categories;
  }

  if (filters?.subcategory && typeof filters.subcategory === "string") {
    parsedFilters.subcategory = filters.subcategory;
  }

  if (filters?.featured === "true") {
    parsedFilters.featured = true;
  }

  if (filters?.type && typeof filters.type === "string") {
    parsedFilters.type = filters.type;
  }

  if (filters?.inStock === "true") {
    parsedFilters.inStockOnly = true;
  }

  if (filters?.retailer && typeof filters.retailer === "string") {
    parsedFilters.retailer = filters.retailer;
  }

  if (filters?.region && typeof filters.region === "string") {
    parsedFilters.region = filters.region;
  }

  if (filters?.isPrivate === "true") {
    parsedFilters.isPrivate = true;
  }

  if (filters?.isNew === "true") {
    parsedFilters.isNew = true;
  }

  // Use the search hook with new interface that returns both catalogs and auctions
  const {
    data: searchResults,
    isLoading,
    error,
  } = useSearch(query, parsedFilters);

  // Extract catalogs and auctions from search results
  const catalogListings = searchResults?.catalogs || [];
  const auctionListings = searchResults?.auctions || [];
  const totalResults = catalogListings.length + auctionListings.length;

  // Sort catalog listings based on selected option
  const sortedCatalogListings = [...catalogListings].sort(
    (a: CatalogListing, b: CatalogListing) => {
      switch (sortBy) {
        case "price-asc":
          return (a.minimum_order_value || 0) - (b.minimum_order_value || 0);
        case "price-desc":
          return (b.minimum_order_value || 0) - (a.minimum_order_value || 0);
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        case "category":
          return (a.category || "").localeCompare(b.category || "");
        default: // relevance
          return 0; // Keep original order from search API (relevance-based)
      }
    }
  );

  // Sort auction listings (auctions have different properties)
  const sortedAuctionListings = [...auctionListings].sort(
    (a: AuctionListingItem, b: AuctionListingItem) => {
      switch (sortBy) {
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        default: // relevance, price sorting not applicable to auctions in this context
          return 0; // Keep original order from search API (relevance-based)
      }
    }
  );

  if (isLoading) {
    return <SearchResultsSkeleton />;
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-100 bg-white p-6 text-center shadow-sm md:rounded-xl md:p-8">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-50 md:mb-6">
          <SearchX className="h-8 w-8 text-red-500" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900 md:mb-3 md:text-xl">
          Search Error
        </h3>
        <p className="mx-auto mb-4 max-w-md text-sm text-gray-600 md:mb-6 md:text-base">
          We encountered an error while searching. Please try again or contact
          support if the issue persists.
        </p>
        <Button
          className="w-full bg-red-600 hover:bg-red-700 sm:w-auto"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  // Check if we have any filters applied even without a query
  const hasFilters = Object.keys(parsedFilters).length > 0;

  if (!(query.trim() || hasFilters)) {
    return (
      <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8 text-center shadow-sm md:rounded-2xl md:p-12">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg md:mb-8 md:h-20 md:w-20">
          <Search className="h-8 w-8 text-white md:h-10 md:w-10" />
        </div>
        <h3 className="mb-3 text-2xl font-bold text-gray-900 md:mb-4 md:text-3xl">
          Discover Amazing Deals
        </h3>
        <p className="mx-auto mb-6 max-w-lg text-base leading-relaxed text-gray-600 md:mb-8 md:text-lg">
          Search through thousands of catalog listings and find incredible deals
          on quality products.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm font-medium text-blue-600">
          <Sparkles className="h-4 w-4" />
          <span>Start typing to explore our catalog</span>
        </div>
      </div>
    );
  }

  if (totalResults === 0) {
    return (
      <div className="space-y-6 md:space-y-8">
        {/* Results header for no results */}
        {query && (
          <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm md:rounded-xl md:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between md:gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center md:gap-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center md:gap-3">
                  <h1 className="text-lg font-bold text-gray-900 md:text-2xl">
                    Search results for &quot;{query}&quot;
                  </h1>
                  <Badge
                    className="w-fit border-red-200 bg-red-50 text-red-700"
                    variant="secondary"
                  >
                    0 listings found
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-lg border border-gray-100 bg-white p-8 text-center shadow-sm md:rounded-xl md:p-12">
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 md:mb-8 md:h-20 md:w-20">
            <SearchX className="h-8 w-8 text-gray-400 md:h-10 md:w-10" />
          </div>
          <h3 className="mb-3 text-xl font-bold text-gray-900 md:mb-4 md:text-2xl">
            No Results Found
          </h3>
          <p className="mx-auto mb-6 max-w-md text-sm text-gray-600 md:mb-8 md:text-base">
            We couldn&apos;t find any listings matching &quot;{query}&quot;. Try
            adjusting your search:
          </p>
          <div className="mx-auto mb-6 grid max-w-md grid-cols-1 gap-6 md:mb-8">
            <div className="space-y-3 text-center">
              <h4 className="font-medium text-gray-900">Search Tips:</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Check your spelling</li>
                <li>• Use fewer keywords</li>
                <li>• Try more general terms</li>
              </ul>
            </div>
            <div className="space-y-3 text-center">
              <h4 className="font-medium text-gray-900">Popular Categories:</h4>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge className="text-xs" variant="outline">
                  Electronics
                </Badge>
                <Badge className="text-xs" variant="outline">
                  Furniture
                </Badge>
                <Badge className="text-xs" variant="outline">
                  Home & Garden
                </Badge>
                <Badge className="text-xs" variant="outline">
                  Sports
                </Badge>
              </div>
            </div>
          </div>
          <Button
            className="w-full sm:w-auto"
            onClick={() => {
              window.location.href = "/marketplace";
            }}
            variant="outline"
          >
            Browse All Listings
          </Button>
        </div>
      </div>
    );
  }

  // Count active filters
  const activeFiltersCount =
    Object.values(parsedFilters).filter(Boolean).length;

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Enhanced Results Header */}
      {query && (
        <div className="rounded-lg border border-gray-100 bg-gradient-to-r from-white via-blue-50/30 to-white p-4 shadow-sm md:rounded-xl md:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center md:gap-4">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 md:h-10 md:w-10">
                  <Search className="h-4 w-4 text-blue-600 md:h-5 md:w-5" />
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-lg font-bold text-gray-900 md:text-2xl">
                    Search results for &quot;{query}&quot;
                  </h1>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge
                      className="border-green-200 bg-green-50 text-xs text-green-700"
                      variant="secondary"
                    >
                      {totalResults} listings found
                    </Badge>
                    {activeFiltersCount > 0 && (
                      <Badge className="text-xs" variant="outline">
                        {activeFiltersCount} filter
                        {activeFiltersCount !== 1 ? "s" : ""} applied
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp className="h-4 w-4 flex-shrink-0" />
              <span>Showing best matches</span>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Results Controls */}
      <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm md:rounded-xl md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <span className="text-sm font-medium text-gray-600 md:text-base">
              {totalResults} listings
            </span>
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                <span className="text-sm font-medium text-blue-600">
                  Filtered results
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center md:gap-3">
            <div className="flex items-center gap-2 text-gray-600">
              <SlidersHorizontal className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm font-medium">Sort by:</span>
            </div>
            <Select onValueChange={setSortBy} value={sortBy}>
              <SelectTrigger className="w-full border-gray-200 hover:border-gray-300 sm:w-44">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="title-asc">Title: A to Z</SelectItem>
                <SelectItem value="title-desc">Title: Z to A</SelectItem>
                <SelectItem value="category">Category</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Results Grid - Using both CatalogCard and AuctionCard components */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {/* Display Catalog Listings */}
        {sortedCatalogListings.map((listing) => (
          <div className="group" key={`catalog-${listing.id}`}>
            <CatalogCard listing={listing} />
          </div>
        ))}

        {/* Display Auction Listings */}
        {sortedAuctionListings.map((listing) => (
          <div className="group" key={`auction-${listing.id}`}>
            <AuctionCard auction={listing} />
          </div>
        ))}
      </div>

      {/* Load More Section (if needed) */}
      {totalResults >= 20 && (
        <div className="py-6 text-center md:py-8">
          <div className="mb-4 inline-flex items-center gap-2 text-gray-600">
            <div className="h-px w-8 bg-gray-300 md:w-12" />
            <span className="text-sm">End of results</span>
            <div className="h-px w-8 bg-gray-300 md:w-12" />
          </div>
          <Button
            className="w-full rounded-full px-6 py-4 sm:w-auto"
            onClick={() => {
              window.location.href = "/marketplace";
            }}
            variant="outline"
          >
            Explore More Listings
          </Button>
        </div>
      )}
    </div>
  );
};
