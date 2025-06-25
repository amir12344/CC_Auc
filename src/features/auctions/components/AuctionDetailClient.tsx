'use client';

import {
  ArrowLeft,
  CheckCircle,
  FileText,
  MapPin,
  Package,
  Tag,
  Truck,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useState } from 'react';
import { AuthenticatedOnly } from '@/src/components/auth';
import { LoginPromptModal } from '@/src/components/auth/LoginPromptModal';
import { RestrictedContentPlaceholder } from '@/src/components/auth/RestrictedContentPlaceholder';
import { Button } from '@/src/components/ui/button';
import type { Auction } from '../types';
import { AuctionBiddingArea } from './AuctionBiddingArea';
import { AuctionDetailsAccordion } from './AuctionDetailsAccordion';
import { AuctionGallery } from './AuctionGallery';
import { ManifestTable } from './AuctionManifest';

/**
 * Format currency for auction displays
 */
const formatAuctionCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
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

  // Add hardcoded details and shipping info to the auction data
  const auctionWithDetails = {
    ...auction,
    details: {
      DESCRIPTION: 'Mixed lot of consumer products from major retailers',
      CONDITION: 'Customer Returns - Uninspected',
      'COSMETIC CONDITION': 'Varies - may have cosmetic damage',
      FUNCTIONALITY: 'Untested - functionality not guaranteed',
      ACCESSORIES: 'May be incomplete',
      QUANTITY: '100+ Units',
      'EXT. RETAIL': '$5,000+',
      'PRODUCT TYPE': 'Customer Returns',
    },
    shippingInfo: {
      'SHIPPING TYPE': 'Standard Freight',
      'SHIP FROM': 'Multiple Locations',
      'FREIGHT TYPE': 'LTL',
      'PIECE COUNT': '1-3 Pallets',
      'ESTIMATED WEIGHT': '500-1500 lbs',
      PACKAGING: 'Palletized',
      'PALLET SPACES': '1-3',
      DIMENSIONS: 'Standard Pallet Size',
      'SHIPPING NOTES': 'Delivery appointments required. Loading dock access preferred. Liftgate service available for additional fee.',
    },
  };

  /**
   * Handle go back navigation - always go to marketplace
   */
  const handleGoBack = () => {
    router.push('/marketplace');
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
        aria-label="Go back to previous page"
        className='mb-4 flex items-center gap-2'
        onClick={handleGoBack}
        variant="outline"
      >
        <ArrowLeft className='h-4 w-4' />
        Go Back
      </Button>

      {/* Main Content: Two-column layout with smaller images */}
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-5 lg:gap-6'>
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
      <div className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm'>
        <h2 className='mb-6 font-bold text-2xl text-gray-900'>
          Auction Details
        </h2>

        <div className="space-y-6">
          {/* First Row */}
          <div className="flex flex-wrap items-center gap-x-12 gap-y-4">
            <div className='group flex items-center gap-3'>
              <div className='rounded-lg bg-gray-50 p-2 transition-colors group-hover:bg-gray-100'>
                <Tag className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <span className='block text-gray-500 text-sm'>Category</span>
                <span className="font-semibold text-gray-900">
                  {auction.category}
                </span>
              </div>
            </div>

            <div className='group flex items-center gap-3'>
              <div className='rounded-lg bg-gray-50 p-2 transition-colors group-hover:bg-gray-100'>
                <CheckCircle className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <span className='block text-gray-500 text-sm'>Lot Condition</span>
                <span className="font-semibold text-gray-900">
                  {auction.lot_condition}
                </span>
              </div>
            </div>

            <div className='group flex items-center gap-3'>
              <div className='rounded-lg bg-gray-50 p-2 transition-colors group-hover:bg-gray-100'>
                <Package className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <span className='block text-gray-500 text-sm'>Type</span>
                <span className="font-semibold text-gray-900">
                  {auction.productType}
                </span>
              </div>
            </div>
          </div>

          {/* Elegant Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className='w-full border-gray-200 border-t' />
            </div>
            <div className="relative flex justify-center">
              <div className="bg-white px-4">
                <div className='h-2 w-2 rounded-full bg-gray-300' />
              </div>
            </div>
          </div>

          {/* Second Row */}
          <div className="flex flex-wrap items-center gap-x-12 gap-y-4">
            <div className='group flex items-center gap-3'>
              <div className='rounded-lg bg-gray-50 p-2 transition-colors group-hover:bg-gray-100'>
                <FileText className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <span className='block text-gray-500 text-sm'>Manifest</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">
                    {auction.quantity} Units
                  </span>
                  <span className='text-gray-500 text-sm'>
                    • {formatAuctionCurrency(auction.extRetail || 0)} MSRP
                  </span>
                </div>
              </div>
            </div>

            <div className='group flex items-center gap-3'>
              <div className='rounded-lg bg-gray-50 p-2 transition-colors group-hover:bg-gray-100'>
                <MapPin className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <span className='block text-gray-500 text-sm'>Location</span>
                <span className="font-semibold text-gray-900">
                  {auction.location}
                </span>
              </div>
            </div>

            <div className='group flex items-center gap-3'>
              <div className='rounded-lg bg-gray-50 p-2 transition-colors group-hover:bg-gray-100'>
                <Truck className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <span className='block text-gray-500 text-sm'>Shipping</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">
                    LTL
                  </span>
                  <span className='text-gray-500 text-sm'>
                    • Palletized
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-width Manifest Section */}
      <div className="w-full" data-manifest-section>
        <AuthenticatedOnly
          fallback={
            <RestrictedContentPlaceholder
              contentType="custom"
              ctaText="Log In to View Manifest"
              onCTAClick={handleManifestCTA}
              showBenefits={false}
              showSocialProof={false}
              title="Product Manifest"
            />
          }
        >
          <ManifestTable manifestData={auction.manifest || []} />
        </AuthenticatedOnly>
      </div>

      {/* Full-width Details & Shipping Accordion */}
      <div className="w-full">
        <AuthenticatedOnly
          fallback={
            <RestrictedContentPlaceholder
              contentType="custom"
              ctaText="Log In to View Details"
              description="Log In to see full details"
              onCTAClick={handleManifestCTA}
              showBenefits={false}
              showSocialProof={false}
              title="Additional Auction Details"
            />
          }
        >
          <AuctionDetailsAccordion
            auction={auctionWithDetails}
            className="w-full"
            defaultOpenSections={['details']}
          />
        </AuthenticatedOnly>
      </div>

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginModal}
        itemName={auction.title}
        onClose={() => setShowLoginModal(false)}
        returnUrl={
          typeof window !== 'undefined' ? window.location.href : undefined
        }
        triggerAction="view_manifest"
      />
    </div>
  );
};

AuctionDetailClient.displayName = 'AuctionDetailClient';
