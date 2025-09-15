# Catalog and Private Offers Refactoring Plan

## Overview
Currently, the `/collections/catalog` route incorrectly displays only private offers (listings with `isPrivate: true`). This plan outlines the steps to:
1. Rename the current catalog page to private offers
2. Create a new catalog page that displays all catalog listings
3. Add a "View All" button to redirect from the homepage section to the new catalog page

## Current Structure Analysis

### Current Files:
- `src/app/collections/catalog/page.tsx` - Currently loads private offers (incorrect)
- `src/features/collections/components/PrivateOffersClient.tsx` - Fetches private offers using `fetchPrivateOffersListings`
- `src/features/marketplace-catalog/components/sections/AllCatalogListingsInfiniteSection.tsx` - Already displays all catalog listings on homepage

### Available API Functions:
- `fetchPrivateOffersListings()` - Fetches only private offers (isPrivate: true)
- `fetchCatalogListingsPaginated()` - Fetches ALL catalog listings (what we need for new catalog page)

## Step-by-Step Implementation Plan

### Phase 1: Create Private Offers Page

#### 1.1 Create Private Offers Directory Structure
```
src/app/collections/private-offers/
├── page.tsx (moved from catalog/page.tsx)
└── loading.tsx (optional)
```

#### 1.2 Move and Update Files
- **Move**: `src/app/collections/catalog/page.tsx` → `src/app/collections/private-offers/page.tsx`
- **Update imports**: Change any references to reflect new location
- **Update metadata**: Change page title from "Catalog" to "Private Offers"

#### 1.3 Rename Client Component (Optional but Recommended)
- **Rename**: `PrivateOffersClient.tsx` → `PrivateOffersClientWrapper.tsx` (for consistency)
- **Update imports**: Update the import in the new private-offers page

### Phase 2: Create New All Catalog Listings Page

#### 2.1 Create New Catalog Page Structure
```
src/app/collections/catalog/
├── page.tsx (new - displays ALL catalog listings)
└── loading.tsx (optional)
```

#### 2.2 Create All Catalog Client Wrapper
**File**: `src/features/collections/components/AllCatalogClientWrapper.tsx`

**Purpose**: This will be very similar to `AllCatalogListingsInfiniteSection` but designed for a full-page experience with enhanced filtering and pagination.

**Key Features**:
- Use `fetchCatalogListingsPaginated()` (same as AllCatalogListingsInfiniteSection)
- Implement infinite scroll pagination
- Include comprehensive filter functionality (reuse existing filter components)
- Transform data to `CatalogListing[]` format
- Full-page layout with sidebar filters

**Structure**:
```typescript
// Similar to AllCatalogListingsInfiniteSection and PrivateOffersClient but:
// 1. Uses fetchCatalogListingsPaginated() (same API as homepage section)
// 2. No isPrivate filtering (shows ALL catalog listings)
// 3. Supports pagination with infinite scroll
// 4. Includes all filter types (location, price, category, etc.)
// 5. Full-page layout instead of homepage section layout
```

#### 2.3 Create New Catalog Page
**File**: `src/app/collections/catalog/page.tsx`

**Features**:
- Import and use `AllCatalogClientWrapper`
- Set appropriate metadata (title: "All Catalog Listings")
- Include filter sidebar
- Implement responsive layout

### Phase 3: Add "View All" Button to Homepage Section

#### 3.1 Update AllCatalogListingsInfiniteSection
**File**: `src/features/marketplace-catalog/components/sections/AllCatalogListingsInfiniteSection.tsx`

**Purpose**: The `AllCatalogListingsInfiniteSection` currently displays all catalog listings on the homepage. We need to add a "View All" button that redirects users to `/collections/catalog` where they can see the same listings in a dedicated full-page view with enhanced filtering capabilities.

