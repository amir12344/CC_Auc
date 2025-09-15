import type { Metadata } from "next";
import Script from "next/script";

import type { Article, WithContext } from "schema-dts";

import { BlogPostDetailContent } from "@/src/features/website/components/blog/BlogPostDetailContent";
import {
  blogPosts,
  generateSlug,
  getPostByTypeAndSlug,
  getRelatedPosts,
} from "@/src/lib/blog-data";
import { generatePageBreadcrumbItems } from "@/src/utils/metadata";

// Generate static params for all buyer blog posts
export function generateStaticParams() {
  const buyerPosts = blogPosts.filter((post) => post.type === "buyer");

  return buyerPosts.map((post) => ({
    slug: generateSlug(post.title),
  }));
}

// Generate metadata for the buyer blog post page
export async function generateMetadata({
  params: paramsPromise,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await paramsPromise;
  const post = await getPostByTypeAndSlug("buyer", slug);

  if (!post) {
    return {
      title: "Post Not Found",
      description:
        "The blog post you're looking for doesn't exist or has been removed.",
    };
  }

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `https://www.commercecentral.io/website/blog/buyer/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://www.commercecentral.io/website/blog/buyer/${slug}`,
      type: "article",
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
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [post.thumbnailImage],
    },
    other: {
      "ld+json": JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "BreadcrumbList",
            itemListElement: generatePageBreadcrumbItems(
              `/website/blog/buyer/${slug}`,
              post.title
            ),
          },
          {
            "@type": "Article",
            headline: post.title,
            image: post.thumbnailImage,
            author: {
              "@type": "Person",
              name: "Commerce Central",
            },
            datePublished: new Date(post.date).toISOString(),
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://www.commercecentral.io/website/blog/buyer/${slug}`,
            },
          },
        ],
      }),
    },
  };
}

export default async function BuyerBlogPostPage({
  params: paramsPromise,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await paramsPromise;
  const post = await getPostByTypeAndSlug("buyer", slug);

  if (!post) {
    return (
      <div className="py-24 text-center">
        <h1 className="mb-4 text-3xl font-bold">Post Not Found</h1>
        <p>
          The blog post you&apos;re looking for doesn&apos;t exist or has been
          removed.
        </p>
      </div>
    );
  }

  const relatedPosts = (await getRelatedPosts(post)).slice(0, 3);

  return (
    <div className="bg-white">
      <BlogPostDetailContent initialPost={post} relatedPosts={relatedPosts} />
    </div>
  );
}
