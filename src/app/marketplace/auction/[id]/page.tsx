'use client';

import { notFound } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import MainLayout from '@/src/components/layout/MainLayout';
import { DynamicBreadcrumb } from '@/src/components/ui/DynamicBreadcrumb';
import { AuctionDetailClient } from '@/src/features/auctions/components/AuctionDetailClient';
import { fetchAuctionById } from '@/src/features/auctions/services/auctionQueryService';
import type { Auction } from '@/src/features/auctions/types';

/**
 * Auction Detail Page - Client Component
 * Displays individual auction information using real-time database queries
 *
 * Features:
 * - Dynamic routing with real auction_listing_id parameter
 * - Real-time data fetching from centralized service
 * - 404 handling for non-existent auctions
 *
 * URL Structure: /marketplace/auction/[id]
 * Example: /marketplace/auction/12345 (real auction_listing_id)
 *
 * Data Flow:
 * - Extracts auction_listing_id from URL parameters
 * - Uses fetchAuctionById service for real-time query
 * - Service returns already transformed Auction objects
 */
export default function AuctionPage({ params }: { params: Promise<{ id: string }> }) {
  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Unwrap params Promise using React.use()
  const { id } = React.use(params);

  useEffect(() => {
    const loadAuction = async () => {
      try {
        setLoading(true);
        setError(null);

        // Service now returns already transformed Auction objects
        const auctionData = await fetchAuctionById(id);

        if (auctionData) {
          setAuction(auctionData);
        } else {
          setError('Auction not found');
        }
      } catch (apiError) {
        setError(
          `Failed to load auction: ${apiError instanceof Error ? apiError.message : 'Unknown error'}`
        );
      } finally {
        setLoading(false);
      }
    };

    loadAuction();
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-white">
          <div className="mx-auto max-w-8xl px-6 py-6">
            <div className="animate-pulse">
              <div className="mb-4 h-8 w-1/3 rounded bg-gray-200" />
              <div className="mb-4 h-64 rounded bg-gray-200" />
              <div className="h-32 rounded bg-gray-200" />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !auction) {
    notFound();
    return null;
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
        {/* Breadcrumb Navigation */}
        <div className='border-gray-100 border-b'>
          <div className="mx-auto max-w-8xl px-6 py-4">
            <DynamicBreadcrumb
              items={[
                { label: 'Marketplace', href: '/marketplace' },
                { label: 'Auctions', href: '/collections/auctions' },
                {
                  label: auction.title,
                  href: `/marketplace/auction/${id}`,
                  current: true,
                },
              ]}
            />
          </div>
        </div>

        {/* Auction Details Content */}
        <div className="mx-auto max-w-8xl px-6 py-6">
          <AuctionDetailClient auction={auction} />
        </div>
      </div>
    </MainLayout>
  );
}
