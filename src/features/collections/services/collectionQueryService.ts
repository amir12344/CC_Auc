import { generateClient } from "aws-amplify/api";

import type { Schema } from "@/amplify/data/resource";
import {
  getImageUrl,
  transformApiResponseToCatalogListing,
} from "@/src/features/marketplace-catalog/services/catalogQueryService";
import type { CatalogListing } from "@/src/features/marketplace-catalog/types/catalog";
import type { FindManyArgs } from "@/src/lib/prisma/PrismaQuery.type";
import { formatBackendError } from "@/src/utils/error-utils";

/**
 * Collection filters interface for API queries
 */
interface CollectionFilters {
  categories?: string[];
  subcategories?: string[];
  segments?: string[];
  conditions?: string[];
  brands?: string[];
  priceRange?: [number, number];
  take?: number;
  skip?: number;
}

/**
 * Collection query response
 */
interface CollectionQueryResponse {
  listings: CatalogListing[];
  totalCount: number;
  hasMore: boolean;
}

/**
 * Normalize slugified filter values to enum-compatible format
 */
function normalizeEnumValue(slug: string): string {
  // Handle special characters and normalize to valid enum format
  return (
    slug
      .trim()
      .toUpperCase()
      // Replace URL encoded characters first
      .replace(/%26/g, "AND") // %26 = &
      .replace(/%27/g, "") // %27 = ' (apostrophe)
      .replace(/%2F/g, "_") // %2F = /
      .replace(/%28/g, "_") // %28 = (
      .replace(/%29/g, "_") // %29 = )
      .replace(/%2C/g, "_") // %2C = ,
      // Replace common special characters
      .replace(/&/g, "AND")
      .replace(/'/g, "")
      .replace(/[\/(\),.-]/g, "_")
      // Replace hyphens and spaces with underscores
      .replace(/[-\s]+/g, "_")
      // Replace any remaining non-alphanumeric with underscore
      .replace(/[^A-Z0-9_]/g, "_")
      // Clean up multiple underscores
      .replace(/_{2,}/g, "_")
      // Remove leading/trailing underscores
      .replace(/^_+|_+$/g, "")
  );
}

/**
 * Transform collection filters to Prisma where clause
 */
function buildWhereClause(filters: CollectionFilters): Record<string, unknown> {
  const where: Record<string, unknown> = { status: "ACTIVE" };

  // Normalize slug values to enum format
  if (filters.categories) {
    filters.categories = filters.categories.map(normalizeEnumValue);
  }
  if (filters.subcategories) {
    filters.subcategories = filters.subcategories.map(normalizeEnumValue);
  }
  if (filters.segments) {
    filters.segments = filters.segments.map(normalizeEnumValue);
  }

  // Category filtering
  if (filters.categories && filters.categories.length > 0) {
    where.category = { in: filters.categories };
  }

  // Subcategory filtering
  if (filters.subcategories && filters.subcategories.length > 0) {
    where.subcategory = { in: filters.subcategories };
  }

  // Buyer segment filtering (via visibility rules - simplified for now)
  if (filters.segments && filters.segments.length > 0) {
    // This would need to be implemented based on your visibility rules schema
    // For now, we'll comment this out until the exact schema is confirmed
    // where.catalog_listing_visibility_rules = {
    //   some: {
    //     buyer_segments: { hasSome: filters.segments }
    //   }
    // }
  }

  // Brand filtering (via products)
  if (filters.brands && filters.brands.length > 0) {
    where.catalog_products = {
      some: {
        brands: {
          brand_name: { in: filters.brands },
        },
      },
    };
  }

  // Price range filtering
  if (filters.priceRange && filters.priceRange.length === 2) {
    const [min, max] = filters.priceRange;
    where.minimum_order_value = {
      gte: min,
      lte: max,
    };
  }

  // Add any additional conditions
  if (filters.conditions && filters.conditions.length > 0) {
    const existingProductFilter =
      (where.catalog_products as Record<string, unknown>) || {};
    const existingSome =
      typeof existingProductFilter === "object" &&
      existingProductFilter !== null &&
      "some" in existingProductFilter &&
      typeof existingProductFilter.some === "object" &&
      existingProductFilter.some !== null
        ? (existingProductFilter.some as Record<string, unknown>)
        : {};

    where.catalog_products = {
      ...existingProductFilter,
      some: {
        ...existingSome,
        catalog_product_variants: {
          some: {
            product_condition: { in: filters.conditions },
          },
        },
      },
    };
  }

  return where;
}

/**
 * Fetch catalog listings with collection filters
 */
export async function fetchCatalogListingsWithFilters(
  filters: CollectionFilters
): Promise<CollectionQueryResponse> {
  try {
    const client = generateClient<Schema>({ authMode: "apiKey" });

    const where = buildWhereClause(filters);
    const query: FindManyArgs<any> = {
      where,
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
        // Add minimal variant fields for card metrics
        catalog_products: {
          select: {
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
    };

    interface QueryDataInput {
      modelName: "catalog_listings";
      operation: "findMany";
      query: string;
    }

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
        // Transform API response to CatalogListing format with S3 image processing
        const listings = await Promise.all(
          parsedData.map(async (item) => {
            // item may include minimal variant fields enabling metrics computation in the transformer
            return transformApiResponseToCatalogListing(item);
          })
        );
        return {
          listings,
          totalCount: listings.length,
          hasMore: false, // No limit, so no more pages
        };
      }
    }

    return {
      listings: [],
      totalCount: 0,
      hasMore: false,
    };
  } catch (error) {
    const formattedError = formatBackendError(error);
    throw new Error(formattedError || "Failed to fetch collection listings");
  }
}

/**
 * Fetch auction listings (no filters applied as per user preference)
 */
export async function fetchAuctionListings(): Promise<CollectionQueryResponse> {
  try {
    const client = generateClient<Schema>({ authMode: "apiKey" });

    const query: FindManyArgs<any> = {
      where: { status: "ACTIVE" },
      select: {
        public_id: true,
        title: true,
        description: true,
        category: true,
        subcategory: true,
        minimum_bid: true,
        auction_listing_images: {
          select: {
            images: {
              select: {
                s3_key: true,
              },
            },
          },
        },
        auction_end_time: true, // Fixed: was end_time
      },
    };

    interface QueryDataInput {
      modelName: "auction_listings";
      operation: "findMany";
      query: string;
    }

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
        // Transform auction listings to match CatalogListing interface
        const listings = await Promise.all(
          parsedData.map(async (item): Promise<CatalogListing> => {
            const images = item.auction_listing_images;
            const processedImages = images
              ? await Promise.all(
                  images.map(async (img: { images: { s3_key: string } }) => ({
                    images: {
                      s3_key: img.images.s3_key,
                      processed_url:
                        (await getImageUrl(img.images.s3_key)) || "",
                    },
                  }))
                )
              : [];

            const primaryImageUrl =
              processedImages.length > 0
                ? processedImages[0].images.processed_url
                : "";

            return {
              id: item.public_id,
              title: item.title || "",
              description: item.description ?? "No description available.",
              category: item.category ?? "Uncategorized",
              subcategory: item.subcategory || null,
              image_url: primaryImageUrl,
              lead_time_days: null, // Auctions don't have lead time
              catalog_listing_images: processedImages,
              minimum_order_value: item.minimum_bid || 0,
              listing_source: "auction",
            };
          })
        );

        return {
          listings,
          totalCount: listings.length,
          hasMore: false, // No limit, so no more pages
        };
      }
    }

    return {
      listings: [],
      totalCount: 0,
      hasMore: false,
    };
  } catch (error) {
    const formattedError = formatBackendError(error);
    throw new Error(formattedError || "Failed to fetch auction listings");
  }
}

export type { CollectionFilters, CollectionQueryResponse };
