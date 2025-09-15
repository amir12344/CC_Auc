"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Hammer, Heart, ShoppingCart } from "lucide-react";

import { cn } from "@/src/lib/utils";

const navigationItems = [
  {
    title: "Offers",
    href: "/buyer/deals/offers",
    icon: Heart,
  },
  {
    title: "Orders",
    href: "/buyer/deals/orders",
    icon: ShoppingCart,
  },
  {
    title: "Bids",
    href: "/buyer/deals/bids",
    icon: Hammer,
  },
];

export function BuyerNavigation() {
  const pathname = usePathname();

  return (
    <div className="p-2 lg:p-3">
      <nav className="flex space-x-2 overflow-x-auto lg:flex-col lg:space-y-1 lg:space-x-0">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/buyer/deals" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors hover:bg-gray-100",
                isActive
                  ? "bg-black text-white hover:bg-gray-800"
                  : "text-gray-600 hover:text-gray-900"
              )}
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
