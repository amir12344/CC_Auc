'use client';

import { generateClient } from 'aws-amplify/api';
import { memo, useEffect, useState } from 'react';
import type { Schema } from '@/amplify/data/resource';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';
import { Skeleton } from '@/src/components/ui/skeleton';
import { ProductSection } from '@/src/features/marketplace-catalog/components/ProductSection';
import type { FindManyArgs } from '@/src/lib/prisma/PrismaQuery.type';
import { getActiveAuctions } from '../data/auctionData';
import type { Auction } from '../types';
import AuctionCard from './AuctionCard';

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
  const [loading, setLoading] = useState(false);

  // Call apiRes on component mount
  useEffect(() => {
    const apiRes = async () => {
      try {
        setLoading(true);
        const client = generateClient<Schema>();

        type QueryDataInput = {
          modelName: 'auction_listings';
          operation: 'findMany';
          query: string;
        };

        const query: FindManyArgs<'auction_listings'> = {
          select: {
            title: true,
            category: true,
            description: true,
            subcategory: true,
            lot_condition: true,
            addresses: {
              select: {
                address1: true,
                address2: true,
                address3: true,
                city: true,
                province: true,
                country: true,
              },
            },
            auction_listing_images: {
              select: {
                images: {
                  select: {
                    image_url: true,
                  },
                },
              },
            },
            auction_listing_product_manifests: {
              select: {
                title: true,
                description: true,
                retail_price: true,
                sku: true,
              },
            },
          },
          take: 10,
        };

        const input: QueryDataInput = {
          modelName: 'auction_listings',
          operation: 'findMany',
          query: JSON.stringify(query),
        };

        const { data: result, errors } = await client.queries.queryData(input);

        // eslint-disable-next-line no-console
        console.log(
          'Auction API Result (JSON):',
          JSON.stringify(result, null, 2)
        );
        // eslint-disable-next-line no-console
        console.log(
          'Auction API Errors (JSON):',
          JSON.stringify(errors, null, 2)
        );
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching auction listings:', error);
      } finally {
        setLoading(false);
      }
    };

    apiRes();
  }, []);

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
        {new Array(4).fill(0).map((_, index) => (
          <Skeleton
            className="aspect-square w-full rounded-lg"
            key={`auction-skeleton-${index}`}
          />
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
   * Main render - displays auction cards in carousel layout
   */
  return (
    <ProductSection
      layout="carousel"
      title="Live Auctions"
      viewAllLink="/collections/auctions"
    >
      {auctions.map((auction: Auction) => (
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
