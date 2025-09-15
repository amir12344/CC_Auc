/**
 * CATALOG TO OFFER TRANSFORM UTILITIES
 *
 * Transforms catalog API data to offer management structures.
 * Handles proper ID mapping, image extraction, and data consistency.
 *
 * Data Flow: Catalog API → Transform Functions → Redux Store → UI Components
 */
import type {
  CatalogContext,
  CatalogProduct,
  CatalogProductVariant,
  EnhancedProduct,
  ExtractedImages,
  OfferCartItem,
  OfferVariant,
  TransformResult,
} from "@/src/features/offer-management/types";

import type { DetailedCatalogListing } from "../types/catalog";

/**
 * CONSISTENT IMAGE EXTRACTION
 *
 * Extracts all three types of images consistently across all operations.
 * This ensures both manual and bulk operations produce the same image results.
 *
 * @param catalogListing - Main catalog listing data
 * @param product - Individual catalog product
 * @param variant - Product variant (optional)
 * @returns Object with all available image URLs
 */
export const extractImages = (
  catalogListing: DetailedCatalogListing,
  product: CatalogProduct,
  variant?: CatalogProductVariant
): ExtractedImages => {
  return {
    // Catalog listing image (top-level)
    listingImage:
      catalogListing.catalog_listing_images?.[0]?.images?.processed_url ||
      undefined,

    // Product image (from product images)
    productImage:
      product.catalog_product_images?.[0]?.images?.processed_url || undefined,

    // Variant image (from specific variant)
    variantImage:
      variant?.catalog_product_variant_images?.[0]?.images?.processed_url ||
      undefined,
  };
};

/**
 * CALCULATE PRICING FROM API DATA
 *
 * Calculates pricing values using actual API fields.
 * Handles null values and string values, providing proper fallbacks.
 *
 * @param retailPrice - retail_price from API (MSRP) - can be string or number
 * @param offerPrice - offer_price from API (buyer price PER UNIT) - can be string or number
 * @returns Object with calculated pricing values
 */
const calculatePricing = (
  retailPrice: number | string | null,
  offerPrice: number | string | null
) => {
  // Convert string prices to numbers, handle null values
  const msrp = retailPrice ? Number(retailPrice) : 0;
  const buyerPrice = offerPrice ? Number(offerPrice) : 0;

  // Validate that the conversion was successful
  const validMsrp = Number.isNaN(msrp) ? 0 : msrp;
  const validBuyerPrice = Number.isNaN(buyerPrice) ? 0 : buyerPrice;

  // offer_price from API is already price per unit, not total price
  const pricePerUnit = validBuyerPrice;

  return {
    retailPrice: validMsrp,
    offerPrice: validBuyerPrice,
    pricePerUnit,
  };
};

/**
 * TRANSFORM CATALOG PRODUCT TO OFFER VARIANTS
 *
 * Transforms a single catalog product and its variants to OfferVariant format.
 * Uses actual API IDs and proper pricing calculations.
 *
 * @param catalogListing - Main catalog listing data
 * @param product - Catalog product data from API
 * @returns Array of OfferVariant objects for BuildOfferModal
 */
