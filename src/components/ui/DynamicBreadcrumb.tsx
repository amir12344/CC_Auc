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
import { HomeIcon } from 'lucide-react';

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
  homeLabel = 'Home',
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
  homeLabel: string,
  productTitle?: string
): BreadcrumbItemProps[] {
  const paths = pathname.split('/').filter(Boolean);

  // Start with home
  const items: BreadcrumbItemProps[] = [
    { label: homeLabel, href: '/' }
  ];

  // Special case for product pages - we'll skip the 'product' segment
  const isProductPage = paths.length >= 2 && paths[0] === 'marketplace' && paths[1] === 'product';

  // Build up the breadcrumb items based on the path
  let currentPath = '';

  paths.forEach((path, index) => {
    currentPath += `/${path}`;

    // Skip the 'product' segment in product pages
    if (isProductPage && path === 'product') {
      return;
    }

    // Format the label to be more readable
    let label = formatBreadcrumbLabel(path);

    // For product ID paths, use the product title if provided
    if (isProductPage && index === 2 && productTitle) {
      label = productTitle;
    }

    items.push({
      label,
      href: currentPath,
      current: index === paths.length - 1
    });
  });

  return items;
}

/**
 * Format a path segment into a readable label
 */
function formatBreadcrumbLabel(path: string): string {
  // Handle special cases
  if (path === 'marketplace') return 'Marketplace';
  if (path === 'product') return 'Product';

  // Convert kebab-case or snake_case to Title Case
  return path
    .replace(/-|_/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase());
}
