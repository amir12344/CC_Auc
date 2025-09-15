import {
  catalog_listing_visibility_rules,
  catalog_offer_item_change_type,
  catalog_offer_item_status_type,
  currency_code_type,
  offer_negotiation_action_type,
  offer_negotiation_status_type,
  offer_status_type,
  Prisma,
  PrismaClient,
} from "../../../lambda-layers/core-layer/nodejs/prisma/generated/client";
import { STANDARD_ID_LENGTH } from "../../utilities/public-id-generator";
import { notificationService } from "../../utilities/UnifiedNotificationService";
import { OrdersOperations } from "../orders/OrdersOperations";
import { CatalogOfferUploadOperations } from "./CatalogOfferUploadOperations";

// Prisma validators for type safety
const catalogListingWithDetailsValidator =
  Prisma.validator<Prisma.catalog_listingsDefaultArgs>()({
    include: {
      catalog_products: {
        include: {
          catalog_product_variants: {
            where: { is_active: true },
            include: {
              catalog_product_variant_images: {
                include: { images: true },
                orderBy: { sort_order: "asc" },
                take: 1,
              },
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
              company: true,
              first_name: true,
              last_name: true,
            },
          },
        },
      },
    },
  });

const buyerProfileWithUserValidator =
  Prisma.validator<Prisma.buyer_profilesDefaultArgs>()({
    include: {
      users: {
        include: {
          user_addresses: {
            include: { addresses: true },
          },
        },
      },
    },
  });

