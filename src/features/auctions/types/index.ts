/**
 * Simple API response interface matching the actual query in fetchAuctionListings
 * This matches exactly what we're fetching from the database
 */
export interface ApiAuctionListingResponse {
  public_id: string;
  title: string;
  subcategory?: string;
  auction_end_time?: string;
  auction_bids: {
    id: string;
  }[];
  auction_listing_images: {
    images: {
      s3_key: string;
    };
  }[];
  addresses?: {
    city?: string | null;
    province?: string | null;
    province_code?: string | null;
    country_code?: string | null;
  } | null;
}

/**
 * Full API auction listing interface with all fields
 * Used by auctionService.ts for complete auction data
 */
export interface ApiAuctionListing {
  title: string;
  category?: string;
  description?: string;
  subcategory?: string;
  lot_condition?: string;
  addresses?: {
    address1: string;
    address2: string;
    address3: string;
    city: string;
    province: string;
    country: string;
  };
  auction_listing_images: {
    images: { s3_key: string; processed_url: string };
  }[];
  auction_listing_product_manifests?: ManifestItem[];
}

/**
 * Extended API response interface for auction detail queries
 * Includes manifest and additional data from fetchAuctionById
 */
export interface ApiAuctionDetailResponse {
  public_id: string;
  title: string;
  description?: string;
  category?: string;
  subcategory?: string;
  lot_condition?: string;
  auction_end_time?: string;

  // Detail fields from API
  cosmetic_condition?: string;
  accessories?: string;
  total_units?: number;
  total_ex_retail_price: number;
  seller_notes?: string;

  // Shipping fields from API
  auction_shipping_type?: string;
  auction_freight_type?: string;
  number_of_pallets?: string;
  number_of_shipments?: string;
  number_of_truckloads?: string;
  estimated_weight?: string;
  weight_type?: string;
  lot_packaging?: string;
  is_hazmat?: boolean;
  pallet_spaces?: string;
  shipping_notes?: string;

  // Bidding info with detailed structure for detail page
  auction_bids?: {
    bid_amount?: number;
    bid_amount_currency?: string;
    is_winning_bid?: boolean;
  }[];
  current_bid?: number;
  current_bid_currency: string;
  minimum_bid?: number;
  bid_increment_value?: string;

  // Images for detail page
  auction_listing_images?: {
    images: {
      s3_key: string;
    };
  }[];

  auction_listing_product_manifests?: ManifestItem[];
  addresses?: {
    city: string;
    province: string;
    country: string;
  };
}

/**
 * Simple auction listing item interface for listing pages
 * Contains only the essential fields needed for auction cards and lists
 */
export interface AuctionListingItem {
  id: string; // From public_id
  title: string; // From title
  image: string; // From first auction_listing_images processed URL
  images: string[]; // From all auction_listing_images processed URLs
  category?: string | null; // For category filter
  subcategory?: string;
  timeLeft: string; // Calculated from auction_end_time
  totalBids: number; // From auction_bids array length
  isActive: boolean; // Whether the auction is currently active
  auction_end_time?: string; // For time calculations
  // Additional fields for filtering
  lot_condition?: string | null; // For condition filter
  addresses?: {
    city?: string | null;
    province_code?: string | null;
    country_code?: string | null;
  } | null; // For location filter
}

/**
 * Complete auction detail interface for detail pages
 * Contains all fields available from the API response
 */
export interface AuctionDetail {
  id: string; // From public_id
  title: string; // From title
  image: string; // From first auction_listing_images processed URL
  images: string[]; // From all auction_listing_images processed URLs

  // Core API fields
  description?: string;
  category?: string;
  subcategory?: string;
  lot_condition?: string;

  // Detail fields from API
  cosmetic_condition?: string;
  accessories?: string;
  total_units?: number;
  total_ex_retail_price: number;
  seller_notes?: string;

  // Shipping fields from API
  auction_shipping_type?: string;
  auction_freight_type?: string;
  number_of_pallets?: string;
  number_of_shipments?: string;
  number_of_truckloads?: string;
  estimated_weight?: string;
  weight_type?: string;
  lot_packaging?: string;
  is_hazmat?: boolean;
  pallet_spaces?: string;
  shipping_notes?: string;

  // Real auction data
  currentBid: number;
  current_bid_currency: string;
  timeLeft: string;
  totalBids: number;
  location: string;
  isActive: boolean; // Whether the auction is currently active for bidding
  auction_end_time?: string; // For displaying formatted end time
  bid_increment_value?: string; // For calculating minimum bid amount
  minimum_bid?: number; // For calculating minimum bid amount

  // Additional fields for detail view
  productType?: string;
  quantity?: number;
  extRetail?: number;
  manifest?: ManifestItem[];
  details?: Record<string, string>;
  shippingInfo?: Record<string, string>;
}

/**
 * @deprecated Use AuctionListingItem for listings or AuctionDetail for detail pages
 * Keeping for backward compatibility during migration
 */
export interface Auction extends AuctionDetail {}

/**
 * Manifest item interface - matches actual API response structure
 * Updated to include all fields from auction_listing_product_manifests query
 */
export interface ManifestItem {
  title: string;
  description: string;
  retail_price: string;
  ext_retail: string;
  sku: string;
  available_quantity: string;
  category: string;
  subcategory: string;
  product_condition: string;
  cosmetic_condition: string;
  identifier: string;
  identifier_type: string;
  is_hazmat: boolean;
  model_name: string;
}

/**
 * Auction bid interface for bid history display
 */
export interface AuctionBid {
  id: string;
  bidAmount: number;
  currency: string;
  timestamp: string;
  isWinning: boolean;
  bidderName: string;
  bidderId: string;
}

/**
 * Auction filter options interface
 */
export interface AuctionFilters {
  category?: string;
  location?: string;
  priceRange?: [number, number];
  endingSoon?: boolean;
}
