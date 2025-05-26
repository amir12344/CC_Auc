'use client';

import Link from 'next/link';
import { Calendar, Clock } from 'lucide-react';
import { blogPosts, BlogPost } from '@/src/lib/blog-data';

const BlogPostsSection = () => {
  return (
    <section className='py-10 bg-white' id='blog-posts'>
      <div className='max-w-7xl mx-auto px-4'>
        <h2 className='text-center text-4xl font-bold text-[#102D21] mb-16'>
          Latest Articles
        </h2>
        <div className='flex flex-wrap justify-center gap-8'>
          {blogPosts.map((post: BlogPost) => {
            const slug = post.title
              .toLowerCase()
              .replace(/[^\w\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/--+/g, '-');

            return (
              <Link
                key={post.id}
                href={`/website/blog/${slug}`}
                className='block group w-80'
              >
                <article
                  className='bg-white rounded-xl overflow-hidden transition-all duration-300 relative hover:-translate-y-1 hover:translate-x-1 hover:shadow-[10px_10px_0px_0px_rgba(67,205,102,0.8)] h-full flex flex-col'
                  style={{
                    borderRadius: '13.632px',
                    border: '1px solid #E0D6C2',
                  }}
                >
                  {/* Post Image */}
                  <div className='relative h-48 overflow-hidden shrink-0'>
                    <img
                      src={post.image}
                      alt={post.title}
                      className='w-full h-full object-fill transition-transform duration-300 group-hover:scale-105'
                    />
                  </div>

                  {/* Post Details */}
                  <div className='p-6 flex flex-col flex-grow'>
                    <h3 className='text-lg font-[500] text-[#102D21] mb-2 line-clamp-2'>
                      {post.title}
                    </h3>

                    <div className="flex items-center gap-3 mt-auto shrink-0">
                      <div className="flex items-center pl-0 rounded-full px-3 py-1 text-xs font-medium text-[#102D21]">
                        <span className="flex items-center justify-center w-5 h-5 bg-[#43CD66] text-white rounded-full mr-2">
                          <Calendar size={14} />
                        </span>
                        {post.date}
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BlogPostsSection;