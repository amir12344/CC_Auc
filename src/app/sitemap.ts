import type { MetadataRoute } from 'next'
import { blogPosts, generateSlug } from '@/src/lib/blog-data'

// Function to get blog posts from your data source
function getBlogPosts() {
  return blogPosts.map(post => ({
    slug: generateSlug(post.title),
    publishedAt: post.date,
    title: post.title,
    type: post.type
  }))
}

// Function to get podcast episodes from existing podcast page data
function getPodcastEpisodes(): Array<{ slug: string; publishedAt: string; title: string }> {
  // Episodes with actual data from podcast/[slug]/page.tsx
  const episodesWithData = [
    {
      id: 1,
      title: 'What is ReCommerce?',
      date: '2025-05-29',
    }
  ];

  // Additional slugs from generateStaticParams (episodes that exist but don't have full data yet)
  const additionalSlugs = [
    'world-retail-congress-what-did-we-learn',
    'delivering-the-future-amazon-leaders-on-ai-robotics-last-mile-and-same-day-delivery',
    'aisle-to-algorithm-davids-bridals-new-ceo-on-retail-transformation'
  ];

  // Helper function to generate slug (same logic as in podcast page)
  const generatePodcastSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-');
  };

  // Convert episodes with data
  const episodeUrls = episodesWithData.map(episode => ({
    slug: generatePodcastSlug(episode.title),
    publishedAt: episode.date,
    title: episode.title
  }));

  // Convert additional slugs to sitemap entries
  const additionalUrls = additionalSlugs.map(slug => ({
    slug,
    publishedAt: '2025-05-29', // Default date
    title: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) // Convert slug to title
  }));

  return [...episodeUrls, ...additionalUrls];
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.commercecentral.io'
  const currentDate = new Date()

  // Get blog posts dynamically
  const blogPostsData = getBlogPosts()
  
  // Get podcast episodes dynamically (ready for when podcast data exists)
  const podcastEpisodesData = getPodcastEpisodes()

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
      url: `${baseUrl}/website/podcast`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/website/team`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
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

  // Generate blog post URLs dynamically with type-based paths
  const blogPostUrls = blogPostsData.map((post) => ({
    url: `${baseUrl}/website/blog/${post.type}/${post.slug}`,
    lastModified: post.publishedAt ? new Date(post.publishedAt) : currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // Generate podcast episode URLs dynamically (ready for when podcast data exists)
  const podcastEpisodeUrls = podcastEpisodesData.length > 0 ? podcastEpisodesData.map((episode) => ({
    url: `${baseUrl}/website/podcast/${episode.slug}`,
    lastModified: episode.publishedAt ? new Date(episode.publishedAt) : currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  })) : []

  // Combine static pages with dynamic content
  return [...staticPages, ...blogPostUrls, ...podcastEpisodeUrls]
} 