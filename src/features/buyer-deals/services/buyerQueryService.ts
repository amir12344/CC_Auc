import { generateClient } from "aws-amplify/api";
import { getCurrentUser } from "aws-amplify/auth";
import { getUrl } from "aws-amplify/storage";

import type { Schema } from "@/amplify/data/resource";
import type { FindManyArgs } from "@/src/lib/prisma/PrismaQuery.type";

import type {
  BuyerBid,
  BuyerBidData,
  BuyerOffer,
  BuyerOfferData,
  BuyerOrder,
  BuyerOrderData,
  BuyerOrderDetails,
  BuyerOrderDetailsData,
  BuyerOrderItem,
} from "../types";

// Get public URL for S3 image
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

// Transform API response to BuyerOffer
const transformApiResponseToBuyerOffer = async (
  offerData: BuyerOfferData
): Promise<BuyerOffer> => {
  const imageUrl =
    offerData.catalog_listings.catalog_listing_images.length > 0
      ? await getImageUrl(
          offerData.catalog_listings.catalog_listing_images[0].images.s3_key
        )
      : "";

  // Parse the total_offer_value string to a number
  const totalOfferValue = Number.parseFloat(offerData.total_offer_value) || 0;

  return {
    id: offerData.public_id,
    offerStatus: offerData.offer_status,
    totalOfferValue,
    currency: offerData.total_offer_value_currency,
    title: offerData.catalog_listings.title,
    description: offerData.catalog_listings.description,
    category: offerData.catalog_listings.category,
    imageUrl: imageUrl || "",
  };
};

