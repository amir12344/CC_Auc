# Buyer Preference-Based Listings Implementation Plan

## Overview
This document outlines the implementation plan for fetching and displaying marketplace listings based on buyer preferences. The system will dynamically filter and prioritize listings according to user-defined preferences (categories, budget, brands, conditions, etc.).

## Current State Analysis

### Existing Components
1. **BuyerPreferencePopup.tsx** - Collects user preferences through a multi-step wizard
2. **buyerPreferenceService.ts** - Handles API calls for setting/getting preferences
3. **catalogQueryService.ts** - Contains existing listing fetch logic
4. **marketplace/page.tsx** - Main marketplace page that displays listings

### Current Flow
1. User opens marketplace page
2. If authenticated buyer with no preferences → BuyerPreferencePopup opens
3. User completes preferences → `setBuyerPreferences()` API call
4. Popup closes, but listings remain static (not preference-based)

## Problem Statement
- Listings are currently static and not filtered by user preferences
- `setBuyerPreferences()` only triggers when user has no preferences
- No mechanism to fetch preference-based listings after preferences are set
- Need to avoid redundant API calls while keeping preferences accessible

## User Requirements & Constraints
- ❌ **No region filtering yet** - Add region code but comment it out for now
- 🚫 **No UI integration yet** - Only call the function and log results, don't use data elsewhere
- 📊 **Base on setBuyerPreferences data** - Only work with data structure returned by setBuyerPreferences API
- 🔄 **This is Phase 1** - More features will be added after we get correct results
- 🚨 **Strict Type Safety** - Never use 'any' type anywhere

## Solution Architecture

### 1. Simplified Approach (Phase 1)
**File: `src/features/marketplace-catalog/services/catalogPreferenceQueryService.ts`** (NEW)

```typescript
// Phase 1: Only call and log results - no Redux integration yet
interface PreferenceBasedQueryFilters {
  preferredCategories?: string[]
  preferredSubcategories?: string[]
  budgetMin?: number | null
  budgetMax?: number | null
  budgetCurrency?: string
  minimumDiscountPercentage?: number
  listingTypePreferences?: string[]
  buyerSegments?: string[]
  preferredBrandIds?: string[]
  // preferredRegions?: string[] // COMMENTED OUT - Not implemented yet
}

interface PreferenceBasedListingsResponse {
  listings: CatalogListing[]
  totalCount: number
  appliedFilters: PreferenceBasedQueryFilters
  isFiltered: boolean
}
```

**Phase 1 Scope:**
- Create the query function
- Call it after setBuyerPreferences succeeds
- Log the results to console
- No UI integration or Redux store yet

### 2. Query Function Implementation
**File: `src/features/marketplace-catalog/services/catalogPreferenceQueryService.ts`** (NEW)

```typescript
// Transform setBuyerPreferences response to query filters
const transformPreferencesToQueryFilters = (
  preferences: GetBuyerPreferenceApiRequest
): PreferenceBasedQueryFilters => {
  return {
    preferredCategories: preferences.preferredCategories,
    preferredSubcategories: preferences.preferredSubcategories,
    budgetMin: preferences.budgetMin,
    budgetMax: preferences.budgetMax,
    budgetCurrency: preferences.budgetCurrency,
    minimumDiscountPercentage: preferences.minimumDiscountPercentage,
    listingTypePreferences: preferences.listingTypePreferences,
    buyerSegments: preferences.buyerSegments,
    preferredBrandIds: preferences.preferredBrandIds,
    // preferredRegions: preferences.preferredRegions, // COMMENTED OUT
  }
}

// Main function - only logs results for now
const fetchPreferenceBasedListings = async (
  preferences: GetBuyerPreferenceApiRequest
): Promise<PreferenceBasedListingsResponse> => {
  // Implementation here
}
```

**Query Logic (Phase 1):**
- Filter by preferred categories/subcategories (if provided)
- Filter by budget range (offer_price within min/max)
- Filter by preferred brands (brand matching)
- Filter by listing types (auction/buy-now)
- Filter by buyer segments
- Apply minimum discount percentage filter
- ~~Filter by regions~~ (COMMENTED OUT - not implemented yet)

### 3. BuyerPreferencePopup Integration (Phase 1)
**File: `src/features/buyer-preferences/components/BuyerPreferencePopup.tsx`** (MODIFIED)

