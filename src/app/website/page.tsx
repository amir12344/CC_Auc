import type { Metadata } from 'next';
import HomeClient from './page-client';

// SEO metadata for the marketing landing page
export const metadata: Metadata = {
  title: 'Buy & Sell Surplus Inventory | Commerce Central Liquidation Platform',
  description: 'Buy and sell surplus inventory through trusted B2B liquidation auctions on Commerce Central. Verified sellers, clean manifests, and fast processing.',
  openGraph: {
    title: 'Buy & Sell Surplus Inventory | Commerce Central Liquidation Platform',
    description: 'Buy and sell surplus inventory through trusted B2B liquidation auctions on Commerce Central. Verified sellers, clean manifests, and fast processing.',
    images: [
      {
        url: '/CC_opengraph.png',
          width: 500,
                height: 500,
        alt: 'Commerce Central Homepage',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Buy & Sell Surplus Inventory | Commerce Central Liquidation Platform',
    description: 'Buy and sell surplus inventory through trusted B2B liquidation auctions on Commerce Central. Verified sellers, clean manifests, and fast processing..',
    images: ['/CC_opengraph.png'],
  },
};

// Server Component wrapper that renders the client component
export default function Page() {
  return <HomeClient />;
}

