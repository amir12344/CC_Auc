# Buyer Preference-Based Marketplace System - Complete Technical Documentation

## Overview

This document provides a comprehensive breakdown of the buyer preference-based dynamic marketplace system, explaining every component, data flow, and interaction in detail.

## 🎯 System Architecture

### High-Level Flow
```
User Loads Marketplace → Redux State Check → Preference Fetch → Listing Fetch → Section Generation → UI Rendering
```

## 📊 Data Flow Diagram

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Browser   │    │  React Hook      │    │   Redux Store   │    │   AWS Backend   │
│                 │    │  usePreference   │    │                 │    │                 │
│  ShopClient     │───▶│  Sections        │───▶│  buyerPrefs     │───▶│  API Gateway    │
│  Content        │    │                  │    │  preference     │    │  → Lambda       │
│                 │    │                  │    │  Listings       │    │  → Prisma       │
└─────────────────┘    └──────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔍 Detailed Component Breakdown

### 1. Entry Point: ShopClientContent

**File**: `src/features/marketplace-catalog/components/ShopClientContent.tsx`

**Responsibilities**:
- Acts as the main marketplace container
- Conditionally renders auction sections based on user preferences
- Manages the overall layout flow

**Decision Logic**:
```typescript
// Conditional rendering flow
if (!hasPreferences) {
    // Show default AuctionSection (fetches all live auctions)
    <AuctionSection />
} else {
    // Show preference-based sections only
    // Auctions may appear in "Live Auctions For You" section
}

// Always show at bottom
<AllCatalogListingsInfiniteSection />
```

### 2. State Management Hook: usePreferenceSections

**File**: `src/features/marketplace-catalog/hooks/usePreferenceSections.ts`

**Complete Flow**:

#### 2.1 Initial State Check
```typescript
// On component mount
useEffect(() => {
    if (preferencesStatus === 'idle') {
        dispatch(fetchBuyerPreferences()); // ← First API call
    }
}, [dispatch, preferencesStatus]);
```

#### 2.2 Preference Detection
```typescript
const hasPreferences = useAppSelector(selectBuyerPreferencesIsSet);
// Returns true if user has ANY preferences set (categories, segments, etc.)
```

#### 2.3 Conditional Listing Fetch
```typescript
useEffect(() => {
    if (preferences && hasPreferences && preferencesStatus === 'succeeded') {
        dispatch(fetchPreferenceListings(preferences)); // ← Second API call
    }
}, [dispatch, preferences, hasPreferences, preferencesStatus]);
```

#### 2.4 Section Generation
```typescript
// After listings load, generate sections
useEffect(() => {
    if (preferences && listings.length > 0) {
        const generatedSections = generateSectionsFromListings(preferences, listings);
        setSections(generatedSections);
    }
}, [preferences, listings]);
```

### 3. Redux Store Architecture

#### 3.1 Buyer Preferences Slice
**File**: `src/features/buyer-preferences/store/buyerPreferencesSlice.ts`

**State Structure**:
```typescript
{
    data: {
        preferredCategories: string[],
        preferredSubcategories: string[],
        buyerSegments: string[],
        listingTypes: string[]
    } | null,
    status: 'idle' | 'loading' | 'succeeded' | 'failed',
    isSet: boolean, // ← Key flag for preference detection
    error: string | null
}
```

**Selectors**:
- `selectBuyerPreferences`: Returns actual preference data
- `selectBuyerPreferencesStatus`: Returns loading state
- `selectBuyerPreferencesIsSet`: Returns boolean if user has any preferences

#### 3.2 Preference Listings Slice
**File**: `src/features/marketplace-catalog/store/preferenceListingsSlice.ts`

**State Structure**:
```typescript
{
    listings: CombinedListing[],
    status: 'idle' | 'loading' | 'succeeded' | 'failed',
    error: string | null
}
```

### 4. Data Services

#### 4.1 Catalog Preference Query Service
**File**: `src/features/marketplace-catalog/services/catalogPreferenceQueryService.ts`

