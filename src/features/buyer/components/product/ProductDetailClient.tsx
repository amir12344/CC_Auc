'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Product } from '@/src/types';
import { ProductJsonLd } from '@/src/components/seo/ProductJsonLd';
import { DynamicBreadcrumb } from '@/src/components/ui/DynamicBreadcrumb';

// Dynamically import heavy components with proper loading
const ProductGallery = dynamic(() => import('./ProductGallery'), {
  loading: () => <div className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>,
  ssr: true
});

const BuyButton = dynamic(() => import('./interactive/BuyButton').then(mod => ({ default: mod.BuyButton })), {
  loading: () => <div className="h-12 bg-gray-200 rounded animate-pulse"></div>,
  ssr: false
});

const BidForm = dynamic(() => import('./interactive/BidForm').then(mod => ({ default: mod.BidForm })), {
  loading: () => <div className="h-12 bg-gray-200 rounded animate-pulse"></div>,
  ssr: false
});

const WishlistButton = dynamic(() => import('./interactive/WishlistButton').then(mod => ({ default: mod.WishlistButton })), {
  loading: () => <div className="h-12 bg-gray-200 rounded animate-pulse"></div>,
  ssr: false
});

interface ProductDetailClientProps {
  product: Product;
  additionalImages: string[];
}

/**
 * Optimized Client Component for product details
 * Uses code splitting and lazy loading for better performance
 */
