"use client";

import Image from "next/image";
import Link from "next/link";
import { memo } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { cn } from "@/src/lib/utils";
import { Product } from "@/src/types";
import { generateSlug } from "@/src/utils/product-utils";

interface ProductCardProps {
  product: Product;
  className?: string;
  darkMode?: boolean;
}

/**
 * ProductCard - Optimized Client Component
 * Memoized for performance with product list rendering
 */
const ProductCard = memo(
  ({ product, className, darkMode = false }: ProductCardProps) => {
    return (
      <Link href={generateSlug(product)} prefetch={false} className="block">
        <Card
          className={cn(
            "aspect-square w-full min-w-0 gap-4 border-none bg-transparent p-0 shadow-none",
            className
          )}
        >
          <CardContent className="p-0">
            <Image
              src={product.image}
              alt={product.title}
              width={600}
              height={600}
              quality={70}
              className="aspect-square w-full rounded-2xl object-cover"
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </CardContent>
          <CardHeader className="gap-1 p-0 pt-2">
            {product.retailer && (
              <CardDescription
                className={cn(
                  "text-xs font-semibold",
                  darkMode
                    ? "text-gray-300"
                    : "text-gray-700 dark:text-gray-400"
                )}
              >
                {product.retailer}
              </CardDescription>
            )}
            <CardTitle
              className={cn(
                "text-sm leading-tight font-medium tracking-tight",
                darkMode ? "text-white" : "text-gray-900"
              )}
            >
              {product.title}
            </CardTitle>
            {(product.unitsAvailable !== undefined ||
              product.msrpDiscountPercent !== undefined) && (
              <div
                className={cn(
                  "mt-0.5 text-xs",
                  darkMode
                    ? "text-gray-400"
                    : "text-gray-500 dark:text-gray-500"
                )}
              >
                {product.unitsAvailable !== undefined && (
                  <span>{product.unitsAvailable.toLocaleString()} units</span>
                )}
                {product.unitsAvailable !== undefined &&
                  product.msrpDiscountPercent !== undefined && <span> • </span>}
                {product.msrpDiscountPercent !== undefined && (
                  <span>{product.msrpDiscountPercent}% off MSRP</span>
                )}
              </div>
            )}
          </CardHeader>
        </Card>
      </Link>
    );
  }
);

ProductCard.displayName = "ProductCard";

export default ProductCard;
