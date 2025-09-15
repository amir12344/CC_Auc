import {
  Prisma,
  PrismaClient,
} from "../../../lambda-layers/core-layer/nodejs/prisma/generated/client";

export interface OfferForNegotiation {
  catalog_offer_id: string;
  public_id: string;
  catalog_listing_id: string;
  seller_user_id: string;
  seller_profile_id: string;
  buyer_user_id: string;
  buyer_profile_id: string;
  offer_status: string | null;
  total_offer_value: any;
  total_offer_value_currency: string | null;
  expires_at: Date | null;
  created_at: Date | null;
  updated_at: Date | null;
  current_round: number | null;
  last_action_by_user_id: string | null;
  last_action_at: Date | null;
  rejection_reason: string | null;
  rejection_category: string | null;
  rejected_at: Date | null;
  rejected_by_user_id: string | null;
  reopen_deadline: Date | null;
  can_reopen: boolean | null;
  auto_expire_at: Date | null;
  expired_reason: string | null;
  offer_message: string | null;
  catalog_offer_items: Array<{
    catalog_offer_item_id: string;
    catalog_product_variant_id: string | null;
    requested_quantity: number | null;
    buyer_offer_price: any;
    buyer_offer_price_currency: string | null;
    seller_offer_price: any;
    seller_offer_price_currency: string | null;
    negotiation_status: string | null;
    item_status: string | null;
    item_version: number | null;
    added_in_round: number | null;
    removed_in_round: number | null;
    current_buyer_negotiation_id: string | null;
    current_seller_negotiation_id: string | null;
    final_agreed_price: any;
    final_agreed_price_currency: string | null;
    final_agreed_quantity: number | null;
    agreed_at: Date | null;
    catalog_product_variants: {
      variant_sku: string;
      variant_name: string | null;
      available_quantity: number | null;
      min_order_quantity: number | null;
      max_order_quantity: number | null;
      catalog_products: {
        title: string;
        brands: {
          brand_name: string;
        };
      };
    } | null;
  }>;
}

export interface CurrentItemNegotiation {
  catalog_offer_negotiation_id: string;
  public_id: string;
  negotiation_round: number | null;
  action_type: string;
  offer_price_per_unit: any;
  offer_price_currency: string;
  offer_quantity: number | null;
  offer_status: string | null;
  offer_message: string | null;
  valid_until: Date | null;
  created_at: Date | null;
  expires_at: Date | null;
  auto_expired: boolean | null;
}

export interface LastNegotiationAction {
  catalog_offer_negotiation_id: string;
  action_type: string;
  offered_by_user_id: string;
  negotiation_round: number | null;
  created_at: Date | null;
}

export interface AlternativeSuggestion {
  suggestion_id: string;
  public_id: string;
  catalog_offer_id: string;
  suggested_product_variant_id: string | null;
  suggested_price: any;
  suggested_price_currency: string | null;
  available_quantity: number | null;
  product_name: string | null;
  suggestion_message: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

export interface MinimumTerms {
  minimum_terms_id: string;
  public_id: string;
  catalog_offer_id: string;
  minimum_unit_price: any;
  minimum_total_order: any;
  minimum_quantity: number | null;
  currency_code: string | null;
  minimum_order_frequency: string | null;
  payment_terms: string | null;
  delivery_requirements: string | null;
  terms_message: string | null;
  valid_until: Date | null;
  created_at: Date | null;
  updated_at: Date | null;
}

export interface AuditLogEntry {
  audit_id: string;
  public_id: string;
  catalog_offer_id: string;
  action_type: string;
  performed_by_user_id: string;
  old_status: string | null;
  new_status: string | null;
  changes_summary: any;
  metadata: any;
  created_at: Date | null;
}

export class NegotiateCatalogOfferDatabaseOperations {
  constructor(private prisma: PrismaClient) {}

