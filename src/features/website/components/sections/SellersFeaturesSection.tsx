'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { FaExclamationCircle, FaCheckCircle, FaLock, FaMoneyBillWave, FaWarehouse, FaFileAlt, FaSearch, FaChartLine, FaClipboardCheck } from 'react-icons/fa';

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

const SellersFeaturesSection: React.FC = () => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  
  const comparisonItems: ComparisonItem[] = [
    {
      problem: {
        title: 'Brand Erosion Risk',
        description: 'You\'re forced into fire-sale marketplaces just to clear space — and watch your brand value erode in the process.',
        icon: <FaExclamationCircle className="text-red-400" />
      },
      solution: {
        title: 'Controlled Channel Exit',
        description: 'You choose resale channels, buyer types, and pricing floors — protecting brand equity and future retail partnerships.',
        icon: <FaLock className="text-[#43CD66]" />
      },
    },
    {
      problem: {
        title: 'No Pricing Discipline',
        description: 'Broker chains and backdoor deals blur-sm accountability — and kill any hope of pricing control.',
        icon: <FaMoneyBillWave className="text-red-400" />
      },
      solution: {
        title: 'Transparent Transactions',
        description: 'Every load is verified, tracked, and sold direct — no brokers, no markup, no surprises.',
        icon: <FaSearch className="text-[#43CD66]" />
      },
    },
    {
      problem: {
        title: 'Stalled Warehouse Flow',
        description: 'Inventory sits idle, tying up cash and blocking throughput — but no one\'s sure what to do with it.',
        icon: <FaWarehouse className="text-red-400" />
      },
      solution: {
        title: 'Structured Inventory Routing',
        description: 'We flag aging inventory early and move it through approved resale — freeing up space and working capital.',
        icon: <FaChartLine className="text-[#43CD66]" />
      },
    },
    {
      problem: {
        title: 'Write-Off Fire Drills',
        description: 'Finance teams scramble to manage write-downs and plug audit gaps after the damage is done.',
        icon: <FaFileAlt className="text-red-400" />
      },
      solution: {
        title: 'Audit-Ready Resale',
        description: 'We coordinate resale docs, payment records, and licensing — making every exit compliant and finance-approved.',
        icon: <FaClipboardCheck className="text-[#43CD66]" />
      },
    },
  ];

  return (
    <section
      id='sellers-features'
      ref={ref}
      className='py-10 md:py-24 bg-[#F1E9DE] overflow-hidden'
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-20'>
          <motion.p
            className='text-lg font-medium uppercase tracking-wider text-[#43CD66]'
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            SELLERS
          </motion.p>
          <motion.h2
            className='mt-2 text-3xl font-bold md:text-5xl font-bold tracking-tight'
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className='relative inline-block'>
              The Problem You Know.
              <span className='absolute -bottom-1 left-0 w-full h-1 bg-[#43cd66] rounded-full opacity-80'></span>
            </span>{' '}
            <span className='whitespace-nowrap'>The Fix You Need.</span>
          </motion.h2>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16'>
          {/* Before Column */}
          <div>
            <div className='mb-8 flex items-center'>
              <div className='w-2 h-10 bg-red-400 rounded-r-md mr-3'></div>
              <div className='flex items-center px-4 py-2 bg-red-50 rounded-lg shadow-xs'>
                <FaExclamationCircle className="mr-2 text-red-400 w-5 h-5" />
                <h3 className='text-2xl font-semibold text-[#222222]'>Before Commerce Central</h3>
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
                      <h4 className='text-xl font-semibold text-gray-800 mb-2'>
                        {item.problem.title}
                      </h4>
                      <p className='font-[#1C1E21] text-[18px]'>
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
                <h3 className='text-2xl font-semibold text-gray-800'>After Commerce Central</h3>
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
                      <h4 className='text-xl font-semibold text-gray-800 mb-2'>
                        {item.solution.title}
                      </h4>
                      <p className='font-[#1C1E21] text-[18px]'>
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

export default SellersFeaturesSection;
