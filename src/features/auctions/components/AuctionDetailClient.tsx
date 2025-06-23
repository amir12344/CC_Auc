'use client';

import React, { useState } from 'react';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import {
  ArrowLeft,
  Tag,
  CheckCircle,
  Package,
  FileText,
  MapPin,
  Truck
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Auction } from '../types';
import { AuctionGallery } from './AuctionGallery';
import { AuctionBiddingArea } from './AuctionBiddingArea';
import { ManifestTable } from './AuctionManifest';
import { AuctionDetailsAccordion } from './AuctionDetailsAccordion';
import { formatAuctionCurrency } from '../utils/auction-utils';
import { AuthenticatedOnly } from '@/src/components/auth';
import { RestrictedContentPlaceholder } from '@/src/components/auth/RestrictedContentPlaceholder';
import { LoginPromptModal } from '@/src/components/auth/LoginPromptModal';

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
  auction
}) => {
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);

  /**
   * Handle go back navigation
   */
  const handleGoBack = () => {
    router.back();
  };

  /**
   * Handle manifest CTA click for guests
   */
  const handleManifestCTA = () => {
    setShowLoginModal(true);
  };

  return (
    <div className="space-y-8">
      {/* Go Back Button */}
      <Button
        variant="outline"
        onClick={handleGoBack}
        className="flex items-center gap-2 mb-4"
        aria-label="Go back to previous page"
      >
        <ArrowLeft className="w-4 h-4" />
        Go Back
      </Button>

      {/* Main Content: Two-column layout with smaller images */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
        {/* Left Column: Image Gallery - smaller proportion */}
        <div className="lg:col-span-2">
          <AuctionGallery
            images={auction.images}
            alt={auction.title}
            className="w-full"
          />
        </div>

        {/* Right Column: Bidding Area - larger proportion */}
        <div className="lg:col-span-3">
          <AuctionBiddingArea
            auction={auction}
            className="w-full"
          />
        </div>
      </div>

      {/* Professional Auction Information */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Auction Details</h2>

        <div className="space-y-6">
          {/* First Row */}
          <div className="flex flex-wrap items-center gap-x-12 gap-y-4">
            <div className="flex items-center gap-3 group">
              <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                <Tag className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <span className="text-sm text-gray-500 block">Category</span>
                <span className="font-semibold text-gray-900">{auction.category}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 group">
              <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                <CheckCircle className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <span className="text-sm text-gray-500 block">Condition</span>
                <span className="font-semibold text-gray-900">{auction.condition}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 group">
              <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                <Package className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <span className="text-sm text-gray-500 block">Type</span>
                <span className="font-semibold text-gray-900">{auction.productType}</span>
              </div>
            </div>
          </div>

          {/* Elegant Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <div className="bg-white px-4">
                <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Second Row */}
          <div className="flex flex-wrap items-center gap-x-12 gap-y-4">
            <div className="flex items-center gap-3 group">
              <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                <FileText className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <span className="text-sm text-gray-500 block">Manifest</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{auction.quantity} Units</span>
                  <span className="text-sm text-gray-500">• {formatAuctionCurrency(auction.extRetail || 0)} MSRP</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 group">
              <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                <MapPin className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <span className="text-sm text-gray-500 block">Location</span>
                <span className="font-semibold text-gray-900">{auction.location}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 group">
              <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
                <Truck className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <span className="text-sm text-gray-500 block">Shipping</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{auction.shippingInfo['FREIGHT TYPE'] || 'LTL'}</span>
                  <span className="text-sm text-gray-500">• {auction.shippingInfo['PACKAGING'] || 'Palletized'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-width Manifest Section */}
      <div className="w-full">
        <AuthenticatedOnly
          fallback={
            <RestrictedContentPlaceholder
              contentType="custom"
              title="Product Manifest"
              showBenefits={false}
              showSocialProof={false}
              ctaText="Log In to View Manifest"
              onCTAClick={handleManifestCTA}
            />
          }
        >
          <ManifestTable />
        </AuthenticatedOnly>
      </div>

      {/* Full-width Details & Shipping Accordion */}
      <div className="w-full">
        <AuthenticatedOnly
          fallback={
            <RestrictedContentPlaceholder
              contentType="custom"
              title="Additional Auction Details"
              description="Log In to see full details"
              showBenefits={false}
              showSocialProof={false}
              ctaText="Log In to View Details"
              onCTAClick={handleManifestCTA}
            />
          }
        >
          <AuctionDetailsAccordion
            auction={auction}
            defaultOpenSections={['details']}
            className="w-full"
          />
        </AuthenticatedOnly>
      </div>

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        triggerAction="view_manifest"
        itemName={auction.title}
        returnUrl={typeof window !== 'undefined' ? window.location.href : undefined}
      />
    </div>
  );
};

AuctionDetailClient.displayName = 'AuctionDetailClient'; 