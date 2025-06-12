import Image from 'next/image';
import { Product } from '@/src/types';
import { BackButton } from './interactive/BackButton';
import { BidForm } from './interactive/BidForm';
import { BuyButton } from './interactive/BuyButton';
import { WishlistButton } from './interactive/WishlistButton';
import ProductGallery from './ProductGallery';
import { ProductJsonLd } from '@/src/components/seo/ProductJsonLd';

interface ProductDetailStaticProps {
  product: Product;
  additionalImages: string[];
}

/**
 * Server Component for product details
 * Contains static content and delegates interactive parts to client components
 */
export function ProductDetailStatic({ product, additionalImages }: ProductDetailStaticProps) {
  return (
    <>
      {/* Add structured data for SEO */}
      <ProductJsonLd product={product} />
      <div className="mb-6">
        <BackButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Gallery */}
        <ProductGallery
          mainImage={product.image}
          additionalImages={additionalImages}
          title={product.title}
        />

        {/* Product Info */}
        <div>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>

            {/* Price information with discount */}
            <div className="flex items-center mb-3">
              <p className="text-2xl font-bold text-blue-600 mr-3">${product.price.toLocaleString()}</p>
              {product.originalPrice && (
                <p className="text-lg text-gray-500 line-through">${product.originalPrice.toLocaleString()}</p>
              )}
              {product.discount && (
                <span className="ml-3 bg-red-100 text-red-700 text-sm font-medium px-2 py-1 rounded">
                  {product.discount}% OFF
                </span>
              )}
            </div>

            {/* Seller information */}
            {product.seller && (
              <div className="flex items-center mb-4 bg-gray-50 p-3 rounded-lg">
                {product.seller.logo && (
                  <div className="w-20 h-5 mr-3 relative overflow-hidden ">
                    <Image
                      src={product.seller.logo}
                      alt={product.seller.name}
                      fill
                      className="object-contain"
                      sizes="100px"
                    />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{product.seller.name}</p>
                  <p className="text-sm text-gray-600">Verified Seller</p>
                </div>
              </div>
            )}

            {/* Product details */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">Product Details</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-500">Condition</p>
                  <p className="font-medium">{product.condition || (product.isRefurbished ? 'Refurbished' : 'New')}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-500">Category</p>
                  <p className="font-medium">{product.category || 'General'}</p>
                </div>
                {product.shipping && (
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-500">Shipping</p>
                    <p className="font-medium text-green-600">{product.shipping}</p>
                  </div>
                )}
                {product.daysLeft && (
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-500">Availability</p>
                    <p className="font-medium text-amber-600">Only {product.daysLeft} days left</p>
                  </div>
                )}
              </div>
              <p className="text-gray-700">{product.description || 'No detailed description available for this product.'}</p>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              {product.bids !== undefined ? (
                <BidForm product={product} />
              ) : (
                <BuyButton product={product} />
              )}

              <WishlistButton productId={product.id} />
            </div>
          </div>

          {/* Product Details */}
          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-bold mb-4">Product Details</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                {product.category && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Category</p>
                    <p className="font-medium">{product.category}</p>
                  </div>
                )}
                {product.condition && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Condition</p>
                    <p className="font-medium">{product.condition}</p>
                  </div>
                )}
                {product.shipping && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Shipping</p>
                    <p className="font-medium">{product.shipping}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Placeholder */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
        <div className="bg-gray-100 p-12 rounded-lg text-center">
          <p className="text-gray-600">Related products will be available in future updates</p>
        </div>
      </div>
    </>
  );
} 