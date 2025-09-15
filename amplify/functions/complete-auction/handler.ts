import {
  DeleteScheduleCommand,
  SchedulerClient,
} from "@aws-sdk/client-scheduler";

import { env } from "$amplify/env/complete-auction";

import { importModuleFromLayer } from "../commons/importLayer";
import { UnifiedNotificationService } from "../commons/utilities/UnifiedNotificationService";

type DatabaseConnectionDetails = {
  databaseName: string;
  hostname: string;
  port: number;
  username: string;
  password: string;
};

interface CompleteAuctionEvent {
  auctionListingId: string;
  triggerSource: "SCHEDULER" | "MANUAL";
  triggerUserId?: string; // For manual triggers
}

interface AuctionCompletionResult {
  success: boolean;
  auctionId: string;
  orderId?: string;
  winnerId?: string;
  errorMessage?: string;
  details: {
    auctionUpdated: boolean;
    orderCreated: boolean;
    notificationSent: boolean;
    eventBridgeScheduleDeleted: boolean;
  };
}

export const handler = async (
  event: CompleteAuctionEvent
): Promise<AuctionCompletionResult> => {
  console.log(`EVENT: ${JSON.stringify(event)}`);

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

  const schedulerClient = new SchedulerClient({ region: env.AWS_REGION });
  const notificationService = new UnifiedNotificationService();

  const result: AuctionCompletionResult = {
    success: false,
    auctionId: event.auctionListingId,
    details: {
      auctionUpdated: false,
      orderCreated: false,
      notificationSent: false,
      eventBridgeScheduleDeleted: false,
    },
  };

  try {
    console.log(
      `Starting auction completion for auction: ${event.auctionListingId}`
    );

    // 1. Get auction details with only needed fields for performance
    const auction = await prismaClient.auction_listings.findUnique({
      where: { auction_listing_id: event.auctionListingId },
      select: {
        title: true,
        auction_status: true,
        seller_user_id: true,
        seller_profile_id: true,
        current_bid_currency: true,
        shipping_cost: true,
        shipping_cost_currency: true,
        minimum_bid_currency: true,

        // Only needed seller fields
        users_auction_listings_seller_user_idTousers: {
          select: {
            email: true,
            first_name: true,
            last_name: true,
          },
        },

        // Only needed auction bids for winner determination
        auction_bids: {
          where: { is_winning_bid: true },
          orderBy: { bid_timestamp: "desc" },
          take: 1,
          select: {
            bidder_user_id: true,
            bidder_buyer_profile_id: true,
            bid_amount: true,
            bid_amount_currency: true,
            users_auction_bids_bidder_user_idTousers: {
              select: {
                email: true,
                first_name: true,
                last_name: true,
              },
            },
          },
        },

        // Product manifests for order creation
        auction_listing_product_manifests: {
          select: {
            auction_listing_product_manifest_id: true,
            available_quantity: true,
          },
        },
      },
    });

    if (!auction) {
      throw new Error(`Auction not found: ${event.auctionListingId}`);
    }

    // Validate auction can be completed
    if (auction.auction_status === "ENDED") {
      console.log(`Auction ${event.auctionListingId} is already completed`);
      result.success = true;
      result.details.auctionUpdated = true;
      return result;
    }

    if (auction.auction_status === "CANCELLED") {
      throw new Error(
        `Cannot complete cancelled auction: ${event.auctionListingId}`
      );
    }

    // 2. Determine the winner (highest bidder)
    const winningBid = auction.auction_bids[0]; // Already ordered by timestamp desc
    let hasWinner = false;
    let winnerId: string | null = null;
    let winnerBuyerProfileId: string | null = null;
    let finalBidAmount: number | null = null;

    if (winningBid) {
      hasWinner = true;
      winnerId = winningBid.bidder_user_id;
      winnerBuyerProfileId = winningBid.bidder_buyer_profile_id;
      finalBidAmount = Number(winningBid.bid_amount);
      result.winnerId = winnerId;

      console.log(`Winner found: User ${winnerId} with bid $${finalBidAmount}`);
    } else {
      console.log(`No bids found for auction ${event.auctionListingId}`);
    }

    // 3. Start database transaction for atomic updates
    await prismaClient.$transaction(async (tx) => {
      // 3a. Update auction status and winner information
      await tx.auction_listings.update({
        where: { auction_listing_id: event.auctionListingId },
        data: {
          auction_status: "ENDED",
          winner_user_id: winnerId,
          winner_buyer_profile_id: winnerBuyerProfileId,
          updated_at: new Date(),
        },
      });

      console.log(`Updated auction status to ENDED`);
      result.details.auctionUpdated = true;

      // 3b. Create order if there's a winner
      if (hasWinner && winnerId && winnerBuyerProfileId && finalBidAmount) {
        // Calculate totals
        const totalAmount = finalBidAmount;
        const shippingCost = Number(auction.shipping_cost || 0);
        const taxAmount = 0; // TODO: Tax calculation can be added here if needed

        // Create order
        const order = await tx.orders.create({
          data: {
            buyer_user_id: winnerId,
            buyer_profile_id: winnerBuyerProfileId,
            seller_user_id: auction.seller_user_id,
            seller_profile_id: auction.seller_profile_id,
            auction_listing_id: event.auctionListingId,
            order_type: "AUCTION",
            order_status: "PENDING",
            total_amount: totalAmount,
            total_amount_currency: auction.current_bid_currency || "USD",
            shipping_cost: shippingCost,
            shipping_cost_currency: auction.shipping_cost_currency || "USD",
            tax_amount: taxAmount,
            tax_amount_currency: "USD",
            shipping_address_id: undefined, // TODO: To be filled by buyer later
            billing_address_id: undefined, // TODO: To be filled by buyer later
            payment_due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            created_at: new Date(),
            updated_at: new Date(),
          },
        });

        result.orderId = order.order_id;
        console.log(`Created order: ${order.order_number}`);

        // Create order items from auction manifests
        if (auction.auction_listing_product_manifests.length > 0) {
          const orderItems = auction.auction_listing_product_manifests.map(
            (manifest) => ({
              order_id: order.order_id,
              auction_listing_product_manifest_id:
                manifest.auction_listing_product_manifest_id,
              quantity: manifest.available_quantity || 1,
              unit_price: finalBidAmount / (manifest.available_quantity || 1),
              unit_price_currency: auction.current_bid_currency || "USD",
              total_price: finalBidAmount,
              total_price_currency: auction.current_bid_currency || "USD",
              created_at: new Date(),
            })
          );

          await tx.order_items.createMany({
            data: orderItems,
          });

          console.log(`Created ${orderItems.length} order items`);
        }

        // Create order status history
        await tx.order_status_history.create({
          data: {
            order_id: order.order_id,
            previous_status: undefined,
            new_status: "PENDING",
            changed_by_user_id: winnerId,
            change_reason: "Order created from auction completion",
            timestamp: new Date(),
          },
        });

        result.details.orderCreated = true;
      }

      // 3c. Update all non-winning bids to not winning
      await tx.auction_bids.updateMany({
        where: {
          auction_listing_id: event.auctionListingId,
          is_winning_bid: true,
          ...(winnerId ? { NOT: { bidder_user_id: winnerId } } : {}),
        },
        data: {
          is_winning_bid: false,
        },
      });

      // 3d. Create auction bid history entry for completion
      if (hasWinner && winningBid) {
        await tx.auction_bid_history.create({
          data: {
            auction_listing_id: event.auctionListingId,
            previous_bid_amount: undefined,
            new_bid_amount: winningBid.bid_amount,
            bid_amount_currency: winningBid.bid_amount_currency,
            bidder_user_id: winningBid.bidder_user_id,
            action_type: "AUCTION_WON",
            timestamp: new Date(),
            created_at: new Date(),
          },
        });
      } else {
        // Create history entry for auction ended without winner
        await tx.auction_bid_history.create({
          data: {
            auction_listing_id: event.auctionListingId,
            previous_bid_amount: undefined,
            new_bid_amount: 0,
            bid_amount_currency: auction.minimum_bid_currency || "USD",
            bidder_user_id: auction.seller_user_id, // Use seller as placeholder
            action_type: "AUCTION_ENDED",
            timestamp: new Date(),
            created_at: new Date(),
          },
        });
      }
    });

    // 4. Send multi-channel notifications
    try {
      // Get user notification preferences
      // TODO: send notifications based on user's preferences

      // Send notification to winner (if any)
      if (hasWinner && winnerId && winningBid) {
        // High-value auctions get more channels
        const winnerChannels =
          finalBidAmount! >= 1000
            ? ["EMAIL", "WEB", "PUSH", "SMS"]
            : ["EMAIL", "WEB", "PUSH"];

        await notificationService.sendAuctionWinnerNotification(
          {
            auctionId: event.auctionListingId,
            auctionTitle: auction.title,
            winnerId: winnerId,
            winnerEmail:
              winningBid.users_auction_bids_bidder_user_idTousers.email,
            winnerName:
              `${winningBid.users_auction_bids_bidder_user_idTousers.first_name || ""} ${winningBid.users_auction_bids_bidder_user_idTousers.last_name || ""}`.trim(),
            finalBidAmount: Number(finalBidAmount),
            currency: winningBid.bid_amount_currency || "USD",
            orderId: result.orderId!,
            sellerInfo: {
              userId: auction.seller_user_id,
              email: auction.users_auction_listings_seller_user_idTousers.email,
              name: `${auction.users_auction_listings_seller_user_idTousers.first_name || ""} ${auction.users_auction_listings_seller_user_idTousers.last_name || ""}`.trim(),
            },
          },
          winnerChannels
        );
      }

      // Send notification to seller
      const sellerChannels = hasWinner
        ? ["EMAIL", "WEB", "PUSH"] // Sold - multiple channels
        : ["EMAIL", "WEB"]; // No bids - fewer channels

      // TODO: Use public ids and Order Number
      await notificationService.sendAuctionSellerNotification(
        {
          auctionId: event.auctionListingId,
          auctionTitle: auction.title,
          sellerId: auction.seller_user_id,
          sellerEmail:
            auction.users_auction_listings_seller_user_idTousers.email,
          sellerName:
            `${auction.users_auction_listings_seller_user_idTousers.first_name || ""} ${auction.users_auction_listings_seller_user_idTousers.last_name || ""}`.trim(),
          hasWinner,
          ...(hasWinner && {
            finalBidAmount: Number(finalBidAmount),
            currency: winningBid?.bid_amount_currency || "USD",
            orderId: result.orderId,
            winnerInfo: {
              userId: winnerId,
              email: winningBid?.users_auction_bids_bidder_user_idTousers.email,
              name: `${winningBid?.users_auction_bids_bidder_user_idTousers.first_name || ""} ${winningBid?.users_auction_bids_bidder_user_idTousers.last_name || ""}`.trim(),
            },
          }),
        },
        sellerChannels
      );

      console.log(`Multi-channel notifications sent successfully`);
      result.details.notificationSent = true;
    } catch (notificationError) {
      console.error(
        "Failed to send multi-channel notifications:",
        notificationError
      );
      // Don't fail the entire operation for notification failure
    }

    // 5. Clean up EventBridge Scheduler
    if (event.triggerSource === "SCHEDULER") {
      try {
        const scheduleName = `auction-completion-${event.auctionListingId}`;

        const deleteCommand = new DeleteScheduleCommand({
          Name: scheduleName,
          GroupName: env.SCHEDULE_GROUP_NAME,
        });

        await schedulerClient.send(deleteCommand);

        console.log(
          `EventBridge schedule ${scheduleName} deleted successfully`
        );
        result.details.eventBridgeScheduleDeleted = true;
      } catch (schedulerError) {
        console.error("Failed to delete EventBridge schedule:", schedulerError);
        // Don't fail the entire operation for cleanup failure
      }
    }

    // 6. Success!
    result.success = true;
    console.log(`Auction completion successful for ${event.auctionListingId}`);
  } catch (error) {
    console.error("Auction completion failed:", error);
    result.success = false;
    result.errorMessage =
      error instanceof Error ? error.message : "Unknown error";
  } finally {
    await prismaClient.$disconnect();
  }

  return result;
};
