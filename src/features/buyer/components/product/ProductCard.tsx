'use client';

import { memo, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/src/types';
import { FavoriteButton } from './interactive/FavoriteButton';

interface ProductCardProps {
  product: Product;
}

/**
 * Optimized ProductCard component
 * Combined static and client parts for better performance
 */
const ProductCard = ({ product }: ProductCardProps) => {
  // State for client-side data
  const [units, setUnits] = useState<number | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(product.discount || 0);

  // Generate client-side data after mount
  useEffect(() => {
    // Generate random values after component mounts on client side
    setUnits(Math.floor(Math.random() * 20000) + 1000);
    if (!product.discount) {
      setDiscountPercent(Math.floor(Math.random() * 85) + 15);
    }
  }, [product.discount]);

  return (
    <div className="group">
      {/* Product Image Container with gray background */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100 rounded-lg mb-3">
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          loading="lazy"
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEDQIHq4C7aQAAAABJRU5ErkJggg=="
        />

        {/* Favorite button */}
        <FavoriteButton productId={product.id} />

        {/* Seller badge - shown only if seller has logo */}
        {product.seller?.logo && (
          <div className="absolute top-2 left-2 z-10">
            <div className="bg-orange-100 text-orange-900 rounded-lg p-1 flex items-center justify-center w-6 h-6">
              <Image
                src={product.seller.logo}
                alt={product.seller.name || 'Seller'}
                width={16}
                height={16}
                className="object-contain"
              />
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <Link
        href={`/marketplace/product/${product.id}`}
        className="block"
        prefetch={false} // Disable prefetching for better performance
      >
        {/* Brand/Seller Name */}
        <h3 className="text-base font-bold text-gray-900">
          {product.seller?.name || product.category || 'Brand'}
        </h3>

        {/* Product Title */}
        <h1 className="text-base text-gray-800 mb-1">
          {product.title}
        </h1>

        {/* Units and Discount Info */}
        <p className="text-sm text-gray-500">
          {units ? `${units.toLocaleString()} units • ` : ''}
          {discountPercent}% off MSRP
        </p>
      </Link>
    </div>
  );
};

export default memo(ProductCard);

