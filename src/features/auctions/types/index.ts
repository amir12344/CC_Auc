import { Seller } from '../../../types';

/**
 * Manifest item interface for auction product manifests
 * Represents individual items listed in an auction's manifest table
 */
export interface ManifestItem {
  itemNumber: string;
  productClass: string;
  category: string;
  brand: string;
  model?: string;
  description: string;
}

/**
 * Enhanced auction interface for marketplace auction listings
 * Contains auction-specific fields like current bid, end time, and bidding information
 * Used for displaying auction cards and auction detail pages
 */
export interface Auction {
  id: string;
  title: string;
  image: string;
  images: string[]; // Multiple images for gallery
  description?: string;
  category: string;
  condition?: string;
  seller?: Seller;
  location: string;
  
  // Auction-specific fields
  currentBid: number;
  startingBid: number;
  buyNowPrice?: number;
  endTime: string; // ISO date string
  totalBids: number;
  timeLeft?: string; // Human readable time left (e.g., "2 days 5 hours")
  isActive: boolean;
  
  // Additional auction metadata
  unitsAvailable?: number;
  shipping?: string;
  reserve?: number; // Reserve price
  highestBidder?: string; // Anonymized bidder info
  
  // Enhanced fields for detailed view
  additionalCharges: number; // B-Stock fees, etc.
  manifest: ManifestItem[];
  details: Record<string, string>; // Key-value pairs for details section
  shippingInfo: Record<string, string>; // Key-value pairs for shipping section
  avgCostPerUnit?: number;
  extRetail?: number;
  quantity?: number;
  productType?: string;
  packaging?: string;
  resaleRequirements?: string;
  biddingRequirements?: string;
}

/**
 * Auction bidding information interface
 * Used for managing bid-related data and validation
 */
export interface AuctionBid {
  id: string;
  auctionId: string;
  amount: number;
  bidder: string;
  timestamp: string;
  isWinning: boolean;
}

/**
 * Auction filter options interface
 * Used for filtering and searching auctions
 */
export interface AuctionFilters {
  category?: string;
  condition?: string;
  location?: string;
  priceRange?: [number, number];
  endingSoon?: boolean;
  hasReserve?: boolean;
} 