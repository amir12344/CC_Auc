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
 * Simplified auction interface for UI display
 * Contains only the essential fields we actually have from the API
 */
export interface Auction {
  id: string // From auction_listing_id
  title: string // From title
  image: string // From first auction_listing_images.images.image_url
  images: string[] // From all auction_listing_images.images.image_url

  // API fields (when available)
  description?: string
  category?: string
  subcategory?: string
  lot_condition?: string

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
