### Goal

Show "{total units} units • {percent}% off MSRP" on every `CatalogCard`, replacing the current minimum order value line. Use the exact formulas already used on the catalog detail page. Do not create new services or query functions; only extend existing queries that feed marketplace, segments, collections, search, and mega menu pages.

### What will change

- Add optional fields to `CatalogListing` and `CombinedListing`:
  - `total_units?: number`
  - `msrp_discount_percent?: number`
- Update existing queries to select minimal variant fields needed to compute metrics:
  - `catalog_product_variants.select = { available_quantity, retail_price, offer_price }`
- Reuse the detail-page formulas to compute metrics in existing transform layers:
  - Sum of `available_quantity` for total units.
  - Percent off MSRP = `(sum(retail*qty) - sum(offer*qty)) / sum(retail*qty) * 100`.
- Update `CatalogCard` UI to display "{units} units • {percent}% off MSRP" and remove the minimum order row. Show graceful placeholders when metrics are missing.

### Updated query functions (no new services)

- `catalogQueryService.fetchCatalogListingsPaginated`
- `collections/collectionQueryService.fetchCatalogListingsWithFilters`
- `search/searchQueryService.searchCatalogListings`
- `search/megaMenuQueryService.fetchListings` (catalog branch)
- Preference-based listings in `catalogPreferenceQueryService`:
  - `fetchCatalogListings`
  - `fetchPrivateOffersListings`
  - `fetchCategoryOnlyListings`
  - `fetchRegionOnlyListings`
  - `fetchSegmentOnlyListings` (both targeted and public queries)

### Transform updates

- `transformApiResponseToCatalogListing` (in `catalogQueryService.ts`): compute and attach metrics when variant data is present.
- `mapApiToCatalogListing` (in `utils/transforms.ts`): compute and attach metrics when variant data is present (used by mega menu).
- `transformCombinedListingToCatalogListing` (in `catalogPreferenceQueryService.ts`): pass through precomputed metrics from `CombinedListing` to `CatalogListing`.

### UI update

- `CatalogCard.tsx`:
  - Replace minimum order row with a metrics row: "{units} units • {percent}% off MSRP".
  - Keep subcategory line intact.
  - Fallback to "— units • —% off MSRP" if metrics are not available.

### Non-goals

- No new services or independent metric-fetch hooks.
- No changes to detail page logic beyond reusing its formulas.

### Notes

- All new fields are optional to avoid breaking existing components.
- Queries keep payloads minimal by selecting only the 3 required variant fields.
