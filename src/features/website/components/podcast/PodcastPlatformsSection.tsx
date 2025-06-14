'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { FaSpotify, FaApple, FaGoogle, FaAmazon, FaYoutube } from 'react-icons/fa';

interface PlatformItem {
  name: string;
  icon: React.ReactNode;
  url: string;
  color: string;
}

const PodcastPlatformsSection = () => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const platforms: PlatformItem[] = [
    { 
      name: 'Spotify', 
      icon: <FaSpotify size={56} />, 
      url: '#', 
      color: 'hover:text-[#1DB954]' 
    },
    { 
      name: 'Apple Podcasts', 
      icon: <FaApple size={56} />, 
      url: '#', 
      color: 'hover:text-[#872EC4]' 
    },
    { 
      name: 'Amazon Music', 
      icon: <FaAmazon size={56} />, 
      url: '#', 
      color: 'hover:text-[#FF9900]' 
    },
    { 
      name: 'YouTube', 
      icon: <FaYoutube size={56} />, 
      url: '#', 
      color: 'hover:text-[#FF0000]' 
    },
  ];

  return (
    <section
      id='platforms'
      ref={ref}
      className='py-20 bg-[#F1E9DE] relative overflow-hidden'
    >
      {/* Decorative background elements */}
      <div className='absolute inset-0 opacity-5 bg-[#102D21]'>
        <div className='absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#43CD66]'></div>
        <div className='absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#43CD66]'></div>
      </div>

      <div className='container mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className='text-center mb-16'
        >
          <h2 className='text-3xl md:text-4xl font-bold text-center mb-4 text-[#102D21]'>
            Subscribe to the Podcast
          </h2>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            Listen to our podcast on your favorite platform
          </p>
        </motion.div>

        <div className='flex flex-wrap justify-center items-center gap-12 md:gap-16 lg:gap-20 max-w-5xl mx-auto'>
          {platforms.map((platform, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0 + index * 0.1 }}
              whileHover={{ y: -5, scale: 1.05 }}
              className='flex flex-col items-center'
            >
              <Link
                href={platform.url}
                className={`flex flex-col items-center transition-all duration-300 ${platform.color}`}
                target='_blank'
                rel='noopener noreferrer'
              >
                <div className='text-[#102D21] mb-3 transition-colors duration-300'>
                  {platform.icon}
                </div>
                <span className='font-medium text-[#102D21] text-lg text-center'>
                  {platform.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
};

export default PodcastPlatformsSection;