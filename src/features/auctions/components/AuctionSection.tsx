'use client';

import { memo, useCallback, useEffect, useState } from 'react';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';
import { Skeleton } from '@/src/components/ui/skeleton';
import { ProductSection } from '@/src/features/marketplace-catalog/components/ProductSection';
import { fetchAuctionListings } from '../services/auctionQueryService';
import type { Auction } from '../types';
import AuctionCard from './AuctionCard';

/**
 * AuctionSection - Client Component for displaying auction listings
 * Shows active auctions in a carousel layout on the marketplace page
 *
 * Features:
 * - Fetches auction data from API using the queryData function
 * - Service returns already transformed UI-ready Auction objects
 * - Uses carousel layout for horizontal scrolling
 * - Error boundary for individual auction cards
 * - Loading states and empty states
 */
export const AuctionSection = memo(() => {
  const [auctionList, setAuctionList] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch auctions using centralized service
   * Service now returns already transformed Auction objects
   */
  const fetchAuctions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Service returns already transformed Auction objects
      const auctions = await fetchAuctionListings();
      setAuctionList(auctions);
    } catch (apiError) {
      setError(
        `Failed to load auctions: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`
      );
      setAuctionList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  /**
   * Loading state - shows skeleton cards while data is being fetched
   */
  if (loading) {
    return (
      <ProductSection
        layout="carousel"
        title="Live Auctions"
        viewAllLink="/collections/auctions"
      >
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton
            className="aspect-square w-full rounded-lg"
            key={`auction-skeleton-${index + 1}`}
          />
        ))}
      </ProductSection>
    );
  }

  /**
   * Error state - shows when API call fails
   */
  if (error) {
    return (
      <ProductSection
        layout="carousel"
        title="Live Auctions"
        viewAllLink="/collections/auctions"
      >
        <div className="col-span-full mt-4 text-center text-gray-500">
          <p>{error}</p>
          <p className="mt-1 text-sm">Please refresh the page to try again.</p>
        </div>
      </ProductSection>
    );
  }

  /**
   * Empty state - shows when no auctions are available
   */
  if (!auctionList || auctionList.length === 0) {
    return (
      <ProductSection
        layout="carousel"
        title="Live Auctions"
        viewAllLink="/collections/auctions"
      >
        <div className="col-span-full mt-4 text-center text-gray-500">
          <p>No active auctions at the moment.</p>
          <p className="mt-1 text-sm">
            Check back soon for new auction listings!
          </p>
        </div>
      </ProductSection>
    );
  }

  /**
   * Main render - displays auction cards with API data
   */
  return (
    <ProductSection
      layout="carousel"
      title="Live Auctions"
      viewAllLink="/collections/auctions"
    >
      {auctionList.map((auction: Auction) => (
        <ErrorBoundary
          fallback={<Skeleton className="aspect-square w-full rounded-lg" />}
          key={auction.id}
        >
          <AuctionCard auction={auction} />
        </ErrorBoundary>
      ))}
    </ProductSection>
  );
});

AuctionSection.displayName = 'AuctionSection';
