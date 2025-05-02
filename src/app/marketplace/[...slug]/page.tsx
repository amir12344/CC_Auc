import { redirect } from 'next/navigation';
import { trendingDeals, featuredDeals, moreDeals, bargainListings, amazonListings } from '@/src/mocks/productData';

/**
 * Catch-all route to handle any old URL patterns
 * This will try to find a product with the given slug and redirect to the new URL format
 */
export default async function CatchAllPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const resolvedParams = await params; // Await the promise directly
  const { slug } = resolvedParams; // Destructure slug from the resolved params

  // Get the last part of the URL as the potential product ID or slug
  const potentialId = slug[slug.length - 1];

  // Combine all products from the mock data
  const allProducts = [...trendingDeals, ...featuredDeals, ...moreDeals, ...bargainListings, ...amazonListings];

  // Try to find the product by ID first
  let product = allProducts.find(p => p.id === potentialId);

  // If not found, try to find by title match
  if (!product) {
    product = allProducts.find(p =>
      p.title.toLowerCase().includes(potentialId.toLowerCase())
    );
  }

  if (product) {
    // Redirect to the new URL format using the product ID
    redirect(`/marketplace/product/${product.id}`);
  } else {
    // If no product is found, redirect to the marketplace
    redirect('/marketplace');
  }
}
