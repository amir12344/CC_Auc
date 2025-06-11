'use client';

import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { blogPosts, BlogPost, getBlogPostUrl } from '@/src/lib/blog-data';
import Image from 'next/image';
import { useState } from 'react';
import BlogTabs from './BlogTabs';

const BlogPostsSection = () => {
  const [activeTab, setActiveTab] = useState<string>('buyer');
  const [visiblePosts, setVisiblePosts] = useState<number>(6);
  
  // Filter and sort posts based on active tab
  const filteredPosts = blogPosts.filter(post => post.type === activeTab);
  const sortedPosts = [...filteredPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const handleLoadMore = () => {
    setVisiblePosts(prev => prev + 3);
  };
  
  const buyerPosts = blogPosts.filter(post => post.type === 'buyer');
  const sellerPosts = blogPosts.filter(post => post.type === 'seller');

  return (
    <section className='py-10 bg-white' id='blog-posts'>
      <div className='max-w-7xl mx-auto px-4'>
        <h2 className='text-center text-4xl font-bold text-[#102D21] mb-16'>
          Latest Articles
        </h2>
        <BlogTabs 
          activeTab={activeTab as 'buyer' | 'seller'}
          onTabChangeAction={(tab) => setActiveTab(tab)}
          buyerPosts={buyerPosts}
          sellerPosts={sellerPosts}
        >
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-4'>
          {sortedPosts.slice(0, visiblePosts).map((post: BlogPost) => {
            return (
              <Link
                key={post.id}
                href={getBlogPostUrl(post)}
                className='block group w-full h-full'
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
                    <Image
                      src={post.thumbnailImage}
                      alt={post.title}
                      fill
                      priority
                      unoptimized
                      quality={100}
                      className='h-full w-full object-fill transition-transform duration-300 group-hover:scale-105'
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
        
        {visiblePosts < sortedPosts.length && (
          <div className="flex justify-center mt-12">
            <button 
              onClick={handleLoadMore}
              className="px-6 py-3 bg-[#43CD66] text-white font-medium rounded-lg hover:bg-[#3ab659] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#43CD66] focus:ring-opacity-50"
            >
              Load More
            </button>
          </div>
        )}
      </BlogTabs>
      </div>
    </section>
  );
};

export default BlogPostsSection;