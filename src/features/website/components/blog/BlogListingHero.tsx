'use client';

import Link from 'next/link';
import Image from 'next/image';

interface BlogListingHeroProps {
  type: 'buyer' | 'seller';
}

const BlogListingHero = ({ type }: BlogListingHeroProps) => {
  const heroContent = {
    buyer: {
      title: 'Buyer Resources',
      subtitle: 'Smart strategies for inventory sourcing and liquidation buying',
      description: 'Expert tips, market insights, and proven strategies to help you source quality inventory, avoid scams, and maximize profits in liquidation buying.',
      ctaText: 'Explore Buyer Articles'
    },
    seller: {
      title: 'Seller Insights', 
      subtitle: 'Expert guidance for brands and surplus inventory sellers',
      description: 'Industry insights, best practices, and strategic advice to help brands optimize their excess inventory management and recovery strategies.',
      ctaText: 'Explore Seller Articles'
    }
  };

  const content = heroContent[type];

  return (
    <section
      className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-[#102D21] text-white"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0 opacity-40">
        <Image
          src="/images/blogHero.webp"
          alt={`${content.title} background`}
          fill
          style={{ objectFit: 'cover' }}
          priority={true}
          quality={85}
          sizes="100vw"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        />
        <div className="absolute inset-0 bg-[#102D21] opacity-60"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#43CD66] mb-6">
            {content.title}
          </h1>
          <p className="text-xl md:text-2xl text-[#D8F4CC] mb-4">
            {content.subtitle}
          </p>
          <p className="text-lg text-[#D8F4CC]/80 mb-8 max-w-2xl mx-auto leading-relaxed">
            {content.description}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <Link
              href="#blog-posts"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('#blog-posts')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-3 bg-[#43CD66] text-black font-medium rounded-full hover:bg-[#3BB757] transition-colors duration-300"
            >
              {content.ctaText}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogListingHero; 