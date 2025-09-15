import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";

import "@aws-amplify/ui-react/styles.css";

import { BreadcrumbSchema } from "@/src/components/BreadcrumbSchema";
import { ErrorBoundary } from "@/src/components/ErrorBoundary";
import { getOrganizationSchema, getWebsiteSchema } from "@/src/utils/metadata";

import { LinkedInInsight } from "../components/analytics/LinkedInInsight";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s",
    default:
      "Buy & Sell Surplus Inventory | Commerce Central Liquidation Platform",
  },
  description:
    "Buy and sell surplus inventory through trusted B2B liquidation auctions on Commerce Central. Verified sellers, clean manifests, and fast processing.",
  keywords:
    "surplus inventory, B2B marketplace, wholesale lots, excess inventory, Commerce Central, retail surplus, liquidation, trusted buyers, trusted sellers,Wholesale Liquidation, Liquidation Auction",
  metadataBase: new URL("https://www.commercecentral.io"),
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/commerce_central_logo.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png", // Prefer PNG for Apple devices (create this file if needed)
  },
  openGraph: {
    title:
      "Buy & Sell Surplus Inventory | Commerce Central Liquidation Platform",
    description:
      "Buy and sell surplus inventory through trusted B2B liquidation auctions on Commerce Central. Verified sellers, clean manifests, and fast processing.",
    url: "https://www.commercecentral.io",
    siteName: "Commerce Central",
    images: [
      {
        url: "/CC_opengraph.png",
        width: 500,
        height: 500,
        alt: "Commerce Central Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Buy & Sell Surplus Inventory | Commerce Central Liquidation Platform",
    description:
      "Buy and sell surplus inventory through trusted B2B liquidation auctions on Commerce Central. Verified sellers, clean manifests, and fast processing.",
    images: ["/CC_opengraph.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "VstZpIvk8ZtH9QHwmmnQnb9KeTY_wCTnT_WrbzAAjsc",
  },
  alternates: {
    canonical: "https://www.commercecentral.io",
  },
};

// This is a Server Component by default

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Performance optimizations - preconnect to critical domains */}
        <link
          crossOrigin="anonymous"
          href="https://images.unsplash.com"
          rel="preconnect"
        />
        <link href="https://images.unsplash.com" rel="dns-prefetch" />
        <link
          crossOrigin="anonymous"
          href="https://www.commercecentral.io"
          rel="preconnect"
        />
        <link href="https://www.commercecentral.io" rel="dns-prefetch" />
        <link href="/favicon.ico" rel="icon" type="image/x-icon" />

        {/* Theme color for mobile browsers */}
        <meta content="#102D21" name="theme-color" />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getOrganizationSchema()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getWebsiteSchema()),
          }}
        />
        <BreadcrumbSchema />

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-S3VL5X0CSQ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-S3VL5X0CSQ');
          `}
        </Script>

        <Script id="reddit-pixel" strategy="afterInteractive">
          {`
            !function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js",t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}(window,document);rdt('init','a2_gzm0k495zr8s');rdt('track', 'PageVisit');
          `}
        </Script>
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-xs">
                <div className="flex flex-col items-center">
                  <div className="relative mb-4 h-16 w-16">
                    <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
                    <div className="border-t-primary absolute inset-0 animate-spin rounded-full border-4 border-r-transparent border-b-transparent border-l-transparent" />
                  </div>
                </div>
              </div>
            }
          >
            {children}
          </Suspense>
        </ErrorBoundary>
        {/* LinkedIn Insights */}
        {/* <LinkedInInsight /> */}
      </body>
    </html>
  );
}
