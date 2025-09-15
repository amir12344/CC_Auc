import {
  auction_bid_type,
  auction_listing_visibility_rules,
  bid_increment_type,
  currency_code_type,
  Prisma,
  PrismaClient,
} from "../../../lambda-layers/core-layer/nodejs/prisma/generated/client";

// Prisma validators for type safety (structure only, no where clauses)
const auctionWithBidsValidator =
  Prisma.validator<Prisma.auction_listingsDefaultArgs>()({
    include: {
      auction_bids: {
        where: { is_winning_bid: true },
        orderBy: { bid_timestamp: "desc" },
        take: 1,
      },
    },
  });

const buyerProfileWithUserValidator =
  Prisma.validator<Prisma.buyer_profilesDefaultArgs>()({
    include: { users: true },
  });

const userWithAddressesValidator = Prisma.validator<Prisma.usersDefaultArgs>()({
  include: {
    buyer_profiles: true,
    user_addresses: {
      include: {
        addresses: true,
      },
    },
  },
});

// Parameterized data creation functions
const createAuctionBidData = (
  auctionListingId: string,
  sellerUserId: string,
  sellerProfileId: string,
  bidderUserId: string,
  bidderBuyerProfileId: string,
  bidAmount: number,
  bidAmountCurrency: currency_code_type,
  bidType: auction_bid_type
) => {
  return Prisma.validator<Prisma.auction_bidsCreateInput>()({
    auction_listings: {
      connect: { auction_listing_id: auctionListingId },
    },
    users_auction_bids_seller_user_idTousers: {
      connect: {
        user_id: sellerUserId,
      },
    },
    seller_profiles: {
      connect: {
        seller_profile_id: sellerProfileId,
      },
    },
    users_auction_bids_bidder_user_idTousers: {
      connect: {
        user_id: bidderUserId,
      },
    },
    buyer_profiles: {
      connect: {
        buyer_profile_id: bidderBuyerProfileId,
      },
    },
    bid_amount: bidAmount,
    bid_amount_currency: bidAmountCurrency,
    bid_type: bidType,
    is_winning_bid: true,
    bid_timestamp: new Date(),
    created_at: new Date(),
  });
};

const createAuctionListingUpdateData = (
  currentBid: number,
  currentBidCurrency: currency_code_type,
  currentBidderUserId: string,
  currentBidderBuyerProfileId: string
) => {
  return Prisma.validator<Prisma.auction_listingsUpdateInput>()({
    current_bid: currentBid,
    current_bid_currency: currentBidCurrency,
    users_auction_listings_current_bidder_user_idTousers: {
      connect: {
        user_id: currentBidderUserId,
      },
    },
    buyer_profiles_auction_listings_current_bidder_buyer_profile_idTobuyer_profiles:
      {
        connect: {
          buyer_profile_id: currentBidderBuyerProfileId,
        },
      },
    updated_at: new Date(),
  });
};

const createAuctionBidHistoryData = (
  auctionListingId: string,
  bidderUserId: string,
  previousBidAmount: number | null,
  newBidAmount: number,
  bidAmountCurrency: currency_code_type,
  actionType: "BID_PLACED" | "BID_RETRACTED" | "AUCTION_WON" | "AUCTION_ENDED"
) => {
  return Prisma.validator<Prisma.auction_bid_historyCreateInput>()({
    auction_listings: {
      connect: {
        auction_listing_id: auctionListingId,
      },
    },
    previous_bid_amount: previousBidAmount,
    new_bid_amount: newBidAmount,
    bid_amount_currency: bidAmountCurrency,
    users: {
      connect: {
        user_id: bidderUserId,
      },
    },
    action_type: actionType,
    timestamp: new Date(),
    created_at: new Date(),
  });
};

