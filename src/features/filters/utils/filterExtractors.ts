import type { CombinedListing } from "@/src/features/marketplace-catalog/types/combined-listing";

import type { FilterOption, FilterSection } from "../types/filterTypes";

/**
 * Extract price range from listings
 */
export const extractPriceRange = (listings: CombinedListing[]) => {
  const prices = listings
    .map((l) => l.minimum_order_value)
    .filter((p): p is number => p !== null && p !== undefined && p > 0);

  if (prices.length === 0) {
    return { min: 0, max: 1000 }; // Default range
  }

  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
};

/**
 * Extract unique categories from listings
 */
export const extractCategories = (
  listings: CombinedListing[]
): FilterOption[] => {
  const categoryMap = new Map<string, number>();

  for (const listing of listings) {
    if (listing.category) {
      const count = categoryMap.get(listing.category) || 0;
      categoryMap.set(listing.category, count + 1);
    }
  }

  return Array.from(categoryMap.entries())
    .map(([value, count]) => ({
      value,
      label: formatCategoryLabel(value),
      count,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

/**
 * Extract unique subcategories from listings
 */
export const extractSubcategories = (
  listings: CombinedListing[]
): FilterOption[] => {
  const subcategoryMap = new Map<string, number>();

  for (const listing of listings) {
    if (listing.subcategory) {
      const count = subcategoryMap.get(listing.subcategory) || 0;
      subcategoryMap.set(listing.subcategory, count + 1);
    }
  }

  return Array.from(subcategoryMap.entries())
    .map(([value, count]) => ({
      value,
      label: formatSubcategoryLabel(value),
      count,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

/**
 * Extract listing formats from listings
 */
export const extractListingFormats = (
  listings: CombinedListing[]
): FilterOption[] => {
  const formatMap = new Map<string, number>();

  for (const listing of listings) {
    // Use is_private field to determine listing format
    const format = listing.is_private ? "private" : "public";
    const count = formatMap.get(format) || 0;
    formatMap.set(format, count + 1);
  }

  return Array.from(formatMap.entries())
    .map(([value, count]) => ({
      value,
      label: value === "private" ? "Private Offers" : "Public Auctions",
      count,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

/**
 * Format category enum to user-friendly label
 */
const formatCategoryLabel = (category: string): string => {
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

/**
 * Format subcategory enum to user-friendly label
 */
const formatSubcategoryLabel = (subcategory: string): string => {
  return subcategory
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

/**
 * Generate all filter sections for Near You page based on current listing data
 */
export const generateNearYouFilterSections = (
  listings: CombinedListing[]
): FilterSection[] => {
  const priceRange = extractPriceRange(listings);
  const locations = extractLocations(listings);
  const categories = extractCategories(listings);
  const subcategories = extractSubcategories(listings);
  const brands = extractBrands(listings);
  const conditions = extractConditions(listings);
  const packaging = extractPackaging(listings);
  const listingFormats = extractListingFormats(listings);

  const sections: FilterSection[] = [];

  // Minimum Order Value Filter
  if (priceRange.max > priceRange.min) {
    sections.push({
      id: "price",
      title: "Minimum ORder Value",
      type: "range",
      min: priceRange.min,
      max: priceRange.max,
      defaultExpanded: true,
    });
  }

  // Location Filter
  if (locations.length > 0) {
    sections.push({
      id: "locations",
      title: "Location",
      type: "checkbox",
      options: locations,
      collapsible: true,
      defaultExpanded: false,
    });
  }

  // Category Filter (always show for Near You page)
  if (categories.length > 0) {
    sections.push({
      id: "categories",
      title: "Categories",
      type: "checkbox",
      options: categories,
      collapsible: true,
      defaultExpanded: false,
    });
  }

  // Subcategory Filter
  if (subcategories.length > 0) {
    sections.push({
      id: "subcategories",
      title: "Subcategories",
      type: "checkbox",
      options: subcategories,
      collapsible: true,
      defaultExpanded: false,
    });
  }

  // Brand Filter
  if (brands.length > 0) {
    sections.push({
      id: "brands",
      title: "Brands",
      type: "checkbox",
      options: brands,
      collapsible: true,
      defaultExpanded: false,
    });
  }

  // Condition Filter
  if (conditions.length > 0) {
    sections.push({
      id: "conditions",
      title: "Condition",
      type: "checkbox",
      options: conditions,
      collapsible: true,
      defaultExpanded: false,
    });
  }

  // Packaging Filter
  if (packaging.length > 0) {
    sections.push({
      id: "packaging",
      title: "Packaging",
      type: "checkbox",
      options: packaging,
      collapsible: true,
      defaultExpanded: false,
    });
  }

  // Listing Format Filter
  if (listingFormats.length > 1) {
    // Only show if both types exist
    sections.push({
      id: "listingFormats",
      title: "Listing Format",
      type: "checkbox",
      options: listingFormats,
      collapsible: true,
      defaultExpanded: false,
    });
  }

  return sections;
};

/**
 * Generate filter sections for Private Offers page
 * Private offers are catalog listings with isPrivate: true
 * Include all relevant filters: price, categories, subcategories, locations, brands, conditions, packaging
 */
export const generatePrivateOffersFilterSections = (
  listings: CombinedListing[]
): FilterSection[] => {
  const sections: FilterSection[] = [];

  // 1. Minimum Order Value Filter
  const priceRange = extractPriceRange(listings);
  if (priceRange.min < priceRange.max) {
    sections.push({
      id: "price",
      title: "Minimum Order Value",
      type: "range",
      min: priceRange.min,
      max: priceRange.max,
      collapsible: true,
      defaultExpanded: true,
    });
  }

  // 2. Categories Filter
  const categories = extractCategories(listings);
  if (categories.length > 0) {
    sections.push({
      id: "categories",
      title: "Categories",
      type: "checkbox",
      options: categories,
      collapsible: true,
      defaultExpanded: true,
    });
  }

  // 3. Subcategories Filter
  const subcategories = extractSubcategories(listings);
  if (subcategories.length > 0) {
    sections.push({
      id: "subcategories",
      title: "Subcategories",
      type: "checkbox",
      options: subcategories,
      collapsible: true,
      defaultExpanded: false,
    });
  }

  // 4. Location Filter
  const locations = extractLocations(listings);
  if (locations.length > 0) {
    sections.push({
      id: "locations",
      title: "Location",
      type: "checkbox",
      options: locations,
      collapsible: true,
      defaultExpanded: false,
    });
  }

  // 5. Brands Filter
  const brands = extractBrands(listings);
  if (brands.length > 0) {
    sections.push({
      id: "brands",
      title: "Brands",
      type: "checkbox",
      options: brands,
      collapsible: true,
      defaultExpanded: false,
    });
  }

  // 6. Condition Filter
  const conditions = extractConditions(listings);
  if (conditions.length > 0) {
    sections.push({
      id: "conditions",
      title: "Condition",
      type: "checkbox",
      options: conditions,
      collapsible: true,
      defaultExpanded: false,
    });
  }

  // 7. Packaging Filter
  const packaging = extractPackaging(listings);
  if (packaging.length > 0) {
    sections.push({
      id: "packaging",
      title: "Packaging",
      type: "checkbox",
      options: packaging,
      collapsible: true,
      defaultExpanded: false,
    });
  }

  return sections;
};

/**
 * Generate all filter sections for Segment page based on current listing data
 */
export const generateSegmentFilterSections = (
  listings: CombinedListing[]
): FilterSection[] => {
  const priceRange = extractPriceRange(listings);
  const locations = extractLocations(listings);
  const categories = extractCategories(listings);
  const subcategories = extractSubcategories(listings);
  const brands = extractBrands(listings);
  const conditions = extractConditions(listings);
  const packaging = extractPackaging(listings);
  const listingFormats = extractListingFormats(listings);

  const sections: FilterSection[] = [];

  // Minimum Order Value Filter
  if (priceRange.min !== null && priceRange.max !== null) {
    sections.push({
      id: "priceRange",
      title: "Minimum Order Value",
      type: "range",
      min: priceRange.min,
      max: priceRange.max,
      collapsible: true,
      defaultExpanded: true,
    });
  }

  // Location Filter
  if (locations.length > 0) {
    sections.push({
      id: "locations",
      title: "Location",
      type: "checkbox",
      options: locations,
      collapsible: true,
      defaultExpanded: false,
    });
  }

  // Category Filter (always show for Segment page)
  if (categories.length > 0) {
    sections.push({
      id: "categories",
      title: "Categories",
      type: "checkbox",
      options: categories,
      collapsible: true,
      defaultExpanded: false,
    });
  }

  // Subcategory Filter
  if (subcategories.length > 0) {
    sections.push({
      id: "subcategories",
      title: "Subcategories",
      type: "checkbox",
      options: subcategories,
      collapsible: true,
      defaultExpanded: false,
    });
  }

  // Brand Filter
  if (brands.length > 0) {
    sections.push({
      id: "brands",
      title: "Brands",
      type: "checkbox",
      options: brands,
      collapsible: true,
      defaultExpanded: false,
    });
  }

  // Condition Filter
  if (conditions.length > 0) {
    sections.push({
      id: "conditions",
      title: "Condition",
      type: "checkbox",
      options: conditions,
      collapsible: true,
      defaultExpanded: false,
    });
  }

  // Packaging Filter
  if (packaging.length > 0) {
    sections.push({
      id: "packaging",
      title: "Packaging",
      type: "checkbox",
      options: packaging,
      collapsible: true,
      defaultExpanded: false,
    });
  }

  // Listing Format Filter
  if (listingFormats.length > 1) {
    // Only show if both types exist
    sections.push({
      id: "listingFormats",
      title: "Listing Format",
      type: "checkbox",
      options: listingFormats,
      collapsible: true,
      defaultExpanded: false,
    });
  }

  return sections;
};

/**
 * Extract unique locations from listings
 */
export function extractLocations(listings: CombinedListing[]): FilterOption[] {
  const locationMap = new Map<string, number>();

  for (const listing of listings) {
    // Use province field directly from backend (contains full province name)
    const province = listing.addresses?.province;
    if (listing.addresses?.city && province) {
      const location = `${listing.addresses.city}, ${province}`;
      const count = locationMap.get(location) || 0;
      locationMap.set(location, count + 1);
    }
  }

  return Array.from(locationMap.entries())
    .map(([value, count]) => ({
      value,
      label: value, // Already formatted as "City, Province"
      count,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Extract unique brands from listings
 */
export const extractBrands = (listings: CombinedListing[]): FilterOption[] => {
  const brandMap = new Map<string, number>();

  for (const listing of listings) {
    if (listing.brands?.length) {
      // Get unique brands within this listing to avoid double-counting
      const uniqueBrandsInListing: Set<string> = new Set<string>();

      for (const brand of listing.brands) {
        if (brand.brand_name) {
          uniqueBrandsInListing.add(brand.brand_name);
        }
      }

      // Count each unique brand once per listing
      for (const brandName of uniqueBrandsInListing) {
        const count = brandMap.get(brandName) || 0;
        brandMap.set(brandName, count + 1);
      }
    }
  }

  return Array.from(brandMap.entries())
    .map(([value, count]) => ({
      value,
      label: formatBrandLabel(value),
      count,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

/**
 * Extract unique conditions from listings
 */
export const extractConditions = (
  listings: CombinedListing[]
): FilterOption[] => {
  const conditionMap = new Map<string, number>();

  for (const listing of listings) {
    if (listing.listing_condition) {
      const count = conditionMap.get(listing.listing_condition) || 0;
      conditionMap.set(listing.listing_condition, count + 1);
    }
  }

  return Array.from(conditionMap.entries())
    .map(([value, count]) => ({
      value,
      label: formatConditionLabel(value),
      count,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

/**
 * Extract unique packaging types from listings
 */
export const extractPackaging = (
  listings: CombinedListing[]
): FilterOption[] => {
  const packagingMap = new Map<string, number>();

  for (const listing of listings) {
    if (listing.packaging) {
      const count = packagingMap.get(listing.packaging) || 0;
      packagingMap.set(listing.packaging, count + 1);
    }
  }

  return Array.from(packagingMap.entries())
    .map(([value, count]) => ({
      value,
      label: formatPackagingLabel(value),
      count,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

/**
 * Format brand name to user-friendly label
 */
const formatBrandLabel = (brand: string): string => {
  return brand; // Brand names are usually already user-friendly
};

/**
 * Format condition enum to user-friendly label
 */
const formatConditionLabel = (condition: string): string => {
  return condition
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

/**
 * Format packaging enum to user-friendly label
 */
const formatPackagingLabel = (packaging: string): string => {
  return packaging
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

/**
 * Generate filter sections for catalog page (all listings)
 * Includes all possible filters since catalog shows everything
 */
export const generateCatalogFilterSections = (
  listings: CombinedListing[]
): FilterSection[] => {
  if (listings.length === 0) {
    return [];
  }

  const sections: FilterSection[] = [];
  const priceRange = extractPriceRange(listings);

  // Minimum Order Value Filter
  sections.push({
    id: "price",
    title: "Minimum Order Value",
    type: "range",
    min: priceRange.min,
    max: priceRange.max,
    defaultExpanded: true,
  });

  // Location Filter
  const locations = extractLocations(listings);
  if (locations.length > 0) {
    sections.push({
      id: "locations",
      title: "Location",
      type: "checkbox",
      options: locations,
      collapsible: true,
      defaultExpanded: false,
    });
  }

  // Category Filter - show all categories for catalog page
  const categories = extractCategories(listings);
  if (categories.length > 0) {
    sections.push({
      id: "categories",
      title: "Categories",
      type: "checkbox",
      options: categories,
      collapsible: true,
      defaultExpanded: false,
    });
  }

  // Subcategory Filter
  const subcategories = extractSubcategories(listings);
  if (subcategories.length > 0) {
    sections.push({
      id: "subcategories",
      title: "Subcategories",
      type: "checkbox",
      options: subcategories,
      collapsible: true,
      defaultExpanded: false,
    });
  }

  // Brand Filter
  const brands = extractBrands(listings);
  if (brands.length > 0) {
    sections.push({
      id: "brands",
      title: "Brands",
      type: "checkbox",
      options: brands,
      collapsible: true,
      defaultExpanded: false,
    });
  }

  // Condition Filter
  const conditions = extractConditions(listings);
  if (conditions.length > 0) {
    sections.push({
      id: "conditions",
      title: "Condition",
      type: "checkbox",
      options: conditions,
      collapsible: true,
      defaultExpanded: false,
    });
  }

  // Packaging Filter
  const packaging = extractPackaging(listings);
  if (packaging.length > 0) {
    sections.push({
      id: "packaging",
      title: "Packaging",
      type: "checkbox",
      options: packaging,
      collapsible: true,
      defaultExpanded: false,
    });
  }

  // Listing Format Filter (Private Offers vs Public Auctions)
  const formats = extractListingFormats(listings);
  if (formats.length > 0) {
    sections.push({
      id: "listingFormats",
      title: "Listing Format",
      type: "checkbox",
      options: formats,
      collapsible: true,
      defaultExpanded: false,
    });
  }

  return sections;
};

/**
 * Generate filter sections for category pages
 * Similar to Near You and Segments but for category-specific listings
 */
export const generateCategoryFilterSections = (listings: CombinedListing[]) => {
  const priceRange = extractPriceRange(listings);
  type RangeSection = {
    id: "priceRange";
    title: string;
    type: "range";
    min: number;
    max: number;
    collapsible: true;
    defaultExpanded: true;
  };
  type CheckboxSection = {
    id:
      | "locations"
      | "subcategories"
      | "brands"
      | "conditions"
      | "packaging"
      | "listingFormats";
    title: string;
    type: "checkbox";
    options: { value: string; label: string; count?: number }[];
    collapsible: true;
    defaultExpanded: true;
  };
  const sections: Array<RangeSection | CheckboxSection> = [];

  // Minimum Order Value Filter
  if (priceRange.min < priceRange.max) {
    sections.push({
      id: "priceRange",
      title: "Minimum Order Value",
      type: "range" as const,
      min: priceRange.min,
      max: priceRange.max,
      collapsible: true,
      defaultExpanded: true,
    });
  }

  // Location Filter
  const locations = extractLocations(listings);
  if (locations.length > 0) {
    sections.push({
      id: "locations",
      title: "Location",
      type: "checkbox" as const,
      options: locations,
      collapsible: true,
      defaultExpanded: true,
    });
  }

  // Subcategories Filter (always show on category pages)
  const subcategories = extractSubcategories(listings);
  if (subcategories.length > 0) {
    sections.push({
      id: "subcategories",
      title: "Subcategories",
      type: "checkbox" as const,
      options: subcategories,
      collapsible: true,
      defaultExpanded: true,
    });
  }

  // Brands Filter
  const brands = extractBrands(listings);
  if (brands.length > 0) {
    sections.push({
      id: "brands",
      title: "Brands",
      type: "checkbox" as const,
      options: brands,
      collapsible: true,
      defaultExpanded: true,
    });
  }

  // Condition Filter
  const conditions = extractConditions(listings);
  if (conditions.length > 0) {
    sections.push({
      id: "conditions",
      title: "Condition",
      type: "checkbox" as const,
      options: conditions,
      collapsible: true,
      defaultExpanded: true,
    });
  }

  // Packaging Filter
  const packaging = extractPackaging(listings);
  if (packaging.length > 0) {
    sections.push({
      id: "packaging",
      title: "Packaging",
      type: "checkbox" as const,
      options: packaging,
      collapsible: true,
      defaultExpanded: true,
    });
  }

  // Listing Format Filter
  const listingFormats = extractListingFormats(listings);
  if (listingFormats.length > 0) {
    sections.push({
      id: "listingFormats",
      title: "Listing Format",
      type: "checkbox" as const,
      options: listingFormats,
      collapsible: true,
      defaultExpanded: true,
    });
  }

  return sections;
};
