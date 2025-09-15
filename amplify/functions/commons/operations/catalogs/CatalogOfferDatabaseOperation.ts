import {
  catalog_offer_item_status_type,
  currency_code_type,
  offer_negotiation_status_type,
  offer_status_type,
  Prisma,
  PrismaClient,
} from "../../../lambda-layers/core-layer/nodejs/prisma/generated/client";

export interface CatalogOfferDetails {
  catalog_offer_id: string;
  public_id: string;
  catalog_listing_id: string;
  listing_title: string;
  listing_description?: string;
  seller_user_id: string;
  seller_profile_id: string;
  seller_info: {
    username: string;
    company?: string;
    display_name: string;
  };
  buyer_user_id: string;
  buyer_profile_id: string;
  buyer_info: {
    username: string;
    company?: string;
    display_name: string;
  };
  offer_status: offer_status_type;
  total_offer_value?: number;
  total_offer_value_currency?: currency_code_type;
  current_round: number;
  item_count: number;
  expires_at?: Date;
  created_at: Date;
  updated_at?: Date;
  last_activity?: Date;
  items: CatalogOfferItemDetails[];
}

export interface CatalogOfferItemDetails {
  catalog_offer_item_id: string;
  catalog_product_variant_id: string;
  variant_sku: string;
  variant_name?: string;
  product_title: string;
  product_description?: string;
  brand_name: string;
  default_image_url?: string;
  requested_quantity: number;
  buyer_offer_price?: number;
  buyer_offer_price_currency?: currency_code_type;
  seller_offer_price?: number;
  seller_offer_price_currency?: currency_code_type;
  negotiation_status: offer_negotiation_status_type;
  item_status: catalog_offer_item_status_type;
  item_version: number;
  added_in_round: number;
  removed_in_round?: number;
  current_negotiation?: {
    negotiation_id: string;
    action_type: string;
    offer_price_per_unit: number;
    offer_price_currency: currency_code_type;
    offer_quantity: number;
    offer_message?: string;
    valid_until?: Date;
    created_at: Date;
  };
}

export interface CatalogOfferSummary {
  catalog_offer_id: string;
  public_id: string;
  catalog_listing_id: string;
  listing_title: string;
  seller_company?: string;
  buyer_company?: string;
  offer_status: offer_status_type;
  total_offer_value?: number;
  total_offer_value_currency?: currency_code_type;
  item_count: number;
  current_round: number;
  expires_at?: Date;
  created_at: Date;
  last_activity?: Date;
}

export interface OfferListResponse {
  offers: CatalogOfferSummary[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}

export interface CatalogOfferNegotiation {
  negotiation_id: string;
  public_id: string;
  catalog_offer_item_id: string;
  product_title: string;
  variant_name?: string;
  variant_sku: string;
  negotiation_round: number;
  action_type: string;
  offered_by_user_id: string;
  offered_by_name: string;
  offer_price_per_unit: number;
  offer_price_currency: currency_code_type;
  offer_quantity: number;
  offer_status: string;
  offer_message?: string;
  includes_item_changes: boolean;
  item_change_summary?: string;
  valid_until?: Date;
  created_at: Date;
  responded_at?: Date;
}

export interface CatalogOfferModificationResult {
  catalog_offer_id: string;
  public_id: string;
  previous_total_value: number;
  new_total_value: number;
  modifications_count: number;
  items_added: number;
  items_updated: number;
  items_removed: number;
  auto_accepted: boolean;
  order_created: boolean;
  order_public_id?: string;
  modification_timestamp: Date;
}

export interface CatalogListingValidationResult {
  success: boolean;
  error?: { code: string; message: string; details?: any };
  catalogListing?: {
    catalog_listing_id: string;
    public_id: string;
    title: string;
    status: string;
    seller_user_id: string;
    seller_profile_id: string;
    minimum_order_value?: number;
    minimum_order_value_currency?: string;
    is_private: boolean;
  };
}

export interface VariantLookupBySkuResult {
  success: boolean;
  error?: { code: string; message: string; details?: any };
  variants?: Array<{
    catalog_product_variant_id: string;
    variant_sku: string;
    variant_name?: string;
    title?: string;
    available_quantity?: number;
    min_order_quantity?: number;
    max_order_quantity?: number;
    is_active: boolean;
    catalog_product_id: string;
    product_title: string;
    brand_name: string;
    catalog_listing_id: string;
  }>;
}

export class CatalogOfferDatabaseOperations {
  constructor(private prisma: PrismaClient) {}

