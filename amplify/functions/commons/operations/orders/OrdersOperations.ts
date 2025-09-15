import {
  currency_code_type,
  order_status_type,
  order_type,
  Prisma,
  PrismaClient,
} from "../../../lambda-layers/core-layer/nodejs/prisma/generated/client";
import { STANDARD_ID_LENGTH } from "../../utilities/public-id-generator";

export interface CreateOrderFromCatalogOfferConfig {
  catalogOfferId: string; // public_id
  buyerUserId: string; // internal UUID
  buyerProfileId: string; // internal UUID
  sellerUserId: string; // internal UUID
  sellerProfileId: string; // internal UUID
  shippingAddressPublicId?: string;
  billingAddressPublicId?: string;
  orderNotes?: string;
  autoCreateOrder?: boolean;
}

export interface OrderCreationResult {
  success: boolean;
  orderId?: string; // public_id
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  orderData?: {
    order_public_id: string;
    order_number: string;
    seller_order_number: number;
    order_type: order_type;
    order_status: order_status_type;
    total_amount: number;
    total_amount_currency: currency_code_type;
    shipping_cost: number;
    tax_amount: number;
    tax_amount_currency: currency_code_type;
    payment_due_date: Date;
    created_at: Date;
    catalog_offer_public_id: string;
    items: Array<{
      // order_item_public_id: string;  // TODO: add public_id for order item
      catalog_product_public_id?: string;
      catalog_product_variant_public_id?: string;
      final_negotiation_public_id: string;
      quantity: number;
      unit_price: number;
      total_price: number;
    }>;
  };
}

// Prisma validators
const catalogOfferWithItemsValidator =
  Prisma.validator<Prisma.catalog_offersDefaultArgs>()({
    include: {
      catalog_listings: {
        select: {
          catalog_listing_id: true,
          title: true,
          seller_user_id: true,
          seller_profile_id: true,
        },
      },
      catalog_offer_items: {
        where: {
          item_status: "ACTIVE",
          negotiation_status: "AGREED",
        },
        include: {
          catalog_product_variants: {
            include: {
              catalog_products: true,
            },
          },
          catalog_products: true,
          current_buyer_negotiation: true,
          current_seller_negotiation: true,
        },
      },
    },
  });

const addressValidator = Prisma.validator<Prisma.addressesDefaultArgs>()({});

// Type definitions
type CatalogOfferWithItems = Prisma.catalog_offersGetPayload<
  typeof catalogOfferWithItemsValidator
>;

type AddressData = Prisma.addressesGetPayload<typeof addressValidator>;

export interface OrderValidationResult {
  isValid: boolean;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  catalogOfferData?: CatalogOfferWithItems;
  shippingAddressData?: AddressData;
  billingAddressData?: AddressData;
  validatedItems?: Array<{
    catalogOfferItemId: string;
    catalogProductId?: string | null;
    catalogProductVariantId?: string | null;
    finalNegotiationId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  totalOrderValue?: number;
  orderCurrency?: currency_code_type;
}

export class OrdersOperations {
  constructor(private prisma: PrismaClient) {}

  /**
   * Main function to create an order from an accepted catalog offer
   */
  async createOrderFromCatalogOffer(
    config: CreateOrderFromCatalogOfferConfig
  ): Promise<OrderCreationResult> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1. Validate the order creation
        const validation = await this.validateOrderCreation(
          config,
          tx as PrismaClient
        );
        if (!validation.isValid) {
          return {
            success: false,
            error: validation.error,
          };
        }

