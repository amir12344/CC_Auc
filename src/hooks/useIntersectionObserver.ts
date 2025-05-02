'use client';

import { useEffect, useState, useRef, RefObject, useCallback } from 'react';

interface UseIntersectionObserverProps {
  threshold?: number;
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
  elementRef?: RefObject<Element | null>;
}

/**
 * Hook for intersection observer
 * Used for lazy loading, infinite scroll, etc.
 */
export function useIntersectionObserver({
  threshold = 0,
  root = null,
  rootMargin = '0px',
  freezeOnceVisible = false,
  elementRef,
}: UseIntersectionObserverProps = {}) {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const internalRef = useRef<Element | null>(null);
  const frozen = useRef(false);

  // Use the provided ref or the internal one
  const ref = elementRef || internalRef;

  // Use useCallback to prevent recreation on every render
  const updateEntry = useCallback(
    ([entry]: IntersectionObserverEntry[]): void => {
      setEntry(entry);
      setIsVisible(entry.isIntersecting);

      if (freezeOnceVisible && entry.isIntersecting) {
        frozen.current = true;
      }
    },
    [freezeOnceVisible, setEntry, setIsVisible]
  );

  useEffect(() => {
    // Skip if already frozen and freezeOnceVisible is true
    if (freezeOnceVisible && frozen.current) {
      setIsVisible(true);
      return;
    }

    const node = ref.current;

    // Do nothing if the element doesn't exist
    if (!node) return;

    // Create the observer with performance optimizations
    const observer = new IntersectionObserver(updateEntry, {
      threshold,
      root,
      rootMargin,
    });

    // Start observing
    observer.observe(node);

    // Clean up
    return () => {
      observer.disconnect();
    };
  }, [threshold, root, rootMargin, freezeOnceVisible, ref, updateEntry]);

  return { ref: internalRef, entry, isVisible };
}

