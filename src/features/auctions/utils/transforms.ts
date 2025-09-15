import type { AuctionListingItem } from "@/src/features/auctions/types";

export const calculateTimeLeft = (endTime: string): string => {
  const now = new Date();
  const end = new Date(endTime);
  const diff = end.getTime() - now.getTime();
  if (diff <= 0) return "Ended";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

export async function mapApiToAuctionListing(
  apiData: {
    public_id: string;
    title: string;
    category?: string | null;
    subcategory?: string | null;
    lot_condition?: string | null;
    addresses?: {
      city?: string | null;
      province?: string | null;
      province_code?: string | null;
      country?: string | null;
      country_code?: string | null;
    } | null;
    auction_end_time?: string;
    auction_bids?: Array<{ bid_amount?: number }>;
    auction_listing_images?: Array<{ images: { s3_key: string } }>;
  },
  getImageUrl: (s3Key: string) => Promise<string | null>
): Promise<AuctionListingItem> {
  let primaryImage = "/images/placeholder-auction.jpg";
  let allImages: string[] = [];
  if (
    apiData.auction_listing_images &&
    Array.isArray(apiData.auction_listing_images)
  ) {
    const processed = await Promise.all(
      apiData.auction_listing_images.map(
        async (img) => (await getImageUrl(img.images.s3_key)) || ""
      )
    );
    allImages = processed.filter(Boolean);
    primaryImage = allImages[0] || "/images/placeholder-auction.jpg";
  }

  const timeLeft = apiData.auction_end_time
    ? calculateTimeLeft(apiData.auction_end_time)
    : "TBD";
  const totalBids = Array.isArray(apiData.auction_bids)
    ? apiData.auction_bids.length
    : 0;

  return {
    id: apiData.public_id,
    title: apiData.title,
    image: primaryImage,
    images: allImages,
    category: apiData.category ?? null,
    subcategory: apiData.subcategory ?? undefined,
    timeLeft,
    totalBids,
    isActive: timeLeft !== "Ended",
    auction_end_time: apiData.auction_end_time,
    lot_condition: apiData.lot_condition ?? null,
    addresses: apiData.addresses ?? null,
  };
}
