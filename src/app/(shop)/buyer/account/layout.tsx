import type { Metadata } from "next";

import { DynamicBreadcrumb } from "@/src/components/ui/DynamicBreadcrumb";

export const metadata: Metadata = {
  title: {
    template: "%s | Account - Commerce Central",
    default: "Account - Commerce Central",
  },
};

interface AccountLayoutProps {
  children: React.ReactNode;
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Breadcrumb Navigation - Similar to deals pages */}
      <div className="border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-8xl mx-auto px-4 py-3 sm:px-6 md:py-4 lg:px-8">
          <DynamicBreadcrumb />
        </div>
      </div>

      <div className="space-y-6">{children}</div>
    </div>
  );
}
