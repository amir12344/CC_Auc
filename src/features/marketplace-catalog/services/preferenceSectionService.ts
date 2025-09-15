import { fileToDbCategoryBiMap } from "../../../../amplify/functions/commons/converters/ListingTypeConverter";
import type { BiMap } from "../../../../amplify/functions/commons/datatypes/BiMap";
import { getBuyerSegmentDisplayName } from "../../buyer-preferences/data/segments";
import type { GetBuyerPreferenceApiRequest } from "../../buyer-preferences/types/preferences";
import type { CombinedListing } from "../types/combined-listing";
import { fetchPreferenceBasedListings } from "./catalogPreferenceQueryService";

interface PreferenceSectionData {
  title: string;
  listings: CombinedListing[];
  type: "buyerSegment" | "auction" | "catalog" | "category" | "nearYou";
  viewAllLink?: string;
}

/**
 * Generate all dynamic sections based on user preferences
 */
export async function generatePreferenceSections(
  preferences: GetBuyerPreferenceApiRequest
): Promise<PreferenceSectionData[]> {
  // Fetch all preference-based listings
  const response = await fetchPreferenceBasedListings(preferences);
  const { listings } = response;

  const sections: PreferenceSectionData[] = [];

  // 1. Buyer Segment Section - Always show this section
  // Filter catalog listings for segments section
  const catalogListingsForSegments = listings.filter(
    (l) => l.listing_source === "catalog"
  );

  if (catalogListingsForSegments.length > 0) {
    let title: string;
    let viewAllLink: string;

    if (preferences.buyerSegments && preferences.buyerSegments.length > 0) {
      // User has segment preferences - show personalized title
      const segmentNames = preferences.buyerSegments
        .filter(Boolean)
        .slice(0, 3)
        .map(getBuyerSegmentDisplayName);
      title =
        preferences.buyerSegments.length > 3
          ? `${segmentNames.join(", ")} and more`
          : segmentNames.join(", ");

      // Create dynamic URL with all segments as query parameters
      const segmentParams = preferences.buyerSegments
        .filter(Boolean)
        .map((segment) =>
          getBuyerSegmentDisplayName(segment).toLowerCase().replace(/\s/g, "-")
        )
        .join(",");
      viewAllLink = `/collections/segment/multiple?segments=${encodeURIComponent(segmentParams)}`;
    } else {
      // User has no segment preferences - show generic title and show public listings
      title = "Buyer Segments";
      viewAllLink = "/collections/segment/multiple"; // Will show all public listings
    }

    sections.push({
      title,
      listings: catalogListingsForSegments,
      type: "buyerSegment",
      viewAllLink,
    });
  }

  // 2. Auction Section (if any auction listings exist)
  const auctionListings = listings.filter(
    (listing) => listing.listing_source === "auction"
  );
  if (auctionListings.length > 0) {
    sections.push({
      title: "Live Auctions",
      listings: auctionListings,
      type: "auction",
      viewAllLink: "/collections/auctions",
    });
  }

  // 3. Catalog Section (if any catalog listings exist)
  const catalogListings = listings.filter(
    (listing) => listing.listing_source === "catalog"
  );
  if (catalogListings.length > 0) {
    sections.push({
      title: "Private Offers Listings",
      listings: catalogListings,
      type: "catalog",
      viewAllLink: "/collections/private-offers",
    });
  }

  // 4. Categories sections
  if (
    preferences.preferredCategories &&
    preferences.preferredCategories.length > 0
  ) {
    const viewAllLink = "/collections/category/multiple";

    sections.push({
      title: "Categories For You",
      listings: listings.filter(
        (l) =>
          l.listing_source === "catalog" &&
          preferences.preferredCategories?.includes(l.category)
      ),
      type: "category",
      viewAllLink,
    });
  }

  // 5. Near You section (based on preferred regions)
  if (preferences.preferredRegions && preferences.preferredRegions.length > 0) {
    const viewAllLink = "/collections/near-you";

    sections.push({
      title: "Near You",
      listings: listings.filter((l) => l.listing_source === "catalog"),
      type: "nearYou",
      viewAllLink,
    });
  }

  return sections;
}

/**
 * Convert buyer segment enum to display name
 * Note: No BiMap available for buyer segments in ListingTypeConverter
 */
// getBuyerSegmentDisplayName centralized in segments.ts

/**
 * Convert display name back to buyer segment enum value
 * Reverse mapping of getBuyerSegmentDisplayName
 */
export function getSegmentEnumFromDisplayName(displayName: string): string {
  const reverseSegmentMap: Record<string, string> = {
    "Discount Retail": "DISCOUNT_RETAIL",
    StockX: "STOCKX",
    "Amazon & Walmart": "AMAZON_OR_WALMART",
    "Live Seller": "LIVE_SELLER_MARKETPLACES",
    Reseller: "RESELLER_MARKETPLACES",
    "Off-Price Retail": "OFF_PRICE_RETAIL",
    Export: "EXPORTER",
    Refurbisher: "REFURBISHER_REPAIR_SHOP",
  };
  return (
    reverseSegmentMap[displayName] ||
    displayName.toUpperCase().replace(/\s/g, "_")
  );
}

/**
 * Convert category enum to display name using ListingTypeConverter mappings
 */
export function getCategoryDisplayName(category: string): string {
  return getDisplayNameFromBiMap(fileToDbCategoryBiMap, category);
}

/**
 * Generic helper function to get display name from any BiMap
 */
function getDisplayNameFromBiMap<T>(
  biMap: BiMap<string, T>,
  enumValue: string
): string {
  // Use reverse lookup from the BiMap to get display name
  for (const [displayName, mappedEnumValue] of biMap.entries()) {
    if (mappedEnumValue === enumValue) {
      return displayName;
    }
  }
  // Fallback to formatted enum value if not found
  return enumValue
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export type { PreferenceSectionData };
