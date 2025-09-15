# Collection Filter Integration - Stepwise Implementation Plan

## Overview
Integrate FilterSidebar selections with collection page API calls using proper enum conversion and maintaining existing preference-aware functionality.

## Step 1: Create Filter Conversion Utilities
**File**: `src/features/filters/utils/filterConverters.ts`

### Purpose
Convert FilterSidebar user-friendly values to backend-compatible enum values using ListingTypeConverter.ts BiMaps.

### Implementation
```typescript
// Import BiMaps from ListingTypeConverter.ts
import {
  fileToDbCategoryBiMap,
  fileToDbSubcategoryBiMap,
  fileToDbConditionBiMap,
  fileToDbPackagingBiMap,
} from '@/amplify/functions/commons/converters/ListingTypeConverter'
import { getStateCodesForRegions } from '@/src/features/buyer-preferences/data/preferenceOptions'

interface FilterSidebarState {
  priceRange: [number, number]
  selectedLocations: string[]
  selectedCategories: string[]
  selectedSubcategories: string[]
  selectedBrands: string[]
  selectedConditions: string[]
  selectedPackaging: string[]
  selectedListingFormats: string[]
}

interface ConvertedFilters {
  categories?: string[]
  subcategories?: string[]
  conditions?: string[]
  brands?: string[]
  packaging?: string[]
  priceRange?: [number, number]
  regionCodes?: string[]
  listingFormats?: string[]
}

export function convertFiltersToEnums(filterState: FilterSidebarState): ConvertedFilters {
  const converted: ConvertedFilters = {}

  // Convert categories using BiMap
  if (filterState.selectedCategories.length > 0) {
    converted.categories = filterState.selectedCategories
      .map(cat => fileToDbCategoryBiMap.getValue(cat))
      .filter(Boolean)
  }

  // Convert subcategories using BiMap
  if (filterState.selectedSubcategories.length > 0) {
    converted.subcategories = filterState.selectedSubcategories
      .map(subcat => fileToDbSubcategoryBiMap.getValue(subcat))
      .filter(Boolean)
  }

  // Convert conditions using BiMap
  if (filterState.selectedConditions.length > 0) {
    converted.conditions = filterState.selectedConditions
      .map(condition => fileToDbConditionBiMap.getValue(condition))
      .filter(Boolean)
  }

  // Convert packaging using BiMap
  if (filterState.selectedPackaging.length > 0) {
    converted.packaging = filterState.selectedPackaging
      .map(pkg => fileToDbPackagingBiMap.getValue(pkg))
      .filter(Boolean)
  }

  // Brands - no conversion needed, use as strings
  if (filterState.selectedBrands.length > 0) {
    converted.brands = filterState.selectedBrands
  }

  // Price range - use as-is
  if (filterState.priceRange[0] > 0 || filterState.priceRange[1] > 0) {
    converted.priceRange = filterState.priceRange
  }

  // Convert locations to region codes (like megaMenuQueryService.ts)
  if (filterState.selectedLocations.length > 0) {
    const stateCodes = getStateCodesForRegions(filterState.selectedLocations)
    if (stateCodes.length > 0) {
      converted.regionCodes = stateCodes
    }
  }

  // Listing formats - handle Private Offers vs Public Auctions
  if (filterState.selectedListingFormats.length > 0) {
    converted.listingFormats = filterState.selectedListingFormats.map(format => {
      switch (format) {
        case 'Private Offers': return 'catalog'
        case 'Public Auctions': return 'auction'
        default: return format.toLowerCase()
      }
    })
  }

  return converted
}
```

## Step 2: Update Collection Service Layer
**File**: `src/features/collections/services/collectionQueryService.ts`

### Purpose
Modify existing `buildWhereClause` function to accept additional filter parameters from FilterSidebar.

