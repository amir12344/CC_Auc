import {
  currency_code_type,
  order_status_type,
  order_type,
  payment_method_type,
  payment_status_type,
  Prisma,
  PrismaClient,
} from "../../../lambda-layers/core-layer/nodejs/prisma/generated/client";

export interface OrderDetails {
  order_id: string;
  public_id: string;
  order_number: string;
  seller_order_number: number;
  order_type: order_type;
  order_status: order_status_type;
  total_amount: number;
  total_amount_currency: currency_code_type;
  shipping_cost: number;
  shipping_cost_currency: currency_code_type;
  tax_amount: number;
  tax_amount_currency: currency_code_type;
  payment_due_date?: Date;
  shipping_date?: Date;
  delivery_date?: Date;
  created_at: Date;
  updated_at?: Date;
  buyer_info: {
    user_id: string;
    username: string;
    company?: string;
    display_name: string;
    email: string;
  };
  seller_info: {
    user_id: string;
    username: string;
    company?: string;
    display_name: string;
  };
  shipping_address?: {
    address_public_id: string;
    company?: string;
    first_name: string;
    last_name: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    country: string;
    zip: string;
    phone?: string;
  };
  billing_address?: {
    address_public_id: string;
    company?: string;
    first_name: string;
    last_name: string;
    address1: string;
    address2?: string;
    city: string;
    province: string;
    country: string;
    zip: string;
    phone?: string;
  };
  catalog_offer?: {
    catalog_offer_public_id: string;
  };
  auction_listing?: {
    auction_listing_public_id: string;
  };
  items: OrderItemDetails[];
  payments: OrderPaymentDetails[];
  status_history: OrderStatusHistoryDetails[];
}

export interface OrderItemDetails {
  order_item_id: string;
  catalog_product_public_id?: string;
  catalog_product_variant_public_id?: string;
  auction_manifest_id?: string;
  final_negotiation_public_id?: string;
  quantity: number;
  unit_price: number;
  unit_price_currency: currency_code_type;
  total_price: number;
  total_price_currency: currency_code_type;
  product_info?: {
    title: string;
    brand_name?: string;
    sku?: string;
    description?: string;
    default_image_url?: string;
  };
}

export interface OrderPaymentDetails {
  payment_public_id: string;
  payment_method: payment_method_type;
  payment_provider?: string;
  payment_provider_transaction_id?: string;
  payment_amount: number;
  payment_amount_currency: currency_code_type;
  payment_status: payment_status_type;
  payment_date?: Date;
  processed_at?: Date;
  created_at: Date;
}

export interface OrderStatusHistoryDetails {
  previous_status?: order_status_type;
  new_status: order_status_type;
  changed_by_user_id: string;
  changed_by_name: string;
  change_reason?: string;
  timestamp: Date;
}

export interface OrderSummary {
  order_id: string;
  public_id: string;
  order_number: string;
  order_type: order_type;
  order_status: order_status_type;
  total_amount: number;
  total_amount_currency: currency_code_type;
  buyer_company?: string;
  seller_company?: string;
  payment_due_date?: Date;
  created_at: Date;
}

export interface OrderListResponse {
  orders: OrderSummary[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
  };
}

// Prisma validators for type safety
const orderWithDetailsValidator = Prisma.validator<Prisma.ordersDefaultArgs>()({
  include: {
    users_orders_buyer_user_idTousers: {
      select: {
        user_id: true,
        username: true,
        email: true,
        company: true,
        first_name: true,
        last_name: true,
      },
    },
    users_orders_seller_user_idTousers: {
      select: {
        user_id: true,
        username: true,
        company: true,
        first_name: true,
        last_name: true,
      },
    },
    addresses_orders_shipping_address_idToaddresses: true,
    addresses_orders_billing_address_idToaddresses: true,
    catalog_offers: {
      select: {
        public_id: true,
      },
    },
    auction_listings: {
      select: {
        public_id: true,
      },
    },
    order_items: {
      include: {
        catalog_products: {
          include: {
            brands: true,
          },
        },
        catalog_product_variants: {
          include: {
            catalog_products: {
              include: {
                brands: true,
              },
            },
          },
        },
        auction_listing_product_manifests: {
          include: {
            brands: true,
          },
        },
        catalog_offer_negotiations: {
          select: {
            public_id: true,
          },
        },
      },
    },
    payments: true,
    order_status_history: {
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
      orderBy: {
        timestamp: "asc",
      },
    },
  },
});

