import MainLayout from '@/src/components/layout/MainLayout';
import { ProductDetailClient } from '@/src/features/buyer/components/product/ProductDetailClient';
import { notFound } from 'next/navigation';
import { fetchProduct } from '@/src/lib/api/productApi';
import { trendingDeals, featuredDeals, moreDeals, bargainListings, amazonListings } from '@/src/mocks/productData';
import { findProductBySlugOrId } from '@/src/utils/slug-utils';

// Enable Incremental Static Regeneration with a longer revalidation period for better performance
export const revalidate = 3600; // 1 hour

/**
 * Optimized Product Details Page - Server Component
 * Uses direct data access in development mode, with improved caching
 */
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  // Ensure params is properly awaited
  const resolvedParams = await params; // Await the promise
  const { id } = resolvedParams; // Destructure id from resolved params

  try {
    // Fast path for development - use direct data access instead of API calls
    if (process.env.NODE_ENV === 'development') {
      const allProducts = [...trendingDeals, ...featuredDeals, ...moreDeals, ...bargainListings, ...amazonListings];

      // Try to find product by ID
      const product = findProductBySlugOrId(allProducts, id);

      if (!product) {
        notFound();
      }

      // Generate additional images for the gallery
      const additionalImages = [
        product.image,
        product.image.replace(/\?.*$/, '?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=704&q=80'),
        product.image.replace(/\?.*$/, '?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=705&q=80'),
      ];

      return (
        <MainLayout>
          <div className="bg-linear-to-b from-gray-50 to-white min-h-screen">
            <div className="container mx-auto px-4 py-8 md:py-12">
              <ProductDetailClient product={product} additionalImages={additionalImages} />
            </div>
          </div>
        </MainLayout>
      );
    }

    // Server-side data fetching for production with optimized caching
    const { product, additionalImages } = await fetchProduct(id);

    return (
      <MainLayout>
        <div className="bg-linear-to-b from-gray-50 to-white min-h-screen">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <ProductDetailClient product={product} additionalImages={additionalImages} />
          </div>
        </div>
      </MainLayout>
    );
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    notFound();
  }
}
