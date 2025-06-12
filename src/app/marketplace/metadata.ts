import type { Metadata } from 'next';

// Enable Incremental Static Regeneration with a revalidation period of 60 seconds
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Marketplace',
  description: 'Testing marketplace route.',
  openGraph: {
    title: 'Marketplace - Commerce Central',
    description: 'Browse our marketplace for the best deals on a wide range of products.',
    type: 'website',
  },
};
