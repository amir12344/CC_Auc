import {
  auction_bid_type,
  currency_code_type,
  Prisma,
  PrismaClient,
} from "../../../lambda-layers/core-layer/nodejs/prisma/generated/client";

export interface AuctionDetails {
  auction_listing_id: string;
  public_id: string;
  title: string;
  description?: string;
  category?: string;
  status: string;
  auction_status: string;
  minimum_bid?: number;
  current_bid?: number;
  bid_increment_value?: number;
  bid_increment_type?: string;
  minimum_bid_currency?: currency_code_type;
  current_bid_currency?: currency_code_type;
  total_units?: number;
  estimated_retail_value?: number;
  lot_condition?: string;
  auction_end_time?: Date;
  seller_profile_id: string;
  current_bidder_user_id?: string;
  winner_user_id?: string;
  bid_count: number;
  time_remaining?: string;
  time_remaining_seconds?: number;
  shipping_cost?: number;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  bidding: {
    minimum_next_bid: number;
    currency: currency_code_type;
    increment_amount?: number;
    increment_type?: string;
    can_bid: boolean;
    auction_active: boolean;
    time_remaining_seconds?: number;
    buy_now_available: boolean;
    buy_now_price?: number;
  };
  user_context?: {
    has_bid: boolean;
    current_user_bid?: number;
    is_winning: boolean;
    watching: boolean;
  };
}

export interface BidHistoryItem {
  auction_bid_id: string;
  public_id: string;
  bidder_user_id: string;
  bid_amount: number;
  bid_amount_currency: currency_code_type;
  bid_type: auction_bid_type;
  is_winning_bid: boolean;
  bid_timestamp: Date;
  bidder_info: {
    username: string;
    public_id: string;
  };
}

export interface UserBidHistoryItem {
  auction_bid_id: string;
  public_id: string;
  auction_listing: {
    auction_listing_id: string;
    public_id: string;
    title: string;
    auction_status: string;
    auction_end_time?: Date;
  };
  bid_amount: number;
  bid_amount_currency: currency_code_type;
  is_winning_bid: boolean;
  bid_timestamp: Date;
  current_high_bid: number;
  user_status: "WINNING" | "OUTBID" | "LOST" | "WON";
}

export class AuctionBidDatabaseOperations {
  constructor(private prisma: PrismaClient) {}

