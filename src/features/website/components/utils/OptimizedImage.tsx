'use client';

import { useState, useEffect, useRef, memo } from 'react';
import Image, { ImageProps } from 'next/image';
import { motion } from 'framer-motion';
import { useIntersectionObserver } from '@/src/hooks/useIntersectionObserver';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallbackSrc?: string;
  loadingComponent?: React.ReactNode;
  fadeInDuration?: number;
  disableAnimation?: boolean;
}

/**
 * An optimized image component with lazy loading, blur-up effect, and fallback
 * Performance optimized with useIntersectionObserver and memoization
 */
function OptimizedImage({
  src,
  alt,
  width,
  height,
  fallbackSrc = '/images/placeholder.jpg',
  loadingComponent,
  fadeInDuration = 0.5,
  priority = false,
  disableAnimation = false,
  sizes = '100vw',
  quality = 85,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(!priority);
  const [imgSrc, setImgSrc] = useState(src);
  const elementRef = useRef<HTMLDivElement>(null);

  // Use the optimized intersection observer hook
  const { isVisible } = useIntersectionObserver({
    elementRef,
    threshold: 0.1,
    rootMargin: '200px',
    freezeOnceVisible: true
  });

  // Update image source when prop changes
  useEffect(() => {
    if (src !== imgSrc && src !== fallbackSrc) {
      if (!priority) {
        setIsLoading(true);
      }
      setImgSrc(src);
    }
  }, [src, imgSrc, fallbackSrc, priority]);

  // Handle image load event
  const handleImageLoad = () => {
    setIsLoading(false);
  };

  // Handle image error event
  const handleImageError = () => {
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    }
    setIsLoading(false);
  };

  // Generate a unique ID for the image
  const imageId = `image-${alt?.replace(/\s+/g, '-')}-${Math.floor(Math.random() * 1000)}`;

  // Determine if we should render the image
  const shouldRenderImage = priority || isVisible;

  return (
    <div
      ref={elementRef}
      id={imageId}
      className="relative overflow-hidden"
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height
      }}
    >
      {isLoading && loadingComponent ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          {loadingComponent}
        </div>
      ) : null}

      {shouldRenderImage && (
        disableAnimation ? (
          <div className="w-full h-full">
            <Image
              src={imgSrc}
              alt={alt}
              width={width}
              height={height}
              onLoadingComplete={handleImageLoad}
              onError={handleImageError}
              priority={priority}
              sizes={sizes}
              quality={quality}
              {...props}
            />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isLoading ? 0 : 1 }}
            transition={{ duration: fadeInDuration }}
            className="w-full h-full"
          >
            <Image
              src={imgSrc}
              alt={alt}
              width={width}
              height={height}
              onLoadingComplete={handleImageLoad}
              onError={handleImageError}
              priority={priority}
              sizes={sizes}
              quality={quality}
              {...props}
            />
          </motion.div>
        )
      )}
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export default memo(OptimizedImage);
