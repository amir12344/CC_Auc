## Goal

Reduce First Load JS on public marketing pages by isolating them from app providers and heavy client bundles. Keep URLs unchanged and improve SEO/perf by using Server Components with minimal client islands.

## Scope

- Pages under `app/website/*` and other public routes such as `app/wholesale-liquidation-platform/*`, `app/website/blog/*`, `app/website/podcast/*`.

## Success criteria

- Public pages no longer include Redux/Query/Auth providers in their initial bundle.
- First Load JS for marketing pages decreases significantly (target: 200–400 kB reduction vs. current).
- No URL changes or SEO regressions. Metadata and SSG/ISR remain intact.

## Tasks

### Task 1: Introduce `(website)` pathless group

Status: COMPLETED

- Added minimal server-only wrapper at `app/(website)/layout.tsx` to isolate website pages from app providers. URLs remain unchanged; inner `app/website/*` continues to function as before.

### Task 2: Split logo for marketing pages

Status: PARTIAL

- Updated `src/features/website/components/layout/Navbar.tsx` to use a static `next/image` logo with appropriate sizes and `style={{ height: 'auto' }}` (aspect ratio preserved). This avoids bundling Redux/motion.
- Smart `Logo` is preserved in `(shop)` header for auth-aware navigation.

### Task 3: Verify no app providers on marketing pages

Status: COMPLETED

- Confirmed no `ClientProviders`/Redux/Query/Auth imports under `app/website/*`. Marketing pages render without app providers; `Navbar` is the only client island.

### Task 4: Optional micro-optimizations

- Keep interactive widgets as small client islands only where needed. Defer heavier UI libs behind dynamic imports as necessary.

## Rollout & QA

- Build locally and compare "First Load JS" for a representative website page before/after.
- Spot check that blog/podcast pages render and navigate correctly. Verify no hydration warnings.

## Status

- Task 1: PENDING
- Task 2: PENDING
- Task 3: PENDING
- Task 4: OPTIONAL
