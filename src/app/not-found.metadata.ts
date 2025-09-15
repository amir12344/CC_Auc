import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Not Found | Commerce Central",
  description: "This page couldn't be found",
  alternates: {
    canonical: "https://www.commercecentral.io/404",
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
  openGraph: {
    title: "Page Not Found",
    images: [
      {
        url: "/CC_opengraph.png",
        width: 500,
        height: 500,
        alt: "Commerce Central 404",
      },
    ],
  },
};
