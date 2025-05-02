'use client'

import React, { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { FaBriefcase, FaShoppingBag, FaArrowRight } from 'react-icons/fa'
import Link from 'next/link'

const InfoSection: React.FC = () => {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section id='stats' ref={ref} className='py-10 md:py-24 bg-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-10 md:mb-16'>
          <h2 className='text-3xl md:text-4xl font-bold md:text-5xl mb-4'>
            Where brand protection meets{' '}
            <span className='relative text-[#43cd66]'>
              buyer confidence
              <span className='absolute -bottom-1 left-0 w-full h-1 bg-[#43cd66] rounded-full opacity-70'></span>
            </span>
          </h2>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-12'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className='
              bg-white rounded-[24px] w-full mx-auto
              max-w-3xl md:max-w-4xl lg:max-w-5xl
              p-[50px_30px] md:p-[88px_56px]
              transition-shadow duration-300
            '
            style={{
              boxShadow: '10px 10px 34px rgba(0,0,0,0.2)',
            }}
          >
            <div className='text-[#43CD66] mb-6'>
              <FaBriefcase
                className='w-12 h-12 text-[#43CD66]'
                aria-hidden='true'
              />
            </div>
            <h3 className='text-2xl font-[500] mb-4'>Sellers</h3>
            <p className='text-gray-600 text-lg leading-relaxed'>
              Brands and retailers list surplus on Commerce Central to recover
              more while staying in full control of where, how, and to whom it
              sells.
            </p>
            <Link
              href='/earlyAccess'
              className=' mt-6 inline-flex items-center justify-center px-5 py-2.5 bg-[#43CD66] border border-[#43CD66] text-[#ffffff] font-medium rounded-full transition'
            >
              Sell on Commerce Central
              <FaArrowRight className='w-5 h-5 ml-2' aria-hidden='true' />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='bg-white rounded-[24px] w-full mx-auto max-w-3xl md:max-w-4xl lg:max-w-5xl p-[50px_30px] md:p-[88px_56px] transition-shadow duration-300'
            style={{
              boxShadow: '10px 10px 34px rgba(0,0,0,0.2)',
            }}
          >
            <div className='text-[#43CD66] mb-6'>
              <FaShoppingBag
                className='w-12 h-12 text-[#43CD66]'
                aria-hidden='true'
              />
            </div>
            <h3 className='text-2xl font-[500] mb-4'>Buyers</h3>
            <p className='text-gray-600 text-lg leading-relaxed'>
              Manually vetted buyers purchase inventory with tools and support
              to avoid bad loads and finally trust what shows up.
            </p>
            <Link
              href='/earlyAccess'
              className='hover:text-[white] mt-6 inline-flex items-center justify-center px-5 py-2.5 bg-white border border-[#43CD66] hover:bg-[#43CD66] hover:text-white text-[#43CD66] font-medium rounded-full transition'
            >
              <span>Buy on Commerce Central</span>
              <FaArrowRight className='w-5 h-5 ml-2 ' aria-hidden='true' />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default InfoSection
