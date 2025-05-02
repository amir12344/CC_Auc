/**
 * Product API service
 * Contains functions for fetching products from the API with optimized performance
 */

import { Product } from '@/src/types';
import { trendingDeals, featuredDeals, moreDeals, bargainListings, amazonListings } from '@/src/mocks/productData';

interface ProductsResponse {
  products: Product[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasMore: boolean;
  };
}

interface ProductResponse {
  product: Product;
  additionalImages: string[];
}

interface ProductsParams {
  category?: string;
  limit?: number;
  page?: number;
}

// Combine all mock products into a single array for reuse
const allMockProducts = [
  ...trendingDeals,
  ...featuredDeals,
  ...moreDeals,
  ...bargainListings,
  ...amazonListings
];

// Helper function to check if running in development environment
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Fetch products from the API with optimized caching
 */
export async function fetchProducts(params: ProductsParams = {}): Promise<ProductsResponse> {
  // Fast path for development - use mock data directly
  if (isDevelopment) {
    // Apply category filter if specified
    let filteredProducts = allMockProducts;
    if (params.category) {
      filteredProducts = allMockProducts.filter(p =>
        p.category && p.category.toLowerCase() === params.category?.toLowerCase()
      );
    }

    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    // Return mock response
    return {
      products: paginatedProducts,
      pagination: {
        total: filteredProducts.length,
        page,
        pageSize: limit,
        totalPages: Math.ceil(filteredProducts.length / limit),
        hasMore: endIndex < filteredProducts.length
      }
    };
  }

  // Build query string from params
  const queryParams = new URLSearchParams();
  if (params.category) queryParams.append('category', params.category);
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.page) queryParams.append('page', params.page.toString());

  // Construct an absolute URL for the API endpoint
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

  const url = new URL(`/api/products?${queryParams.toString()}`, baseUrl).toString();

  // Fetch products from the API with improved caching
  const response = await fetch(url, {
    next: { revalidate: 600 }, // 10 minutes
    cache: 'force-cache',
  });

  // Handle errors
  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
  }

  // Return the products
  return response.json();
}

/**
 * Fetch a single product from the API with optimized caching
 */
export async function fetchProduct(id: string): Promise<ProductResponse> {
  // Fast path for development - use mock data directly
  if (isDevelopment) {
    const product = allMockProducts.find(p => p.id === id);

    if (!product) {
      throw new Error(`Product not found: ${id}`);
    }

    return {
      product,
      additionalImages: [product.image, product.image, product.image]
    };
  }

  // Construct an absolute URL for the API endpoint
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

  const url = new URL(`/api/products/${id}`, baseUrl).toString();

  // Fetch product from the API with improved caching
  const response = await fetch(url, {
    next: { revalidate: 600 }, // 10 minutes
    cache: 'force-cache',
  });

  // Handle errors
  if (!response.ok) {
    throw new Error(`Failed to fetch product: ${response.status} ${response.statusText}`);
  }

  // Return the product
  return response.json();
}

/**
 * Search products from the API
 */
export async function searchProducts(query: string): Promise<ProductsResponse> {
  // Fast path for development - use mock data directly
  if (isDevelopment) {
    const filteredProducts = allMockProducts.filter(p =>
      (p.title && p.title.toLowerCase().includes(query.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(query.toLowerCase()))
    );

    return {
      products: filteredProducts,
      pagination: {
        total: filteredProducts.length,
        page: 1,
        pageSize: filteredProducts.length,
        totalPages: 1,
        hasMore: false
      }
    };
  }

  // Construct an absolute URL for the API endpoint
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

  const url = new URL(`/api/products/search?q=${encodeURIComponent(query)}`, baseUrl).toString();

  // Fetch products from the API with caching
  const response = await fetch(url, {
    next: { revalidate: 600 }, // 10 minutes
    cache: 'force-cache',
  });

  // Handle errors
  if (!response.ok) {
    throw new Error(`Failed to search products: ${response.status} ${response.statusText}`);
  }

  // Return the products
  return response.json();
}

