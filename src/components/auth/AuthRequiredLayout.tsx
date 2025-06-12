'use client';

import React from 'react';
import ConfigureAmplifyClientSide from '@/src/app/ConfigureAmplifyClientSide';

interface AuthRequiredLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout component that configures Amplify for authentication-required pages
 * Use this to wrap any content that needs authentication services
 */
export function AuthRequiredLayout({ children }: AuthRequiredLayoutProps) {
  return (
    <>
      <ConfigureAmplifyClientSide />
      {children}
    </>
  );
} 