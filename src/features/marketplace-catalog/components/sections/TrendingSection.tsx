'use client';

import { memo } from 'react';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';
import { ProductSection } from '../ProductSection';
import type { Product } from '@/src/types';
import { useProducts } from '@/src/hooks/useProducts';
import ProductCardSkeleton from '@/src/components/skeletons/ProductCardSkeleton';
import ProductCard from '../ProductCard';



export const TrendingSection = memo(() => {
  const { getTrendingProducts, loading } = useProducts();
  const products = getTrendingProducts();

  if (loading) {
    return (
      <ProductSection 
        title="Trending Now" 
        layout="grid" 
        variant="light"
        viewAllLink="/collections/trending"
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
        title="Trending Now" 
        layout="grid" 
        variant="light"
        viewAllLink="/collections/trending"
      >
        <p className="text-center text-gray-500 mt-4 col-span-full">No trending products available at the moment.</p>
      </ProductSection>
    );
  }

  return (
    <ProductSection 
      title="Trending Now" 
      layout="carousel" 
      variant="light"
      viewAllLink="/collections/trending"
    >
      {products.map((product: Product) => (
        <ErrorBoundary key={product.id} fallback={<ProductCardSkeleton />}>
          <ProductCard product={product} />
        </ErrorBoundary>
      ))}
    </ProductSection>
  );
});

TrendingSection.displayName = 'TrendingSection';
