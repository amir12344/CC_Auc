# Tanstack Query Implementation Plan for Seller Dashboard

## Introduction

This document outlines a detailed plan to integrate Tanstack Query (formerly React Query) into the seller dashboard section of the application (`/seller/dashboard` and its sub-routes like listings, offers, orders). The goal is to improve performance by adding client-side caching, reducing redundant fetches during tab navigation, and enabling features like background refetching. Since SEO is not a requirement for the seller side, we'll shift these components to client-side rendering where appropriate, using the `'use client'` directive.

Tanstack Query will handle data fetching, caching, and mutations for dynamic data (e.g., listings, offers, orders), making back-and-forth navigation feel instantaneous after initial loads. We'll integrate it with existing Redux state (for user data) and maintain Suspense for loading states.

Estimated effort: 4-6 hours, assuming no major API issues.

## Prerequisites

1. **Dependencies Installation**:

   - Install Tanstack Query: Run `npm install @tanstack/react-query` (or yarn/pnpm equivalent).
   - Install Devtools for debugging: `npm install @tanstack/react-query-devtools`.
   - Ensure React and Next.js are up-to-date (already satisfied in the project).

2. **API Readiness**:

   - Confirm backend APIs (e.g., via Amplify or Prisma in `src/lib/api/`) are stable and return consistent data formats.
   - Identify fetch functions: Trace async fetches in `AllListings`, `AllOffers`, `AllOrders` (in `src/features/seller-deals/components/`).

3. **Project Rules Compliance**:
   - Use TypeScript throughout.
   - Maintain mobile-first Tailwind CSS styling.
   - Adhere to accessibility and best practices (e.g., no unnecessary type annotations).
   - Update memory after major changes.

## Step-by-Step Implementation

- [x] Step 1: Set Up Tanstack Query Provider
- **File**: Create or modify a provider wrapper in `src/components/providers/` (e.g., add to existing `Providers.tsx` or create `QueryProvider.tsx`).
- **Details**:
  - Import `QueryClient` and `QueryClientProvider` from `@tanstack/react-query`.
  - Create a new `QueryClient` instance with default options: `{ defaultOptions: { queries: { staleTime: 5 * 60 * 1000, // 5 minutes } } }` (adjust based on data freshness needs).
  - Wrap the seller dashboard layout (`src/app/seller/dashboard/layout.tsx`) with `QueryClientProvider`. Mark the layout as `'use client'` if needed.
  - Optionally, add `ReactQueryDevtools` for development (conditionally rendered in dev mode).
- **Why**: This provides a global cache context for all sub-components.

- [x] Step 2: Mark Components as Client-Side
- **Files**:
  - `src/app/seller/dashboard/page.tsx` (already `'use client'`).
  - Sub-pages: `listings/page.tsx`, `offers/page.tsx`, `orders/page.tsx` – add `'use client'` at the top.
  - Core components: `AllListings.tsx`, `AllOffers.tsx`, `AllOrders.tsx` in `src/features/seller-deals/components/` – add `'use client'`.
- **Details**: Since these are now client components, they can use hooks like `useQuery`. This shift is fine as SEO isn't needed.

- [x] Step 3: Refactor Data Fetching with useQuery
- **General Approach**: Replace existing async fetches (e.g., `fetch` calls) with `useQuery` hooks.
- **Specific Refactors**:
  - **AllListings** (`src/features/seller-deals/components/AllListings.tsx`):
    - Extract the fetch logic into a query function (e.g., `fetchListings()` returning a Promise).
    - Use `const { data, isLoading, error } = useQuery({ queryKey: ['sellerListings'], queryFn: fetchListings });`.
    - Handle loading with existing Suspense or conditional rendering (integrate with `loading.tsx`).
  - **AllOffers** (`src/features/seller-deals/components/AllOffers.tsx`):
    - Similar to above: `useQuery({ queryKey: ['sellerOffers'], queryFn: fetchOffers });`.
    - Add refetchOnWindowFocus for real-time updates.
  - **AllOrders** (`src/features/seller-deals/components/AllOrders.tsx`):
    - `useQuery({ queryKey: ['sellerOrders'], queryFn: fetchOrders });`.
    - If pagination exists, use `useInfiniteQuery` for infinite scrolling.
  - **Root Dashboard** (`src/app/seller/dashboard/page.tsx`):
    - If it fetches insights/overview data, wrap in `useQuery` (e.g., queryKey: ['sellerInsights']).
- **Caching Strategy**:

  - Set staleTime/cacheTime appropriately: 1-5 minutes for dynamic data like offers; longer (e.g., 30 minutes) for listings if less volatile.
  - Use query keys with dependencies (e.g., ['sellerListings', userId]) to invalidate on user changes (from Redux).
  - Enable background refetching: `{ refetchOnWindowFocus: true, refetchOnReconnect: true }`.

- [ ] Step 4: Handle Mutations (If Applicable)
- **Files**: Any components with actions (e.g., accepting offers in `AllOffers`).
- **Details**:
  - Use `useMutation` for POST/PUT requests (e.g., `const mutation = useMutation({ mutationFn: acceptOffer });`).
  - On success, invalidate queries (e.g., `queryClient.invalidateQueries({ queryKey: ['sellerOffers'] });`) to refresh data.
  - Add optimistic updates for snappy UI (e.g., temporarily update cache before server response).

### Step 5: Integrate with Existing Features

- **Redux**: Use selectors (e.g., `selectUserProfile`) in query keys or enabled conditions (e.g., `enabled: !!userId`).
- **Suspense/Loading**: Keep `loading.tsx` for initial server suspense; on client, use `isLoading` for spinners.
- **Error Handling**: Use Tanstack's error state; integrate with global error boundaries.
- **Navigation**: In `SellerNavigation`, ensure links don't cause full reloads (already handled by Next.js Link).

### Step 6: Optimize and Clean Up

- Remove redundant server fetches if shifting fully to client.
- Add types for query data (e.g., interface for listings response).
- Update any related tests/mocks in `src/mocks/`.

## Potential Challenges and Mitigations

- **Initial Load Slowness**: Mitigate by prefetching in parent components (e.g., use `queryClient.prefetchQuery` in layout).
- **Cache Invalidation**: If data stales too quickly, adjust times or add manual invalidate buttons for testing.
- **Bundle Size**: Monitor with Next.js analyzer; Tanstack Query is lightweight.
- **Conflicts with Next.js**: Avoid using in server components; ensure all Tanstack usage is client-side.
- **Dynamic Data**: For real-time (e.g., new offers), combine with WebSockets if needed (future enhancement).

## Testing Strategy

1. **Unit Tests**: Test hooks with `@testing-library/react` and Tanstack's test utils.
2. **Integration Tests**: Navigate tabs, verify no refetches on back-and-forth (use devtools to inspect cache).
3. **Performance Tests**: Measure load times before/after using browser tools; aim for <100ms on repeat navigations.
4. **Edge Cases**: Test offline, error states, mutations, and cache invalidation.
5. **Manual QA**: Simulate slow networks; ensure UX feels responsive.
6. **Deployment**: Test in staging; monitor for issues.

This plan will be executed iteratively, with memory updates after key steps. If adjustments are needed, we'll refine based on feedback.
