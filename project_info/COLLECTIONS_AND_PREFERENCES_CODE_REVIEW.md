## Collections & Preference-Based Listings — Code Review and Improvement Plan

This document captures a deep-dive review of the services, hooks, and collections-related components that power preference-based listings and collection pages. It explains what the code does today, highlights strengths and issues, and proposes a concrete, prioritized plan to improve modularity, correctness, performance, and developer ergonomics.

### Scope (files reviewed)

- Services
  - `src/features/marketplace-catalog/services/catalogPreferenceQueryService.ts`
  - `src/features/marketplace-catalog/services/catalogQueryService.ts`
  - `src/features/marketplace-catalog/services/preferenceSectionService.ts`
  - `src/features/marketplace-catalog/services/catalogOfferService.ts`
  - `src/features/collections/services/collectionQueryService.ts` (outline)
  - `src/features/collections/services/preferenceAwareCollectionService.ts` (outline)
- Hooks
  - `src/features/marketplace-catalog/hooks/usePreferenceSections.ts`
- Collections pages & clients
  - Auctions: `src/app/collections/auctions/page.tsx`
  - Catalog (All): `src/app/collections/catalog/*` (page, wrappers, client, loading)
  - Category (Multiple): `src/app/collections/category/multiple/*` (page, wrapper, client)
  - Private Offers: `src/app/collections/private-offers/*` (page, wrapper, client, loading)
  - Near You: `src/app/collections/near-you/*` (page, wrapper, client)
  - Shared: `src/app/collections/(layout|loading|error).tsx`, `src/features/collections/components/*`

---

## Key clarifications and constraints

Based on product requirements:

- We must continue to use `getUrl()` for image URL resolution. A CDN-only deterministic URL strategy is not an option at this time. The plan below optimizes around `getUrl()` by moving resolution server-side, caching, and deduplicating requests.
- Navigation back to the marketplace/home page must not re-fire preference queries unless user preferences have actually changed (or cache is stale). We will implement stable preference hashing + cache with freshness to gate queries.
- Sections should render smoothly without visible flicker or multi-pass layout jumps. We’ll add stable placeholder layout, batched updates, and light animations.
- Refactors must preserve current functionality and UX. We’ll ship incrementally with feature flags/guards and tests.
- “View all” pages must remain fast at scale (thousands of listings). We’ll add server-side sorting and pagination for those pages, while keeping small lists client-sortable.

---

## How it works today

### Data model and flow

- A “CombinedListing” shape is used to represent both Catalog and Auction items from different tables, surfaced in a unified list for preference-based feeds.
  - Source-specific fields are normalized (e.g., `listing_source: 'catalog' | 'auction'`).
  - Image handling fetches S3 keys, then maps to public URLs via `getUrl()`.
- Transformation utilities convert a `CombinedListing` into `CatalogListing` for UI components (e.g., `CatalogCard`).
- Query services (Amplify `generateClient`) build Prisma-like queries (`FindManyArgs` / `FindUniqueArgs`) to fetch:
  - Preference-based listings (categories, segments, regions, brand IDs, is_private, etc.)
  - Specialized subsets: Private Offers only, Segment-only, Category-only, Region-only
  - Full catalog (for filter-heavy pages), and paginated catalog
- The `usePreferenceSections` hook orchestrates the home/marketplace dynamic sections (Because you sell…, Live Auctions, Private Offers, Categories For You, Near You) by firing specific queries, then incrementally pushing sections into state while tracking loading counts.
- Collections pages (Category, Segment, Private Offers, Near You, All Catalog) follow a similar client-side pattern:
  - Fetch data (sometimes all listings, sometimes filtered) on mount in a wrapper
  - Optionally transform to `CatalogListing`
  - Provide a “PageSpecificFilterSidebar” to filter client-side
  - Render grids of `CatalogCard` with sorting controls and consistent skeleton/error states

### Strengths

- Clear separation of “what to fetch” (services) from “how to display” (components).
- Re-usable concepts:
  - `CombinedListing` abstraction
  - Transformation to `CatalogListing`
  - Specialized fetchers for sections and collection pages
- Progressive rendering: sections appear as the hook resolves different queries.
- Good use of `generateClient` `authMode` in some write-protected areas (`userPool`).
- Reasonable selection of fields in `.select` to avoid over-fetching joined data.

---

## Issues and improvement opportunities

### 1) Duplication of types and helpers (inconsistent sources of truth)

