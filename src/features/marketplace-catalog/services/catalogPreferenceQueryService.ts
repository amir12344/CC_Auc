import { generateClient } from "aws-amplify/api";

import type { Schema } from "@/amplify/data/resource";
import type { $Enums } from "@/amplify/functions/lambda-layers/core-layer/nodejs/prisma/generated/client";
import type { FindManyArgs } from "@/src/lib/prisma/PrismaQuery.type";
import { err, ok, type Result } from "@/src/shared/types/result";
import { formatBackendError } from "@/src/utils/error-utils";

import { getStateCodesForRegions } from "../../buyer-preferences/data/preferenceOptions";
import type { GetBuyerPreferenceApiRequest } from "../../buyer-preferences/types/preferences";
import { getImageUrl } from "../services/imageService";
import type { CatalogListing } from "../types/catalog";
import type { CombinedListing } from "../types/combined-listing";

// Types for preference-based query filters
export interface PreferenceBasedQueryFilters {
  categories?: string[];
  subcategories?: string[];
  brandIds?: string[];
  listingTypes?: string[];
  buyerSegments?: string[];
  stateCodes?: string[];
}

// CombinedListing unified type moved to ../types/combined-listing

export interface PreferenceBasedListingsResponse {
  listings: CombinedListing[];
  totalCount: number;
  appliedFilters: PreferenceBasedQueryFilters;
  isFiltered: boolean;
}

/**
 * Transform CombinedListing to CatalogListing format for compatibility with CatalogCard
 */
export const transformCombinedListingToCatalogListing = async (
  listing: CombinedListing
): Promise<CatalogListing> => {
  // Process all images and get processed URLs
  const processedImages = listing.images
    ? await Promise.all(
        listing.images.map(async (img) => ({
          images: {
            s3_key: img.s3_key,
            processed_url: (await getImageUrl(img.s3_key)) || "",
          },
        }))
      )
    : [];

  // Get first processed URL for image_url field
  const primaryImageUrl =
    processedImages.length > 0 ? processedImages[0].images.processed_url : "";

  return {
    id: listing.public_id, // Use public_id as id
    title: listing.title,
    description: listing.description,
    category: listing.category,
    subcategory: listing.subcategory ?? null,
    image_url: primaryImageUrl,
    lead_time_days: listing.shipping_window ?? null, // Map shipping_window to lead_time_days
    catalog_listing_images: processedImages,
    minimum_order_value: listing.minimum_order_value || 0,
    // Pass through optional metrics when available
    total_units:
      typeof listing.total_units === "number" ? listing.total_units : undefined,
    msrp_discount_percent:
      typeof listing.msrp_discount_percent === "number"
        ? listing.msrp_discount_percent
        : undefined,
    listing_source: listing.listing_source,
  };
};

/**
 * Transform buyer preferences API data to query filters
 */
const transformPreferencesToQueryFilters = (
  preferences: GetBuyerPreferenceApiRequest
): PreferenceBasedQueryFilters => {
  // Convert preferred regions to state codes
  const stateCodes = preferences.preferredRegions?.length
    ? getStateCodesForRegions(preferences.preferredRegions)
    : undefined;

  return {
    categories: preferences.preferredCategories?.length
      ? preferences.preferredCategories
      : undefined,
    subcategories: preferences.preferredSubcategories?.length
      ? preferences.preferredSubcategories
      : undefined,
    brandIds: preferences.preferredBrandIds?.length
      ? preferences.preferredBrandIds
      : undefined,
    listingTypes: preferences.listingTypePreferences?.length
      ? preferences.listingTypePreferences
      : undefined,
    buyerSegments: preferences.buyerSegments?.length
      ? preferences.buyerSegments
      : undefined,
    stateCodes: stateCodes?.length ? stateCodes : undefined,
  };
};

/**
 * Build dynamic query filters for catalog listings
 */