        // 2. Create the order
        const result = await this.executeOrderCreation(
          config,
          validation,
          tx as PrismaClient
        );
        return result;
      });
    } catch (error) {
      console.error("Error in createOrderFromCatalogOffer:", error);
      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An internal error occurred while creating the order",
          details: {
            error: error instanceof Error ? error.message : String(error),
          },
        },
      };
    }
  }

  /**
   * Validate order creation from catalog offer
   */
  async validateOrderCreation(
    config: CreateOrderFromCatalogOfferConfig,
    tx: PrismaClient = this.prisma
  ): Promise<OrderValidationResult> {
    // 1. Resolve catalog offer public_id to internal catalog_offer_id
    let catalogOfferInternalId: string;

    if (config.catalogOfferId.length === STANDARD_ID_LENGTH) {
      const catalogOfferRecord = await tx.catalog_offers.findUnique({
        where: { public_id: config.catalogOfferId },
        select: { catalog_offer_id: true },
      });

      if (!catalogOfferRecord) {
        return {
          isValid: false,
          error: {
            code: "CATALOG_OFFER_NOT_FOUND",
            message: "Catalog offer not found with the provided public ID",
            details: { catalog_offer_public_id: config.catalogOfferId },
          },
        };
      }

      catalogOfferInternalId = catalogOfferRecord.catalog_offer_id;
    } else {
      catalogOfferInternalId = config.catalogOfferId;
    }

    // 2. Get catalog offer with full details
    const catalogOffer = await tx.catalog_offers.findUnique({
      where: { catalog_offer_id: catalogOfferInternalId },
      ...catalogOfferWithItemsValidator,
    });

    if (!catalogOffer) {
      return {
        isValid: false,
        error: {
          code: "CATALOG_OFFER_NOT_FOUND",
          message: "Catalog offer not found",
          details: { catalog_offer_id: catalogOfferInternalId },
        },
      };
    }

    // 3. Check if offer is in accepted status
    if (catalogOffer.offer_status !== "ACCEPTED") {
      return {
        isValid: false,
        error: {
          code: "OFFER_NOT_ACCEPTED",
          message: "Order can only be created from accepted catalog offers",
          details: {
            current_status: catalogOffer.offer_status,
            catalog_offer_public_id: catalogOffer.public_id,
          },
        },
      };
    }

    // 4. Verify user authorization
    if (config.buyerUserId !== catalogOffer.buyer_user_id) {
      return {
        isValid: false,
        error: {
          code: "UNAUTHORIZED_BUYER",
          message: "Only the buyer can create orders from their catalog offers",
          details: {
            provided_buyer_id: config.buyerUserId,
            offer_buyer_id: catalogOffer.buyer_user_id,
          },
        },
      };
    }

    // 5. Check if order already exists for this offer
    const existingOrder = await tx.orders.findFirst({
      where: { catalog_offer_id: catalogOfferInternalId },
    });

    if (existingOrder) {
      return {
        isValid: false,
        error: {
          code: "ORDER_ALREADY_EXISTS",
          message: "An order has already been created for this catalog offer",
          details: {
            existing_order_public_id: existingOrder.public_id,
            existing_order_status: existingOrder.order_status,
          },
        },
      };
    }

    // 6. Validate shipping address if provided
    let shippingAddressData = null;
    if (config.shippingAddressPublicId) {
      shippingAddressData = await tx.addresses.findUnique({
        where: { public_id: config.shippingAddressPublicId },
        ...addressValidator,
      });

      if (!shippingAddressData) {
        return {
          isValid: false,
          error: {
            code: "SHIPPING_ADDRESS_NOT_FOUND",
            message: "Shipping address not found",
            details: {
              shipping_address_public_id: config.shippingAddressPublicId,
            },
          },
        };
      }

      // Check if user has access to this address
      const userAddress = await tx.user_addresses.findFirst({
        where: {
          user_id: config.buyerUserId,
          address_id: shippingAddressData.address_id,
        },
      });

      if (!userAddress) {
        return {
          isValid: false,
          error: {
            code: "SHIPPING_ADDRESS_ACCESS_DENIED",
            message: "You do not have access to the specified shipping address",
          },
        };
      }
    }

    // 7. Validate billing address if provided
    let billingAddressData = null;
    if (config.billingAddressPublicId) {
      billingAddressData = await tx.addresses.findUnique({
        where: { public_id: config.billingAddressPublicId },
        ...addressValidator,
      });

      if (!billingAddressData) {
        return {
          isValid: false,
          error: {
            code: "BILLING_ADDRESS_NOT_FOUND",
            message: "Billing address not found",
            details: {
              billing_address_public_id: config.billingAddressPublicId,
            },
          },
        };
      }

      // Check if user has access to this address
      const userAddress = await tx.user_addresses.findFirst({
        where: {
          user_id: config.buyerUserId,
          address_id: billingAddressData.address_id,
        },
      });

      if (!userAddress) {
        return {
          isValid: false,
          error: {
            code: "BILLING_ADDRESS_ACCESS_DENIED",
            message: "You do not have access to the specified billing address",
          },
        };
      }
    }

    // 8. Validate offer items and prepare for order creation
    if (
      !catalogOffer.catalog_offer_items ||
      catalogOffer.catalog_offer_items.length === 0
    ) {
      return {
        isValid: false,
        error: {
          code: "NO_AGREED_ITEMS",
          message: "No agreed items found in the catalog offer",
          details: {
            catalog_offer_public_id: catalogOffer.public_id,
          },
        },
      };
    }

    const validatedItems = [];
    let totalOrderValue = 0;
    let orderCurrency: currency_code_type | null = null;

    for (const item of catalogOffer.catalog_offer_items) {
      // Get final agreed price and quantity
      const finalPrice = item.final_agreed_price
        ? Number(item.final_agreed_price)
        : null;
      const finalQuantity =
        item.final_agreed_quantity || item.requested_quantity;

      if (!finalPrice || !finalQuantity) {
        return {
          isValid: false,
          error: {
            code: "INCOMPLETE_ITEM_AGREEMENT",
            message: "Item does not have finalized price and quantity",
            details: {
              catalog_offer_item_id: item.catalog_offer_item_id,
              has_final_price: !!finalPrice,
              has_final_quantity: !!finalQuantity,
            },
          },
        };
      }

      // Determine current negotiation for tracking
      const currentNegotiation =
        item.current_seller_negotiation || item.current_buyer_negotiation;

      if (!currentNegotiation) {
        return {
          isValid: false,
          error: {
            code: "NO_CURRENT_NEGOTIATION",
            message: "No current negotiation found for catalog offer item",
            details: {
              catalog_offer_item_id: item.catalog_offer_item_id,
            },
          },
        };
      }

      // Set currency from first item
      if (!orderCurrency) {
        orderCurrency =
          item.final_agreed_price_currency ||
          currentNegotiation.offer_price_currency;
      }

      // Validate currency consistency
      const itemCurrency =
        item.final_agreed_price_currency ||
        currentNegotiation.offer_price_currency;
      if (itemCurrency !== orderCurrency) {
        return {
          isValid: false,
          error: {
            code: "MIXED_CURRENCIES",
            message: "All items in an order must use the same currency",
            details: {
              order_currency: orderCurrency,
              item_currency: itemCurrency,
              catalog_offer_item_id: item.catalog_offer_item_id,
            },
          },
        };
      }

      const itemTotal = finalPrice * finalQuantity;
      totalOrderValue += itemTotal;

      validatedItems.push({
        catalogOfferItemId: item.catalog_offer_item_id,
        catalogProductId: item.catalog_product_id ?? undefined,
        catalogProductVariantId: item.catalog_product_variant_id ?? undefined,
        finalNegotiationId: currentNegotiation.catalog_offer_negotiation_id,
        quantity: finalQuantity,
        unitPrice: finalPrice,
        totalPrice: itemTotal,
      });
    }

    return {
      isValid: true,
      catalogOfferData: catalogOffer,
      shippingAddressData: shippingAddressData ?? undefined,
      billingAddressData: billingAddressData ?? undefined,
      validatedItems: validatedItems.map((item) => ({
        ...item,
        catalogProductId: item.catalogProductId ?? undefined,
        catalogProductVariantId: item.catalogProductVariantId ?? undefined,
      })),
      totalOrderValue,
      orderCurrency: orderCurrency!,
    };
  }

  /**
   * Execute the actual order creation
   */
  private async executeOrderCreation(
    config: CreateOrderFromCatalogOfferConfig,
    validation: OrderValidationResult,
    tx: PrismaClient
  ): Promise<OrderCreationResult> {
    const catalogOffer = validation.catalogOfferData as CatalogOfferWithItems;
    const validatedItems = validation.validatedItems!;
    const totalOrderValue = validation.totalOrderValue!;
    const orderCurrency = validation.orderCurrency!;

    try {
      // 1. Get or create seller order counter for sequential numbering
      const currentYear = new Date().getFullYear();
      const sellerCounter = await this.getOrCreateSellerOrderCounter(
        config.sellerUserId,
        config.sellerProfileId,
        currentYear,
        tx
      );

      // 2. Calculate payment due date (default: 3 days from now)
      const paymentDueDate = new Date();
      paymentDueDate.setDate(paymentDueDate.getDate() + 3);

      // 2.5. Real-time inventory validation
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
            throw new Error(
              `Product variant not found: ${validatedItem.catalogProductVariantId}`
            );
          }

          if (
            currentVariant.available_quantity !== null &&
            currentVariant.available_quantity < validatedItem.quantity
          ) {
            throw new Error(
              `Insufficient inventory for ${currentVariant.catalog_products.title} (SKU: ${currentVariant.variant_sku}). ` +
                `Available: ${currentVariant.available_quantity}, Requested: ${validatedItem.quantity}`
            );
          }

          if (
            currentVariant?.available_quantity !== null &&
            currentVariant.available_quantity < validatedItem.quantity
          ) {
            throw new Error(
              `Insufficient inventory for ${currentVariant.catalog_products.title} (SKU: ${currentVariant.variant_sku}). ` +
                `Available: ${currentVariant.available_quantity}, Requested: ${validatedItem.quantity}`
            );
          }
        }
      }

      // 3. Create the order
      const order = await tx.orders.create({
        data: {
          order_number: `${new Date().getFullYear().toString().slice(-2)}-${String(sellerCounter.last_order_number).padStart(3, "0")}-${Math.floor(
            Math.random() * 10000
          )
            .toString()
            .padStart(4, "0")}`,
          seller_order_number: sellerCounter.last_order_number,
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
        validatedItems.map(async (item) => {
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
      const orderData: OrderCreationResult["orderData"] = {
        order_public_id: order.public_id,
        order_number: order.order_number ?? "",
        seller_order_number: order.seller_order_number!,
        order_type: order.order_type as order_type,
        order_status: order.order_status!,
        total_amount: Number(order.total_amount),
        total_amount_currency:
          order.total_amount_currency as currency_code_type,
        shipping_cost: Number(order.shipping_cost || 0),
        tax_amount: Number(order.tax_amount || 0),
        tax_amount_currency: order.tax_amount_currency as currency_code_type,
        payment_due_date: order.payment_due_date!,
        created_at: order.created_at!,
        catalog_offer_public_id: catalogOffer.public_id,
        items: orderItems.map((orderItem, index) => {
          const validatedItem = validatedItems[index];
          return {
            catalog_product_public_id: validatedItem.catalogProductId
              ? catalogOffer.catalog_offer_items.find(
                  (item) =>
                    item.catalog_product_id === validatedItem.catalogProductId
                )?.catalog_products?.public_id
              : undefined,
            catalog_product_variant_public_id:
              validatedItem.catalogProductVariantId
                ? catalogOffer.catalog_offer_items.find(
                    (item) =>
                      item.catalog_product_variant_id ===
                      validatedItem.catalogProductVariantId
                  )?.catalog_product_variants?.public_id
                : undefined,
            final_negotiation_public_id: `NEG-${validatedItem.finalNegotiationId.slice(-6)}`, // Generate a simple public ID
            quantity: orderItem.quantity,
            unit_price: Number(orderItem.unit_price),
            total_price: Number(orderItem.total_price),
          };
        }),
      };

      return {
        success: true,
        orderId: order.public_id,
        orderData,
      };
    } catch (error) {
      console.error("Error executing order creation:", error);
      throw error;
    }
  }

  /**
   * Get or create seller order counter for sequential numbering
   */
  private async getOrCreateSellerOrderCounter(
    sellerUserId: string,
    sellerProfileId: string,
    year: number,
    tx: PrismaClient
  ): Promise<{ last_order_number: number }> {
    // Try to get existing counter
    const existingCounter = await tx.seller_order_counters.findUnique({
      where: {
        seller_user_id_year: {
          seller_user_id: sellerUserId,
          year: year,
        },
      },
    });

    if (existingCounter) {
      // Increment and update
      const updatedCounter = await tx.seller_order_counters.update({
        where: {
          seller_order_counter_id: existingCounter.seller_order_counter_id,
        },
        data: {
          last_order_number: (existingCounter.last_order_number || 0) + 1,
          updated_at: new Date(),
        },
      });
      return { last_order_number: updatedCounter.last_order_number! };
    } else {
      // Create new counter
      const newCounter = await tx.seller_order_counters.create({
        data: {
          users: {
            connect: { user_id: sellerUserId },
          },
          seller_profiles: {
            connect: { seller_profile_id: sellerProfileId },
          },
          year: year,
          last_order_number: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
      return { last_order_number: newCounter.last_order_number! };
    }
  }
}
