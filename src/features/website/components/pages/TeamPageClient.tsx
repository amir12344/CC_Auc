'use client';

import dynamic from 'next/dynamic';

// Dynamically import the TeamSection component
const TeamSection = dynamic(
  () => import("@/src/features/website/components/sections/TeamSection"),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-32 w-32 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-8 w-64 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    ),
    ssr: true
  }
);

export default function TeamPageClient() {
  return <TeamSection />;
}

