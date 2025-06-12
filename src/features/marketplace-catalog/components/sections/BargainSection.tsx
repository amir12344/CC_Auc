'use client';

import { memo } from 'react';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';
import { useProducts } from '@/src/hooks/useProducts';
import ProductCardSkeleton from '@/src/components/skeletons/ProductCardSkeleton';
import ProductCard from '../ProductCard';
import { Skeleton } from '@/src/components/ui/skeleton';
import { ProductSection } from '../ProductSection';
import { Product } from '@/src/types';

export const BargainSection = memo(() => {
  const { getBargainListings, loading } = useProducts();
  const products = getBargainListings();

  if (loading) {
    return (
      <ProductSection 
        title="Bargain Listings" 
        layout="grid"
        viewAllLink="/collections/bargain"
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
        title="Bargain Listings" 
        layout="grid"
        viewAllLink="/collections/bargain"
      >
        <p className="text-center text-gray-500 mt-4 col-span-full">No bargain listings available at the moment.</p>
      </ProductSection>
    );
  }



  return (
    <ProductSection 
      title="Bargain Listings" 
      layout="carousel"
      viewAllLink="/collections/bargain"
    >
      {products.map((product: Product) => (
        <ErrorBoundary key={product.id} fallback={<Skeleton className="aspect-square rounded-lg w-full" />}>
          <ProductCard product={product} />
        </ErrorBoundary>
      ))}
    </ProductSection>
  );
});

BargainSection.displayName = 'BargainSection';
