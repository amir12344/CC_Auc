"use client";

import { useQuery } from "@tanstack/react-query";

import { Skeleton } from "@/src/components/ui/skeleton";
import { fetchCatalogListingsWithFilters } from "@/src/features/collections/services/collectionQueryService";

import type { Collection } from "../types/collections";
import { CollectionCard } from "./CollectionCard";

/**
 * CollectionGrid Component
 *
 * This component serves as the main display for all available collections on the /collections page.
 *
 * FLOW EXPLANATION:
 * 1. Uses the useCollections hook to fetch collection data via TanStack Query
 * 2. Displays collections in a responsive grid (1 col mobile, 2 cols tablet, 3 cols desktop)
 * 3. Prioritizes featured collections first, then sorts by product count
 * 4. Each collection is rendered using the CollectionCard component
 *
 * DATA SOURCE:
 * - Collections are auto-generated from product data in collectionsService.ts
 * - Special collections (Trending, Featured, etc.) are manually defined
 * - Category collections are created dynamically from product categories
 *
 * RESPONSIVE DESIGN:
 * - Mobile-first approach with Tailwind responsive classes
 * - Grid adapts from 1 to 3 columns based on screen size
 * - Cards maintain consistent aspect ratios across breakpoints
 */
// Collections fetcher function for TanStack Query
const fetchCollections = async (): Promise<Collection[]> => {
  try {
    // Fetch sample collections by category to create a collection-like view
    const categoriesResponse = await fetchCatalogListingsWithFilters({
      categories: [
        "Electronics",
        "Home & Garden",
        "Fashion",
        "Sports",
        "Beauty",
        "Books",
      ],
      take: 12,
    });

    // Transform catalog listings into collection format matching the Collection interface
    const transformedCollections: Collection[] = [
      {
        id: "electronics",
        name: "Electronics",
        slug: "electronics",
        description: "Latest electronic devices and gadgets",
        image: categoriesResponse.listings[0]?.image_url || "",
        productCount: Math.floor(categoriesResponse.totalCount * 0.3),
        featured: true,
        categories: ["Electronics"],
      },
      {
        id: "home-garden",
        name: "Home & Garden",
        slug: "home-garden",
        description: "Everything for your home and garden",
        image: categoriesResponse.listings[1]?.image_url || "",
        productCount: Math.floor(categoriesResponse.totalCount * 0.25),
        featured: true,
        categories: ["Home & Garden"],
      },
      {
        id: "fashion",
        name: "Fashion",
        slug: "fashion",
        description: "Trendy clothing and accessories",
        image: categoriesResponse.listings[2]?.image_url || "",
        productCount: Math.floor(categoriesResponse.totalCount * 0.2),
        categories: ["Fashion"],
      },
      {
        id: "sports",
        name: "Sports & Outdoors",
        slug: "sports",
        description: "Sports equipment and outdoor gear",
        image: categoriesResponse.listings[3]?.image_url || "",
        productCount: Math.floor(categoriesResponse.totalCount * 0.15),
        categories: ["Sports"],
      },
    ].filter((collection) => collection.image); // Only show collections with images

    return transformedCollections;
  } catch (error) {
    throw new Error("Failed to fetch collections");
  }
};

export const CollectionGrid = () => {
  // TanStack Query with optimizations for collections data
  const {
    data: collections = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["collections"],
    queryFn: fetchCollections,
    staleTime: 5 * 60 * 1000, // 5 minutes - collections don't change frequently
    gcTime: 30 * 60 * 1000, // 30 minutes cache time
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Show loading skeleton while data is being fetched
  if (isLoading) {
    return <CollectionGridSkeleton />;
  }

  // Handle error state gracefully
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="py-12 text-center">
          <h3 className="text-foreground mb-2 text-lg font-semibold">
            Unable to load collections
          </h3>
          <p className="text-muted-foreground">
            Please try refreshing the page or contact support if the issue
            persists.
          </p>
        </div>
      </div>
    );
  }

  // Handle empty state
  if (!collections || collections.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="py-12 text-center">
          <h3 className="text-foreground mb-2 text-lg font-semibold">
            No collections available
          </h3>
          <p className="text-muted-foreground">
            New collections will appear here as they become available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-8xl mx-auto px-4 pb-16">
      {/* Enhanced Grid container with better spacing and visual hierarchy */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-8 lg:grid-cols-5 xl:grid-cols-5">
        {collections.map((collection) => (
          <CollectionCard collection={collection} key={collection.id} />
        ))}
      </div>

      {/* Enhanced footer section */}
      <div className="mt-16 rounded-2xl bg-white/50 p-8 text-center backdrop-blur-sm">
        <div className="mx-auto max-w-2xl">
          <h3 className="mb-4 text-xl font-semibold text-gray-900">
            Browse {collections.length} Collections
          </h3>
          <p className="mb-6 text-gray-600">
            Find exactly what you&apos;re looking for in our organized
            collections. Each collection features hand-picked products from
            trusted retailers.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="mb-4 aspect-square rounded-2xl bg-gray-200" />
              <span>Quality Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span>Fast Shipping</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-purple-500" />
              <span>Best Prices</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Loading skeleton for CollectionGrid
 *
 * Provides visual feedback while collections are being fetched.
 * Maintains same grid layout as actual content for consistent UX.
 */
const CollectionGridSkeleton = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
      {/* Render 6 skeleton cards to match expected collection count */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div className="space-y-4" key={i}>
          {/* Collection image skeleton */}
          <Skeleton className="h-48 w-full rounded-2xl" />
          {/* Collection title skeleton */}
          <Skeleton className="h-6 w-3/4" />
          {/* Collection description skeleton */}
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          {/* Product count and button skeleton */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-24 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  </div>
);
