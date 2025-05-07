// This is a Client Component for the marketing homepage
'use client';

import dynamic from 'next/dynamic';

const HeroSection = dynamic(
  () => import('@/src/features/website/components/sections/HeroSection').then(mod => mod.default),
  {
    ssr: true,
    loading: () => <div className="min-h-screen bg-gray-100 animate-pulse"></div> // Placeholder for Hero
  }
);

// Used dynamic imports with code splitting
const InfoSection = dynamic(
  () => import('@/src/features/website/components/sections/InfoSection').then(mod => mod.default),
  {
    ssr: true,
    loading: () => <div className="h-40 bg-gray-50 animate-pulse rounded-lg"></div>
  }
);

const SellersFeaturesSection = dynamic(
  () => import('@/src/features/website/components/sections/SellersFeaturesSection').then(mod => mod.default),
  {
    ssr: true,
    loading: () => <div className="h-60 bg-gray-50 animate-pulse rounded-lg"></div>
  }
);

const BuyersFeaturesSection = dynamic(
  () => import('@/src/features/website/components/sections/BuyersFeaturesSection').then(mod => mod.default),
  {
    ssr: true,
    loading: () => <div className="h-60 bg-gray-50 animate-pulse rounded-lg"></div>
  }
);

const TestimonialsSection = dynamic(
  () => import('@/src/features/website/components/sections/TestimonialsSection').then(mod => mod.default),
  {
    ssr: true,
    loading: () => <div className="h-60 bg-gray-50 animate-pulse rounded-lg"></div>
  }
);

const OnboardingSection = dynamic(
  () => import('@/src/features/website/components/sections/OnboardingSection').then(mod => mod.default),
  {
    ssr: true,
    loading: () => <div className="h-60 bg-gray-50 animate-pulse rounded-lg"></div>
  }
);

export default function HomeClient() {
  return (
    <main>
      <HeroSection />
      <InfoSection />
      <SellersFeaturesSection />
      <BuyersFeaturesSection />
      <TestimonialsSection />
      <OnboardingSection />
    </main>
  );
}