export const transformCatalogProductToOfferVariants = (
  catalogListing: DetailedCatalogListing,
  product: CatalogProduct
): OfferVariant[] => {
  try {
    const variants = product.catalog_product_variants || [];

    if (variants.length === 0) {
      // Create single variant from product data if no variants exist
      const pricing = calculatePricing(
        product.retail_price,
        product.offer_price
      );

      const images = extractImages(catalogListing, product);

      return [
        {
          catalogProductId: product.catalog_product_id,
          variantSku: `${product.catalog_product_id}-default`, // Generate SKU for products without variants
          variantId: `${product.catalog_product_id}-default`, // Generate SKU for products without variants
          name: product.title || "Default Variant",
          title: product.title || "Default Variant",
          retailPrice: pricing.retailPrice,
          offerPrice: pricing.offerPrice,
          pricePerUnit: pricing.pricePerUnit,
          totalUnits: 100, // Default quantity
          availableQuantity: 100,
          checked: false,
          image: images.productImage, // Only use actual product image, no fallbacks

          // Brand information from product
          brandName: product.brands?.brand_name || undefined,

          // Additional variant information (null for default variant)
          identifier: null,
          identifier_type: null,
          // Use product category/subcategory as fallback
          category: product.category || null,
          subcategory: product.subcategory || null,
          packaging: null,
          product_condition: null,

          // Legacy fields for backward compatibility
          id: `${product.catalog_product_id}-default`,
          totalPrice: pricing.offerPrice,
        },
      ];
    }

    // Transform each variant
    return variants.map((variant: CatalogProductVariant) => {
      const pricing = calculatePricing(
        variant.retail_price,
        variant.offer_price
      );

      const images = extractImages(catalogListing, product, variant);

      // Use variant_name or title for display
      const displayName = variant.variant_name || variant.title || "Variant";

      return {
        catalogProductId: product.catalog_product_id,
        variantSku: variant.variant_sku, // Use actual SKU from API
        variantId: variant.public_id, // Use actual SKU from API
        name: displayName,
        title: variant.title,
        retailPrice: pricing.retailPrice,
        offerPrice: pricing.offerPrice,
        pricePerUnit: pricing.pricePerUnit,
        totalUnits: variant.available_quantity,
        availableQuantity: variant.available_quantity,
        checked: false,
        image: images.variantImage, // Only use actual variant image, no fallbacks

        // Brand information from product (variants don't have brands, inherit from product)
        brandName: product.brands?.brand_name || undefined,

        // Additional variant information from API with fallback logic
        identifier: variant.identifier || null,
        identifier_type: variant.identifier_type || null,
        // CRITICAL: Category/subcategory fallback logic - use variant first, then product
        category: variant.category || product.category || null,
        subcategory: variant.subcategory || product.subcategory || null,
        packaging: variant.packaging || null,
        product_condition: variant.product_condition || null,

        // Legacy fields for backward compatibility
        id: `${product.catalog_product_id}-${variant.variant_sku}`,
        totalPrice: pricing.offerPrice,
      };
    });
  } catch {
    // Return fallback variant
    return [
      {
        catalogProductId: product.catalog_product_id,
        variantSku: `${product.catalog_product_id}-error`,
        variantId: `${product.catalog_product_id}-error`,
        name: "Product Variant",
        title: "Product Variant",
        retailPrice: 0,
        offerPrice: 0,
        pricePerUnit: 0,
        totalUnits: 0,
        availableQuantity: 0,
        checked: false,
        image: undefined,

        // Brand information (null for error fallback)
        brandName: undefined,

        // Additional variant information (null for error fallback)
        identifier: null,
        identifier_type: null,
        category: null,
        subcategory: null,
        packaging: null,
        product_condition: null,

        // Legacy fields for backward compatibility
        id: `${product.catalog_product_id}-error`,
        totalPrice: 0,
      },
    ];
  }
};

/**
 * TRANSFORM ENHANCED PRODUCT TO OFFER VARIANTS
 *
 * Transforms enhanced product data (from CatalogProductsTable) to offer variants.
 * This function bridges the gap between table display and offer management.
 *
 * @param enhancedProduct - Enhanced product data from CatalogProductsTable
 * @param catalogListing - Main catalog listing data for image extraction
 * @returns Array of OfferVariant objects
 */
export const transformEnhancedProductToOfferVariants = (
  enhancedProduct: EnhancedProduct,
  catalogListing: DetailedCatalogListing
): OfferVariant[] => {
  try {
    return transformCatalogProductToOfferVariants(
      catalogListing,
      enhancedProduct.originalProduct
    );
  } catch {
    // Return fallback variant using enhanced product data
    return [
      {
        catalogProductId: enhancedProduct.catalogProductId,
        variantSku: `${enhancedProduct.catalogProductId}-fallback`,
        variantId: `${enhancedProduct.catalogProductId}-fallback`,
        name: enhancedProduct.productName || "Product Variant",
        title: enhancedProduct.productName || "Product Variant",
        retailPrice: enhancedProduct.retailPrice,
        offerPrice: enhancedProduct.offerPrice,
        pricePerUnit: enhancedProduct.offerPrice,
        totalUnits: enhancedProduct.totalUnits,
        availableQuantity: enhancedProduct.totalUnits,
        checked: false,
        image: enhancedProduct.imageUrl,

        // Additional variant information
        identifier: null,
        identifier_type: null,
        category: null,
        subcategory: null,
        packaging: null,
        product_condition: null,

        // Legacy fields
        id: `${enhancedProduct.catalogProductId}-fallback`,
        totalPrice: enhancedProduct.totalPrice,
      },
    ];
  }
};

