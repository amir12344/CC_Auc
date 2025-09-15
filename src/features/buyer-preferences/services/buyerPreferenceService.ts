import { generateClient } from "aws-amplify/api";
import { getCurrentUser } from "aws-amplify/auth";

import type { Schema } from "@/amplify/data/resource";
import type { FindManyArgs } from "@/src/lib/prisma/PrismaQuery.type";

import { SELLING_PLATFORM_DETAILS } from "../data/preferenceOptions";
import type {
  Brand,
  BuyerPreferenceApiRequest,
  BuyerPreferenceApiResponse,
  BuyerPreferencesApiResponseData,
  GetBuyerPreferenceApiRequest,
  LocalBuyerPreferences,
} from "../types/preferences";

/**
 * Transform local storage preferences to API format
 */
export const transformLocalPreferencesToApiFormat = (
  localPreferences: LocalBuyerPreferences
): BuyerPreferenceApiRequest => {
  return {
    requestType: "CREATE",
    preferredCategories: localPreferences.categories || [],
    preferredSubcategories: localPreferences.subcategories || [],
    budgetMin: localPreferences.minBudget,
    budgetMax: localPreferences.maxBudget,
    budgetCurrency: "USD",
    minimumDiscountPercentage: localPreferences.minimumDiscount
      ? Number.parseInt(
          localPreferences.minimumDiscount.replace("no-preference", "0"),
          10
        )
      : 0,
    listingTypePreferences: localPreferences.preferredTypes || [],
    buyerSegments: localPreferences.sellingPlatforms
      ? Object.entries(localPreferences.sellingPlatforms)
          .filter(([_, value]) => value === true)
          .map(([key]) => {
            const platform =
              SELLING_PLATFORM_DETAILS[
                key as keyof typeof SELLING_PLATFORM_DETAILS
              ];
            return platform?.key || key.toUpperCase();
          })
      : [],
    preferredRegions: localPreferences.preferredRegions || [],
    preferredBrandIds: localPreferences.brands || [],
  };
};

/**
 * Set buyer preferences using the API
 */
