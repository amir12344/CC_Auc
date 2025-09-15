import {
  currency_code_type,
  offer_negotiation_action_type,
  offer_rejection_category_type,
  offer_status_type,
  PrismaClient,
} from "../../../lambda-layers/core-layer/nodejs/prisma/generated/client";
import { STANDARD_ID_LENGTH } from "../../utilities/public-id-generator";
import { NegotiateCatalogOfferDatabaseOperations } from "./NegotiateCatalogOfferDatabaseOperation";

export interface ItemNegotiation {
  catalogOfferItemId: string; // this is public id
  offerPricePerUnit: number;
  offerQuantity: number;
  responseType?: "ACCEPT" | "REJECT" | "COUNTER" | null;
  offerMessage?: string | null;
}

export interface ItemRejection {
  catalogOfferItemId: string; // this is public id
  rejectionReason: string;
  rejectionCategory:
    | "PRICING_TOO_LOW"
    | "PRICING_TOO_HIGH"
    | "BUDGET_CONSTRAINTS"
    | "PRODUCT_NOT_NEEDED"
    | "INVENTORY_UNAVAILABLE"
    | "DELIVERY_TIMELINE_TOO_LONG"
    | "FOUND_BETTER_ALTERNATIVE"
    | "PROJECT_CANCELLED"
    | "OTHER";
}

export interface ItemChange {
  changeType:
    | "ITEM_ADDED"
    | "ITEM_REMOVED"
    | "QUANTITY_CHANGED"
    | "ITEM_REPLACED"
    | "PRICE_CHANGED"
    | "TERMS_UPDATED"
    | "AUTO_ACCEPTED";
  catalogOfferItemId?: string | null; // this is public id
  catalogProductVariantId?: string | null; // this is public id
  newQuantity?: number | null;
  requestedQuantity?: number | null;
  buyerOfferPrice?: number | null;
  buyerOfferPriceCurrency?: string | null;
  changeReason?: string | null;
}

export interface SuggestedVariant {
  catalogProductVariantId: string; // this is public id
  suggestedPrice: number;
  availableQuantity: number;
  productName: string;
}

export interface MinimumAcceptableTerms {
  minimumUnitPrice?: number | null;
  minimumTotalOrder?: number | null;
  minimumQuantity?: number | null;
}

export interface AlternativeSuggestion {
  message: string;
  suggestedVariants?: SuggestedVariant[] | null;
  minimumAcceptableTerms?: MinimumAcceptableTerms | null;
}

export interface FinalBudgetInfo {
  maximumTotalBudget: number;
  maximumUnitPrices?: any;
  preferredAlternatives?: string[] | null;
}

export interface NegotiateCatalogOfferConfig {
  catalogOfferId: string; // this is public id
  userId: string;
  userType: "BUYER" | "SELLER";
  actionType:
    | "SELLER_COUNTER"
    | "BUYER_ACCEPT"
    | "SELLER_ACCEPT"
    | "SELLER_REJECT"
    | "BUYER_REJECT"
    | "BUYER_COUNTER";
  itemNegotiations?: ItemNegotiation[];
  itemRejections?: ItemRejection[];
  itemChanges?: ItemChange[];
  rejectionReason?: string;
  rejectionCategory?:
    | "PRICING_TOO_LOW"
    | "PRICING_TOO_HIGH"
    | "BUDGET_CONSTRAINTS"
    | "INVENTORY_UNAVAILABLE"
    | "DELIVERY_TIMELINE_TOO_LONG"
    | "FOUND_BETTER_ALTERNATIVE"
    | "PROJECT_CANCELLED"
    | "OTHER";
  alternativeSuggestion?: AlternativeSuggestion;
  finalBudgetInfo?: FinalBudgetInfo;
  validUntil?: Date;
}