/**
 * TRANSFORM OFFER VARIANT TO CART ITEM
 *
 * Transforms a selected OfferVariant to OfferCartItem for the summary sheet.
 * Includes all three image types and proper API-based IDs.
 *
 * @param variant - Selected OfferVariant
 * @param productName - Product name for display
 * @param images - Extracted images
 * @param selectedQuantity - User-selected quantity
 * @returns OfferCartItem for the summary sheet
 */
export const transformOfferVariantToCartItem = (
  variant: OfferVariant,
  productName: string,
  images: ExtractedImages,
  selectedQuantity: number
): OfferCartItem => {
  const totalPrice = variant.pricePerUnit * selectedQuantity;

  return {
    catalogProductId: variant.catalogProductId,
    variantSku: variant.variantSku,
    variantId: variant.variantId,
    productName,
    variantName: variant.name,
    retailPrice: variant.retailPrice,
    offerPrice: variant.offerPrice,
    pricePerUnit: variant.pricePerUnit,
    selectedQuantity,
    availableQuantity: variant.availableQuantity,
    totalPrice,

    // All three image types
    listingImage: images.listingImage,
    productImage: images.productImage,
    variantImage: images.variantImage,

    // Brand information
    brandName: variant.brandName,

    // New fields from variant data
    identifier: variant.identifier || null,
    identifier_type: variant.identifier_type || null,
    category: variant.category || null,
    subcategory: variant.subcategory || null,
    packaging: variant.packaging || null,
    product_condition: variant.product_condition || null,

    // Legacy fields for backward compatibility
    productId: variant.catalogProductId,
    quantity: selectedQuantity,
    msrp: variant.retailPrice,
    totalUnits: selectedQuantity,
  };
};

/**
 * TRANSFORM CATALOG PRODUCT TO ENHANCED PRODUCT
 *
 * Transforms raw catalog product data to enhanced format for table display.
 * Uses actual API IDs and proper calculations.
 *
 * @param catalogListing - Main catalog listing data
 * @param product - Catalog product data from API
 * @returns EnhancedProduct for CatalogProductsTable
 */
export const transformCatalogProductToEnhanced = (
  catalogListing: DetailedCatalogListing,
  product: CatalogProduct
): EnhancedProduct => {
  try {
    const variants = product.catalog_product_variants || [];
    const images = extractImages(catalogListing, product);

    // Calculate totals using the new formula: total units × average offer price
    let totalUnits = 0;
    let totalWeightedOfferPrice = 0;

    for (const variant of variants) {
      const variantUnits = Number(variant.available_quantity) || 0;
      const variantOfferPrice = Number(variant.offer_price) || 0;

      totalUnits += variantUnits;
      totalWeightedOfferPrice += variantOfferPrice * variantUnits;
    }

    // Calculate weighted average offer price per unit
    const avgOfferPrice =
      totalUnits > 0 ? totalWeightedOfferPrice / totalUnits : 0;

    // Use product-level pricing as fallback, convert strings to numbers
    const retailPrice = product.retail_price ? Number(product.retail_price) : 0;
    const offerPrice =
      avgOfferPrice || (product.offer_price ? Number(product.offer_price) : 0);

    // Formula: total units × average offer price
    const totalPrice = totalUnits * avgOfferPrice;

    return {
      catalogProductId: product.catalog_product_id,
      productName: product.title,
      brandName: product.brands?.brand_name || undefined,
      variants: variants.length,
      retailPrice,
      offerPrice,
      totalUnits,
      totalPrice,
      imageUrl: images.productImage || "", // Only use actual product image, no fallbacks
      originalProduct: product,

      // Legacy field for backward compatibility
      id: product.catalog_product_id,
    };
  } catch {
    // Return fallback enhanced product
    return {
      catalogProductId: product.catalog_product_id,
      productName: product.title,
      brandName: product.brands?.brand_name || undefined,
      variants: 0,
      retailPrice: 0,
      offerPrice: 0,
      totalUnits: 0,
      totalPrice: 0,
      imageUrl: "",
      originalProduct: product,
      id: product.catalog_product_id,
    };
  }
};

