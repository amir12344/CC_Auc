import type { Metadata } from 'next';
import EarlyAccessClient from './page-client';

// SEO metadata for the early access page
export const metadata: Metadata = {
  title: 'Trusted Access to Wholesale Pallets & Returns | Commerce Central',
  description: 'Securely source surplus products and wholesale pallets from trusted sellers. Commerce Central connects resellers with verified inventory at scale.',
  alternates: {
    canonical: 'https://www.commercecentral.io/earlyaccess'
  },
  openGraph: {
    title: 'Trusted Access to Wholesale Pallets & Returns | Commerce Central',
    description: 'Securely source surplus products and wholesale pallets from trusted sellers. Commerce Central connects resellers with verified inventory at scale.',
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
    title: 'Trusted Access to Wholesale Pallets & Returns | Commerce Central',
    description: 'Securely source surplus products and wholesale pallets from trusted sellers. Commerce Central connects resellers with verified inventory at scale.',
    images: ['/CC_opengraph.png'],
  },
};

// Server Component wrapper that renders the client component
export default function Page() {
  return <EarlyAccessClient />;
}
