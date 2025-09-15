import { generateClient } from "aws-amplify/api";
import { getUrl } from "aws-amplify/storage";

import type { Schema } from "@/amplify/data/resource";
import {
  fileToDbCategoryBiMap,
  fileToDbConditionBiMap,
  fileToDbLotConditionBiMap,
  fileToDbSubcategoryBiMap,
} from "@/amplify/functions/commons/converters/ListingTypeConverter";
import type { AuctionListingItem } from "@/src/features/auctions/types";
import { mapApiToAuctionListing } from "@/src/features/auctions/utils/transforms";
import { getStateCodesForRegions } from "@/src/features/buyer-preferences/data/preferenceOptions";
import type { CatalogListing } from "@/src/features/marketplace-catalog/types/catalog";
import { mapApiToCatalogListing } from "@/src/features/marketplace-catalog/utils/transforms";
import type { FindManyArgs } from "@/src/lib/prisma/PrismaQuery.type";

import {
  mapSimplifiedConditionToAuctionConditions,
  mapSimplifiedConditionToCatalogConditions,
} from "../utils/conditionMapper";

/**
 * Get public URL for S3 image
 */
const getImageUrl = async (s3Key: string): Promise<string | null> => {
  try {
    const publicUrl = await getUrl({
      path: s3Key,
      options: {
        validateObjectExistence: false,
        bucket: "commerce-central-images",
        useAccelerateEndpoint: true,
      },
    });
    return publicUrl.url.toString();
  } catch {
    return null;
  }
};

/**
 * Transform API response to CatalogListing with S3 image processing
 */
const transformApiResponseToCatalogListing = async (
  apiResponse: Parameters<typeof mapApiToCatalogListing>[0]
): Promise<CatalogListing> => mapApiToCatalogListing(apiResponse, getImageUrl);

/**
 * Calculate time left from auction end time
 */
