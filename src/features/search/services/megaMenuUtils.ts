import {
  fileToDbCategoryBiMap,
  fileToDbConditionBiMap,
  fileToDbLotConditionBiMap,
  fileToDbSubcategoryBiMap,
} from "@/amplify/functions/commons/converters/ListingTypeConverter";

/**
 * Generate search URL with query parameters for mega menu clicks
 */
export function generateSearchUrl(params: {
  category?: string;
  subcategory?: string;
  condition?: string;
  featured?: boolean;
  isNew?: boolean;
  isAuction?: boolean;
  region?: string;
  isPrivate?: boolean;
}): string {
  const searchParams = new URLSearchParams();

  if (params.category) {
    const mappedCategory = fileToDbCategoryBiMap.getValue(params.category);
    if (mappedCategory) {
      searchParams.set("categories", mappedCategory);
    }
  }

  if (params.subcategory) {
    const mappedSubcategory = fileToDbSubcategoryBiMap.getValue(
      params.subcategory
    );
    if (mappedSubcategory) {
      searchParams.set("subcategory", mappedSubcategory);
    }
  }

  if (params.condition) {
    // Pass the original condition name to search service
    // The search service will handle mapping based on listing type
    searchParams.set("condition", params.condition);
  }

  if (params.featured) {
    searchParams.set("featured", "true");
  }

  if (params.isNew) {
    searchParams.set("isNew", "true");
  }

  if (params.isAuction) {
    searchParams.set("type", "auction");
  }

  if (params.isPrivate) {
    searchParams.set("isPrivate", "true");
  }

  if (params.region) {
    searchParams.set("region", params.region);
  }

  return `/search?${searchParams.toString()}`;
}

/**
 * Handle mega menu item clicks and generate appropriate search URLs
 */
export function handleMegaMenuClick(item: {
  name: string;
  id: string;
  href?: string;
}): string {
  const itemName = item.name.toLowerCase();
  const itemId = item.id.toLowerCase();

  // Handle special categories
  if (itemId === "new" || itemName.includes("new")) {
    return generateSearchUrl({ isNew: true });
  }

  if (itemId === "featured" || itemName.includes("featured")) {
    return generateSearchUrl({ featured: true });
  }

  if (itemId === "live-auctions" || itemName.includes("auction")) {
    return generateSearchUrl({ isAuction: true });
  }

  if (itemId === "private-offers" || itemName.includes("private offers")) {
    return generateSearchUrl({ isPrivate: true });
  }

  // Handle conditions
  if (itemId.includes("condition") || itemId.includes("by-condition")) {
    return generateSearchUrl({ condition: itemName });
  }

  // Handle categories and subcategories
  if (itemId.includes("category") || itemId.includes("all-categories")) {
    return generateSearchUrl({ category: itemName });
  }

  // Default: treat as category
  return generateSearchUrl({ category: itemName });
}

/**
 * Extract category/subcategory information from mega menu data structure
 */
export function extractMegaMenuFilters(
  categoryId: string,
  itemName: string
): {
  category?: string;
  subcategory?: string;
  condition?: string;
  featured?: boolean;
  isNew?: boolean;
  isAuction?: boolean;
  region?: string;
  isPrivate?: boolean;
} {
  const filters: ReturnType<typeof extractMegaMenuFilters> = {};

  // Handle special categories
  switch (categoryId) {
    case "new":
      filters.isNew = true;
      break;
    case "featured":
      filters.featured = true;
      break;
    case "live-auctions":
      filters.isAuction = true;
      break;
    case "private-offers":
      filters.isPrivate = true;
      break;
    case "by-condition":
      // Pass the original condition name to search service
      // The search service will handle mapping based on listing type
      filters.condition = itemName;
      break;
    case "shop-by-region":
      // Map region names to a region filter parameter
      // This can be extended to map to geographic coordinates or address data
      filters.region = itemName;
      break;
    case "all-categories":
      filters.category = itemName;
      break;
    default:
      // For other categories, treat as main category
      filters.category = categoryId;
      if (itemName !== categoryId) {
        filters.subcategory = itemName;
      }
  }

  return filters;
}
