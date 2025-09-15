import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";

import { env } from "$amplify/env/place-bid";
import { Amplify } from "aws-amplify";

import type { Schema } from "../../data/resource";
import { importModuleFromLayer } from "../commons/importLayer";
import { AuctionBidDatabaseOperations } from "../commons/operations/auctions/AuctionBidDatabaseOperations";
import {
  AuctionBidOperations,
  PlaceBidConfig,
} from "../commons/operations/auctions/AuctionBidOperations";
import { notificationService } from "../commons/utilities/UnifiedNotificationService";

type DatabaseConnectionDetails = {
  databaseName: string;
  hostname: string;
  port: number;
  username: string;
  password: string;
};

const { resourceConfig, libraryOptions } =
  await getAmplifyDataClientConfig(env);

Amplify.configure(
  {
    ...resourceConfig,
    Auth: {
      Cognito: {
        userPoolId: env.AMPLIFY_USERPOOL_ID,
        userPoolClientId: env.AMPLIFY_USERPOOL_CLIENT_ID,
      },
    },
  },
  libraryOptions
);

export const handler: Schema["placeBid"]["functionHandler"] = async (
  event,
  context
) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);

  try {
    // Initialize database connection
    const dbConnectionDetails: DatabaseConnectionDetails = JSON.parse(
      env.DB_CONNECTION_DETAILS
    );
    const prismaDataSourceUrl = `postgresql://${dbConnectionDetails.username}:${dbConnectionDetails.password}@${dbConnectionDetails.hostname}:${dbConnectionDetails.port}/${dbConnectionDetails.databaseName}?schema=public`;

    const prismaClient = (await importModuleFromLayer())?.prismaClient(
      prismaDataSourceUrl
    )!;

    if (!prismaClient) {
      throw new Error("Failed to initialize database connection");
    }

    // Extract and validate arguments
    const {
      auctionListingId: auctionListingPublicId,
      bidderUserId,
      bidderBuyerProfileId,
      cognitoId,
      bidAmount,
      bidAmountCurrency,
      bidType,
    } = event.arguments;

    // Validate required arguments
    if (
      !auctionListingPublicId ||
      !bidAmount ||
      !bidAmountCurrency ||
      !bidType
    ) {
      return JSON.stringify({
        success: false,
        error: {
          code: "INVALID_ARGUMENTS",
          message:
            "Missing required arguments: auctionListingId, bidAmount, bidAmountCurrency, and bidType are required",
        },
      });
    }

    // Resolve auction listing public_id to internal auction_listing_id
    const auctionListing = await prismaClient.auction_listings.findUnique({
      where: { public_id: auctionListingPublicId },
      select: { auction_listing_id: true },
    });

    if (!auctionListing) {
      return JSON.stringify({
        success: false,
        error: {
          code: "AUCTION_NOT_FOUND",
          message: `Auction listing not found for ID: ${auctionListingPublicId}`,
        },
      });
    }

    const auctionListingId = auctionListing.auction_listing_id;

    // Resolve user and profile IDs if not provided
    let finalBidderUserId = bidderUserId;
    let finalBidderBuyerProfileId = bidderBuyerProfileId;

    if (
      (!bidderUserId || bidderUserId.trim() === "") &&
      (!bidderBuyerProfileId || bidderBuyerProfileId.trim() === "")
    ) {
      if (cognitoId) {
        const user = await prismaClient.users.findUnique({
          relationLoadStrategy: "join",
          where: {
            cognito_id: cognitoId,
          },
          select: {
            user_id: true,
            buyer_profiles: {
              select: {
                buyer_profile_id: true,
              },
            },
          },
        });

        if (user) {
          finalBidderUserId = user.user_id;
          finalBidderBuyerProfileId = user.buyer_profiles?.buyer_profile_id;
        } else {
          return JSON.stringify({
            success: false,
            error: {
              code: "USER_NOT_FOUND",
              message: `User not found for cognitoId: ${cognitoId}`,
            },
          });
        }
      } else {
        return JSON.stringify({
          success: false,
          error: {
            code: "MISSING_USER_INFO",
            message:
              "bidderUserId, bidderBuyerProfileId, and cognitoId are all missing or empty",
          },
        });
      }
    }

    // Validate that we have all required user information
    if (!finalBidderUserId || !finalBidderBuyerProfileId) {
      return JSON.stringify({
        success: false,
        error: {
          code: "INCOMPLETE_USER_INFO",
          message: "Could not resolve bidder user ID or buyer profile ID",
        },
      });
    }

    // Validate bid amount is positive
    if (bidAmount <= 0) {
      return JSON.stringify({
        success: false,
        error: {
          code: "INVALID_BID_AMOUNT",
          message: "Bid amount must be greater than zero",
        },
      });
    }

    // Validate bid type
    if (!["REGULAR", "BUY_NOW"].includes(bidType)) {
      return JSON.stringify({
        success: false,
        error: {
          code: "INVALID_BID_TYPE",
          message: "Bid type must be either 'REGULAR' or 'BUY_NOW'",
        },
      });
    }

    // Create bid configuration
    const bidConfig: PlaceBidConfig = {
      auctionListingId,
      bidderUserId: finalBidderUserId,
      bidderBuyerProfileId: finalBidderBuyerProfileId,
      bidAmount,
      bidAmountCurrency,
      bidType,
    };

    // Initialize auction bid operations
    const auctionBidOps = new AuctionBidOperations(prismaClient);
    const auctionDbOps = new AuctionBidDatabaseOperations(prismaClient);

    // Start getting current winning bidders in parallel with bid placement
    // This is needed to identify who will be outbid by the new bid
    const previousWinnersPromise = prismaClient.auction_bids
      .findMany({
        where: {
          auction_listing_id: auctionListingId,
          is_winning_bid: true,
          bid_amount: { lt: bidAmount }, // Only get bids that will be outbid
          bidder_user_id: { not: finalBidderUserId }, // Exclude current bidder
        },
        select: {
          bidder_user_id: true,
          bid_amount: true,
        },
      })
      .then((currentWinningBids) =>
        currentWinningBids.map((bid) => ({
          userId: bid.bidder_user_id,
          bidAmount: Number(bid.bid_amount),
        }))
      )
      .catch((error) => {
        console.error(
          "Error fetching previous winners for outbid notifications:",
          error
        );
        return []; // Return empty array if query fails
      });

    // Place the bid with retry mechanism for concurrent conflicts
    let result = await auctionBidOps.placeBid(bidConfig);
    let retryCount = 0;
    const maxRetries = 3;

    // Retry on concurrent bid conflicts
    while (
      !result.success &&
      retryCount < maxRetries &&
      (result.error?.code === "CONCURRENT_BID_CONFLICT" ||
        result.error?.code === "TRANSACTION_CONFLICT")
    ) {
      retryCount++;
      console.log(
        `Bid conflict detected, retrying ${retryCount}/${maxRetries}`
      );

      // Wait a short random time before retry to reduce contention
      await new Promise((resolve) =>
        setTimeout(resolve, Math.random() * 100 + 50)
      );

      result = await auctionBidOps.placeBid(bidConfig);
    }

    if (!result.success) {
      return JSON.stringify({
        success: false,
        error: {
          ...result.error,
          ...(retryCount > 0 && { retryAttempts: retryCount }),
        },
      });
    }

    // Get updated auction details for response
    const auctionDetails = await auctionDbOps.getAuctionDetailsPublic(
      auctionListingId,
      finalBidderUserId
    );

    // Send all notifications in parallel
    await sendBidNotifications(
      auctionListingPublicId,
      auctionListingId,
      finalBidderUserId,
      bidAmount,
      bidAmountCurrency,
      result,
      previousWinnersPromise,
      auctionDetails?.title || ""
    );

    // Handle Buy Now success case
    if (bidType === "BUY_NOW" && result.success) {
      try {
        // Create order for buy now
        const orderResult = await auctionDbOps.createOrderFromAuction(
          auctionListingId,
          finalBidderUserId,
          finalBidderBuyerProfileId,
          bidAmount,
          bidAmountCurrency
        );

        return JSON.stringify({
          success: true,
          data: {
            auction_bid_id: result.bidPublicId,
            auction_won: true,
            order_created: true,
            order_id: orderResult.order_id,
            order_number: orderResult.order_number,
            bid_amount: bidAmount,
            bid_amount_currency: bidAmountCurrency,
            bid_type: bidType,
            is_winning_bid: result.isWinningBid,
            bid_timestamp: new Date().toISOString(),
            auction_details: auctionDetails,
          },
        });
      } catch (orderError) {
        console.error("Error creating order after buy now:", orderError);
        // Bid was successful but order creation failed
        return JSON.stringify({
          success: true,
          data: {
            auction_bid_id: result.bidPublicId,
            auction_won: true,
            order_created: false,
            order_creation_error:
              "Order creation failed but bid was successful",
            bid_amount: bidAmount,
            bid_amount_currency: bidAmountCurrency,
            bid_type: bidType,
            is_winning_bid: result.isWinningBid,
            bid_timestamp: new Date().toISOString(),
            auction_details: auctionDetails,
          },
        });
      }
    }

    // Regular bid success response
    return JSON.stringify({
      success: true,
      data: {
        auction_bid_id: result.bidPublicId,
        bid_amount: bidAmount,
        bid_amount_currency: bidAmountCurrency,
        bid_type: bidType,
        is_winning_bid: result.isWinningBid,
        bid_timestamp: new Date().toISOString(),
        auction_details: auctionDetails,
        created_at: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error("Error occurred while placing bid");
    console.error(err);

    return JSON.stringify({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An internal error occurred while placing the bid",
        details: {
          error: err instanceof Error ? err.message : String(err),
        },
      },
    });
  }
};

/**
 * Send all bid-related notifications in parallel
 */
async function sendBidNotifications(
  auctionListingPublicId: string,
  auctionListingId: string,
  finalBidderUserId: string,
  bidAmount: number,
  bidAmountCurrency: string,
  result: { isWinningBid?: boolean },
  previousWinnersPromise: Promise<Array<{ userId: string; bidAmount: number }>>,
  auctionTitle: string
): Promise<void> {
  try {
    // Get current high bid from auction details
    const currentHighBid = result.isWinningBid ? bidAmount : bidAmount; // For now, use current bid amount

    // Await the previous winners query that was started in parallel
    const previousWinners = await previousWinnersPromise;

    // Create notification promises to run in parallel
    const notificationPromises: Promise<void>[] = [];

    // Send notification to seller about the new bid
    notificationPromises.push(
      notificationService
        .sendBidPlacedNotification({
          auctionId: auctionListingPublicId,
          auctionTitle: auctionTitle,
          sellerId: "", // Will be fetched in notification processor
          bidderId: finalBidderUserId,
          bidderName: "", // Will be fetched in notification processor
          bidAmount: bidAmount,
          currency: bidAmountCurrency,
          currentHighBid: currentHighBid,
          timeRemaining: 0, // Will be calculated in notification processor
          auctionListingId: auctionListingId, // Pass internal auction listing ID for database lookups
        })
        .catch((notificationError) => {
          console.error(
            "Failed to send seller bid notification:",
            notificationError
          );
          // Don't fail the bid placement if notification fails
        })
    );

    // Send confirmation notification to buyer
    notificationPromises.push(
      notificationService
        .sendBidConfirmationNotification({
          auctionId: auctionListingPublicId,
          auctionTitle: auctionTitle,
          bidderId: finalBidderUserId,
          bidAmount: bidAmount,
          currency: bidAmountCurrency,
          currentHighBid: currentHighBid,
          timeRemaining: 0, // Will be calculated in notification processor
          isWinningBid: result.isWinningBid || false,
          auctionListingId: auctionListingId, // Pass internal auction listing ID for database lookups
        })
        .catch((notificationError) => {
          console.error(
            "Failed to send buyer confirmation notification:",
            notificationError
          );
          // Don't fail the bid placement if notification fails
        })
    );

    // Send outbid notifications to previous winners
    if (previousWinners.length > 0) {
      previousWinners.forEach((previousWinner) => {
        notificationPromises.push(
          notificationService
            .sendOutbidNotification({
              auctionId: auctionListingPublicId,
              auctionTitle: auctionTitle,
              outbidUserId: previousWinner.userId,
              previousBidAmount: previousWinner.bidAmount,
              newHighBid: bidAmount,
              currency: bidAmountCurrency,
              timeRemaining: 0, // Will be calculated in notification processor
              auctionListingId: auctionListingId, // Pass internal auction listing ID for database lookups
            })
            .catch((notificationError) => {
              console.error(
                `Failed to send outbid notification to user ${previousWinner.userId}:`,
                notificationError
              );
              // Don't fail the bid placement if notification fails
            })
        );
      });
    }

    // Execute all notifications in parallel
    await Promise.allSettled(notificationPromises);
  } catch (notificationError) {
    console.error("Error preparing notifications:", notificationError);
    // Don't fail the bid placement if notification preparation fails
  }
}
