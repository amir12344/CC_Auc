import { BuyerNavigation } from "@/src/features/buyer-deals";
import { DynamicBreadcrumb } from '@/src/components/ui/DynamicBreadcrumb';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | My Deals - Commerce Central',
    default: 'My Deals - Commerce Central',
  },
};

interface DealsLayoutProps {
  children: React.ReactNode;
}

export default function DealsLayout({ children }: DealsLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Breadcrumb Navigation - Similar to search and product pages */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
          <DynamicBreadcrumb />
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-6 py-6 lg:py-8">
        <div className="space-y-6">
          <div className="px-2">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">My Deals</h1>
            <p className="text-sm lg:text-base text-muted-foreground mt-1">
              Manage your purchases, track orders, and browse deals.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            <aside className="w-full lg:w-64 xl:w-72 shrink-0">
              <BuyerNavigation />
            </aside>
            <main className="flex-1 min-w-0">
              <div className="p-4 lg:p-6">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
} 