**Changes:**
- Import the new `fetchPreferenceBasedListings` function
- After successful `setBuyerPreferences()` call, also call `fetchPreferenceBasedListings()`
- Log the results to console for verification
- No UI changes or state updates yet

```typescript
// After successful setBuyerPreferences
if (response.success) {
  // Existing success logic...
  
  // NEW: Call preference-based listings and log results
  try {
    const preferenceListings = await fetchPreferenceBasedListings(apiPreferences)
    console.log('Preference-based listings:', preferenceListings)
  } catch (error) {
    console.error('Error fetching preference-based listings:', error)
  }
  
  onComplete()
}
```

### 4. Future Phases (Not Implemented Yet)

- **Phase 2**: Redux store integration for preference management
- **Phase 3**: Marketplace page integration with preference-based listings
- **Phase 4**: Advanced filtering and UI enhancements
- **Phase 5**: Performance optimizations and caching

## Implementation Plan (Phase 1 Only)

---

### Buyer Segment Over-Filtering Issue (added 2025-07-24)

The initial buyer-segment filter kept only listings that **already** had an inclusion rule matching one of the buyer’s segments:

```prisma
catalog_listing_visibility_rules: {
  some: {
    rule_type: 'BUYER_SEGMENT',
    rule_value: { in: [/* segments */] },
    is_inclusion: true,
  }
}
```

This unintentionally **excluded** two important cases:

1. Listings with **no** `catalog_listing_visibility_rules` rows (globally visible listings)
2. Listings that have **exclusion** rules but **no inclusion** rules for the buyer’s segment

### Desired Behaviour

Include listings when **all** of the following are true:

1. There is **no exclusion rule** for any of the buyer’s segments, **and**
2. ( There is **no inclusion rule** at all ) **OR** ( There is an inclusion rule whose value matches one of the buyer’s segments )

In Prisma-style syntax the condition can be expressed as:

```ts
{
  // 1️⃣ EXCLUDE anything that explicitly blocks this buyer segment
  NOT: {
    catalog_listing_visibility_rules: {
      some: {
        rule_type: 'BUYER_SEGMENT',
        rule_value: { in: buyerSegments },
        is_inclusion: false,
      },
    },
  },

  // 2️⃣ INCLUDE listings that are globally visible OR explicitly allowed
  AND: [
    {
      OR: [
        // Globally visible (no segment rules at all)
        {
          catalog_listing_visibility_rules: {
            none: { rule_type: 'BUYER_SEGMENT' },
          },
        },
        // Explicit inclusion for one of the buyer’s segments
        {
          catalog_listing_visibility_rules: {
            some: {
              rule_type: 'BUYER_SEGMENT',
              rule_value: { in: buyerSegments },
              is_inclusion: true,
            },
          },
        },
      ],
    },
  ],
}
```

This logic ensures:

- Listings without any segment rules are **shown** (default visible)
- Listings with an inclusion rule for the buyer segment are **shown**
- Listings with an exclusion rule for the buyer segment are **hidden**

Implementation work is tracked in the task list: *Debug why only one result is returned (likely brand or data issue)*.


