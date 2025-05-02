import { redirect } from 'next/navigation';
import { trendingDeals, featuredDeals, moreDeals, bargainListings, amazonListings } from '@/src/mocks/productData';

/**
 * Redirect from old URL structure to new URL structure
 * This handles all auction product URLs with the pattern /marketplace/auction/{id}
 */
export default async function AuctionProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params; // Await the promise
  const { id } = resolvedParams; // Destructure id from resolved params

  // Combine all products from the mock data
  const allProducts = [...trendingDeals, ...featuredDeals, ...moreDeals, ...bargainListings, ...amazonListings];

  // Try to find the product by ID
  const product = allProducts.find(p => p.id === id);

  if (!product) {
    // If no product is found, redirect to the marketplace
    redirect('/marketplace');
  }

  // Redirect to the new URL format using the product ID
  redirect(`/marketplace/product/${product.id}`);
}
