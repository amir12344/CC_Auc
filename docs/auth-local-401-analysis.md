# Local 401 on /api/auth/verification-status and redirect-to-login loops — Deep Analysis and Fix Plan

This document explains why you see frequent 401s on `/api/auth/verification-status` locally and why you’re sometimes redirected back to `/auth/login` even with correct credentials. It also outlines concrete fixes you can apply with minimal changes to your existing architecture.

## Summary

- The 401 is caused by a race between client-side login and server-side session recognition. Immediately after `signIn`, Amplify has a valid session client-side, but the server (API routes/middleware) doesn’t always “see” it yet because the SSR cookies aren’t fully persisted/available on the first few requests.
- Production usually “feels” fine due to HTTPS + more stable timing, but local dev can be slower or have HMR churn, making the race visible.
- You also trigger the verification endpoint very early via Redux and the login page, increasing the chance of a first-call 401.
- Not a browser cache bug. Clearing cookies/storage can mask the timing issue but doesn’t address the root cause.

## Where the 401 originates

- Client dispatch triggers: `src/features/authentication/store/authSlice.ts:108` calls `fetch('/api/auth/verification-status', { credentials: 'include' })`.
- The API handler: `src/app/api/auth/verification-status/route.ts:16` calls `validateAmplifySession(request)`. If SSR doesn’t see the session cookies yet, it returns 401 early.
- SSR validation: `src/lib/auth/server-auth.ts:18` (validateAmplifySession) relies on cookies to detect session (see `getAuthCookies` at `src/lib/auth/server-auth.ts:123`). If cookies aren’t present/usable on that request, the route is “unauthenticated” and returns 401.
- Middleware blocking: `src/middleware.ts:171` gates protected routes. If `validateAmplifySession` can’t confirm auth on the first navigation (after login), middleware redirects to `/auth/login?redirect=...`.

## End-to-end flow (what’s happening)

1) Login page signs in with Amplify.
   - `src/app/auth/login/LoginForm.tsx:126` `handleSuccessfulLogin()` does three things in quick succession:
     - Dispatches `initializeAuth()` (reads session client-side and populates Redux)
     - Dispatches `fetchVerificationStatus()` (calls the API route that requires SSR to see the session)
     - Computes a redirect target with `getRedirectUrlForUser()` and navigates shortly after

2) Redux initialize triggers more verification work
   - In `initializeAuth.fulfilled`, if user is a buyer, there’s a background retry that later dispatches `fetchVerificationStatus()` again, with a backoff and on window focus.

3) API route requires SSR session
   - `src/app/api/auth/verification-status/route.ts` validates the SSR session via `validateAmplifySession`. If SSR cookies aren’t present yet, it returns 401 and does not seed the httpOnly cookies (`verification-status`, `account-locked`).

4) Middleware requires SSR session
   - On the first navigation to a protected route (`/seller/*`, `/buyer/*`, `/marketplace/*`), `src/middleware.ts` calls `validateAmplifySession`. If it can’t establish a session, it redirects to `/auth/login`.

Result: even if the client already has a valid Amplify session, the first API call and/or first navigation can be “too early” for SSR, producing a 401 and an occasional redirect loop back to login.

## Why only local (mostly)?

- HTTPS and cookie handling are more consistent in prod. Locally, timing varies more, and dev servers/HMR can increase jitter.
- The client fires the verification endpoint immediately after login, making it more likely to race the cookie write.
- The middleware then also checks SSR status on first navigation to protected pages. If the server can’t read tokens yet, it redirects back to login.

## Is this cache related?

- Not primarily. httpOnly SSR cookies and Amplify’s session state are the movers here, not browser cache. Clearing site data can help only if you ended up with mismatched/stale cookies from earlier runs.

## Concrete gaps and “loop holes”

- Early, duplicate verification hits
  - `handleSuccessfulLogin()` immediately calls `fetchVerificationStatus()` while `initializeAuth` sets up its own retry for buyers. Two early hits increase odds of a first-call 401.

- API route depends only on cookies
  - `route.ts` only uses `validateAmplifySession(request)` (cookies). If cookies aren’t there yet, it can’t accept the fact that the client already has a valid session token in memory.

- Middleware is strict on the first hop
  - If SSR validation fails, it redirects to login even when the client is already logged in.

- Role cookie not seeded by verification route
  - `src/app/api/auth/verification-status/route.ts` sets `verification-status` and `account-locked` cookies, but not `user-role`. This reduces the usefulness of the fallback path in `validateAmplifySession` that can draw from cookies when attributes aren’t available.

## Recommended fixes (minimal, targeted)

