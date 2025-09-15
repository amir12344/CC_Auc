### Authentication, Session Management, and Middleware Audit

**Scope**: Next.js App Router middleware, Amplify/Cognito session handling, buyer verification, Redux auth slice, and related API route.

**Priority Focus**: Fix inconsistent session handling that triggers “Already Logged In… syncing” and harden buyer verification + auth trust boundaries.

Note on Amplify server-side support: This project already uses Amplify’s official Next.js server adapter (`runWithAmplifyServerContext` in `src/utils/amplify-server-utils.ts`) and server APIs (`aws-amplify/auth/server`). So, contrary to some guidance suggesting "client-only" usage, we can and do validate sessions on the server reliably. The recommendations below assume continued use of these server APIs.

---

## Executive summary

- **Root cause of the “Already Logged In… syncing” experience**: The app allows authenticated users to access `/auth/*` pages, then tries to sign in again client-side while a valid session already exists. This yields Amplify’s `UserAlreadyAuthenticatedException`, after which the UI “syncs” and proceeds. This should be avoided by redirecting authenticated users away from `/auth/*` on the server before the page loads.
- **Trust boundary issues**: Middleware uses permissive cookie heuristics and mixed cookie names for role caching, which can lead to false-positive “authenticated” states and redundant re-initialization.
- **Buyer verification**: Generally sound (API sets httpOnly cookies; middleware consults cookie first then refreshes via API), but a few reliability and naming consistency issues remain.

---

## Critical findings (ordered by impact)

1. Missing server-side redirect away from `/auth/*` for authenticated users

- Where: `src/middleware.ts` (middleware skips `/auth` entirely via `isStaticOrPublicPath`).
- Impact: Authenticated users can hit `/auth/login`, submit sign-in again, and trigger `UserAlreadyAuthenticatedException` → “Already logged in, syncing…” UX.
- Fix: In middleware, after `validateAmplifySession`, if `isAuthenticated` and `pathname.startsWith('/auth')` (except explicit logout routes), redirect users to their destination (`/seller/dashboard` or `/marketplace`/buyer route).

2. Cookie name mismatch for user role (server expects `user-role`, client sets `userRole`)

- Where: Server reads `user-role` (`src/lib/auth/server-auth.ts#getCachedUserRole`). Client sets `document.cookie = userRole=...` in `authSlice` reducers.
- Impact: Middleware often misses the cached role and makes extra Amplify calls; session state feels inconsistent/flaky.
- Fix: Standardize on a single cookie name (recommend `user-role`) and set it only on the server as httpOnly. Remove the client-set `userRole` cookie write from reducers.

3. Over-permissive auth cookie detection and unsafe "authenticated" fallback

- Where: `src/lib/auth/server-auth.ts#getAuthCookies` and the outer `catch` in `validateAmplifySession`.
- Details:
  - `hasValidCookies` becomes true if the raw Cookie header merely contains substrings like `amplify` or `auth`.
  - In the outer `catch`, if `hasValidCookies` is true, the code returns `{ isAuthenticated: true, ... }` using cached cookies.
- Impact: Potential false positives and treating requests as authenticated when token validation actually failed (brittle UX and theoretical security risk if an attacker can influence non-httpOnly cookies).
- Fixes:
  - Make `hasValidCookies` strict: only consider known Cognito/Amplify token cookie patterns (or skip the heuristic entirely and rely on `getCurrentUser` result).
  - Remove the outer "treat as authenticated" fallback unless the error is known temporary and real tokens are present. Use the existing `isTemporaryError` gate only.

4. Trusting client-writeable role cookie for authorization hints

- Where: Role is read from `request.cookies.get('user-role')`.
- Impact: A client can overwrite a non-httpOnly cookie of the same name, potentially influencing role-based flow. While you still re-check via Amplify most of the time, this cookie should never be an auth source of truth.
- Fix: Treat role cookie as a performance hint only; always prefer attributes from `fetchUserAttributes` or validated token claims. Ensure the role cookie is set httpOnly server-side only, and remove all client writes.

5. Buyer verification flow: good shape but a few consistency gaps

- Where:
  - Middleware: checks `verification-status` cookie, then calls `/api/auth/verification-status` to refresh if not `verified`.
  - API: `src/app/api/auth/verification-status/route.ts` sets `verification-status` and `account-locked` as httpOnly.
- Issues:
  - Naming consistency in Redux vs cookies: Redux reducer uses `'approved'` in one place and cookies+middleware use `'verified'`.
  - Middleware forwards only a single `set-cookie` header value from the API; multiple cookies are currently handled but verify multi-header behavior across platforms.
