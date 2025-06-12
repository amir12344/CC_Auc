import React from 'react';

// Skeleton loader that EXACTLY matches the MarketplaceSkeleton product cards
// This component renders a SINGLE skeleton card.
const ProductCardSkeleton = () => {
  return (
    <div 
      className="animate-pulse" 
      data-testid="marketplace-product-skeleton" // Kept for testing/clarity if needed
      aria-hidden="true"
    >
      <div className="aspect-square w-full bg-gray-300 rounded-lg mb-3"></div>
      <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
    </div>
  );
};

export default ProductCardSkeleton; 