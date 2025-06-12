'use client'

import { useSearch } from '../hooks/useSearch'
import { SimpleProductCard } from '@/src/features/collections/components/SimpleProductCard'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select'
import { Skeleton } from '@/src/components/ui/skeleton'
import { SearchX, SlidersHorizontal, Search, Sparkles, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import type { CollectionFilters } from '@/src/features/collections/types/collections'

interface SearchResultsProps {
  query: string
  filters?: { [key: string]: string | string[] | undefined }
}

const SearchResultsSkeleton = () => (
  <div className="space-y-6 md:space-y-8">
    {/* Header Skeleton */}
    <div className="bg-white rounded-lg md:rounded-xl border border-gray-100 shadow-sm p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Skeleton className="h-6 md:h-7 w-48 md:w-64" />
        <Skeleton className="h-5 md:h-6 w-20 md:w-24 rounded-full" />
      </div>
    </div>

    {/* Controls Skeleton */}
    <div className="bg-white rounded-lg md:rounded-xl border border-gray-100 shadow-sm p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Skeleton className="h-5 w-40 md:w-48" />
        <Skeleton className="h-10 w-full sm:w-44" />
      </div>
    </div>
    
    {/* Grid Skeleton - Matching SimpleProductCard structure */}
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="space-y-3">
          {/* Product Image - matching rounded-[18px] from SimpleProductCard */}
          <Skeleton className="aspect-square w-full rounded-[18px]" />
          
          {/* Product Info - matching SimpleProductCard structure */}
          <div className="space-y-1">
            {/* Brand/Retailer */}
            <Skeleton className="h-3 w-1/2" />
            
            {/* Product Title - 2 lines */}
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            
            {/* Units and Discount Info */}
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  </div>
)

export const SearchResults = ({ query, filters }: SearchResultsProps) => {
  const [sortBy, setSortBy] = useState<string>('relevance')

  // Parse filters from URL params
  const parsedFilters: CollectionFilters = {}
  
  if (filters?.price && typeof filters.price === 'string') {
    const [min, max] = filters.price.split('-').map(Number)
    if (!isNaN(min) && !isNaN(max)) {
      parsedFilters.priceRange = [min, max]
    }
  }

  if (filters?.condition && typeof filters.condition === 'string') {
    parsedFilters.condition = filters.condition as 'new' | 'refurbished' | 'used'
  }

  if (filters?.discount && typeof filters.discount === 'string') {
    const [min, max] = filters.discount.split('-').map(Number)
    if (!isNaN(min) && !isNaN(max)) {
      parsedFilters.discountRange = [min, max]
    }
  }

  if (filters?.categories && typeof filters.categories === 'string') {
    parsedFilters.categories = filters.categories.split(',')
  }

  if (filters?.specialEvent && typeof filters.specialEvent === 'string') {
    parsedFilters.specialEvents = filters.specialEvent.split(',')
  }

  if (filters?.inStock === 'true') {
    parsedFilters.inStockOnly = true
  }

  if (filters?.retailer && typeof filters.retailer === 'string') {
    parsedFilters.retailer = filters.retailer
  }

  // Use the search hook
  const { data: products = [], isLoading, error } = useSearch(query, parsedFilters)

  // Sort products based on selected option
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price
      case 'price-desc':
        return b.price - a.price
      case 'discount':
        return (b.discount || 0) - (a.discount || 0)
      case 'newest':
        return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
      case 'rating':
        return (b.rating || 0) - (a.rating || 0)
      default: // relevance
        return 0
    }
  })

  if (isLoading) {
    return <SearchResultsSkeleton />
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg md:rounded-xl border border-red-100 shadow-sm p-6 md:p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full mb-4 md:mb-6">
          <SearchX className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">Search Error</h3>
        <p className="text-gray-600 mb-4 md:mb-6 max-w-md mx-auto text-sm md:text-base">
          We encountered an error while searching. Please try again or contact support if the issue persists.
        </p>
        <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 w-full sm:w-auto">
          Try Again
        </Button>
      </div>
    )
  }

  // Check if we have any filters applied even without a query
  const hasFilters = Object.keys(parsedFilters).length > 0

  if (!query.trim() && !hasFilters) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-xl md:rounded-2xl border border-blue-100 shadow-sm p-8 md:p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-6 md:mb-8 shadow-lg">
          <Search className="w-8 h-8 md:w-10 md:h-10 text-white" />
        </div>
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 md:mb-4">Discover Amazing Deals</h3>
        <p className="text-gray-600 max-w-lg mx-auto text-base md:text-lg leading-relaxed mb-6 md:mb-8">
          Search through thousands of surplus inventory products and find incredible deals on quality items.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-blue-600 font-medium">
          <Sparkles className="w-4 h-4" />
          <span>Start typing to explore our inventory</span>
        </div>
      </div>
    )
  }

  if (sortedProducts.length === 0) {
    return (
      <div className="space-y-6 md:space-y-8">
        {/* Results header for no results */}
        {query && (
          <div className="bg-white rounded-lg md:rounded-xl border border-gray-100 shadow-sm p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-3">
                  <h1 className="text-lg md:text-2xl font-bold text-gray-900">
                    Search results for "{query}"
                  </h1>
                  <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200 w-fit">
                    0 products found
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-lg md:rounded-xl border border-gray-100 shadow-sm p-8 md:p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-full mb-6 md:mb-8">
            <SearchX className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">No Results Found</h3>
          <p className="text-gray-600 mb-6 md:mb-8 max-w-md mx-auto text-sm md:text-base">
            We couldn't find any products matching "{query}". Try adjusting your search:
          </p>
          <div className="grid grid-cols-1 gap-6 max-w-md mx-auto mb-6 md:mb-8">
            <div className="text-center space-y-3">
              <h4 className="font-medium text-gray-900">Search Tips:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Check your spelling</li>
                <li>• Use fewer keywords</li>
                <li>• Try more general terms</li>
              </ul>
            </div>
            <div className="text-center space-y-3">
              <h4 className="font-medium text-gray-900">Popular Categories:</h4>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="outline" className="text-xs">Electronics</Badge>
                <Badge variant="outline" className="text-xs">Furniture</Badge>
                <Badge variant="outline" className="text-xs">Home & Garden</Badge>
                <Badge variant="outline" className="text-xs">Sports</Badge>
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={() => window.location.href = '/marketplace'} className="w-full sm:w-auto">
            Browse All Products
          </Button>
        </div>
      </div>
    )
  }

  // Count active filters
  const activeFiltersCount = Object.values(parsedFilters).filter(Boolean).length

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Enhanced Results Header */}
      {query && (
        <div className="bg-gradient-to-r from-white via-blue-50/30 to-white rounded-lg md:rounded-xl border border-gray-100 shadow-sm p-4 md:p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4">
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-blue-100 rounded-full flex-shrink-0">
                  <Search className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg md:text-2xl font-bold text-gray-900 truncate">
                    Search results for "{query}"
                  </h1>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 text-xs">
                      {sortedProducts.length} products found
                    </Badge>
                    {activeFiltersCount > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} applied
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp className="w-4 h-4 flex-shrink-0" />
              <span>Showing best matches</span>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Results Controls - Removed duplicate filter button */}
      <div className="bg-white rounded-lg md:rounded-xl border border-gray-100 shadow-sm p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-gray-600 font-medium text-sm md:text-base">
              {sortedProducts.length} of {products.length} results
            </span>
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                <span className="text-sm text-blue-600 font-medium">
                  Filtered results
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-3">
            <div className="flex items-center gap-2 text-gray-600">
              <SlidersHorizontal className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium">Sort by:</span>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-44 border-gray-200 hover:border-gray-300">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="discount">Highest Discount</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Enhanced Results Grid - Back to 2 cards per row on mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {sortedProducts.map((product) => (
          <div key={product.id} className="group">
            <SimpleProductCard
              product={product}
            />
          </div>
        ))}
      </div>

      {/* Load More Section (if needed) */}
      {sortedProducts.length >= 20 && (
        <div className="text-center py-6 md:py-8">
          <div className="inline-flex items-center gap-2 text-gray-600 mb-4">
            <div className="w-8 md:w-12 h-px bg-gray-300"></div>
            <span className="text-sm">End of results</span>
            <div className="w-8 md:w-12 h-px bg-gray-300"></div>
          </div>
          <Button variant="outline" onClick={() => window.location.href = '/marketplace'} className="w-full sm:w-auto">
            Explore More Products
          </Button>
        </div>
      )}
    </div>
  )
} 