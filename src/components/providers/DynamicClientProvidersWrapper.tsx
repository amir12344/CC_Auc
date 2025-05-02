'use client';

import dynamic from 'next/dynamic';
import React from 'react';

// Dynamically import ClientProviders
const ClientProviders = dynamic(
  () => import('./ClientProviders').then((mod) => mod.ClientProviders),
  { ssr: true }
);

// This wrapper component ensures the dynamic import happens within a client boundary
export const DynamicClientProvidersWrapper = ({ children }: { children: React.ReactNode }) => {
  // Render the dynamically imported ClientProviders
  return <ClientProviders>{children}</ClientProviders>;
}; 