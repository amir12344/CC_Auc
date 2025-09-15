"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";

import {
  ArrowLeft,
  CheckCircle,
  FileText,
  MapPin,
  Tag,
  Truck,
} from "lucide-react";

import { LoginPromptModal } from "@/src/components/auth/LoginPromptModal";
import { RestrictedContentPlaceholder } from "@/src/components/auth/RestrictedContentPlaceholder";
import { Button } from "@/src/components/ui/button";
import { usePublicPageAuth } from "@/src/hooks/useAuthState";

import { fileToDbCategoryBiMap } from "../../../../amplify/functions/commons/converters/ListingTypeConverter";
import type { Auction } from "../types";
import { AuctionBiddingArea } from "./AuctionBiddingArea";
import { AuctionDetailsAccordion } from "./AuctionDetailsAccordion";
import { AuctionGallery } from "./AuctionGallery";
import { ManifestTable } from "./AuctionManifest";

/**
 * Format currency for auction displays
 */
const formatAuctionCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

interface AuctionDetailClientProps {
  /** Auction data object */
  auction: Auction;
}

/**
 * AuctionDetailClient - Enhanced Client Component for auction detail pages
 *
 * Features:
 * - Compact top section matching regular product layout style
 * - Key auction information cards below the main section
 * - Full auction gallery with thumbnails and lightbox
 * - Complete bidding interface with all auction functionality
 * - Manifest table with filtering and search
 * - Collapsible details and shipping sections
 *
 * @param auction - Auction data object
 */