- `CombinedListing` is re-declared in multiple files (e.g., `catalogPreferenceQueryService.ts` exports it, but `preferenceSectionService.ts` declares its own). This risks drift and bugs.
- `getImageUrl` appears both in `catalogQueryService.ts` and `catalogOfferService.ts`.
- Region and Segment display/enum mappings are re-implemented in multiple places (e.g., `NearYouClientWrapper.tsx` and `usePreferenceSections.ts`).
- Sorting/skeleton/error patterns and “header + filter dropdown” UIs are repeated across many clients.

Impact: Increased maintenance cost, subtle inconsistencies, higher risk of regressions.

Suggested fix:

- Create a single `CombinedListing` type in `src/features/marketplace-catalog/types/combined-listing.ts` and import it everywhere.
- Move `getImageUrl` to a shared `src/features/marketplace-catalog/services/imageService.ts`.
- Centralize constants/mappings:
  - Segments: `src/features/buyer-preferences/data/segments.ts` (display ↔ enum)
  - Regions: `src/features/buyer-preferences/data/regions.ts` (enum ↔ keys ↔ state codes)
- Extract shared UI primitives: `ListingsPageHeader`, `ListingsGridSkeleton`, `ListingsErrorState`, and a `sortListings` utility.

### 2) High complexity in the main hook

- `usePreferenceSections.ts` has a function with complexity 64 (linter warning) and variable shadowing.
- Sequential awaits for each section prolong total load time; some logic is repeated and overly coupled.

Suggested fix:

- Split section-generation into pure helpers: `buildSegmentSection()`, `buildAuctionsSection()`, `buildPrivateOffersSection()`, `buildCategoriesSection()`, `buildNearYouSection()`.
- Run them concurrently with `Promise.allSettled` and push completed sections as they finish.
- Replace shadowed `sections` local variable; use e.g., `localSections`.
- Wrap single-line `if` statements with blocks for readability and linter compliance.
- Reduce dependency array churn by extracting stable inputs and using memoized helpers.

### 3) Client-only fetching and image URL resolution overhead

- Many pages fetch on the client with Amplify. That bundles Amplify client and increases TTI.
- Each transformed listing calls `getUrl()` per image. With N listings × M images per listing, this is an N×M extra network roundtrip pattern.

Suggested fix:

- Move initial data fetching to server components or route handlers for the initial page load:
  - Create `app/api/collections/*` route handlers that proxy Amplify queries on the server.
  - Use `fetch('/api/...', { next: { revalidate: 60 } })` for SSG/ISR caching.
- For images (keeping `getUrl()`):
  - Perform `getUrl()` on the server for each `s3_key` and return a `processed_url` in the API response.
  - Add an in-memory + persistent cache (e.g., Memory cache + KV/Redis if available) keyed by `s3_key` with a safe TTL to avoid re-resolving URLs on navigation.
  - Deduplicate concurrent requests for the same `s3_key` (single-flight) to prevent thundering-herd.
  - In UI grids, resolve only the primary image per listing; resolve secondary images on detail views or on-demand.

### 4) Repeated sorting/UI patterns

- Sorting implementations (`price-asc`, `price-desc`, `name-asc`, `name-desc`) are re-implemented.
- Skeletons and error states are copy/pasted across clients.

Suggested fix:

- Extract utilities:
  - `src/features/collections/utils/sort.ts` → `sortCatalogListings(listings, sortBy)`.
  - `src/features/collections/components/common/ListingsPageHeader.tsx` (title, count, filter dropdown)
  - `src/features/collections/components/common/ListingsGridSkeleton.tsx`
  - `src/features/collections/components/common/ErrorState.tsx`

### 5) Type safety gaps and “any” usage

- `fetchAllCatalogListingsForFiltering()` returns `{ listings: any[] }` then manually shapes to CombinedListing-like structures.

Suggested fix:

- Use the shared `CombinedListing` type there and return `CombinedListing[]` strictly.
- Remove `as any` where possible with precise generics.

### 6) Error handling inconsistency

- Some services return `{ success: false, error: string }`; others return `{ data, errors }`; some just return empty arrays on catch.

Suggested fix:

- Centralize a `Result<T>` pattern:
  - `type Result<T> = { ok: true; data: T } | { ok: false; error: string }`.
  - Wrap all service calls with uniform error formatting via `formatBackendError`.
  - Bubble descriptive errors to the client; render a single reusable error UI.

### 7) Over-fetching and sorting order clarity

- Some lists are sorted post-fetch in JS. Some queries have `orderBy`, others don’t. Private vs public sorting differs across modules.

Suggested fix:

