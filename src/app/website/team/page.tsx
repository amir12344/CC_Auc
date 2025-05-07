import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { defaultMetadata, defaultOpenGraph } from '@/src/utils/metadata';

// Client component with structured data and optimized loading
const TeamPageClient = dynamic(() => import('@/src/features/website/components/pages/TeamPageClient'), {
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-32 w-32 bg-gray-200 rounded-full mb-4"></div>
        <div className="h-8 w-64 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-48 bg-gray-200 rounded"></div>
      </div>
    </div>
  )
});

// Export metadata for this page
export const metadata: Metadata = {
  ...defaultMetadata,
  title: 'Our Team - Commerce Central',
  description: 'Meet the Commerce Central team - the experts behind our AI-powered inventory management solutions.',
  openGraph: {
    ...defaultOpenGraph,
    title: 'Our Team - Commerce Central',
    description: 'Meet the Commerce Central team - the experts behind our AI-powered inventory management solutions.',
    images: [
      {
        url: 'https://www.commercecentral.io',
        width: 1200,
        height: 630,
        alt: 'Commerce Central Team',
      },
    ],
  },
};

export default function TeamPage() {
  return <TeamPageClient />;
}
