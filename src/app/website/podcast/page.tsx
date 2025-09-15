import type { Metadata } from "next";

import PodcastPageClient from "./page-client";

// SEO metadata for the podcast page
export const metadata: Metadata = {
  title: "Commerce Central Podcast | Expert Talks on ReCommerce",
  description:
    "Listen to the Commerce Central podcast where we discuss industry trends, insights, and interviews with experts in the commerce space.",
  alternates: {
    canonical: "https://www.commercecentral.io/website/podcast",
  },
  openGraph: {
    url: "https://www.commercecentral.io/website/podcast",
    title: "Commerce Central Podcast | Expert Talks on ReCommerce",
    description:
      "Tune in to our podcast for the latest discussions on commerce trends, surplus inventory management, and interviews with industry leaders.",
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
    title: "Commerce Central Podcast | Expert Talks on ReCommerce",
    description:
      "Tune in to our podcast for the latest discussions on commerce trends, surplus inventory management, and interviews with industry leaders.",
    images: ["/CC_opengraph.png"],
  },
};

// Server Component wrapper that renders the client component
export default function PodcastPage() {
  return <PodcastPageClient />;
}
