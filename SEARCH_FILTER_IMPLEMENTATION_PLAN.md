# Search Filter Implementation Plan

## Overview

This document outlines the comprehensive plan for implementing a preference-based filter system for the search page (`/e:/boilerplate/boilerCode/src/app/search/`), mirroring the successful pattern used in collection pages while maintaining integration with the existing search functionality and mega menu service.

## Current Architecture Analysis

### Search Page Structure
- **Location**: `src/app/search/page.tsx`
- **Components**: Uses `SearchResults`, `FilterSidebar`, and `ActiveFilterChips`
- **Data Flow**: Search query + URL-based filters → `useSearch` hook → API calls
- **Unique Features**: Integrates with `megaMenuQueryService.ts` for mega menu functionality

### Current Filter System (Legacy)
- **Component**: `FilterSidebar.tsx` (URL-based filtering)
- **Approach**: Direct URL parameter manipulation
- **Limitations**: Not preference-based, lacks the modern filter pattern

### Target Pattern (Collections)
- **Component**: `PageSpecificFilterSidebar.tsx`
- **Approach**: Client-side filtering with `CombinedListing` data
- **Features**: Preference-based, dynamic filter generation, better UX

## Implementation Plan

### Phase 1: Foundation Setup

#### 1.1 Create Search-Specific Query Service
**File**: `src/features/search/services/searchPreferenceQueryService.ts`

```typescript
import { CombinedListing } from '@/shared/types/filterTypes';
import { searchListings } from './searchQueryService';
import { SearchFilters } from '@/features/search/types';

interface SearchPreferenceParams {
  query: string;
  filters?: SearchFilters;
  limit?: number;
}

export async function getSearchPreferenceData(
  params: SearchPreferenceParams
): Promise<CombinedListing[]> {
  try {
    const { catalogListings, auctionListings } = await searchListings(
      params.query,
      params.filters
    );
    
    // Transform to CombinedListing format
    const combinedListings: CombinedListing[] = [
      ...catalogListings.map(listing => ({
        ...listing,
        listingType: 'catalog' as const,
        // Add required CombinedListing fields
      })),
      ...auctionListings.map(listing => ({
        ...listing,
        listingType: 'auction' as const,
        // Add required CombinedListing fields
      }))
    ];
    
    return combinedListings;
  } catch (error) {
    console.error('Error fetching search preference data:', error);
    throw error;
  }
}
```

#### 1.2 Extend Filter Extractors
**File**: `src/features/filters/utils/filterExtractors.ts`

Add search-specific filter extraction functions:

```typescript
export function extractSearchFilters(
  listings: CombinedListing[],
  context: PageContext
): FilterSection[] {
  const sections: FilterSection[] = [];
  
  // Price range filter
  sections.push(extractPriceRangeFilter(listings));
  
  // Search-specific filters
  sections.push(extractListingTypeFilter(listings)); // Catalog vs Auction
  sections.push(extractCategoryFilter(listings));
  sections.push(extractConditionFilter(listings));
  sections.push(extractBrandFilter(listings));
  sections.push(extractLocationFilter(listings));
  
  return sections.filter(section => section.options.length > 0);
}

function extractListingTypeFilter(listings: CombinedListing[]): FilterSection {
  const types = [...new Set(listings.map(l => l.listingType))];
  return {
    key: 'listingType',
    title: 'Listing Type',
    type: 'checkbox',
    options: types.map(type => ({
      value: type,
      label: type === 'catalog' ? 'Catalog' : 'Auction',
      count: listings.filter(l => l.listingType === type).length
    }))
  };
}
```

### Phase 2: Search Client Wrapper

#### 2.1 Create SearchClientWrapper
**File**: `src/app/search/SearchClientWrapper.tsx`

```typescript
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { CombinedListing, PageSpecificFilterState, PageContext } from '@/shared/types/filterTypes';
import { getSearchPreferenceData } from '@/features/search/services/searchPreferenceQueryService';
import { extractSearchFilters } from '@/features/filters/utils/filterExtractors';
import { applyFilters } from '@/features/filters/utils/filterUtils';
import { PageSpecificFilterSidebar } from '@/features/filters/components/PageSpecificFilterSidebar';
import { SearchResults } from './SearchResults';
import { SearchResultsSkeleton } from '@/components/skeletons/SearchResultsSkeleton';

interface SearchClientWrapperProps {
  initialQuery: string;
}

export const SearchClientWrapper = ({ initialQuery }: SearchClientWrapperProps) => {
  const searchParams = useSearchParams();
  const [allListings, setAllListings] = useState<CombinedListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<CombinedListing[]>([]);
  const [filters, setFilters] = useState<PageSpecificFilterState>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const query = searchParams.get('q') || initialQuery;

  // Page context for search
  const pageContext: PageContext = {
    pageType: 'search',
    searchQuery: query,
    // Add other context as needed
  };

  // Fetch search data
  useEffect(() => {
    const fetchSearchData = async () => {
      if (!query) {
        setAllListings([]);
        setFilteredListings([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const listings = await getSearchPreferenceData({ query });
        setAllListings(listings);
        setFilteredListings(listings);
      } catch (err) {
        setError('Failed to fetch search results');
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchData();
  }, [query]);

  // Apply filters when filter state changes
  useEffect(() => {
    const filtered = applyFilters(allListings, filters);
    setFilteredListings(filtered);
  }, [allListings, filters]);

  // Generate filter sections
  const filterSections = useMemo(() => {
    return extractSearchFilters(allListings, pageContext);
  }, [allListings, pageContext]);

  const handleFiltersChange = (newFilters: PageSpecificFilterState) => {
    setFilters(newFilters);
  };

  if (isLoading) {
    return <SearchResultsSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Desktop Filter Sidebar */}
      <div className="hidden lg:block w-80 flex-shrink-0">
        <PageSpecificFilterSidebar
          listings={allListings}
          pageContext={pageContext}
          onFiltersChange={handleFiltersChange}
        />
      </div>
      
      {/* Search Results */}
      <div className="flex-1">
        <SearchResults 
          listings={filteredListings}
          query={query}
          totalCount={allListings.length}
          filteredCount={filteredListings.length}
        />
      </div>
    </div>
  );
};
```

