import PageSkeleton from '@/src/components/ui/PageSkeleton';
import MainLayout from '@/src/components/layout/MainLayout';

export default function SellerListingsLoading() {
  return (
    <MainLayout>
      <PageSkeleton type="default" />
    </MainLayout>
  );
}