const buildCatalogQueryFilters = (
  filters: PreferenceBasedQueryFilters
): FindManyArgs<"catalog_listings">["where"] => {
  const whereConditions: Record<string, unknown>[] = [];

  // Category filtering
  if (filters.categories?.length) {
    whereConditions.push({
      OR: [
        { category: { in: filters.categories } },
        { category2: { in: filters.categories } },
        { category3: { in: filters.categories } },
      ],
    });
  }

  // Subcategory filtering - search across all subcategory fields
  if (filters.subcategories?.length) {
    whereConditions.push({
      OR: [
        { subcategory: { in: filters.subcategories } },
        { subcategory2: { in: filters.subcategories } },
        { subcategory3: { in: filters.subcategories } },
        { subcategory4: { in: filters.subcategories } },
        { subcategory5: { in: filters.subcategories } },
      ],
    });
  }

  // Brand filtering through catalog_products relationship
  // Note: brandIds should contain UUIDs, not public_ids
  // The API returns public_ids but we need to map them to brand UUIDs
  if (filters.brandIds?.length) {
    whereConditions.push({
      catalog_products: {
        some: {
          brands: {
            public_id: { in: filters.brandIds },
          },
        },
      },
    });
  }

  // State/region filtering using province_code through addresses relationship
  if (filters.stateCodes?.length) {
    whereConditions.push({
      addresses: {
        province_code: { in: filters.stateCodes },
      },
    });
  }

  // Buyer segment filtering - INCLUSIVE: Show both segment-targeted and public listings
  if (filters.buyerSegments?.length) {
    // 1️⃣ Exclude listings that have an explicit *exclusion* rule for this buyer segment
    whereConditions.push({
      NOT: {
        catalog_listing_visibility_rules: {
          some: {
            rule_type: "BUYER_SEGMENT",
            rule_value: { in: filters.buyerSegments },
            is_inclusion: false,
          },
        },
      },
    });

    // 2️⃣ Include segment-targeted listings AND public listings only
    whereConditions.push({
      OR: [
        // Segment-targeted listings (explicit inclusion - includes both private and public with segment rules)
        {
          catalog_listing_visibility_rules: {
            some: {
              rule_type: "BUYER_SEGMENT",
              rule_value: { in: filters.buyerSegments },
              is_inclusion: true,
            },
          },
        },
        // Public listings (always available unless explicitly excluded)
        {
          is_private: false,
        },
      ],
    });
  }

  return whereConditions.length > 0 ? { AND: whereConditions } : {};
};

/**
 * Fetch auction listings (without preference filtering - just fetch all available)
 */
const fetchAuctionListings = async (): Promise<CombinedListing[]> => {
  try {
    const client = generateClient<Schema>();

    type QueryDataInput = {
      modelName: "auction_listings";
      operation: "findMany";
      query: string;
    };

    const query: FindManyArgs<"auction_listings"> = {
      where: { status: "ACTIVE" },
      take: 8,
      orderBy: { created_at: "desc" },
      relationLoadStrategy: "join",
      select: {
        public_id: true,
        title: true,
        description: true,
        category: true,
        subcategory: true,
        minimum_bid: true,
        auction_end_time: true,
        auction_bids: true,
        addresses: true, // For location filter extraction
        auction_listing_images: {
          select: {
            images: {
              select: {
                s3_key: true,
              },
            },
          },
        },
      },
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
        return parsedData.map((listing: any) => ({
          public_id: listing.public_id as string,
          title: listing.title as string,
          description: listing.description as string,
          category: listing.category as string,
          subcategory: listing.subcategory as string | null,
          minimum_order_value: listing.minimum_bid
            ? Number(listing.minimum_bid)
            : null,
          images:
            listing.auction_listing_images?.flatMap((img: any) =>
              img.images ? [{ s3_key: img.images.s3_key }] : []
            ) || [],
          addresses: (listing.addresses as any) || null,
          shipping_window: null,
          listing_source: "auction" as const,
          // Auction metrics for cards
          auction_end_time: listing.auction_end_time as string | null,
          total_bids: Array.isArray(listing.auction_bids)
            ? (listing.auction_bids as any[]).length
            : 0,
        }));
      }
    }

    return [];
  } catch {
    return [];
  }
};

/**
 * Fetch catalog listings based on filters
 */
