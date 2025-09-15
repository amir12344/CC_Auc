# Mega Menu Implementation Plan v2 - Using Backend Converters

## Overview

This updated plan leverages the existing backend BiMap converters from `amplify/functions/commons/converters/ListingTypeConverter.ts` instead of creating duplicate frontend converters. This approach follows the existing pattern used in components like `CatalogDisplay.tsx`.

## Key Changes from v1

- **Remove duplicate frontend converters**: Delete the custom `ListingTypeConverter.ts` and `BiMap.ts` files created in v1
- **Import backend converters directly**: Use existing BiMaps like `fileToDbCategoryBiMap`, `fileToDbSubcategoryBiMap`, etc.
- **Maintain consistency**: Follow the same pattern as other components in the codebase

## Implementation Steps

### Step 1: Clean up duplicate files

- Delete `src/features/search/services/ListingTypeConverter.ts`
- Delete `src/utils/BiMap.ts`

### Step 2: Update megaMenuUtils.ts

- Import the backend BiMap converters:
  ```typescript
  import {
    fileToDbCategoryBiMap,
    fileToDbSubcategoryBiMap,
    fileToDbConditionBiMap,
    fileToDbLotConditionBiMap,
  } from '@/amplify/functions/commons/converters/ListingTypeConverter'
  ```
- Update `extractMegaMenuFilters` function to use these BiMaps
- Remove the custom `mapToEnum` import and usage

### Step 3: Update mapping logic

- Use BiMap `.get()` method to convert display names to enum values
- Handle cases where mapping doesn't exist (return undefined or default)
- Ensure proper type safety with TypeScript

### Step 4: Test integration

- Verify mega menu clicks generate correct search URLs
- Ensure enum values are properly mapped
- Test edge cases and fallback scenarios

## Available Backend BiMaps

From `ListingTypeConverter.ts`:

- `fileToDbCategoryBiMap`: Maps category display names to `product_category_type`
- `fileToDbSubcategoryBiMap`: Maps subcategory display names to `product_sub_category_type`
- `fileToDbConditionBiMap`: Maps condition display names to `product_condition_type`
- `fileToDbLotConditionBiMap`: Maps lot condition display names to `lot_condition_type`
- `fileToDbPackagingBiMap`: Maps packaging display names to `packaging_type`
- `fileToDbShippingBiMap`: Maps shipping display names to `shipping_type`

## Example Usage

```typescript
// Instead of custom mapping
const categoryEnum = mapToEnum(categoryName, 'category')

// Use backend BiMap directly
const categoryEnum = fileToDbCategoryBiMap.get(categoryName)
```

## Benefits

1. **No code duplication**: Reuses existing, tested converters
2. **Consistency**: Follows established patterns in the codebase
3. **Maintainability**: Single source of truth for enum mappings
4. **Automatic updates**: Changes to backend enums automatically reflect in frontend
5. **Type safety**: Leverages existing TypeScript types from backend

## Files to Modify

1. `src/features/search/services/megaMenuUtils.ts` - Update imports and mapping logic
2. Delete duplicate files created in v1

## Testing

- Test mega menu clicks for different categories and subcategories
- Verify search URLs contain correct enum values
- Ensure fallback behavior for unmapped items
- Test mobile and desktop mega menu interactions
