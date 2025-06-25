'use client';

import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DynamicBreadcrumb } from '@/src/components/ui/DynamicBreadcrumb';
import type { Auction } from '../types';
import { AuctionDetailClient } from './AuctionDetailClient';

/**
 * Client component for displaying cached auction data
 * Reads auction data from localStorage cache using index-based IDs
 * Note: MainLayout is handled by the server component that calls this
 */
export function AuctionDetailFromCache({ id }: { id: string }) {
 const [auction, setAuction] = useState<Auction | null>(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
  try {
   // Get cached auctions from localStorage
   const cachedData = localStorage.getItem('cachedAuctions');

   if (cachedData) {
    const auctions: Auction[] = JSON.parse(cachedData);

    // Extract index from ID (auction-0, auction-1, etc.)
    const indexStr = id.replace('auction-', '');
    const index = Number.parseInt(indexStr, 10);

    if (!Number.isNaN(index) && auctions[index]) {
     setAuction(auctions[index]);
    } else {
     setAuction(null);
    }
   } else {
    setAuction(null);
   }
  } catch {
   setAuction(null);
  }

  setLoading(false);
 }, [id]);

 if (loading) {
  return (
   <div className='min-h-screen bg-white'>
    <div className='mx-auto max-w-8xl px-6 py-6'>
     <div className="animate-pulse">
      <div className='mb-4 h-8 w-1/3 rounded bg-gray-200' />
      <div className='mb-4 h-64 rounded bg-gray-200' />
      <div className='h-32 rounded bg-gray-200' />
     </div>
    </div>
   </div>
  );
 }

 if (!auction) {
  notFound();
  return null;
 }

 const auctionTitle = auction.title || 'Auction Details';

 return (
  <div className='min-h-screen bg-white'>
   {/* Breadcrumb Navigation */}
   <div className='border-gray-100 border-b'>
    <div className='mx-auto max-w-8xl px-6 py-4'>
     <DynamicBreadcrumb
      items={[
       { label: 'Marketplace', href: '/marketplace' },
       { label: 'Auctions', href: '/collections/auctions' },
       {
        label: auctionTitle,
        href: `/marketplace/auction/${id}`,
        current: true,
       },
      ]}
     />
    </div>
   </div>

   {/* Auction Details Content */}
   <div className='mx-auto max-w-8xl px-6 py-6'>
    <AuctionDetailClient auction={auction} />
   </div>
  </div>
 );
}
