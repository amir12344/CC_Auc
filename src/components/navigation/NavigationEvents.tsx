'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

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
    document.addEventListener('beforeunload', handleRouteChangeStart);
    window.addEventListener('popstate', handleRouteChangeStart);

    return () => {
      document.removeEventListener('beforeunload', handleRouteChangeStart);
      window.removeEventListener('popstate', handleRouteChangeStart);
    };
  }, []);

  if (!isNavigating) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50 bg-primary-100">
      <div className="h-full bg-primary-600 animate-progress"></div>
    </div>
  );
}