- Apply primary sort in the DB query where feasible and consistent (e.g., `orderBy: [{ is_private: 'desc' }, { title: 'asc' }]`).
- Keep UI-level sorting for end-user adjustments only.

### 8) Testability and maintainability

- Complex hook logic and transformation helpers lack unit tests.

Suggested fix:

- Add tests around:
  - Section generation (with/without preferences)
  - Combined → CatalogListing transformation (images present/absent cases)
  - Region and segment mappings

---

## Performance opportunities

1. Parallelize section fetches in `usePreferenceSections` using `Promise.allSettled` and independent helper functions.
2. Server-render initial data (SSR/SSG) and cache via `next` revalidation; hydrate client with initial state.
3. Reduce image URL lookups (while keeping `getUrl()`):
   - Do `getUrl()` server-side, cache by `s3_key` with TTL, and deduplicate concurrent resolutions.
   - On grids, resolve only the first image; lazy-load the rest on detail.
4. Leverage React Query for collection pages consistently (already used in `AllCatalogClientWrapper`), enabling caching across navigations and refetch control.
5. Ensure all queries select only the fields needed for the specific page. Avoid fetching unused relations.

---

## Quick wins (low risk, high value)

- Types & helpers
  - Introduce `types/combined-listing.ts` and adopt everywhere.
  - Extract `getImageUrl` into a shared `imageService` and dedupe.
  - Extract region/segment mappings into shared constants.
- `usePreferenceSections` cleanliness
  - Rename shadowed `sections` variable.
  - Add blocks `{}` for all `if` statements flagged by linter.
  - Split the large function into small helpers; call in parallel.
- UI consistency
  - Create `ListingsPageHeader`, `ListingsGridSkeleton`, and `ListingsErrorState` shared components. Replace copies.
- Service return shape
  - Standardize on `Result<T>` and apply `formatBackendError` uniformly.
- Remove `any`
  - Make `fetchAllCatalogListingsForFiltering()` strictly return `CombinedListing[]`.

---

## Proposed refactor (structured plan)

### Phase 1 — Consolidate types, utilities, and UI primitives

- [x] Create `src/features/marketplace-catalog/types/combined-listing.ts` and migrate all imports.
- [x] Create `src/features/marketplace-catalog/services/imageService.ts` with `getImageUrl()` (and optionally a `getPrimaryImageUrl()` helper).
- [x] Create `src/features/buyer-preferences/data/segments.ts` and `regions.ts` for shared mappings/utilities.
- [ ] Create UI primitives in `src/features/collections/components/common/`:
  - [x] `ListingsPageHeader.tsx`
  - [x] `ListingsGridSkeleton.tsx`
  - [x] `ListingsErrorState.tsx`
- [x] Create `src/features/collections/utils/sort.ts` with `sortCatalogListings(listings, sortBy)`.

Outcome: Removes duplication; improves readability immediately.

### Phase 2 — Service layering and consistency

- [ ] Standardize service return types with `Result<T>` and central error formatting.
- [x] Unify transformation logic for CatalogListing (shared `mapApiToCatalogListing` used by search and mega menu).
- [x] Unify AuctionListing transform (shared `mapApiToAuctionListing` used by search and mega menu).
- [x] Update `fetchAllCatalogListingsForFiltering()` to return `CombinedListing[]` without `any`.
- [x] Apply consistent `orderBy` defaults where needed (catalog pagination; segment/category queries covered where applicable).

Completed in this phase:

- [x] Introduced `src/shared/types/result.ts` and added non-breaking `Result<T>` wrappers for:
  - `catalogQueryService`: `fetchAllCatalogListingsForFilteringResult`, `fetchCatalogListingsPaginatedResult`, `fetchCatalogListingByIdResult`
  - `catalogPreferenceQueryService`: `fetchPrivateOffersListingsResult`, `fetchSegmentOnlyListingsResult`, `fetchCategoryOnlyListingsResult`, `fetchRegionOnlyListingsResult`, `fetchPreferenceBasedListingsResult`
- [x] Strengthened typing for `fetchAllCatalogListingsForFiltering` mapping (removed `any`).
- [x] Added default DB sorting for catalog pagination (`created_at: desc`).

Outcome: Predictable service APIs and fewer defensive casts in UI.

### Phase 2b — Navigation cache & query gating (prevent refetch on home navigation)

- [x] Introduce a stable preferences hash utility: `createPreferencesCacheKey(preferences)` that:
  - [x] Deep-sorts keys and arrays before `JSON.stringify` to produce a canonical string
  - [ ] Optionally hashes to a short key (e.g., SHA-1) for use in caches and query keys
