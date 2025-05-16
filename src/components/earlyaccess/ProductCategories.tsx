'use client'

import React, { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { CheckCircle2, ChevronDown, ArrowRight } from 'lucide-react'

const productCategories = [
  { name: 'Houseware', imageUrl: '/images/KitchenHouseware.webp' },
  { name: 'Appliances', imageUrl: '/images/SmallAppliances.webp' },
  { name: 'Electronics', imageUrl: '/images/ConsumerElectronics.webp' },
  { name: 'Beauty', imageUrl: '/images/beauty_products.webp' },
  { name: 'CPG', imageUrl: '/images/CleaningSupplies_Option2.webp' },
  { name: 'Furniture', imageUrl: '/images/Furnitures.webp' },
]

const valueProps = [
  {
    text: "Access to verified, brand-direct surplus and returns.",
    icon: "/images/verified-icon.svg", // You can replace with appropriate icons
    color: "#43CD66"
  },
  {
    text: "Fully manifested loaded with transparent pricing.",
    icon: "/images/price-icon.svg",
    color: "#43CD66"
  },
  {
    text: "Streamlined logistics and reliable delivery, every time.",
    icon: "/images/delivery-icon.svg",
    color: "#43CD66"
  }
]

export default function ProductCategories() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showScrollButton, setShowScrollButton] = useState(true);
  const componentRef = useRef<HTMLDivElement>(null);

  // Auto-scroll for mobile
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % valueProps.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Function to manually change active slide
  const setSlide = (index: number) => {
    setActiveIndex(index);
  };

  // Add scroll listener to show/hide button based on visibility of the form
  useEffect(() => {
    const handleScroll = () => {
      const formElement = document.getElementById('contact-form');
      if (formElement) {
        const formRect = formElement.getBoundingClientRect();
        const isFormVisible = formRect.top < window.innerHeight && formRect.bottom >= 0;
        setShowScrollButton(!isFormVisible);
      } else {
        // If no form is found, show button until we're close to the bottom of the page
        const scrollPosition = window.scrollY + window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        setShowScrollButton(scrollPosition < documentHeight - 200);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-[#102D21] md:py-8 pt-8 pb-0" ref={componentRef}>
      {/* Value proposition with separate mobile/desktop versions */}
      <div className='mb-12'>
        {/* Mobile version - Enhanced with better visual design */}

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
          <p className="mb-2 mt-2 text-lg md:text-xl text-[white] font-[400] md:font-semibold text-center">
            Get access to surplus and returned inventory from the brands consumers love,<br className='hidden md:block' />
            from mass market to designer.
          </p>
        </div>
        <div className='grid grid-cols-3 gap-3 md:gap-1 lg:gap-2 mb-0 md:mb-8 border-none max-w-4xl mx-auto md:px-4 p-0 md:py-4'>
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
                    unoptimized
                  />
                </div>
              </div>
              <div className='py-1 text-center rounded-lg'>
                <span className='text-md md:text-lg text-[#F1E9DE]'>
                  {category.name}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop version */}
        <div className='hidden md:block'>
          <div className='max-w-4xl mx-auto p-6 bg-[#102D21] rounded-xl shadow-lg border border-[#43CD66]/20'>
            <h2 className='text-center text-white text-2xl font-bold mb-6'>
              Built for <span className='text-[#43CD66]'>Serious Buyers</span>
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

      <div className='md:hidden p-0'>
        {/* Modern, glass-effect card container */}
        <div className='backdrop-blur-sm bg-gradient-to-br from-[#102D21]/80 to-[#0A1F16]/90 rounded-xl p-6 shadow-lg border border-[#43CD66]/20 overflow-hidden relative'>

          {/* Title for the carousel */}
          <h3 className='text-white font-semibold text-lg mb-6 text-center relative z-10'>
            Built for <span className='text-[#43CD66]'>Serious Buyers</span>
          </h3>

          {/* Animated value props carousel with improved layout */}
          <div className='relative h-[150px] overflow-hidden mb-5 z-10'>
            {valueProps.map((prop, index) => (
              <div
                key={index}
                className={`absolute top-0 left-0 w-full transition-all duration-700 ease-in-out ${index === activeIndex
                  ? 'opacity-100 translate-x-0'
                  : index < activeIndex
                    ? 'opacity-0 -translate-x-full'
                    : 'opacity-0 translate-x-full'
                  }`}
              >
                <div className='flex flex-col items-center text-center'>
                  {/* Modern icon container with subtle shadow */}
                  <div className='flex items-center justify-center w-14 h-14 mb-5 rounded-full bg-[#0A1F16]/80 shadow-[0_0_15px_rgba(67,205,102,0.15)] border border-[#43CD66]/30'>
                    <CheckCircle2
                      className='text-[#43CD66] w-7 h-7'
                    />
                  </div>

                  {/* Text with improved typography */}
                  <p className='text-[white] font-medium text-lg px-2 leading-relaxed'>
                    {prop.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Modern dot indicators with subtle animation */}
          <div className='flex justify-center items-center space-x-3 relative z-10'>
            {valueProps.map((_, index) => (
              <button
                key={index}
                onClick={() => setSlide(index)}
                className={`transition-all duration-500 outline-none focus:outline-none focus:ring-1 focus:ring-[#43CD66] ${index === activeIndex
                  ? 'w-8 h-2 bg-[#43CD66] rounded-full shadow-[0_0_8px_rgba(67,205,102,0.5)]'
                  : 'w-2 h-2 bg-[#43CD66]/30 rounded-full hover:bg-[#43CD66]/60'
                  }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>


      {/* Sticky Mobile-only scroll indicator button */}
      {showScrollButton && (
        <div
          className="md:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 cursor-pointer animate-bounce"
          onClick={() => {
            requestAnimationFrame(() => {
              let targetElement: HTMLElement | null = null;
              let scrollOffset = 20; // Default offset from the top of the viewport

              // Selector for the specific "Early Access" span based on its unique classes
              const earlyAccessSpanSelector = 'span[class*="from-[#102d21]"][class*="to-[#43cd66]"]';

              // Attempt 1: Find the form, then the specific span within it
              const formElement = document.getElementById('contact-form') as HTMLElement | null;
              if (formElement) {
                targetElement = formElement.querySelector(earlyAccessSpanSelector) as HTMLElement | null;
                if (targetElement) {
                  scrollOffset = 20; // Position the span nicely
                } else {
                  // Span not found in form, target top of form itself
                  targetElement = formElement;
                  scrollOffset = 20;
                }
              }

              // Attempt 2: If form or span in form not found, global search for the specific span
              if (!targetElement) {
                targetElement = document.querySelector(earlyAccessSpanSelector) as HTMLElement | null;
                if (targetElement) {
                  scrollOffset = 20;
                }
              }

              // Attempt 3: If specific span is still not found, search for a general "Reserve Access" button
              if (!targetElement) {
                const buttons = Array.from(document.querySelectorAll('button'));
                const reserveButton = buttons.find(btn =>
                  btn.textContent &&
                  (btn.textContent.trim().toLowerCase().includes('reserve access') ||
                    btn.textContent.trim().toLowerCase().includes('early access') ||
                    btn.textContent.trim().toLowerCase().includes('get access'))
                );
                if (reserveButton) {
                  targetElement = reserveButton as HTMLElement;
                  scrollOffset = 60; // Give more space above a button
                }
              }

              // Execute scroll if a target was found
              if (targetElement) {
                const rect = targetElement.getBoundingClientRect();
                const absoluteElementTop = window.pageYOffset + rect.top;
                window.scrollTo({
                  top: absoluteElementTop - scrollOffset,
                  behavior: 'smooth'
                });
              } else {
                // Final Fallback: Scroll towards the bottom of the page
                window.scrollTo({
                  top: document.body.scrollHeight - window.innerHeight - 50, // 50px buffer
                  behavior: 'smooth'
                });
              }
            });
          }}
          aria-label="Scroll to relevant section"
        >
          <div className="bg-[#43CD66] p-3 rounded-full shadow-lg hover:bg-[#3AB857] transition-colors duration-300">
            <ChevronDown className="text-black w-5 h-5" />
          </div>
        </div>
      )}
    </div>
  )
}
