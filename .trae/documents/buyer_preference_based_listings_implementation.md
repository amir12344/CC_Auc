# Buyer Preference-Based Listings Implementation Plan

## Overview

This document outlines the implementation plan for enhancing the buyer preference system to fetch catalog listings based on user preferences at each step of the preference selection process. The key requirements are:

1. Make the BuyerPreferencePopup non-closable until the user completes all preference steps
2. Fetch and display catalog listings based on preferences after each step
3. Create a step-wise preference-based fetching mechanism
4. Ensure the preference-based listings persist when returning to the marketplace page

## Files to Modify

1. `src/features/buyer-preferences/components/BuyerPreferencePopup.tsx`
2. `src/features/buyer-preferences/services/buyerPreferenceService.ts`
3. `src/features/marketplace-catalog/services/catalogQueryService.ts`

## Implementation Details

### 1. Make BuyerPreferencePopup Non-Closable

In `BuyerPreferencePopup.tsx`, we need to:

* Modify the Dialog component to prevent closing until all steps are completed

* Disable the close button and escape key functionality until completion

* Only allow the ExitConfirmDialog to appear after all steps are completed

### 2. Create Step-Wise Preference Fetching Function

In `buyerPreferenceService.ts`, we'll add a new function:

```typescript
/**
 * Transform partial preferences to API format for step-wise fetching
 */
export const transformPartialPreferencesToApiFormat = (
  partialPreferences: Partial<BuyerPreferences>
): Partial<BuyerPreferenceApiRequest> => {
  // Similar to transformLocalPreferencesToApiFormat but handles partial data
  // Only include fields that have been filled in so far
  const apiRequest: Partial<BuyerPreferenceApiRequest> = {}

  if (partialPreferences.categories?.length) {
    apiRequest.preferredCategories = partialPreferences.categories
  }

  if (partialPreferences.subcategories?.length) {
    apiRequest.preferredSubcategories = partialPreferences.subcategories
  }

  if (partialPreferences.minBudget !== undefined) {
    apiRequest.budgetMin = partialPreferences.minBudget
  }

  if (partialPreferences.maxBudget !== undefined) {
    apiRequest.budgetMax = partialPreferences.maxBudget
  }

  if (partialPreferences.minimumDiscount) {
    apiRequest.minimumDiscountPercentage = Number.parseInt(
      partialPreferences.minimumDiscount.replace('no-preference', '0'),
      10
    )
  }

  if (partialPreferences.preferredTypes?.length) {
    apiRequest.listingTypePreferences = partialPreferences.preferredTypes
  }

  if (partialPreferences.sellingPlatforms) {
    apiRequest.buyerSegments = Object.entries(
      partialPreferences.sellingPlatforms
    )
      .filter(([_, value]) => value === true)
      .map(([key]) => {
        const platform =
          SELLING_PLATFORM_DETAILS[key as keyof typeof SELLING_PLATFORM_DETAILS]
        return platform?.key || key.toUpperCase()
      })
  }

  if (partialPreferences.preferredRegions?.length) {
    apiRequest.preferredRegions = partialPreferences.preferredRegions
  }

  if (partialPreferences.brands?.length) {
    apiRequest.preferredBrandIds = partialPreferences.brands
  }

  return apiRequest
}
```

### 3. Update Catalog Query Service

In `catalogQueryService.ts`, we'll add a new function for step-wise fetching:

