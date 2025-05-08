import React from 'react'
import Image from 'next/image'
// Import the correct prop type from the common features index
import { SellerFeatureItemProps } from '@/src/components/common/features/index'
import { motion } from 'framer-motion'

// The component now expects an array of SellerFeatureItemProps
interface FeaturesSectionProps {
  features: SellerFeatureItemProps[]
}

export const FeaturesSection = ({ features }: FeaturesSectionProps) => (
  <section
    id='features'
    className='w-full py-10 md:py-20 relative z-20 mt-0 bg-white overflow-hidden'
  >
    <div className='text-center mb-8 md:mb-16'>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className='text-3xl font-bold md:text-5xl text-[#1C1E21] mb-4'
      >
        Recover More.
        <span className='text-[#43CD66] underline'>
          {' '}
          Risk Less. Reclaim Control{' '}
        </span>
      </motion.h2>
    </div>
    {features.map((feature, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        viewport={{ once: true, margin: '-100px' }}
        className={`relative mb-10 md:mb-32 ${index % 2 === 1 ? 'bg-gray-50 py-5 md:py-24' : 'py-8 md:py-12'
          }`}
      >
        <div className='container mx-auto px-4'>
          <div
            className={`flex flex-col lg:flex-row items-center gap-1 md:gap-12`}
          >
            {/* Text Content Area */}
            <div
              className={`w-full lg:w-1/2 ${index % 2 === 1 ? 'lg:order-2' : 'lg:order-1'
                }`}
            >
              <div className='flex flex-col md:flex-row md:gap-8 h-full'>
                <div className='md:flex-1 mb-0'>
                  <h3 className='text-2xl md:text-3xl lg:text-5xl font-semibold text-[#1C1E21] mb-2 md:mb-4 md:mb-6'>
                    {feature.title}
                  </h3>
                  <p className='text-lg md:text-xl text-[#1C1E21]/70 mb-4 md:mb-6 leading-relaxed '>
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Image Section */}
            <div
              className={`w-full lg:w-1/2 mt-0 lg:mt-0 ${index % 2 === 1 ? 'lg:order-1' : 'lg:order-2'
                }`}
            >
              <div className='relative rounded-xl overflow-hidden shadow-lg border border-gray-100 transform transition-transform duration-500 hover:scale-[1.02]'>
                {/* Gradient overlay */}

                {/* Render customContent if provided */}
                {feature.customContent && (
                  <div className='md:flex-1 bg-gray-50 p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm self-start hover:shadow-md transition-shadow duration-300'>
                    {feature.customContent}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    ))}
  </section>
)