  /**
   * Get comprehensive offer data needed for negotiation processing
   */
  async getOfferForNegotiation(
    catalogOfferId: string,
    tx: PrismaClient = this.prisma
  ): Promise<OfferForNegotiation | null> {
    const offer = await tx.catalog_offers.findUnique({
      where: { catalog_offer_id: catalogOfferId },
      include: {
        catalog_offer_items: {
          where: {
            item_status: { not: "REMOVED" },
          },
          include: {
            catalog_product_variants: {
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
            },
          },
          orderBy: { added_in_round: "asc" },
        },
      },
    });

    if (!offer) {
      return null;
    }

    return {
      catalog_offer_id: offer.catalog_offer_id,
      public_id: offer.public_id,
      catalog_listing_id: offer.catalog_listing_id,
      seller_user_id: offer.seller_user_id,
      seller_profile_id: offer.seller_profile_id,
      buyer_user_id: offer.buyer_user_id,
      buyer_profile_id: offer.buyer_profile_id,
      offer_status: offer.offer_status,
      total_offer_value: offer.total_offer_value,
      total_offer_value_currency: offer.total_offer_value_currency,
      expires_at: offer.expires_at,
      created_at: offer.created_at,
      updated_at: offer.updated_at,
      current_round: offer.current_round,
      last_action_by_user_id: offer.last_action_by_user_id,
      last_action_at: offer.last_action_at,
      rejection_reason: offer.rejection_reason,
      rejection_category: offer.rejection_category,
      rejected_at: offer.rejected_at,
      rejected_by_user_id: offer.rejected_by_user_id,
      reopen_deadline: offer.reopen_deadline,
      can_reopen: offer.can_reopen,
      auto_expire_at: offer.auto_expire_at,
      expired_reason: offer.expired_reason,
      offer_message: offer.offer_message,
      catalog_offer_items: offer.catalog_offer_items.map((item) => ({
        catalog_offer_item_id: item.catalog_offer_item_id,
        catalog_product_variant_id: item.catalog_product_variant_id,
        requested_quantity: item.requested_quantity,
        buyer_offer_price: item.buyer_offer_price,
        buyer_offer_price_currency: item.buyer_offer_price_currency,
        seller_offer_price: item.seller_offer_price,
        seller_offer_price_currency: item.seller_offer_price_currency,
        negotiation_status: item.negotiation_status,
        item_status: item.item_status,
        item_version: item.item_version,
        added_in_round: item.added_in_round,
        removed_in_round: item.removed_in_round,
        current_buyer_negotiation_id: item.current_buyer_negotiation_id,
        current_seller_negotiation_id: item.current_seller_negotiation_id,
        final_agreed_price: item.final_agreed_price,
        final_agreed_price_currency: item.final_agreed_price_currency,
        final_agreed_quantity: item.final_agreed_quantity,
        agreed_at: item.agreed_at,
        catalog_product_variants: item.catalog_product_variants
          ? {
              variant_sku: item.catalog_product_variants.variant_sku,
              variant_name: item.catalog_product_variants.variant_name,
              available_quantity:
                item.catalog_product_variants.available_quantity,
              min_order_quantity:
                item.catalog_product_variants.min_order_quantity,
              max_order_quantity:
                item.catalog_product_variants.max_order_quantity,
              catalog_products: {
                title: item.catalog_product_variants.catalog_products.title,
                brands: {
                  brand_name:
                    item.catalog_product_variants.catalog_products.brands
                      .brand_name,
                },
              },
            }
          : null,
      })),
    };
  }

  /**
   * Get the current negotiation round for an offer
   */
  async getCurrentNegotiationRound(
    catalogOfferId: string,
    tx: PrismaClient = this.prisma
  ): Promise<number> {
    // First try to get from the offer's current_round field
    const offer = await tx.catalog_offers.findUnique({
      where: { catalog_offer_id: catalogOfferId },
      select: { current_round: true },
    });

    if (offer?.current_round) {
      return offer.current_round;
    }

    // Fallback to calculating from negotiations
    const maxRound = await tx.catalog_offer_negotiations.aggregate({
      where: { catalog_offer_id: catalogOfferId },
      _max: { negotiation_round: true },
    });

    return maxRound._max.negotiation_round || 0;
  }

  /**
   * Get the last negotiation action for an offer
   */
  async getLastNegotiationAction(
    catalogOfferId: string,
    tx: PrismaClient = this.prisma
  ): Promise<LastNegotiationAction | null> {
    const lastAction = await tx.catalog_offer_negotiations.findFirst({
      where: { catalog_offer_id: catalogOfferId },
      orderBy: [{ negotiation_round: "desc" }, { created_at: "desc" }],
      select: {
        catalog_offer_negotiation_id: true,
        action_type: true,
        offered_by_user_id: true,
        negotiation_round: true,
        created_at: true,
      },
    });

    if (!lastAction) {
      return null;
    }

    return {
      catalog_offer_negotiation_id: lastAction.catalog_offer_negotiation_id,
      action_type: String(lastAction.action_type),
      offered_by_user_id: lastAction.offered_by_user_id,
      negotiation_round: lastAction.negotiation_round,
      created_at: lastAction.created_at,
    };
  }

  /**
   * Get current negotiation for a specific offer item
   */
  async getCurrentItemNegotiation(
    catalogOfferItemId: string,
    tx: PrismaClient = this.prisma
  ): Promise<CurrentItemNegotiation | null> {
    // Get the most recent negotiation for this item
    const negotiation = await tx.catalog_offer_negotiations.findFirst({
      where: { catalog_offer_item_id: catalogOfferItemId },
      orderBy: [{ negotiation_round: "desc" }, { created_at: "desc" }],
      select: {
        catalog_offer_negotiation_id: true,
        public_id: true,
        negotiation_round: true,
        action_type: true,
        offer_price_per_unit: true,
        offer_price_currency: true,
        offer_quantity: true,
        offer_status: true,
        offer_message: true,
        valid_until: true,
        created_at: true,
        expires_at: true,
        auto_expired: true,
      },
    });

    if (!negotiation) {
      return null;
    }

    return {
      catalog_offer_negotiation_id: negotiation.catalog_offer_negotiation_id,
      public_id: negotiation.public_id,
      negotiation_round: negotiation.negotiation_round,
      action_type: String(negotiation.action_type),
      offer_price_per_unit: negotiation.offer_price_per_unit,
      offer_price_currency: String(negotiation.offer_price_currency),
      offer_quantity: negotiation.offer_quantity,
      offer_status: negotiation.offer_status,
      offer_message: negotiation.offer_message,
      valid_until: negotiation.valid_until,
      created_at: negotiation.created_at,
      expires_at: negotiation.expires_at,
      auto_expired: negotiation.auto_expired,
    };
  }

