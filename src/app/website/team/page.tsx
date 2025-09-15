import type { Metadata } from "next";

import TeamSection from "@/src/features/website/components/sections/TeamSection";
import { defaultMetadata, defaultOpenGraph } from "@/src/utils/metadata";

// Export metadata for this page
export const metadata: Metadata = {
  ...defaultMetadata,
  title: "Our Team",
  description: "Meet the Commerce Central team.",
  alternates: {
    canonical: "https://www.commercecentral.io/marketplace",
  },
  robots: "noindex, nofollow",
  openGraph: {
    ...defaultOpenGraph,
    url: "https://www.commercecentral.io/marketplace",
    title: "Our Team",
    description: "Meet the Commerce Central team.",
    images: [
      {
        url: "/CC_opengraph.png",
        width: 500,
        height: 500,
        alt: "Commerce Central Logo",
      },
    ],
  },
};

export default function TeamPage() {
  return <TeamSection />;
}
