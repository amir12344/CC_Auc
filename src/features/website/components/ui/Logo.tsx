'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { FC } from 'react';

interface LogoProps {
  variant?: 'light' | 'dark';
  showFullOnMobile?: boolean;
  size?: 'small' | 'medium' | 'large' | number;
  minWidth?: number;
}

// Helper function to determine logo variant based on context
export const getLogoVariant = () => {
  // Check if we're on a specific page
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    
    // For team page, use light variant
    if (path.includes('/website/team')) {
    return 'light';
  }
  }
  
  // Default to light variant
  return 'light';
};

// Create a custom SVG component that wraps the Image component
interface CommerceCentralLogoProps {
  width: number;
  height: number;
  variant?: 'light' | 'dark';
  minWidth?: number;
}

// Create a custom SVG component that wraps the Image component
const CommerceCentralLogo: FC<CommerceCentralLogoProps> = ({ width, height, minWidth = 140 }) => {
  // Use a reliable path with proper error handling
  return (
    <Image
      src="/CommerceCentral_LogoV2_dark.svg" 
      alt="Commerce Central Logo"
      width={width}
      height={height}
      style={{ minWidth, minHeight: height }}
      priority
      onError={(e) => {
        // Fallback in case the primary logo doesn't load
        const img = e.currentTarget;
        img.onerror = null; // Prevent infinite loop
        img.src = '/images/CommerceCentral_LogoV2.svg';
      }}
    />
  );
};

const Logo: React.FC<LogoProps> = ({ size = 'medium', minWidth = 130 }) => {
  // Light variant: for dark backgrounds (green logo on dark)
  // Dark variant: for light backgrounds (green/dark logo on light)
  
  
  // Determine logo size based on size prop
  const getSizeStyles = () => {
    if (typeof size === 'number') {
      return { width: size, height: size };
    }
    switch(size) {
      case 'small':
        return { width: 30, height: 30 };
      case 'large':
        return { width: 50, height: 50 };
      case 'medium':
      default:
        return { width: 40, height: 40 };
    }
  };
  
  const { width, height } = getSizeStyles();

  // No need for dynamic font scaling in this component

  return (
    <Link href='/'>
      <motion.div
        className='inline-flex items-center cursor-pointer'
        whileHover={{ scale: 1.05 }}
      >
        <CommerceCentralLogo width={width} height={height} minWidth={minWidth} />
      </motion.div>
    </Link>
  )
};

export default Logo;
