# OTP Confirmation Flow Fix Plan

## Overview

This plan outlines a step-by-step approach to implement a robust OTP confirmation system using LocalStorage for state persistence and timeout-based auto-resend. The goal is to handle resumed flows (e.g., after leaving without confirming, logging in, or manual URL navigation) seamlessly, without relying on query params that can be tampered with. All changes will be additive to preserve current functionality—existing initial flows will remain unchanged, with new logic acting as enhancements/fallbacks.

Key Principles:

- **No Breaking Changes**: Use conditional checks to only trigger new behavior in resumed scenarios. Initial flows (immediate confirmation after signup) will bypass new logic.
- **Cover Both Buyer and Seller**: Logic is symmetric; apply to both signup pages and use `userType` from query params (preserved in current code) for redirects.
- **Edge Cases Covered**: Initial flow, resumed via login, manual URL edit/direct access, storage cleared, OTP expired, session timeouts.
- **Testing Focus**: Each phase includes success criteria and test scenarios.

## Phase 1: Add Shared LocalStorage Utilities

- **File to Edit/Create**: Create a new file at `src/utils/localStorageUtils.ts` (or similar in utils/, based on project structure).
- **Changes**:
  - Export functions: `setConfirmationPending({ username: string, userType: string })` - Stores { username, userType, timestamp } in localStorage under key 'confirmationPending'.
  - `getConfirmationPending()` - Retrieves and validates (e.g., timestamp < 24 hours old); returns null if expired or invalid.
  - `clearConfirmationPending()` - Removes the key.
  - Add expiration check (e.g., 24 hours) to auto-clear stale entries.
- **Why**: Centralizes storage logic for reuse in signup and (assumed) login pages.
- **Success Criteria**: Functions work in isolation (unit test: set, get, clear, expire).
- **Test Scenarios**: N/A yet (utility phase).

## Phase 2: Update Signup Pages to Set Pending Flag

- **Files to Edit**:
  - `src/app/auth/buyer-signup/page.tsx`
  - `src/app/auth/seller-signup/page.tsx`
- **Changes** (Identical for both):
  - Import `setConfirmationPending` from utils.
  - In `processForm`, after successful `signUp` call and before redirect to /confirm, call `setConfirmationPending({ username: data.email, userType: 'buyer' })` (or 'seller').
  - Do NOT clear it here—clear only after successful confirmation.
- **Why**: Marks the flow as "pending" during initial signup, so if user leaves, it's detectable on return.
- **Success Criteria**: Initial signup sets storage correctly; no impact on immediate confirmation (storage is set but not used in initial flow).
- **Test Scenarios**:
  - Buyer/Seller: Signup → Check storage has correct data → Immediate confirm (works as before).
  - Buyer/Seller: Signup → Leave → Storage persists.

## Phase 3: Update Confirm Page with On-Mount Auto-Resend Logic

- **File to Edit**: `src/app/auth/confirm/page.tsx`
- **Changes**:
  - Import `getConfirmationPending`, `clearConfirmationPending` from utils.
  - In component: Add useEffect on mount.
    - Check `const pending = getConfirmationPending()`.
    - If pending exists and is valid:
      - If pending.username matches query username (safety check), auto-call `handleResendCode()` (reuses existing function).
      - Show toast: "We've sent a fresh confirmation code to your email."
      - Clear the pending storage.
    - Else (no pending or invalid): Start a 15-second timeout. If no code entered by then (check via state), auto-call `handleResendCode()` once, with toast: "Haven't received your code? We've sent a fresh one."
    - Add rate-limit: Use localStorage timestamp for last resend; prevent if <1 min ago.
  - Preserve all existing logic (e.g., manual resend button).
- **Why**: Detects resumed flows via storage (reliable) or timeout (fallback for tampered/cleared cases). Symmetric for buyer/seller via stored userType.
- **Success Criteria**: Auto-resend triggers only when needed; manual button still works.
- **Test Scenarios**:
  - Initial (Buyer/Seller): Signup → Redirect to /confirm → No auto-resend (fresh code from signup); confirm works.
  - Resumed (Buyer/Seller): Signup → Leave → Login redirect to /confirm → Auto-resend via storage check.
  - Manual URL (Buyer/Seller): Direct to /confirm (with params) → Auto-resend via timeout if no code entered.
  - Tampered (Buyer/Seller): Clear storage/params → Fallback to timeout auto-resend.
  - Edge: Expired storage → Treat as manual (timeout fallback).

