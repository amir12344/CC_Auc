/**
 * Unified type representing both Catalog and Auction listings for filtering/UI.
 * This consolidates previously duplicated interfaces declared across services.
 */
export interface CombinedListing {
  // Core fields
  public_id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string | null;
  minimum_order_value?: number | null;
  images: Array<{ s3_key: string }>;
  shipping_window?: number | null;
  listing_source: "catalog" | "auction" | "lot";
  // Optional, computed when variant data is selected in queries
  total_units?: number | null;
  msrp_discount_percent?: number | null;

  // Optional filter fields
  listing_condition?: string | null;
  packaging?: string | null;
  is_private?: boolean | null;
  addresses?: {
    city?: string | null;
    // Some services provide full province name on read models
    province?: string | null;
    // Others provide province_code
    province_code?: string | null;
    country_code?: string | null;
    country?: string | null;
  } | null;
  brands?: Array<{ brand_name?: string | null }> | null;

  // Optional image structure used by some mappers
  catalog_listing_images?: Array<{
    images: { s3_key: string; processed_url?: string };
  }> | null;

  // Auction-specific optional fields (present when listing_source === 'auction')
  time_left?: string | null;
  total_bids?: number | null;
  is_active?: boolean | null;
  auction_end_time?: string | null;
}

export type CombinedListingsResponse = {
  listings: CombinedListing[];
  totalCount: number;
  isFiltered: boolean;
  appliedFilters?: Record<string, unknown>;
};
