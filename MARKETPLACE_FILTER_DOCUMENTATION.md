# Marketplace Collection Page Filters - Complete Documentation

## 🎯 Overview

This documentation provides a complete reference for the marketplace collection page filters system, specifically implemented for the "Near You" page. It covers the full data flow, involved files, logic implementation, and patterns that should be followed for other collection pages.

## 🏗️ Architecture Overview

The filter system follows a modular, client-side filtering approach:

```
Database Query → Data Transformation → Filter Extraction → UI Rendering → User Interaction → Filter Application
```

### Key Principles
- **Page-Specific APIs**: Each collection page has its own specialized API query (no global filters)
- **Client-Side Filtering**: All filtering happens in the browser for instant UX
- **Dynamic Filter Options**: Filter options are extracted from actual loaded data (no hardcoded values)
- **Consistent Data Structure**: All collection pages use the unified `CombinedListing` interface

## 📁 File Structure & Responsibilities

### Core Files

#### 1. **Database Query Service**
**File:** `src/features/marketplace-catalog/services/catalogPreferenceQueryService.ts`

**Key Functions:**
- `fetchRegionOnlyListings(regionCodes: string[])`
- `fetchCategoryOnlyListings(categoryEnums: string[])`
- `fetchSegmentOnlyListings(segmentEnums: string[])`

**Responsibilities:**
- Execute specialized Prisma queries for each collection type
- Select all required fields for filtering (category, subcategory, listing_condition, packaging, is_private, addresses, brands)
- Transform raw database response to `CombinedListing[]` format
- Handle relational data queries correctly

**Critical Implementation Details:**
```typescript
// ✅ CORRECT: Single relations use simple selection
addresses: true, // Not { select: { city: true } }

// ✅ CORRECT: Array fields must return [] not null
brands: (listing.catalog_products as Array<{ brands?: { brand_name?: string | null } }>)
  ?.map((product) => ({ brand_name: product.brands?.brand_name || null })) || [],
```

#### 2. **Filter Extraction Utilities**
**File:** `src/features/filters/utils/filterExtractors.ts`

**Key Functions:**
- `extractPriceRange(listings)` - Dynamic min/max from listing prices
- `extractLocations(listings)` - Unique city/province combinations
- `extractCategories(listings)` - Unique categories from listings
- `extractSubcategories(listings)` - Unique subcategories from listings  
- `extractBrands(listings)` - Unique brand names from products
- `extractConditions(listings)` - Unique listing conditions
- `extractPackaging(listings)` - Unique packaging types
- `extractListingFormats(listings)` - Auction vs Catalog differentiation
- `generateNearYouFilterSections(listings)` - Orchestrates all extractions

**Responsibilities:**
- Extract unique filter options from loaded listing data
- Generate counts for each filter option
- Format enum values to user-friendly labels
- Only create filter sections if data exists (prevents empty sections)

**Critical Implementation Pattern:**
```typescript
export const extractBrands = (listings: CombinedListing[]): FilterOption[] => {
  const brandMap = new Map<string, number>();
  
  listings.forEach(listing => {
    if (listing.brands?.length) { // Check for array existence
      listing.brands.forEach(brand => {
        if (brand.brand_name) {
          const count = brandMap.get(brand.brand_name) || 0;
          brandMap.set(brand.brand_name, count + 1); // Count occurrences
        }
      });
    }
  });
  
  return Array.from(brandMap.entries())
    .map(([value, count]) => ({
      value,
      label: formatBrandLabel(value), // User-friendly formatting
      count
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
};
```

#### 3. **Filter Application Logic**
**File:** `src/features/filters/utils/filterApplicators.ts`

**Key Functions:**
- `applyFiltersToListings(listings, filterState)` - Main filter application
- `passesPriceFilter()`, `passesLocationFilter()`, `passesBrandFilter()`, etc.
- `hasActiveFilters(filterState)` - Check if any filters are applied
- `resetAllFilters(listings)` - Reset to default state

**Responsibilities:**
- Apply all selected filters to the listings array
- Handle multiple filter combinations with AND logic
- Provide utility functions for filter state management

#### 4. **Filter Sidebar Component**
**File:** `src/features/filters/components/PageSpecificFilterSidebar.tsx`

