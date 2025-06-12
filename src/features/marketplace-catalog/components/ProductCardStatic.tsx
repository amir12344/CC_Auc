import Image from 'next/image'
import Link from 'next/link'
import { Product } from '@/src/types'
import { FavoriteButton } from '@/src/features/product-details/components/interactive/FavoriteButton'

interface ProductCardStaticProps {
  product: Product
  showActions?: boolean
  className?: string
}

/**
 * Server Component for the static parts of a product card
 */
export const ProductCardStatic = ({
  product,
  showActions = true,
  className = '',
}: ProductCardStaticProps) => {
  return (
    <div className={`group ${className}`}>
      {/* Product Image Container with gray background */}
      <div className='relative aspect-square w-full overflow-hidden bg-gray-100 rounded-lg mb-3'>
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          className='object-cover rounded-lg'
        />

        {/* Favorite button - Client Component */}
        {showActions && <FavoriteButton productId={product.id} />}

        {/* Seller badge - shown only if seller has logo */}
        {product.seller?.logo && (
          <div className='absolute top-2 left-2 z-10'>
            <div className='bg-orange-100 text-orange-900 rounded-lg p-1 flex items-center justify-center w-6 h-6'>
              <Image
                src={product.seller.logo}
                alt={product.seller.name || 'Seller'}
                width={16}
                height={16}
                className='object-contain'
              />
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <Link
        href={`/marketplace/product/${product.id}`}
        className='block'
        prefetch={false}
      >
        {/* Brand/Seller Name */}
        <h3 className='text-base font-bold text-gray-900'>
          {product.seller?.name || product.category || 'Brand'}
        </h3>

        {/* Product Title */}
        <h1 className='text-base text-gray-800 mb-1'>{product.title}</h1>

        {/* Units and Discount Info - Client Component will be inserted here */}
        <ProductMetadataPlaceholder />
      </Link>
    </div>
  )
}

/**
 * Placeholder for client-side product metadata
 * This will be replaced by the client component
 */
function ProductMetadataPlaceholder() {
  return null
} 