'use client';

import React from 'react';
import LogoHeader from './components/LogoHeader';
import EarlyAccessForm from './components/EarlyAccessForm';
import ProductCategories from './components/ProductCategories';
import TestimonialSlider from './components/TestimonialSlider';

export default function EarlyAccessPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-linear-to-br from-gray-50 to-white">
      {/* Left side with form */}
      <div className="relative w-full lg:w-1/2 bg-white overflow-y-auto">
        {/* Logo positioned at top left corner */}
        <LogoHeader />

        {/* Decorative background gradient and pattern */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-linear-to-br from-[#e8f5fc] via-[#f0fff4] to-[#e3f9e5] opacity-90" />
          {/* Decorative SVG blob */}
          <svg className="absolute -top-24 -left-24 opacity-20" width="340" height="340" viewBox="0 0 340 340" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="170" cy="170" rx="170" ry="170" fill="#43cd66" fillOpacity="0.15" />
            <ellipse cx="120" cy="110" rx="90" ry="90" fill="#2196f3" fillOpacity="0.10" />
          </svg>
        </div>

        {/* Main content area with padding */}
        <div className="p-4 pt-24 lg:p-10 lg:pt-24 relative z-10">
          <div className="relative z-10 mx-auto w-full px-0 md:px-4">
            <EarlyAccessForm />
          </div>
        </div>
      </div>

      {/* Right side with product categories and testimonial */}
      <div className="relative w-full lg:w-1/2 min-h-screen bg-[#102D21] overflow-y-auto">
        <div className="w-full flex flex-col px-6 py-10 pt-12 lg:px-12 lg:pt-16 max-w-4xl xl:max-w-5xl mx-auto" style={{ minHeight: 'calc(100vh - 40px)' }}>
          <div className="flex flex-col h-full justify-between">
            <ProductCategories />
            <TestimonialSlider />
          </div>
        </div>
      </div>
    </div>
  );
}