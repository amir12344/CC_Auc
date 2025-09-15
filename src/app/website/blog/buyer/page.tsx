import type { Metadata } from "next";

import BuyerBlogPageClient from "./page-client";

// SEO metadata for the buyer blog page
export const metadata: Metadata = {
  title: "Buyer Resources | Commerce Central Blog",
  description:
    "Expert tips, market insights, and proven strategies for inventory buyers. Learn how to source quality liquidation inventory, avoid scams, and maximize profits.",
  alternates: {
    canonical: "https://www.commercecentral.io/website/blog/buyer",
  },
  openGraph: {
    url: "https://www.commercecentral.io/website/blog/buyer",
    title: "Buyer Resources | Commerce Central Blog",
    description:
      "Expert tips and strategies for inventory buyers. Learn how to source quality liquidation inventory, avoid scams, and maximize profits in surplus inventory buying.",
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
    title: "Buyer Resources | Commerce Central Blog",
    description:
      "Expert tips and strategies for inventory buyers. Learn how to source quality liquidation inventory, avoid scams, and maximize profits.",
    images: ["/CC_opengraph.png"],
  },
};

// Server Component wrapper that renders the client component
export default function BuyerBlogPage() {
  return <BuyerBlogPageClient />;
}