### Implementation
```typescript
// Update CollectionFilters interface
interface CollectionFilters {
  // Existing fields
  categories?: string[]
  subcategories?: string[]
  segments?: string[]
  
  // NEW: Additional FilterSidebar fields
  conditions?: string[]
  brands?: string[]
  packaging?: string[]
  priceRange?: [number, number]
  regionCodes?: string[]
  listingFormats?: string[]
  take?: number
  skip?: number
}

// Update buildWhereClause function
function buildWhereClause(filters: CollectionFilters): Record<string, unknown> {
  const where: Record<string, unknown> = { status: 'ACTIVE' }

  // Existing category/subcategory/segment logic...

  // NEW: Add condition filtering
  if (filters.conditions && filters.conditions.length > 0) {
    where.catalog_products = {
      some: {
        product_condition: { in: filters.conditions }
      }
    }
  }

  // NEW: Add brand filtering  
  if (filters.brands && filters.brands.length > 0) {
    const existingProductFilter = (where.catalog_products as Record<string, unknown>) || {}
    where.catalog_products = {
      some: {
        ...((existingProductFilter as any).some || {}),
        brands: {
          brand_name: { in: filters.brands }
        }
      }
    }
  }

  // NEW: Add packaging filtering
  if (filters.packaging && filters.packaging.length > 0) {
    where.packaging = { in: filters.packaging }
  }

  // NEW: Add region filtering
  if (filters.regionCodes && filters.regionCodes.length > 0) {
    where.addresses = {
      province_code: { in: filters.regionCodes }
    }
  }

  // Existing price range logic is already implemented...

  return where
}
```

## Step 3: Create Filter State Communication
**File**: `src/features/filters/hooks/useCollectionFilters.ts`

### Purpose
Custom hook to manage filter state and communicate changes to parent components.

### Implementation
```typescript
import { useState, useCallback } from 'react'
import { convertFiltersToEnums } from '../utils/filterConverters'

interface FilterSidebarState {
  priceRange: [number, number]
  selectedLocations: string[]
  selectedCategories: string[]
  selectedSubcategories: string[]
  selectedBrands: string[]
  selectedConditions: string[]
  selectedPackaging: string[]
  selectedListingFormats: string[]
}

interface UseCollectionFiltersProps {
  onFiltersChange: (convertedFilters: ConvertedFilters) => void
  initialFilters?: Partial<FilterSidebarState>
}

export function useCollectionFilters({ onFiltersChange, initialFilters }: UseCollectionFiltersProps) {
  const [filterState, setFilterState] = useState<FilterSidebarState>({
    priceRange: [0, 0],
    selectedLocations: [],
    selectedCategories: [],
    selectedSubcategories: [],
    selectedBrands: [],
    selectedConditions: [],
    selectedPackaging: [],
    selectedListingFormats: [],
    ...initialFilters
  })

  const updateFilters = useCallback((newFilters: Partial<FilterSidebarState>) => {
    setFilterState(prev => {
      const updated = { ...prev, ...newFilters }
      
      // Convert to enums and notify parent
      const convertedFilters = convertFiltersToEnums(updated)
      onFiltersChange(convertedFilters)
      
      return updated
    })
  }, [onFiltersChange])

  const clearAllFilters = useCallback(() => {
    const clearedState = {
      priceRange: [0, 0] as [number, number],
      selectedLocations: [],
      selectedCategories: [],
      selectedSubcategories: [],
      selectedBrands: [],
      selectedConditions: [],
      selectedPackaging: [],
      selectedListingFormats: [],
    }
    setFilterState(clearedState)
    onFiltersChange({})
  }, [onFiltersChange])

  return {
    filterState,
    updateFilters,
    clearAllFilters
  }
}
```

## Step 4: Update FilterSidebar Component
**File**: `src/features/filters/components/FilterSidebar.tsx`

### Purpose
Add callback props to communicate filter changes and integrate with collection pages.

### Implementation Changes
```typescript
interface FilterSidebarProps {
  category?: string
  onFiltersChange?: (convertedFilters: ConvertedFilters) => void
  onFiltersCleared?: () => void
  className?: string
}

// Inside FilterSidebar component:
const { filterState, updateFilters, clearAllFilters } = useCollectionFilters({
  onFiltersChange: onFiltersChange || (() => {}),
})

// Update all filter selection handlers to use updateFilters:
const handleCategoryChange = (category: string, checked: boolean) => {
  const updated = checked 
    ? [...filterState.selectedCategories, category]
    : filterState.selectedCategories.filter(c => c !== category)
  
  updateFilters({ selectedCategories: updated })
}

// Similar handlers for other filter types...
```

