"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Heart, LayoutDashboard, Package, ShoppingCart } from "lucide-react";

import { cn } from "@/src/lib/utils";

const navigationItems = [
  {
    title: "Overview",
    href: "/seller/dashboard",
    icon: LayoutDashboard,
  },
  //  {
  //   title: 'Listings',
  //   href: '/seller/dashboard/listings',
  //   icon: Package,
  //  },
  {
    title: "Offers",
    href: "/seller/dashboard/offers",
    icon: Heart,
  },
  //  {
  //   title: 'Orders',
  //   href: '/seller/dashboard/orders',
  //   icon: ShoppingCart,
  //  },
];

export function SellerNavigation() {
  const pathname = usePathname();

  return (
    <div className="p-2 lg:p-3">
      <nav className="flex space-x-2 overflow-x-auto lg:flex-col lg:space-y-1 lg:space-x-0">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/seller/dashboard" &&
              pathname.startsWith(item.href));

          return (
            <Link
              className={cn(
                "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors hover:bg-gray-100",
                isActive
                  ? "bg-black text-white hover:bg-gray-800"
                  : "text-gray-600 hover:text-gray-900"
              )}
              href={item.href}
              key={item.href}
            >
              <Icon className="mr-2 h-4 w-4 shrink-0" />
              <span className="lg:block">{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
