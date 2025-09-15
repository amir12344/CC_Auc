"use client";

import Image from "next/image";
import Link from "next/link";
import { memo, useMemo, useState } from "react";

import { ImageIcon, Tag } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { cn } from "@/src/lib/utils";

import type { LotListing } from "../../services/lotListingQueryService";
import {
  formatCategoryDisplayName,
  getCatalogImagePlaceholder,
  getCatalogImageSizes,
} from "../../utils/catalogUtils";

interface LotListingCardProps {
  lotListing: LotListing;
  className?: string;
  darkMode?: boolean;
}

// Use the same image placeholder and sizes as CatalogCard
// to ensure identical rendered dimensions and loading behavior

/**
 * LotListingCard - Matching CatalogCard design exactly
 */
const LotListingCard = memo(
  ({ lotListing, className, darkMode = false }: LotListingCardProps) => {
    /**
     * Memoized subcategory formatting (matching catalog card)
     */
    const subcategoryText = useMemo(
      () =>
        lotListing.subcategory
          ? formatCategoryDisplayName(lotListing.subcategory)
          : "No subcategory",
      [lotListing.subcategory]
    );

    const [hasImageError, setHasImageError] = useState(false);
    const shouldShowImage = Boolean(lotListing.image_url) && !hasImageError;

    // Determine visibility for units and discount (use narrowed locals to satisfy TS)
    const hasUnits = typeof lotListing.total_units === "number";
    const hasDiscountNumber = typeof lotListing.discount_percent === "number";
    const units: number | undefined = hasUnits
      ? (lotListing.total_units as number)
      : undefined;
    const discountPercent: number | undefined = hasDiscountNumber
      ? (lotListing.discount_percent as number)
      : undefined;
    // Show discount if it's positive OR if units are present. This hides 0% when units are null.
    const shouldShowDiscount =
      discountPercent !== undefined && (discountPercent > 0 || hasUnits);

    return (
      <Link
        aria-label={`View lot listing details for ${lotListing.title}`}
        className="block"
        href={`/marketplace/lot/${lotListing.id}`}
        prefetch={false}
      >
        <Card
          className={cn(
            "aspect-auto w-full min-w-0 gap-0 border-none bg-transparent p-0 shadow-none",
            className
          )}
        >
          <CardContent className="p-0">
            {/* Lot Listing Image Container with optimized hover effects */}
            <div className="group relative mb-2.5 aspect-square w-full overflow-hidden rounded-2xl sm:mb-3">
              {shouldShowImage ? (
                <Image
                  alt={`Lot listing image for ${lotListing.title}`}
                  blurDataURL={getCatalogImagePlaceholder()}
                  className="rounded-2xl object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                  fill
                  loading="lazy"
                  placeholder="blur"
                  quality={55}
                  sizes={getCatalogImageSizes()}
                  src={lotListing.image_url || ""}
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
            {/* Lot Listing Title */}
            <CardTitle
              className={cn(
                "line-clamp-2 text-sm leading-snug font-medium text-gray-900 sm:text-base"
              )}
            >
              {lotListing.title}
            </CardTitle>

            {/* Category and Metrics Information */}
            <div className="space-y-1">
              {/* Category with Icon */}
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

              {/* Units and % off display */}
              {(hasUnits || shouldShowDiscount) && (
                <div className="flex flex-col text-xs sm:flex-row sm:items-center sm:gap-2 sm:text-sm">
                  {units !== undefined && (
                    <span className={cn("font-medium text-gray-700")}>
                      {units.toLocaleString()} units
                    </span>
                  )}
                  {units !== undefined && shouldShowDiscount && (
                    <span className={cn("hidden text-gray-400 sm:inline")}>
                      •
                    </span>
                  )}
                  {shouldShowDiscount && (
                    <span
                      className={cn(
                        "font-medium",
                        discountPercent! > 0
                          ? "text-green-600"
                          : darkMode
                            ? "text-gray-400"
                            : "text-gray-700"
                      )}
                    >
                      {`${discountPercent!.toFixed(1)}% off`}
                    </span>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
        </Card>
      </Link>
    );
  }
);

LotListingCard.displayName = "LotListingCard";

export default LotListingCard;
