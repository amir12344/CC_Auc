import { memo } from 'react';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';
import { ProductSection } from '../ProductSection';
import { useProducts } from '@/src/hooks/useProducts';
import ProductCardSkeleton from '@/src/components/skeletons/ProductCardSkeleton';
import ProductCard from '../ProductCard';

export const NewArrivalsSection = memo(() => {
  const { getNewArrivals, loading } = useProducts();
  const products = getNewArrivals();

  if (loading) {
    return (
      <div className="container py-8">
        <h2 className="text-2xl font-bold tracking-tighter mb-6">New Arrivals</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {/* Using a fixed number of skeletons during loading */}
          {Array(4).fill(0).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }
  
  if (!products || products.length === 0) {
    return (
      <div className="container py-8">
        <h2 className="text-2xl font-bold tracking-tighter mb-6">New Arrivals</h2>
        <p className="text-center text-gray-500 mt-4">No new arrivals at the moment.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4">
      <ProductSection title="New Arrivals" variant="light">
        {products.map(product => (
          <ErrorBoundary key={product.id} fallback={<ProductCardSkeleton />}>
            <ProductCard product={product} />
          </ErrorBoundary>
        ))}
      </ProductSection>
    </div>
  );
});
