import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/src/components/ui/badge'
import { ShoppingBag, Sparkles } from 'lucide-react'
import type { Collection } from '../types/collections'

interface CollectionCardProps {
  collection: Collection
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
    <Link href={`/collections/${collection.slug}`} className="block group">
      <div className="space-y-3">
        {/* Collection Image */}
        <div className="relative aspect-square w-full overflow-hidden bg-gray-100 rounded-lg">
          <Image
            src={collection.image}
            alt={`${collection.name} collection`}
            fill
            className="object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          
          {/* Featured Badge */}
          {collection.featured && (
            <div className="absolute top-3 left-3">
              <Badge 
                variant="secondary" 
                className="bg-primary/90 text-primary-foreground backdrop-blur-sm border-0"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            </div>
          )}
        </div>

        {/* Collection Info */}
        <div className="space-y-1">
          {/* Collection Name */}
          <h3 className="text-base font-bold text-gray-900 group-hover:text-primary transition-colors">
            {collection.name}
          </h3>
          
          {/* Product Count */}
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <ShoppingBag className="w-4 h-4" />
            <span>
              {collection.productCount} {collection.productCount === 1 ? 'product' : 'products'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

/**
 * COMPONENT NOTES FOR DEVELOPERS:
 * 
 * 1. IMAGE OPTIMIZATION:
 *    - Uses Next.js Image component with proper sizes attribute
 *    - Responsive images with aspect ratio maintained
 *    - Lazy loading built-in for performance
 * 
 * 2. HOVER EFFECTS:
 *    - Card elevates slightly on hover (translate-y)
 *    - Image scales on hover for engagement
 *    - Color transitions for interactive feedback
 * 
 * 3. RESPONSIVE DESIGN:
 *    - Card adapts to different screen sizes via parent grid
 *    - Text truncation prevents layout breaking
 *    - Touch-friendly button sizing
 * 
 * 4. PERFORMANCE CONSIDERATIONS:
 *    - Minimal re-renders with stable props
 *    - CSS transitions instead of JavaScript animations
 *    - Optimized image loading with proper sizing
 * 
 * 5. FUTURE ENHANCEMENTS:
 *    - Could add collection preview on hover
 *    - Implement collection favoriting
 *    - Add collection sharing functionality
 */ 