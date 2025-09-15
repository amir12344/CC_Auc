Buyer Preferences: Architecture, Correctness, and Performance Improvements

Scope

- Frontend: `src/app/buyer/account/preferences/page.tsx`, `src/features/buyer-preferences/**`
- Backend: `amplify/data/resource.ts`, `prisma/prisma/schema.prisma`

Goals

- Correct type alignment with backend enums and shapes
- De-duplicate UI logic and reduce page size
- Fix correctness issues (dispatch types, dialog close logic)
- Make large dropdowns scale (search + virtualization)
- Streamline service queries, pagination, and server access

1. Backend enum alignment and request semantics

1.1 Preferred Region enum alignment (OK)

- Current FE enum values: `NORTHEAST_US | MIDWEST_US | SOUTH_US | WEST_US` (from Prisma `geographic_preference_region_type` and FE `regions` data).
- Amplify enum in `resource.ts`: `PreferredRegion = ['WEST_US','MIDWEST_US','NORTHEAST_US','SOUTH_US']`.
- Status: Aligned. No mismatch; no action required.

  1.2 Listing type semantics

- Prisma includes `listing_type_preference = { AUCTION, CATALOG, BOTH }`.
- Amplify GraphQL expects array of `ListingTypePreference = { AUCTION, CATALOG }`.
- Keep FE as array of `'AUCTION' | 'CATALOG'`. No change required unless we want to collapse to `BOTH` server-side.

  1.3 Request type values for saving preferences

- Amplify: `BuyerPreferencesRequestType = { CREATE, ADD, DELETE }`. We currently always send `CREATE` from both popup and account page.
- Recommendation: Keep `CREATE` if server is idempotent/upsert. If not, use `CREATE` for first save and `ADD` for subsequent changes, or add an explicit `UPSERT` to backend contract later. Documented for future refinement.

2. Service/query improvements

2.1 `getBuyerPreferences` query is overbroad

- File: `src/features/buyer-preferences/services/buyerPreferenceService.ts`
- Current: `take: 10` while filtering by unique `cognito_id`.
- Change: set `take: 1` and remove unnecessary array handling in callers when possible.

  2.2 Brands fetching: pagination and search

- Current: `getAllBrands()` returns first 10 only; UI suggests infinite scroll but backend does not paginate.
- Change: extend `getAllBrands` signature: `getAllBrands({ search?: string, skip?: number, take?: number } = { take: 50 })`.

  - Prisma-style query: `orderBy: { brand_name: 'asc' }`, `where: { brand_name: { contains: search, mode: 'insensitive' } }`, `skip`, `take`.
  - Update UI to request more on scroll and while typing (debounced search).

    2.3 Response normalization

- `queryData` and Amplify queries sometimes return strings; normalize in services to always return typed JSON, and centralize JSON parsing/guards to one helper (avoid repetitive `typeof result === 'string'`).

3. Popup correctness and UX

3.1 Step props typing

- File: `BuyerPreferencePopup.tsx`
- Issue: passing `isSaving` and `error` into step components, but `StepComponentProps` doesn’t define them.
- Change: either extend `StepComponentProps` with optional `isSaving?: boolean; error?: string | null;` or stop passing them. Keep it consistent across all steps.

  3.2 Dialog close behavior

- File: `BuyerPreferencePopup.tsx`
- Issue: `onOpenChange={handleCloseAttempt}` ignores the `open` boolean; confirm dialog may trigger on open.
- Change: `onOpenChange={(open) => { if (!open) setShowExitConfirm(true); }}` and prevent default close on outside click/Esc by handling `onInteractOutside`, `onEscapeKeyDown` to show confirm instead. Close only after user confirms.

  3.3 Redux state update on save

- After successful save in popup, also dispatch Redux `setBuyerPreferences` with the normalized "get" shape so downstream gates/UX reflect immediately. Clear cached preference listings if needed.

  3.4 Request type

- Keep `requestType: 'CREATE'` for now in popup completion; revisit later if backend adds `UPSERT`.

  3.5 Save strategy (single final write)

