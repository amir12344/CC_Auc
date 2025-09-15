import { generateClient } from "aws-amplify/api";
import { getCurrentUser } from "aws-amplify/auth";

import type { Schema } from "@/amplify/data/resource";
import type {
  FindManyArgs,
  FindUniqueArgs,
} from "@/src/lib/prisma/PrismaQuery.type";
import { err, ok, type Result } from "@/src/shared/types/result";
import { formatBackendError } from "@/src/utils/error-utils";

import { isValidCurrency } from "../../auctions/services/auctionQueryService";
import type {
  CatalogListing,
  CatalogListingApiResponse,
  DetailedCatalogListing,
} from "../types/catalog";
import type { CombinedListing } from "../types/combined-listing";
import { getImageUrl as sharedGetImageUrl } from "./imageService";

/**
 * Get public URL for S3 image
 */
// Re-export to avoid breaking imports incrementally
export const getImageUrl = (s3Key: string): Promise<string | null> =>
  sharedGetImageUrl(s3Key);

/**
 * Transform API response to CatalogListing with S3 image processing
 */
export const transformApiResponseToCatalogListing = async (
  apiResponse: Partial<CatalogListing> & {
    public_id: string;
    shipping_window: number | null;
    catalog_listing_images: Array<{ images: { s3_key: string } }> | null;
    // Optional: minimal product/variant fields for card metrics
    catalog_products?: Array<{
      catalog_product_variants?: Array<{
        available_quantity: number;
        retail_price: number | string | null;
        offer_price: number | string | null;
      }>;
    }>;
  }
): Promise<CatalogListing> => {
  const images = apiResponse.catalog_listing_images;

  // Process all images and get processed URLs
  const processedImages = images
    ? await Promise.all(
        images.map(async (img) => ({
          images: {
            s3_key: img.images.s3_key,
            processed_url: (await getImageUrl(img.images.s3_key)) || "",
          },
        }))
      )
    : [];

  // Get first processed URL for image_url field
  const primaryImageUrl =
    processedImages.length > 0 ? processedImages[0].images.processed_url : "";

  // Compute card metrics if variant data is present (same formulas as detail page)
  let totalUnits = 0;
  let totalOffer = 0;
  let totalRetail = 0;
  if (apiResponse.catalog_products) {
    for (const product of apiResponse.catalog_products) {
      for (const variant of product.catalog_product_variants || []) {
        const qty = Number(variant.available_quantity) || 0;
        const offer =
          typeof variant.offer_price === "string"
            ? Number.parseFloat(variant.offer_price)
            : variant.offer_price || 0;
        const retail =
          typeof variant.retail_price === "string"
            ? Number.parseFloat(variant.retail_price)
            : variant.retail_price || 0;
        totalUnits += qty;
        if (offer > 0) totalOffer += offer * qty;
        if (retail > 0) totalRetail += retail * qty;
      }
    }
  }
  const msrpDiscountPercent =
    totalRetail > 0 ? ((totalRetail - totalOffer) / totalRetail) * 100 : 0;

  return {
    id: apiResponse.public_id,
    title: apiResponse.title || "",
    description: apiResponse.description ?? "No description available.",
    category: apiResponse.category ?? "Uncategorized",
    subcategory: apiResponse.subcategory || null,
    image_url: primaryImageUrl,
    lead_time_days: apiResponse.shipping_window,
    catalog_listing_images: processedImages,
    minimum_order_value: apiResponse.minimum_order_value || 0,
    // Attach optional metrics for cards
    total_units: totalUnits || undefined,
    msrp_discount_percent: totalRetail > 0 ? msrpDiscountPercent : undefined,
    listing_source: "catalog",
  };
};

/**
 * Transform API response to DetailedCatalogListing with S3 image processing for all image types
 */
