/**
 * OFFER MANAGEMENT TYPES
 *
 * These types are aligned with the API response structure from catalogQueryService.ts
 * and support both the BuildOfferModal and OfferSummarySheet functionality.
 *
 * Data Flow: Catalog API → Transform → Redux Store → UI Components
 */

/**
 * CATALOG PRODUCT VARIANT (from API)
 *
 * Represents a product variant exactly as returned from the API.
 * This matches the structure from transformApiResponseToDetailedCatalogListing.
 */
export interface CatalogProductVariant {
  public_id: string;
  title: string;
  variant_name: string;
  variant_sku: string; // Used as unique identifier
  available_quantity: number;
  retail_price: number | string | null; // MSRP source - API returns string
  offer_price: number | string | null; // Buyer price source - API returns string
  identifier: string | null;
  identifier_type: string | null;
  category: string | null;
  subcategory: string | null;
  packaging: string | null;
  product_condition: string | null;
  catalog_product_variant_images: Array<{
    images: {
      s3_key: string;
      processed_url: string;
    };
  }>;
}

/**
 * CATALOG PRODUCT (from API)
 *
 * Represents a catalog product exactly as returned from the API.
 * This matches the structure from transformApiResponseToDetailedCatalogListing.
 */
export interface CatalogProduct {
  catalog_product_id: string; // Unique product identifier from API
  title: string;
  retail_price: number | string | null; // MSRP source - API returns string
  offer_price: number | string | null; // Buyer price source - API returns string
  category: string | null; // Product category
  subcategory: string | null; // Product subcategory
  brands?: {
    brand_name: string;
  } | null; // Brand information
  catalog_product_images: Array<{
    images: {
      s3_key: string;
      processed_url: string;
    };
  }>;
  catalog_product_variants: CatalogProductVariant[];
}

/**
 * OFFER VARIANT (for BuildOfferModal)
 *
 * Represents a selectable variant in the offer building process.
 * This is used in the BuildOfferModal component for variant selection.
 */
export interface OfferVariant {
  // Unique identifiers (from API)
  catalogProductId: string; // catalog_product_id from API
  variantSku: string; // variant_sku from API
  variantId: string; // variant_id from API

  // Display information
  name: string; // variant_name or title
  title: string; // variant title

  // Pricing (from API)
  retailPrice: number; // MSRP - from retail_price
  offerPrice: number; // Buyer price - from offer_price
  pricePerUnit: number; // Calculated: offerPrice / totalUnits

  // Quantities
  totalUnits: number; // available_quantity from API
  availableQuantity: number; // Maximum inventory limit

  // Selection state
  checked: boolean; // Whether variant is selected

  // Images
  image?: string; // Primary variant image URL

  // Brand information
  brandName?: string; // Brand name from product brands.brand_name

  // Additional variant information
  identifier: string | null; // Variant identifier (e.g., UPC, SKU)
  identifier_type: string | null; // Type of identifier used
  category: string | null; // Variant category (with fallback to product category)
  subcategory: string | null; // Variant subcategory (with fallback to product subcategory)
  packaging: string | null; // Packaging information
  product_condition: string | null; // Product condition

  // Legacy fields (deprecated, kept for backward compatibility)
  id?: string; // @deprecated Use catalogProductId + variantSku instead
  upc?: string; // Not available in catalog data
  asin?: string; // Not available in catalog data
  totalPrice?: number; // Calculated: pricePerUnit * totalUnits
}

/**
 * OFFER CART ITEM (for OfferSummarySheet)
 *
 * Represents a selected item in the offer cart/summary.
 * This is the final structure stored in Redux and displayed in the summary sheet.
 */
export interface OfferCartItem {
  // Unique identifiers (from API)
  catalogProductId: string; // catalog_product_id from API
  variantSku: string; // variant_sku from API
  variantId: string;
  // Display names
  productName: string; // product title
  variantName: string; // variant name

  // Pricing (from API)
  retailPrice: number; // MSRP - from retail_price
  offerPrice: number; // Buyer price - from offer_price
  pricePerUnit: number; // Price per individual unit

