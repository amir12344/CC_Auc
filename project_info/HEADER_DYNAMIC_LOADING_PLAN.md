## Goal

Progressively load heavy header children to reduce initial JS, hydration work, and navigation jank in the `(shop)` app, without changing behavior. We will lazy-load: MegaMenu, SearchBar, NotificationIcon, dropdown menus, and optionally the animated `Logo` enhancements.

## Success criteria

- No duplicate header flashes on navigation (already fixed via `(shop)` layout split).
- Header remains functional: search, notifications, user dropdowns, mega menu, and logo links all work as before.
- CLS stays ~0; no visible layout shift when lazy content appears (use placeholders).
- Measurable improvement (dev and prod): smaller initial client JS for `(shop)` pages and lower hydration time.

## High-level approach

1. Replace direct imports in header-related files with `next/dynamic` on-demand chunks.
2. Load MegaMenu only on desktop and on demand (visibility/hover/idle), not on mobile.
3. Keep pages server by default; keep header client, but make its heavy children client “islands” loaded lazily.
4. Provide small, accessible placeholders so SSR markup is stable and keyboard users are not blocked.

## Files to touch (no code changes yet; this is the plan)

- `src/components/layout/Header.tsx` (entry shell; wires dynamic children)
- `src/components/layout/MegaMenu/MegaMenu.tsx` (unchanged API; ensure it tolerates delayed mount)
- `src/components/layout/HeaderClient.tsx` (lazy dropdowns)
- `src/features/website/components/ui/Logo.tsx` (split motion enhancements from the static image)
- `src/features/notifications/components/NotificationIcon.tsx` (lazy-load)
- Optionally: create helpers under `src/utils/lazy/`

## Detailed plan by task

### Task 1: Introduce a tiny dynamic import helper (optional)

Status: COMPLETED

- Implemented `src/utils/lazy/dynamic-opts.tsx` exporting `lazyClient(importer, { loading })` that wraps `next/dynamic` with `ssr:false` and an optional lightweight placeholder. Kept output minimal and typed.
- Rationale: Client-only header children avoid SSR bundle cost; placeholders keep layout stable.

### Task 2: Header.tsx – dynamic-load heavy children

Status: COMPLETED

- Updated `src/components/layout/Header.tsx` to lazy-load heavy children:
  - `SearchBar` → `DynamicSearchBar` via `lazyClient`, placeholder is a small green-tinted block to preserve header height.
  - `NotificationIcon` → dynamic named export with `ssr:false`; placeholder is a disabled button with aria-label.
  - `MegaMenu` → `DynamicMegaMenu` via `lazyClient`.
- Desktop-only gating: used existing `useIsMobile` (from `src/hooks/use-mobile.ts`) to render mega menu only when not mobile.
- Preload strategy: added invisible sentinel + `IntersectionObserver` and a `pointerenter` handler on the header to `import('./MegaMenu/MegaMenu')` ahead of interaction.
- Kept comments short where imports changed; minimized `useEffect` usage (single effect solely for IntersectionObserver).

Accessibility considerations:

- All placeholders must preserve role/landmark expectations and be focusable if the real control would be (e.g., placeholder button with `aria-disabled="true"`). Avoid trapping focus; when the real component mounts, transfer focus if the placeholder was focused.

### Task 3: HeaderClient.tsx – lazy dropdown menus

Status: COMPLETED

- Converted `MyDealsDropdown`, `SellerListingsDropdown`, and `UserDropdown` to dynamic imports with small `Button`/`Skeleton` placeholders in `src/components/layout/HeaderClient.tsx`.
- Added one-time prefetch on `pointerenter` of the container to remove first-click delay.
- Kept all Redux selectors inside `HeaderClient`; children receive provider context unchanged.
- Comments added next to dynamic imports to explain intent.

### Task 4: Logo motion split

Status: COMPLETED

- Updated `src/features/website/components/ui/Logo.tsx` to dynamically import `framer-motion` (`MotionDiv`) with `ssr:false` while keeping the static image immediate. Hover motion now loads client-side only, reducing shared bundle size.
- Behavior unchanged: logo renders instantly and is clickable; motion enhancement applies after hydration.

### Task 5: NotificationIcon lazy-load

Status: COMPLETED

- Converted to dynamic import in `src/components/layout/Header.tsx` with a disabled button placeholder and proper aria-label.
- Click handler still dispatches `openNotificationSheet()` once chunk is loaded.

### Task 6: MegaMenu load conditions

Status: COMPLETED

- Desktop-only render enforced via `useIsMobile()` check in `Header.tsx`.
- Added hidden sentinel and `IntersectionObserver` prefetch. Also prefetch on `pointerenter` over the header bar.
- Fallback remains operational; menu still mounts on first interaction if prefetch didn’t occur.

### Task 7: Performance guardrails

Status: COMPLETED (enforced during implementation)

- All lazy imports provide small SSR placeholders and preserve layout height; no focus traps introduced.
- Providers unchanged; no prop drilling added.

### Task 8: QA and metrics

- Verify no hydration warnings in console.
- Keyboard navigation: Tab through header, ensure focus order and visibility are unchanged before and after lazy mounts.
- Lighthouse (local prod build): compare before/after bundle size and TBT/CLS.
- Verify desktop vs. mobile behavior for MegaMenu (mobile menu unaffected).

### Rollout steps

1. Implement dynamic helpers and update header files with comments.
2. Local test (dev): verify placeholders render instantly, chunks load on hover/idle.
3. Build locally (`next build`) and run `next start`; collect Lighthouse on `/marketplace` and a product detail page.
4. Stage deploy: watch logs for hydration warnings; confirm UX parity.
5. If any regression appears, toggle off lazy-loading per component (plan to keep changes component-scoped so revert is trivial).

### Risks and mitigations

- Small first-interaction delay: mitigate by hover/visibility prefetch and idle preloads.
- Layout shift: avoid by SSR placeholders sized to final components.
- A11y regression: placeholders must remain reachable and labeled until the real control mounts.

### Example code patterns (illustrative, not yet applied)

```ts
// Pattern: dynamic import with SSR disabled and an accessible placeholder
const DynamicSearchBar = dynamic(() => import('./SearchBar'), {
  ssr: false,
  loading: () => (
    // Small placeholder to preserve header height and affordance
    <div
      aria-hidden='true'
      className='h-9 w-full max-w-sm rounded bg-[#43CD66]/10'
    />
  ),
})

// Preload on hover or when header is visible
function usePreloadOnHover(
  ref: React.RefObject<HTMLElement>,
  preload: () => void
) {
  // Adds pointerenter listener to the ref; calls preload once. Keep tiny comments in code.
}
```

## What we will not change

- Provider boundaries: `(shop)/layout.tsx` remains the single place for `ClientProviders + MainLayout`.
- Business logic or Redux/Query behavior.

## Review checklist (for you to approve)

- Do you want `SearchBar` SSR’d (with minimal interactivity) or fully client-lazy with a placeholder? The plan assumes lazy + placeholder to reduce initial JS.
- Do you prefer hover-only preload for MegaMenu, or also visibility/idle prefetch?
- Is it acceptable to show a simple skeleton for NotificationIcon until its chunk arrives?
