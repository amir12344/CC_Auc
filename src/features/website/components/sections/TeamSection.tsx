'use client';

import React, { useRef, memo } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';


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
        '/images/Shivang.webp',
    },
    {
      name: 'Isaac Chung',
      title: 'Co-Founder and COO',
      imagePath:
        '/images/Isaac.webp',
    },
    {
      name: 'Amir Sayyad',
      title: 'VP of Engineering',
      imagePath: '/images/Amir.webp',
    },
    {
      name: 'Ahmed Aslam',
      title: 'Advisor',
      imagePath:
        '/images/Ahmed.webp',
    },


  ];

  return (
    <section
      id='team'
      ref={ref}
      className='relative py-24 md:py-36 overflow-hidden transition-theme duration-400 min-h-[100dvh]'
    >
      {/* Enhanced grid pattern background with subtle green accent */}
      <div
        className='absolute inset-0 transition-theme duration-400'
        style={{
          backgroundImage: `
                linear-gradient(to right, rgba(67, 205, 102, 0.07) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(67, 205, 102, 0.07) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          backgroundColor: 'transparent',
          filter: 'blur(0.5px)',
        }}
        aria-hidden='true'
      />

      {/* Enhanced edge blur gradients with subtle green tint */}
      <div
        className='absolute inset-0 pointer-events-none transition-theme duration-400'
        style={{
          background: `
                radial-gradient(circle at center, transparent 60%, rgba(240, 240, 240, 0.8) 100%),
                radial-gradient(circle at top left, rgba(67, 205, 102, 0.08) 0%, transparent 40%),
                radial-gradient(circle at top right, rgba(67, 205, 102, 0.08) 0%, transparent 40%),
                radial-gradient(circle at bottom left, rgba(67, 205, 102, 0.08) 0%, transparent 40%),
                radial-gradient(circle at bottom right, rgba(67, 205, 102, 0.08) 0%, transparent 40%)
              `,
        }}
        aria-hidden='true'
      />

      {/* Enhanced dot pattern overlay */}
      <div
        className='absolute inset-0 opacity-10 pointer-events-none'
        style={{
          backgroundImage: 'radial-gradient(#43CD66 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}
        aria-hidden='true'
      />

      {/* Additional decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#43CD66] rounded-full opacity-5 -translate-x-1/3 -translate-y-1/3" aria-hidden="true"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#43CD66] rounded-full opacity-5 translate-x-1/3 translate-y-1/3" aria-hidden="true"></div>

      <div
        className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
      >
        <motion.div
          className='text-center mb-24'
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center mb-4 mt-2">
            <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-[#43CD66]/70"></div>
            <span className='inline-block text-[#43CD66] font-semibold text-lg mx-3 tracking-wide'>OUR TEAM</span>
            <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-[#43CD66]/70"></div>
          </div>
          <h2 className='text-3xl md:text-5xl mb-8 font-[600] text-[#1C1E21] transition-theme duration-400 max-w-4xl mx-auto leading-tight'>
            Join us on a revolution to transform how surplus inventory is sold
            and bought
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
              <div className='relative h-80 overflow-hidden rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300'>
                <Image
                  src={member.imagePath}
                  alt={member.name}
                  width={400}
                  height={533}
                  unoptimized
                  quality={70}
                  priority
                  className='w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105'
                />
              </div>
              <div className='p-4 transition-theme duration-400'>
                <h3 className='text-xl text-[#43CD66] font-[500] mb-1 transition-theme duration-400 group-hover:text-primary'>
                  {member.name}
                </h3>
                <p className='text-md text-[#1C1E21] transition-theme duration-400'>
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