const calculateTimeLeft = (endTime: string): string => {
  const now = new Date();
  const end = new Date(endTime);
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) {
    return "Ended";
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

/**
 * Transform API data to UI-ready AuctionListingItem format
 */
const transformToAuctionListing = async (
  apiData: Parameters<typeof mapApiToAuctionListing>[0]
): Promise<AuctionListingItem> => mapApiToAuctionListing(apiData, getImageUrl);

export async function fetchAndProcessListings(filters: {
  [key: string]: string | string[] | undefined;
}) {
  const isAuction = filters.type === "auction";
  const isPrivateOffers = filters.isPrivate === "true";
  const listingType = isAuction ? "auction_listings" : "catalog_listings";

  // For private offers, we need to fetch based on user preferences
  if (isPrivateOffers) {
    // TODO: Integrate with user preferences from Redux store
    // For now, fetch catalog listings that support private offers
    const results = await fetchListings("catalog_listings", {
      ...filters,
      isPrivate: true,
    });
    return Promise.all(
      (results as any[]).map(transformApiResponseToCatalogListing)
    );
  }

  const results = await fetchListings(listingType, filters);

  if (isAuction) {
    return Promise.all((results as any[]).map(transformToAuctionListing));
  }
  return Promise.all(
    (results as any[]).map(transformApiResponseToCatalogListing)
  );
}

/**
 * Unified fetch function for mega menu queries
 */
export async function fetchListings(
  type: "catalog_listings" | "auction_listings",
  filters: {
    category?: string;
    category2?: string;
    category3?: string;
    subcategory?: string;
    subcategory2?: string;
    subcategory3?: string;
    subcategory4?: string;
    subcategory5?: string;
    condition?: string;
    featured?: boolean;
    userId?: string;
    orderBy?: any;
    region?: string;
    isPrivate?: boolean;
    isNew?: boolean;
  } = {},
  limit: number = 20
): Promise<CatalogListing[] | AuctionListingItem[]> {
  try {
    const client = generateClient<Schema>({ authMode: "apiKey" });

    if (type === "catalog_listings") {
      type QueryDataInput = {
        modelName: "catalog_listings";
        operation: "findMany";
        query: string;
      };

      const whereClause: any = { status: "ACTIVE" };

      if (filters.category) {
        whereClause.category = filters.category;
      }
      if (filters.subcategory) {
        whereClause.subcategory = filters.subcategory;
      }
      if (filters.condition) {
        // Map condition to the correct database field and enum type for catalog listings
        // First try direct mapping (for detailed condition names)
        const mappedCondition = fileToDbConditionBiMap.getValue(
          filters.condition
        );

        if (mappedCondition) {
          whereClause.listing_condition = mappedCondition;
        } else {
          // If no direct mapping, try simplified condition mapping with multiple conditions
          const detailedConditions = mapSimplifiedConditionToCatalogConditions(
            filters.condition
          );
          if (detailedConditions.length > 0) {
            const mappedConditions = detailedConditions
              .map(
                (condition) =>
                  fileToDbConditionBiMap.getValue(condition) ||
                  condition.toUpperCase()
              )
              .filter(Boolean);

            if (mappedConditions.length > 0) {
              whereClause.OR = mappedConditions.map((condition) => ({
                listing_condition: condition,
              }));
            }
          } else {
            // If no simplified mapping found, use the original condition as uppercase
            whereClause.listing_condition = filters.condition.toUpperCase();
          }
        }
      }
      if (filters.featured !== undefined) {
        whereClause.featured = filters.featured;
      }
      if (filters.userId) {
        whereClause.user_id = filters.userId;
      }
      if (filters.region) {
        // Convert region names to state codes and filter by addresses table
        const stateCodes = getStateCodesForRegions([filters.region]);
        if (stateCodes.length > 0) {
          whereClause.addresses = {
            province_code: {
              in: stateCodes,
            },
          };
        }
      }
      if (filters.isPrivate !== undefined) {
        whereClause.is_private = filters.isPrivate;
      }

      // Set default orderBy for isNew filter (latest listings first)
      let orderBy = filters.orderBy;
      if (filters.isNew) {
        orderBy = { created_at: "desc" };
      }

      const query: FindManyArgs<"catalog_listings"> = {
        relationLoadStrategy: "join",
        where: whereClause,
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
          // Additional filter fields for filter bar functionality
          listing_condition: true,
          packaging: true,
          is_private: true,
          addresses: {
            select: {
              city: true,
              province: true,
              province_code: true,
              country: true,
            },
          },
          catalog_products: {
            select: {
              // Include product-level prices as fallback for metrics
              retail_price: true,
              offer_price: true,
              brands: {
                select: {
                  brand_name: true,
                },
              },
              // Minimal variant fields for card metrics
              catalog_product_variants: {
                select: {
                  available_quantity: true,
                  retail_price: true,
                  offer_price: true,
                },
              },
            },
          },
        },
        take: limit,
        ...(orderBy && { orderBy }),
      };

      const input: QueryDataInput = {
        modelName: "catalog_listings",
        operation: "findMany",
        query: JSON.stringify(query),
      };

      const { data: result } = await client.queries.queryData(input);

      if (result) {
        const parsedData =
          typeof result === "string" ? JSON.parse(result) : result;
        if (Array.isArray(parsedData)) {
          return await Promise.all(
            parsedData.map(transformApiResponseToCatalogListing)
          );
        }
      }
    } else {
      // auction_listings
      type QueryDataInput = {
        modelName: "auction_listings";
        operation: "findMany";
        query: string;
      };

      const whereClause: any = { status: "ACTIVE" };

      if (filters.category) {
        whereClause.category = filters.category;
      }

      if (filters.category2) {
        whereClause.category2 = filters.category2;
      }

      if (filters.category3) {
        whereClause.category3 = filters.category3;
      }

      if (filters.subcategory) {
        whereClause.subcategory = filters.subcategory;
      }

      if (filters.subcategory2) {
        whereClause.subcategory2 = filters.subcategory2;
      }

      if (filters.subcategory3) {
        whereClause.subcategory3 = filters.subcategory3;
      }

      if (filters.subcategory4) {
        whereClause.subcategory4 = filters.subcategory4;
      }

      if (filters.subcategory5) {
        whereClause.subcategory5 = filters.subcategory5;
      }
      if (filters.condition) {
        // Map condition to the correct database field and enum type for auction listings
        // First try direct mapping (for detailed condition names)
        const mappedCondition = fileToDbLotConditionBiMap.getValue(
          filters.condition
        );

        if (mappedCondition) {
          whereClause.lot_condition = mappedCondition;
        } else {
          // If no direct mapping, try simplified condition mapping with multiple conditions
          const detailedConditions = mapSimplifiedConditionToAuctionConditions(
            filters.condition
          );
          if (detailedConditions.length > 0) {
            const mappedConditions = detailedConditions
              .map((condition) => {
                // First try lot condition BiMap, then catalog condition BiMap as fallback
                return (
                  fileToDbLotConditionBiMap.getValue(condition) ||
                  fileToDbConditionBiMap.getValue(condition) ||
                  condition.toUpperCase()
                );
              })
              .filter(Boolean);

            if (mappedConditions.length > 0) {
              whereClause.OR = mappedConditions.map((condition) => ({
                lot_condition: condition,
              }));
            }
          } else {
            // If no simplified mapping found, try catalog condition BiMap as fallback, then uppercase
            const fallbackCondition =
              fileToDbConditionBiMap.getValue(filters.condition) ||
              filters.condition.toUpperCase();
            whereClause.lot_condition = fallbackCondition;
          }
        }
      }
      if (filters.region) {
        // Convert region names to state codes and filter by addresses table
        const stateCodes = getStateCodesForRegions([filters.region]);
        if (stateCodes.length > 0) {
          whereClause.addresses = {
            province_code: {
              in: stateCodes,
            },
          };
        }
      }
      if (filters.isPrivate !== undefined) {
        whereClause.is_private = filters.isPrivate;
      }

      // Set default orderBy for isNew filter (latest listings first)
      let orderBy = filters.orderBy;
      if (filters.isNew) {
        orderBy = { created_at: "desc" };
      }

      const query: FindManyArgs<"auction_listings"> = {
        relationLoadStrategy: "join",
        where: whereClause,
        select: {
          public_id: true,
          title: true,
          category: true,
          subcategory: true,
          auction_end_time: true,
          auction_bids: {
            select: {
              bid_amount: true,
            },
          },
          auction_listing_images: {
            select: {
              images: {
                select: {
                  s3_key: true,
                },
              },
            },
          },
          // Additional filter fields for filter bar functionality
          lot_condition: true,
          addresses: {
            select: {
              city: true,
              province: true,
              province_code: true,
              country: true,
            },
          },
        },
        take: limit,
        ...(orderBy && { orderBy }),
      };

      const input: QueryDataInput = {
        modelName: "auction_listings",
        operation: "findMany",
        query: JSON.stringify(query),
      };

      const { data: result } = await client.queries.queryData(input);

      if (result) {
        const parsedData =
          typeof result === "string" ? JSON.parse(result) : result;
        if (Array.isArray(parsedData)) {
          return await Promise.all(parsedData.map(transformToAuctionListing));
        }
      }
    }

    return [];
  } catch {
    return [];
  }
}

export function mapToEnum(
  value: string,
  type: "category" | "subcategory" | "condition"
): string {
  switch (type) {
    case "category":
      return fileToDbCategoryBiMap.getValue(value) || value;
    case "subcategory":
      return fileToDbSubcategoryBiMap.getValue(value) || value;
    case "condition":
      return fileToDbConditionBiMap.getValue(value) || value;
    default:
      return value;
  }
}

// Specialized functions using unified fetch
export async function fetchNewListings(limit: number = 20) {
  return fetchListings(
    "catalog_listings",
    { orderBy: { created_at: "desc" } },
    limit
  );
}

export async function fetchFeaturedListings(limit: number = 20) {
  return fetchListings("catalog_listings", { featured: true }, limit);
}

export async function fetchPrivateOffers(userId: string, limit: number = 20) {
  // Check Redux store first (implementation pending)
  // If not, fetch with user preferences
  return fetchListings("catalog_listings", { userId }, limit); // Adjust filters as per preferences
}

export async function fetchLiveAuctions(limit: number = 20) {
  return fetchListings("auction_listings", {}, limit);
}
