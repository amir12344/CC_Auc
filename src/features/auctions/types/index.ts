/**
 * Simple API response interface matching the actual query in AuctionSection.tsx
 * This matches exactly what we're fetching from the database
 */
export interface ApiAuctionListingResponse {
  auction_listing_id: string
  title: string
  auction_listing_images: {
    images: {
      image_url: string
    }
  }[]
}

/**
 * Full API auction listing interface with all fields
 * Used by auctionService.ts for complete auction data
 */
export interface ApiAuctionListing {
  title: string
  category?: string
  description?: string
  subcategory?: string
  lot_condition?: string
  addresses?: {
    address1: string
    address2: string
    address3: string
    city: string
    province: string
    country: string
  }
  auction_listing_images: {
    images: {
      image_url: string
    }
  }[]
  auction_listing_product_manifests?: ManifestItem[]
}

/**
 * Extended API response interface for auction detail queries
 * Includes manifest and additional data from fetchAuctionById
 */
export interface ApiAuctionDetailResponse extends ApiAuctionListingResponse {
  description?: string
  category?: string
  subcategory?: string
  lot_condition?: string
  auction_listing_product_manifests?: ManifestItem[]
  addresses?: {
    city: string
    province: string
    country: string
  }
}

/**
 * Complete auction interface for UI display
 * Contains all fields available from the API response
 */
export interface Auction {
  id: string // From auction_listing_id
  title: string // From title
  image: string // From first auction_listing_images.images.image_url
  images: string[] // From all auction_listing_images.images.image_url

  // Core API fields
  description?: string
  category?: string
  subcategory?: string
  lot_condition?: string

  // Detail fields from API
  cosmetic_condition?: string
  accessories?: string
  total_units?: number
  total_ex_retail_price?: number
  seller_notes?: string

  // Shipping fields from API
  auction_shipping_type?: string
  auction_freight_type?: string
  number_of_pallets?: string
  number_of_shipments?: string
  number_of_truckloads?: string
  estimated_weight?: string
  weight_type?: string
  lot_packaging?: string
  is_hazmat?: boolean
  pallet_spaces?: string
  shipping_notes?: string

  // Mock data for basic functionality (can be enhanced later)
  currentBid: number
  timeLeft: string
  totalBids: number
  location: string
  isActive: boolean // Whether the auction is currently active for bidding

  // Additional fields for detail view
  productType?: string
  quantity?: number
  extRetail?: number
  manifest?: ManifestItem[]
  details?: Record<string, string>
  shippingInfo?: Record<string, string>
}

/**
 * Manifest item interface - matches actual API response structure
 * Updated to include all fields from auction_listing_product_manifests query
 */
export interface ManifestItem {
  title: string
  description: string
  retail_price: string
  ext_retail: string
  sku: string
  available_quantity: string
  category: string
  subcategory: string
  product_condition: string
  cosmetic_condition: string
  identifier: string
  identifier_type: string
  is_hazmat: boolean
  model_name: string
}

/**
 * Auction filter options interface
 */
export interface AuctionFilters {
  category?: string
  location?: string
  priceRange?: [number, number]
  endingSoon?: boolean
}
