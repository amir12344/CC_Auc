import type { CatalogListing } from "../types/catalog";

export async function mapApiToCatalogListing(
  apiResponse: Partial<CatalogListing> & {
    public_id: string;
    shipping_window: number | null;
    catalog_listing_images: Array<{ images: { s3_key: string } }> | null;
    listing_condition?: string | null;
    packaging?: string | null;
    is_private?: boolean | null;
    addresses?: {
      city?: string | null;
      province?: string | null;
      province_code?: string | null;
      country?: string | null;
      country_code?: string | null;
    } | null;
    catalog_products?: Array<{
      brands?: { brand_name?: string | null } | null;
      catalog_product_variants?: Array<{
        available_quantity: number;
        retail_price: number | string | null;
        offer_price: number | string | null;
      }>;
    }> | null;
  },
  getImageUrl: (s3Key: string) => Promise<string | null>
): Promise<CatalogListing> {
  const images = apiResponse.catalog_listing_images;
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

  const primaryImageUrl =
    processedImages.length > 0 ? processedImages[0].images.processed_url : "";

  // Compute optional metrics using the same formulas as detail page
  let totalUnits = 0;
  let totalOffer = 0;
  let totalRetail = 0;
  if (apiResponse.catalog_products) {
    for (const product of apiResponse.catalog_products) {
      const productOfferFallback =
        typeof (product as any).offer_price === "string"
          ? Number.parseFloat((product as any).offer_price)
          : ((product as any).offer_price as number) || 0;
      const productRetailFallback =
        typeof (product as any).retail_price === "string"
          ? Number.parseFloat((product as any).retail_price)
          : ((product as any).retail_price as number) || 0;

      for (const variant of product.catalog_product_variants || []) {
        const qty = Number(variant.available_quantity) || 0;
        const offerRaw =
          typeof variant.offer_price === "string"
            ? Number.parseFloat(variant.offer_price)
            : (variant.offer_price as number) || 0;
        const retailRaw =
          typeof variant.retail_price === "string"
            ? Number.parseFloat(variant.retail_price)
            : (variant.retail_price as number) || 0;

        const offer = offerRaw > 0 ? offerRaw : productOfferFallback;
        const retail = retailRaw > 0 ? retailRaw : productRetailFallback;

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
    listing_condition: apiResponse.listing_condition || null,
    packaging: apiResponse.packaging || null,
    is_private: apiResponse.is_private || null,
    addresses: apiResponse.addresses || null,
    brands:
      apiResponse.catalog_products?.map((p) => ({
        brand_name: p?.brands?.brand_name || null,
      })) || [],
    total_units: totalUnits,
    msrp_discount_percent: totalRetail > 0 ? msrpDiscountPercent : undefined,
    listing_source: "catalog",
  };
}
