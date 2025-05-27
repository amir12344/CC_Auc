import type { Metadata } from 'next';
import { BlogPostDetailContent } from '@/src/features/website/components/blog/BlogPostDetailContent';
import { BlogPost, getPostBySlug, getRelatedPosts } from '@/src/lib/blog-data';
import { Article, WithContext } from 'schema-dts';

// Generate metadata for the page
export async function generateMetadata(
  { params: paramsPromise }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await paramsPromise;
  const post = await getPostBySlug(slug); // Assuming getPostBySlug might be async

  if (!post) {
    return {
      title: 'Post Not Found | Commerce Central Blog',
      description: 'The blog post you\'re looking for doesn\'t exist or has been removed.'
    };
  }

  return {
    title: `${post.title} | Commerce Central Blog`,
    alternates: {
      canonical: `https://www.commercecentral.io/website/blog/${slug}`
    },
    openGraph: {
      title: `${post.title} | Commerce Central Blog`,
      url: `https://www.commercecentral.io/website/blog/${slug}`,
      type: 'article',
      publishedTime: new Date(post.date).toISOString(),
      images: [
        {
          url: post.thumbnailImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} | Commerce Central Blog`,
      images: [post.thumbnailImage],
    },
  };
}

export default async function BlogPostPage({ params: paramsPromise }: { params: Promise<{ slug: string }> }) {
  const { slug } = await paramsPromise;
  const post = await getPostBySlug(slug);

  if (!post) {
    return (
      <div className="py-24 text-center">
        <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
        <p>The blog post you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  const relatedPosts = (await getRelatedPosts(post)).slice(0, 3);

  const articleSchema: WithContext<Article> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    image: post.thumbnailImage,
    author: {
      '@type': 'Person',
      name: 'Commerce Central',
    },
    datePublished: new Date(post.date).toISOString(),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.commercecentral.io/website/blog/${slug}`,
    },
  };

  return (
    <div className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <BlogPostDetailContent initialPost={post} relatedPosts={relatedPosts} />
    </div>
  );
}