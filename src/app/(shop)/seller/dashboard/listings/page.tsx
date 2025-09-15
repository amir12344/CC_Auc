import type { Metadata } from "next";

import AllListings from "@/src/features/seller-deals/components/AllListings";

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
        <AllListings />
      </div>
    </div>
  );
}
