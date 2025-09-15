/**
 * Seller Listing Types
 *
 * Comprehensive type definitions for auction listing creation
 * Based on requirements for single SKU auction listings
 */

// =============================================================================
// CORE LISTING TYPES
// =============================================================================

/**
 * Main auction listing interface
 * Customer Returns > Single SKU > Auction (Bstock) - Always a takeall offer
 */
export interface AuctionListing {
  // Basic Details
  basicDetails: BasicDetails;

  // Shipping Information
  shipping: ShippingDetails;

  // Listing Visibility
  visibility: VisibilityDetails;

  // Sale Options
  saleOptions: SaleOptions;

  // Policies
  policies: Policies;

  // Meta Information
  createdAt?: Date;
  updatedAt?: Date;
  status?: ListingStatus;
  id?: string;
}

/**
 * Basic product details section
 */
export interface BasicDetails {
  // Required fields (marked with * in requirements)
  brand: string;
  name: string;
  category: string;
  title: string;
  upc: string;
  itemNumber: string;
  images: File[]; // 1 image per SKU
  exRetailPrice: number;
  quantity: number;
  unitWeight: number;
  unitDimensions: Dimensions;
  packaging: PackagingType;
  condition: ConditionType;
  containsHazardousMaterials: boolean;

  // Optional fields
  model?: string;
  mpn?: string;
  color?: string;
  video?: File;
  expiration?: Date;
  warranty?: string;
  itemDescription?: string;
  cosmeticCondition?: CosmeticCondition;
  accessories?: AccessoriesStatus;
  inspection?: string;
  sellerNotes?: string;
  businessUnit?: string;
  inventoryType?: string;
  lotId?: string;
  warehouse?: string;
}

/**
 * Updated Shipping details section with exact field names from reference
 */
export interface ShippingDetails {
  // Required fields (marked with * in requirements)
  shippingType: ShippingType;
  warehouseAddress1: string; // NEW: Warehouse Address 1* (Hidden from buyer)
  warehouseAddress2?: string; // NEW: Warehouse Address 2 (Hidden from buyer)
  warehouseCity: string; // NEW: Warehouse City* (Hidden from buyer)
  warehouseState: string; // NEW: Warehouse State* (Hidden from buyer)
  warehouseZipcode: string; // NEW: Warehouse Zipcode* (Hidden from buyer)
  warehouseCountry: string; // NEW: Warehouse Country* (Hidden from buyer)
  shipFromLocation: string; // UPDATED: Ship From Location*
  freightType: FreightType;
  estimatedWeight: number; // UPDATED: Estimated Weight (lbs)* - derived from manifest
  packagingFormat: PackagingFormatType; // NEW: Packaging Format*
  refrigerated: string; // UPDATED: Refrigerated? Yes / No
  containsHazardousMaterials: string; // UPDATED: Contains Hazardous Materials?* Yes / No

  // Optional fields
  shippingCost?: number; // Shipping Cost (if applicable)
  numberOfPallets?: number; // Number of Pallets
  numberOfTruckloads?: number; // Number of Truckloads
  shippingNotes?: string; // Shipping Notes (with example text)
  numberOfShipments?: number; // Number of Shipments
  additionalInformation?: string; // Additional Information (optional)

  // Legacy fields (to be deprecated)
  shipFrom?: string; // OLD: keeping for backward compatibility
  pieceCount?: number; // OLD: keeping for backward compatibility
  packagingType?: PackagingType; // OLD: keeping for backward compatibility
  dimensions?: Dimensions; // OLD: keeping for backward compatibility
}

/**
 * Listing visibility and targeting details
 */
export interface VisibilityDetails {
  isPublic: boolean;
  targetedRegions?: string[];
  targetedBuyerTypes?: BuyerType[];
}

/**
 * Sale options and auction settings
 */
export interface SaleOptions {
  startingBid: number;
  auctionDuration: number; // 1 to 30 days
  runTillSold?: boolean;
  minimumPrice?: number;
  reservePrice?: number;
  resaleRequirements?: string;
  delabelingRequired?: boolean;
  noExporting?: boolean;
  biddingRequirements?: string;
}

