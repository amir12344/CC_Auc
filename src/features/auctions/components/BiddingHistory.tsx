"use client";

import React, { useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Clock, Trophy } from "lucide-react";

import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { Skeleton } from "@/src/components/ui/skeleton";

import {
  fetchAuctionBids,
  formatAuctionCurrency,
} from "../services/auctionQueryService";
import type { AuctionBid } from "../types";

const BiddingContent = ({
  isLoading,
  error,
  sortedBids,
  currentBid,
  displayedBids,
  hasMoreBids,
  showAll,
  setShowAll,
}: {
  isLoading: boolean;
  error: Error | null;
  sortedBids: AuctionBid[];
  currentBid: number;
  displayedBids: AuctionBid[];
  hasMoreBids: boolean;
  showAll: boolean;
  setShowAll: (show: boolean) => void;
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...new Array(5)].map((_, i) => (
          <div
            className="flex items-center justify-between rounded-lg border p-4"
            key={`skeleton-${i}`}
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
            <Skeleton className="h-6 w-28" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load bidding history. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (sortedBids.length === 0) {
    return (
      <div className="py-12 text-center">
        <Clock className="text-muted-foreground/50 mx-auto mb-4 h-16 w-16" />
        <h3 className="mb-2 text-lg font-semibold">No bids yet</h3>
        <p className="text-muted-foreground">
          Be the first to place a bid on this auction!
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-shrink-0 space-y-4 border-b border-gray-200 pb-6 text-center dark:border-gray-700">
        <div className="space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Current Leading Bid
          </p>
          <div className="text-3xl font-medium text-gray-900 sm:text-4xl dark:text-gray-100">
            {formatAuctionCurrency(currentBid)}
          </div>
        </div>
        <p className="mx-auto max-w-lg text-sm leading-relaxed text-gray-500 dark:text-gray-400">
          Bids are ranked by amount, then by time. Multiple bids per bidder may
          appear. All bidder identities remain anonymous.
        </p>
      </div>

      <div className="mt-6 flex min-h-0 flex-1 flex-col">
        <div className="min-h-[30vh] flex-1 space-y-3 overflow-y-auto pr-1 pb-8 sm:pr-2 sm:pb-4 [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200/40 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
          {displayedBids.map((bid, index) => {
            const isWinning = index === 0;
            const bidTime = new Date(bid.timestamp);

            return (
              <div
                className={`flex flex-col rounded-lg border p-4 transition-all duration-200 sm:flex-row sm:items-center sm:justify-between sm:p-5 ${
                  isWinning
                    ? "border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-800"
                    : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
                }`}
                key={bid.id}
              >
                <div className="flex flex-1 items-center gap-3 sm:gap-4">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium sm:h-10 sm:w-10 sm:text-sm ${
                      isWinning
                        ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                    }`}
                  >
                    {isWinning ? (
                      <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2 sm:gap-3">
                      <span className="truncate text-sm font-medium text-gray-900 sm:text-base dark:text-gray-100">
                        {bid.bidderName || `Bidder ${index + 1}`}
                      </span>
                      {isWinning && (
                        <Badge className="bg-green-100 text-xs text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200">
                          Winning
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 sm:gap-2 sm:text-sm dark:text-gray-400">
                      <Clock className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">
                        {bidTime.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        at{" "}
                        {bidTime.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-right sm:mt-0 sm:ml-4">
                  <p className="text-base font-medium text-gray-900 sm:text-lg dark:text-gray-100">
                    {formatAuctionCurrency(bid.bidAmount)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {hasMoreBids && (
          <div className="flex-shrink-0 border-t pt-4 text-center">
            <Button
              className="text-sm"
              onClick={() => setShowAll(!showAll)}
              size="sm"
              variant="outline"
            >
              {showAll ? (
                <>
                  <ChevronUp className="mr-2 h-4 w-4" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="mr-2 h-4 w-4" />
                  Show All {sortedBids.length} Bids
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

interface BiddingHistoryProps {
  auctionId: string;
  currentBid: number;
  currency: string;
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const BiddingHistory: React.FC<BiddingHistoryProps> = ({
  auctionId,
  currentBid,
  trigger,
  isOpen,
  onOpenChange,
}) => {
  const [showAll, setShowAll] = useState(false);

  const {
    data: bids,
    isLoading,
    error,
  } = useQuery<AuctionBid[]>({
    queryKey: ["auction-bids", auctionId],
    queryFn: () => fetchAuctionBids(auctionId),
    enabled: !!auctionId && !!isOpen,
    staleTime: 30_000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });

  const sortedBids =
    bids?.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ) || [];

  // Get unique bidders with their latest bids
  const uniqueBidders = sortedBids.reduce(
    (acc, bid) => {
      const existingBidder = acc.find((b) => b.bidderId === bid.bidderId);
      if (!existingBidder) {
        acc.push(bid);
      }
      return acc;
    },
    [] as typeof sortedBids
  );

  const displayedBids = showAll ? uniqueBidders : uniqueBidders.slice(0, 10);
  const hasMoreBids = uniqueBidders.length > 10;

  return (
    <Dialog onOpenChange={onOpenChange} open={isOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="flex max-h-[90vh] w-[95vw] max-w-4xl flex-col sm:w-full">
        <DialogHeader className="flex-shrink-0 border-b pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg sm:gap-3 sm:text-xl">
            <div className="rounded-lg bg-gray-100 p-1.5 sm:p-2 dark:bg-gray-800">
              <Clock className="h-4 w-4 text-gray-600 sm:h-5 sm:w-5 dark:text-gray-400" />
            </div>
            <div>
              <div className="font-medium">
                Bid History ({sortedBids.length} bids by{" "}
                {new Set(sortedBids.map((bid) => bid.bidderId)).size} bidders)
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4 min-h-0 flex-1 overflow-auto">
          <BiddingContent
            currentBid={currentBid}
            displayedBids={displayedBids}
            error={error}
            hasMoreBids={hasMoreBids}
            isLoading={isLoading}
            setShowAll={setShowAll}
            showAll={showAll}
            sortedBids={sortedBids}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BiddingHistory;
