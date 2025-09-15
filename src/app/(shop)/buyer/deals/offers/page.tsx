import type { Metadata } from "next";

import { Offers } from "@/src/features/buyer-deals";

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
          response from sellers or requiring your review.
        </p>
      </div>

      <Offers />
    </div>
  );
}
