"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Dialog, DialogContent } from "@/src/components/ui/dialog";

interface ImageGalleryProps {
  images: string[]; // Array of processed image URLs
  productName: string;
  className?: string;
}

export const ImageGallery = ({
  images,
  productName,
  className = "",
}: ImageGalleryProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [naturalSize, setNaturalSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // Hover zoom state (Amazon-style)
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState<{ x: number; y: number }>({
    x: 50,
    y: 50,
  });
  const zoomScale = 2; // how much to enlarge on hover
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Handle image error
  const handleImageError = (index: number) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }));
  };

  // Navigate to previous image
  const goToPrevious = () => {
    setImageLoaded(false);
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  // Navigate to next image
  const goToNext = () => {
    setImageLoaded(false);
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Select specific image from thumbnails
  const selectImage = (index: number) => {
    setImageLoaded(false);
    setCurrentImageIndex(index);
  };

  // Preload adjacent images for faster switching
  useEffect(() => {
    if (!images || images.length <= 1) return;
    if (typeof window === "undefined") return;
    const next = (currentImageIndex + 1) % images.length;
    const prev = (currentImageIndex - 1 + images.length) % images.length;
    [next, prev].forEach((i) => {
      const url = images[i];
      if (!url) return;
      const img = new window.Image();
      img.src = url;
    });
  }, [currentImageIndex, images]);

  // If no images, show placeholder
  if (!images || images.length === 0) {
    return (
      <div
        className={`relative overflow-hidden rounded-lg bg-gray-100 ${className}`}
      >
        <div className="flex h-full w-full flex-col items-center justify-center bg-gray-100 text-gray-400">
          <ImageIcon className="mb-2 h-12 w-12" />
          <p className="text-sm font-medium">{productName}</p>
        </div>

        {/* Lightbox Dialog */}
        <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
          <DialogContent
            className="max-w-screen-xl border-0 bg-transparent p-0 shadow-none"
            hideCloseButton
          >
            <div
              className="relative h-[75vh] w-[90vw] overflow-hidden rounded-lg bg-black/90"
              onKeyDown={(e) => {
                if (images.length < 2) return;
                if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  setCurrentImageIndex((prev) =>
                    prev === 0 ? images.length - 1 : prev - 1
                  );
                } else if (e.key === "ArrowRight") {
                  e.preventDefault();
                  setCurrentImageIndex((prev) =>
                    prev === images.length - 1 ? 0 : prev + 1
                  );
                }
              }}
              tabIndex={0}
            >
              {images[currentImageIndex] && !imageErrors[currentImageIndex] ? (
                <Image
                  alt={`${productName} - Image ${currentImageIndex + 1}`}
                  className="object-contain"
                  fill
                  sizes="(max-width: 1536px) 90vw, 1400px"
                  src={images[currentImageIndex]}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-300">
                  <ImageIcon className="h-12 w-12" />
                </div>
              )}

              {images.length > 1 && (
                <>
                  <Button
                    className="absolute top-1/2 left-3 h-9 w-9 -translate-y-1/2 rounded-full border border-white/30 bg-white/20 p-0 text-white backdrop-blur-sm hover:bg-white/30"
                    onClick={() =>
                      setCurrentImageIndex((prev) =>
                        prev === 0 ? images.length - 1 : prev - 1
                      )
                    }
                    variant="ghost"
                    size="sm"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    className="absolute top-1/2 right-3 h-9 w-9 -translate-y-1/2 rounded-full border border-white/30 bg-white/20 p-0 text-white backdrop-blur-sm hover:bg-white/30"
                    onClick={() =>
                      setCurrentImageIndex((prev) =>
                        prev === images.length - 1 ? 0 : prev + 1
                      )
                    }
                    variant="ghost"
                    size="sm"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                  <div className="absolute right-4 bottom-4 rounded-full border border-white/20 bg-black/50 px-2 py-1 text-xs text-white">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  const currentImage = images[currentImageIndex];
  const hasError = imageErrors[currentImageIndex];

  return (
    <div
      className={`space-y-3 ${className}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (images.length < 2) return;
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          goToPrevious();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          goToNext();
        }
      }}
    >
      {/* Main Image Display */}
      <div
        ref={containerRef}
        className="relative mx-auto w-full max-w-[720px] overflow-hidden"
        onClick={() => images.length > 0 && setLightboxOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (images.length > 0) setLightboxOpen(true);
          }
        }}
        aria-label="Open image in fullscreen"
        style={{
          cursor:
            images.length > 0 ? (isZoomed ? "zoom-out" : "zoom-in") : "default",
        }}
      >
        {currentImage && !hasError ? (
          <>
            <div
              className="relative inline-block w-full select-none"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={(e) => {
                if (!containerRef.current) return;
                const rect = containerRef.current.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                setZoomOrigin({
                  x: Math.max(0, Math.min(100, x)),
                  y: Math.max(0, Math.min(100, y)),
                });
              }}
            >
              <Image
                alt={`${productName} - Image ${currentImageIndex + 1}`}
                className={`block h-auto w-full object-contain transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                width={naturalSize?.width || 1200}
                height={naturalSize?.height || 900}
                onError={() => handleImageError(currentImageIndex)}
                onLoadingComplete={(img) => {
                  setImageLoaded(true);
                  if (!naturalSize) {
                    setNaturalSize({
                      width: img.naturalWidth,
                      height: img.naturalHeight,
                    });
                  }
                }}
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMScgaGVpZ2h0PScxJyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLz4="
                priority={currentImageIndex === 0}
                sizes="(max-width: 768px) 100vw, 720px"
                src={currentImage}
                ref={imageRef as any}
                style={{
                  transform: isZoomed ? `scale(${zoomScale})` : "scale(1)",
                  transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                  transition: "transform 120ms ease-out",
                }}
              />
            </div>

            {/* Navigation arrows - only show if multiple images */}
            {images.length > 1 && (
              <>
                <Button
                  className="absolute top-1/2 left-2 h-8 w-8 -translate-y-1/2 rounded-full bg-gray-900/70 p-0 text-white backdrop-blur-sm hover:bg-gray-900/80"
                  onClick={goToPrevious}
                  variant="ghost"
                  size="sm"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  className="absolute top-1/2 right-2 h-8 w-8 -translate-y-1/2 rounded-full bg-gray-900/70 p-0 text-white backdrop-blur-sm hover:bg-gray-900/80"
                  onClick={goToNext}
                  variant="ghost"
                  size="sm"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Image counter */}
            {images.length > 1 && (
              <div className="absolute right-3 bottom-3 rounded-full bg-gray-900/70 px-2 py-1 text-xs text-white backdrop-blur-sm">
                {currentImageIndex + 1} / {images.length}
              </div>
            )}
          </>
        ) : (
          <div className="flex w-full flex-col items-center justify-center text-gray-400">
            <ImageIcon className="mb-2 h-12 w-12" />
            <p className="text-sm font-medium">{productName}</p>
          </div>
        )}
      </div>

      {/* Thumbnail Navigation - only show if multiple images */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto px-1 pt-1 pb-2">
          {images.map((imageUrl, index) => (
            <button
              key={index}
              className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md transition-all ${
                index === currentImageIndex
                  ? "outline-primary/80 outline outline-2"
                  : "border border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => selectImage(index)}
              type="button"
            >
              {imageUrl && !imageErrors[index] ? (
                <Image
                  alt={`${productName} thumbnail ${index + 1}`}
                  className="object-contain"
                  fill
                  onError={() => handleImageError(index)}
                  sizes="64px"
                  src={imageUrl}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                  <ImageIcon className="h-4 w-4" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