  /**
   * Get all active items for an offer
   */
  async getActiveOfferItems(
    catalogOfferId: string,
    tx: PrismaClient = this.prisma
  ): Promise<
    Array<{
      catalog_offer_item_id: string;
      catalog_product_variant_id: string | null;
      requested_quantity: number | null;
      buyer_offer_price: any;
      seller_offer_price: any;
      negotiation_status: string | null;
      item_status: string | null;
      final_agreed_price: any;
      final_agreed_price_currency: string | null;
      final_agreed_quantity: number | null;
      agreed_at: Date | null;
    }>
  > {
    const items = await tx.catalog_offer_items.findMany({
      where: {
        catalog_offer_id: catalogOfferId,
        item_status: "ACTIVE",
      },
      select: {
        catalog_offer_item_id: true,
        catalog_product_variant_id: true,
        requested_quantity: true,
        buyer_offer_price: true,
        seller_offer_price: true,
        negotiation_status: true,
        item_status: true,
        final_agreed_price: true,
        final_agreed_price_currency: true,
        final_agreed_quantity: true,
        agreed_at: true,
      },
      orderBy: { added_in_round: "asc" },
    });

    return items;
  }

  /**
   * Get negotiation history for an offer
   */
  async getOfferNegotiationHistory(
    catalogOfferId: string,
    tx: PrismaClient = this.prisma
  ): Promise<
    Array<{
      negotiation_id: string;
      public_id: string;
      catalog_offer_item_id: string;
      negotiation_round: number | null;
      action_type: string;
      offered_by_user_id: string;
      offer_price_per_unit: any;
      offer_price_currency: string;
      offer_quantity: number | null;
      offer_status: string | null;
      offer_message: string | null;
      valid_until: Date | null;
      created_at: Date | null;
      responded_at: Date | null;
      includes_item_changes: boolean | null;
      item_change_summary: string | null;
      expires_at: Date | null;
      auto_expired: boolean | null;
    }>
  > {
    const negotiations = await tx.catalog_offer_negotiations.findMany({
      where: { catalog_offer_id: catalogOfferId },
      select: {
        catalog_offer_negotiation_id: true,
        public_id: true,
        catalog_offer_item_id: true,
        negotiation_round: true,
        action_type: true,
        offered_by_user_id: true,
        offer_price_per_unit: true,
        offer_price_currency: true,
        offer_quantity: true,
        offer_status: true,
        offer_message: true,
        valid_until: true,
        created_at: true,
        responded_at: true,
        includes_item_changes: true,
        item_change_summary: true,
        expires_at: true,
        auto_expired: true,
      },
      orderBy: [{ negotiation_round: "asc" }, { created_at: "asc" }],
    });

    return negotiations.map((neg) => ({
      negotiation_id: neg.catalog_offer_negotiation_id,
      public_id: neg.public_id,
      catalog_offer_item_id: neg.catalog_offer_item_id,
      negotiation_round: neg.negotiation_round,
      action_type: String(neg.action_type),
      offered_by_user_id: neg.offered_by_user_id,
      offer_price_per_unit: neg.offer_price_per_unit,
      offer_price_currency: String(neg.offer_price_currency),
      offer_quantity: neg.offer_quantity,
      offer_status: neg.offer_status,
      offer_message: neg.offer_message,
      valid_until: neg.valid_until,
      created_at: neg.created_at,
      responded_at: neg.responded_at,
      includes_item_changes: neg.includes_item_changes,
      item_change_summary: neg.item_change_summary,
      expires_at: neg.expires_at,
      auto_expired: neg.auto_expired,
    }));
  }

  /**
   * Check if user has pending negotiations to respond to
   */
  async hasPendingNegotiations(
    catalogOfferId: string,
    userId: string,
    tx: PrismaClient = this.prisma
  ): Promise<boolean> {
    const pendingCount = await tx.catalog_offer_negotiations.count({
      where: {
        catalog_offer_id: catalogOfferId,
        offer_status: "PENDING",
        offered_by_user_id: { not: userId }, // Not created by this user
        is_current_offer: true,
      },
    });

    return pendingCount > 0;
  }

