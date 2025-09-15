import { PrismaClient } from "../../../lambda-layers/core-layer/nodejs/prisma/generated/client";
import { UserPreferencesDatabaseOperations } from "./UserPreferencesDatabaseOperations";

export interface SetBuyerPreferencesConfig {
  userId: string;
  requestType: "CREATE" | "ADD" | "DELETE";
  preferredCategories?: string[];
  preferredSubcategories?: string[];
  budgetMin?: number;
  budgetMax?: number;
  budgetCurrency?: string;
  minimumDiscountPercentage?: number;
  listingTypePreferences?: string[];
  buyerSegments?: string[];
  preferredRegions?: string[];
  preferredBrandIds?: string[];
}

export interface SetBuyerPreferencesResult {
  success: boolean;
  data?: {
    preferences: {
      buyer_profile_preference_id: string;
      preferred_categories: string[];
      preferred_subcategories: string[];
      budget_min: number | null;
      budget_max: number | null;
      budget_currency: string | null;
      minimum_discount_percentage: number | null;
      listing_type_preferences: string[];
      buyer_segments: string[];
      preferred_regions: string[];
      preferred_brands: Array<{
        brand_preference_id: string;
        brand_id: string;
        brand_name: string;
        public_id: string;
        created_at: Date | null;
      }>;
      created_at: Date | null;
      updated_at: Date | null;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export class UserPreferencesOperations {
  private dbOps: UserPreferencesDatabaseOperations;

  constructor(private prisma: PrismaClient) {
    this.dbOps = new UserPreferencesDatabaseOperations(prisma);
  }

  async setBuyerPreferences(
    config: SetBuyerPreferencesConfig
  ): Promise<SetBuyerPreferencesResult> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // Validate brand public IDs if provided and get internal IDs
        let brandMapping: { brand_id: string; public_id: string }[] = [];
        if (config.preferredBrandIds && config.preferredBrandIds.length > 0) {
          const brandValidation = await this.dbOps.validateBrandIds(
            config.preferredBrandIds,
            tx as PrismaClient
          );

          if (brandValidation.invalid.length > 0) {
            return {
              success: false,
              error: {
                code: "INVALID_BRAND_IDS",
                message: "One or more brand public IDs are invalid",
                details: brandValidation.invalid.map((publicId) => ({
                  public_id: publicId,
                  message: "Brand not found",
                })),
              },
            };
          }
          brandMapping = brandValidation.valid;
        }

        // Get buyer profile from user
        const user = await tx.users.findUnique({
          where: { user_id: config.userId },
          include: { buyer_profiles: true },
        });

        if (!user?.buyer_profiles) {
          return {
            success: false,
            error: {
              code: "BUYER_PROFILE_NOT_FOUND",
              message:
                "Buyer profile not found. Please create a buyer profile first.",
            },
          };
        }

        const buyerProfile = user.buyer_profiles;

        // Get or create buyer profile preferences
        let preferences = await this.dbOps.getBuyerPreferences(
          buyerProfile.buyer_profile_id,
          tx as PrismaClient
        );

        if (!preferences) {
          preferences = await this.dbOps.createBuyerPreferences(
            {
              buyer_profile_id: buyerProfile.buyer_profile_id,
              user_id: config.userId,
            },
            tx as PrismaClient
          );
        }

        // Handle array fields and scalar fields
        const updateData = await this.buildUpdateData(config, preferences);

        // Update preferences
        const updatedPreferences = await this.dbOps.updateBuyerPreferences(
          preferences.buyer_profile_preference_id,
          updateData,
          tx as PrismaClient
        );

        // Handle brand preferences
        if (config.preferredBrandIds && brandMapping.length > 0) {
          const internalBrandIds = brandMapping.map((b) => b.brand_id);
          await this.handleBrandPreferences(
            config.requestType,
            buyerProfile.buyer_profile_id,
            internalBrandIds,
            tx as PrismaClient
          );
        }

        // Get final preferences with brand data
        const finalPreferences = await this.dbOps.getBuyerPreferencesWithBrands(
          updatedPreferences.buyer_profile_preference_id,
          tx as PrismaClient
        );

        if (!finalPreferences) {
          return {
            success: false,
            error: {
              code: "INTERNAL_ERROR",
              message: "Failed to retrieve updated preferences",
            },
          };
        }

        // Format response
        const preferredBrands =
          finalPreferences.buyer_profiles.buyer_brand_preferences.map((bp) => ({
            brand_preference_id: bp.public_id,
            brand_id: bp.brand_id,
            brand_name: bp.brands.brand_name,
            public_id: bp.brands.public_id,
            created_at: bp.created_at,
          }));

        return {
          success: true,
          data: {
            preferences: {
              buyer_profile_preference_id:
                finalPreferences.buyer_profile_preference_id,
              preferred_categories: finalPreferences.preferred_categories || [],
              preferred_subcategories:
                finalPreferences.preferred_subcategories || [],
              budget_min: finalPreferences.budget_min
                ? Number(finalPreferences.budget_min)
                : null,
              budget_max: finalPreferences.budget_max
                ? Number(finalPreferences.budget_max)
                : null,
              budget_currency: finalPreferences.budget_currency,
              minimum_discount_percentage:
                finalPreferences.minimum_discount_percentage
                  ? Number(finalPreferences.minimum_discount_percentage)
                  : null,
              listing_type_preferences:
                finalPreferences.listing_type_preferences || [],
              buyer_segments: finalPreferences.buyer_segments || [],
              preferred_regions: finalPreferences.preferred_regions || [],
              preferred_brands: preferredBrands,
              created_at: finalPreferences.created_at,
              updated_at: finalPreferences.updated_at,
            },
          },
        };
      });
    } catch (error) {
      console.error("Error in setBuyerPreferences:", error);
      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message:
            "An internal error occurred while updating buyer preferences",
          details: {
            error: error instanceof Error ? error.message : String(error),
          },
        },
      };
    }
  }

  private async buildUpdateData(
    config: SetBuyerPreferencesConfig,
    preferences: any
  ): Promise<any> {
    const updateData: any = {};

    // Handle array fields based on request type
    if (config.preferredCategories) {
      updateData.preferred_categories = this.handleArrayField(
        config.requestType,
        preferences.preferred_categories || [],
        config.preferredCategories
      );
    }

    if (config.preferredSubcategories) {
      updateData.preferred_subcategories = this.handleArrayField(
        config.requestType,
        preferences.preferred_subcategories || [],
        config.preferredSubcategories
      );
    }

    if (config.listingTypePreferences) {
      updateData.listing_type_preferences = this.handleArrayField(
        config.requestType,
        preferences.listing_type_preferences || [],
        config.listingTypePreferences
      );
    }

    if (config.buyerSegments) {
      updateData.buyer_segments = this.handleArrayField(
        config.requestType,
        preferences.buyer_segments || [],
        config.buyerSegments
      );
    }

    if (config.preferredRegions) {
      updateData.preferred_regions = this.handleArrayField(
        config.requestType,
        preferences.preferred_regions || [],
        config.preferredRegions
      );
    }

    // Handle scalar fields
    if (config.budgetMin !== undefined) {
      updateData.budget_min =
        config.requestType === "DELETE" ? null : config.budgetMin;
    }

    if (config.budgetMax !== undefined) {
      updateData.budget_max =
        config.requestType === "DELETE" ? null : config.budgetMax;
    }

    if (config.budgetCurrency !== undefined) {
      updateData.budget_currency =
        config.requestType === "DELETE" ? null : config.budgetCurrency;
    }

    if (config.minimumDiscountPercentage !== undefined) {
      updateData.minimum_discount_percentage =
        config.requestType === "DELETE"
          ? null
          : config.minimumDiscountPercentage;
    }

    return updateData;
  }

  private handleArrayField(
    requestType: "CREATE" | "ADD" | "DELETE",
    existingValues: any[],
    newValues: any[]
  ): any[] {
    switch (requestType) {
      case "CREATE":
        return newValues;
      case "ADD":
        return [...new Set([...existingValues, ...newValues])];
      case "DELETE":
        return existingValues.filter(
          (value: any) => !newValues.includes(value)
        );
      default:
        return existingValues;
    }
  }

  private async handleBrandPreferences(
    requestType: "CREATE" | "ADD" | "DELETE",
    buyerProfileId: string,
    brandIds: string[],
    tx: PrismaClient
  ): Promise<void> {
    switch (requestType) {
      case "CREATE":
        // Delete all existing brand preferences
        await this.dbOps.deleteAllBrandPreferences(buyerProfileId, tx);
        // Create new brand preferences
        await this.dbOps.createBrandPreferences(buyerProfileId, brandIds, tx);
        break;

      case "ADD":
        // Add new brand preferences (skip if already exists)
        for (const brandId of brandIds) {
          if (brandId !== null && brandId !== undefined) {
            await this.dbOps.createBrandPreference(buyerProfileId, brandId, tx);
          }
        }
        break;

      case "DELETE":
        // Delete specified brand preferences
        await this.dbOps.deleteBrandPreferences(buyerProfileId, brandIds, tx);
        break;
    }
  }
}
