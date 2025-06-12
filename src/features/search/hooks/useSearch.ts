'use client'

import { useQuery } from '@tanstack/react-query'
import { searchProducts } from '../../collections/services/collectionsService'
import type { CollectionFilters } from '../../collections/types/collections'

export const useSearch = (query: string, filters?: CollectionFilters) => {
  const hasFilters = filters && Object.keys(filters).length > 0
  
  return useQuery({
    queryKey: ['search', query, filters],
    queryFn: () => searchProducts(query, filters),
    staleTime: 1 * 60 * 1000, // 1 minute (search results change frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!query.trim() || hasFilters, // Run if there's a query OR filters are applied
  })
}

export const useSearchSuggestions = (query: string) => {
  return useQuery({
    queryKey: ['search-suggestions', query],
    queryFn: async () => {
      if (!query.trim() || query.length < 2) return []
      
      // Get suggestions based on partial matches
      const results = await searchProducts(query)
      const suggestions = new Set<string>()
      
      results.forEach(product => {
        // Add title words that match the query
        const titleWords = product.title.toLowerCase().split(' ')
        titleWords.forEach(word => {
          if (word.includes(query.toLowerCase()) && word.length > 2) {
            suggestions.add(word)
          }
        })
        
        // Add category if it matches
        if (product.category?.toLowerCase().includes(query.toLowerCase())) {
          suggestions.add(product.category)
        }
      })
      
      return Array.from(suggestions).slice(0, 8) // Limit to 8 suggestions
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: query.length >= 2,
  })
} 