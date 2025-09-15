"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";

import {
  selectCanAccessBuyerRoutes,
  selectIsAuthenticated,
  selectIsBuyer,
  selectIsSeller,
} from "@/src/features/authentication/store/authSelectors";
import Logo from "@/src/features/website/components/ui/Logo";
import { useIsMobile } from "@/src/hooks/use-mobile";
import { lazyClient } from "@/src/utils/lazy/dynamic-opts";

// Keep header shell SSR’d and load heavy children lazily
import { HeaderClient } from "./HeaderClient";
import MobileNavigation from "./MobileNavigation";

// Dynamic, client-only heavy children with tiny placeholders
const DynamicSearchBar = lazyClient(() => import("./SearchBar"), {
  // Small non-focusable placeholder to preserve layout height
  loading: (
    <div
      aria-hidden="true"
      className="h-9 w-full max-w-sm rounded bg-[#43CD66]/10"
    />
  ),
});

const DynamicMegaMenu = lazyClient(() => import("./MegaMenu/MegaMenu"));

const DynamicNotificationIcon = dynamic(
  // Load named export as a dynamic component
  () =>
    import("@/src/features/notifications/components/NotificationIcon").then(
      (m) => m.NotificationIcon
    ),
  {
    ssr: false,
    // Disabled button placeholder to keep affordance without interaction
    loading: () => (
      <button
        type="button"
        disabled
        aria-label="Notifications (loading)"
        className="relative rounded-full p-2 text-[#D8F4CC]"
      >
        <span className="block h-6 w-6 rounded-full bg-[#43CD66]/20" />
      </button>
    ),
  }
);

/**
 * Header component - Client Component (for role-based navigation)
 */
export default function Header() {
  const isSeller = useSelector(selectIsSeller);
  const isBuyer = useSelector(selectIsBuyer);
  const canAccessBuyerRoutes = useSelector(selectCanAccessBuyerRoutes);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const pathname = usePathname();
  const isMobile = useIsMobile();

  // Prepare a sentinel to visibility-preload the MegaMenu chunk
  const megaMenuSentinelRef = useRef<HTMLDivElement | null>(null);
  const hasPrefetchedMegaMenuRef = useRef(false);

  // Prefetch function used by intersection/hover to warm the chunk
  const prefetchMegaMenu = () => {
    if (hasPrefetchedMegaMenuRef.current) return;
    hasPrefetchedMegaMenuRef.current = true;
    // Hint the browser to download the MegaMenu chunk ahead of interaction
    void import("./MegaMenu/MegaMenu");
  };

  // Hide mega menu on seller pages and for unverified buyers
  const isSellerPage = pathname?.startsWith("/seller");
  const showMegaMenu = !isSellerPage && !isSeller;

  // Visibility-driven prefetch for desktop only
  useEffect(() => {
    if (!showMegaMenu || isMobile) return;
    const el = megaMenuSentinelRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        prefetchMegaMenu();
        observer.disconnect();
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [showMegaMenu, isMobile]);

  return (
    <>
      {/* Sticky header with logo and navigation */}
      <header
        className="top-0 z-50 bg-[#102D21]"
        // Hover-driven prefetch for desktop nav
        onPointerEnter={() => {
          if (showMegaMenu && !isMobile) prefetchMegaMenu();
        }}
      >
        <div className="max-w-8xl mx-auto flex w-full items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Left: Logo and Navigation Links */}
          <div className="flex items-center space-x-6">
            <Logo />

            {/* Main navigation links - visible only on desktop */}
            <nav className="hidden items-center space-x-6 md:flex">
              {/* Show Dashboard for authenticated sellers */}
              {isAuthenticated && isSeller && (
                <Link
                  className="cursor-pointer rounded-md px-3 py-2 text-lg font-medium text-[#D8F4CC] transition-colors duration-300 hover:bg-[#43CD66]/10 hover:text-[#43CD66]"
                  href="/seller/dashboard"
                >
                  Dashboard
                </Link>
              )}

              {/* Show Wishlist and Inbox for authenticated buyers */}
              {isAuthenticated && isBuyer && (
                <>
                  <Link
                    className="text-md cursor-pointer rounded-md px-3 py-2 font-medium text-[#D8F4CC] transition-colors duration-300 hover:bg-[#43CD66]/10 hover:text-[#43CD66]"
                    href="/buyer/wishlist"
                  >
                    Wishlist
                  </Link>
                  <Link
                    className="text-md cursor-pointer rounded-md px-3 py-2 font-medium text-[#D8F4CC] transition-colors duration-300 hover:bg-[#43CD66]/10 hover:text-[#43CD66]"
                    href="/buyer/inbox"
                  >
                    Inbox
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Center: Search Bar - Always visible for buyers */}
          {!isSeller && (
            <div className="mx-8 hidden max-w-sm flex-1 md:block">
              {/* Lazy search to avoid shipping its code on initial paint */}
              <DynamicSearchBar />
            </div>
          )}

          {/* Right: User Actions */}
          <div className="flex items-center space-x-3">
            {/* Mobile menu button - only visible on mobile */}
            <div className="md:hidden">
              <MobileNavigation />
            </div>

            {/* Notifications - only visible for authenticated users */}
            {isAuthenticated && (
              <div className="hidden md:block">
                {/* Lazy notifications icon with disabled placeholder */}
                <DynamicNotificationIcon />
              </div>
            )}

            {/* User profile and auth - handles both mobile and desktop */}
            <HeaderClient />
          </div>
        </div>
      </header>

      {/* Mobile search - only visible on small screens for non-sellers */}
      {!isSeller && (
        <div className="border-t border-[#43CD66]/20 bg-[#102D21] px-4 py-3 md:hidden">
          {/* Lazy search also for mobile variant */}
          <DynamicSearchBar />
        </div>
      )}

      {/* Mega Menu - desktop only; render lazily after prefetch */}
      {showMegaMenu && !isMobile && <DynamicMegaMenu />}

      {/* Sentinel used to prefetch MegaMenu when header enters viewport */}
      <div ref={megaMenuSentinelRef} aria-hidden="true" className="sr-only" />
    </>
  );
}