**Changes**:
- Add a "View All" button at the bottom of the section
- Use `next/link` to navigate to `/collections/catalog`
- Style consistently with existing UI patterns
- Make button optional via props (in case it's used elsewhere)

**Implementation**:
```typescript
// Add prop to control button visibility
interface Props {
  showViewAllButton?: boolean
  viewAllHref?: string
}

// Add button component at the end of listings
{showViewAllButton && (
  <Link href={viewAllHref || '/collections/catalog'}>
    <Button variant="outline" className="w-full mt-4">
      View All Catalog Listings
    </Button>
  </Link>
)}
```

#### 3.2 Update ShopClientContent
**File**: `src/features/marketplace-catalog/components/ShopClientContent.tsx`

**Changes**:
- Pass `showViewAllButton={true}` to `AllCatalogListingsInfiniteSection`
- Ensure proper spacing and layout

### Phase 4: Update Navigation and Routing

#### 4.1 Check Navigation Links
- Search for any hardcoded links to `/collections/catalog`
- Update navigation menus if they exist
- Ensure breadcrumbs are correct

#### 4.2 Update SEO and Metadata
- Private offers page: Update title, description, keywords
- New catalog page: Set appropriate SEO metadata

### Phase 5: Filter Implementation

#### 5.1 Reuse Existing Filter Components
- `PageSpecificFilterSidebar` - Already implemented
- `filterExtractors.ts` - Extract filter options from listings
- `filterApplicators.ts` - Apply filters to listings (recently fixed)

#### 5.2 Filter Integration for New Catalog Page
- Use same filter logic as private offers page
- Ensure all filter types work (location, price, category, brand, condition)
- Test filter counts and application

## File Changes Summary

### Files to Move:
- `src/app/collections/catalog/page.tsx` → `src/app/collections/private-offers/page.tsx`

### Files to Create:
- `src/app/collections/catalog/page.tsx` (new)
- `src/features/collections/components/AllCatalogClientWrapper.tsx`
- `src/app/collections/private-offers/loading.tsx` (optional)
- `src/app/collections/catalog/loading.tsx` (optional)

### Files to Modify:
- `src/features/marketplace-catalog/components/sections/AllCatalogListingsInfiniteSection.tsx`
- `src/features/marketplace-catalog/components/ShopClientContent.tsx`
- `src/features/collections/components/PrivateOffersClient.tsx` (rename to PrivateOffersClientWrapper.tsx)

## Testing Checklist

### Functionality Tests:
- [ ] `/collections/private-offers` displays only private offers
- [ ] `/collections/catalog` displays all catalog listings
- [ ] "View All" button navigates correctly
- [ ] Infinite scroll works on both pages
- [ ] Filters work correctly on both pages
- [ ] Filter counts are accurate
- [ ] Loading states work properly

### UI/UX Tests:
- [ ] Responsive design on mobile/tablet/desktop
- [ ] Consistent styling with existing pages
- [ ] Proper spacing and layout
- [ ] Accessibility compliance

### Performance Tests:
- [ ] Page load times are acceptable
- [ ] Infinite scroll performance
- [ ] Filter application speed
- [ ] Image loading optimization

## Implementation Order

1. **Start with Phase 1**: Move private offers to correct location
2. **Then Phase 2**: Create new catalog page with all listings
3. **Then Phase 3**: Add view all button
4. **Finally Phase 4-5**: Polish navigation and filters

This approach ensures we don't break existing functionality while building the new features.

## Implementation Status

**Status**: ✅ COMPLETED

**Completed Tasks**:
1. ✅ Moved current catalog files to private-offers directory
   - Created `/collections/private-offers/page.tsx`
   - Created `/collections/private-offers/PrivateOffersClient.tsx`
   - Created `/collections/private-offers/loading.tsx`
2. ✅ Created new catalog page for all listings
   - Created `/collections/catalog/page.tsx`
   - Created `/collections/catalog/AllCatalogClientWrapper.tsx`
   - Created `/collections/catalog/loading.tsx`
3. ✅ Added "View All" button to homepage section
   - Updated `AllCatalogListingsInfiniteSection.tsx` with link to `/collections/catalog`
4. ✅ Updated navigation links
   - Fixed private offers links in `usePreferenceSections.ts`
   - Fixed private offers links in `preferenceSectionService.ts`
5. ✅ Cleaned up old files
   - Removed original catalog files from `/collections/catalog/`

## Notes

- The `fetchCatalogListingsPaginated()` function already exists and fetches ALL catalog listings
- The `fetchPrivateOffersListings()` function correctly filters for private offers only
- Existing filter logic can be reused for both pages
- The `AllCatalogListingsInfiniteSection` component already demonstrates the pattern we need
- Consider adding loading skeletons for better UX
- Ensure proper error handling for both pages