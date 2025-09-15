import type { BuyerPreferences } from "@/src/features/buyer-preferences/types/preferences";

/**
 * Catalog listing interface based on the lean data structure from the database query.
 * This represents the actual data used for rendering catalog cards and sections.
 */
export interface CatalogListing {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  subcategory: string | null;
  image_url: string | null;
  lead_time_days: number | null;
  // Image data with processed URLs for display
  catalog_listing_images: Array<{
    images: { s3_key: string; processed_url: string };
  }>;
  minimum_order_value: number;
  // Optional, computed for cards when variant data is available
  total_units?: number;
  msrp_discount_percent?: number;
  // Optional: identify if the card is for a catalog, auction, or lot listing
  listing_source?: "catalog" | "auction" | "lot";
  // Additional filter fields
  listing_condition?: string | null;
  packaging?: string | null;
  is_private?: boolean | null;
  addresses?: {
    city?: string | null;
    province?: string | null;
    country?: string | null;
  } | null;
  brands?: Array<{
    brand_name?: string | null;
  }> | null;
}

/**
 * Detailed catalog listing with products and variants for individual listing pages
 */
export interface DetailedCatalogListing {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  subcategory: string | null;
  image_url: string | null;
  shipping_window: number | null;
  minimum_order_value: number;
  packaging?: string | null;
  addresses?: {
    city: string;
    province: string;
    country: string;
  };
  // Image data with processed URLs for display
  catalog_listing_images: Array<{
    images: { s3_key: string; processed_url: string };
  }>;
  // Products with their images and variants
  catalog_products: Array<{
    title: string;
    catalog_product_id: string;
    retail_price: number | string | null;
    offer_price: number | string | null;
    category: string | null;
    subcategory: string | null;
    brands?: {
      brand_name: string;
    } | null;
    catalog_product_images: Array<{
      images: { s3_key: string; processed_url: string };
    }>;
    catalog_product_variants: Array<{
      public_id: string;
      title: string;
      variant_name: string;
      variant_sku: string;
      available_quantity: number;
      retail_price: number | string | null;
      offer_price: number | string | null;
      identifier: string | null;
      identifier_type: string | null;
      category: string | null;
      subcategory: string | null;
      packaging: string | null;
      product_condition: string | null;
      catalog_product_variant_images: Array<{
        images: { s3_key: string; processed_url: string };
      }>;
    }>;
  }>;
}

/**
 * API response types for detailed catalog listing
 */
export interface CatalogListingApiResponse {
  public_id: string;
  title: string;
  description: string | null;
  category: string | null;
  subcategory: string | null;
  minimum_order_value: string | number | null | undefined;
  packaging?: string | null;
  addresses?: {
    city: string;
    province: string;
    country: string;
  };
  lead_time_days: number | null;
  shipping_window: number | null;
  catalog_listing_images: Array<{ images: { s3_key: string } }> | null;
  catalog_products: Array<{
    title: string;
    catalog_product_id: string;
    retail_price: number | string | null;
    offer_price: number | string | null;
    category: string | null;
    subcategory: string | null;
    brands?: {
      brand_name: string;
    } | null;
    catalog_product_images: Array<{ images: { s3_key: string } }> | null;
    catalog_product_variants: Array<{
      public_id: string;
      title: string;
      variant_name: string;
      variant_sku: string;
      available_quantity: number;
      retail_price: number | string | null;
      offer_price: number | string | null;
      identifier: string | null;
      identifier_type: string | null;
      category: string | null;
      subcategory: string | null;
      packaging: string | null;
      product_condition: string | null;
      catalog_product_variant_images: Array<{
        images: { s3_key: string };
      }> | null;
    }> | null;
  }> | null;
}

/**
 * Section configuration interface for dynamic rendering
 */
export interface SectionConfig {
  id: string;
  type: "catalog" | "auction" | "lot";
  title: string;
  priority: number;
  filterCriteria: {
    sellingPlatforms?: string[];
    categories?: string[];
    listingType?: string;
    featured?: boolean;
  };
  isVisible: boolean;
  maxItems?: number;
}

/**
 * Section configuration container
 */
export interface SectionConfiguration {
  sections: SectionConfig[];
  userPreferences: BuyerPreferences;
  lastUpdated: Date;
}

/**
 * Catalog filter options for API queries
 */
export interface CatalogFilters {
  category?: string;
  subcategory?: string;
  sellingPlatforms?: string[];
  status?: "ACTIVE" | "INACTIVE";
  featured?: boolean;
  priceRange?: {
    min: number;
    max: number;
  };
  limit?: number;
}

/**
 * Props for CatalogSection component
 */
export interface CatalogSectionProps {
  filters?: CatalogFilters;
  title: string;
  viewAllLink?: string;
  maxItems?: number;
}

/**
 * Props for CatalogCard component
 */
export interface CatalogCardProps {
  catalog: CatalogListing;
  className?: string;
  darkMode?: boolean;
}

/**
 * Props for DynamicSectionOrchestrator component
 */
export interface DynamicSectionOrchestratorProps {
  userPreferences: BuyerPreferences;
}

/**
 * Section renderer props for dynamic section rendering
 */
export interface SectionRendererProps {
  config: SectionConfig;
}
