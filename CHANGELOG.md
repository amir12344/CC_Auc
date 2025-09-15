# Authentication Refactor Changelog

This document tracks the major changes and decisions made during the authentication system refactor.

## Summary

The primary goal of this refactor was to modernize the application's authentication architecture by replacing a legacy implementation that combined Redux, React Context, and direct Amplify calls. We have migrated to a centralized, custom `useAuth` hook, powered by TanStack Query, to handle all authentication logic and state management. This simplifies the codebase, improves maintainability, and aligns with modern React and Next.js best practices.

## Key Architectural Changes

- **Centralized `useAuth` Hook**: Introduced `useAuth` (`@/src/features/authentication/hooks/useAuth`) as the single source of truth for user state (`user`, `isAuthenticated`, `isLoading`), sign-in/sign-out actions, and session management.
- **Amplify JS v6 Upgrade**: The Amplify library was upgraded to Gen 2 (JS v6). The `signIn` API now requires an object with `{ username, password }` where `username` is the user's email.
- **State Management**: Global authentication state is now managed by TanStack Query. Redux is retained *only* for the `offer-management` feature, with plans for its eventual removal.
- **Deprecated Redux**: Removed the Redux-based authentication state management, including `authSlice.ts` and `authSelectors.ts`.
- **Deprecated `AuthContext`**: The legacy `AuthContext.tsx` has been removed in favor of the `useAuth` hook.

## Route Protection and Security

- **Role-Based Access Control (RBAC)**: Implemented stricter route protection.
  - `BuyerProtectedRoute` now guards all `/buyer/**` routes.
  - `SellerProtectedRoute` now guards all `/seller/**` routes.
- **HOC Deprecation**: The `withAuth` Higher-Order Component has been deprecated and replaced by the new protected route components.
- **Helper Removal**: The `AuthenticatedRoute` helper component was removed to avoid confusion and enforce a clear separation of roles.

## Component & Page Refactoring

The following components and pages were refactored to use the new `useAuth` hook, removing all dependencies on the old Redux store and direct Amplify calls:

- `src/app/auth/login/page.tsx`
- `src/components/layout/Header.tsx`
- `src/components/layout/MobileNavigation.tsx`
- `src/app/buyer/deals/page.tsx`
- `src/app/seller/dashboard/page.tsx`
- `src/app/seller/listing/[id]/page.tsx`
- `src/app/buyer-signup/certificate-upload/page.tsx`
- `src/app/auth/confirm/page.tsx`

## UI and UX

- **Login Page**: The UI for the login page was restored to its original, user-approved design while integrating the new authentication logic seamlessly.
- **User Feedback**: Toast notifications (`useToast`) are now used for providing feedback during login (e.g., success, failure, loading states).

## Type Safety

- **Consolidated User Profile**: The `UserProfile` type definition was consolidated into `src/lib/interfaces/auth.ts`, and the old `src/lib/types.ts` file was deprecated to create a single source of truth.
- **Resolved Compile Errors**: Addressed various TypeScript errors that arose from the refactor, such as updating components to use `fullName` instead of the previously-used `displayName`.
