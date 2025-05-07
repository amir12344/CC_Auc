'use client';

import { ReactNode } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export interface FeatureItemProps {
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
}

/**
 * Reusable feature item component that displays an image, title, and description
 */
export const FeatureItem = ({
  title,
  description,
  icon,
  imagePath,
  imageAlt,
  reverse = false,
  customContent,
  imageOverlay,
}: FeatureItemProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      viewport={{ once: true, margin: "-100px" }}
      className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-8 md:gap-16`}
    >
      {/* Image section */}
      <div className="w-full md:w-1/2">
        <div className="relative w-full aspect-4/3 overflow-hidden rounded-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-transparent z-0"></div>
          <Image
            src={imagePath}
            alt={imageAlt}
            fill
            quality={75}
            loading="lazy"
            className="object-cover z-10"
          />
          
          {/* Icon badge */}
          {icon && (
            <div className={`absolute ${reverse ? '-left-3 md:-left-6' : '-right-3 md:-right-6'} -bottom-3 md:-bottom-6 w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary flex items-center justify-center shadow-lg z-20`}>
              <div className="text-white scale-75 md:scale-100">
                {icon}
              </div>
            </div>
          )}
          
          {/* Optional image overlay content */}
          {imageOverlay}
        </div>
      </div>
      
      {/* Content section */}
      <div className="w-full md:w-1/2 mt-6 md:mt-0">
        <div className="max-w-xl mx-auto md:mx-0">
          <h3 className="text-xl md:text-3xl lg:text-4xl font-semibold text-text-primary mb-3 md:mb-4">
            {title}
          </h3>
          <p className="text-lg md:text-xl text-text-secondary mb-4 md:mb-6 leading-relaxed">
            {description}
          </p>
          
          {/* Optional custom content */}
          {customContent}
        </div>
      </div>
    </motion.div>
  );
};

export default FeatureItem;
