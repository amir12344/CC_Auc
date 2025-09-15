import type { Metadata, Viewport } from "next";

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
  "@context": string;
  "@type": string;
  [key: string]: string | number | boolean | object | undefined;
}

// Default metadata for the site
export const defaultMetadata: Metadata = {
  title: "Buy & Sell Surplus Inventory | Commerce Central Liquidation Platform",
  description:
    "Buy and sell surplus inventory through trusted B2B liquidation auctions on Commerce Central. Verified sellers, clean manifests, and fast processing.",
  keywords:
    "inventory management, AI pricing, ecommerce optimization, surplus inventory, B2B marketplace, wholesale lots, trusted sellers, liquidation platform, wholesale lots, excess inventory, Commerce Central, retail surplus, liquidation, trusted buyers, trusted sellers,Wholesale Liquidation, Liquidation Auction",
  authors: [{ name: "Commerce Central Team" }],
  creator: "Commerce Central",
  publisher: "Commerce Central",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://www.commercecentral.io"),
  robots: {
    index: true,
    follow: true,
    nocache: false,
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
    other: {
      me: ["admin@commerce-central.com"],
    },
  },
  alternates: {
    canonical: "https://www.commercecentral.io",
    languages: {
      "en-US": "https://www.commercecentral.io",
    },
  },
  applicationName: "Commerce Central",
  referrer: "origin-when-cross-origin",
};

// Default viewport configuration
export const defaultViewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// Open Graph metadata
export const defaultOpenGraph: OpenGraph = {
  type: "website",
  locale: "en_US",
  url: "https://www.commercecentral.io",
  siteName: "Commerce Central",
  images: [
    {
      url: "https://www.commercecentral.io/CC_opengraph.png",
      width: 1200,
      height: 630,
      alt: "Commerce Central - Maximize Your Inventory Value",
    },
  ],
  title: "Buy & Sell Surplus Inventory | Commerce Central Liquidation Platform",
  description:
    "Buy and sell surplus inventory through trusted B2B liquidation auctions on Commerce Central. Verified sellers, clean manifests, and fast processing.",
};

// Twitter metadata
export const defaultTwitter: Twitter = {
  card: "summary_large_image",
  site: "@CommerceCentral",
  creator: "@CommerceCentral",
  images: ["https://www.commercecentral.io/CC_opengraph.png"],
};

// Generate structured data for the organization
export const getOrganizationSchema = (): SchemaOrg => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Commerce Central",
    url: "https://www.commercecentral.io/",
    logo: "https://www.commercecentral.io/commerce_central_logo.svg",
    sameAs: ["https://www.linkedin.com/company/commercecentral"],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["English"],
    },
  };
};

// Generate structured data for the website
export const getWebsiteSchema = (): SchemaOrg => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Commerce Central",
    url: "https://www.commercecentral.io",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://www.commercecentral.io/search?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };
};

// Generate structured data for a specific page
export const getPageSchema = (
  pageName: string,
  pageType = "WebPage",
  pageDescription = ""
): SchemaOrg => {
  return {
    "@context": "https://schema.org",
    "@type": pageType,
    name: pageName,
    description: pageDescription || (defaultMetadata.description as string),
    url: `https://www.commercecentral.io/${pageName.toLowerCase().replace(/\s+/g, "-")}`,
  };
};

// Generate breadcrumb structured data
export const getBreadcrumbSchema = (
  breadcrumbs: Array<{ name: string; url: string }>
): SchemaOrg => {
  return {
    "@context": "https://schema.org/",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
};

// Generate page-specific breadcrumb schema based on the current page path
// Generate page-specific breadcrumb items based on the current page path
export const generatePageBreadcrumbItems = (
  pagePath: string,
  pageTitle: string
): { "@type": string; position: number; name: string; item: string }[] => {
  const baseUrl = "https://www.commercecentral.io";
  const breadcrumbs = [{ name: "Home", url: baseUrl }];

  // Split the path and build breadcrumbs progressively
  const pathSegments = pagePath.split("/").filter((segment) => segment !== "");
  let currentPath = baseUrl;

  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    // Convert segment to readable name
    // Convert segment like "some-blog-post" to "Some Blog Post"
    const humanize = (str: string) =>
      str
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
    let segmentName = humanize(segment);
    // Handle specific path mappings
    switch (segment) {
      case "website":
        return; // Skip 'website' segment as it's not user-facing
      case "blog":
        // Check if this is in a blog context to provide more specific naming
        if (pathSegments.includes("buyer")) {
          segmentName = "Blog";
        } else if (pathSegments.includes("seller")) {
          segmentName = "Blog";
        } else {
          segmentName = "Blog";
        }
        break;
      case "buyer":
        // Check if this is in a blog context
        if (pathSegments.includes("blog")) {
          segmentName = "Buyer Blogs";
        } else {
          segmentName = "Buyer";
        }
        break;
      case "seller":
        // Check if this is in a blog context
        if (pathSegments.includes("blog")) {
          segmentName = "Seller Blogs";
        } else {
          segmentName = "Seller";
        }
        break;
      case "podcast":
        segmentName = "Podcast";
        break;
      case "legal":
        segmentName = "Legal";
        break;
      case "privacy-policy":
        segmentName = "Privacy Policy";
        break;
      case "terms":
        segmentName = "Terms & Conditions";
        break;
      case "data-processing":
        segmentName = "Data Processing";
        break;
      case "addendum":
        segmentName = "Data Processing Addendum";
        break;
      case "online-liquidation-auctions":
        segmentName = "Online Liquidation Auctions";
        break;
      case "wholesale-liquidation-platform":
        segmentName = "Wholesale Liquidation Platform";
        break;
      case "wholesale-pallet-liquidation":
        segmentName = "Wholesale Pallet Liquidation";
        break;
      default:
        // Keep the default capitalized segment name for unmatched cases
        break;
    }

    // For the last segment, use the provided page title if available
    if (index === pathSegments.length - 1 && pageTitle) {
      segmentName = pageTitle;
    }

    breadcrumbs.push({ name: segmentName, url: currentPath });
  });

  return breadcrumbs.map((crumb, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: crumb.name,
    item: crumb.url,
  }));
};

// Predefined breadcrumbs for main pages (DEPRECATED - use generatePageBreadcrumb instead)
export const getMainPagesBreadcrumb = (): SchemaOrg => {
  const breadcrumbs = [
    { name: "Commerce Central", url: "https://www.commercecentral.io/" },
    { name: "Seller", url: "https://www.commercecentral.io/website/seller" },
    { name: "Buyer", url: "https://www.commercecentral.io/website/buyer" },
    { name: "Team", url: "https://www.commercecentral.io/website/team" },
    {
      name: "Buyer Blogs",
      url: "https://www.commercecentral.io/website/blog/buyer",
    },
    {
      name: "Seller Blogs",
      url: "https://www.commercecentral.io/website/blog/seller",
    },
  ];

  return getBreadcrumbSchema(breadcrumbs);
};
