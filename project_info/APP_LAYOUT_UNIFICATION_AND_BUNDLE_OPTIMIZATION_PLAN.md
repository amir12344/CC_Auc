## Goal

Eliminate header remounts and reduce First Load JS by unifying all app routes under a single provider boundary, island-izing heavy website UI, and removing `framer-motion` from the logo without breaking existing behavior or URLs.

## Success criteria

- No visible navbar/header remount when navigating between app pages (`/marketplace`, `/search`, `/buyer/*`, `/seller/*`).
- Marketing pages SSR reliably (no CSR bailouts) and ship only minimal client JS.
- First Load JS drops for marketing pages (target: tens–low hundreds of kB), and app pages maintain or slightly improve.
- No regressions to auth-aware logo routing in the app header.

## Non-goals

- No business logic changes, no API changes, no content changes.

## Design principles

- One provider boundary for the app: `(shop)/layout.tsx` wraps Redux/Query/Auth.
- Marketing uses server layouts + tiny client islands only where needed.
- Minimal `useEffect`; prefer event-driven prefetch, `next/dynamic`, and SSR placeholders.
- Accessibility preserved (labels, focus order, no hidden interactive elements).

## Tasks

### Task 1 — Unify app routes under `(shop)`

- Move `app/search`, `app/buyer`, `app/seller` under `app/(shop)/` as pathless group so URLs remain the same. [DONE]
- Remove per-section client layouts (e.g., `app/search/layout.tsx`) and let `(shop)/layout.tsx` be the single provider boundary. [DONE]
- Verify header persistence and no remounts when navigating among these routes. [PENDING QA]

### Task 2 — Fix navbar remounts and navigation

- Ensure all internal links use `next/link` (no `<a>` that forces full reload). [DONE for podcast detail back link]
- Remove any `key` props on persistent layout wrappers that would trigger remounts. [DONE - none found]
- Keep header shell SSR; lazily load heavy children (already implemented from header plan). [CONFIRMED]

### Task 3 — Website navbar/menu as client islands

- Keep `website` layout server-only. [DONE]
- Convert website nav dropdowns/sheets to `next/dynamic({ ssr:false })` with tiny placeholders; prefetch on pointerenter/intersection. [DONE – Navbar is now dynamic with placeholder]
- Limit icon imports; avoid pulling large UI libs into a shared chunk. [ONGOING]

### Task 4 — Remove motion from the logo (everywhere)

- Replace `framer-motion` in `src/features/website/components/ui/Logo.tsx` with Tailwind transitions (e.g., `transition-transform hover:scale-105`). [DONE]
- Keep the smart auth-aware navigation logic intact for the app header; marketing keeps static `next/image` logo. [DONE]
- If no other motion users remain, uninstall `framer-motion` and its peer to reduce build-time noise. [PENDING — still used in auth/website sections]

### Task 5 — Package and build optimization

- Enable `experimental.optimizePackageImports` in `next.config` for `lucide-react`, `date-fns`, and Radix packages actually used. [DONE]
- Audit and remove unused global client utilities; ensure large libs (xlsx/react-pdf/charts) load only on pages that need them. [PARTIAL – dialogs and filters now lazy]

### Task 6 — App page islands (targeted)

- Search: lazy-load `PageSpecificFilterSidebar` and heavy client-only controls; keep data fetch server-side. [DONE]
- Seller: lazy-load `CreateListingDialog` and other heavy dialogs; import Excel utilities only on upload pages. [DONE for CreateListingDialog]

### Task 7 — Security and SSR guardrails

- Marketing pages must not import `ClientProviders`, Amplify/Auth, or app-only stores.
- Keep analytics/scripts in `app/layout.tsx` non-blocking; avoid duplication.
- Validate imports after route move: update references that used `src/app/buyer/*` to `src/app/(shop)/buyer/*` if any. [PENDING]

### Task 8 — QA and metrics

- Clean build (`.next` removed) and run build with analyzer; confirm reduced shared chunks for website routes.
- Verify: 1) no hydration warnings, 2) header not remounted on app navigations, 3) Lighthouse improvements on `/website/*`. [PENDING]

## Rollback strategy

- Each change is component-scoped. Revert by restoring file imports (e.g., switch back to eager imports) or moving a route back out of `(shop)` if needed. No URL changes due to pathless groups.

## Status

- Task 1: DONE (moved routes under `(shop)` and removed duplicate layouts)
- Task 2: PARTIAL (internal link fix + validation; no remount keys found)
- Task 3: PARTIAL (Navbar islanded)
- Task 4: PARTIAL (logo motion removed; other motion users remain)
- Task 5: PARTIAL (optimizePackageImports configured)
- Task 6: DONE (filters/dialogs lazy)
- Task 7: PARTIAL (validated website imports; flagged buyer path imports for update if needed)
- Task 8: PENDING
