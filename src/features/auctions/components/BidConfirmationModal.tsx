"use client";

import React, { useCallback } from "react";

import { Clock } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";

import { formatAuctionCurrency } from "../services/auctionQueryService";

interface BidConfirmationModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Function to close the modal */
  onClose: () => void;
  /** Function called when user confirms the bid */
  onConfirm: () => void;
  /** Whether the bid submission is in progress */
  isSubmitting?: boolean;
  /** Bid amount to display */
  bidAmount: number;
  /** Time left in the auction */
  timeLeft: string;
  /** Currency for the bid */
  currency?: string;
}

/**
 * BidConfirmationModal - Mobile-friendly confirmation dialog for auction bids
 *
 * Features:
 * - Responsive design for mobile and desktop
 * - Clean, minimal design matching the reference images
 * - Loading state during bid submission
 * - Accessible with proper ARIA labels
 */
export const BidConfirmationModal: React.FC<BidConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
  bidAmount,
  timeLeft,
  currency = "USD",
}) => {
  // Memoize handlers to prevent unnecessary re-renders
  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [onClose, isSubmitting]);

  const handleConfirm = useCallback(() => {
    if (!isSubmitting) {
      onConfirm();
    }
  }, [onConfirm, isSubmitting]);

  return (
    <Dialog onOpenChange={handleClose} open={isOpen}>
      <DialogContent
        className="w-[95vw] max-w-md rounded-lg border-0 bg-white p-0 shadow-xl sm:w-full"
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Header */}
        <DialogHeader className="border-b border-gray-100 px-6 py-4">
          <DialogTitle className="text-center text-lg font-semibold text-gray-900">
            Confirm Your Bid
          </DialogTitle>
          <DialogDescription className="sr-only">
            Review and confirm your bid amount for this auction. This dialog
            shows your bid amount, time remaining, and important notices about
            the bidding process.
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="space-y-6 px-6 py-6">
          {/* Explanation text */}
          <p className="text-center text-sm leading-relaxed text-gray-600">
            Please review your bid amount carefully. This is the maximum amount
            you are agreeing to pay for the product in this listing.
          </p>

          {/* Bid Amount Section */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                  Your Bid Amount:
                </span>
                <span className="text-xs text-gray-500">
                  You may win the auction at a lower price
                </span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {formatAuctionCurrency(bidAmount)}
                </div>
                <div className="text-xs text-gray-500">{currency} dollars</div>
              </div>
            </div>
          </div>

          {/* Time Left Section */}
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-900">
                Time Left
              </span>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-red-600">
                {timeLeft}
              </div>
              <div className="text-xs text-gray-500">
                Auction&apos;s end time can be extended by your bid
              </div>
            </div>
          </div>

          {/* Warning Notice */}
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-orange-100">
                <span className="text-xs font-bold text-orange-600">!</span>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-orange-900">
                  Before placing your bid, be aware of:
                </h4>
                <ul className="mt-2 space-y-1 text-xs text-orange-800">
                  <li>• Additional charges may apply (shipping, fees, etc.)</li>
                  <li>• Payment will be processed automatically if you win</li>
                  <li>• This bid is binding and cannot be cancelled</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 border-t border-gray-100 px-6 py-4">
          <Button
            className="flex-1 rounded-full border-gray-300 text-gray-700 hover:bg-gray-50"
            disabled={isSubmitting}
            onClick={handleClose}
            variant="outline"
          >
            Cancel
          </Button>

          <Button
            className="flex-1 rounded-full bg-black text-white hover:bg-gray-800 disabled:bg-gray-400"
            disabled={isSubmitting}
            onClick={handleConfirm}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Placing Bid...</span>
              </div>
            ) : (
              "CONFIRM MY BID"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
