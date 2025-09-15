import React from "react";

// Skeleton loader that EXACTLY matches the MarketplaceSkeleton product cards
// This component renders a SINGLE skeleton card.
const ProductCardSkeleton = () => {
  return (
    <div
      className="animate-pulse"
      data-testid="marketplace-product-skeleton" // Kept for testing/clarity if needed
      aria-hidden="true"
    >
      <div className="mb-3 aspect-square w-full rounded-2xl bg-gray-300"></div>
      <div className="mb-2 h-5 w-3/4 rounded bg-gray-300"></div>
      <div className="h-4 w-1/2 rounded bg-gray-300"></div>
    </div>
  );
};

export default ProductCardSkeleton;
