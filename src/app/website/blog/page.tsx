import type { Metadata } from 'next';
import BlogPageClient from './page-client';

// SEO metadata for the blog page
export const metadata: Metadata = {
  title: 'Commerce Central - Blog',
  description: 'Read the latest insights, trends, and expert opinions on commerce, surplus inventory management, and industry developments from Commerce Central.',
  alternates: {
    canonical: 'https://www.commercecentral.io/website/blog'
  },
  openGraph: {
    url: 'https://www.commercecentral.io/website/blog',
    title: 'Commerce Central Blog',
    description: 'Stay updated with our latest blog posts covering commerce trends, industry insights, and expert analysis on surplus inventory management.',
    images: [
      {
        url: '/CC_opengraph.png',
        width: 500,
        height: 500,
        alt: 'Commerce Central Logo',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Commerce Central Blog',
    description: 'Stay updated with our latest blog posts covering commerce trends, industry insights, and expert analysis on surplus inventory management.',
    images: ['/CC_opengraph.png'],
  },
};

// Server Component wrapper that renders the client component
export default function BlogPage() {
  return <BlogPageClient />;
}