'use client';

import { useState, useEffect } from 'react';

interface ScrollPosition {
  scrollY: number;
  scrollX: number;
  direction: 'up' | 'down' | 'none';
  isScrolled: boolean;
  isAtTop: boolean;
  isAtBottom: boolean;
}

/**
 * Custom hook to track scroll position and direction
 * @param threshold - Number of pixels to scroll before isScrolled becomes true
 * @returns ScrollPosition object with scroll information
 */
export function useScrollPosition(threshold: number = 50): ScrollPosition {
  const [scrollPosition, setScrollPosition] = useState<ScrollPosition>({
    scrollY: 0,
    scrollX: 0,
    direction: 'none',
    isScrolled: false,
    isAtTop: true,
    isAtBottom: false,
  });

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const currentScrollX = window.scrollX;
      const direction = currentScrollY > lastScrollY ? 'down' : 
                        currentScrollY < lastScrollY ? 'up' : 'none';
      
      const isScrolled = currentScrollY > threshold;
      const isAtTop = currentScrollY === 0;
      const isAtBottom = 
        window.innerHeight + currentScrollY >= document.body.offsetHeight - 10;

      setScrollPosition({
        scrollY: currentScrollY,
        scrollX: currentScrollX,
        direction,
        isScrolled,
        isAtTop,
        isAtBottom,
      });

      lastScrollY = currentScrollY;
    };

    // Add event listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Call once to set initial values
    handleScroll();
    
    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]);

  return scrollPosition;
}

