import MainLayout from '@/src/components/layout/MainLayout';
import { notFound } from 'next/navigation';
import { fetchProduct } from '@/src/lib/api/productApi';
import { spotlightDeal, trendingDeals, featuredDeals, moreDeals, bargainListings, amazonListings } from '@/src/mocks/productData';
import { findProductBySlugOrId } from '@/src/utils/slug-utils';
import { ProductDetailClient } from '@/src/features/product-details/components/ProductDetailClient';
import { DynamicBreadcrumb } from '@/src/components/ui/DynamicBreadcrumb';
import { Product } from '@/src/types';

// DUMMY DATA (as defined previously, for the new components)
// This should align with the interfaces used by ProductDisplay, ProductMetrics, ProductVariantsTable
const DUMMY_PRODUCT_DETAILS_FOR_NEW_LAYOUT = {
  id: 'mepal-123',
  // We'll use the actual product image from the Product object in mergeData logic
  imageUrl: '', // This will be replaced with the actual product.image in ProductDetailClient
  name: 'Mepal',
  category: 'Food Storage, Dishes & More',
  totalAskingPrice: '$500,000.00+',
  msrpPercentage: '58% off MSRP',
  leadTime: '3 weeks',
  description: 'This assortment includes food storage containers, bowls, and baby feeding items from Mepal, a well-established Dutch brand known for practical home and kitchen solutions. Products are BPA-free, dishwasher safe, and designed for durability and daily use. Variants include round and rectangular multi bowls, airtight EasyClip storage, and modular feeding accessories. Mepal products are widely retailed across Europe through online and in-store channels and are positioned in the mid-tier pricing range.',
  unitsInListing: '144,000 units',
  avgPricePerUnit: '$3.78',
  minOrderValue: '$35,294.12',
  location: 'Amsterdam, Netherlands',
  packaging: 'Retail Ready',
  shipWindow: '30 days',
};

const DUMMY_PRODUCT_VARIANTS_FOR_NEW_LAYOUT = [
  {
    id: '1',
    productName: 'Glass Flow 275 Ml',
    variants: 3,
    msrp: 4.52,
    pricePerUnit: 2.29,
    totalUnits: 6000,
    totalPrice: 13740.00,
    imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: '2',
    productName: 'Breakfast Plate P220',
    variants: 3,
    msrp: 4.52,
    pricePerUnit: 2.29,
    totalUnits: 6000,
    totalPrice: 13740.00,
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: '3',
    productName: 'Serving Bowl Silueta 250 Ml',
    variants: 3,
    msrp: 5.66,
    pricePerUnit: 2.86,
    totalUnits: 6000,
    totalPrice: 17160.00,
    imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: '4',
    productName: 'Soup Cup 421',
    variants: 2,
    msrp: 3.96,
    pricePerUnit: 2.00,
    totalUnits: 4000,
    totalPrice: 8000.00,
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: '5',
    productName: 'Storage Box Q Lumina 250 MI',
    variants: 2,
    msrp: 4.52,
    pricePerUnit: 2.29,
    totalUnits: 4000,
    totalPrice: 9160.00,
    imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: '6',
    productName: 'Fruit Box Take A Break',
    variants: 2,
    msrp: 5.66,
    pricePerUnit: 2.86,
    totalUnits: 2000,
    totalPrice: 5720.00,
    imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: '7',
    productName: 'Spatula Chef It Smart 205 Mm',
    variants: 2,
    msrp: 11.59,
    pricePerUnit: 2.86,
    totalUnits: 4000,
    totalPrice: 11440.00,
    imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
];

// Enable Incremental Static Regeneration with a longer revalidation period for better performance
export const revalidate = 3600; // 1 hour

// Combine all product data sources
const allProductsFromData = [...spotlightDeal, ...trendingDeals, ...featuredDeals, ...moreDeals, ...bargainListings, ...amazonListings];

/**
 * Optimized Product Details Page - Server Component
 * Uses direct data access in development mode, with improved caching
 */
export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const product = findProductBySlugOrId(allProductsFromData, id);

    if (!product) {
      notFound(); // This will stop execution and show a 404 page
      return; // Ensure no further code in the try block is executed if product not found
    }

    // If product is found, proceed:
    const productTitle = product.title || DUMMY_PRODUCT_DETAILS_FOR_NEW_LAYOUT.name;

    // Use the actual product's image for the main image and create some variations for the gallery
    const additionalImagesForClient = [
      product.image,
      // Simple variations for gallery - in a real app, these might come from product data
      product.image.replace(/\?.*$/, '?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=704&q=80'),
      product.image.replace(/\?.*$/, '?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=705&q=80'),
    ];

    return (
      <MainLayout>
        <div className="bg-white min-h-screen">
          {/* Breadcrumb Navigation */}
          <div className="border-b border-gray-100">
            <div className="max-w-8xl mx-auto px-6 py-4">
              <DynamicBreadcrumb productTitle={productTitle} />
            </div>
          </div>

          <div className="max-w-8xl mx-auto px-6 py-6">

            <ProductDetailClient
              product={product} // product is guaranteed to be non-null here due to the check above
              additionalImages={additionalImagesForClient}
              newLayoutProductDetails={{
                ...DUMMY_PRODUCT_DETAILS_FOR_NEW_LAYOUT, // Base dummy data
                id: product.id, // Override with actual product data
                imageUrl: product.image,
                name: product.title,
                category: product.category,
                description: product.description || DUMMY_PRODUCT_DETAILS_FOR_NEW_LAYOUT.description,
                // Other fields can be mapped here if they exist on the Product type
                // and are needed by ProductDisplay, ProductMetrics etc.
              }}
              newLayoutProductVariants={DUMMY_PRODUCT_VARIANTS_FOR_NEW_LAYOUT} // Still using dummy variants
              showBreadcrumb={false}
            />
          </div>
        </div>
      </MainLayout>
    );

  } catch (error) {
    console.error(`Error processing product with ID ${id}:`, error);
    notFound();
  }
}
