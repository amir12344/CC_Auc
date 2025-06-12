import { cn } from "@/src/lib/utils"
import { Card, CardContent } from '@/src/components/ui/card'
import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { Star, MapPin, Package, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/src/features/collections/types/collections'

interface ProductGridProps {
  products: Product[]
  className?: string
  showPagination?: boolean
  itemsPerPage?: number
}

export const ProductGrid = ({ 
  products, 
  className,
  showPagination = false,
  itemsPerPage = 12
}: ProductGridProps) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Products Found</h3>
        <p className="text-gray-500">Try adjusting your filters or search terms.</p>
      </div>
    )
  }

  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6", className)}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

interface ProductCardProps {
  product: Product
}

const ProductCard = ({ product }: ProductCardProps) => {
  const discountPercent = product.discount ? Math.round(product.discount) : null
  const originalPrice = discountPercent ? product.price / (1 - discountPercent / 100) : null

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm hover:shadow-xl hover:-translate-y-1">
      <div className="relative overflow-hidden rounded-t-lg">
        <Image
          src={product.image}
          alt={product.title}
          width={300}
          height={200}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discountPercent && (
            <Badge className="bg-red-500 hover:bg-red-600 text-white font-semibold">
              -{discountPercent}%
            </Badge>
          )}
          {product.isRefurbished && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Refurbished
            </Badge>
          )}
        </div>

        {/* Stock indicator */}
        {product.stock && product.stock < 10 && (
          <div className="absolute top-3 right-3">
            <Badge variant="destructive" className="text-xs">
              Only {product.stock} left
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Category */}
        {product.category && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span>{product.category}</span>
          </div>
        )}

        {/* Title */}
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.title}
        </h3>

        {/* Location */}
        {product.location && (
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="w-3 h-3" />
            <span>{product.location}</span>
          </div>
        )}

        {/* Retailer */}
        {product.retailer && (
          <div className="text-sm text-gray-600">
            From <span className="font-medium">{product.retailer}</span>
          </div>
        )}

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-3 h-3",
                    i < Math.floor(product.rating!)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {product.rating} {product.reviewCount && `(${product.reviewCount})`}
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">
              ${product.price.toLocaleString()}
            </span>
            {originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ${originalPrice.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <Link href={`/marketplace/product/${product.id}`} className="block">
          <Button className="w-full group/btn">
            View Details
            <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
} 