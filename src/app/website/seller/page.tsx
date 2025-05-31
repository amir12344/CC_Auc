import type { Metadata } from 'next';
import SellerPageClient from './page-client';

// SEO metadata for the seller page
export const metadata: Metadata = {
  title: 'Liquidate Excess Inventory Easily | Commerce Central for Sellers',
  description: 'Effortlessly liquidate your excess and returned inventory with Commerce Central. Sell wholesale pallets directly to verified buyers — no middlemen, no surprises. Faster processing, higher recovery, and full resale control.',
  alternates: {
    canonical: 'https://www.commercecentral.io/website/seller'
  },
  openGraph: {
    url: 'https://www.commercecentral.io/website/seller',
    title: 'Liquidate Excess Inventory Easily | Commerce Central for Sellers',
    description: 'Effortlessly liquidate your excess and returned inventory with Commerce Central. Sell wholesale pallets directly to verified buyers — no middlemen, no surprises. Faster processing, higher recovery, and full resale control.',
    images: [
      {
        url: '/CC_opengraph.png',
        width: 500,
        height: 500,
        alt: 'Commerce Central Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Liquidate Excess Inventory Easily | Commerce Central for Sellers',
    description: 'Effortlessly liquidate your excess and returned inventory with Commerce Central. Sell wholesale pallets directly to verified buyers — no middlemen, no surprises. Faster processing, higher recovery, and full resale control.',
    images: ['/CC_opengraph.png'],
  },
};

// Server Component wrapper that renders the client component
export default function SellerPage() {
  return <SellerPageClient />;
}