### Phase 3: Update Search Page Architecture

#### 3.1 Modify Search Page
**File**: `src/app/search/page.tsx`

```typescript
import { Suspense } from 'react';
import { Metadata } from 'next';
import { MainLayout } from '@/components/layout/MainLayout';
import { DynamicBreadcrumb } from '@/components/navigation/DynamicBreadcrumb';
import { SearchClientWrapper } from './SearchClientWrapper';
import { SearchResultsSkeleton } from '@/components/skeletons/SearchResultsSkeleton';
import { ActiveFilterChips } from '@/features/filters/components/ActiveFilterChips';

interface SearchPageProps {
  searchParams: {
    q?: string;
    [key: string]: string | string[] | undefined;
  };
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const query = searchParams.q || '';
  return {
    title: query ? `Search results for "${query}"` : 'Search',
    description: query 
      ? `Find the best deals for "${query}" on our marketplace`
      : 'Search our marketplace for the best deals',
  };
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <DynamicBreadcrumb />
        
        {/* Active Filter Chips */}
        <div className="mb-6">
          <ActiveFilterChips />
        </div>
        
        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-4">
          {/* Mobile filter implementation */}
        </div>
        
        {/* Search Content */}
        <Suspense fallback={<SearchResultsSkeleton />}>
          <SearchClientWrapper initialQuery={query} />
        </Suspense>
      </div>
    </MainLayout>
  );
}
```

### Phase 4: Simplify Search Results Component

#### 4.1 Update SearchResults Component
**File**: `src/app/search/SearchResults.tsx`

```typescript
'use client';

import { useState } from 'react';
import { CombinedListing } from '@/shared/types/filterTypes';
import { CatalogCard } from '@/features/collections/components/CatalogCard';
import { AuctionCard } from '@/features/auctions/components/AuctionCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SearchResultsProps {
  listings: CombinedListing[];
  query: string;
  totalCount: number;
  filteredCount: number;
}

type SortOption = 'relevance' | 'price-low' | 'price-high' | 'title' | 'category';

export const SearchResults = ({ 
  listings, 
  query, 
  totalCount, 
  filteredCount 
}: SearchResultsProps) => {
  const [sortBy, setSortBy] = useState<SortOption>('relevance');

  // Sort listings based on selected option
  const sortedListings = [...listings].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return (a.price || 0) - (b.price || 0);
      case 'price-high':
        return (b.price || 0) - (a.price || 0);
      case 'title':
        return a.title.localeCompare(b.title);
      case 'category':
        return (a.category || '').localeCompare(b.category || '');
      default:
        return 0; // relevance - maintain original order
    }
  });

  if (!query) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Start your search</h2>
        <p className="text-gray-600">Enter a search term to find products</p>
      </div>
    );
  }

  if (totalCount === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">No results found</h2>
        <p className="text-gray-600">Try adjusting your search terms</p>
      </div>
    );
  }

  return (
    <div>
      {/* Results Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">
            Search results for "{query}"
          </h1>
          <p className="text-gray-600">
            Showing {filteredCount} of {totalCount} results
          </p>
        </div>
        
        {/* Sort Dropdown */}
        <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Relevance</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="category">Category</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Grid */}
      {filteredCount === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No results match your filters</h2>
          <p className="text-gray-600">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedListings.map((listing) => (
            listing.listingType === 'catalog' ? (
              <CatalogCard key={listing.id} listing={listing} />
            ) : (
              <AuctionCard key={listing.id} listing={listing} />
            )
          ))}
        </div>
      )}
    </div>
  );
};
```

### Phase 5: Mega Menu Integration

#### 5.1 Integrate with Mega Menu Service
**File**: `src/features/search/services/searchPreferenceQueryService.ts` (Update)

