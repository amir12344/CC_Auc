"use client";

import { memo } from "react";

import { ErrorBoundary } from "@/src/components/ErrorBoundary";
import ProductCardSkeleton from "@/src/components/skeletons/ProductCardSkeleton";
import { useProducts } from "@/src/hooks/useProducts";
import type { Product } from "@/src/types";

import ProductCard from "../ProductCard";
import { ProductSection } from "../ProductSection";

export const TrendingSection = memo(() => {
  const { getTrendingProducts, loading } = useProducts();
  const products = getTrendingProducts();

  if (loading) {
    return (
      <ProductSection
        title="Categories For You"
        layout="grid"
        variant="light"
        viewAllLink="/collections/trending"
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
        title="Categories For You"
        layout="grid"
        variant="light"
        viewAllLink="/collections/trending"
      >
        <p className="col-span-full mt-4 text-center text-gray-500">
          No trending products available at the moment.
        </p>
      </ProductSection>
    );
  }

  return (
    <ProductSection
      title="Categories For You"
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

TrendingSection.displayName = "TrendingSection";
