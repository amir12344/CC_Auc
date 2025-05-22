import type { Metadata } from "next";
import "./globals.css";
import { ErrorBoundary } from "@/src/components/ErrorBoundary";
import { LoadingIndicatorClient } from "@/src/components/ui/LoadingIndicatorClient";
import { DynamicClientProvidersWrapper } from "@/src/components/providers/DynamicClientProvidersWrapper";
import { StyleProvider } from "@/src/components/providers/StyleProvider";
import Script from "next/script";
import { Suspense } from "react";
import {
  getOrganizationSchema,
  getWebsiteSchema,
  getPageSchema,
} from "@/src/utils/metadata";
import { LinkedInInsight } from "../components/analytics/LinkedInInsight";


export const metadata: Metadata = {
  title: "Commerce Central - Surplus Inventory Marketplace",
  description: "Browse exclusive surplus inventory from top retailers for resale. Connect with trusted sellers and find premium wholesale lots on our B2B platform.",
  keywords: "surplus inventory, B2B marketplace, wholesale lots, excess inventory, Commerce Central, retail surplus, liquidation, trusted buyers, trusted sellers",
  metadataBase: new URL('https://www.commercecentral.io'),
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/commerce_central_logo.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png', // Prefer PNG for Apple devices (create this file if needed)
  },
  openGraph: {
    title: 'Commerce Central - Premium Surplus Inventory Marketplace',
    description: 'Connect with trusted retailers to access exclusive surplus inventory and wholesale lots for your business.',
    url: 'https://www.commercecentral.io',
    siteName: 'Commerce Central',
    images: [
      {
        url: '/CC_opengraph.png',
        width: 500,
        height: 500,
        alt: 'Commerce Central Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Commerce Central - Surplus Inventory Marketplace',
    description: 'Browse exclusive surplus inventory from top retailers for resale.',
    images: ['/CC_opengraph.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
  },
  alternates: {
    canonical: 'https://www.commercecentral.io',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Performance optimizations - preconnect to critical domains */}
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://www.commercecentral.io" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.commercecentral.io" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon"></link>

        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#102D21" />

        {/* JSON-LD Structured Data */}
        <Script type="application/ld+json" id="ld-org" strategy="beforeInteractive">
          {JSON.stringify(getOrganizationSchema())}
        </Script>
        <Script type="application/ld+json" id="ld-website" strategy="beforeInteractive">
          {JSON.stringify(getWebsiteSchema())}
        </Script>
        <Script type="application/ld+json" id="ld-page" strategy="beforeInteractive">
          {JSON.stringify(getPageSchema("Home"))}
        </Script>

        <Script id="reddit-pixel" strategy="afterInteractive">
          {`
            !function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js",t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}(window,document);rdt('init','a2_gzm0k495zr8s');rdt('track', 'PageVisit');
          `}
        </Script>
      </head>
      <body suppressHydrationWarning>
        <StyleProvider />
        <ErrorBoundary>
          <DynamicClientProvidersWrapper>
            <Suspense fallback={null}>
              <LoadingIndicatorClient />
            </Suspense>
            <Suspense fallback={
              <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-xs z-50">
                <div className="flex flex-col items-center">
                  <div className="relative w-16 h-16 mb-4">
                    <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                  </div>
                </div>
              </div>
            }>
              {children}
            </Suspense>
          </DynamicClientProvidersWrapper>
        </ErrorBoundary>
        {/* LinkedIn Insights */}
        <LinkedInInsight />
      </body>
    </html>
  );
}