export const transformApiResponseToDetailedCatalogListing = async (
  apiResponse: CatalogListingApiResponse
): Promise<DetailedCatalogListing> => {
  // Process catalog listing images
  const listingImages = apiResponse.catalog_listing_images
    ? await Promise.all(
        apiResponse.catalog_listing_images.map(async (img) => ({
          images: {
            s3_key: img.images.s3_key,
            processed_url: (await getImageUrl(img.images.s3_key)) || "",
          },
        }))
      )
    : [];

  // Process catalog products with their images and variants
  const catalogProducts = apiResponse.catalog_products
    ? await Promise.all(
        apiResponse.catalog_products.map(async (product) => {
          // Process product images
          const productImages = product.catalog_product_images
            ? await Promise.all(
                product.catalog_product_images.map(async (img) => ({
                  images: {
                    s3_key: img.images.s3_key,
                    processed_url: (await getImageUrl(img.images.s3_key)) || "",
                  },
                }))
              )
            : [];

          // Process product variants with their images
          const productVariants = product.catalog_product_variants
            ? await Promise.all(
                product.catalog_product_variants.map(async (variant) => {
                  // Process variant images
                  const variantImages = variant.catalog_product_variant_images
                    ? await Promise.all(
                        variant.catalog_product_variant_images.map(
                          async (img) => ({
                            images: {
                              s3_key: img.images.s3_key,
                              processed_url:
                                (await getImageUrl(img.images.s3_key)) || "",
                            },
                          })
                        )
                      )
                    : [];

                  return {
                    public_id: variant.public_id,
                    title: variant.title,
                    variant_name: variant.variant_name,
                    variant_sku: variant.variant_sku,
                    available_quantity: variant.available_quantity,
                    retail_price: variant.retail_price,
                    offer_price: variant.offer_price,
                    identifier: variant.identifier,
                    identifier_type: variant.identifier_type,
                    // Category/subcategory with fallback to product values
                    category: variant.category || product.category,
                    subcategory: variant.subcategory || product.subcategory,
                    packaging: variant.packaging,
                    product_condition: variant.product_condition,
                    catalog_product_variant_images: variantImages,
                  };
                })
              )
            : [];

          return {
            title: product.title,
            catalog_product_id: product.catalog_product_id,
            retail_price: product.retail_price,
            offer_price: product.offer_price,
            category: product.category,
            subcategory: product.subcategory,
            brands: product.brands,
            catalog_product_images: productImages,
            catalog_product_variants: productVariants,
          };
        })
      )
    : [];

  // Get first processed URL for image_url field
  const primaryImageUrl =
    listingImages.length > 0 ? listingImages[0].images.processed_url : "";

  // Return the detailed catalog listing with all processed images
  return {
    id: apiResponse.public_id,
    title: apiResponse.title || "",
    description: apiResponse.description ?? "No description available.",
    category: apiResponse.category ?? "Uncategorized",
    subcategory: apiResponse.subcategory || null,
    image_url: primaryImageUrl,
    shipping_window: apiResponse.shipping_window,
    minimum_order_value: (() => {
      // Convert string to number if needed, with proper validation
      if (typeof apiResponse.minimum_order_value === "string") {
        const parsed = Number(apiResponse.minimum_order_value);
        return Number.isNaN(parsed) ? 0 : parsed;
      }
      return apiResponse.minimum_order_value ?? 0;
    })(),
    packaging: apiResponse.packaging,
    addresses: apiResponse.addresses,
    catalog_listing_images: listingImages,
    catalog_products: catalogProducts.map((product) => ({
      title: product.title,
      catalog_product_id: product.catalog_product_id,
      retail_price: product.retail_price,
      offer_price: product.offer_price,
      category: product.category,
      subcategory: product.subcategory,
      brands: product.brands,
      catalog_product_images: product.catalog_product_images,
      catalog_product_variants: product.catalog_product_variants.map(
        (variant) => ({
          public_id: variant.public_id,
          title: variant.title,
          variant_name: variant.variant_name,
          variant_sku: variant.variant_sku,
          available_quantity: variant.available_quantity,
          retail_price: variant.retail_price,
          offer_price: variant.offer_price,
          identifier: variant.identifier,
          identifier_type: variant.identifier_type,
          category: variant.category,
          subcategory: variant.subcategory,
          packaging: variant.packaging,
          product_condition: variant.product_condition,
          catalog_product_variant_images:
            variant.catalog_product_variant_images,
        })
      ),
    })),
  };
};

/**
 * Fetch catalog listings (backwards compatible - no pagination)
 */
export const fetchCatalogListings = async (): Promise<CatalogListing[]> => {
  const result = await fetchCatalogListingsPaginated();
  return result.listings;
};

/**
 * Fetch ALL catalog listings with comprehensive fields for filtering
 * Used by catalog collection page to load all listings and apply client-side filters
 */
