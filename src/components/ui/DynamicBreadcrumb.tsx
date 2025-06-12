'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/src/components/ui/breadcrumb';
import { HomeIcon, ShoppingBag } from 'lucide-react';

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
 * Dynamic breadcrumb component that can be used throughout the application
 * Can either auto-generate breadcrumbs from the current path or use provided items
 */
export function DynamicBreadcrumb({
  items,
  homeLabel = 'Marketplace',
  showHomeIcon = true,
  className = '',
  productTitle
}: DynamicBreadcrumbProps) {
  const pathname = usePathname();

  // If no items are provided, generate them from the current path
  const breadcrumbItems = items || generateBreadcrumbItems(pathname, homeLabel, productTitle);

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={item.href}>
            <BreadcrumbItem>
              {item.current ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>
                    {index === 0 && showHomeIcon ? (
                      <span className="flex items-center">
                        <HomeIcon className="mr-1 h-3 w-3" />
                        {item.label}
                      </span>
                    ) : item.label === 'My Deals' ? (
                      <span className="flex items-center">
                        <ShoppingBag className="mr-1 h-3 w-3" />
                        {item.label}
                      </span>
                    ) : (
                      item.label
                    )}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

/**
 * Generate breadcrumb items from a pathname
 */
function generateBreadcrumbItems(
  pathname: string,
  homeLabel: string, // homeLabel is kept for prop consistency but won't be used for buyer deals
  productTitle?: string
): BreadcrumbItemProps[] {
  const paths = pathname.split('/').filter(Boolean);
  const items: BreadcrumbItemProps[] = [];

  // Check if we are within the buyer deals context
  if (pathname.startsWith('/buyer/deals')) {
    // Add Marketplace first, then My Deals
    items.push({ label: 'Marketplace', href: '/marketplace' });
    items.push({ label: 'My Deals', href: '/buyer/deals' });

    // Find the deals segment
    const dealsIndex = paths.indexOf('deals');
    if (dealsIndex !== -1 && dealsIndex < paths.length - 1) {
      // The segment after 'deals' is the section name
      const sectionPath = paths[dealsIndex + 1];
      const sectionLabel = formatBreadcrumbLabel(sectionPath);
      // The current full path to the section
      const sectionHref = `/buyer/deals/${sectionPath}`;
      
      // Check if we are exactly on the deals root or a sub-section
      if (paths.length === dealsIndex + 1) { // e.g. /buyer/deals
         if (items.length > 0) items[items.length-1].current = true;
      } else {
        items.push({
          label: sectionLabel,
          href: sectionHref,
          current: true, // The last part of the buyer/deals path is current
        });
      }
    } else if (items.length > 0) {
       // If only '/buyer/deals', mark 'My Deals' as current
       items[items.length-1].current = true;
    }
  }
  // Check if we are within the buyer account context
  else if (pathname.startsWith('/buyer/account')) {
    // Add Marketplace first, then Account Settings
    items.push({ label: 'Marketplace', href: '/marketplace' });
    items.push({ label: 'Account Settings', href: '/buyer/account' });

    // Find the account segment
    const accountIndex = paths.indexOf('account');
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
       items[items.length-1].current = true;
    }
  } else {
    // Enhanced breadcrumb generation for collections, search, and product pages
    items.push({ label: homeLabel, href: '/marketplace' });
    
    // Handle collections pages
    if (pathname.startsWith('/collections')) {
      items.push({ label: 'Collections', href: '/collections' });
      
      if (paths.length > 1) {
        // Category page: /collections/[category]
        const category = paths[1];
        items.push({
          label: formatBreadcrumbLabel(category),
          href: `/collections/${category}`,
          current: true
        });
      } else {
        // Collections overview page
        items[items.length - 1].current = true;
      }
    }
    // Handle search pages
    else if (pathname.startsWith('/search')) {
      items.push({
        label: 'Search',
        href: '/search',
        current: true
      });
    }
    // Handle marketplace product pages
    else if (pathname.startsWith('/marketplace/product/')) {
      if (productTitle) {
        items.push({ label: productTitle, href: pathname, current: true });
      } else {
        items.push({ label: 'Product', href: pathname, current: true });
      }
    }
    // Handle other marketplace pages
    else if (pathname.startsWith('/marketplace')) {
      items.push({
        label: 'Marketplace',
        href: '/marketplace',
        current: true
      });
    }
    // Fallback for other pages (original logic)
    else {
      let currentPath = '';
      paths.forEach((path, index) => {
        currentPath += `/${path}`;
        items.push({
          label: formatBreadcrumbLabel(path),
          href: currentPath,
          current: index === paths.length - 1,
        });
      });
    }
    
    // Handle homepage
    if (items.length === 1 && items[0].href === '/' && pathname === '/') {
      items[0].current = true;
    }
  }
  return items;
}

/**
 * Format a path segment into a readable label
 */
function formatBreadcrumbLabel(path: string): string {
  // Handle special cases
  if (path === 'marketplace') return 'Marketplace';
  if (path === 'product') return 'Product';
  if (path === 'collections') return 'Collections';
  if (path === 'search') return 'Search';
  if (path === 'preferences') return 'Preferences';
  if (path === 'all-deals') return 'All Deals';
  if (path === 'offers') return 'Offers';
  if (path === 'orders') return 'Orders';
  if (path === 'messages') return 'Messages';
  
  // Handle category-specific formatting
  const categoryMappings: Record<string, string> = {
    'electronics': 'Electronics',
    'furniture': 'Furniture',
    'home-goods': 'Home Goods',
    'clothing': 'Clothing',
    'books': 'Books',
    'toys': 'Toys',
    'sports': 'Sports',
    'automotive': 'Automotive',
    'health-beauty': 'Health & Beauty',
    'garden': 'Garden',
    'bargain': 'Bargain Deals',
    'amazon': 'Amazon Returns',
    'trending': 'Trending',
    'featured': 'Featured'
  };
  
  // Check if we have a specific mapping
  if (categoryMappings[path]) {
    return categoryMappings[path];
  }

  // Convert kebab-case or snake_case to Title Case
  return path
    .replace(/-|_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}
