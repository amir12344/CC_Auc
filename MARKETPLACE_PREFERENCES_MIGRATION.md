# Marketplace Preferences Migration Guide

## Overview

This guide documents the migration from a Redux-only marketplace preferences system to a hybrid approach using React Query for data fetching and caching, while maintaining Redux for UI state management.

## Migration Summary

### Before (Redux Only)
- All data fetching through Redux thunks
- Manual cache management with `clearPreferenceListings()`
- API calls on every page visit
- No intelligent caching based on preference values

### After (React Query + Redux)
- React Query for data fetching and caching
- Automatic cache invalidation
- Intelligent caching based on preference values
- Reduced API calls through smart caching
- Redux still used for UI state management

## Key Changes

### 1. New React Query Hook

**File**: `src/features/marketplace-catalog/hooks/useMarketplacePreferences.ts`

```typescript
// Before: Using Redux hook
import { usePreferenceSections } from '../hooks/usePreferenceSections';
const { sections, hasPreferences } = usePreferenceSections();

// After: Using React Query hook
import { useMarketplacePreferences } from '../hooks/useMarketplacePreferences';
const { listings, hasPreferences, isLoading } = useMarketplacePreferences();
```

### 2. Updated Components

#### ShopClientContent.tsx

```typescript
// Before
import { usePreferenceSections } from '../hooks/usePreferenceSections';

export function ShopClientContent() {
  const { sections, hasPreferences } = usePreferenceSections();
  // ...
}

// After
import { useMarketplacePreferences } from '../hooks/useMarketplacePreferences';
import { generateSectionsFromListings } from '../hooks/usePreferenceSections';

export function ShopClientContent() {
  const { listings, hasPreferences, isLoading } = useMarketplacePreferences();
  const preferences = useAppSelector(selectBuyerPreferences);
  
  const sections = preferences && listings.length > 0 
    ? generateSectionsFromListings(preferences, listings)
    : [];
  // ...
}
```

#### BuyerPreferencePopup.tsx

```typescript
// Added cache invalidation after successful save
import { useMarketplacePreferencesInvalidation } from '../../marketplace-catalog/hooks/useMarketplacePreferences';

export const BuyerPreferencePopup = ({ ... }) => {
  const { invalidateMarketplacePreferences } = useMarketplacePreferencesInvalidation();
  
  const handleComplete = useCallback(async () => {
    // ... save logic
    if (response.success) {
      // NEW: Invalidate marketplace cache
      await invalidateMarketplacePreferences();
      onComplete();
    }
  }, [preferences, onComplete, invalidateMarketplacePreferences]);
}
```

#### Preferences Page

```typescript
// Added React Query invalidation alongside existing Redux approach
import { useMarketplacePreferencesInvalidation } from '@/src/features/marketplace-catalog/hooks/useMarketplacePreferences';

export default function PreferencesPage() {
  const { invalidateMarketplacePreferences } = useMarketplacePreferencesInvalidation();
  
  const handleSavePreferences = useCallback(async () => {
    // ... save logic
    
    // Existing Redux approach (kept for compatibility)
    dispatch(clearPreferenceListings());
    
    // NEW: React Query invalidation
    await invalidateMarketplacePreferences();
  }, [preferences, dispatch, invalidateMarketplacePreferences]);
}
```

## Benefits Achieved

### 1. Reduced API Calls

**Before**: API called on every marketplace visit
```
User visits marketplace → Always fetch preferences → Always fetch listings
```

**After**: API called only when preferences change
```
User visits marketplace → Check cache → Return cached data (if valid)
User changes preferences → Invalidate cache → Fetch fresh data
```

### 2. Intelligent Caching

**Cache Key Strategy**:
```typescript
['marketplace-preferences', userId, preferencesHash]
```

- Different users have separate caches
- Cache invalidated only when preferences actually change
- Array order doesn't affect cache (sorted arrays)

### 3. Better Performance

- **Stale Time**: 5 minutes - data stays fresh
- **Cache Time**: 10 minutes - cache retention
- **No Refetch**: On window focus or component mount
- **Background Updates**: Fresh data loads while showing cached data

### 4. Automatic Cache Management

- Cache invalidated automatically when preferences change
- No manual cache management required
- Consistent behavior across all preference update points

## Implementation Details

### Cache Invalidation Points

1. **BuyerPreferencePopup**: After new user sets initial preferences
2. **Preferences Page**: After user updates existing preferences
3. **Future**: Any other preference modification points

### Error Handling

```typescript
const { listings, isLoading, isError, error } = useMarketplacePreferences();

if (isError) {
  return <ErrorMessage error={error} />;
}

if (isLoading) {
  return <LoadingSpinner />;
}
```

### Loading States

```typescript
{isLoading ? (
  <div className="flex justify-center py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
) : (
  sections.map((section, index) => (
    <PreferenceSection key={`${section.type}-${index}`} {...section} />
  ))
)}
```

## Testing Strategy

### Unit Tests

- Test cache key generation
- Test hook behavior with/without preferences
- Test error handling
- Test invalidation logic

### Integration Tests

- Test full user flow: visit marketplace → change preferences → see updated listings
- Test cache behavior across page navigations
- Test error scenarios

### Performance Tests

- Measure API call reduction
- Test cache hit rates
- Monitor loading times

## Rollback Plan

If issues arise, the system can be rolled back by:

1. **Reverting ShopClientContent.tsx** to use `usePreferenceSections`
2. **Removing React Query imports** from preference components
3. **Keeping Redux approach** as the primary system

The dual approach (Redux + React Query) ensures compatibility during transition.

## Monitoring and Metrics

### Key Metrics to Track

1. **API Call Frequency**: Should decrease significantly
2. **Cache Hit Rate**: Should be high (>80%)
3. **Page Load Times**: Should improve
4. **User Experience**: Faster marketplace loading

### Debug Tools

1. **React Query DevTools**: Monitor cache status
2. **Network Tab**: Track API call patterns
3. **Console Logs**: Debug cache key generation

## Future Enhancements

### Phase 2: Complete Migration
- Remove Redux preference listings slice
- Migrate all preference-related data fetching to React Query
- Implement optimistic updates

### Phase 3: Advanced Features
- Background sync
- Offline support
- Prefetching based on user behavior
- Analytics and performance monitoring

## Troubleshooting

### Common Issues

1. **Stale Data After Preference Changes**
   - Check if `invalidateMarketplacePreferences()` is called
   - Verify cache key generation
   - Check React Query provider setup

2. **Excessive API Calls**
   - Verify cache configuration
   - Check preference serialization
   - Monitor cache key stability

3. **Loading States Not Working**
   - Check React Query hook usage
   - Verify loading state handling in components
   - Test error scenarios

### Debug Steps

1. **Check React Query DevTools**
2. **Monitor Network Tab**
3. **Add console logs for cache keys**
4. **Test with different user scenarios**

## Conclusion

This migration provides:
- **Better Performance**: Reduced API calls and faster loading
- **Better UX**: Immediate updates when preferences change
- **Better Maintainability**: Cleaner separation of concerns
- **Better Scalability**: Intelligent caching for growing user base

The hybrid approach ensures a smooth transition while maintaining all existing functionality.