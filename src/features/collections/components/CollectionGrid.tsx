'use client'

import { Suspense } from 'react'
import { useCollections } from '../hooks/useCollections'
import { CollectionCard } from './CollectionCard'
import { Skeleton } from '@/src/components/ui/skeleton'

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
export const CollectionGrid = () => {
  const { data: collections, isLoading, error } = useCollections()

  // Show loading skeleton while data is being fetched
  if (isLoading) {
    return <CollectionGridSkeleton />
  }

  // Handle error state gracefully
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Unable to load collections
          </h3>
          <p className="text-muted-foreground">
            Please try refreshing the page or contact support if the issue persists.
          </p>
        </div>
      </div>
    )
  }

  // Handle empty state (shouldn't happen with mock data, but good to have)
  if (!collections || collections.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No collections available
          </h3>
          <p className="text-muted-foreground">
            New collections will appear here as they become available.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-8xl mx-auto px-4 pb-16">
      {/* Enhanced Grid container with better spacing and visual hierarchy */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 md:gap-8">
        {collections.map((collection) => (
          <CollectionCard
            key={collection.id}
            collection={collection}
          />
        ))}
      </div>

      {/* Enhanced footer section */}
      <div className="mt-16 text-center bg-white/50 backdrop-blur-sm rounded-2xl p-8">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Browse {collections.length} Collections
          </h3>
          <p className="text-gray-600 mb-6">
            Find exactly what you're looking for in our organized collections. 
            Each collection features hand-picked products from trusted retailers.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Quality Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Fast Shipping</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Best Prices</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Loading skeleton for CollectionGrid
 * 
 * Provides visual feedback while collections are being fetched.
 * Maintains same grid layout as actual content for consistent UX.
 */
const CollectionGridSkeleton = () => (
  <div className="container mx-auto px-4 py-8">
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {/* Render 6 skeleton cards to match expected collection count */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-4">
          {/* Collection image skeleton */}
          <Skeleton className="h-48 w-full rounded-lg" />
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
) 