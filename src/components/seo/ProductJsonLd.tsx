'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/src/types';

interface ProductJsonLdProps {
  product: Product;
}

/**
 * Product JSON-LD component
 * Adds structured data for products to improve SEO
 */
export function ProductJsonLd({ product }: ProductJsonLdProps) {
  const [jsonString, setJsonString] = useState('');

  useEffect(() => {
    // Only run this on the client to prevent hydration mismatches
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.title,
      description: product.description,
      image: product.image,
      sku: product.id,
      mpn: product.id,
      brand: {
        '@type': 'Brand',
        name: product.seller?.name || 'Commerce Central',
      },
      offers: {
        '@type': 'Offer',
        url: window.location.href,
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

    setJsonString(JSON.stringify(jsonLd));
  }, [product]);

  // Don't render anything during SSR to prevent hydration mismatches
  if (!jsonString) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonString }}
    />
  );
}

