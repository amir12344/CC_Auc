import type { MetadataRoute } from 'next'
import { blogPosts, generateSlug } from '@/src/lib/blog-data'

// Function to get blog posts from your data source
function getBlogPosts() {
  return blogPosts.map(post => ({
    slug: generateSlug(post.title),
    publishedAt: post.date,
    title: post.title
  }))
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.commercecentral.io'
  const currentDate = new Date()

  // Get blog posts dynamically
  const blogPostsData = getBlogPosts()

  const staticPages = [
    // Main pages
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 1,
      images: [`${baseUrl}/CC_opengraph.png`],
    },
    {
      url: `${baseUrl}/website`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
      images: [`${baseUrl}/CC_opengraph.png`],
    },
    {
      url: `${baseUrl}/website/buyer`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/website/seller`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/website/blog`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/website/team`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/earlyaccess`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    // Legal pages
    {
      url: `${baseUrl}/website/legal/privacy-policy`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/website/legal/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/website/legal/data-processing`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/website/legal/addendum`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.4,
    },
    // Hidden pages (lower priority)
    {
      url: `${baseUrl}/wholesale-pallet-liquidation`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/wholesale-liquidation-platform`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/online-liquidation-auctions`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ]

  // Generate blog post URLs dynamically
  const blogPostUrls = blogPostsData.map((post) => ({
    url: `${baseUrl}/website/blog/${post.slug}`,
    lastModified: post.publishedAt ? new Date(post.publishedAt) : currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // Combine static pages with dynamic blog posts
  return [...staticPages, ...blogPostUrls]
} 