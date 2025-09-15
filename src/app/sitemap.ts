import type { MetadataRoute } from "next";

import { podcastEpisodesIndex } from "@/src/features/website/podcast/podcastEpisodes";
import { blogPosts, generateSlug } from "@/src/lib/blog-data";

// Function to get blog posts from your data source
function getBlogPosts() {
  return blogPosts.map((post) => ({
    slug: generateSlug(post.title),
    publishedAt: post.date,
    title: post.title,
    type: post.type,
  }));
}

// Function to get podcast episodes from existing podcast page data
function getPodcastEpisodes(): Array<{
  slug: string;
  publishedAt: string;
  title: string;
}> {
  // Use centralized index to avoid drift with route slugs
  return podcastEpisodesIndex.map((e) => ({
    slug: e.slug,
    publishedAt: e.date,
    title: e.title,
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.commercecentral.io";
  const currentDate = new Date();

  // Get blog posts dynamically
  const blogPostsData = getBlogPosts();

  // Get podcast episodes dynamically (ready for when podcast data exists)
  const podcastEpisodesData = getPodcastEpisodes();

  const staticPages = [
    // Main pages
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 1,
      images: [`${baseUrl}/CC_opengraph.png`],
    },
    {
      url: `${baseUrl}/website/buyer`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/website/seller`,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/website/blog/buyer`,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/website/blog/seller`,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/website/podcast`,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/website/team`,
      lastModified: currentDate,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    },
    // Legal pages
    {
      url: `${baseUrl}/website/legal/privacy-policy`,
      lastModified: currentDate,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/website/legal/terms`,
      lastModified: currentDate,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/website/legal/data-processing`,
      lastModified: currentDate,
      changeFrequency: "yearly" as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/website/legal/addendum`,
      lastModified: currentDate,
      changeFrequency: "yearly" as const,
      priority: 0.4,
    },
    // Hidden pages (lower priority)
    {
      url: `${baseUrl}/wholesale-pallet-liquidation`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/wholesale-liquidation-platform`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/online-liquidation-auctions`,
      lastModified: currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
  ];

  // Generate blog post URLs dynamically with type-based paths
  const blogPostUrls = blogPostsData.map((post) => ({
    url: `${baseUrl}/website/blog/${post.type}/${post.slug}`,
    lastModified: post.publishedAt ? new Date(post.publishedAt) : currentDate,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  // Generate podcast episode URLs dynamically (ready for when podcast data exists)
  const podcastEpisodeUrls =
    podcastEpisodesData.length > 0
      ? podcastEpisodesData.map((episode) => ({
          url: `${baseUrl}/website/podcast/${episode.slug}`,
          lastModified: episode.publishedAt
            ? new Date(episode.publishedAt)
            : currentDate,
          changeFrequency: "monthly" as const,
          priority: 0.6,
        }))
      : [];

  // Combine static pages with dynamic content
  return [...staticPages, ...blogPostUrls, ...podcastEpisodeUrls];
}
