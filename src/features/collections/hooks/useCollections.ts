"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getCollectionBySlug,
  getCollections,
  getProductsByCollection,
} from "../services/collectionsService";
import type { Collection, CollectionFilters } from "../types/collections";

/**
 * useCollections Hook
 *
 * Custom hook that provides optimized collection data fetching using TanStack Query.
 *
 * PURPOSE:
 * - Fetches all available collections from the collections service
 * - Provides caching, background refetching, and error handling
 * - Optimizes performance with proper stale time and cache time settings
 *
 * CACHING STRATEGY:
 * - staleTime: 5 minutes - Data considered fresh for 5 minutes
 * - cacheTime: 10 minutes - Data kept in cache for 10 minutes after last use
 * - refetchOnWindowFocus: false - Don't refetch when window regains focus
 *
 * QUERY KEY:
 * - Uses 'collections' as the key for consistent cache management
 * - Simple key since this fetches all collections without parameters
 *
 * INTEGRATION NOTES:
 * - Works with dummy data for now, but structure supports real API integration
 * - Service layer handles data transformation and filtering
 * - Returns standard TanStack Query response with data, loading, and error states
 */
export const useCollections = () => {
  return useQuery<Collection[], Error>({
    queryKey: ["collections"],
    queryFn: getCollections,

    // Cache and refetch configuration for optimal performance
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
    gcTime: 10 * 60 * 1000, // 10 minutes - data kept in garbage collection time
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't refetch if data is still fresh

    // Retry configuration
    retry: 3, // Retry failed requests up to 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff

    // Error and success callbacks can be added here if needed
    // onError: (error) => console.error('Failed to fetch collections:', error),
    // onSuccess: (data) => console.log('Collections loaded:', data.length),
  });
};

export const useCollection = (slug: string) => {
  return useQuery({
    queryKey: ["collection", slug],
    queryFn: () => getCollectionBySlug(slug),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    enabled: !!slug,
  });
};

export const useCollectionProducts = (
  slug: string,
  filters?: CollectionFilters
) => {
  return useQuery({
    queryKey: ["collection-products", slug, filters],
    queryFn: () => getProductsByCollection(slug, filters),
    staleTime: 2 * 60 * 1000, // 2 minutes (products change more frequently)
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!slug,
  });
};

/**
 * DEVELOPER NOTES:
 *
 * 1. PERFORMANCE OPTIMIZATIONS:
 *    - Aggressive caching reduces unnecessary API calls
 *    - Background refetching keeps data fresh without user wait
 *    - Retry logic handles temporary network issues
 *
 * 2. ERROR HANDLING:
 *    - Hook returns error state for component handling
 *    - Retry logic handles transient failures
 *    - Components should handle error states gracefully
 *
 * 3. FUTURE API INTEGRATION:
 *    - Query key can be extended for parameterized queries
 *    - Service layer abstracts data source details
 *    - Easy to add authentication headers when needed
 *
 * 4. CACHE INVALIDATION:
 *    - Use queryClient.invalidateQueries(['collections']) to refresh
 *    - Mutations that affect collections should invalidate this cache
 *    - Consider using optimistic updates for better UX
 *
 * 5. USAGE PATTERN:
 *    - Components destructure { data, isLoading, error } from hook
 *    - Handle loading and error states in component render
 *    - Data is typed as Collection[] for type safety
 */
