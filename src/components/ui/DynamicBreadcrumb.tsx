"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Fragment } from "react";

import { HomeIcon, ShoppingBag } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/src/components/ui/breadcrumb";

export interface BreadcrumbItemProps {
  label: string;
  href: string;
  current?: boolean;
}

interface DynamicBreadcrumbProps {
  items?: BreadcrumbItemProps[];
  homeLabel?: string;
  showHomeIcon?: boolean;
  className?: string;
  productTitle?: string; // Optional product title for product pages
}

/**
 * Render breadcrumb link content with appropriate icons
 */
function renderBreadcrumbContent(
  item: BreadcrumbItemProps,
  index: number,
  showHomeIcon: boolean
) {
  if (index === 0 && showHomeIcon) {
    return (
      <span className="flex items-center">
        <HomeIcon className="mr-1 h-3 w-3" />
        {item.label}
      </span>
    );
  }

  if (item.label === "My Deals") {
    return (
      <span className="flex items-center">
        <ShoppingBag className="mr-1 h-3 w-3" />
        {item.label}
      </span>
    );
  }

  return item.label;
}

/**
 * Dynamic breadcrumb component that can be used throughout the application
 * Can either auto-generate breadcrumbs from the current path or use provided items
 */
export function DynamicBreadcrumb({
  items,
  homeLabel = "Home",
  showHomeIcon = true,
  className = "",
  productTitle,
}: DynamicBreadcrumbProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // If no items are provided, generate them from the current path
  const breadcrumbItems =
    items ||
    generateBreadcrumbItems(pathname, homeLabel, productTitle, searchParams);

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <Fragment key={`${item.href}-${index}`}>
            <BreadcrumbItem>
              {item.current ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>
                    {renderBreadcrumbContent(item, index, showHomeIcon)}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

/**
 * Handle buyer deals breadcrumb generation
 */
function generateBuyerDealsBreadcrumbs(
  pathname: string,
  paths: string[]
): BreadcrumbItemProps[] {
  const items: BreadcrumbItemProps[] = [];

  // Add Marketplace first, then My Deals
  items.push({ label: "Home", href: "/marketplace" });
  items.push({ label: "My Deals", href: "/buyer/deals" });

  // Find the deals segment
  const dealsIndex = paths.indexOf("deals");
  if (dealsIndex !== -1 && dealsIndex < paths.length - 1) {
    // The segment after 'deals' is the section name
    const sectionPath = paths[dealsIndex + 1];
    const sectionLabel = formatBreadcrumbLabel(sectionPath);
    // The current full path to the section
    const sectionHref = `/buyer/deals/${sectionPath}`;

    // Check if we are exactly on the deals root or a sub-section
    if (paths.length === dealsIndex + 1) {
      // e.g. /buyer/deals
      if (items.length > 0) {
        const lastItem = items.at(-1);
        if (lastItem) {
          lastItem.current = true;
        }
      }
    } else {
      items.push({
        label: sectionLabel,
        href: sectionHref,
        current: true, // The last part of the buyer/deals path is current
      });
    }
  } else if (items.length > 0) {
    // If only '/buyer/deals', mark 'My Deals' as current
    const lastItem = items.at(-1);
    if (lastItem) {
      lastItem.current = true;
    }
  }

  return items;
}

/**
 * Handle buyer account breadcrumb generation
 */
function generateBuyerAccountBreadcrumbs(
  pathname: string,
  paths: string[]
): BreadcrumbItemProps[] {
  const items: BreadcrumbItemProps[] = [];

  // Add Marketplace first, then Account Settings
  items.push({ label: "Home", href: "/marketplace" });
  items.push({ label: "Account Settings", href: "/buyer/account" });

  // Find the account segment
  const accountIndex = paths.indexOf("account");
  if (accountIndex !== -1 && accountIndex < paths.length - 1) {
    // The segment after 'account' is the section name
    const sectionPath = paths[accountIndex + 1];
    const sectionLabel = formatBreadcrumbLabel(sectionPath);
    // The current full path to the section
    const sectionHref = `/buyer/account/${sectionPath}`;

    items.push({
      label: sectionLabel,
      href: sectionHref,
      current: true,
    });
  } else if (items.length > 0) {
    // If only '/buyer/account', mark 'Account Settings' as current
    const lastItem = items.at(-1);
    if (lastItem) {
      lastItem.current = true;
    }
  }

  return items;
}

/**
 * Handle seller routes breadcrumb generation
 */
function generateSellerBreadcrumbs(
  pathname: string,
  paths: string[]
): BreadcrumbItemProps[] {
  const items: BreadcrumbItemProps[] = [];

  // Parse seller path to get the meaningful section (skip 'seller' segment)
  const sellerPaths = paths.slice(1); // Remove 'seller' segment

  if (sellerPaths.length === 0) {
    // Just /seller - shouldn't happen but handle it
    items.push({
      label: "Dashboard",
      href: "/seller/dashboard",
      current: true,
    });
  } else if (sellerPaths.length === 1) {
    // /seller/dashboard or /seller/listing
    const section = sellerPaths[0];
    if (section === "dashboard") {
      items.push({
        label: "Dashboard",
        href: "/seller/dashboard",
        current: true,
      });
    } else if (section === "listing") {
      items.push({ label: "Listings", href: "/seller/listing", current: true });
    } else {
      items.push({
        label: formatBreadcrumbLabel(section),
        href: `/seller/${section}`,
        current: true,
      });
    }
  } else {
    // /seller/dashboard/listings, /seller/listing/[id], etc.
    const section = sellerPaths[0];
    const subsection = sellerPaths[1];

    if (section === "dashboard") {
      // For /seller/dashboard/listings, show: Dashboard > Listings
      items.push({ label: "Dashboard", href: "/seller/dashboard" });
      if (subsection === "listings") {
        items.push({
          label: "Listings",
          href: "/seller/dashboard/listings",
          current: true,
        });
      } else {
        items.push({
          label: formatBreadcrumbLabel(subsection),
          href: `/seller/dashboard/${subsection}`,
          current: true,
        });
      }
    } else if (section === "listing") {
      // For /seller/listing/[id], show: Dashboard > Listings > [id]
      items.push({ label: "Dashboard", href: "/seller/dashboard" });
      items.push({ label: "Listings", href: "/seller/listing" });
      items.push({
        label: formatBreadcrumbLabel(subsection),
        href: `/seller/listing/${subsection}`,
        current: true,
      });
    } else {
      // Other seller routes - show Dashboard first, then the section name
      items.push({ label: "Dashboard", href: "/seller/dashboard" });
      items.push({
        label: formatBreadcrumbLabel(section),
        href: `/seller/${section}`,
      });
      items.push({
        label: formatBreadcrumbLabel(subsection),
        href: `/seller/${section}/${subsection}`,
        current: true,
      });
    }
  }

  return items;
}

/**
 * Handle collections breadcrumb generation
 */
function generateCollectionsBreadcrumbs(
  pathname: string,
  paths: string[],
  items: BreadcrumbItemProps[],
  searchParams?: URLSearchParams
): void {
  // Skip "Collections" breadcrumb for catalog, auctions, segment, and lots pages
  const skipCollectionsBreadcrumb = [
    "catalog",
    "auctions",
    "segment",
    "lots",
  ].includes(
    paths[1]
  );

  if (!skipCollectionsBreadcrumb) {
    items.push({ label: "Collections", href: "/collections" });
  }

  if (paths.length > 1) {
    const category = paths[1];

    // Special handling for segment pages
    if (category === "segment" && searchParams) {
      try {
        const segmentsParam = searchParams.get("segments");
        if (segmentsParam) {
          const segments = segmentsParam
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          const displaySegments = segments.map((segment) =>
            segment.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
          );

          const title = displaySegments.join(", ");

          items.push({
            label: title,
            href: pathname,
            current: true,
          });
          return;
        }
      } catch (error) {
        // Fallback to default segment handling
      }
    }

    // Category page: /collections/[category]
    items.push({
      label: formatBreadcrumbLabel(category),
      href: `/collections/${category}`,
      current: true,
    });
  } else {
    // Collections overview page
    const lastItem = items.at(-1);
    if (lastItem) {
      lastItem.current = true;
    }
  }
}

/**
 * Handle fallback breadcrumb generation
 */
function generateFallbackBreadcrumbs(
  pathname: string,
  paths: string[],
  items: BreadcrumbItemProps[]
): void {
  let currentPath = "";
  paths.forEach((path, index) => {
    currentPath += `/${path}`;
    items.push({
      label: formatBreadcrumbLabel(path),
      href: currentPath,
      current: index === paths.length - 1,
    });
  });
}

/**
 * Handle marketplace and other routes breadcrumb generation
 */
function generateMarketplaceBreadcrumbs(
  pathname: string,
  paths: string[],
  homeLabel: string,
  productTitle?: string,
  searchParams?: URLSearchParams
): BreadcrumbItemProps[] {
  const items: BreadcrumbItemProps[] = [];

  // Enhanced breadcrumb generation for collections, search, and product pages
  items.push({ label: homeLabel, href: "/marketplace" });

  // Handle collections pages
  if (pathname.startsWith("/collections")) {
    generateCollectionsBreadcrumbs(pathname, paths, items, searchParams);
  }
  // Handle search pages
  else if (pathname.startsWith("/search")) {
    items.push({
      label: "Search",
      href: "/search",
      current: true,
    });
  }
  // Handle marketplace product pages
  else if (pathname.startsWith("/marketplace/product/")) {
    if (productTitle) {
      items.push({ label: productTitle, href: pathname, current: true });
    } else {
      items.push({ label: "Product", href: pathname, current: true });
    }
  }
  // Handle other marketplace pages
  else if (pathname.startsWith("/marketplace")) {
    items.push({
      label: "Home",
      href: "/marketplace",
      current: true,
    });
  }
  // Fallback for other pages (original logic)
  else {
    generateFallbackBreadcrumbs(pathname, paths, items);
  }

  // Handle homepage
  if (items.length === 1 && items[0].href === "/" && pathname === "/") {
    items[0].current = true;
  }

  return items;
}

/**
 * Generate breadcrumb items from a pathname
 */
function generateBreadcrumbItems(
  pathname: string,
  homeLabel: string,
  productTitle?: string,
  searchParams?: URLSearchParams
): BreadcrumbItemProps[] {
  const paths = pathname.split("/").filter(Boolean);

  // Check if we are within the buyer deals context
  if (pathname.startsWith("/buyer/deals")) {
    return generateBuyerDealsBreadcrumbs(pathname, paths);
  }

  // Check if we are within the buyer account context
  if (pathname.startsWith("/buyer/account")) {
    return generateBuyerAccountBreadcrumbs(pathname, paths);
  }

  // Handle buyer wishlist
  if (pathname.startsWith("/buyer/wishlist")) {
    return [
      { label: "Home", href: "/marketplace" },
      { label: "Wishlist", href: "/buyer/wishlist", current: true },
    ];
  }

  // Handle buyer inbox
  if (pathname.startsWith("/buyer/inbox")) {
    return [
      { label: "Home", href: "/marketplace" },
      { label: "Inbox", href: "/buyer/inbox", current: true },
    ];
  }

  // Handle seller routes - exclude "Marketplace" and "Seller" from breadcrumbs
  if (pathname.startsWith("/seller/")) {
    return generateSellerBreadcrumbs(pathname, paths);
  }

  // Handle marketplace and other routes
  return generateMarketplaceBreadcrumbs(
    pathname,
    paths,
    homeLabel,
    productTitle,
    searchParams
  );
}

/**
 * Format a path segment into a readable label
 */
function formatBreadcrumbLabel(path: string): string {
  // Handle special cases
  if (path === "marketplace") {
    return "Marketplace ";
  }
  if (path === "product") {
    return "Product";
  }
  if (path === "collections") {
    return "Collections";
  }
  if (path === "search") {
    return "Search";
  }
  if (path === "preferences") {
    return "Preferences";
  }
  if (path === "all-deals") {
    return "All Deals";
  }
  if (path === "offers") {
    return "Offers";
  }
  if (path === "orders") {
    return "Orders";
  }
  if (path === "messages") {
    return "Messages";
  }
  if (path === "wishlist") {
    return "Wishlist";
  }
  if (path === "inbox") {
    return "Inbox";
  }

  // Handle category-specific formatting
  const categoryMappings: Record<string, string> = {
    electronics: "Electronics",
    furniture: "Furniture",
    "home-goods": "Home Goods",
    clothing: "Clothing",
    books: "Books",
    toys: "Toys",
    sports: "Sports",
    automotive: "Automotive",
    "health-beauty": "Health & Beauty",
    garden: "Garden",
    bargain: "Bargain Deals",
    amazon: "Amazon Returns",
    trending: "Trending",
    featured: "Featured",
  };

  // Check if we have a specific mapping
  if (categoryMappings[path]) {
    return categoryMappings[path];
  }

  // Convert kebab-case or snake_case to Title Case
  return path.replace(/-|_/g, " ").replace(/\b\w/g, (char) => {
    return char.toUpperCase();
  });
}