const catalogOfferWithItemsValidator =
  Prisma.validator<Prisma.catalog_offersDefaultArgs>()({
    include: {
      catalog_offer_items: {
        where: { item_status: "ACTIVE" },
        include: {
          catalog_product_variants: {
            include: {
              catalog_products: {
                include: { brands: true },
              },
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
    },
  });

// Type definitions
type CatalogListingWithDetails = Prisma.catalog_listingsGetPayload<
  typeof catalogListingWithDetailsValidator
>;
type BuyerProfileWithUser = Prisma.buyer_profilesGetPayload<
  typeof buyerProfileWithUserValidator
>;
type CatalogOfferWithItems = Prisma.catalog_offersGetPayload<
  typeof catalogOfferWithItemsValidator
>;

// New interfaces for modify and accept
export interface CatalogOfferModification {
  action: "ADD_PRODUCT" | "UPDATE_EXISTING" | "REMOVE_PRODUCT";
  catalogProductPublicId?: string;
  catalogProductVariantPublicId?: string;
  catalogOfferItemPublicId?: string;
  quantity?: number;
  sellerPricePerUnit?: number;
  newQuantity?: number;
  newSellerPricePerUnit?: number;
  modificationReason?: string;
}

export interface ModifyAndAcceptCatalogOfferConfig {
  catalogOfferPublicId: string;
  sellerUserId: string;
  sellerMessage?: string;
  autoCreateOrder?: boolean;
  shippingAddressPublicId?: string;
  billingAddressPublicId?: string;
  orderNotes?: string;
  modifications: CatalogOfferModification[];
}

export interface ModifyAndAcceptResult {
  success: boolean;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  data?: {
    catalog_offer_modifications: Array<{
      action: string;
      catalog_offer_item: {
        catalog_offer_item_public_id: string;
        catalog_product_public_id?: string;
        catalog_product_variant_public_id?: string;
        requested_quantity: number;
        seller_offer_price: number;
        buyer_offer_price: number;
        negotiation_status: offer_negotiation_status_type;
        item_status: catalog_offer_item_status_type;
        final_agreed_price: number;
        final_agreed_quantity: number;
        agreed_at: Date;
        previous_quantity?: number;
        previous_price?: number;
      };
    }>;
    negotiations: Array<{
      negotiation_public_id: string;
      catalog_offer_item_public_id: string;
      action_type: offer_negotiation_action_type;
      offer_price_per_unit: number;
      offer_quantity: number;
      offer_status: string;
      auto_accepted: boolean;
      auto_accept_reason: string;
    }>;
    item_changes: Array<{
      change_public_id: string;
      catalog_offer_item_public_id: string;
      change_type: catalog_offer_item_change_type;
      new_catalog_product_public_id?: string;
      new_catalog_product_variant_public_id?: string;
      new_quantity?: number;
      new_buyer_price?: number;
      previous_quantity?: number;
      previous_buyer_price?: number;
      change_reason?: string;
      auto_generated: boolean;
    }>;
    order?: {
      order_public_id: string;
      order_number: string;
      seller_order_number: number;
      order_type: string;
      order_status: string;
      total_amount: number;
      total_amount_currency: string;
      shipping_cost: number;
      tax_amount: number;
      tax_amount_currency: string;
      payment_due_date: Date;
      catalog_offer_public_id: string;
      created_at: Date;
      items: Array<{
        catalog_product_public_id?: string;
        catalog_product_variant_public_id?: string;
        quantity: number;
        unit_price: number;
        total_price: number;
      }>;
    };
    summary: {
      total_modifications: number;
      products_added: number;
      items_updated: number;
      items_auto_finalized: number; // NEW: track auto-finalized items
      previous_offer_total: number;
      new_offer_total: number;
      total_savings_applied: number;
      order_auto_created: boolean;
    };
  };
}

const userWithAddressesValidator = Prisma.validator<Prisma.usersDefaultArgs>()({
  include: {
    user_addresses: {
      include: { addresses: true },
    },
  },
});

type UserWithAddresses = Prisma.usersGetPayload<
  typeof userWithAddressesValidator
>;

export interface CatalogOfferItem {
  catalogProductVariantId: string;
  requestedQuantity: number;
  buyerOfferPrice: number;
  buyerOfferPriceCurrency: currency_code_type;
}

export interface CreateCatalogOfferConfig {
  catalogListingId: string;
  buyerUserId: string;
  buyerProfileId: string;
  items: CatalogOfferItem[];
  expiresAt?: Date;
  offerMessage?: string;
}

export interface CatalogOfferValidationResult {
  isValid: boolean;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  catalogListingData?: CatalogListingWithDetails;
  buyerProfileData?: BuyerProfileWithUser;
  validatedItems?: Array<{
    catalogProductVariantId: string;
    requestedQuantity: number;
    buyerOfferPrice: number;
    buyerOfferPriceCurrency: currency_code_type;
    variant: any;
    isValidQuantity: boolean;
    isValidPrice: boolean;
  }>;
  totalOfferValue?: number;
}

export interface CatalogOfferCreationResult {
  success: boolean;
  catalogOfferId?: string; // this is public id
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  offerData?: {
    catalog_offer_id: string; // this is public id
    // catalog_listing_id: string;
    // seller_user_id: string;
    // seller_profile_id: string;
    // buyer_user_id: string;
    // buyer_profile_id: string;
    offer_status: offer_status_type;
    total_offer_value: number;
    total_offer_value_currency: currency_code_type;
    expires_at?: Date;
    created_at: Date;
    items: Array<{
      //   catalog_product_variant_id: string;
      requested_quantity: number;
      buyer_offer_price: number;
      buyer_offer_price_currency: currency_code_type;
      negotiation_status: offer_negotiation_status_type;
      item_status: catalog_offer_item_status_type;
      added_in_round: number;
    }>;
  };
}

export interface CreateCatalogOfferFromFileConfig {
  catalogListingPublicId: string;
  buyerUserId: string;
  buyerProfileId: string;
  fileBuffer: Buffer;
  fileName: string;
  expiresAt?: Date;
  offerMessage?: string;
}

export interface CatalogOfferFromFileResult {
  success: boolean;
  catalogOfferId?: string; // public_id
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  data?: {
    catalog_offer_id: string; // public_id
    offer_status: offer_status_type;
    total_offer_value: number;
    total_offer_value_currency: currency_code_type;
    expires_at?: Date;
    created_at: Date;
    file_parsing_summary: {
      total_rows_processed: number;
      valid_items_found: number;
      items_with_offers: number;
      parsing_errors: Array<{
        row: number;
        sku?: string;
        error: string;
      }>;
      validation_errors: Array<{
        code: string;
        message: string;
        details?: any;
      }>;
    };
    items: Array<{
      sku: string;
      product_title: string;
      brand_name: string;
      requested_quantity: number;
      buyer_offer_price: number;
      buyer_offer_price_currency: currency_code_type;
      negotiation_status: offer_negotiation_status_type;
      item_status: catalog_offer_item_status_type;
      added_in_round: number;
    }>;
  };
}

export class CatalogOfferOperations {
  constructor(private prisma: PrismaClient) {}

  /**
   * Main function to create a catalog offer with full validation
   */
  async createCatalogOffer(
    config: CreateCatalogOfferConfig
  ): Promise<CatalogOfferCreationResult> {
    try {
      // Start a transaction for offer creation
      return await this.prisma.$transaction(async (tx) => {
        // 1. Validate the offer
        const validation = await this.validateOfferCreation(
          config,
          tx as PrismaClient
        );
        if (!validation.isValid) {
          return {
            success: false,
            error: validation.error,
          };
        }

        // 2. Create the offer
        const result = await this.executeOfferCreation(
          config,
          validation,
          tx as PrismaClient
        );
        return result;
      });
    } catch (error) {
      console.error("Error in createCatalogOffer:", error);
      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message:
            "An internal error occurred while creating the catalog offer",
          details: {
            error: error instanceof Error ? error.message : String(error),
          },
        },
      };
    }
  }

  /**
   * Main function to modify offer and auto-accept with optional order creation
   */
  async modifyAndAcceptCatalogOffer(
    config: ModifyAndAcceptCatalogOfferConfig
  ): Promise<ModifyAndAcceptResult> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Validate the modification
        const validation = await this.validateOfferModification(
          config,
          tx as PrismaClient
        );
        if (!validation.isValid) {
          return {
            success: false,
            error: validation.error,
          };
        }

        // 2. Execute the modifications
        const result = await this.executeOfferModification(
          config,
          validation,
          tx as PrismaClient
        );
        return result;
      });
    } catch (error) {
      console.error("Error in modifyAndAcceptCatalogOffer:", error);
      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message:
            "An internal error occurred while modifying the catalog offer",
          details: {
            error: error instanceof Error ? error.message : String(error),
          },
        },
      };
    }
  }

  /**
   * Comprehensive offer validation
   */
  async validateOfferCreation(
    config: CreateCatalogOfferConfig,
    tx: PrismaClient = this.prisma
  ): Promise<CatalogOfferValidationResult> {
    // 1. Resolve catalog listing public_id to internal catalog_listing_id
    let catalogListingInternalId: string;

    // Check if the provided ID is a public_id or internal UUID
    if (config.catalogListingId.length === 14) {
      // Looks like a public_id
      const catalogListingRecord = await tx.catalog_listings.findUnique({
        where: { public_id: config.catalogListingId },
        select: { catalog_listing_id: true },
      });

      if (!catalogListingRecord) {
        return {
          isValid: false,
          error: {
            code: "CATALOG_LISTING_NOT_FOUND",
            message: "Catalog listing not found with the provided public ID",
            details: { catalog_listing_public_id: config.catalogListingId },
          },
        };
      }

      catalogListingInternalId = catalogListingRecord.catalog_listing_id;
    } else {
      // Assume it's an internal UUID
      catalogListingInternalId = config.catalogListingId;
    }

    // Parallelize catalog listing and buyer profile lookups
    const [catalogListing, buyerProfile] = await Promise.all([
      tx.catalog_listings.findUnique({
        where: { catalog_listing_id: catalogListingInternalId },
        ...catalogListingWithDetailsValidator,
      }),
      tx.buyer_profiles.findUnique({
        where: { buyer_profile_id: config.buyerProfileId },
        ...buyerProfileWithUserValidator,
      }),
    ]);

    if (!catalogListing) {
      return {
        isValid: false,
        error: {
          code: "CATALOG_LISTING_NOT_FOUND",
          message: "Catalog listing not found",
          details: { catalog_listing_id: catalogListingInternalId },
        },
      };
    }

    // 2. Check catalog listing status
    if (catalogListing.status !== "ACTIVE") {
      return {
        isValid: false,
        error: {
          code: "CATALOG_LISTING_NOT_ACTIVE",
          message: "This catalog listing is not currently active",
          details: {
            catalog_listing_status: catalogListing.status,
            catalog_listing_id: catalogListing.public_id,
          },
        },
      };
    }

    // 3. Check if buyer is the seller
    if (config.buyerUserId === catalogListing.seller_user_id) {
      return {
        isValid: false,
        error: {
          code: "SELLER_CANNOT_MAKE_OFFER",
          message: "Sellers cannot make offers on their own catalog listings",
        },
      };
    }

    // 4. Validate buyer profile
    if (!buyerProfile || buyerProfile.user_id !== config.buyerUserId) {
      return {
        isValid: false,
        error: {
          code: "INVALID_BUYER_PROFILE",
          message: "Invalid buyer profile or profile does not belong to user",
          details: {
            buyer_profile_id: config.buyerProfileId,
            buyer_user_id: config.buyerUserId,
          },
        },
      };
    }

    if (buyerProfile.verification_status !== "VERIFIED") {
      return {
        isValid: false,
        error: {
          code: "BUYER_NOT_VERIFIED",
          message:
            "Account verification required to make offers on catalog listings",
          details: {
            verification_status: buyerProfile.verification_status,
          },
        },
      };
    }

    // 5. Validate items
    if (!config.items || config.items.length === 0) {
      return {
        isValid: false,
        error: {
          code: "NO_ITEMS_PROVIDED",
          message: "At least one item must be included in the offer",
        },
      };
    }

    // 6. Check for duplicate items
    const variantIds = config.items.map((item) => item.catalogProductVariantId);
    const uniqueVariantIds = new Set(variantIds);
    if (variantIds.length !== uniqueVariantIds.size) {
      return {
        isValid: false,
        error: {
          code: "DUPLICATE_ITEMS",
          message:
            "Cannot include the same product variant multiple times in an offer",
        },
      };
    }

    // 7. Validate each item
    const validatedItems = [];
    let totalOfferValue = 0;
    const validationErrors = [];

    for (const item of config.items) {
      const validation = await this.validateOfferItem(item, catalogListing, tx);
      if (!validation.isValid) {
        validationErrors.push({
          catalog_product_variant_id: item.catalogProductVariantId,
          error: validation.error,
        });
      } else {
        validatedItems.push(validation.validatedItem!);
        totalOfferValue += item.requestedQuantity * item.buyerOfferPrice;
      }
    }

    if (validationErrors.length > 0) {
      return {
        isValid: false,
        error: {
          code: "ITEM_VALIDATION_ERRORS",
          message: "One or more items in the offer are invalid",
          details: {
            validation_errors: validationErrors,
          },
        },
      };
    }

    // 8. Check minimum order value if specified
    if (
      catalogListing.minimum_order_value &&
      totalOfferValue < Number(catalogListing.minimum_order_value)
    ) {
      return {
        isValid: false,
        error: {
          code: "BELOW_MINIMUM_ORDER_VALUE",
          message: `Total offer value must be at least ${Number(
            catalogListing.minimum_order_value
          ).toFixed(2)}`,
          details: {
            minimum_order_value: Number(catalogListing.minimum_order_value),
            minimum_order_value_currency:
              catalogListing.minimum_order_value_currency,
            current_offer_value: totalOfferValue,
            currency: config.items[0]?.buyerOfferPriceCurrency || "USD",
          },
        },
      };
    }

    // 9. Check visibility rules (if catalog listing is private)
    if (catalogListing.is_private) {
      const hasVisibilityAccess = await this.checkCatalogVisibility(
        catalogListingInternalId,
        config.buyerUserId,
        tx
      );
      if (!hasVisibilityAccess) {
        return {
          isValid: false,
          error: {
            code: "ACCESS_DENIED",
            message:
              "You do not have access to make offers on this private catalog listing",
          },
        };
      }
    }

    // 10. Check for existing active offers from this buyer
    const existingOffer = await tx.catalog_offers.findFirst({
      where: {
        catalog_listing_id: catalogListingInternalId,
        buyer_user_id: config.buyerUserId,
        offer_status: {
          in: ["ACTIVE", "NEGOTIATING"],
        },
      },
    });

    if (existingOffer) {
      return {
        isValid: false,
        error: {
          code: "EXISTING_ACTIVE_OFFER",
          message: "You already have an active offer on this catalog listing",
          details: {
            existing_offer_id: existingOffer.public_id,
            existing_offer_status: existingOffer.offer_status,
            created_at: existingOffer.created_at,
            suggested_actions: [
              "Cancel or withdraw your existing offer first",
              "Wait for seller response to your current offer",
              "Modify your existing offer instead of creating a new one",
            ],
          },
        },
      };
    }

    // 11. Check currency consistency across all items
    const currencies = new Set(
      config.items.map((item) => item.buyerOfferPriceCurrency)
    );
    if (currencies.size > 1) {
      return {
        isValid: false,
        error: {
          code: "MIXED_CURRENCIES",
          message: "All items in an offer must use the same currency",
          details: {
            currencies_found: Array.from(currencies),
            suggested_actions: [
              "Convert all prices to a single currency",
              "Create separate offers for different currencies",
            ],
          },
        },
      };
    }

    // 12. Check if catalog listing has minimum order requirements
    const totalQuantity = config.items.reduce(
      (sum, item) => sum + item.requestedQuantity,
      0
    );

    // Business rule: Check if there's a reasonable maximum items per offer (prevent abuse)
    if (config.items.length > 50) {
      return {
        isValid: false,
        error: {
          code: "TOO_MANY_ITEMS",
          message:
            "An offer cannot contain more than 50 different product variants",
          details: {
            item_count: config.items.length,
            maximum_allowed: 50,
            suggested_actions: [
              "Split large orders into multiple offers",
              "Focus on core products for this offer",
              "Contact seller directly for bulk orders",
            ],
          },
        },
      };
    }

    // 13. Check if total quantity is reasonable (prevent abuse)
    // if (totalQuantity > 10000) {
    //   return {
    //     isValid: false,
    //     error: {
    //       code: "EXCESSIVE_QUANTITY",
    //       message: "Total quantity across all items cannot exceed 10,000 units",
    //       details: {
    //         total_quantity: totalQuantity,
    //         maximum_allowed: 10000,
    //         suggested_actions: [
    //           "Reduce quantities to reasonable levels",
    //           "Contact seller directly for large volume orders",
    //           "Split into multiple smaller offers",
    //         ],
    //       },
    //     },
    //   };
    // }

    // 14. Check expires_at date if provided
    if (config.expiresAt) {
      const now = new Date();
      const maxExpiration = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days from now

      if (config.expiresAt <= now) {
        return {
          isValid: false,
          error: {
            code: "EXPIRES_AT_IN_PAST",
            message: "Expiration date must be in the future",
            details: {
              provided_date: config.expiresAt,
              current_time: now,
            },
          },
        };
      }

      if (config.expiresAt > maxExpiration) {
        return {
          isValid: false,
          error: {
            code: "EXPIRES_AT_TOO_FAR",
            message:
              "Expiration date cannot be more than 90 days in the future",
            details: {
              provided_date: config.expiresAt,
              maximum_allowed_date: maxExpiration,
              suggested_actions: [
                "Set expiration within 90 days",
                "Create offer without expiration for longer terms",
                "Contact seller to discuss extended terms",
              ],
            },
          },
        };
      }
    }

    // 15. Check if user account is locked or has risk issues
    const user = await tx.users.findUnique({
      where: { user_id: config.buyerUserId },
      select: {
        account_locked: true,
        risk_score: true,
      },
    });

    if (user?.account_locked) {
      return {
        isValid: false,
        error: {
          code: "ACCOUNT_LOCKED",
          message: "Your account is locked and cannot create offers",
          details: {
            suggested_actions: [
              "Contact customer support to unlock your account",
              "Review account status and compliance requirements",
            ],
          },
        },
      };
    }

    if (user?.risk_score && Number(user.risk_score) > 80) {
      return {
        isValid: false,
        error: {
          code: "HIGH_RISK_ACCOUNT",
          message:
            "Account has high risk score and cannot create offers at this time",
          details: {
            risk_score: Number(user.risk_score),
            suggested_actions: [
              "Complete additional verification steps",
              "Contact customer support for account review",
            ],
          },
        },
      };
    }

    return {
      isValid: true,
      catalogListingData: catalogListing,
      buyerProfileData: buyerProfile,
      validatedItems,
      totalOfferValue,
    };
  }

  /**
   * Validate individual offer item
   */
  private async validateOfferItem(
    item: CatalogOfferItem,
    catalogListing: CatalogListingWithDetails,
    tx: PrismaClient
  ): Promise<{
    isValid: boolean;
    error?: { code: string; message: string; details?: any };
    validatedItem?: any;
  }> {
    // Find the variant in the catalog listing
    let variantFound = false;
    let variant: any = null;

    for (const product of catalogListing.catalog_products) {
      for (const productVariant of product.catalog_product_variants) {
        if (
          productVariant.catalog_product_variant_id ===
          item.catalogProductVariantId
        ) {
          variant = productVariant;
          variantFound = true;
          break;
        }
      }
      if (variantFound) break;
    }

    if (!variantFound || !variant) {
      return {
        isValid: false,
        error: {
          code: "INVALID_VARIANT_SELECTION",
          message:
            "The selected product variant is not available in this catalog listing",
          details: {
            catalog_product_variant_id: item.catalogProductVariantId,
            catalog_listing_id: catalogListing.public_id,
            variant_status: "NOT_IN_LISTING",
          },
        },
      };
    }

    // Check if variant is active
    if (!variant.is_active) {
      return {
        isValid: false,
        error: {
          code: "VARIANT_NOT_ACTIVE",
          message: "The selected product variant is not currently active",
          details: {
            catalog_product_variant_id: item.catalogProductVariantId,
            variant_sku: variant.variant_sku,
          },
        },
      };
    }

    // Check quantity validation
    if (item.requestedQuantity <= 0) {
      return {
        isValid: false,
        error: {
          code: "INVALID_QUANTITY",
          message: "Requested quantity must be greater than zero",
          details: {
            requested_quantity: item.requestedQuantity,
          },
        },
      };
    }

    // Check available quantity
    if (
      variant.available_quantity !== null &&
      item.requestedQuantity > variant.available_quantity
    ) {
      return {
        isValid: false,
        error: {
          code: "INSUFFICIENT_INVENTORY",
          message:
            "Requested quantity exceeds available inventory for this product variant",
          details: {
            catalog_product_variant_id: item.catalogProductVariantId,
            variant_sku: variant.variant_sku,
            requested_quantity: item.requestedQuantity,
            available_quantity: variant.available_quantity,
            shortage: item.requestedQuantity - variant.available_quantity,
            product_title: variant.catalog_products.title,
            last_updated: variant.updated_at,
          },
        },
      };
    }

    // Check minimum order quantity
    if (
      variant.min_order_quantity &&
      item.requestedQuantity < variant.min_order_quantity
    ) {
      return {
        isValid: false,
        error: {
          code: "BELOW_MINIMUM_QUANTITY",
          message: `Minimum order quantity for this variant is ${variant.min_order_quantity}`,
          details: {
            catalog_product_variant_id: item.catalogProductVariantId,
            variant_sku: variant.variant_sku,
            requested_quantity: item.requestedQuantity,
            minimum_order_quantity: variant.min_order_quantity,
          },
        },
      };
    }

    // Check maximum order quantity
    if (
      variant.max_order_quantity &&
      item.requestedQuantity > variant.max_order_quantity
    ) {
      return {
        isValid: false,
        error: {
          code: "ABOVE_MAXIMUM_QUANTITY",
          message: `Maximum order quantity for this variant is ${variant.max_order_quantity}`,
          details: {
            catalog_product_variant_id: item.catalogProductVariantId,
            variant_sku: variant.variant_sku,
            requested_quantity: item.requestedQuantity,
            maximum_order_quantity: variant.max_order_quantity,
          },
        },
      };
    }

    // Check price validation
    if (item.buyerOfferPrice <= 0) {
      return {
        isValid: false,
        error: {
          code: "INVALID_PRICE",
          message: "Offer price must be greater than zero",
          details: {
            offered_price: item.buyerOfferPrice,
          },
        },
      };
    }

    // Check if price is unreasonably high (prevent abuse/typos)
    if (item.buyerOfferPrice > 999999.99) {
      return {
        isValid: false,
        error: {
          code: "PRICE_TOO_HIGH",
          message: "Offer price cannot exceed $999,999.99 per unit",
          details: {
            offered_price: item.buyerOfferPrice,
            maximum_allowed: 999999.99,
            suggested_actions: [
              "Check for decimal point errors",
              "Contact seller directly for high-value items",
              "Consider breaking into smaller quantities",
            ],
          },
        },
      };
    }

    // Check if price is suspiciously low (potential error)
    if (
      variant.retail_price &&
      item.buyerOfferPrice < Number(variant.retail_price) * 0.01
    ) {
      return {
        isValid: false,
        error: {
          code: "PRICE_SUSPICIOUSLY_LOW",
          message: "Offer price seems unusually low compared to retail price",
          details: {
            offered_price: item.buyerOfferPrice,
            retail_price: Number(variant.retail_price),
            suggested_minimum: Number(variant.retail_price) * 0.05, // 5% of retail
            suggested_actions: [
              "Check for decimal point errors",
              "Verify the intended offer amount",
              "Consider market value for this product",
            ],
          },
        },
      };
    }

    // Check currency consistency (all items should have the same currency)
    // This is a business rule that might be enforced

    return {
      isValid: true,
      validatedItem: {
        catalogProductVariantId: item.catalogProductVariantId,
        requestedQuantity: item.requestedQuantity,
        buyerOfferPrice: item.buyerOfferPrice,
        buyerOfferPriceCurrency: item.buyerOfferPriceCurrency,
        variant,
        isValidQuantity: true,
        isValidPrice: true,
      },
    };
  }

  /**
   * Execute the actual offer creation
   */
  private async executeOfferCreation(
    config: CreateCatalogOfferConfig,
    validation: CatalogOfferValidationResult,
    tx: PrismaClient
  ): Promise<CatalogOfferCreationResult> {
    const catalogListing = validation.catalogListingData!;
    const totalOfferValue = validation.totalOfferValue!;
    const primaryCurrency = config.items[0].buyerOfferPriceCurrency;

    try {
      // Resolve catalog listing public_id to internal catalog_listing_id
      let catalogListingInternalId: string;

      // public_id is currently 14 character length long
      if (config.catalogListingId.length === STANDARD_ID_LENGTH) {
        const catalogListingRecord = await tx.catalog_listings.findUnique({
          where: { public_id: config.catalogListingId },
          select: { catalog_listing_id: true },
        });
        catalogListingInternalId = catalogListingRecord!.catalog_listing_id;
      } else {
        catalogListingInternalId = config.catalogListingId;
      }

      // 1. Create the catalog offer
      const catalogOffer = await tx.catalog_offers.create({
        data: {
          catalog_listings: {
            connect: { catalog_listing_id: catalogListingInternalId },
          },
          users_catalog_offers_seller_user_idTousers: {
            connect: { user_id: catalogListing.seller_user_id },
          },
          seller_profiles: {
            connect: { seller_profile_id: catalogListing.seller_profile_id },
          },
          users_catalog_offers_buyer_user_idTousers: {
            connect: { user_id: config.buyerUserId },
          },
          buyer_profiles: {
            connect: { buyer_profile_id: config.buyerProfileId },
          },
          offer_status: "ACTIVE",
          total_offer_value: totalOfferValue,
          total_offer_value_currency: primaryCurrency,
          expires_at: config.expiresAt,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      // 2. Create offer items and initial negotiations in parallel
      const itemCreationPromises = config.items.map(async (item) => {
        // First, get the catalog product ID from the variant
        const variant = await tx.catalog_product_variants.findUnique({
          where: { catalog_product_variant_id: item.catalogProductVariantId },
          select: {
            catalog_products: {
              select: { catalog_product_id: true },
            },
          },
        });

        if (!variant || !variant.catalog_products) {
          throw new Error(
            `Product variant not found: ${item.catalogProductVariantId}`
          );
        }

        // Create offer item
        const offerItem = await tx.catalog_offer_items.create({
          data: {
            catalog_offers: {
              connect: { catalog_offer_id: catalogOffer.catalog_offer_id },
            },
            catalog_products: {
              connect: {
                catalog_product_id: variant.catalog_products.catalog_product_id,
              },
            },
            catalog_product_variants: {
              connect: {
                catalog_product_variant_id: item.catalogProductVariantId,
              },
            },
            requested_quantity: item.requestedQuantity,
            buyer_offer_price: item.buyerOfferPrice,
            buyer_offer_price_currency: item.buyerOfferPriceCurrency,
            negotiation_status: "BUYER_OFFERED",
            item_version: 1,
            item_status: "ACTIVE",
            added_in_round: 1,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });

        // Create initial negotiation
        const negotiation = await tx.catalog_offer_negotiations.create({
          data: {
            catalog_offers: {
              connect: { catalog_offer_id: catalogOffer.catalog_offer_id },
            },
            catalog_offer_item: {
              connect: {
                catalog_offer_item_id: offerItem.catalog_offer_item_id,
              },
            },
            negotiation_round: 1,
            is_current_offer: true,
            action_type: "BUYER_OFFER",
            users: {
              connect: { user_id: config.buyerUserId },
            },
            offer_price_per_unit: item.buyerOfferPrice,
            offer_price_currency: item.buyerOfferPriceCurrency,
            offer_quantity: item.requestedQuantity,
            offer_status: "PENDING",
            offer_message: config.offerMessage,
            valid_until: config.expiresAt,
            includes_item_changes: false,
            created_at: new Date(),
            updated_at: new Date(),
          },
        });

        // Update offer item with current negotiation reference
        await tx.catalog_offer_items.update({
          where: { catalog_offer_item_id: offerItem.catalog_offer_item_id },
          data: {
            current_buyer_negotiation: {
              connect: {
                catalog_offer_negotiation_id:
                  negotiation.catalog_offer_negotiation_id,
              },
            },
          },
        });

        return {
          offerItem,
          negotiation,
        };
      });

      const itemCreationResults = await Promise.all(itemCreationPromises);

      // 3. Build response data
      const offerData: CatalogOfferCreationResult["offerData"] = {
        catalog_offer_id: catalogOffer.public_id,
        offer_status: catalogOffer.offer_status as offer_status_type, // Type assertion since we know it's not null
        total_offer_value: Number(catalogOffer.total_offer_value),
        total_offer_value_currency: catalogOffer.total_offer_value_currency!,
        expires_at: catalogOffer.expires_at || undefined,
        created_at: catalogOffer.created_at as Date, // Type assertion since we know it's not null
        items: itemCreationResults.map((result, index) => ({
          catalog_offer_item_public_id: result.offerItem.public_id,
          requested_quantity: config.items[index].requestedQuantity,
          buyer_offer_price: config.items[index].buyerOfferPrice,
          buyer_offer_price_currency:
            config.items[index].buyerOfferPriceCurrency,
          negotiation_status: result.offerItem.negotiation_status!,
          item_status: result.offerItem.item_status!,
          added_in_round: result.offerItem.added_in_round || 1, // Provide default value if null
        })),
      };

      return {
        success: true,
        catalogOfferId: catalogOffer.public_id,
        offerData,
      };
    } catch (error) {
      console.error("Error executing offer creation:", error);
      throw error;
    }
  }

  /**
   * Check if user has access to private catalog listing
   */
  private async checkCatalogVisibility(
    catalogListingId: string,
    userId: string,
    tx: PrismaClient
  ): Promise<boolean> {
    // Parallelize user details and visibility rules lookup
    const [user, visibilityRules] = await Promise.all([
      tx.users.findUnique({
        where: { user_id: userId },
        include: {
          user_addresses: {
            include: { addresses: true },
          },
        },
      }),
      tx.catalog_listing_visibility_rules.findMany({
        where: { catalog_listing_id: catalogListingId },
      }),
    ]);

    if (!user) return false;

    // If no rules, assume public access
    if (visibilityRules.length === 0) return true;

    // Check each rule
    for (const rule of visibilityRules) {
      const hasAccess = await this.checkVisibilityRule(rule, user, tx);
      if (rule.is_inclusion && hasAccess) {
        return true; // Inclusion rule matched
      }
      if (!rule.is_inclusion && hasAccess) {
        return false; // Exclusion rule matched
      }
    }

    // If only exclusion rules and none matched, allow access
    const hasInclusionRules = visibilityRules.some(
      (rule: catalog_listing_visibility_rules) => rule.is_inclusion
    );
    return !hasInclusionRules;
  }

  /**
   * Check individual visibility rule
   */
  private async checkVisibilityRule(
    rule: catalog_listing_visibility_rules,
    user: UserWithAddresses,
    tx: PrismaClient
  ): Promise<boolean> {
    // TODO: Implement actual rule checks
    // Placeholder for actual rule logic
    return true;

    // switch (rule.rule_type) {
    //   case "BUYER_SEGMENT":
    //     // TODO: Compare with buyer preferences
    //     // Implementation depends on how buyer segments are stored
    //     // For now, return false as this needs business logic
    //     return false;

    //   case "LOCATION_COUNTRY":
    //     return (
    //       user.user_addresses?.some(
    //         (ua: UserWithAddresses["user_addresses"][0]) =>
    //           ua.addresses.country_code === rule.rule_value
    //       ) || false
    //     );

    //   case "LOCATION_STATE":
    //     return (
    //       user.user_addresses?.some(
    //         (ua: UserWithAddresses["user_addresses"][0]) =>
    //           ua.addresses.province_code === rule.rule_value
    //       ) || false
    //     );

    //   case "LOCATION_ZIP":
    //     return (
    //       user.user_addresses?.some(
    //         (ua: UserWithAddresses["user_addresses"][0]) =>
    //           ua.addresses.zip === rule.rule_value
    //       ) || false
    //     );

    //   case "LOCATION_CITY":
    //     return (
    //       user.user_addresses?.some(
    //         (ua: UserWithAddresses["user_addresses"][0]) =>
    //           ua.addresses.city.toLowerCase() === rule.rule_value.toLowerCase()
    //       ) || false
    //     );

    //   default:
    //     return false;
    // }
  }

  /**
   * Validate offer modification
   */
  async validateOfferModification(
    config: ModifyAndAcceptCatalogOfferConfig,
    tx: PrismaClient = this.prisma
  ): Promise<{
    isValid: boolean;
    error?: { code: string; message: string; details?: any };
    catalogOfferData?: any;
    catalogListingData?: any;
    validationResults?: any[];
  }> {
    // Get catalog offer
    const catalogOffer = await tx.catalog_offers.findUnique({
      where: { public_id: config.catalogOfferPublicId },
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
                catalog_products: true,
              },
            },
            catalog_products: true,
          },
        },
      },
    });

    if (!catalogOffer) {
      return {
        isValid: false,
        error: {
          code: "CATALOG_OFFER_NOT_FOUND",
          message: "Catalog offer not found",
          details: { catalog_offer_public_id: config.catalogOfferPublicId },
        },
      };
    }

    // Check if user is the seller
    if (config.sellerUserId !== catalogOffer.seller_user_id) {
      return {
        isValid: false,
        error: {
          code: "UNAUTHORIZED_SELLER",
          message: "Only the listing seller can modify offers with auto-accept",
          details: {
            requesting_user_id: config.sellerUserId,
            listing_seller_id: catalogOffer.seller_user_id,
          },
        },
      };
    }

    // Check offer status
    if (!["ACTIVE", "NEGOTIATING"].includes(catalogOffer.offer_status || "")) {
      return {
        isValid: false,
        error: {
          code: "INVALID_OFFER_STATUS",
          message:
            "Offer must be in ACTIVE or NEGOTIATING status for modifications",
          details: {
            current_status: catalogOffer.offer_status,
            catalog_offer_public_id: config.catalogOfferPublicId,
          },
        },
      };
    }

    // Validate modifications (simplified validation - add more as needed)
    if (!config.modifications || config.modifications.length === 0) {
      return {
        isValid: false,
        error: {
          code: "NO_MODIFICATIONS_PROVIDED",
          message: "At least one modification must be provided",
        },
      };
    }

    return {
      isValid: true,
      catalogOfferData: catalogOffer,
      catalogListingData: catalogOffer.catalog_listings,
      validationResults: config.modifications, // Simplified for now
    };
  }

  /**
   * Execute the offer modifications with auto-finalization of unchanged items
   */
  private async executeOfferModification(
    config: ModifyAndAcceptCatalogOfferConfig,
    validation: any,
    tx: PrismaClient
  ): Promise<ModifyAndAcceptResult> {
    const catalogOffer = validation.catalogOfferData;
    const currentRound = await this.getCurrentNegotiationRound(
      catalogOffer.catalog_offer_id,
      tx
    );
    const newRound = currentRound + 1;

    const modificationResults = [];
    const negotiationResults = [];
    const itemChangeResults = [];
    let totalModifications = 0;
    let productsAdded = 0;
    let itemsUpdated = 0;
    let itemsRemoved = 0;
    let previousOfferTotal = Number(catalogOffer.total_offer_value || 0);
    let newOfferTotal = 0; // Will be calculated from scratch

    // Track which items were explicitly modified
    const modifiedItemIds = new Set(
      config.modifications
        .filter((mod) => mod.catalogOfferItemPublicId)
        .map((mod) => mod.catalogOfferItemPublicId!)
    );

    // Process each explicit modification
    for (const modification of config.modifications) {
      totalModifications++;

      if (modification.action === "ADD_PRODUCT") {
        const result = await this.processAddProduct(
          modification,
          catalogOffer,
          newRound,
          config.sellerUserId,
          tx
        );

        if (result.success) {
          modificationResults.push(result.data!);
          negotiationResults.push(result.negotiation!);
          itemChangeResults.push(result.itemChange!);
          productsAdded++;

          const itemTotal =
            result.data!.catalog_offer_item.final_agreed_price *
            result.data!.catalog_offer_item.final_agreed_quantity;
          if (isNaN(itemTotal) || itemTotal < 0) {
            throw new Error(
              `Invalid item total calculated for ADD_PRODUCT: ${itemTotal}. Price: ${result.data!.catalog_offer_item.final_agreed_price}, Quantity: ${result.data!.catalog_offer_item.final_agreed_quantity}`
            );
          }
          newOfferTotal += itemTotal;
        } else {
          throw new Error(`Failed to add product: ${result.error}`);
        }
      } else if (modification.action === "UPDATE_EXISTING") {
        const result = await this.processUpdateExisting(
          modification,
          catalogOffer,
          newRound,
          config.sellerUserId,
          tx
        );

        if (result.success) {
          modificationResults.push(result.data!);
          negotiationResults.push(result.negotiation!);
          itemChangeResults.push(result.itemChange!);
          itemsUpdated++;

          const itemTotal =
            result.data!.catalog_offer_item.final_agreed_price *
            result.data!.catalog_offer_item.final_agreed_quantity;
          if (isNaN(itemTotal) || itemTotal < 0) {
            throw new Error(
              `Invalid item total calculated for UPDATE_EXISTING: ${itemTotal}. Price: ${result.data!.catalog_offer_item.final_agreed_price}, Quantity: ${result.data!.catalog_offer_item.final_agreed_quantity}`
            );
          }
          newOfferTotal += itemTotal;
        } else {
          throw new Error(`Failed to update existing item: ${result.error}`);
        }
      } else if (modification.action === "REMOVE_PRODUCT") {
        const result = await this.processRemoveProduct(
          modification,
          catalogOffer,
          newRound,
          config.sellerUserId,
          tx
        );

        if (result.success) {
          modificationResults.push(result.data!);
          negotiationResults.push(result.negotiation!);
          itemChangeResults.push(result.itemChange!);
          itemsRemoved++;
          // Removed items don't contribute to total
        } else {
          throw new Error(`Failed to remove product: ${result.error}`);
        }
      }
    }

    // **NEW: Handle unchanged items - auto-finalize them**
    const unchangedItems = await tx.catalog_offer_items.findMany({
      where: {
        catalog_offer_id: catalogOffer.catalog_offer_id,
        item_status: "ACTIVE",
        public_id:
          modifiedItemIds.size > 0
            ? {
                notIn: Array.from(modifiedItemIds),
              }
            : undefined,
      },
      include: {
        current_buyer_negotiation: true,
        current_seller_negotiation: true,
      },
    });

    // Auto-finalize unchanged items
    for (const item of unchangedItems) {
      const currentNegotiation =
        item.current_seller_negotiation || item.current_buyer_negotiation;

      // Determine final price priority: current negotiation > buyer offer price
      const finalPrice = currentNegotiation?.offer_price_per_unit
        ? Number(currentNegotiation.offer_price_per_unit)
        : Number(item.buyer_offer_price || 0);

      // Determine final quantity priority: current negotiation > requested quantity
      const finalQuantity =
        currentNegotiation?.offer_quantity || item.requested_quantity;

      const finalCurrency =
        currentNegotiation?.offer_price_currency ||
        item.buyer_offer_price_currency ||
        "USD";

      // Validate price and quantity values
      if (isNaN(finalPrice) || finalPrice < 0) {
        throw new Error(
          `Invalid price calculated for item ${item.public_id}: ${finalPrice}. Original buyer_offer_price: ${item.buyer_offer_price}, negotiation price: ${currentNegotiation?.offer_price_per_unit}`
        );
      }

      if (!finalQuantity || finalQuantity <= 0) {
        throw new Error(
          `Invalid quantity calculated for item ${item.public_id}: ${finalQuantity}. Original requested_quantity: ${item.requested_quantity}, negotiation quantity: ${currentNegotiation?.offer_quantity}`
        );
      }

      // Update the unchanged item with final agreed values
      await tx.catalog_offer_items.update({
        where: { catalog_offer_item_id: item.catalog_offer_item_id },
        data: {
          final_agreed_price: finalPrice,
          final_agreed_quantity: finalQuantity,
          final_agreed_price_currency: finalCurrency,
          negotiation_status: "AGREED",
          agreed_at: new Date(),
          updated_at: new Date(),
        },
      });

      // Add to new total
      const autoFinalizedItemTotal = finalPrice * finalQuantity;
      if (isNaN(autoFinalizedItemTotal) || autoFinalizedItemTotal < 0) {
        throw new Error(
          `Invalid auto-finalized item total calculated: ${autoFinalizedItemTotal}. Price: ${finalPrice}, Quantity: ${finalQuantity}, Item: ${item.public_id}`
        );
      }
      newOfferTotal += autoFinalizedItemTotal;

      // Create a modification result for tracking (optional)
      modificationResults.push({
        action: "AUTO_FINALIZED",
        catalog_offer_item: {
          catalog_offer_item_public_id: item.public_id,
          requested_quantity: finalQuantity,
          seller_offer_price: finalPrice,
          buyer_offer_price: finalPrice,
          negotiation_status: "AGREED",
          item_status: "ACTIVE",
          final_agreed_price: finalPrice,
          final_agreed_quantity: finalQuantity,
          agreed_at: new Date(),
        },
      });
    }

    // Mark all previous negotiations as superseded
    await tx.catalog_offer_negotiations.updateMany({
      where: {
        catalog_offer_id: catalogOffer.catalog_offer_id,
        is_current_offer: true,
        offer_status: { not: "ACCEPTED" },
      },
      data: {
        is_current_offer: false,
        offer_status: "SUPERSEDED",
        responded_at: new Date(),
      },
    });

    // Mark new negotiations as accepted
    for (const negotiation of negotiationResults) {
      await tx.catalog_offer_negotiations.update({
        where: { public_id: negotiation.negotiation_public_id },
        data: {
          offer_status: "ACCEPTED",
          responded_at: new Date(),
        },
      });
    }

    // Validate final total before database update
    if (isNaN(newOfferTotal) || newOfferTotal < 0) {
      throw new Error(
        `Invalid total calculated: ${newOfferTotal}. Previous total: ${previousOfferTotal}, Modifications: ${totalModifications}, Items added: ${productsAdded}, Items updated: ${itemsUpdated}, Items removed: ${itemsRemoved}`
      );
    }

    // Update offer status to ACCEPTED and set new totals
    await tx.catalog_offers.update({
      where: { catalog_offer_id: catalogOffer.catalog_offer_id },
      data: {
        offer_status: "ACCEPTED",
        current_round: newRound,
        last_action_by_user_id: config.sellerUserId,
        last_action_at: new Date(),
        updated_at: new Date(),
        total_offer_value: newOfferTotal,
      },
    });

    // Create audit log entry
    await tx.catalog_offer_audit_log.create({
      data: {
        catalog_offers: {
          connect: { catalog_offer_id: catalogOffer.catalog_offer_id },
        },
        action_type: "SELLER_MODIFY_AUTO_ACCEPT",
        users: {
          connect: { user_id: config.sellerUserId },
        },
        old_status: catalogOffer.offer_status,
        new_status: "ACCEPTED",
        changes_summary: {
          explicit_modifications: totalModifications,
          products_added: productsAdded,
          items_updated: itemsUpdated,
          items_removed: itemsRemoved,
          items_auto_finalized: unchangedItems.length,
          previous_total: previousOfferTotal,
          new_total: newOfferTotal,
          total_change: newOfferTotal - previousOfferTotal,
        },
        metadata: {
          seller_message: config.sellerMessage ?? null,
          auto_create_order: config.autoCreateOrder ?? false,
          explicit_modifications: config.modifications.map((mod) => ({
            action: mod.action,
            catalogProductPublicId: mod.catalogProductPublicId ?? null,
            catalogProductVariantPublicId:
              mod.catalogProductVariantPublicId ?? null,
            catalogOfferItemPublicId: mod.catalogOfferItemPublicId ?? null,
            quantity: mod.quantity ?? null,
            sellerPricePerUnit: mod.sellerPricePerUnit ?? null,
            newQuantity: mod.newQuantity ?? null,
            newSellerPricePerUnit: mod.newSellerPricePerUnit ?? null,
            modificationReason: mod.modificationReason ?? null,
          })),
          auto_finalized_items: unchangedItems.map((item) => {
            const itemCurrentNegotiation =
              item.current_seller_negotiation || item.current_buyer_negotiation;
            return {
              catalog_offer_item_public_id: item.public_id,
              final_price:
                itemCurrentNegotiation?.offer_price_per_unit ||
                item.buyer_offer_price,
              final_quantity:
                itemCurrentNegotiation?.offer_quantity ||
                item.requested_quantity,
            };
          }),
          negotiation_round: newRound,
        },
        system_generated: false,
        auto_action_type: "SELLER_BULK_MODIFY_AUTO_ACCEPT",
        created_at: new Date(),
      },
    });

    // Create order if requested
    let orderData = undefined;
    if (config.autoCreateOrder) {
      const ordersOps = new OrdersOperations(this.prisma);

      const orderValidation = await ordersOps.validateOrderCreation(
        {
          catalogOfferId: catalogOffer.public_id,
          buyerUserId: catalogOffer.buyer_user_id,
          buyerProfileId: catalogOffer.buyer_profile_id,
          sellerUserId: catalogOffer.seller_user_id,
          sellerProfileId: catalogOffer.seller_profile_id,
          shippingAddressPublicId: config.shippingAddressPublicId,
          billingAddressPublicId: config.billingAddressPublicId,
          orderNotes: config.orderNotes,
          autoCreateOrder: true,
        },
        tx
      );

      if (!orderValidation.isValid) {
        throw new Error(
          `Order validation failed: ${orderValidation.error?.message}`
        );
      }

      const orderResult = await this.executeOrderCreationInTransaction(
        {
          catalogOfferId: catalogOffer.public_id,
          buyerUserId: catalogOffer.buyer_user_id,
          buyerProfileId: catalogOffer.buyer_profile_id,
          sellerUserId: catalogOffer.seller_user_id,
          sellerProfileId: catalogOffer.seller_profile_id,
          shippingAddressPublicId: config.shippingAddressPublicId,
          billingAddressPublicId: config.billingAddressPublicId,
          orderNotes: config.orderNotes,
          autoCreateOrder: true,
        },
        orderValidation,
        tx
      );

      if (orderResult.success) {
        orderData = orderResult.orderData;

        // Create final acceptance negotiation when order is created
        const firstActiveItem = await tx.catalog_offer_items.findFirst({
          where: {
            catalog_offer_id: catalogOffer.catalog_offer_id,
            item_status: "ACTIVE",
          },
        });

        if (firstActiveItem) {
          // Use the item's final agreed values to satisfy the constraint
          const finalPrice = firstActiveItem.final_agreed_price
            ? Number(firstActiveItem.final_agreed_price)
            : Number(firstActiveItem.buyer_offer_price!); // Let it fail if null

          const finalQuantity =
            firstActiveItem.final_agreed_quantity ||
            firstActiveItem.requested_quantity!; // Let it fail if null

          const finalCurrency =
            firstActiveItem.final_agreed_price_currency ||
            firstActiveItem.buyer_offer_price_currency!; // Let it fail if null

          await tx.catalog_offer_negotiations.create({
            data: {
              catalog_offers: {
                connect: { catalog_offer_id: catalogOffer.catalog_offer_id },
              },
              catalog_offer_item: {
                connect: {
                  catalog_offer_item_id: firstActiveItem.catalog_offer_item_id,
                },
              },
              negotiation_round: newRound + 1,
              is_current_offer: true,
              action_type: "SELLER_ACCEPT",
              users: {
                connect: { user_id: config.sellerUserId },
              },
              offer_price_per_unit: finalPrice,
              offer_price_currency: finalCurrency as currency_code_type,
              offer_quantity: finalQuantity,
              offer_status: "ACCEPTED",
              offer_message: "Offer accepted and order created",
              auto_accepted: false,
              system_generated: true,
              created_at: new Date(),
              responded_at: new Date(),
            },
          });
        }
      }
    }

    // Send notifications asynchronously (outside transaction) in parallel
    const notificationPromises = [
      this.sendOfferAcceptedNotifications(
        catalogOffer,
        config,
        newOfferTotal,
        orderData
      ),
    ];

    if (orderData) {
      notificationPromises.push(
        this.sendOrderCreatedNotifications(catalogOffer, orderData)
      );
    }

    await Promise.allSettled(notificationPromises).then((results) => {
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          const notificationType =
            index === 0 ? "offer accepted" : "order created";
          console.error(
            `Failed to send ${notificationType} notifications:`,
            result.reason
          );
        } else {
          const notificationType =
            index === 0 ? "offer accepted" : "order created";
          console.log(`Successfully sent ${notificationType} notifications`);
        }
      });
    });

    return {
      success: true,
      data: {
        catalog_offer_modifications: modificationResults,
        negotiations: negotiationResults,
        item_changes: itemChangeResults,
        order: orderData,
        summary: {
          total_modifications: totalModifications,
          products_added: productsAdded,
          items_updated: itemsUpdated,
          items_auto_finalized: unchangedItems.length, // NEW: track auto-finalized
          previous_offer_total: previousOfferTotal,
          new_offer_total: newOfferTotal,
          total_savings_applied: previousOfferTotal - newOfferTotal,
          order_auto_created: !!orderData,
        },
      },
    };
  }
  /**
   * Execute order creation within existing transaction context
   * This replicates the logic from OrdersOperations.executeOrderCreation but works within a transaction
   */
  private async executeOrderCreationInTransaction(
    config: {
      catalogOfferId: string;
      buyerUserId: string;
      buyerProfileId: string;
      sellerUserId: string;
      sellerProfileId: string;
      shippingAddressPublicId?: string;
      billingAddressPublicId?: string;
      orderNotes?: string;
      autoCreateOrder: boolean;
    },
    validation: any, // OrderValidationResult from OrdersOperations
    tx: PrismaClient
  ): Promise<{
    success: boolean;
    orderData?: any;
    error?: any;
  }> {
    try {
      const catalogOffer = validation.catalogOfferData;
      const validatedItems = validation.validatedItems!;
      const totalOrderValue = validation.totalOrderValue!;
      const orderCurrency = validation.orderCurrency!;

      // 2. Calculate payment due date (default: 3 days from now)
      const paymentDueDate = new Date();
      paymentDueDate.setDate(paymentDueDate.getDate() + 3);

      // 2.5 Real-time inventory validation before order creation
      for (const validatedItem of validatedItems) {
        if (validatedItem.catalogProductVariantId) {
          const currentVariant = await tx.catalog_product_variants.findUnique({
            where: {
              catalog_product_variant_id: validatedItem.catalogProductVariantId,
            },
            select: {
              available_quantity: true,
              variant_sku: true,
              catalog_products: {
                select: { title: true },
              },
            },
          });

          if (!currentVariant) {
            return {
              success: false,
              error: `Product variant not found: ${validatedItem.catalogProductVariantId}`,
            };
          }

          if (
            currentVariant.available_quantity !== null &&
            currentVariant.available_quantity < validatedItem.quantity
          ) {
            return {
              success: false,
              error:
                `Insufficient inventory for ${currentVariant.catalog_products.title} (SKU: ${currentVariant.variant_sku}). ` +
                `Available: ${currentVariant.available_quantity}, Requested: ${validatedItem.quantity}`,
            };
          }

          if (
            currentVariant?.available_quantity !== null &&
            currentVariant.available_quantity < validatedItem.quantity
          ) {
            return {
              success: false,
              error:
                `Insufficient inventory for ${currentVariant.catalog_products.title} (SKU: ${currentVariant.variant_sku}). ` +
                `Available: ${currentVariant.available_quantity}, Requested: ${validatedItem.quantity}`,
            };
          }
        }
      }

      // 3. Create the order
      const order = await tx.orders.create({
        data: {
          users_orders_buyer_user_idTousers: {
            connect: { user_id: config.buyerUserId },
          },
          buyer_profiles: {
            connect: { buyer_profile_id: config.buyerProfileId },
          },
          users_orders_seller_user_idTousers: {
            connect: { user_id: config.sellerUserId },
          },
          seller_profiles: {
            connect: { seller_profile_id: config.sellerProfileId },
          },
          catalog_offers: {
            connect: { catalog_offer_id: catalogOffer.catalog_offer_id },
          },
          order_type: "CATALOG",
          order_status: "PENDING",
          total_amount: totalOrderValue,
          total_amount_currency: orderCurrency,
          shipping_cost: 0, // Default to 0, can be updated later
          shipping_cost_currency: orderCurrency,
          tax_amount: 0, // Default to 0, can be calculated later
          tax_amount_currency: orderCurrency,
          addresses_orders_shipping_address_idToaddresses:
            validation.shippingAddressData
              ? {
                  connect: {
                    address_id: validation.shippingAddressData.address_id,
                  },
                }
              : undefined,
          addresses_orders_billing_address_idToaddresses:
            validation.billingAddressData
              ? {
                  connect: {
                    address_id: validation.billingAddressData.address_id,
                  },
                }
              : undefined,
          payment_due_date: paymentDueDate,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      // 4. Create order items
      const orderItems = await Promise.all(
        validatedItems.map(async (item: any) => {
          return await tx.order_items.create({
            data: {
              orders: {
                connect: { order_id: order.order_id },
              },
              catalog_products: item.catalogProductId
                ? {
                    connect: { catalog_product_id: item.catalogProductId },
                  }
                : undefined,
              catalog_product_variants: item.catalogProductVariantId
                ? {
                    connect: {
                      catalog_product_variant_id: item.catalogProductVariantId,
                    },
                  }
                : undefined,
              catalog_offer_negotiations: {
                connect: {
                  catalog_offer_negotiation_id: item.finalNegotiationId,
                },
              },
              quantity: item.quantity,
              unit_price: item.unitPrice,
              unit_price_currency: orderCurrency,
              total_price: item.totalPrice,
              total_price_currency: orderCurrency,
              created_at: new Date(),
            },
          });
        })
      );

      // 4.5: Update inventory
      for (const validatedItem of validatedItems) {
        if (validatedItem.catalogProductVariantId) {
          await tx.catalog_product_variants.update({
            where: {
              catalog_product_variant_id: validatedItem.catalogProductVariantId,
            },
            data: {
              available_quantity: {
                decrement: validatedItem.quantity,
              },
              updated_at: new Date(),
            },
          });
        }
      }

      // 5. Create initial order status history
      await tx.order_status_history.create({
        data: {
          orders: {
            connect: { order_id: order.order_id },
          },
          previous_status: null,
          new_status: "PENDING",
          users: {
            connect: { user_id: config.buyerUserId },
          },
          change_reason: "Order created from accepted catalog offer",
          timestamp: new Date(),
        },
      });

      // 6. Build response data
      const orderData = {
        order_public_id: order.public_id,
        order_number: order.order_number ?? "",
        seller_order_number: order.seller_order_number!,
        order_type: order.order_type,
        order_status: order.order_status!,
        total_amount: Number(order.total_amount),
        total_amount_currency: order.total_amount_currency,
        shipping_cost: Number(order.shipping_cost || 0),
        tax_amount: Number(order.tax_amount || 0),
        tax_amount_currency: order.tax_amount_currency,
        payment_due_date: order.payment_due_date!,
        created_at: order.created_at!,
        catalog_offer_public_id: catalogOffer.public_id,
        items: orderItems.map((orderItem, index) => {
          const validatedItem = validatedItems[index];
          return {
            catalog_product_public_id: validatedItem.catalogProductId
              ? catalogOffer.catalog_offer_items.find(
                  (item: any) =>
                    item.catalog_product_id === validatedItem.catalogProductId
                )?.catalog_products?.public_id
              : undefined,
            catalog_product_variant_public_id:
              validatedItem.catalogProductVariantId
                ? catalogOffer.catalog_offer_items.find(
                    (item: any) =>
                      item.catalog_product_variant_id ===
                      validatedItem.catalogProductVariantId
                  )?.catalog_product_variants?.public_id
                : undefined,
            final_negotiation_public_id: `NEG-${validatedItem.finalNegotiationId.slice(-6)}`,
            quantity: orderItem.quantity,
            unit_price: Number(orderItem.unit_price),
            total_price: Number(orderItem.total_price),
          };
        }),
      };

      return {
        success: true,
        orderData,
      };
    } catch (error) {
      console.error("Error executing order creation in transaction:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Process ADD_PRODUCT modification
   */
  private async processAddProduct(
    modification: CatalogOfferModification,
    catalogOffer: any,
    round: number,
    sellerUserId: string,
    tx: PrismaClient
  ): Promise<{
    success: boolean;
    data?: any;
    negotiation?: any;
    itemChange?: any;
    error?: any;
  }> {
    try {
      // Find the product/variant in the catalog listing
      let productId = null;
      let variantId = null;

      if (modification.catalogProductVariantPublicId) {
        const variant = await tx.catalog_product_variants.findUnique({
          where: { public_id: modification.catalogProductVariantPublicId },
          include: { catalog_products: true },
        });

        if (!variant) {
          throw new Error(
            `Product variant not found: ${modification.catalogProductVariantPublicId}`
          );
        }

        variantId = variant.catalog_product_variant_id;
        productId = variant.parent_product_id;
      } else if (modification.catalogProductPublicId) {
        const product = await tx.catalog_products.findUnique({
          where: { public_id: modification.catalogProductPublicId },
        });

        if (!product) {
          throw new Error(
            `Product not found: ${modification.catalogProductPublicId}`
          );
        }

        productId = product.catalog_product_id;
      }

      // INVENTORY VALIDATION
      if (variantId) {
        const currentVariant = await tx.catalog_product_variants.findUnique({
          where: { catalog_product_variant_id: variantId },
          select: {
            available_quantity: true,
            variant_sku: true,
            catalog_products: {
              select: { title: true },
            },
          },
        });

        if (!currentVariant) {
          return {
            success: false,
            error: `Product variant not found: ${modification.catalogProductVariantPublicId}`,
          };
        }

        if (
          currentVariant.available_quantity !== null &&
          modification.quantity! > currentVariant.available_quantity
        ) {
          return {
            success: false,
            error: `Cannot add product: insufficient inventory for ${currentVariant.catalog_products.title} (SKU: ${currentVariant.variant_sku}). Available: ${currentVariant.available_quantity}, Requested: ${modification.quantity}`,
          };
        }

        if (
          currentVariant?.available_quantity !== null &&
          modification.quantity! > currentVariant.available_quantity
        ) {
          return {
            success: false,
            error: `Cannot add product: insufficient inventory for ${currentVariant.catalog_products.title} (SKU: ${currentVariant.variant_sku}). Available: ${currentVariant.available_quantity}, Requested: ${modification.quantity}`,
          };
        }
      }

      // Create new offer item
      const offerItem = await tx.catalog_offer_items.create({
        data: {
          catalog_offers: {
            connect: { catalog_offer_id: catalogOffer.catalog_offer_id },
          },
          catalog_products: productId
            ? {
                connect: { catalog_product_id: productId },
              }
            : undefined,
          catalog_product_variants: variantId
            ? {
                connect: { catalog_product_variant_id: variantId },
              }
            : undefined,
          requested_quantity: modification.quantity!,
          seller_offer_price: modification.sellerPricePerUnit!,
          seller_offer_price_currency: "USD", // Default currency
          buyer_offer_price: modification.sellerPricePerUnit!, // Auto-accept at seller price
          buyer_offer_price_currency: "USD",
          negotiation_status: "AGREED",
          item_status: "ACTIVE",
          item_version: 1,
          added_in_round: round,
          final_agreed_price: modification.sellerPricePerUnit!,
          final_agreed_price_currency: "USD",
          final_agreed_quantity: modification.quantity!,
          agreed_at: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      // Create negotiation record
      const negotiation = await tx.catalog_offer_negotiations.create({
        data: {
          catalog_offers: {
            connect: { catalog_offer_id: catalogOffer.catalog_offer_id },
          },
          catalog_offer_item: {
            connect: {
              catalog_offer_item_id: offerItem.catalog_offer_item_id,
            },
          },
          negotiation_round: round,
          is_current_offer: true,
          action_type: "SELLER_OFFER",
          users: {
            connect: { user_id: sellerUserId },
          },
          offer_price_per_unit: modification.sellerPricePerUnit!,
          offer_price_currency: "USD",
          offer_quantity: modification.quantity!,
          offer_status: "ACCEPTED",
          offer_message:
            modification.modificationReason || "Product added by seller",
          auto_accepted: true,
          auto_accept_reason: "Seller modification with auto-accept",
          system_generated: false,
          created_at: new Date(),
          responded_at: new Date(),
        },
      });

      // Create item change record
      const itemChange = await tx.catalog_offer_item_changes.create({
        data: {
          catalog_offers: {
            connect: { catalog_offer_id: catalogOffer.catalog_offer_id },
          },
          catalog_offer_items: {
            connect: { catalog_offer_item_id: offerItem.catalog_offer_item_id },
          },
          change_type: "ITEM_ADDED",
          users: {
            connect: { user_id: sellerUserId },
          },
          negotiation_round: round,
          catalog_products: productId
            ? {
                connect: { catalog_product_id: productId },
              }
            : undefined,
          catalog_product_variants: variantId
            ? {
                connect: { catalog_product_variant_id: variantId },
              }
            : undefined,
          new_requested_quantity: modification.quantity!,
          new_buyer_offer_price: modification.sellerPricePerUnit!,
          new_buyer_offer_price_currency: "USD",
          new_quantity: modification.quantity!,
          new_buyer_price: modification.sellerPricePerUnit!,
          change_reason:
            modification.modificationReason || "Product added by seller",
          change_summary: `Added product with quantity ${modification.quantity} at price ${modification.sellerPricePerUnit}`,
          auto_generated: true,
          system_action: false,
          created_at: new Date(),
        },
      });

      return {
        success: true,
        data: {
          action: "ADD_PRODUCT",
          catalog_offer_item: {
            catalog_offer_item_public_id: offerItem.public_id,
            catalog_product_public_id: modification.catalogProductPublicId,
            catalog_product_variant_public_id:
              modification.catalogProductVariantPublicId,
            requested_quantity: modification.quantity!,
            seller_offer_price: modification.sellerPricePerUnit!,
            buyer_offer_price: modification.sellerPricePerUnit!,
            negotiation_status: "AGREED",
            item_status: "ACTIVE",
            final_agreed_price: modification.sellerPricePerUnit!,
            final_agreed_quantity: modification.quantity!,
            agreed_at: new Date(),
          },
        },
        negotiation: {
          negotiation_public_id: negotiation.public_id,
          catalog_offer_item_public_id: offerItem.public_id,
          action_type: "SELLER_OFFER",
          offer_price_per_unit: modification.sellerPricePerUnit!,
          offer_quantity: modification.quantity!,
          offer_status: "ACCEPTED",
          auto_accepted: true,
          auto_accept_reason: "Seller modification with auto-accept",
        },
        itemChange: {
          change_public_id: itemChange.public_id,
          catalog_offer_item_public_id: offerItem.public_id,
          change_type: "ITEM_ADDED",
          new_catalog_product_public_id: modification.catalogProductPublicId,
          new_catalog_product_variant_public_id:
            modification.catalogProductVariantPublicId,
          new_quantity: modification.quantity!,
          new_buyer_price: modification.sellerPricePerUnit!,
          change_reason:
            modification.modificationReason || "Product added by seller",
          auto_generated: true,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Process UPDATE_EXISTING modification
   */
  private async processUpdateExisting(
    modification: CatalogOfferModification,
    catalogOffer: any,
    round: number,
    sellerUserId: string,
    tx: PrismaClient
  ): Promise<{
    success: boolean;
    data?: any;
    negotiation?: any;
    itemChange?: any;
    previousPrice?: number;
    previousQuantity?: number;
    error?: any;
  }> {
    try {
      // Find the existing offer item
      const existingItem = await tx.catalog_offer_items.findUnique({
        where: { public_id: modification.catalogOfferItemPublicId! },
      });

      if (!existingItem) {
        throw new Error(
          `Offer item not found: ${modification.catalogOfferItemPublicId}`
        );
      }

      const previousPrice = Number(
        existingItem.final_agreed_price || existingItem.buyer_offer_price || 0
      );
      const previousQuantity =
        existingItem.final_agreed_quantity || existingItem.requested_quantity;

      const newPrice = modification.newSellerPricePerUnit ?? previousPrice;
      const newQuantity = modification.newQuantity ?? previousQuantity;

      // INVENTORY VALIDATION HERE
      if (
        modification.newQuantity &&
        modification.newQuantity !== previousQuantity
      ) {
        const itemWithVariant = await tx.catalog_offer_items.findUnique({
          where: { catalog_offer_item_id: existingItem.catalog_offer_item_id },
          include: {
            catalog_product_variants: {
              select: {
                available_quantity: true,
                variant_sku: true,
                catalog_products: {
                  select: { title: true },
                },
              },
            },
          },
        });

        if (!itemWithVariant) {
          return {
            success: false,
            error: `Offer item not found: ${modification.catalogOfferItemPublicId}`,
          };
        }

        if (!itemWithVariant.catalog_product_variants) {
          return {
            success: false,
            error: `Product variant not found for offer item: ${modification.catalogOfferItemPublicId}`,
          };
        }

        if (
          itemWithVariant.catalog_product_variants.available_quantity !==
            null &&
          modification.newQuantity >
            itemWithVariant.catalog_product_variants.available_quantity
        ) {
          return {
            success: false,
            error: `Cannot update quantity: insufficient inventory for ${itemWithVariant.catalog_product_variants.catalog_products.title} (SKU: ${itemWithVariant.catalog_product_variants.variant_sku}). Available: ${itemWithVariant.catalog_product_variants.available_quantity}, Requested: ${modification.newQuantity}`,
          };
        }

        if (
          itemWithVariant?.catalog_product_variants?.available_quantity !==
            null &&
          modification.newQuantity >
            itemWithVariant.catalog_product_variants.available_quantity
        ) {
          return {
            success: false,
            error: `Cannot update quantity: insufficient inventory for ${itemWithVariant.catalog_product_variants.catalog_products.title} (SKU: ${itemWithVariant.catalog_product_variants.variant_sku}). Available: ${itemWithVariant.catalog_product_variants.available_quantity}, Requested: ${modification.newQuantity}`,
          };
        }
      }

      // Update the offer item
      const updatedItem = await tx.catalog_offer_items.update({
        where: { catalog_offer_item_id: existingItem.catalog_offer_item_id },
        data: {
          requested_quantity: newQuantity,
          seller_offer_price: newPrice,
          buyer_offer_price: newPrice, // Auto-accept at seller price
          final_agreed_price: newPrice,
          final_agreed_quantity: newQuantity,
          negotiation_status: "AGREED",
          agreed_at: new Date(),
          updated_at: new Date(),
          item_version: (existingItem.item_version || 0) + 1,
        },
      });

      // Create negotiation record
      const negotiation = await tx.catalog_offer_negotiations.create({
        data: {
          catalog_offers: {
            connect: { catalog_offer_id: catalogOffer.catalog_offer_id },
          },
          catalog_offer_item: {
            connect: {
              catalog_offer_item_id: existingItem.catalog_offer_item_id,
            },
          },
          negotiation_round: round,
          is_current_offer: true,
          action_type: "SELLER_COUNTER",
          users: {
            connect: { user_id: sellerUserId },
          },
          offer_price_per_unit: newPrice,
          offer_price_currency: "USD",
          offer_quantity: newQuantity,
          offer_status: "ACCEPTED",
          offer_message:
            modification.modificationReason || "Item updated by seller",
          auto_accepted: true,
          auto_accept_reason: "Seller modification with auto-accept",
          system_generated: false,
          created_at: new Date(),
          responded_at: new Date(),
        },
      });

      // Create item change record
      const changeType =
        modification.newQuantity && modification.newSellerPricePerUnit
          ? "TERMS_UPDATED"
          : modification.newQuantity
            ? "QUANTITY_CHANGED"
            : "PRICE_CHANGED";

      const itemChange = await tx.catalog_offer_item_changes.create({
        data: {
          catalog_offers: {
            connect: { catalog_offer_id: catalogOffer.catalog_offer_id },
          },
          catalog_offer_items: {
            connect: {
              catalog_offer_item_id: existingItem.catalog_offer_item_id,
            },
          },
          change_type: changeType,
          users: {
            connect: { user_id: sellerUserId },
          },
          negotiation_round: round,
          previous_quantity: previousQuantity,
          new_quantity: newQuantity,
          previous_buyer_price: previousPrice,
          new_buyer_price: newPrice,
          previous_price: previousPrice,
          change_reason:
            modification.modificationReason || "Item updated by seller",
          change_summary: `Updated quantity from ${previousQuantity} to ${newQuantity}, price from ${previousPrice} to ${newPrice}`,
          auto_generated: true,
          system_action: false,
          created_at: new Date(),
        },
      });

      return {
        success: true,
        data: {
          action: "UPDATE_EXISTING",
          catalog_offer_item: {
            catalog_offer_item_public_id: existingItem.public_id,
            requested_quantity: newQuantity,
            seller_offer_price: newPrice,
            buyer_offer_price: newPrice,
            negotiation_status: "AGREED",
            item_status: "ACTIVE",
            final_agreed_price: newPrice,
            final_agreed_quantity: newQuantity,
            agreed_at: new Date(),
            previous_quantity: previousQuantity,
            previous_price: previousPrice,
          },
        },
        negotiation: {
          negotiation_public_id: negotiation.public_id,
          catalog_offer_item_public_id: existingItem.public_id,
          action_type: "SELLER_COUNTER",
          offer_price_per_unit: newPrice,
          offer_quantity: newQuantity,
          offer_status: "ACCEPTED",
          auto_accepted: true,
          auto_accept_reason: "Seller modification with auto-accept",
        },
        itemChange: {
          change_public_id: itemChange.public_id,
          catalog_offer_item_public_id: existingItem.public_id,
          change_type: changeType,
          new_quantity: newQuantity,
          new_buyer_price: newPrice,
          previous_quantity: previousQuantity,
          previous_buyer_price: previousPrice,
          change_reason:
            modification.modificationReason || "Item updated by seller",
          auto_generated: true,
        },
        previousPrice,
        previousQuantity,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Process REMOVE_PRODUCT modification
   */
  private async processRemoveProduct(
    modification: CatalogOfferModification,
    catalogOffer: any,
    round: number,
    sellerUserId: string,
    tx: PrismaClient
  ): Promise<{
    success: boolean;
    data?: any;
    negotiation?: any;
    itemChange?: any;
    previousPrice?: number;
    previousQuantity?: number;
    error?: any;
  }> {
    try {
      // Find the existing offer item
      const existingItem = await tx.catalog_offer_items.findUnique({
        where: { public_id: modification.catalogOfferItemPublicId! },
      });

      if (!existingItem) {
        throw new Error(
          `Offer item not found: ${modification.catalogOfferItemPublicId}`
        );
      }

      const previousPrice = Number(
        existingItem.final_agreed_price || existingItem.buyer_offer_price || 0
      );
      const previousQuantity =
        existingItem.final_agreed_quantity || existingItem.requested_quantity;

      // Update the offer item to REMOVED status
      const updatedItem = await tx.catalog_offer_items.update({
        where: { catalog_offer_item_id: existingItem.catalog_offer_item_id },
        data: {
          item_status: "REMOVED",
          negotiation_status: "AGREED",
          removed_in_round: round,
          agreed_at: new Date(),
          updated_at: new Date(),
        },
      });

      // Create negotiation record
      const negotiation = await tx.catalog_offer_negotiations.create({
        data: {
          catalog_offers: {
            connect: { catalog_offer_id: catalogOffer.catalog_offer_id },
          },
          catalog_offer_item: {
            connect: {
              catalog_offer_item_id: existingItem.catalog_offer_item_id,
            },
          },
          negotiation_round: round,
          is_current_offer: true,
          action_type: "SELLER_COUNTER",
          users: {
            connect: { user_id: sellerUserId },
          },
          offer_price_per_unit: 0,
          offer_price_currency: "USD",
          offer_quantity: 0,
          offer_status: "ACCEPTED",
          offer_message:
            modification.modificationReason || "Item removed by seller",
          auto_accepted: true,
          auto_accept_reason: "Seller modification with auto-accept",
          system_generated: false,
          created_at: new Date(),
          responded_at: new Date(),
        },
      });

      // Create item change record
      const itemChange = await tx.catalog_offer_item_changes.create({
        data: {
          catalog_offers: {
            connect: { catalog_offer_id: catalogOffer.catalog_offer_id },
          },
          catalog_offer_items: {
            connect: {
              catalog_offer_item_id: existingItem.catalog_offer_item_id,
            },
          },
          change_type: "ITEM_REMOVED",
          users: {
            connect: { user_id: sellerUserId },
          },
          negotiation_round: round,
          previous_quantity: previousQuantity,
          new_quantity: 0,
          previous_buyer_price: previousPrice,
          new_buyer_price: 0,
          previous_price: previousPrice,
          change_reason:
            modification.modificationReason || "Item removed by seller",
          change_summary: `Removed item with quantity ${previousQuantity} at price ${previousPrice}`,
          auto_generated: true,
          system_action: false,
          created_at: new Date(),
        },
      });

      return {
        success: true,
        data: {
          action: "REMOVE_PRODUCT",
          catalog_offer_item: {
            catalog_offer_item_public_id: existingItem.public_id,
            requested_quantity: 0,
            seller_offer_price: 0,
            buyer_offer_price: 0,
            negotiation_status: "AGREED",
            item_status: "REMOVED",
            final_agreed_price: 0,
            final_agreed_quantity: 0,
            agreed_at: new Date(),
            previous_quantity: previousQuantity,
            previous_price: previousPrice,
          },
        },
        negotiation: {
          negotiation_public_id: negotiation.public_id,
          catalog_offer_item_public_id: existingItem.public_id,
          action_type: "SELLER_COUNTER",
          offer_price_per_unit: 0,
          offer_quantity: 0,
          offer_status: "ACCEPTED",
          auto_accepted: true,
          auto_accept_reason: "Seller modification with auto-accept",
        },
        itemChange: {
          change_public_id: itemChange.public_id,
          catalog_offer_item_public_id: existingItem.public_id,
          change_type: "ITEM_REMOVED",
          new_quantity: 0,
          new_buyer_price: 0,
          previous_quantity: previousQuantity,
          previous_buyer_price: previousPrice,
          change_reason:
            modification.modificationReason || "Item removed by seller",
          auto_generated: true,
        },
        previousPrice,
        previousQuantity,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
  /**
   * Get current negotiation round for an offer
   */
  private async getCurrentNegotiationRound(
    catalogOfferId: string,
    tx: PrismaClient = this.prisma
  ): Promise<number> {
    const maxRound = await tx.catalog_offer_negotiations.aggregate({
      where: { catalog_offer_id: catalogOfferId },
      _max: { negotiation_round: true },
    });

    return maxRound._max.negotiation_round || 0;
  }

  /**
   * Create catalog offer from uploaded Excel file
   */
  async createCatalogOfferFromFile(
    config: CreateCatalogOfferFromFileConfig
  ): Promise<CatalogOfferFromFileResult> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Initialize upload operations
        const uploadOps = new CatalogOfferUploadOperations(tx as PrismaClient);

        // 2. Parse the Excel file
        const parseResult = await uploadOps.parseOfferFile(
          config.fileBuffer,
          config.fileName
        );

        if (parseResult.items.length === 0) {
          return {
            success: false,
            error: {
              code: "NO_VALID_ITEMS",
              message: "No valid offer items found in the uploaded file",
              details: {
                total_items: parseResult.totalItems,
                valid_items: parseResult.validItems,
                parsing_errors: parseResult.errors,
              },
            },
          };
        }

        // 3. Validate items against catalog listing
        const validationResult = await uploadOps.validateOfferItems(
          parseResult.items,
          config.catalogListingPublicId
        );

        // For file uploads, ANY validation errors should cause failure
        // This is different from manual offer creation where users might fix individual items
        if (
          !validationResult.isValid ||
          validationResult.errors.length > 0 ||
          validationResult.validatedItems.length !== parseResult.items.length
        ) {
          return {
            success: false,
            error: {
              code: "FILE_VALIDATION_FAILED",
              message:
                "File validation failed - all items must be valid for file uploads",
              details: {
                total_items_in_file: parseResult.items.length,
                items_that_passed_validation:
                  validationResult.validatedItems.length,
                items_that_failed_validation:
                  parseResult.items.length -
                  validationResult.validatedItems.length,
                validation_errors: validationResult.errors,
                parsing_errors: parseResult.errors,
                summary: {
                  file_parsing_success: parseResult.errors.length === 0,
                  inventory_validation_success:
                    validationResult.errors.filter(
                      (e) => e.code === "INSUFFICIENT_INVENTORY"
                    ).length === 0,
                  all_items_valid:
                    validationResult.validatedItems.length ===
                    parseResult.items.length,
                },
                suggested_actions: [
                  "Review inventory levels for all products",
                  "Reduce quantities to available levels",
                  "Remove unavailable items from the file",
                  "Contact seller to update inventory",
                  "Split the order into multiple smaller offers",
                ],
              },
            },
          };
        }

        // 4. Convert validated items to CatalogOfferItem format
        const catalogOfferItems: CatalogOfferItem[] =
          validationResult.validatedItems.map((validatedItem) => ({
            catalogProductVariantId:
              validatedItem.variantData.catalogProductVariantId,
            requestedQuantity: validatedItem.requestedQuantity,
            buyerOfferPrice: validatedItem.buyerOfferPrice,
            buyerOfferPriceCurrency: validatedItem.buyerOfferPriceCurrency,
          }));

        // 5. Create the catalog offer using existing validation and creation logic
        const createOfferConfig: CreateCatalogOfferConfig = {
          catalogListingId: config.catalogListingPublicId,
          buyerUserId: config.buyerUserId,
          buyerProfileId: config.buyerProfileId,
          items: catalogOfferItems,
          expiresAt: config.expiresAt,
          offerMessage: config.offerMessage,
        };

        // 6. Validate the offer creation (reuse existing validation)
        const validation = await this.validateOfferCreation(
          createOfferConfig,
          tx as PrismaClient
        );

        if (!validation.isValid) {
          return {
            success: false,
            error: validation.error,
          };
        }

        // 7. Execute the offer creation
        const creationResult = await this.executeOfferCreation(
          createOfferConfig,
          validation,
          tx as PrismaClient
        );

        if (!creationResult.success) {
          return {
            success: false,
            error: creationResult.error,
          };
        }

        // 8. Build the response with file parsing summary
        return {
          success: true,
          catalogOfferId: creationResult.catalogOfferId,
          data: {
            catalog_offer_id: creationResult.offerData!.catalog_offer_id,
            offer_status: creationResult.offerData!.offer_status,
            total_offer_value: creationResult.offerData!.total_offer_value,
            total_offer_value_currency:
              creationResult.offerData!.total_offer_value_currency,
            expires_at: creationResult.offerData!.expires_at,
            created_at: creationResult.offerData!.created_at,
            file_parsing_summary: {
              total_rows_processed: parseResult.totalItems,
              valid_items_found: parseResult.validItems,
              items_with_offers: validationResult.validatedItems.length,
              parsing_errors: parseResult.errors,
              validation_errors: validationResult.errors,
            },
            items: validationResult.validatedItems.map(
              (validatedItem, index) => ({
                sku: validatedItem.originalFileData.sku,
                product_title: validatedItem.variantData.productTitle,
                brand_name: validatedItem.variantData.brandName,
                requested_quantity: validatedItem.requestedQuantity,
                buyer_offer_price: validatedItem.buyerOfferPrice,
                buyer_offer_price_currency:
                  validatedItem.buyerOfferPriceCurrency,
                negotiation_status:
                  creationResult.offerData!.items[index].negotiation_status,
                item_status: creationResult.offerData!.items[index].item_status,
                added_in_round:
                  creationResult.offerData!.items[index].added_in_round,
              })
            ),
          },
        };
      });
    } catch (error) {
      console.error("Error in createCatalogOfferFromFile:", error);
      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message:
            "An internal error occurred while creating the catalog offer from file",
          details: {
            error: error instanceof Error ? error.message : String(error),
          },
        },
      };
    }
  }

  /**
   * Send offer accepted notifications to buyer and seller
   */
  private async sendOfferAcceptedNotifications(
    catalogOffer: {
      catalog_offer_id: string;
      public_id: string;
      buyer_profile_id: string;
      seller_profile_id: string;
      catalog_listing_id: string;
      currency?: string;
    },
    config: ModifyAndAcceptCatalogOfferConfig,
    finalOfferAmount: number,
    orderData?: {
      order_public_id: string;
      order_number: string;
      total_amount: number;
      total_amount_currency: string;
      items?: unknown[];
    }
  ): Promise<void> {
    try {
      // Get buyer info
      const buyerProfile = await this.prisma.buyer_profiles.findUnique({
        where: { buyer_profile_id: catalogOffer.buyer_profile_id },
        include: {
          users: {
            select: {
              user_id: true,
              email: true,
              first_name: true,
              last_name: true,
              company: true,
            },
          },
        },
      });

      // Get seller info
      const sellerProfile = await this.prisma.seller_profiles.findUnique({
        where: { seller_profile_id: catalogOffer.seller_profile_id },
        include: {
          users: {
            select: {
              user_id: true,
              email: true,
              first_name: true,
              last_name: true,
              company: true,
            },
          },
        },
      });

      // Get catalog listing info
      const catalogListing = await this.prisma.catalog_listings.findUnique({
        where: { catalog_listing_id: catalogOffer.catalog_listing_id },
        select: { title: true, public_id: true },
      });

      if (!buyerProfile?.users || !sellerProfile?.users || !catalogListing) {
        console.error("Missing required data for offer accepted notifications");
        return;
      }

      const buyerName =
        `${buyerProfile.users.first_name || ""} ${buyerProfile.users.last_name || ""}`.trim() ||
        buyerProfile.users.company ||
        "Buyer";
      const sellerName =
        `${sellerProfile.users.first_name || ""} ${sellerProfile.users.last_name || ""}`.trim() ||
        sellerProfile.users.company ||
        "Seller";

      // Count active items
      const itemCount = await this.prisma.catalog_offer_items.count({
        where: {
          catalog_offer_id: catalogOffer.catalog_offer_id,
          item_status: "ACTIVE",
        },
      });

      // Notification data for buyer
      const buyerNotificationData = {
        offerId: catalogOffer.public_id,
        catalogId: catalogListing.public_id,
        catalogTitle: catalogListing.title,
        buyerId: buyerProfile.users.user_id,
        buyerEmail: buyerProfile.users.email,
        buyerName: buyerName,
        finalOfferAmount: finalOfferAmount,
        currency: catalogOffer.currency || "USD",
        itemCount: itemCount,
        sellerInfo: {
          userId: sellerProfile.users.user_id,
          email: sellerProfile.users.email,
          name: sellerName,
        },
        orderCreated: !!orderData,
        orderId: orderData?.order_public_id,
        orderNumber: orderData?.order_number,
        sellerMessage: config.sellerMessage,
      };

      // Notification data for seller
      const sellerNotificationData = {
        offerId: catalogOffer.public_id,
        catalogId: catalogListing.public_id,
        catalogTitle: catalogListing.title,
        sellerId: sellerProfile.users.user_id,
        sellerEmail: sellerProfile.users.email,
        sellerName: sellerName,
        finalOfferAmount: finalOfferAmount,
        currency: catalogOffer.currency || "USD",
        itemCount: itemCount,
        buyerInfo: {
          userId: buyerProfile.users.user_id,
          email: buyerProfile.users.email,
          name: buyerName,
        },
        orderCreated: !!orderData,
        orderId: orderData?.order_public_id,
        orderNumber: orderData?.order_number,
        sellerMessage: config.sellerMessage,
      };

      // Send notifications in parallel
      await Promise.all([
        notificationService.sendCatalogOfferAcceptedBuyerNotification(
          buyerNotificationData
        ),
        notificationService.sendCatalogOfferAcceptedSellerNotification(
          sellerNotificationData
        ),
      ]);

      console.log(
        `Offer accepted notifications sent for offer: ${catalogOffer.public_id}`
      );
    } catch (error) {
      console.error("Error sending offer accepted notifications:", error);
      throw error;
    }
  }

  /**
   * Send order created notifications to buyer and seller
   */
  private async sendOrderCreatedNotifications(
    catalogOffer: {
      catalog_offer_id: string;
      public_id: string;
      buyer_profile_id: string;
      seller_profile_id: string;
      catalog_listing_id: string;
    },
    orderData: {
      order_public_id: string;
      order_number: string;
      total_amount: number;
      total_amount_currency: string;
      items?: unknown[];
    }
  ): Promise<void> {
    try {
      // Get buyer info
      const buyerProfile = await this.prisma.buyer_profiles.findUnique({
        where: { buyer_profile_id: catalogOffer.buyer_profile_id },
        include: {
          users: {
            select: {
              user_id: true,
              email: true,
              first_name: true,
              last_name: true,
              company: true,
            },
          },
        },
      });

      // Get seller info
      const sellerProfile = await this.prisma.seller_profiles.findUnique({
        where: { seller_profile_id: catalogOffer.seller_profile_id },
        include: {
          users: {
            select: {
              user_id: true,
              email: true,
              first_name: true,
              last_name: true,
              company: true,
            },
          },
        },
      });

      // Get catalog listing info
      const catalogListing = await this.prisma.catalog_listings.findUnique({
        where: { catalog_listing_id: catalogOffer.catalog_listing_id },
        select: { title: true, public_id: true },
      });

      if (!buyerProfile?.users || !sellerProfile?.users || !catalogListing) {
        console.error("Missing required data for order created notifications");
        return;
      }

      const buyerName =
        `${buyerProfile.users.first_name || ""} ${buyerProfile.users.last_name || ""}`.trim() ||
        buyerProfile.users.company ||
        "Buyer";
      const sellerName =
        `${sellerProfile.users.first_name || ""} ${sellerProfile.users.last_name || ""}`.trim() ||
        sellerProfile.users.company ||
        "Seller";

      // Notification data for buyer
      const buyerNotificationData = {
        orderId: orderData.order_public_id,
        orderNumber: orderData.order_number,
        buyerId: buyerProfile.users.user_id,
        buyerEmail: buyerProfile.users.email,
        buyerName: buyerName,
        totalAmount: Number(orderData.total_amount || 0),
        currency: orderData.total_amount_currency || "USD",
        itemCount: orderData.items?.length || 0,
        sourceType: "CATALOG_OFFER" as const,
        sourceId: catalogOffer.public_id,
        sourceTitle: catalogListing.title,
        sellerInfo: {
          userId: sellerProfile.users.user_id,
          email: sellerProfile.users.email,
          name: sellerName,
        },
      };

      // Notification data for seller
      const sellerNotificationData = {
        orderId: orderData.order_public_id,
        orderNumber: orderData.order_number,
        sellerId: sellerProfile.users.user_id,
        sellerEmail: sellerProfile.users.email,
        sellerName: sellerName,
        totalAmount: Number(orderData.total_amount || 0),
        currency: orderData.total_amount_currency || "USD",
        itemCount: orderData.items?.length || 0,
        sourceType: "CATALOG_OFFER" as const,
        sourceId: catalogOffer.public_id,
        sourceTitle: catalogListing.title,
        buyerInfo: {
          userId: buyerProfile.users.user_id,
          email: buyerProfile.users.email,
          name: buyerName,
        },
      };

      // Send notifications in parallel
      await Promise.all([
        notificationService.sendOrderCreatedBuyerNotification(
          buyerNotificationData
        ),
        notificationService.sendOrderCreatedSellerNotification(
          sellerNotificationData
        ),
      ]);

      console.log(
        `Order created notifications sent for order: ${orderData.order_public_id}`
      );
    } catch (error) {
      console.error("Error sending order created notifications:", error);
      throw error;
    }
  }
}
