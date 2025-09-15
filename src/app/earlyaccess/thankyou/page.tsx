import type { Metadata } from "next";

import ThankYouClient from "./page-client";

// SEO metadata for the thank you page
export const metadata: Metadata = {
  title: "Thank You - Commerce Central",
  description:
    "Thank you for registering for early access to Commerce Central - the premier surplus inventory marketplace.",
  openGraph: {
    title: "Commerce Central - Registration Confirmed",
    description:
      "Thank you for your interest in Commerce Central. We'll be in touch soon!",
    images: [
      {
        url: "https://www.commercecentral.io",
        width: 1200,
        height: 630,
        alt: "Commerce Central Early Access",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Commerce Central - Registration Confirmed",
    description:
      "Thank you for your interest in Commerce Central. We'll be in touch soon!",
    images: ["https://www.commercecentral.io"],
  },
};

// Server Component wrapper that renders the client component
export default function Page() {
  return <ThankYouClient />;
}