type OrderWithDetails = Prisma.ordersGetPayload<
  typeof orderWithDetailsValidator
>;

export class OrdersDatabaseOperations {
  constructor(private prisma: PrismaClient) {}

  /**
   * Get detailed order information
   */
  async getOrderDetails(
    orderId: string,
    userId?: string
  ): Promise<OrderDetails | null> {
    // Determine if orderId is public_id or internal UUID
    let whereClause: any;
    if (orderId.length === 14) {
      whereClause = { public_id: orderId };
    } else {
      whereClause = { order_id: orderId };
    }

    const order = await this.prisma.orders.findUnique({
      where: whereClause,
      ...orderWithDetailsValidator,
    });

    if (!order) return null;

    // If userId is provided, check authorization
    if (
      userId &&
      order.buyer_user_id !== userId &&
      order.seller_user_id !== userId
    ) {
      return null; // User doesn't have access to this order
    }

    return this.formatOrderDetails(order);
  }

  /**
   * List orders with filtering and pagination
   */
  async listOrders(
    options: {
      buyer_user_id?: string;
      seller_user_id?: string;
      order_status?: order_status_type;
      order_type?: order_type;
      date_from?: Date;
      date_to?: Date;
      page?: number;
      limit?: number;
    } = {}
  ): Promise<OrderListResponse> {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause: Prisma.ordersWhereInput = {};

    if (options.buyer_user_id) {
      whereClause.buyer_user_id = options.buyer_user_id;
    }

    if (options.seller_user_id) {
      whereClause.seller_user_id = options.seller_user_id;
    }

    if (options.order_status) {
      whereClause.order_status = options.order_status;
    }

    if (options.order_type) {
      whereClause.order_type = options.order_type;
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

    // Parallelize count and data fetch
    const [total, orders] = await Promise.all([
      this.prisma.orders.count({ where: whereClause }),
      this.prisma.orders.findMany({
        where: whereClause,
        include: {
          users_orders_buyer_user_idTousers: {
            select: {
              company: true,
            },
          },
          users_orders_seller_user_idTousers: {
            select: {
              company: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
        take: limit,
        skip: offset,
      }),
    ]);

    const orderSummaries: OrderSummary[] = orders.map((order) => ({
      order_id: order.order_id,
      public_id: order.public_id,
      order_number: order.order_number ?? "",
      order_type: order.order_type as order_type,
      order_status: order.order_status!,
      total_amount: Number(order.total_amount),
      total_amount_currency: order.total_amount_currency as currency_code_type,
      buyer_company:
        order.users_orders_buyer_user_idTousers.company || undefined,
      seller_company:
        order.users_orders_seller_user_idTousers.company || undefined,
      payment_due_date: order.payment_due_date || undefined,
      created_at: order.created_at!,
    }));

    return {
      orders: orderSummaries,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        total_items: total,
        items_per_page: limit,
      },
    };
  }

  /**
   * Update order status
   */
  async updateOrderStatus(
    orderId: string,
    newStatus: order_status_type,
    changedByUserId: string,
    changeReason?: string,
    additionalData?: {
      shipping_date?: Date;
      delivery_date?: Date;
    }
  ): Promise<{
    success: boolean;
    error?: { code: string; message: string; details?: any };
  }> {
    try {
      // Determine if orderId is public_id or internal UUID
      let whereClause: any;
      if (orderId.length === 14) {
        whereClause = { public_id: orderId };
      } else {
        whereClause = { order_id: orderId };
      }

      return await this.prisma.$transaction(async (tx) => {
        // Get current order
        const currentOrder = await tx.orders.findUnique({
          where: whereClause,
          select: {
            order_id: true,
            order_status: true,
            buyer_user_id: true,
            seller_user_id: true,
          },
        });

        if (!currentOrder) {
          return {
            success: false,
            error: {
              code: "ORDER_NOT_FOUND",
              message: "Order not found",
            },
          };
        }

        // Check authorization
        if (
          changedByUserId !== currentOrder.buyer_user_id &&
          changedByUserId !== currentOrder.seller_user_id
        ) {
          return {
            success: false,
            error: {
              code: "UNAUTHORIZED",
              message: "You are not authorized to update this order status",
            },
          };
        }

        // Validate status transition
        const isValidTransition = this.isValidStatusTransition(
          currentOrder.order_status!,
          newStatus
        );

        if (!isValidTransition) {
          return {
            success: false,
            error: {
              code: "INVALID_STATUS_TRANSITION",
              message: `Cannot change order status from ${currentOrder.order_status} to ${newStatus}`,
              details: {
                current_status: currentOrder.order_status,
                requested_status: newStatus,
              },
            },
          };
        }

        // Update order
        const updateData: any = {
          order_status: newStatus,
          updated_at: new Date(),
        };

        if (additionalData?.shipping_date) {
          updateData.shipping_date = additionalData.shipping_date;
        }

        if (additionalData?.delivery_date) {
          updateData.delivery_date = additionalData.delivery_date;
        }

        await tx.orders.update({
          where: { order_id: currentOrder.order_id },
          data: updateData,
        });

        // Create status history record
        await tx.order_status_history.create({
          data: {
            orders: {
              connect: { order_id: currentOrder.order_id },
            },
            previous_status: currentOrder.order_status,
            new_status: newStatus,
            users: {
              connect: { user_id: changedByUserId },
            },
            change_reason: changeReason,
            timestamp: new Date(),
          },
        });

        return { success: true };
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An internal error occurred while updating order status",
          details: {
            error: error instanceof Error ? error.message : String(error),
          },
        },
      };
    }
  }

  /**
   * Get order analytics
   */
  async getOrderAnalytics(
    options: {
      buyer_user_id?: string;
      seller_user_id?: string;
      date_from?: Date;
      date_to?: Date;
    } = {}
  ): Promise<{
    total_orders: number;
    pending_orders: number;
    confirmed_orders: number;
    shipped_orders: number;
    delivered_orders: number;
    cancelled_orders: number;
    total_revenue: number;
    average_order_value: number;
    order_types: Array<{
      order_type: string;
      count: number;
      total_value: number;
    }>;
  }> {
    // Build where clause
    const whereClause: Prisma.ordersWhereInput = {};

    if (options.buyer_user_id) {
      whereClause.buyer_user_id = options.buyer_user_id;
    }

    if (options.seller_user_id) {
      whereClause.seller_user_id = options.seller_user_id;
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

    // Parallelize analytics queries
    const [totalOrders, statusCounts, revenueAggregation, orderTypeCounts] =
      await Promise.all([
        this.prisma.orders.count({ where: whereClause }),
        this.prisma.orders.groupBy({
          by: ["order_status"],
          where: whereClause,
          _count: true,
        }),
        this.prisma.orders.aggregate({
          where: whereClause,
          _sum: { total_amount: true },
          _avg: { total_amount: true },
        }),
        this.prisma.orders.groupBy({
          by: ["order_type"],
          where: whereClause,
          _count: true,
          _sum: { total_amount: true },
        }),
      ]);

    // Process status counts
    const statusMap = statusCounts.reduce(
      (acc, item) => {
        acc[item.order_status || "UNKNOWN"] = item._count;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      total_orders: totalOrders,
      pending_orders: statusMap.PENDING || 0,
      confirmed_orders: statusMap.CONFIRMED || 0,
      shipped_orders: statusMap.SHIPPED || 0,
      delivered_orders: statusMap.DELIVERED || 0,
      cancelled_orders: statusMap.CANCELLED || 0,
      total_revenue: Number(revenueAggregation._sum.total_amount || 0),
      average_order_value: Number(revenueAggregation._avg.total_amount || 0),
      order_types: orderTypeCounts.map((item) => ({
        order_type: item.order_type as string,
        count: item._count,
        total_value: Number(item._sum.total_amount || 0),
      })),
    };
  }

  /**
   * Format order details for response
   */
  private formatOrderDetails(order: OrderWithDetails): OrderDetails {
    // Format buyer info
    const buyerUser = order.users_orders_buyer_user_idTousers;
    const buyerInfo = {
      user_id: buyerUser.user_id,
      username: buyerUser.username,
      company: buyerUser.company || undefined,
      display_name:
        buyerUser.company ||
        `${buyerUser.first_name} ${buyerUser.last_name}`.trim() ||
        buyerUser.username,
      email: buyerUser.email,
    };

    // Format seller info
    const sellerUser = order.users_orders_seller_user_idTousers;
    const sellerInfo = {
      user_id: sellerUser.user_id,
      username: sellerUser.username,
      company: sellerUser.company || undefined,
      display_name:
        sellerUser.company ||
        `${sellerUser.first_name} ${sellerUser.last_name}`.trim() ||
        sellerUser.username,
    };

    // Format addresses
    const shippingAddress =
      order.addresses_orders_shipping_address_idToaddresses
        ? {
            address_public_id:
              order.addresses_orders_shipping_address_idToaddresses.public_id,
            company:
              order.addresses_orders_shipping_address_idToaddresses.company ||
              undefined,
            first_name:
              order.addresses_orders_shipping_address_idToaddresses
                .first_name || "",
            last_name:
              order.addresses_orders_shipping_address_idToaddresses.last_name ||
              "",
            address1:
              order.addresses_orders_shipping_address_idToaddresses.address1,
            address2:
              order.addresses_orders_shipping_address_idToaddresses.address2 ||
              undefined,
            city: order.addresses_orders_shipping_address_idToaddresses.city,
            province:
              order.addresses_orders_shipping_address_idToaddresses.province,
            country:
              order.addresses_orders_shipping_address_idToaddresses.country,
            zip: order.addresses_orders_shipping_address_idToaddresses.zip,
            phone:
              order.addresses_orders_shipping_address_idToaddresses.phone ||
              undefined,
          }
        : undefined;

    const billingAddress = order.addresses_orders_billing_address_idToaddresses
      ? {
          address_public_id:
            order.addresses_orders_billing_address_idToaddresses.public_id,
          company:
            order.addresses_orders_billing_address_idToaddresses.company ||
            undefined,
          first_name:
            order.addresses_orders_billing_address_idToaddresses.first_name ||
            "",
          last_name:
            order.addresses_orders_billing_address_idToaddresses.last_name ||
            "",
          address1:
            order.addresses_orders_billing_address_idToaddresses.address1,
          address2:
            order.addresses_orders_billing_address_idToaddresses.address2 ||
            undefined,
          city: order.addresses_orders_billing_address_idToaddresses.city,
          province:
            order.addresses_orders_billing_address_idToaddresses.province,
          country: order.addresses_orders_billing_address_idToaddresses.country,
          zip: order.addresses_orders_billing_address_idToaddresses.zip,
          phone:
            order.addresses_orders_billing_address_idToaddresses.phone ||
            undefined,
        }
      : undefined;

    // Format items
    const items: OrderItemDetails[] = order.order_items.map((item) => {
      let productInfo: OrderItemDetails["product_info"] = undefined;

      if (item.catalog_products) {
        productInfo = {
          title: item.catalog_products.title,
          brand_name: item.catalog_products.brands?.brand_name,
          sku: item.catalog_products.sku,
          description: item.catalog_products.description || undefined,
          default_image_url:
            item.catalog_products.default_image_url || undefined,
        };
      } else if (item.catalog_product_variants) {
        productInfo = {
          title:
            item.catalog_product_variants.title ||
            item.catalog_product_variants.catalog_products.title,
          brand_name:
            item.catalog_product_variants.catalog_products.brands?.brand_name,
          sku: item.catalog_product_variants.variant_sku,
          description:
            item.catalog_product_variants.description ||
            item.catalog_product_variants.catalog_products.description ||
            undefined,
          default_image_url:
            item.catalog_product_variants.default_image_url ||
            item.catalog_product_variants.catalog_products.default_image_url ||
            undefined,
        };
      } else if (item.auction_listing_product_manifests) {
        productInfo = {
          title: item.auction_listing_product_manifests.title,
          brand_name: item.auction_listing_product_manifests.brands?.brand_name,
          sku: item.auction_listing_product_manifests.sku,
          description:
            item.auction_listing_product_manifests.description || undefined,
        };
      }

      return {
        order_item_id: item.order_item_id,
        catalog_product_public_id: item.catalog_products?.public_id,
        catalog_product_variant_public_id:
          item.catalog_product_variants?.public_id,
        auction_manifest_id:
          item.auction_listing_product_manifest_id || undefined,
        final_negotiation_public_id: item.catalog_offer_negotiations?.public_id,
        quantity: item.quantity,
        unit_price: Number(item.unit_price),
        unit_price_currency: item.unit_price_currency as currency_code_type,
        total_price: Number(item.total_price),
        total_price_currency: item.total_price_currency as currency_code_type,
        product_info: productInfo,
      };
    });

    // Format payments
    const payments: OrderPaymentDetails[] = order.payments.map((payment) => ({
      payment_public_id: payment.public_id,
      payment_method: payment.payment_method as payment_method_type,
      payment_provider: payment.payment_provider || undefined,
      payment_provider_transaction_id:
        payment.payment_provider_transaction_id || undefined,
      payment_amount: Number(payment.payment_amount),
      payment_amount_currency:
        payment.payment_amount_currency as currency_code_type,
      payment_status: payment.payment_status!,
      payment_date: payment.payment_date || undefined,
      processed_at: payment.processed_at || undefined,
      created_at: payment.created_at!,
    }));

    // Format status history
    const statusHistory: OrderStatusHistoryDetails[] =
      order.order_status_history.map((history) => {
        const user = history.users;
        const displayName =
          user.company ||
          `${user.first_name} ${user.last_name}`.trim() ||
          user.username;

        return {
          previous_status: history.previous_status || undefined,
          new_status: history.new_status,
          changed_by_user_id: history.changed_by_user_id,
          changed_by_name: displayName,
          change_reason: history.change_reason || undefined,
          timestamp: history.timestamp!,
        };
      });

    return {
      order_id: order.order_id,
      public_id: order.public_id,
      order_number: order.order_number ?? "",
      seller_order_number: order.seller_order_number!,
      order_type: order.order_type as order_type,
      order_status: order.order_status!,
      total_amount: Number(order.total_amount),
      total_amount_currency: order.total_amount_currency as currency_code_type,
      shipping_cost: Number(order.shipping_cost || 0),
      shipping_cost_currency:
        order.shipping_cost_currency as currency_code_type,
      tax_amount: Number(order.tax_amount || 0),
      tax_amount_currency: order.tax_amount_currency as currency_code_type,
      payment_due_date: order.payment_due_date || undefined,
      shipping_date: order.shipping_date || undefined,
      delivery_date: order.delivery_date || undefined,
      created_at: order.created_at!,
      updated_at: order.updated_at || undefined,
      buyer_info: buyerInfo,
      seller_info: sellerInfo,
      shipping_address: shippingAddress,
      billing_address: billingAddress,
      catalog_offer: order.catalog_offers
        ? {
            catalog_offer_public_id: order.catalog_offers.public_id,
          }
        : undefined,
      auction_listing: order.auction_listings
        ? {
            auction_listing_public_id: order.auction_listings.public_id,
          }
        : undefined,
      items,
      payments,
      status_history: statusHistory,
    };
  }

  /**
   * Validate status transition
   */
  private isValidStatusTransition(
    currentStatus: order_status_type,
    newStatus: order_status_type
  ): boolean {
    const validTransitions: Record<order_status_type, order_status_type[]> = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["PAID", "CANCELLED"],
      PAID: ["SHIPPED", "CANCELLED"],
      SHIPPED: ["DELIVERED", "DISPUTED"],
      DELIVERED: ["DISPUTED"],
      CANCELLED: [], // Cannot transition from cancelled
      DISPUTED: ["DELIVERED", "CANCELLED"],
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }
}
