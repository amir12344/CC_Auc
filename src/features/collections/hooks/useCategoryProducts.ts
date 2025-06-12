'use client'

import { useQuery } from '@tanstack/react-query'
import { getProductsByCollection } from '../services/collectionsService'
import type { Product, CollectionFilters } from '../types/collections'

/**
 * useCategoryProducts Hook
 * 
 * Custom hook that fetches products for a specific collection category with filtering support.
 * 
 * PURPOSE:
 * - Fetches products filtered by category and additional filter criteria
 * - Provides optimized caching and background refetching
 * - Handles loading states and error scenarios gracefully
 * - Supports real-time filter updates with efficient re-querying
 * 
 * PARAMETERS:
 * - category: The collection category slug (e.g., 'electronics', 'trending')
 * - filters: Optional CollectionFilters object for price, condition, sorting, etc.
 * 
 * CACHING STRATEGY:
 * - Query key includes category and filters for precise cache management
 * - Shorter stale time for category-specific data (2 minutes)
 * - Filters are serialized to ensure cache consistency
 * - Background refetching keeps data fresh without user interruption
 * 
 * PERFORMANCE OPTIMIZATIONS:
 * - Only refetches when category or filters actually change
 * - Uses stable query keys for efficient cache hits
 * - Implements exponential backoff for retry logic
 * - Prevents unnecessary requests with proper stale time management
 */
export const useCategoryProducts = (category: string, filters?: CollectionFilters) => {
  
  /**
   * Generate stable query key that includes filters
   * 
   * The query key must be stable and reflect all parameters that affect
   * the data being fetched. This ensures proper cache invalidation and
   * prevents unnecessary re-fetches when filters haven't changed.
   */
  const queryKey = [
    'category-products',
    category,
    // Serialize filters to ensure stable cache keys
    filters ? {
      priceRange: filters.priceRange,
      categories: filters.categories?.sort(), // Sort for stability
      condition: filters.condition,
      discountRange: filters.discountRange,
      inStock: filters.inStock,
      sortBy: filters.sortBy
    } : null
  ]

  return useQuery<Product[], Error>({
    queryKey,
    queryFn: () => getProductsByCollection(category, filters),
    
    // Cache configuration optimized for category browsing
    staleTime: 2 * 60 * 1000, // 2 minutes - shorter for filtered results
    gcTime: 5 * 60 * 1000, // 5 minutes - moderate cache retention
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: true, // Always fetch fresh data on mount
    
    // Retry configuration for network resilience
    retry: 2, // Fewer retries for filtered queries
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    
    // Enable background refetching for fresh data
    refetchInterval: 5 * 60 * 1000, // Background refetch every 5 minutes
    refetchIntervalInBackground: false, // Only when tab is active
    
    // Query will be enabled by default, but can be disabled if needed
    enabled: Boolean(category), // Only run if category is provided
    
    // Optional callbacks for monitoring (useful for debugging)
    // onSuccess: (data) => console.log(`Loaded ${data.length} products for ${category}`),
    // onError: (error) => console.error(`Failed to load products for ${category}:`, error),
  })
}

/**
 * DEVELOPER INTEGRATION NOTES:
 * 
 * 1. QUERY KEY STABILITY:
 *    - The query key includes all parameters that affect data fetching
 *    - Filters are normalized to ensure consistent cache keys
 *    - Arrays in filters are sorted to prevent false cache misses
 * 
 * 2. FILTER REACTIVITY:
 *    - Hook automatically refetches when filters change
 *    - Debouncing can be added at component level if needed
 *    - Previous data remains available during refetch for smooth UX
 * 
 * 3. ERROR HANDLING:
 *    - Returns error state for component-level handling
 *    - Implements reasonable retry logic for transient failures
 *    - Consider adding error boundaries for critical errors
 * 
 * 4. PERFORMANCE CONSIDERATIONS:
 *    - Shorter stale time for filtered data ensures freshness
 *    - Background refetching keeps data current without user wait
 *    - Query is automatically disabled if category is missing
 * 
 * 5. CACHE INVALIDATION:
 *    - Use queryClient.invalidateQueries(['category-products', category])
 *    - Consider invalidating on product mutations or inventory updates
 *    - Related queries (collections, search) may need coordinated invalidation
 * 
 * 6. FUTURE ENHANCEMENTS:
 *    - Could add prefetching for related categories
 *    - Implement optimistic updates for user interactions
 *    - Add infinite query support for pagination
 *    - Consider implementing search result highlighting
 */ 