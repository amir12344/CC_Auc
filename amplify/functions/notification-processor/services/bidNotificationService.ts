import { PrismaClient } from "../../lambda-layers/core-layer/nodejs/prisma/generated/client";
import {
  BidPlacedEmailData,
  BuyerBidConfirmationEmailData,
  OutbidEmailData,
} from "../email-templates/BidPlacedEmails";

export class BidNotificationService {
  /**
   * Fetch complete bid notification data by auction listing ID using Prisma
   */
  static async getBidNotificationData(
    auctionListingId: string,
    bidderId: string,
    prismaClient: PrismaClient
  ): Promise<BidPlacedEmailData | null> {
    try {
      // Fetch auction and seller details for notification
      const auctionWithSeller = await prismaClient.auction_listings.findUnique({
        where: { auction_listing_id: auctionListingId },
        select: {
          title: true,
          users_auction_listings_seller_user_idTousers: {
            select: {
              user_id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          auction_end_time: true,
        },
      });

      if (!auctionWithSeller?.users_auction_listings_seller_user_idTousers) {
        console.error(
          `Auction or seller not found for auction ID: ${auctionListingId}`
        );
        return null;
      }

      // Get bidder name for notification
      const bidder = await prismaClient.users.findUnique({
        where: { user_id: bidderId },
        select: {
          first_name: true,
          last_name: true,
        },
      });

      // Calculate time remaining in seconds
      const timeRemaining = auctionWithSeller.auction_end_time
        ? Math.max(
            0,
            Math.floor(
              (new Date(auctionWithSeller.auction_end_time).getTime() -
                new Date().getTime()) /
                1000
            )
          )
        : 0;

      // Create bidder display name
      const bidderName = bidder
        ? `${bidder.first_name || ""} ${bidder.last_name || ""}`.trim() ||
          "Anonymous Bidder"
        : "Anonymous Bidder";

      // Create seller display name
      const seller =
        auctionWithSeller.users_auction_listings_seller_user_idTousers;
      const sellerName =
        `${seller.first_name || ""} ${seller.last_name || ""}`.trim() ||
        "Seller";

      return {
        sellerName,
        sellerEmail: seller.email,
        auctionTitle: auctionWithSeller.title,
        bidderName,
        bidAmount: 0, // Will be populated from notification data
        currency: "", // Will be populated from notification data
        currentHighBid: 0, // Will be populated from notification data
        timeRemaining,
      };
    } catch (error) {
      console.error("Error fetching bid notification data:", error);
      return null;
    }
  }

  /**
   * Fetch buyer bid confirmation data by bidder ID using Prisma
   */
  static async getBuyerBidConfirmationData(
    auctionListingId: string,
    bidderId: string,
    prismaClient: PrismaClient
  ): Promise<BuyerBidConfirmationEmailData | null> {
    try {
      // Fetch auction details
      const auction = await prismaClient.auction_listings.findUnique({
        where: { auction_listing_id: auctionListingId },
        select: {
          title: true,
          auction_end_time: true,
        },
      });

      if (!auction) {
        console.error(`Auction not found for auction ID: ${auctionListingId}`);
        return null;
      }

      // Get buyer information
      const buyer = await prismaClient.users.findUnique({
        where: { user_id: bidderId },
        select: {
          first_name: true,
          last_name: true,
          email: true,
        },
      });

      if (!buyer) {
        console.error(`Buyer not found for buyer ID: ${bidderId}`);
        return null;
      }

      // Calculate time remaining in seconds
      const timeRemaining = auction.auction_end_time
        ? Math.max(
            0,
            Math.floor(
              (new Date(auction.auction_end_time).getTime() -
                new Date().getTime()) /
                1000
            )
          )
        : 0;

      // Create buyer display name
      const buyerName =
        `${buyer.first_name || ""} ${buyer.last_name || ""}`.trim() || "Bidder";

      return {
        buyerName,
        buyerEmail: buyer.email,
        auctionTitle: auction.title,
        bidAmount: 0, // Will be populated from notification data
        currency: "", // Will be populated from notification data
        currentHighBid: 0, // Will be populated from notification data
        timeRemaining,
        isWinningBid: false, // Will be populated from notification data
      };
    } catch (error) {
      console.error("Error fetching buyer bid confirmation data:", error);
      return null;
    }
  }

  /**
   * Get all users who are now outbid by a new bid
   * Returns users who had winning bids but are no longer winning
   */
  static async getOutbidUsers(
    auctionListingId: string,
    newBidAmount: number,
    newBidderId: string,
    prismaClient: PrismaClient
  ): Promise<OutbidEmailData[]> {
    try {
      // Get auction details
      const auction = await prismaClient.auction_listings.findUnique({
        where: { auction_listing_id: auctionListingId },
        select: {
          title: true,
          auction_end_time: true,
        },
      });

      if (!auction) {
        console.error(`Auction not found for auction ID: ${auctionListingId}`);
        return [];
      }

      // Find all users who had bids on this auction that are now outbid
      // We need users who:
      // 1. Have placed bids on this auction
      // 2. Their highest bid is less than the new bid amount
      // 3. Are not the new bidder
      // 4. Were previously winning (had the highest bid before this new bid)

      const outbidUsers = await prismaClient.auction_bids.findMany({
        where: {
          auction_listing_id: auctionListingId,
          bidder_user_id: {
            not: newBidderId, // Exclude the new bidder
          },
          is_winning_bid: true, // Only get users who were previously winning
        },
        select: {
          bidder_user_id: true,
          bid_amount: true,
          users_auction_bids_bidder_user_idTousers: {
            select: {
              first_name: true,
              last_name: true,
              email: true,
            },
          },
        },
      });

      // Calculate time remaining
      const timeRemaining = auction.auction_end_time
        ? Math.max(
            0,
            Math.floor(
              (new Date(auction.auction_end_time).getTime() -
                new Date().getTime()) /
                1000
            )
          )
        : 0;

      // Convert to OutbidEmailData format
      return outbidUsers.map((bid) => {
        const user = bid.users_auction_bids_bidder_user_idTousers;
        const buyerName =
          `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Bidder";

        return {
          buyerName,
          buyerEmail: user.email,
          auctionTitle: auction.title,
          previousBidAmount: Number(bid.bid_amount),
          newHighBid: newBidAmount,
          currency: "", // Will be populated from notification data
          timeRemaining,
        };
      });
    } catch (error) {
      console.error("Error fetching outbid users:", error);
      return [];
    }
  }

  /**
   * Fetch outbid email data for a specific user
   */
  static async getOutbidEmailData(
    auctionListingId: string,
    outbidUserId: string,
    newHighBid: number,
    prismaClient: PrismaClient
  ): Promise<OutbidEmailData | null> {
    try {
      // Get auction details
      const auction = await prismaClient.auction_listings.findUnique({
        where: { auction_listing_id: auctionListingId },
        select: {
          title: true,
          auction_end_time: true,
        },
      });

      if (!auction) {
        console.error(`Auction not found for auction ID: ${auctionListingId}`);
        return null;
      }

      // Get user's previous bid amount and user details
      const userBid = await prismaClient.auction_bids.findFirst({
        where: {
          auction_listing_id: auctionListingId,
          bidder_user_id: outbidUserId,
        },
        orderBy: {
          bid_amount: "desc", // Get their highest bid
        },
        select: {
          bid_amount: true,
          users_auction_bids_bidder_user_idTousers: {
            select: {
              first_name: true,
              last_name: true,
              email: true,
            },
          },
        },
      });

      if (!userBid) {
        console.error(`User bid not found for user ID: ${outbidUserId}`);
        return null;
      }

      // Calculate time remaining
      const timeRemaining = auction.auction_end_time
        ? Math.max(
            0,
            Math.floor(
              (new Date(auction.auction_end_time).getTime() -
                new Date().getTime()) /
                1000
            )
          )
        : 0;

      const user = userBid.users_auction_bids_bidder_user_idTousers;
      const buyerName =
        `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Bidder";

      return {
        buyerName,
        buyerEmail: user.email,
        auctionTitle: auction.title,
        previousBidAmount: Number(userBid.bid_amount),
        newHighBid: newHighBid,
        currency: "", // Will be populated from notification data
        timeRemaining,
      };
    } catch (error) {
      console.error("Error fetching outbid email data:", error);
      return null;
    }
  }
}
