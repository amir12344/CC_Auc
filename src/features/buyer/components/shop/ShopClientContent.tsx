'use client';

import { useState, useEffect, useRef, memo } from 'react';
import dynamic from 'next/dynamic';
import { Product } from '@/src/types';
import { useIntersectionObserver } from '@/src/hooks/useIntersectionObserver';
import FilterBar from '@/src/components/layout/FilterBar';

// Dynamic imports with loading states for better performance
const ProductCard = memo(dynamic(() => import('../product/ProductCard'), {
  loading: () => <ProductCardSkeleton />
}));

const ProductSection = memo(dynamic(() => import('../home/ProductSection'), {
  loading: () => <div className="h-10 w-full bg-gray-100 animate-pulse rounded-lg mb-4"></div>
}));

const WishlistBanner = dynamic(() => import('@/src/components/ui/WishlistBanner'), {
  ssr: false,
  loading: () => <div className="w-full h-20 bg-gray-100 rounded-lg animate-pulse mb-8"></div>
});

// Skeleton loader for product cards
const ProductCardSkeleton = () => (
  <div className="animate-pulse">
    <div className="aspect-square w-full bg-gray-200 rounded-lg mb-3"></div>
    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
);

interface ShopClientContentProps {
  products: Product[];
  categories: string[];
  productsByCategory: {
    trending: Product[];
    featured: Product[];
    more: Product[];
    bargains: Product[];
  };
}

/**
 * Client Component for interactive shop content
 * Handles client-side state and interactivity while using server-fetched data
 */
export function ShopClientContent({
  products,
  productsByCategory
}: ShopClientContentProps) {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Handle category change - client-side filtering
  const handleCategoryChange = (category: string | null) => {
    setActiveCategory(category);

    if (!category || category === 'all') {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter(product =>
      product.category && product.category.toLowerCase() === category.toLowerCase()
    );

    setFilteredProducts(filtered);
  };

  // Create refs for each section for intersection observer
  const bargainSectionRef = useRef<HTMLDivElement>(null);
  const trendingSectionRef = useRef<HTMLDivElement>(null);
  const featuredSectionRef = useRef<HTMLDivElement>(null);
  const moreSectionRef = useRef<HTMLDivElement>(null);

  // Use intersection observer to load sections progressively
  const bargainSection = useIntersectionObserver({ elementRef: bargainSectionRef, threshold: 0.1, rootMargin: '200px' });
  const trendingSection = useIntersectionObserver({ elementRef: trendingSectionRef, threshold: 0.1, rootMargin: '200px' });
  const featuredSection = useIntersectionObserver({ elementRef: featuredSectionRef, threshold: 0.1, rootMargin: '200px' });
  const moreSection = useIntersectionObserver({ elementRef: moreSectionRef, threshold: 0.1, rootMargin: '200px' });

  // State to track which sections have been loaded
  const [loadedSections, setLoadedSections] = useState({
    bargains: false,
    trending: false,
    featured: false,
    more: false
  });

  // Load sections when they come into view
  useEffect(() => {
    if (bargainSection.isVisible && !loadedSections.bargains && productsByCategory.bargains) {
      setLoadedSections(prev => ({ ...prev, bargains: true }));
    }
    if (trendingSection.isVisible && !loadedSections.trending && productsByCategory.trending) {
      setLoadedSections(prev => ({ ...prev, trending: true }));
    }
    if (featuredSection.isVisible && !loadedSections.featured && productsByCategory.featured) {
      setLoadedSections(prev => ({ ...prev, featured: true }));
    }
    if (moreSection.isVisible && !loadedSections.more && productsByCategory.more) {
      setLoadedSections(prev => ({ ...prev, more: true }));
    }
  }, [bargainSection.isVisible, trendingSection.isVisible, featuredSection.isVisible, moreSection.isVisible, loadedSections, productsByCategory]);

  return (
    <>
      {/* FilterBar with dynamic loading
      <CategoryFilter
        categories={categories}
        onCategoryChange={handleCategoryChange}
      /> */}

      <FilterBar />

      {/* Wishlist Banner */}
      <WishlistBanner />

      {/* Bargain Listings Section - Always load first */}
      <div ref={bargainSectionRef}>
        <ProductSection title="Bargain Listings" viewAllLink="/marketplace?category=bargains">
          {loadedSections.bargains && productsByCategory.bargains ? (
            productsByCategory.bargains.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            // Skeleton loaders
            Array(4).fill(0).map((_, index) => (
              <ProductCardSkeleton key={`bargain-skeleton-${index}`} />
            ))
          )}
        </ProductSection>
      </div>

      {/* Filtered Products or Sections */}
      {activeCategory ? (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">
            {activeCategory || 'Products'}
          </h2>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600">No products found in this category.</p>
              <button
                onClick={() => handleCategoryChange('all')}
                className="mt-4 btn btn-primary"
              >
                View All Products
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Trending Deals Section - Load when visible */}
          <div ref={trendingSectionRef}>
            <ProductSection title="Trending Deals" viewAllLink="/marketplace?category=trending">
              {loadedSections.trending && productsByCategory.trending ? (
                productsByCategory.trending.map((product: Product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                // Skeleton loaders
                Array(4).fill(0).map((_, index) => (
                  <ProductCardSkeleton key={`trending-skeleton-${index}`} />
                ))
              )}
            </ProductSection>
          </div>

          {/* Featured Deals Section - Load when visible */}
          <div ref={featuredSectionRef}>
            <ProductSection title="Featured Deals" viewAllLink="/marketplace?category=featured">
              {loadedSections.featured && productsByCategory.featured ? (
                productsByCategory.featured.map((product: Product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                // Skeleton loaders
                Array(4).fill(0).map((_, index) => (
                  <ProductCardSkeleton key={`featured-skeleton-${index}`} />
                ))
              )}
            </ProductSection>
          </div>

          {/* More Deals Section - Load when visible */}
          <div ref={moreSectionRef}>
            <ProductSection title="More Deals" viewAllLink="/marketplace?category=more">
              {loadedSections.more && productsByCategory.more ? (
                productsByCategory.more.map((product: Product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                // Skeleton loaders
                Array(4).fill(0).map((_, index) => (
                  <ProductCardSkeleton key={`more-skeleton-${index}`} />
                ))
              )}
            </ProductSection>
          </div>
        </>
      )}
    </>
  );
}

