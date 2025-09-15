/**
 * Search Hooks
 *
 * These hooks provide React Query integration for search functionality.
 * They handle caching, background refetching, and error states for search operations
 * while maintaining optimal performance through debouncing and request deduplication.
 *
 * Key Features:
 * - useSearch: Main search hook for SearchResults component
 * - useSearchSuggestions: Debounced suggestions for SearchBar autocomplete
 * - TanStack Query integration for caching and background updates
 * - Automatic request deduplication to prevent duplicate API calls
 * - Configurable stale times optimized for search result freshness
 *
 * Performance Optimizations:
 * - Search results cached for 1 minute (frequently changing data)
 * - Suggestions cached for 5 minutes (more stable data)
 * - Minimum query length requirements to reduce unnecessary requests
 * - Automatic cleanup of unused cache entries
 */

"use client";

import { useQuery } from "@tanstack/react-query";

import { useDebounce } from "@/src/features/buyer-preferences/hooks/useDebounce";

import {
  generateSearchSuggestions,
  searchListings,
} from "../services/searchQueryService";

/**
 * Search Hooks
 *
 * These hooks provide React Query integration for search functionality.
 * They handle caching, background refetching, and error states for search operations
 * while maintaining optimal performance through debouncing and request deduplication.
 *
 * Key Features:
 * - useSearch: Main search hook for SearchResults component
 * - useSearchSuggestions: Debounced suggestions for SearchBar autocomplete
 * - TanStack Query integration for caching and background updates
 * - Automatic request deduplication to prevent duplicate API calls
 * - Configurable stale times optimized for search result freshness
 *
 * Performance Optimizations:
 * - Search results cached for 1 minute (frequently changing data)
 * - Suggestions cached for 5 minutes (more stable data)
 * - Minimum query length requirements to reduce unnecessary requests
 * - Automatic cleanup of unused cache entries
 */

/**
 * Search Hooks
 *
 * These hooks provide React Query integration for search functionality.
 * They handle caching, background refetching, and error states for search operations
 * while maintaining optimal performance through debouncing and request deduplication.
 *
 * Key Features:
 * - useSearch: Main search hook for SearchResults component
 * - useSearchSuggestions: Debounced suggestions for SearchBar autocomplete
 * - TanStack Query integration for caching and background updates
 * - Automatic request deduplication to prevent duplicate API calls
 * - Configurable stale times optimized for search result freshness
 *
 * Performance Optimizations:
 * - Search results cached for 1 minute (frequently changing data)
 * - Suggestions cached for 5 minutes (more stable data)
 * - Minimum query length requirements to reduce unnecessary requests
 * - Automatic cleanup of unused cache entries
 */

/**
 * Search Hooks
 *
 * These hooks provide React Query integration for search functionality.
 * They handle caching, background refetching, and error states for search operations
 * while maintaining optimal performance through debouncing and request deduplication.
 *
 * Key Features:
 * - useSearch: Main search hook for SearchResults component
 * - useSearchSuggestions: Debounced suggestions for SearchBar autocomplete
 * - TanStack Query integration for caching and background updates
 * - Automatic request deduplication to prevent duplicate API calls
 * - Configurable stale times optimized for search result freshness
 *
 * Performance Optimizations:
 * - Search results cached for 1 minute (frequently changing data)
 * - Suggestions cached for 5 minutes (more stable data)
 * - Minimum query length requirements to reduce unnecessary requests
 * - Automatic cleanup of unused cache entries
 */

/**
 * Search Hooks
 *
 * These hooks provide React Query integration for search functionality.
 * They handle caching, background refetching, and error states for search operations
 * while maintaining optimal performance through debouncing and request deduplication.
 *
 * Key Features:
 * - useSearch: Main search hook for SearchResults component
 * - useSearchSuggestions: Debounced suggestions for SearchBar autocomplete
 * - TanStack Query integration for caching and background updates
 * - Automatic request deduplication to prevent duplicate API calls
 * - Configurable stale times optimized for search result freshness
 *
 * Performance Optimizations:
 * - Search results cached for 1 minute (frequently changing data)
 * - Suggestions cached for 5 minutes (more stable data)
 * - Minimum query length requirements to reduce unnecessary requests
 * - Automatic cleanup of unused cache entries
 */

/**
 * Search Hooks
 *
 * These hooks provide React Query integration for search functionality.
 * They handle caching, background refetching, and error states for search operations
 * while maintaining optimal performance through debouncing and request deduplication.
 *
 * Key Features:
 * - useSearch: Main search hook for SearchResults component
 * - useSearchSuggestions: Debounced suggestions for SearchBar autocomplete
 * - TanStack Query integration for caching and background updates
 * - Automatic request deduplication to prevent duplicate API calls
 * - Configurable stale times optimized for search result freshness
 *
 * Performance Optimizations:
 * - Search results cached for 1 minute (frequently changing data)
 * - Suggestions cached for 5 minutes (more stable data)
 * - Minimum query length requirements to reduce unnecessary requests
 * - Automatic cleanup of unused cache entries
 */

