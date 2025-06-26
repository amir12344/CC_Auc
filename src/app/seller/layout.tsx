'use client';

import MainLayout from '@/src/components/layout/MainLayout';
import { ClientProviders } from '@/src/components/providers/ClientProviders';

interface SellerLayoutProps {
  children: React.ReactNode;
}

export default function SellerLayout({ children }: SellerLayoutProps) {
  return (
    <ClientProviders>
      <MainLayout>{children}</MainLayout>
    </ClientProviders>
  );
}
