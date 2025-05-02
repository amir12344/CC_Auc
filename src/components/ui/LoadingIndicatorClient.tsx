'use client';

import dynamic from 'next/dynamic';

// Dynamically import the loading indicator to avoid SSR issues
const LoadingIndicator = dynamic(
  () => import('./LoadingIndicator').then(mod => mod.default),
  { ssr: true } // Loading indicator doesn't need SSR
);

/**
 * Client-side wrapper for the loading indicator
 * This ensures the loading indicator only runs on the client
 */
export const LoadingIndicatorClient = () => {
  return <LoadingIndicator />;
};