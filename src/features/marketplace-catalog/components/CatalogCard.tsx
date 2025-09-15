"use client";

import Image from "next/image";
import Link from "next/link";
import { memo, useCallback, useMemo, useState } from "react";

import { ImageIcon, Tag } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { cn } from "@/src/lib/utils";

import type { CatalogListing } from "../types/catalog";
import {
  formatCatalogPrice,
  formatCategoryDisplayName,
  getCatalogImagePlaceholder,
  getCatalogImageSizes,
} from "../utils/catalogUtils";

// Regex for Google Drive URL matching - defined at top level for performance
const GOOGLE_DRIVE_REGEX =
  /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/view/;

interface CatalogCardProps {
  listing: CatalogListing;
  className?: string;
  darkMode?: boolean;
}

/**
 * CatalogCard - Client Component for displaying catalog listings
 * Enhanced with performance optimizations and visual design
 *
 * Features:
 * - Optimized with useMemo for performance
 * - Visual design for price and lead time information
 * - Accessible with proper ARIA labels
 * - Links to catalog detail page (/marketplace/catalog/[id])
 * - Responsive design with hover effects on image only
 *
 * Performance Optimizations:
 * - Memoized component with React.memo
 * - Memoized calculations for price and lead time display
 * - Optimized image loading with proper sizes
 *
 * Props:
 * - catalog: CatalogListing data object
 * - className: Optional CSS classes
 * - darkMode: Optional dark theme styling
 */
const CatalogCard = memo(
  ({ listing, className, darkMode = false }: CatalogCardProps) => {
    /**
     * Convert Google Drive sharing URL to direct image URL
     */
    const processImageUrl = useCallback(
      (url: string | null | undefined): string => {
        if (!url || typeof url !== "string") {
          return "";
        }

        // Check if it's a Google Drive sharing URL
        const googleDriveMatch = url.match(GOOGLE_DRIVE_REGEX);

        if (googleDriveMatch) {
          const fileId = googleDriveMatch[1];
          // Convert to direct download URL
          return `https://drive.google.com/uc?export=view&id=${fileId}`;
        }

        return url;
      },
      []
    );

    /**
     * Memoized minimum order value formatting
     */
    // Keep formatting helper for potential future use; no longer displayed on card
    // Note: Min. Order removed from card per new design requirements

    /**
     * Memoized subcategory formatting
     */
    const subcategoryText = useMemo(
      () =>
        listing.subcategory
          ? formatCategoryDisplayName(listing.subcategory)
          : "No subcategory",
      [listing.subcategory]
    );

    /**
     * Memoized processed image URL for performance
     */
    const processedImageUrl = useMemo(
      () => processImageUrl(listing.image_url),
      [listing.image_url, processImageUrl]
    );

    const [hasImageError, setHasImageError] = useState(false);
    const shouldShowImage = Boolean(processedImageUrl) && !hasImageError;

    return (
      <Link
        aria-label={`View catalog details for ${listing.title}`}
        className="block"
        href={`/marketplace/catalog/${listing.id}`}
        prefetch={false}
      >
        <Card
          className={cn(
            "aspect-auto w-full min-w-0 gap-0 border-none bg-transparent p-0 shadow-none",
            className
          )}
        >
          <CardContent className="p-0">
            {/* Catalog Image Container with optimized hover effects */}
            <div className="group relative mb-2.5 aspect-square w-full overflow-hidden rounded-2xl sm:mb-3">
              {shouldShowImage ? (
                <Image
                  alt={`Catalog image for ${listing.title}`}
                  blurDataURL={getCatalogImagePlaceholder()}
                  className="rounded-2xl object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                  fill
                  loading="lazy"
                  placeholder="blur"
                  quality={55}
                  sizes={getCatalogImageSizes()}
                  src={processedImageUrl}
                  onError={() => setHasImageError(true)}
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
            {/* Catalog Title */}
            <CardTitle
              className={cn(
                "line-clamp-2 text-sm leading-snug font-medium text-gray-900 sm:text-base"
              )}
            >
              {listing.title}
            </CardTitle>

            {/* Subcategory and Metrics Information */}
            <div className="space-y-1">
              {/* Subcategory with Icon */}
              <div className="flex items-center gap-1.5">
                <Tag
                  className={cn(
                    "h-[10px] w-[10px] sm:h-3 sm:w-3",
                    darkMode ? "text-gray-400" : "text-gray-500"
                  )}
                />
                <span className={cn("text-[11px] text-gray-500 sm:text-sm")}>
                  {subcategoryText}
                </span>
              </div>
              {/* Replaced Min. Order with units + % off MSRP computed in services (detail-page formulas) */}
              {listing.listing_source !== "auction" &&
                typeof listing.total_units === "number" &&
                typeof listing.msrp_discount_percent === "number" && (
                  <div className="flex flex-col text-xs sm:flex-row sm:items-center sm:gap-2 sm:text-sm">
                    <span className={cn("font-medium text-gray-700")}>
                      {listing.total_units.toLocaleString()} units
                    </span>
                    <span className={cn("hidden text-gray-400 sm:inline")}>
                      •
                    </span>
                    <span
                      className={cn(
                        "font-medium",
                        listing.msrp_discount_percent > 0
                          ? "text-green-600"
                          : darkMode
                            ? "text-gray-400"
                            : "text-gray-700"
                      )}
                    >
                      {`${listing.msrp_discount_percent.toFixed(1)}% off MSRP`}
                    </span>
                  </div>
                )}
              {/* Small UX improvement: color only the discount when positive */}
            </div>
          </CardHeader>
        </Card>
      </Link>
    );
  }
);

CatalogCard.displayName = "CatalogCard";

export default CatalogCard;
