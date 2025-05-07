'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';

export interface ComparisonItem {
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

export interface ComparisonFeatureProps {
  /**
   * Title for the section
   */
  title: React.ReactNode;
  
  /**
   * Subtitle for the section (optional)
   */
  subtitle?: string;
  
  /**
   * Array of comparison items to display
   */
  items: ComparisonItem[];
  
  /**
   * Background color for the section
   * @default 'dark'
   */
  background?: 'dark' | 'light';
  
  /**
   * Optional ID for the section
   */
  id?: string;
  
  /**
   * Optional className for the section
   */
  className?: string;
  
  /**
   * Label for the "before" column
   * @default 'Before'
   */
  beforeLabel?: string;
  
  /**
   * Label for the "after" column
   * @default 'After'
   */
  afterLabel?: string;
  
  /**
   * Icon for the "before" column
   */
  beforeIcon?: React.ReactNode;
  
  /**
   * Icon for the "after" column
   */
  afterIcon?: React.ReactNode;
}

/**
 * A component that displays a before/after comparison of features
 */
export const ComparisonFeature: React.FC<ComparisonFeatureProps> = ({
  title,
  subtitle,
  items,
  background = 'dark',
  id,
  className = '',
  beforeLabel = 'Before',
  afterLabel = 'After',
  beforeIcon,
  afterIcon,
}) => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  
  // Set colors based on background
  const bgColor = background === 'dark' ? 'bg-[#102D21]' : 'bg-white';
  const textColor = background === 'dark' ? 'text-[#F1E9DE]' : 'text-text-secondary';
  const headingColor = background === 'dark' ? 'text-primary' : 'text-text-primary';
  
  // Problem column colors
  const problemLineColor = 'bg-red-400';
  const problemBgColor = 'bg-red-50';
  const problemIconColor = 'text-red-400';
  const problemVerticalLineColor = 'bg-red-200';
  const problemCircleBgColor = 'bg-red-50 border-red-100';
  
  // Solution column colors
  const solutionLineColor = 'bg-primary';
  const solutionBgColor = 'bg-primary-50';
  const solutionIconColor = 'text-primary';
  const solutionVerticalLineColor = 'bg-primary-300/40';
  const solutionCircleBgColor = 'bg-primary-50 border-primary-200/20';
  
  return (
    <section
      id={id}
      ref={ref}
      className={`py-10 md:py-24 ${bgColor} overflow-hidden ${className}`}
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-20'>
          {subtitle && (
            <motion.p
              className={`text-lg font-medium uppercase tracking-wider ${headingColor}`}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
            >
              {subtitle}
            </motion.p>
          )}
          <motion.h2
            className={`mt-2 text-4xl font-bold md:text-5xl ${headingColor} tracking-tight`}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {title}
          </motion.h2>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16'>
          {/* Before Column */}
          <div>
            <div className='mb-8 flex items-center'>
              <div className={`w-2 h-10 ${problemLineColor} rounded-r-md mr-3`}></div>
              <div className={`flex items-center px-4 py-2 ${problemBgColor} rounded-lg shadow-xs`}>
                {beforeIcon || <div className={`mr-2 ${problemIconColor} w-5 h-5`} />}
                <h3 className={`text-2xl font-semibold ${headingColor}`}>{beforeLabel}</h3>
              </div>
            </div>
            
            <div className='relative'>
              {/* Vertical line */}
              <div className={`absolute left-[19px] top-0 bottom-0 w-[1px] ${problemVerticalLineColor}`}></div>
              
              <div className='space-y-14'>
                {items.map((item, index) => (
                  <motion.div
                    key={`problem-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className='relative'
                  >
                    <div className='absolute left-0 top-1.5'>
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${problemCircleBgColor} border`}>
                        <div className="w-5 h-5">
                          {item.problem.icon}
                        </div>
                      </div>
                    </div>
                    
                    <div className='pl-16'>
                      <h4 className={`text-xl font-semibold ${headingColor} mb-2`}>
                        {item.problem.title}
                      </h4>
                      <p className={`${textColor} text-[18px]`}>
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
              <div className={`w-2 h-10 ${solutionLineColor} rounded-r-md mr-3`}></div>
              <div className={`flex items-center px-4 py-2 ${solutionBgColor} rounded-lg shadow-xs`}>
                {afterIcon || <div className={`mr-2 ${solutionIconColor} w-5 h-5`} />}
                <h3 className={`text-2xl font-semibold ${headingColor}`}>{afterLabel}</h3>
              </div>
            </div>
            
            <div className='relative'>
              {/* Vertical line */}
              <div className={`absolute left-[19px] top-0 bottom-0 w-[1px] ${solutionVerticalLineColor}`}></div>
              
              <div className='space-y-14'>
                {items.map((item, index) => (
                  <motion.div
                    key={`solution-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.1 + (index * 0.1) }}
                    className='relative'
                  >
                    <div className='absolute left-0 top-1.5'>
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full ${solutionCircleBgColor} border`}>
                        <div className="w-5 h-5">
                          {item.solution.icon}
                        </div>
                      </div>
                    </div>
                    
                    <div className='pl-16'>
                      <h4 className={`text-xl font-semibold ${headingColor} mb-2`}>
                        {item.solution.title}
                      </h4>
                      <p className={`${textColor} text-[18px]`}>
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

export default ComparisonFeature;
