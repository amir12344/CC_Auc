"use client";

import { useEffect, useMemo, useState } from "react";

import {
  amazonListings,
  bargainListings,
  featuredDeals,
  moreDeals,
  spotlightDeal,
  trendingDeals,
} from "@/src/mocks/productData";
import { Product } from "@/src/types";

export const useProducts = () => {
  const allMockProducts = useMemo(
    () => [
      ...spotlightDeal,
      ...trendingDeals,
      ...featuredDeals,
      ...moreDeals,
      ...bargainListings,
      ...amazonListings,
    ],
    []
  );
  const [products, setProducts] = useState<Product[]>(allMockProducts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Use setTimeout to simulate API loading
    const timer = setTimeout(() => {
      setProducts(allMockProducts);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [allMockProducts]);

  const getNewArrivals = () => {
    const newItems = featuredDeals.filter((p) => p.label === "NEW");
    if (newItems.length > 0) return newItems.slice(0, 8);
    // Fallback: return first few featured items if no 'NEW' label found
    return featuredDeals.slice(0, 8);
  };

  const getFeaturedProducts = () => {
    return featuredDeals.slice(0, 8);
  };

  const getTrendingProducts = () => {
    return trendingDeals.slice(0, 8);
  };

  const getBargainListings = () => {
    return bargainListings;
  };

  const getAmazonListings = () => {
    return amazonListings;
  };

  const getProductsByCategory = (category: string) => {
    if (!category || category.toLowerCase() === "all") return products;
    return products.filter((p) =>
      p.category.toLowerCase().includes(category.toLowerCase())
    );
  };

  return {
    products,
    loading,
    error,
    getNewArrivals,
    getFeaturedProducts,
    getTrendingProducts,
    getBargainListings,
    getAmazonListings,
    getProductsByCategory,
  };
};
