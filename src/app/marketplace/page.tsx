import MainLayout from '@/src/components/layout/MainLayout';
import { ShopClientContent } from '@/src/features/buyer/components/shop/ShopClientContent';
import { trendingDeals, featuredDeals, moreDeals, bargainListings, amazonListings } from '@/src/mocks/productData';
import type { Metadata } from 'next';

// Enable Incremental Static Regeneration with a revalidation period of 60 seconds
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Marketplace',
  description: 'Testing marketplace route.',
  openGraph: {
    title: 'Marketplace - Commerce Central',
    description: 'Browse our marketplace for the best deals on a wide range of products.',
    type: 'website',
  },
};


export default async function MarketplacePage() {
  // Reintroduce original data processing logic
  const allProducts = [...trendingDeals, ...featuredDeals, ...moreDeals, ...bargainListings, ...amazonListings];
  const categories = Array.from(new Set(allProducts.map(product => product.category).filter(Boolean)));
  const productsByCategory = {
    trending: trendingDeals,
    featured: featuredDeals,
    more: moreDeals,
    bargains: bargainListings,
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <ShopClientContent
          products={allProducts}
          categories={categories as string[]}
          productsByCategory={productsByCategory}
        />
      </div>
    </MainLayout>
  );
}