**Key Component:** `PageSpecificFilterSidebar`

**Props Interface:**
```typescript
interface PageSpecificFilterSidebarProps {
  listings: CombinedListing[];
  onFilteredListingsChangeAction: (filteredListings: CombinedListing[]) => void;
  pageContext: {
    type: 'near-you' | 'category' | 'segment';
    title: string;
  };
  className?: string;
}
```

**Responsibilities:**
- Render filter sections dynamically based on available data
- Handle user interactions (checkbox changes, price range updates)
- Apply filters in real-time and notify parent component
- Maintain filter state and provide clear/reset functionality

#### 5. **Client Wrapper Components**
**File:** `src/app/collections/near-you/NearYouClientWrapper.tsx`

**Responsibilities:**
- Fetch data using page-specific API service
- Manage loading and error states
- Pass data to filter sidebar and display components
- Handle filtered results and display logic

**Pattern:**
```typescript
const NearYouClientWrapper = () => {
  const [allListings, setAllListings] = useState<CombinedListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<CombinedListing[]>([]);
  
  // Fetch data using page-specific service
  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchRegionOnlyListings(regionCodes);
      setAllListings(data.listings);
      setFilteredListings(data.listings);
    };
  }, [regionCodes]);
  
  return (
    <>
      <PageSpecificFilterSidebar
        listings={allListings}
        onFilteredListingsChangeAction={setFilteredListings}
        pageContext={{ type: 'near-you', title: 'Near You' }}
      />
      <NearYouClient listings={filteredListings} />
    </>
  );
};
```

## 🔄 Complete Data Flow

### Step 1: Database Query
1. User navigates to collection page (e.g., `/collections/near-you`)
2. Client wrapper component calls page-specific API service
3. API service executes Prisma query with specialized filtering:
   ```typescript
   // For Near You: Only region filtering
   const whereClause = {
     AND: [
       { status: 'ACTIVE' },
       { addresses: { province_code: { in: regionCodes } } }
     ]
   }
   ```

### Step 2: Data Transformation
1. Raw database response is parsed and transformed to `CombinedListing[]`
2. Critical field mappings are applied:
   ```typescript
   // Single relations
   addresses: listing.addresses as AddressType | null,
   
   // Array relations (must return [] not null)
   brands: (listing.catalog_products as Array<ProductType>)
     ?.map(product => ({ brand_name: product.brands?.brand_name || null })) || [],
   
   // Direct fields
   listing_condition: listing.listing_condition as string | null,
   packaging: listing.packaging as string | null,
   is_private: listing.is_private as boolean | null,
   ```

### Step 3: Filter Extraction
1. `generateNearYouFilterSections(listings)` is called with loaded data
2. Each extraction function analyzes the data:
   - Builds frequency maps for each filter type
   - Formats enum values to user-friendly labels
   - Returns only non-empty filter sections
3. Final filter sections are passed to the sidebar component

### Step 4: UI Rendering
1. Sidebar component renders filter sections dynamically
2. Each section connects to appropriate state handler
3. Filter counts are displayed from actual data
4. Sections are collapsible with appropriate defaults

### Step 5: User Interaction & Filtering
1. User selects filter options (checkboxes, price range)
2. Filter state is updated immediately
3. `applyFiltersToListings()` runs with new filter state
4. Filtered results are passed back to display component
5. UI updates instantly (client-side filtering)

## 🛠️ Implementation Patterns

### For New Collection Pages

#### 1. Create Specialized API Service
```typescript
// Example: fetchSegmentOnlyListings
export const fetchSegmentOnlyListings = async (
  segmentEnums: string[]
): Promise<PreferenceBasedListingsResponse> => {
  // Build segment-specific where clause
  const whereClause = {
    AND: [
      { status: 'ACTIVE' },
      { segment_codes: { hasSome: segmentEnums } }
    ]
  };
  
  // Use same select clause as Near You (all filter fields)
  const query = {
    where: whereClause,
    select: {
      public_id: true,
      title: true,
      // ... all required fields
      addresses: true,
      catalog_products: { select: { brands: { select: { brand_name: true } } } }
    }
  };
  
  // Same transformation logic as Near You
};
```

