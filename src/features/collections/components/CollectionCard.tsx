import Image from "next/image";
import Link from "next/link";

import { ShoppingBag, Sparkles } from "lucide-react";

import { Badge } from "@/src/components/ui/badge";

import type { Collection } from "../types/collections";

interface CollectionCardProps {
  collection: Collection;
}

/**
 * CollectionCard Component
 *
 * Simplified card design matching marketplace ProductCard style
 * - Clean, minimal design without buttons
 * - Focus on visual appeal and product count
 * - Hover effects for better interaction
 */
export const CollectionCard = ({ collection }: CollectionCardProps) => {
  return (
    <Link href={`/collections/${collection.slug}`} className="group block">
      <div className="space-y-3">
        {/* Collection Image */}
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gray-100">
          <Image
            src={collection.image}
            alt={collection.name}
            fill
            className="rounded-2xl object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            quality={85}
            placeholder="blur"
            blurDataURL="/images/placeholder-collection.jpg"
          />

          {/* Featured Badge */}
          {collection.featured && (
            <div className="absolute top-3 left-3">
              <Badge
                variant="secondary"
                className="bg-primary/90 text-primary-foreground border-0 backdrop-blur-sm"
              >
                <Sparkles className="mr-1 h-3 w-3" />
                Featured
              </Badge>
            </div>
          )}
        </div>

        {/* Collection Info */}
        <div className="space-y-1">
          {/* Collection Name */}
          <h3 className="group-hover:text-primary text-base font-bold text-gray-900 transition-colors">
            {collection.name}
          </h3>

          {/* Product Count */}
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <ShoppingBag className="h-4 w-4" />
            <span>
              {collection.productCount}{" "}
              {collection.productCount === 1 ? "product" : "products"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