const createAuctionEndUpdateData = (
  winnerUserId: string,
  winnerBuyerProfileId: string
) => {
  return Prisma.validator<Prisma.auction_listingsUpdateInput>()({
    auction_status: "ENDED",
    status: "COMPLETED",
    users_auction_listings_winner_user_idTousers: {
      connect: {
        user_id: winnerUserId,
      },
    },
    buyer_profiles_auction_listings_winner_buyer_profile_idTobuyer_profiles: {
      connect: {
        buyer_profile_id: winnerBuyerProfileId,
      },
    },
    updated_at: new Date(),
  });
};

// Parameterized query builders (where clauses go here)
const buildAuctionWithBidsQuery = (auctionListingId: string) => ({
  where: { auction_listing_id: auctionListingId },
  ...auctionWithBidsValidator,
});

const buildBuyerProfileQuery = (buyerProfileId: string) => ({
  where: { buyer_profile_id: buyerProfileId },
  ...buyerProfileWithUserValidator,
});

const buildUserWithAddressesQuery = (userId: string) => ({
  where: { user_id: userId },
  ...userWithAddressesValidator,
});

const buildDuplicateBidQuery = (
  auctionListingId: string,
  bidderUserId: string,
  bidAmount: number,
  timeThreshold: Date
) => ({
  where: {
    auction_listing_id: auctionListingId,
    bidder_user_id: bidderUserId,
    bid_amount: bidAmount,
    created_at: {
      gte: timeThreshold,
    },
  },
});

const buildUpdatePreviousBidsQuery = (auctionListingId: string) => ({
  where: {
    auction_listing_id: auctionListingId,
    is_winning_bid: true,
  },
  data: {
    is_winning_bid: false,
  },
});

const buildVisibilityRulesQuery = (auctionListingId: string) => ({
  where: { auction_listing_id: auctionListingId },
});

// Type definitions using Prisma.GetPayload
type AuctionWithBids = Prisma.auction_listingsGetPayload<
  typeof auctionWithBidsValidator
>;
type BuyerProfileWithUser = Prisma.buyer_profilesGetPayload<
  typeof buyerProfileWithUserValidator
>;
type UserWithAddresses = Prisma.usersGetPayload<
  typeof userWithAddressesValidator
>;

export interface PlaceBidConfig {
  auctionListingId: string;
  bidderUserId: string;
  bidderBuyerProfileId: string;
  bidAmount: number;
  bidAmountCurrency: currency_code_type;
  bidType: auction_bid_type;
}

export interface BidValidationResult {
  isValid: boolean;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  auctionData?: AuctionWithBids;
  minimumRequiredBid?: number;
  suggestedBid?: number;
}

