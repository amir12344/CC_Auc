'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { FaExclamationCircle, FaCheckCircle, FaMoneyBillWave, FaFileAlt, FaBoxOpen, FaFileContract } from 'react-icons/fa';

interface ComparisonItem {
  problem: {
    title: string;
    description: string;
    icon: React.ReactNode;
  };
  solution: {
    title: string;
    description: string;
    icon: React.ReactNode;
  };
}

const BuyersFeaturesSection: React.FC = () => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  
  const comparisonItems: ComparisonItem[] = [
    {
      problem: {
        title: 'Blind Wire Transfers',
        description: 'You wire money through group chats and pray the load is real — with no backup if things go wrong.',
        icon: <FaMoneyBillWave className="text-red-400" />
      },
      solution: {
        title: 'Verified Sellers Only',
        description: 'Every seller is pre-vetted. No shady Telegram brokers. No guessing if the load will ship.',
        icon: <FaCheckCircle className="text-[#43CD66]" />
      },
    },
    {
      problem: {
        title: 'Blurry Manifests',
        description: 'Manifests are vague or fake — and what shows up doesn’t match what you paid for.',
        icon: <FaFileAlt className="text-red-400" />
      },
      solution: {
        title: 'Real Manifests, Real Photos',
        description: 'You see brand-approved manifests, SKU counts, MSRP, and condition before you ever commit.',
        icon: <FaFileAlt className="text-[#43CD66]" />
      },
    },
    {
      problem: {
        title: 'Picked-Over Loads',
        description: 'You get stuck with leftovers — half the SKUs missing, or returns already cherry-picked.',
        icon: <FaBoxOpen className="text-red-400" />
      },
      solution: {
        title: 'Resale-Ready Inventory',
        description: 'Loads are clean, untouched, and sent directly from brands, retailers, or distributors.',
        icon: <FaBoxOpen className="text-[#43CD66]" />
      },
    },
    {
      problem: {
        title: 'No Resale Rights',
        description: 'You don’t know where the inventory came from — or whether you’re even allowed to sell it.',
        icon: <FaFileContract className="text-red-400" />
      },
      solution: {
        title: 'Clear Resale Confidence',
        description: 'We coordinate resale rights, purchase terms, and supporting docs — so you stay protected.',
        icon: <FaFileContract className="text-[#43CD66]" />
      },
    },
  ];

  return (
    <section
      id='buyers-features'
      ref={ref}
      className='py-10 md:py-24 bg-[#102D21] overflow-hidden'
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-20'>
          <motion.p
            className='text-lg font-medium uppercase tracking-wider text-[#43CD66]'
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            BUYERS
          </motion.p>
          <motion.h2
            className='mt-2 text-4xl font-bold md:text-5xl text-[#43CD66] tracking-tight'
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className='relative inline-block'>
              The Risk You Take.
              <span className='absolute -bottom-1 left-0 w-full h-1 bg-[#43cd66] rounded-full opacity-80'></span>
            </span>{' '}
            <span >The Confidence You Deserve.</span>
          </motion.h2>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16'>
          {/* Before Column */}
          <div>
            <div className='mb-8 flex items-center'>
              <div className='w-2 h-10 bg-red-400 rounded-r-md mr-3'></div>
              <div className='flex items-center px-4 py-2 bg-red-50 rounded-lg shadow-xs'>
                <FaExclamationCircle className="mr-2 text-red-400 w-5 h-5" />
                <h3 className='text-2xl font-semibold text-[#43CD66]'>Before Commerce Central</h3>
              </div>
            </div>
            
            <div className='relative'>
              {/* Vertical line */}
              <div className='absolute left-[19px] top-0 bottom-0 w-[1px] bg-red-200'></div>
              
              <div className='space-y-14'>
                {comparisonItems.map((item, index) => (
                  <motion.div
                    key={`problem-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className='relative'
                  >
                    <div className='absolute left-0 top-1.5'>
                      <div className='flex items-center justify-center w-10 h-10 rounded-full bg-red-50 border border-red-100'>
                        <div className="w-5 h-5">
                          {item.problem.icon}
                        </div>
                      </div>
                    </div>
                    
                    <div className='pl-16'>
                      <h4 className='text-xl font-semibold text-[#43CD66] mb-2'>
                        {item.problem.title}
                      </h4>
                      <p className='text-[#F1E9DE] text-[18px]'>
                        {item.problem.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* After Column */}
          <div>
            <div className='mb-8 flex items-center'>
              <div className='w-2 h-10 bg-[#43CD66] rounded-r-md mr-3'></div>
              <div className='flex items-center px-4 py-2 bg-[#E6F7E9] rounded-lg shadow-xs'>
                <FaCheckCircle className="mr-2 text-[#43CD66] w-5 h-5" />
                <h3 className='text-2xl font-semibold text-[#43CD66]'>After Commerce Central</h3>
              </div>
            </div>
            
            <div className='relative'>
              {/* Vertical line */}
              <div className='absolute left-[19px] top-0 bottom-0 w-[1px] bg-[#43CD66]/40'></div>
              
              <div className='space-y-14'>
                {comparisonItems.map((item, index) => (
                  <motion.div
                    key={`solution-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.1 + (index * 0.1) }}
                    className='relative'
                  >
                    <div className='absolute left-0 top-1.5'>
                      <div className='flex items-center justify-center w-10 h-10 rounded-full bg-[#E6F7E9] border border-[#43CD66]/20'>
                        <div className="w-5 h-5">
                          {item.solution.icon}
                        </div>
                      </div>
                    </div>
                    
                    <div className='pl-16'>
                      <h4 className='text-xl font-semibold text-[#43CD66] mb-2'>
                        {item.solution.title}
                      </h4>
                      <p className='text-[#F1E9DE] text-[18px]'>
                        {item.solution.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

       
      </div>
    </section>
  );
};

export default BuyersFeaturesSection;
