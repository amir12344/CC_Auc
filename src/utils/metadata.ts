import type { Metadata, Viewport } from 'next';

// Define OpenGraph and Twitter types
interface OpenGraph {
  type?: string;
  locale?: string;
  url?: string;
  siteName?: string;
  images?: Array<{
    url: string;
    width?: number;
    height?: number;
    alt?: string;
  }>;
  title?: string;
  description?: string;
}

interface Twitter {
  card?: string;
  site?: string;
  creator?: string;
  images?: string[];
}

// Types for structured data
interface SchemaOrg {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

// Default metadata for the site
export const defaultMetadata: Metadata = {
  title: 'Commerce Central - Maximize Your Inventory Value',
  description: 'Commerce Central helps businesses maximize revenue from inventory with AI-powered insights, smart pricing strategies, and optimal selling channels.',
  keywords: 'inventory management, AI pricing, ecommerce optimization, surplus inventory, B2B marketplace, wholesale lots, trusted sellers, liquidation platform',
  authors: [{ name: 'Commerce Central Team' }],
  creator: 'Commerce Central',
  publisher: 'Commerce Central',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.commercecentral.io'),
  robots: {
    index: true,
    follow: true,
    nocache: false,
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
    yandex: 'yandex-verification-code',
    yahoo: 'yahoo-verification-code',
    other: {
      me: ['admin@commerce-central.com'],
    },
  },
  alternates: {
    canonical: 'https://www.commercecentral.io',
    languages: {
      'en-US': 'https://www.commercecentral.io',
    },
  },
  applicationName: 'Commerce Central',
  referrer: 'origin-when-cross-origin',
};

// Default viewport configuration
export const defaultViewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

// Open Graph metadata
export const defaultOpenGraph: OpenGraph = {
  type: 'website',
  locale: 'en_US',
  url: 'https://www.commercecentral.io',
  siteName: 'Commerce Central',
  images: [
    {
      url: 'https://www.commercecentral.io',
      width: 1200,
      height: 630,
      alt: 'Commerce Central - Maximize Your Inventory Value',
    },
  ],
  title: 'Commerce Central - The Trusted B2B Surplus Marketplace',
  description: 'Connect with verified partners to unlock your inventory\'s full potential. Join the only private marketplace built for trusted buyers and sellers.',
};

// Twitter metadata
export const defaultTwitter: Twitter = {
  card: 'summary_large_image',
  site: '@CommerceCentral',
  creator: '@CommerceCentral',
  images: ['https://www.commercecentral.io'],
};

// Generate structured data for the organization
export const getOrganizationSchema = (): SchemaOrg => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Commerce Central',
    url: 'https://www.commercecentral.io/',
    logo: 'https://www.commercecentral.io/commerce_central_logo.svg',
    sameAs: [
      'https://www.linkedin.com/company/commercecentral',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['English'],
    },
  };
};

// Generate structured data for the website
export const getWebsiteSchema = (): SchemaOrg => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Commerce Central',
    url: 'https://www.commercecentral.io',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.commercecentral.io/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };
};

// Generate structured data for a specific page
export const getPageSchema = (
  pageName: string,
  pageType: string = 'WebPage',
  pageDescription: string = ''
): SchemaOrg => {
  return {
    '@context': 'https://schema.org',
    '@type': pageType,
    name: pageName,
    description: pageDescription || defaultMetadata.description as string,
    url: `https://www.commercecentral.io/${pageName.toLowerCase().replace(/\s+/g, '-')}`,
  };
};

// Generate breadcrumb structured data
export const getBreadcrumbSchema = (breadcrumbs: Array<{name: string, url: string}>): SchemaOrg => {
  return {
    '@context': 'https://schema.org/',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
};

// Predefined breadcrumbs for main pages
export const getMainPagesBreadcrumb = (): SchemaOrg => {
  const breadcrumbs = [
    { name: 'Commerce Central', url: 'https://www.commercecentral.io/' },
    { name: 'Seller', url: 'https://www.commercecentral.io/website/seller' },
    { name: 'Buyer', url: 'https://www.commercecentral.io/website/buyer' },
    { name: 'Team', url: 'https://www.commercecentral.io/website/team' },
    { name: 'Blog', url: 'https://www.commercecentral.io/website/blog' },
    { name: 'Early Access', url: 'https://www.commercecentral.io/earlyaccess' },
  ];
  
  return getBreadcrumbSchema(breadcrumbs);
};
