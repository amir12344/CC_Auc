'use client';

import React, { useState, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/src/components/ui/dialog';
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { getAuctionImageSizes, getAuctionImagePlaceholder } from '../utils/auction-utils';

interface AuctionGalleryProps {
  /** Array of image URLs for the auction */
  images: string[];
  /** Alt text for images, defaults to auction title */
  alt?: string;
  /** Optional className for styling */
  className?: string;
}

/**
 * AuctionGallery Component
 * 
 * Displays auction images with thumbnail navigation and lightbox functionality.
 * Features:
 * - Main image display with high-quality rendering
 * - Thumbnail navigation with active state
 * - Lightbox modal for full-size viewing
 * - Keyboard navigation support
 * - Responsive design with optimized loading
 * - Accessibility features with ARIA labels
 * 
 * @param images - Array of image URLs
 * @param alt - Alt text for images
 * @param className - Optional styling
 */
export const AuctionGallery: React.FC<AuctionGalleryProps> = React.memo(({
  images,
  alt = 'Auction item',
  className
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Memoized values for performance
  const currentImage = useMemo(() => images[selectedImageIndex], [images, selectedImageIndex]);
  const hasMultipleImages = useMemo(() => images.length > 1, [images.length]);
  const imageSizes = useMemo(() => getAuctionImageSizes(), []);
  const placeholder = useMemo(() => getAuctionImagePlaceholder(), []);

  /**
   * Handle thumbnail click to change main image
   */
  const handleThumbnailClick = useCallback((index: number) => {
    setSelectedImageIndex(index);
  }, []);

  /**
   * Navigate to previous image
   */
  const handlePreviousImage = useCallback(() => {
    setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  /**
   * Navigate to next image
   */
  const handleNextImage = useCallback(() => {
    setSelectedImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  /**
   * Handle keyboard navigation in lightbox
   */
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'ArrowLeft') {
      handlePreviousImage();
    } else if (event.key === 'ArrowRight') {
      handleNextImage();
    } else if (event.key === 'Escape') {
      setIsLightboxOpen(false);
    }
  }, [handlePreviousImage, handleNextImage]);

  if (!images || images.length === 0) {
    return (
      <div className={cn("w-full", className)}>
        <div className="aspect-square bg-muted rounded-lg flex items-center justify-center border">
          <span className="text-muted-foreground">No images available</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      {/* Main Image Display */}
      <div className="relative mb-3">
        <div className="relative aspect-square bg-muted rounded-lg overflow-hidden border">
          <Image
            src={currentImage}
            alt={`${alt} - Image ${selectedImageIndex + 1}`}
            fill
            className="object-cover transition-opacity duration-300"
            sizes="(max-width: 768px) 100vw, 50vw"
            placeholder="blur"
            blurDataURL={placeholder}
            priority={selectedImageIndex === 0}
          />

          {/* Expand Button */}
          <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white border-0 h-8 w-8 p-0"
                aria-label="View full size image"
              >
                <Expand className="h-4 w-4" />
              </Button>
            </DialogTrigger>

            <DialogContent
              className="max-w-4xl w-full h-[90vh] p-0"
              onKeyDown={handleKeyDown}
            >
              <DialogTitle className="sr-only">
                {`${alt} - Image ${selectedImageIndex + 1} of ${images.length}`}
              </DialogTitle>
              <div className="relative w-full h-full bg-black">
                <Image
                  src={currentImage}
                  alt={`${alt} - Full size`}
                  fill
                  className="object-contain"
                  sizes="90vw"
                  priority
                />

                {/* Lightbox Navigation */}
                {hasMultipleImages && (
                  <>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0"
                      onClick={handlePreviousImage}
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-0"
                      onClick={handleNextImage}
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {selectedImageIndex + 1} / {images.length}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Main Image Navigation */}
          {hasMultipleImages && (
            <>
              <Button
                size="sm"
                variant="secondary"
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white border-0 h-8 w-8 p-0"
                onClick={handlePreviousImage}
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white border-0 h-8 w-8 p-0"
                onClick={handleNextImage}
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Thumbnail Navigation */}
      {hasMultipleImages && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={cn(
                "relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all duration-200",
                selectedImageIndex === index
                  ? "border-primary ring-1 ring-primary/30"
                  : "border-gray-200 hover:border-gray-300"
              )}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image}
                alt={`${alt} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
                placeholder="blur"
                blurDataURL={placeholder}
              />
            </button>
          ))}
        </div>
      )}

      {/* Image Info */}
      {hasMultipleImages && (
        <div className="text-xs text-muted-foreground text-center mt-2">
          {images.length} images. Click to enlarge.
        </div>
      )}
    </div>
  );
});

AuctionGallery.displayName = 'AuctionGallery'; 