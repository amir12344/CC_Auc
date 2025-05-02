'use client';

import { useEffect, useState, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface LazyLoadProps {
  children: ReactNode;
  threshold?: number;
  rootMargin?: string;
  placeholder?: ReactNode;
  fadeInDuration?: number;
}

/**
 * A component for lazy loading content when it enters the viewport
 */
export default function LazyLoad({
  children,
  threshold = 0.1,
  rootMargin = '200px',
  placeholder,
  fadeInDuration = 0.5,
}: LazyLoadProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [elementId] = useState(`lazy-load-${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    // Create an intersection observer to detect when the element is in the viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold, rootMargin }
    );

    // Start observing when the component mounts
    const currentElement = document.getElementById(elementId);
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      observer.disconnect();
    };
  }, [elementId, threshold, rootMargin]);

  return (
    <div id={elementId} className="relative">
      {!isVisible && placeholder ? (
        <div className="w-full h-full">{placeholder}</div>
      ) : null}
      
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: fadeInDuration }}
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}

