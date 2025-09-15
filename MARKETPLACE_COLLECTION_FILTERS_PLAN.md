# Marketplace Collection Page Filters Implementation Plan

## Executive Summary

This plan outlines the implementation of page-specific filter sidebars for marketplace collection pages, starting with the "Near You" collection. The approach focuses on dynamic filter generation based on the listings already loaded by each page, avoiding global filters and additional API calls.

## Current Architecture Analysis

### Existing Structure
- **Collection Pages**: Located in `src/app/collections/` with specialized routes (near-you, catalog, category, segment)
- **Query Services**: Each section uses specialized functions like:
  - `fetchRegionOnlyListings()` - Near You page
  - `fetchCategoryOnlyListings()` - Category-based sections  
  - `fetchSegmentOnlyListings()` - Buyer segment sections
  - `fetchPrivateOffersListings()` - Private offers section

### Current Filter Implementation Issues
- **Shared FilterSidebar**: Located in `src/features/navigation/components/FilterSidebar`
- **Hardcoded Data**: Uses non-existent `useFilterOptions('combined')` hook
- **Global Approach**: Not page-specific, doesn't utilize current page's listing data
- **Missing Integration**: Category prop passed but not meaningfully used

### Backend Schema Analysis
**Amplify Schema** (`amplify/data/resource.ts`):
- `ProductCategory`: 20 main categories (HOME_KITCHEN_ORGANIZATION, APPAREL, etc.)
- `ProductSubcategory`: 180+ subcategories 
- `BuyerSegment`: 8 segments (DISCOUNT_RETAIL, STOCKX, etc.)
- `PreferredRegion`: 4 regions (WEST_US, MIDWEST_US, EAST_US, SOUTH_US)

**Prisma Schema** (`prisma/prisma/schema.prisma`):
- `product_condition_type`: NEW, LIKE_NEW, VERY_GOOD, GOOD, ACCEPTABLE, POOR
- `packaging_type`: 20+ packaging options (ORIGINAL_PACKAGING, BULK, etc.)
- `shipping_type`: 7 shipping types (FLAT_RATE, CALCULATED_SHIPPING, etc.)
- `us_state_type`: All 50 US states

## Implementation Strategy

### Phase 1: Page-Specific Filter Architecture

#### 1.1 Core Components Structure
```
src/features/filters/
├── components/
│   ├── PageSpecificFilterSidebar.tsx      # Main filter sidebar component
│   ├── FilterSection.tsx                  # Reusable filter section
│   ├── PriceRangeFilter.tsx              # Price range slider
│   ├── CheckboxFilter.tsx                # Multi-select checkbox filter
│   └── FilterAppliedBadges.tsx           # Active filter indicators
├── hooks/
│   ├── usePageSpecificFilters.ts         # Extract filters from listings
│   ├── useFilterState.ts                 # Filter state management
│   └── useFilteredListings.ts            # Apply filters to listings
├── types/
│   └── filterTypes.ts                    # TypeScript interfaces
└── utils/
    ├── filterExtractors.ts               # Extract filter options from data
    └── filterApplicators.ts              # Apply filter logic
```

#### 1.2 Filter Types Implementation

**1. Price Filter**
- Extract min/max from `minimum_order_value` field
- Range slider with dynamic bounds
- Apply to `minimum_order_value` field

**2. Location Filter**  
- Extract from `addresses.city` + `addresses.province` 
- Display format: "City, Province"
- Filter by state codes (`addresses.province_code`)

**3. Category Filter**
- Show categories when not on category-specific page
- Extract from `category`, `category2`, `category3` fields
- Use enum labels from backend schema

**4. Subcategory Filter**
- Always show subcategories (useful even on category pages)
- Extract from `subcategory`, `subcategory2`, `subcategory3`, `subcategory4`, `subcategory5`
- User-friendly labels

**5. Brand Filter**
- Extract from `brands[].brand_name`
- Searchable multi-select for large lists

**6. Condition Filter**
- Extract from `product_condition` field
- Map enum values to user-friendly labels:
  - `NEW` → "New"
  - `LIKE_NEW` → "Like New"
  - `VERY_GOOD` → "Very Good"
  - etc.

**7. Packaging Filter**
- Extract from `packaging` field
- Map enum values to readable labels

**8. Listing Format Filter**
- Hardcoded options: "Private Offers", "Public Auctions"  
- Filter by `listing_source` field ('catalog' vs 'auction')

### Phase 2: Near You Page Implementation (Prototype)

#### 2.1 Component Integration Pattern
```typescript
// Near You Page Structure
const NearYouPage = () => {
  return (
    <div className="flex gap-8">
      {/* Page-Specific Filter Sidebar */}
      <div className="hidden w-80 flex-shrink-0 lg:block">
        <div className="sticky top-6">
          <PageSpecificFilterSidebar 
            listings={allListings}
            onFilteredListingsChange={setFilteredListings}
            pageContext={{
              type: 'near-you',
              title: 'Near You',
              hideCategories: false // Show categories for this page
            }}
          />
        </div>
      </div>
      
      {/* Main Content - Uses filtered listings */}
      <div className="min-w-0 flex-1">
        <NearYouClient filteredListings={filteredListings} />
      </div>
    </div>
  );
};
```

#### 2.2 Data Flow Architecture
```
1. NearYouClient fetches listings via fetchRegionOnlyListings(stateCodes)
   ↓
2. Raw listings passed to PageSpecificFilterSidebar
   ↓ 
3. FilterSidebar extracts dynamic filter options from listings
   ↓
4. User applies filters → Filter state updated
   ↓
5. Filtered listings calculated and passed back to parent
   ↓
6. NearYouClient displays filtered results (no additional API calls)
```