  /**
   * Get offer item changes for a specific round
   */
  async getOfferItemChanges(
    catalogOfferId: string,
    negotiationRound?: number,
    tx: PrismaClient = this.prisma
  ): Promise<
    Array<{
      change_id: string;
      public_id: string;
      change_type: string;
      catalog_offer_item_id: string | null;
      changed_by_user_id: string;
      negotiation_round: number;
      previous_quantity: number | null;
      new_quantity: number | null;
      new_catalog_product_variant_id: string | null;
      new_requested_quantity: number | null;
      new_buyer_offer_price: any;
      change_reason: string | null;
      created_at: Date | null;
      previous_price: any;
      previous_price_currency: string | null;
      change_summary: string | null;
    }>
  > {
    const whereClause: Prisma.catalog_offer_item_changesWhereInput = {
      catalog_offer_id: catalogOfferId,
    };

    if (negotiationRound !== undefined) {
      whereClause.negotiation_round = negotiationRound;
    }

    const changes = await tx.catalog_offer_item_changes.findMany({
      where: whereClause,
      select: {
        catalog_offer_item_change_id: true,
        public_id: true,
        change_type: true,
        catalog_offer_item_id: true,
        changed_by_user_id: true,
        negotiation_round: true,
        previous_quantity: true,
        new_quantity: true,
        new_catalog_product_variant_id: true,
        new_requested_quantity: true,
        new_buyer_offer_price: true,
        change_reason: true,
        created_at: true,
        previous_price: true,
        previous_price_currency: true,
        change_summary: true,
      },
      orderBy: { created_at: "asc" },
    });

    return changes.map((change) => ({
      change_id: change.catalog_offer_item_change_id,
      public_id: change.public_id,
      change_type: String(change.change_type),
      catalog_offer_item_id: change.catalog_offer_item_id,
      changed_by_user_id: change.changed_by_user_id,
      negotiation_round: change.negotiation_round,
      previous_quantity: change.previous_quantity,
      new_quantity: change.new_quantity,
      new_catalog_product_variant_id: change.new_catalog_product_variant_id,
      new_requested_quantity: change.new_requested_quantity,
      new_buyer_offer_price: change.new_buyer_offer_price,
      change_reason: change.change_reason,
      created_at: change.created_at,
      previous_price: change.previous_price,
      previous_price_currency: change.previous_price_currency,
      change_summary: change.change_summary,
    }));
  }

  /**
   * Update offer status and tracking fields
   */
  async updateOfferStatus(
    catalogOfferId: string,
    newStatus: string,
    lastActionByUserId?: string,
    currentRound?: number,
    tx: PrismaClient = this.prisma
  ): Promise<void> {
    const updateData: any = {
      offer_status: newStatus as any,
      updated_at: new Date(),
    };

    if (lastActionByUserId) {
      updateData.last_action_by_user_id = lastActionByUserId;
      updateData.last_action_at = new Date();
    }

    if (currentRound !== undefined) {
      updateData.current_round = currentRound;
    }

    await tx.catalog_offers.update({
      where: { catalog_offer_id: catalogOfferId },
      data: updateData,
    });
  }

  /**
   * Mark previous negotiations as superseded
   */
  async markPreviousNegotiationsSuperseded(
    catalogOfferItemId: string,
    currentNegotiationId: string,
    tx: PrismaClient = this.prisma
  ): Promise<void> {
    await tx.catalog_offer_negotiations.updateMany({
      where: {
        catalog_offer_item_id: catalogOfferItemId,
        catalog_offer_negotiation_id: { not: currentNegotiationId },
        is_current_offer: true,
      },
      data: {
        is_current_offer: false,
        offer_status: "SUPERSEDED",
        responded_at: new Date(),
      },
    });
  }

  /**
   * Get offer statistics for analytics
   */
  async getOfferStatistics(
    catalogOfferId: string,
    tx: PrismaClient = this.prisma
  ): Promise<{
    totalRounds: number;
    totalNegotiations: number;
    averageResponseTime: number; // in hours
    itemCount: number;
    activeItemCount: number;
    totalValue: number;
    currency: string;
  }> {
    const [roundStats, negotiations, items, offerData] = await Promise.all([
      tx.catalog_offer_negotiations.aggregate({
        where: { catalog_offer_id: catalogOfferId },
        _max: { negotiation_round: true },
        _count: { catalog_offer_negotiation_id: true },
      }),
      tx.catalog_offer_negotiations.findMany({
        where: { catalog_offer_id: catalogOfferId },
        select: { created_at: true, responded_at: true },
        orderBy: { created_at: "asc" },
      }),
      tx.catalog_offer_items.aggregate({
        where: { catalog_offer_id: catalogOfferId },
        _count: {
          catalog_offer_item_id: true,
        },
      }),
      tx.catalog_offers.findUnique({
        where: { catalog_offer_id: catalogOfferId },
        select: {
          total_offer_value: true,
          total_offer_value_currency: true,
          catalog_offer_items: {
            where: { item_status: "ACTIVE" },
            select: { catalog_offer_item_id: true },
          },
        },
      }),
    ]);

    // Calculate average response time
    let totalResponseTime = 0;
    let responseCount = 0;

    for (const neg of negotiations) {
      if (neg.created_at && neg.responded_at) {
        const responseTimeMs =
          neg.responded_at.getTime() - neg.created_at.getTime();
        totalResponseTime += responseTimeMs;
        responseCount++;
      }
    }

    const averageResponseTimeMs =
      responseCount > 0 ? totalResponseTime / responseCount : 0;
    const averageResponseTimeHours = averageResponseTimeMs / (1000 * 60 * 60);

    return {
      totalRounds: roundStats._max.negotiation_round || 0,
      totalNegotiations: roundStats._count.catalog_offer_negotiation_id,
      averageResponseTime: averageResponseTimeHours,
      itemCount: items._count.catalog_offer_item_id,
      activeItemCount: offerData?.catalog_offer_items.length || 0,
      totalValue: Number(offerData?.total_offer_value || 0),
      currency: offerData?.total_offer_value_currency || "USD",
    };
  }