// Fetch all offers
export const fetchBuyerOffers = async (): Promise<BuyerOffer[]> => {
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
        cognito_id: currentUser.userId,
      },
      select: {
        catalog_offers_catalog_offers_buyer_user_idTousers: {
          select: {
            public_id: true,
            offer_status: true,
            total_offer_value: true,
            total_offer_value_currency: true,
            catalog_listings: {
              select: {
                title: true,
                description: true,
                category: true,
                catalog_listing_images: {
                  select: {
                    images: {
                      select: {
                        s3_key: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      take: 10,
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
        // Extract offers from the nested structure
        const allOffers: BuyerOfferData[] = [];

        for (const userData of parsedData) {
          if (userData.catalog_offers_catalog_offers_buyer_user_idTousers) {
            allOffers.push(
              ...userData.catalog_offers_catalog_offers_buyer_user_idTousers
            );
          }
        }

        const buyerOffers = await Promise.all(
          allOffers.map(transformApiResponseToBuyerOffer)
        );
        return buyerOffers;
      }
    }

    return [];
  } catch {
    return [];
  }
};

// Fetch offers count only (optimized to use fetchBuyerDealsCounts)
export const fetchBuyerOffersCount = async (): Promise<number> => {
  const counts = await fetchBuyerDealsCounts();
  return counts.offers;
};

// Helper function to extract order listing details
const extractOrderListingDetails = async (orderData: BuyerOrderDetailsData) => {
  let title = "";
  let description = "";
  let category = "";
  let imageUrl = "";

  // Handle catalog offers
  if (orderData.catalog_offers?.catalog_listings) {
    const listing = orderData.catalog_offers.catalog_listings;
    title = listing.title;
    description = listing.description;
    category = listing.category;
    if (listing.catalog_listing_images.length > 0) {
      imageUrl =
        (await getImageUrl(listing.catalog_listing_images[0].images.s3_key)) ||
        "";
    }
  }

  // Handle auction listings
  if (orderData.auction_listings) {
    const listing = orderData.auction_listings;
    title = listing.title;
    description = listing.description;
    category = listing.category;
    if (listing.auction_listing_images.length > 0) {
      imageUrl =
        (await getImageUrl(listing.auction_listing_images[0].images.s3_key)) ||
        "";
    }
  }

  return { title, description, category, imageUrl };
};

// Helper function to transform a single order item
const transformOrderItem = async (
  item: BuyerOrderDetailsData["order_items"][0]
): Promise<BuyerOrderItem> => {
  let itemImageUrl = "";
  let productTitle = "";
  let variantName = "";
  let variantSku = "";

  if (item.catalog_products) {
    productTitle = item.catalog_products.title;
  }

  // Handle catalog product variants (now directly accessible)
  if (item.catalog_product_variants) {
    const variant = item.catalog_product_variants;
    // Use parent product title from variant if available, otherwise fallback to direct catalog_products
    if (variant.catalog_products) {
      productTitle = variant.catalog_products.title;
    }
    variantName = variant.variant_name;
    variantSku = variant.variant_sku;
    if (variant.catalog_product_variant_images.length > 0) {
      itemImageUrl =
        (await getImageUrl(
          variant.catalog_product_variant_images[0].images.s3_key
        )) || "";
    }
  }

  if (item.auction_listing_product_manifests) {
    const manifest = item.auction_listing_product_manifests;
    productTitle = manifest.title;
    variantSku = manifest.sku;
    // Check if auction_listings exists and has images
    if (
      manifest.auction_listings?.auction_listing_images &&
      manifest.auction_listings.auction_listing_images.length > 0
    ) {
      itemImageUrl =
        (await getImageUrl(
          manifest.auction_listings.auction_listing_images[0].images.s3_key
        )) || "";
    }
  }

  return {
    id: item.order_item_id,
    productTitle,
    variantName,
    variantSku,
    quantity: item.quantity,
    unitPrice: Number.parseFloat(item.unit_price) || 0,
    totalPrice: Number.parseFloat(item.total_price) || 0,
    currency: item.total_price_currency,
    imageUrl: itemImageUrl,
  };
};

// Helper function to format dates
const formatOrderDate = (dateString: string | null): string | undefined => {
  if (!dateString) {
    return;
  }
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Transform API response to BuyerOrderDetails
const transformApiResponseToBuyerOrderDetails = async (
  orderData: BuyerOrderDetailsData
): Promise<BuyerOrderDetails> => {
  const { title, description, category, imageUrl } =
    await extractOrderListingDetails(orderData);

  // Transform order items
  const orderItems: BuyerOrderItem[] = await Promise.all(
    orderData.order_items.map(transformOrderItem)
  );

  return {
    id: orderData.public_id,
    orderNumber: orderData.order_number,
    orderStatus: orderData.order_status,
    orderType: orderData.order_type,
    totalAmount: Number.parseFloat(orderData.total_amount) || 0,
    currency: orderData.total_amount_currency,
    shippingCost: orderData.shipping_cost
      ? Number.parseFloat(orderData.shipping_cost)
      : undefined,
    taxAmount: orderData.tax_amount
      ? Number.parseFloat(orderData.tax_amount)
      : undefined,
    paymentDueDate: formatOrderDate(orderData.payment_due_date || null),
    shippingDate: formatOrderDate(orderData.shipping_date || null),
    deliveryDate: formatOrderDate(orderData.delivery_date || null),
    orderDate: formatOrderDate(orderData.created_at) || "",
    title,
    description,
    category,
    imageUrl,
    orderItems,
  };
};

// Fetch order details by order ID
export const fetchBuyerOrderDetails = async (
  orderId: string
): Promise<BuyerOrderDetails | null> => {
  try {
    const client = generateClient<Schema>();

    type QueryDataInput = {
      modelName: "orders";
      operation: "findFirst";
      query: string;
    };

    const query: FindManyArgs<"orders"> = {
      relationLoadStrategy: "join",
      where: {
        public_id: orderId,
      },
      select: {
        public_id: true,
        order_number: true,
        order_status: true,
        order_type: true,
        total_amount: true,
        total_amount_currency: true,
        shipping_cost: true,
        tax_amount: true,
        payment_due_date: true,
        shipping_date: true,
        delivery_date: true,
        created_at: true,
        catalog_offers: {
          select: {
            catalog_listings: {
              select: {
                title: true,
                description: true,
                category: true,
                catalog_listing_images: {
                  select: {
                    images: {
                      select: {
                        s3_key: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        auction_listings: {
          select: {
            title: true,
            description: true,
            category: true,
            auction_listing_images: {
              select: {
                images: {
                  select: {
                    s3_key: true,
                  },
                },
              },
            },
          },
        },
        order_items: {
          select: {
            order_item_id: true,
            quantity: true,
            unit_price: true,
            total_price: true,
            total_price_currency: true,
            catalog_products: {
              select: {
                title: true,
                sku: true,
              },
            },
            catalog_product_variants: {
              select: {
                variant_name: true,
                variant_sku: true,
                catalog_products: {
                  select: {
                    title: true,
                    sku: true,
                  },
                },
                catalog_product_variant_images: {
                  select: {
                    images: {
                      select: {
                        s3_key: true,
                      },
                    },
                  },
                },
              },
            },
            auction_listing_product_manifests: {
              select: {
                title: true,
                sku: true,
                auction_listings: {
                  select: {
                    auction_listing_images: {
                      select: {
                        images: {
                          select: {
                            s3_key: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    };

    const input: QueryDataInput = {
      modelName: "orders",
      operation: "findFirst",
      query: JSON.stringify(query),
    };

    const { data: result } = await client.queries.queryData(input);

    if (result) {
      const parsedData =
        typeof result === "string" ? JSON.parse(result) : result;
      if (parsedData) {
        return await transformApiResponseToBuyerOrderDetails(
          parsedData as BuyerOrderDetailsData
        );
      }
    }

    return null;
  } catch {
    return null;
  }
};

// Transform API response to BuyerOrder
const transformApiResponseToBuyerOrder = async (
  orderData: BuyerOrderData
): Promise<BuyerOrder | null> => {
  try {
    // Handle null catalog_offers and auction_listings gracefully
    let imageUrl = "";
    let title = "Order";
    let description = "";
    let category = "";

    // Try to get data from catalog listings first
    if (orderData.catalog_offers?.catalog_listings) {
      const listings = orderData.catalog_offers.catalog_listings;

      // Safe image URL extraction from catalog
      if (listings.catalog_listing_images?.length > 0) {
        const firstImage = listings.catalog_listing_images[0];
        const s3Key = firstImage?.images?.s3_key;
        if (s3Key && typeof s3Key === "string") {
          imageUrl = (await getImageUrl(s3Key)) ?? "";
        }
      }

      // Safe property extraction from catalog
      title = listings.title || "Order";
      description = listings.description || "";
      category = listings.category || "";
    }
    // Fallback to auction data from order items if no catalog data
    else if (orderData.order_items && orderData.order_items.length > 0) {
      // Look for auction listing product manifests in order items
      for (const item of orderData.order_items) {
        if (item.auction_listing_product_manifests?.auction_listings) {
          const auctionListings =
            item.auction_listing_product_manifests.auction_listings;

          // Safe image URL extraction from auction
          if (auctionListings.auction_listing_images?.length > 0) {
            const firstImage = auctionListings.auction_listing_images[0];
            const s3Key = firstImage?.images?.s3_key;
            if (s3Key && typeof s3Key === "string") {
              imageUrl = (await getImageUrl(s3Key)) ?? "";
            }
          }

          // Safe property extraction from auction
          title =
            auctionListings.title ||
            item.auction_listing_product_manifests.title ||
            "Order";
          description = auctionListings.description || "";
          category = auctionListings.category || "";

          // Break after finding first auction item with data
          break;
        }
      }
    }

    // Parse the total_amount string to a number
    const totalAmount = Number.parseFloat(orderData.total_amount) || 0;

    // Extract variant name from order items for formatVariantDisplayName usage
    let variantName = "";

    if (orderData.order_items && orderData.order_items.length > 0) {
      const firstItem = orderData.order_items[0];

      if (firstItem?.catalog_product_variants) {
        variantName = firstItem.catalog_product_variants.variant_name || "";
      }
    }

    return {
      id: orderData.public_id,
      orderNumber: orderData.order_number,
      orderStatus: orderData.order_status,
      totalAmount,
      currency: orderData.total_amount_currency,
      orderDate: new Date(orderData.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      title,
      description,
      category,
      imageUrl: imageUrl || "",
      variantName,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to transform order data: ${error.message}`);
    }
    throw new Error(
      "An unexpected error occurred while transforming order data. Please try again."
    );
  }
};

// Fetch all orders
export const fetchBuyerOrders = async (): Promise<BuyerOrder[]> => {
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
        cognito_id: currentUser.userId,
      },
      select: {
        orders_orders_buyer_user_idTousers: {
          select: {
            public_id: true,
            order_number: true,
            order_status: true,
            total_amount: true,
            total_amount_currency: true,
            created_at: true,
            catalog_offers: {
              select: {
                catalog_listings: {
                  select: {
                    title: true,
                    description: true,
                    category: true,
                    catalog_listing_images: {
                      select: {
                        images: {
                          select: {
                            s3_key: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },

            order_items: {
              select: {
                catalog_products: {
                  select: {
                    title: true,
                    sku: true,
                  },
                },
                catalog_product_variants: {
                  select: {
                    variant_name: true,
                    variant_sku: true,
                    catalog_products: {
                      select: {
                        title: true,
                        sku: true,
                      },
                    },
                  },
                },
                auction_listing_product_manifests: {
                  select: {
                    title: true,
                    sku: true,
                    auction_listings: {
                      select: {
                        title: true,
                        description: true,
                        category: true,
                        auction_listing_images: {
                          select: {
                            images: {
                              select: {
                                s3_key: true,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      take: 40,
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
        // Extract orders from the nested structure
        const allOrders: BuyerOrderData[] = [];

        for (const userData of parsedData) {
          if (userData.orders_orders_buyer_user_idTousers) {
            allOrders.push(...userData.orders_orders_buyer_user_idTousers);
          }
        }

        const buyerOrders = await Promise.all(
          allOrders.map(transformApiResponseToBuyerOrder)
        );
        // Filter out null values from failed transformations
        return buyerOrders.filter(
          (order): order is BuyerOrder => order !== null
        );
      }
    }

    return [];
  } catch {
    return [];
  }
};

// Fetch both offers and orders counts in a single query
// Cache for user ID to avoid repeated getCurrentUser calls
let cachedUserId: string | null = null;
let userIdCacheTime = 0;
const USER_ID_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedUserId = async (): Promise<string> => {
  const now = Date.now();

  // Return cached user ID if still valid
  if (cachedUserId && now - userIdCacheTime < USER_ID_CACHE_DURATION) {
    return cachedUserId;
  }

  // Fetch fresh user ID
  const currentUser = await getCurrentUser();
  cachedUserId = currentUser.userId;
  userIdCacheTime = now;

  return cachedUserId;
};

export const fetchBuyerDealsCounts = async (): Promise<{
  offers: number;
  orders: number;
  bids: number;
}> => {
  try {
    const client = generateClient<Schema>();
    const userId = await getCachedUserId();

    type QueryDataInput = {
      modelName: "users";
      operation: "findMany";
      query: string;
    };

    // Optimized query with minimal data selection
    const query: FindManyArgs<"users"> = {
      where: {
        cognito_id: userId,
      },
      select: {
        _count: {
          select: {
            catalog_offers_catalog_offers_buyer_user_idTousers: true,
            orders_orders_buyer_user_idTousers: true,
            auction_bids_auction_bids_bidder_user_idTousers: true,
          },
        },
      },
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
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        const counts = parsedData[0]._count;
        return {
          offers:
            counts?.catalog_offers_catalog_offers_buyer_user_idTousers || 0,
          orders: counts?.orders_orders_buyer_user_idTousers || 0,
          bids: counts?.auction_bids_auction_bids_bidder_user_idTousers || 0,
        };
      }
    }

    return { offers: 0, orders: 0, bids: 0 };
  } catch (error) {
    return { offers: 0, orders: 0, bids: 0 };
  }
};

// Transform API response to BuyerBid
const transformApiResponseToBuyerBid = async (
  bidData: BuyerBidData,
  bidHistoryData: Array<{
    action_type: string;
    timestamp: string;
    auction_listing_id: string;
  }> = []
): Promise<BuyerBid> => {
  const imageUrl =
    bidData.auction_listings.auction_listing_images.length > 0
      ? await getImageUrl(
          bidData.auction_listings.auction_listing_images[0].images.s3_key
        )
      : "";

  // Parse the bid_amount string to a number
  const bidAmount = Number.parseFloat(bidData.bid_amount) || 0;

  // Get the auction_listing_id from the bid data
  const auctionListingId =
    (bidData as any).auction_listing_id ||
    bidData.auction_listings.auction_listing_id;

  // Find the latest action_type for this specific auction listing
  const relevantHistoryEntries = bidHistoryData
    .filter((entry) => entry.auction_listing_id === auctionListingId)
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

  const latestActionType =
    relevantHistoryEntries.length > 0
      ? relevantHistoryEntries[0].action_type
      : undefined;

  return {
    id: bidData.public_id,
    bidAmount,
    currency: bidData.bid_amount_currency,
    bidTimestamp: bidData.bid_timestamp,
    isWinningBid: bidData.is_winning_bid,
    title: bidData.auction_listings.title,
    description: bidData.auction_listings.description,
    category: bidData.auction_listings.category,
    imageUrl: imageUrl || "",
    auctionStatus: bidData.auction_listings.auction_status,
    auctionEndTime: bidData.auction_listings.auction_end_time || "",
    // carry through listing id for grouping
    listingId: auctionListingId || undefined,
    // Include the latest action_type from auction_bid_history
    actionType: latestActionType,
  };
};

// Fetch all bids
export const fetchBuyerBids = async (): Promise<BuyerBid[]> => {
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
        cognito_id: currentUser.userId,
      },
      select: {
        auction_bids_auction_bids_bidder_user_idTousers: {
          select: {
            public_id: true,
            bid_amount: true,
            bid_amount_currency: true,
            bid_timestamp: true,
            is_winning_bid: true,
            auction_listing_id: true,
            auction_listings: {
              select: {
                auction_listing_id: true,
                title: true,
                description: true,
                category: true,
                auction_status: true,
                auction_end_time: true,
                auction_listing_images: {
                  select: {
                    images: {
                      select: {
                        s3_key: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        auction_bid_history: {
          select: {
            action_type: true,
            timestamp: true,
            auction_listing_id: true,
          },
          where: {
            users: {
              cognito_id: currentUser.userId,
            },
          },
          orderBy: {
            timestamp: "desc",
          },
        },
      },
      take: 50,
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
      if (
        Array.isArray(parsedData) &&
        parsedData.length > 0 &&
        parsedData[0].auction_bids_auction_bids_bidder_user_idTousers
      ) {
        const bidsData =
          parsedData[0].auction_bids_auction_bids_bidder_user_idTousers;
        const bidHistoryData = parsedData[0].auction_bid_history || [];

        const transformedBids = await Promise.all(
          bidsData.map((bid: BuyerBidData) =>
            transformApiResponseToBuyerBid(bid, bidHistoryData)
          )
        ).catch((transformError) => {
          throw new Error("Failed to process bid data. Please try again.");
        });
        return transformedBids;
      }
    }

    return [];
  } catch (error) {
    return [];
  }
};

// Fetch bids count only (optimized to use fetchBuyerDealsCounts)
export const fetchBuyerBidsCount = async (): Promise<number> => {
  const counts = await fetchBuyerDealsCounts();
  return counts.bids;
};

// Fetch orders count only (optimized to use fetchBuyerDealsCounts)
export const fetchBuyerOrdersCount = async (): Promise<number> => {
  const counts = await fetchBuyerDealsCounts();
  return counts.orders;
};
