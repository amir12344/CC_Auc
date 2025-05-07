'use client';

import { ReactNode } from 'react';
import Image from 'next/image';

export interface SellerFeatureItemProps {
  /**
   * Feature title
   */
  title: string;
  
  /**
   * Feature description
   */
  description: string;
  
  /**
   * Icon component to display
   */
  icon?: ReactNode;
  
  /**
   * Path to the feature image
   */
  imagePath: string;
  
  /**
   * Alt text for the image
   */
  imageAlt: string;
  
  /**
   * Whether to reverse the layout (image on right vs left)
   * @default false
   */
  reverse?: boolean;
  
  /**
   * Optional custom content to display below the description
   */
  customContent?: ReactNode;
  
  /**
   * Optional custom content to overlay on the image
   */
  imageOverlay?: ReactNode;
  
  /**
   * Optional background color for the section
   * @default 'white'
   */
  backgroundColor?: 'white' | 'gray';
}

/**
 * Specialized feature item component for seller features with more complex layouts
 */
export const SellerFeatureItem = ({
  title,
  description,
  icon,
  imagePath,
  imageAlt,
  reverse = false,
  customContent,
  imageOverlay,
  backgroundColor = 'white',
}: SellerFeatureItemProps) => {
  const bgClass = backgroundColor === 'gray' ? 'bg-gray-50' : 'bg-white';
  
  return (
    <div className={`relative py-16 ${bgClass} mb-32`}>
      {/* Optional background decoration */}
      {backgroundColor === 'white' && (
        <div className="absolute -top-10 -left-10 w-64 h-64 bg-primary-50 rounded-full blur-[80px] -z-10"></div>
      )}
      
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Image section */}
          <div className={`w-full lg:w-1/2 ${reverse ? 'order-1 lg:order-2' : ''}`}>
            <div className="relative rounded-xl overflow-hidden shadow-xl border border-gray-100">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-transparent z-0"></div>
              <Image
                src={imagePath}
                alt={imageAlt}
                width={650}
                height={400}
                quality={90}
                className="w-full relative z-10"
              />
              
              {/* Optional image overlay content */}
              {imageOverlay}
            </div>
          </div>
          
          {/* Content section */}
          <div className={`w-full lg:w-1/2 ${reverse ? 'order-2 lg:order-1' : ''}`}>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-text-primary mb-4 md:mb-6">{title}</h2>
            <p className="text-lg text-text-secondary mb-8 leading-relaxed">{description}</p>
            
            {/* Optional custom content */}
            {customContent}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerFeatureItem;
