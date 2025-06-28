'use client';

import { ChevronDown, Gavel, Info, MapPin } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { Button } from '@/src/components/ui/button';
import { ConditionalActionButton } from '@/src/components/ui/ConditionalActionButton';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { usePublicPageAuth } from '@/src/hooks/useAuthState';
import {
  calculateMinimumBid,
  formatAuctionCurrency,
  formatBidCount,
} from '../services/auctionQueryService';
import type { Auction } from '../types';

// Regex pattern for bid validation (defined at top level for performance)
const BID_PATTERN = /^\d*\.?\d*$/;

interface AuctionBiddingAreaProps {
  /** Auction data object */
  auction: Auction;
  /** Optional className for styling */
  className?: string;
}

/**
 * AuctionBiddingArea Component - Professional Design
 *
 * Clean, professional bidding interface with minimal colors and optimal spacing.
 */
export const AuctionBiddingArea: React.FC<AuctionBiddingAreaProps> = React.memo(
  ({ auction, className }) => {
    const [bidAmount, setBidAmount] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { isAuthenticated } = usePublicPageAuth();

    // Memoized calculations for performance
    const minimumBid = useMemo(
      () => calculateMinimumBid(auction.currentBid),
      [auction.currentBid]
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
     * Handle bid submission
     */
    const handleSubmitBid = useCallback(async () => {
      const bid = Number.parseFloat(bidAmount);
      if (bid < minimumBid) {
        return;
      }

      setIsSubmitting(true);
      try {
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setBidAmount('');
      } finally {
        setIsSubmitting(false);
      }
    }, [bidAmount, minimumBid]);

    /**
     * Handle manifest view - scroll to manifest section
     */
    const handleViewManifest = useCallback(() => {
      const manifestSection = document.querySelector('[data-manifest-section]');
      if (manifestSection) {
        manifestSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }, []);

    const isValidBid = useMemo(() => {
      const bid = Number.parseFloat(bidAmount);
      return !Number.isNaN(bid) && bid >= minimumBid;
    }, [bidAmount, minimumBid]);

    return (
      <div className={className}>
        <Card className="border-none shadow-none">
          <CardHeader className="lg:pb-6 px-0 lg:px-4 ">
            <CardTitle className="lg:text-2xl font-bold text-gray-900 mb-2 leading-tight">
              {auction.title}
            </CardTitle>

            <div className="flex items-center text-gray-500">
              <MapPin className="h-4 w-4" />
              <span>Austin, TX</span>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 px-0 lg:px-4">
            {/* Current Bid */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 font-medium">
                  Current bid
                </div>
                <div className="text-2xl lg:text-4xl font-bold text-gray-900 mb-1">
                  {formatAuctionCurrency(auction.currentBid)}
                </div>
              </div>
              <div className="font-medium text-blue-600 text-sm">
                {formatBidCount(auction.totalBids)}
              </div>
            </div>

            {/* Bidding Form */}
            <div className="space-y-4">
              <div>
                <label
                  className="block text-sm text-gray-700 mb-3 font-semibold"
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
                    placeholder="12950"
                    type="text"
                    value={bidAmount}
                  />
                  <ConditionalActionButton
                    authenticatedIcon={<Gavel className="mr-2 h-4 w-4" />}
                    authenticatedText={isSubmitting ? 'BIDDING...' : 'BID NOW'}
                    className="h-10 rounded-full bg-black px-6 text-white hover:bg-gray-800"
                    disabled={!isValidBid || isSubmitting || !auction.isActive}
                    guestText="SIGN IN TO BID"
                    isLoading={isSubmitting}
                    itemName={auction.title}
                    onAuthenticatedClick={handleSubmitBid}
                    requiredUserType="buyer"
                    triggerAction="place_bid"
                  />
                </div>
                <div className="text-sm text-dark mt-2 font-small">
                  Enter {formatAuctionCurrency(minimumBid)} or more in whole USD
                  dollars
                </div>
              </div>
            </div>

            {/* Information Grid */}
            <div className="space-y-4 ">
              <div className="flex items-center justify-between border-gray-100 border-b py-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 font-medium text-sm lg:text-base">
                    Shipping Cost
                  </span>
                  <Info className="h-3.5 w-3.5 text-gray-400" />
                </div>
                <div className="text-right">
                  <div className="font-semibold lg:text-lg">$3,195.37</div>
                  <div className="flex items-center text-sm lg:text-lg text-gray-500">to: Austin, TX</div>
                </div>
              </div>

              <div className="flex items-center justify-between border-gray-100 border-b py-2">
                <span className="text-gray-600 font-medium text-sm lg:text-base">
                  Avg. Cost Per Unit
                </span>
                <span className="font-semibold lg:text-lg">$3.27</span>
              </div>

              <div className="flex items-center justify-between border-gray-100 border-b py-2">
                <span className="text-gray-600 font-medium text-sm lg:text-base text-md">Closes in</span>
                <span className="font-semibold lg:text-lg text-red-600">1h 9m</span>
              </div>

              <div className="flex items-start justify-between py-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 font-medium text-sm lg:text-base">
                    Close Date
                  </span>
                  <Info className="h-3.5 w-3.5 text-gray-400" />
                </div>
                <div className="text-right">
                  <div className="font-semibold text-sm lg:text-lg">
                    Fri Jun 20, 2025 6:02:00 PM UTC
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-0 lg:pt-4">
              <Button
                className="h-10 rounded-full border border-black bg-white px-6 font-medium text-black text-sm hover:bg-gray-50"
                onClick={handleViewManifest}
              >
                View Manifest
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
);

AuctionBiddingArea.displayName = 'AuctionBiddingArea';
