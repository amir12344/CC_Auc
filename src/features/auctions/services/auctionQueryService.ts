/**
 * Auction Query Service
 * Clean service that handles API calls and returns UI-ready data
 */
import { generateClient } from "aws-amplify/api";
import { getCurrentUser } from "aws-amplify/auth";
import { getUrl } from "aws-amplify/storage";

import type { Schema } from "@/amplify/data/resource";
import type {
  FindManyArgs,
  FindUniqueArgs,
} from "@/src/lib/prisma/PrismaQuery.type";

import type {
  ApiAuctionDetailResponse,
  ApiAuctionListingResponse,
  AuctionBid,
  AuctionDetail,
  AuctionListingItem,
} from "../types";

/**
 * Get public URL for S3 image
 */
const getImageUrl = async (s3Key: string): Promise<string | null> => {
  try {
    const publicUrl = await getUrl({
      path: s3Key,
      options: {
        validateObjectExistence: false,
        bucket: "commerce-central-images",
        useAccelerateEndpoint: true,
      },
    });
    const result = publicUrl.url.toString();
    return result;
  } catch {
    return null;
  }
};

/**
 * Calculate time left from auction end time
 */
function calculateTimeLeft(auctionEndTime: string): string {
  const endTime = new Date(auctionEndTime);
  const now = new Date();
  const timeDiff = endTime.getTime() - now.getTime();

  if (timeDiff <= 0) {
    return "Ended";
  }

  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Utility functions for auction bidding UI
 */

/** Calculate minimum bid amount (current bid + increment OR minimum bid if no bidding) */
export const calculateMinimumBid = (
  currentBid: number,
  bidIncrementValue?: string,
  minimumBid?: number
): number => {
  // If there's no current bidding (currentBid = 0), use the minimum_bid from API
  if (currentBid === 0 && minimumBid) {
    return minimumBid;
  }

  // Otherwise, calculate: current bid + increment
  const increment = bidIncrementValue ? Number(bidIncrementValue) : 100;
  return currentBid + increment;
};

/** Format currency for auction display */
export const formatAuctionCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/** Format bid count for display */
export const formatBidCount = (count: number): string => {
  return `${count} bid${count !== 1 ? "s" : ""}`;
};

/** Format time left for display */
export const formatTimeLeft = (timeLeft: string): string => {
  return timeLeft;
};

/** Get auction image sizes for responsive loading */
export const getAuctionImageSizes = (): string => {
  return "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw";
};

/** Get auction image placeholder for loading states */
export const getAuctionImagePlaceholder = (): string => {
  return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==";
};

/**
 * Transform API data to UI-ready AuctionListingItem format for listing view
 * Only processes the essential fields needed for auction cards and lists
 */
async function transformToAuctionListing(
  apiData: ApiAuctionListingResponse
): Promise<AuctionListingItem> {
  // Process image from auction_listing_images array
  let primaryImage = "/images/placeholder-auction.jpg";
  let allImages: string[] = [];

  if (
    apiData.auction_listing_images &&
    Array.isArray(apiData.auction_listing_images)
  ) {
    const processedImages = await Promise.all(
      apiData.auction_listing_images.map(async (imgItem) => {
        const processedUrl = await getImageUrl(imgItem.images.s3_key);
        return processedUrl || "";
      })
    );
    allImages = processedImages.filter(Boolean);
    primaryImage = allImages[0] || "/images/placeholder-auction.jpg";
  }

  // Calculate time left from auction end time
  const timeLeft = apiData.auction_end_time
    ? calculateTimeLeft(apiData.auction_end_time)
    : "TBD";

  // Calculate total bids from auction_bids array
  const totalBids = Array.isArray(apiData.auction_bids)
    ? apiData.auction_bids.length
    : 0;

  return {
    id: apiData.public_id,
    title: apiData.title,
    image: primaryImage,
    images: allImages,
    subcategory: apiData.subcategory,
    timeLeft,
    totalBids,
    isActive: timeLeft !== "Ended",
    auction_end_time: apiData.auction_end_time,
  };
}

/**
 * Transform API data to UI-ready AuctionDetail format for detail pages
 * Processes all fields available in fetchAuctionById for complete auction information
 */
async function transformToAuctionDetail(
  apiData: ApiAuctionDetailResponse
): Promise<AuctionDetail> {
  // Process image from auction_listing_images (single object)
  let primaryImage = "/images/placeholder-auction.jpg";
  let allImages: string[] = [];

  if (
    apiData.auction_listing_images &&
    Array.isArray(apiData.auction_listing_images)
  ) {
    const processedImages = await Promise.all(
      apiData.auction_listing_images.map(async (imgItem) => {
        const processedUrl = await getImageUrl(imgItem.images.s3_key);
        return processedUrl || "";
      })
    );
    allImages = processedImages.filter(Boolean);
    primaryImage = allImages[0] || "/images/placeholder-auction.jpg";
  }

  // Extract location from address
  const location = apiData.addresses
    ? `${apiData.addresses.city}, ${apiData.addresses.province}`
    : "Location TBD";

  // Calculate real auction data
  const timeLeft = apiData.auction_end_time
    ? calculateTimeLeft(apiData.auction_end_time)
    : "TBD";

  // Count total bids (auction_bids is an array)
  const totalBids = Array.isArray(apiData.auction_bids)
    ? apiData.auction_bids.length
    : 0;

  return {
    id: apiData.public_id,
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

    // Real auction data from API
    currentBid: Number(apiData.current_bid),
    current_bid_currency: apiData.current_bid_currency,
    bid_increment_value: apiData.bid_increment_value,
    minimum_bid: apiData.minimum_bid,
    timeLeft,
    totalBids,
    isActive: timeLeft !== "Ended",
    auction_end_time: apiData.auction_end_time,
  };
}

/**
 * Fetch auction listings for marketplace page
 * Returns clean UI-ready AuctionListingItem objects
 */
export const fetchAuctionListings = async (): Promise<AuctionListingItem[]> => {
  try {
    const client = generateClient<Schema>();

    type QueryDataInput = {
      modelName: "auction_listings";
      operation: "findMany";
      query: string;
    };

    // CRITICAL: Never modify this query structure
    const query: FindManyArgs<"auction_listings"> = {
      where: { status: "ACTIVE" },
      relationLoadStrategy: "join",
      select: {
        public_id: true,
        title: true,
        subcategory: true,
        auction_end_time: true,
        auction_bids: {
          select: {
            bid_amount: true,
          },
        },
        auction_listing_images: {
          select: {
            images: {
              select: {
                s3_key: true,
              },
            },
          },
        },
      },
      take: 10,
    };

    const input: QueryDataInput = {
      modelName: "auction_listings",
      operation: "findMany",
      query: JSON.stringify(query),
    };

    const { data: result } = await client.queries.queryData(input);

    if (result) {
      const parsedData =
        typeof result === "string" ? JSON.parse(result) : result;
      if (Array.isArray(parsedData)) {
        // Process images asynchronously for all listings
        const auctionListings = await Promise.all(
          parsedData.map(transformToAuctionListing)
        );
        return auctionListings;
      }
    }

    return [];
  } catch {
    // Silent error handling - return empty array
    return [];
  }
};

/**
 * Fetch single auction by ID for detail page
 * Returns clean UI-ready AuctionDetail object
 */
export const fetchAuctionById = async (
  publicId: string
): Promise<AuctionDetail | null> => {
  try {
    const client = generateClient<Schema>();

    type QueryDataInput = {
      modelName: "auction_listings";
      operation: "findUnique";
      query: string;
    };

    const query: FindUniqueArgs<"auction_listings"> = {
      relationLoadStrategy: "join",
      where: {
        public_id: publicId,
      },
      select: {
        public_id: true,
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

        //bidding info
        current_bid: true,
        minimum_bid: true,
        bid_increment_value: true,
        current_bid_currency: true,
        auction_bids: {
          select: {
            bid_amount: true,
            bid_amount_currency: true,
            is_winning_bid: true,
          },
        },

        //auction info
        auction_end_time: true,
        auction_status: true,

        //address info
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

        //auction images
        auction_listing_images: {
          select: {
            images: {
              select: {
                s3_key: true,
              },
            },
          },
        },
        //manifest info
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
    };

    const input: QueryDataInput = {
      modelName: "auction_listings",
      operation: "findUnique",
      query: JSON.stringify(query),
    };

    const { data: result } = await client.queries.queryData(input);

    if (result) {
      const parsedData =
        typeof result === "string" ? JSON.parse(result) : result;
      return transformToAuctionDetail(parsedData);
    }

    return null;
  } catch {
    return null;
  }
};

// Define supported currency types based on the currency_code_type enum
export type SupportedCurrency =
  | "USD"
  | "CAD"
  | "MXN"
  | "GBP"
  | "EUR"
  | "CHF"
  | "DKK"
  | "CZK"
  | "RUB"
  | "TRY"
  | "INR"
  | "CNY"
  | "HKD"
  | "ILS"
  | "KRW"
  | "SGD"
  | "JPY"
  | "AUD"
  | "NZD";

/**
 * Validates if the provided currency is supported
 */
export const isValidCurrency = (
  currency?: string
): currency is SupportedCurrency => {
  const validCurrencies: SupportedCurrency[] = [
    "USD",
    "CAD",
    "MXN",
    "GBP",
    "EUR",
    "CHF",
    "DKK",
    "CZK",
    "RUB",
    "TRY",
    "INR",
    "CNY",
    "HKD",
    "ILS",
    "KRW",
    "SGD",
    "JPY",
    "AUD",
    "NZD",
  ];
  return (
    currency !== undefined &&
    validCurrencies.includes(currency as SupportedCurrency)
  );
};

/**
 * Fetch auction bids for a specific auction
 */
export const fetchAuctionBids = async (
  auctionPublicId: string
): Promise<AuctionBid[]> => {
  try {
    const client = generateClient<Schema>();

    type AuctionQueryDataInput = {
      modelName: "auction_listings";
      operation: "findUnique";
      query: string;
    };

    type BidsQueryDataInput = {
      modelName: "auction_bids";
      operation: "findMany";
      query: string;
    };

    // First get the auction listing to get the internal ID
    const auctionQuery: FindUniqueArgs<"auction_listings"> = {
      where: { public_id: auctionPublicId },
      select: {
        auction_listing_id: true,
      },
    };

    const auctionInput: AuctionQueryDataInput = {
      modelName: "auction_listings",
      operation: "findUnique",
      query: JSON.stringify(auctionQuery),
    };

    const { data: auctionResult } =
      await client.queries.queryData(auctionInput);

    if (!auctionResult) {
      return [];
    }

    const auctionData =
      typeof auctionResult === "string"
        ? JSON.parse(auctionResult)
        : auctionResult;

    if (!auctionData?.auction_listing_id) {
      return [];
    }

    // Now fetch the bids for this auction
    const bidsQuery: FindManyArgs<"auction_bids"> = {
      where: {
        auction_listing_id: auctionData.auction_listing_id,
      },
      orderBy: {
        bid_timestamp: "desc",
      },
      select: {
        public_id: true,
        bid_amount: true,
        bid_amount_currency: true,
        bid_timestamp: true,
        is_winning_bid: true,
        // Use related user's public_id instead of revealing internal user_id
        users_auction_bids_bidder_user_idTousers: {
          select: {
            public_id: true,
          },
        },
      },
    };

    const bidsInput: BidsQueryDataInput = {
      modelName: "auction_bids",
      operation: "findMany",
      query: JSON.stringify(bidsQuery),
    };

    const { data: bidsResult } = await client.queries.queryData(bidsInput);

    if (!bidsResult) {
      return [];
    }

    const bidsData =
      typeof bidsResult === "string" ? JSON.parse(bidsResult) : bidsResult;

    if (!Array.isArray(bidsData)) {
      return [];
    }

    // Transform to UI-ready format with anonymized bidder names
    const bidderMap = new Map<string, string>();
    let bidderCounter = 1;

    return bidsData.map((bid: any) => {
      // Create anonymized bidder name, keyed by user public_id
      const bidderPublicId =
        bid?.users_auction_bids_bidder_user_idTousers?.public_id || "unknown";
      let bidderName = bidderMap.get(bidderPublicId);
      if (!bidderName) {
        bidderName = `Bidder ${bidderCounter}`;
        bidderMap.set(bidderPublicId, bidderName);
        bidderCounter++;
      }

      return {
        id: bid.public_id,
        bidAmount: Number(bid.bid_amount),
        currency: bid.bid_amount_currency || "USD",
        timestamp: bid.bid_timestamp,
        isWinning: bid.is_winning_bid,
        bidderName,
        // Expose only public_id to the UI to avoid leaking internal user IDs
        bidderId: bidderPublicId,
      };
    });
  } catch (error) {
    console.error("Error fetching auction bids:", error);
    return [];
  }
};

/**
 * Place a bid on an auction
 */
export const bidOnAuction = async (bidData: {
  auctionId: string;
  bidAmount: number;
  bidAmountCurrency?: string;
  bidType?: string;
  auctionTitle?: string;
  currentBid?: number;
  minimumBid?: number;
  bidIncrementValue?: string;
}) => {
  try {
    const client = generateClient<Schema>({ authMode: "userPool" });
    const currentUser = await getCurrentUser();

    // Validate and ensure currency is supported - explicitly typed
    const currency: SupportedCurrency = isValidCurrency(
      bidData.bidAmountCurrency
    )
      ? bidData.bidAmountCurrency
      : "USD";

    const { data: result, errors: createErrors } =
      await client.queries.placeBid({
        auctionListingId: bidData.auctionId,
        cognitoId: currentUser.userId,
        bidAmount: bidData.bidAmount,
        bidAmountCurrency: currency,
        bidType: "REGULAR",
      });

    if (process.env.NODE_ENV === "development" && (result || createErrors)) {
      // Debug bid result and errors
    }

    return { data: result, errors: createErrors };
  } catch (error) {
    return { data: null, errors: error };
  }
};