**API Flow**:
1. **Input**: User preferences object
2. **Processing**: 
   - Filters catalog listings by preferences
   - Fetches auction listings (no preference filtering)
   - Combines results into unified format
3. **Output**: `CombinedListing[]` with both catalog and auction items

**Data Transformation**:
```typescript
// CombinedListing → CatalogListing transformation
const transformCombinedListingToCatalogListing = async (listing: CombinedListing) => {
    // 1. Process images via AWS S3
    const processedImages = await Promise.all(
        listing.images.map(img => getImageUrl(img.s3_key))
    );
    
    // 2. Map to CatalogListing format
    return {
        id: listing.public_id,
        title: listing.title,
        image_url: processedImages[0] || '',
        category: listing.category,
        subcategory: listing.subcategory ?? null,
        // ... other mappings
    };
};
```

#### 4.2 Preference Section Service
**File**: `src/features/marketplace-catalog/services/preferenceSectionService.ts`

**Section Generation Logic**:

```typescript
function generatePreferenceSections(preferences, listings) {
    const sections = [];
    
    // 1. Buyer Segment Section
    if (preferences.buyerSegments?.length > 0) {
        sections.push({
            title: "{BuyerSegment} Picks",
            listings: filteredBySegment,
            type: 'buyerSegment',
            viewAllLink: '/collections/segment/{segment}'
        });
    }
    
    // 2. Auction Section
    if (listings.some(l => l.listing_source === 'auction')) {
        sections.push({
            title: "Live Auctions For You",
            listings: auctionListings,
            type: 'auction',
            viewAllLink: '/collections/auctions'
        });
    }
    
    // 3. Catalog Picks
    if (catalogListings.length > 0) {
        sections.push({
            title: "Catalog Picks",
            listings: catalogListings,
            type: 'catalog',
            viewAllLink: '/collections/catalog'
        });
    }
    
    // 4. Category Sections (up to 3)
    preferences.preferredCategories?.slice(0, 3).forEach(category => {
        sections.push({
            title: "{Category} For You",
            listings: listingsByCategory,
            type: 'category',
            viewAllLink: '/collections/category/{category}'
        });
    });
    
    // 5. Subcategory Sections (up to 2)
    preferences.preferredSubcategories?.slice(0, 2).forEach(subcategory => {
        sections.push({
            title: "{Subcategory} Collection",
            listings: listingsBySubcategory,
            type: 'subcategory',
            viewAllLink: '/collections/subcategory/{subcategory}'
        });
    });
    
    return sections;
}
```

### 5. UI Components

#### 5.1 PreferenceSection Component
**File**: `src/features/marketplace-catalog/components/sections/PreferenceSection.tsx`

**Rendering Flow**:
1. **Loading State**: Shows skeleton placeholders
2. **Error State**: Shows error message with retry option
3. **Data State**: Renders actual listings
4. **Auction Handling**: Special URL routing for auction items

**Auction URL Handling**:
```typescript
// For auction listings
const isAuctionListing = listings[index]?.listing_source === 'auction';
if (isAuctionListing) {
    // Override CatalogCard's default catalog URL
    // Route to: /marketplace/auction/{public_id}
    return (
        <div className="relative">
            <CatalogCard listing={listing} />
            <Link href={`/marketplace/auction/${originalPublicId}`} />
        </div>
    );
}
```

#### 5.2 AllCatalogListingsInfiniteSection
**File**: `src/features/marketplace-catalog/components/sections/AllCatalogListingsInfiniteSection.tsx`

**Features**:
- Infinite scroll for all catalog listings
- Grid layout (2 columns mobile → 4 columns desktop)
- Load more button
- Loading, error, and empty states
- Always visible at bottom of marketplace

### 6. Image Processing Flow

```
S3 Key (from DB) → AWS Amplify Storage.getUrl() → Public URL → Next.js Image Component
```

**Service**: `getImageUrl()` in `catalogQueryService.ts`
- Handles S3 → public URL conversion
- Provides fallback for missing images
- Optimizes for Next.js Image component