export const AuctionDetailClient: React.FC<AuctionDetailClientProps> = ({
  auction,
}) => {
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { isAuthenticated, userType } = usePublicPageAuth();

  /**
   * Handle go back navigation - always go to marketplace
   */
  const handleGoBack = () => {
    router.push("/marketplace");
  };

  /**
   * Handle manifest CTA click for guests
   */
  const handleManifestCTA = () => {
    setShowLoginModal(true);
  };

  /**
   * Render manifest section with progressive disclosure
   */
  const renderManifestSection = () => {
    // Buyers can see full manifest
    if (isAuthenticated && userType === "buyer") {
      return (
        <ManifestTable
          manifestData={auction.manifest || []}
          retailPrice={auction.total_ex_retail_price}
        />
      );
    }

    // Guests (not authenticated) - show sign in prompt
    if (!isAuthenticated) {
      return (
        <RestrictedContentPlaceholder
          contentType="custom"
          ctaText="Sign In to View Manifest"
          description="Sign in to view detailed product information"
          onCTAClick={handleManifestCTA}
          showBenefits={false}
          showSocialProof={false}
          title="Product Manifest"
        />
      );
    }

    // Sellers (authenticated but wrong role) - show buyer account required
    return (
      <RestrictedContentPlaceholder
        contentType="custom"
        ctaText="Buyer Account Required"
        description="Only registered buyers can view product manifests"
        onCTAClick={handleManifestCTA}
        showBenefits={false}
        showSocialProof={false}
        title="Product Manifest"
      />
    );
  };

  /**
   * Render additional details section with progressive disclosure
   */
  const renderAdditionalDetailsSection = () => {
    // Buyers can see full details
    if (isAuthenticated && userType === "buyer") {
      return (
        <AuctionDetailsAccordion
          auction={auction}
          className="w-full"
          defaultOpenSections={["details"]}
        />
      );
    }

    // Guests (not authenticated) - show sign in prompt
    if (!isAuthenticated) {
      return (
        <RestrictedContentPlaceholder
          contentType="custom"
          ctaText="Sign In to View Details"
          description="Sign in to view additional auction information"
          onCTAClick={handleManifestCTA}
          showBenefits={false}
          showSocialProof={false}
          title="Additional Auction Details"
        />
      );
    }

    // Sellers (authenticated but wrong role) - show buyer account required
    return (
      <RestrictedContentPlaceholder
        contentType="custom"
        ctaText="Buyer Account Required"
        description="Only registered buyers can view additional auction details"
        onCTAClick={handleManifestCTA}
        showBenefits={false}
        showSocialProof={false}
        title="Additional Auction Details"
      />
    );
  };

  return (
    <div className="space-y-8">
      {/* Go Back Button */}
      <Button
        aria-label="Go back to previous page"
        className="mb-4 flex items-center gap-2"
        onClick={handleGoBack}
        variant="outline"
      >
        <ArrowLeft className="h-4 w-4" />
        Go Back
      </Button>

      {/* Main Content: Two-column layout with smaller images */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5 lg:gap-6">
        {/* Left Column: Image Gallery - smaller proportion */}
        <div className="lg:col-span-2">
          <AuctionGallery
            alt={auction.title}
            className="w-full"
            images={auction.images}
          />
        </div>

        {/* Right Column: Bidding Area - larger proportion */}
        <div className="lg:col-span-3">
          <AuctionBiddingArea auction={auction} className="w-full" />
        </div>
      </div>

      {/* Professional Auction Information */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">
          Auction Details
        </h2>

        <div className="space-y-6">
          {/* First Row */}
          <div className="flex flex-wrap items-center gap-x-12 gap-y-4">
            <div className="group flex items-center gap-3">
              <div className="rounded-lg bg-gray-50 p-2 transition-colors group-hover:bg-gray-100">
                <Tag className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <span className="block text-sm text-gray-500">Category</span>
                <span className="font-semibold text-gray-900">
                  {auction.category
                    ? fileToDbCategoryBiMap.getKey(auction.category as never)
                    : "Not specified"}
                </span>
              </div>
            </div>

            <div className="group flex items-center gap-3">
              <div className="rounded-lg bg-gray-50 p-2 transition-colors group-hover:bg-gray-100">
                <CheckCircle className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <span className="block text-sm text-gray-500">Type</span>
                <span className="font-semibold text-gray-900">
                  {auction.lot_condition}
                </span>
              </div>
            </div>
          </div>

          {/* Elegant Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <div className="bg-white px-4">
                <div className="h-2 w-2 rounded-full bg-gray-300" />
              </div>
            </div>
          </div>

          {/* Second Row */}
          <div className="flex flex-wrap items-center gap-x-12 gap-y-4">
            <div className="group flex items-center gap-3">
              <div className="rounded-lg bg-gray-50 p-2 transition-colors group-hover:bg-gray-100">
                <FileText className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <span className="block text-sm text-gray-500">Manifest</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">
                    {auction.total_units} Units
                  </span>
                  <span className="text-sm text-gray-500">
                    •{" "}
                    {formatAuctionCurrency(auction.total_ex_retail_price || 0)}{" "}
                    MSRP
                  </span>
                </div>
              </div>
            </div>

            <div className="group flex items-center gap-3">
              <div className="rounded-lg bg-gray-50 p-2 transition-colors group-hover:bg-gray-100">
                <MapPin className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <span className="block text-sm text-gray-500">Location</span>
                <span className="font-semibold text-gray-900">
                  {auction.location}
                </span>
              </div>
            </div>

            <div className="group flex items-center gap-3">
              <div className="rounded-lg bg-gray-50 p-2 transition-colors group-hover:bg-gray-100">
                <Truck className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <span className="block text-sm text-gray-500">Shipping</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">LTL</span>
                  <span className="text-sm text-gray-500">• Palletized</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-width Manifest Section */}
      <div className="w-full" data-manifest-section>
        {renderManifestSection()}
      </div>

      {/* Full-width Details & Shipping Accordion */}
      <div className="w-full">{renderAdditionalDetailsSection()}</div>

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginModal}
        itemName={auction.title}
        onClose={() => setShowLoginModal(false)}
        returnUrl={
          typeof window !== "undefined" ? window.location.href : undefined
        }
        triggerAction="view_manifest"
      />
    </div>
  );
};

AuctionDetailClient.displayName = "AuctionDetailClient";
