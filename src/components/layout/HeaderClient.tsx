"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
// Link is used in the Button component
import { useSelector } from "react-redux";

import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import {
  selectAuthLoading,
  selectCanAccessBuyerRoutes,
  selectCanAccessSellerRoutes,
  selectIsAuthenticated,
  selectUserType,
} from "@/src/features/authentication/store/authSelectors";

// Lazy-load dropdown menus to keep header light; placeholders preserve layout
const DynamicMyDealsDropdown = dynamic(
  () => import("./MyDealsDropdown").then((m) => m.MyDealsDropdown),
  {
    ssr: false,
    loading: () => (
      <Button
        type="button"
        size="sm"
        variant="ghost"
        aria-disabled="true"
        className="cursor-default text-base font-medium text-[#D8F4CC]"
      >
        Deals
      </Button>
    ),
  }
);

const DynamicSellerListingsDropdown = dynamic(
  () =>
    import("./SellerListingsDropdown").then((m) => m.SellerListingsDropdown),
  {
    ssr: false,
    loading: () => (
      <Button
        type="button"
        size="sm"
        variant="ghost"
        aria-disabled="true"
        className="cursor-default text-base font-medium text-[#D8F4CC]"
      >
        Listings
      </Button>
    ),
  }
);

const DynamicUserDropdown = dynamic(
  () => import("./UserDropdown").then((m) => m.UserDropdown),
  {
    ssr: false,
    loading: () => (
      <Skeleton className="h-10 w-10 rounded-full bg-[#43CD66]/20" />
    ),
  }
);

/**
 * Client-side header component for user authentication status
 * Uses Redux for all authentication state and actions
 * Responsive design for both mobile and desktop
 */
export function HeaderClient() {
  const [isMounted, setIsMounted] = useState(false);
  const hasPrefetched = useRef(false);

  // Redux selectors for auth state
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userType = useSelector(selectUserType);
  const canAccessBuyerRoutes = useSelector(selectCanAccessBuyerRoutes);
  const canAccessSellerRoutes = useSelector(selectCanAccessSellerRoutes);
  const isLoading = useSelector(selectAuthLoading);

  // Handle mounting to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Show loading skeleton during SSR or initial auth check
  if (!isMounted || isLoading) {
    return (
      <div className="flex items-center space-x-3">
        <Skeleton className="h-10 w-24 bg-[#43CD66]/20" />
        <Skeleton className="h-8 w-8 rounded-full bg-[#43CD66]/20" />
      </div>
    );
  }

  // If we're mounted but not authenticated, show login/signup buttons
  if (!isAuthenticated) {
    return (
      <div className="flex items-center space-x-2">
        <Link href="/auth/login" passHref>
          <Button
            asChild
            className="rounded-full border border-transparent bg-[#43CD66] px-4 font-medium text-[#1C1E21] transition-all duration-200 hover:border-[#43CD66] hover:bg-[#43CD66]/10 hover:text-[#43CD66]"
            size="sm"
            variant="default"
          >
            <span>Login</span>
          </Button>
        </Link>

        <Link href="/auth/select-user-type" passHref>
          <Button
            asChild
            className="rounded-full border border-[#43CD66]/50 bg-[#43CD66]/10 px-4 font-medium text-[#43CD66] transition-all duration-200 hover:border-[#43CD66] hover:bg-[#43CD66] hover:text-[#1C1E21]"
            size="sm"
            variant="outline"
          >
            <span>Sign Up</span>
          </Button>
        </Link>
      </div>
    );
  }

  // If we're authenticated, show the appropriate navigation based on user type
  return (
    <div
      className="flex items-center space-x-3"
      // Preload dropdown chunks on first hover to remove click delay
      onPointerEnter={() => {
        if (hasPrefetched.current) return;
        hasPrefetched.current = true;
        void Promise.all([
          import("./MyDealsDropdown"),
          import("./SellerListingsDropdown"),
          import("./UserDropdown"),
        ]);
      }}
    >
      {/* Desktop View */}
      <div className="hidden items-center space-x-3 md:flex">
        {/* My Deals Dropdown - Only for buyers */}
        {canAccessBuyerRoutes && <DynamicMyDealsDropdown />}

        {/* Seller Listings Dropdown - Only for sellers */}
        {canAccessSellerRoutes && <DynamicSellerListingsDropdown />}

        {/* User Dropdown - works for both buyers and sellers */}
        <DynamicUserDropdown />
      </div>

      {/* Mobile View */}
      <div className="flex items-center space-x-2 md:hidden">
        {/* User Dropdown for mobile - works for both buyers and sellers */}
        <DynamicUserDropdown />
      </div>
    </div>
  );
}
