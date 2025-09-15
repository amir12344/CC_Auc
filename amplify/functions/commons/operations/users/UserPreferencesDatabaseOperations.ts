import {
  buyer_profile_preferences,
  buyer_segment_type,
  geographic_preference_region_type,
  listing_type_preference,
  PrismaClient,
  product_category_type,
  product_sub_category_type,
} from "../../../lambda-layers/core-layer/nodejs/prisma/generated/client";

export interface BuyerPreferencesData {
  buyer_profile_id: string;
  user_id: string;
  preferred_categories?: string[];
  preferred_subcategories?: string[];
  budget_min?: number;
  budget_max?: number;
  budget_currency?: string;
  minimum_discount_percentage?: number;
  listing_type_preferences?: string[];
  buyer_segments?: string[];
  preferred_regions?: string[];
}

export interface BuyerPreferencesWithBrands extends buyer_profile_preferences {
  buyer_profiles: {
    buyer_brand_preferences: Array<{
      public_id: string;
      brand_id: string;
      created_at: Date | null;
      brands: {
        brand_id: string;
        brand_name: string;
        public_id: string;
      };
    }>;
  };
}

export class UserPreferencesDatabaseOperations {
  constructor(private prisma: PrismaClient) {}

  /**
   * Get buyer profile preferences by buyer profile ID
   */
  async getBuyerPreferences(
    buyerProfileId: string,
    tx: PrismaClient = this.prisma
  ): Promise<buyer_profile_preferences | null> {
    return await tx.buyer_profile_preferences.findFirst({
      where: { buyer_profile_id: buyerProfileId },
    });
  }

  /**
   * Create initial buyer profile preferences
   */
  async createBuyerPreferences(
    data: BuyerPreferencesData,
    tx: PrismaClient = this.prisma
  ): Promise<buyer_profile_preferences> {
    return await tx.buyer_profile_preferences.create({
      data: {
        buyer_profile_id: data.buyer_profile_id,
        user_id: data.user_id,
        preferred_categories:
          (data.preferred_categories as product_category_type[]) || [],
        preferred_subcategories:
          (data.preferred_subcategories as product_sub_category_type[]) || [],
        budget_min: data.budget_min,
        budget_max: data.budget_max,
        budget_currency: data.budget_currency as any,
        minimum_discount_percentage: data.minimum_discount_percentage,
        listing_type_preferences:
          (data.listing_type_preferences as listing_type_preference[]) || [],
        buyer_segments: (data.buyer_segments as buyer_segment_type[]) || [],
        preferred_regions:
          (data.preferred_regions as geographic_preference_region_type[]) || [],
        created_at: new Date(),
      },
    });
  }

  /**
   * Update buyer profile preferences
   */
  async updateBuyerPreferences(
    preferencesId: string,
    updateData: any,
    tx: PrismaClient = this.prisma
  ): Promise<buyer_profile_preferences> {
    return await tx.buyer_profile_preferences.update({
      where: { buyer_profile_preference_id: preferencesId },
      data: {
        ...updateData,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Get buyer preferences with brand data
   */
  async getBuyerPreferencesWithBrands(
    preferencesId: string,
    tx: PrismaClient = this.prisma
  ): Promise<BuyerPreferencesWithBrands | null> {
    return await tx.buyer_profile_preferences.findUnique({
      where: { buyer_profile_preference_id: preferencesId },
      include: {
        buyer_profiles: {
          include: {
            buyer_brand_preferences: {
              include: {
                brands: {
                  select: {
                    brand_id: true,
                    brand_name: true,
                    public_id: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  /**
   * Convert brand public IDs to internal brand IDs
   */
  async convertBrandPublicIdsToInternalIds(
    brandPublicIds: string[],
    tx: PrismaClient = this.prisma
  ): Promise<{ brand_id: string; public_id: string }[]> {
    const validPublicIds = brandPublicIds.filter(
      (id) => id !== null && id !== undefined
    );

    if (validPublicIds.length === 0) {
      return [];
    }

    const brands = await tx.brands.findMany({
      where: { public_id: { in: validPublicIds } },
      select: { brand_id: true, public_id: true },
    });

    return brands;
  }

  /**
   * Delete all brand preferences for a buyer profile
   */
  async deleteAllBrandPreferences(
    buyerProfileId: string,
    tx: PrismaClient = this.prisma
  ): Promise<void> {
    await tx.buyer_brand_preferences.deleteMany({
      where: { buyer_profile_id: buyerProfileId },
    });
  }

  /**
   * Create multiple brand preferences
   */
  async createBrandPreferences(
    buyerProfileId: string,
    brandIds: string[],
    tx: PrismaClient = this.prisma
  ): Promise<void> {
    const validBrandIds = brandIds.filter(
      (id) => id !== null && id !== undefined
    );
    if (validBrandIds.length > 0) {
      await tx.buyer_brand_preferences.createMany({
        data: validBrandIds.map((brandId) => ({
          buyer_profile_id: buyerProfileId,
          brand_id: brandId,
          created_at: new Date(),
        })),
      });
    }
  }

  /**
   * Create single brand preference with error handling
   */
  async createBrandPreference(
    buyerProfileId: string,
    brandId: string,
    tx: PrismaClient = this.prisma
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await tx.buyer_brand_preferences.create({
        data: {
          buyer_profile_id: buyerProfileId,
          brand_id: brandId,
          created_at: new Date(),
        },
      });
      return { success: true };
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Unique constraint")
      ) {
        return { success: false, error: "Brand preference already exists" };
      }
      throw error;
    }
  }

  /**
   * Delete specific brand preferences
   */
  async deleteBrandPreferences(
    buyerProfileId: string,
    brandIds: string[],
    tx: PrismaClient = this.prisma
  ): Promise<void> {
    const validBrandIds = brandIds.filter(
      (id) => id !== null && id !== undefined
    );
    if (validBrandIds.length > 0) {
      await tx.buyer_brand_preferences.deleteMany({
        where: {
          buyer_profile_id: buyerProfileId,
          brand_id: { in: validBrandIds },
        },
      });
    }
  }

  /**
   * Get existing brand preferences for a buyer profile
   */
  async getExistingBrandPreferences(
    buyerProfileId: string,
    tx: PrismaClient = this.prisma
  ): Promise<string[]> {
    const preferences = await tx.buyer_brand_preferences.findMany({
      where: { buyer_profile_id: buyerProfileId },
      select: { brand_id: true },
    });
    return preferences.map((p) => p.brand_id);
  }

  /**
   * Validate brand public IDs exist and return mapping
   */
  async validateBrandIds(
    brandPublicIds: string[],
    tx: PrismaClient = this.prisma
  ): Promise<{
    valid: { brand_id: string; public_id: string }[];
    invalid: string[];
  }> {
    const validPublicIds = brandPublicIds.filter(
      (id) => id !== null && id !== undefined
    );

    const brandMapping = await this.convertBrandPublicIdsToInternalIds(
      validPublicIds,
      tx
    );
    const foundPublicIds = brandMapping.map((b) => b.public_id);
    const invalidPublicIds = validPublicIds.filter(
      (id) => !foundPublicIds.includes(id)
    );

    return {
      valid: brandMapping,
      invalid: invalidPublicIds,
    };
  }
}
