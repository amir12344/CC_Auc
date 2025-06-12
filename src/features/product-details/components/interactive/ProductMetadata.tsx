'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/src/types';

interface ProductMetadataProps {
  product: Product;
}

/**
 * Client Component for dynamic product metadata
 */
export function ProductMetadata({ product }: ProductMetadataProps) {
  // Use a ref to track if component is mounted to prevent hydration mismatch
  const [isMounted, setIsMounted] = useState(false);
  const [units, setUnits] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(product.discount || 0);

  useEffect(() => {
    // Set mounted state to true after component mounts
    setIsMounted(true);
    
    // Generate random values after component mounts on client side
    setUnits(Math.floor(Math.random() * 20000) + 1000);
    if (!product.discount) {
      setDiscountPercent(Math.floor(Math.random() * 85) + 15);
    }
  }, [product.discount]);

  // During server-side rendering or before hydration, show a placeholder
  if (!isMounted) {
    return (
      <p className="text-sm text-gray-500">
        {product.discount ? `${product.discount}% off MSRP` : 'Discount available'}
      </p>
    );
  }

  // After hydration, show the dynamic content
  return (
    <p className="text-sm text-gray-500">
      {units.toLocaleString()} units • {discountPercent}% off MSRP
    </p>
  );
} 