export const setBuyerPreferences = async (
  preferences: BuyerPreferenceApiRequest
): Promise<BuyerPreferenceApiResponse> => {
  try {
    const client = generateClient<Schema>({ authMode: "userPool" });

    // Use the setBuyerPreferences GraphQL operation
    const { data: result, errors: createErrors } =
      await client.queries.setBuyerPreferences({
        requestType: preferences.requestType,
        preferredCategories: preferences.preferredCategories || [],
        preferredSubcategories: preferences.preferredSubcategories || [],
        budgetMin: preferences.budgetMin,
        budgetMax: preferences.budgetMax,
        budgetCurrency: preferences.budgetCurrency,
        minimumDiscountPercentage: preferences.minimumDiscountPercentage || 0,
        listingTypePreferences: preferences.listingTypePreferences || [],
        // preferredConditions: preferences.preferredConditions || [],
        buyerSegments: preferences.buyerSegments || [],
        preferredRegions: preferences.preferredRegions || [],
        preferredBrandIds: preferences.preferredBrandIds || [],
      } as any);

    // Handle GraphQL errors
    if (createErrors && createErrors.length > 0) {
      return {
        success: false,
        message: createErrors[0].message || "GraphQL error occurred",
      };
    }

    // Handle the response
    if (result) {
      try {
        const parsedResult =
          typeof result === "string" ? JSON.parse(result) : result;

        // Check if the API returned an error in the response
        if (parsedResult.success === false) {
          return {
            success: false,
            message:
              parsedResult.error?.message || "Failed to save preferences",
            error: parsedResult.error,
          };
        }

        // Success case
        return {
          success: true,
          preferences,
        };
      } catch (parseError) {
        return {
          success: false,
          message: `Failed to parse response from server: ${(parseError as Error).message}`,
        };
      }
    }

    // No result returned - this might actually be success for create operations
    return {
      success: true,
      preferences,
    };
  } catch (error) {
    // Handle different error formats as specified by user
    if (error instanceof Error) {
      try {
        const errorMessage = error.message;
        // Try to parse if it's a JSON error response
        if (errorMessage.includes("{") && errorMessage.includes("}")) {
          const parsedError = JSON.parse(errorMessage);
          if (parsedError.success === false) {
            return {
              success: false,
              message:
                parsedError.error?.message || "Failed to save preferences",
              error: parsedError.error,
            };
          }
        }
      } catch (parseError) {
        // If parsing fails, use the original error message
        return {
          success: false,
          message:
            error instanceof Error
              ? `${error.message}: ${(parseError as Error).message}`
              : "An unknown error occurred",
        };
      }
    }

    return {
      success: false,
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
};

/**
 * Get buyer preferences from the API
 */
export const getAllBrands = async (params?: {
  search?: string;
  skip?: number;
  take?: number;
  ids?: string[];
}): Promise<Brand[]> => {
  // In-memory cache to avoid repeated network calls across step navigation
  // Keyed by normalized search string
  const staticAny = getAllBrands as any;
  if (!staticAny._brandsCache) {
    staticAny._brandsCache = new Map<string, Brand[]>();
  }
  const brandsCache: Map<string, Brand[]> = staticAny._brandsCache;

  try {
    const client = generateClient<Schema>();

    type QueryDataInput = {
      modelName: "brands";
      operation: "findMany";
      query: string;
    };

    const { search = "", skip = 0, take = 50, ids } = params || {};
    const cacheKey =
      ids && ids.length > 0
        ? `ids:${[...ids].sort().join(",")}`
        : search.trim().toLowerCase();
    const cached = brandsCache.get(cacheKey) || [];

    // Serve from cache when possible
    if (cached.length >= skip + take) {
      return cached.slice(skip, skip + take);
    }

    const query: FindManyArgs<"brands"> =
      ids && ids.length > 0
        ? ({
            select: { brand_name: true, public_id: true },
            where: { public_id: { in: ids as any } } as any,
            orderBy: { brand_name: "asc" } as any,
            skip,
            take,
          } as any)
        : ({
            select: { brand_name: true, public_id: true },
            where: search
              ? ({
                  brand_name: { contains: search, mode: "insensitive" },
                } as any)
              : undefined,
            orderBy: { brand_name: "asc" } as any,
            skip,
            take,
          } as any);

    const input: QueryDataInput = {
      modelName: "brands",
      operation: "findMany",
      query: JSON.stringify(query),
    };

    const { data: result } = await client.queries.queryData(input);

    if (result) {
      const parsedData =
        typeof result === "string" ? JSON.parse(result) : result;

      if (Array.isArray(parsedData)) {
        const page = parsedData as Brand[];
        if (skip === cached.length) {
          const merged = cached.concat(page);
          brandsCache.set(cacheKey, merged);
        }
        const nowCached = brandsCache.get(cacheKey) || [];
        return nowCached.length >= skip + take
          ? nowCached.slice(skip, skip + take)
          : page;
      }
    }
    return [];
  } catch {
    return [];
  }
};

/**
 * Delete buyer preferences using the API
 */
export const getBuyerPreferences = async (): Promise<
  GetBuyerPreferenceApiRequest[]
> => {
  try {
    const client = generateClient<Schema>();
    const currentUser = await getCurrentUser();

    type QueryDataInput = {
      modelName: "users";
      operation: "findMany";
      query: string;
    };

    const query: FindManyArgs<"users"> = {
      relationLoadStrategy: "join",
      where: {
        cognito_id: currentUser?.userId,
      },
      select: {
        buyer_profile_preferences: {
          select: {
            preferred_categories: true,
            preferred_subcategories: true,
            budget_min: true,
            budget_max: true,
            budget_currency: true,
            minimum_discount_percentage: true,
            listing_type_preferences: true,
            buyer_segments: true,
            preferred_regions: true,
          },
        },
        buyer_profiles: {
          select: {
            buyer_brand_preferences: {
              select: {
                brands: {
                  select: {
                    brand_name: true,
                    public_id: true,
                  },
                },
              },
            },
          },
        },
      },
      take: 1,
    };

    const input: QueryDataInput = {
      modelName: "users",
      operation: "findMany",
      query: JSON.stringify(query),
    };

    const { data: result } = await client.queries.queryData(input);

    if (result) {
      const parsedData =
        typeof result === "string" ? JSON.parse(result) : result;
      if (Array.isArray(parsedData)) {
        const buyerPreferences = parsedData.map(
          transformApiResponseToBuyerPreferences
        );
        return buyerPreferences;
      }
    }

    return [];
  } catch {
    return [];
  }
};

const transformApiResponseToBuyerPreferences = (
  data: BuyerPreferencesApiResponseData
): GetBuyerPreferenceApiRequest => {
  // buyer_profile_preferences is an array, get the first item
  const prefs = data.buyer_profile_preferences?.[0];

  // Extract brand IDs from buyer_profiles.buyer_brand_preferences
  const brandIds: string[] = [];
  if (data.buyer_profiles?.buyer_brand_preferences) {
    for (const brandPref of data.buyer_profiles.buyer_brand_preferences) {
      if (brandPref.brands?.public_id) {
        brandIds.push(brandPref.brands.public_id);
      }
    }
  }

  return {
    preferredCategories: prefs?.preferred_categories || [],
    preferredSubcategories: prefs?.preferred_subcategories || [],
    budgetMin: prefs?.budget_min ?? null,
    budgetMax: prefs?.budget_max ?? null,
    budgetCurrency: prefs?.budget_currency,
    minimumDiscountPercentage: prefs?.minimum_discount_percentage ?? 0,
    listingTypePreferences: prefs?.listing_type_preferences || [],
    buyerSegments: prefs?.buyer_segments || [],
    preferredRegions: prefs?.preferred_regions || [],
    preferredBrandIds: brandIds,
  };
};
