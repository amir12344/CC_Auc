"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";

import { BlogPost, getBlogPostUrl } from "@/src/lib/blog-data";

import TestimonialsSection from "../sections/OnboardingSection";

interface BlogPostDetailContentProps {
  initialPost: BlogPost;
  relatedPosts: BlogPost[];
}

export const BlogPostDetailContent = ({
  initialPost,
  relatedPosts,
}: BlogPostDetailContentProps) => {
  const [post] = useState(initialPost);
  const [posts] = useState(relatedPosts);

  // Function to process the HTML content and add Tailwind classes
  const processContent = (html: string) => {
    // First, process all the other elements
    let processedContent = html
      .replace(/<h1/g, '<h1 class="text-4xl font-bold mb-6 text-gray-900"')
      .replace(/<h2/g, '<h2 class="text-3xl font-bold mt-8 mb-4 text-gray-900"')
      .replace(
        /<h3/g,
        '<h3 class="text-2xl font-semibold mt-6 mb-3 text-gray-900"'
      )
      .replace(/<p>/g, '<p class="text-lg leading-relaxed mb-6 text-gray-700">')
      .replace(/<ul>/g, '<ul class="list-disc pl-6 mb-6">')
      .replace(/<li>/g, '<li class="text-lg mb-2 text-gray-700">')
      .replace(
        /<table/g,
        '<table class="w-full border-collapse border border-gray-300 mb-6 overflow-x-auto block"'
      )
      .replace(/<thead/g, '<thead class="bg-gray-50"')
      .replace(/<tbody/g, '<tbody class="divide-y divide-gray-200"')
      .replace(/<tr/g, '<tr class="hover:bg-gray-50"')
      .replace(
        /<th/g,
        '<th class="px-4 py-3 text-left text-sm font-medium text-gray-900 border-b border-gray-300 whitespace-nowrap"'
      )
      .replace(
        /<td/g,
        '<td class="px-4 py-3 text-sm text-gray-700 border-b border-gray-300 whitespace-nowrap"'
      );

    // Process links - convert to Next.js Link for internal links
    processedContent = processedContent.replace(
      /<a\s+([^>]*)href=(["'])(.*?)\2([^>]*)>([^<]*)<\/a>/g,
      (match, attrsBefore, quote, href, attrsAfter, linkText) => {
        const isExternal = href.startsWith("http") || href.startsWith("//");
        const className = "text-blue-600 hover:text-blue-800 underline";
        const attrs = `${attrsBefore} ${attrsAfter}`.trim();
        const attrsWithoutClass = attrs
          .replace(/class=["'][^"']*["']/g, "")
          .trim();

        if (isExternal) {
          // For external links, keep as <a> but add target and rel
          return `<a href="${href}" class="${className}" ${attrsWithoutClass} target="_blank" rel="noopener noreferrer">${linkText}</a>`;
        } else {
          // For internal links, use Next.js Link
          return `<Link href="${href}" className="${className}" ${attrsWithoutClass}>${linkText}</Link>`;
        }
      }
    );

    return processedContent;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative flex h-[50vh] w-full items-center justify-center overflow-hidden bg-[#102D21] text-white md:h-[60vh]">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={post.bannerImage}
            alt={post.title}
            fill
            priority
            unoptimized
            quality={100}
          />
          <div className="absolute inset-0 bg-[#102D21] opacity-70"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="mb-6 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-[#D8F4CC] md:gap-6">
            <div className="flex items-center">
              <Calendar size={16} className="mr-2" />
              <span>{post.date}</span>
            </div>
            <div className="flex items-center">
              <Tag size={16} className="mr-2" />
              <span>{post.category}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-8xl mx-auto rounded-xl bg-white p-2">
            {/* Content */}
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: processContent(post.content) }}
            />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-10 border-t border-gray-200 pt-6">
                <h3 className="mb-3 text-lg font-medium">Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <div
                      key={index}
                      className="rounded-full bg-[#E0D6C2] px-3 py-1 text-sm text-[#102D21] duration-200"
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Posts Section */}
            {posts.length > 0 && (
              <div className="mt-20 w-full">
                <h2 className="mb-10 text-center text-3xl font-bold text-[#102D21]">
                  More from the Commerce Central Blog
                </h2>
                <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 md:grid-cols-2 lg:grid-cols-3">
                  {posts.map((relatedPost) => (
                    <Link
                      key={relatedPost.id}
                      href={getBlogPostUrl(relatedPost)}
                      className="group block h-full w-full"
                    >
                      <article
                        className="relative flex h-full flex-col overflow-hidden rounded-xl bg-white transition-all duration-300 hover:translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(67,205,102,0.8)]"
                        style={{
                          borderRadius: "13.632px",
                          border: "1px solid #E0D6C2",
                        }}
                      >
                        {/* Post Image */}
                        <div className="relative h-48 overflow-hidden">
                          <Image
                            src={relatedPost.thumbnailImage}
                            alt={relatedPost.title}
                            fill
                            unoptimized
                            quality={100}
                            className="transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>

                        {/* Post Details */}
                        <div className="flex flex-grow flex-col p-6">
                          <h3 className="mb-2 line-clamp-2 text-lg font-[500] text-[#102D21]">
                            {relatedPost.title}
                          </h3>
                          <div className="flex items-center text-sm text-gray-500">
                            <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#43CD66] text-white">
                              <Calendar size={14} />
                            </span>
                            {relatedPost.date}
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="text-center">
          <Link
            href="/website/blog/buyer"
            className="mb-6 inline-flex items-center text-xl text-[#43CD66] hover:underline"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to all articles
          </Link>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />
    </div>
  );
};
