'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, Tag, ArrowLeft } from 'lucide-react';
import TestimonialsSection from '../sections/OnboardingSection';
import { BlogPost, getBlogPostUrl } from '@/src/lib/blog-data';

interface BlogPostDetailContentProps {
  initialPost: BlogPost;
  relatedPosts: BlogPost[];
}

export const BlogPostDetailContent = ({ initialPost, relatedPosts }: BlogPostDetailContentProps) => {
  const [post] = useState(initialPost);
  const [posts] = useState(relatedPosts);

  // Function to process the HTML content and add Tailwind classes
  const processContent = (html: string) => {
    // First, process all the other elements
    let processedContent = html
      .replace(/<h1/g, '<h1 class="text-4xl font-bold mb-6 text-gray-900"')
      .replace(/<h2/g, '<h2 class="text-3xl font-bold mt-8 mb-4 text-gray-900"')
      .replace(/<h3/g, '<h3 class="text-2xl font-semibold mt-6 mb-3 text-gray-900"')
      .replace(/<p>/g, '<p class="text-lg leading-relaxed mb-6 text-gray-700">')
      .replace(/<ul>/g, '<ul class="list-disc pl-6 mb-6">')
      .replace(/<li>/g, '<li class="text-lg mb-2 text-gray-700">');

    // Process links - convert to Next.js Link for internal links
    processedContent = processedContent.replace(
      /<a\s+([^>]*)href=(["'])(.*?)\2([^>]*)>([^<]*)<\/a>/g,
      (match, attrsBefore, quote, href, attrsAfter, linkText) => {
        const isExternal = href.startsWith('http') || href.startsWith('//');
        const className = 'text-blue-600 hover:text-blue-800 underline';
        const attrs = `${attrsBefore} ${attrsAfter}`.trim();
        const attrsWithoutClass = attrs.replace(/class=["'][^"']*["']/g, '').trim();
        
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
      <section className="relative w-full h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden bg-[#102D21] text-white">
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

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center text-[#D8F4CC] gap-4 md:gap-6">
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
          <div className="max-w-6xl mx-auto bg-white rounded-xl p-6 px-0 md:p-10">
            {/* Content */}
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: processContent(post.content) }}
            />

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-10 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium mb-3">Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <div
                      key={index}
                      className="px-3 py-1 bg-[#E0D6C2] text-[#102D21] rounded-full text-sm duration-200"
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
                <h2 className="text-3xl font-bold text-[#102D21] mb-10 text-center">More from the Commerce Central Blog</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
                  {posts.map((relatedPost) => (
                    <Link
                      key={relatedPost.id}
                      href={getBlogPostUrl(relatedPost)}
                      className="block group w-full h-full"
                    >
                      <article
                        className="bg-white rounded-xl overflow-hidden transition-all duration-300 relative hover:-translate-y-1 hover:translate-x-1 hover:shadow-[10px_10px_0px_0px_rgba(67,205,102,0.8)] h-full flex flex-col"
                        style={{
                          borderRadius: '13.632px',
                          border: '1px solid #E0D6C2',
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
                        <div className="p-6 flex flex-col flex-grow">
                          <h3 className="text-lg font-[500] text-[#102D21] mb-2 line-clamp-2">
                            {relatedPost.title}
                          </h3>
                          <div className="flex items-center text-sm text-gray-500">
                            <span className="flex items-center justify-center w-5 h-5 bg-[#43CD66] text-white rounded-full mr-2">
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
            className="inline-flex items-center text-[#43CD66] text-xl mb-6 hover:underline"
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