const fetchCatalogListings = async (
  filters: PreferenceBasedQueryFilters
): Promise<CombinedListing[]> => {
  try {
    const client = generateClient<Schema>();
    const whereClause = buildCatalogQueryFilters(filters);

    type QueryDataInput = {
      modelName: "catalog_listings";
      operation: "findMany";
      query: string;
    };

    const query: FindManyArgs<"catalog_listings"> = {
      where: { ...whereClause, status: "ACTIVE" },
      relationLoadStrategy: "join",
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
        is_private: true,
        // Minimal variant fields for card metrics
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
      take: 8,
      orderBy: [{ created_at: "desc" }, { is_private: "desc" }],
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
        return parsedData.map((listing: Record<string, unknown>) => {
          // Compute metrics from minimal variant fields (if present)
          let totalUnits = 0;
          let totalOffer = 0;
          let totalRetail = 0;
          const products = listing.catalog_products as
            | Array<{
                catalog_product_variants?: Array<{
                  available_quantity: number;
                  retail_price: number | string | null;
                  offer_price: number | string | null;
                }>;
              }>
            | undefined;
          if (products) {
            for (const p of products) {
              for (const v of p.catalog_product_variants || []) {
                const qty = Number(v.available_quantity) || 0;
                const offer =
                  typeof v.offer_price === "string"
                    ? Number.parseFloat(v.offer_price)
                    : v.offer_price || 0;
                const retail =
                  typeof v.retail_price === "string"
                    ? Number.parseFloat(v.retail_price)
                    : v.retail_price || 0;
                totalUnits += qty;
                if (offer > 0) totalOffer += offer * qty;
                if (retail > 0) totalRetail += retail * qty;
              }
            }
          }
          const msrpPercent =
            totalRetail > 0
              ? ((totalRetail - totalOffer) / totalRetail) * 100
              : null;

          return {
            public_id: listing.public_id as string,
            title: listing.title as string,
            description: listing.description as string,
            category: listing.category as string,
            subcategory: listing.subcategory as string | null,
            minimum_order_value: listing.minimum_order_value
              ? Number(listing.minimum_order_value)
              : null,
            images:
              (
                listing.catalog_listing_images as Array<{
                  images?: { s3_key: string };
                }>
              )?.flatMap((img) =>
                img.images ? [{ s3_key: img.images.s3_key }] : []
              ) || [],
            shipping_window: listing.shipping_window as number | null,
            is_private: listing.is_private as boolean | null,
            listing_source: "catalog" as const,
            total_units: totalUnits,
            msrp_discount_percent: msrpPercent,
          };
        });
      }
    }

    return [];
  } catch {
    return [];
  }
};

/**
 * Specialized function to fetch private offers listings (for "Private Offers" section)
 * Only applies isPrivate filtering - matching mega menu logic
 */
