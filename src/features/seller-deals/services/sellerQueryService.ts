import { getCurrentUser } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/data";
import { getUrl } from "aws-amplify/storage";

import type { Schema } from "@/amplify/data/resource";
import type {
  FindManyArgs,
  FindUniqueArgs,
} from "@/src/lib/prisma/PrismaQuery.type";
import { formatBackendError } from "@/src/utils/error-utils";

import type {
  CatalogListingVariant,
  CatalogListingVariantsData,
  CreateOrderPayload,
  CreateOrderResponse,
  OrderItemsData,
  SellerOffer,
  SellerOfferData,
  SellerOrderItem,
} from "../types";

// Simple error formatting helper
const formatError = (error: unknown): string => {
  if (error && typeof error === "object" && "message" in error) {
    return (error as { message: string }).message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unexpected error occurred";
};

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

// Transform API response to SellerOffer
const transformApiResponseToSellerOffer = async (
  offerData: SellerOfferData
): Promise<SellerOffer> => {
  const imageUrl =
    offerData.catalog_listings.catalog_listing_images.length > 0
      ? await getImageUrl(
          offerData.catalog_listings.catalog_listing_images[0].images.s3_key
        )
      : "";

  // Parse the total_offer_value string to a number, handle null values
  const totalOfferValue = offerData.total_offer_value
    ? Number.parseFloat(offerData.total_offer_value)
    : null;

  // Type-safe status conversion with case-insensitive mapping
  const validStatuses = [
    "pending",
    "accepted",
    "rejected",
    "expired",
    "cancelled",
  ] as const;

  // Convert API status to lowercase for comparison
  const normalizedStatus = offerData.offer_status?.toLowerCase();
  const offerStatus = validStatuses.includes(
    normalizedStatus as (typeof validStatuses)[number]
  )
    ? (normalizedStatus as SellerOffer["offerStatus"])
    : "pending";

  // Type-safe currency conversion
  const validCurrencies = ["USD", "EUR", "GBP", "CAD"] as const;
  const currency = validCurrencies.includes(
    offerData.total_offer_value_currency as (typeof validCurrencies)[number]
  )
    ? (offerData.total_offer_value_currency as SellerOffer["currency"])
    : "USD";

  // Extract shipping and billing address public IDs
  let shippingAddressPublicId: string | null = null;
  let billingAddressPublicId: string | null = null;

  if (offerData.users_catalog_offers_buyer_user_idTousers?.user_addresses) {
    for (const userAddress of offerData
      .users_catalog_offers_buyer_user_idTousers.user_addresses) {
      if (userAddress.address_type === "DEFAULT") {
        shippingAddressPublicId = userAddress.addresses.public_id;
      } else if (userAddress.address_type === "BILLING") {
        billingAddressPublicId = userAddress.addresses.public_id;
      }
    }
  }

  return {
    id: offerData.public_id,
    catalog_offer_id: offerData.catalog_offer_id,
    catalogListingPublicId: offerData.catalog_listings.public_id,
    offerStatus,
    totalOfferValue,
    currency,
    title: offerData.catalog_listings.title,
    description: offerData.catalog_listings.description,
    category: offerData.catalog_listings.category,
    imageUrl: imageUrl || "",
    buyerEmail:
      offerData.users_catalog_offers_buyer_user_idTousers?.email || "",
    shippingAddressPublicId,
    billingAddressPublicId,
  };
};

// Transform variant image URL from API response
const transformVariantImageUrl = async (
  variantImages: Array<{ images: { s3_key: string } }>
): Promise<string | null> => {
  if (variantImages.length === 0) {
    return null;
  }

  const firstImage = variantImages[0];
  return await getImageUrl(firstImage.images.s3_key);
};

// Transform API response to SellerOrderItem
const transformApiResponseToOrderItem = async (
  orderItemData: OrderItemsData["catalog_offer_items"][0]
): Promise<SellerOrderItem> => {
  const imageUrl = await transformVariantImageUrl(
    orderItemData.catalog_product_variants.catalog_product_variant_images
  );

  const productTitle =
    orderItemData.catalog_product_variants.catalog_products.title;
  const variantName = orderItemData.catalog_product_variants.variant_name;

  // Use product title when variant name is 'Default', otherwise combine with hyphen
  const displayVariantName =
    variantName === "Default"
      ? productTitle
      : `${productTitle} - ${variantName}`;

  return {
    variantId:
      orderItemData.catalog_product_variants.catalog_product_variant_id,
    catalogProductVariantPublicId:
      orderItemData.catalog_product_variants.public_id,
    variantName: displayVariantName,
    variantSku: orderItemData.catalog_product_variants.variant_sku,
    productTitle,
    imageUrl,
    requestedQuantity: orderItemData.requested_quantity,
    buyerOfferPrice: Number.parseFloat(orderItemData.buyer_offer_price) || 0,
    retailPrice: orderItemData.catalog_product_variants.retail_price
      ? Number.parseFloat(orderItemData.catalog_product_variants.retail_price)
      : undefined,
    currency: orderItemData.buyer_offer_price_currency,
    isBuyerSelection: true, // These are buyer selections from the API
    catalogOfferItemPublicId: orderItemData.public_id,
  };
};

// Transform catalog listing variants API response to CatalogListingVariant array
const transformApiResponseToCatalogListingVariants = async (
  listingData: CatalogListingVariantsData
): Promise<CatalogListingVariant[]> => {
  const variants: CatalogListingVariant[] = [];
  const imagePromises: Promise<string | null>[] = [];

  // Collect all image processing promises first
  for (const product of listingData.catalog_products) {
    for (const variant of product.catalog_product_variants) {
      imagePromises.push(
        transformVariantImageUrl(variant.catalog_product_variant_images)
      );
    }
  }

  // Wait for all image processing to complete
  const imageUrls = await Promise.all(imagePromises);

  // Now build the variants array with the resolved image URLs
  let imageIndex = 0;
  for (const product of listingData.catalog_products) {
    for (const variant of product.catalog_product_variants) {
      // Use product title when variant name is 'Default', otherwise combine with hyphen
      const displayVariantName =
        variant.variant_name === "Default"
          ? product.title
          : `${product.title} - ${variant.variant_name}`;

      variants.push({
        public_id: variant.public_id,
        title: variant.title,
        available_quantity: variant.available_quantity,
        retail_price: variant.retail_price,
        offer_price: variant.offer_price,
        variant_name: displayVariantName,
        variant_sku: variant.variant_sku,
        identifier: variant.identifier,
        identifier_type: variant.identifier_type,
        imageUrl: imageUrls[imageIndex],
        productTitle: product.title, // Add product title to the variant
      });
      imageIndex++;
    }
  }

  return variants;
};

// Fetch seller offers
export const fetchSellerOffers = async (): Promise<SellerOffer[]> => {
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
        catalog_offers_catalog_offers_seller_user_idTousers: {
          select: {
            users_catalog_offers_buyer_user_idTousers: {
              select: {
                email: true,
                user_addresses: {
                  select: {
                    address_type: true,
                    addresses: {
                      select: {
                        public_id: true,
                      },
                    },
                  },
                },
              },
            },
            public_id: true,
            offer_status: true,
            total_offer_value: true,
            total_offer_value_currency: true,
            catalog_offer_id: true,
            catalog_listings: {
              select: {
                public_id: true,
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

    const { data: result, errors } = await client.queries.queryData(input);

    // Handle GraphQL-style errors
    if (errors && errors.length > 0) {
      const errorMessages = errors.map((error) => {
        // Extract message from GraphQL error structure
        if (error && typeof error === "object" && "message" in error) {
          return (error as { message: string }).message;
        }
        return formatBackendError(error);
      });

      throw new Error(
        `Error fetching seller offers: ${errorMessages.join(", ")}`
      );
    }

    if (result) {
      const parsedData =
        typeof result === "string" ? JSON.parse(result) : result;
      // Data fetched successfully
      if (Array.isArray(parsedData)) {
        // Extract offers from the nested structure
        const allOffers: SellerOfferData[] = [];

        for (const userData of parsedData) {
          if (userData.catalog_offers_catalog_offers_seller_user_idTousers) {
            allOffers.push(
              ...userData.catalog_offers_catalog_offers_seller_user_idTousers
            );
          }
        }

        const sellerOffers = await Promise.all(
          allOffers.map(transformApiResponseToSellerOffer)
        );
        return sellerOffers;
      }
    }

    return [];
  } catch (error) {
    throw new Error(
      `Error fetching seller offers: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

// Fetch order items by offer ID
export const fetchOrderItemsByOfferId = async (
  offerId: string
): Promise<SellerOrderItem[]> => {
  if (!offerId || offerId.trim() === "") {
    return [];
  }

  try {
    const client = generateClient<Schema>();

    const query: FindUniqueArgs<"catalog_offers"> = {
      relationLoadStrategy: "join",
      where: {
        catalog_offer_id: offerId,
      },
      select: {
        offer_status: true,
        total_offer_value: true,
        total_offer_value_currency: true,
        catalog_offer_items: {
          select: {
            public_id: true,
            requested_quantity: true,
            buyer_offer_price: true,
            buyer_offer_price_currency: true,
            catalog_product_variants: {
              select: {
                catalog_products: {
                  select: {
                    title: true,
                  },
                },
                public_id: true,
                variant_name: true,
                variant_sku: true,
                retail_price: true,
                catalog_product_variant_id: true,
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
          },
        },
      },
    };

    const input = {
      modelName: "catalog_offers",
      operation: "findUnique",
      query: JSON.stringify(query),
    };

    const { data: result } = await client.queries.queryData(input);

    if (result) {
      const parsedData =
        typeof result === "string" ? JSON.parse(result) : result;

      // For findUnique operation, the response should be a single object, not an array
      const offerData = parsedData as OrderItemsData;

      if (offerData?.catalog_offer_items?.length > 0) {
        const orderItems = await Promise.all(
          offerData.catalog_offer_items.map(transformApiResponseToOrderItem)
        );
        return orderItems;
      }
    }

    return [];
  } catch (error) {
    throw new Error(
      `Error fetching order items: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

// Legacy function for backward compatibility - now calls the new function with a dynamic ID
export const fetchOrderItemsByBuyer = async (
  catalogOfferId?: string
): Promise<SellerOrderItem[]> => {
  const offerId = catalogOfferId || "";
  return await fetchOrderItemsByOfferId(offerId);
};

export const fetchCatalogListingsVariantsForCreateOrder = async (
  publicId: string
): Promise<CatalogListingVariant[]> => {
  try {
    const client = generateClient<Schema>();

    type QueryDataInput = {
      modelName: "catalog_listings";
      operation: "findUnique";
      query: string;
    };

    // Use the provided publicId in the query
    const query: FindUniqueArgs<"catalog_listings"> = {
      relationLoadStrategy: "join",
      where: {
        public_id: publicId,
      },
      select: {
        public_id: true,
        title: true,
        catalog_products: {
          select: {
            title: true,
            catalog_product_variants: {
              select: {
                public_id: true,
                title: true,
                available_quantity: true,
                retail_price: true,
                offer_price: true,
                variant_name: true,
                variant_sku: true,
                identifier: true,
                identifier_type: true,
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
          },
        },
      },
    };

    const input: QueryDataInput = {
      modelName: "catalog_listings",
      operation: "findUnique",
      query: JSON.stringify(query),
    };

    const { data: result } = await client.queries.queryData(input);

    if (result) {
      const parsedData =
        typeof result === "string" ? JSON.parse(result) : result;
      if (parsedData) {
        return await transformApiResponseToCatalogListingVariants(
          parsedData as CatalogListingVariantsData
        );
      }
    }

    return [];
  } catch (error) {
    throw new Error(
      `Error fetching catalog listing variants: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

/**
 * Create order from offer using modifyAndAcceptCatalogOffer API
 */
export const createOrderFromOffer = async (
  payload: CreateOrderPayload
): Promise<CreateOrderResponse> => {
  try {
    const client = generateClient<Schema>({ authMode: "userPool" });

    // Build API call payload - only include optional fields if they exist
    const apiPayload = {
      offerPublicId: payload.offerPublicId,
      autoCreateOrder: payload.autoCreateOrder,
      modifications: payload.modifications,
      ...(payload.shippingAddressPublicId && {
        shippingAddressPublicId: payload.shippingAddressPublicId,
      }),
      ...(payload.billingAddressPublicId && {
        billingAddressPublicId: payload.billingAddressPublicId,
      }),
      ...(payload.sellerMessage?.trim() && {
        sellerMessage: payload.sellerMessage,
      }),
      ...(payload.orderNotes?.trim() && { orderNotes: payload.orderNotes }),
    };

    const { data: result, errors } =
      await client.queries.modifyAndAcceptCatalogOffer(apiPayload);

    // Handle GraphQL-style errors in the errors array first
    if (errors && errors.length > 0) {
      const errorMessages = errors
        .map((error) => {
          // Handle GraphQL error structure with errorType
          if (error && typeof error === "object") {
            const errorObj = error as { errorType?: string; message?: string };

            // Check for authorization errors specifically
            if (
              "errorType" in errorObj &&
              errorObj.errorType === "Unauthorized"
            ) {
              return "You are not authorized to perform this action. Please check your permissions or contact support.";
            }

            // Extract message from standard GraphQL error structure
            if ("message" in errorObj) {
              return errorObj.message || "Unknown error";
            }
          }
          return formatBackendError(error);
        })
        .filter((msg): msg is string => typeof msg === "string");

      return {
        success: false,
        errors: errorMessages,
      };
    }

    if (!result) {
      return {
        success: false,
        errors: ["No response received from server"],
      };
    }

    // Parse the response - it can be either a string or already parsed object
    let parsedResult: any;

    if (typeof result === "string") {
      parsedResult = JSON.parse(result);
    } else {
      parsedResult = result;
    }

    // Handle the actual API response structure:
    // { "success": true, "data": {...}, "message": "Catalog offer successfully modified and auto-accepted" }

    // Check for explicit success: false in the response
    if (parsedResult?.success === false) {
      const errorMessage = parsedResult?.error
        ? formatError(parsedResult.error)
        : "Failed to create order";
      return {
        success: false,
        errors: [errorMessage],
      };
    }

    // Check if the response contains errors array
    if (
      parsedResult &&
      "errors" in parsedResult &&
      Array.isArray(parsedResult.errors)
    ) {
      const errorMessages = parsedResult.errors.map((error: unknown) => {
        if (error && typeof error === "object") {
          // Check for authorization errors specifically
          if ("errorType" in error && error.errorType === "Unauthorized") {
            return "You are not authorized to perform this action. Please check your permissions or contact support.";
          }

          // Extract message from GraphQL error structure
          if ("message" in error) {
            return error.message;
          }
        }
        return formatBackendError(error);
      });

      return {
        success: false,
        errors: errorMessages,
      };
    }

    // Success case - extract order ID and success message from the direct API response
    const orderId =
      parsedResult?.data?.order?.public_id ||
      parsedResult?.orderId ||
      parsedResult?.order_id ||
      "unknown";

    // Extract the success message directly from the API response
    const successMessage =
      parsedResult?.message || "Order created successfully";

    return {
      success: true,
      orderId,
      message: successMessage,
    };
  } catch (error) {
    const formattedError = formatError(error);
    return {
      success: false,
      errors: [formattedError],
    };
  }
};
