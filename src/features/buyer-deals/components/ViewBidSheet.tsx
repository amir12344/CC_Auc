"use client";

import Image from "next/image";

import { Hammer } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/src/components/ui/sheet";

import type { BuyerBid } from "../types";

interface ViewBidSheetProps {
  isOpen: boolean;
  bid: BuyerBid | null;
  onCloseAction: () => void;
}

export default function ViewBidSheet({
  isOpen,
  bid,
  onCloseAction,
}: ViewBidSheetProps) {
  if (!bid) return null;

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString || "").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen) return null;

  return (
    <Sheet onOpenChange={onCloseAction} open={isOpen}>
      <SheetContent className="w-full overflow-y-auto p-4 sm:max-w-md sm:p-6">
        <SheetHeader className="space-y-3 pb-4 sm:space-y-4 sm:pb-6">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-bold text-gray-900 sm:text-xl">
              Bid Details
            </SheetTitle>
          </div>
          <SheetDescription className="sr-only">
            View details of your bid
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Product Image */}
          <div className="relative h-40 w-full overflow-hidden rounded-xl bg-gradient-to-br from-orange-300 to-orange-500 shadow-lg sm:h-48">
            {bid.imageUrl ? (
              <Image
                alt={bid.title}
                className="object-cover"
                fill
                src={bid.imageUrl}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-300 to-gray-500">
                <span className="text-base font-bold text-white sm:text-lg">
                  {bid?.title
                    ? bid.title.substring(0, 15).toUpperCase()
                    : "NO IMAGE"}
                </span>
              </div>
            )}
          </div>

          {/* Product Title */}
          <div className="px-1">
            <h2 className="text-lg leading-tight font-bold text-gray-900 sm:text-xl">
              {bid.title}
            </h2>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 gap-4 px-1 sm:grid-cols-2 sm:gap-6">
            <div className="space-y-2 rounded-lg bg-gray-50 p-3 sm:rounded-none sm:bg-transparent sm:p-0">
              <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase sm:text-sm">
                Category
              </span>
              <p className="text-sm font-medium text-gray-900 sm:text-base">
                Beauty, Grooming & Wellness
              </p>
            </div>
            <div className="space-y-2 rounded-lg bg-gray-50 p-3 sm:rounded-none sm:bg-transparent sm:p-0">
              <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase sm:text-sm">
                Status
              </span>
              <div className="flex items-start">
                <span
                  className={`inline-flex cursor-pointer items-center rounded-full px-2.5 py-1 text-xs font-semibold transition-colors hover:bg-green-200 sm:px-3 sm:py-1.5 sm:text-sm ${
                    bid.actionType === "AUCTION_WON"
                      ? "bg-emerald-100 text-emerald-800"
                      : bid.isWinningBid
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                  }`}
                >
                  <Hammer className="mr-1 h-3 w-3" />
                  {bid.actionType === "AUCTION_WON"
                    ? "Auction Won"
                    : bid.isWinningBid
                      ? "Winning Bid"
                      : "Bid Placed"}
                </span>
              </div>
            </div>
            <div className="space-y-2 rounded-lg bg-gray-50 p-3 sm:rounded-none sm:bg-transparent sm:p-0">
              <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase sm:text-sm">
                Your Bid Amount
              </span>
              <p className="text-lg font-bold text-gray-900 sm:text-xl">
                {formatPrice(bid.bidAmount)}
                <span className="ml-2 text-sm font-normal text-gray-500 sm:text-base">
                  {bid.currency}
                </span>
              </p>
            </div>
            <div className="space-y-2 rounded-lg bg-gray-50 p-3 sm:rounded-none sm:bg-transparent sm:p-0">
              <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase sm:text-sm">
                Bid Placed
              </span>
              <p className="text-sm font-medium text-gray-900 sm:text-base">
                {formatDate(bid.bidTimestamp)}
              </p>
            </div>
          </div>

          {/* Auction End Time */}
          <div className="mx-1 rounded-xl bg-gray-50 p-3 sm:p-4">
            <div className="space-y-2">
              <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase sm:text-sm">
                Auction End Time
              </span>
              <p className="text-sm font-medium text-gray-900 sm:text-base">
                {bid.auctionEndTime
                  ? formatDate(bid.auctionEndTime)
                  : "Not specified"}
              </p>
            </div>
          </div>

          {/* Winning Status */}
          {(bid.actionType === "AUCTION_WON" || bid.isWinningBid) && (
            <div
              className={`mx-1 rounded-xl border p-4 shadow-sm sm:p-6 ${
                bid.actionType === "AUCTION_WON"
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-green-200 bg-green-50"
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full sm:h-8 sm:w-8 ${
                      bid.actionType === "AUCTION_WON"
                        ? "bg-emerald-100"
                        : "bg-green-100"
                    }`}
                  >
                    <span
                      className={`text-xs font-bold sm:text-sm ${
                        bid.actionType === "AUCTION_WON"
                          ? "text-emerald-600"
                          : "text-green-600"
                      }`}
                    >
                      ✓
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3
                    className={`text-sm font-semibold sm:text-base ${
                      bid.actionType === "AUCTION_WON"
                        ? "text-emerald-800"
                        : "text-green-800"
                    }`}
                  >
                    {bid.actionType === "AUCTION_WON"
                      ? "Congratulations! You won this auction!"
                      : "You're currently winning!"}
                  </h3>
                  <p
                    className={`mt-1 text-xs leading-relaxed sm:text-sm ${
                      bid.actionType === "AUCTION_WON"
                        ? "text-emerald-700"
                        : "text-green-700"
                    }`}
                  >
                    {bid.actionType === "AUCTION_WON"
                      ? `Your winning bid of ${formatPrice(bid.bidAmount)} has secured this auction.`
                      : `Your bid of ${formatPrice(bid.bidAmount)} is currently the highest bid for this auction.`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-6 pb-2 sm:pt-8 sm:pb-4">
          <Button
            className="w-full cursor-pointer rounded-full bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800 sm:px-6 sm:py-3 sm:text-base"
            onClick={onCloseAction}
          >
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
