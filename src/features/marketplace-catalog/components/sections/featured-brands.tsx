"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useRef } from "react";

import { motion, useInView } from "framer-motion";

import SharedBackgroundPattern from "@/src/components/common/SharedBackgroundPattern";

const FeaturedBrands = () => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const brands = [
    {
      name: "Walmart",
      logo: "https://upload.wikimedia.org/wikipedia/commons/1/14/Walmart_Spark.svg",
      color: "#0071ce",
    },
    {
      name: "Amazon",
      logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
      color: "#ff9900",
    },
    {
      name: "Wayfair",
      logo: "https://upload.wikimedia.org/wikipedia/commons/7/75/Wayfair_logo.svg",
      color: "#7f187f",
    },
    {
      name: "Target",
      logo: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Target_logo.svg",
      color: "#cc0000",
    },
    {
      name: "Home Depot",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/TheHomeDepot.svg/478px-TheHomeDepot.svg.png",
      color: "#f96302",
    },
    {
      name: "IKEA",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Ikea_logo.svg/2560px-Ikea_logo.svg.png",
      color: "#0051ba",
    },
    {
      name: "Lowe's",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Lowes_Companies_Logo.svg/1024px-Lowes_Companies_Logo.svg.png",
      color: "#004990",
    },
    {
      name: "Best Buy",
      logo: "https://upload.wikimedia.org/wikipedia/commons/c/c4/Best_Buy_logo_2018.svg",
      color: "#0046be",
    },
  ];

  // Animation variants for staggered children
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 80,
        damping: 15,
      },
    },
  };

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden bg-[#102D21] py-20 md:py-28"
    >
      {/* Enhanced grid pattern overlay with animation */}
      <SharedBackgroundPattern />

      <div className="relative z-10 container mx-auto px-5 sm:px-6 lg:px-10">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#43CD66]/10 blur-3xl filter"></div>
        <div className="absolute right-0 bottom-0 h-96 w-96 translate-x-1/3 translate-y-1/3 rounded-full bg-[#43CD66]/10 blur-3xl filter"></div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.7 }}
          className="relative mb-16 text-center"
        >
          <span className="mb-5 inline-block rounded-full bg-[#43CD66]/20 px-5 py-1.5 text-sm font-medium tracking-wider text-[#43CD66] backdrop-blur-sm">
            TRUSTED PARTNERS
          </span>
          <h2 className="mb-5 text-4xl font-bold tracking-tight text-[#43CD66] lg:text-5xl xl:text-6xl">
            Shop Top Retailers
          </h2>
          <p className="mx-auto max-w-2xl text-lg font-medium text-balance text-[#D8F4CC] lg:text-xl">
            Browse products from your favorite stores all in one place
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 md:gap-8"
        >
          {brands.map((brand, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Link
                href={`/search?retailer=${encodeURIComponent(brand.name.toLowerCase())}&q=${encodeURIComponent(brand.name)}`}
                className="group relative block h-full overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-500 hover:shadow-[0_0_25px_rgba(67,205,102,0.2)]"
              >
                <div className="absolute inset-0 z-0 bg-gradient-to-br from-white via-white to-gray-50"></div>
                <div className="absolute right-0 bottom-0 left-0 h-1 origin-left scale-x-0 transform bg-gradient-to-r from-[#43CD66] to-[#25D366] transition-transform duration-500 ease-in-out group-hover:scale-x-100"></div>

                <div className="relative z-10 flex h-full flex-col items-center p-6 sm:p-8">
                  <div className="relative mb-6 flex h-28 w-full items-center justify-center rounded-xl bg-gray-50 p-4 transition-transform duration-700 group-hover:scale-110 sm:h-32">
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      fill
                      className="object-contain object-center p-4"
                      sizes="(max-width: 768px) 160px, 200px"
                      priority={index < 4}
                    />
                  </div>
                  <span className="text-lg font-semibold text-gray-800 transition-colors duration-300 group-hover:text-[#43CD66]">
                    {brand.name}
                  </span>
                  <span className="mt-3 inline-flex translate-y-2 transform items-center text-sm font-medium text-[#43CD66] opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    Shop now
                    <svg
                      className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <Link
            href="/brands"
            className="inline-flex items-center rounded-full border-2 border-[#43CD66] bg-[#43CD66] px-8 py-3.5 text-base font-medium text-[#102D21] shadow-[0_0_20px_rgba(67,205,102,0.3)] transition-all duration-300 hover:-translate-y-1 hover:bg-transparent hover:text-[#43CD66] hover:shadow-[0_0_30px_rgba(67,205,102,0.5)] focus:ring-2 focus:ring-[#43CD66] focus:ring-offset-2 focus:outline-none"
          >
            View all retailers
            <svg
              className="ml-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedBrands;
