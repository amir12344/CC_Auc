import type { Metadata } from "next";

import BuyerPageClient from "./page-client";

// SEO metadata for the buyer page
export const metadata: Metadata = {
  title: "Buy Surplus & Returned Pallets Online | Commerce Central",
  description:
    "Shop verified surplus pallets with full manifests on Commerce Central. No junk, no surprises — just clean inventory from trusted sellers.",
  alternates: {
    canonical: "https://www.commercecentral.io/website/buyer",
  },
  openGraph: {
    url: "https://www.commercecentral.io/website/buyer",
    title: "Buy Surplus & Returned Pallets Online | Commerce Central",
    description:
      "Shop verified surplus pallets with full manifests on Commerce Central. No junk, no surprises — just clean inventory from trusted sellers.",
    images: [
      {
        url: "/CC_opengraph.png",
        width: 500,
        height: 500,
        alt: "Commerce Central Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Buy Surplus & Returned Pallets Online | Commerce Central",
    description:
      "Shop verified surplus pallets with full manifests on Commerce Central. No junk, no surprises — just clean inventory from trusted sellers.",
    images: ["/CC_opengraph.png"],
  },
};

// Server Component wrapper that renders the client component
export default function BuyerPage() {
  return <BuyerPageClient />;
}