```typescript
import { getMegaMenuData } from './megaMenuQueryService';

export async function getSearchPreferenceDataWithMegaMenu(
  params: SearchPreferenceParams
): Promise<{
  listings: CombinedListing[];
  megaMenuData: any; // Type according to your mega menu structure
}> {
  try {
    // Fetch both search results and mega menu data in parallel
    const [listings, megaMenuData] = await Promise.all([
      getSearchPreferenceData(params),
      getMegaMenuData(params.query)
    ]);
    
    return {
      listings,
      megaMenuData
    };
  } catch (error) {
    console.error('Error fetching search data with mega menu:', error);
    throw error;
  }
}
```

## File Structure Changes

### New Files to Create
```
src/
├── features/
│   └── search/
│       └── services/
│           └── searchPreferenceQueryService.ts
├── app/
│   └── search/
│       └── SearchClientWrapper.tsx
└── features/
    └── filters/
        └── utils/
            └── filterExtractors.ts (extend existing)
```

### Files to Modify
```
src/
├── app/
│   └── search/
│       ├── page.tsx (major refactor)
│       └── SearchResults.tsx (simplify)
└── features/
    └── filters/
        └── utils/
            └── filterExtractors.ts (add search-specific functions)
```

### Files to Deprecate (Gradually)
```
src/
└── app/
    └── search/
        └── FilterSidebar.tsx (replace with PageSpecificFilterSidebar)
```

## Integration Points

### 1. Search API Integration
- Maintain compatibility with existing `searchQueryService.ts`
- Transform API responses to `CombinedListing` format
- Preserve search performance and caching

### 2. Mega Menu Service
- Integrate `megaMenuQueryService.ts` calls
- Maintain mega menu functionality
- Consider parallel data fetching for performance

### 3. URL State Management
- Preserve search query in URL (`?q=search-term`)
- Consider adding filter state to URL for shareability
- Maintain backward compatibility with existing URLs

### 4. Filter System Integration
- Use existing `PageSpecificFilterSidebar` component
- Leverage existing filter utilities and types
- Maintain filter state management patterns

## Technical Considerations

### Performance
- **Client-side filtering**: Fast filtering after initial load
- **Data fetching**: Consider pagination for large result sets
- **Caching**: Implement proper caching strategies
- **Debouncing**: Add debouncing for filter changes

### Search vs Collections Differences
- **Data source**: Search API vs preference-based queries
- **Dynamic content**: Search results change with query
- **Mega menu**: Search-specific integration requirement
- **URL structure**: Different parameter handling

### Backward Compatibility
- Maintain existing search URLs
- Preserve search functionality during transition
- Gradual migration approach

### Mobile Experience
- Implement mobile filter modal/drawer
- Ensure responsive design
- Touch-friendly filter interactions

### Error Handling
- Search API failures
- Empty result states
- Filter application errors
- Network connectivity issues

### SEO Considerations
- Maintain search result indexability
- Proper meta tags for search pages
- Structured data for search results

## Implementation Timeline

### Week 1: Foundation
- Create `searchPreferenceQueryService.ts`
- Extend filter extractors for search
- Set up basic data transformation

### Week 2: Core Components
- Implement `SearchClientWrapper`
- Update search page architecture
- Basic filter integration

### Week 3: Search Results & Integration
- Simplify `SearchResults` component
- Integrate mega menu service
- Add sorting functionality

### Week 4: Polish & Testing
- Mobile filter implementation
- Error handling and edge cases
- Performance optimization
- Testing and bug fixes

## Testing Strategy

### Unit Tests
- Filter extraction functions
- Data transformation utilities
- Component rendering logic

### Integration Tests
- Search API integration
- Filter application flow
- Mega menu integration

### E2E Tests
- Complete search and filter workflow
- Mobile filter experience
- URL state management

### Performance Tests
- Large result set handling
- Filter application speed
- Memory usage optimization

## Success Metrics

### User Experience
- Faster filter application
- Improved search result relevance
- Better mobile experience

### Technical
- Reduced API calls for filtering
- Improved component reusability
- Better code maintainability

### Performance
- Faster filter response times
- Reduced bundle size
- Better caching efficiency

## Risk Mitigation

### Technical Risks
- **Data transformation complexity**: Thorough testing and validation
- **Performance degradation**: Monitoring and optimization
- **Integration issues**: Incremental implementation

### User Experience Risks
- **Feature regression**: Comprehensive testing
- **Learning curve**: Maintain familiar UI patterns
- **Mobile usability**: Dedicated mobile testing

### Business Risks
- **Search functionality disruption**: Gradual rollout
- **SEO impact**: Maintain search indexability
- **User adoption**: Monitor usage metrics

## Conclusion

This implementation plan provides a comprehensive roadmap for migrating the search page to use the modern, preference-based filter system while maintaining all existing functionality and improving the user experience. The phased approach ensures minimal disruption while delivering significant improvements in performance and maintainability.

The key success factors are:
1. Maintaining backward compatibility
2. Preserving search performance
3. Ensuring seamless mega menu integration
4. Delivering an improved mobile experience
5. Following established patterns from the collections implementation

By following this plan, the search page will align with the modern filter architecture while providing users with a superior search and filtering experience.