# Dynamic Catalog Section Implementation Plan

## 🎯 **Objective**

Implement a dynamic catalog listing system that displays personalized content sections based on user preferences (listing types and selling platforms) while maintaining the DRY principle and following Next.js 15.3 best practices.

## 📋 **Current State Analysis**

### Existing Infrastructure ✅

- **Buyer Preferences System**: Complete with 15-step onboarding flow
- **AuctionSection Component**: Pattern for dynamic API-driven sections
- **ProductSection Component**: Reusable layout component for carousels
- **API Integration**: Working queryData function for Amplify backend
- **Type Definitions**: BuyerPreferences, Product interfaces exist
- **Error Boundaries**: Comprehensive error handling architecture

### User Preferences Structure (Existing)

```typescript
// From src/features/buyer-preferences/types/preferences.ts
interface BuyerPreferences {
  preferredTypes: ('auction' | 'catalog')[]
  sellingPlatforms: {
    discountRetail: boolean
    stockX: boolean
    amazonWalmart: boolean
    liveMarketplaces: boolean
    resellerMarketplaces: boolean
    offPriceRetail: boolean
    export: boolean
    refurbisher: boolean
  }
  categories: string[]
  brands: string[]
  // ... other preferences
}
```

### API Response Structure (From User)

```typescript
// Sample fields from actual API response:
{
  id: string,
  seller_id: string,
  organization_id: string,
  title: string,
  description: string,
  category: "BEAUTY_GROOMING_WELLNESS",
  subcategory: "COSMETICS",
  sub_subcategory: "BEAUTY_TOOLS_BRUSHES_MIRRORS_TWEEZERS",
  status: "ACTIVE",
  image_url: string,
  lead_time_days: number,
  price: number,
  listing_type_id: string,
  is_featured: boolean,
  created_at: string
}
```

## 🏗️ **Architecture Design**

### 1. **Dynamic Section Orchestrator**

Create a centralized component that manages section display logic based on preferences:

```
DynamicSectionOrchestrator
├── PreferenceBasedSectionRenderer
├── CatalogSection (New)
├── AuctionSection (Existing)
└── SectionConfigManager
```

### 2. **Section Priority System**

Based on user requirements:

