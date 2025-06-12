'use client'

import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

/**
 * ActiveFilterChips Component
 * 
 * PURPOSE:
 * Displays currently applied filters as removable chips/badges, providing users with
 * clear visibility of active filters and the ability to remove individual filters
 * without opening the filter sidebar.
 * 
 * COMPONENT FUNCTIONALITY:
 * 1. Parses URL search parameters to identify active filters
 * 2. Renders each active filter as a removable badge/chip
 * 3. Handles individual filter removal by updating URL parameters
 * 4. Provides user-friendly filter labels with proper formatting
 * 5. Maintains consistent styling with the overall design system
 * 
 * DATA FLOW:
 * URL Parameters → Parse Active Filters → Display as Chips → Remove Individual Filter → Update URL
 * 
 * FILTER CATEGORIES SUPPORTED:
 * - Price Range: Displays formatted price range (e.g., "$100 - $500")
 * - Condition: Shows condition type (New, Refurbished, Used)
 * - Discount Range: Displays discount percentage range (e.g., "20% - 50% off")
 * - Special Events: Shows event names (Clearance, Doorbusters, etc.)
 * - Stock Status: In-stock only filter indicator
 * - Sort Order: Current sorting method display
 * 
 * INTEGRATION POINTS:
 * - Next.js App Router for URL manipulation
 * - FilterSidebar component for comprehensive filtering
 * - Collections and Search pages for filter state management
 * - shadcn/ui components for consistent styling
 * 
 * PERFORMANCE CONSIDERATIONS:
 * - Memoized filter parsing to prevent unnecessary re-renders
 * - Efficient URL parameter manipulation
 * - Minimal DOM updates when filters change
 */

interface ActiveFilterChipsProps {
  /** Current category for collection pages (optional for search pages) */
  category?: string
  /** Search query for search result pages */
  searchQuery?: string
  /** Additional CSS classes for styling customization */
  className?: string
}

