/**
 * Search Query Service
 *
 * Unified search service that handles both catalog listings and auction listings search.
 * This service provides direct Prisma calls for searching across both listing types
 * using PostgreSQL full-text search capabilities.
 *
 * Key Features:
 * - searchCatalogListings: Search catalog listings with full-text search
 * - searchAuctionListings: Search auction listings with full-text search
 * - Combined search results for unified search experience
 * - Proper field selection for UI components (CatalogCard, AuctionCard)
 * - S3 image URL processing for both listing types
 * - Performance optimization with regex constants
 *
 * Search Flow:
 * 1. User enters search query and submits (no calls on typing)
 * 2. searchListings calls both searchCatalogListings and searchAuctionListings
 * 3. Results are combined and returned to SearchResults component
 * 4. SearchResults displays both catalogs and auctions using appropriate card components
 */
import { generateClient } from "aws-amplify/api";
import { getUrl } from "aws-amplify/storage";

import type { Schema } from "@/amplify/data/resource";
import {
  fileToDbConditionBiMap,
  fileToDbLotConditionBiMap,
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
import { fetchListings } from "./megaMenuQueryService";

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
 * Calculate time left from auction end time
 */
// calculateTimeLeft is provided by the shared auction transforms

/**
 * Transform API response to CatalogListing with S3 image processing
 */
const transformApiResponseToCatalogListing = async (
  apiResponse: Parameters<typeof mapApiToCatalogListing>[0]
): Promise<CatalogListing> => mapApiToCatalogListing(apiResponse, getImageUrl);

/**
 * Transform API data to UI-ready AuctionListingItem format for search results
 * Only processes the essential fields needed for auction cards
 */
const transformToAuctionListing = async (
  apiData: Parameters<typeof mapApiToAuctionListing>[0]
): Promise<AuctionListingItem> => mapApiToAuctionListing(apiData, getImageUrl);

/**
 * Search catalog listings using Prisma PostgreSQL full-text search
 * @param searchQuery - The search terms (will be formatted for PostgreSQL full-text search)
 * @param options - Additional search options
 * @returns Promise<CatalogListing[]> - Array of matching catalog listings
 */
export const searchCatalogListings = async (
  searchQuery: string,
  options: {
    limit?: number;
    condition?: string;
    region?: string;
  } = {}
): Promise<CatalogListing[]> => {
  try {
    if (!searchQuery.trim()) {
      return [];
    }

    const client = generateClient<Schema>({ authMode: "apiKey" });
    const { limit = 25 } = options; // Reduced limit for combined search

    // Use contains with insensitive mode for broader compatibility
    // PostgreSQL full-text search can be added later if needed

    type QueryDataInput = {
      modelName: "catalog_listings";
      operation: "findMany";
      query: string;
    };

    const whereConditions: any[] = [
      { status: "ACTIVE" },
      {
        OR: [
          {
            title: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
          {
            catalog_products: {
              some: {
                OR: [
                  {
                    title: {
                      contains: searchQuery,
                      mode: "insensitive",
                    },
                  },
                  {
                    description: {
                      contains: searchQuery,
                      mode: "insensitive",
                    },
                  },
                  {
                    catalog_product_variants: {
                      some: {
                        OR: [
                          {
                            title: {
                              contains: searchQuery,
                              mode: "insensitive",
                            },
                          },
                          {
                            variant_name: {
                              contains: searchQuery,
                              mode: "insensitive",
                            },
                          },
                        ],
                      },
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    ];

    // Add condition filter if provided
    if (options.condition) {
      // First try direct mapping (for detailed condition names)
      const mappedCondition = fileToDbConditionBiMap.getValue(
        options.condition
      );

      if (mappedCondition) {
        whereConditions.push({ listing_condition: mappedCondition });
      } else {
        // If no direct mapping, try simplified condition mapping with multiple conditions
        const detailedConditions = mapSimplifiedConditionToCatalogConditions(
          options.condition
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
            whereConditions.push({
              OR: mappedConditions.map((condition) => ({
                listing_condition: condition,
              })),
            });
          }
        } else {
          // If no simplified mapping found, use the original condition as uppercase
          whereConditions.push({
            listing_condition: options.condition.toUpperCase(),
          });
        }
      }
    }

    // Add region filter if provided
    if (options.region) {
      // Convert region names to state codes and filter by addresses table
      const stateCodes = getStateCodesForRegions([options.region]);
      if (stateCodes.length > 0) {
        whereConditions.push({
          addresses: {
            province_code: {
              in: stateCodes,
            },
          },
        });
      }
    }

    const query: FindManyArgs<"catalog_listings"> = {
      relationLoadStrategy: "join",
      where: {
        AND: whereConditions,
      },
      select: {
        public_id: true,
        title: true,
        description: true,
        category: true,
        subcategory: true,
        minimum_order_value: true,
        listing_condition: true, // For condition filter
        packaging: true, // For packaging filter
        is_private: true, // For listing format filter
        addresses: {
          select: {
            city: true,
            province: true, // Full province name for location filter display
            province_code: true,
            country_code: true,
          },
        }, // For location filter
        catalog_products: {
          select: {
            // Include product-level prices as fallback when variant prices are missing
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
        }, // For brand filter
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
        // Process images asynchronously for all listings
        const catalogListings = await Promise.all(
          parsedData.map(transformApiResponseToCatalogListing)
        );
        return catalogListings;
      }
    }

    return [];
  } catch {
    // Silent error handling - return empty array on any error
    return [];
  }
};

/**
 * Search auction listings using case-insensitive text search
 * @param searchQuery - The search terms
 * @param options - Additional search options
 * @returns Promise<AuctionListingItem[]> - Array of matching auction listings
 */
export const searchAuctionListings = async (
  searchQuery: string,
  options: {
    limit?: number;
    condition?: string;
    region?: string;
    category?: string;
    category2?: string;
    subcategory?: string;
    subcategory2?: string;
  } = {}
): Promise<AuctionListingItem[]> => {
  try {
    if (!searchQuery.trim()) {
      return [];
    }

    const client = generateClient<Schema>({ authMode: "apiKey" });
    const { limit = 25 } = options; // Reduced limit for combined search

    type QueryDataInput = {
      modelName: "auction_listings";
      operation: "findMany";
      query: string;
    };

    const whereConditions: any[] = [
      { status: "ACTIVE" },
      {
        OR: [
          {
            title: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
          {
            short_title: {
              contains: searchQuery,
              mode: "insensitive",
            },
          },
          // Note: category, subcategory, subcategory2 are ENUMs and cannot use 'contains'
          // Text search focuses on string fields that support contains operations
          // Category/subcategory filtering should be done through dedicated filters, not full-text search
          // Include auction manifest data in search
          {
            auction_listing_product_manifests: {
              some: {
                OR: [
                  {
                    title: {
                      contains: searchQuery,
                      mode: "insensitive",
                    },
                  },
                  {
                    description: {
                      contains: searchQuery,
                      mode: "insensitive",
                    },
                  },
                  {
                    brands: {
                      brand_name: {
                        contains: searchQuery,
                        mode: "insensitive",
                      },
                    },
                  },
                  {
                    model_name: {
                      contains: searchQuery,
                      mode: "insensitive",
                    },
                  },
                ],
              },
            },
          },
        ],
      },
    ];

    // Add condition filter if provided
    if (options.condition) {
      // First try direct mapping (for detailed condition names)
      const mappedCondition = fileToDbLotConditionBiMap.getValue(
        options.condition
      );

      if (mappedCondition) {
        whereConditions.push({ lot_condition: mappedCondition });
      } else {
        // If no direct mapping, try simplified condition mapping with multiple conditions
        const detailedConditions = mapSimplifiedConditionToAuctionConditions(
          options.condition
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
            whereConditions.push({
              OR: mappedConditions.map((condition) => ({
                lot_condition: condition,
              })),
            });
          }
        } else {
          // If no simplified mapping found, try catalog condition BiMap as fallback, then uppercase
          const fallbackCondition =
            fileToDbConditionBiMap.getValue(options.condition) ||
            options.condition.toUpperCase();
          whereConditions.push({ lot_condition: fallbackCondition });
        }
      }
    }

    // Add region filter if provided
    if (options.region) {
      // Convert region names to state codes and filter by addresses table
      const stateCodes = getStateCodesForRegions([options.region]);
      if (stateCodes.length > 0) {
        whereConditions.push({
          addresses: {
            province_code: {
              in: stateCodes,
            },
          },
        });
      }
    }

    // Add category filters
    if (options.category) {
      whereConditions.push({ category: { equals: options.category } });
    }

    if (options.category2) {
      whereConditions.push({ category2: { equals: options.category2 } });
    }

    // Add subcategory filters
    if (options.subcategory) {
      whereConditions.push({ subcategory: { equals: options.subcategory } });
    }

    if (options.subcategory2) {
      whereConditions.push({ subcategory2: { equals: options.subcategory2 } });
    }

    const query: FindManyArgs<"auction_listings"> = {
      relationLoadStrategy: "join",
      where: {
        AND: whereConditions,
      },
      select: {
        public_id: true,
        title: true,
        category: true, // For category filter
        subcategory: true,
        lot_condition: true, // For condition filter (auction uses lot_condition)
        addresses: {
          select: {
            city: true,
            province: true, // For location filter extraction
            province_code: true,
            country_code: true,
          },
        }, // For location filter
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
        // Include auction manifest for comprehensive search
        auction_listing_product_manifests: {
          select: {
            title: true,
            description: true,
            brands: {
              select: {
                brand_name: true,
              },
            },
            model_name: true,
          },
        },
      },
      take: limit,
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

    return [];
  } catch {
    // Silent error handling - return empty array on any error
    return [];
  }
};

export interface SearchResult {
  catalogs: CatalogListing[];
  auctions: AuctionListingItem[];
  total: number;
  executionTime: number;
  query: string;
}

/**
 * Unified search function that handles both text-based and filter-based searches
 * This function calls searchCatalogListings/searchAuctionListings for text queries
 * and fetchListings for filter-based queries (like mega menu selections)
 *
 * @param query - Search query string (minimum 1 character)
 * @param filters - Filter options for category-based searches
 * @param options - Search options including result limits
 * @returns SearchResult with separate arrays for catalogs and auctions
 */
export const searchListings = async (
  query: string,
  filters: {
    categories?: string;
    subcategory?: string;
    condition?: string;
    featured?: boolean;
    type?: string;
    region?: string;
    isPrivate?: boolean;
    isNew?: boolean;
    category?: string;
    category2?: string;
    subcategory2?: string;
  } = {},
  options: { limit?: number } = {}
): Promise<SearchResult> => {
  const startTime = performance.now();
  const hasQuery = query.trim().length > 0;
  const hasFilters = Object.values(filters).some(
    (value) =>
      value !== undefined && value !== null && value !== "" && value !== false
  );

  // If no query and no filters, return empty results
  if (!hasQuery && !hasFilters) {
    return {
      catalogs: [],
      auctions: [],
      total: 0,
      executionTime: 0,
      query: "",
    };
  }

  try {
    const { limit = 50 } = options;
    let catalogResults: CatalogListing[] = [];
    let auctionResults: AuctionListingItem[] = [];

    if (hasQuery && !hasFilters) {
      // Text-based search using existing search functions
      const perTypeLimit = Math.ceil(limit / 2);
      const [catalogSearchResults, auctionSearchResults] = await Promise.all([
        searchCatalogListings(query.trim(), { limit: perTypeLimit }),
        searchAuctionListings(query.trim(), { limit: perTypeLimit }),
      ]);
      catalogResults = catalogSearchResults;
      auctionResults = auctionSearchResults;
    } else if (!hasQuery && hasFilters) {
      // Filter-only search using fetchListings from megaMenuQueryService
      const filterParams = {
        category: filters.categories,
        subcategory: filters.subcategory,
        condition: filters.condition,
        featured: filters.featured,
        region: filters.region,
        isPrivate: filters.isPrivate,
        isNew: filters.isNew,
      };

      const perTypeLimit = Math.ceil(limit / 2);

      // Fetch listings based on type filter
      if (filters.type?.toLowerCase() === "auction") {
        // Only fetch auction listings for Live Auctions
        const auctionFilterResults = await fetchListings(
          "auction_listings",
          filterParams,
          limit
        );
        catalogResults = [];
        auctionResults = auctionFilterResults as AuctionListingItem[];
      } else {
        // Fetch both catalog and auction listings for other filters
        const [catalogFilterResults, auctionFilterResults] = await Promise.all([
          fetchListings("catalog_listings", filterParams, perTypeLimit),
          fetchListings("auction_listings", filterParams, perTypeLimit),
        ]);
        catalogResults = catalogFilterResults as CatalogListing[];
        auctionResults = auctionFilterResults as AuctionListingItem[];
      }
    } else if (hasQuery && hasFilters) {
      // Combined text + filter search - use text search with condition and region filters
      const perTypeLimit = Math.ceil(limit / 2);
      const searchOptions = {
        limit: perTypeLimit,
        ...(filters.condition && { condition: filters.condition }),
        ...(filters.region && { region: filters.region }),
      };

      const [catalogSearchResults, auctionSearchResults] = await Promise.all([
        searchCatalogListings(query.trim(), searchOptions),
        searchAuctionListings(query.trim(), searchOptions),
      ]);
      catalogResults = catalogSearchResults;
      auctionResults = auctionSearchResults;
    }

    const executionTime = performance.now() - startTime;
    const total = catalogResults.length + auctionResults.length;

    return {
      catalogs: catalogResults,
      auctions: auctionResults,
      total,
      executionTime,
      query: query.trim(),
    };
  } catch {
    // Silent error handling - return empty results on any error
    return {
      catalogs: [],
      auctions: [],
      total: 0,
      executionTime: performance.now() - startTime,
      query: query.trim(),
    };
  }
};

/**
 * Helper function to extract title words from a listing
 */
const extractTitleWords = (title: string, queryLower: string): string[] => {
  const titleWords = title.toLowerCase().split(" ");
  return titleWords.filter(
    (word) => word.includes(queryLower) && word.length > 2
  );
};

/**
 * Helper function to add category suggestions
 */
const addCategorySuggestions = (
  suggestions: Set<string>,
  category: string | null | undefined,
  queryLower: string
): void => {
  if (category?.toLowerCase().includes(queryLower)) {
    suggestions.add(category);
  }
};

/**
 * Generate search suggestions from results
 *
 * This function extracts meaningful suggestions from search results to provide
 * autocomplete functionality. It processes both catalog and auction titles, categories,
 * and subcategories to generate relevant suggestions for the user.
 *
 * @param query - Current search query (minimum 2 characters for suggestions)
 * @param catalogs - Catalog search results to extract suggestions from
 * @param auctions - Auction search results to extract suggestions from
 * @returns Array of suggestion strings (limited to 8 for performance)
 */
export const generateSearchSuggestions = (
  query: string,
  catalogs: CatalogListing[],
  auctions: AuctionListingItem[] = []
): string[] => {
  if (!query.trim() || query.length < 2) {
    return [];
  }

  const suggestions = new Set<string>();
  const queryLower = query.toLowerCase();

  // Process catalog listings
  for (const listing of catalogs) {
    const titleWords = extractTitleWords(listing.title, queryLower);
    for (const word of titleWords) {
      suggestions.add(word);
    }

    addCategorySuggestions(suggestions, listing.category, queryLower);
    addCategorySuggestions(suggestions, listing.subcategory, queryLower);
  }

  // Process auction listings
  for (const listing of auctions) {
    const titleWords = extractTitleWords(listing.title, queryLower);
    for (const word of titleWords) {
      suggestions.add(word);
    }

    addCategorySuggestions(suggestions, listing.subcategory, queryLower);
  }

  return Array.from(suggestions).slice(0, 8); // Limit to 8 suggestions for UX
};

/**
 * Generate the correct route for a listing based on its type
 *
 * This function handles the routing logic to direct users to the appropriate
 * detail pages based on whether they clicked on a catalog or auction listing.
 *
 * @param listingType - Type of listing ('catalog' | 'auction')
 * @param listingId - ID of the listing
 * @returns Correct route path for the listing detail page
 */
export const getListingRoute = (
  listingType: "catalog" | "auction",
  listingId: string
): string => {
  switch (listingType) {
    case "catalog":
      return `/marketplace/catalog/${listingId}`;
    case "auction":
      return `/marketplace/auction/${listingId}`;
    default:
      return "/marketplace";
  }
};
