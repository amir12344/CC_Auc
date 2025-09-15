import type { CombinedListing } from "@/src/features/marketplace-catalog/types/combined-listing";

import type { PageSpecificFilterState } from "../types/filterTypes";

/**
 * Apply all filters to the listings array
 */
export const applyFiltersToListings = (
  listings: CombinedListing[],
  filters: PageSpecificFilterState
): CombinedListing[] => {
  const result = listings.filter((listing) => {
    // Price Range Filter
    if (!passesPriceFilter(listing, filters.priceRange)) {
      return false;
    }

    // Category Filter
    if (!passesCategoryFilter(listing, filters.categories)) {
      return false;
    }

    // Subcategory Filter
    if (!passesSubcategoryFilter(listing, filters.subcategories)) {
      return false;
    }

    // Listing Format Filter
    if (!passesListingFormatFilter(listing, filters.listingFormats)) {
      return false;
    }

    // Location Filter
    if (!passesLocationFilter(listing, filters.locations || [])) {
      return false;
    }

    // Brand Filter
    if (!passesBrandFilter(listing, filters.brands || [])) {
      return false;
    }

    // Condition Filter
    if (!passesConditionFilter(listing, filters.conditions || [])) {
      return false;
    }

    // Packaging Filter
    if (!passesPackagingFilter(listing, filters.packaging || [])) {
      return false;
    }

    return true;
  });

  return result;
};

/**
 * Check if listing passes price range filter
 */
const passesPriceFilter = (
  listing: CombinedListing,
  priceRange: { min: number; max: number }
): boolean => {
  // Skip price filtering for auction listings since they don't use minimum_order_value
  // Auctions use bid-based pricing which is different from catalog minimum order values
  if (listing.listing_source === "auction") {
    return true;
  }

  const price = listing.minimum_order_value;

  // If no price set, don't filter out
  if (price === null || price === undefined) {
    return true;
  }

  return price >= priceRange.min && price <= priceRange.max;
};

/**
 * Check if listing passes category filter
 */
const passesCategoryFilter = (
  listing: CombinedListing,
  selectedCategories: string[]
): boolean => {
  // If no categories selected, pass all listings
  if (selectedCategories.length === 0) {
    return true;
  }

  // Check if listing's category matches any selected category
  return selectedCategories.includes(listing.category);
};

/**
 * Check if listing passes subcategory filter
 */
const passesSubcategoryFilter = (
  listing: CombinedListing,
  selectedSubcategories: string[]
): boolean => {
  // If no subcategories selected, pass all listings
  if (selectedSubcategories.length === 0) {
    return true;
  }

  // If listing has no subcategory, don't filter out
  if (!listing.subcategory) {
    return true;
  }

  // Check if listing's subcategory matches any selected subcategory
  return selectedSubcategories.includes(listing.subcategory);
};

/**
 * Check if listing passes listing format filter
 */
const passesListingFormatFilter = (
  listing: CombinedListing,
  selectedFormats: ("catalog" | "auction" | "lot")[]
): boolean => {
  // If no formats selected, pass all listings
  if (selectedFormats.length === 0) {
    return true;
  }

  // Check if listing's source matches any selected format
  return selectedFormats.includes(listing.listing_source);
};

/**
 * Check if listing passes location filter
 */
const passesLocationFilter = (
  listing: CombinedListing,
  selectedLocations: string[]
): boolean => {
  // If no locations selected, pass all listings
  if (selectedLocations.length === 0) {
    return true;
  }

  // If listing has no address, filter it out when location filter is active
  if (!(listing.addresses?.city && listing.addresses?.province)) {
    return false;
  }

  // Create location string in same format as filter options (using province field directly)
  const listingLocation = `${listing.addresses.city}, ${listing.addresses.province}`;

  // Check if listing's location matches any selected location
  return selectedLocations.includes(listingLocation);
};

/**
 * Check if listing passes brand filter
 */
