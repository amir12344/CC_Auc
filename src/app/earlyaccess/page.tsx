import type { Metadata } from 'next';
import EarlyAccessClient from './page-client';

// SEO metadata for the early access page
export const metadata: Metadata = {
  title: 'Early Access - Commerce Central',
  description: 'Get early access to Commerce Central - the premier surplus inventory marketplace. Join our exclusive network of buyers and sellers.',
  alternates: {
    canonical: 'https://www.commercecentral.io/earlyaccess'
  },
  openGraph: {
    title: 'Commerce Central - Request Early Access',
    description: 'Join our exclusive early access program and be the first to experience the most trusted B2B surplus platform.',
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
    title: 'Commerce Central - Request Early Access',
    description: 'Join our exclusive early access program for Commerce Central.',
    images: ['/CC_opengraph.png'],
  },
};

// Server Component wrapper that renders the client component
export default function Page() {
  return <EarlyAccessClient />;
}
