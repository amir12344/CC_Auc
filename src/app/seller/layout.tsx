import { SellerProtectedRoute } from '@/src/components/auth/ProtectedRoute';
import { AuthRequiredLayout } from '@/src/components/auth/AuthRequiredLayout';
import type { Metadata } from 'next';

// export const metadata: Metadata = {
//   title: {
//     template: '%s | Seller Portal - Commerce Central',
//     default: 'Seller Portal - Commerce Central',
//   },
// };

interface SellerLayoutProps {
  children: React.ReactNode;
}

export default function SellerLayout({ children }: SellerLayoutProps) {
  return (
    <AuthRequiredLayout>
      <SellerProtectedRoute>
        {children}
      </SellerProtectedRoute>
    </AuthRequiredLayout>
  );
} 