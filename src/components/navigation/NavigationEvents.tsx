"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Navigation Events component
 * Tracks navigation events and shows a loading indicator during page transitions
 */
export function NavigationEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // When the route changes, set navigating to false
    setIsNavigating(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleRouteChangeStart = () => {
      setIsNavigating(true);
    };

    // This function is defined but not used in the current implementation
    // It will be used when we implement more sophisticated navigation tracking
    // const handleRouteChangeComplete = () => {
    //   setIsNavigating(false);
    // };

    // Add event listeners for route changes
    document.addEventListener("beforeunload", handleRouteChangeStart);
    window.addEventListener("popstate", handleRouteChangeStart);

    return () => {
      document.removeEventListener("beforeunload", handleRouteChangeStart);
      window.removeEventListener("popstate", handleRouteChangeStart);
    };
  }, []);

  if (!isNavigating) return null;

  return (
    <div className="bg-primary-100 fixed top-0 left-0 z-50 h-1 w-full">
      <div className="bg-primary-600 animate-progress h-full"></div>
    </div>
  );
}
