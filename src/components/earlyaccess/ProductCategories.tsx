"use client";

import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

import { ArrowRight, CheckCircle2, ChevronDown } from "lucide-react";

const productCategories = [
  { name: "Houseware", imageUrl: "/images/KitchenHouseware.webp" },
  { name: "Appliances", imageUrl: "/images/SmallAppliances.webp" },
  { name: "Electronics", imageUrl: "/images/ConsumerElectronics.webp" },
  { name: "Beauty", imageUrl: "/images/beauty_products.webp" },
  { name: "CPG", imageUrl: "/images/CleaningSupplies_Option2.webp" },
  { name: "Furniture", imageUrl: "/images/Furnitures.webp" },
];

const valueProps = [
  {
    text: "Access to verified, brand-direct surplus and returns.",
    icon: "/images/verified-icon.svg", // You can replace with appropriate icons
    color: "#43CD66",
  },
  {
    text: "Fully manifested loaded with transparent pricing.",
    icon: "/images/price-icon.svg",
    color: "#43CD66",
  },
  {
    text: "Streamlined logistics and reliable delivery, every time.",
    icon: "/images/delivery-icon.svg",
    color: "#43CD66",
  },
];

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
      const formElement = document.getElementById("contact-form");
      if (formElement) {
        const formRect = formElement.getBoundingClientRect();
        const isFormVisible =
          formRect.top < window.innerHeight && formRect.bottom >= 0;
        setShowScrollButton(!isFormVisible);
      } else {
        // If no form is found, show button until we're close to the bottom of the page
        const scrollPosition = window.scrollY + window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        setShowScrollButton(scrollPosition < documentHeight - 200);
      }
    };

    window.addEventListener("scroll", handleScroll);
    // Initial check
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-[#102D21] pt-8 pb-0 md:py-8" ref={componentRef}>
      {/* Value proposition with separate mobile/desktop versions */}
      <div className="mb-12">
        {/* Mobile version - Enhanced with better visual design */}

        <div className="mb-6">
          <h2
            className="pb-4 text-center text-2xl text-[#ffffff] sm:text-3xl md:text-4xl lg:text-5xl"
            style={{ fontWeight: 900 }}
          >
            Products from the World&apos;s <br />
            <span className="relative inline-block text-[#43CD66]">
              best brands
              <span className="absolute bottom-0 left-0 h-1 w-full bg-[#43CD66]"></span>
            </span>
          </h2>
          <p className="mt-2 mb-2 text-center text-lg font-[400] text-[white] md:text-xl md:font-semibold">
            Get access to surplus and returned inventory from the brands
            consumers love,
            <br className="hidden md:block" />
            from mass market to designer.
          </p>
        </div>
        <div className="mx-auto mb-0 grid max-w-4xl grid-cols-3 gap-3 border-none p-0 md:mb-8 md:gap-1 md:px-4 md:py-4 lg:gap-2">
          {productCategories.map((category, index) => (
            <div key={index} className="mb-2 border-none">
              <div
                className="mx-auto max-w-[120px] transform overflow-hidden border-none bg-white shadow-xs transition-transform duration-300 hover:scale-105 sm:max-w-[140px] md:max-w-[160px]"
                style={{ borderRadius: "8px" }}
              >
                <div className="relative aspect-square overflow-hidden rounded-sm border-none">
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 20vw"
                    className="border-none object-cover"
                    priority={index < 3}
                    unoptimized
                  />
                </div>
              </div>
              <div className="rounded-lg py-1 text-center">
                <span className="text-md text-[#F1E9DE] md:text-lg">
                  {category.name}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop version */}
        <div className="hidden md:block">
          <div className="mx-auto max-w-4xl rounded-xl border border-[#43CD66]/20 bg-[#102D21] p-6 shadow-lg">
            <h2 className="mb-6 text-center text-2xl font-bold text-white">
              Built for <span className="text-[#43CD66]">Serious Buyers</span>
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="group rounded-lg p-4 transition-all duration-300 hover:bg-[#102D21]/80">
                <div className="mb-3 flex items-center">
                  <CheckCircle2 className="mr-2 h-6 w-6 flex-shrink-0 text-[#43CD66] transition-all duration-300 group-hover:scale-110" />
                  <h3 className="text-lg font-semibold text-white transition-colors duration-300 group-hover:text-[#43CD66]">
                    Verified Products
                  </h3>
                </div>
                <p className="text-sm text-white/70">
                  Access to verified, brand-direct surplus and returns from
                  trusted brands.
                </p>
              </div>

              <div className="group rounded-lg p-4 transition-all duration-300 hover:bg-[#102D21]/80">
                <div className="mb-3 flex items-center">
                  <CheckCircle2 className="mr-2 h-6 w-6 flex-shrink-0 text-[#43CD66] transition-all duration-300 group-hover:scale-110" />
                  <h3 className="text-lg font-semibold text-white transition-colors duration-300 group-hover:text-[#43CD66]">
                    Transparent Pricing
                  </h3>
                </div>
                <p className="text-sm text-white/70">
                  Fully manifested inventory with clear, upfront pricing for
                  complete visibility.
                </p>
              </div>

              <div className="group rounded-lg p-4 transition-all duration-300 hover:bg-[#102D21]/80">
                <div className="mb-3 flex items-center">
                  <CheckCircle2 className="mr-2 h-6 w-6 flex-shrink-0 text-[#43CD66] transition-all duration-300 group-hover:scale-110" />
                  <h3 className="text-lg font-semibold text-white transition-colors duration-300 group-hover:text-[#43CD66]">
                    Reliable Delivery
                  </h3>
                </div>
                <p className="text-sm text-white/70">
                  Streamlined logistics and dependable shipping for a seamless
                  experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-0 md:hidden">
        {/* Modern, glass-effect card container */}
        <div className="relative overflow-hidden rounded-xl border border-[#43CD66]/20 bg-gradient-to-br from-[#102D21]/80 to-[#0A1F16]/90 p-6 shadow-lg backdrop-blur-sm">
          {/* Title for the carousel */}
          <h3 className="relative z-10 mb-6 text-center text-lg font-semibold text-white">
            Built for <span className="text-[#43CD66]">Serious Buyers</span>
          </h3>

          {/* Animated value props carousel with improved layout */}
          <div className="relative z-10 mb-5 h-[150px] overflow-hidden">
            {valueProps.map((prop, index) => (
              <div
                key={index}
                className={`absolute top-0 left-0 w-full transition-all duration-700 ease-in-out ${
                  index === activeIndex
                    ? "translate-x-0 opacity-100"
                    : index < activeIndex
                      ? "-translate-x-full opacity-0"
                      : "translate-x-full opacity-0"
                }`}
              >
                <div className="flex flex-col items-center text-center">
                  {/* Modern icon container with subtle shadow */}
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-[#43CD66]/30 bg-[#0A1F16]/80 shadow-[0_0_15px_rgba(67,205,102,0.15)]">
                    <CheckCircle2 className="h-7 w-7 text-[#43CD66]" />
                  </div>

                  {/* Text with improved typography */}
                  <p className="px-2 text-lg leading-relaxed font-medium text-[white]">
                    {prop.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Modern dot indicators with subtle animation */}
          <div className="relative z-10 flex items-center justify-center space-x-3">
            {valueProps.map((_, index) => (
              <button
                key={index}
                onClick={() => setSlide(index)}
                className={`transition-all duration-500 outline-none focus:ring-1 focus:ring-[#43CD66] focus:outline-none ${
                  index === activeIndex
                    ? "h-2 w-8 rounded-full bg-[#43CD66] shadow-[0_0_8px_rgba(67,205,102,0.5)]"
                    : "h-2 w-2 rounded-full bg-[#43CD66]/30 hover:bg-[#43CD66]/60"
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
          className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 transform animate-bounce cursor-pointer md:hidden"
          onClick={() => {
            requestAnimationFrame(() => {
              let targetElement: HTMLElement | null = null;
              let scrollOffset = 20; // Default offset from the top of the viewport

              // Selector for the specific "Early Access" span based on its unique classes
              const earlyAccessSpanSelector =
                'span[class*="from-[#102d21]"][class*="to-[#43cd66]"]';

              // Attempt 1: Find the form, then the specific span within it
              const formElement = document.getElementById(
                "contact-form"
              ) as HTMLElement | null;
              if (formElement) {
                targetElement = formElement.querySelector(
                  earlyAccessSpanSelector
                ) as HTMLElement | null;
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
                targetElement = document.querySelector(
                  earlyAccessSpanSelector
                ) as HTMLElement | null;
                if (targetElement) {
                  scrollOffset = 20;
                }
              }

              // Attempt 3: If specific span is still not found, search for a general "Reserve Access" button
              if (!targetElement) {
                const buttons = Array.from(document.querySelectorAll("button"));
                const reserveButton = buttons.find(
                  (btn) =>
                    btn.textContent &&
                    (btn.textContent
                      .trim()
                      .toLowerCase()
                      .includes("reserve access") ||
                      btn.textContent
                        .trim()
                        .toLowerCase()
                        .includes("early access") ||
                      btn.textContent
                        .trim()
                        .toLowerCase()
                        .includes("get access"))
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
                  behavior: "smooth",
                });
              } else {
                // Final Fallback: Scroll towards the bottom of the page
                window.scrollTo({
                  top: document.body.scrollHeight - window.innerHeight - 50, // 50px buffer
                  behavior: "smooth",
                });
              }
            });
          }}
          aria-label="Scroll to relevant section"
        >
          <div className="rounded-full bg-[#43CD66] p-3 shadow-lg transition-colors duration-300 hover:bg-[#3AB857]">
            <ChevronDown className="h-5 w-5 text-black" />
          </div>
        </div>
      )}
    </div>
  );
}
