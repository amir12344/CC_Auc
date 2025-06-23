'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useLoadCartState } from '@/src/features/offer-management/hooks/useCartPersistence';
import { Product } from '@/src/types';
import { ProductJsonLd } from '@/src/components/seo/ProductJsonLd';

const BuyButton = dynamic(() => import('./interactive/BuyButton').then(mod => ({ default: mod.BuyButton })), {
  loading: () => <div className="h-12 bg-gray-200 rounded animate-pulse"></div>,
  ssr: false
});

const BidForm = dynamic(() => import('./interactive/BidForm').then(mod => ({ default: mod.BidForm })), {
  loading: () => <div className="h-12 bg-gray-200 rounded animate-pulse"></div>,
  ssr: false
});

const WishlistButton = dynamic(() => import('./interactive/WishlistButton').then(mod => ({ default: mod.WishlistButton })), {
  loading: () => <div className="h-12 bg-gray-200 rounded animate-pulse"></div>,
  ssr: false
});

// --- New Imports for the redesigned layout ---
import { ProductDisplay } from './ProductDisplay';
import { BuildOfferModal } from '@/src/features/offer-management';
import { OfferFooterBar } from '@/src/features/offer-management';
import { useSelector } from 'react-redux';
import { selectOfferItems } from '@/src/features/offer-management/store/offerCartSlice';
import { ProductMetrics } from './ProductMetrics';
import { ProductVariantsTable } from './ProductVariantsTable';

// --- Types for the new layout data ---
interface NewLayoutProductDetails {
  id: string;
  imageUrl: string;
  name: string;
  category: string;
  totalAskingPrice: string;
  msrpPercentage: string;
  leadTime: string;
  description: string;
  unitsInListing: string;
  avgPricePerUnit: string;
  minOrderValue: string;
  location: string;
  packaging: string;
  shipWindow: string;
}

interface NewLayoutProductVariant {
  id: string;
  imageUrl?: string;
  productName: string;
  variants: number;
  msrp: number;
  pricePerUnit: number;
  totalUnits: number;
  totalPrice: number;
}

// Update props for ProductDetailClient
interface ProductDetailClientProps {
  product: Product;
  additionalImages: string[];
  newLayoutProductDetails: NewLayoutProductDetails;
  newLayoutProductVariants: NewLayoutProductVariant[];
  showBreadcrumb?: boolean; // Optional prop with default true
}

/**
 * Optimized Client Component for product details
 * Uses code splitting and lazy loading for better performance
 */
export function ProductDetailClient({
  product,
  additionalImages,
  newLayoutProductDetails,
  newLayoutProductVariants,
  showBreadcrumb = true // Default to true for backward compatibility
}: ProductDetailClientProps) {
  const offerItems = useSelector(selectOfferItems);
  const router = useRouter();

  // Load cart state from localStorage on client-side only
  useLoadCartState();

  const handleBuildOffer = () => {
    // Navigate to the offer summary page
    console.log('Building offer with items:', offerItems);
    router.push('/offer-summary');
  };
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Prepare data for ProductDisplay, merging where appropriate
  const displayData = {
    imageUrl: product.image || newLayoutProductDetails.imageUrl, // Prioritize product.image
    name: product.title || newLayoutProductDetails.name,
    category: product.category || newLayoutProductDetails.category,
    description: product.description || newLayoutProductDetails.description,
    totalAskingPrice: newLayoutProductDetails.totalAskingPrice,
    msrpPercentage: newLayoutProductDetails.msrpPercentage,
    leadTime: newLayoutProductDetails.leadTime,
  };

  const metricsData = {
    unitsInListing: newLayoutProductDetails.unitsInListing,
    avgPricePerUnit: newLayoutProductDetails.avgPricePerUnit,
    minOrderValue: newLayoutProductDetails.minOrderValue,
    location: newLayoutProductDetails.location,
    packaging: newLayoutProductDetails.packaging,
    shipWindow: newLayoutProductDetails.shipWindow,
  };

  return (
    <>
      <BuildOfferModal />
      {offerItems.length > 0 && <OfferFooterBar />}
      <ProductJsonLd product={product} />
      <div className="space-y-6">
        <ProductDisplay product={displayData} />
        <ProductMetrics {...metricsData} />
        <ProductVariantsTable variants={newLayoutProductVariants} />
      </div>
    </>
  );
} 