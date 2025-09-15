import { PrismaClient } from "../../lambda-layers/core-layer/nodejs/prisma/generated/client";
import { CatalogOfferData } from "../types/catalogOfferTypes";

export class CatalogOfferDataService {
  /**
   * Fetch complete catalog offer data by offer ID using Prisma
   */
  static async getCatalogOfferData(
    offerId: string, // Public id
    prismaClient: PrismaClient
  ): Promise<CatalogOfferData | null> {
    try {
      // Get the main catalog offer with only the needed fields using precise selects
      const offer = await prismaClient.catalog_offers.findUnique({
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
          current_round: true,
          created_at: true,
          updated_at: true,
          expires_at: true,
          offer_message: true,
          catalog_listings: {
            select: {
              catalog_listing_id: true,
              title: true,
              description: true,
              category: true,
              subcategory: true,
            },
          },
          buyer_profiles: {
            select: {
              buyer_profile_id: true,
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
          },
          seller_profiles: {
            select: {
              seller_profile_id: true,
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
          },
          catalog_offer_items: {
            select: {
              catalog_offer_item_id: true,
              public_id: true,
              requested_quantity: true,
              seller_offer_price: true,
              seller_offer_price_currency: true,
              buyer_offer_price: true,
              buyer_offer_price_currency: true,
              negotiation_status: true,
              item_status: true,
              final_agreed_price: true,
              final_agreed_price_currency: true,
              final_agreed_quantity: true,
              catalog_products: {
                select: {
                  catalog_product_id: true,
                  title: true,
                  category: true,
                  subcategory: true,
                  description: true,
                  brands: {
                    select: {
                      brand_name: true,
                    },
                  },
                },
              },
              catalog_product_variants: {
                select: {
                  catalog_product_variant_id: true,
                  variant_name: true,
                  variant_sku: true,
                  retail_price: true,
                  retail_price_currency: true,
                  packaging: true,
                  product_condition: true,
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
                    take: 1, // Only get the first image
                  },
                },
              },
            },
          },
        },
      });

      if (!offer) {
        console.error("Catalog offer not found:", offerId);
        return null;
      }

      // Transform the data to match our interface
      const items = offer.catalog_offer_items.map((item) => {
        const product = item.catalog_products;
        const variant = item.catalog_product_variants;

        return {
          itemId: item.catalog_offer_item_id,
          publicId: item.public_id,
          catalogProduct: {
            productId: product?.catalog_product_id || "",
            productName: product?.title || "",
            brandName: product?.brands?.brand_name || "",
            category: product?.category || "",
            subcategory: product?.subcategory || "",
            description: product?.description || "",
          },
          catalogProductVariant: variant
            ? {
                variantId: variant.catalog_product_variant_id,
                variantName: variant.variant_name || "",
                variantSku: variant.variant_sku || "",
                retailPrice: variant.retail_price
                  ? Number(variant.retail_price)
                  : undefined,
                currency: variant.retail_price_currency || "",
                packaging: variant.packaging || "",
                condition: variant.product_condition || "",
                identifier: variant.identifier || "",
                identifierType: variant.identifier_type || "",
                imageS3Key:
                  variant.catalog_product_variant_images[0]?.images?.s3_key ||
                  "",
              }
            : undefined,
          requestedQuantity: item.requested_quantity || 0,
          sellerOfferPrice: item.seller_offer_price
            ? Number(item.seller_offer_price)
            : undefined,
          sellerOfferPriceCurrency: item.seller_offer_price_currency || "",
          buyerOfferPrice: item.buyer_offer_price
            ? Number(item.buyer_offer_price)
            : undefined,
          buyerOfferPriceCurrency: item.buyer_offer_price_currency || "",
          negotiationStatus: item.negotiation_status || "",
          itemStatus: item.item_status || "",
          finalAgreedPrice: item.final_agreed_price
            ? Number(item.final_agreed_price)
            : undefined,
          finalAgreedPriceCurrency: item.final_agreed_price_currency || "",
          finalAgreedQuantity: item.final_agreed_quantity || undefined,
        };
      });

      return {
        offerId: offer.catalog_offer_id,
        publicId: offer.public_id,
        catalogListing: {
          catalogListingId: offer.catalog_listings.catalog_listing_id,
          title: offer.catalog_listings.title,
          description: offer.catalog_listings.description || "",
          category: offer.catalog_listings.category || "",
          subcategory: offer.catalog_listings.subcategory || "",
        },
        sellerInfo: {
          userId: offer.seller_profiles.users.user_id,
          email: offer.seller_profiles.users.email,
          name: `${offer.seller_profiles.users.first_name || ""} ${offer.seller_profiles.users.last_name || ""}`.trim(),
          profileId: offer.seller_profiles.seller_profile_id,
          companyName: offer.seller_profiles.users.company || "",
        },
        buyerInfo: {
          userId: offer.buyer_profiles.users.user_id,
          email: offer.buyer_profiles.users.email,
          name: `${offer.buyer_profiles.users.first_name || ""} ${offer.buyer_profiles.users.last_name || ""}`.trim(),
          profileId: offer.buyer_profiles.buyer_profile_id,
          companyName: offer.buyer_profiles.users.company || "",
        },
        offerStatus: offer.offer_status || "",
        totalOfferValue: offer.total_offer_value
          ? Number(offer.total_offer_value)
          : 0,
        totalOfferValueCurrency: offer.total_offer_value_currency || "",
        currentRound: offer.current_round || 1,
        createdAt: offer.created_at?.toISOString() || "",
        updatedAt: offer.updated_at?.toISOString() || "",
        expiresAt: offer.expires_at?.toISOString() || "",
        offerMessage: offer.offer_message || "",
        items,
      };
    } catch (error) {
      console.error("Error fetching catalog offer data:", error);
      return null;
    }
  }

  /**
   * Get offer data specifically formatted for email notifications
   */
  static async getOfferDataForNotification(
    offerId: string,
    prismaClient: PrismaClient
  ): Promise<{
    catalogTitle: string;
    offerAmount: number;
    currency: string;
    itemCount: number;
    buyerInfo: {
      userId: string;
      email: string;
      name: string;
    };
    sellerInfo: {
      userId: string;
      email: string;
      name: string;
    };
  } | null> {
    const offerData = await this.getCatalogOfferData(offerId, prismaClient);

    if (!offerData) {
      return null;
    }

    return {
      catalogTitle: offerData.catalogListing.title,
      offerAmount: offerData.totalOfferValue,
      currency: offerData.totalOfferValueCurrency,
      itemCount: offerData.items.length,
      buyerInfo: {
        userId: offerData.buyerInfo.userId,
        email: offerData.buyerInfo.email,
        name: offerData.buyerInfo.name,
      },
      sellerInfo: {
        userId: offerData.sellerInfo.userId,
        email: offerData.sellerInfo.email,
        name: offerData.sellerInfo.name,
      },
    };
  }
}
