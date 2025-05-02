import { NextResponse } from 'next/server';
import { mockProducts } from '@/src/mocks/products';

/**
 * GET handler for products API
 * This API endpoint delivers product data with optimized caching
 */
export async function GET() {
  return NextResponse.json({ products: mockProducts }, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  });
}

export const dynamic = 'force-static';
export const config = {
  runtime: 'edge',
  regions: ['iad1'],
};
