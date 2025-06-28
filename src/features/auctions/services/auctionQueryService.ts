/**
 * Auction Query Service
 * Clean service that handles API calls and returns UI-ready data
 */

import { generateClient } from 'aws-amplify/api'
import type { Schema } from '@/amplify/data/resource'
import type {
  FindManyArgs,
  FindUniqueArgs,
} from '@/src/lib/prisma/PrismaQuery.type'
import type { Auction, ManifestItem } from '../types'

/**
 * Generate random bid for demo purposes
 */
function generateRandomBid(): number {
  const baseBids = [250, 380, 520, 675, 890, 1200, 1850, 2400]
  return baseBids[Math.floor(Math.random() * baseBids.length)]
}

/**
 * Generate random time left for demo purposes
 */
function generateRandomTimeLeft(): string {
  const options = [
    '2d 4h',
    '1d 12h',
    '18h 45m',
    '6h 30m',
    '3h 15m',
    '45m',
    '1d 8h',
  ]
  return options[Math.floor(Math.random() * options.length)]
}

/**
 * Generate random bid count for demo purposes
 */
function generateRandomBidCount(): number {
  return Math.floor(Math.random() * 25) + 1
}

/**
 * Utility functions for auction bidding UI
 */

/** Calculate minimum bid amount (current bid + increment) */
export const calculateMinimumBid = (currentBid: number): number => {
  return Math.ceil(currentBid * 1.05) // 5% increment
}

/** Format currency for auction display */
export const formatAuctionCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Format bid count for display */
export const formatBidCount = (count: number): string => {
  return `${count} bid${count !== 1 ? 's' : ''}`
}

/** Format time left for display */
export const formatTimeLeft = (timeLeft: string): string => {
  return timeLeft
}

/** Get auction image sizes for responsive loading */
export const getAuctionImageSizes = (): string => {
  return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
}

/** Get auction image placeholder for loading states */
export const getAuctionImagePlaceholder = (): string => {
  return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='
}

/**
 * Transform raw API data to UI-ready Auction format
 */
function transformToAuction(apiData: any): Auction {
  // Extract primary image
  const primaryImage =
    apiData.auction_listing_images?.[0]?.images?.image_url ||
    '/images/placeholder-auction.jpg'

  // Extract all images
  const allImages = (apiData.auction_listing_images || [])
    .map((img: any) => img.images.image_url)
    .filter(Boolean)

  // Extract location from address
  const location = apiData.addresses
    ? `${apiData.addresses.city}, ${apiData.addresses.province}`
    : 'Location TBD'

  return {
    id: apiData.auction_listing_id,
    title: apiData.title,
    image: primaryImage,
    images: allImages,
    description: apiData.description,
    category: apiData.category,
    subcategory: apiData.subcategory,
    lot_condition: apiData.lot_condition,
    location,
    manifest: apiData.auction_listing_product_manifests || [],

    // Detail fields from API
    cosmetic_condition: apiData.cosmetic_condition,
    accessories: apiData.accessories,
    total_units: apiData.total_units,
    total_ex_retail_price: apiData.total_ex_retail_price,
    seller_notes: apiData.seller_notes,

    // Shipping fields from API
    auction_shipping_type: apiData.auction_shipping_type,
    auction_freight_type: apiData.auction_freight_type,
    number_of_pallets: apiData.number_of_pallets,
    number_of_shipments: apiData.number_of_shipments,
    number_of_truckloads: apiData.number_of_truckloads,
    estimated_weight: apiData.estimated_weight,
    weight_type: apiData.weight_type,
    lot_packaging: apiData.lot_packaging,
    is_hazmat: apiData.is_hazmat,
    pallet_spaces: apiData.pallet_spaces,
    shipping_notes: apiData.shipping_notes,

    // Mock data for bidding functionality
    currentBid: generateRandomBid(),
    timeLeft: generateRandomTimeLeft(),
    totalBids: generateRandomBidCount(),
    isActive: true, // Default to active for now
  }
}

/**
 * Fetch auction listings for marketplace page
 * Returns clean UI-ready Auction objects
 */
export const fetchAuctionListings = async (): Promise<Auction[]> => {
  try {
    const client = generateClient<Schema>()

    type QueryDataInput = {
      modelName: 'auction_listings'
      operation: 'findMany'
      query: string
    }

    // CRITICAL: Never modify this query structure
    const query: FindManyArgs<'auction_listings'> = {
      select: {
        auction_listing_id: true,
        title: true,
        subcategory: true,
        auction_listing_images: {
          select: {
            images: {
              select: {
                image_url: true,
              },
            },
          },
        },
      },
      take: 10,
    }

    const input: QueryDataInput = {
      modelName: 'auction_listings',
      operation: 'findMany',
      query: JSON.stringify(query),
    }

    const { data: result } = await client.queries.queryData(input)

    if (result) {
      const parsedData =
        typeof result === 'string' ? JSON.parse(result) : result
      if (Array.isArray(parsedData)) {
        return parsedData.map(transformToAuction)
      }
    }

    return []
  } catch (error) {
    console.error('Error fetching auction listings:', error)
    return []
  }
}

/**
 * Fetch single auction by ID for detail page
 * Returns clean UI-ready Auction object
 */
export const fetchAuctionById = async (
  auctionId: string
): Promise<Auction | null> => {
  try {
    const client = generateClient<Schema>()

    type QueryDataInput = {
      modelName: 'auction_listings'
      operation: 'findUnique'
      query: string
    }

    // CRITICAL: Never modify this query structure
    const query: FindUniqueArgs<'auction_listings'> = {
      where: {
        auction_listing_id: auctionId,
      },
      select: {
        auction_listing_id: true,
        title: true,
        description: true,
        category: true,
        subcategory: true,
        lot_condition: true,
        cosmetic_condition: true,
        accessories: true,
        total_units: true,
        total_ex_retail_price: true,
        seller_notes: true,
        // Shipping fields
        auction_shipping_type: true,
        auction_freight_type: true,
        number_of_pallets: true,
        number_of_shipments: true,
        number_of_truckloads: true,
        estimated_weight: true,
        weight_type: true,
        lot_packaging: true,
        is_hazmat: true,
        pallet_spaces: true,
        shipping_notes: true,
        addresses: {
          select: {
            address1: true,
            address2: true,
            address3: true,
            city: true,
            province: true,
            country: true,
          },
        },
        auction_listing_images: {
          select: {
            images: {
              select: {
                image_url: true,
              },
            },
          },
        },
        auction_listing_product_manifests: {
          select: {
            title: true,
            description: true,
            retail_price: true,
            ext_retail: true,
            sku: true,
            available_quantity: true,
            category: true,
            subcategory: true,
            product_condition: true,
            cosmetic_condition: true,
            identifier: true,
            identifier_type: true,
            is_hazmat: true,
            model_name: true,
          },
        },
      },
    }

    const input: QueryDataInput = {
      modelName: 'auction_listings',
      operation: 'findUnique',
      query: JSON.stringify(query),
    }

    const { data: result } = await client.queries.queryData(input)

    if (result) {
      const parsedData =
        typeof result === 'string' ? JSON.parse(result) : result
      return transformToAuction(parsedData)
    }

    return null
  } catch (error) {
    return null
  }
}
