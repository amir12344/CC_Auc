# Filter Sidebar Implementation Tasks

## Overview
Create a reusable filter sidebar component for all collection pages that displays unique filter values from both catalog and auction listings.

## Current Goal
✅ **COMPLETED** - All dynamic filter sidebar features successfully implemented and improved

## Final Improvements Completed (User Feedback)
- ✅ **Removed counts** from all filter option labels for cleaner UI
- ✅ **Fixed category display** - now shows on all collection pages, not just near-you
- ✅ **Modernized design** with:
  - Rounded cards with better shadows
  - Improved header with icon and description
  - Better spacing and typography
  - Cleaner collapsible sections
  - Enhanced loading and error states
- ✅ **Created SearchFilterSidebar** - New specialized component for search page with:
  - Search functionality within filter categories
  - Search-optimized UI with gradient header
  - Same data services as main FilterSidebar
  - Better mobile responsiveness
- ✅ **Replaced search page filters** - Updated src/app/search/page.tsx to use new SearchFilterSidebar

## Required Filters
- **Price**: Min/Max range from both catalog and auction listings
- **Location**: Show provinces from listing addresses
- **Category**: Regular categories (or subcategories if on category page)
- **Brand**: Brand name and ID from listings
- **Condition**: Product conditions
- **Packaging**: Packaging types
- **Listing Format**: Private Offers / Public Auctions

## Task Checklist

### Phase 1: Research & Analysis
- [x] Study amplify/data/resource.ts for data schema understanding
- [x] Study prisma/schema.prisma for database structure
- [x] Review catalogQueryService.ts for catalog query patterns
- [x] Review auctionQueryService.ts for auction query patterns
- [x] Review BrandsStep.tsx for brand fetching logic
- [x] Analyze existing FilterSidebar implementations in memories

### Database Analysis Summary:

**catalog_listings table key fields:**
- `minimum_order_value` (for price range)
- `category`, `category2`, `category3` (product categories)
- `subcategory`, `subcategory2`, `subcategory3`, `subcategory4`, `subcategory5` (subcategories)
- `listing_condition` (product condition)
- `packaging` (packaging type)
- `location_address_id` → links to `addresses` table for provinces
- Relations: `catalog_listing_images`, `catalog_products` (with brands)

**auction_listings table key fields:**
- `minimum_bid` (for price range)
- `category`, `category2`, `category3` (product categories)
- `subcategory`, `subcategory2`, `subcategory3`, `subcategory4`, `subcategory5` (subcategories)
- `lot_condition` (auction condition)
- `lot_packaging` (packaging type)
- `location_address_id` → links to `addresses` table for provinces
- Relations: `auction_listing_images`, `auction_listing_product_manifests` (with brands)

**addresses table:**
- `province` (for location filter)
- `city`, `country` (additional location info)

**brands table:**
- `brand_name`, `public_id` (brand name and ID)
- Used by both catalog products and auction manifests

**Query Patterns Identified:**
- Use `generateClient<Schema>()` for client creation
- Use `queryData` with `FindManyArgs` for database queries
- Select specific fields to optimize performance
- Process results with type safety

### Phase 2: Query Service Design
- [x] Remove count from filter sidebar
- [x] Ensure category filter is shown on all relevant pages, not just near-you
- [x] Improve overall filter sidebar design for modern look
- [x] Create a new filter sidebar component for the search page using the same services
- [x] Update FILTER_SIDEBAR_TASKS.md and plan after changes

### Phase 3: Component Development
- [x] Create reusable FilterSidebar component structure
- [x] Implement filter value display (no filtering logic yet)
- [x] Add proper TypeScript typing
- [x] Ensure unique values only (no duplicates)
- [x] Add loading and error states

### Phase 4: Integration
- [x] Integrate the sidebar into the collections pages
- [x] Ensure only unique filter values are displayed
- [x] Test the sidebar for correct data display (no filtering yet)

### Phase 5: Testing & Optimization
- [ ] Test unique value filtering
- [ ] Verify province display for locations
- [ ] Check brand name and ID display
- [ ] Performance optimization
- [ ] Code review and cleanup

## Technical Requirements
- Use Tanstack Query for data fetching
- Follow existing query service patterns
- Ensure fast, optimized queries
- TypeScript strict typing
- Reusable component design
- No duplicate filter values

## Progress Log
- [2025-01-29] Task started
- [2025-01-29] Database schema analysis completed
- [2025-01-29] Query service patterns analyzed
- [2025-01-29] Brand fetching logic understood
- [2025-01-29] Ready to implement filter options service

## Notes
- Focus on displaying filter options only (no filtering functionality yet)
- Use existing query patterns from catalog and auction services
- Combine data from both catalog_listings and auction_listings tables
- Extract provinces from addresses table/field
- Brand data should include both name and ID
