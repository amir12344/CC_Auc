'use client'

import React from 'react'
import Image from 'next/image'
import { CheckCircle2, ChevronDown } from 'lucide-react'

const productCategories = [
  { name: 'Houseware', imageUrl: '/images/KitchenHouseware.webp' },
  { name: 'Appliances', imageUrl: '/images/SmallAppliances.webp' },
  { name: 'Electronics', imageUrl: '/images/ConsumerElectronics.webp' },
  { name: 'Beauty', imageUrl: '/images/beauty_products.webp' },
  { name: 'CPG', imageUrl: '/images/CleaningSupplies_Option2.webp' },
  { name: 'Furniture', imageUrl: '/images/Furnitures.webp' },
]

export default function ProductCategories() {
  return (
    <div className="bg-[#102D21] py-8">
      {/* Value proposition with separate mobile/desktop versions */}
      <div className='mb-12'>
        {/* Mobile version - Enhanced with better visual design */}
        <div className='md:hidden mx-4'>
          <div className='bg-[#102D21] p-6 rounded-lg border border-[#43CD66]/20 shadow-sm relative overflow-hidden'>
            {/* Decorative element */}
            <div className='absolute top-0 right-0 w-24 h-24 bg-[#43CD66]/5 rounded-full -mr-8 -mt-8 blur-[30px]'></div>
            <div className='absolute bottom-0 left-0 w-16 h-16 bg-[#43CD66]/5 rounded-full -ml-4 -mb-4 blur-[20px]'></div>

            {/* Icon at the top */}
            <div className='flex justify-center mb-3'>
              <div className='bg-[#102D21] p-2 rounded-full border border-[#43CD66]/30 shadow-sm'>
                <CheckCircle2 className='text-[#43CD66] w-6 h-6' />
              </div>
            </div>

            <h3 className='text-center text-white text-lg font-semibold mb-2'>
              Verified, brand-direct surplus and returns
            </h3>
            <p className='text-center text-[#43CD66] font-medium text-base'>
              Fully manifested, transparently priced, and reliably delivered.
            </p>

            {/* Visual separator */}
            <div className='flex items-center justify-center mt-4'>
              <div className='h-1 w-16 bg-gradient-to-r from-transparent via-[#43CD66]/40 to-transparent rounded-full'></div>
            </div>
          </div>
        </div>

        {/* Desktop version */}
        <div className='hidden md:block'>
          <div className='max-w-3xl mx-auto p-6 bg-[#102D21] rounded-xl shadow-lg border border-[#43CD66]/20'>
            <h2 className='text-center text-white text-2xl font-bold mb-6'>
              Our <span className='text-[#43CD66]'>Value Proposition</span>
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='group hover:bg-[#102D21]/80 p-4 rounded-lg transition-all duration-300'>
                <div className='flex items-center mb-3'>
                  <CheckCircle2 className='text-[#43CD66] w-6 h-6 mr-2 flex-shrink-0 group-hover:scale-110 transition-all duration-300' />
                  <h3 className='text-lg text-white font-semibold group-hover:text-[#43CD66] transition-colors duration-300'>
                    Verified Products
                  </h3>
                </div>
                <p className='text-white/70 text-sm'>
                  Access to verified, brand-direct surplus and returns from
                  trusted brands.
                </p>
              </div>

              <div className='group hover:bg-[#102D21]/80 p-4 rounded-lg transition-all duration-300'>
                <div className='flex items-center mb-3'>
                  <CheckCircle2 className='text-[#43CD66] w-6 h-6 mr-2 flex-shrink-0 group-hover:scale-110 transition-all duration-300' />
                  <h3 className='text-lg text-white font-semibold group-hover:text-[#43CD66] transition-colors duration-300'>
                    Transparent Pricing
                  </h3>
                </div>
                <p className='text-white/70 text-sm'>
                  Fully manifested inventory with clear, upfront pricing for
                  complete visibility.
                </p>
              </div>

              <div className='group hover:bg-[#102D21]/80 p-4 rounded-lg transition-all duration-300'>
                <div className='flex items-center mb-3'>
                  <CheckCircle2 className='text-[#43CD66] w-6 h-6 mr-2 flex-shrink-0 group-hover:scale-110 transition-all duration-300' />
                  <h3 className='text-lg text-white font-semibold group-hover:text-[#43CD66] transition-colors duration-300'>
                    Reliable Delivery
                  </h3>
                </div>
                <p className='text-white/70 text-sm'>
                  Streamlined logistics and dependable shipping for a seamless
                  experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='mb-6'>
        <h2
          className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl pb-4 text-[#ffffff] text-center'
          style={{ fontWeight: 900 }}
        >
          Products from the World&apos;s <br />
          <span className='text-[#43CD66] relative inline-block'>
            best brands
            <span className='absolute bottom-0 left-0 w-full h-1 bg-[#43CD66]'></span>
          </span>
        </h2>
      </div>
      <div className='grid grid-cols-3 gap-3 md:gap-1 lg:gap-2 mb-8 border-none max-w-4xl mx-auto px-4'>
        {productCategories.map((category, index) => (
          <div key={index} className='mb-2 border-none'>
            <div
              className='mx-auto max-w-[120px] sm:max-w-[140px] md:max-w-[160px] bg-white shadow-xs overflow-hidden border-none transform transition-transform duration-300 hover:scale-105'
              style={{ borderRadius: '8px' }}
            >
              <div className='border-none relative aspect-square rounded-sm overflow-hidden'>
                <Image
                  src={category.imageUrl}
                  alt={category.name}
                  fill
                  sizes='(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 20vw'
                  className='object-cover border-none'
                  priority={index < 3}
                />
              </div>
            </div>
            <div className='py-1 text-center rounded-lg'>
              <span className='text-xs md:text-sm text-gray-300'>
                {category.name}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile-only scroll indicator */}
      <div className="md:hidden flex justify-center mt-4 mb-2 animate-bounce">
        <div className="bg-[#43CD66]/10 p-2 rounded-full border border-[#43CD66]/30 shadow-sm">
          <ChevronDown className="text-[#43CD66] w-5 h-5" />
        </div>
      </div>
    </div>
  )
}
