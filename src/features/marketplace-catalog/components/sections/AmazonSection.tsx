'use client';

import { memo } from 'react';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';
import { useProducts } from '@/src/hooks/useProducts';
import ProductCardSkeleton from '@/src/components/skeletons/ProductCardSkeleton';
import ProductCard from '../ProductCard';
import { Skeleton } from '@/src/components/ui/skeleton';
import { ProductSection } from '../ProductSection';
import { Product } from '@/src/types';

export const AmazonSection = memo(() => {
  const { getAmazonListings, loading } = useProducts();
  const products = getAmazonListings();
  const heading="Settle in at these top-rated brands"
  const subheading="People love these highly-rated stays for their products, variety, and more."
  if (loading) {
    return (
      <ProductSection 
        title="Amazon Listings" 
        layout="grid"
        viewAllLink="/collections/amazon"
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
        title="Amazon Listings" 
        layout="grid"
        viewAllLink="/collections/amazon"
      >
        <p className="text-center text-gray-500 mt-4 col-span-full">No Amazon listings available at the moment.</p>
      </ProductSection>
    );
  }



  return (
    <div className='py-6 items-center justify-center min-h-[400px] p-4 md:p-10 relative bg-[#102D21]'>
    <div className="text-center">
          <h2 className="text-3xl tracking-tighter lg:text-5xl xl:text-6xl font-bold text-[#D8F4CC]">{heading}</h2>
          {subheading && <p className="text-muted text-balance lg:text-xl text-[#F1E9DE]">{subheading}</p>}
        </div>
   
    <ProductSection 
      title="Amazon Listings" 
      layout="carousel" 
      darkMode={true}
      viewAllLink="/collections/amazon"
    >
      {products.map((product: Product) => (
        <ErrorBoundary key={product.id} fallback={<Skeleton className="aspect-square rounded-lg w-full" />}>
          <ProductCard product={product} darkMode={true} />
        </ErrorBoundary>
      ))}
    </ProductSection>
    </div>
  );
});

AmazonSection.displayName = 'AmazonSection';
