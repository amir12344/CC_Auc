'use client';

import React, { useRef, memo } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';

// Optimized image component with lazy loading
const OptimizedImage = memo(({ src, alt, width, height, className }: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className: string;
}) => (
  <Image
    src={src}
    alt={alt}
    width={width}
    height={height}
    className={className}
    loading="lazy"
    placeholder="blur"
    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEDQIHq4C7aQAAAABJRU5ErkJggg=="
  />
));

// Add this line to fix the display name error
OptimizedImage.displayName = 'OptimizedImage';

interface TeamMember {
  name: string;
  title: string;
  imagePath: string;
}

const TeamSection: React.FC = () => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const teamMembers: TeamMember[] = [
    {
      name: 'Shivang Maheshwari',
      title: 'Co-Founder and CEO',
      imagePath:
        '/images/Shivang.jpg',
    },
    {
      name: 'Isaac Chung',
      title: 'Co-Founder and COO',
      imagePath:
        '/images/Isaac.png',
    },
    {
      name: 'Ahmed Aslam',
      title: 'Advisor',
      imagePath:
        '/images/Ahmed.jpg',
    },    
    {
      name: 'Amir Sayyad',
      title: 'VP of Engineering',
      imagePath: '/images/Amir.png',
    },
    
    
  ];

  return (
    <section
      id='team'
      ref={ref}
      className='relative py-16 md:py-24 overflow-hidden bg-white transition-theme duration-400 min-h-[100dvh]'
    >
      {/* Blurred grid pattern background */}
      <div
        className='absolute inset-0 transition-theme duration-400'
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 0, 0, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          backgroundColor: 'white',
          filter: 'blur(0.5px)',
        }}
        aria-hidden="true"
      />

      {/* Edge blur gradients */}
      <div
        className='absolute inset-0 pointer-events-none transition-theme duration-400'
        style={{
          background: `
            radial-gradient(circle at center, transparent 70%, white 100%),
            radial-gradient(circle at top left, white 0%, transparent 35%),
            radial-gradient(circle at top right, white 0%, transparent 35%),
            radial-gradient(circle at bottom left, white 0%, transparent 35%),
            radial-gradient(circle at bottom right, white 0%, transparent 35%)
          `,
        }}
        aria-hidden="true"
      />

      <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' style={{marginTop: '5rem'}}>
        <motion.div
          className='text-center mb-16'
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className='text-3xl md:text-5xl mb-6 font-[500] text-[#43CD66] tracking-tight transition-theme duration-400'>
          Join us on a revolution to transform how surplus inventory is sold and bought.{' '}
          </h2>

        </motion.div>

        {/* Team members - grid for small teams, horizontal scroll for larger teams */}
        <div
          className={`flex flex-wrap justify-center gap-8 ${teamMembers.length === 5 ? 'max-w-5xl mx-auto' : ''
            }`}
        >
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              className='w-full max-w-xs sm:w-80 group'
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              whileHover={{ y: -5 }}
            >
              <div className='relative h-80 bg-gray-100 overflow-hidden rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300'>
                <OptimizedImage
                  src={member.imagePath}
                  alt={member.name}
                  width={400}
                  height={533}
                  className='w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105'
                />
              </div>
              <div className='bg-white p-4 transition-theme duration-400'>
                <h3 className='text-lg text-[#43CD66] font-[500] mb-1 transition-theme duration-400 group-hover:text-primary'>
                  {member.name}
                </h3>
                <p className='text-sm text-gray-600 transition-theme duration-400'>
                  {member.title}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;

