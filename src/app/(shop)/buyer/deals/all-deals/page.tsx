import type { Metadata } from "next";

import { AllDeals } from "@/src/features/buyer-deals";
import { BargainSection } from "@/src/features/marketplace-catalog/components/sections/BargainSection";

export const metadata: Metadata = {
  title: "All Deals",
  description: "Browse all available deals and bargains on Commerce Central.",
};

export default function AllDealsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-bold tracking-tight lg:text-2xl">
          All Deals
        </h2>
        <p className="text-muted-foreground text-sm lg:text-base">
          Browse and manage all available deals and opportunities.
        </p>
      </div>

      <div className="space-y-4 lg:space-y-6">
        <AllDeals />
        <BargainSection />
      </div>
    </div>
  );
}
