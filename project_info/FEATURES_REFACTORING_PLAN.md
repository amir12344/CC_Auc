# Commerce Central Features Directory Refactoring Plan

## Project Flow Documentation (CRITICAL CONTEXT)

### 🚨 IMPORTANT DISTINCTION:
**Website vs Marketplace Separation**
- **Website Pages** (`/website/*`): Marketing pages (buyer info, seller info, early access, podcasts, blogs, team)
- **Marketplace App** (`/marketplace/*`): Actual platform where buyers/sellers transact

### User Journey Flow:
1. **Marketing Website**: User visits website pages (buyer/seller marketing pages)
2. **Marketplace Entry**: User clicks to enter marketplace platform
3. **Product Discovery**: Landing page shows product sections (Amazon listings, categories)
4. **Product Details**: User clicks product → detailed product page with buy/bid buttons
5. **Authentication Gate**: Unauthenticated users see disabled buttons → forced to login/signup
6. **Role Validation**: Only BUYERS can access marketplace. Sellers redirected to seller dashboard
7. **Signup Flow**: signup form → email authentication → certificate upload → dashboard/redirect

## Current Problems Analysis

### 1. **CRITICAL STRUCTURAL VIOLATIONS**

#### Auth Feature - COMPLETELY BROKEN
```
❌ Current Mess:
src/features/auth/
├── authSelectors.ts         # Store logic at root
├── authSlice.ts            # Store logic at root
└── authSlice.tsZone.Identifier  # Junk file

✅ 2025 Best Practice:
src/features/auth/
├── components/
│   ├── LoginForm.tsx
│   ├── SignupForm.tsx
│   ├── UserTypeSelector.tsx
│   └── CertificateUpload.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useAuthRedirect.ts
│   └── useEmailVerification.ts
├── services/
│   ├── authAPI.ts
│   └── certificateService.ts
├── store/
│   ├── authSlice.ts
│   └── authSelectors.ts
├── types/
│   └── index.ts
└── index.ts
```

#### Build-Offer Feature - NAMING & STRUCTURE DISASTER
```
❌ Current Issues:
1. Poor naming: "build-offer" vs business domain
2. Components mixed with business logic
3. No proper separation of concerns

✅ Should be renamed to: "offer-management"
```

#### Buyer Feature - MIXED RESPONSIBILITIES
```
❌ Current Confusion:
- Contains both dashboard AND messaging
- Deep nesting in messages/
- No clear domain boundaries

✅ Should be split into:
- buyer-dashboard
- messaging
```

### 2. **MISSING FEATURES** (Based on Project Flow)
- No `marketplace` feature (for product discovery)
- No `authentication-flow` feature (email verification, certificate upload)
- No `product-catalog` feature (for shop/home consolidation)

### 3. **NAMING CONVENTION VIOLATIONS**

According to [Next.js 15 2025 best practices](https://nextjs.org/docs/app/getting-started/project-structure) and [scalable architecture patterns](https://dev.to/bajrayejoon/best-practices-for-organizing-your-nextjs-15-2025-53ji):

#### ❌ Poor Naming:
- `build-offer` → Should be `offer-management`
- `buyer` → Too generic, should be `buyer-dashboard`
- Mixed website/marketplace concerns

#### ✅ Proper Naming (2025 Standards):
- Use kebab-case for folder names
- Use domain-driven naming (business focused)
- Clear separation of concerns

## Comprehensive New Structure (ALL FEATURES COVERED)

```
src/features/
├── authentication/                 # User auth domain
│   ├── components/
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   ├── UserTypeSelector.tsx
│   │   ├── EmailVerification.tsx
│   │   └── CertificateUpload.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useEmailVerification.ts
│   │   └── useAuthRedirect.ts
│   ├── services/
│   │   ├── authAPI.ts
│   │   └── certificateService.ts
│   ├── store/
│   │   ├── authSlice.ts
│   │   └── authSelectors.ts
│   ├── types/
│   │   └── index.ts
│   └── index.ts
│
├── marketplace-catalog/            # Product discovery & browsing
│   ├── components/
│   │   ├── ProductGrid.tsx         # From shop
│   │   ├── CategoryFilter.tsx      # From shop
│   │   ├── ProductCard.tsx         # From product
│   │   ├── FeaturedSection.tsx     # From home
│   │   └── BargainSection.tsx      # From shop/sections
│   ├── hooks/
│   │   ├── useProducts.ts
│   │   ├── useProductSearch.ts
│   │   └── useCategories.ts
│   ├── services/
│   │   └── catalogAPI.ts
│   ├── store/
│   │   ├── catalogSlice.ts
│   │   └── productSlice.ts
│   ├── types/
│   │   └── index.ts
│   └── index.ts
│
├── product-details/                # Individual product pages
│   ├── components/
│   │   ├── ProductGallery.tsx
│   │   ├── ProductInfo.tsx
│   │   ├── ProductVariants.tsx
│   │   ├── BidForm.tsx
│   │   ├── BuyButton.tsx
│   │   └── ProductMetadata.tsx
│   ├── hooks/
│   │   ├── useProductDetails.ts
│   │   └── useProductVariants.ts
│   ├── services/
│   │   └── productAPI.ts
│   ├── types/
│   │   └── index.ts
│   └── index.ts
│
├── offer-management/               # Offer building & management
│   ├── components/
│   │   ├── BuildOfferModal.tsx
│   │   ├── OfferFooterBar.tsx
│   │   ├── OfferSummarySheet.tsx
│   │   └── VariantSelector.tsx
│   ├── hooks/
│   │   ├── useOfferBuilder.ts
│   │   ├── useOfferCart.ts
│   │   └── useCartPersistence.ts   # Renamed from loadCartState
│   ├── services/
│   │   └── offerAPI.ts
│   ├── store/
│   │   ├── offerSlice.ts
│   │   └── offerCartSlice.ts
│   ├── types/
│   │   └── index.ts
│   └── index.ts
│
├── buyer-dashboard/                # Buyer app interface
│   ├── components/
│   │   ├── DashboardOverview.tsx
│   │   ├── AllDeals.tsx
│   │   ├── Offers.tsx
│   │   ├── Orders.tsx
│   │   └── navigation/
│   │       ├── AppSidebar.tsx
│   │       ├── NavMain.tsx
│   │       └── SiteHeader.tsx
│   ├── hooks/
│   │   ├── useDashboardData.ts
│   │   └── useDealsFilters.ts
│   ├── services/
│   │   └── dashboardAPI.ts
│   ├── store/
│   │   └── dashboardSlice.ts
│   ├── types/
│   │   └── index.ts
│   └── index.ts
│
├── messaging/                      # Communication system
│   ├── components/
│   │   ├── MailList.tsx
│   │   ├── MailDisplay.tsx
│   │   ├── MessageComposer.tsx
│   │   ├── AccountSwitcher.tsx
│   │   └── Navigation.tsx
│   ├── hooks/
│   │   ├── useMail.ts
│   │   └── useMessages.ts
│   ├── services/
│   │   └── messagingAPI.ts
│   ├── store/
│   │   └── messageSlice.ts
│   ├── types/
│   │   └── index.ts
│   └── index.ts
│
├── website-marketing/              # Marketing website (RENAMED for clarity)
│   ├── components/
│   │   ├── sections/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── BuyersFeaturesSection.tsx
│   │   │   ├── SellersFeaturesSection.tsx
│   │   │   ├── TestimonialsSection.tsx
│   │   │   └── TeamSection.tsx
│   │   ├── blog/
│   │   │   ├── BlogHeroSection.tsx
│   │   │   ├── BlogPostsSection.tsx
│   │   │   └── BlogPostDetailContent.tsx
│   │   ├── podcast/
│   │   │   ├── PodcastHeroSection.tsx
│   │   │   ├── PodcastEpisodesSection.tsx
│   │   │   └── PodcastDetailContent.tsx
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   └── ui/
│   │       └── Logo.tsx
│   ├── hooks/
│   │   ├── useMediaQuery.ts
│   │   ├── useScrollPosition.ts
│   │   └── useLocalStorage.ts
│   ├── data/
│   │   └── navigation.ts
│   ├── types/
│   │   ├── index.ts
│   │   └── components.ts
│   └── index.ts
│
├── early-access/                   # Early access system
│   ├── components/
│   │   ├── EarlyAccessForm.tsx
│   │   └── ThankYouPage.tsx
│   ├── hooks/
│   │   └── useEarlyAccess.ts
│   ├── services/
│   │   └── earlyAccessAPI.ts
│   ├── types/
│   │   └── index.ts
│   └── index.ts
│
└── seller-portal/                  # Seller functionality (future)
    ├── components/
    ├── hooks/
    ├── services/
    ├── store/
    ├── types/
    └── index.ts
```

## Files That Should Move to Shared

Based on [Next.js 15 best practices](https://nextjs.org/docs/app/getting-started/project-structure), these should move to `src/shared/`:

### 📦 Move to `src/shared/components/`:
```
✅ MOVE:
- ProductCard (used across marketplace & details)
- ProductGallery (reusable across features)
- UI components from website/components/ui/
- Common layout components
- Form components (if reused)

❌ KEEP IN FEATURES:
- Domain-specific components
- Business logic components
- Feature-specific forms
```

### 📦 Move to `src/shared/types/`:
```
✅ MOVE:
- Product interface (used everywhere)
- User interface (used across auth & dashboard)
- API response types
- Common enums and constants

❌ KEEP IN FEATURES:
- Feature-specific interfaces
- Component prop types
- Domain models
```

### 📦 Move to `src/shared/hooks/`:
```
✅ MOVE:
- useMediaQuery (from website)
- useScrollPosition (from website)
- useLocalStorage (from website)
- Any hooks used across 2+ features

❌ KEEP IN FEATURES:
- Feature-specific business logic hooks
```

## Critical Naming Convention Fixes

### 1. **Folder Names** (Following [2025 standards](https://dev.to/bajrayejoon/best-practices-for-organizing-your-nextjs-15-2025-53ji)):
```
❌ Wrong:
- build-offer
- buyer
- home
- shop
- product

✅ Correct:
- offer-management
- buyer-dashboard  
- marketplace-catalog
- product-details
- website-marketing
```

### 2. **File Names**:
```
❌ Wrong:
- loadCartState.ts
- AllDeals.tsx (should be consistent)

✅ Correct:
- useCartPersistence.ts
- DealsOverview.tsx or AllDeals.tsx (be consistent)
```

### 3. **Component Names**:
```
❌ Wrong:
- Mixed PascalCase and kebab-case

✅ Correct:
- Always PascalCase for React components
- Always kebab-case for folders
- Always camelCase for files (except components)
```

## App Directory Restructuring

Your current app directory needs route groups for better organization:

```
src/app/
├── (website)/                     # Marketing website routes
│   ├── layout.tsx                 # Website layout
│   ├── page.tsx                   # Homepage
│   ├── buyer/
│   ├── seller/
│   ├── blog/
│   ├── podcast/
│   ├── team/
│   └── legal/
├── (marketplace)/                 # Marketplace application
│   ├── layout.tsx                 # Marketplace layout
│   ├── page.tsx                   # Marketplace landing
│   ├── product/
│   └── marketplace/
├── (auth)/                        # Authentication flows
│   ├── login/
│   ├── select-user-type/
│   ├── buyer/
│   │   └── certificate-upload/
│   └── confirm/
├── (dashboard)/                   # Dashboard routes
│   └── buyer/
│       └── dashboard/
├── earlyaccess/
└── api/
```

## Migration Steps (AGGRESSIVE TIMELINE)

### 🚨 PHASE 1: IMMEDIATE (Week 1)
1. **Restructure Auth** (CRITICAL - affects all authentication)
2. **Rename build-offer → offer-management**
3. **Clean up Zone.Identifier files** (junk)
4. **Create proper index.ts barrel exports**

### 📋 PHASE 2: MAJOR RESTRUCTURE (Week 2)
1. **Split buyer feature** → buyer-dashboard + messaging
2. **Consolidate shop/home/product** → marketplace-catalog + product-details
3. **Rename website → website-marketing**
4. **Move shared components to src/shared/**

### 🎯 PHASE 3: OPTIMIZATION (Week 3)
1. **Create early-access feature**
2. **Implement proper services layer**
3. **Add proper TypeScript types**
4. **Optimize imports and dependencies**

### ✅ PHASE 4: VALIDATION (Week 4)
1. **Test all import paths**
2. **Validate TypeScript compilation**
3. **Check for circular dependencies**
4. **Update documentation**

## 2025 Best Practices Implementation

Based on [Next.js 15 documentation](https://nextjs.org/docs/app/getting-started/project-structure):

### 1. **Route Groups Usage**:
```typescript
// Use route groups for organization
(website)/    // Marketing pages
(marketplace)/ // Application pages
(auth)/       // Authentication flows
```

### 2. **Colocation Strategy**:
```typescript
// Keep related files together
components/
├── FeatureComponent/
│   ├── FeatureComponent.tsx
│   ├── FeatureComponent.test.tsx
│   ├── FeatureComponent.stories.tsx
│   └── index.ts
```

### 3. **Private Folders**:
```typescript
// Use _folders for internal organization
_internal/
_utils/
_helpers/
```

### 4. **Barrel Exports**:
```typescript
// Every feature should have index.ts
export * from './components'
export * from './hooks'
export * from './types'
export { useAuth } from './hooks/useAuth'
```

## Benefits of This Refactoring

### 🚀 **Developer Experience**:
- Clear file locations (predictable structure)
- Faster navigation (logical grouping)
- Better IDE support (proper imports)
- Easy onboarding (self-documenting structure)

### 📈 **Scalability**:
- Independent feature development
- Clear domain boundaries
- Easy feature flag implementation
- Microservice-ready architecture

### 🛡️ **Maintainability**:
- Consistent patterns
- Reduced coupling
- Better testing organization
- Clear ownership

### ⚡ **Performance**:
- Better tree-shaking
- Optimized bundles
- Lazy loading ready
- Server-side rendering optimized

## Validation Checklist

- [ ] All imports work after restructuring
- [ ] No circular dependencies
- [ ] TypeScript compilation successful
- [ ] All features follow consistent structure
- [ ] Clear domain boundaries maintained
- [ ] Route groups properly implemented
- [ ] Shared components identified and moved
- [ ] Proper barrel exports created
- [ ] Services layer implemented
- [ ] Testing structure updated

## CRITICAL NEXT STEPS

1. **Get approval** for this aggressive refactoring
2. **Create feature branches** for each phase
3. **Backup current structure** before changes
4. **Update import paths** systematically
5. **Test each phase** before proceeding

---

**Last Updated**: January 2025
**Status**: Ready for Implementation
**Priority**: HIGH (Current structure blocks scalability) 