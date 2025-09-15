import { headers } from "next/headers";

import { generatePageBreadcrumbItems } from "@/src/utils/metadata";

// A mapping of pathnames to their user-friendly titles for breadcrumbs
const breadcrumbNameMap: { [key: string]: string } = {
  "/": "Home",
  "/website/": "Commerce Central",
  "/website/podcast": "Commerce Central Podcast | Expert Talks on ReCommerce",
  "/website/legal": "Legal",
  "/website/buyer": "Buyer",
  "/website/seller": "Seller",
  "/website/blog": "Blog",
  "/website/blog/seller": "Seller Blogs",
  "/website/blog/buyer": "Buyer Blogs",
  "/website/legal/privacy-policy": "Privacy Policy",
  "/website/legal/terms": "Terms of Service",
  "/website/legal/data-processing": "Data Processing",
  "/website/legal/addendum": "Data Processing Addendum",
  "/wholesale-liquidation-platform": "Wholesale Liquidation Platform",
  "/online-liquidation-auctions": "Online Liquidation Auctions",
  "/wholesale-pallet-liquidation": "Wholesale Pallet Liquidation",
};

/**
 * A server component that generates and injects a JSON-LD breadcrumb schema
 * into the <head> of the document. It safely reads the pathname from request
 * headers populated by the middleware.
 */
export const BreadcrumbSchema = async () => {
  // headers() is a dynamic function, but it's safe to use here because
  // the pathname is being read from a header set in the middleware.
  const headersList = await headers();
  const pathname = headersList.get("x-next-pathname") || "";

  // Find the title for the current path. If not found, derive it from the last
  // segment of the URL so that dynamic pages (e.g. /blog/seller/super-post)
  // still receive a meaningful breadcrumb.
  const humanize = (str: string) =>
    str
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

  const segments = pathname.split("/").filter(Boolean);
  const derivedTitle = segments.length
    ? humanize(segments[segments.length - 1])
    : "Page";

  const pageTitle = breadcrumbNameMap[pathname] || derivedTitle;

  // Generate the schema using our utility function
  const schema = {
    "@context": "https://schema.org/",
    "@type": "BreadcrumbList",
    itemListElement: generatePageBreadcrumbItems(pathname, pageTitle),
  } as const;

  return (
    <script
      type="application/ld+json"
      id="breadcrumb-schema"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};
