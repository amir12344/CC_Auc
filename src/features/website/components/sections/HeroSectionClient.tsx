'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import CountUp from 'react-countup';
import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';

const HeroSectionClient = () => {
  const statsRef = useRef<HTMLDivElement>(null);
  const isStatsInView = useInView(statsRef, { once: true, amount: 0.3 });

  return (
    <section
      id='hero'
      className='relative min-h-[600px] md:min-h-[700px] h-screen flex flex-col justify-between overflow-hidden bg-[#102D21] transition-theme duration-400'
    >
      {/* Blurred grid pattern overlay */}
      <div
        className='absolute inset-0 transition-theme duration-400 z-0 opacity-40'
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 0, 0, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.04) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
          backgroundColor: 'transparent',
          filter: 'blur(0.5px)',
        }}
        aria-hidden='true'
      />

      <div className='container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col justify-between h-full pt-6 md:pt-8 pb-0 max-w-(--breakpoint-xl)'>
        <div className='grow flex items-center justify-center pt-0 md:pt-0 pb-4 md:pb-6'>
          <div className='mx-auto w-full lg:w-11/12 xl:w-10/12 pt-4 md:pt-6 lg:pt-8 xl:pt-12 text-center'>
            <motion.h1
              className='text-4xl font-geist sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 md:mb-4 lg:mb-5 xl:mb-6 text-[#43CD66] leading-tight max-w-5xl mx-auto'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              style={{ willChange: 'transform, opacity' }}
            >
              The go-to platform to move and source surplus inventory
            </motion.h1>

            <motion.div
              className='text-md sm:text-lg md:text-xl xl:text-2xl mb-4 md:mb-5 lg:mb-6 xl:mb-8 mx-auto space-y-1 sm:space-y-2 lg:space-y-3 max-w-3xl leading-relaxed'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{ willChange: 'transform, opacity' }}
            >
              <motion.p
                className='font-medium text-[#FFFFFF]'
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                Smart brands stay in control and recover more.
              </motion.p>
              <motion.p
                className='font-medium text-[#FFFFFF]'
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                Smart buyers source better and skip the chaos.
              </motion.p>
              <motion.p
                className='font-medium text-[#FFFFFF]'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <span className='relative'>
                  Commerce Central
                  <span className='absolute -bottom-1 left-0 w-full h-1 bg-[#25D366] rounded-full opacity-40'></span>
                </span>{' '}
                makes it all happen.
              </motion.p>
            </motion.div>

            <motion.div
              className='flex flex-col sm:flex-row gap-5 mb-8 lg:mb-10 xl:mb-12 justify-center max-w-3xl mx-auto'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ willChange: 'transform, opacity' }}
            >
                <Link
                href='/early-access'
                  className='px-6 sm:px-7 md:px-8 py-3 md:py-4 rounded-full bg-[#43CD66] text-[#1C1E21] font-semibold transition-all duration-300 text-sm sm:text-base md:text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center hover:bg-[#50E575] group'
                >
                  <span>Early Access</span>
                  <FaArrowRight className='w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1' aria-hidden='true' />
                </Link>
            </motion.div>
          </div>
        </div>

        {/* Stats Section */}
        <div
          ref={statsRef}
          className='bg-[#F1E9DE] backdrop-blur-md py-3 sm:py-3 md:py-4 lg:py-5 xl:py-6 rounded-t-3xl shadow-lg border-t border-gray-100 w-full mt-4 sm:mt-4 md:mt-6 lg:mt-8 xl:mt-10'
        >
          <div className='container mx-auto max-w-(--breakpoint-xl)'>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6 xl:gap-8 text-center'>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isStatsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.3 }}
                className='flex flex-col items-center'
                whileHover={{ scale: 1.02 }}
                style={{ willChange: 'transform, opacity' }}
              >
                <span className='text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-[#1F2328]'>
                  {isStatsInView && (
                    <CountUp end={500} duration={1.5} separator=',' />
                  )}
                  +
                </span>
                <span className='text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg text-[#1C1E21] mt-1 md:mt-1 lg:mt-2'>
                  Verified Sellers
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isStatsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.3, delay: 0.1 }}
                className='flex flex-col items-center'
                whileHover={{ scale: 1.02 }}
                style={{ willChange: 'transform, opacity' }}
              >
                <span className='text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-[#43CD66]'>
                  {isStatsInView && (
                    <CountUp end={25} duration={1.5} />
                  )}M+
                </span>
                <span className='text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg text-[#1C1E21] mt-1 md:mt-1 lg:mt-2'>
                  Products Moved
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isStatsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.3, delay: 0.2 }}
                className='flex flex-col items-center'
                whileHover={{ scale: 1.02 }}
                style={{ willChange: 'transform, opacity' }}
              >
                <span className='text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-[#1C1E21]'>
                  {isStatsInView && (
                    <CountUp end={98} duration={1.5} decimals={1} suffix='%' />
                  )}
                </span>
                <span className='text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg text-[#1C1E21] mt-1 md:mt-1 lg:mt-2'>
                  Satisfaction Rate
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isStatsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.3, delay: 0.3 }}
                className='flex flex-col items-center'
                whileHover={{ scale: 1.02 }}
                style={{ willChange: 'transform, opacity' }}
              >
                <span className='text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-[#43CD66]'>
                  {isStatsInView && (
                    <CountUp
                      end={150}
                      duration={1.5}
                      prefix='$'
                      separator=','
                    />
                  )}
                  M
                </span>
                <span className='text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg text-[#1C1E21] mt-1 md:mt-1 lg:mt-2'>
                  Transaction Volume
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
};

export default HeroSectionClient;