- [x] Add a lightweight in-hook cache entry `preferenceSectionsCache[ userId + prefsKey ]` containing:
  - [x] Sections data
  - [x] Timestamp (`lastFetchedAt`)
  - [x] TTL 10 minutes
- [x] In `usePreferenceSections`, compute `prefsKey` and:
  - [x] If cache hit and fresh → reuse sections, skip fetch completely
  - [x] If cache hit but stale → show cached sections immediately and revalidate in background (update only when new data differs)
  - [x] If no cache → fetch and populate cache
- [ ] Ensure React Query instances for “view all” and other pages have `staleTime` tuned (e.g., 5–10 minutes) and `enabled: false` when `prefsKey` unchanged. (optional)

Completed in this phase (initial in-hook cache):

- [x] Added stable preferences cache key and in-memory TTL cache (10 min) inside `usePreferenceSections` to skip redundant fetches and reuse sections.
- [ ] Move cache to Redux/React Query for persistence across navigations/reloads.

Outcome: No re-firing queries on navigation unless preferences changed or cache expired; instant return to home with previously rendered sections.

### Phase 3 — Hook simplification and concurrency

- [ ] Refactor `usePreferenceSections`:
  - [x] Extract per-section builders (pure functions) returning `Promise<Section | null>`.
  - [x] Fetch sections concurrently via `Promise.allSettled`.
  - [x] Maintain progressive UI updates while reducing complexity.
  - [x] Fix linter complaints (shadowing, missing blocks, effect dependencies).

Additionally for smoothness:

- [x] Render a stable section shell layout (reserved height) to avoid layout shifts.
- [x] Batch section additions (accumulate in local array and update state progressively).
- [ ] Add subtle fade-in/scale animation (skipped per request).
- [x] Use stable keys and avoid re-mounting containers when new sections arrive.

Outcome: Lower complexity, better performance, easier to maintain.

### Phase 4 — Server-first data and image URL strategy

- [x] Introduce `app/api/collections/*` route handlers that run Amplify queries server-side.
- [x] Pages fetch via `fetch('/api/...', { next: { revalidate: 60 } })` for SSG/ISR (sections + view-all pages wired).
- [x] Replace client-side `getUrl()` with server-side URL resolution and caching (still using Amplify `getUrl()` under the hood) for primary images.

Outcome: Smaller client bundles, better TTFB, fewer client roundtrips.

### Phase 5 — Tests and monitoring

- [ ] Add unit tests for transformation functions, mappings, and section builders.
- [ ] Add logging hooks or feature flags for debugging data gaps without leaking sensitive info.

Outcome: Confidence to evolve functionality quickly.

---

## Notes on specific files

### `usePreferenceSections.ts`

- Positives:
  - Good progressive section loading and concurrency guard with `generationRef`.
  - Defensive clearing of sections on user change/auth.
- Issues:
  - Complexity 64; sequential awaits; shadowed `sections` variable; single-line `if` blocks.
  - Repeated region mappings; repeated code to construct view-all context.
- Actions:
  - Factor per-section builders and parallelize; centralize mappings; reuse a creator for view-all context.

### `catalogPreferenceQueryService.ts`

- Positives:
  - Clean separation of specialized queries (private offers, segment-only, category-only, region-only).
  - Clear field selection and mapping to `CombinedListing`.
- Issues:
  - Image URL lookups are done later and repeatedly.
  - Some `as any` casts and repeated field mapping boilerplate.
- Actions:
  - Return `processed_url` server-side or via shared image helper; centralize transformation; remove casts by leveraging shared `CombinedListing` types and typed mapping helpers.

### `catalogQueryService.ts`

- Positives:
  - Good use of transforms to `CatalogListing` / `DetailedCatalogListing`.
  - Paginated fetch for “All Catalog” page.
- Issues:
  - Duplicated `getImageUrl` exists here and in `catalogOfferService.ts`.
  - `fetchAllCatalogListingsForFiltering()` returns `any[]` and then reshapes.
- Actions:
  - Extract `getImageUrl`; make `fetchAllCatalogListingsForFiltering()` return `CombinedListing[]` strictly; standardize error shape.

### Collections clients (Category/Near You/Private Offers/All Catalog)

- Positives:
  - Consistent grid UX, sorting options, skeletons, and breadcrumb patterns.
- Issues:
  - Lots of repeated UI and sorting logic; inconsistent use of React Query (used in All Catalog, not elsewhere).
