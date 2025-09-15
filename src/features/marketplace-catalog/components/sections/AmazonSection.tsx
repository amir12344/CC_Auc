"use client";

import { memo } from "react";

import { ErrorBoundary } from "@/src/components/ErrorBoundary";
import ProductCardSkeleton from "@/src/components/skeletons/ProductCardSkeleton";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useProducts } from "@/src/hooks/useProducts";
import { Product } from "@/src/types";

import ProductCard from "../ProductCard";
import { ProductSection } from "../ProductSection";

export const AmazonSection = memo(() => {
  const { getAmazonListings, loading } = useProducts();
  const products = getAmazonListings();
  const heading = "Settle in at these top-rated brands";
  const subheading =
    "People love these highly-rated stays for their products, variety, and more.";
  if (loading) {
    return (
      <ProductSection
        title="Amazon Listings"
        layout="grid"
        viewAllLink="/collections/amazon"
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
        title="Amazon Listings"
        layout="grid"
        viewAllLink="/collections/amazon"
      >
        <p className="col-span-full mt-4 text-center text-gray-500">
          No Amazon listings available at the moment.
        </p>
      </ProductSection>
    );
  }

  return (
    <div className="relative min-h-[400px] items-center justify-center bg-[#102D21] p-4 py-6 md:p-10">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tighter text-[#D8F4CC] lg:text-5xl xl:text-6xl">
          {heading}
        </h2>
        {subheading && (
          <p className="text-muted text-balance text-[#F1E9DE] lg:text-xl">
            {subheading}
          </p>
        )}
      </div>

      <ProductSection
        title="Amazon Listings"
        layout="carousel"
        darkMode={true}
        viewAllLink="/collections/amazon"
      >
        {products.map((product: Product) => (
          <ErrorBoundary
            key={product.id}
            fallback={<Skeleton className="aspect-square w-full rounded-lg" />}
          >
            <ProductCard product={product} darkMode={true} />
          </ErrorBoundary>
        ))}
      </ProductSection>
    </div>
  );
});

AmazonSection.displayName = "AmazonSection";