  // Quantities
  selectedQuantity: number; // User-selected quantity
  availableQuantity: number; // Maximum available
  totalPrice: number; // Calculated: pricePerUnit * selectedQuantity

  // Images (all three types from API)
  listingImage?: string; // catalog_listing_images[0].processed_url
  productImage?: string; // catalog_product_images[0].processed_url
  variantImage?: string; // catalog_product_variant_images[0].processed_url

  // Brand information
  brandName?: string; // Brand name from brands.brand_name

  // Additional variant information
  identifier: string | null; // Variant identifier (e.g., UPC, SKU)
  identifier_type: string | null; // Type of identifier used
  category: string | null; // Variant category (with fallback to product category)
  subcategory: string | null; // Variant subcategory (with fallback to product subcategory)
  packaging: string | null; // Packaging information
  product_condition: string | null; // Product condition

  // Legacy fields (deprecated, kept for backward compatibility)
  productId?: string; // @deprecated Use catalogProductId instead
  quantity?: number; // @deprecated Use selectedQuantity instead
  msrp?: number; // @deprecated Use retailPrice instead
  totalUnits?: number; // @deprecated Use selectedQuantity instead
}

/**
 * GROUPED PRODUCT (for OfferSummarySheet)
 *
 * Represents a product with all its selected variants grouped together.
 * Used in the OfferSummarySheet for product-centric display.
 */
export interface GroupedProduct {
  catalogProductId: string; // catalog_product_id from API
  productName: string;
  totalVariants: number;
  totalUnits: number;
  totalPrice: number;
  avgPricePerUnit: number;
  retailPrice: number; // MSRP
  variants: OfferCartItem[];

  // Images
  productImage?: string; // Primary product image
  listingImage?: string; // Catalog listing image

  // Legacy fields (deprecated)
  productId?: string; // @deprecated Use catalogProductId instead
  msrp?: number; // @deprecated Use retailPrice instead
}

/**
 * OFFER STATE (for BuildOfferModal)
 *
 * Manages the state of the BuildOfferModal component.
 * This is temporary state before items are added to the cart.
 */
export interface OfferState {
  // Product identification
  catalogProductId: string | null; // catalog_product_id from API
  productTitle: string;

  // Variants and selection
  variants: OfferVariant[];

  // Images
  productImage?: string; // Primary product image
  listingImage?: string; // Catalog listing image

  // Product statistics
  productStats?: {
    upc: string; // Not available in catalog data
    asin: string; // Not available in catalog data
    retailPrice: string; // Formatted retail price
    totalUnits: string; // Total available units
    variantCount: string; // Number of variants
  };

  // Modal state
  open: boolean;

  // Legacy fields (deprecated)
  productId?: string | null; // @deprecated Use catalogProductId instead
}

/**
 * CATALOG OFFER (for individual catalog offers)
 *
 * Represents an offer for a specific catalog listing.
 * Each catalog maintains its own independent offer state.
 */
export interface CatalogOffer {
  catalogId: string; // catalog listing ID
  catalogTitle: string; // catalog listing title
  sellerInfo?: string; // seller information
  minimumOrderValue?: number; // minimum order value for this catalog
  items: OfferCartItem[]; // products/variants selected from this catalog
  expandedProducts: Record<string, boolean>; // Track which products are expanded
  lastUpdated: Date | number; // When this offer was last modified (Date or timestamp for compatibility)
  totalValue: number; // Calculated total value of this catalog offer
  totalQuantity: number; // Calculated total quantity of this catalog offer
}

/**
 * OFFER CART STATE (for OfferSummarySheet)
 *
 * Manages catalog-scoped offer cart/summary functionality.
 * Each catalog listing maintains its own independent offer state.
 * This is persistent state stored in Redux and localStorage.
 */
export interface OfferCartState {
  // Catalog-scoped offers: catalogId → CatalogOffer
  offersByCatalog: Record<string, CatalogOffer>;

  // Current catalog context
  currentCatalogId: string | null; // Which catalog user is currently viewing

  // Global UI state
  isSubmitting: boolean; // Whether any offer is being submitted
  error: string | null; // Global error state

