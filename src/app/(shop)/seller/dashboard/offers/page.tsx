import type { Metadata } from "next";

import AllOffers from "@/src/features/seller-deals/components/AllOffers";

export const metadata: Metadata = {
  title: "Offers",
  description: "Manage your offers and bids on Commerce Central.",
};

export default function OffersPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-bold tracking-tight lg:text-2xl">Offers</h2>
        <p className="text-muted-foreground text-sm lg:text-base">
          Deals that are currently under negotiation, including those awaiting a
          response from Buyer or requiring your review.
        </p>
      </div>

      <AllOffers />
    </div>
  );
}
