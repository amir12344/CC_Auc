'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Profile image array - try to match similar looking people
const profiles: string[] = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80', 
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80', 

  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80', 
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80', 
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80', 
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80', 
  'https://images.unsplash.com/photo-1531384441138-2736e62e0919?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80',

  'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80', 
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80', 
  'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80',
];

// We're not using this component yet, so we'll remove it for now

const TestimonialsSection: React.FC = () => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      id='testimonials'
      ref={ref}
      className='pt-[5rem] bg-[#F1E9DE] transition-all duration-400 relative overflow-hidden'
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative'>
        {/* LEFT COLUMN PROFILES */}
        {/* Asian man with glasses - top left */}
        <motion.div
          className='absolute w-[7rem] h-[8rem] top-[14%] left-[5%] rounded-xl overflow-hidden hidden md:block'
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <Image
            src={profiles[0]}
            alt='Professional'
            width={300}
            height={300}
            className='w-full h-full object-cover'
            loading="lazy"
          />
        </motion.div>

        {/* Man in black shirt - top left */}
        <motion.div
          className='absolute w-[7rem] h-[8rem] top-0 left-[15%] rounded-xl overflow-hidden hidden md:block'
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <Image
            src={profiles[1]}
            alt='Professional'
            width={300}
            height={300}
            className='w-full h-full object-cover'
            loading="lazy"
          />
        </motion.div>

        {/* Woman with brown top - bottom left */}
        <motion.div
          className='absolute w-[7rem] h-[8rem] top-[41%] left-[5%] rounded-xl overflow-hidden hidden md:block'
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <Image
            src={profiles[2]}
            alt='Professional'
            width={300}
            height={300}
            className='w-full h-full object-cover'
            loading="lazy"
          />
        </motion.div>

        {/* Man in white shirt - middle left */}
        <motion.div
          className='absolute w-[7rem] h-[8rem] top-[27%] left-[15%] rounded-xl overflow-hidden hidden md:block'
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.25 }}
        >
          <Image
            src={profiles[3]}
            alt='Professional'
            width={300}
            height={300}
            className='w-full h-full object-cover'
            loading="lazy"
          />
        </motion.div>

        {/* Man with glasses in blue shirt */}
        <motion.div
          className='absolute w-[7rem] h-[8rem] top-[10%] left-[25%] rounded-xl overflow-hidden hidden md:block'
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <Image
            src={profiles[4]}
            alt='Professional'
            width={300}
            height={300}
            className='w-full h-full object-cover'
            loading="lazy"
          />
        </motion.div>

        {/* MIDDLE SECTION PROFILES */}
        {/* Man with crossed arms blue shirt */}
        <motion.div
          className='absolute w-[7rem] h-[8rem] top-[0%] left-[35%] rounded-xl overflow-hidden hidden md:block'
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.35 }}
        >
          <Image
            src={profiles[5]}
            alt='Professional'
            width={300}
            height={300}
            className='w-full h-full object-cover'
            loading="lazy"
          />
        </motion.div>

        {/* Man in suit */}
        <motion.div
          className='absolute w-[7rem] h-[8rem] top-[10%] left-[45%] rounded-xl overflow-hidden hidden md:block'
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <Image
            src={profiles[6]}
            alt='Professional'
            width={300}
            height={300}
            className='w-full h-full object-cover'
            loading="lazy"
          />
        </motion.div>

        {/* Woman with brown jacket */}
        <motion.div
          className='absolute w-[7rem] h-[8rem] top-[0%] left-[55%] rounded-xl overflow-hidden hidden md:block'
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.45 }}
        >
          <Image
            src={profiles[7]}
            alt='Professional'
            width={300}
            height={300}
            className='w-full h-full object-cover'
            loading="lazy"
          />
        </motion.div>

        {/* Woman at desk */}
        <motion.div
          className='absolute w-[7rem] h-[8rem] top-[10%] left-[65%] rounded-xl overflow-hidden hidden md:block'
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          <Image
            src={profiles[8]}
            alt='Professional'
            width={300}
            height={300}
            className='w-full h-full object-cover'
            loading="lazy"
          />
        </motion.div>

        {/* Man in green/gray shirt */}
        <motion.div
          className='absolute w-[7rem] h-[8rem] top-[0%] left-[75%] rounded-xl overflow-hidden hidden md:block'
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.55 }}
        >
          <Image
            src={profiles[9]}
            alt='Professional'
            width={300}
            height={300}
            className='w-full h-full object-cover'
            loading="lazy"
          />
        </motion.div>

        {/* RIGHT COLUMN PROFILES */}
        {/* Woman with curly hair */}
        <motion.div
          className='absolute w-[7rem] h-[8rem] top-[14%] right-[6%] rounded-xl overflow-hidden hidden md:block'
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.6 }}
        >
          <Image
            src={profiles[10]}
            alt='Professional'
            width={300}
            height={300}
            className='w-full h-full object-cover'
            loading="lazy"
          />
        </motion.div>

        {/* Asian man in suit */}
        <motion.div
          className='absolute w-[7rem] h-[8rem] top-[27%] right-[16%] rounded-xl overflow-hidden hidden md:block'
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.65 }}
        >
          <Image
            src={profiles[11]}
            alt='Professional'
            width={300}
            height={300}
            className='w-full h-full object-cover'
            loading="lazy"
          />
        </motion.div>

        {/* Man in blue blazer */}
        <motion.div
          className='absolute w-[7rem] h-[8rem] top-[41%] right-[6%] rounded-xl overflow-hidden hidden md:block'
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.7 }}
        >
          <Image
            src={profiles[12]}
            alt='Professional'
            width={300}
            height={300}
            className='w-full h-full object-cover'
            loading="lazy"
          />
        </motion.div>

        {/* Central content */}
        <div className='text-center max-w-3xl mx-auto z-20 relative pt-0 sm:pt-[13rem] pb-20'>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className='text-4xl font-bold md:text-5xl text-[#1C1E21] mb-2'
          >
            Unlock your inventory’s
          </motion.h2>

          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='text-4xl md:text-5xl font-normal text-primary mb-8 text-[#43CD66]'
          >
            
            <span className='text-4xl font-bold md:text-5xl relative inline-block text-[#43cd66]'>
              full potential.
              <span className='absolute -bottom-1 left-0 w-full h-1 bg-[#43cd66] rounded-full opacity-80'></span>
            </span>
          </motion.h3>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className='text-lg text-[#1C1E21] w-[24rem] mx-auto mb-8'
          >
            Join the only private surplus distribution platform built for trusted Buyers and Sellers.

          </motion.p>
          <div className='mt-4'>
            <Link
              href='/early-access'
              className='p-4 rounded-full bg-[#102D21] hover:bg-[#43CD66] text-white font-medium transition-all duration-200 hover:shadow-md'
              prefetch={true}
            >
              Early Access
            </Link>
          </div>
        </div>
        
      </div>
    </section>
  );
};

export default TestimonialsSection;
