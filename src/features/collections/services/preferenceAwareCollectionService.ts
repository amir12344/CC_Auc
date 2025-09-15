import type { GetBuyerPreferenceApiRequest } from "../../buyer-preferences/types/preferences";
import { fetchPreferenceBasedListings } from "../../marketplace-catalog/services/catalogPreferenceQueryService";
import { getImageUrl } from "../../marketplace-catalog/services/imageService";
import type { CatalogListing } from "../../marketplace-catalog/types/catalog";
import type { CombinedListing } from "../../marketplace-catalog/types/combined-listing";

export interface PreferenceAwareFilters {
  // Section-specific filters (from URL)
  categories?: string[];
  subcategories?: string[];
  segments?: string[];

  // User preference context (from Redux)
  userPreferences?: GetBuyerPreferenceApiRequest;
}

export interface PreferenceAwareResponse {
  listings: CatalogListing[];
  totalCount: number;
  appliedFilters: {
    sectionFilters: Record<string, string[]>;
    preferenceFilters: Record<string, unknown>;
  };
  isFiltered: boolean;
}

/**
 * Transform CombinedListing to CatalogListing format for consistent UI rendering
 */
async function transformCombinedListingToCatalogListing(
  combinedListing: CombinedListing
): Promise<CatalogListing> {
  // Handle image URL processing
  let imageUrl = "";
  if (combinedListing.images?.[0]?.s3_key) {
    try {
      const s3Key = combinedListing.images[0].s3_key;
      if (s3Key) {
        const processedUrl = await getImageUrl(s3Key);
        imageUrl = processedUrl || "";
      }
    } catch {
      // ignore image url errors
    }
  }

  return {
    id: combinedListing.public_id,
    title: combinedListing.title,
    description: combinedListing.description || "",
    category: combinedListing.category ?? null,
    subcategory: combinedListing.subcategory ?? null,
    minimum_order_value: combinedListing.minimum_order_value || 0,
    image_url: imageUrl,
    lead_time_days: combinedListing.shipping_window ?? null,
    catalog_listing_images: [],
    // Pass through optional metrics for cards when available
    total_units:
      typeof combinedListing.total_units === "number"
        ? combinedListing.total_units
        : undefined,
    msrp_discount_percent:
      typeof combinedListing.msrp_discount_percent === "number"
        ? combinedListing.msrp_discount_percent
        : undefined,
    listing_source: "catalog",
  };
}

/**
 * Merge section filters with user preference filters
 */
function createMergedPreferences(
  sectionFilters: Record<string, string[]>,
  userPreferences?: GetBuyerPreferenceApiRequest
): GetBuyerPreferenceApiRequest {
  if (!userPreferences) {
    // If no user preferences, create minimal filter from section only
    return {
      preferredCategories: sectionFilters.categories || [],
      preferredSubcategories: sectionFilters.subcategories || [],
      buyerSegments: sectionFilters.segments || [],
      preferredBrandIds: [],
      budgetMin: 0,
      budgetMax: 999_999,
      listingTypePreferences: [],
      preferredRegions: [],
    };
  }

  // Merge section filters with user preferences
  const mergedPreferences: GetBuyerPreferenceApiRequest = {
    ...userPreferences,
  };

  // Override with section-specific filters if provided
  if (sectionFilters.categories && sectionFilters.categories.length > 0) {
    mergedPreferences.preferredCategories = sectionFilters.categories;
  }
  if (sectionFilters.subcategories && sectionFilters.subcategories.length > 0) {
    mergedPreferences.preferredSubcategories = sectionFilters.subcategories;
  }
  if (sectionFilters.segments && sectionFilters.segments.length > 0) {
    mergedPreferences.buyerSegments = sectionFilters.segments;
  }

  return mergedPreferences;
}

/**
 * Fetch listings with both section-specific and user preference filtering
 */
export async function fetchPreferenceAwareListings(
  filters: PreferenceAwareFilters
): Promise<PreferenceAwareResponse> {
  // Extract section filters
  const sectionFilters: Record<string, string[]> = {};
  if (filters.categories) {
    sectionFilters.categories = filters.categories;
  }
  if (filters.subcategories) {
    sectionFilters.subcategories = filters.subcategories;
  }
  if (filters.segments) {
    sectionFilters.segments = filters.segments;
  }

  // Create merged preferences (section + user preferences)
  const mergedPreferences = createMergedPreferences(
    sectionFilters,
    filters.userPreferences
  );

  // Use the existing preference-based service with merged filters
  const response = await fetchPreferenceBasedListings(mergedPreferences);

  // Transform combined listings to catalog listings format
  const transformedListings: CatalogListing[] = await Promise.all(
    response.listings
      .filter((l) => l.listing_source === "catalog")
      .map((combined) => transformCombinedListingToCatalogListing(combined))
  );

  return {
    listings: transformedListings,
    totalCount: transformedListings.length,
    appliedFilters: {
      sectionFilters,
      preferenceFilters: (filters.userPreferences || {}) as Record<
        string,
        unknown
      >,
    },
    isFiltered:
      Object.keys(sectionFilters).length > 0 || !!filters.userPreferences,
  };
}

/**
 * Fallback function for when no preference context is available
 * Uses the original collection service with basic filtering
 */
export async function fetchBasicCollectionListings(
  filters: Pick<
    PreferenceAwareFilters,
    "categories" | "subcategories" | "segments"
  >
): Promise<PreferenceAwareResponse> {
  // Import here to avoid circular dependencies
  const { fetchCatalogListingsWithFilters } = await import(
    "./collectionQueryService"
  );

  const response = await fetchCatalogListingsWithFilters({
    categories: filters.categories,
    subcategories: filters.subcategories,
    segments: filters.segments,
  });

  return {
    listings: response.listings,
    totalCount: response.listings.length,
    appliedFilters: {
      sectionFilters: {
        categories: filters.categories || [],
        subcategories: filters.subcategories || [],
        segments: filters.segments || [],
      },
      preferenceFilters: {},
    },
    isFiltered: true,
  };
}
