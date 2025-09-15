import type { Metadata } from "next";
import { Suspense } from "react";

import WebsiteLayout from "./website/layout";
import HomeClient from "./website/page-client";

export const metadata: Metadata = {
  title: "Buy & Sell Surplus Inventory | Commerce Central Liquidation Platform",
  description:
    "Buy and sell surplus inventory through trusted B2B liquidation auctions on Commerce Central. Verified sellers, clean manifests, and fast processing.",
  alternates: {
    canonical: "https://www.commercecentral.io",
  },
  openGraph: {
    url: "https://www.commercecentral.io",
    title:
      "Buy & Sell Surplus Inventory | Commerce Central Liquidation Platform",
    description:
      "Buy and sell surplus inventory through trusted B2B liquidation auctions on Commerce Central. Verified sellers, clean manifests, and fast processing.",
    images: [
      {
        url: "/CC_opengraph.png",
        width: 500,
        height: 500,
        alt: "Commerce Central Homepage",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Buy & Sell Surplus Inventory | Commerce Central Liquidation Platform",
    description:
      "Buy and sell surplus inventory through trusted B2B liquidation auctions on Commerce Central. Verified sellers, clean manifests, and fast processing.",
    images: ["/CC_opengraph.png"],
  },
};

/**
 * Home Page - Server Component
 * Optimized with React.Suspense boundaries while preserving website layout
 * Clean root URL; content is served via rewrite to /website
 */
export default function Home() {
  return (
    <WebsiteLayout>
      <Suspense
        fallback={
          <div className="min-h-[600px] animate-pulse bg-gray-100">
            <div className="min-h-[600px] animate-pulse bg-gray-300" />
          </div>
        }
      >
        <HomeClient />
      </Suspense>
    </WebsiteLayout>
  );
}
