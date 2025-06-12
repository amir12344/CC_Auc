'use client'

import { memo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/src/types'
import { cn } from '@/src/lib/utils'
import { generateSlug } from '@/src/utils/product-utils'

interface SimpleProductCardProps {
  product: Product
  className?: string
}

/**
 * SimpleProductCard - Simplified version of ProductCard for collections/search
 * Matches marketplace design but without buttons or complex interactions
 */
export const SimpleProductCard = memo(({ product, className }: SimpleProductCardProps) => {
  return (
    <Link href={generateSlug(product)} prefetch={false} className="block group">
      <div className={cn("space-y-3", className)}>
        {/* Product Image */}
        <div className="relative aspect-square w-full overflow-hidden bg-gray-100 rounded-lg">
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            loading="lazy"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-1">
          {/* Brand/Retailer */}
          {product.retailer && (
            <p className="text-xs font-semibold text-gray-700">
              {product.retailer}
            </p>
          )}
          
          {/* Product Title */}
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {product.title}
          </h3>
          
          {/* Units and Discount Info */}
          {(product.unitsAvailable !== undefined || product.msrpDiscountPercent !== undefined) && (
            <div className="text-xs text-gray-500">
              {product.unitsAvailable !== undefined && (
                <span>{product.unitsAvailable.toLocaleString()} units</span>
              )}
              {product.unitsAvailable !== undefined && product.msrpDiscountPercent !== undefined && (
                <span> • </span>
              )}
              {product.msrpDiscountPercent !== undefined && (
                <span>{product.msrpDiscountPercent}% off MSRP</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
})

SimpleProductCard.displayName = 'SimpleProductCard' 