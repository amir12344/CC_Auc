import Image from 'next/image';
import { Product } from '@/src/types'; // Assuming Product type is available

interface ProductCardDisplayProps {
  product: Product;
  textColorVariant?: 'light' | 'dark';
}

/**
 * ProductCardDisplay component (Server-Renderable)
 * Renders the static visual structure of a product card.
 */
export const ProductCardDisplay = ({ 
  product,
  textColorVariant = 'light' 
}: ProductCardDisplayProps) => {

  // Determine text colors based on variant - these are static based on props
  const dynamicBrandColor = textColorVariant === 'dark' ? 'text-white' : 'text-gray-900';
  const dynamicTitleColor = textColorVariant === 'dark' ? 'text-[#ffff]' : 'text-[#1C1E21]';
  // Note: dynamicInfoColor for units/discount is handled in the interactive wrapper

  return (
    // The outer div with group and rounded-lg will be handled by the interactive wrapper
    // to ensure hover effects apply correctly to client-side elements too.
    <>
      {/* Product Image Container with gray background */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100 rounded-lg mb-3">
        <Image
          src={product.image}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover rounded-lg"
          loading="lazy" // Keep lazy for non-LCP images
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEDQIHq4C7aQAAAABJRU5ErkJggg=="
        />
        {/* Favorite button and Seller badge will be overlaid by the interactive wrapper */}
      </div>

      {/* Static Product Info - Link wrapper will be added by interactive component */}
      {/* Brand/Seller Name */}
      <h3 className={`text-base font-bold truncate ${dynamicBrandColor}`}>
        {product.seller?.name || product.category || 'Brand'}
      </h3>

      {/* Product Title */}
      <h4 className={`text-sm font-[500] line-clamp-2 mb-1 ${dynamicTitleColor}`}>
        {product.title}
      </h4>
    </>
  );
};