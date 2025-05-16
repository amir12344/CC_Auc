import type { Metadata } from 'next';
import HomeClient from './page-client';

// SEO metadata for the marketing landing page
export const metadata: Metadata = {
  title: 'Commerce Central - Surplus Inventory Marketplace',
  description: 'Access premium surplus inventory and wholesale lots from leading retailers. Find trusted partners for your inventory needs.',
  openGraph: {
    title: 'Commerce Central - The Premium Surplus Marketplace',
    description: 'Connect with vetted buyers and sellers to maximize your inventory value. Join the most trusted B2B surplus platform.',
    images: [
      {
        url: '/CC_Logo.png',
        width: 1000,
        height: 1000,
        alt: 'Commerce Central Homepage',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Commerce Central - Unlock Your Inventory\'s Potential',
    description: 'The only private surplus distribution platform built for trusted Buyers and Sellers.',
    images: ['/CC_Logo.png'],
  },
};

// Server Component wrapper that renders the client component
export default function Page() {
  return <HomeClient />;
}