/**
 * Search Hooks
 *
 * These hooks provide React Query integration for search functionality.
 * They handle caching, background refetching, and error states for search operations
 * while maintaining optimal performance through debouncing and request deduplication.
 *
 * Key Features:
 * - useSearch: Main search hook for SearchResults component
 * - useSearchSuggestions: Debounced suggestions for SearchBar autocomplete
 * - TanStack Query integration for caching and background updates
 * - Automatic request deduplication to prevent duplicate API calls
 * - Configurable stale times optimized for search result freshness
 *
 * Performance Optimizations:
 * - Search results cached for 1 minute (frequently changing data)
 * - Suggestions cached for 5 minutes (more stable data)
 * - Minimum query length requirements to reduce unnecessary requests
 * - Automatic cleanup of unused cache entries
 */

/**
 * Search Hooks
 *
 * These hooks provide React Query integration for search functionality.
 * They handle caching, background refetching, and error states for search operations
 * while maintaining optimal performance through debouncing and request deduplication.
 *
 * Key Features:
 * - useSearch: Main search hook for SearchResults component
 * - useSearchSuggestions: Debounced suggestions for SearchBar autocomplete
 * - TanStack Query integration for caching and background updates
 * - Automatic request deduplication to prevent duplicate API calls
 * - Configurable stale times optimized for search result freshness
 *
 * Performance Optimizations:
 * - Search results cached for 1 minute (frequently changing data)
 * - Suggestions cached for 5 minutes (more stable data)
 * - Minimum query length requirements to reduce unnecessary requests
 * - Automatic cleanup of unused cache entries
 */

/**
 * Search Hooks
 *
 * These hooks provide React Query integration for search functionality.
 * They handle caching, background refetching, and error states for search operations
 * while maintaining optimal performance through debouncing and request deduplication.
 *
 * Key Features:
 * - useSearch: Main search hook for SearchResults component
 * - useSearchSuggestions: Debounced suggestions for SearchBar autocomplete
 * - TanStack Query integration for caching and background updates
 * - Automatic request deduplication to prevent duplicate API calls
 * - Configurable stale times optimized for search result freshness
 *
 * Performance Optimizations:
 * - Search results cached for 1 minute (frequently changing data)
 * - Suggestions cached for 5 minutes (more stable data)
 * - Minimum query length requirements to reduce unnecessary requests
 * - Automatic cleanup of unused cache entries
 */

/**
 * Search Hooks
 *
 * These hooks provide React Query integration for search functionality.
 * They handle caching, background refetching, and error states for search operations
 * while maintaining optimal performance through debouncing and request deduplication.
 *
 * Key Features:
 * - useSearch: Main search hook for SearchResults component
 * - useSearchSuggestions: Debounced suggestions for SearchBar autocomplete
 * - TanStack Query integration for caching and background updates
 * - Automatic request deduplication to prevent duplicate API calls
 * - Configurable stale times optimized for search result freshness
 *
 * Performance Optimizations:
 * - Search results cached for 1 minute (frequently changing data)
 * - Suggestions cached for 5 minutes (more stable data)
 * - Minimum query length requirements to reduce unnecessary requests
 * - Automatic cleanup of unused cache entries
 */

/**
 * Search Hooks
 *
 * These hooks provide React Query integration for search functionality.
 * They handle caching, background refetching, and error states for search operations
 * while maintaining optimal performance through debouncing and request deduplication.
 *
 * Key Features:
 * - useSearch: Main search hook for SearchResults component
 * - useSearchSuggestions: Debounced suggestions for SearchBar autocomplete
 * - TanStack Query integration for caching and background updates
 * - Automatic request deduplication to prevent duplicate API calls
 * - Configurable stale times optimized for search result freshness
 *
 * Performance Optimizations:
 * - Search results cached for 1 minute (frequently changing data)
 * - Suggestions cached for 5 minutes (more stable data)
 * - Minimum query length requirements to reduce unnecessary requests
 * - Automatic cleanup of unused cache entries
 */

/**
 * Search Hooks
 *
 * These hooks provide React Query integration for search functionality.
 * They handle caching, background refetching, and error states for search operations
 * while maintaining optimal performance through debouncing and request deduplication.
 *
 * Key Features:
 * - useSearch: Main search hook for SearchResults component
 * - useSearchSuggestions: Debounced suggestions for SearchBar autocomplete
 * - TanStack Query integration for caching and background updates
 * - Automatic request deduplication to prevent duplicate API calls
 * - Configurable stale times optimized for search result freshness
 *
 * Performance Optimizations:
 * - Search results cached for 1 minute (frequently changing data)
 * - Suggestions cached for 5 minutes (more stable data)
 * - Minimum query length requirements to reduce unnecessary requests
 * - Automatic cleanup of unused cache entries
 */