## Step 5: Update CollectionListingsGrid
**File**: `src/features/collections/components/CollectionListingsGrid.tsx`

### Purpose
Accept additional filters from FilterSidebar and merge with existing page filters.

### Implementation Changes
```typescript
interface CollectionListingsGridProps {
  scope: CollectionScope
  filters: Record<string, string[]>
  searchParams: { [key: string]: string | string[] | undefined }
  title?: string
  // NEW: Additional filters from FilterSidebar
  additionalFilters?: ConvertedFilters
}

// Inside component:
useEffect(() => {
  const fetchListings = async () => {
    // Merge page filters with FilterSidebar filters
    const mergedFilters = {
      ...filters,
      ...additionalFilters
    }

    if (shouldUsePreferences) {
      const preferenceFilters: PreferenceAwareFilters = {
        ...mergedFilters,
        userPreferences,
      }
      response = await fetchPreferenceAwareListings(preferenceFilters)
    } else {
      response = await fetchBasicCollectionListings(mergedFilters)
    }
    // ... rest of fetch logic
  }
}, [filters, additionalFilters, /* other deps */])
```

## Step 6: Update Collection Pages
**Files**: All collection pages (`near-you/page.tsx`, `catalog/page.tsx`, etc.)

### Purpose
Convert to client components and manage FilterSidebar state.

### Implementation Pattern
```typescript
'use client'

import { useState, useCallback } from 'react'
import { ConvertedFilters } from '@/src/features/filters/utils/filterConverters'

const NearYouPage = () => {
  const [additionalFilters, setAdditionalFilters] = useState<ConvertedFilters>({})

  const handleFiltersChange = useCallback((convertedFilters: ConvertedFilters) => {
    setAdditionalFilters(convertedFilters)
  }, [])

  // Existing filters for this page
  const filters = {} // page-specific filters

  return (
    <MainLayout>
      {/* ... existing layout */}
      <FilterSidebar onFiltersChange={handleFiltersChange} />
      {/* ... */}
      <CollectionListingsGrid
        filters={filters}
        additionalFilters={additionalFilters}
        scope="catalog"
        searchParams={{}}
        title="Near You"
      />
    </MainLayout>
  )
}
```

## Step 7: URL Synchronization (Optional Enhancement)
**File**: `src/features/filters/hooks/useFilterUrlSync.ts`

### Purpose
Sync filter state with URL parameters for bookmarkable filtered pages.

### Implementation
```typescript
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export function useFilterUrlSync(filterState: FilterSidebarState, updateFilters: Function) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Read filters from URL on mount
  useEffect(() => {
    const urlFilters: Partial<FilterSidebarState> = {}
    
    // Parse URL parameters
    const categories = searchParams.get('categories')?.split('~') || []
    const brands = searchParams.get('brands')?.split('~') || []
    // ... parse other parameters
    
    if (categories.length > 0 || brands.length > 0 /* ... */) {
      updateFilters(urlFilters)
    }
  }, [])

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    
    if (filterState.selectedCategories.length > 0) {
      params.set('categories', filterState.selectedCategories.join('~'))
    }
    if (filterState.selectedBrands.length > 0) {
      params.set('brands', filterState.selectedBrands.join('~'))
    }
    // ... set other parameters

    const newUrl = params.toString() ? `?${params.toString()}` : ''
    router.replace(newUrl, { scroll: false })
  }, [filterState])
}
```

## Implementation Order

1. **Step 1**: Create filter conversion utilities
2. **Step 2**: Update collection service layer
3. **Step 3**: Create filter state communication hook
4. **Step 4**: Update FilterSidebar component
5. **Step 5**: Update CollectionListingsGrid
6. **Step 6**: Update collection pages (start with one page for testing)
7. **Step 7**: Add URL synchronization (optional)

## Testing Strategy

1. Test with `near-you` page first (simplest case)
2. Verify enum conversion works correctly
3. Test filter combinations
4. Test with preference-aware context
5. Extend to other collection pages
6. Test URL synchronization if implemented

This plan ensures proper enum conversion, maintains existing functionality, and creates a scalable filter integration system.
