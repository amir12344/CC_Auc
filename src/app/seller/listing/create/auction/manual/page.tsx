import type { Metadata } from 'next';
// MainLayout is provided by seller/layout.tsx - no need to import
import { AuctionListingForm } from '@/src/features/seller/components/AuctionListingForm';

export const metadata: Metadata = {
  title: 'Create Auction Listing',
  description: 'Create a detailed auction listing for your inventory',
};

export default function CreateAuctionListingPage() {
  return (
    <AuctionListingForm />
  );
} 