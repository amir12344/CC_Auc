"use client";

import { notFound } from "next/navigation";
import React, { Suspense } from "react";

import { useQuery } from "@tanstack/react-query";

import { AuctionDetailSkeleton } from "@/src/components/skeletons/AuctionDetailSkeleton";
import { DynamicBreadcrumb } from "@/src/components/ui/DynamicBreadcrumb";
import { AuctionDetailClient } from "@/src/features/auctions/components/AuctionDetailClient";
import { fetchAuctionById } from "@/src/features/auctions/services/auctionQueryService";

/**
 * Auction Detail Page - Optimized with TanStack Query
 * URL Structure: /marketplace/auction/[id]
 * Example: /marketplace/auction/12345 (real auction_listing_id)
 */

interface AuctionPageProps {
  params: Promise<{ id: string }>;
}

// Custom hook for auction data with optimized caching
const useAuctionData = (id: string) => {
  return useQuery({
    queryKey: ["auction", id],
    queryFn: () => fetchAuctionById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes - data stays fresh
    gcTime: 30 * 60 * 1000, // 30 minutes - cache retention
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30_000), // Exponential backoff
    throwOnError: false, // Handle errors gracefully
  });
};

// Main auction content component
const AuctionContent = ({ id }: { id: string }) => {
  const { data: auction, isLoading, isError } = useAuctionData(id);

  if (isLoading) {
    return <AuctionDetailSkeleton />;
  }

  if (isError || !auction) {
    notFound();
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-gray-100">
        <div className="max-w-8xl mx-auto px-6 py-4">
          <DynamicBreadcrumb
            items={[
              { label: "Home", href: "/marketplace" },
              { label: "Auctions", href: "/collections/auctions" },
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
      <div className="max-w-8xl mx-auto px-4 py-6 lg:px-6">
        <AuctionDetailClient auction={auction} />
      </div>
    </div>
  );
};

// Main page component with proper parameter handling
export default function AuctionPage({ params }: AuctionPageProps) {
  // Extract id from params promise using React.use() - Next.js 15.3 pattern
  const { id } = React.use(params);

  return (
    <Suspense fallback={<AuctionDetailSkeleton />}>
      <AuctionContent id={id} />
    </Suspense>
  );
}
