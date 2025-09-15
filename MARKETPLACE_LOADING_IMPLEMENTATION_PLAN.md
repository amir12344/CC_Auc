# Marketplace Loading Implementation Plan

## Problem Analysis

### Current Issues Identified:

1. **No Visual Feedback**: When users click on product/auction cards, there's no immediate visual feedback indicating that the navigation is starting.

2. **Navigation Delay**: There's a noticeable delay between clicking cards and reaching the destination page, especially for:

   - `/marketplace/product/[id]` (regular products)
   - `/marketplace/auction/[id]` (auction listings)

3. **Multiple Loaders**: Sometimes multiple loading states appear simultaneously, creating a poor UX.

4. **Linter Errors**: The marketplace page has TypeScript errors due to incorrect prop passing to `ShopClientContent`.

5. **Inconsistent Loading States**: Different sections use different loading patterns, causing confusion.

## Root Cause Analysis

### 1. Card Navigation Implementation

- **ProductCard**: Uses Next.js `Link` component with `href={generateSlug(product)}`
- **AuctionCard**: Uses Next.js `Link` component with `href={`/marketplace/auction/\${auction.id}`}`
- **Issue**: No loading state management when `Link` is clicked

### 2. Current Loading Patterns

- **Individual Sections**: Each section (AuctionSection, BargainSection, etc.) has its own loading state
- **Page-Level**: Product detail pages have `loading.tsx` files that only show after navigation starts
- **Issue**: No immediate feedback on click, only after route transition begins

### 3. Component Architecture Issues

```typescript
// Current problematic code in marketplace/page.tsx
;<ShopClientContent
  categories={categories as string[]}
  products={allProducts}
  productsByCategory={productsByCategory}
/>

// But ShopClientContent accepts no props:
export function ShopClientContent() {
  // No props accepted
}
```

## Implementation Plan

### Phase 1: Fix Current Issues (Immediate)

#### 1.1 Fix TypeScript/Linter Errors

**Files to modify:**

- `src/app/marketplace/page.tsx`
- `src/features/marketplace-catalog/components/ShopClientContent.tsx`

**Changes:**

- Remove unused Category type
- Remove props being passed to ShopClientContent
- Clean up unnecessary prop drilling

#### 1.2 Create Enhanced Card Components with Loading States

**New components to create:**

- `src/components/ui/LoadingSpinner.tsx` (using provided spinner design)
- `src/features/marketplace-catalog/components/InteractiveProductCard.tsx`
- `src/features/auctions/components/InteractiveAuctionCard.tsx`

### Phase 2: Implement Click Loading Feedback (Priority)

#### 2.1 Loading Spinner Component

```typescript
// src/components/ui/LoadingSpinner.tsx
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

// Implementation using the provided spinner design:
// <div className="flex w-full flex-col items-center justify-center gap-4">
//   <div className="flex h-16 w-16 animate-spin items-center justify-center rounded-full border-4 border-transparent border-t-blue-400 text-4xl text-blue-400">
//     <div className="flex h-12 w-12 animate-spin items-center justify-center rounded-full border-4 border-transparent border-t-red-400 text-2xl text-red-400"></div>
//   </div>
// </div>
```

#### 2.2 Enhanced Product Card with Loading State

**Strategy:**

- Replace Link wrapper with clickable div
- Use `useRouter` with `useTransition` for navigation
- Show loading overlay during navigation
- Maintain all existing styling and functionality

**Key features:**

- Immediate visual feedback on click
- Loading overlay with spinner
- Disabled state during navigation
- Error handling for failed navigation

#### 2.3 Enhanced Auction Card with Loading State

**Same approach as ProductCard but for auctions:**

- Click → Show loading state → Navigate to auction detail page
- Consistent UX with product cards

### Phase 3: Navigation State Management (Advanced)

#### 3.1 Global Navigation Context

**New file:** `src/contexts/NavigationLoadingContext.tsx`

**Features:**

- Track navigation state across the app
- Prevent multiple simultaneous navigations
- Global loading indicator in header/layout
- Cancel navigation if user clicks elsewhere

#### 3.2 Route-Level Loading Improvements

**Files to enhance:**

- `src/app/marketplace/product/[id]/loading.tsx`
- `src/app/marketplace/auction/[id]/loading.tsx`

**Improvements:**

- Better skeleton matching actual page layout
- Faster loading transitions
- Progressive loading (show layout first, then content)

### Phase 4: Performance Optimizations (Future)

#### 4.1 Prefetching Strategy

- Implement intelligent prefetching on hover
- Preload critical product/auction data
- Image preloading for faster page loads

#### 4.2 Loading State Coordination

- Ensure no multiple loaders appear
- Smooth transitions between loading states
- Loading state priority management

## Technical Implementation Details

