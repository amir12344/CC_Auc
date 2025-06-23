import MainLayout from '@/src/components/layout/MainLayout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Seller Portal - Commerce Central',
    default: 'Seller Portal - Commerce Central',
  },
};

interface SellerLayoutProps {
  children: React.ReactNode;
}

export default function SellerLayout({ children }: SellerLayoutProps) {
  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
} 