## 🔄 Complete Data Flow Example

### Scenario 1: New User (No Preferences)

1. **User loads marketplace**
2. **ShopClientContent mounts**
3. **usePreferenceSections hook initializes**
4. **Redux state check**: `hasPreferences = false`
5. **API call**: `fetchBuyerPreferences()` → Returns `null`
6. **Conditional rendering**: Shows default `AuctionSection`
7. **Shows**: Default live auctions + All catalog listings

### Scenario 2: User with Preferences

1. **User loads marketplace**
2. **ShopClientContent mounts**
3. **usePreferenceSections hook initializes**
4. **Redux state check**: `hasPreferences = true`
5. **API call**: `fetchBuyerPreferences()` → Returns preferences object
6. **API call**: `fetchPreferenceListings(preferences)` → Returns filtered listings
7. **Section generation**: Creates 5 dynamic sections
8. **Shows**: Personalized sections + All catalog listings

**Example sections for user who likes Electronics and Fashion**:
```
┌─────────────────────────────────────────┐
│ Tech Enthusiast Picks                   │ ← Buyer segment section
├─────────────────────────────────────────┤
│ Live Auctions For You                   │ ← Auction section (if any)  
├─────────────────────────────────────────┤
│ Catalog Picks                           │ ← Catalog recommendations
├─────────────────────────────────────────┤
│ Electronics For You                     │ ← Category section
├─────────────────────────────────────────┤
│ Fashion For You                         │ ← Category section
├─────────────────────────────────────────┤
│ Smartphone Collection                   │ ← Subcategory section
├─────────────────────────────────────────┤
│ All Catalog Listings [Load More]        │ ← Infinite scroll fallback
└─────────────────────────────────────────┘
```

## 🚨 Error Handling & Edge Cases

### 1. API Failures
- **Preferences API fails**: Shows default AuctionSection
- **Listings API fails**: Shows error state in sections
- **Image processing fails**: Shows placeholder images

### 2. Empty States
- **No preferences**: Shows default content
- **No listings for preferences**: Shows empty state messages
- **No images**: Shows placeholder graphics

### 3. Performance Optimizations
- **Redux caching**: Preferences cached for 30 minutes
- **React Query**: Listings cached for 5 minutes
- **Image optimization**: Next.js Image component with lazy loading
- **Memoization**: All components memoized to prevent re-renders

## 📱 Responsive Design

### Mobile (< 768px)
- 2-column grid for listings
- Single column for sections
- Touch-friendly interactions

### Tablet (768px - 1024px)
- 3-column grid for listings
- Maintains carousel for sections

### Desktop (> 1024px)
- 4-column grid for listings
- Full-width sections with carousels

## 🔧 Development Setup

### Environment Variables Required
```bash
# AWS Configuration
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_AWS_COGNITO_IDENTITY_POOL_ID=...
NEXT_PUBLIC_AWS_USER_POOLS_ID=...
NEXT_PUBLIC_AWS_USER_POOLS_WEB_CLIENT_ID=...

# API Configuration
NEXT_PUBLIC_API_URL=...
```

### Testing Commands
```bash
# Run development server
npm run dev

# Run type checking
npm run type-check

# Run tests
npm test
```

## 🎯 Next Steps & Future Enhancements

1. **A/B Testing**: Test different section layouts
2. **Personalization**: Add ML-based recommendations
3. **Performance**: Implement virtual scrolling for large datasets
4. **Analytics**: Track section engagement metrics
5. **Real-time**: Add WebSocket updates for live auctions

## 📞 Support & Debugging

### Common Issues
1. **Images not loading**: Check AWS S3 permissions
2. **Sections not appearing**: Verify Redux state in DevTools
3. **API errors**: Check network tab for failed requests
4. **Type errors**: Ensure all imports are correct

### Debug Tools
- **Redux DevTools**: Inspect state changes
- **React DevTools**: Component tree inspection
- **Network Tab**: API request/response monitoring
- **Console**: Error messages and logs

---

**Last Updated**: July 24, 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready
