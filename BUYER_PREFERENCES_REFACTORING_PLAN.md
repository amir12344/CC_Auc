# Buyer Preferences Refactoring Plan

## Overview

Refactor buyer preferences to eliminate code duplication between `page.tsx` and `BuyerPreferencePopup.tsx` while maintaining distinct UX patterns and fixing data mapping issues.

## Issues to Fix

### 🐛 Critical Bugs

- [ ] **Buyer Segments Mapping**: API returns `REFURBISHER_REPAIR_SHOP` but code checks for `REFURBISHER`
- [ ] **Missing Brand Data**: `getBuyerPreferences` doesn't include `preferred_brand_ids` field
- [ ] **API Response Transformation**: Missing `preferredBrandIds` in transform function

### 📦 Code Duplication Issues

- [ ] **Duplicate Form Components**: MultiSelectDropdown, CascadingCategoryDropdown, etc.
- [ ] **Duplicate State Logic**: Same preference state management in both files
- [ ] **Duplicate API Logic**: Same transformation and API calls
- [ ] **Duplicate Event Handlers**: Same toggle functions and form handling

## Implementation Plan

### Phase 1: Fix Critical Bugs ⚡

- [ ] **Fix buyer segments mapping** in `buildSellingPlatforms` function
- [ ] **Add preferred_brand_ids** to getBuyerPreferences query
- [ ] **Update API response transformation** to include brand IDs
- [ ] **Test bug fixes** with existing UI

### Phase 2: Extract Shared Components 🧩

- [ ] **Create directory structure**: `src/features/buyer-preferences/components/form-fields/`
- [ ] **Extract MultiSelectDropdown** → `MultiSelectDropdown.tsx`
- [ ] **Extract CascadingCategoryDropdown** → `CascadingCategoryDropdown.tsx`
- [ ] **Extract BudgetInput** → `BudgetInput.tsx`
- [ ] **Extract ListingTypePreference** → `ListingTypePreference.tsx`
- [ ] **Extract SellingPlatformSection** → `SellingPlatformSection.tsx`

### Phase 3: Extract Business Logic Hooks 🎣

- [ ] **Create usePreferences hook** for state management and API operations
- [ ] **Create useBrands hook** for brand fetching logic
- [ ] **Create usePreferenceTransforms hook** for data transformation
- [ ] **Extract form validation logic** into custom hooks

### Phase 4: Create Shared Form Component 📝

- [ ] **Create PreferenceFormFields component** containing all form fields
- [ ] **Make it layout-agnostic** (no wrapper styling)
- [ ] **Accept props for customization** (loading states, error handling)
- [ ] **Ensure proper TypeScript typing**

### Phase 5: Refactor PreferencesPage 📄

- [ ] **Import shared components** and hooks
- [ ] **Remove duplicate form field components**
- [ ] **Keep page-specific layout** (header, reset button, save button)
- [ ] **Use PreferenceFormFields component**
- [ ] **Reduce file size** from ~1100 lines to ~300-400 lines

### Phase 6: Refactor BuyerPreferencePopup 🔄

- [ ] **Import shared components** and hooks
- [ ] **Remove duplicate form logic**
- [ ] **Keep popup-specific layout** (modal, progress, navigation)
- [ ] **Update step components** to use shared form fields
- [ ] **Ensure step-by-step flow** still works correctly

### Phase 7: Testing & Optimization ✅

- [ ] **Test preference page** functionality
- [ ] **Test popup wizard** functionality
- [ ] **Verify bug fixes** work correctly
- [ ] **Check responsive design** on both interfaces
- [ ] **Optimize bundle size** and performance
- [ ] **Add TypeScript strict checks**

## Technical Standards

### Code Quality Standards

- **TypeScript**: Strict typing, no `any` types
- **Performance**: Memoization with `useMemo` and `useCallback`
- **Accessibility**: Proper ARIA labels and semantic HTML
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Testing**: Ensure existing functionality remains intact

### File Organization

```
src/features/buyer-preferences/
├── components/
│   ├── form-fields/
│   │   ├── MultiSelectDropdown.tsx
│   │   ├── CascadingCategoryDropdown.tsx
│   │   ├── BudgetInput.tsx
│   │   ├── ListingTypePreference.tsx
│   │   └── SellingPlatformSection.tsx
│   ├── PreferenceFormFields.tsx
│   ├── BuyerPreferencePopup.tsx (existing)
│   └── steps/ (existing)
├── hooks/
│   ├── usePreferences.ts
│   ├── useBrands.ts
│   └── usePreferenceTransforms.ts
├── services/ (existing)
├── types/ (existing)
└── data/ (existing)
```

### Expected Outcomes

- **Reduce code duplication** by ~70%
- **Fix buyer segment mapping issues**
- **Enable brand selection** functionality
- **Maintain distinct UX** for page vs popup
- **Improve maintainability** and testing
- **Better TypeScript coverage**

## Progress Tracking

- **Phase 1**: ⏳ Not Started
- **Phase 2**: ⏳ Not Started
- **Phase 3**: ⏳ Not Started
- **Phase 4**: ⏳ Not Started
- **Phase 5**: ⏳ Not Started
- **Phase 6**: ⏳ Not Started
- **Phase 7**: ⏳ Not Started

---

_Last Updated: Initial Creation_
