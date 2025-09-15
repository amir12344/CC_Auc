# Mega Menu Functionality Implementation Plan

## Overview

This plan outlines the steps to make the mega menu functional by integrating dynamic data fetching based on user selections. We'll draw inspiration from the search functionality in `searchQueryService.ts`, ensuring DRY principles are followed. All mappings will use enums from `ListingTypeConverter.ts` without hardcoding values unless absolutely necessary (and only if not present in the converter).

## Step 1: Analyze Mega Menu Data

- Review the `megaMenuData.ts` file (located at `e:\boilerplate\boilerCode\src\components\layout\MegaMenu\megaMenuData.ts`) to identify all categories, subcategories, regions, countries, conditions, and special sections (NEW, Featured, Private Offers, Live Auctions).
- Extract all possible values that will be used for querying (e.g., regions like 'North America', conditions like 'New', etc.).
- Map these values to their corresponding enums in `ListingTypeConverter.ts` (e.g., fileToDbCategoryBiMap, fileToDbSubcategoryBiMap, fileToDbConditionBiMap, etc.). If a value isn't present, note it and propose a fallback (but prioritize using the converter).

## Step 2: Design Service Layer

- Create a new service file, e.g., `megaMenuQueryService.ts` in `src/features/navigation/services/` or similar, modeled after `searchQueryService.ts`.
- To promote DRY, implement a unified query function `fetchListings(filters: Partial<FindManyArgs<'catalog_listings' | 'auction_listings'>>)` that dynamically builds the query based on passed filters (e.g., category, condition, region). This avoids multiple similar functions; complexity is manageable by centralizing logic with conditional where clauses.
- Specialized fetches:
  - For categories/subcategories, regions, conditions: Pass appropriate filters to the unified function.
  - `fetchNewListings()`: Use unified function with orderBy on creation date.
  - `fetchFeaturedListings()`: Use unified function filtering on 'featured' flag.
  - `fetchPrivateOffers(userId: string)`: First check Redux store for cached user preferences/private offers (verify if already stored in marketplace logic); if not, fetch using unified function with user-specific filters, then cache in store to avoid extra calls. like we have to do the same preferece call we do on the marketpplace page to get the listings which match the user preferences.
  - `fetchLiveAuctions()`: Use unified function filtering active auctions.
- Use Prisma/Amplify queries via `generateClient` and `queryData`, ensuring relation loads for images, etc.
- Handle both catalog and auction listings in unified results, processing images with S3 URLs.
- Ensure queries are efficient, with limits, status filters (e.g., 'ACTIVE'), and parallel fetching where possible.

## Step 3: Mapping to Enums

- For every user-clicked value (e.g., category, condition, region):
  - Look up in the appropriate BiMap from `ListingTypeConverter.ts`.
  - Example: For a condition like 'New', use `fileToDbConditionBiMap.get('New')` to get 'NEW'.
  - If not found, log a warning and use the raw value (but aim to extend the converter if needed).
- Regions/Countries: Check if they have enums; if not, treat as strings and query directly (refer to Prisma schema for fields like 'region' or 'country').

## Step 4: Integrate with Mega Menu Component

- Update the Mega Menu component to handle clicks on items.
- On click, call the appropriate service function with mapped values and redirect to the search page to display full results (instead of loading in dropdown).
- Use React hooks for state management (client-side if needed) to store fetched data briefly before redirection.
- Ensure DRY by reusing transformation functions (e.g., `transformApiResponseToCatalogListing`, `transformToAuctionListing`) from `searchQueryService.ts`.

## Step 5: Query Implementation Details

- Refer to Prisma schema (`schema.prisma`) and Amplify resources for exact fields (e.g., category, subcategory, condition in catalog_listings or auction_listings).
- Queries will use 'findMany' with where clauses:
  - AND/OR for filters (e.g., { category: mappedEnum, status: 'ACTIVE' }).
  - Include relations for images, bids, etc.
- Handle pagination/limiting (e.g., take: 10 for mega menu previews if needed, but since redirecting, full results on search page).
- Error handling: Return empty arrays on failure, similar to search service.

## Step 6: Testing and Edge Cases

- Test mappings for all mega menu items.
- Handle no results gracefully.
- Ensure responsiveness and loading states.
- Verify user-specific fetches (Private Offers) use auth context and Redux caching.

## Step 7: DRY Principles

- Reuse existing functions/utils where possible (e.g., image processing, time calculations).
- Centralize enum mappings in a utility function.
- Avoid duplicating query logic; the unified fetch function ensures this.

This plan ensures a modular, maintainable implementation. If approved, proceed to code changes.
