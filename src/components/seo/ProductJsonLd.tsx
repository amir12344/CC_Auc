'use client';

import { Product } from '@/src/types';

interface ProductJsonLdProps {
  product: Product;
}

/**
 * Product JSON-LD component
 * Adds structured data for products to improve SEO
 */
export function ProductJsonLd({ product }: ProductJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.image,
    description: product.description || `Buy ${product.title} at Commerce Central`,
    sku: product.id,
    mpn: product.id,
    brand: {
      '@type': 'Brand',
      name: product.seller?.name || 'Commerce Central',
    },
    offers: {
      '@type': 'Offer',
      url: `${typeof window !== 'undefined' ? window.location.href : ''}`,
      priceCurrency: 'USD',
      price: product.price,
      priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
      itemCondition: `https://schema.org/${product.condition || 'NewCondition'}`,
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: product.seller?.name || 'Commerce Central',
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

