'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ProductGalleryThumbnails } from './interactive/ProductGalleryThumbnails';

interface ProductGalleryProps {
  mainImage: string;
  additionalImages?: string[];
  title: string;
}

/**
 * Client Component for the product gallery with interactive thumbnails
 * Uses React state instead of direct DOM manipulation for better performance
 */
const ProductGallery = ({ mainImage, additionalImages = [], title }: ProductGalleryProps) => {
  // Create a combined array of all images
  const allImages = [mainImage, ...additionalImages];

  // State to track the currently displayed image
  const [currentImage, setCurrentImage] = useState(mainImage);

  // Handler for thumbnail clicks
  const handleImageChange = (image: string) => {
    setCurrentImage(image);
  };

  return (
    <div className="w-full">
      {/* Main Image */}
      <div className="relative h-[450px] w-full mb-4 bg-gray-100 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
        <div className="absolute top-2 right-2 z-10 bg-white/80 backdrop-blur-xs rounded-full p-2 shadow-xs">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <Image
          src={currentImage}
          alt={title}
          fill
          priority
          className="object-contain p-4 hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          quality={90}
          placeholder="empty"
        />
      </div>

      {/* Thumbnail Gallery - Client Component */}
      {allImages.length > 1 && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <ProductGalleryThumbnails
            images={allImages}
            title={title}
            currentImage={currentImage}
            onImageChange={handleImageChange}
          />
        </div>
      )}

      {/* Image Count Indicator */}
      <div className="mt-2 text-sm text-gray-500 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {allImages.length} {allImages.length === 1 ? 'image' : 'images'} available
      </div>
    </div>
  );
};

export default ProductGallery; 