/**
 * TRANSFORM COMPLETE OFFER DATA
 *
 * Transforms enhanced product data to complete offer data including variants and stats.
 * This is the comprehensive transform function for the BuildOfferModal.
 *
 * @param enhancedProduct - Enhanced product data
 * @param catalogListing - Main catalog listing data
 * @returns Complete TransformResult with variants, images, and stats
 */
export const transformEnhancedProductToOfferData = (
  enhancedProduct: EnhancedProduct,
  catalogListing: DetailedCatalogListing
): TransformResult => {
  try {
    const variants = transformEnhancedProductToOfferVariants(
      enhancedProduct,
      catalogListing
    );
    const images = extractImages(
      catalogListing,
      enhancedProduct.originalProduct
    );

    const productStats = {
      upc: "N/A", // Not available in catalog data
      asin: "N/A", // Not available in catalog data
      retailPrice: `$${(Number(enhancedProduct.retailPrice) || 0).toFixed(2)}`,
      totalUnits: (enhancedProduct.totalUnits || 0).toString(),
      variantCount: (enhancedProduct.variants || 0).toString(),
    };

    return {
      variants,
      images,
      productStats,
    };
  } catch {
    // Return fallback data
    return {
      variants: [],
      images: {
        listingImage: undefined,
        productImage: undefined,
        variantImage: undefined,
      },
      productStats: {
        upc: "N/A",
        asin: "N/A",
        retailPrice: "$0.00",
        totalUnits: "0",
        variantCount: "0",
      },
    };
  }
};

/**
 * BATCH TRANSFORM FOR BULK OPERATIONS
 *
 * Transforms multiple products to offer cart items in bulk.
 * Ensures consistent image handling for "Add all shown" functionality.
 *
 * @param enhancedProducts - Array of enhanced products
 * @param catalogListing - Main catalog listing data
 * @returns Array of OfferCartItem objects
 */
export const transformBulkProductsToCartItems = (
  enhancedProducts: EnhancedProduct[],
  catalogListing: DetailedCatalogListing
): OfferCartItem[] => {
  const cartItems: OfferCartItem[] = [];

  for (const enhancedProduct of enhancedProducts) {
    try {
      const variants = transformEnhancedProductToOfferVariants(
        enhancedProduct,
        catalogListing
      );

      // Add each variant to cart
      for (const variant of variants) {
        const images = extractImages(
          catalogListing,
          enhancedProduct.originalProduct,
          enhancedProduct.originalProduct.catalog_product_variants?.find(
            (v) => v.variant_sku === variant.variantSku
          )
        );

        const cartItem = transformOfferVariantToCartItem(
          variant,
          enhancedProduct.productName,
          images,
          variant.totalUnits // Use full available quantity
        );

        cartItems.push(cartItem);
      }
    } catch {
      // Skip this product and continue with others
    }
  }

  return cartItems;
};

/**
 * CREATE CATALOG CONTEXT FROM LISTING
 *
 * Creates CatalogContext from DetailedCatalogListing for catalog-scoped operations.
 * This provides the necessary context information for Redux state management.
 *
 * @param catalogListing - Detailed catalog listing data
 * @returns CatalogContext for Redux state management
 */
export const createCatalogContextFromListing = (
  catalogListing: DetailedCatalogListing
): CatalogContext => {
  return {
    catalogId: catalogListing.id,
    catalogTitle: catalogListing.title,
    sellerInfo: "Unknown Seller", // DetailedCatalogListing doesn't include seller info
    minimumOrderValue: catalogListing.minimum_order_value ?? 0,
  };
};
