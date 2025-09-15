# Near You Section Implementation Plan

## Overview
Add a "Near You" section to the marketplace page that displays listings based on the user's preferred regions. This section will show listings from all states associated with the user's selected regions using existing infrastructure.

## Current State Analysis

### Existing Infrastructure We Can Leverage
1. **Region-to-State Mapping**: `getStateCodesForRegions()` function in `preferenceOptions.ts`
2. **Preference Management**: Redux slice for buyer preferences already handles `preferredRegions`
3. **Section Generation**: `generatePreferenceSections()` in `preferenceSectionService.ts`
4. **Listing Queries**: `catalogPreferenceQueryService.ts` with filtering infrastructure
5. **UI Components**: Marketplace sections rendering in `usePreferenceSections.ts`

### Data Structure Available
- `REGION_OPTIONS`: Maps region names to state objects with `name` and `code`
- `getStateCodesForRegions()`: Converts region names to state codes array
- User preferences contain `preferredRegions: string[]`

## Implementation Plan

### Phase 1: Extend Query Service (DRY Approach)
**File**: `catalogPreferenceQueryService.ts`

1. **Add State/Region Filtering Support**
   - Extend `PreferenceBasedQueryFilters` interface to include `stateCodes?: string[]`
   - Add state filtering logic to `buildCatalogQueryFilters()` function
   - Use existing OR condition pattern for state filtering in catalog_listings table
   - Determine correct field name for state in catalog_listings (likely `state` or `shipping_state`)

2. **Update Main Query Function**
   - Modify `fetchPreferenceBasedListings()` to handle state codes
   - Use existing `getStateCodesForRegions()` to convert regions to state codes
   - Apply state filtering alongside existing category/brand/budget filters

### Phase 2: Extend Service Layer (Reuse Pattern)
**File**: `preferenceSectionService.ts`

1. **Add Near You Section Generation**
   - Add new section type `'nearYou'` to `PreferenceSectionData` interface
   - Extend `generatePreferenceSections()` function with region-based section
   - Use existing pattern: check if `preferences.preferredRegions` exists and has values
   - Generate section title: "Near You" (static, simple)
   - Set `viewAllLink` to `/collections/near-you` (following existing URL pattern)

2. **Section Logic**
   - Filter listings by state codes derived from user's preferred regions
   - Use existing listing filtering pattern from other sections
   - Only show catalog listings (not auction) for consistency with other location-based sections

### Phase 3: Hook Integration (Minimal Changes)
**File**: `usePreferenceSections.ts`

1. **ViewAll Context Support**
   - Add `'nearYou'` to the ViewAllContextCreator type union
   - Extend existing createViewAllContext call pattern for the new section
   - Pass region data to Redux for ViewAll page continuity

2. **No Major Changes Needed**
   - Existing hook will automatically pick up new section from service
   - State management and loading patterns remain unchanged

### Phase 4: ViewAll Page (Reuse Existing)
**File**: Create `/collections/near-you/page.tsx`

1. **Follow Existing Pattern**
   - Copy structure from `/collections/category/multiple/page.tsx`
   - Use existing `CollectionListingsGrid` component
   - Set page title to "Near You"
   - Use existing breadcrumb pattern

2. **URL Structure**
   - Simple route: `/collections/near-you`
   - No query parameters needed (use Redux context for filtering)
   - Follow existing collection page patterns

## Technical Implementation Details

### Query Integration
```typescript
// Add to PreferenceBasedQueryFilters interface
interface PreferenceBasedQueryFilters {
  // ... existing fields
  stateCodes?: string[]
}

// Add to buildCatalogQueryFilters function
if (filters.stateCodes?.length) {
  whereConditions.push({
    state: { in: filters.stateCodes } // or shipping_state depending on schema
  })
}
```

### Section Generation
```typescript
// Add to generatePreferenceSections function
if (preferences.preferredRegions && preferences.preferredRegions.length > 0) {
  const stateCodes = getStateCodesForRegions(preferences.preferredRegions)
  
  sections.push({
    title: 'Near You',
    listings: listings.filter(l => 
      l.listing_source === 'catalog' && 
      stateCodes.includes(l.state) // or l.shipping_state
    ),
    type: 'nearYou',
    viewAllLink: '/collections/near-you'
  })
}
```

## Benefits of This Approach

### DRY Compliance ✅
- Reuses existing query infrastructure
- Leverages existing section generation patterns
- Uses existing ViewAll page architecture
- Utilizes existing Redux state management

### Minimal Code Changes ✅
- No new major services or components
- Extension of existing functionality only
- Follows established patterns throughout

### Maintainability ✅
- Consistent with existing codebase structure
- Uses established data flow patterns
- Easy to debug using existing patterns

## Files to Modify (Minimal Set)

1. **catalogPreferenceQueryService.ts** - Add state filtering support
2. **preferenceSectionService.ts** - Add Near You section generation
3. **usePreferenceSections.ts** - Add ViewAll context type (1 line change)
4. **Create: /collections/near-you/page.tsx** - New ViewAll page

## Next Steps

1. Determine correct state field name in catalog_listings table
2. Test state filtering query logic
3. Verify region-to-state mapping accuracy
4. Implement in order: Query → Service → Hook → ViewAll page
5. Test integration with existing preference flow

## Risks & Considerations

- **Database Field**: Need to confirm state field name in catalog_listings
- **Performance**: State filtering might need indexing depending on data volume
- **Region Coverage**: Ensure all regions have proper state mappings
- **UI Consistency**: Maintain same styling and behavior as other sections
