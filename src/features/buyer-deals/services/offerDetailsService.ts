import { generateClient } from "aws-amplify/api";

import type { Schema } from "@/amplify/data/resource";
import { getImageUrl } from "@/src/features/marketplace-catalog/services/catalogQueryService";
import type { FindManyArgs } from "@/src/lib/prisma/PrismaQuery.type";

import type {
  BuyerOfferDetails,
  BuyerOfferItem,
} from "../types/offer-details.types";

// Utility function to format display name for variants (simplified logic)
const formatVariantDisplayName = (
  productTitle: string,
  variantName?: string
): string => {
  if (
    !variantName ||
    variantName.toLowerCase() === "default" ||
    variantName.trim() === ""
  ) {
    return productTitle;
  }
  return `${productTitle} - ${variantName}`;
};

// Transform API response to BuyerOfferDetails
const transformApiResponseToBuyerOfferDetails = async (
  offerData: any // Using any for now to match existing patterns
): Promise<BuyerOfferDetails> => {
  // Get image URL for the main offer
  const imageUrl =
    offerData.catalog_listings.catalog_listing_images.length > 0
      ? await getImageUrl(
          offerData.catalog_listings.catalog_listing_images[0].images.s3_key
        )
      : "";

  // Parse the total_offer_value string to a number
  const totalOfferValue = Number.parseFloat(offerData.total_offer_value) || 0;

  // Transform offer items
  const offerItems: BuyerOfferItem[] = await Promise.all(
    offerData.catalog_offer_items.map(async (item: any) => {
      let itemImageUrl = "";
      let productTitle = "";
      let variantName = "";
      let variantSku = "";

      // Handle catalog product variants
      if (item.catalog_product_variants) {
        const variant = item.catalog_product_variants;
        // Use parent product title from variant if available
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

      // Fallback to catalog_products if no variant
      if (!productTitle && item.catalog_products) {
        productTitle = item.catalog_products.title;
        variantSku = item.catalog_products.sku;
      }

      // Calculate total price
      const unitPrice = Number.parseFloat(item.buyer_offer_price) || 0;
      const quantity = item.requested_quantity || 0;
      const totalPrice = unitPrice * quantity;

      return {
        id: item.catalog_offer_item_id,
        productTitle,
        variantName: formatVariantDisplayName(productTitle, variantName),
        variantSku,
        quantity,
        unitPrice,
        totalPrice,
        currency: item.buyer_offer_price_currency,
        imageUrl: itemImageUrl,
      };
    })
  );

  return {
    id: offerData.public_id,
    offerStatus: offerData.offer_status,
    totalOfferValue,
    currency: offerData.total_offer_value_currency,
    title: offerData.catalog_listings.title,
    description: offerData.catalog_listings.description,
    category: offerData.catalog_listings.category,
    imageUrl: imageUrl || "",
    createdAt: offerData.created_at || "",
    offerItems,
  };
};

// Fetch offer details by offer ID
export const fetchBuyerOfferDetails = async (
  offerId: string
): Promise<BuyerOfferDetails | null> => {
  try {
    const client = generateClient<Schema>();

    type QueryDataInput = {
      modelName: "catalog_offers";
      operation: "findFirst";
      query: string;
    };

    const query: FindManyArgs<"catalog_offers"> = {
      relationLoadStrategy: "join",
      where: {
        public_id: offerId,
      },
      select: {
        catalog_offer_id: true,
        public_id: true,
        offer_status: true,
        total_offer_value: true,
        total_offer_value_currency: true,
        created_at: true,
        catalog_listings: {
          select: {
            catalog_listing_id: true,
            public_id: true,
            title: true,
            description: true,
            category: true,
            catalog_listing_images: {
              select: {
                images: {
                  select: {
                    image_id: true,
                    s3_key: true,
                  },
                },
              },
            },
          },
        },
        catalog_offer_items: {
          select: {
            catalog_offer_item_id: true,
            requested_quantity: true,
            buyer_offer_price: true,
            buyer_offer_price_currency: true,
            catalog_product_variants: {
              select: {
                catalog_product_variant_id: true,
                variant_name: true,
                variant_sku: true,
                catalog_products: {
                  select: {
                    catalog_product_id: true,
                    title: true,
                    sku: true,
                  },
                },
                catalog_product_variant_images: {
                  select: {
                    images: {
                      select: {
                        image_id: true,
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
      modelName: "catalog_offers",
      operation: "findFirst",
      query: JSON.stringify(query),
    };

    const { data: result } = await client.queries.queryData(input);

    if (result) {
      const parsedData =
        typeof result === "string" ? JSON.parse(result) : result;
      if (parsedData) {
        return await transformApiResponseToBuyerOfferDetails(parsedData);
      }
    }

    return null;
  } catch {
    return null;
  }
};