#### 2.3 Filter Option Extraction Logic
```typescript
// Extract price range from actual listings
const extractPriceRange = (listings: CombinedListing[]) => {
  const prices = listings
    .map(l => l.minimum_order_value)
    .filter(p => p !== null && p !== undefined);
  
  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  };
};

// Extract unique locations
const extractLocations = (listings: CombinedListing[]) => {
  const locations = listings
    .flatMap(l => l.addresses || [])
    .map(addr => ({
      display: `${addr.city}, ${addr.province}`,
      code: addr.province_code
    }));
    
  return [...new Set(locations)];
};
```

### Phase 3: Filter State Management

#### 3.1 Filter State Interface
```typescript
interface PageSpecificFilterState {
  priceRange: {
    min: number;
    max: number;
  };
  locations: string[]; // Province codes
  categories: string[]; // Category enums  
  subcategories: string[]; // Subcategory enums
  brands: string[]; // Brand names
  conditions: string[]; // Condition enums
  packaging: string[]; // Packaging enums
  listingFormats: ('catalog' | 'auction')[]; // Listing source types
}
```

#### 3.2 URL State Synchronization
- Sync filter state with URL parameters
- Support browser back/forward navigation
- Bookmarkable filtered URLs
- Use encoding for multi-select filters (e.g., `categories=HOME_KITCHEN~APPAREL`)

### Phase 4: Additional Collection Pages

#### 4.1 Rollout Order
1. ✅ **Near You** (Phase 2 prototype)
2. **Catalog** (`/collections/catalog`)
3. **Category Multiple** (`/collections/category/multiple`)  
4. **Segment Multiple** (`/collections/segment/multiple`)
5. **Dynamic Category/Segment** (`/collections/[scope]/[slug]`)

#### 4.2 Page Context Customization
```typescript
interface PageContext {
  type: 'near-you' | 'catalog' | 'category' | 'segment' | 'dynamic';
  title: string;
  hideCategories?: boolean; // Hide on category-specific pages
  specialFilters?: string[]; // Page-specific additional filters
}
```

## Technical Implementation Details

### File Naming Conventions
- **Components**: `PageSpecificFilterSidebar.tsx` (distinct from existing `FilterSidebar.tsx`)
- **Hooks**: `usePageSpecificFilters.ts` (distinct from existing filter hooks)
- **Services**: Keep existing services, add filter extraction utilities

### TypeScript Safety
- Strict typing for all filter interfaces
- Enum value validation using backend schema types
- Generic components supporting different listing types

### Performance Considerations
- **Client-side filtering**: No additional API calls after initial page load
- **Memoized calculations**: Filter option extraction and application
- **Debounced updates**: Price range slider changes
- **Virtual scrolling**: For large filter option lists (brands)

### Error Handling
- Graceful degradation when filter extraction fails
- Fallback to showing all listings if filtering errors occur
- User feedback for filter application states

## Testing Strategy

### Unit Tests
- Filter option extraction utilities
- Filter application logic  
- State management hooks

### Integration Tests
- Full filter sidebar component with mock data
- URL state synchronization
- Filter persistence across page navigation

### E2E Tests
- Complete user workflow: apply filters → see results
- Browser navigation with filtered URLs
- Mobile responsiveness

## Migration Strategy

### Phase 1: No Breaking Changes
- Keep existing `FilterSidebar` untouched
- Add new `PageSpecificFilterSidebar` alongside
- Update individual pages incrementally

### Phase 2: Page-by-Page Migration
- Start with Near You page (isolated impact)
- Validate approach before expanding
- Gather user feedback on filtering UX

### Phase 3: Cleanup
- Remove old `FilterSidebar` after all pages migrated
- Consolidate shared filter components
- Performance optimization based on usage patterns

## Success Metrics

### Technical Metrics
- Zero additional API calls for filtering
- < 100ms filter application response time
- < 5MB bundle size increase for filter components

### User Experience Metrics  
- Improved time-to-find-product on collection pages
- Reduced bounce rate on filtered collection views
- Increased engagement with filter controls

## Risk Mitigation

### Technical Risks
- **Memory usage**: Large listing arrays → Implement pagination/virtualization
- **Performance**: Complex filter logic → Optimize with Web Workers if needed
- **State complexity**: Multiple filter types → Use reducer pattern for state management

### UX Risks
- **Filter confusion**: Too many options → Progressive disclosure, smart defaults
- **Mobile experience**: Sidebar space constraints → Drawer/modal pattern
- **Empty results**: Over-filtering → Smart filter suggestions, clear all option

## Next Steps

1. **Create component structure** in `src/features/filters/`
2. **Implement core filter extraction utilities**
3. **Build PageSpecificFilterSidebar component**
4. **Integrate with Near You page as prototype**
5. **Test and refine filtering logic**
6. **Document patterns for other collection pages**
7. **Expand to remaining collection pages**

## Conclusion

This approach ensures:
- ✅ **Page-specific filtering** based on actual loaded listings
- ✅ **No additional API calls** for filter operations  
- ✅ **Dynamic filter options** extracted from real data
- ✅ **Scalable architecture** for all collection pages
- ✅ **Maintainable codebase** with clear separation of concerns
- ✅ **Performance optimization** through client-side filtering

The implementation prioritizes user experience while maintaining technical excellence and following established patterns in the codebase.
