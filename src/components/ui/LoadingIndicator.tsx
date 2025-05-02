'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Global loading indicator component
 * Shows a progress bar at the top of the page during navigation
 */
export default function LoadingIndicator() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Trigger loading animation on route change
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let interval: NodeJS.Timeout;

    const startLoading = () => {
      setLoading(true);
      setProgress(0);

      // Simulate progress increments - optimized for perceived performance
      interval = setInterval(() => {
        setProgress(prev => {
          const increment = prev < 60 ? 15 : prev < 85 ? 5 : 1; // Faster initial progress
          const newProgress = Math.min(prev + increment, 98);
          return newProgress;
        });
      }, 50); // Reduced from 100ms to 50ms for smoother animation
    };

    const completeLoading = () => {
      setProgress(100);

      // Keep 100% progress visible briefly before hiding
      clearInterval(interval);
      timeout = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 250); // Brief delay before hiding
    };

    startLoading();

    // Complete loading at a realistic pace for navigation
    timeout = setTimeout(completeLoading, 750);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [pathname, searchParams]);

  if (!loading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1">
      <div
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}