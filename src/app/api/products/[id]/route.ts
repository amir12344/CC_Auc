import { NextRequest, NextResponse } from 'next/server';
import { trendingDeals, featuredDeals, moreDeals, bargainListings, amazonListings } from '@/src/mocks/productData';

/**
 * GET handler for single product API
 * Returns a single product by ID with optimized caching
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const routeParams = await params;
  const { id } = routeParams;

  const allProducts = [
    ...trendingDeals,
    ...featuredDeals,
    ...moreDeals,
    ...bargainListings,
    ...amazonListings,
  ];

  const product =
    allProducts.find((p) => p.id === id) ||
    allProducts.find((p) => p.link?.includes(id)) ||
    allProducts.find((p) => p.title?.toLowerCase().includes(id.toLowerCase()));

  if (!product) {
    return NextResponse.json(
      { error: 'Product not found' },
      { status: 404 }
    );
  }

  const additionalImages = [product.image, product.image, product.image];

  return NextResponse.json(
    { product, additionalImages },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    }
  );
}

export const dynamic = 'force-static';
