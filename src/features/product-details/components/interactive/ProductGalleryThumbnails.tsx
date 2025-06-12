'use client';

import { useState, useEffect, memo } from 'react';
import Image from 'next/image';

interface ProductGalleryThumbnailsProps {
  images: string[];
  title: string;
  currentImage: string;
  onImageChange: (image: string) => void;
}

/**
 * Client Component for interactive gallery thumbnails
 * Optimized with React state management and memoization
 */
export const ProductGalleryThumbnails = memo(function ProductGalleryThumbnails({
  images,
  title,
  currentImage,
  onImageChange
}: ProductGalleryThumbnailsProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state on client-side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // During server-side rendering, return a placeholder
  if (!isMounted) {
    return (
      <div>
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-medium text-gray-700">Gallery</p>
          <p className="text-xs text-gray-500">Click to enlarge</p>
        </div>
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <div
              key={`thumbnail-${index}`}
              className="relative h-20 w-20 shrink-0 rounded-md overflow-hidden border-2 border-gray-200"
            >
              <div className="absolute inset-0 bg-gray-100 animate-pulse"></div>
              <Image
                src={image}
                alt={`${title} - Image ${index + 1}`}
                fill
                className="object-cover z-10"
                sizes="(max-width: 768px) 80px, 100px"
                quality={75}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <p className="text-sm font-medium text-gray-700">Gallery</p>
        <p className="text-xs text-gray-500">Click to enlarge</p>
      </div>
      <div className="flex space-x-3 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <button
            key={`thumbnail-${index}`}
            onClick={() => onImageChange(image)}
            className={`relative h-20 w-20 shrink-0 rounded-md overflow-hidden border-2 transition-all duration-200 ${
              currentImage === image
                ? 'border-primary-600 shadow-md scale-105'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            aria-label={`View ${title} - Image ${index + 1}`}
            type="button"
          >
            <div className="absolute inset-0 bg-gray-100 animate-pulse"></div>
            <Image
              src={image}
              alt={`${title} - Image ${index + 1}`}
              fill
              className="object-cover z-10"
              sizes="(max-width: 768px) 80px, 100px"
              quality={75}
              loading="lazy"
            />
            {currentImage === image && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}); 