  /**
   * Get detailed catalog offer information
   */
  async getCatalogOfferDetails(
    catalogOfferId: string,
    userId?: string
  ): Promise<CatalogOfferDetails | null> {
    // Determine if catalogOfferId is public_id or internal UUID
    let whereClause: any;
    if (catalogOfferId.length === 14) {
      whereClause = { public_id: catalogOfferId };
    } else {
      whereClause = { catalog_offer_id: catalogOfferId };
    }

    const catalogOffer = await this.prisma.catalog_offers.findUnique({
      where: whereClause,
      include: {
        catalog_listings: {
          select: {
            catalog_listing_id: true,
            title: true,
            description: true,
          },
        },
        seller_profiles: {
          include: {
            users: {
              select: {
                username: true,
                company: true,
                first_name: true,
                last_name: true,
              },
            },
          },
        },
        buyer_profiles: {
          include: {
            users: {
              select: {
                username: true,
                company: true,
                first_name: true,
                last_name: true,
              },
            },
          },
        },
        catalog_offer_items: {
          where: { item_status: { not: "REMOVED" } },
          include: {
            catalog_product_variants: {
              include: {
                catalog_products: {
                  include: {
                    brands: true,
                  },
                },
              },
            },
            current_buyer_negotiation: {
              select: {
                catalog_offer_negotiation_id: true,
                action_type: true,
                offer_price_per_unit: true,
                offer_price_currency: true,
                offer_quantity: true,
                offer_message: true,
                valid_until: true,
                created_at: true,
              },
            },
            current_seller_negotiation: {
              select: {
                catalog_offer_negotiation_id: true,
                action_type: true,
                offer_price_per_unit: true,
                offer_price_currency: true,
                offer_quantity: true,
                offer_message: true,
                valid_until: true,
                created_at: true,
              },
            },
          },
          orderBy: { added_in_round: "asc" },
        },
      },
    });

    if (!catalogOffer) return null;

    // Calculate current round based on negotiations
    const currentRound = await this.getCurrentNegotiationRound(
      catalogOffer.catalog_offer_id
    );

    // Get last activity timestamp
    const lastActivity = await this.getLastActivityTimestamp(
      catalogOffer.catalog_offer_id
    );

    // Format seller info
    const sellerInfo = {
      username: catalogOffer.seller_profiles.users.username,
      company: catalogOffer.seller_profiles.users.company || undefined,
      display_name:
        catalogOffer.seller_profiles.users.company ||
        `${catalogOffer.seller_profiles.users.first_name} ${catalogOffer.seller_profiles.users.last_name}`.trim() ||
        catalogOffer.seller_profiles.users.username,
    };

    // Format buyer info
    const buyerInfo = {
      username: catalogOffer.buyer_profiles.users.username,
      company: catalogOffer.buyer_profiles.users.company || undefined,
      display_name:
        catalogOffer.buyer_profiles.users.company ||
        `${catalogOffer.buyer_profiles.users.first_name} ${catalogOffer.buyer_profiles.users.last_name}`.trim() ||
        catalogOffer.buyer_profiles.users.username,
    };

    // Format items
    const items: CatalogOfferItemDetails[] =
      catalogOffer.catalog_offer_items.map((item) => {
        const variant = item.catalog_product_variants;

        // Add null check for variant
        if (!variant) {
          throw new Error(
            `Product variant not found for offer item ${item.catalog_offer_item_id}`
          );
        }

        const product = variant.catalog_products;
        const brand = product.brands;

        // Determine current negotiation
        const currentNegotiation =
          item.current_seller_negotiation || item.current_buyer_negotiation;

        return {
          catalog_offer_item_id: item.catalog_offer_item_id,
          catalog_product_variant_id: item.catalog_product_variant_id!,
          variant_sku: variant.variant_sku,
          variant_name: variant.variant_name || undefined,
          product_title: variant.title || product.title,
          product_description:
            variant.description || product.description || undefined,
          brand_name: brand.brand_name,
          default_image_url:
            variant.default_image_url || product.default_image_url || undefined,
          requested_quantity: item.requested_quantity ?? 0, // Default to 0 if null
          buyer_offer_price: item.buyer_offer_price
            ? Number(item.buyer_offer_price)
            : undefined,
          buyer_offer_price_currency:
            item.buyer_offer_price_currency || undefined,
          seller_offer_price: item.seller_offer_price
            ? Number(item.seller_offer_price)
            : undefined,
          seller_offer_price_currency:
            item.seller_offer_price_currency || undefined,
          negotiation_status: item.negotiation_status!, // Force non-null assertion
          item_status: item.item_status!, // Force non-null assertion
          item_version: item.item_version ?? 0, // Default to 0 if null
          added_in_round: item.added_in_round ?? 1, // Default to round 1 if null
          removed_in_round: item.removed_in_round || undefined,
          current_negotiation: currentNegotiation
            ? {
                negotiation_id: currentNegotiation.catalog_offer_negotiation_id,
                action_type: String(currentNegotiation.action_type), // Convert enum to string
                offer_price_per_unit: Number(
                  currentNegotiation.offer_price_per_unit
                ),
                offer_price_currency: currentNegotiation.offer_price_currency!,
                offer_quantity: currentNegotiation.offer_quantity ?? 0, // Default to 0 if null
                offer_message: currentNegotiation.offer_message || undefined,
                valid_until: currentNegotiation.valid_until || undefined,
                created_at: currentNegotiation.created_at ?? new Date(), // Default to current date if null
              }
            : undefined,
        };
      });

    return {
      catalog_offer_id: catalogOffer.catalog_offer_id,
      public_id: catalogOffer.public_id,
      catalog_listing_id: catalogOffer.catalog_listing_id,
      listing_title: catalogOffer.catalog_listings.title,
      listing_description:
        catalogOffer.catalog_listings.description || undefined,
      seller_user_id: catalogOffer.seller_user_id,
      seller_profile_id: catalogOffer.seller_profile_id,
      seller_info: sellerInfo,
      buyer_user_id: catalogOffer.buyer_user_id,
      buyer_profile_id: catalogOffer.buyer_profile_id,
      buyer_info: buyerInfo,
      offer_status: catalogOffer.offer_status!,
      total_offer_value: catalogOffer.total_offer_value
        ? Number(catalogOffer.total_offer_value)
        : undefined,
      total_offer_value_currency:
        catalogOffer.total_offer_value_currency || undefined,
      current_round: currentRound,
      item_count: items.length,
      expires_at: catalogOffer.expires_at || undefined,
      created_at: catalogOffer.created_at!,
      updated_at: catalogOffer.updated_at || undefined,
      last_activity: lastActivity,
      items,
    };
  }

