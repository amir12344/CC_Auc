import MainLayout from '@/src/components/layout/MainLayout';
import { notFound } from 'next/navigation';
import { getAuctionById } from '@/src/features/auctions/data/auctionData';
import { DynamicBreadcrumb } from '@/src/components/ui/DynamicBreadcrumb';
import { AuctionDetailClient } from '@/src/features/auctions/components/AuctionDetailClient';

/**
 * Auction Detail Page - Server Component
 * Displays individual auction information when users click on auction cards
 * 
 * Features:
 * - Server-side rendering for SEO optimization
 * - Dynamic routing with auction ID parameter
 * - Breadcrumb navigation
 * - 404 handling for non-existent auctions
 * - Fetches auction data from mock API (will be replaced with real API)
 * 
 * URL Structure: /marketplace/auction/[id]
 * Example: /marketplace/auction/1001
 * 
 * Data Flow:
 * - Extracts auction ID from URL parameters
 * - Fetches auction data using getAuctionById helper
 * - Renders auction details or 404 page
 */
export default async function AuctionPage({ params }: { params: Promise<{ id: string }> }) {
  // Extract auction ID from URL parameters
  const { id } = await params;

  try {
    // Fetch auction data by ID from mock data
    // In production, this would be an API call or database query
    const auction = getAuctionById(id);

    // Handle case where auction is not found
    if (!auction) {
      notFound(); // This will show the 404 page
      return;
    }

    // Prepare auction title for breadcrumb
    const auctionTitle = auction.title || 'Auction Details';
    
    return (
      <MainLayout>
        <div className="bg-white min-h-screen">
          {/* Breadcrumb Navigation */}
          <div className="border-b border-gray-100">
            <div className="max-w-8xl mx-auto px-6 py-4">
              <DynamicBreadcrumb 
                items={[
                  { label: 'Marketplace', href: '/marketplace' },
                  { label: 'Auctions', href: '/collections/auctions' },
                  { label: auctionTitle, href: `/marketplace/auction/${id}`, current: true }
                ]}
              />
            </div>
          </div>
          
          {/* Auction Details Content */}
          <div className="max-w-8xl mx-auto px-6 py-6">
            <AuctionDetailClient auction={auction} />
          </div>
        </div>
      </MainLayout>
    );

  } catch (error) {
    // Handle any errors during auction data fetching
    console.error(`Error processing auction with ID ${id}:`, error);
    notFound();
  }
} 