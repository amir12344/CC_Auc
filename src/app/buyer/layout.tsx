import MainLayout from '@/src/components/layout/MainLayout';

interface BuyerLayoutProps {
  children: React.ReactNode;
}

export default function BuyerLayout({ children }: BuyerLayoutProps) {
  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
} 