  /**
   * List catalog offers with filtering and pagination
   */
  async listCatalogOffers(
    options: {
      seller_user_id?: string;
      buyer_user_id?: string;
      catalog_listing_id?: string;
      offer_status?: offer_status_type;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<OfferListResponse> {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: Prisma.catalog_offersWhereInput = {};

    if (options.seller_user_id) {
      whereClause.seller_user_id = options.seller_user_id;
    }

    if (options.buyer_user_id) {
      whereClause.buyer_user_id = options.buyer_user_id;
    }

    if (options.catalog_listing_id) {
      whereClause.catalog_listing_id = options.catalog_listing_id;
    }

    if (options.offer_status) {
      whereClause.offer_status = options.offer_status;
    }

    // Parallelize count and data fetch
    const [total, catalogOffers] = await Promise.all([
      this.prisma.catalog_offers.count({ where: whereClause }),
      this.prisma.catalog_offers.findMany({
        where: whereClause,
        include: {
          catalog_listings: {
            select: {
              title: true,
            },
          },
          seller_profiles: {
            include: {
              users: {
                select: {
                  company: true,
                },
              },
            },
          },
          buyer_profiles: {
            include: {
              users: {
                select: {
                  company: true,
                },
              },
            },
          },
          _count: {
            select: {
              catalog_offer_items: {
                where: { item_status: { not: "REMOVED" } },
              },
            },
          },
        },
        orderBy: { created_at: "desc" },
        take: limit,
        skip: offset,
      }),
    ]);

    // Get current rounds and last activity for each offer
    const offerSummaries: CatalogOfferSummary[] = await Promise.all(
      catalogOffers.map(async (offer) => {
        const [currentRound, lastActivity] = await Promise.all([
          this.getCurrentNegotiationRound(offer.catalog_offer_id),
          this.getLastActivityTimestamp(offer.catalog_offer_id),
        ]);

        return {
          catalog_offer_id: offer.catalog_offer_id,
          public_id: offer.public_id,
          catalog_listing_id: offer.catalog_listing_id,
          listing_title: offer.catalog_listings.title,
          seller_company: offer.seller_profiles.users.company || undefined,
          buyer_company: offer.buyer_profiles.users.company || undefined,
          offer_status: offer.offer_status!,
          total_offer_value: offer.total_offer_value
            ? Number(offer.total_offer_value)
            : undefined,
          total_offer_value_currency:
            offer.total_offer_value_currency || undefined,
          item_count: offer._count.catalog_offer_items,
          current_round: currentRound, // Added missing current_round property
          expires_at: offer.expires_at || undefined,
          created_at: offer.created_at ?? new Date(), // Default to current date if null
          last_activity: lastActivity,
        };
      })
    );

    return {
      offers: offerSummaries,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_items: total,
        items_per_page: limit,
      },
    };
  }

  /**
   * Get negotiation history for an offer
   */
  async getCatalogOfferNegotiations(catalogOfferId: string): Promise<{
    negotiations: CatalogOfferNegotiation[];
  }> {
    // Determine if catalogOfferId is public_id or internal UUID
    let whereClause: any;
    if (catalogOfferId.length === 14) {
      whereClause = { public_id: catalogOfferId };
    } else {
      whereClause = { catalog_offer_id: catalogOfferId };
    }

    const negotiations = await this.prisma.catalog_offer_negotiations.findMany({
      where: {
        catalog_offers: whereClause,
      },
      include: {
        catalog_offer_item: {
          include: {
            catalog_product_variants: {
              include: {
                catalog_products: {
                  select: {
                    title: true,
                  },
                },
              },
            },
          },
        },
        users: {
          select: {
            username: true,
            company: true,
            first_name: true,
            last_name: true,
          },
        },
      },
      orderBy: [{ negotiation_round: "asc" }, { created_at: "asc" }],
    });

    const formattedNegotiations: CatalogOfferNegotiation[] = negotiations.map(
      (negotiation) => {
        const item = negotiation.catalog_offer_item;
        const variant = item.catalog_product_variants!;
        const product = variant.catalog_products;
        const user = negotiation.users;

        const displayName =
          user.company ||
          `${user.first_name} ${user.last_name}`.trim() ||
          user.username;

        return {
          negotiation_id: negotiation.catalog_offer_negotiation_id,
          public_id: negotiation.public_id,
          catalog_offer_item_id: negotiation.catalog_offer_item_id,
          product_title: variant.title || product.title,
          variant_name: variant.variant_name || undefined,
          variant_sku: variant.variant_sku,
          negotiation_round: negotiation.negotiation_round ?? 1, // Default to round 1 if null
          action_type: String(negotiation.action_type), // Convert enum to string
          offered_by_user_id: negotiation.offered_by_user_id,
          offered_by_name: displayName,
          offer_price_per_unit: Number(negotiation.offer_price_per_unit ?? 0), // Default to 0 if null
          offer_price_currency: negotiation.offer_price_currency!,
          offer_quantity: negotiation.offer_quantity ?? 0, // Default to 0 if null
          offer_status: String(negotiation.offer_status), // Convert to string if it's an enum
          offer_message: negotiation.offer_message || undefined,
          includes_item_changes: negotiation.includes_item_changes ?? false, // Default to false if null
          item_change_summary: negotiation.item_change_summary || undefined,
          valid_until: negotiation.valid_until || undefined,
          created_at: negotiation.created_at ?? new Date(), // Default to current date if null
          responded_at: negotiation.responded_at || undefined,
        };
      }
    );

    return {
      negotiations: formattedNegotiations,
    };
  }

  /**
   * Get offer analytics summary
   */
  async getCatalogOfferAnalytics(
    options: {
      seller_user_id?: string;
      buyer_user_id?: string;
      date_from?: Date;
      date_to?: Date;
    } = {}
  ): Promise<{
    total_offers: number;
    active_offers: number;
    negotiating_offers: number;
    accepted_offers: number;
    rejected_offers: number;
    expired_offers: number;
    total_value_negotiated: number;
    average_negotiation_rounds: number;
    average_time_to_resolution: string;
    acceptance_rate: number;
    top_categories: Array<{
      category: string;
      offer_count: number;
      total_value: number;
    }>;
  }> {
    // Build where clause
    const whereClause: Prisma.catalog_offersWhereInput = {};

    if (options.seller_user_id) {
      whereClause.seller_user_id = options.seller_user_id;
    }

    if (options.buyer_user_id) {
      whereClause.buyer_user_id = options.buyer_user_id;
    }

    if (options.date_from || options.date_to) {
      whereClause.created_at = {};
      if (options.date_from) {
        whereClause.created_at.gte = options.date_from;
      }
      if (options.date_to) {
        whereClause.created_at.lte = options.date_to;
      }
    }

    // Parallelize all analytics queries
    const [
      totalOffers,
      statusCounts,
      valueAggregation,
      avgNegotiationRounds,
      timeToResolution,
      topCategories,
    ] = await Promise.all([
      this.prisma.catalog_offers.count({ where: whereClause }),
      this.prisma.catalog_offers.groupBy({
        by: ["offer_status"],
        where: whereClause,
        _count: true,
      }),
      this.prisma.catalog_offers.aggregate({
        where: whereClause,
        _sum: { total_offer_value: true },
      }),
      this.getAverageNegotiationRounds(whereClause),
      this.getAverageTimeToResolution(whereClause),
      this.getTopCategories(whereClause),
    ]);

    // Process status counts
    const statusMap = statusCounts.reduce(
      (acc, item) => {
        acc[item.offer_status || "UNKNOWN"] = item._count;
        return acc;
      },
      {} as Record<string, number>
    );

    const acceptedOffers = statusMap.ACCEPTED || 0;
    const rejectedOffers = statusMap.REJECTED || 0;
    const acceptanceRate = totalOffers > 0 ? acceptedOffers / totalOffers : 0;

    return {
      total_offers: totalOffers,
      active_offers: statusMap.ACTIVE || 0,
      negotiating_offers: statusMap.NEGOTIATING || 0,
      accepted_offers: acceptedOffers,
      rejected_offers: rejectedOffers,
      expired_offers: statusMap.EXPIRED || 0,
      total_value_negotiated: Number(
        valueAggregation._sum.total_offer_value || 0
      ),
      average_negotiation_rounds: avgNegotiationRounds,
      average_time_to_resolution: timeToResolution,
      acceptance_rate: acceptanceRate,
      top_categories: topCategories,
    };
  }

  /**
   * Helper method to get current negotiation round
   */
  private async getCurrentNegotiationRound(
    catalogOfferId: string
  ): Promise<number> {
    const maxRound = await this.prisma.catalog_offer_negotiations.aggregate({
      where: { catalog_offer_id: catalogOfferId },
      _max: { negotiation_round: true },
    });

    return maxRound._max.negotiation_round || 1;
  }

  /**
   * Helper method to get last activity timestamp
   */
  private async getLastActivityTimestamp(
    catalogOfferId: string
  ): Promise<Date | undefined> {
    const lastNegotiation =
      await this.prisma.catalog_offer_negotiations.findFirst({
        where: { catalog_offer_id: catalogOfferId },
        orderBy: { created_at: "desc" },
        select: { created_at: true },
      });

    return lastNegotiation?.created_at!;
  }

  /**
   * Helper method to calculate average negotiation rounds
   */
  private async getAverageNegotiationRounds(
    whereClause: Prisma.catalog_offersWhereInput
  ): Promise<number> {
    const rounds = await this.prisma.catalog_offer_negotiations.groupBy({
      by: ["catalog_offer_id"],
      where: {
        catalog_offers: whereClause,
      },
      _max: { negotiation_round: true },
    });

    if (rounds.length === 0) return 0;

    const totalRounds = rounds.reduce(
      (sum, round) => sum + (round._max.negotiation_round || 0),
      0
    );
    return totalRounds / rounds.length;
  }

  /**
   * Helper method to calculate average time to resolution
   */
  private async getAverageTimeToResolution(
    whereClause: Prisma.catalog_offersWhereInput
  ): Promise<string> {
    const resolvedOffers = await this.prisma.catalog_offers.findMany({
      where: {
        ...whereClause,
        offer_status: { in: ["ACCEPTED", "REJECTED"] },
      },
      select: {
        created_at: true,
        updated_at: true,
      },
    });

    if (resolvedOffers.length === 0) return "0 days";

    const totalTimeMs = resolvedOffers.reduce((sum, offer) => {
      const resolutionTime = offer.updated_at || offer.created_at;
      return sum + (resolutionTime!.getTime() - offer.created_at!.getTime());
    }, 0);

    const avgTimeMs = totalTimeMs / resolvedOffers.length;
    const avgDays = avgTimeMs / (1000 * 60 * 60 * 24);

    return `${avgDays.toFixed(1)} days`;
  }

  /**
   * Helper method to get top categories
   */
  private async getTopCategories(
    whereClause: Prisma.catalog_offersWhereInput
  ): Promise<
    Array<{ category: string; offer_count: number; total_value: number }>
  > {
    const categoryData = await this.prisma.catalog_offers.findMany({
      where: whereClause,
      select: {
        catalog_listings: {
          select: { category: true },
        },
        total_offer_value: true,
      },
    });

    const categoryMap = new Map<string, { count: number; value: number }>();

    categoryData.forEach((offer) => {
      const category = offer.catalog_listings.category || "UNKNOWN";
      const value = Number(offer.total_offer_value || 0);

      if (categoryMap.has(category)) {
        const existing = categoryMap.get(category)!;
        categoryMap.set(category, {
          count: existing.count + 1,
          value: existing.value + value,
        });
      } else {
        categoryMap.set(category, { count: 1, value });
      }
    });

    return Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        offer_count: data.count,
        total_value: data.value,
      }))
      .sort((a, b) => b.total_value - a.total_value)
      .slice(0, 10);
  }

  /**
   * Removes sensitive ID fields from offer details, keeping only public_id
   */
  private sanitizeCatalogOfferDetails(
    offerDetails: CatalogOfferDetails
  ): Omit<
    CatalogOfferDetails,
    | "catalog_offer_id"
    | "catalog_listing_id"
    | "seller_user_id"
    | "seller_profile_id"
    | "buyer_user_id"
    | "buyer_profile_id"
  > {
    const {
      catalog_offer_id,
      catalog_listing_id,
      seller_user_id,
      seller_profile_id,
      buyer_user_id,
      buyer_profile_id,
      ...sanitizedDetails
    } = offerDetails;

    return sanitizedDetails;
  }

  /**
   * Gets catalog offer details with IDs removed (public API safe)
   */
  async getCatalogOfferDetailsPublic(
    catalogOfferId: string,
    userId?: string
  ): Promise<Omit<
    CatalogOfferDetails,
    | "catalog_offer_id"
    | "catalog_listing_id"
    | "seller_user_id"
    | "seller_profile_id"
    | "buyer_user_id"
    | "buyer_profile_id"
  > | null> {
    const offerDetails = await this.getCatalogOfferDetails(
      catalogOfferId,
      userId
    );

    if (!offerDetails) {
      return null;
    }

    return this.sanitizeCatalogOfferDetails(offerDetails);
  }

  /**
   * Get catalog offer for modification validation
   */
  async getCatalogOfferForModification(
    catalogOfferPublicId: string,
    sellerUserId: string
  ): Promise<{
    success: boolean;
    error?: { code: string; message: string; details?: any };
    catalogOffer?: any;
  }> {
    try {
      const catalogOffer = await this.prisma.catalog_offers.findUnique({
        where: { public_id: catalogOfferPublicId },
        include: {
          catalog_listings: {
            include: {
              catalog_products: {
                include: {
                  catalog_product_variants: {
                    where: { is_active: true },
                  },
                },
              },
            },
          },
          catalog_offer_items: {
            where: { item_status: { not: "REMOVED" } },
            include: {
              catalog_product_variants: {
                include: {
                  catalog_products: {
                    include: { brands: true },
                  },
                },
              },
              catalog_products: {
                include: { brands: true },
              },
            },
          },
        },
      });

      if (!catalogOffer) {
        return {
          success: false,
          error: {
            code: "CATALOG_OFFER_NOT_FOUND",
            message: "Catalog offer not found",
            details: { catalog_offer_public_id: catalogOfferPublicId },
          },
        };
      }

      // Check seller authorization
      if (catalogOffer.seller_user_id !== sellerUserId) {
        return {
          success: false,
          error: {
            code: "UNAUTHORIZED_SELLER",
            message: "Only the listing seller can modify this offer",
            details: {
              requesting_seller_id: sellerUserId,
              actual_seller_id: catalogOffer.seller_user_id,
            },
          },
        };
      }

      // Check offer status
      if (
        !["ACTIVE", "NEGOTIATING"].includes(catalogOffer.offer_status || "")
      ) {
        return {
          success: false,
          error: {
            code: "INVALID_OFFER_STATUS",
            message:
              "Offer must be in ACTIVE or NEGOTIATING status for modifications",
            details: {
              current_status: catalogOffer.offer_status,
              allowed_statuses: ["ACTIVE", "NEGOTIATING"],
            },
          },
        };
      }

      return {
        success: true,
        catalogOffer,
      };
    } catch (error) {
      console.error("Error getting catalog offer for modification:", error);
      return {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to retrieve catalog offer",
          details: {
            error: error instanceof Error ? error.message : String(error),
          },
        },
      };
    }
  }

  /**
   * Record offer modification result
   */
  async recordModificationResult(
    catalogOfferId: string,
    modificationData: {
      previous_total_value: number;
      new_total_value: number;
      modifications_count: number;
      items_added: number;
      items_updated: number;
      items_removed: number;
      auto_accepted: boolean;
      order_created: boolean;
      order_public_id?: string;
      modified_by_user_id: string;
    }
  ): Promise<{
    success: boolean;
    error?: { code: string; message: string; details?: any };
    result?: CatalogOfferModificationResult;
  }> {
    try {
      // Get the catalog offer to get public_id
      const catalogOffer = await this.prisma.catalog_offers.findUnique({
        where: { catalog_offer_id: catalogOfferId },
        select: { public_id: true },
      });

      if (!catalogOffer) {
        return {
          success: false,
          error: {
            code: "CATALOG_OFFER_NOT_FOUND",
            message: "Catalog offer not found for recording modification",
          },
        };
      }

      // Create audit log entry
      await this.prisma.catalog_offer_audit_log.create({
        data: {
          catalog_offers: {
            connect: { catalog_offer_id: catalogOfferId },
          },
          action_type: "SELLER_MODIFY_AUTO_ACCEPT",
          users: {
            connect: { user_id: modificationData.modified_by_user_id },
          },
          old_status: "NEGOTIATING",
          new_status: "ACCEPTED",
          changes_summary: {
            modifications_count: modificationData.modifications_count,
            items_added: modificationData.items_added,
            items_updated: modificationData.items_updated,
            items_removed: modificationData.items_removed,
            value_change:
              modificationData.new_total_value -
              modificationData.previous_total_value,
            order_auto_created: modificationData.order_created,
          },
          metadata: {
            auto_accepted: modificationData.auto_accepted,
            order_public_id: modificationData.order_public_id,
            timestamp: new Date().toISOString(),
          },
          system_generated: true,
          auto_action_type: "SELLER_BULK_MODIFY_AUTO_ACCEPT",
          created_at: new Date(),
        },
      });

      const result: CatalogOfferModificationResult = {
        catalog_offer_id: catalogOfferId,
        public_id: catalogOffer.public_id,
        previous_total_value: modificationData.previous_total_value,
        new_total_value: modificationData.new_total_value,
        modifications_count: modificationData.modifications_count,
        items_added: modificationData.items_added,
        items_updated: modificationData.items_updated,
        items_removed: modificationData.items_removed,
        auto_accepted: modificationData.auto_accepted,
        order_created: modificationData.order_created,
        order_public_id: modificationData.order_public_id,
        modification_timestamp: new Date(),
      };

      return {
        success: true,
        result,
      };
    } catch (error) {
      console.error("Error recording modification result:", error);
      return {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to record modification result",
          details: {
            error: error instanceof Error ? error.message : String(error),
          },
        },
      };
    }
  }

  /**
   * Validate that a catalog offer can be modified
   */
  async validateOfferForModification(
    catalogOfferPublicId: string,
    sellerUserId: string
  ): Promise<{
    success: boolean;
    error?: { code: string; message: string; details?: any };
    offer?: any;
  }> {
    try {
      const offer = await this.prisma.catalog_offers.findUnique({
        where: { public_id: catalogOfferPublicId },
        include: {
          catalog_listings: {
            select: {
              title: true,
              status: true,
            },
          },
          catalog_offer_items: {
            where: { item_status: "ACTIVE" },
            select: {
              catalog_offer_item_id: true,
              public_id: true,
              requested_quantity: true,
              buyer_offer_price: true,
              negotiation_status: true,
            },
          },
        },
      });

      if (!offer) {
        return {
          success: false,
          error: {
            code: "CATALOG_OFFER_NOT_FOUND",
            message: "Catalog offer not found",
            details: { catalog_offer_public_id: catalogOfferPublicId },
          },
        };
      }

      // Check seller authorization
      if (offer.seller_user_id !== sellerUserId) {
        return {
          success: false,
          error: {
            code: "UNAUTHORIZED_SELLER",
            message: "Only the listing seller can modify this offer",
            details: {
              requesting_seller_id: sellerUserId,
              actual_seller_id: offer.seller_user_id,
            },
          },
        };
      }

      // Check offer status
      if (!["ACTIVE", "NEGOTIATING"].includes(offer.offer_status || "")) {
        return {
          success: false,
          error: {
            code: "INVALID_OFFER_STATUS",
            message:
              "Offer must be in ACTIVE or NEGOTIATING status for modifications",
            details: {
              current_status: offer.offer_status,
              allowed_statuses: ["ACTIVE", "NEGOTIATING"],
            },
          },
        };
      }

      // Check if catalog listing is still active
      if (offer.catalog_listings.status !== "ACTIVE") {
        return {
          success: false,
          error: {
            code: "CATALOG_LISTING_NOT_ACTIVE",
            message: "Cannot modify offers on inactive catalog listings",
            details: {
              listing_status: offer.catalog_listings.status,
              listing_title: offer.catalog_listings.title,
            },
          },
        };
      }

      // Check if offer has any active items
      if (offer.catalog_offer_items.length === 0) {
        return {
          success: false,
          error: {
            code: "NO_ACTIVE_ITEMS",
            message: "Offer has no active items to modify",
          },
        };
      }

      return {
        success: true,
        offer,
      };
    } catch (error) {
      console.error("Error validating offer for modification:", error);
      return {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to validate offer for modification",
          details: {
            error: error instanceof Error ? error.message : String(error),
          },
        },
      };
    }
  }

  /**
   * Get offer item by public ID for modification validation
   */
  async getOfferItemByPublicId(
    catalogOfferItemPublicId: string,
    catalogOfferId: string
  ): Promise<{
    success: boolean;
    error?: { code: string; message: string; details?: any };
    item?: any;
  }> {
    try {
      const item = await this.prisma.catalog_offer_items.findFirst({
        where: {
          public_id: catalogOfferItemPublicId,
          catalog_offer_id: catalogOfferId,
        },
        include: {
          catalog_product_variants: {
            include: {
              catalog_products: {
                include: { brands: true },
              },
            },
          },
          catalog_products: {
            include: { brands: true },
          },
        },
      });

      if (!item) {
        return {
          success: false,
          error: {
            code: "ITEM_NOT_FOUND",
            message: "Catalog offer item not found in this offer",
            details: { catalog_offer_item_public_id: catalogOfferItemPublicId },
          },
        };
      }

      if (item.item_status === "REMOVED") {
        return {
          success: false,
          error: {
            code: "ITEM_NOT_MODIFIABLE",
            message: "Cannot modify removed items",
            details: {
              catalog_offer_item_public_id: catalogOfferItemPublicId,
              current_status: item.item_status,
            },
          },
        };
      }

      return {
        success: true,
        item,
      };
    } catch (error) {
      console.error("Error getting offer item by public ID:", error);
      return {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to retrieve offer item",
          details: {
            error: error instanceof Error ? error.message : String(error),
          },
        },
      };
    }
  }

  /**
   * Check if product/variant is already in the offer
   */
  async checkProductInOffer(
    catalogOfferId: string,
    catalogProductId?: string,
    catalogProductVariantId?: string
  ): Promise<{
    success: boolean;
    error?: { code: string; message: string; details?: any };
    existingItem?: any;
  }> {
    try {
      let whereClause: any = {
        catalog_offer_id: catalogOfferId,
        item_status: { not: "REMOVED" },
      };

      if (catalogProductVariantId) {
        whereClause.catalog_product_variant_id = catalogProductVariantId;
      } else if (catalogProductId) {
        whereClause.catalog_product_id = catalogProductId;
        whereClause.catalog_product_variant_id = null;
      }

      const existingItem = await this.prisma.catalog_offer_items.findFirst({
        where: whereClause,
        select: {
          public_id: true,
          item_status: true,
        },
      });

      if (existingItem) {
        return {
          success: false,
          error: {
            code: catalogProductVariantId
              ? "VARIANT_ALREADY_IN_OFFER"
              : "PRODUCT_ALREADY_IN_OFFER",
            message: `${catalogProductVariantId ? "Product variant" : "Product"} is already in the offer`,
            details: {
              existing_item_public_id: existingItem.public_id,
              item_status: existingItem.item_status,
            },
          },
        };
      }

      return { success: true };
    } catch (error) {
      console.error("Error checking product in offer:", error);
      return {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to check if product is in offer",
          details: {
            error: error instanceof Error ? error.message : String(error),
          },
        },
      };
    }
  }

  async validateCatalogListingForUpload(
    catalogListingPublicId: string,
    buyerUserId: string
  ): Promise<CatalogListingValidationResult> {
    try {
      const catalogListing = await this.prisma.catalog_listings.findUnique({
        where: { public_id: catalogListingPublicId },
        select: {
          catalog_listing_id: true,
          public_id: true,
          title: true,
          status: true,
          seller_user_id: true,
          seller_profile_id: true,
          minimum_order_value: true,
          minimum_order_value_currency: true,
          is_private: true,
        },
      });

      if (!catalogListing) {
        return {
          success: false,
          error: {
            code: "CATALOG_LISTING_NOT_FOUND",
            message: "Catalog listing not found",
            details: { catalog_listing_public_id: catalogListingPublicId },
          },
        };
      }

      // Check if listing is active
      if (catalogListing.status !== "ACTIVE") {
        return {
          success: false,
          error: {
            code: "CATALOG_LISTING_NOT_ACTIVE",
            message: "Catalog listing is not currently active",
            details: {
              current_status: catalogListing.status,
              catalog_listing_public_id: catalogListingPublicId,
            },
          },
        };
      }

      // Check if buyer is not the seller
      if (catalogListing.seller_user_id === buyerUserId) {
        return {
          success: false,
          error: {
            code: "SELLER_CANNOT_MAKE_OFFER",
            message: "Sellers cannot make offers on their own catalog listings",
            details: {
              seller_user_id: catalogListing.seller_user_id,
              buyer_user_id: buyerUserId,
            },
          },
        };
      }

      return {
        success: true,
        catalogListing: {
          catalog_listing_id: catalogListing.catalog_listing_id,
          public_id: catalogListing.public_id,
          title: catalogListing.title,
          status: catalogListing.status!,
          seller_user_id: catalogListing.seller_user_id,
          seller_profile_id: catalogListing.seller_profile_id,
          minimum_order_value: catalogListing.minimum_order_value
            ? Number(catalogListing.minimum_order_value)
            : undefined,
          minimum_order_value_currency:
            catalogListing.minimum_order_value_currency || undefined,
          is_private: catalogListing.is_private ?? false,
        },
      };
    } catch (error) {
      console.error("Error validating catalog listing for upload:", error);
      return {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to validate catalog listing",
          details: {
            error: error instanceof Error ? error.message : String(error),
          },
        },
      };
    }
  }

  /**
   * Find product variants by SKU within a catalog listing
   */
  async findVariantsBySku(
    skus: string[],
    catalogListingId: string
  ): Promise<VariantLookupBySkuResult> {
    try {
      if (skus.length === 0) {
        return {
          success: true,
          variants: [],
        };
      }

      const variants = await this.prisma.catalog_product_variants.findMany({
        where: {
          variant_sku: { in: skus },
          is_active: true,
          catalog_products: {
            catalog_listing_id: catalogListingId,
            status: "ACTIVE",
          },
        },
        include: {
          catalog_products: {
            include: {
              brands: {
                select: {
                  brand_name: true,
                },
              },
            },
          },
        },
      });

      const mappedVariants = variants.map((variant) => ({
        catalog_product_variant_id: variant.catalog_product_variant_id,
        variant_sku: variant.variant_sku,
        variant_name: variant.variant_name || undefined,
        title: variant.title || undefined,
        available_quantity: variant.available_quantity ?? undefined,
        min_order_quantity: variant.min_order_quantity ?? undefined,
        max_order_quantity: variant.max_order_quantity ?? undefined,
        is_active: variant.is_active ?? true,
        catalog_product_id: variant.parent_product_id,
        product_title: variant.title || variant.catalog_products.title,
        brand_name: variant.catalog_products.brands.brand_name,
        catalog_listing_id: catalogListingId,
      }));

      return {
        success: true,
        variants: mappedVariants,
      };
    } catch (error) {
      console.error("Error finding variants by SKU:", error);
      return {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to find variants by SKU",
          details: {
            error: error instanceof Error ? error.message : String(error),
            skus: skus,
            catalog_listing_id: catalogListingId,
          },
        },
      };
    }
  }

  /**
   * Find single variant by SKU within a catalog listing
   */
  async findVariantBySku(
    sku: string,
    catalogListingId: string
  ): Promise<{
    success: boolean;
    error?: { code: string; message: string; details?: any };
    variant?: {
      catalog_product_variant_id: string;
      variant_sku: string;
      variant_name?: string;
      title?: string;
      available_quantity?: number;
      min_order_quantity?: number;
      max_order_quantity?: number;
      is_active: boolean;
      catalog_product_id: string;
      product_title: string;
      brand_name: string;
      catalog_listing_id: string;
    };
  }> {
    try {
      const result = await this.findVariantsBySku([sku], catalogListingId);

      if (!result.success) {
        return {
          success: false,
          error: result.error,
        };
      }

      const variant = result.variants?.find((v) => v.variant_sku === sku);

      if (!variant) {
        return {
          success: false,
          error: {
            code: "VARIANT_NOT_FOUND",
            message: `Product variant with SKU '${sku}' not found in this catalog listing`,
            details: {
              sku: sku,
              catalog_listing_id: catalogListingId,
            },
          },
        };
      }

      return {
        success: true,
        variant,
      };
    } catch (error) {
      console.error("Error finding variant by SKU:", error);
      return {
        success: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to find variant by SKU",
          details: {
            error: error instanceof Error ? error.message : String(error),
            sku: sku,
            catalog_listing_id: catalogListingId,
          },
        },
      };
    }
  }

  /**
   * Check for existing active offers from a buyer on a catalog listing
   */
  async checkExistingOffers(
    catalogListingId: string,
    buyerUserId: string
  ): Promise<{
    success: boolean;
    error?: { code: string; message: string; details?: any };
    hasExistingOffer: boolean;
    existingOffer?: {
      public_id: string;
      offer_status: string;
      created_at: Date;
      expires_at?: Date;
    };
  }> {
    try {
      // Resolve catalog listing public_id to internal catalog_listing_id if needed
      let internalCatalogListingId: string;

      if (catalogListingId.length === 14) {
        // Assuming public_id length is 14
        const catalogListing = await this.prisma.catalog_listings.findUnique({
          where: { public_id: catalogListingId },
          select: { catalog_listing_id: true },
        });

        if (!catalogListing) {
          return {
            success: false,
            hasExistingOffer: false,
            error: {
              code: "CATALOG_LISTING_NOT_FOUND",
              message: "Catalog listing not found",
            },
          };
        }

        internalCatalogListingId = catalogListing.catalog_listing_id;
      } else {
        internalCatalogListingId = catalogListingId;
      }

      const existingOffer = await this.prisma.catalog_offers.findFirst({
        where: {
          catalog_listing_id: internalCatalogListingId,
          buyer_user_id: buyerUserId,
          offer_status: {
            in: ["ACTIVE", "NEGOTIATING"],
          },
        },
        select: {
          public_id: true,
          offer_status: true,
          created_at: true,
          expires_at: true,
        },
        orderBy: {
          created_at: "desc",
        },
      });

      return {
        success: true,
        hasExistingOffer: !!existingOffer,
        existingOffer: existingOffer
          ? {
              public_id: existingOffer.public_id,
              offer_status: existingOffer.offer_status!,
              created_at: existingOffer.created_at!,
              expires_at: existingOffer.expires_at || undefined,
            }
          : undefined,
      };
    } catch (error) {
      console.error("Error checking existing offers:", error);
      return {
        success: false,
        hasExistingOffer: false,
        error: {
          code: "DATABASE_ERROR",
          message: "Failed to check existing offers",
          details: {
            error: error instanceof Error ? error.message : String(error),
          },
        },
      };
    }
  }
  /**
   * Record file upload attempt for audit purposes
   */
  async recordFileUploadAttempt(
    catalogListingPublicId: string,
    buyerUserId: string,
    fileName: string,
    fileSize: number,
    success: boolean,
    errorDetails?: any
  ): Promise<void> {
    try {
      // TODO
      // This could be implemented as an audit log or file upload tracking table
      // For now, we'll just log it
      console.log("File upload attempt recorded:", {
        catalog_listing_public_id: catalogListingPublicId,
        buyer_user_id: buyerUserId,
        file_name: fileName,
        file_size: fileSize,
        success: success,
        error_details: errorDetails,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error recording file upload attempt:", error);
      // Don't throw error here as this is just for audit purposes
    }
  }
}