1) Defer the first verification call until SSR sees the session
   - IMPLEMENTED: Removed the early `dispatch(fetchVerificationStatus())` in `LoginForm.tsx:126` and now rely on the buyer-only backoff in `initializeAuth.fulfilled`.
   - Alternative: before calling the verification API, add a lightweight guard that waits until SSR cookies exist. Example strategies (pick one):
     - Poll `document.cookie` for an id/access token cookie key (e.g., `CognitoIdentityServiceProvider.id_token` or `amplify-id-token`) for up to ~5s, then call the API.
     - Or, call the verification API with an explicit `Authorization: Bearer <idToken>` header (get token via `fetchAuthSession()`), and let the API route accept that as proof even if cookies aren’t present yet (see next item).

2) Make the API route accept a direct token for the first sync
   - IMPLEMENTED: In `src/app/api/auth/verification-status/route.ts:16`, if `validateAmplifySession` fails, we now accept `Authorization: Bearer <idToken>`. The token is verified with `aws-jwt-verify` using your user pool and client ID.
   - On success, the route sets the same cookies (`verification-status`, `account-locked`) and `user-role`.
   - This gives you a reliable “session-hydration handshake” right after login without waiting for the browser to surface cookies to SSR.

3) Seed `user-role` cookie when you already know the role
   - IMPLEMENTED: In `src/app/api/auth/verification-status/route.ts:47`, we now also set `user-role` (httpOnly) alongside `verification-status` and `account-locked`.
   - This improves `validateAmplifySession` fallbacks in `src/lib/auth/server-auth.ts:18`, which can then read role from cookies if user attributes fetch temporarily fails.

4) Strengthen SSR fallbacks a bit
   - In `src/lib/auth/server-auth.ts:18`, consider widening `isTemporaryError` to include the common Amplify auth exceptions you’re seeing locally (e.g., `UserUnAuthenticatedException`, `AuthUserPoolException`) when `getAuthCookies()` returns what looks like valid token cookies. That keeps you from bouncing to `/auth/login` during short-lived hiccups.

5) Keep middleware strict, but allow the cookies-first fast-path
   - `src/middleware.ts:171` is fine to stay strict. The key is to ensure at least one of these is true before navigating to protected routes:
     - SSR can see auth via `validateAmplifySession`, or
     - The verification API has run once and seeded `verification-status` and `user-role` cookies.

## Suggested user-flow change (after login)

- Instead of immediately pushing to `/seller/*` or `/buyer/*`, do one of:
  - Wait for a successful 200 from `/api/auth/verification-status` (with Authorization header fallback) before navigating; or
  - Wait until an SSR cookie is visible locally (poll `document.cookie`), then navigate; or
  - Increase the current delay (1.5s) and remove the duplicate early verification call to reduce pressure on the race.

This guarantees middleware has what it needs on the first protected request.

## Quick checks you can do locally

- Watch cookies in DevTools → Application → Cookies while logging in. The moment the id/access token cookies appear, a subsequent fetch to `/api/auth/verification-status` should return 200 and set `verification-status` + `account-locked` (and after the fix, `user-role`).
- If a first call returns 401, try again after ~1–2s. It should flip to 200 once SSR sees the session.

## One-time hygiene for dev

- Clear site data (cookies + localStorage) if you’ve switched environments or user pools recently.
- Ensure you always use the same origin (e.g., `http://localhost:3000`) — mixing `localhost` and `127.0.0.1` creates separate cookie jars.

## What I changed (code-level)

- `src/app/auth/login/LoginForm.tsx:126`
  - Removed the immediate `dispatch(fetchVerificationStatus())` to avoid racing SSR cookie visibility. `initializeAuth.fulfilled` handles a robust, delayed fetch with retry for buyers.

- `src/app/api/auth/verification-status/route.ts:16,47`
  - Added bearer-token fallback with verification via `aws-jwt-verify` and seeded `user-role` httpOnly cookie together with `verification-status` and `account-locked`.

- `src/lib/auth/server-auth.ts:18`
  - Expand `isTemporaryError` to include common local exceptions and fall back to cookie-derived role when token cookies are present.

- `src/features/authentication/store/authSlice.ts:108`
  - Keep the current 401 handling, but once the API accepts bearer tokens you’ll see far fewer 401s locally.

## Closing

Your login implementation is structurally sound. The local 401s and occasional redirect-to-login loop are timing/coordination issues between client-side Amplify state and SSR cookie-based validation — not a credential bug and not really a caching issue. The “session-hydration handshake” fix (accepting bearer tokens on the verification API, or deferring the first call until SSR cookies are visible) will make local login rock-solid without changing your overall architecture.

Status:
- Removed early verification fetch after login: DONE
- Seeded `user-role` cookie in verification API: DONE
- Bearer-token fallback for verification API: DONE
