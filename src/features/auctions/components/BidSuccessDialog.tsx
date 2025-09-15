"use client";

import React, { useCallback } from "react";

import { CheckCircle } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";

import { formatAuctionCurrency } from "../services/auctionQueryService";

interface BidSuccessDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Function to close the dialog */
  onClose: () => void;
  /** Bid amount that was placed */
  bidAmount: number;
  /** Auction title */
  auctionTitle: string;
  /** Currency for the bid */
  currency?: string;
}

/**
 * BidSuccessDialog - ShadCN success dialog for auction bid confirmation
 *
 * Features:
 * - Professional success messaging
 * - Clean ShadCN design
 * - Mobile-friendly responsive layout
 */
export const BidSuccessDialog: React.FC<BidSuccessDialogProps> = ({
  isOpen,
  onClose,
  bidAmount,
  auctionTitle,
}) => {
  // Memoize the close handler to prevent unnecessary re-renders
  const handleClose = useCallback(() => {
    onClose();
    window.location.reload();
  }, [onClose]);

  return (
    <Dialog onOpenChange={handleClose} open={isOpen}>
      <DialogContent className="w-[95vw] max-w-md rounded-lg border-0 bg-white p-0 shadow-xl sm:w-full">
        {/* Header */}
        <DialogHeader className="border-b border-gray-100 px-6 py-4">
          <DialogTitle className="text-center text-lg font-semibold text-gray-900">
            Bid Placed Successfully!
          </DialogTitle>
          <DialogDescription className="sr-only">
            Your bid has been successfully placed on this auction. This dialog
            confirms your bid amount and provides information about next steps.
          </DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="space-y-6 px-6 py-6">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Your bid has been placed!
            </h3>
            <p className="text-sm leading-relaxed text-gray-600">
              You have successfully placed a bid of{" "}
              <span className="font-semibold text-gray-900">
                {formatAuctionCurrency(bidAmount)}
              </span>{" "}
              on this auction.
            </p>
          </div>

          {/* Auction Info */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">Auction Item:</p>
              <p className="mt-1 line-clamp-2 text-sm text-gray-700">
                {auctionTitle}
              </p>
            </div>
          </div>

          {/* Next Steps */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="text-center">
              <h4 className="mb-2 text-sm font-medium text-blue-900">
                What happens next?
              </h4>
              <ul className="space-y-1 text-xs text-blue-800">
                <li>• You&apos;ll be notified if you&apos;re outbid</li>
                <li>• We&apos;ll contact you if you win the auction</li>
                <li>• Check your email for updates</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4">
          <Button
            className="w-full rounded-full bg-green-600 text-white hover:bg-green-700"
            onClick={handleClose}
          >
            Continue Browsing
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