### 1. Enhanced ProductCard Implementation

```typescript
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner'

const InteractiveProductCard = ({
  product,
  className,
  darkMode,
}: ProductCardProps) => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    if (isLoading || isPending) return // Prevent double clicks

    setIsLoading(true)
    startTransition(() => {
      router.push(generateSlug(product))
    })
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        'block cursor-pointer relative',
        (isLoading || isPending) && 'pointer-events-none'
      )}
    >
      {/* Loading Overlay */}
      {(isLoading || isPending) && (
        <div className='absolute inset-0 bg-white/80 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center'>
          <LoadingSpinner size='md' />
        </div>
      )}

      {/* Existing card content */}
      <Card className={cn('...', (isLoading || isPending) && 'opacity-75')}>
        {/* ... existing content ... */}
      </Card>
    </div>
  )
}
```

### 2. Loading Spinner Variants

```typescript
// Different sizes for different use cases
const SPINNER_SIZES = {
  sm: 'h-8 w-8', // For small cards
  md: 'h-12 w-12', // For regular cards
  lg: 'h-16 w-16', // For large areas
}
```

### 3. Navigation Loading Context

```typescript
interface NavigationLoadingContextType {
  isNavigating: boolean
  navigate: (href: string) => void
  currentNavigation: string | null
}
```

## Error Prevention Strategies

### 1. Prevent Multiple Loaders

- Single source of truth for navigation state
- Loading state coordination between components
- Proper cleanup on navigation complete

### 2. Handle Navigation Failures

- Timeout handling for slow navigation
- Error states for failed navigation
- Fallback to direct navigation if needed

### 3. Performance Safeguards

- Debounce rapid clicks
- Cancel previous navigation if new one starts
- Memory leak prevention in useEffect cleanup

## Testing Strategy

### 1. User Experience Testing

- Click responsiveness testing
- Loading state visibility testing
- Multiple rapid clicks testing
- Navigation timeout scenarios

### 2. Performance Testing

- Loading state overhead measurement
- Navigation speed comparison
- Memory usage monitoring

### 3. Accessibility Testing

- Screen reader compatibility
- Keyboard navigation support
- Focus management during loading

## Implementation Timeline

### Immediate (Fix Critical Issues)

1. ✅ Fix TypeScript errors in marketplace page
2. ✅ Create LoadingSpinner component
3. ✅ Implement basic click loading for ProductCard

### Week 1 (Core Loading Features)

1. ✅ Enhanced ProductCard with loading states
2. ✅ Enhanced AuctionCard with loading states
3. ✅ Testing and refinement

### Week 2 (Advanced Features)

1. ✅ Global navigation context
2. ✅ Route-level loading improvements
3. ✅ Performance optimizations

### Future Enhancements

1. ✅ Intelligent prefetching
2. ✅ Advanced loading animations
3. ✅ Analytics for loading performance

## Success Criteria

### User Experience

- ✅ Immediate visual feedback on card click (< 100ms)
- ✅ No multiple loaders appearing simultaneously
- ✅ Smooth navigation transitions
- ✅ Clear loading states that don't interfere with content

### Technical

- ✅ Zero TypeScript/linter errors
- ✅ No memory leaks from loading states
- ✅ Consistent loading patterns across all card types
- ✅ Backward compatibility with existing functionality

### Performance

- ✅ Loading state overhead < 50ms
- ✅ Navigation speed maintained or improved
- ✅ No impact on initial page load

## Risk Mitigation

### 1. Breaking Changes

- Implement as additive changes first
- Feature flags for new loading behavior
- Gradual rollout strategy

### 2. Performance Impact

- Lazy load loading components
- Minimize re-renders during loading states
- Profile performance before/after

### 3. User Experience Degradation

- A/B testing for loading implementations
- User feedback collection
- Quick rollback plan if issues arise

## Files to Modify/Create

### New Files

- `src/components/ui/LoadingSpinner.tsx`
- `src/contexts/NavigationLoadingContext.tsx`
- `src/features/marketplace-catalog/components/InteractiveProductCard.tsx`
- `src/features/auctions/components/InteractiveAuctionCard.tsx`
- `src/hooks/useNavigationLoading.ts`

### Modified Files

- `src/app/marketplace/page.tsx` (fix linter errors)
- `src/features/marketplace-catalog/components/ShopClientContent.tsx`
- `src/features/marketplace-catalog/components/ProductCard.tsx`
- `src/features/auctions/components/AuctionCard.tsx`
- `src/app/marketplace/product/[id]/loading.tsx`
- `src/app/marketplace/auction/[id]/loading.tsx`

This plan ensures we address the immediate UX issue while laying the foundation for a robust, scalable loading system that prevents the multiple loader problem and provides consistent user feedback across the entire marketplace.
