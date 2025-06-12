'use client';

import { memo } from 'react';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';
import { ProductSection } from '../ProductSection';
import type { Product } from '@/src/types';
import { useProducts } from '@/src/hooks/useProducts';
import ProductCardSkeleton from '@/src/components/skeletons/ProductCardSkeleton';
import ProductCard from '../ProductCard';

interface CategorySectionProps {
  category: string;
  title: string;
  variant?: 'light' | 'trending' | 'custom';
  layout?: 'grid' | 'carousel';
}

export const CategorySection = memo(({ 
  category, 
  title, 
  variant = 'light',
  layout = 'grid' 
}: CategorySectionProps) => {
  const { getProductsByCategory, loading } = useProducts();
  const products = getProductsByCategory(category);
  
  // Generate viewAllLink based on category
  const viewAllLink = `/collections/${category.toLowerCase().replace(/\s+/g, '-')}`;

  if (loading) {
    return (
      <ProductSection 
        title={title} 
        layout="grid" 
        variant={variant}
        viewAllLink={viewAllLink}
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
        title={title} 
        layout="grid" 
        variant={variant}
        viewAllLink={viewAllLink}
      >
        <p className="text-center text-gray-500 mt-4 col-span-full">No products found in {title}.</p>
      </ProductSection>
    );
  }

  return (
    <ProductSection 
      title={title} 
      variant={variant} 
      layout={layout}
      viewAllLink={viewAllLink}
    >
      {products.map((product: Product) => (
        <ErrorBoundary key={product.id} fallback={<ProductCardSkeleton />}>
          <ProductCard product={product} />
        </ErrorBoundary>
      ))}
    </ProductSection>
  );
});

CategorySection.displayName = 'CategorySection';