  /**
   * Get detailed auction information for display
   * OPTIMIZED: Parallelized auction fetch and user context
   */
  async getAuctionDetails(
    auctionListingId: string,
    userId?: string
  ): Promise<AuctionDetails | null> {
    // Parallelize auction fetch and user context if userId provided
    const [auction, userContext] = await Promise.all([
      this.prisma.auction_listings.findUnique({
        where: { auction_listing_id: auctionListingId },
        select: {
          auction_listing_id: true,
          public_id: true,
          title: true,
          description: true,
          category: true,
          status: true,
          auction_status: true,
          minimum_bid: true,
          current_bid: true,
          bid_increment_value: true,
          bid_increment_type: true,
          minimum_bid_currency: true,
          current_bid_currency: true,
          total_units: true,
          estimated_retail_value: true,
          lot_condition: true,
          auction_end_time: true,
          seller_profile_id: true,
          current_bidder_user_id: true,
          winner_user_id: true,
          shipping_cost: true,

          // Only needed address fields
          addresses: {
            select: {
              city: true,
              province: true,
              country: true,
            },
          },

          // Only needed auction bid fields
          auction_bids: {
            orderBy: { bid_timestamp: "desc" },
            take: 1,
            select: {
              users_auction_bids_bidder_user_idTousers: {
                select: { username: true, public_id: true },
              },
            },
          },

          // Count of bids
          _count: {
            select: { auction_bids: true },
          },
        },
      }),
      userId
        ? this.getUserBidContext(auctionListingId, userId)
        : Promise.resolve(undefined),
    ]);

    if (!auction) return null;

    // Calculate time remaining
    const timeRemaining = auction.auction_end_time
      ? Math.max(
          0,
          Math.floor((auction.auction_end_time.getTime() - Date.now()) / 1000)
        )
      : null;

    // Format time remaining as string
    const formatTimeRemaining = (
      seconds: number | null
    ): string | undefined => {
      if (!seconds) return undefined;

      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;

      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    // Calculate minimum next bid
    const currentHighBid = auction.current_bid
      ? Number(auction.current_bid)
      : 0;
    const minimumBid = auction.minimum_bid ? Number(auction.minimum_bid) : 0;

    let minimumNextBid = Math.max(minimumBid, currentHighBid);

    if (currentHighBid > 0 && auction.bid_increment_value) {
      const incrementValue = Number(auction.bid_increment_value);
      if (auction.bid_increment_type === "FIXED") {
        minimumNextBid = currentHighBid + incrementValue;
      } else if (auction.bid_increment_type === "PERCENTAGE") {
        const incrementAmount = currentHighBid * (incrementValue / 100);
        minimumNextBid = currentHighBid + incrementAmount;
      }
    }

    const isActive =
      auction.status === "ACTIVE" &&
      auction.auction_status === "ACTIVE" &&
      (!auction.auction_end_time || new Date() < auction.auction_end_time);

    const result: AuctionDetails = {
      auction_listing_id: auction.auction_listing_id,
      public_id: auction.public_id,
      title: auction.title,
      description: auction.description || undefined,
      category: auction.category || undefined,
      status: auction.status || "UNKNOWN",
      auction_status: auction.auction_status || "UNKNOWN",
      minimum_bid: auction.minimum_bid
        ? Number(auction.minimum_bid)
        : undefined,
      current_bid: auction.current_bid
        ? Number(auction.current_bid)
        : undefined,
      bid_increment_value: auction.bid_increment_value
        ? Number(auction.bid_increment_value)
        : undefined,
      bid_increment_type: auction.bid_increment_type || undefined,
      minimum_bid_currency: auction.minimum_bid_currency || undefined,
      current_bid_currency: auction.current_bid_currency || undefined,
      total_units: auction.total_units || undefined,
      estimated_retail_value: auction.estimated_retail_value
        ? Number(auction.estimated_retail_value)
        : undefined,
      lot_condition: auction.lot_condition || undefined,
      auction_end_time: auction.auction_end_time || undefined,
      seller_profile_id: auction.seller_profile_id,
      current_bidder_user_id: auction.current_bidder_user_id || undefined,
      winner_user_id: auction.winner_user_id || undefined,
      bid_count: auction._count.auction_bids,
      time_remaining: formatTimeRemaining(timeRemaining),
      time_remaining_seconds: timeRemaining || undefined,
      shipping_cost: auction.shipping_cost
        ? Number(auction.shipping_cost)
        : undefined,
      location: auction.addresses
        ? {
            city: auction.addresses.city,
            state: auction.addresses.province,
            country: auction.addresses.country,
          }
        : undefined,
      bidding: {
        minimum_next_bid: minimumNextBid,
        currency: auction.minimum_bid_currency || "USD",
        increment_amount: auction.bid_increment_value
          ? Number(auction.bid_increment_value)
          : undefined,
        increment_type: auction.bid_increment_type || undefined,
        can_bid: isActive,
        auction_active: isActive,
        time_remaining_seconds: timeRemaining || undefined,
        buy_now_available: false, // TODO: Implement buy now logic
        buy_now_price: undefined,
      },
      user_context: userContext,
    };

    return result;
  }

  /**
   * Removes sensitive ID fields from auction details, keeping only public_id
   * @param auctionDetails - The auction details object to sanitize
   * @returns Sanitized auction details without internal IDs
   */
  private sanitizeAuctionDetails(
    auctionDetails: AuctionDetails
  ): Omit<
    AuctionDetails,
    | "auction_listing_id"
    | "seller_profile_id"
    | "current_bidder_user_id"
    | "winner_user_id"
  > {
    const {
      auction_listing_id,
      seller_profile_id,
      current_bidder_user_id,
      winner_user_id,
      ...sanitizedDetails
    } = auctionDetails;

    return {
      ...sanitizedDetails,
    };
  }

  /**
   * Gets auction details with IDs removed (public API safe)
   * @param auctionListingId - The auction listing ID
   * @param userId - Optional user ID for context
   * @returns Sanitized auction details or null
   */
  async getAuctionDetailsPublic(
    auctionListingId: string,
    userId?: string
  ): Promise<Omit<
    AuctionDetails,
    | "auction_listing_id"
    | "seller_profile_id"
    | "current_bidder_user_id"
    | "winner_user_id"
  > | null> {
    const auctionDetails = await this.getAuctionDetails(
      auctionListingId,
      userId
    );

    if (!auctionDetails) {
      return null;
    }

    return this.sanitizeAuctionDetails(auctionDetails);
  }

  /**
   * Get user's bidding context for an auction
   */
  private async getUserBidContext(
    auctionListingId: string,
    userId: string
  ): Promise<{
    has_bid: boolean;
    current_user_bid?: number;
    is_winning: boolean;
    watching: boolean;
  }> {
    const userBids = await this.prisma.auction_bids.findMany({
      where: {
        auction_listing_id: auctionListingId,
        bidder_user_id: userId,
      },
      orderBy: { bid_timestamp: "desc" },
    });

    const hasBid = userBids.length > 0;
    const currentUserBid = hasBid ? Number(userBids[0].bid_amount) : undefined;
    const isWinning = hasBid ? (userBids[0].is_winning_bid ?? false) : false;

    return {
      has_bid: hasBid,
      current_user_bid: currentUserBid,
      is_winning: isWinning,
      watching: false, // TODO: Implement watching/favorites functionality
    };
  }

  /**
   * Get bid history for an auction
   * OPTIMIZED: Parallelized total count and bids fetch
   */
  async getAuctionBidHistory(
    auctionListingId: string,
    options: {
      limit?: number;
      offset?: number;
      include_actions?: boolean;
    } = {}
  ): Promise<{
    bids: BidHistoryItem[];
    pagination: {
      total: number;
      limit: number;
      offset: number;
      has_more: boolean;
    };
  }> {
    const { limit = 50, offset = 0, include_actions = false } = options;

    // Parallelize total count and bids fetch
    const [total, bids] = await Promise.all([
      this.prisma.auction_bids.count({
        where: { auction_listing_id: auctionListingId },
      }),
      this.prisma.auction_bids.findMany({
        where: { auction_listing_id: auctionListingId },
        include: {
          users_auction_bids_bidder_user_idTousers: {
            select: { username: true, public_id: true },
          },
        },
        orderBy: { bid_timestamp: "desc" },
        take: limit,
        skip: offset,
      }),
    ]);

    // Filter out any bids with missing required data
    const validBids = bids.filter(
      (bid) =>
        bid.bid_type &&
        bid.is_winning_bid !== null &&
        bid.bid_timestamp &&
        bid.users_auction_bids_bidder_user_idTousers
    );

    const bidHistory: BidHistoryItem[] = validBids.map((bid) => ({
      auction_bid_id: bid.auction_bid_id,
      public_id: bid.public_id,
      bidder_user_id: bid.bidder_user_id,
      bid_amount: Number(bid.bid_amount),
      bid_amount_currency: bid.bid_amount_currency,
      bid_type: bid.bid_type!, // We filtered for non-null values
      is_winning_bid: bid.is_winning_bid!, // We filtered for non-null values
      bid_timestamp: bid.bid_timestamp!, // We filtered for non-null values
      bidder_info: {
        username: bid.users_auction_bids_bidder_user_idTousers.username,
        public_id: bid.users_auction_bids_bidder_user_idTousers.public_id,
      },
    }));

    return {
      bids: bidHistory,
      pagination: {
        total,
        limit,
        offset,
        has_more: offset + limit < total,
      },
    };
  }

  /**
   * Get user's bid history across all auctions
   * OPTIMIZED: Parallelized summary statistics computation
   */
  async getUserBidHistory(
    userId: string,
    options: {
      status?: "ACTIVE" | "ENDED" | "WON" | "LOST";
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{
    bids: UserBidHistoryItem[];
    summary: {
      active_bids: number;
      winning_bids: number;
      total_bid_amount: number;
    };
  }> {
    const { status, limit = 20, offset = 0 } = options;

    // Build where clause based on status filter
    let whereClause: Prisma.auction_bidsWhereInput = {
      bidder_user_id: userId,
    };

    if (status) {
      switch (status) {
        case "ACTIVE":
          whereClause.auction_listings = {
            auction_status: "ACTIVE",
            status: "ACTIVE",
          };
          break;
        case "ENDED":
          whereClause.auction_listings = {
            auction_status: "ENDED",
          };
          break;
        case "WON":
          whereClause.auction_listings = {
            winner_user_id: userId,
          };
          break;
        case "LOST":
          whereClause.auction_listings = {
            auction_status: "ENDED",
            NOT: {
              winner_user_id: userId,
            },
          };
          break;
      }
    }

    // Parallelize user bids fetch and summary statistics computation
    const [userBids, activeBids, winningBids, totalBidAmount] =
      await Promise.all([
        this.prisma.auction_bids.findMany({
          where: whereClause,
          include: {
            auction_listings: {
              select: {
                auction_listing_id: true,
                public_id: true,
                title: true,
                auction_status: true,
                auction_end_time: true,
                current_bid: true,
                winner_user_id: true,
              },
            },
          },
          orderBy: { bid_timestamp: "desc" },
          take: limit,
          skip: offset,
        }),
        this.prisma.auction_bids.count({
          where: {
            bidder_user_id: userId,
            auction_listings: {
              auction_status: "ACTIVE",
              status: "ACTIVE",
            },
          },
        }),
        this.prisma.auction_bids.count({
          where: {
            bidder_user_id: userId,
            is_winning_bid: true,
            auction_listings: {
              auction_status: "ACTIVE",
            },
          },
        }),
        this.prisma.auction_bids.aggregate({
          where: {
            bidder_user_id: userId,
          },
          _sum: {
            bid_amount: true,
          },
        }),
      ]);

    // Transform to UserBidHistoryItem format
    const bidHistory: UserBidHistoryItem[] = userBids
      .filter((bid) => bid.auction_listings && bid.bid_timestamp) // Filter out bids without auction data or timestamp
      .map((bid) => {
        let userStatus: "WINNING" | "OUTBID" | "LOST" | "WON" = "OUTBID";

        if (bid.auction_listings!.auction_status === "ENDED") {
          userStatus =
            bid.auction_listings!.winner_user_id === userId ? "WON" : "LOST";
        } else if (bid.is_winning_bid) {
          userStatus = "WINNING";
        }

        return {
          auction_bid_id: bid.auction_bid_id,
          public_id: bid.public_id,
          auction_listing: {
            auction_listing_id: bid.auction_listings!.auction_listing_id,
            public_id: bid.auction_listings!.public_id,
            title: bid.auction_listings!.title,
            auction_status: bid.auction_listings!.auction_status || "UNKNOWN",
            auction_end_time:
              bid.auction_listings!.auction_end_time || undefined,
          },
          bid_amount: Number(bid.bid_amount),
          bid_amount_currency: bid.bid_amount_currency,
          is_winning_bid: bid.is_winning_bid || false,
          bid_timestamp: bid.bid_timestamp!,
          current_high_bid: Number(bid.auction_listings!.current_bid || 0),
          user_status: userStatus,
        };
      });

    return {
      bids: bidHistory,
      summary: {
        active_bids: activeBids,
        winning_bids: winningBids,
        total_bid_amount: Number(totalBidAmount._sum.bid_amount || 0),
      },
    };
  }

  /**
   * Get recent auction activity for display
   */
  async getAuctionActivity(auctionListingId: string): Promise<{
    recent_activity: Array<{
      timestamp: Date;
      event_type: string;
      description: string;
      bidder?: string;
      amount?: number;
    }>;
  }> {
    const recentBids = await this.prisma.auction_bids.findMany({
      where: { auction_listing_id: auctionListingId },
      include: {
        users_auction_bids_bidder_user_idTousers: {
          select: { username: true },
        },
      },
      orderBy: { bid_timestamp: "desc" },
      take: 10,
    });

    const activity = recentBids
      .filter((bid) => bid.bid_timestamp) // Filter out bids with null timestamps
      .map((bid) => ({
        timestamp: bid.bid_timestamp!,
        event_type: "BID_PLACED",
        description: `New bid placed for ${Number(bid.bid_amount).toFixed(2)}`,
        bidder: `anonymous_bidder_${bid.users_auction_bids_bidder_user_idTousers.username.slice(-3)}`,
        amount: Number(bid.bid_amount),
      }));

    return {
      recent_activity: activity,
    };
  }

  /**
   * Create an order from a winning auction bid
   * OPTIMIZED: Parallelized manifest items fetch and order item creation
   */
  async createOrderFromAuction(
    auctionListingId: string,
    winnerUserId: string,
    winnerBuyerProfileId: string,
    finalBidAmount: number,
    currency: currency_code_type
  ): Promise<{ order_id: string; order_number: string }> {
    // Parallelize auction fetch and manifest items fetch
    const [auction, manifestItems] = await Promise.all([
      this.prisma.auction_listings.findUnique({
        where: { auction_listing_id: auctionListingId },
      }),
      this.prisma.auction_listing_product_manifests.findMany({
        where: { auction_listing_id: auctionListingId },
      }),
    ]);

    if (!auction) {
      throw new Error("Auction not found");
    }

    // Create order
    const order = await this.prisma.orders.create({
      data: {
        buyer_user_id: winnerUserId,
        buyer_profile_id: winnerBuyerProfileId,
        seller_user_id: auction.seller_user_id,
        seller_profile_id: auction.seller_profile_id,
        auction_listing_id: auctionListingId,
        order_type: "AUCTION",
        order_status: "PENDING",
        total_amount: finalBidAmount,
        total_amount_currency: currency,
        shipping_cost: auction.shipping_cost
          ? Number(auction.shipping_cost)
          : 0,
        shipping_cost_currency: auction.shipping_cost ? currency : undefined,
        tax_amount: 0, // Calculate based on business rules
        tax_amount_currency: currency,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    // Create order items from auction manifest in parallel
    const orderItemPromises = manifestItems.map((item) =>
      this.prisma.order_items.create({
        data: {
          order_id: order.order_id,
          auction_listing_product_manifest_id:
            item.auction_listing_product_manifest_id,
          quantity: item.available_quantity || 1,
          unit_price: finalBidAmount / manifestItems.length, // Distribute bid amount
          unit_price_currency: currency,
          total_price: finalBidAmount / manifestItems.length,
          total_price_currency: currency,
          created_at: new Date(),
        },
      })
    );

    await Promise.all(orderItemPromises);

    return {
      order_id: order.public_id,
      order_number: order.order_number ?? "",
    };
  }

  /**
   * Get auction statistics for analytics
   * OPTIMIZED: Parallelized all statistics queries
   */
  async getAuctionStats(auctionListingId: string): Promise<{
    total_bids: number;
    unique_bidders: number;
    bid_frequency: number; // bids per hour
    current_high_bid: number;
    starting_bid: number;
    bid_increment_count: number;
    average_bid_amount: number;
  }> {
    // Parallelize all statistics queries
    const [auction, bidStats, uniqueBidders, firstBid] = await Promise.all([
      this.prisma.auction_listings.findUnique({
        where: { auction_listing_id: auctionListingId },
        include: {
          _count: {
            select: { auction_bids: true },
          },
        },
      }),
      this.prisma.auction_bids.aggregate({
        where: { auction_listing_id: auctionListingId },
        _count: {
          bidder_user_id: true,
        },
        _avg: {
          bid_amount: true,
        },
      }),
      this.prisma.auction_bids.groupBy({
        by: ["bidder_user_id"],
        where: { auction_listing_id: auctionListingId },
      }),
      this.prisma.auction_bids.findFirst({
        where: { auction_listing_id: auctionListingId },
        orderBy: { bid_timestamp: "asc" },
      }),
    ]);

    if (!auction) {
      throw new Error("Auction not found");
    }

    // Calculate bid frequency (bids per hour)
    let bidFrequency = 0;
    if (firstBid && firstBid.bid_timestamp && auction._count.auction_bids > 1) {
      const hoursElapsed =
        (Date.now() - firstBid.bid_timestamp.getTime()) / (1000 * 60 * 60);
      bidFrequency = auction._count.auction_bids / Math.max(hoursElapsed, 1);
    }

    return {
      total_bids: auction._count.auction_bids,
      unique_bidders: uniqueBidders.length,
      bid_frequency: bidFrequency,
      current_high_bid: Number(auction.current_bid || 0),
      starting_bid: Number(auction.minimum_bid || 0),
      bid_increment_count: auction._count.auction_bids - 1, // Bids above starting bid
      average_bid_amount: Number(bidStats._avg.bid_amount || 0),
    };
  }

  /**
   * Check if user can place bid (eligibility check)
   * OPTIMIZED: Parallelized user lookup and auction lookup
   */
  async checkUserBidEligibility(
    userId: string,
    auctionListingId: string
  ): Promise<{
    is_eligible: boolean;
    verification_required: boolean;
    geographic_allowed: boolean;
    buyer_segment_allowed: boolean;
    restrictions: string[];
  }> {
    // Parallelize user and auction lookups
    const [user, auction] = await Promise.all([
      this.prisma.users.findUnique({
        where: { user_id: userId },
        include: {
          buyer_profiles: true,
        },
      }),
      this.prisma.auction_listings.findUnique({
        where: { auction_listing_id: auctionListingId },
      }),
    ]);

    if (!user) {
      return {
        is_eligible: false,
        verification_required: true,
        geographic_allowed: false,
        buyer_segment_allowed: false,
        restrictions: ["User not found"],
      };
    }

    const restrictions: string[] = [];
    let isEligible = true;

    // Check buyer profile verification
    const verificationRequired =
      !user.buyer_profiles ||
      user.buyer_profiles.verification_status !== "VERIFIED";
    if (verificationRequired) {
      restrictions.push("Account verification required");
      isEligible = false;
    }

    // Check if account is locked
    if (user.account_locked) {
      restrictions.push("Account is locked");
      isEligible = false;
    }

    // Check geographic restrictions (if auction is private)
    let geographicAllowed = true;
    let buyerSegmentAllowed = true;

    if (auction?.is_private) {
      // Check visibility rules
      const visibilityRules =
        await this.prisma.auction_listing_visibility_rules.findMany({
          where: { auction_listing_id: auctionListingId },
        });

      // For now, assume geographic access is allowed
      // TODO: Implement full geographic checking based on user addresses
      geographicAllowed = true;
      buyerSegmentAllowed = true;
    }

    return {
      is_eligible: isEligible && geographicAllowed && buyerSegmentAllowed,
      verification_required: verificationRequired,
      geographic_allowed: geographicAllowed,
      buyer_segment_allowed: buyerSegmentAllowed,
      restrictions,
    };
  }

  /**
   * Get preview bid validation without placing the bid
   */
  async previewBid(
    auctionListingId: string,
    bidAmount: number,
    bidAmountCurrency: currency_code_type
  ): Promise<{
    is_valid: boolean;
    minimum_required_bid: number;
    bid_increment: number;
    suggested_bid: number;
    auction_status: string;
    time_remaining_seconds: number | null;
    validation_message?: string;
  }> {
    const auction = await this.prisma.auction_listings.findUnique({
      where: { auction_listing_id: auctionListingId },
    });

    if (!auction) {
      return {
        is_valid: false,
        minimum_required_bid: 0,
        bid_increment: 0,
        suggested_bid: 0,
        auction_status: "NOT_FOUND",
        time_remaining_seconds: null,
        validation_message: "Auction not found",
      };
    }

    const currentHighBid = auction.current_bid
      ? Number(auction.current_bid)
      : 0;
    const minimumBid = auction.minimum_bid ? Number(auction.minimum_bid) : 0;
    const bidIncrement = auction.bid_increment_value
      ? Number(auction.bid_increment_value)
      : 0;

    let minimumRequiredBid = Math.max(minimumBid, currentHighBid);

    if (currentHighBid > 0 && auction.bid_increment_value) {
      if (auction.bid_increment_type === "FIXED") {
        minimumRequiredBid = currentHighBid + bidIncrement;
      } else if (auction.bid_increment_type === "PERCENTAGE") {
        const incrementAmount = currentHighBid * (bidIncrement / 100);
        minimumRequiredBid = currentHighBid + incrementAmount;
      }
    }

    const isValid =
      bidAmount >= minimumRequiredBid &&
      bidAmountCurrency === auction.minimum_bid_currency;

    const timeRemaining = auction.auction_end_time
      ? Math.max(
          0,
          Math.floor((auction.auction_end_time.getTime() - Date.now()) / 1000)
        )
      : null;

    let validationMessage;
    if (!isValid) {
      if (bidAmount < minimumRequiredBid) {
        validationMessage = `Minimum bid is ${minimumRequiredBid.toFixed(2)}`;
      } else if (bidAmountCurrency !== auction.minimum_bid_currency) {
        validationMessage = `Currency must be ${auction.minimum_bid_currency}`;
      }
    }

    return {
      is_valid: isValid,
      minimum_required_bid: minimumRequiredBid,
      bid_increment: bidIncrement,
      suggested_bid: minimumRequiredBid,
      auction_status: auction.auction_status || "UNKNOWN",
      time_remaining_seconds: timeRemaining,
      validation_message: validationMessage,
    };
  }
}
