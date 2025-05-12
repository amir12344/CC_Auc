'use client'

import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { FaBriefcase, FaShoppingBag } from 'react-icons/fa'
import Link from 'next/link'
import Image from 'next/image'

const InfoSection: React.FC = () => {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section
      id='stats'
      ref={ref}
      className='py-12 md:py-16 bg-white'
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-16 md:mb-20'>
          <h2 className='text-3xl md:text-5xl font-bold'>
            Where brand protection meets{' '}
            <span className='relative text-[#43cd66]'>
              buyer confidence
              <span className='absolute -bottom-1 left-0 w-full h-1 bg-[#43cd66] rounded-full opacity-70'></span>
            </span>
          </h2>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20'>
          {/* Sellers Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='relative group'
          >
            {/* Card with image overlay */}
            <div className='relative overflow-hidden rounded-3xl shadow-xl border border-gray-100 h-full'>
              {/* Background gradient */}
              <div className='absolute inset-0 bg-gradient-to-br from-white via-white to-gray-50 z-0'></div>

              {/* Single person smiling photo */}
              <div className='absolute top-0 right-0 w-full md:w-3/5 h-full overflow-hidden z-10'>
                <div className='relative w-full h-full'>
                  <Image
                    src="https://images.unsplash.com/photo-1633367583895-08545d733dfe?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Smiling business person"
                    fill
                    style={{ objectFit: 'cover', objectPosition: 'center left' }}
                    className="transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white opacity-100"></div>
                </div>
              </div>

              {/* Content section */}
              <div className='relative p-10 md:p-12 flex flex-col h-full z-20'>
                <div className='w-full md:w-3/5 z-10'>
                  <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#ecfdf3] shadow-sm mb-6'>
                    <FaBriefcase
                      className='w-7 h-7 text-[#43CD66]'
                      aria-hidden='true'
                    />
                  </div>
                  <h3 className='text-3xl font-bold text-gray-800 mb-6'>Sellers</h3>
                  <p className='text-gray-700 text-lg leading-relaxed mb-8'>
                    Brands and retailers list surplus on Commerce Central to recover
                    more while staying in full control of where, how, and to whom it
                    sells.
                  </p>
                  <div className="transition-transform duration-300 group-hover:translate-x-2">
                    <Link
                      href='/earlyaccess'
                      className='inline-flex items-center justify-center px-7 py-3.5 bg-[#43CD66] text-[#ffffff] font-medium rounded-full transition-all duration-300 hover:bg-[#38b158] hover:shadow-lg hover:shadow-[#43CD66]/30'
                    >
                      Early Access
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Buyers Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className='relative group'
          >
            {/* Card with image overlay */}
            <div className='relative overflow-hidden rounded-3xl shadow-xl border border-gray-100 h-full'>
              {/* Background gradient */}
              <div className='absolute inset-0 bg-gradient-to-br from-white via-white to-gray-50 z-0'></div>

              {/* Single person smiling photo */}
              <div className='absolute top-0 right-0 w-full md:w-3/5 h-full overflow-hidden z-10'>
                <div className='relative w-full h-full'>
                  <Image
                    src="https://images.unsplash.com/photo-1592275772614-ec71b19e326f?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Smiling shopping person"
                    fill
                    style={{ objectFit: 'cover', objectPosition: 'center left' }}
                    className="transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white opacity-100"></div>
                </div>
              </div>

              {/* Content section */}
              <div className='relative p-10 md:p-12 flex flex-col h-full z-20'>
                <div className='w-full md:w-3/5 z-10'>
                  <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#ecfdf3] shadow-sm mb-6'>
                    <FaShoppingBag
                      className='w-7 h-7 text-[#43CD66]'
                      aria-hidden='true'
                    />
                  </div>
                  <h3 className='text-3xl font-bold text-gray-800 mb-6'>Buyers</h3>
                  <p className='text-gray-700 text-lg leading-relaxed mb-8'>
                    Manually vetted buyers purchase inventory with tools and support
                    to avoid bad loads and finally trust what shows up.
                  </p>
                  <div className="transition-transform duration-300 group-hover:translate-x-2">
                    <Link
                      href='/earlyaccess'
                      className='inline-flex items-center justify-center px-7 py-3.5 bg-white border border-[#43CD66] text-[#43CD66] font-medium rounded-full transition-all duration-300 hover:bg-[#43CD66] hover:text-white hover:shadow-lg hover:shadow-[#43CD66]/30'
                    >
                      Early Access
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default InfoSection