export const fetchAllCatalogListingsForFiltering = async (): Promise<{
  listings: CombinedListing[];
  total: number;
}> => {
  try {
    const client = generateClient<Schema>();
    type QueryDataInput = {
      modelName: "catalog_listings";
      operation: "findMany";
      query: string;
    };

    const query: FindManyArgs<"catalog_listings"> = {
      relationLoadStrategy: "join",
      where: { status: "ACTIVE" },
      select: {
        public_id: true,
        title: true,
        description: true,
        category: true,
        subcategory: true,
        minimum_order_value: true,
        catalog_listing_images: {
          select: {
            images: {
              select: {
                s3_key: true,
              },
            },
          },
        },
        shipping_window: true,
        // Additional fields needed for filtering
        listing_condition: true,
        packaging: true,
        is_private: true,
        addresses: {
          select: {
            city: true,
            province_code: true,
            country_code: true,
          },
        },
        catalog_products: {
          select: {
            brands: {
              select: {
                brand_name: true,
              },
            },
            // Minimal variant fields for card metrics
            catalog_product_variants: {
              select: {
                available_quantity: true,
                retail_price: true,
                offer_price: true,
              },
            },
          },
        },
      },
      // No pagination - fetch all for filtering
    };

    const input: QueryDataInput = {
      modelName: "catalog_listings",
      operation: "findMany",
      query: JSON.stringify(query),
    };
    const { data: result } = await client.queries.queryData(input);

    if (result) {
      const parsedData =
        typeof result === "string" ? JSON.parse(result) : result;

      if (Array.isArray(parsedData)) {
        type RawListing = {
          public_id: string;
          title: string;
          description: string | null;
          category: string | null;
          subcategory: string | null;
          minimum_order_value: number | null;
          catalog_listing_images: Array<{ images: { s3_key: string } }> | null;
          shipping_window: number | null;
          listing_condition?: string | null;
          packaging?: string | null;
          is_private?: boolean | null;
          addresses?: {
            city?: string | null;
            province_code?: string | null;
            country_code?: string | null;
          } | null;
          catalog_products?: Array<{
            brands?: { brand_name?: string | null } | null;
          }> | null;
        };

        const transformedListings: CombinedListing[] = (
          parsedData as RawListing[]
        ).map((listing) => {
          // Compute metrics from variants if present
          let totalUnits = 0;
          let totalOffer = 0;
          let totalRetail = 0;
          for (const product of listing.catalog_products || []) {
            const variants = (product as any).catalog_product_variants as
              | Array<{
                  available_quantity: number;
                  retail_price: number | string | null;
                  offer_price: number | string | null;
                }>
              | undefined;
            for (const v of variants || []) {
              const qty = Number(v.available_quantity) || 0;
              const offer =
                typeof v.offer_price === "string"
                  ? Number.parseFloat(v.offer_price)
                  : (v.offer_price as number) || 0;
              const retail =
                typeof v.retail_price === "string"
                  ? Number.parseFloat(v.retail_price)
                  : (v.retail_price as number) || 0;
              totalUnits += qty;
              if (offer > 0) totalOffer += offer * qty;
              if (retail > 0) totalRetail += retail * qty;
            }
          }
          const msrpPercent =
            totalRetail > 0
              ? ((totalRetail - totalOffer) / totalRetail) * 100
              : null;

          return {
            public_id: listing.public_id,
            title: listing.title,
            description: listing.description ?? "",
            category: listing.category ?? "",
            subcategory: listing.subcategory,
            minimum_order_value: listing.minimum_order_value ?? 0,
            images:
              listing.catalog_listing_images?.map((img) => ({
                s3_key: img.images.s3_key,
              })) || [],
            shipping_window: listing.shipping_window ?? null,
            listing_source: "catalog" as const,
            // Filter fields
            listing_condition: listing.listing_condition ?? null,
            packaging: listing.packaging ?? null,
            is_private: listing.is_private ?? null,
            addresses: listing.addresses
              ? {
                  city: listing.addresses.city ?? null,
                  province_code: listing.addresses.province_code ?? null,
                  country_code: listing.addresses.country_code ?? null,
                }
              : null,
            brands:
              listing.catalog_products?.map((product) => ({
                brand_name: (product as any).brands?.brand_name || null,
              })) || [],
            total_units: totalUnits || null,
            msrp_discount_percent: msrpPercent,
          };
        });

        return {
          listings: transformedListings,
          total: transformedListings.length,
        };
      }
    }
    return { listings: [], total: 0 };
  } catch (error) {
    return { listings: [], total: 0 };
  }
};

// Result<T> wrapper variant (opt-in for callers)
export const fetchAllCatalogListingsForFilteringResult = async (): Promise<
  Result<{ listings: CombinedListing[]; total: number }>
> => {
  try {
    const data = await fetchAllCatalogListingsForFiltering();
    return ok(data);
  } catch (e) {
    return err(formatBackendError(e));
  }
};

/**
 * Fetch catalog listings with pagination support
 */