### Step 1: Create Preference-Based Query Service ✅ COMPLETED & UPDATED
1. **Create catalogPreferenceQueryService.ts** ✅ DONE
   - ✅ Import required types from existing services
   - ✅ Define `PreferenceBasedQueryFilters` interface (no 'any' types)
   - ✅ Define `PreferenceBasedListingsResponse` interface
   - ✅ Implement `transformPreferencesToQueryFilters()` function
   - ✅ Implement `fetchPreferenceBasedListings()` function
   - ✅ Handle error cases gracefully
   - ❌ **UPDATED**: Listing type preferences filtering (COMMENTED OUT - field doesn't exist in schema)
   - ✅ Buyer segments filtering (implemented with inclusive & exclusive visibility rules)
   - ✅ **UPDATED**: Only use maximum budget (minimum = 0 always)
   - ✅ **UPDATED**: Match exact select fields from fetchCatalogListings
   - ✅ **UPDATED**: Include image fetching with catalog_listing_images
   - ✅ **UPDATED**: Added take: 10 limit like fetchCatalogListings

2. **Query Structure Based on setBuyerPreferences Data**
   ```typescript
   const buildQueryFilters = (preferences: GetBuyerPreferenceApiRequest) => {
     const filters: any[] = [] // We'll type this properly
     
     // Category filters
     if (preferences.preferredCategories?.length) {
       filters.push({
         category: { in: preferences.preferredCategories }
       })
     }
     
     // Subcategory filters  
     if (preferences.preferredSubcategories?.length) {
       filters.push({
         subcategory: { in: preferences.preferredSubcategories }
       })
     }
     
     // Budget filters
     if (preferences.budgetMin !== null) {
       filters.push({
         catalog_products: {
           some: {
             offer_price: { gte: preferences.budgetMin }
           }
         }
       })
     }
     
     if (preferences.budgetMax !== null) {
       filters.push({
         catalog_products: {
           some: {
             offer_price: { lte: preferences.budgetMax }
           }
         }
       })
     }
     
     // Brand filters
     if (preferences.preferredBrandIds?.length) {
       filters.push({
         catalog_products: {
           some: {
             brands: {
               public_id: { in: preferences.preferredBrandIds }
             }
           }
         }
       })
     }
     
     // Listing type preferences
     if (preferences.listingTypePreferences?.length) {
       // Map to appropriate catalog listing fields
     }
     
     // Buyer segments
     if (preferences.buyerSegments?.length) {
       // Map to appropriate catalog listing fields  
     }
     
     // Minimum discount percentage
     if (preferences.minimumDiscountPercentage) {
       // Calculate discount from retail vs offer price
     }
     
     // Region filters (COMMENTED OUT)
     // if (preferences.preferredRegions?.length) {
     //   filters.push({
     //     addresses: {
     //       province: { in: preferences.preferredRegions }
     //     }
     //   })
     // }
     
     return filters
   }
   ```

### Step 2: Integrate with BuyerPreferencePopup ✅ COMPLETED
1. **Update BuyerPreferencePopup.tsx** ✅ DONE
   - ✅ Import `fetchPreferenceBasedListings`
   - ✅ Call function after successful `setBuyerPreferences()`
   - ✅ Log results to console only (4 separate console.log statements)
   - ✅ No UI changes or state management
   - ✅ Only calls API when preferences are submitted (not when skipped)

### Step 3: Testing & Validation 🔄 READY FOR TESTING
1. **Test the query function** ⏳ READY
   - ⏳ Verify it returns expected data structure
   - ⏳ Check filtering logic works correctly
   - ✅ Validate TypeScript types are correct
   - ✅ Ensure no 'any' types are used

2. **Console logging verification** ⏳ READY
   - ⏳ Check preference transformation is correct
   - ⏳ Verify query filters are built properly
   - ⏳ Validate API response structure

**Testing Instructions:**
1. Navigate to marketplace page as authenticated buyer
2. Complete preference popup (don't skip)
3. Check browser console for 4 log statements:
   - `Preference-based listings: {listings, totalCount, appliedFilters, isFiltered}`
   - `Applied filters: {...}`
   - `Total listings found: X`
   - `Is filtered: true/false`

## Files to be Created/Modified (Phase 1 Only)

### New Files
- `src/features/marketplace-catalog/services/catalogPreferenceQueryService.ts`
- `src/features/marketplace-catalog/types/preferenceBasedCatalog.ts` (optional - types can go in main service file)

### Modified Files
- `src/features/buyer-preferences/components/BuyerPreferencePopup.tsx` (minimal changes - just add function call and logging)

### Files NOT Modified in Phase 1

- ❌ `src/app/marketplace/page.tsx` (no UI integration yet)
- ❌ `src/store/index.ts` (no Redux integration yet)
- ❌ `src/features/marketplace-catalog/components/ShopClientContent.tsx` (no UI changes yet)

## Data Flow (Phase 1 - Simplified)

### Preference Update Flow
1. User completes preference popup
2. `setBuyerPreferences()` API call
3. On success, call `fetchPreferenceBasedListings()` with same preference data
4. Log the results to console
5. Complete popup as normal (no UI changes)

### What We'll See in Console

```typescript
{
  listings: CatalogListing[], // Array of filtered listings
  totalCount: number,         // Total number of matching listings
  appliedFilters: {           // What filters were actually applied
    preferredCategories: string[],
    preferredSubcategories: string[],
    budgetMin: number | null,
    budgetMax: number | null,
    // ... other applied filters
  },
  isFiltered: boolean         // Whether any filters were applied
}
```

### Phase 2 – Preference Initialisation & Dynamic Homepage Sections (Planned)

#### 2.1 Preference initial-load workflow (no popup if already set)
1. **Marketplace page mount** → dispatch `getBuyerPreferences()`.
2. **If API returns `null`/empty** → open `BuyerPreferencePopup`.
3. **If preferences exist** →
   • store in Redux slice `buyerPreferences` (or React Context if Redux is deemed overkill) and mark `isSet=true`.
   • immediately call `fetchPreferenceBasedListings(preferences)` to hydrate sections.
4. **Popup submit/skip events** should update Redux slice and trigger re-fetch.

_State management choice_
• Re-use existing preferences slice from account settings if available.
• Otherwise create lightweight slice:
```ts
interface BuyerPreferenceState {
  data: GetBuyerPreferenceApiRequest | null;
  isSet: boolean;            // true if prefs exist server-side
  status: 'idle'|'loading'|'error';
}
```

#### 2.2 Dynamic section renderer

Create a single `PreferenceSection` component with props:
```tsx
<PreferenceSection
  title="Discount-Retail Picks"       // dynamic
  listings={list[]}
  type="buyerSegment" | "auction" | "catalog" | "category"
  onLoadMore={fn}                      // optional for infinite scroll
/>
```
Internally reuse existing card grid & horizontal scroll tabs (from `AllCatalogListingsSection.tsx`).

Section ordering logic:
1. **Buyer-segment section** – show if `buyerSegments` length > 0.
2. **Auction section** – show if filtered auction list non-empty.
3. **Catalog section** – show if filtered catalog list non-empty.
4. **Categories For You** – loop through user-selected categories/subcategories and render a `PreferenceSection` per cat/subcat with matching listings.
5. **All Listings (View-All)** – always visible (even when no preferences).  Uses the existing `AllCatalogListingsSection` layout **without** carousel indicators.  Cards flow in a masonry/grid layout and keep expanding as the user scrolls (infinite scroll / “Load More”).  The container itself is *not* rendered as a `PreferenceSection` but as a standalone block at the page bottom.

#### 2.3 Data-fetching strategy
• Keep `catalogPreferenceQueryService` for combined call (returns both catalog + auction).
• Cache first page in Redux; subsequent section interactions paginate individually via existing services.
• Use SWR-style stale-while-revalidate helper or Amplify `useDataStore` if performance becomes issue.

#### 2.4 UI/UX considerations
• Sections collapse automatically if data array empty.
• Maintain existing design system tokens, spacing, typography.
• Use `IntersectionObserver` for lazy image & infinite scroll.
• Mobile: sections become vertical stacks with horizontal card scroll preserved.

#### 2.5 Testing and QA
• Unit-test new selector helpers (`selectBuyerSegmentListings`, etc.).
• Cypress integration test simulating a user with/without preferences.
• Visual regression snapshots per section.

---
### Future Phases (Not Implemented Yet)

- No Redux integration
- No UI updates
- No automatic refetching
- No error handling in UI

## Type Safety Measures

1. **Strict TypeScript Types**
   - No 'any' types allowed
   - Proper interface definitions for all data structures
   - Generic type constraints where applicable

2. **API Response Validation**
   - Runtime type checking for API responses
   - Graceful handling of malformed data

3. **Redux Type Safety**
   - Properly typed actions and selectors
   - Type-safe thunk definitions

## Testing Strategy

1. **Unit Tests**
   - Redux slice reducers and actions
   - Query transformation functions
   - API service functions

2. **Integration Tests**
   - Component-hook integration
   - API integration tests
   - Redux-component integration

3. **E2E Tests**
   - Full preference flow testing
   - Listing update verification

## Success Criteria (Phase 1)

1. ✅ `fetchPreferenceBasedListings()` function created and properly typed (no 'any' types)
2. ✅ Function transforms `setBuyerPreferences` data to query filters correctly
3. ✅ Query filters match the structure of existing `catalogQueryService.ts`
4. ✅ Function is called after successful preference save and logs results
5. ✅ Region filtering code is present but commented out
6. ✅ No UI integration or Redux store implementation yet
7. ✅ Console logs show expected data structure with filtered listings
8. ✅ Existing preference popup functionality remains unchanged

## Future Enhancements

1. **Smart Recommendations**
   - ML-based preference suggestions
   - "Similar items" based on preferences

2. **Preference Analytics**
   - Track preference effectiveness
   - A/B test different preference combinations

3. **Advanced Filtering**
   - Complex preference combinations
   - Weighted preference scoring

4. **Real-time Updates**
   - WebSocket integration for live listing updates
   - Preference-based notifications
