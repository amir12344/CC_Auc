"use client";

import dynamic from "next/dynamic";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { ChevronDown, Gavel, Info, MapPin } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { ConditionalActionButton } from "@/src/components/ui/ConditionalActionButton";
import { Input } from "@/src/components/ui/input";
import { usePublicPageAuth } from "@/src/hooks/useAuthState";
import { formatBackendError } from "@/src/utils/error-utils";

import {
  bidOnAuction,
  calculateMinimumBid,
  formatAuctionCurrency,
  formatBidCount,
} from "../services/auctionQueryService";
import type { AuctionDetail } from "../types";
import { BidConfirmationModal } from "./BidConfirmationModal";
import { BidSuccessDialog } from "./BidSuccessDialog";

// Lazy load BiddingHistory component using Next.js dynamic import
const BiddingHistory = dynamic(
  () =>
    import("./BiddingHistory").then((mod) => ({ default: mod.BiddingHistory })),
  {
    loading: () => (
      <div className="text-sm text-gray-500">Loading bidding history...</div>
    ),
    ssr: false,
  }
);

// Regex pattern for bid validation (defined at top level for performance)
const BID_PATTERN = /^\d*\.?\d*$/;

interface AuctionBiddingAreaProps {
  /** Auction data object */
  auction: AuctionDetail;
  /** Optional className for styling */
  className?: string;
}

/**
 * Format auction end time for display
 */
const formatAuctionEndTime = (auctionEndTime: string): string => {
  const endTime = new Date(auctionEndTime);
  return endTime.toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    timeZoneName: "short",
  });
};

/**
 * Calculate time remaining until auction ends
 */
const calculateTimeRemaining = (auctionEndTime: string): string => {
  const now = Date.now();
  const endTime = new Date(auctionEndTime).getTime();
  const timeLeft = endTime - now;

  if (timeLeft <= 0) {
    return "Auction Ended";
  }

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
};

/**
 * AuctionBiddingArea Component - Professional Design
 */
