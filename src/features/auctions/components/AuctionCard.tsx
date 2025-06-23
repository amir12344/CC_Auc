'use client';

import { memo, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Auction } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Gavel, Clock } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { formatBidCount, formatTimeLeft, getAuctionImageSizes, getAuctionImagePlaceholder } from '../utils/auction-utils';

interface AuctionCardProps {
 auction: Auction;
 className?: string;
 darkMode?: boolean;
}

/**
 * AuctionCard - Optimized Client Component for displaying auction listings
 * Enhanced with performance optimizations and improved visual design
 * 
 * Features:
 * - Optimized with useCallback and useMemo for performance
 * - Improved visual design for bid and time information
 * - Accessible with proper ARIA labels
 * - Links to auction detail page (/marketplace/auction/[id])
 * - Responsive design with hover effects on image only
 * 
 * Performance Optimizations:
 * - Memoized component with React.memo
 * - Memoized calculations for bid text and time display
 * - Optimized image loading with proper sizes
 * 
 * Props:
 * - auction: Auction data object
 * - className: Optional CSS classes
 * - darkMode: Optional dark theme styling
 */
const AuctionCard = memo(({ auction, className, darkMode = false }: AuctionCardProps) => {
 /**
  * Memoized bid text formatting for performance
  * Uses shared utility function for consistency
  */
 const bidText = useMemo(() => formatBidCount(auction.totalBids), [auction.totalBids]);

 /**
  * Memoized time left formatting
  * Uses shared utility function for consistent formatting
  */
 const timeLeftText = useMemo(() => formatTimeLeft(auction.timeLeft), [auction.timeLeft]);

 /**
  * Optimized image error handler with useCallback
  * Prevents unnecessary re-renders
  */
 const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
  console.warn(`Failed to load auction image: ${auction.id}`);
 }, [auction.id]);

 return (
  <Link
   href={`/marketplace/auction/${auction.id}`}
   prefetch={false}
   className="block"
   aria-label={`View auction details for ${auction.title}`}
  >
   <Card className={cn(
    "w-full p-0 bg-transparent aspect-auto border-none shadow-none gap-0 min-w-0",
    className
   )}>
    <CardContent className="p-0">
     {/* Auction Image Container with optimized hover effects */}
     <div className="relative aspect-square w-full overflow-hidden rounded-lg mb-3 group">
      <Image
       src={auction.image}
       alt={`Auction image for ${auction.title}`}
       fill
       quality={75}
       className="object-cover rounded-lg group-hover:scale-105 transition-transform duration-300 ease-in-out"
       loading="lazy"
       sizes={getAuctionImageSizes()}
       onError={handleImageError}
       placeholder="blur"
       blurDataURL={getAuctionImagePlaceholder()}
      />
     </div>
    </CardContent>

    <CardHeader className="p-0 pt-0 space-y-0">
     {/* Company/Seller Name */}
     {auction.seller?.name && (
      <p className={cn(
       "text-xs font-medium",
       darkMode ? "text-gray-400" : "text-gray-600"
      )}>
       {auction.seller.name}
      </p>
     )}
     {/* Auction Title */}
     <CardTitle className={cn(
      "text-sm tracking-tight font-medium leading-tight line-clamp-2",
      darkMode ? "text-white" : "text-gray-900"
     )}>
      {auction.title}
     </CardTitle>

     {/* Enhanced Bid and Time Information */}
     <div className="space-y-1">
      {/* Bid Count with Icon */}
      <div className="flex items-center gap-1.5">
       <Gavel className={cn(
        "w-3 h-3",
        darkMode ? "text-gray-400" : "text-gray-500"
       )} />
       <span className={cn(
        "text-xs font-medium",
        darkMode ? "text-gray-300" : "text-gray-700"
       )}>
        {bidText}
       </span>
      </div>

      {/* Time Left with Icon */}
      {timeLeftText && (
       <div className="flex items-center gap-1.5">
        <Clock className={cn(
         "w-3 h-3",
         darkMode ? "text-gray-400" : "text-gray-500"
        )} />
        <span className={cn(
         "text-xs",
         darkMode ? "text-gray-400" : "text-gray-500"
        )}>
         {timeLeftText}
        </span>
       </div>
      )}
     </div>
    </CardHeader>
   </Card>
  </Link>
 );
});

AuctionCard.displayName = 'AuctionCard';

export default AuctionCard; 