- Do not persist on each step. Only trigger the API call on the last step via the final "Complete/Save" action. Current implementation in `BuyerPreferencePopup.handleComplete` already follows this; keep step handlers local-only.

4. Account page refactor and behavior

4.1 Break up `preferences/page.tsx` (~1.2k LOC)

- Extract reusable components to `src/features/buyer-preferences/components/shared/`:
  - `MultiSelect.tsx` (command + popover multi-select with search, optional virtualization)
  - `CascadingCategorySelector.tsx` (categories/subcategories with expansion/search)
  - `BudgetInput.tsx`
  - `ListingTypeSelector.tsx`
  - `RegionSelector.tsx` (uses centralized region data)
- Keep a thin `PreferencesClient.tsx` that composes these and orchestrates state.
- Result: page file drops to ~150–200 LOC; reuse same components inside the popup steps to eliminate duplication.

  4.2 Server access strategy (no SEO requirement)

- Introduce Next route handlers for normalized data access:
  - `app/api/buyer/preferences/route.ts`: reads current prefs (server), returns normalized `GetBuyerPreferenceApiRequest` shape.
  - `app/api/brands/route.ts`: paginated brand fetch (search, skip, take).
- Use these from both popup and account page to avoid duplicating Amplify client logic on the client and to enable caching/throttling later.

  4.3 Dispatch payload type alignment (CRITICAL)

- File: `src/app/buyer/account/preferences/page.tsx`
- Issue: currently dispatches `setBuyerPreferencesAction(apiPreferences)` where `apiPreferences` is `BuyerPreferenceApiRequest`, but reducer expects `GetBuyerPreferenceApiRequest`.
- Change: transform to the "get" shape before dispatch (same shape produced by `getBuyerPreferences`) or relax the action payload type to accept both and normalize inside reducer. Prefer the former for type safety.

5. Dropdown scalability and virtualization

5.1 Virtualized dropdown component

- Create `src/features/buyer-preferences/components/shared/VirtualizedDropdown.tsx` backed by `@tanstack/react-virtual`.
- API: `{ items: T[]; itemHeight?: number; height?: number; renderItem: (item) => ReactNode; onEndReached?: () => void; }`.
- Use it to render brand options (and any future large lists). Keep categories/regions non-virtualized (small lists) for simplicity.

  5.2 Brands Step

- Replace `DropdownMenuCheckboxItem` mapping with `VirtualizedDropdown` inside a scroll container.
- Add debounced search to `getAllBrands({ search })`. Load-more with `onEndReached` calling `getAllBrands({ skip, take })`.

  5.3 Account page MultiSelect

- Reuse the same virtualized list for brands. Ensure keyboard navigation and focus states work (aria-activedescendant + roving tab index if needed).

6. Region data centralization

- Move `REGIONS_OPTIONS` out of `RegionsStep` and into `src/features/buyer-preferences/data/regions.ts`.
- Export:
  - Display options: `{ displayName, value }[]`
  - Enum mapping helpers for FE ↔ backend (`NORTHEAST_US` ↔ `EAST_US` if we choose frontend mapping approach)
- Update imports in `preferences/page.tsx` and `RegionsStep.tsx`.

7. Minor code hygiene

- Remove `hasSelections` dead memo in `AuctionCatalogStep.tsx` or use it.
- Delete unused/empty files: `src/features/buyer-preferences/components/VirtualizedDropdown.tsx` (currently empty), `steps/OffPriceRetailStep.tsx` (superseded by consolidated platforms step).
- Standardize minimum discount to numeric optional internally and compute display label in view layer (keep current string handling temporarily; plan a small follow-up).

8. Accessibility and UX polish

- Error banners in popup: wrap in `aria-live="polite"` container for SR announcement.
- Ensure all removable chips have visible focus rings (Button variant already does this; verify across brand/category/region chips).
- Dialog close button: ensure `aria-label="Close"`.

