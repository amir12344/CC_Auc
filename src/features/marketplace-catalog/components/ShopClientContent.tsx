'use client';

import { Product } from '@/src/types'; // Added import for Product type

import { useRef } from 'react';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';
import { FeaturedSection } from './sections/FeaturedSection';
import { BargainSection } from './sections/BargainSection';
import { AmazonSection } from './sections/AmazonSection';
import { TrendingSection } from './sections/TrendingSection';
import { CategorySection } from './sections/CategorySection';
import WishlistBanner from '@/src/components/ui/WishlistBanner';
import FeaturedBrands from './sections/featured-brands';

// Define Props interface for ShopClientContent
interface ShopClientContentProps {
  products: Product[];
  productsByCategory: Record<string, Product[]>;
  categories: string[];
}

export function ShopClientContent({ products, productsByCategory, categories }: ShopClientContentProps) {
  const contentAreaRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={contentAreaRef}>
      <ErrorBoundary>
        <WishlistBanner />
        <BargainSection />
        <AmazonSection />
        <FeaturedSection />
        <TrendingSection />
        <FeaturedBrands />
        <CategorySection category="Beauty" title="Beauty & Personal Care" variant="light" layout="carousel" />
        <CategorySection category="Home" title="Home & Living" variant="light" layout="carousel" />
      </ErrorBoundary>
    </div>
  );
}
