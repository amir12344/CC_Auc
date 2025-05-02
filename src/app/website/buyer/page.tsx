import type { Metadata } from 'next';
import BuyerPageClient from './page-client';

// SEO metadata for the buyer page
export const metadata: Metadata = {
  title: 'Commerce Central - Buyer Platform',
  description: 'Access brand-approved excess inventory and returns with full transparency. Buy directly from verified sellers with complete manifests and no surprises.',
  openGraph: {
    title: 'Commerce Central for Buyers',
    description: 'Source smarter with direct access to brand-approved excess and returns — fully manifested and ready to move.',
    images: [
      {
        url: '/images/buyer-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Commerce Central Buyer Platform',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Commerce Central for Buyers',
    description: 'Source smarter with direct access to brand-approved excess and returns — fully manifested and ready to move.',
    images: ['/images/buyer-twitter.jpg'],
  },
};

// Server Component wrapper that renders the client component
export default function BuyerPage() {
  return <BuyerPageClient />;
} 