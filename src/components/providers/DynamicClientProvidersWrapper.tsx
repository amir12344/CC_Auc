'use client';

import React from 'react';
import { ClientProviders } from './ClientProviders';

// Simple wrapper component for client providers
export const DynamicClientProvidersWrapper = ({ children }: { children: React.ReactNode }) => {
  return <ClientProviders>{children}</ClientProviders>;
}; 