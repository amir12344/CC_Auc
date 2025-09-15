import { memo } from "react";

import { ErrorBoundary } from "@/src/components/ErrorBoundary";
import ProductCardSkeleton from "@/src/components/skeletons/ProductCardSkeleton";
import { useProducts } from "@/src/hooks/useProducts";

import ProductCard from "../ProductCard";
import { ProductSection } from "../ProductSection";

export const NewArrivalsSection = memo(function NewArrivalsSection() {
  const { getNewArrivals, loading } = useProducts();
  const products = getNewArrivals();

  if (loading) {
    return (
      <div className="container py-8">
        <h2 className="mb-6 text-2xl font-bold tracking-tighter">
          New Arrivals
        </h2>
        <div className="grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Using a fixed number of skeletons during loading */}
          {Array(4)
            .fill(0)
            .map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="container py-8">
        <h2 className="mb-6 text-2xl font-bold tracking-tighter">
          New Arrivals
        </h2>
        <p className="mt-4 text-center text-gray-500">
          No new arrivals at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4">
      <ProductSection title="New Arrivals" variant="light">
        {products.map((product) => (
          <ErrorBoundary key={product.id} fallback={<ProductCardSkeleton />}>
            <ProductCard product={product} />
          </ErrorBoundary>
        ))}
      </ProductSection>
    </div>
  );
});
