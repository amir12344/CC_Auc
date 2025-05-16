import type { Metadata } from 'next';
import BuyerPageClient from './page-client';

// SEO metadata for the buyer page
export const metadata: Metadata = {
  title: 'Commerce Central - Buyer Platform',
  description: 'Access brand-approved excess inventory and returns with full transparency. Buy directly from verified sellers with complete manifests and no surprises.',
  alternates: {
    canonical: 'https://www.commercecentral.io/website/buyer'
  },
  openGraph: {
    url: 'https://www.commercecentral.io/website/buyer',
    title: 'Commerce Central for Buyers',
    description: 'Source smarter with direct access to brand-approved excess and returns — fully manifested and ready to move.',
    images: [
      {
        url: '/CC_opengraph.png',
        width: 1200,
        height: 364,
        alt: 'Commerce Central Logo',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Commerce Central for Buyers',
    description: 'Source smarter with direct access to brand-approved excess and returns — fully manifested and ready to move.',
    images: ['/CC_opengraph.png'],
  },
};

// Server Component wrapper that renders the client component
export default function BuyerPage() {
  return <BuyerPageClient />;
}