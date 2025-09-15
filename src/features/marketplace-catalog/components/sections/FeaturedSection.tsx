"use client";

import { memo } from "react";

import { ErrorBoundary } from "@/src/components/ErrorBoundary";
import ProductCardSkeleton from "@/src/components/skeletons/ProductCardSkeleton";
import { useProducts } from "@/src/hooks/useProducts";
import type { Product } from "@/src/types";

import ProductCard from "../ProductCard";
import { ProductSection } from "../ProductSection";

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
        {Array(4)
          .fill(0)
          .map((_, index) => (
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
        <p className="col-span-full mt-4 text-center text-gray-500">
          No featured products available at the moment.
        </p>
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

FeaturedSection.displayName = "FeaturedSection";
