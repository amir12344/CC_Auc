import type { Metadata } from "next";
import "./globals.css";
import { GeistSans } from 'geist/font/sans';
import { ErrorBoundary } from "@/src/components/ErrorBoundary";
import { LoadingIndicatorClient } from "@/src/components/ui/LoadingIndicatorClient";
import { DynamicClientProvidersWrapper } from "@/src/components/providers/DynamicClientProvidersWrapper";
import { StyleProvider } from "@/src/components/providers/StyleProvider";
import Script from "next/script";
import { Suspense } from "react";

// Configure Geist font with display swap
const geist = GeistSans;

export const metadata: Metadata = {
  title: "Commerce Central - Surplus Inventory Marketplace",
  description: "Browse exclusive surplus inventory from top retailers for resale. Connect with trusted sellers and find premium wholesale lots on our B2B platform.",
  keywords: "surplus inventory, B2B marketplace, wholesale lots, excess inventory, Commerce Central, retail surplus, liquidation, trusted buyers, trusted sellers",
  metadataBase: new URL('https://www.commercecentral.io'),
  icons: {
    icon: '/commerce_central_logo.svg',
    shortcut: '/commerce_central_logo.svg',
    apple: '/commerce_central_logo.svg',
  },
  openGraph: {
    title: 'Commerce Central - Premium Surplus Inventory Marketplace',
    description: 'Connect with trusted retailers to access exclusive surplus inventory and wholesale lots for your business.',
    url: 'https://www.commercecentral.io',
    siteName: 'Commerce Central',
    images: [
      {
        url: '/images/CommerceCentral_LogoV2_dark.png',
        width: 1200,
        height: 630,
        alt: 'Commerce Central Marketplace',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Commerce Central - Surplus Inventory Marketplace',
    description: 'Browse exclusive surplus inventory from top retailers for resale.',
    images: ['/images/og-image.jpg'],
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
    canonical: 'www.commercecentral.io',
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
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://www.commercecentral.io" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.commercecentral.io" />

        {/* Explicit Favicon Links (in addition to metadata) */}
        <link rel="icon" href="/commerce_central_logo.svg" type="image/svg+xml" sizes="any" />
        <link rel="apple-touch-icon" href="/commerce_central_logo.svg" />
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
        {/* LinkedIn Insight Tag */}
        {/* Commented out LinkedIn script for debugging */}

        <Script id="linkedin-insight-tag" strategy="afterInteractive">
          {`
            _linkedin_partner_id = "7173748";
            window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
            window._linkedin_data_partner_ids.push(_linkedin_partner_id);
            (function(l) {
              if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
              window.lintrk.q=[]}
              var s = document.getElementsByTagName("script")[0];
              var b = document.createElement("script");
              b.type = "text/javascript";b.async = true;
              b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
              s.parentNode.insertBefore(b, s);
            })(window.lintrk);
          `}
        </Script>
        <noscript>
          <img height="1" width="1" style={{ display: "none" }} alt="" src="https://px.ads.linkedin.com/collect/?pid=7173748&fmt=gif" />
        </noscript>

        {/* End LinkedIn Insight Tag */}
      </body>
    </html>
  );
}
