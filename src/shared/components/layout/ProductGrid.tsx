import Image from "next/image";
import Link from "next/link";

import { ArrowRight, MapPin, Package, Star } from "lucide-react";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import type { Product } from "@/src/features/collections/types/collections";
import { cn } from "@/src/lib/utils";

interface ProductGridProps {
  products: Product[];
  className?: string;
  showPagination?: boolean;
  itemsPerPage?: number;
}

export const ProductGrid = ({
  products,
  className,
  showPagination = false,
  itemsPerPage = 12,
}: ProductGridProps) => {
  if (products.length === 0) {
    return (
      <div className="py-12 text-center">
        <Package className="mx-auto mb-4 h-16 w-16 text-gray-300" />
        <h3 className="mb-2 text-xl font-semibold text-gray-700">
          No Products Found
        </h3>
        <p className="text-gray-500">
          Try adjusting your filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4",
        className
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const discountPercent = product.discount
    ? Math.round(product.discount)
    : null;
  const originalPrice = discountPercent
    ? product.price / (1 - discountPercent / 100)
    : null;

  return (
    <Card className="group border-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-xl">
      <div className="relative overflow-hidden rounded-t-lg">
        <Image
          src={product.image}
          alt={product.title}
          width={300}
          height={200}
          className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discountPercent && (
            <Badge className="bg-red-500 font-semibold text-white hover:bg-red-600">
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

      <CardContent className="space-y-3 p-4">
        {/* Category */}
        {product.category && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <span>{product.category}</span>
          </div>
        )}

        {/* Title */}
        <h3 className="line-clamp-2 font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
          {product.title}
        </h3>

        {/* Location */}
        {product.location && (
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="h-3 w-3" />
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
                    "h-3 w-3",
                    i < Math.floor(product.rating!)
                      ? "fill-current text-yellow-400"
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {product.rating}{" "}
              {product.reviewCount && `(${product.reviewCount})`}
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
          <Button className="group/btn w-full">
            View Details
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};