const passesBrandFilter = (
  listing: CombinedListing,
  selectedBrands: string[]
): boolean => {
  // If no brands selected, pass all listings
  if (selectedBrands.length === 0) {
    return true;
  }

  // If listing has no brands, don't filter out
  if (!listing.brands?.length) {
    return true;
  }

  // Check if any of the listing's brands matches any selected brand
  return listing.brands.some(
    (brand) => brand.brand_name && selectedBrands.includes(brand.brand_name)
  );
};

/**
 * Check if listing passes condition filter
 */
const passesConditionFilter = (
  listing: CombinedListing,
  selectedConditions: string[]
): boolean => {
  // If no conditions selected, pass all listings
  if (selectedConditions.length === 0) {
    return true;
  }

  // If listing has no condition, don't filter out
  if (!listing.listing_condition) {
    return true;
  }

  // Check if listing's condition matches any selected condition
  return selectedConditions.includes(listing.listing_condition);
};

/**
 * Check if listing passes packaging filter
 */
const passesPackagingFilter = (
  listing: CombinedListing,
  selectedPackaging: string[]
): boolean => {
  // If no packaging selected, pass all listings
  if (selectedPackaging.length === 0) {
    return true;
  }

  // If listing has no packaging, don't filter out
  if (!listing.packaging) {
    return true;
  }

  // Check if listing's packaging matches any selected packaging
  return selectedPackaging.includes(listing.packaging);
};

/**
 * Get count of listings that would pass each filter option
 * Used to show counts next to filter options
 */
export const getFilterOptionCounts = (
  listings: CombinedListing[],
  currentFilters: PageSpecificFilterState,
  filterType: "categories" | "subcategories" | "listingFormats"
): Map<string, number> => {
  const counts = new Map<string, number>();

  listings.forEach((listing) => {
    // Apply all filters except the one we're counting for
    const tempFilters = { ...currentFilters };

    if (filterType === "categories") {
      tempFilters.categories = [];
    } else if (filterType === "subcategories") {
      tempFilters.subcategories = [];
    } else if (filterType === "listingFormats") {
      tempFilters.listingFormats = [];
    }

    // Only count if listing passes all other filters
    const passesOtherFilters =
      applyFiltersToListings([listing], tempFilters).length > 0;

    if (passesOtherFilters) {
      let valueToCount: string | null = null;

      if (filterType === "categories") {
        valueToCount = listing.category;
      } else if (filterType === "subcategories") {
        valueToCount = listing.subcategory ?? null;
      } else if (filterType === "listingFormats") {
        valueToCount = listing.listing_source;
      }

      if (valueToCount) {
        const currentCount = counts.get(valueToCount) || 0;
        counts.set(valueToCount, currentCount + 1);
      }
    }
  });

  return counts;
};

/**
 * Check if any filters are currently active
 */
export const hasActiveFilters = (filters: PageSpecificFilterState): boolean => {
  return (
    filters.categories.length > 0 ||
    filters.subcategories.length > 0 ||
    filters.listingFormats.length > 0 ||
    (filters.locations || []).length > 0 ||
    (filters.brands || []).length > 0 ||
    (filters.conditions || []).length > 0 ||
    (filters.packaging || []).length > 0
  );
};

/**
 * Create a default/empty filter state
 */
export const createDefaultFilterState = (): PageSpecificFilterState => {
  return {
    priceRange: { min: 0, max: 1000 },
    categories: [],
    subcategories: [],
    listingFormats: [],
    // Optional filters (for future use)
    locations: [],
    brands: [],
    conditions: [],
    packaging: [],
  };
};

/**
 * Reset all filters to default state
 */
export const resetAllFilters = (
  listings: CombinedListing[]
): PageSpecificFilterState => {
  const priceRange =
    listings.length > 0
      ? {
        min: Math.min(
          ...listings
            .map((l) => l.minimum_order_value || 0)
            .filter((p) => p > 0)
        ),
        max: Math.max(...listings.map((l) => l.minimum_order_value || 1000)),
      }
      : { min: 0, max: 1000 };

  return {
    priceRange,
    categories: [],
    subcategories: [],
    listingFormats: [],
    locations: [],
    brands: [],
    conditions: [],
    packaging: [],
  };
};