export const fetchPrivateOffersListings = async (options?: {
  limit?: number;
}): Promise<PreferenceBasedListingsResponse> => {
  try {
    const client = generateClient<Schema>();

    // Build ONLY isPrivate filter - matching mega menu logic
    const whereClause: FindManyArgs<"catalog_listings">["where"] = {
      AND: [
        { status: "ACTIVE" },
        { is_private: true }, // Only private listings
      ],
    };

    type QueryDataInput = {
      modelName: "catalog_listings";
      operation: "findMany";
      query: string;
    };

    const query: FindManyArgs<"catalog_listings"> = {
      where: whereClause,
      relationLoadStrategy: "join",
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
        listing_condition: true, // For Condition filter
        packaging: true, // For Packaging filter
        is_private: true, // For Private filter
        addresses: true, // For Location filter
        catalog_products: {
          // For Brand filter
          select: {
            brands: {
              select: {
                brand_name: true,
              },
            },
            // Minimal variant fields for metrics
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
      ...(options?.limit ? { take: options.limit } : {}),
      orderBy: { created_at: "desc" },
    };

    const input: QueryDataInput = {
      modelName: "catalog_listings",
      operation: "findMany",
      query: JSON.stringify(query),
    };

    const { data: result } = await client.queries.queryData(input);

    let listings: CombinedListing[] = [];

    if (result) {
      const parsedData =
        typeof result === "string" ? JSON.parse(result) : result;

      if (Array.isArray(parsedData)) {
        listings = parsedData.map((listing: Record<string, any>) => {
          // Compute metrics from variants if present
          let totalUnits = 0;
          let totalOffer = 0;
          let totalRetail = 0;
          for (const p of listing.catalog_products || []) {
            for (const v of p.catalog_product_variants || []) {
              const qty = Number(v.available_quantity) || 0;
              const offer =
                typeof v.offer_price === "string"
                  ? Number.parseFloat(v.offer_price)
                  : v.offer_price || 0;
              const retail =
                typeof v.retail_price === "string"
                  ? Number.parseFloat(v.retail_price)
                  : v.retail_price || 0;
              totalUnits += qty;
              if (offer > 0) totalOffer += offer * qty;
              if (retail > 0) totalRetail += retail * qty;
            }
          }
          const msrpPercent =
            totalRetail > 0
              ? ((totalRetail - totalOffer) / totalRetail) * 100
              : null;

          return {
            public_id: listing.public_id as string,
            title: listing.title as string,
            description: listing.description as string,
            category: listing.category as string,
            subcategory: listing.subcategory as string | null,
            minimum_order_value: listing.minimum_order_value
              ? Number(listing.minimum_order_value)
              : null,
            images:
              listing.catalog_listing_images?.flatMap((img: any) =>
                img.images ? [{ s3_key: img.images.s3_key }] : []
              ) || [],
            shipping_window: listing.shipping_window as number | null,
            listing_source: "catalog" as const,
            // New filter fields for enhanced filtering
            listing_condition: listing.listing_condition ?? null,
            packaging: listing.packaging ?? null,
            is_private: listing.is_private ?? null,
            addresses: listing.addresses ?? null,
            brands:
              listing.catalog_products?.map((product: any) => ({
                brand_name: product.brands?.brand_name || null,
              })) || [],
            total_units: totalUnits,
            msrp_discount_percent: msrpPercent,
          };
        });
      }
    }

    // Sort by title
    listings.sort((a, b) => a.title.localeCompare(b.title));

    return {
      listings,
      totalCount: listings.length,
      appliedFilters: {
        /* isPrivate only */
      },
      isFiltered: true,
    };
  } catch {
    return {
      listings: [],
      totalCount: 0,
      appliedFilters: {},
      isFiltered: false,
    };
  }
};

// Result wrapper
export const fetchPrivateOffersListingsResult = async (): Promise<
  Result<PreferenceBasedListingsResponse>
> => {
  try {
    const data = await fetchPrivateOffersListings();
    return ok(data);
  } catch (e) {
    return err(formatBackendError(e));
  }
};

/**
 * Specialized function to fetch segment-only listings (for "Buyer Segment" section)
 * Only applies buyer segment filtering - no categories, brands, regions, etc.
 */
export const fetchSegmentOnlyListings = async (
  segmentEnums: string[],
  options?: { limit?: number }
): Promise<PreferenceBasedListingsResponse> => {
  try {
    if (!segmentEnums?.length) {
      return {
        listings: [],
        totalCount: 0,
        appliedFilters: { buyerSegments: [] },
        isFiltered: false,
      };
    }

    const client = generateClient<Schema>();

    // Base AND conditions applied to both targeted and public queries
    const baseAnd: NonNullable<FindManyArgs<"catalog_listings">["where"]>[] = [
      { status: "ACTIVE" },
      {
        NOT: {
          catalog_listing_visibility_rules: {
            some: {
              rule_type: "BUYER_SEGMENT",
              rule_value: {
                in: segmentEnums as unknown as $Enums.buyer_segment_type[],
              },
              is_inclusion: false,
            },
          },
        },
      },
    ];

    const targetedWhere: NonNullable<
      FindManyArgs<"catalog_listings">["where"]
    > = {
      AND: [
        ...baseAnd,
        {
          catalog_listing_visibility_rules: {
            some: {
              rule_type: "BUYER_SEGMENT",
              rule_value: {
                in: segmentEnums as unknown as $Enums.buyer_segment_type[],
              },
              is_inclusion: true,
            },
          },
        },
      ],
    };

    const publicWhere: NonNullable<FindManyArgs<"catalog_listings">["where"]> =
      {
        AND: [
          ...baseAnd,
          { is_private: false },
          {
            NOT: {
              catalog_listing_visibility_rules: {
                some: {
                  rule_type: "BUYER_SEGMENT",
                  rule_value: {
                    in: segmentEnums as unknown as $Enums.buyer_segment_type[],
                  },
                  is_inclusion: true,
                },
              },
            },
          },
        ],
      };

    type QueryDataInput = {
      modelName: "catalog_listings";
      operation: "findMany";
      query: string;
    };

    const selectFields = {
      public_id: true,
      title: true,
      description: true,
      category: true,
      subcategory: true,
      minimum_order_value: true,
      listing_condition: true,
      packaging: true,
      is_private: true,
      addresses: true,
      catalog_products: {
        select: {
          brands: {
            select: { brand_name: true },
          },
          catalog_product_variants: {
            select: {
              available_quantity: true,
              retail_price: true,
              offer_price: true,
            },
          },
        },
      },
      catalog_listing_images: {
        select: { images: { select: { s3_key: true } } },
      },
      shipping_window: true,
    } as const;

    const targetedQuery: FindManyArgs<"catalog_listings"> = {
      where: targetedWhere,
      relationLoadStrategy: "join",
      select: selectFields,
      ...(options?.limit ? { take: options.limit } : {}),
      orderBy: { created_at: "desc" },
    };

    const publicQuery: FindManyArgs<"catalog_listings"> = {
      where: publicWhere,
      relationLoadStrategy: "join",
      select: selectFields,
      ...(options?.limit ? { take: options.limit } : {}),
      orderBy: { created_at: "desc" },
    };

    const targetedInput: QueryDataInput = {
      modelName: "catalog_listings",
      operation: "findMany",
      query: JSON.stringify(targetedQuery),
    };
    const publicInput: QueryDataInput = {
      modelName: "catalog_listings",
      operation: "findMany",
      query: JSON.stringify(publicQuery),
    };

    const [{ data: targetedRes }, { data: publicRes }] = await Promise.all([
      client.queries.queryData(targetedInput),
      client.queries.queryData(publicInput),
    ]);

    const mapRecord = (listing: Record<string, unknown>): CombinedListing => {
      // Compute metrics from variant fields if present
      let totalUnits = 0;
      let totalOffer = 0;
      let totalRetail = 0;
      const products = listing.catalog_products as
        | Array<{
            brands?: { brand_name?: string | null };
            catalog_product_variants?: Array<{
              available_quantity: number;
              retail_price: number | string | null;
              offer_price: number | string | null;
            }>;
          }>
        | undefined;
      if (products) {
        for (const p of products) {
          for (const v of p.catalog_product_variants || []) {
            const qty = Number(v.available_quantity) || 0;
            const offer =
              typeof v.offer_price === "string"
                ? Number.parseFloat(v.offer_price)
                : v.offer_price || 0;
            const retail =
              typeof v.retail_price === "string"
                ? Number.parseFloat(v.retail_price)
                : v.retail_price || 0;
            totalUnits += qty;
            if (offer > 0) totalOffer += offer * qty;
            if (retail > 0) totalRetail += retail * qty;
          }
        }
      }
      const msrpPercent =
        totalRetail > 0
          ? ((totalRetail - totalOffer) / totalRetail) * 100
          : null;

      return {
        public_id: listing.public_id as string,
        title: listing.title as string,
        description: listing.description as string,
        category: listing.category as string,
        subcategory: listing.subcategory as string | null,
        listing_condition: listing.listing_condition as string | null,
        packaging: listing.packaging as string | null,
        is_private: listing.is_private as boolean | null,
        addresses: listing.addresses as {
          city?: string | null;
          province_code?: string | null;
          country_code?: string | null;
        } | null,
        brands:
          (
            listing.catalog_products as Array<{
              brands?: { brand_name?: string | null };
            }>
          )?.map((product) => ({
            brand_name: product.brands?.brand_name || null,
          })) || [],
        minimum_order_value: listing.minimum_order_value
          ? Number(listing.minimum_order_value)
          : null,
        images:
          (
            listing.catalog_listing_images as Array<{
              images?: { s3_key: string };
            }>
          )?.flatMap((img) =>
            img.images ? [{ s3_key: img.images.s3_key }] : []
          ) || [],
        shipping_window: listing.shipping_window as number | null,
        listing_source: "catalog" as const,
        total_units: totalUnits || null,
        msrp_discount_percent: msrpPercent,
      };
    };

    const targetedParsed =
      typeof targetedRes === "string" ? JSON.parse(targetedRes) : targetedRes;
    const publicParsed =
      typeof publicRes === "string" ? JSON.parse(publicRes) : publicRes;

    const targetedListings: CombinedListing[] = Array.isArray(targetedParsed)
      ? targetedParsed.map(mapRecord)
      : [];
    const publicListingsRaw: CombinedListing[] = Array.isArray(publicParsed)
      ? publicParsed.map(mapRecord)
      : [];

    // Remove duplicates: exclude any public listing already in targeted
    const targetedIds = new Set(targetedListings.map((l) => l.public_id));
    const publicListings = publicListingsRaw.filter(
      (l) => !targetedIds.has(l.public_id)
    );

    let combined = [...targetedListings, ...publicListings];
    if (options?.limit && combined.length > options.limit) {
      combined = combined.slice(0, options.limit);
    }

    return {
      listings: combined,
      totalCount: combined.length,
      appliedFilters: { buyerSegments: segmentEnums },
      isFiltered: true,
    };
  } catch {
    return {
      listings: [],
      totalCount: 0,
      appliedFilters: { buyerSegments: segmentEnums },
      isFiltered: false,
    };
  }
};

export const fetchSegmentOnlyListingsResult = async (
  segmentEnums: string[]
): Promise<Result<PreferenceBasedListingsResponse>> => {
  try {
    const data = await fetchSegmentOnlyListings(segmentEnums);
    return ok(data);
  } catch (e) {
    return err(formatBackendError(e));
  }
};

/**
 * Specialized function to fetch category-only listings (for "For You" section)
 * Only applies category filtering - no segments, brands, regions, etc.
 */
export const fetchCategoryOnlyListings = async (
  categoryEnums: string[],
  options?: { limit?: number }
): Promise<PreferenceBasedListingsResponse> => {
  try {
    if (!categoryEnums?.length) {
      return {
        listings: [],
        totalCount: 0,
        appliedFilters: { categories: [] },
        isFiltered: false,
      };
    }

    const client = generateClient<Schema>();

    // Build ONLY category filter - no other conditions
    const whereClause: FindManyArgs<"catalog_listings">["where"] = {
      AND: [
        { status: "ACTIVE" },
        {
          OR: [
            {
              category: {
                in: categoryEnums as unknown as $Enums.product_category_type[],
              },
            },
            {
              category2: {
                in: categoryEnums as unknown as $Enums.product_category_type[],
              },
            },
            {
              category3: {
                in: categoryEnums as unknown as $Enums.product_category_type[],
              },
            },
          ],
        },
      ],
    };

    type QueryDataInput = {
      modelName: "catalog_listings";
      operation: "findMany";
      query: string;
    };

    const query: FindManyArgs<"catalog_listings"> = {
      where: whereClause,
      relationLoadStrategy: "join",
      select: {
        public_id: true,
        title: true,
        description: true,
        category: true,
        subcategory: true,
        minimum_order_value: true,
        listing_condition: true, // For Condition filter
        packaging: true, // For Packaging filter
        is_private: true, // For Listing Format filter
        addresses: true, // For Location filter
        catalog_products: {
          // For Brand filter
          select: {
            brands: {
              select: {
                brand_name: true,
              },
            },
            catalog_product_variants: {
              select: {
                available_quantity: true,
                retail_price: true,
                offer_price: true,
              },
            },
          },
        },
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
      ...(options?.limit ? { take: options.limit } : {}),
      orderBy: { created_at: "desc" },
    };

    const input: QueryDataInput = {
      modelName: "catalog_listings",
      operation: "findMany",
      query: JSON.stringify(query),
    };

    const { data: result } = await client.queries.queryData(input);

    let listings: CombinedListing[] = [];

    if (result) {
      const parsedData =
        typeof result === "string" ? JSON.parse(result) : result;

      if (Array.isArray(parsedData)) {
        listings = parsedData.map((listing: Record<string, any>) => {
          // Compute metrics from minimal variant fields (if present)
          let totalUnits = 0;
          let totalOffer = 0;
          let totalRetail = 0;
          const products = listing.catalog_products as
            | Array<{
                brands?: { brand_name?: string | null };
                catalog_product_variants?: Array<{
                  available_quantity: number;
                  retail_price: number | string | null;
                  offer_price: number | string | null;
                }>;
              }>
            | undefined;
          for (const p of products || []) {
            for (const v of p.catalog_product_variants || []) {
              const qty = Number(v.available_quantity) || 0;
              const offer =
                typeof v.offer_price === "string"
                  ? Number.parseFloat(v.offer_price)
                  : v.offer_price || 0;
              const retail =
                typeof v.retail_price === "string"
                  ? Number.parseFloat(v.retail_price)
                  : v.retail_price || 0;
              totalUnits += qty;
              if (offer > 0) totalOffer += offer * qty;
              if (retail > 0) totalRetail += retail * qty;
            }
          }
          const msrpPercent =
            totalRetail > 0
              ? ((totalRetail - totalOffer) / totalRetail) * 100
              : null;

          return {
            public_id: listing.public_id as string,
            title: listing.title as string,
            description: listing.description as string,
            category: listing.category as string,
            subcategory: listing.subcategory as string | null,
            minimum_order_value: listing.minimum_order_value
              ? Number(listing.minimum_order_value)
              : null,
            listing_condition: listing.listing_condition as string | null,
            packaging: listing.packaging as string | null,
            is_private: listing.is_private as boolean | null,
            addresses: listing.addresses as {
              city?: string | null;
              province_code?: string | null;
              country_code?: string | null;
            } | null,
            brands:
              products?.map((product) => ({
                brand_name: product.brands?.brand_name || null,
              })) || [],
            images:
              (
                listing.catalog_listing_images as Array<{
                  images?: { s3_key: string };
                }>
              )?.flatMap((img) =>
                img.images ? [{ s3_key: img.images.s3_key }] : []
              ) || [],
            shipping_window: listing.shipping_window as number | null,
            listing_source: "catalog" as const,
            total_units: totalUnits,
            msrp_discount_percent: msrpPercent,
          };
        });
      }
    }

    // Sort by title
    listings.sort((a, b) => a.title.localeCompare(b.title));

    return {
      listings,
      totalCount: listings.length,
      appliedFilters: { categories: categoryEnums },
      isFiltered: true,
    };
  } catch {
    return {
      listings: [],
      totalCount: 0,
      appliedFilters: { categories: categoryEnums },
      isFiltered: false,
    };
  }
};

export const fetchCategoryOnlyListingsResult = async (
  categoryEnums: string[]
): Promise<Result<PreferenceBasedListingsResponse>> => {
  try {
    const data = await fetchCategoryOnlyListings(categoryEnums);
    return ok(data);
  } catch (e) {
    return err(formatBackendError(e));
  }
};

/**
 * Specialized function to fetch region-only listings (for "Near You" section)
 * Only applies state code filtering - no categories, segments, brands, etc.
 */
export const fetchRegionOnlyListings = async (
  regionCodes: string[],
  options?: { limit?: number }
): Promise<PreferenceBasedListingsResponse> => {
  try {
    if (!regionCodes?.length) {
      return {
        listings: [],
        totalCount: 0,
        appliedFilters: { stateCodes: [] },
        isFiltered: false,
      };
    }

    const client = generateClient<Schema>();

    // Build ONLY state code filter - no other conditions
    const whereClause: FindManyArgs<"catalog_listings">["where"] = {
      AND: [
        { status: "ACTIVE" },
        {
          addresses: {
            province_code: { in: regionCodes },
          },
        },
      ],
    };

    type QueryDataInput = {
      modelName: "catalog_listings";
      operation: "findMany";
      query: string;
    };

    const query: FindManyArgs<"catalog_listings"> = {
      where: whereClause,
      relationLoadStrategy: "join",
      select: {
        public_id: true,
        title: true,
        description: true,
        category: true,
        subcategory: true,
        minimum_order_value: true,
        listing_condition: true, // For Condition filter
        packaging: true, // For Packaging filter
        is_private: true, // For Listing Format filter (Private Offers vs Public Auctions)
        addresses: true, // For Location filter - single relation
        catalog_products: {
          // For Brand filter
          select: {
            brands: {
              select: {
                brand_name: true,
              },
            },
            catalog_product_variants: {
              select: {
                available_quantity: true,
                retail_price: true,
                offer_price: true,
              },
            },
          },
        },
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
      ...(options?.limit ? { take: options.limit } : {}),
      orderBy: { created_at: "desc" },
    };

    const input: QueryDataInput = {
      modelName: "catalog_listings",
      operation: "findMany",
      query: JSON.stringify(query),
    };

    const { data: result } = await client.queries.queryData(input);

    let listings: CombinedListing[] = [];

    if (result) {
      const parsedData =
        typeof result === "string" ? JSON.parse(result) : result;

      if (Array.isArray(parsedData)) {
        listings = parsedData.map((listing: Record<string, any>) => {
          // Compute metrics from available variant fields
          let totalUnits = 0;
          let totalOffer = 0;
          let totalRetail = 0;
          for (const p of listing.catalog_products || []) {
            for (const v of p.catalog_product_variants || []) {
              const qty = Number(v.available_quantity) || 0;
              const offer =
                typeof v.offer_price === "string"
                  ? Number.parseFloat(v.offer_price)
                  : v.offer_price || 0;
              const retail =
                typeof v.retail_price === "string"
                  ? Number.parseFloat(v.retail_price)
                  : v.retail_price || 0;
              totalUnits += qty;
              if (offer > 0) totalOffer += offer * qty;
              if (retail > 0) totalRetail += retail * qty;
            }
          }
          const msrpPercent =
            totalRetail > 0
              ? ((totalRetail - totalOffer) / totalRetail) * 100
              : null;

          return {
            public_id: listing.public_id as string,
            title: listing.title as string,
            description: listing.description as string,
            category: listing.category as string,
            subcategory: listing.subcategory as string | null,
            minimum_order_value: listing.minimum_order_value
              ? Number(listing.minimum_order_value)
              : null,
            images:
              (
                listing.catalog_listing_images as Array<{
                  images?: { s3_key: string };
                }>
              )?.flatMap((img) =>
                img.images ? [{ s3_key: img.images.s3_key }] : []
              ) || [],
            shipping_window: listing.shipping_window as number | null,
            listing_source: "catalog" as const,
            // New filter fields for enhanced filtering
            listing_condition: listing.listing_condition as string | null,
            packaging: listing.packaging as string | null,
            is_private: listing.is_private as boolean | null,
            addresses: listing.addresses as {
              city?: string | null;
              province_code?: string | null;
              country_code?: string | null;
            } | null,
            brands:
              (
                listing.catalog_products as
                  | Array<{
                      brands?: { brand_name?: string | null };
                    }>
                  | undefined
              )?.map((product) => ({
                brand_name: product.brands?.brand_name || null,
              })) || [],
            total_units: totalUnits || null,
            msrp_discount_percent: msrpPercent,
          };
        });
      }
    }

    // Sort by title
    listings.sort((a, b) => a.title.localeCompare(b.title));

    return {
      listings,
      totalCount: listings.length,
      appliedFilters: { stateCodes: regionCodes },
      isFiltered: true,
    };
  } catch {
    return {
      listings: [],
      totalCount: 0,
      appliedFilters: { stateCodes: regionCodes },
      isFiltered: false,
    };
  }
};

export const fetchRegionOnlyListingsResult = async (
  regionCodes: string[]
): Promise<Result<PreferenceBasedListingsResponse>> => {
  try {
    const data = await fetchRegionOnlyListings(regionCodes);
    return ok(data);
  } catch (e) {
    return err(formatBackendError(e));
  }
};

/**
 * Main function to fetch preference-based listings from both catalog and auction tables
 */
export const fetchPreferenceBasedListings = async (
  preferences: GetBuyerPreferenceApiRequest,
  sortingType: "alphabetical" | "segment-priority" = "alphabetical"
): Promise<PreferenceBasedListingsResponse> => {
  try {
    const filters = transformPreferencesToQueryFilters(preferences);

    // Determine which listing types to query based on preferences
    const shouldQueryCatalog =
      !filters.listingTypes || filters.listingTypes.includes("CATALOG");
    const shouldQueryAuction =
      !filters.listingTypes || filters.listingTypes.includes("AUCTION");

    const promises: Promise<CombinedListing[]>[] = [];

    if (shouldQueryCatalog) {
      promises.push(fetchCatalogListings(filters));
    }

    if (shouldQueryAuction) {
      promises.push(fetchAuctionListings());
    }

    // Execute queries in parallel
    const results = await Promise.all(promises);
    const allListings = results.flat();

    // Apply sorting based on sortingType parameter
    if (sortingType === "segment-priority") {
      // Sort with private listings first, then public listings (for Segments section)
      allListings.sort((a, b) => {
        // Private listings (is_private: true/null) come before public (is_private: false)
        if (a.is_private === false && b.is_private !== false) {
          return 1; // a (public) comes after b (private)
        }
        if (a.is_private !== false && b.is_private === false) {
          return -1; // a (private) comes before b (public)
        }
        return 0;
      });
    } else {
      // Sort alphabetically by title (for Categories For You, Near You, etc.)
      allListings.sort((a, b) => a.title.localeCompare(b.title));
    }

    // Total results are already limited by individual queries (5 each = 10 max)

    const isFiltered = Boolean(
      filters.categories ||
        filters.subcategories ||
        filters.brandIds ||
        filters.buyerSegments
    );

    return {
      listings: allListings,
      totalCount: allListings.length,
      appliedFilters: filters,
      isFiltered,
    };
  } catch {
    // Return empty results on error, don't throw
    return {
      listings: [],
      totalCount: 0,
      appliedFilters: transformPreferencesToQueryFilters(preferences),
      isFiltered: false,
    };
  }
};

export const fetchPreferenceBasedListingsResult = async (
  preferences: GetBuyerPreferenceApiRequest,
  sortingType: "alphabetical" | "segment-priority" = "alphabetical"
): Promise<Result<PreferenceBasedListingsResponse>> => {
  try {
    const data = await fetchPreferenceBasedListings(preferences, sortingType);
    return ok(data);
  } catch (e) {
    return err(formatBackendError(e));
  }
};
