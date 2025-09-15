import type { Metadata } from "next";

import SellerBlogPageClient from "./page-client";

// SEO metadata for the seller blog page
export const metadata: Metadata = {
  title: "Seller Insights | Commerce Central Blog",
  description:
    "Industry insights, best practices, and strategic advice for brands and surplus inventory sellers. Learn how to optimize excess inventory management and recovery strategies.",
  alternates: {
    canonical: "https://www.commercecentral.io/website/blog/seller",
  },
  openGraph: {
    url: "https://www.commercecentral.io/website/blog/seller",
    title: "Seller Insights | Commerce Central Blog",
    description:
      "Industry insights and best practices for brands and surplus inventory sellers. Learn how to optimize excess inventory management and recovery strategies.",
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
    title: "Seller Insights | Commerce Central Blog",
    description:
      "Industry insights and best practices for brands and surplus inventory sellers. Learn how to optimize excess inventory management and recovery strategies.",
    images: ["/CC_opengraph.png"],
  },
};

// Server Component wrapper that renders the client component
export default function SellerBlogPage() {
  return <SellerBlogPageClient />;
}