export const fetchCatalogListingsPaginated = async (options?: {
  take?: number;
  skip?: number;
}): Promise<{
  listings: CatalogListing[];
  hasMore: boolean;
  total: number;
}> => {
  try {
    const client = generateClient<Schema>();
    type QueryDataInput = {
      modelName: "catalog_listings";
      operation: "findMany";
      query: string;
    };

    const query: FindManyArgs<"catalog_listings"> = {
      relationLoadStrategy: "join",
      where: { status: "ACTIVE" },
      select: {
        public_id: true,
        title: true,
        description: true,
        category: true,
        subcategory: true,
        minimum_order_value: true,
        catalog_listing_images: {
          select: {
            images: {
              select: {
                s3_key: true,
              },
            },
          },
        },
        shipping_window: true,
        // Add minimal variant fields to compute card metrics (units & % off MSRP)
        catalog_products: {
          select: {
            catalog_product_variants: {
              select: {
                available_quantity: true,
                retail_price: true,
                offer_price: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
      ...(options?.take && { take: options.take }),
      ...(options?.skip && { skip: options.skip }),
    };

    const input: QueryDataInput = {
      modelName: "catalog_listings",
      operation: "findMany",
      query: JSON.stringify(query),
    };

    const { data: result } = await client.queries.queryData(input);
    if (result) {
      const parsedData =
        typeof result === "string" ? JSON.parse(result) : result;
      if (Array.isArray(parsedData)) {
        const transformedListings = await Promise.all(
          parsedData.map((listing: any) =>
            transformApiResponseToCatalogListing(listing)
          )
        );

        // Calculate if there are more items
        const hasMore = options?.take
          ? parsedData.length === options.take
          : false;
        const total = parsedData.length; // This would ideally come from a separate count query

        return {
          listings: transformedListings,
          hasMore,
          total: options?.skip ? options.skip + total : total,
        };
      }
    }
    return { listings: [], hasMore: false, total: 0 };
  } catch {
    return { listings: [], hasMore: false, total: 0 };
  }
};

export const fetchCatalogListingsPaginatedResult = async (options?: {
  take?: number;
  skip?: number;
}): Promise<
  Result<{ listings: CatalogListing[]; hasMore: boolean; total: number }>
> => {
  try {
    const data = await fetchCatalogListingsPaginated(options);
    return ok(data);
  } catch (e) {
    return err(formatBackendError(e));
  }
};

export const fetchCatalogListingById = async (
  publicId: string
): Promise<DetailedCatalogListing | null> => {
  try {
    const client = generateClient<Schema>({ authMode: "apiKey" });

    type QueryDataInput = {
      modelName: "catalog_listings";
      operation: "findUnique";
      query: string;
    };

    const query: FindUniqueArgs<"catalog_listings"> = {
      relationLoadStrategy: "join",
      where: {
        public_id: publicId,
      },
      select: {
        public_id: true,
        title: true,
        description: true,
        category: true,
        subcategory: true,
        packaging: true,
        minimum_order_value: true,
        minimum_order_value_currency: true,
        addresses: {
          select: {
            province: true,
            country: true,
            city: true,
          },
        },
        catalog_listing_images: {
          select: {
            images: {
              select: {
                s3_key: true,
              },
            },
          },
        },
        shipping_window: true,
        catalog_products: {
          select: {
            catalog_product_id: true,
            title: true,
            retail_price: true,
            offer_price: true,
            category: true,
            subcategory: true,
            brands: {
              select: {
                brand_name: true,
              },
            },
            catalog_product_images: {
              select: {
                images: {
                  select: {
                    s3_key: true,
                  },
                },
              },
            },
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
                category: true,
                subcategory: true,
                packaging: true,
                product_condition: true,
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
        return transformApiResponseToDetailedCatalogListing(parsedData);
      }
    }
    return null;
  } catch {
    return null;
  }
};

export const fetchCatalogListingByIdResult = async (
  publicId: string
): Promise<Result<DetailedCatalogListing | null>> => {
  try {
    const data = await fetchCatalogListingById(publicId);
    return ok(data);
  } catch (e) {
    return err(formatBackendError(e));
  }
};

/**
 * Submit a catalog offer
 */
export const submitCatalogOffer = async (offerData: {
  catalogListingId: string;
  items: Array<{
    catalogProductVariantId: string;
    buyerOfferPrice: number;
    buyerOfferPriceCurrency?: string;
    requestedQuantity: number;
  }>;
}) => {
  try {
    const client = generateClient<Schema>({ authMode: "userPool" });
    const currentUser = await getCurrentUser();

    // Validate and ensure currency is supported for each item
    const processedItems = offerData.items.map((item) => ({
      catalogProductVariantId: item.catalogProductVariantId,
      buyerOfferPrice: item.buyerOfferPrice,
      buyerOfferPriceCurrency: isValidCurrency(item.buyerOfferPriceCurrency)
        ? item.buyerOfferPriceCurrency
        : "USD",
      requestedQuantity: item.requestedQuantity,
    }));

    const { data: result, errors: createErrors } =
      await client.queries.createCatalogOffer({
        catalogListingId: offerData.catalogListingId,
        cognitoId: currentUser.userId,
        items: processedItems,
      });

    // Handle errors with proper formatting to prevent sensitive data exposure
    if (createErrors) {
      const formattedError = formatBackendError(createErrors);
      return { data: null, errors: formattedError };
    }

    return { data: result, errors: null };
  } catch (error) {
    // Format any caught errors to prevent sensitive data exposure
    const formattedError = formatBackendError(error);
    return { data: null, errors: formattedError };
  }
};
