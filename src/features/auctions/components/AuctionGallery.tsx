'use client';

import { ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import Image from 'next/image';
import React, { useCallback, useMemo, useState } from 'react';
import { Button } from '@/src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/src/components/ui/dialog';
import { cn } from '@/src/lib/utils';
import {
  getAuctionImagePlaceholder,
} from '../services/auctionQueryService';

// Regex for Google Drive URL matching - defined at top level for performance
const GOOGLE_DRIVE_REGEX = /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/view/;

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
export const AuctionGallery: React.FC<AuctionGalleryProps> = React.memo(
  ({ images, alt = 'Auction item', className }) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    /**
     * Convert Google Drive sharing URL to direct image URL
     */
    const processImageUrl = useCallback((url: string): string => {
      if (!url) {
        return '/images/placeholder-auction.jpg';
      }

      // Check if it's a Google Drive sharing URL
      const googleDriveMatch = url.match(GOOGLE_DRIVE_REGEX);

      if (googleDriveMatch) {
        const fileId = googleDriveMatch[1];
        // Convert to direct download URL
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
      }

      return url;
    }, []);

    // Memoized values for performance
    const processedImages = useMemo(
      () => images.map(img => processImageUrl(img)),
      [images, processImageUrl]
    );
    const currentImage = useMemo(
      () => processedImages[selectedImageIndex],
      [processedImages, selectedImageIndex]
    );
    const hasMultipleImages = useMemo(() => images.length > 1, [images.length]);
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
      setSelectedImageIndex((prev) =>
        prev > 0 ? prev - 1 : images.length - 1
      );
    }, [images.length]);

    /**
     * Navigate to next image
     */
    const handleNextImage = useCallback(() => {
      setSelectedImageIndex((prev) =>
        prev < images.length - 1 ? prev + 1 : 0
      );
    }, [images.length]);

    /**
     * Handle keyboard navigation in lightbox
     */
    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent) => {
        if (event.key === 'ArrowLeft') {
          handlePreviousImage();
        } else if (event.key === 'ArrowRight') {
          handleNextImage();
        } else if (event.key === 'Escape') {
          setIsLightboxOpen(false);
        }
      },
      [handlePreviousImage, handleNextImage]
    );

    if (!images || images.length === 0) {
      return (
        <div className={cn('w-full', className)}>
          <div className='flex aspect-square items-center justify-center rounded-lg border bg-muted'>
            <span className="text-muted-foreground">No images available</span>
          </div>
        </div>
      );
    }

    return (
      <div className={cn('w-full', className)}>
        {/* Main Image Display */}
        <div className="relative mb-3">
          <div className='relative aspect-square overflow-hidden rounded-lg border bg-muted'>
            <Image
              alt={`${alt} - Image ${selectedImageIndex + 1}`}
              blurDataURL={placeholder}
              className="object-cover transition-opacity duration-300"
              fill
              placeholder="blur"
              priority={selectedImageIndex === 0}
              sizes="(max-width: 768px) 100vw, 50vw"
              src={currentImage}
            />

            {/* Expand Button */}
            <Dialog onOpenChange={setIsLightboxOpen} open={isLightboxOpen}>
              <DialogTrigger asChild>
                <Button
                  aria-label="View full size image"
                  className='absolute top-3 right-3 h-8 w-8 border-0 bg-black/60 p-0 text-white hover:bg-black/80'
                  size="sm"
                  variant="secondary"
                >
                  <Expand className="h-4 w-4" />
                </Button>
              </DialogTrigger>

              <DialogContent
                className='h-[90vh] w-full max-w-4xl p-0'
                onKeyDown={handleKeyDown}
              >
                <DialogTitle className="sr-only">
                  {`${alt} - Image ${selectedImageIndex + 1} of ${images.length}`}
                </DialogTitle>
                <div className='relative h-full w-full bg-black'>
                  <Image
                    alt={`${alt} - Full size`}
                    className="object-contain"
                    fill
                    priority
                    sizes="90vw"
                    src={currentImage}
                  />

                  {/* Lightbox Navigation */}
                  {hasMultipleImages && (
                    <>
                      <Button
                        aria-label="Previous image"
                        className='-translate-y-1/2 absolute top-1/2 left-4 border-0 bg-black/50 text-white hover:bg-black/70'
                        onClick={handlePreviousImage}
                        size="sm"
                        variant="secondary"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        aria-label="Next image"
                        className='-translate-y-1/2 absolute top-1/2 right-4 border-0 bg-black/50 text-white hover:bg-black/70'
                        onClick={handleNextImage}
                        size="sm"
                        variant="secondary"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}

                  {/* Image Counter */}
                  <div className='-translate-x-1/2 absolute bottom-4 left-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white'>
                    {selectedImageIndex + 1} / {images.length}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Main Image Navigation */}
            {hasMultipleImages && (
              <>
                <Button
                  aria-label="Previous image"
                  className='-translate-y-1/2 absolute top-1/2 left-3 h-8 w-8 border-0 bg-black/60 p-0 text-white hover:bg-black/80'
                  onClick={handlePreviousImage}
                  size="sm"
                  variant="secondary"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  aria-label="Next image"
                  className='-translate-y-1/2 absolute top-1/2 right-3 h-8 w-8 border-0 bg-black/60 p-0 text-white hover:bg-black/80'
                  onClick={handleNextImage}
                  size="sm"
                  variant="secondary"
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
            {processedImages.map((image, index) => (
              <button
                aria-label={`View image ${index + 1}`}
                className={cn(
                  'relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition-all duration-200',
                  selectedImageIndex === index
                    ? 'border-primary ring-1 ring-primary/30'
                    : 'border-gray-200 hover:border-gray-300'
                )}
                key={`thumbnail-${index + 1}`}
                onClick={() => handleThumbnailClick(index)}
                type="button"
              >
                <Image
                  alt={`${alt} thumbnail ${index + 1}`}
                  blurDataURL={placeholder}
                  className="object-cover"
                  fill
                  placeholder="blur"
                  sizes="64px"
                  src={image}
                />
              </button>
            ))}
          </div>
        )}

        {/* Image Info */}
        {hasMultipleImages && (
          <div className='mt-2 text-center text-muted-foreground text-xs'>
            {images.length} images. Click to enlarge.
          </div>
        )}
      </div>
    );
  }
);

AuctionGallery.displayName = 'AuctionGallery';
