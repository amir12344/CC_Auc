import type { Metadata } from "next";

import { DynamicBreadcrumb } from "@/src/components/ui/DynamicBreadcrumb";
import { BuyerNavigation } from "@/src/features/buyer-deals";
import { SellerNavigation } from "@/src/features/seller-deals/components/navigation/SellerNavigation";

export const metadata: Metadata = {
  title: {
    template: "%s | My Deals - Commerce Central",
    default: "My Deals - Commerce Central",
  },
};

interface DealsLayoutProps {
  children: React.ReactNode;
}

export default function DealsLayout({ children }: DealsLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Breadcrumb Navigation - Similar to search and product pages */}
      <div className="border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-8xl mx-auto px-4 py-3 sm:px-6 md:py-4 lg:px-8">
          <DynamicBreadcrumb />
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-2 py-6 md:px-6 lg:py-8">
        <div className="space-y-6">
          <div className="px-2">
            <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
              My Deals
            </h1>
          </div>

          <div className="flex flex-col gap-2 md:gap-6 lg:flex-row lg:gap-8">
            <aside className="w-full shrink-0 lg:w-64 xl:w-72">
              <SellerNavigation />
            </aside>
            <main className="min-w-0 flex-1">
              <div className="p-2 lg:p-6">{children}</div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