- **First Section**: Top 3 selling platforms (Step#2 categories)
- **Second Section**: Primary listing type (Step#1 preference)
- **Third Section**: Secondary listing type (conditional)

### 3. **Section Configuration Schema**

```typescript
interface SectionConfig {
  id: string
  type: 'catalog' | 'auction'
  title: string
  priority: number
  filterCriteria: {
    sellingPlatforms?: string[]
    categories?: string[]
    listingType?: string
  }
  isVisible: boolean
  maxItems?: number
}
```

## 🔧 **Implementation Strategy**

### Phase 1: Core Infrastructure (Week 1)

#### 1.1 New Type Definitions

**File**: `src/features/marketplace-catalog/types/catalog.ts`

```typescript
// Catalog listing interface based on API response
interface CatalogListing {
  id: string
  seller_id: string
  organization_id: string
  title: string
  description: string
  category: string
  subcategory?: string
  sub_subcategory?: string
  status: 'ACTIVE' | 'INACTIVE'
  image_url: string
  lead_time_days: number
  price: number
  listing_type_id: string
  is_featured: boolean
  created_at: string
  // Additional computed fields
  formatted_price: string
  category_display_name: string
}

// Section configuration for dynamic rendering
interface SectionConfiguration {
  sections: SectionConfig[]
  userPreferences: BuyerPreferences
  lastUpdated: Date
}
```

#### 1.2 API Service Layer

**File**: `src/features/marketplace-catalog/services/catalogQueryService.ts`

```typescript
// Similar to auctionQueryService.ts pattern
export const fetchCatalogListings = async (filters?: CatalogFilters): Promise<CatalogListing[]>
export const transformApiResponseToCatalogListing = (apiData: any): CatalogListing
export const getCatalogImagePlaceholder = (): string
export const formatCatalogPrice = (price: number): string
```

#### 1.3 Section Configuration Manager

**File**: `src/features/marketplace-catalog/services/sectionConfigService.ts`

```typescript
export const generateSectionConfiguration = (preferences: BuyerPreferences): SectionConfiguration
export const determineSectionPriority = (preferences: BuyerPreferences): SectionConfig[]
export const shouldShowSection = (section: SectionConfig, preferences: BuyerPreferences): boolean
```

### Phase 2: Component Development (Week 2)

#### 2.1 Catalog Section Component

**File**: `src/features/marketplace-catalog/components/CatalogSection.tsx`

```typescript
// Follow AuctionSection.tsx pattern exactly
const CatalogSection = memo(
  ({ filters, title, viewAllLink }: CatalogSectionProps) => {
    const [catalogList, setCatalogList] = useState<CatalogListing[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Similar fetch pattern as AuctionSection
    const fetchCatalogData = useCallback(async () => {
      // API call logic
    }, [filters])

    // Same loading, error, empty states as AuctionSection
    // Return ProductSection wrapper with CatalogCard components
  }
)
```

#### 2.2 Catalog Card Component

**File**: `src/features/marketplace-catalog/components/CatalogCard.tsx`

```typescript
// Similar to AuctionCard.tsx but for catalog items
const CatalogCard = memo(({ catalog, className }: CatalogCardProps) => {
  // Image processing (Google Drive URL handling)
  // Price formatting
  // Category display
  // Lead time display
  // Link to catalog detail page
})
```

#### 2.3 Dynamic Section Orchestrator

**File**: `src/features/marketplace-catalog/components/DynamicSectionOrchestrator.tsx`

```typescript
interface DynamicSectionOrchestratorProps {
  userPreferences: BuyerPreferences
}

const DynamicSectionOrchestrator = ({
  userPreferences,
}: DynamicSectionOrchestratorProps) => {
  const sectionConfigs = useMemo(
    () => generateSectionConfiguration(userPreferences),
    [userPreferences]
  )

  return (
    <>
      {sectionConfigs.sections
        .filter((section) => section.isVisible)
        .sort((a, b) => a.priority - b.priority)
        .map((section) => (
          <SectionRenderer key={section.id} config={section} />
        ))}
    </>
  )
}
```

### Phase 3: Integration & Logic (Week 3)

#### 3.1 Section Priority Logic Implementation

Based on user requirements:

```typescript
// Priority calculation algorithm
const calculateSectionPriority = (
  preferences: BuyerPreferences
): SectionConfig[] => {
  const sections: SectionConfig[] = []

  // First Section: Top 3 selling platforms
  const activePlatforms = Object.entries(preferences.sellingPlatforms)
    .filter(([_, active]) => active)
    .slice(0, 3)
    .map(([platform, _]) => platform)

  if (activePlatforms.length > 0) {
    sections.push({
      id: 'selling-platforms-catalog',
      type: 'catalog',
      title: `Popular in ${formatPlatformNames(activePlatforms)}`,
      priority: 1,
      filterCriteria: { sellingPlatforms: activePlatforms },
      isVisible: true,
    })
  }

  // Second Section: Primary listing type
  if (preferences.preferredTypes.includes('catalog')) {
    sections.push({
      id: 'preferred-catalog',
      type: 'catalog',
      title: 'Catalog Listings for You',
      priority: 2,
      filterCriteria: { listingType: 'catalog' },
      isVisible: true,
    })
  }

  // Third Section: Secondary listing type (conditional)
  if (
    preferences.preferredTypes.includes('auction') &&
    preferences.preferredTypes.includes('catalog')
  ) {
    sections.push({
      id: 'alternative-auctions',
      type: 'auction',
      title: 'Live Auctions',
      priority: 3,
      filterCriteria: { listingType: 'auction' },
      isVisible: true,
    })
  }

  return sections
}
```

#### 3.2 ShopClientContent Integration

**File**: `src/features/marketplace-catalog/components/ShopClientContent.tsx`

```typescript
// Remove unused props to fix linter errors
// Add user preference fetching
// Replace static sections with DynamicSectionOrchestrator

export function ShopClientContent() {
  const { userPreferences } = useUserPreferences() // Hook to get preferences

  return (
    <div ref={contentAreaRef}>
      <ErrorBoundary>
        <BargainSection />

        {/* Dynamic sections based on preferences */}
        <DynamicSectionOrchestrator userPreferences={userPreferences} />

        {/* Static sections */}
        <FeaturedSection />
        <TrendingSection />
        <FeaturedBrands />

        {/* Category sections */}
        <CategorySection
          category='Beauty'
          layout='carousel'
          title='Beauty & Personal Care'
          variant='light'
        />
        <CategorySection
          category='Home'
          layout='carousel'
          title='Featured Inventory'
          variant='light'
        />
      </ErrorBoundary>
    </div>
  )
}
```

### Phase 4: Performance & UX Optimization (Week 4)

#### 4.1 Performance Optimizations

- **React.memo** for all catalog components
- **useMemo** for section configuration calculations
- **useCallback** for API fetch functions
- **Lazy loading** for section components
- **Image optimization** with Next.js Image component

#### 4.2 Caching Strategy

```typescript
// Similar to auction caching
const useCatalogData = (filters: CatalogFilters) => {
  return useQuery({
    queryKey: ['catalog-listings', filters],
    queryFn: () => fetchCatalogListings(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  })
}
```

#### 4.3 Error Handling & Loading States

- Individual ErrorBoundary for each section
- Skeleton loading states matching ProductCardSkeleton
- Graceful degradation when API fails
- Empty state handling with user-friendly messages

## 🔗 **Integration Points**

### 1. **User Preference Hook**

```typescript
// File: src/features/buyer-preferences/hooks/useUserPreferences.ts
export const useUserPreferences = () => {
  const preferences = useSelector(selectBuyerPreferences)
  const isLoading = useSelector(selectPreferencesLoading)

  return { userPreferences: preferences, isLoading }
}
```

### 2. **API Endpoint Mapping**

```typescript
// Catalog API endpoint similar to auction
const CATALOG_QUERY = `
  query GetCatalogListings($filters: CatalogFiltersInput) {
    catalog_listings(filters: $filters) {
      id
      title
      description
      category
      subcategory
      image_url
      price
      lead_time_days
      status
      is_featured
      created_at
    }
  }
`
```

### 3. **Redux Integration**

```typescript
// If needed for global state
interface CatalogState {
  listings: CatalogListing[]
  loading: boolean
  error: string | null
  filters: CatalogFilters
}
```

## 📈 **Scalability Considerations**

### 1. **Configuration-Driven Sections**

- JSON-based section configuration
- A/B testing capability for different section layouts
- Admin dashboard for section management

### 2. **Modular Section Types**

```typescript
type SectionType = 'catalog' | 'auction' | 'featured' | 'trending' | 'category'

interface SectionRegistry {
  [key: string]: React.ComponentType<SectionProps>
}

const SECTION_COMPONENTS: SectionRegistry = {
  catalog: CatalogSection,
  auction: AuctionSection,
  featured: FeaturedSection,
  trending: TrendingSection,
  category: CategorySection,
}
```

### 3. **Advanced Filtering**

- Machine learning-based recommendations
- Real-time inventory updates
- Personalized pricing tiers
- Geographic targeting

## 🧪 **Testing Strategy**

### 1. **Unit Tests**

- Section configuration generation logic
- API response transformation
- Component rendering with different props

### 2. **Integration Tests**

- User preference changes triggering section updates
- API error handling
- Performance benchmarks

### 3. **E2E Tests**

- Complete user journey from preference setting to section display
- Mobile responsiveness
- Loading states and error scenarios

## 📦 **Deliverables**

### Week 1: Foundation

- [ ] New type definitions (catalog.ts)
- [ ] API service layer (catalogQueryService.ts)
- [ ] Section configuration service (sectionConfigService.ts)

### Week 2: Components

- [ ] CatalogSection component
- [ ] CatalogCard component
- [ ] DynamicSectionOrchestrator component

### Week 3: Integration

- [ ] ShopClientContent integration
- [ ] User preference integration
- [ ] Section priority logic implementation

### Week 4: Polish

- [ ] Performance optimizations
- [ ] Error handling & loading states
- [ ] Testing & documentation

## 🚀 **Success Metrics**

1. **Performance**: Page load time < 2s
2. **User Engagement**: Section click-through rates
3. **Code Quality**: 0 TypeScript errors, >90% test coverage
4. **Maintainability**: DRY principle compliance
5. **Scalability**: Easy addition of new section types

## 🔄 **Future Enhancements**

1. **Real-time Updates**: WebSocket integration for live inventory
2. **Advanced Personalization**: ML-based recommendations
3. **A/B Testing**: Section layout experimentation
4. **Analytics**: Detailed section performance tracking
5. **Admin Dashboard**: Non-technical section management

---

**Note**: This plan follows the existing codebase patterns, reuses existing infrastructure, and maintains consistency with the current architecture while providing a scalable foundation for future growth.
