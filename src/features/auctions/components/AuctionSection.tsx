'use client';

import { memo } from 'react';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';
import { ProductSection } from '@/src/features/marketplace-catalog/components/ProductSection';
import { Auction } from '../types';
import { auctionListings, getActiveAuctions } from '../data/auctionData';
import AuctionCard from './AuctionCard';
import { Skeleton } from '@/src/components/ui/skeleton';

/**
 * AuctionSection - Client Component for displaying auction listings
 * Shows active auctions in a carousel layout on the marketplace page
 * 
 * Features:
 * - Displays active auctions only
 * - Uses carousel layout for horizontal scrolling
 * - Error boundary for individual auction cards
 * - Loading states and empty states
 * - Links to view all auctions page
 * 
 * Data Flow:
 * - Imports auction data from mock file
 * - Filters for active auctions only
 * - Renders AuctionCard components in ProductSection wrapper
 */
export const AuctionSection = memo(() => {
  // Get active auctions from mock data
  // In production, this would come from an API call or hook
  const auctions = getActiveAuctions();
  const loading = false; // Mock loading state - would come from API hook

  /**
   * Loading state - shows skeleton cards while data is being fetched
   */
  if (loading) {
    return (
      <ProductSection 
        title="Live Auctions" 
        layout="carousel"
        viewAllLink="/collections/auctions"
      >
        {Array(4).fill(0).map((_, index) => (
          <Skeleton key={index} className="aspect-square rounded-lg w-full" />
        ))}
      </ProductSection>
    );
  }
  
  /**
   * Empty state - shows when no auctions are available
   */
  if (!auctions || auctions.length === 0) {
    return (
      <ProductSection 
        title="Live Auctions" 
        layout="carousel"
        viewAllLink="/collections/auctions"
      >
        <div className="text-center text-gray-500 mt-4 col-span-full">
          <p>No active auctions at the moment.</p>
          <p className="text-sm mt-1">Check back soon for new auction listings!</p>
        </div>
      </ProductSection>
    );
  }

  /**
   * Main render - displays auction cards in carousel layout
   */
  return (
    <ProductSection 
      title="Live Auctions" 
      layout="carousel"
      viewAllLink="/collections/auctions"
    >
      {auctions.map((auction: Auction) => (
        <ErrorBoundary 
          key={auction.id} 
          fallback={<Skeleton className="aspect-square rounded-lg w-full" />}
        >
          <AuctionCard auction={auction} />
        </ErrorBoundary>
      ))}
    </ProductSection>
  );
});

AuctionSection.displayName = 'AuctionSection'; 