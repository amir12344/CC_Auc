"use client";

import { usePathname, useRouter } from "next/navigation";
import { memo, useMemo } from "react";

import {
  ArrowUpRight,
  ChevronDown,
  Hammer,
  Heart,
  ShoppingCart,
} from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useBuyerDealsCounts } from "@/src/features/buyer-deals/hooks/useBuyerDealsCounts";

/**
 * Enhanced My Portal dropdown component for header navigation
 * Shows all buyer deals sections with visual appeal using shadcn components
 */
function MyDealsDropdownComponent() {
  const router = useRouter();
  const pathname = usePathname();
  const { counts, isLoading, hasError, isPlaceholderData } =
    useBuyerDealsCounts();

  // Memoize the deals items to prevent unnecessary recalculations
  const myDealsItems = useMemo(
    () => [
      {
        title: "Offers",
        href: "/buyer/deals/offers",
        icon: Heart,
        description: "Your pending offers",
        count: hasError ? "0" : counts?.offers?.toString() || "0",
        isLoading: isLoading && !isPlaceholderData,
      },
      {
        title: "Orders",
        href: "/buyer/deals/orders",
        icon: ShoppingCart,
        description: "Track your orders",
        count: hasError ? "0" : counts?.orders?.toString() || "0",
        isLoading: isLoading && !isPlaceholderData,
      },
      {
        title: "Bids",
        href: "/buyer/deals/bids",
        icon: Hammer,
        description: "Track your bids",
        count: hasError ? "0" : counts?.bids?.toString() || "0",
        isLoading: isLoading && !isPlaceholderData,
      },
    ],
    [counts, isLoading, hasError, isPlaceholderData]
  );

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const isActive = (href: string) => {
    return (
      pathname === href ||
      (href !== "/buyer/deals" && pathname.startsWith(href))
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="cursor-pointer text-base font-medium text-[#D8F4CC] transition-colors duration-300 hover:bg-[#43CD66]/10 hover:text-[#43CD66]"
          size="sm"
          variant="ghost"
        >
          My Portal
          <ChevronDown className="ml-1 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        alignOffset={-8}
        className="w-72 p-2"
        side="bottom"
        sideOffset={8}
      >
        <DropdownMenuLabel className="px-3 py-2 text-sm font-semibold text-gray-900">
          My Portal
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1" />

        <div className="space-y-1">
          {myDealsItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <DropdownMenuItem
                className={`focus:bg-primary/5 cursor-pointer rounded-lg p-3 transition-all duration-200 ${
                  active
                    ? "border-primary/20 bg-primary/5 border"
                    : "border border-transparent hover:bg-gray-50/80"
                }`}
                key={item.href}
                onClick={() => handleNavigation(item.href)}
              >
                <div className="flex w-full items-center">
                  <div
                    className={`mr-3 rounded-md p-2 ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm font-medium ${
                          active ? "text-primary" : "text-gray-900"
                        }`}
                      >
                        {item.title}
                      </span>

                      <div className="flex items-center gap-2">
                        {item.count !== null &&
                          (item.isLoading ? (
                            <Skeleton className="h-5 w-8 bg-gray-200" />
                          ) : (
                            <Badge
                              className="h-5 min-w-[20px] justify-center px-2 py-0.5 text-xs"
                              variant={active ? "default" : "secondary"}
                            >
                              {item.count}
                            </Badge>
                          ))}
                        <ArrowUpRight
                          className={`h-3 w-3 ${
                            active ? "text-primary" : "text-gray-400"
                          }`}
                        />
                      </div>
                    </div>

                    <p className="mt-0.5 truncate text-xs text-gray-500">
                      {item.description}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            );
          })}
        </div>

        <DropdownMenuSeparator className="my-2" />

        <div className="px-3 py-2">
          <p className="text-center text-xs text-gray-500">
            Need help? Contact Support:{" "}
            {/* Changed: use a mailto link and display the email address */}
            <a
              className="text-primary hover:underline"
              href="mailto:team@commercecentral.ai"
            >
              team@commercecentral.ai
            </a>
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Export memoized component to prevent unnecessary re-renders
export const MyDealsDropdown = memo(MyDealsDropdownComponent);