#### 2. Create Page-Specific Filter Generator
```typescript
// In filterExtractors.ts
export const generateSegmentFilterSections = (listings: CombinedListing[]): FilterSection[] => {
  // Same extraction functions, different section combination
  const priceRange = extractPriceRange(listings);
  const categories = extractCategories(listings);
  // ... other extractions
  
  // Build sections array based on available data
};
```

#### 3. Update Sidebar Component
```typescript
// In PageSpecificFilterSidebar.tsx
const filterSections = useMemo(() => {
  if (pageContext.type === 'near-you') {
    return generateNearYouFilterSections(listings);
  } else if (pageContext.type === 'segment') {
    return generateSegmentFilterSections(listings);
  }
  // Add other page types
  return [];
}, [listings, pageContext.type]);
```

#### 4. Create Client Wrapper
```typescript
// Similar to NearYouClientWrapper.tsx
const SegmentClientWrapper = () => {
  // Use fetchSegmentOnlyListings instead of fetchRegionOnlyListings
  // Same pattern for state management and component integration
};
```

## 🐛 Debugging Guide

### Common Issues & Solutions

#### 1. **Filter Sections Not Appearing**
**Symptoms:** Only some filters show, others are missing
**Root Causes:**
- Database query not selecting required fields
- Transformation logic returning `null` instead of `[]` for arrays
- Prisma relation structure incorrect (using nested select for single relations)

**Debug Steps:**
1. Check browser console for transformation errors
2. Verify database query includes all required fields
3. Check extraction function returns non-empty arrays
4. Verify Prisma relations match schema structure

#### 2. **Incorrect Filter Counts**
**Symptoms:** Filter option counts don't match visible listings
**Root Causes:**
- Extraction logic counting incorrectly (especially for arrays)
- Database transformation not handling null/undefined properly

**Debug Steps:**
1. Log extraction results to verify count logic
2. Check database response structure matches expectations
3. Verify transformation handles all edge cases

#### 3. **Filters Not Applying**
**Symptoms:** Selecting filters doesn't change results
**Root Causes:**
- Filter applicator functions not handling data structure correctly
- State management issues between sidebar and wrapper

**Debug Steps:**
1. Check filter state updates in component
2. Verify applicator functions match data structure
3. Ensure parent component receives filtered results

## 🔧 Data Structure Reference

### CombinedListing Interface
```typescript
export interface CombinedListing {
  // Core fields
  public_id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string | null;
  minimum_order_value?: number | null;
  images: Array<{ s3_key: string }>;
  shipping_window?: number | null;
  listing_source: 'catalog' | 'auction';
  
  // Filter-specific fields
  listing_condition?: string | null;          // For Condition filter
  packaging?: string | null;                  // For Packaging filter
  is_private?: boolean | null;                // For Listing Format filter
  addresses?: {                               // For Location filter
    city?: string | null;
    province_code?: string | null;
    country_code?: string | null;
  } | null;
  brands?: Array<{                           // For Brand filter
    brand_name?: string | null;
  }> | null; // ⚠️ Must be [] not null in transformation
}
```

### Filter State Interface
```typescript
interface PageSpecificFilterState {
  priceRange: { min: number; max: number };
  categories: string[];
  subcategories: string[];
  listingFormats: ('catalog' | 'auction')[];
  locations?: string[];
  brands?: string[];
  conditions?: string[];
  packaging?: string[];
}
```

## 🚀 Future Enhancements

### Planned Features
1. **URL State Synchronization** - Filter state persists in URL parameters
2. **Advanced Filter Combinations** - OR logic for some filter types
3. **Filter Presets** - Save and load filter combinations
4. **Performance Optimization** - Virtualization for large datasets

### Extension Points
- Add new filter types by extending extraction and application logic
- Implement server-side filtering for performance with large datasets
- Add filter analytics and usage tracking
- Implement filter suggestions based on user behavior

---

## 📞 Support & Maintenance

For questions about this system:
1. Review this documentation first
2. Check the pattern used in Near You implementation
3. Follow the systematic debugging guide
4. Ensure all new collection pages follow the established patterns

**Last Updated:** January 2025
**Version:** 1.0.0
**Maintainer:** Commerce Central Team
