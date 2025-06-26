'use client';

import MainLayout from '@/src/components/layout/MainLayout';
import { ClientProviders } from '@/src/components/providers/ClientProviders';

interface BuyerLayoutProps {
  children: React.ReactNode;
}

export default function BuyerLayout({ children }: BuyerLayoutProps) {
  return (
    <ClientProviders>
      <MainLayout>
        {children}
      </MainLayout>
    </ClientProviders>
  );
} 