- Actions:
  - Extract shared UI; add React Query for consistent caching where appropriate; move initial fetch to server handlers.
  - For “view all” pages, add server-backed sorting and pagination to avoid downloading/sorting thousands of items on the client.

---

## Example refactors (illustrative)

These are indicative examples to show the direction; exact implementation details can vary.

### Shared type and sort utility

```ts
// src/features/marketplace-catalog/types/combined-listing.ts
export interface CombinedListing {
  public_id: string
  title: string
  description: string
  category: string
  subcategory?: string | null
  minimum_order_value?: number | null
  images: Array<{ s3_key: string }>
  shipping_window?: number | null
  listing_source: 'catalog' | 'auction'
  // Optional filter fields
  listing_condition?: string | null
  packaging?: string | null
  is_private?: boolean | null
  addresses?: {
    city?: string | null
    province_code?: string | null
    country_code?: string | null
  } | null
  brands?: Array<{ brand_name?: string | null }> | null
}
```

```ts
// src/features/collections/utils/sort.ts
import type { CatalogListing } from '@/src/features/marketplace-catalog/types/catalog'

export function sortCatalogListings(listings: CatalogListing[], sortBy: string): CatalogListing[] {
  const items = [...listings]
  switch (sortBy) {
    case 'price-asc':
      return items.sort((a, b) => (a.minimum_order_value || 0) - (b.minimum_order_value || 0))
    case 'price-desc':
      return items.sort((a, b) => (b.minimum_order_value || 0) - (a.minimum_order_value || 0))
    case 'name-asc':
      return items.sort((a, b) => a.title.localeCompare(b.title))
    case 'name-desc':
      return items.sort((a, b) => b.title.localeCompare(a.title))
    default:
      return items
  }
}
```

### Parallel section fetching sketch

```ts
// In a refactored usePreferenceSections
const builders = [
  buildSegmentSection(preferences),
  buildAuctionsSection(),
  buildPrivateOffersSection(),
  buildCategoriesSection(preferences),
  buildNearYouSection(preferences),
]

const results = await Promise.allSettled(builders)
for (const r of results) {
  if (r.status === 'fulfilled' && r.value) appendSection(r.value)
}
```

---

## Expected outcomes

- Less duplication → faster feature changes, fewer bugs.
- Lower client bundle cost and fewer network calls → faster loads.
- Cleaner hook logic with parallelization → quicker initial rendering of sections.
- Stronger type safety → fewer runtime surprises.
- Consistent error handling → predictable UX.

---

## Final recommendations summary

- Centralize types, image helpers, and region/segment mappings.
- Standardize service return shapes and remove `any`.
- Refactor `usePreferenceSections` to small helpers + parallel fetch.
- Extract shared UI and sorting utilities; remove copy-paste.
- Move initial data and image URL resolution to server where possible; cache with ISR.
- Add unit tests around transformations and section builders.

---

## Deep dive: Addressing the five product questions

1. Image URL strategy with `getUrl()`

- Keep `getUrl()` as the source of truth, but run it server-side in route handlers or server components.
- Cache by `s3_key` with TTL; dedupe concurrent resolutions; return `processed_url` to clients.
- In grid UIs, resolve only the primary image; defer secondary images.

2. Prevent refetch on home navigation unless preferences changed

- Compute a stable `prefsKey` and cache home sections by `userId + prefsKey` with a TTL.
- On mount, if cache is fresh, render cached sections and skip network.
- Optionally revalidate in the background (SWR) without replacing UI unless data differ.

3. Smooth section appearance (no flicker)

- Maintain a persistent shell for each potential section with reserved space.
- Batch section updates (one `setSections` per render frame) and use `startTransition`.
- Add light fade-in transitions; ensure stable React keys; avoid re-mounting section containers.

4. Non-breaking refactor guarantee

- Incremental phases with feature flags (e.g., `USE_SERVER_IMAGE_URLS`, `USE_SECTIONS_CACHE`).
- Keep function signatures and types stable; provide adapters where needed.
- Add tests for transformations, section builders, and cache gating.
- Rollout per page (behind flag) and validate before switching defaults.

5. “View all” scalability and responsiveness

- For large result sets, move sorting and pagination to the server (route handlers calling Amplify/Prisma with `orderBy`, `take`, `skip`).
- Use React Query infinite queries across all “view all” pages (already used in All Catalog) with a unified query service.
- For small lists, keep client sorting; for big lists, request sorted pages from the server.
- Add a lightweight `count` query to decide quickly whether to switch to server paging.

With these changes, we’ll improve modularity, enforce good practices, and meaningfully reduce time-to-content while retaining the current UX and feature set.
