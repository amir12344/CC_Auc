"use client";

import dynamic from "next/dynamic";

// Client island: lazy-init offer cart on marketplace pages to keep SSR bundle smaller
const OfferCartInitializer = dynamic(
  () =>
    import(
      "@/src/features/offer-management/components/OfferCartInitializer"
    ).then((m) => m.OfferCartInitializer),
  { ssr: false }
);

export function CartInitIsland() {
  return <OfferCartInitializer />;
}
