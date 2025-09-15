"use client";

import { memo } from "react";

import { ErrorBoundary } from "@/src/components/ErrorBoundary";
import ProductCardSkeleton from "@/src/components/skeletons/ProductCardSkeleton";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useProducts } from "@/src/hooks/useProducts";
import { Product } from "@/src/types";

import ProductCard from "../ProductCard";
import { ProductSection } from "../ProductSection";

export const BargainSection = memo(() => {
  const { getBargainListings, loading } = useProducts();
  const products = getBargainListings();

  if (loading) {
    return (
      <ProductSection
        title="Amazon or Walmart"
        layout="grid"
        viewAllLink="/collections/bargain"
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
        title="Amazon or Walmart"
        layout="grid"
        viewAllLink="/collections/bargain"
      >
        <p className="col-span-full mt-4 text-center text-gray-500">
          No bargain listings available at the moment.
        </p>
      </ProductSection>
    );
  }

  return (
    <ProductSection
      title="Amazon or Walmart"
      layout="carousel"
      viewAllLink="/collections/bargain"
    >
      {products.map((product: Product) => (
        <ErrorBoundary
          key={product.id}
          fallback={<Skeleton className="aspect-square w-full rounded-lg" />}
        >
          <ProductCard product={product} />
        </ErrorBoundary>
      ))}
    </ProductSection>
  );
});

BargainSection.displayName = "BargainSection";
