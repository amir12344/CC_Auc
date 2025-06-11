'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Image from 'next/image';

interface Testimonial {
  quote: string;
  author: string;
  company: string;
  type: string;
  profileSrc: string;
}

// Memoize the testimonials array to prevent recreation on each render
const TESTIMONIALS: Testimonial[] = [
  {
    quote: "Finally a platform where I don't have to chase brokers or wonder if the manifest is real. Commerce Central makes sourcing simple and legit.",
    author: "National Wholesaler",
    company: "General Merchandise",
    type: "Wholesaler",
    profileSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80"
  },
  {
    quote: "I used to buy blind and hope for the best. Now I see exactly what I'm getting — brand, SKU count, condition, even shipping — before I pay.",
    author: "Regional Discount Store Chain Buyer",
    company: "",
    type: "Retailer",
    profileSrc: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80"
  },
  {
    quote: "Loads actually match the manifest. No fake resale rights, no guessing. It's given me confidence to scale up my sourcing.",
    author: "Amazon FBA Seller",
    company: "Top 2% Electronics",
    type: "Marketplace Seller",
    profileSrc: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80"
  },
  {
    quote: "I've been burned before — bad loads, no tracking, shady sellers. Commerce Central feels like the first place built for people like us.",
    author: "Large Bin Store & Pallet Reseller",
    company: "",
    type: "Reseller",
    profileSrc: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80"
  },
  {
    quote: "Everything's upfront — pricing, condition, location. No back and forth. Just clean deals from real sellers. That's rare in this space.",
    author: "Multi-Store Discount Retailer",
    company: "",
    type: "Retailer",
    profileSrc: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80"
  }
];

export default function TestimonialSlider() {
  // Use ref to track current index without causing re-renders
  const currentIndexRef = useRef<number>(0);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // Update both ref and state to keep them in sync
  const updateIndex = useCallback((newIndex: number) => {
    // Normalize index to be within bounds
    const normalizedIndex = (newIndex + TESTIMONIALS.length) % TESTIMONIALS.length;
    currentIndexRef.current = normalizedIndex;
    setCurrentIndex(normalizedIndex);
  }, []);

  // Handle navigation with stable function reference
  const goToTestimonial = useCallback((index: number) => {
    if (index === currentIndexRef.current) return; // Skip if already at this index
    
    setIsAnimating(true);
    // Use the ref version in the timeout to avoid closure issues
    setTimeout(() => {
      updateIndex(index);
      setIsAnimating(false);
    }, 500);
  }, [updateIndex]);

  // Auto-advance testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (currentIndexRef.current + 1) % TESTIMONIALS.length;
      goToTestimonial(nextIndex);
    }, 5000);

    return () => clearInterval(timer);
  }, [goToTestimonial]);

  // Get current testimonial
  const testimonial = TESTIMONIALS[currentIndex];
  const hasAuthorInfo = testimonial.company || testimonial.type;

  return (
    <div className="border-t border-[#0c4d3a] lg:mt-auto">
      <h3 className="text-center font-bold text-[#43cd66] text-[30px] text-xl mt-[2rem] mb-4">Trusted by innovators and industry leaders</h3>
      <div 
        className={`transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}
        aria-live="polite"
        aria-atomic="true"
      >
        <blockquote className="text-lg md:text-xl text-gray-100 italic mb-6 font-medium text-center">
          <svg 
            aria-hidden="true" 
            className="w-6 h-6 inline-block text-[#43cd66] mb-2 mr-1" 
            fill="currentColor" 
            viewBox="0 0 24 24"
            focusable="false"
          >
            <path d="M7.17 17A5.001 5.001 0 0 1 2 12V7a5 5 0 0 1 5-5h.17A3.001 3.001 0 0 1 10 5v2a3 3 0 0 1-3 3H5v2a3 3 0 0 0 3 3h.17A3.001 3.001 0 0 1 10 17v2a3 3 0 0 1-3 3H7a5 5 0 0 1-5-5v-2h5.17z" />
          </svg>
          <span className="sr-only">Testimonial:</span>
          "{testimonial.quote}"
        </blockquote>
        <div className="flex items-center justify-center gap-3 mt-4">
          <div className="h-11 w-11 overflow-hidden rounded-full">
            <Image
              src={testimonial.profileSrc}
              alt={testimonial.author}
              width={44}
              height={44}
              className="object-cover"
            />
          </div>
          <div className="text-left">
            <div className="font-semibold text-white text-base leading-tight">{testimonial.author}</div>
            {(testimonial.company || testimonial.type) && (
              <div className="text-xs text-gray-300 leading-tight">
                {testimonial.company}
                {testimonial.company && testimonial.type ? ' • ' : ''}
                {testimonial.type}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-center gap-2 mt-6" role="tablist" aria-label="Testimonial navigation">
        {TESTIMONIALS.map((_testimonial: Testimonial, idx: number) => {
          const isSelected = idx === currentIndex;
          return (
            <button
              key={idx}
              type="button"
              role="tab"
              id={`testimonial-tab-${idx}`}
              aria-selected={isSelected}
              aria-controls={`testimonial-${idx}`}
              className={`h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#43cd66] ${isSelected ? 'bg-[#43cd66] w-4' : 'bg-gray-400 bg-opacity-40 w-2 hover:bg-opacity-60'}`}
              onClick={() => goToTestimonial(idx)}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  goToTestimonial(idx);
                }
              }}
            >
              <span className="sr-only">View testimonial {idx + 1}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
