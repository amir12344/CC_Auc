'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

interface OptimizedScriptProps {
  src: string;
  strategy?: 'beforeInteractive' | 'afterInteractive' | 'lazyOnload';
  id?: string;
  onLoad?: () => void;
  defer?: boolean;
  async?: boolean;
}

/**
 * A component for optimized script loading with visibility-based loading
 */
export default function OptimizedScript({
  src,
  strategy = 'lazyOnload',
  id,
  onLoad,
  defer = true,
  async = true,
}: OptimizedScriptProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Create an intersection observer to load the script when it's in the viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe the document body
    observer.observe(document.body);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Only render the script when it's visible or for critical scripts
  if (!isVisible && strategy === 'lazyOnload') {
    return null;
  }

  return (
    <Script
      src={src}
      strategy={strategy}
      id={id}
      onLoad={onLoad}
      defer={defer}
      async={async}
    />
  );
}