/**
 * Policies and terms
 */
export interface Policies {
  agreeToTerms: boolean;
  termsOfPurchase?: string;
}

// =============================================================================
// ENUM TYPES
// =============================================================================

/**
 * Product dimensions (W x L x H)
 */
export interface Dimensions {
  width: number;
  length: number;
  height: number;
  unit: "in" | "cm" | "ft" | "m";
}

/**
 * Packaging types as specified in requirements
 */
export type PackagingType =
  | "retail_packaging"
  | "mixed_packaging"
  | "pallets_48x40"
  | "floor_loaded";

/**
 * Packaging Format types for shipping (exact names from reference)
 */
export type PackagingFormatType = "pallets_48x40" | "floor_loaded";

/**
 * Product condition types
 */
export type ConditionType =
  | "used_fair"
  | "used_good"
  | "used_excellent"
  | "new_open_box"
  | "new_sealed";

/**
 * Cosmetic condition options
 */
export type CosmeticCondition = "damaged" | "good" | "excellent" | "like_new";

/**
 * Accessories status
 */
export type AccessoriesStatus =
  | "may_be_missing"
  | "complete"
  | "partial"
  | "none";

/**
 * Shipping types
 */
export type ShippingType =
  | "binding_shipping"
  | "fixed_cost"
  | "standard_shipping_only";

/**
 * Freight types
 */
export type FreightType = "single_box" | "multiple_boxes" | "ltl" | "ftl";

/**
 * Buyer types for targeting
 */
export type BuyerType =
  | "amazon_reseller"
  | "ebay_seller"
  | "poshmark_seller"
  | "live_shopping_sellers"
  | "bin_stores"
  | "discount_chain"
  | "off_price_retailer"
  | "traditional_liquidators"
  | "mom_and_pop_stores";

/**
 * Listing status
 */
export type ListingStatus =
  | "draft"
  | "active"
  | "paused"
  | "completed"
  | "cancelled";

// =============================================================================
// FORM STATE TYPES
// =============================================================================

/**
 * Form section completion tracking
 */
export interface FormSectionStatus {
  basicDetails: boolean;
  shipping: boolean;
  visibility: boolean;
  saleOptions: boolean;
  policies: boolean;
}

/**
 * Form state with validation
 */
export interface ListingFormState {
  data: Partial<AuctionListing>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  sectionStatus: FormSectionStatus;
  currentStep: number;
}

// =============================================================================
// API TYPES
// =============================================================================

/**
 * API response for listing creation
 */
export interface CreateListingResponse {
  success: boolean;
  listingId?: string;
  message: string;
  errors?: Record<string, string>;
}

/**
 * File upload response
 */
export interface FileUploadResponse {
  success: boolean;
  fileUrl?: string;
  message: string;
  fileName?: string;
}

/**
 * Excel upload bulk creation response
 */
export interface BulkCreateResponse {
  success: boolean;
  created: number;
  failed: number;
  errors?: Array<{
    row: number;
    errors: Record<string, string>;
  }>;
  listingIds?: string[];
}

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Required field validation helper type
 */
export type RequiredFields =
  | keyof Pick<
      BasicDetails,
      | "brand"
      | "name"
      | "category"
      | "title"
      | "upc"
      | "itemNumber"
      | "images"
      | "exRetailPrice"
      | "quantity"
      | "unitWeight"
      | "unitDimensions"
      | "packaging"
      | "condition"
      | "containsHazardousMaterials"
    >
  | keyof Pick<
      ShippingDetails,
      | "shippingType"
      | "shipFrom"
      | "freightType"
      | "pieceCount"
      | "estimatedWeight"
      | "containsHazardousMaterials"
    >;

/**
 * Category options (can be expanded)
 */
export const CATEGORIES = [
  "Electronics & Technology",
  "Home & Kitchen",
  "Fashion & Beauty",
  "Furniture & Decor",
  "Sports & Outdoor",
  "General Merchandise",
  "Automotive",
  "Health & Personal Care",
  "Toys & Games",
  "Books & Media",
  "Office Supplies",
  "Tools & Home Improvement",
] as const;

export type CategoryType = (typeof CATEGORIES)[number];
