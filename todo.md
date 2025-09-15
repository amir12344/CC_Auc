# Authentication and Data Fetching Refactor Plan

This document outlines the tasks for refactoring the application's authentication and data-fetching logic to use TanStack Query, consolidating duplicated code and aligning with modern best practices.

## Phase 1: Setup and Centralized Auth Hook

- [x] **1. Setup TanStack Query**
  - [x] Check `package.json` and install `@tanstack/react-query` if not present.
  - [x] Create a `QueryClient` instance.
  - [x] Wrap the application with `QueryClientProvider` in `src/providers/Providers.tsx`.

- [x] **2. Centralize User Profile Transformation**
  - [x] Create `src/features/authentication/utils/transformUserProfile.ts`.
  - [x] Define a `transformAmplifyUserToProfile` function. This will fix the timestamp bug by omitting `createdAt` and `lastLoginAt` and centralize the transformation logic.

- [x] **3. Create `useAuth` Hook with TanStack Query**
  - [x] Create a new hook at `src/features/authentication/hooks/useAuth.ts`.
  - [x] Inside the hook, create a `useQuery` to fetch and manage the current user state from Amplify. The query function will handle fetching, and it will use our new `transformAmplifyUserToProfile` utility.
  - [x] Create `useMutation` hooks for `signIn` and `signOut` operations.
  - [x] The hook will return all necessary auth state: `user`, `isAuthenticated`, `isLoading`, `signIn`, `signOut`, etc.

## Phase 2: Migration and Cleanup

- [ ] **1. Migrate UI Components**
  - [ ] Systematically replace usage of `AuthContext` and Redux's `useSelector`/`useDispatch` for auth with the new `useAuth` hook in all components.

- [ ] **2. Deprecate Old Auth Code**
  - [ ] Once the migration is complete, `AuthContext.tsx`, `authSlice.ts`, and `authSelectors.ts` can be safely removed. This will significantly simplify the auth architecture.

- [ ] **3. Modernize Data Fetching and Route Protection**
  - [ ] Replace the `withData.tsx` HOC with direct `useQuery` calls in components.
  - [ ] Refactor the `withAuth.tsx` HOC (or its successor `ProtectedRoute`) to use the `useAuth` hook.
  - [ ] (Future) Consider migrating route protection to Next.js Middleware for server-side enforcement.