- Fixes:
  - Unify vocabulary to `verified | pending | rejected` across Redux/UI and cookies.
  - Ensure multiple `Set-Cookie` headers are preserved (iterate through header values rather than rely on a single `get`).

6. Protected routes policy confirmed

- Where: Middleware treats `/marketplace`, `/search`, `/collections` as protected.
- Status: Confirmed these routes should be private. No change required to current matcher list for these paths.

7. Duplicate/trigger-happy auth initialization pathways (lower impact now, but noisy)

- Where: `AuthProvider` dispatches `initializeAuth` on mount; login page dispatches `initializeAuth` after sign-in; a separate `AuthInitializer` component exists (appears unused in layouts now, good).
- Impact: Extra calls are harmless but can add latency/race under poor networks.
- Fix: Keep a single init source (prefer `AuthProvider`). Post-login, avoid immediate re-init if you already possess fresh user data/tokens.

8. PII exposure via `username` cookie (httpOnly)

- Where: `cacheAuthData` sets `username` as cookie.
- Impact: While httpOnly, consider whether you need this stored at all. Minimizing user identifiers in cookies reduces risk.
- Fix: Remove unless strictly required.

---

## Recommended fixes (actionable)

1. Server-side redirect for authenticated users on `/auth/*`

- In middleware, after successful `validateAmplifySession`, if `pathname.startsWith('/auth')` and not an allowed sign-out route, redirect buyers to `/marketplace` or verification-appropriate page; sellers to `/seller/dashboard`.

2. Standardize cookie names and ownership

- Use only `user-role` (kebab-case) and set it server-side as httpOnly.
- Remove all client code that writes `document.cookie = userRole=...` in `authSlice`.

3. Harden `validateAmplifySession` (server-side Amplify supported)

- Keep using `runWithAmplifyServerContext` with `getCurrentUser`/`fetchUserAttributes` for authoritative validation on the server.
- Remove/limit the outer catch-all authenticated fallback. Only treat as authenticated if a known temporary error occurred AND real tokens are present.
- Make `getAuthCookies` strict (look for real Cognito cookie keys or rely solely on `getCurrentUser`).
- Stop reading role from headers (`x-user-role`); do not trust any client-controlled header for auth.

4. Buyer verification consistency

- Align Redux/status vocabulary to `verified | pending | rejected` everywhere.
- When proxying API `Set-Cookie` in middleware, iterate over all `set-cookie` header values and append each.

5. Login page UX safety net (optional if middleware redirect is added)

- Early client-side guard: if already authenticated, immediately redirect away from `/auth/login` to the correct destination to avoid user-initiated re-login.

6. Minimize cookies

- Drop `username` cookie unless there is a server-only use-case that truly needs it.

---

## Acceptance criteria

- Navigating to `/auth/login` while authenticated never shows the login screen and never triggers `UserAlreadyAuthenticatedException`.
- Only one auth initialization occurs per session view; no redundant Amplify calls on every route change.
- Middleware no longer treats users as authenticated based on weak cookie heuristics; role decisions are based on verified attributes/tokens.
- Unverified buyers are consistently redirected to `/buyer/verification-pending` until status is `verified` (and cookies are updated seamlessly on first eligible request).
- No client-side code writes `userRole` cookies; role clues are httpOnly and server-managed.

---

## Files reviewed (key ones)

- `src/middleware.ts`
- `src/lib/auth/server-auth.ts`
- `src/app/api/auth/verification-status/route.ts`
- `src/features/authentication/store/authSlice.ts`
- `src/components/providers/AuthProvider.tsx`
- `src/components/providers/ClientProviders.tsx`

If you want, I can implement these fixes in a small series of PR-style edits with guardrails and tests.

---

## Implementation checklist (live status)

- [x] Server-side redirect away from `/auth/*` when authenticated (middleware)
- [x] Keep `/marketplace`, `/search`, `/collections` private (confirmed and enforced)
- [x] Harden server auth validation (Amplify server APIs, no weak cookie heuristics, no client headers)
- [x] Standardize verification status to `verified | pending | rejected` across server, cookies, and Redux types
- [x] Forward/set verification cookies from verification API refresh in middleware (now setting httpOnly cookies directly)
- [x] Remove client-side `userRole` cookie writes; treat role cookie as server-managed httpOnly hint only
- [x] Avoid fallback “authenticated” state on arbitrary cookie substrings
- [x] Optional: Remove `username` httpOnly cookie if not needed (implemented)
- [ ] Optional: Reduce middleware complexity (refactor into helpers) – not required functionally, can do later
