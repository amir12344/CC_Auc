'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, Tag, ArrowLeft } from 'lucide-react';
import TestimonialsSection from '../sections/OnboardingSection';
import { BlogPost, blogPosts } from '@/src/lib/blog-data';

interface BlogPostDetailContentProps {
  initialPost: BlogPost;
  relatedPosts: BlogPost[];
}

export const BlogPostDetailContent = ({ initialPost, relatedPosts }: BlogPostDetailContentProps) => {
  const [post] = useState(initialPost);
  const [posts] = useState(relatedPosts);

  // Function to process the HTML content and add Tailwind classes
  const processContent = (content: string) => {
    let processedContent = content
      .replace(/<h1/g, '<h1 class="text-4xl font-bold mb-6 text-gray-900"')
      .replace(/<h2/g, '<h2 class="text-3xl font-bold mt-8 mb-4 text-gray-900"')
      .replace(/<h3/g, '<h3 class="text-2xl font-semibold mt-6 mb-3 text-gray-900"')
      .replace(/<p>/g, '<p class="text-lg leading-relaxed mb-6 text-gray-700">')
      .replace(/<ul>/g, '<ul class="list-disc pl-6 mb-6">')
      .replace(/<li>/g, '<li class="text-lg mb-2 text-gray-700">')
      .replace(/<a /g, '<a class="text-blue-600 hover:text-blue-800 underline" ');

    return processedContent;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative w-full h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden bg-[#102D21] text-white">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={post.image}
            alt={post.title}
            fill
            priority
            unoptimized
            quality={75}
          />
          <div className="absolute inset-0 bg-[#102D21] opacity-60"></div>
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
              <Clock size={16} className="mr-2" />
              <span>{post.readTime}</span>
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
              <div className="mt-20">
                <h2 className="text-3xl font-bold text-[#102D21] mb-10 text-center">More from the Commerce Central Blog</h2>
                <div className="flex flex-wrap justify-center gap-8 max-w-3xl mx-auto">
                  {posts.map((relatedPost) => (
                    <Link
                      key={relatedPost.id}
                      href={`/website/blog/${relatedPost.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')}`}
                      className="block group w-96"
                    >
                      <article
                        className="bg-white rounded-xl overflow-hidden transition-all duration-300 relative hover:-translate-y-1 hover:translate-x-1 hover:shadow-[10px_10px_0px_0px_rgba(67,205,102,0.8)]"
                        style={{
                          borderRadius: '13.632px',
                          border: '1px solid #E0D6C2',
                        }}
                      >
                        {/* Post Image */}
                        <div className="relative h-48 overflow-hidden">
                          <Image
                            src={relatedPost.image}
                            alt={relatedPost.title}
                            fill
                            className="transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>

                        {/* Post Details */}
                        <div className="p-6">
                          <h3 className="text-lg font-[600] text-[#102D21] mb-2 line-clamp-2">
                            {relatedPost.title}
                          </h3>

                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {relatedPost.excerpt}
                          </p>

                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar size={14} className="mr-1" />
                            <span className="mr-4">{relatedPost.date}</span>
                            <Clock size={14} className="mr-1" />
                            <span>{relatedPost.readTime}</span>
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
        <div className="mx-auto text-center">
          <Link
            href="/website/blog"
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