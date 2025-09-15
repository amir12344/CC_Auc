"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { AlertCircle, SlidersHorizontal } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Skeleton } from "@/src/components/ui/skeleton";

import { useCategoryProducts } from "../hooks/useCategoryProducts";
import type { CollectionFilters } from "../types/collections";
import { SimpleProductCard } from "./SimpleProductCard";

interface CategoryProductsProps {
  category: string;
  filters: { [key: string]: string | string[] | undefined };
}

/**
 * CategoryProducts Component
 *
 * Displays filtered products for a specific category collection with proper separation of concerns.
 * Uses SimpleProductCard for consistent marketplace-style product display.
 *
 * COMPONENT RESPONSIBILITY:
 * - Product display and grid layout
 * - Sort controls (display concern, not filter concern)
 * - Data fetching and loading states
 * - Error handling and empty states
 *
 * PROPER SEPARATION:
 * - CategoryProducts: Sorting + Display (how to show products)
 * - FilterSidebar: Filtering (what products to show)
 * - ActiveFilterChips: Filter removal and status
 *
 * COMPONENT FLOW:
 * 1. Receives category slug and URL search params as filters
 * 2. Converts URL params to CollectionFilters format
 * 3. Fetches filtered products using useCategoryProducts hook
 * 4. Provides sort controls for display ordering
 * 5. Displays products in a responsive grid layout
 * 6. Handles loading, error, and empty states
 *
 * FILTERING vs SORTING:
 * - Filtering (FilterSidebar): price range, condition, discount, events, retailers
 * - Sorting (CategoryProducts): display order (price, date, alphabetical, etc.)
 * - Both use URL parameters but serve different purposes
 *
 * PERFORMANCE NOTES:
 * - Uses TanStack Query for optimized data fetching and caching
 * - Filters are memoized to prevent unnecessary re-fetching
 * - Sort changes update URL without page reload
 *
 * URL PARAMETER HANDLING:
 * - ?price=100-500 → priceRange filter (handled by FilterSidebar)
 * - ?condition=refurbished → condition filter (handled by FilterSidebar)
 * - ?sort=price-low → sortBy display option (handled here)
 * - ?specialEvent=clearance → special event filtering (handled by FilterSidebar)
 */
export const CategoryProducts = ({
  category,
  filters,
}: CategoryProductsProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  /**
   * Convert URL search parameters to CollectionFilters format
   *
   * This memoized conversion ensures efficient filter parsing and prevents
   * unnecessary re-renders when filters haven&apos;t actually changed.
   */
  const parsedFilters = useMemo((): CollectionFilters => {
    const collectionFilters: CollectionFilters = {};

    // Parse price range filter (e.g., "100-500")
    if (filters.price && typeof filters.price === "string") {
      const [min, max] = filters.price.split("-").map(Number);
      if (!isNaN(min) && !isNaN(max)) {
        collectionFilters.priceRange = [min, max];
      }
    }

    // Parse condition filter
    if (filters.condition && typeof filters.condition === "string") {
      const condition = filters.condition as "new" | "refurbished" | "used";
      collectionFilters.condition = condition;
    }

    // Parse discount range filter (e.g., "20-50")
    if (filters.discount && typeof filters.discount === "string") {
      const [min, max] = filters.discount.split("-").map(Number);
      if (!isNaN(min) && !isNaN(max)) {
        collectionFilters.discountRange = [min, max];
      }
    }

    // Parse in-stock filter
    if (filters.inStock === "true") {
      collectionFilters.inStock = true;
    }

    // Parse sorting option (display concern)
    if (filters.sort && typeof filters.sort === "string") {
      collectionFilters.sortBy = filters.sort as CollectionFilters["sortBy"];
    }

    // Parse categories filter (can be array for multiple selections)
    if (filters.categories) {
      const categories = Array.isArray(filters.categories)
        ? (filters.categories as string[])
        : [filters.categories as string];
      collectionFilters.categories = categories;
    }

    // Parse special event filter
    if (filters.specialEvent) {
      const events = Array.isArray(filters.specialEvent)
        ? (filters.specialEvent as string[])
        : [filters.specialEvent as string];
      collectionFilters.specialEvent = events;
    }

    return collectionFilters;
  }, [filters]);

  // Fetch products with the parsed filters
  const {
    data: products,
    isLoading,
    error,
    isRefetching,
  } = useCategoryProducts(category, parsedFilters);

  /**
   * Handle sort change without page reload
   * Updates URL parameter for sort option
   */
  const handleSortChange = (newSortValue: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newSortValue === "recently-added") {
      params.delete("sort"); // Default sort, remove parameter
    } else {
      params.set("sort", newSortValue);
    }

    const newUrl = `/collections/${category}${params.toString() ? `?${params.toString()}` : ""}`;
    router.replace(newUrl);
  };

  // Get current sort value from URL
  const currentSort = (filters.sort as string) || "recently-added";

  // Loading state with skeleton
  if (isLoading) {
    return <CategoryProductsSkeleton />;
  }

  // Error state with retry option
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-12">
        <AlertCircle className="text-destructive mb-4 h-12 w-12" />
        <h3 className="mb-2 text-lg font-semibold">Unable to load products</h3>
        <p className="text-muted-foreground mb-4 max-w-md text-center">
          We&apos;re having trouble loading products for this collection. Please
          try again or check your connection.
        </p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  // Empty state when no products match filters
  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-12">
        <SlidersHorizontal className="text-muted-foreground mb-4 h-12 w-12" />
        <h3 className="mb-2 text-lg font-semibold">No products found</h3>
        <p className="text-muted-foreground mb-4 max-w-md text-center">
          Try adjusting your filters or browse other categories to find what
          you&apos;re looking for.
        </p>
        <Button
          variant="outline"
          onClick={() => (window.location.href = `/collections/${category}`)}
        >
          Clear All Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Product Count and Sort Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {products.length} listings
          </span>
          {isRefetching && (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          )}
        </div>

        {/* Sort Dropdown - Display Concern */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-gray-500" />
          <Select value={currentSort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recently-added">Recently added</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="discount-high">Highest Discount</SelectItem>
              <SelectItem value="alphabetical">Alphabetical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <SimpleProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

/**
 * Loading skeleton for CategoryProducts
 *
 * Provides visual feedback while products are being fetched.
 * Matches the expected layout structure for consistent UX.
 */
const CategoryProductsSkeleton = () => (
  <div className="space-y-6">
    {/* Header skeleton */}
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-32" />
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-10 w-40" />
      </div>
    </div>

    {/* Product grid skeleton */}
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-square w-full rounded-[18px]" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  </div>
);

/**
 * INTEGRATION NOTES FOR DEVELOPERS:
 *
 * 1. PROPER SEPARATION OF CONCERNS:
 *    - CategoryProducts: Sorting + Display (how to show products)
 *    - FilterSidebar: Filtering (what products to show)
 *    - ActiveFilterChips: Filter removal and status display
 *
 * 2. SORTING vs FILTERING:
 *    - Sorting: Display order, handled here with Select dropdown
 *    - Filtering: Data selection, handled in FilterSidebar
 *    - Both use URL parameters but serve different user needs
 *
 * 3. URL STATE MANAGEMENT:
 *    - Sort changes update URL without page reload
 *    - URL params persist for bookmarking and sharing
 *    - router.replace() prevents browser history pollution
 *
 * 4. PERFORMANCE OPTIMIZATIONS:
 *    - Filter parsing is memoized to prevent unnecessary re-renders
 *    - Uses TanStack Query for optimized data fetching
 *    - Clean URL handling with proper default values
 */