export const ActiveFilterChips = ({ 
  category, 
  searchQuery, 
  className = '' 
}: ActiveFilterChipsProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  /**
   * Parse URL search parameters to extract active filters
   * 
   * This function converts URL search parameters into user-friendly
   * filter descriptions that can be displayed as removable chips.
   */
  const getActiveFilters = () => {
    const activeFilters: Array<{
      key: string
      label: string
      value: string
      removeKey: string
    }> = []

    // Price Range Filter
    const priceParam = searchParams.get('price')
    if (priceParam) {
      const [min, max] = priceParam.split('-').map(Number)
      if (!isNaN(min) && !isNaN(max)) {
        activeFilters.push({
          key: 'price',
          label: `$${min} - $${max === 2000 ? '2000+' : max}`,
          value: priceParam,
          removeKey: 'price'
        })
      }
    }

    // Condition Filter
    const conditionParam = searchParams.get('condition')
    if (conditionParam) {
      const conditionLabels: Record<string, string> = {
        'new': 'New',
        'refurbished': 'Refurbished', 
        'used': 'Used'
      }
      activeFilters.push({
        key: 'condition',
        label: conditionLabels[conditionParam] || conditionParam,
        value: conditionParam,
        removeKey: 'condition'
      })
    }

    // Discount Range Filter
    const discountParam = searchParams.get('discount')
    if (discountParam) {
      const [min, max] = discountParam.split('-').map(Number)
      if (!isNaN(min) && !isNaN(max)) {
        activeFilters.push({
          key: 'discount',
          label: `${min}% - ${max === 70 ? '70+' : max}% off`,
          value: discountParam,
          removeKey: 'discount'
        })
      }
    }

    // Special Events Filter
    const specialEventParam = searchParams.get('specialEvent')
    if (specialEventParam) {
      const events = specialEventParam.split(',')
      const eventLabels: Record<string, string> = {
        'clearance': 'Clearance Sale',
        'doorbusters': 'Doorbusters',
        'flash-sale': 'Flash Sale',
        'refurbished-special': 'Refurbished Special'
      }
      
      events.forEach(event => {
        activeFilters.push({
          key: `specialEvent-${event}`,
          label: eventLabels[event] || event,
          value: event,
          removeKey: 'specialEvent'
        })
      })
    }

    // In-Stock Filter
    const inStockParam = searchParams.get('inStock')
    if (inStockParam === 'true') {
      activeFilters.push({
        key: 'inStock',
        label: 'In Stock Only',
        value: 'true',
        removeKey: 'inStock'
      })
    }

    // Sort Order Filter
    const sortParam = searchParams.get('sort')
    if (sortParam) {
      const sortLabels: Record<string, string> = {
        'price-asc': 'Price: Low to High',
        'price-desc': 'Price: High to Low',
        'discount-desc': 'Highest Discount',
        'newest': 'Newest First'
      }
      activeFilters.push({
        key: 'sort',
        label: `Sort: ${sortLabels[sortParam] || sortParam}`,
        value: sortParam,
        removeKey: 'sort'
      })
    }

    return activeFilters
  }

  /**
   * Remove individual filter and update URL
   * 
   * This function handles the removal of a specific filter while preserving
   * all other active filters. For multi-value filters like special events,
   * it removes only the specific value that was clicked.
   * 
   * @param filterKey - The key of the filter to remove
   * @param filterValue - The specific value to remove (for multi-value filters)
   */
  const removeFilter = (filterKey: string, filterValue: string) => {
    const params = new URLSearchParams(searchParams.toString())

    // Handle special event filter removal (multi-value)
    if (filterKey.startsWith('specialEvent-')) {
      const currentEvents = params.get('specialEvent')
      if (currentEvents) {
        const events = currentEvents.split(',').filter(event => event !== filterValue)
        if (events.length > 0) {
          params.set('specialEvent', events.join(','))
        } else {
          params.delete('specialEvent')
        }
      }
    } else {
      // Handle single-value filter removal
      params.delete(filterKey)
    }

    // Preserve search query if it exists
    if (searchQuery) {
      params.set('q', searchQuery)
    }

    // Navigate to updated URL without page reload
    const baseUrl = searchQuery ? '/search' : `/collections/${category}`
    const newUrl = `${baseUrl}${params.toString() ? `?${params.toString()}` : ''}`
    
    // Use replace instead of push to avoid adding to browser history
    // and ensure immediate URL update
    router.replace(newUrl)
  }

  /**
   * Clear all filters and return to unfiltered view
   * 
   * Removes all filter parameters while preserving the search query
   * for search result pages.
   */
  const clearAllFilters = () => {
    const params = new URLSearchParams()
    
    // Preserve search query if it exists
    if (searchQuery) {
      params.set('q', searchQuery)
    }

    const baseUrl = searchQuery ? '/search' : `/collections/${category}`
    const newUrl = `${baseUrl}${params.toString() ? `?${params.toString()}` : ''}`
    
    // Use replace to avoid page reload and browser history pollution
    router.replace(newUrl)
  }

  const activeFilters = getActiveFilters()

  // Don't render anything if no filters are active
  if (activeFilters.length === 0) {
    return null
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span className="text-sm font-medium text-gray-700 mr-2">
        Active Filters:
      </span>
      
      {/* Individual Filter Chips */}
      {activeFilters.map((filter) => (
        <Badge
          key={filter.key}
          variant="secondary"
          className="flex items-center gap-1 px-3 py-1 text-sm hover:bg-gray-200 transition-colors"
        >
          <span>{filter.label}</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 ml-1 hover:bg-transparent"
            onClick={() => removeFilter(filter.key, filter.value)}
            aria-label={`Remove ${filter.label} filter`}
          >
            <X className="w-3 h-3 hover:text-red-500 transition-colors" />
          </Button>
        </Badge>
      ))}

      {/* Clear All Filters Button */}
      {activeFilters.length > 1 && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearAllFilters}
          className="text-xs px-2 py-1 h-auto text-gray-600 hover:text-red-600 hover:border-red-300"
        >
          Clear All
        </Button>
      )}
    </div>
  )
} 