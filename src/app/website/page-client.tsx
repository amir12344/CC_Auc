// This is a Client Component for the marketing homepage
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';


import HeroSection from '@/src/features/website/components/sections/HeroSection';

// Used dynamic imports with code splitting
const InfoSection = dynamic(
  () => import('@/src/features/website/components/sections/InfoSection').then(mod => mod.default),
  {
    ssr: false,
    loading: () => <div className="h-40 bg-gray-50 animate-pulse rounded-lg"></div>
  }
);


const SellersFeaturesSection = dynamic(
  () => import('@/src/features/website/components/sections/SellersFeaturesSection').then(mod => mod.default),
  {
    ssr: false,
    loading: () => <div className="h-60 bg-gray-50 animate-pulse rounded-lg"></div>
  }
);

const BuyersFeaturesSection = dynamic(
  () => import('@/src/features/website/components/sections/BuyersFeaturesSection').then(mod => mod.default),
  {
    ssr: false,
    loading: () => <div className="h-60 bg-gray-50 animate-pulse rounded-lg"></div>
  }
);



const TestimonialsSection = dynamic(
  () => import('@/src/features/website/components/sections/TestimonialsSection').then(mod => mod.default),
  {
    ssr: false,
    loading: () => <div className="h-60 bg-gray-50 animate-pulse rounded-lg"></div>
  }
);

const OnboardingSection = dynamic(
  () => import('@/src/features/website/components/sections/OnboardingSection').then(mod => mod.default),
  {
    ssr: false,
    loading: () => <div className="h-60 bg-gray-50 animate-pulse rounded-lg"></div>
  }
);


export default function HomeClient() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    const hasVisited = sessionStorage.getItem('hasVisited');

    if (hasVisited) {
   
      setLoading(false);
    } else {
      
      const timer = setTimeout(() => {
        setLoading(false);
        sessionStorage.setItem('hasVisited', 'true');
      }, 300); 

      return () => clearTimeout(timer);
    }
  }, []);

  // Remove custom loader - we'll use the standardized loading component instead
  if (loading) {
    return null;
  }

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