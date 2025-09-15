"use client";

import React, { useState } from "react";

import { Download, Eye, MapPin, Tag } from "lucide-react";

import {
  textToLoadTypeBiMap,
  textToLotListingTypeBiMap,
} from "@/amplify/functions/commons/converters/ListingTypeConverter";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { ConditionalActionButton } from "@/src/components/ui/ConditionalActionButton";
import { useToast } from "@/src/hooks/use-toast";

import type { DetailedLotListingWithManifest } from "../../services/lotListingQueryService";
import { formatCategoryDisplayName } from "../../utils/catalogUtils";
import { ImageGallery } from "./ImageGallery";

interface LotListingHeroSectionProps {
  lotListing: DetailedLotListingWithManifest;
  onDownloadSnapshot: () => Promise<void>;
}

/**
 * Format currency for lot listing displays
 */
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// For per-unit values we keep cents
const formatCurrencyCents = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * LotListingHeroSection Component
 *
 * Main hero section with image gallery and listing information
 * Following the auction detail client layout pattern
 */
export const LotListingHeroSection: React.FC<LotListingHeroSectionProps> = ({
  lotListing,
  onDownloadSnapshot,
}) => {
  const { toast } = useToast();
  const [downloading, setDownloading] = useState(false);
  // Smooth scroll helper with sticky header offset
  const scrollToIdWithOffset = (id: string, fallbackOffset = 80) => {
    if (typeof window === "undefined") return;
    const el = document.getElementById(id);
    if (!el) return;
    const header = document.querySelector(
      "[data-sticky-header]"
    ) as HTMLElement | null;
    const offset = header?.offsetHeight ?? fallbackOffset;
    const y = el.getBoundingClientRect().top + window.pageYOffset - offset - 8;
    window.scrollTo({ top: y, behavior: "smooth" });
  };
  // Prepare display data
  const displayPrice = lotListing.asking_price
    ? formatCurrency(lotListing.asking_price)
    : "Contact for pricing";

  const avgCostPerUnit =
    lotListing.asking_price && lotListing.total_units
      ? formatCurrencyCents(lotListing.asking_price / lotListing.total_units)
      : "N/A";

  const shippingCost = lotListing.shipping_cost
    ? formatCurrency(lotListing.shipping_cost)
    : "Contact for quote";

  const avgLandingCost =
    lotListing.asking_price &&
    lotListing.shipping_cost &&
    lotListing.total_units
      ? formatCurrencyCents(
          (lotListing.asking_price + lotListing.shipping_cost) /
            lotListing.total_units
        )
      : "N/A";

  // MSRP off percentage (clean display like: $30.00 / 95.63% off)
  const msrpOffPercent =
    lotListing.estimated_retail_value &&
    lotListing.asking_price &&
    lotListing.estimated_retail_value > 0
      ? ((lotListing.estimated_retail_value - lotListing.asking_price) /
          lotListing.estimated_retail_value) *
        100
      : null;

  // Friendly labels for enums in header row
  const loadTypeLabel = lotListing.load_type
    ? textToLoadTypeBiMap.getKey(lotListing.load_type as any) ||
      formatCategoryDisplayName(lotListing.load_type)
    : "Mixed Load";
  const listingTypeLabel = lotListing.listing_type
    ? textToLotListingTypeBiMap.getKey(lotListing.listing_type as any) ||
      formatCategoryDisplayName(lotListing.listing_type)
    : undefined;

  // Simple row presenter for clean, aligned rows with separators
  const DetailRow = ({
    label,
    value,
    secondary,
  }: {
    label: string;
    value: React.ReactNode;
    secondary?: React.ReactNode;
  }) => (
    <div className="flex items-start justify-between border-b border-gray-100 py-3 last:border-0">
      <div className="text-sm font-medium text-gray-600 md:text-[15px]">
        {label}
      </div>
      <div className="text-right">
        <div className="text-sm font-semibold text-gray-900 md:text-base">
          {value}
        </div>
        {secondary ? (
          <div className="text-[11px] text-gray-500">{secondary}</div>
        ) : null}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5 lg:gap-6">
      {/* Left Column: Image Gallery - smaller proportion */}
      <div className="lg:col-span-2">
        <ImageGallery
          images={lotListing.image_urls || []}
          productName={lotListing.title}
          className="w-full"
        />
      </div>

      {/* Right Column: Listing Information - wider */}
      <div className="lg:col-span-3">
        <Card className="border-none bg-transparent py-0 shadow-none">
          <CardHeader className="px-0 lg:px-0 lg:pb-3">
            <CardTitle className="mb-2 text-2xl leading-tight font-bold text-gray-900 md:text-3xl">
              {lotListing.title}
            </CardTitle>

            {/* Load Type | Listing Type | Location (inline, tidy spacing) */}
            <div className="mb-1 flex flex-wrap items-center text-sm text-gray-500 gap-x-2">
              <Tag className="h-4 w-4" />
              <span className="inline-flex items-center gap-1">{loadTypeLabel}</span>
              {listingTypeLabel ? (
                <>
                  <span className="text-gray-300">|</span>
                  <span className="inline-flex items-center gap-1">{listingTypeLabel}</span>
                </>
              ) : null}
              <span className="text-gray-300">|</span>
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {lotListing.location || "Location not specified"}
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 px-0">
            {/* Asking Price */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium tracking-wide text-gray-500 uppercase">
                  Asking Price
                </div>
                <div className="mb-1 text-3xl font-bold text-gray-900 md:text-4xl">
                  {displayPrice}
                </div>
              </div>
            </div>

            {/* Actions row (right side) */}
            <div className="flex items-center justify-end gap-3">
              <ConditionalActionButton
                className="h-10 rounded-full bg-black px-6 text-white hover:bg-gray-800 hover:opacity-90"
                guestText="Sign In to Buy Now"
                itemName={lotListing.title}
                onAuthenticatedClick={() => {
                  // console.log("Buy now clicked");
                }}
                requiredUserType="buyer"
                triggerAction="buy_now"
              >
                Buy Now
              </ConditionalActionButton>
              <Button className="h-10 rounded-full border border-gray-200 bg-white px-6 whitespace-nowrap text-gray-700 hover:bg-gray-50">
                Make an Offer
              </Button>
            </div>

            {/* Detail rows (simple, airy, non-table look) */}
            <div className="space-y-0.5">
              <DetailRow
                label="MSRP"
                value={
                  lotListing.estimated_retail_value ? (
                    <span>
                      {formatCurrency(lotListing.estimated_retail_value)}
                      {typeof msrpOffPercent === "number" &&
                      !Number.isNaN(msrpOffPercent) ? (
                        <span className="text-gray-500">
                          {" "}
                          {" / "}
                          {msrpOffPercent.toFixed(2)}% off
                        </span>
                      ) : null}
                    </span>
                  ) : (
                    "N/A"
                  )
                }
              />
              <DetailRow label="Avg. Cost Per Unit" value={avgCostPerUnit} />
              <DetailRow
                label="Shipping Cost"
                value={shippingCost}
                secondary={
                  lotListing.location ? (
                    <span>
                      to:{" "}
                      <span className="font-medium text-gray-600">
                        {lotListing.location}
                      </span>
                    </span>
                  ) : undefined
                }
              />
              <DetailRow
                label="Avg Landing Cost Per Unit"
                value={avgLandingCost}
              />
            </div>

            {/* Secondary Actions - bottom placement */}
            <div className="pt-2">
              {lotListing.manifest_items &&
              lotListing.manifest_items.length > 0 ? (
                <ConditionalActionButton
                  className="h-10 rounded-full border border-gray-200 bg-white px-6 text-gray-700 hover:bg-gray-50"
                  guestText="Sign In to View Manifest"
                  itemName={lotListing.title}
                  onAuthenticatedClick={() =>
                    scrollToIdWithOffset("lot-manifest-table")
                  }
                  requiredUserType="buyer"
                  triggerAction="view_manifest"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Product Manifest
                </ConditionalActionButton>
              ) : null}

              {(!lotListing.manifest_items ||
                lotListing.manifest_items.length === 0) &&
              lotListing.manifest_snapshot_file_s3_key ? (
                <Button
                  onClick={async () => {
                    try {
                      setDownloading(true);
                      toast({
                        title: "Preparing download",
                        description: "Fetching manifest snapshot…",
                      });
                      await onDownloadSnapshot();
                      toast({
                        title: "Download started",
                        description: "Your manifest file is downloading.",
                      });
                    } catch (err) {
                      toast({
                        title: "Download failed",
                        description:
                          "Could not download the manifest. Please try again.",
                        variant: "destructive",
                      });
                    } finally {
                      setDownloading(false);
                    }
                  }}
                  disabled={downloading}
                  className="mt-2 h-10 rounded-full border border-gray-200 bg-white px-6 text-gray-700 hover:bg-gray-50"
                >
                  {downloading ? (
                    <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  {downloading ? "Downloading…" : "Download Manifest Snapshot"}
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
