'use client';

import { memo } from 'react';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';
import { ProductSection } from '../ProductSection';
import type { Product } from '@/src/types';
import { useProducts } from '@/src/hooks/useProducts';
import ProductCardSkeleton from '@/src/components/skeletons/ProductCardSkeleton';
import ProductCard from '../ProductCard';

export const FeaturedSection = memo(() => {
  const { getFeaturedProducts, loading } = useProducts();
  const products = getFeaturedProducts();

  if (loading) {
    return (
      <ProductSection 
        title="Private Offers" 
        layout="grid" 
        variant="light"
        viewAllLink="/collections/featured"
      >
        {Array(4).fill(0).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </ProductSection>
    );
  }
  
  if (!products || products.length === 0) {
    return (
      <ProductSection 
        title="Private Offers" 
        layout="grid" 
        variant="light"
        viewAllLink="/collections/featured"
      >
        <p className="text-center text-gray-500 mt-4 col-span-full">No featured products available at the moment.</p>
      </ProductSection>
    );
  }

  return (
    <ProductSection 
      title="Private Offers" 
      layout="carousel" 
      variant="light"
      viewAllLink="/collections/featured"
    >
      {products.map((product: Product) => (
        <ErrorBoundary key={product.id} fallback={<ProductCardSkeleton />}>
          <ProductCard product={product} />
        </ErrorBoundary>
      ))}
    </ProductSection>
  );
});

FeaturedSection.displayName = 'FeaturedSection';