  /**
   * Check if offer has expired negotiations
   */
  async hasExpiredNegotiations(
    catalogOfferId: string,
    tx: PrismaClient = this.prisma
  ): Promise<boolean> {
    const now = new Date();
    const expiredCount = await tx.catalog_offer_negotiations.count({
      where: {
        catalog_offer_id: catalogOfferId,
        OR: [{ valid_until: { lt: now } }, { expires_at: { lt: now } }],
        offer_status: "PENDING",
        is_current_offer: true,
      },
    });

    return expiredCount > 0;
  }

  /**
   * Mark expired negotiations
   */
  async markExpiredNegotiations(
    catalogOfferId: string,
    tx: PrismaClient = this.prisma
  ): Promise<number> {
    const now = new Date();
    const result = await tx.catalog_offer_negotiations.updateMany({
      where: {
        catalog_offer_id: catalogOfferId,
        OR: [{ valid_until: { lt: now } }, { expires_at: { lt: now } }],
        offer_status: "PENDING",
        is_current_offer: true,
      },
      data: {
        offer_status: "EXPIRED",
        responded_at: now,
        auto_expired: true,
      },
    });

    return result.count;
  }

  /**
   * Get user information for notifications
   */
  async getUserNotificationInfo(
    userId: string,
    tx: PrismaClient = this.prisma
  ): Promise<{
    user_id: string;
    username: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    company: string | null;
  } | null> {
    const user = await tx.users.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        username: true,
        email: true,
        first_name: true,
        last_name: true,
        company: true,
      },
    });

    return user;
  }

  /**
   * Get offer participants (buyer and seller) info
   */
  async getOfferParticipants(
    catalogOfferId: string,
    tx: PrismaClient = this.prisma
  ): Promise<{
    buyer: {
      user_id: string;
      username: string;
      email: string;
      company: string | null;
      display_name: string;
    };
    seller: {
      user_id: string;
      username: string;
      email: string;
      company: string | null;
      display_name: string;
    };
  } | null> {
    const offer = await tx.catalog_offers.findUnique({
      where: { catalog_offer_id: catalogOfferId },
      include: {
        buyer_profiles: {
          include: {
            users: {
              select: {
                user_id: true,
                username: true,
                email: true,
                first_name: true,
                last_name: true,
                company: true,
              },
            },
          },
        },
        seller_profiles: {
          include: {
            users: {
              select: {
                user_id: true,
                username: true,
                email: true,
                first_name: true,
                last_name: true,
                company: true,
              },
            },
          },
        },
      },
    });

    if (!offer) {
      return null;
    }

    const buyerUser = offer.buyer_profiles.users;
    const sellerUser = offer.seller_profiles.users;

    const buyerDisplayName =
      buyerUser.company ||
      `${buyerUser.first_name} ${buyerUser.last_name}`.trim() ||
      buyerUser.username;

    const sellerDisplayName =
      sellerUser.company ||
      `${sellerUser.first_name} ${sellerUser.last_name}`.trim() ||
      sellerUser.username;

    return {
      buyer: {
        user_id: buyerUser.user_id,
        username: buyerUser.username,
        email: buyerUser.email,
        company: buyerUser.company,
        display_name: buyerDisplayName,
      },
      seller: {
        user_id: sellerUser.user_id,
        username: sellerUser.username,
        email: sellerUser.email,
        company: sellerUser.company,
        display_name: sellerDisplayName,
      },
    };
  }

  /**
   * Get negotiation chain for a specific item
   */
  async getItemNegotiationChain(
    catalogOfferItemId: string,
    tx: PrismaClient = this.prisma
  ): Promise<
    Array<{
      negotiation_id: string;
      public_id: string;
      negotiation_round: number | null;
      action_type: string;
      offered_by_user_id: string;
      offer_price_per_unit: any;
      offer_quantity: number | null;
      offer_status: string | null;
      offer_message: string | null;
      parent_negotiation_id: string | null;
      created_at: Date | null;
      responded_at: Date | null;
      expires_at: Date | null;
      auto_expired: boolean | null;
    }>
  > {
    const negotiations = await tx.catalog_offer_negotiations.findMany({
      where: { catalog_offer_item_id: catalogOfferItemId },
      select: {
        catalog_offer_negotiation_id: true,
        public_id: true,
        negotiation_round: true,
        action_type: true,
        offered_by_user_id: true,
        offer_price_per_unit: true,
        offer_quantity: true,
        offer_status: true,
        offer_message: true,
        parent_negotiation_id: true,
        created_at: true,
        responded_at: true,
        expires_at: true,
        auto_expired: true,
      },
      orderBy: [{ negotiation_round: "asc" }, { created_at: "asc" }],
    });

    return negotiations.map((neg) => ({
      negotiation_id: neg.catalog_offer_negotiation_id,
      public_id: neg.public_id,
      negotiation_round: neg.negotiation_round,
      action_type: String(neg.action_type),
      offered_by_user_id: neg.offered_by_user_id,
      offer_price_per_unit: neg.offer_price_per_unit,
      offer_quantity: neg.offer_quantity,
      offer_status: neg.offer_status,
      offer_message: neg.offer_message,
      parent_negotiation_id: neg.parent_negotiation_id,
      created_at: neg.created_at,
      responded_at: neg.responded_at,
      expires_at: neg.expires_at,
      auto_expired: neg.auto_expired,
    }));
  }

  /**
   * Update total offer value based on current item negotiations
   */
  async recalculateOfferValue(
    catalogOfferId: string,
    tx: PrismaClient = this.prisma
  ): Promise<{ totalValue: number; currency: string }> {
    // Get all active items with their current negotiated prices
    const items = await tx.catalog_offer_items.findMany({
      where: {
        catalog_offer_id: catalogOfferId,
        item_status: "ACTIVE",
      },
      select: {
        requested_quantity: true,
        buyer_offer_price: true,
        seller_offer_price: true,
        buyer_offer_price_currency: true,
        seller_offer_price_currency: true,
        negotiation_status: true,
        final_agreed_price: true,
        final_agreed_price_currency: true,
        final_agreed_quantity: true,
      },
    });

    let totalValue = 0;
    let currency = "USD"; // Default currency

    for (const item of items) {
      const quantity =
        item.final_agreed_quantity || item.requested_quantity || 0;
      let unitPrice = 0;

      // Use the most recent price based on negotiation status
      if (item.final_agreed_price) {
        // Use final agreed price if available
        unitPrice = Number(item.final_agreed_price);
        currency = item.final_agreed_price_currency || currency;
      } else if (
        item.seller_offer_price &&
        ["SELLER_COUNTERED", "AGREED"].includes(item.negotiation_status || "")
      ) {
        unitPrice = Number(item.seller_offer_price);
        currency = item.seller_offer_price_currency || currency;
      } else if (item.buyer_offer_price) {
        unitPrice = Number(item.buyer_offer_price);
        currency = item.buyer_offer_price_currency || currency;
      }

      totalValue += quantity * unitPrice;
    }

    // Update the offer with new total value
    await tx.catalog_offers.update({
      where: { catalog_offer_id: catalogOfferId },
      data: {
        total_offer_value: totalValue,
        total_offer_value_currency: currency as any,
        updated_at: new Date(),
      },
    });

    return { totalValue, currency };
  }

  /**
   * Create audit log entry for negotiation actions
   */
  async createNegotiationAuditLog(
    catalogOfferId: string,
    userId: string,
    action: string,
    oldStatus?: string,
    newStatus?: string,
    changesSummary?: any,
    metadata?: any,
    tx: PrismaClient = this.prisma
  ): Promise<AuditLogEntry> {
    const auditEntry = await tx.catalog_offer_audit_log.create({
      data: {
        catalog_offer_id: catalogOfferId,
        action_type: action,
        performed_by_user_id: userId,
        old_status: oldStatus as any,
        new_status: newStatus as any,
        changes_summary: changesSummary,
        metadata: metadata,
        created_at: new Date(),
      },
    });

    return {
      audit_id: auditEntry.audit_id,
      public_id: auditEntry.public_id,
      catalog_offer_id: auditEntry.catalog_offer_id,
      action_type: auditEntry.action_type,
      performed_by_user_id: auditEntry.performed_by_user_id,
      old_status: auditEntry.old_status,
      new_status: auditEntry.new_status,
      changes_summary: auditEntry.changes_summary,
      metadata: auditEntry.metadata,
      created_at: auditEntry.created_at,
    };
  }

  /**
   * Check if negotiations can be reopened after rejection
   */
  async canReopenRejectedOffer(
    catalogOfferId: string,
    tx: PrismaClient = this.prisma
  ): Promise<{
    canReopen: boolean;
    rejectedAt: Date | null;
    reopenDeadline: Date | null;
    rejectionReason: string | null;
    rejectionCategory: string | null;
  }> {
    // First check the offer's rejection fields
    const offer = await tx.catalog_offers.findUnique({
      where: { catalog_offer_id: catalogOfferId },
      select: {
        rejected_at: true,
        rejection_reason: true,
        rejection_category: true,
        reopen_deadline: true,
        can_reopen: true,
      },
    });

    if (offer && offer.rejected_at) {
      const canReopen =
        offer.can_reopen && offer.reopen_deadline
          ? new Date() <= offer.reopen_deadline
          : false;

      return {
        canReopen,
        rejectedAt: offer.rejected_at,
        reopenDeadline: offer.reopen_deadline,
        rejectionReason: offer.rejection_reason,
        rejectionCategory: offer.rejection_category,
      };
    }

    // Fallback to check negotiations table
    const rejectionNegotiation = await tx.catalog_offer_negotiations.findFirst({
      where: {
        catalog_offer_id: catalogOfferId,
        action_type: { in: ["BUYER_REJECT", "SELLER_REJECT"] },
        offer_status: "REJECTED",
      },
      orderBy: { created_at: "desc" },
      select: {
        created_at: true,
        offer_message: true,
      },
    });

    if (!rejectionNegotiation) {
      return {
        canReopen: false,
        rejectedAt: null,
        reopenDeadline: null,
        rejectionReason: null,
        rejectionCategory: null,
      };
    }

    const rejectedAt = rejectionNegotiation.created_at;
    const reopenDeadline = rejectedAt
      ? new Date(rejectedAt.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days
      : null;

    const canReopen = reopenDeadline ? new Date() <= reopenDeadline : false;

    return {
      canReopen,
      rejectedAt,
      reopenDeadline,
      rejectionReason: rejectionNegotiation.offer_message,
      rejectionCategory: null, // Not available in old rejection format
    };
  }

  /**
   * Create alternative suggestion
   */
  async createAlternativeSuggestion(
    catalogOfferId: string,
    suggestedProductVariantId: string | null,
    suggestedPrice: number | null,
    suggestedPriceCurrency: string | null,
    availableQuantity: number | null,
    productName: string | null,
    suggestionMessage: string | null,
    tx: PrismaClient = this.prisma
  ): Promise<AlternativeSuggestion> {
    const suggestion = await tx.catalog_offer_alternative_suggestions.create({
      data: {
        catalog_offer_id: catalogOfferId,
        suggested_product_variant_id: suggestedProductVariantId,
        suggested_price: suggestedPrice,
        suggested_price_currency: suggestedPriceCurrency as any,
        available_quantity: availableQuantity,
        product_name: productName,
        suggestion_message: suggestionMessage,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return {
      suggestion_id: suggestion.suggestion_id,
      public_id: suggestion.public_id,
      catalog_offer_id: suggestion.catalog_offer_id,
      suggested_product_variant_id: suggestion.suggested_product_variant_id,
      suggested_price: suggestion.suggested_price,
      suggested_price_currency: suggestion.suggested_price_currency,
      available_quantity: suggestion.available_quantity,
      product_name: suggestion.product_name,
      suggestion_message: suggestion.suggestion_message,
      created_at: suggestion.created_at,
      updated_at: suggestion.updated_at,
    };
  }

  /**
   * Get alternative suggestions for an offer
   */
  async getAlternativeSuggestions(
    catalogOfferId: string,
    tx: PrismaClient = this.prisma
  ): Promise<AlternativeSuggestion[]> {
    const suggestions = await tx.catalog_offer_alternative_suggestions.findMany(
      {
        where: { catalog_offer_id: catalogOfferId },
        orderBy: { created_at: "desc" },
      }
    );

    return suggestions.map((suggestion) => ({
      suggestion_id: suggestion.suggestion_id,
      public_id: suggestion.public_id,
      catalog_offer_id: suggestion.catalog_offer_id,
      suggested_product_variant_id: suggestion.suggested_product_variant_id,
      suggested_price: suggestion.suggested_price,
      suggested_price_currency: suggestion.suggested_price_currency,
      available_quantity: suggestion.available_quantity,
      product_name: suggestion.product_name,
      suggestion_message: suggestion.suggestion_message,
      created_at: suggestion.created_at,
      updated_at: suggestion.updated_at,
    }));
  }

  /**
   * Create minimum terms for an offer
   */
  async createMinimumTerms(
    catalogOfferId: string,
    minimumUnitPrice: number | null,
    minimumTotalOrder: number | null,
    minimumQuantity: number | null,
    currencyCode: string | null,
    minimumOrderFrequency: string | null,
    paymentTerms: string | null,
    deliveryRequirements: string | null,
    termsMessage: string | null,
    validUntil: Date | null,
    tx: PrismaClient = this.prisma
  ): Promise<MinimumTerms> {
    const terms = await tx.catalog_offer_minimum_terms.create({
      data: {
        catalog_offer_id: catalogOfferId,
        minimum_unit_price: minimumUnitPrice,
        minimum_total_order: minimumTotalOrder,
        minimum_quantity: minimumQuantity,
        currency_code: currencyCode as any,
        minimum_order_frequency: minimumOrderFrequency,
        payment_terms: paymentTerms,
        delivery_requirements: deliveryRequirements,
        terms_message: termsMessage,
        valid_until: validUntil,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return {
      minimum_terms_id: terms.minimum_terms_id,
      public_id: terms.public_id,
      catalog_offer_id: terms.catalog_offer_id,
      minimum_unit_price: terms.minimum_unit_price,
      minimum_total_order: terms.minimum_total_order,
      minimum_quantity: terms.minimum_quantity,
      currency_code: terms.currency_code,
      minimum_order_frequency: terms.minimum_order_frequency,
      payment_terms: terms.payment_terms,
      delivery_requirements: terms.delivery_requirements,
      terms_message: terms.terms_message,
      valid_until: terms.valid_until,
      created_at: terms.created_at,
      updated_at: terms.updated_at,
    };
  }

  /**
   * Get minimum terms for an offer
   */
  async getMinimumTerms(
    catalogOfferId: string,
    tx: PrismaClient = this.prisma
  ): Promise<MinimumTerms[]> {
    const terms = await tx.catalog_offer_minimum_terms.findMany({
      where: { catalog_offer_id: catalogOfferId },
      orderBy: { created_at: "desc" },
    });

    return terms.map((term) => ({
      minimum_terms_id: term.minimum_terms_id,
      public_id: term.public_id,
      catalog_offer_id: term.catalog_offer_id,
      minimum_unit_price: term.minimum_unit_price,
      minimum_total_order: term.minimum_total_order,
      minimum_quantity: term.minimum_quantity,
      currency_code: term.currency_code,
      minimum_order_frequency: term.minimum_order_frequency,
      payment_terms: term.payment_terms,
      delivery_requirements: term.delivery_requirements,
      terms_message: term.terms_message,
      valid_until: term.valid_until,
      created_at: term.created_at,
      updated_at: term.updated_at,
    }));
  }

  /**
   * Update offer rejection details
   */
  async updateOfferRejectionDetails(
    catalogOfferId: string,
    rejectedByUserId: string,
    rejectionReason: string,
    rejectionCategory: string | null,
    reopenDeadline: Date | null,
    canReopen: boolean = true,
    tx: PrismaClient = this.prisma
  ): Promise<void> {
    const rejectedAt = new Date();

    await tx.catalog_offers.update({
      where: { catalog_offer_id: catalogOfferId },
      data: {
        offer_status: "REJECTED",
        rejected_by_user_id: rejectedByUserId,
        rejected_at: rejectedAt,
        rejection_reason: rejectionReason,
        rejection_category: rejectionCategory as any,
        reopen_deadline: reopenDeadline,
        can_reopen: canReopen,
        last_action_by_user_id: rejectedByUserId,
        last_action_at: rejectedAt,
        updated_at: rejectedAt,
      },
    });
  }

  /**
   * Update offer acceptance details
   */
  async updateOfferAcceptanceDetails(
    catalogOfferId: string,
    acceptedByUserId: string,
    currentRound: number,
    tx: PrismaClient = this.prisma
  ): Promise<void> {
    const acceptedAt = new Date();

    await tx.catalog_offers.update({
      where: { catalog_offer_id: catalogOfferId },
      data: {
        offer_status: "ACCEPTED",
        current_round: currentRound,
        last_action_by_user_id: acceptedByUserId,
        last_action_at: acceptedAt,
        updated_at: acceptedAt,
      },
    });
  }

  /**
   * Update item agreed details
   */
  async updateItemAgreedDetails(
    catalogOfferItemId: string,
    finalAgreedPrice: number,
    finalAgreedPriceCurrency: string,
    finalAgreedQuantity: number,
    tx: PrismaClient = this.prisma
  ): Promise<void> {
    const agreedAt = new Date();

    await tx.catalog_offer_items.update({
      where: { catalog_offer_item_id: catalogOfferItemId },
      data: {
        final_agreed_price: finalAgreedPrice,
        final_agreed_price_currency: finalAgreedPriceCurrency as any,
        final_agreed_quantity: finalAgreedQuantity,
        agreed_at: agreedAt,
        negotiation_status: "AGREED",
        updated_at: agreedAt,
      },
    });
  }

  /**
   * Set offer auto-expiration
   */
  async setOfferAutoExpiration(
    catalogOfferId: string,
    autoExpireAt: Date,
    expiredReason?: string,
    tx: PrismaClient = this.prisma
  ): Promise<void> {
    await tx.catalog_offers.update({
      where: { catalog_offer_id: catalogOfferId },
      data: {
        auto_expire_at: autoExpireAt,
        expired_reason: expiredReason,
        updated_at: new Date(),
      },
    });
  }

  /**
   * Get audit log for an offer
   */
  async getOfferAuditLog(
    catalogOfferId: string,
    limit?: number,
    tx: PrismaClient = this.prisma
  ): Promise<AuditLogEntry[]> {
    const auditEntries = await tx.catalog_offer_audit_log.findMany({
      where: { catalog_offer_id: catalogOfferId },
      orderBy: { created_at: "desc" },
      ...(limit && { take: limit }),
    });

    return auditEntries.map((entry) => ({
      audit_id: entry.audit_id,
      public_id: entry.public_id,
      catalog_offer_id: entry.catalog_offer_id,
      action_type: entry.action_type,
      performed_by_user_id: entry.performed_by_user_id,
      old_status: entry.old_status,
      new_status: entry.new_status,
      changes_summary: entry.changes_summary,
      metadata: entry.metadata,
      created_at: entry.created_at,
    }));
  }

  /**
   * Bulk update negotiations to expired status
   */
  async bulkExpireNegotiations(
    catalogOfferId: string,
    negotiationIds: string[],
    tx: PrismaClient = this.prisma
  ): Promise<number> {
    const result = await tx.catalog_offer_negotiations.updateMany({
      where: {
        catalog_offer_id: catalogOfferId,
        catalog_offer_negotiation_id: { in: negotiationIds },
        offer_status: "PENDING",
      },
      data: {
        offer_status: "EXPIRED",
        responded_at: new Date(),
        auto_expired: true,
      },
    });

    return result.count;
  }

  /**
   * Get offers that need auto-expiration processing
   */
  async getOffersForAutoExpiration(
    currentTime: Date = new Date(),
    tx: PrismaClient = this.prisma
  ): Promise<
    Array<{
      catalog_offer_id: string;
      public_id: string;
      auto_expire_at: Date;
      offer_status: string;
    }>
  > {
    const offers = await tx.catalog_offers.findMany({
      where: {
        auto_expire_at: { lte: currentTime },
        offer_status: { in: ["ACTIVE", "NEGOTIATING"] },
      },
      select: {
        catalog_offer_id: true,
        public_id: true,
        auto_expire_at: true,
        offer_status: true,
      },
    });

    return offers.map((offer) => ({
      catalog_offer_id: offer.catalog_offer_id,
      public_id: offer.public_id,
      auto_expire_at: offer.auto_expire_at!,
      offer_status: offer.offer_status!,
    }));
  }
}
