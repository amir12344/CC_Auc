"use client";

import dynamic from "next/dynamic";

// Dynamically import the TeamSection component
const TeamSection = dynamic(
  () => import("@/src/features/website/components/sections/TeamSection"),
  {
    loading: () => (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex animate-pulse flex-col items-center">
          <div className="mb-4 h-32 w-32 rounded-full bg-gray-200"></div>
          <div className="mb-2 h-8 w-64 rounded bg-gray-200"></div>
          <div className="h-4 w-48 rounded bg-gray-200"></div>
        </div>
      </div>
    ),
    ssr: true,
  }
);

export default function TeamPageClient() {
  return <TeamSection />;
}
