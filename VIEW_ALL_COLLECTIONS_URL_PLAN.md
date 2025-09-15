# View-All Link & Collections URL Strategy

_Last updated: 24-Jul-2025_

## 1. Goals
1. Generate **correct “View all” links** for every dynamic Product Section.
2. Support a flexible **Collections** page that can be filtered via query-string parameters and keeps the browser URL in sync with UI interactions.
3. Preserve (and later revive) the generic `/collections` gallery page that shows **all** available collections cards.

## 2. URL Conventions
| Scenario | Example URL | Notes |
|----------|-------------|-------|
| Section link (category) | `/collections/category/appliances` | Clean, SEO-friendly path. |
| Section link (buyer segment) | `/collections/segment/amazon-walmart-refurbisher` | Value is slugified. |
| Section link (auctions) | `/collections/auctions` | No additional slug. |
| Dynamic filtering inside a collections page | `/collections?categories=Appliances&segments=AMAZON_WALMART,REFURBISHER` | Uses query params when the user adds more filters. |
| Additional run-time filter (condition = NEW) | `/collections?categories=Appliances&segments=AMAZON_WALMART,REFURBISHER&conditions=NEW` | URL updates via router.replace with `shallow=true`. |

**Key points**
- **Section links** stay pretty because each section represents _one_ logical filter value.
- Once inside the page, further filters use query-string params to avoid path explosion.
- Array-like params are comma-separated rather than JSON-encoded for readability (`conditions=NEW,USED`).

## 3. Route Structure (Next .js 15 App Router)
```
src/app/collections/page.tsx              ← Generic gallery (TODO later)
src/app/collections/auctions/page.tsx     ← Shows live auctions only
src/app/collections/[scope]/[slug]/page.tsx
```
`[scope]` is one of `category | subcategory | segment`.

## 4. Data Flow Responsibilities
| Layer | Responsibility |
|-------|----------------|
| Section generator (`generateSectionsFromListings`) | Provide correct `viewAllLink` using helper `createCollectionPath(scope, value)`. |
| Collections page layout (`CollectionPage.tsx`) | 1. Parse `params` (scope/slug) _and_ `searchParams` (extra filters). <br>2. Dispatch `fetchCollectionListings(filters)` query. |
| Filter Sidebar component | 1. Holds local filter state. <br>2. On change → merges new value into `searchParams` and calls `router.replace(newUrl, { shallow: true });`. |
| Listings grid | Renders listings; re-fetches via React Query key `["collections", filters]`. |

## 5. Helper APIs
```ts
// utils/slugify.ts
export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '')

// utils/url.ts
export function createCollectionPath(scope: 'category' | 'subcategory' | 'segment' | 'auctions', value?: string) {
  if (scope === 'auctions') return '/collections/auctions'
  return `/collections/${scope}/${slugify(value ?? '')}`
}
```

## 6. Implementation Checklist
1. **Utilities**
   - [ ] Add `slugify.ts` and `url.ts` helpers.
2. **Section Generator**
   - [ ] Replace hard-coded `viewAllLink` with `createCollectionPath`.
3. **Routes**
   - [ ] Generate files under `src/app/collections/...` as outlined.
   - [ ] Each route uses the common `CollectionPage` component with appropriate props.
4. **Filter Sync**
   - [ ] Build/repurpose `FilterSidebar` to mutate search params.
   - [ ] Use `router.replace` with `shallow` to update URL without full reload.
   - [ ] Ensure initial state is hydrated from `searchParams` so filter UI matches URL on page load.
5. **Data Query Layer**
   - [ ] Extend existing catalog/auction query services to accept filter object (categories, segments, conditions, etc.).
6. **Testing / QA**
   - [ ] Unit test `createCollectionPath` and `slugify`.
   - [ ] Cypress/Playwright happy-path test: visit section → URL correct → add filter → URL updates.
   - [ ] Manual smoke test across desktop & mobile.
7. **Fallback Gallery (Later)**
   - [ ] Implement `/collections` gallery page after core work is stable.

## 7. Open Questions
1. Do we need pagination/infinite-scroll on collection pages day-one?
2. Which filters are MVP (condition, price, brand)? Determine API support.
3. SEO: will we prerender collection paths or keep them purely client-side?

---
Once this plan is accepted, we will execute steps 1-6, staging the work in small PR-ready commits.