9. Implementation checklist

- [x] Region enum alignment: Amplify and Prisma both use `NORTHEAST_US | MIDWEST_US | SOUTH_US | WEST_US`.
- [x] Services: `getBuyerPreferences` → `take: 1`; remove over-fetching.
- [x] Services: Add `getAllBrands({ search, skip, take })` with sorting and case-insensitive search.
  - Implemented with in-memory per-search cache to prevent repeated calls across step navigation.
- [x] Create route handlers: `/api/buyer/preferences` and `/api/brands` (normalize responses; server-side access to Amplify/Prisma).
- [x] Popup: fix `onOpenChange` and confirm-close flow; extend `StepComponentProps` or stop passing extra props.
  - Implemented: confirm only on true close attempts and removed extra step props.
- [x] Popup: on success, dispatch Redux with normalized "get" shape and clear preference listings cache.
  - Implemented in popup and account page.
- [x] Account page: extract shared components; convert page to thin composition wrapper.
  - [x] Shared CascadingCategorySelector in use
  - [x] Shared MultiSelectDropdown used for regions
  - [x] Shared BudgetInput and ListingTypeSelector integrated
- [x] Replace brand dropdowns with `VirtualizedDropdown` + debounced search + load-more.
  - [x] Brands popup step
  - [x] Account preferences page brand selector
- [x] Centralize `REGIONS_OPTIONS` in `data/regions.ts` and update imports.
  - Implemented: `REGIONS_OPTIONS` moved to `src/features/buyer-preferences/data/regions.ts`; imports updated in account page and Region step.
- [x] Remove dead/unused files and variables; run lints.
  - Deleted `src/features/buyer-preferences/components/steps/OffPriceRetailStep.tsx` (redundant)
- [ ] Optional: normalize discount handling to numeric optional.

10. Risk/rollout notes

- Region enum fix is the only breaking change. If choosing backend rename, coordinate an Amplify deployment window. If choosing FE mapping, changes are isolated to FE and risk is low.
- Virtualization introduces a new dependency (`@tanstack/react-virtual`). Keep it scoped to shared `VirtualizedDropdown` to minimize surface area.
- Route handlers centralize and stabilize client calls, allowing caching and observability later.

Appendix A: Minimal type transforms (dispatch safety)

- When dispatching after save, transform `BuyerPreferenceApiRequest` to `GetBuyerPreferenceApiRequest`:
  - `preferredCategories`, `preferredSubcategories`, `listingTypePreferences`, `buyerSegments`, `preferredRegions`, `preferredBrandIds` → copy as is
  - `budgetMin`, `budgetMax`, `budgetCurrency`, `minimumDiscountPercentage` → copy as is

Appendix B: Suggested file moves/additions

- New: `src/features/buyer-preferences/components/shared/VirtualizedDropdown.tsx`
- New: `src/features/buyer-preferences/components/shared/MultiSelect.tsx`
- New: `src/features/buyer-preferences/components/shared/CascadingCategorySelector.tsx`
- New: `src/features/buyer-preferences/components/shared/BudgetInput.tsx`
- New: `src/features/buyer-preferences/components/shared/ListingTypeSelector.tsx`
- New: `src/features/buyer-preferences/components/shared/RegionSelector.tsx`
- Move: `REGIONS_OPTIONS` to `src/features/buyer-preferences/data/regions.ts` (and export FE↔BE mapping helpers)
- Remove: `src/features/buyer-preferences/components/VirtualizedDropdown.tsx` (empty placeholder) once replaced by shared version
- Remove: `src/features/buyer-preferences/components/steps/OffPriceRetailStep.tsx` (redundant)

Appendix C: Virtualized dropdown behavior

- Library: `@tanstack/react-virtual`
- Container height: 280–320px; item height: 32–40px; overscan: ~8 items
- Events: `onEndReached` fires when scroll offset reaches 85–90% → request next page via `getAllBrands({ skip, take })`
- Search: debounced 250–300ms; resets pagination to page 1
