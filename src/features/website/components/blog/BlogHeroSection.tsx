'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

const BlogHeroSection = () => {
  return (
    <section 
      className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-[#102D21] text-white"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0 opacity-40">
        <Image 
          src="/images/blogHero.webp" 
          alt="Blog background" 
          fill 
          style={{ objectFit: 'cover' }}
          priority
          unoptimized
          quality={70}
        />
        <div className="absolute inset-0 bg-[#102D21] opacity-60"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#43CD66] mb-6">
            Commerce Central Blog
          </h1>
          <motion.p 
            className="text-xl md:text-2xl text-[#D8F4CC] mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Articles and resources for you
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4 mt-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link 
              href="#blog-posts" 
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('#blog-posts')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-3 bg-[#43CD66] text-black font-medium rounded-full hover:bg-[#3BB757] transition-colors duration-300"
            >
              Read Latest Articles
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default BlogHeroSection;