'use client';

import { usePathname } from 'next/navigation';
import Head from 'next/head';
import { useEffect, useState } from 'react';

interface OpenGraphImage {
  url: string;
}

interface OpenGraphProps {
  title?: string;
  description?: string;
  images?: OpenGraphImage[];
}

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  openGraph?: OpenGraphProps;
}

/**
 * A component for dynamically updating metadata based on the current page
 */
export default function DynamicMetadata({
  title,
  description,
  canonical,
  openGraph,
}: SEOProps) {
  const pathname = usePathname();
  const [url, setUrl] = useState('');

  useEffect(() => {
    // Set the URL when the component mounts
    setUrl(window.location.origin + pathname);
  }, [pathname]);

  // Generate the canonical URL
  const canonicalUrl = canonical || url;

  return (
    <Head>
      {/* Basic metadata */}
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Open Graph metadata */}
      {title && <meta property="og:title" content={openGraph?.title || title} />}
      {description && <meta property="og:description" content={openGraph?.description || description} />}
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      
      {/* Open Graph images */}
      {openGraph?.images?.map((image, index) => (
        <meta key={`og-image-${index}`} property="og:image" content={image.url} />
      ))}
    </Head>
  );
}
