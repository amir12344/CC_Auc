"use client";

import { memo, useEffect, useState } from "react";

import { ErrorBoundary } from "@/src/components/ErrorBoundary";
import { Skeleton } from "@/src/components/ui/skeleton";
import AuctionCard from "@/src/features/auctions/components/AuctionCard";
import type { AuctionListingItem } from "@/src/features/auctions/types";
import { calculateTimeLeft } from "@/src/features/auctions/utils/transforms";
import { getImageUrl } from "@/src/features/marketplace-catalog/services/imageService";

import { transformCombinedListingToCatalogListing } from "../../services/catalogPreferenceQueryService";
import type { CatalogListing } from "../../types/catalog";
import type { CombinedListing } from "../../types/combined-listing";
import CatalogCard from "../CatalogCard";
import ProductSection from "../ProductSection";

interface PreferenceSectionProps {
  title: string;
  listings: CombinedListing[];
  type:
    | "buyerSegment"
    | "auction"
    | "catalog"
    | "category"
    | "subcategory"
    | "nearYou";
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
  onLoadMore?: () => void;
  viewAllLink?: string;
}

/**
 * A reusable section component for displaying filtered listings based on buyer preferences.
 * Supports different section types with consistent UI/UX.
 */
export const PreferenceSection = memo(
  ({ title, listings, type, viewAllLink }: PreferenceSectionProps) => {
    // Mixed transformed items so we can render the correct card per type
    const [transformedItems, setTransformedItems] = useState<
      Array<
        | { kind: "catalog"; listing: CatalogListing }
        | { kind: "auction"; auction: AuctionListingItem }
      >
    >([]);
    const [isTransforming, setIsTransforming] = useState(false);
    const [transformError, setTransformError] = useState<string | null>(null);

    // Transform listings when they change
    useEffect(() => {
      if (!listings || listings.length === 0) {
        setTransformedItems([]);
        return;
      }

      const transformListings = async () => {
        try {
          setIsTransforming(true);
          setTransformError(null);

          const transformed = await Promise.all(
            listings.map(async (listing) => {
              if (listing.listing_source === "auction") {
                // Turn CombinedListing into AuctionListingItem so we can use AuctionCard
                const imageUrls = await Promise.all(
                  (listing.images || []).map((img) => getImageUrl(img.s3_key))
                );
                const images: string[] = imageUrls.filter(Boolean) as string[];
                const timeLeftText = listing.auction_end_time
                  ? calculateTimeLeft(listing.auction_end_time)
                  : "TBD";
                const auction: AuctionListingItem = {
                  id: listing.public_id,
                  title: listing.title,
                  image: images[0] || "/images/placeholder-auction.jpg",
                  images,
                  category: listing.category,
                  subcategory: listing.subcategory ?? undefined,
                  timeLeft: timeLeftText,
                  totalBids:
                    typeof listing.total_bids === "number"
                      ? listing.total_bids
                      : 0,
                  isActive: timeLeftText !== "Ended",
                  auction_end_time: listing.auction_end_time || undefined,
                  lot_condition: listing.listing_condition ?? null,
                  addresses: listing.addresses ?? null,
                };
                return { kind: "auction", auction } as const;
              }
              const catalogListing =
                await transformCombinedListingToCatalogListing(listing);
              return { kind: "catalog", listing: catalogListing } as const;
            })
          );

          setTransformedItems(transformed);
        } catch {
          setTransformError("Failed to process listing images");
          setTransformedItems([]);
        } finally {
          setIsTransforming(false);
        }
      };

      transformListings();
    }, [listings]);

    /**
     * Loading state: Shows skeleton while data is being fetched or transformed.
     */
    if (isTransforming) {
      return (
        <ProductSection
          layout="carousel"
          title={title}
          viewAllLink={viewAllLink}
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`skeleton-wrapper-${type}-${title}-${index.toString()}`}>
              <Skeleton
                className="aspect-square w-full rounded-lg"
                key={`skeleton-${type}-${title}-${index.toString()}`}
              />
            </div>
          ))}
        </ProductSection>
      );
    }

    /**
     * Error state: Shows error message with retry instructions.
     */
    if (transformError) {
      return (
        <ProductSection
          layout="carousel"
          title={title}
          viewAllLink={viewAllLink}
        >
          <div className="col-span-full mt-4 text-center text-gray-500">
            <p>
              Failed to load {type} listings: {transformError}
            </p>
            <p className="mt-1 text-sm">
              Please refresh the page to try again.
            </p>
          </div>
        </ProductSection>
      );
    }

    /**
     * Empty state: Don't render anything if no listings available.
     * This allows sections to collapse automatically when data is empty.
     */
    if (!transformedItems || transformedItems.length === 0) {
      return null;
    }

    /**
     * Main render: Displays the preference-filtered listing cards.
     */
    return (
      <ProductSection layout="carousel" title={title} viewAllLink={viewAllLink}>
        {transformedItems.map((item) => {
          if (item.kind === "auction") {
            return (
              <div key={`auction-wrapper-${type}-${item.auction.id}`}>
                <ErrorBoundary
                  fallback={
                    <Skeleton className="aspect-square w-full rounded-lg" />
                  }
                  key={`error-boundary-${type}-${item.auction.id}`}
                >
                  <AuctionCard auction={item.auction} />
                </ErrorBoundary>
              </div>
            );
          }
          const listing = item.listing;
          return (
            <div key={`catalog-wrapper-${type}-${title}-${listing.id}`}>
              <ErrorBoundary
                fallback={
                  <Skeleton className="aspect-square w-full rounded-lg" />
                }
                key={`error-boundary-${type}-${title}-${listing.id}`}
              >
                <CatalogCard listing={listing} />
              </ErrorBoundary>
            </div>
          );
        })}
      </ProductSection>
    );
  }
);

PreferenceSection.displayName = "PreferenceSection";

export default PreferenceSection;
