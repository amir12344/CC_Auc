import { redirect } from 'next/navigation';
import { trendingDeals, featuredDeals, moreDeals, bargainListings, amazonListings } from '@/src/mocks/productData';

/**
 * This handles all product URLs with the pattern /buyer/product/{id}
 */
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params; 
  const { id } = resolvedParams; 

  
  const allProducts = [...trendingDeals, ...featuredDeals, ...moreDeals, ...bargainListings, ...amazonListings];

  // Find the product by ID
  const product = allProducts.find(p => p.id === id);

  if (!product) {
    
    redirect('/marketplace');
  }

  // Redirect to the new URL format using the product ID
  redirect(`/marketplace/product/${product.id}`);
}
