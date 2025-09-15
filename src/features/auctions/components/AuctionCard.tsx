"use client";

import Image from "next/image";
import Link from "next/link";
import { memo, useMemo } from "react";

import { Clock, Gavel, ImageIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { cn } from "@/src/lib/utils";

import {
  formatBidCount,
  formatTimeLeft,
  getAuctionImagePlaceholder,
  getAuctionImageSizes,
} from "../services/auctionQueryService";
import type { AuctionListingItem } from "../types";

interface AuctionCardProps {
  auction: AuctionListingItem;
  className?: string;
  darkMode?: boolean;
}

/**
 * AuctionCard - Optimized Client Component for displaying auction listings
 */
const AuctionCard = memo(
  ({ auction, className, darkMode = false }: AuctionCardProps) => {
    /**
     * Check if auction has a valid image URL (excluding placeholder images)
     */
    const hasValidImage = useMemo(
      () =>
        Boolean(
          auction.image?.trim() &&
            !auction.image.includes("placeholder-auction.jpg") &&
            !auction.image.includes("placeholder")
        ),
      [auction.image]
    );

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

    return (
      <Link
        aria-label={`View auction details for ${auction.title}`}
        className="block"
        href={`/marketplace/auction/${auction.id}`}
        prefetch={false}
      >
        <Card
          className={cn(
            "aspect-auto w-full min-w-0 gap-0 border-none bg-transparent p-0 shadow-none",
            className
          )}
        >
          <CardContent className="p-0">
            {/* Auction Image Container with optimized hover effects */}
            <div className="group relative mb-3 aspect-square w-full overflow-hidden rounded-2xl">
              {hasValidImage ? (
                <Image
                  alt={`Auction image for ${auction.title}`}
                  blurDataURL={getAuctionImagePlaceholder()}
                  className="rounded-2xl object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                  fill
                  loading="lazy"
                  placeholder="blur"
                  quality={85}
                  sizes={getAuctionImageSizes()}
                  src={auction.image || ""}
                />
              ) : (
                <div
                  className={cn(
                    "flex h-full w-full items-center justify-center rounded-2xl border-2 border-dashed transition-colors duration-300 ease-in-out group-hover:border-gray-400",
                    darkMode
                      ? "border-gray-700 bg-gray-800"
                      : "border-gray-300 bg-gray-50"
                  )}
                >
                  <ImageIcon
                    className={cn(
                      "h-12 w-12",
                      darkMode ? "text-gray-600" : "text-gray-400"
                    )}
                  />
                </div>
              )}
            </div>
          </CardContent>

          <CardHeader className="space-y-0 p-0 pt-0">
            {/* Auction Title */}
            <CardTitle className={cn("line-clamp-2 font-medium text-gray-900")}>
              {auction.title}
            </CardTitle>

            {/* Enhanced Bid and Time Information */}
            <div className="space-y-1">
              {/* Bid Count with Icon */}
              <div className="flex items-center gap-1.5">
                <Gavel
                  className={cn(
                    "h-3 w-3",
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )}
                />
                <span className={cn("text-sm font-medium text-gray-700")}>
                  {bidText}
                </span>
              </div>

              {/* Time Left with Icon */}
              {timeLeftText && (
                <div className="flex items-center gap-1.5">
                  <Clock
                    className={cn(
                      "h-3 w-3",
                      darkMode ? "text-gray-400" : "text-gray-500"
                    )}
                  />
                  <span className={cn("text-sm text-gray-500")}>
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

AuctionCard.displayName = "AuctionCard";

export default AuctionCard;