export interface BidPlacementResult {
  success: boolean;
  bidId?: string;
  bidPublicId?: string;
  isWinningBid?: boolean;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export class AuctionBidOperations {
  constructor(private prisma: PrismaClient) {}

  /**
   * Main function to place a bid with full validation
   */
  async placeBid(config: PlaceBidConfig): Promise<BidPlacementResult> {
    try {
      // Start a transaction with Serializable isolation for bid placement
      return await this.prisma.$transaction(
        async (tx) => {
          // 1. Validate the bid with optimistic locking
          const validation = await this.validateBid(config, tx as PrismaClient);
          if (!validation.isValid) {
            return {
              success: false,
              error: validation.error,
            };
          }

          // 2. Place the bid with concurrency control
          const result = await this.executeBidPlacement(
            config,
            validation,
            tx as PrismaClient
          );
          return result;
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          timeout: 30000, // 30 second timeout for bid placement
        }
      );
    } catch (error) {
      console.error("Error in placeBid:", error);

      // Handle specific concurrent bid errors
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          // Unique constraint violation - likely multiple winning bids
          return {
            success: false,
            error: {
              code: "CONCURRENT_BID_CONFLICT",
              message:
                "Another bid was placed simultaneously. Please try again.",
              details: {
                prismaError: error.code,
                constraint: error.meta?.target,
              },
            },
          };
        } else if (error.code === "P2034") {
          // Transaction conflict in serializable mode
          return {
            success: false,
            error: {
              code: "TRANSACTION_CONFLICT",
              message:
                "Your bid conflicts with another concurrent bid. Please try again.",
              details: {
                prismaError: error.code,
              },
            },
          };
        }
      }

      return {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An internal error occurred while placing the bid",
          details: {
            error: error instanceof Error ? error.message : String(error),
          },
        },
      };
    }
  }

  /**
   * Comprehensive bid validation
   * OPTIMIZED: Parallelized auction and buyer profile lookups, plus visibility checks
   */
  async validateBid(
    config: PlaceBidConfig,
    tx: PrismaClient = this.prisma
  ): Promise<BidValidationResult> {
    // Parallelize auction and buyer profile lookups
    const [auction, buyerProfile] = await Promise.all([
      tx.auction_listings.findUnique(
        buildAuctionWithBidsQuery(config.auctionListingId)
      ),
      tx.buyer_profiles.findUnique(
        buildBuyerProfileQuery(config.bidderBuyerProfileId)
      ),
    ]);

    if (!auction) {
      return {
        isValid: false,
        error: {
          code: "AUCTION_NOT_FOUND",
          message: "Auction listing not found",
        },
      };
    }

    // 2. Check auction status
    if (auction.status !== "ACTIVE") {
      return {
        isValid: false,
        error: {
          code: "AUCTION_NOT_ACTIVE",
          message: "This auction is not currently active",
          details: {
            auction_status: auction.status,
            auction_listing_status: auction.auction_status,
          },
        },
      };
    }

    if (auction.auction_status !== "ACTIVE") {
      return {
        isValid: false,
        error: {
          code: "AUCTION_NOT_ACTIVE",
          message: "This auction is not currently accepting bids",
          details: {
            auction_status: auction.auction_status,
          },
        },
      };
    }

    // 3. Check if auction has ended
    if (auction.auction_end_time && new Date() >= auction.auction_end_time) {
      return {
        isValid: false,
        error: {
          code: "AUCTION_ENDED",
          message: "This auction has already ended",
          details: {
            auction_end_time: auction.auction_end_time,
            current_time: new Date(),
          },
        },
      };
    }

    // 4. Check if bidder is the seller
    if (config.bidderUserId === auction.seller_user_id) {
      return {
        isValid: false,
        error: {
          code: "SELLER_CANNOT_BID",
          message: "Sellers cannot bid on their own auctions",
        },
      };
    }

    // 5. Validate buyer profile
    if (!buyerProfile || buyerProfile.user_id !== config.bidderUserId) {
      return {
        isValid: false,
        error: {
          code: "INVALID_BUYER_PROFILE",
          message: "Invalid buyer profile or profile does not belong to user",
        },
      };
    }

    if (buyerProfile.verification_status !== "VERIFIED") {
      return {
        isValid: false,
        error: {
          code: "BUYER_NOT_VERIFIED",
          message: "Account verification required to bid on auctions",
          details: {
            verification_status: buyerProfile.verification_status,
          },
        },
      };
    }

    // 6. Check currency match
    if (
      auction.minimum_bid_currency &&
      config.bidAmountCurrency !== auction.minimum_bid_currency
    ) {
      return {
        isValid: false,
        error: {
          code: "CURRENCY_MISMATCH",
          message: `Bid currency must be ${auction.minimum_bid_currency}`,
          details: {
            required_currency: auction.minimum_bid_currency,
            provided_currency: config.bidAmountCurrency,
          },
        },
      };
    }

    // 7. Calculate minimum required bid
    const currentHighBid = auction.current_bid
      ? Number(auction.current_bid)
      : 0;
    const minimumBid = auction.minimum_bid ? Number(auction.minimum_bid) : 0;

    let minimumRequiredBid = Math.max(minimumBid, currentHighBid);

    // Add bid increment only if there's already a bid
    if (currentHighBid > 0 && auction.bid_increment_value) {
      const incrementValue = Number(auction.bid_increment_value);
      if (auction.bid_increment_type === "FIXED") {
        minimumRequiredBid = currentHighBid + incrementValue;
      } else if (auction.bid_increment_type === "PERCENTAGE") {
        const incrementAmount = currentHighBid * (incrementValue / 100);
        minimumRequiredBid = currentHighBid + incrementAmount;
      }
    }
    // For first bid (currentHighBid === 0), minimumRequiredBid stays as minimumBid

    // 8. Validate bid amount
    if (config.bidType === "REGULAR") {
      if (config.bidAmount < minimumRequiredBid) {
        const suggestedBid = this.calculateSuggestedBid(
          auction,
          minimumRequiredBid
        );

        return {
          isValid: false,
          error: {
            code: "BID_TOO_LOW",
            message: `Bid amount must be at least ${minimumRequiredBid.toFixed(2)}`,
            details: {
              minimum_required_bid: minimumRequiredBid,
              submitted_bid: config.bidAmount,
              current_high_bid: currentHighBid,
              bid_increment: auction.bid_increment_value,
              suggested_bid: suggestedBid,
              auction_status: auction.auction_status,
              time_remaining_seconds: auction.auction_end_time
                ? Math.max(
                    0,
                    Math.floor(
                      (auction.auction_end_time.getTime() - Date.now()) / 1000
                    )
                  )
                : null,
            },
          },
        };
      }
    }

    // Parallelize remaining validation checks: duplicate bid check and visibility check
    const timeThreshold = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
    const [recentBid, hasVisibilityAccess] = await Promise.all([
      tx.auction_bids.findFirst(
        buildDuplicateBidQuery(
          config.auctionListingId,
          config.bidderUserId,
          config.bidAmount,
          timeThreshold
        )
      ),
      auction.is_private
        ? this.checkAuctionVisibility(
            config.auctionListingId,
            config.bidderUserId,
            tx
          )
        : Promise.resolve(true),
    ]);

    // 9. Check for duplicate bid from same user
    if (recentBid) {
      return {
        isValid: false,
        error: {
          code: "DUPLICATE_BID",
          message: "You have already placed this exact bid recently",
        },
      };
    }

    // 10. Check visibility rules (if auction is private)
    if (auction.is_private && !hasVisibilityAccess) {
      return {
        isValid: false,
        error: {
          code: "ACCESS_DENIED",
          message: "You do not have access to bid on this private auction",
        },
      };
    }

    return {
      isValid: true,
      auctionData: auction,
      minimumRequiredBid,
      suggestedBid: this.calculateSuggestedBid(auction, minimumRequiredBid),
    };
  }

  /**
   * Execute the actual bid placement
   * OPTIMIZED: Parallelized bid history creation with other operations where possible
   */
  private async executeBidPlacement(
    config: PlaceBidConfig,
    validation: BidValidationResult,
    tx: PrismaClient
  ): Promise<BidPlacementResult> {
    const auction = validation.auctionData!;

    try {
      // 1. Mark previous winning bids as not winning
      await tx.auction_bids.updateMany(
        buildUpdatePreviousBidsQuery(config.auctionListingId)
      );

      // 2. Create the new bid
      const newBidData = createAuctionBidData(
        config.auctionListingId,
        auction.seller_user_id,
        auction.seller_profile_id,
        config.bidderUserId,
        config.bidderBuyerProfileId,
        config.bidAmount,
        config.bidAmountCurrency,
        config.bidType
      );

      const newBid = await tx.auction_bids.create({
        data: newBidData,
      });

      // 3. Parallelize auction update and bid history creation
      const auctionUpdateData = createAuctionListingUpdateData(
        config.bidAmount,
        config.bidAmountCurrency,
        config.bidderUserId,
        config.bidderBuyerProfileId
      );

      const bidHistoryData = createAuctionBidHistoryData(
        config.auctionListingId,
        config.bidderUserId,
        auction.current_bid ? Number(auction.current_bid) : null,
        config.bidAmount,
        config.bidAmountCurrency,
        "BID_PLACED"
      );

      await Promise.all([
        tx.auction_listings.update({
          where: {
            auction_listing_id: config.auctionListingId,
            version: auction.version, // Optimistic locking
          },
          data: {
            ...auctionUpdateData,
            version: { increment: 1 }, // Increment version
          },
        }),
        tx.auction_bid_history.create({
          data: bidHistoryData,
        }),
      ]);

      // 5. Handle Buy Now logic
      if (config.bidType === "BUY_NOW") {
        await this.handleBuyNowWin(
          config.auctionListingId,
          config.bidderUserId,
          config.bidderBuyerProfileId,
          tx
        );
      }

      return {
        success: true,
        bidId: newBid.auction_bid_id,
        bidPublicId: newBid.public_id,
        isWinningBid: true,
      };
    } catch (error) {
      console.error("Error executing bid placement:", error);
      throw error;
    }
  }

  /**
   * Handle Buy Now auction completion
   */
  private async handleBuyNowWin(
    auctionListingId: string,
    winnerUserId: string,
    winnerBuyerProfileId: string,
    tx: PrismaClient
  ): Promise<void> {
    // Update auction as ended with winner
    const auctionEndData = createAuctionEndUpdateData(
      winnerUserId,
      winnerBuyerProfileId
    );

    const bidHistoryData = createAuctionBidHistoryData(
      auctionListingId,
      winnerUserId,
      null,
      0,
      "USD",
      "AUCTION_WON"
    );

    // Parallelize auction end update and bid history creation
    await Promise.all([
      tx.auction_listings.update({
        where: { auction_listing_id: auctionListingId },
        data: auctionEndData,
      }),
      tx.auction_bid_history.create({
        data: bidHistoryData,
      }),
    ]);
  }

  /**
   * Check if user has access to private auction
   * OPTIMIZED: Parallelized user lookup and visibility rules fetch
   */
  private async checkAuctionVisibility(
    auctionListingId: string,
    userId: string,
    tx: PrismaClient
  ): Promise<boolean> {
    // Parallelize user details and visibility rules lookup
    const [user, visibilityRules] = await Promise.all([
      tx.users.findUnique(buildUserWithAddressesQuery(userId)),
      tx.auction_listing_visibility_rules.findMany(
        buildVisibilityRulesQuery(auctionListingId)
      ),
    ]);

    if (!user) return false;

    // If no rules, assume public access
    if (visibilityRules.length === 0) return true;

    // Check each rule
    for (const rule of visibilityRules) {
      const hasAccess = await this.checkVisibilityRule(rule, user, tx);
      if (rule.is_inclusion && hasAccess) {
        return true; // Inclusion rule matched
      }
      if (!rule.is_inclusion && hasAccess) {
        return false; // Exclusion rule matched
      }
    }

    // If only exclusion rules and none matched, allow access
    const hasInclusionRules = visibilityRules.some(
      (rule: auction_listing_visibility_rules) => rule.is_inclusion
    );
    return !hasInclusionRules;
  }

  /**
   * Check individual visibility rule
   */
  private async checkVisibilityRule(
    rule: auction_listing_visibility_rules,
    user: UserWithAddresses,
    tx: PrismaClient
  ): Promise<boolean> {
    // TODO: Implement actual rule checks
    // Placeholder for actual rule logic
    return true;

    // switch (rule.rule_type) {
    //   case "BUYER_SEGMENT":
    //     // TODO: Compare with buyer preferences
    //     // Implementation depends on how buyer segments are stored
    //     // For now, return false as this needs business logic
    //     return false;

    //   case "LOCATION_COUNTRY":
    //     return (
    //       user.user_addresses?.some(
    //         (ua: UserWithAddresses["user_addresses"][0]) =>
    //           ua.addresses.country_code === rule.rule_value
    //       ) || false
    //     );

    //   case "LOCATION_STATE":
    //     return (
    //       user.user_addresses?.some(
    //         (ua: UserWithAddresses["user_addresses"][0]) =>
    //           ua.addresses.province_code === rule.rule_value
    //       ) || false
    //     );

    //   case "LOCATION_ZIP":
    //     return (
    //       user.user_addresses?.some(
    //         (ua: UserWithAddresses["user_addresses"][0]) =>
    //           ua.addresses.zip === rule.rule_value
    //       ) || false
    //     );

    //   case "LOCATION_CITY":
    //     return (
    //       user.user_addresses?.some(
    //         (ua: UserWithAddresses["user_addresses"][0]) =>
    //           ua.addresses.city.toLowerCase() === rule.rule_value.toLowerCase()
    //       ) || false
    //     );

    //   default:
    //     return false;
    // }
  }

  /**
   * Calculate suggested bid amount
   */
  private calculateSuggestedBid(
    auction: AuctionWithBids,
    minimumRequiredBid: number
  ): number {
    if (!auction.bid_increment_value) {
      return minimumRequiredBid;
    }

    const incrementValue = Number(auction.bid_increment_value);
    if (auction.bid_increment_type === "FIXED") {
      return minimumRequiredBid;
    } else if (auction.bid_increment_type === "PERCENTAGE") {
      // Round to reasonable increment
      const increment = Math.max(1, incrementValue);
      return Math.ceil(minimumRequiredBid / increment) * increment;
    }

    return minimumRequiredBid;
  }

  /**
   * Get current auction status and bid requirements
   */
  async getAuctionBidRequirements(auctionListingId: string): Promise<{
    auction_active: boolean;
    minimum_next_bid: number;
    currency: currency_code_type;
    increment_amount?: number;
    increment_type?: bid_increment_type;
    time_remaining_seconds?: number;
    current_high_bid?: number;
    can_bid: boolean;
    auction_status: string;
  } | null> {
    const auctionQuery = buildAuctionWithBidsQuery(auctionListingId);
    const auction = await this.prisma.auction_listings.findUnique(auctionQuery);

    if (!auction) return null;

    const isActive =
      auction.status === "ACTIVE" &&
      auction.auction_status === "ACTIVE" &&
      (!auction.auction_end_time || new Date() < auction.auction_end_time);

    const currentHighBid = auction.current_bid
      ? Number(auction.current_bid)
      : 0;
    const minimumBid = auction.minimum_bid ? Number(auction.minimum_bid) : 0;

    let minimumNextBid = Math.max(minimumBid, currentHighBid);

    // Add bid increment only if there's already a bid
    if (currentHighBid > 0 && auction.bid_increment_value) {
      const incrementValue = Number(auction.bid_increment_value);
      if (auction.bid_increment_type === "FIXED") {
        minimumNextBid = currentHighBid + incrementValue;
      } else if (auction.bid_increment_type === "PERCENTAGE") {
        const incrementAmount = currentHighBid * (incrementValue / 100);
        minimumNextBid = currentHighBid + incrementAmount;
      }
    }
    // For first bid (currentHighBid === 0), minimumNextBid stays as minimumBid

    const timeRemaining = auction.auction_end_time
      ? Math.max(
          0,
          Math.floor((auction.auction_end_time.getTime() - Date.now()) / 1000)
        )
      : null;

    return {
      auction_active: isActive,
      minimum_next_bid: minimumNextBid,
      currency: auction.minimum_bid_currency || "USD",
      increment_amount: auction.bid_increment_value
        ? Number(auction.bid_increment_value)
        : undefined,
      increment_type: auction.bid_increment_type || undefined,
      time_remaining_seconds: timeRemaining || undefined,
      current_high_bid: currentHighBid > 0 ? currentHighBid : undefined,
      can_bid: isActive,
      auction_status: auction.auction_status || "UNKNOWN",
    };
  }
}
