'use client';

import { Clock, Gavel } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { memo, useCallback, useMemo } from 'react';
import {
 Card,
 CardContent,
 CardHeader,
 CardTitle,
} from '@/src/components/ui/card';
import { cn } from '@/src/lib/utils';
import {
 formatBidCount,
 formatTimeLeft,
 getAuctionImagePlaceholder,
 getAuctionImageSizes,
} from '../services/auctionQueryService';
import type { Auction } from '../types';

// Regex for Google Drive URL matching - defined at top level for performance
const GOOGLE_DRIVE_REGEX = /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/view/;

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
const AuctionCard = memo(
 ({ auction, className, darkMode = false }: AuctionCardProps) => {
  /**
 * Convert Google Drive sharing URL to direct image URL
 */
  const processImageUrl = useCallback((url: string): string => {
   if (!url) {
    return '/images/placeholder-auction.jpg';
   }

   // Check if it's a Google Drive sharing URL
   const googleDriveMatch = url.match(GOOGLE_DRIVE_REGEX);

   if (googleDriveMatch) {
    const fileId = googleDriveMatch[1];
    // Convert to direct download URL
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
   }

   return url;
  }, []);

  /**
   * Memoized bid text formatting for performance
   * Uses shared utility function for consistency
   */
  const bidText = useMemo(
   () => formatBidCount(auction.totalBids),
   [auction.totalBids]
  );

  /**
   * Memoized time left formatting
   * Uses shared utility function for consistent formatting
   */
  const timeLeftText = useMemo(
   () => formatTimeLeft(auction.timeLeft),
   [auction.timeLeft]
  );

  /**
   * Memoized processed image URL for performance
   */
  const processedImageUrl = useMemo(
   () => processImageUrl(auction.image),
   [auction.image, processImageUrl]
  );

  return (
   <Link
    aria-label={`View auction details for ${auction.title}`}
    className="block"
    href={`/marketplace/auction/${auction.id}`}
    prefetch={false}
   >
    <Card
     className={cn(
      'aspect-auto w-full min-w-0 gap-0 border-none bg-transparent p-0 shadow-none',
      className
     )}
    >
     <CardContent className="p-0">
      {/* Auction Image Container with optimized hover effects */}
      <div className="group relative mb-3 aspect-square w-full overflow-hidden rounded-lg">
       <Image
        alt={`Auction image for ${auction.title}`}
        blurDataURL={getAuctionImagePlaceholder()}
        className="rounded-lg object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
        fill
        loading="lazy"
        placeholder="blur"
        quality={55}
        sizes={getAuctionImageSizes()}
        src={processedImageUrl}
       />
      </div>
     </CardContent>

     <CardHeader className="space-y-0 p-0 pt-0">
      {/* Auction Title */}
      <CardTitle
       className={cn(
        'line-clamp-2 font-medium text-sm leading-tight tracking-tight',
        darkMode ? 'text-white' : 'text-gray-900'
       )}
      >
       {auction.title}
      </CardTitle>

      {/* Enhanced Bid and Time Information */}
      <div className="space-y-1">
       {/* Bid Count with Icon */}
       <div className="flex items-center gap-1.5">
        <Gavel
         className={cn(
          'h-3 w-3',
          darkMode ? 'text-gray-400' : 'text-gray-500'
         )}
        />
        <span
         className={cn(
          'font-medium text-xs',
          darkMode ? 'text-gray-300' : 'text-gray-700'
         )}
        >
         {bidText}
        </span>
       </div>

       {/* Time Left with Icon */}
       {timeLeftText && (
        <div className="flex items-center gap-1.5">
         <Clock
          className={cn(
           'h-3 w-3',
           darkMode ? 'text-gray-400' : 'text-gray-500'
          )}
         />
         <span
          className={cn(
           'text-xs',
           darkMode ? 'text-gray-400' : 'text-gray-500'
          )}
         >
          {timeLeftText}
         </span>
        </div>
       )}
      </div>
     </CardHeader>
    </Card>
   </Link>
  );
 }
);

AuctionCard.displayName = 'AuctionCard';

export default AuctionCard;