/**
 * Search Hooks
 *
 * These hooks provide React Query integration for search functionality.
 * They handle caching, background refetching, and error states for search operations
 * while maintaining optimal performance through debouncing and request deduplication.
 *
 * Key Features:
 * - useSearch: Main search hook for SearchResults component
 * - useSearchSuggestions: Debounced suggestions for SearchBar autocomplete
 * - TanStack Query integration for caching and background updates
 * - Automatic request deduplication to prevent duplicate API calls
 * - Configurable stale times optimized for search result freshness
 *
 * Performance Optimizations:
 * - Search results cached for 1 minute (frequently changing data)
 * - Suggestions cached for 5 minutes (more stable data)
 * - Minimum query length requirements to reduce unnecessary requests
 * - Automatic cleanup of unused cache entries
 */

/**
 * Search Hooks
 *
 * These hooks provide React Query integration for search functionality.
 * They handle caching, background refetching, and error states for search operations
 * while maintaining optimal performance through debouncing and request deduplication.
 *
 * Key Features:
 * - useSearch: Main search hook for SearchResults component
 * - useSearchSuggestions: Debounced suggestions for SearchBar autocomplete
 * - TanStack Query integration for caching and background updates
 * - Automatic request deduplication to prevent duplicate API calls
 * - Configurable stale times optimized for search result freshness
 *
 * Performance Optimizations:
 * - Search results cached for 1 minute (frequently changing data)
 * - Suggestions cached for 5 minutes (more stable data)
 * - Minimum query length requirements to reduce unnecessary requests
 * - Automatic cleanup of unused cache entries
 */

/**
 * Search Hooks
 *
 * These hooks provide React Query integration for search functionality.
 * They handle caching, background refetching, and error states for search operations
 * while maintaining optimal performance through debouncing and request deduplication.
 *
 * Key Features:
 * - useSearch: Main search hook for SearchResults component
 * - useSearchSuggestions: Debounced suggestions for SearchBar autocomplete
 * - TanStack Query integration for caching and background updates
 * - Automatic request deduplication to prevent duplicate API calls
 * - Configurable stale times optimized for search result freshness
 *
 * Performance Optimizations:
 * - Search results cached for 1 minute (frequently changing data)
 * - Suggestions cached for 5 minutes (more stable data)
 * - Minimum query length requirements to reduce unnecessary requests
 * - Automatic cleanup of unused cache entries
 */

// Define filter interface for search (simplified from collections)
export interface SearchFilters {
  priceRange?: [number, number];
  condition?: string; // Allow any condition string, not just simplified ones
  discountRange?: [number, number];
  categories?: string;
  subcategory?: string;
  featured?: boolean;
  type?: string;
  inStockOnly?: boolean;
  retailer?: string;
  region?: string;
  isPrivate?: boolean;
  isNew?: boolean;
}

/**
 * Main search hook for search results
 *
 * This hook handles the primary search functionality used by SearchResults component.
 * It calls the searchListings service which searches both catalog and auction listings.
 *
 * IMPORTANT: This hook only triggers when query is provided - no automatic calls on typing.
 * The search should only be triggered when user submits the search (presses Enter).
 *
 * @param query - Search query string (should only be set when user submits)
 * @param filters - Optional search filters
 * @returns TanStack Query result with both catalogs and auctions, loading states, and error handling
 */
export const useSearch = (query: string, filters?: SearchFilters) => {
  const hasFilters = filters && Object.keys(filters).length > 0;

  return useQuery({
    queryKey: ["search", query, filters],
    queryFn: async () => {
      // Extract filter parameters for searchListings
      const filterParams = {
        categories: filters?.categories,
        subcategory: filters?.subcategory,
        condition: filters?.condition,
        featured: filters?.featured,
        type: filters?.type,
        region: filters?.region,
        isPrivate: filters?.isPrivate,
        isNew: filters?.isNew,
      };

      const result = await searchListings(query, filterParams, { limit: 50 });
      // Return the full result with both catalogs and auctions
      return result;
    },
    staleTime: 1 * 60 * 1000, // 1 minute (search results change frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
    enabled: !!query.trim() || hasFilters, // Only run if there's a query OR filters are applied
    refetchOnWindowFocus: false, // Don't refetch on window focus for search
  });
};

/**
 * Search suggestions hook with debouncing
 *
 * This hook provides autocomplete suggestions for the SearchBar component.
 * It uses a debounced query to prevent excessive API calls while the user is typing
 * and generates suggestions from search results using word matching.
 *
 * @param query - Current search query from input field
 * @returns TanStack Query result with suggestion strings array
 */
export const useSearchSuggestions = (query: string) => {
  // Debounce the query more aggressively for suggestions (500ms)
  const debouncedQuery = useDebounce(query, 500);

  return useQuery({
    queryKey: ["search-suggestions", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
        return [];
      }

      // Get search results for suggestions
      const result = await searchListings(debouncedQuery, {}, { limit: 20 });

      // Generate suggestions from both catalog and auction results
      const suggestions = generateSearchSuggestions(
        debouncedQuery,
        result.catalogs,
        result.auctions
      );

      return suggestions;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes (suggestions are more stable)
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
    enabled: debouncedQuery.length >= 2, // Only search for suggestions with 2+ characters
    refetchOnWindowFocus: false, // Don't refetch suggestions on window focus
  });
};
