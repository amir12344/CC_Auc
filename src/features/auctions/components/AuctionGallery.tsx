"use client";

import Image from "next/image";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { ChevronLeft, ChevronRight, Expand, ImageIcon } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog";
import { cn } from "@/src/lib/utils";

import { getAuctionImagePlaceholder } from "../services/auctionQueryService";

// Regex for Google Drive URL matching - defined at top level for performance
const GOOGLE_DRIVE_REGEX =
  /https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)\/view/;

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
 * Modern, fast auction image gallery with:
 * - Instant image switching with preloading
 * - Smooth animations and transitions
 * - Modern card-based design
 * - Auto-slideshow functionality
 * - Enhanced lightbox experience
 * - Optimized performance
 * - Mobile-first responsive design
 */
export const AuctionGallery: React.FC<AuctionGalleryProps> = React.memo(
  ({ images, alt = "Auction item", className }) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [imageLoadStates, setImageLoadStates] = useState<
      Record<number, boolean>
    >({});
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

    /**
     * Convert Google Drive sharing URL to direct image URL
     */
    const processImageUrl = useCallback((url: string): string => {
      if (!url) {
        return "";
      }

      const googleDriveMatch = url.match(GOOGLE_DRIVE_REGEX);
      if (googleDriveMatch) {
        const fileId = googleDriveMatch[1];
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
      }

      return url;
    }, []);

    // Memoized values for performance
    const processedImages = useMemo(
      () => images.map((img) => processImageUrl(img)),
      [images, processImageUrl]
    );
    const currentImage = useMemo(
      () => processedImages[selectedImageIndex],
      [processedImages, selectedImageIndex]
    );
    const hasMultipleImages = useMemo(() => images.length > 1, [images.length]);
    const placeholder = useMemo(() => getAuctionImagePlaceholder(), []);

    // Preload all images immediately for instant switching
    useEffect(() => {
      if (processedImages.length <= 1) return;

      processedImages.forEach((imageSrc, index) => {
        if (!imageLoadStates[index]) {
          const img = new window.Image();
          img.src = imageSrc;
          img.onload = () => {
            setImageLoadStates((prev) => ({ ...prev, [index]: true }));
          };
        }
      });
    }, [processedImages, imageLoadStates]);

    /**
     * Handle image switching with smooth transition
     */
    const switchToImage = useCallback(
      (index: number) => {
        if (index === selectedImageIndex || isTransitioning) return;

        setIsTransitioning(true);
        setSelectedImageIndex(index);

        // Reset transition state after animation
        setTimeout(() => setIsTransitioning(false), 200);
      },
      [selectedImageIndex, isTransitioning]
    );

    /**
     * Navigate to previous image
     */
    const handlePreviousImage = useCallback(() => {
      const prevIndex =
        selectedImageIndex === 0 ? images.length - 1 : selectedImageIndex - 1;
      switchToImage(prevIndex);
    }, [selectedImageIndex, images.length, switchToImage]);

    /**
     * Navigate to next image
     */
    const handleNextImage = useCallback(() => {
      const nextIndex = (selectedImageIndex + 1) % images.length;
      switchToImage(nextIndex);
    }, [selectedImageIndex, images.length, switchToImage]);

    /**
     * Handle keyboard navigation
     */
    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent) => {
        if (!isLightboxOpen) return;

        switch (event.key) {
          case "ArrowLeft":
            handlePreviousImage();
            break;
          case "ArrowRight":
            handleNextImage();
            break;
          case "Escape":
            setIsLightboxOpen(false);
            break;
        }
      },
      [isLightboxOpen, handlePreviousImage, handleNextImage]
    );

    // Error handling for images
    const handleImageError = useCallback(
      (event: React.SyntheticEvent<HTMLImageElement>) => {
        event.currentTarget.src = placeholder;
      },
      [placeholder]
    );

    // If no images, show placeholder
    if (!images.length) {
      return (
        <div className={cn("w-full", className)}>
          <div className="from-muted to-muted/50 relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border bg-gradient-to-br shadow-lg">
            <div className="text-muted-foreground text-center">
              <ImageIcon className="mx-auto mb-3 h-16 w-16 opacity-50" />
              <p className="text-sm font-medium">No images available</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className={cn("w-full space-y-4", className)}>
        {/* Main Image Display */}
        <div className="group relative">
          <div className="bg-muted relative aspect-square overflow-hidden rounded-xl border shadow-lg">
            {/* Main Image */}
            <Image
              src={currentImage}
              alt={alt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={cn(
                "object-cover transition-opacity duration-200 ease-out",
                isTransitioning ? "opacity-80" : "opacity-100"
              )}
              onError={handleImageError}
              priority
            />

            {/* Gradient Overlays for Better Button Visibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            {/* Navigation Arrows */}
            {hasMultipleImages && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-1/2 left-3 -translate-y-1/2 border border-white/20 bg-white/90 opacity-0 shadow-lg backdrop-blur-md transition-all duration-300 group-hover:opacity-100 hover:scale-110 hover:bg-white"
                  onClick={handlePreviousImage}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-1/2 right-3 -translate-y-1/2 border border-white/20 bg-white/90 opacity-0 shadow-lg backdrop-blur-md transition-all duration-300 group-hover:opacity-100 hover:scale-110 hover:bg-white"
                  onClick={handleNextImage}
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}

            {/* Top Action Bar */}
            <div className="absolute top-3 right-3 left-3 flex items-center justify-between">
              {/* Image Counter */}
              {hasMultipleImages && (
                <div className="rounded-full bg-black/70 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-md">
                  {selectedImageIndex + 1} / {images.length}
                </div>
              )}

              <div className="ml-auto flex gap-2">
                {/* Expand Button */}
                <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="border border-white/20 bg-white/90 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-white"
                      aria-label="View full size"
                    >
                      <Expand className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent
                    className="max-h-[95vh] max-w-7xl border-0 bg-black/95 p-0"
                    onKeyDown={handleKeyDown}
                  >
                    <DialogTitle className="sr-only">
                      {alt} - Image {selectedImageIndex + 1} of {images.length}
                    </DialogTitle>
                    <div className="relative flex h-full w-full items-center justify-center overflow-hidden p-4">
                      <div
                        className="relative cursor-zoom-in"
                        style={{
                          transform: `scale(${zoomLevel}) translate(${zoomPosition.x}px, ${zoomPosition.y}px)`,
                          transition: "transform 0.2s ease-out",
                        }}
                        onClick={(e) => {
                          if (zoomLevel === 1) {
                            setZoomLevel(2);
                            const rect =
                              e.currentTarget.getBoundingClientRect();
                            const centerX = rect.width / 2;
                            const centerY = rect.height / 2;
                            const clickX = e.clientX - rect.left;
                            const clickY = e.clientY - rect.top;
                            setZoomPosition({
                              x: (centerX - clickX) / 2,
                              y: (centerY - clickY) / 2,
                            });
                          } else {
                            setZoomLevel(1);
                            setZoomPosition({ x: 0, y: 0 });
                          }
                        }}
                      >
                        <Image
                          src={currentImage}
                          alt={alt}
                          width={1200}
                          height={800}
                          className="max-h-[90vh] max-w-full rounded-lg object-contain"
                          onError={handleImageError}
                        />
                      </div>

                      {/* Lightbox Navigation */}
                      {hasMultipleImages && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-1/2 left-6 h-14 w-14 -translate-y-1/2 rounded-full text-white backdrop-blur-md hover:bg-white/20"
                            onClick={handlePreviousImage}
                            aria-label="Previous image"
                          >
                            <ChevronLeft className="h-7 w-7" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-1/2 right-6 h-14 w-14 -translate-y-1/2 rounded-full text-white backdrop-blur-md hover:bg-white/20"
                            onClick={handleNextImage}
                            aria-label="Next image"
                          >
                            <ChevronRight className="h-7 w-7" />
                          </Button>

                          {/* Lightbox Counter and Zoom Info */}
                          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-3">
                            <div className="rounded-full bg-black/70 px-4 py-2 font-medium text-white backdrop-blur-md">
                              {selectedImageIndex + 1} / {images.length}
                            </div>
                            <div className="rounded-full bg-black/70 px-3 py-1 text-sm text-white backdrop-blur-md">
                              {zoomLevel === 1
                                ? "Click to zoom"
                                : `${zoomLevel}x zoom`}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Thumbnail Navigation */}
        {hasMultipleImages && (
          <div className="scrollbar-hide flex gap-3 overflow-x-auto px-1 pb-2">
            {processedImages.map((image, index) => (
              <button
                key={index}
                onClick={() => switchToImage(index)}
                className={cn(
                  "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200",
                  selectedImageIndex === index
                    ? "border-primary z-10 scale-105 transform"
                    : "border-border hover:border-primary/50 opacity-70 hover:scale-102 hover:opacity-100"
                )}
                style={{
                  margin: selectedImageIndex === index ? "2px" : "0",
                }}
                aria-label={`View image ${index + 1}`}
              >
                <Image
                  src={image}
                  alt={`${alt} thumbnail ${index + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover transition-transform duration-300"
                  onError={handleImageError}
                />
                {selectedImageIndex === index && (
                  <div className="bg-primary/20 absolute inset-0" />
                )}
                {/* Thumbnail Loading Indicator */}
                {!imageLoadStates[index] && (
                  <div className="bg-muted absolute inset-0 animate-pulse" />
                )}
                {/* Active Indicator */}
                {selectedImageIndex === index && (
                  <div className="bg-primary absolute right-1 bottom-1 h-2 w-2 rounded-full" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
);

AuctionGallery.displayName = "AuctionGallery";
