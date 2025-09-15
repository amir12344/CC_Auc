# Collection Page Filter Integration Analysis

## Current Architecture Understanding

### Collection Pages Structure
- **Near You**: `/collections/near-you/page.tsx` - Uses `CollectionListingsGrid` with empty filters and "catalog" scope
- **Catalog**: `/collections/catalog/page.tsx` - Uses `CollectionListingsGrid` with empty filters and "catalog" scope  
- **Category Multiple**: `/collections/category/multiple/page.tsx` - Uses actual enum values for categories filter
- **Segment Multiple**: `/collections/segment/multiple/page.tsx` - Similar pattern for segments
- **Dynamic Pages**: `/collections/[scope]/[slug]/page.tsx` - Dynamic routing for various collection types

### Current API Flow
1. **Collection Pages** → Pass filters to `CollectionListingsGrid`
2. **CollectionListingsGrid** → Calls either:
   - `fetchPreferenceAwareListings()` - When user preferences + ViewAll context available
   - `fetchBasicCollectionListings()` - Fallback for basic filtering
3. **Services** → Query backend APIs with converted enum values

### Current FilterSidebar Implementation
- Located at: `src/features/filters/components/FilterSidebar.tsx`
- Uses `useFilterOptions` hook for dynamic filter data
- Has FilterState interface with: priceRange, selectedLocations, selectedCategories, etc.
- **Issue**: Not currently integrated with collection page API calls

### Enum Conversion System
- **Source**: `amplify/functions/commons/converters/ListingTypeConverter.ts`
- **Available BiMaps**:
  - `fileToDbConditionBiMap` - Product conditions
  - `fileToDbPackagingBiMap` - Packaging types  
  - `fileToDbCategoryBiMap` - Product categories
  - `fileToDbSubcategoryBiMap` - Product subcategories
  - `fileToDbShippingBiMap` - Shipping types
  - `fileToDbLotConditionBiMap` - Lot conditions
- **Helper Functions**: `mapCategory()`, `mapSubcategory()`, `mapCondition()`

### Region Handling Pattern (from megaMenuQueryService.ts)
```typescript
if (filters.region) {
  const stateCodes = getStateCodesForRegions([filters.region])
  if (stateCodes.length > 0) {
    whereClause.addresses = {
      province_code: {
        in: stateCodes,
      },
    }
  }
}
```

## Current Filter Data Flow Problems

### Issue 1: FilterSidebar Not Connected to APIs
- FilterSidebar manages its own FilterState
- Collection pages don't receive FilterSidebar selections
- API calls don't include FilterSidebar filter data

### Issue 2: Inconsistent Filter Merging
- Some pages have pre-set filters (categories, segments)
- Need to merge FilterSidebar selections with existing page filters
- Must maintain preference-aware context when available

### Issue 3: Enum Value Conversion
- Need consistent enum conversion for all filter types
- Must use ListingTypeConverter.ts BiMaps (no hardcoding)
- Region codes need special handling like in megaMenuQueryService.ts

## Required Integration Points

### 1. Collection Page Level
- Modify each collection page to accept FilterSidebar state changes
- Convert to client components to manage filter state
- Merge FilterSidebar filters with existing page filters

### 2. CollectionListingsGrid Level  
- Update to accept additional filters from FilterSidebar
- Pass merged filters to service layer
- Handle loading states during filter changes

### 3. Service Layer Level
- Update `preferenceAwareCollectionService.ts` and `collectionQueryService.ts`
- Add enum conversion logic using ListingTypeConverter.ts
- Implement region handling for location filters

### 4. FilterSidebar Level
- Add callback props to communicate filter changes to parent
- Implement URL synchronization for bookmarkable filtered pages
- Handle enum value conversion before sending to parent

## Enum Mapping Requirements

### Categories & Subcategories
```typescript
// Use BiMaps from ListingTypeConverter.ts
const categoryEnum = fileToDbCategoryBiMap.getValue(userFriendlyCategory)
const subcategoryEnum = fileToDbSubcategoryBiMap.getValue(userFriendlySubcategory)
```

### Conditions
```typescript
// Use condition BiMap
const conditionEnum = fileToDbConditionBiMap.getValue(userFriendlyCondition)
```

### Packaging
```typescript
// Use packaging BiMap  
const packagingEnum = fileToDbPackagingBiMap.getValue(userFriendlyPackaging)
```

### Regions/Locations
```typescript
// Use pattern from megaMenuQueryService.ts
const stateCodes = getStateCodesForRegions([selectedRegion])
// Then filter by addresses.province_code
```

### Brands
```typescript
// Brands are stored as strings in database, no enum conversion needed
// Filter by: catalog_products.brands.brand_name
```

## Next Steps Plan

1. **Create Filter Conversion Utilities**
   - Build helper functions to convert FilterSidebar state to API-ready enum values
   - Handle region to state code conversion
   - Create merged filter objects

2. **Update Service Layer**
   - Modify `collectionQueryService.ts` to accept additional filter parameters
   - Add proper enum conversion and where clause building
   - Ensure backward compatibility with existing functionality

3. **Update CollectionListingsGrid**
   - Accept FilterSidebar state as props
   - Merge with existing filters before API calls
   - Handle re-fetching when filters change

4. **Update Collection Pages** 
   - Convert to client components
   - Manage FilterSidebar state
   - Pass filter state to CollectionListingsGrid

5. **Update FilterSidebar**
   - Add callback props for filter change communication
   - Implement URL parameter synchronization
   - Handle loading states during API calls

This analysis provides the foundation for implementing proper filter integration across all collection pages.