export interface NegotiateCatalogOfferResult {
  success: boolean;
  data?: {
    catalogOfferId: string;
    offerStatus: offer_status_type;
    currentRound: number;
    negotiationsCreated?: Array<{
      negotiationId: string;
      catalogOfferItemId: string;
      actionType: string;
      offerPricePerUnit: number;
      offerQuantity: number;
      offerStatus: string;
      validUntil?: Date;
      includesItemChanges: boolean;
    }>;
    itemChangesApplied?: Array<{
      changeId: string;
      changeType: string;
      catalogOfferItemId?: string;
      previousQuantity?: number;
      newQuantity?: number;
      addedInRound?: number;
      removedInRound?: number;
    }>;
    totalOfferValue?: number;
    totalOfferValueCurrency?: currency_code_type;
    rejectionDetails?: {
      rejectionRound: number;
      rejectionBy: "BUYER" | "SELLER";
      rejectionCategory?: string;
      rejectionReason?: string;
      finalNegotiationId: string;
      rejectedAt: Date;
      alternativeSuggestionsProvided: boolean;
      canReopen: boolean;
      reopenDeadline?: Date;
    };
    orderCreated?: {
      orderId: string;
      orderNumber: string;
      orderPublicId: string;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export class NegotiateCatalogOfferOperations {
  private dbOps: NegotiateCatalogOfferDatabaseOperations;

  constructor(private prisma: PrismaClient) {
    this.dbOps = new NegotiateCatalogOfferDatabaseOperations(prisma);
  }

  async negotiateCatalogOffer(
    config: NegotiateCatalogOfferConfig
  ): Promise<NegotiateCatalogOfferResult> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const validation = await this.validateNegotiationRequest(
          config,
          tx as PrismaClient
        );
        if (!validation.isValid) {
          return {
            success: false,
            error: validation.error,
          };
        }

        const offerData = validation.offerData!;

        const authCheck = await this.checkNegotiationAuthorization(
          offerData,
          config.userId,
          config.userType,
          config.actionType,
          tx as PrismaClient
        );
        if (!authCheck.authorized) {
          return {
            success: false,
            error: authCheck.error,
          };
        }

        switch (config.actionType) {
          case "BUYER_ACCEPT":
          case "SELLER_ACCEPT":
            return await this.handleAcceptAction(
              config,
              offerData,
              tx as PrismaClient
            );

          case "BUYER_REJECT":
          case "SELLER_REJECT":
            return await this.handleRejectAction(
              config,
              offerData,
              tx as PrismaClient
            );

          case "BUYER_COUNTER":
          case "SELLER_COUNTER":
            return await this.handleCounterAction(
              config,
              offerData,
              tx as PrismaClient
            );

          default:
            return {
              success: false,
              error: {
                code: "INVALID_ACTION_TYPE",
                message: "Invalid negotiation action type",
                details: { actionType: config.actionType },
              },
            };
        }
      });
    } catch (error) {
      console.error("Error in negotiateCatalogOffer:", error);
      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message:
            "An internal error occurred while processing the negotiation",
          details: {
            error: error instanceof Error ? error.message : String(error),
          },
        },
      };
    }
  }

  private async validateNegotiationRequest(
    config: NegotiateCatalogOfferConfig,
    tx: PrismaClient
  ): Promise<{
    isValid: boolean;
    error?: { code: string; message: string; details?: any };
    offerData?: any;
    userProfileData?: any;
  }> {
    // Convert catalogOfferId from public_id to internal UUID
    let catalogOfferInternalId: string;
    if (config.catalogOfferId.length === STANDARD_ID_LENGTH) {
      const offerRecord = await tx.catalog_offers.findUnique({
        where: { public_id: config.catalogOfferId },
        select: { catalog_offer_id: true },
      });
      if (!offerRecord) {
        return {
          isValid: false,
          error: {
            code: "OFFER_NOT_FOUND",
            message: "Catalog offer not found",
            details: { catalogOfferId: config.catalogOfferId },
          },
        };
      }
      catalogOfferInternalId = offerRecord.catalog_offer_id;
    } else {
      catalogOfferInternalId = config.catalogOfferId;
    }

    const offerData = await this.dbOps.getOfferForNegotiation(
      catalogOfferInternalId,
      tx
    );
    if (!offerData) {
      return {
        isValid: false,
        error: {
          code: "OFFER_NOT_FOUND",
          message: "Catalog offer not found",
          details: { catalogOfferId: config.catalogOfferId },
        },
      };
    }

    if (!["ACTIVE", "NEGOTIATING"].includes(offerData.offer_status!)) {
      return {
        isValid: false,
        error: {
          code: "INVALID_OFFER_STATUS",
          message: `Cannot perform this action on an offer with status '${offerData.offer_status}'`,
          details: {
            currentStatus: offerData.offer_status,
            attemptedAction: config.actionType,
            validStatuses: ["ACTIVE", "NEGOTIATING"],
          },
        },
      };
    }

    if (offerData.expires_at && offerData.expires_at < new Date()) {
      return {
        isValid: false,
        error: {
          code: "OFFER_EXPIRED",
          message: "Cannot perform actions on an expired offer",
          details: {
            expiredAt: offerData.expires_at,
            currentTime: new Date(),
          },
        },
      };
    }

    const userProfileData = await this.getUserProfileData(
      config.userId,
      config.userType,
      tx
    );
    if (!userProfileData) {
      return {
        isValid: false,
        error: {
          code: "USER_PROFILE_NOT_FOUND",
          message: "User profile not found",
          details: { userId: config.userId, userType: config.userType },
        },
      };
    }

    if (
      config.userType === "BUYER" &&
      offerData.buyer_user_id !== config.userId
    ) {
      return {
        isValid: false,
        error: {
          code: "UNAUTHORIZED_ACCESS",
          message: "You are not authorized to negotiate this offer",
          details: { reason: "Not the buyer for this offer" },
        },
      };
    }

    if (
      config.userType === "SELLER" &&
      offerData.seller_user_id !== config.userId
    ) {
      return {
        isValid: false,
        error: {
          code: "UNAUTHORIZED_ACCESS",
          message: "You are not authorized to negotiate this offer",
          details: { reason: "Not the seller for this offer" },
        },
      };
    }

    if (config.itemNegotiations && config.itemNegotiations.length > 0) {
      const validationResult = await this.validateItemNegotiations(
        config.itemNegotiations,
        offerData,
        tx
      );
      if (!validationResult.isValid) {
        return validationResult;
      }
    }

    if (config.itemChanges && config.itemChanges.length > 0) {
      const validationResult = await this.validateItemChanges(
        config.itemChanges,
        offerData,
        config.userType,
        tx
      );
      if (!validationResult.isValid) {
        return validationResult;
      }
    }

    return {
      isValid: true,
      offerData,
      userProfileData,
    };
  }

  private async checkNegotiationAuthorization(
    offerData: any,
    userId: string,
    userType: string,
    actionType: string,
    tx: PrismaClient
  ): Promise<{ authorized: boolean; error?: any }> {
    const currentRound = await this.dbOps.getCurrentNegotiationRound(
      offerData.catalog_offer_id,
      tx
    );
    const lastAction = await this.dbOps.getLastNegotiationAction(
      offerData.catalog_offer_id,
      tx
    );

    switch (actionType) {
      case "BUYER_ACCEPT":
        if (
          lastAction &&
          !["SELLER_COUNTER", "SELLER_OFFER"].includes(lastAction.action_type)
        ) {
          return {
            authorized: false,
            error: {
              code: "INVALID_NEGOTIATION_SEQUENCE",
              message: "Cannot accept offer at this time",
              details: {
                reason: "No pending seller offer to accept",
                lastActionType: lastAction.action_type,
                suggestedActions: [
                  "Wait for seller response",
                  "Make a counter-offer",
                ],
              },
            },
          };
        }
        break;

      case "SELLER_ACCEPT":
        if (
          lastAction &&
          !["BUYER_COUNTER", "BUYER_OFFER"].includes(lastAction.action_type)
        ) {
          return {
            authorized: false,
            error: {
              code: "INVALID_NEGOTIATION_SEQUENCE",
              message: "Cannot accept offer at this time",
              details: {
                reason: "No pending buyer offer to accept",
                lastActionType: lastAction.action_type,
                suggestedActions: [
                  "Wait for buyer response",
                  "Make a counter-offer",
                ],
              },
            },
          };
        }
        break;

      case "BUYER_COUNTER":
        if (lastAction && lastAction.offered_by_user_id === userId) {
          return {
            authorized: false,
            error: {
              code: "INVALID_NEGOTIATION_SEQUENCE",
              message: "Cannot make consecutive counter-offers",
              details: {
                reason: "Waiting for seller response to your last offer",
                lastActionType: lastAction.action_type,
                suggestedActions: ["Wait for seller response"],
              },
            },
          };
        }
        break;

      case "SELLER_COUNTER":
        if (lastAction && lastAction.offered_by_user_id === userId) {
          return {
            authorized: false,
            error: {
              code: "INVALID_NEGOTIATION_SEQUENCE",
              message: "Cannot make consecutive counter-offers",
              details: {
                reason: "Waiting for buyer response to your last offer",
                lastActionType: lastAction.action_type,
                suggestedActions: ["Wait for buyer response"],
              },
            },
          };
        }
        break;
    }

    return { authorized: true };
  }

  private async handleAcceptAction(
    config: NegotiateCatalogOfferConfig,
    offerData: any,
    tx: PrismaClient
  ): Promise<NegotiateCatalogOfferResult> {
    const currentRound = await this.dbOps.getCurrentNegotiationRound(
      offerData.catalog_offer_id,
      tx
    );
    const newRound = currentRound + 1;

    const negotiationsCreated = [];
    const activeItems = offerData.catalog_offer_items.filter(
      (item: any) => item.item_status === "ACTIVE"
    );

    for (const item of activeItems) {
      const currentNegotiation = await this.dbOps.getCurrentItemNegotiation(
        item.catalog_offer_item_id,
        tx
      );

      if (!currentNegotiation) {
        continue;
      }

      const negotiation = await tx.catalog_offer_negotiations.create({
        data: {
          catalog_offer_id: offerData.catalog_offer_id,
          catalog_offer_item_id: item.catalog_offer_item_id,
          offered_by_user_id: config.userId,
          parent_negotiation_id:
            currentNegotiation.catalog_offer_negotiation_id,
          negotiation_round: newRound,
          is_current_offer: true,
          action_type: config.actionType as offer_negotiation_action_type,
          offer_price_per_unit: currentNegotiation.offer_price_per_unit,
          offer_price_currency:
            currentNegotiation.offer_price_currency as currency_code_type,
          offer_quantity: currentNegotiation.offer_quantity!,
          offer_status: "ACCEPTED",
          offer_message:
            config.itemNegotiations?.[0]?.offerMessage || "Offer accepted",
          valid_until: config.validUntil,
          includes_item_changes: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      await tx.catalog_offer_negotiations.update({
        where: {
          catalog_offer_negotiation_id:
            currentNegotiation.catalog_offer_negotiation_id,
        },
        data: {
          is_current_offer: false,
          offer_status: "ACCEPTED",
          responded_at: new Date(),
        },
      });

      // Update item with final agreed terms
      await tx.catalog_offer_items.update({
        where: { catalog_offer_item_id: item.catalog_offer_item_id },
        data: {
          negotiation_status: "AGREED",
          final_agreed_price: currentNegotiation.offer_price_per_unit,
          final_agreed_price_currency:
            currentNegotiation.offer_price_currency as currency_code_type,
          final_agreed_quantity: currentNegotiation.offer_quantity,
          agreed_at: new Date(),
          ...(config.userType === "BUYER"
            ? {
                current_buyer_negotiation_id:
                  negotiation.catalog_offer_negotiation_id,
              }
            : {
                current_seller_negotiation_id:
                  negotiation.catalog_offer_negotiation_id,
              }),
          updated_at: new Date(),
        },
      });

      // Get public_id for the item to return in response
      const itemWithPublicId = await tx.catalog_offer_items.findUnique({
        where: { catalog_offer_item_id: item.catalog_offer_item_id },
        select: { public_id: true },
      });

      negotiationsCreated.push({
        negotiationId: negotiation.public_id,
        catalogOfferItemId:
          itemWithPublicId?.public_id || item.catalog_offer_item_id,
        actionType: negotiation.action_type,
        offerPricePerUnit: Number(negotiation.offer_price_per_unit),
        offerQuantity: negotiation.offer_quantity!,
        offerStatus: negotiation.offer_status!,
        validUntil: negotiation.valid_until || undefined,
        includesItemChanges: false,
      });
    }

    // Update offer with new status and tracking fields
    const updatedOffer = await tx.catalog_offers.update({
      where: { catalog_offer_id: offerData.catalog_offer_id },
      data: {
        offer_status: "ACCEPTED",
        current_round: newRound,
        last_action_by_user_id: config.userId,
        last_action_at: new Date(),
        updated_at: new Date(),
      },
    });

    const totalValue = negotiationsCreated.reduce(
      (sum, neg) => sum + neg.offerPricePerUnit * neg.offerQuantity,
      0
    );

    await this.createAuditLogEntry(
      offerData.catalog_offer_id,
      config.userId,
      config.actionType,
      offerData.offer_status,
      "ACCEPTED",
      {
        actionType: config.actionType,
        userType: config.userType,
        itemCount: negotiationsCreated.length,
        hasItemChanges: false,
        currentRound: newRound,
        totalValue: totalValue,
        currency: offerData.total_offer_value_currency,
      },
      tx as PrismaClient
    );

    const order = await this.createOrderFromAcceptedOffer(
      offerData,
      negotiationsCreated,
      tx
    );

    return {
      success: true,
      data: {
        catalogOfferId: offerData.public_id,
        offerStatus: "ACCEPTED",
        currentRound: newRound,
        negotiationsCreated,
        totalOfferValue: totalValue,
        totalOfferValueCurrency: offerData.total_offer_value_currency,
        orderCreated: order
          ? {
              orderId: order.order_id,
              orderNumber: order.order_number || "",
              orderPublicId: order.public_id,
            }
          : undefined,
      },
    };
  }

  private async handleRejectAction(
    config: NegotiateCatalogOfferConfig,
    offerData: any,
    tx: PrismaClient
  ): Promise<NegotiateCatalogOfferResult> {
    if (!config.rejectionReason) {
      return {
        success: false,
        error: {
          code: "REJECTION_REASON_REQUIRED",
          message:
            "A rejection reason must be provided when rejecting an offer",
          details: {
            rejectionCategory: config.rejectionCategory,
            requiredFields: ["rejection_reason"],
          },
        },
      };
    }

    const currentRound = await this.dbOps.getCurrentNegotiationRound(
      offerData.catalog_offer_id,
      tx
    );
    const newRound = currentRound + 1;

    const negotiationsCreated = [];
    const activeItems = offerData.catalog_offer_items.filter(
      (item: any) => item.item_status === "ACTIVE"
    );

    for (const item of activeItems) {
      const currentNegotiation = await this.dbOps.getCurrentItemNegotiation(
        item.catalog_offer_item_id,
        tx
      );

      if (!currentNegotiation) {
        continue;
      }

      const negotiationCreateData: any = {
        catalog_offer_id: offerData.catalog_offer_id,
        catalog_offer_item_id: item.catalog_offer_item_id,
        offered_by_user_id: config.userId,
        negotiation_round: newRound,
        is_current_offer: true,
        action_type: config.actionType as offer_negotiation_action_type,
        offer_price_per_unit: currentNegotiation.offer_price_per_unit,
        offer_price_currency:
          currentNegotiation.offer_price_currency as currency_code_type,
        offer_quantity: currentNegotiation.offer_quantity || 0,
        offer_status: "REJECTED",
        offer_message: config.rejectionReason,
        includes_item_changes: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      if (currentNegotiation.catalog_offer_negotiation_id) {
        negotiationCreateData.parent_negotiation_id =
          currentNegotiation.catalog_offer_negotiation_id;
      }

      const negotiation = await tx.catalog_offer_negotiations.create({
        data: negotiationCreateData,
      });

      await tx.catalog_offer_negotiations.update({
        where: {
          catalog_offer_negotiation_id:
            currentNegotiation.catalog_offer_negotiation_id,
        },
        data: {
          is_current_offer: false,
          offer_status: "REJECTED",
          responded_at: new Date(),
        },
      });

      await tx.catalog_offer_items.update({
        where: { catalog_offer_item_id: item.catalog_offer_item_id },
        data: {
          negotiation_status: "REJECTED",
          updated_at: new Date(),
        },
      });

      // Get public_id for the item to return in response
      const itemWithPublicId = await tx.catalog_offer_items.findUnique({
        where: { catalog_offer_item_id: item.catalog_offer_item_id },
        select: { public_id: true },
      });

      negotiationsCreated.push({
        negotiationId: negotiation.public_id,
        catalogOfferItemId:
          itemWithPublicId?.public_id || item.catalog_offer_item_id,
        actionType: negotiation.action_type,
        offerPricePerUnit: Number(negotiation.offer_price_per_unit),
        offerQuantity: negotiation.offer_quantity!,
        offerStatus: negotiation.offer_status!,
        includesItemChanges: false,
      });
    }

    const rejectedAt = new Date();
    const reopenDeadline = new Date(
      rejectedAt.getTime() + 7 * 24 * 60 * 60 * 1000
    );

    // Update offer with rejection details
    await tx.catalog_offers.update({
      where: { catalog_offer_id: offerData.catalog_offer_id },
      data: {
        offer_status: "REJECTED",
        current_round: newRound,
        last_action_by_user_id: config.userId,
        last_action_at: rejectedAt,
        rejection_reason: config.rejectionReason,
        rejection_category:
          config.rejectionCategory as offer_rejection_category_type,
        rejected_at: rejectedAt,
        rejected_by_user_id: config.userId,
        reopen_deadline: reopenDeadline,
        can_reopen: true,
        updated_at: rejectedAt,
      },
    });

    // Store alternative suggestions if provided
    if (config.alternativeSuggestion) {
      await this.storeAlternativeSuggestions(
        offerData.catalog_offer_id,
        config.alternativeSuggestion,
        tx
      );
    }

    // Update audit log
    await this.createAuditLogEntry(
      offerData.catalog_offer_id,
      config.userId,
      config.actionType,
      offerData.offer_status,
      "REJECTED",
      {
        actionType: config.actionType,
        userType: config.userType,
        itemCount: negotiationsCreated.length,
        hasItemChanges: false,
        currentRound: newRound,
        rejectionReason: config.rejectionReason,
        rejectionCategory: config.rejectionCategory,
        hasAlternativeSuggestions: !!config.alternativeSuggestion,
      },
      tx as PrismaClient
    );

    return {
      success: true,
      data: {
        catalogOfferId: offerData.public_id,
        offerStatus: "REJECTED",
        currentRound: newRound,
        negotiationsCreated,
        rejectionDetails: {
          rejectionRound: newRound,
          rejectionBy: config.userType as "BUYER" | "SELLER",
          rejectionCategory: config.rejectionCategory,
          rejectionReason: config.rejectionReason,
          finalNegotiationId: negotiationsCreated[0]?.negotiationId || "",
          rejectedAt,
          alternativeSuggestionsProvided: !!config.alternativeSuggestion,
          canReopen: true,
          reopenDeadline,
        },
      },
    };
  }

  private async handleCounterAction(
    config: NegotiateCatalogOfferConfig,
    offerData: any,
    tx: PrismaClient
  ): Promise<NegotiateCatalogOfferResult> {
    if (!config.itemNegotiations || config.itemNegotiations.length === 0) {
      return {
        success: false,
        error: {
          code: "NO_ITEM_NEGOTIATIONS",
          message: "Item negotiations are required for counter-offers",
        },
      };
    }

    const currentRound = await this.dbOps.getCurrentNegotiationRound(
      offerData.catalog_offer_id,
      tx
    );
    const newRound = currentRound + 1;

    const itemChangesApplied = [];
    if (config.itemChanges && config.itemChanges.length > 0) {
      const changesResult = await this.applyItemChanges(
        config.itemChanges,
        offerData.catalog_offer_id,
        config.userId,
        newRound,
        tx
      );
      itemChangesApplied.push(...changesResult);
    }

    const negotiationsCreated = [];
    for (const itemNeg of config.itemNegotiations) {
      const itemId = await this.resolveOfferItemId(
        itemNeg.catalogOfferItemId,
        tx
      );
      if (!itemId) {
        continue;
      }

      const negotiation = await tx.catalog_offer_negotiations.create({
        data: {
          catalog_offer_id: offerData.catalog_offer_id,
          catalog_offer_item_id: itemId,
          negotiation_round: newRound,
          is_current_offer: true,
          action_type: config.actionType as offer_negotiation_action_type,
          offered_by_user_id: config.userId,
          offer_price_per_unit: itemNeg.offerPricePerUnit,
          offer_price_currency: offerData.total_offer_value_currency || "USD",
          offer_quantity: itemNeg.offerQuantity,
          offer_status: "PENDING",
          offer_message: itemNeg.offerMessage,
          valid_until: config.validUntil,
          includes_item_changes: itemChangesApplied.length > 0,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      await tx.catalog_offer_items.update({
        where: { catalog_offer_item_id: itemId },
        data: {
          negotiation_status:
            config.userType === "BUYER"
              ? "BUYER_COUNTERED"
              : "SELLER_COUNTERED",
          ...(config.userType === "BUYER"
            ? {
                buyer_offer_price: itemNeg.offerPricePerUnit,
                buyer_offer_price_currency:
                  (offerData.total_offer_value_currency ||
                    "USD") as currency_code_type,
                current_buyer_negotiation_id:
                  negotiation.catalog_offer_negotiation_id,
              }
            : {
                seller_offer_price: itemNeg.offerPricePerUnit,
                seller_offer_price_currency:
                  (offerData.total_offer_value_currency ||
                    "USD") as currency_code_type,
                current_seller_negotiation_id:
                  negotiation.catalog_offer_negotiation_id,
              }),
          updated_at: new Date(),
        },
      });

      // Get public_id for the item to return in response
      const itemWithPublicId = await tx.catalog_offer_items.findUnique({
        where: { catalog_offer_item_id: itemId },
        select: { public_id: true },
      });

      negotiationsCreated.push({
        negotiationId: negotiation.public_id,
        catalogOfferItemId: itemWithPublicId?.public_id || itemId,
        actionType: negotiation.action_type,
        offerPricePerUnit: Number(negotiation.offer_price_per_unit),
        offerQuantity: negotiation.offer_quantity!,
        offerStatus: negotiation.offer_status!,
        validUntil: negotiation.valid_until || undefined,
        includesItemChanges: itemChangesApplied.length > 0,
      });
    }

    // Update offer with counter details
    await tx.catalog_offers.update({
      where: { catalog_offer_id: offerData.catalog_offer_id },
      data: {
        offer_status: "NEGOTIATING",
        current_round: newRound,
        last_action_by_user_id: config.userId,
        last_action_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Calculate new total offer value
    const totalValue = negotiationsCreated.reduce(
      (sum, neg) => sum + neg.offerPricePerUnit * neg.offerQuantity,
      0
    );

    await this.createAuditLogEntry(
      offerData.catalog_offer_id,
      config.userId,
      config.actionType,
      offerData.offer_status,
      "NEGOTIATING",
      {
        actionType: config.actionType,
        userType: config.userType,
        itemCount: config.itemNegotiations?.length || 0,
        hasItemChanges: itemChangesApplied.length > 0,
        currentRound: newRound,
        totalValue: totalValue,
        currency: offerData.total_offer_value_currency,
        itemChangesCount: itemChangesApplied.length,
      },
      tx as PrismaClient
    );

    // Update offer total value
    await this.dbOps.recalculateOfferValue(offerData.catalog_offer_id, tx);

    return {
      success: true,
      data: {
        catalogOfferId: offerData.public_id,
        offerStatus: "NEGOTIATING",
        currentRound: newRound,
        negotiationsCreated,
        itemChangesApplied,
        totalOfferValue: totalValue,
        totalOfferValueCurrency: offerData.total_offer_value_currency,
      },
    };
  }

  // Helper methods

  private async validateItemNegotiations(
    itemNegotiations: ItemNegotiation[],
    offerData: any,
    tx: PrismaClient
  ): Promise<{
    isValid: boolean;
    error?: { code: string; message: string; details?: any };
  }> {
    const activeItemIds = offerData.catalog_offer_items
      .filter((item: any) => item.item_status === "ACTIVE")
      .map((item: any) => item.catalog_offer_item_id);

    for (const itemNeg of itemNegotiations) {
      const itemId = await this.resolveOfferItemId(
        itemNeg.catalogOfferItemId,
        tx
      );
      if (!itemId || !activeItemIds.includes(itemId)) {
        return {
          isValid: false,
          error: {
            code: "INVALID_OFFER_ITEM",
            message: "Invalid catalog offer item ID",
            details: {
              catalogOfferItemId: itemNeg.catalogOfferItemId,
              validItemIds: activeItemIds,
            },
          },
        };
      }

      if (itemNeg.offerPricePerUnit <= 0) {
        return {
          isValid: false,
          error: {
            code: "INVALID_PRICE",
            message: "Offer price must be greater than zero",
            details: { offerPricePerUnit: itemNeg.offerPricePerUnit },
          },
        };
      }

      if (itemNeg.offerQuantity <= 0) {
        return {
          isValid: false,
          error: {
            code: "INVALID_QUANTITY",
            message: "Offer quantity must be greater than zero",
            details: { offerQuantity: itemNeg.offerQuantity },
          },
        };
      }

      const item = offerData.catalog_offer_items.find(
        (i: any) => i.catalog_offer_item_id === itemId
      );

      if (
        item?.catalog_product_variants?.available_quantity !== null &&
        itemNeg.offerQuantity > item.catalog_product_variants.available_quantity
      ) {
        return {
          isValid: false,
          error: {
            code: "INSUFFICIENT_INVENTORY",
            message: "Requested quantity exceeds available inventory",
            details: {
              requestedQuantity: itemNeg.offerQuantity,
              availableQuantity:
                item.catalog_product_variants.available_quantity,
              variantSku: item.catalog_product_variants.variant_sku,
            },
          },
        };
      }
    }

    return { isValid: true };
  }

  private async validateItemChanges(
    itemChanges: ItemChange[],
    offerData: any,
    userType: string,
    tx: PrismaClient
  ): Promise<{
    isValid: boolean;
    error?: { code: string; message: string; details?: any };
  }> {
    for (const change of itemChanges) {
      switch (change.changeType) {
        case "QUANTITY_CHANGED":
          if (!change.catalogOfferItemId || !change.newQuantity) {
            return {
              isValid: false,
              error: {
                code: "INVALID_QUANTITY_CHANGE",
                message:
                  "Quantity changes require catalogOfferItemId and newQuantity",
                details: { change },
              },
            };
          }
          break;

        case "ITEM_ADDED":
          if (
            !change.catalogProductVariantId ||
            !change.requestedQuantity ||
            !change.buyerOfferPrice
          ) {
            return {
              isValid: false,
              error: {
                code: "INVALID_ITEM_ADDITION",
                message:
                  "Item additions require catalogProductVariantId, requestedQuantity, and buyerOfferPrice",
                details: { change },
              },
            };
          }

          // Convert catalogProductVariantId from public_id to internal UUID
          const variantId = await this.resolveProductVariantId(
            change.catalogProductVariantId,
            tx
          );
          if (!variantId) {
            return {
              isValid: false,
              error: {
                code: "INVALID_VARIANT_SELECTION",
                message: "Product variant not found",
                details: {
                  catalogProductVariantId: change.catalogProductVariantId,
                },
              },
            };
          }

          const variantExists = await tx.catalog_product_variants.findFirst({
            where: {
              catalog_product_variant_id: variantId,
              catalog_products: {
                catalog_listing_id: offerData.catalog_listing_id,
              },
            },
          });
          if (!variantExists) {
            return {
              isValid: false,
              error: {
                code: "INVALID_VARIANT_SELECTION",
                message: "Product variant not found in this catalog listing",
                details: {
                  catalogProductVariantId: change.catalogProductVariantId,
                },
              },
            };
          }
          break;

        case "ITEM_REMOVED":
          if (!change.catalogOfferItemId) {
            return {
              isValid: false,
              error: {
                code: "INVALID_ITEM_REMOVAL",
                message: "Item removals require catalogOfferItemId",
                details: { change },
              },
            };
          }
          break;
      }
    }

    return { isValid: true };
  }

  private async getUserProfileData(
    userId: string,
    userType: string,
    tx: PrismaClient
  ): Promise<any> {
    if (userType === "BUYER") {
      return await tx.buyer_profiles.findFirst({
        where: { user_id: userId },
        include: { users: true },
      });
    } else {
      return await tx.seller_profiles.findFirst({
        where: { user_id: userId },
        include: { users: true },
      });
    }
  }

  private async resolveOfferItemId(
    catalogOfferItemId: string,
    tx: PrismaClient
  ): Promise<string | null> {
    // Check if it's already an internal UUID (36 characters)
    if (catalogOfferItemId.length === 36) {
      return catalogOfferItemId;
    }

    // It's a public_id, convert to internal UUID
    if (catalogOfferItemId.length === STANDARD_ID_LENGTH) {
      const item = await tx.catalog_offer_items.findUnique({
        where: { public_id: catalogOfferItemId },
        select: { catalog_offer_item_id: true },
      });
      return item?.catalog_offer_item_id || null;
    }

    return null;
  }

  private async resolveProductVariantId(
    catalogProductVariantId: string,
    tx: PrismaClient
  ): Promise<string | null> {
    // Check if it's already an internal UUID (36 characters)
    if (catalogProductVariantId.length === 36) {
      return catalogProductVariantId;
    }

    // It's a public_id, convert to internal UUID
    if (catalogProductVariantId.length === STANDARD_ID_LENGTH) {
      const variant = await tx.catalog_product_variants.findUnique({
        where: { public_id: catalogProductVariantId },
        select: { catalog_product_variant_id: true },
      });
      return variant?.catalog_product_variant_id || null;
    }

    return null;
  }

  private async applyItemChanges(
    itemChanges: ItemChange[],
    catalogOfferId: string,
    userId: string,
    negotiationRound: number,
    tx: PrismaClient
  ): Promise<
    Array<{
      changeId: string;
      changeType: string;
      catalogOfferItemId?: string;
      previousQuantity?: number;
      newQuantity?: number;
      addedInRound?: number;
      removedInRound?: number;
    }>
  > {
    const appliedChanges = [];

    for (const change of itemChanges) {
      switch (change.changeType) {
        case "QUANTITY_CHANGED":
          if (change.catalogOfferItemId && change.newQuantity) {
            const itemId = await this.resolveOfferItemId(
              change.catalogOfferItemId,
              tx
            );
            if (!itemId) continue;

            const currentItem = await tx.catalog_offer_items.findUnique({
              where: { catalog_offer_item_id: itemId },
            });

            if (currentItem) {
              const changeRecord = await tx.catalog_offer_item_changes.create({
                data: {
                  catalog_offer_id: catalogOfferId,
                  catalog_offer_item_id: itemId,
                  change_type: "QUANTITY_CHANGED",
                  changed_by_user_id: userId,
                  negotiation_round: negotiationRound,
                  previous_quantity: currentItem.requested_quantity,
                  new_quantity: change.newQuantity,
                  change_reason: change.changeReason,
                  change_summary: `Quantity changed from ${currentItem.requested_quantity} to ${change.newQuantity}`,
                  created_at: new Date(),
                },
              });

              await tx.catalog_offer_items.update({
                where: { catalog_offer_item_id: itemId },
                data: {
                  requested_quantity: change.newQuantity,
                  item_version: { increment: 1 },
                  updated_at: new Date(),
                },
              });

              appliedChanges.push({
                changeId: changeRecord.public_id,
                changeType: "QUANTITY_CHANGED",
                catalogOfferItemId: change.catalogOfferItemId, // Return the public_id
                previousQuantity: currentItem.requested_quantity || 0,
                newQuantity: change.newQuantity,
              });
            }
          }
          break;

        case "ITEM_ADDED":
          if (
            change.catalogProductVariantId &&
            change.requestedQuantity &&
            change.buyerOfferPrice
          ) {
            const variantId = await this.resolveProductVariantId(
              change.catalogProductVariantId,
              tx
            );
            if (!variantId) continue;

            const newItem = await tx.catalog_offer_items.create({
              data: {
                catalog_offer_id: catalogOfferId,
                catalog_product_variant_id: variantId,
                requested_quantity: change.requestedQuantity,
                buyer_offer_price: change.buyerOfferPrice,
                buyer_offer_price_currency: (change.buyerOfferPriceCurrency ||
                  "USD") as currency_code_type,
                negotiation_status: "BUYER_OFFERED",
                item_version: 1,
                item_status: "ACTIVE",
                added_in_round: negotiationRound,
                created_at: new Date(),
                updated_at: new Date(),
              },
            });

            const changeData: any = {
              catalog_offer_id: catalogOfferId,
              catalog_offer_item_id: newItem.catalog_offer_item_id,
              change_type: "ITEM_ADDED",
              changed_by_user_id: userId,
              negotiation_round: negotiationRound,
              new_catalog_product_variant_id: variantId,
              new_requested_quantity: change.requestedQuantity,
              new_buyer_offer_price: change.buyerOfferPrice,
              new_buyer_offer_price_currency:
                change.buyerOfferPriceCurrency || "USD",
              change_reason: change.changeReason,
              change_summary: `Added new item: ${change.requestedQuantity} units`,
              created_at: new Date(),
            };

            const changeRecord = await tx.catalog_offer_item_changes.create({
              data: changeData,
            });

            appliedChanges.push({
              changeId: changeRecord.public_id,
              changeType: "ITEM_ADDED",
              catalogOfferItemId: newItem.public_id, // Return the public_id of the new item
              addedInRound: negotiationRound,
            });
          }
          break;

        case "ITEM_REMOVED":
          if (change.catalogOfferItemId) {
            const itemId = await this.resolveOfferItemId(
              change.catalogOfferItemId,
              tx
            );
            if (!itemId) continue;

            await tx.catalog_offer_items.update({
              where: { catalog_offer_item_id: itemId },
              data: {
                item_status: "REMOVED",
                removed_in_round: negotiationRound,
                updated_at: new Date(),
              },
            });

            const changeData: any = {
              catalog_offer_id: catalogOfferId,
              catalog_offer_item_id: itemId,
              change_type: "ITEM_REMOVED",
              changed_by_user_id: userId,
              negotiation_round: negotiationRound,
              change_reason: change.changeReason,
              change_summary: "Item removed from offer",
              created_at: new Date(),
            };

            const changeRecord = await tx.catalog_offer_item_changes.create({
              data: changeData,
            });

            appliedChanges.push({
              changeId: changeRecord.public_id,
              changeType: "ITEM_REMOVED",
              catalogOfferItemId: change.catalogOfferItemId, // Return the public_id
              removedInRound: negotiationRound,
            });
          }
          break;
      }
    }

    return appliedChanges;
  }

  private async storeAlternativeSuggestions(
    catalogOfferId: string,
    alternativeSuggestion: AlternativeSuggestion,
    tx: PrismaClient
  ): Promise<void> {
    // Store the main suggestion message
    await tx.catalog_offer_alternative_suggestions.create({
      data: {
        catalog_offer_id: catalogOfferId,
        suggestion_message: alternativeSuggestion.message,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Store suggested variants if provided
    if (alternativeSuggestion.suggestedVariants) {
      for (const variant of alternativeSuggestion.suggestedVariants) {
        // Convert catalogProductVariantId from public_id to internal UUID
        const variantId = await this.resolveProductVariantId(
          variant.catalogProductVariantId,
          tx
        );
        if (!variantId) continue;

        await tx.catalog_offer_alternative_suggestions.create({
          data: {
            catalog_offer_id: catalogOfferId,
            suggested_product_variant_id: variantId,
            suggested_price: variant.suggestedPrice,
            suggested_price_currency: "USD", // Default currency
            available_quantity: variant.availableQuantity,
            product_name: variant.productName,
            suggestion_message: alternativeSuggestion.message,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });
      }
    }

    // Store minimum acceptable terms if provided
    if (alternativeSuggestion.minimumAcceptableTerms) {
      await tx.catalog_offer_minimum_terms.create({
        data: {
          catalog_offer_id: catalogOfferId,
          minimum_unit_price:
            alternativeSuggestion.minimumAcceptableTerms.minimumUnitPrice,
          minimum_total_order:
            alternativeSuggestion.minimumAcceptableTerms.minimumTotalOrder,
          minimum_quantity:
            alternativeSuggestion.minimumAcceptableTerms.minimumQuantity,
          currency_code: "USD", // Default currency
          terms_message: alternativeSuggestion.message,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
    }
  }

  private async createOrderFromAcceptedOffer(
    offerData: any,
    negotiationsCreated: any[],
    tx: PrismaClient
  ): Promise<any> {
    // This is a simplified implementation
    // In a real scenario, you would create a proper order with all necessary fields
    console.log("Creating order from accepted offer:", {
      offerId: offerData.catalog_offer_id,
      negotiations: negotiationsCreated.length,
    });

    // Return mock order data for now
    return {
      order_id: `order_${Date.now()}`,
      order_number: `ORD-${Date.now()}`,
      public_id: `ord_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  private async createAuditLogEntry(
    catalogOfferId: string,
    userId: string,
    actionType: string,
    oldStatus: string | null,
    newStatus: string | null,
    metadata: any,
    tx: PrismaClient
  ): Promise<void> {
    // Generate meaningful changes summary
    const changesSummary = {
      action: actionType,
      timestamp: new Date().toISOString(),
      statusChange:
        oldStatus !== newStatus
          ? {
              from: oldStatus,
              to: newStatus,
            }
          : null,
      // Add more context based on action type
      ...(actionType.includes("COUNTER") && {
        negotiationType: "counter_offer",
        itemsModified: metadata?.itemCount || 0,
        hasItemChanges: metadata?.hasItemChanges || false,
      }),
      ...(actionType.includes("ACCEPT") && {
        negotiationType: "acceptance",
        finalRound: metadata?.currentRound || 1,
      }),
      ...(actionType.includes("REJECT") && {
        negotiationType: "rejection",
        rejectionReason: metadata?.rejectionReason || "Not specified",
      }),
    };

    await tx.catalog_offer_audit_log.create({
      data: {
        catalog_offer_id: catalogOfferId,
        action_type: actionType,
        performed_by_user_id: userId,
        old_status: oldStatus as offer_status_type,
        new_status: newStatus as offer_status_type,
        changes_summary: changesSummary,
        metadata: metadata,
        created_at: new Date(),
      },
    });
  }
}
