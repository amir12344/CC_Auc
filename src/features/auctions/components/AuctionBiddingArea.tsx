'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import {
  Gavel,
  Clock,
  MapPin,
  FileText,
  Info,
  ChevronDown
} from 'lucide-react';
import { Auction } from '../types';
import {
  formatAuctionCurrency,
  formatBidCount,
  calculateMinimumBid,
  getTimeRemaining
} from '../utils/auction-utils';
import { ConditionalActionButton } from '@/src/components/ui/ConditionalActionButton';
import { usePublicPageAuth } from '@/src/hooks/useAuthState';

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
export const AuctionBiddingArea: React.FC<AuctionBiddingAreaProps> = React.memo(({
  auction,
  className
}) => {
  const [bidAmount, setBidAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated } = usePublicPageAuth();

  // Memoized calculations for performance
  const minimumBid = useMemo(() => calculateMinimumBid(auction.currentBid), [auction.currentBid]);
  const timeRemaining = useMemo(() => getTimeRemaining(auction.endTime), [auction.endTime]);

  /**
   * Handle bid amount input change
   */
  const handleBidChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setBidAmount(value);
    }
  }, []);

  /**
   * Handle bid submission
   */
  const handleSubmitBid = useCallback(async () => {
    const bid = parseFloat(bidAmount);
    if (bid < minimumBid) return;

    setIsSubmitting(true);
    try {
      console.log('Submitting bid:', bid, 'for auction:', auction.id);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBidAmount('');
    } catch (error) {
      console.error('Failed to submit bid:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [bidAmount, minimumBid, auction.id]);

  /**
   * Handle manifest view - scroll to manifest section
   */
  const handleViewManifest = useCallback(() => {
    const manifestSection = document.querySelector('[data-manifest-section]');
    if (manifestSection) {
      manifestSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, []);

  const isValidBid = useMemo(() => {
    const bid = parseFloat(bidAmount);
    return !isNaN(bid) && bid >= minimumBid;
  }, [bidAmount, minimumBid]);

  return (
    <div className={className}>
      <Card className="border-none shadow-none">
        <CardHeader className="pb-6">
          <CardTitle className="text-lg font-semibold text-gray-900 leading-6">
            {auction.title}
          </CardTitle>

          <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-2">
            <MapPin className="h-4 w-4" />
            <span>Austin, TX</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Current Bid */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-gray-900 mb-1">Current bid</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatAuctionCurrency(auction.currentBid)}
              </div>
            </div>
            <div className="text-sm text-blue-600 font-medium">
              {formatBidCount(auction.totalBids)}
            </div>
          </div>

          {/* Bidding Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Maximum Bid
              </label>
              <div className="flex gap-3">
                <Input
                  type="text"
                  value={bidAmount}
                  onChange={handleBidChange}
                  placeholder="12950"
                  className="flex-1 h-9 text-sm"
                  disabled={!auction.isActive || !isAuthenticated}
                />
                <ConditionalActionButton
                  onAuthenticatedClick={handleSubmitBid}
                  triggerAction="place_bid"
                  itemName={auction.title}
                  requiredUserType="buyer"
                  guestText="SIGN IN TO BID"
                  authenticatedText={isSubmitting ? 'BIDDING...' : 'BID NOW'}
                  authenticatedIcon={<Gavel className="mr-2 h-4 w-4" />}
                  disabled={!isValidBid || isSubmitting || !auction.isActive}
                  isLoading={isSubmitting}
                  className="h-10 rounded-full bg-black hover:bg-gray-800 text-white px-6"
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Enter {formatAuctionCurrency(minimumBid)} or more in whole USD dollars
              </div>
            </div>
          </div>

          {/* Information Grid */}
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">Shipping Cost</span>
                <Info className="h-3.5 w-3.5 text-gray-400" />
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">$3,195.37</div>
                <div className="text-xs text-gray-500">to: Austin, TX</div>
              </div>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="font-semibold text-gray-900">Avg. Cost Per Unit</span>
              <span className="font-medium text-gray-900">$3.27</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="font-semibold text-gray-900">Closes in</span>
              <span className="font-medium text-gray-900">1h 9m</span>
            </div>

            <div className="flex justify-between items-start py-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">Close Date</span>
                <Info className="h-3.5 w-3.5 text-gray-400" />
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">
                  Fri Jun 20, 2025 6:02:00 PM UTC
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 space-y-2">
            <Button
              onClick={handleViewManifest}
              className="h-10 rounded-full bg-white border border-black text-black hover:bg-gray-50 text-sm font-medium px-6"
            >
              View Manifest
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

AuctionBiddingArea.displayName = 'AuctionBiddingArea'; 