export const AuctionBiddingArea: React.FC<AuctionBiddingAreaProps> = React.memo(
  ({ auction, className }) => {
    const [bidAmount, setBidAmount] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [lastBidAmount, setLastBidAmount] = useState<number>(0);
    const [timeRemaining, setTimeRemaining] = useState<string>("");
    const { isAuthenticated } = usePublicPageAuth();
    const [errorOpen, setErrorOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [showBiddingHistory, setShowBiddingHistory] = useState(false);

    // Update countdown timer every second
    useEffect(() => {
      if (!auction.auction_end_time) {
        return;
      }

      const updateTimer = () => {
        if (auction.auction_end_time) {
          setTimeRemaining(calculateTimeRemaining(auction.auction_end_time));
        }
      };

      // Update immediately
      updateTimer();

      // Set up interval to update every second
      const interval = setInterval(updateTimer, 1000);

      // Cleanup interval on unmount
      return () => {
        clearInterval(interval);
      };
    }, [auction.auction_end_time]);

    // Memoized calculations for performance
    const minimumBid = useMemo(
      () =>
        calculateMinimumBid(
          auction.currentBid,
          auction.bid_increment_value,
          auction.minimum_bid
        ),
      [auction.currentBid, auction.bid_increment_value, auction.minimum_bid]
    );

    /**
     * Handle bid amount input change
     */
    const handleBidChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Only allow numbers and decimal point
        if (BID_PATTERN.test(value)) {
          setBidAmount(value);
        }
      },
      []
    );

    /**
     * Handle showing bid confirmation modal
     */
    const handleShowBidModal = useCallback(() => {
      const bid = Number.parseFloat(bidAmount);
      if (bid < minimumBid) {
        return;
      }
      setShowConfirmModal(true);
    }, [bidAmount, minimumBid]);

    /**
     * Handle confirmed bid submission
     */
    const handleConfirmBid = useCallback(async () => {
      const bid = Number.parseFloat(bidAmount);

      setIsSubmitting(true);
      try {
        // Prepare all bid data to send to API
        const bidData = {
          auctionId: auction.id,
          bidAmount: bid,
          bidAmountCurrency: auction.current_bid_currency || "USD",
          bidType: "REGULAR",
          auctionTitle: auction.title,
          currentBid: auction.currentBid,
          minimumBid: auction.minimum_bid,
          bidIncrementValue: auction.bid_increment_value,
        };

        // Call the actual API to place bid with all necessary information
        const { data: result, errors: bidErrors } = await bidOnAuction(bidData);

        if (bidErrors) {
          setShowConfirmModal(false);
          setErrorMessage("Failed to place bid. Please try again.");
          setErrorOpen(true);
          return;
        }

        const parsed = typeof result === "string" ? JSON.parse(result) : result;

        if (parsed?.success === false && parsed?.error) {
          setShowConfirmModal(false);
          setErrorMessage(formatBackendError(parsed.error));
          setErrorOpen(true);
          return;
        }

        // Close modal and show success dialog
        setShowConfirmModal(false);
        setLastBidAmount(bid);
        setShowSuccessDialog(true);
        setBidAmount("");
      } catch (error) {
        if (process.env.NODE_ENV === "development" && error) {
          // Error handled by service layer
        }
        setShowConfirmModal(false);
        setErrorMessage("Failed to place bid. Please try again.");
        setErrorOpen(true);
      } finally {
        setIsSubmitting(false);
      }
    }, [bidAmount, auction]);

    const handleCloseModal = useCallback(() => {
      if (!isSubmitting) {
        setShowConfirmModal(false);
      }
    }, [isSubmitting]);

    const handleCloseSuccessDialog = useCallback(() => {
      setShowSuccessDialog(false);
    }, []);

    /**
     * Handle bid count click to toggle bidding history
     */
    const handleBidCountClick = useCallback(() => {
      setShowBiddingHistory((prev) => !prev);
    }, []);

    /**
     * Handle manifest view - scroll to manifest section
     */
    const handleViewManifest = useCallback(() => {
      const manifestSection = document.querySelector("[data-manifest-section]");
      if (manifestSection) {
        manifestSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, []);

    const isValidBid = useMemo(() => {
      const bid = Number.parseFloat(bidAmount);
      return !Number.isNaN(bid) && bid >= minimumBid;
    }, [bidAmount, minimumBid]);

    return (
      <div className={className}>
        <Card className="border-none py-0 shadow-none">
          <CardHeader className="px-0 lg:px-4 lg:pb-6">
            <CardTitle className="mb-2 leading-tight font-bold text-gray-900 lg:text-2xl">
              {auction.title}
            </CardTitle>

            <div className="flex items-center text-gray-500">
              <MapPin className="h-4 w-4" />
              <span>{auction.location}</span>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 px-0 lg:px-4">
            {/* Current Bid */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600">
                  Current bid
                </div>
                <div className="mb-1 text-2xl font-bold text-gray-900 lg:text-4xl">
                  {formatAuctionCurrency(auction.currentBid)}
                </div>
              </div>
              <BiddingHistory
                auctionId={auction.id}
                currency={auction.current_bid_currency || "USD"}
                currentBid={auction.currentBid}
                isOpen={showBiddingHistory}
                onOpenChange={setShowBiddingHistory}
                trigger={
                  <button className="cursor-pointer text-sm font-medium text-blue-600 underline-offset-4 transition-colors hover:text-blue-800 hover:underline">
                    {formatBidCount(auction.totalBids)}
                  </button>
                }
              />
            </div>

            {/* Bidding Form */}
            <div className="space-y-4">
              <div>
                <label
                  className="mb-3 block text-sm font-semibold text-gray-700"
                  htmlFor="bid-amount-input"
                >
                  Your Maximum Bid
                </label>
                <div className="flex gap-3">
                  <Input
                    className="h-9 flex-1 text-sm"
                    disabled={!(auction.isActive && isAuthenticated)}
                    id="bid-amount-input"
                    onChange={handleBidChange}
                    placeholder="Enter the maximum amount you want to bid"
                    type="text"
                    value={bidAmount}
                  />
                  <ConditionalActionButton
                    authenticatedIcon={<Gavel className="mr-2 h-4 w-4" />}
                    authenticatedText="BID NOW"
                    className="h-10 rounded-full bg-black px-6 text-white hover:bg-gray-800"
                    disabled={!(isValidBid && auction.isActive)}
                    guestText="SIGN IN TO BID"
                    itemName={auction.title}
                    onAuthenticatedClick={handleShowBidModal}
                    requiredUserType="buyer"
                    triggerAction="place_bid"
                  />
                </div>
                <div className="font-small text-dark mt-2 text-sm">
                  Enter {formatAuctionCurrency(minimumBid)} or more in whole{" "}
                  {auction.current_bid_currency
                    ? auction.current_bid_currency
                    : "USD"}
                  &nbsp;dollars
                </div>
              </div>
            </div>

            {/* Information Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600 lg:text-base">
                    MSRP
                  </span>
                  <Info className="h-3.5 w-3.5 text-gray-400" />
                </div>
                <div className="text-right">
                  <div className="font-semibold lg:text-lg">
                    {formatAuctionCurrency(auction.total_ex_retail_price)} /{" "}
                    {auction.total_units && auction.total_ex_retail_price > 0
                      ? (
                          ((auction.total_ex_retail_price *
                            auction.total_units -
                            auction.currentBid) /
                            (auction.total_ex_retail_price *
                              auction.total_units)) *
                          100
                        ).toFixed(2)
                      : 0}
                    % off
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-gray-100 py-2">
                <span className="text-sm font-medium text-gray-600 lg:text-base">
                  Avg. Cost Per Unit
                </span>
                <span className="font-semibold lg:text-lg">
                  {auction.total_units && auction.total_ex_retail_price > 0
                    ? formatAuctionCurrency(
                        auction.currentBid / auction.total_units
                      )
                    : "$0.00"}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-100 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600 lg:text-base">
                    Shipping Cost
                  </span>
                  <Info className="h-3.5 w-3.5 text-gray-400" />
                </div>
                <div className="text-right">
                  <div className="font-semibold lg:text-lg">$1,432</div>
                  <div className="flex items-center text-sm text-gray-500 lg:text-lg">
                    to: {auction.location}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-b border-gray-100 py-2">
                <span className="text-md text-sm font-medium text-gray-600 lg:text-base">
                  Closes in
                </span>
                <span className="font-semibold text-red-600 lg:text-lg">
                  {timeRemaining || auction.timeLeft}
                </span>
              </div>

              <div className="flex items-start justify-between py-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600 lg:text-base">
                    Close Date
                  </span>
                  <Info className="h-3.5 w-3.5 text-gray-400" />
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold lg:text-lg">
                    {auction.auction_end_time
                      ? formatAuctionEndTime(auction.auction_end_time)
                      : "TBD"}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-0 lg:pt-4">
              <Button
                className="h-10 rounded-full border border-black bg-white px-6 text-sm font-medium text-black hover:bg-gray-50"
                onClick={handleViewManifest}
              >
                View Manifest
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bid Confirmation Modal */}
        <BidConfirmationModal
          bidAmount={Number.parseFloat(bidAmount) || 0}
          currency={auction.current_bid_currency || "USD"}
          isOpen={showConfirmModal}
          isSubmitting={isSubmitting}
          onClose={handleCloseModal}
          onConfirm={handleConfirmBid}
          timeLeft={auction.timeLeft}
        />

        {/* Bid Success Dialog */}
        <BidSuccessDialog
          auctionTitle={auction.title}
          bidAmount={lastBidAmount}
          currency={auction.current_bid_currency || "USD"}
          isOpen={showSuccessDialog}
          onClose={handleCloseSuccessDialog}
        />

        {/* Bid Error Dialog */}
        <AlertDialog onOpenChange={setErrorOpen} open={errorOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Bidding Error</AlertDialogTitle>
              <AlertDialogDescription className="whitespace-pre-line">
                {errorMessage}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setErrorOpen(false)}>
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }
);

AuctionBiddingArea.displayName = "AuctionBiddingArea";
