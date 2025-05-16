import type { Metadata } from 'next';
import SellerPageClient from './page-client';

// SEO metadata for the seller page
export const metadata: Metadata = {
  title: 'Sell Excess Inventory | Commerce Central',
  description: 'Commerce Central helps brands recover margin from excess and returned inventory without sacrificing control or brand integrity.',
  alternates: {
    canonical: 'https://www.commercecentral.io/website/seller'
  },
  openGraph: {
    url: 'https://www.commercecentral.io/website/seller',
    title: 'Make Your Inventory Work for You | Commerce Central',
    description: 'Recover more value from surplus inventory with brand protection, channel control, and automated resale processes.',
    images: [
      {
        url: '/CC_opengraph.png',
        width: 1200,
        height: 364,
        alt: 'Commerce Central Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Recover More. Risk Less. Reclaim Control.',
    description: 'Commerce Central is your brand-safe execution layer for turning surplus into cash.',
    images: ['/CC_opengraph.png'],
  },
};

// Server Component wrapper that renders the client component
export default function SellerPage() {
  return <SellerPageClient />;
}