```typescript
/**
 * Fetch catalog listings based on partial buyer preferences (for step-wise fetching)
 */
export const fetchCatalogListingsByPartialPreferences = async (
  partialPreferences: Partial<BuyerPreferenceApiRequest>,
  limit = 10
): Promise<CatalogListing[]> => {
  try {
    const client = generateClient<Schema>()

    type QueryDataInput = {
      modelName: 'catalog_listings'
      operation: 'findMany'
      query: string
    }

    // Build dynamic where conditions based on partial preferences
    const whereConditions: Record<string, unknown> = {
      AND: [],
    }

    // Only add conditions for preferences that have been set
    if (partialPreferences.preferredCategories?.length) {
      ;(whereConditions.AND as Array<Record<string, unknown>>).push({
        OR: [
          { category: { in: partialPreferences.preferredCategories } },
          {
            catalog_products: {
              some: {
                category: { in: partialPreferences.preferredCategories },
              },
            },
          },
        ],
      })
    }

    if (partialPreferences.preferredSubcategories?.length) {
      ;(whereConditions.AND as Array<Record<string, unknown>>).push({
        OR: [
          { subcategory: { in: partialPreferences.preferredSubcategories } },
          {
            catalog_products: {
              some: {
                subcategory: { in: partialPreferences.preferredSubcategories },
              },
            },
          },
        ],
      })
    }

    if (
      partialPreferences.budgetMin !== undefined ||
      partialPreferences.budgetMax !== undefined
    ) {
      const budgetConditions: Record<string, number> = {}

      if (
        partialPreferences.budgetMin !== undefined &&
        partialPreferences.budgetMin !== null
      ) {
        budgetConditions.gte = partialPreferences.budgetMin
      }

      if (
        partialPreferences.budgetMax !== undefined &&
        partialPreferences.budgetMax !== null
      ) {
        budgetConditions.lte = partialPreferences.budgetMax
      }

      if (Object.keys(budgetConditions).length > 0) {
        ;(whereConditions.AND as Array<Record<string, unknown>>).push({
          OR: [
            { minimum_order_value: budgetConditions },
            {
              catalog_products: {
                some: {
                  OR: [
                    { offer_price: budgetConditions },
                    { retail_price: budgetConditions },
                  ],
                },
              },
            },
          ],
        })
      }
    }

    if (partialPreferences.preferredBrandIds?.length) {
      ;(whereConditions.AND as Array<Record<string, unknown>>).push({
        catalog_products: {
          some: {
            brands: {
              public_id: { in: partialPreferences.preferredBrandIds },
            },
          },
        },
      })
    }

    if (partialPreferences.preferredRegions?.length) {
      ;(whereConditions.AND as Array<Record<string, unknown>>).push({
        addresses: {
          OR: [
            { country: { in: partialPreferences.preferredRegions } },
            { province: { in: partialPreferences.preferredRegions } },
            { city: { in: partialPreferences.preferredRegions } },
          ],
        },
      })
    }

    // If no conditions were added, remove the AND array
    const finalWhere =
      (whereConditions.AND as Array<Record<string, unknown>>).length > 0
        ? whereConditions
        : {}

    const query: FindManyArgs<'catalog_listings'> = {
      relationLoadStrategy: 'join',
      where: finalWhere,
      select: {
        public_id: true,
        title: true,
        description: true,
        category: true,
        subcategory: true,
        minimum_order_value: true,
        catalog_listing_images: {
          select: {
            images: {
              select: {
                s3_key: true,
              },
            },
          },
        },
        shipping_window: true,
      },
      take: limit,
      orderBy: {
        created_at: 'desc',
      },
    }

    const input: QueryDataInput = {
      modelName: 'catalog_listings',
      operation: 'findMany',
      query: JSON.stringify(query),
    }

    const { data: result } = await client.queries.queryData(input)
    console.log('Step-wise preference query result:', result)

    if (result) {
      const parsedData =
        typeof result === 'string' ? JSON.parse(result) : result

      if (Array.isArray(parsedData)) {
        // Process images asynchronously for all listings
        const catalogListings = await Promise.all(
          parsedData.map(transformApiResponseToCatalogListing)
        )
        return catalogListings
      }
    }

    return []
  } catch (error) {
    console.error(
      'Error fetching catalog listings by partial preferences:',
      error
    )
    return []
  }
}
```

### 4. Update BuyerPreferencePopup Component

In `BuyerPreferencePopup.tsx`, we'll add step-wise fetching:

```typescript
// Add these imports
import { transformPartialPreferencesToApiFormat } from '../services/buyerPreferenceService'
import { fetchCatalogListingsByPartialPreferences } from '../../marketplace-catalog/services/catalogQueryService'

// Add state for listings
const [stepListings, setStepListings] = useState<CatalogListing[]>([])

// Add function to fetch listings based on current step preferences
const fetchListingsForCurrentStep = useCallback(async () => {
  // Transform current preferences to API format
  const partialApiPreferences = transformPartialPreferencesToApiFormat(
    preferences
  )

  // Fetch listings based on partial preferences
  const listings = await fetchCatalogListingsByPartialPreferences(
    partialApiPreferences
  )

  // Log the results for now
  console.log('Listings for current step:', listings)
  setStepListings(listings)
}, [preferences])

// Update handleNext to fetch listings after each step
const handleNext = useCallback(() => {
  if (currentStep < totalSteps - 1) {
    // Fetch listings based on current step preferences
    fetchListingsForCurrentStep().catch(console.error)

    // Move to next step
    setCurrentStep((prev) => prev + 1)
  } else {
    handleComplete().catch(() => {
      // Error is already handled in handleComplete
      setIsSaving(false)
    })
  }
}, [currentStep, totalSteps, handleComplete, fetchListingsForCurrentStep])

// Modify handleCloseAttempt to prevent closing until completion
const handleCloseAttempt = useCallback(() => {
  // Only allow closing if all steps are completed or user has existing preferences
  if (preferences.isCompleted || initialPreferences?.isCompleted) {
    setShowExitConfirm(true)
  } else {
    // Show message that user must complete all steps
    setError('Please complete all preference steps before closing')

    // Clear error after a few seconds
    setTimeout(() => setError(null), 3000)
  }
}, [preferences.isCompleted, initialPreferences?.isCompleted])
```

## Integration with Marketplace Page

When the user returns to the marketplace page after completing preferences, we need to ensure the listings are filtered based on their saved preferences:

1. The marketplace page should check if the user has completed preferences
2. If completed, call `getCatalogListingsMatchingBuyerPreferences` with the user's ID
3. If not completed, show the BuyerPreferencePopup with non-closable behavior

## Testing Plan

1. Test BuyerPreferencePopup non-closable behavior

   * Verify users cannot close the popup until all steps are completed

   * Verify error message appears when attempting to close early

2. Test step-wise preference fetching

   * Verify listings are fetched after each step

   * Verify listings match the preferences set in each step

3. Test persistence of preference-based listings

   * Complete all preferences and navigate away from marketplace

   * Return to marketplace and verify listings are still filtered by preferences

## Implementation Sequence

1. Add `transformPartialPreferencesToApiFormat` to buyerPreferenceService.ts
2. Add `fetchCatalogListingsByPartialPreferences` to catalogQueryService.ts
3. Update BuyerPreferencePopup.tsx to make it non-closable and add step-wise fetching
4. Test the implementation with various preference combinations

## Future Enhancements

1. Add visual indicators showing how listings are being filtered at each step
2. Implement caching for preference-based listings to improve performance
3. Add ability to temporarily override preferences without saving them
4. Provide a summary of applied filters based on preferences