  // Legacy fields (deprecated, kept for backward compatibility)
  items?: OfferCartItem[]; // @deprecated Use offersByCatalog instead
  expandedProducts?: Record<string, boolean>; // @deprecated Use catalog-specific expanded state
  totalValue?: number; // @deprecated Calculate from current catalog
  totalQuantity?: number; // @deprecated Calculate from current catalog
}

/**
 * CATALOG CONTEXT (for Redux state management)
 *
 * Provides context information for catalog-scoped operations.
 * Used when setting up catalog context in Redux.
 */
export interface CatalogContext {
  catalogId: string; // catalog listing ID
  catalogTitle: string; // catalog listing title
  sellerInfo?: string; // seller information
  minimumOrderValue?: number; // minimum order value for this catalog
}

/**
 * OFFER SUBMISSION PAYLOAD
 *
 * Structure for submitting catalog-specific offers to the backend.
 * Each submission is now scoped to a single catalog.
 */
export interface OfferSubmissionPayload {
  buyerId: string;
  sellerId: string;
  catalogId: string; // Which catalog this offer is for
  catalogTitle: string; // Catalog title for reference
  items: OfferCartItem[]; // Products from this catalog only
  message?: string;
  expirationDate?: Date;
}

/**
 * MULTI-CATALOG OFFER SUMMARY
 *
 * Summary of all offers across all catalogs.
 * Used in global offer management views.
 */
export interface MultiCatalogOfferSummary {
  totalCatalogs: number; // Number of catalogs with offers
  totalValue: number; // Combined value across all catalogs
  totalQuantity: number; // Combined quantity across all catalogs
  catalogSummaries: Array<{
    catalogId: string;
    catalogTitle: string;
    itemCount: number;
    totalValue: number;
    totalQuantity: number;
  }>;
}

/**
 * OFFER RESPONSE
 *
 * Structure for offer responses from the backend.
 */
export interface OfferResponse {
  id: string;
  status: "pending" | "accepted" | "rejected" | "expired";
  submittedAt: Date;
  expiresAt?: Date;
  buyerId: string;
  sellerId: string;
  items: OfferCartItem[];
  message?: string;
  response?: {
    message: string;
    counterOffer?: OfferCartItem[];
    respondedAt: Date;
  };
}

/**
 * ENHANCED PRODUCT (for CatalogProductsTable)
 *
 * Enhanced product structure with calculated fields for display in product tables.
 * Used in CatalogProductsGrid, CatalogProductsList, and related components.
 */
export interface EnhancedProduct {
  // Unique identifiers (from API)
  catalogProductId: string; // catalog_product_id from API

  // Display information
  productName: string; // product title

  // Brand information
  brandName?: string; // Brand name from brands.brand_name

  // Calculated fields
  variants: number; // Number of variants
  retailPrice: number; // MSRP - from retail_price
  offerPrice: number; // Buyer price - from offer_price
  totalUnits: number; // Total available units across all variants
  totalPrice: number; // Calculated: offerPrice * totalUnits

  // Images
  imageUrl: string; // Primary product image

  // Original API data
  originalProduct: CatalogProduct; // Full API product data

  // Legacy fields (deprecated)
  id?: string; // @deprecated Use catalogProductId instead
}

/**
 * IMAGE EXTRACTION RESULT
 *
 * Result of extracting images from catalog data.
 * Used for consistent image handling across components.
 */
export interface ExtractedImages {
  listingImage?: string; // catalog_listing_images[0].processed_url
  productImage?: string; // catalog_product_images[0].processed_url
  variantImage?: string; // catalog_product_variant_images[0].processed_url
}

/**
 * TRANSFORM RESULT
 *
 * Result of transforming catalog data to offer format.
 * Used by transform utility functions.
 */
export interface TransformResult {
  variants: OfferVariant[];
  images: ExtractedImages;
  productStats: {
    upc: string;
    asin: string;
    retailPrice: string;
    totalUnits: string;
    variantCount: string;
  };
}

// Legacy type exports (deprecated, kept for backward compatibility)
export type OfferItem = OfferCartItem;
