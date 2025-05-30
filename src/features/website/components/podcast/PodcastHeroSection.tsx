'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useInView } from 'framer-motion';
import PodcastPlatformsSection from '../podcast/PodcastPlatformsSection';

const PodcastHeroSection = () => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      ref={ref}
      className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-[#102D21] text-white"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0 opacity-40">
        <Image
          src="https://images.pexels.com/photos/3783471/pexels-photo-3783471.jpeg"
          alt="Podcast background"
          fill
          style={{ objectFit: 'cover' }}
          priority
          unoptimized
          quality={65}
        />
        <div className="absolute inset-0 bg-[#102D21] opacity-60"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#43CD66] mb-6">
            ReCommerce Show
          </h1>
          <motion.p
            className="text-xl md:text-2xl text-[#D8F4CC] mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            The #1 show on reatail's final frontier
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link
              href="#episodes"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('#episodes')?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start'
                });
              }}
              className="inline-flex items-center px-8 py-3 bg-[#43CD66] text-[#102D21] rounded-full font-medium hover:bg-[#43CD66]/90 transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-lg hover:shadow-[#43CD66]/30"
            >
              <span className="mr-2">Listen Now</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/4 left-10 w-24 h-24 rounded-full bg-[#43CD66]/20 blur-xl" aria-hidden="true"></div>
      <div className="absolute bottom-1/4 right-10 w-32 h-32 rounded-full bg-[#43CD66]/20 blur-xl" aria-hidden="true"></div>
    </section>

  );
};

export default PodcastHeroSection;