## Phase 4: Enhance Confirmation Handler with Auto-Sign-In Fallback

- **File to Edit**: `src/app/auth/confirm/page.tsx`
- **Changes**:
  - In `handleConfirmSignUp`, after `confirmSignUp` succeeds:
    - Wrap `autoSignIn` in try-catch.
    - If succeeds: Proceed as now (initializeAuth, post-APIs, redirect based on userType—certificate for buyer, dashboard for seller).
    - If fails (e.g., NotAuthorized): Show success toast ("Account confirmed! Please sign in."), clear any pending storage, redirect to /login with ?justConfirmed=true&redirect=${redirectTo}&userType=${userType}.
  - In post-confirmation APIs: Make idempotent (e.g., check if profile exists before creating).
  - No changes to error handling—add custom message for NotAuthorized: "Confirmation successful—now sign in to continue."
- **Why**: Handles session mismatch in resumed flows without errors; preserves initial flow.
- **Success Criteria**: Resumed confirmation succeeds without "Incomplete" toast; redirects to login gracefully.
- **Test Scenarios**:
  - Initial (Buyer/Seller): Confirms → Auto-sign-in succeeds → Correct redirect (buyer to certificate, seller to dashboard).
  - Resumed (Buyer/Seller): Confirms after resend → Auto-sign-in fails → Success toast → Redirect to login.
  - After login post-confirmation: Assumes login checks ?justConfirmed and runs pending APIs if needed.

## Phase 5: Update Login Page for Pending Flag (If Needed)

- **File to Edit**: `src/app/auth/login/page.tsx` (assuming it exists; if not, add similar logic where signIn is called).
- **Changes**:
  - On UserNotConfirmedException: Set `setConfirmationPending({ username, userType: inferredFromAttributes })` before redirect to /confirm.
  - After successful login with ?justConfirmed=true: Run post-confirmation APIs if not done.
- **Success Criteria**: Login redirect sets storage for auto-resend.
- **Test Scenarios**: As in Phase 3.

## Final Testing and Rollout

- **Comprehensive Tests**: Run all scenarios for buyer/seller; check console/network for errors; verify storage clears post-success.
- **Rollback**: Changes are isolated; can comment out useEffects if issues.
- **Monitoring**: Add logging for auto-resend triggers.

Implementation will proceed phase-by-phase via code edits.

## Phase 6: Fix Reported Issues (Buyer Redirect, Double OTP, Timer UI)

- **Files to Edit**:
  - `src/app/auth/confirm/page.tsx` (main fixes).
  - `src/app/auth/login/page.tsx` (enhance justConfirmed handling).
- **Changes**:
  - In useEffect (auto-resend): Add flag `hasAutoResent` set after storage resend; skip timeout if true. Limit to once per load.
  - Add countdown state: After any resend (auto/manual), start 60s timer; disable button/show "Resend in XXs"; prevent auto-resend during timer.
  - In handleConfirmSignUp: Refine try-catch—add check if this is initial flow (e.g., via fresh timestamp in storage); force success path for buyers to ensure certificate redirect.
  - On fallback: For buyers, set storage flag 'needsCertificate' before login redirect.
  - In login (on success with ?justConfirmed): If 'needsCertificate' flag and userType=buyer, redirect to certificate instead of dashboard; clear flag.
  - Make APIs more idempotent: In handlePostConfirmationAPIs, add try-catch per API; skip if already done (e.g., query if profile exists).
- **Why**: Prevents double sends (guards), adds visible timer (UX), ensures initial buyer flow hits certificate (conditionals), handles resumed without forcing certificate.
- **Success Criteria**: Initial buyer: Signup → OTP → Certificate. Resumed buyer: Interrupt → Login → OTP (single send, timer shown) → Login → Dashboard (skip certificate). No doubles; timer visible.
- **Test Scenarios**:
  - Initial Buyer: Signup → OTP → Certificate (no fallback).
  - Interrupted Buyer: Signup → Leave OTP → Login → /confirm (single auto-resend, timer) → Confirm (fallback) → Login → Dashboard.
  - Seller: All flows to dashboard; no certificate issues.
  - Double Send: Refresh /confirm during timeout → No extra send.
  - Timer: After resend, button shows countdown; can't resend until 0.