export function ProductDetailClient({ product, additionalImages }: ProductDetailClientProps) {
  // State to track if component is mounted (for hydration safety)
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state after hydration
  useEffect(() => {
    setIsMounted(true);

    // Prefetch related products
    if (product.category) {
      // This would prefetch related products based on category
      // We could implement this with a data fetching hook
    }
  }, [product.category]);

  return (
    <>
      {/* Add structured data for SEO */}
      <ProductJsonLd product={product} />

      <div className="mb-6">
        <DynamicBreadcrumb productTitle={product.title} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 bg-white rounded-xl shadow-xs overflow-hidden border border-gray-100">
        {/* Product Gallery */}
        <div className="p-6 lg:p-8 bg-gray-50 border-r border-gray-100">
          <ProductGallery
            mainImage={product.image}
            additionalImages={additionalImages}
            title={product.title}
          />
        </div>

        {/* Product Info */}
        <div className="p-6 lg:p-8">
          <div className="mb-8">
            {/* Seller Information */}
            {product.seller && (
              <div className="mb-6 bg-linear-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100 shadow-xs">
                <div className="flex items-center">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden bg-white mr-4 border-2 border-white shadow-xs">
                    <Image
                      src={product.seller.logo}
                      alt={product.seller.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Sold by</p>
                    <p className="font-bold text-gray-900 text-lg">{product.seller.name}</p>
                  </div>
                  <div className="ml-auto flex flex-col items-end">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified Seller
                    </span>
                    <span className="text-xs text-gray-500 mt-1">Member since 2023</span>
                  </div>
                </div>
              </div>
            )}

            {/* Title and Price */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">{product.title}</h1>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-primary-600 mr-2">
                    ${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-lg text-gray-500 line-through">
                      ${typeof product.originalPrice === 'number'
                        ? product.originalPrice.toFixed(2)
                        : product.originalPrice}
                    </span>
                  )}
                </div>
                {product.discount && (
                  <div className="flex items-center bg-green-50 border border-green-200 rounded-lg px-3 py-1.5 shadow-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium text-green-800">
                      Save {product.discount}% <span className="hidden sm:inline">off original price</span>
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500">4.0 out of 5</span>
                </div>
                <span className="w-1 h-1 mx-2 bg-gray-400 rounded-full"></span>
                <span className="text-sm font-medium text-primary-600 hover:underline cursor-pointer">73 reviews</span>
              </div>
            </div>

            {/* Product Badges */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-6">
              {product.isRefurbished && (
                <div className="flex items-center px-3 py-1.5 bg-amber-50 text-amber-800 rounded-lg border border-amber-200 shadow-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Refurbished</span>
                </div>
              )}
              {product.condition && (
                <div className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-800 rounded-lg border border-blue-200 shadow-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">{product.condition}</span>
                </div>
              )}
              {product.isAlmostGone && (
                <div className="flex items-center px-3 py-1.5 bg-red-50 text-red-800 rounded-lg border border-red-200 shadow-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Almost Gone</span>
                </div>
              )}
              {product.category && (
                <div className="flex items-center px-3 py-1.5 bg-purple-50 text-purple-800 rounded-lg border border-purple-200 shadow-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                  </svg>
                  <span className="font-medium">{product.category}</span>
                </div>
              )}
            </div>

            {/* Product Description */}
            <div className="mb-6">
              <div className="flex items-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <h2 className="text-lg font-semibold text-gray-900">Product Description</h2>
              </div>
              <div className="p-5 bg-linear-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-xs">
                <p className="text-gray-700 leading-relaxed">
                  {product.description || 'No detailed description available for this product.'}
                </p>
                {product.description && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Key Features:</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
                      <li>Premium quality materials</li>
                      <li>Designed for durability and performance</li>
                      <li>Easy to use and maintain</li>
                      <li>Backed by our satisfaction guarantee</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping and Availability */}
            <div className="mb-6">
              <div className="flex items-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                </svg>
                <h2 className="text-lg font-semibold text-gray-900">Delivery & Availability</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.shipping && (
                  <div className="bg-linear-to-br from-blue-50 to-white p-4 rounded-xl border border-blue-100 shadow-xs">
                    <div className="flex items-center mb-2">
                      <div className="bg-blue-100 p-2 rounded-full mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                        </svg>
                      </div>
                      <p className="font-semibold text-gray-900 text-lg">Shipping</p>
                    </div>
                    <p className="text-gray-700 ml-10">{product.shipping}</p>
                    <div className="mt-3 ml-10 text-sm text-blue-700">
                      <span className="font-medium cursor-pointer hover:underline">Check delivery time for your location</span>
                    </div>
                  </div>
                )}
                {product.daysLeft && (
                  <div className="bg-linear-to-br from-amber-50 to-white p-4 rounded-xl border border-amber-100 shadow-xs">
                    <div className="flex items-center mb-2">
                      <div className="bg-amber-100 p-2 rounded-full mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="font-semibold text-gray-900 text-lg">Limited Availability</p>
                    </div>
                    <div className="ml-10">
                      <div className="flex items-center mb-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-amber-600 h-2.5 rounded-full" style={{ width: '35%' }}></div>
                        </div>
                        <span className="ml-2 text-sm font-medium text-gray-700">35% left</span>
                      </div>
                      <p className="text-amber-700 font-medium">Only available for {product.daysLeft} more days</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Product Details */}
            <div className="mb-6">
              <div className="flex items-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
                </svg>
                <h2 className="text-lg font-semibold text-gray-900">Product Specifications</h2>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                  <div className="p-4">
                    <table className="w-full">
                      <tbody>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 text-sm font-medium text-gray-500">Product ID</td>
                          <td className="py-2 text-sm text-gray-900 font-medium">{product.id}</td>
                        </tr>
                        {product.category && (
                          <tr className="border-b border-gray-100">
                            <td className="py-2 text-sm font-medium text-gray-500">Category</td>
                            <td className="py-2 text-sm text-gray-900">{product.category}</td>
                          </tr>
                        )}
                        {product.condition && (
                          <tr className="border-b border-gray-100">
                            <td className="py-2 text-sm font-medium text-gray-500">Condition</td>
                            <td className="py-2 text-sm text-gray-900">{product.condition}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-4">
                    <table className="w-full">
                      <tbody>
                        {product.bids !== undefined && (
                          <tr className="border-b border-gray-100">
                            <td className="py-2 text-sm font-medium text-gray-500">Current Bids</td>
                            <td className="py-2 text-sm text-gray-900">{product.bids}</td>
                          </tr>
                        )}
                        {product.timeLeft && (
                          <tr className="border-b border-gray-100">
                            <td className="py-2 text-sm font-medium text-gray-500">Time Left</td>
                            <td className="py-2 text-sm text-gray-900">{product.timeLeft}</td>
                          </tr>
                        )}
                        <tr>
                          <td className="py-2 text-sm font-medium text-gray-500">SKU</td>
                          <td className="py-2 text-sm text-gray-900">SKU-{product.id.toUpperCase()}-2023</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          {isMounted && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
                <h2 className="text-lg font-semibold text-gray-900">Take Action</h2>
              </div>
              <div className="space-y-6">
                {product.bids !== undefined ? (
                  <div className="bg-linear-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-5 border border-indigo-100 shadow-xs">
                    <div className="flex items-center mb-3">
                      <div className="bg-indigo-100 p-2 rounded-full mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-700" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Auction in Progress</h3>
                        <p className="text-sm text-indigo-700">
                          <span className="font-medium">{product.bids}</span> bids so far. Place your bid now!
                        </p>
                      </div>
                    </div>
                    <BidForm product={product} />
                    <p className="text-xs text-gray-500 mt-3 text-center">By placing a bid, you agree to our terms and conditions</p>
                  </div>
                ) : (
                  <div className="bg-linear-to-r from-primary-50 via-primary-100 to-primary-50 rounded-xl p-5 border border-primary-200 shadow-xs">
                    <div className="flex items-center mb-3">
                      <div className="bg-primary-100 p-2 rounded-full mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-700" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">Ready to Purchase</h3>
                        <p className="text-sm text-primary-700">In stock and ready to ship!</p>
                      </div>
                    </div>
                    <BuyButton product={product} />
                    <div className="flex items-center justify-center mt-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-xs text-gray-500">Secure checkout with SSL encryption</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between p-5 bg-linear-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 shadow-xs">
                  <div>
                    <p className="font-medium text-gray-900 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      Save for Later
                    </p>
                    <p className="text-sm text-gray-600 ml-7">Add this item to your wishlist</p>
                  </div>
                  <WishlistButton productId={product.id} />
                </div>

                {/* Satisfaction Guarantee */}
                <div className="p-5 bg-linear-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 shadow-xs">
                  <div className="flex items-start">
                    <div className="bg-green-100 p-2 rounded-full mr-4 mt-0.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">100% Satisfaction Guarantee</h3>
                      <p className="text-sm text-gray-700 leading-relaxed">We stand behind our products with a 30-day money-back guarantee. If you&apos;re not completely satisfied with your purchase, simply return it for a full refund.</p>
                      <div className="mt-3">
                        <a href="#" className="text-sm font-medium text-green-700 hover:text-green-800 flex items-center">
                          Learn more about our return policy
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

