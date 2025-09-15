"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useRef } from "react";
import { FaBriefcase, FaShoppingBag } from "react-icons/fa";

import { motion, useInView } from "framer-motion";

const InfoSection: React.FC = () => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="stats" ref={ref} className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center md:mb-20">
          <h2 className="text-3xl font-bold md:text-5xl">
            Where brand protection meets{" "}
            <span className="relative text-[#43cd66]">
              buyer confidence
              <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-[#43cd66] opacity-70"></span>
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:gap-20">
          {/* Sellers Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group relative"
          >
            {/* Card with image overlay */}
            <div className="relative h-full overflow-hidden rounded-3xl border border-gray-100 shadow-xl">
              {/* Background gradient */}
              <div className="absolute inset-0 z-0 bg-gradient-to-br from-white via-white to-gray-50"></div>

              {/* Single person smiling photo */}
              <div className="absolute top-0 right-0 z-10 h-full w-full overflow-hidden md:w-3/5">
                <div className="relative h-full w-full">
                  <Image
                    src="https://images.unsplash.com/photo-1633367583895-08545d733dfe?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Smiling business person"
                    fill
                    style={{
                      objectFit: "cover",
                      objectPosition: "center left",
                    }}
                    className="transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white opacity-100"></div>
                </div>
              </div>

              {/* Content section */}
              <div className="relative z-20 flex h-full flex-col p-10 md:p-12">
                <div className="z-10 w-full md:w-3/5">
                  <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#ecfdf3] shadow-sm">
                    <FaBriefcase
                      className="h-7 w-7 text-[#43CD66]"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="mb-6 text-3xl font-bold text-gray-800">
                    Sellers
                  </h3>
                  <p className="mb-8 text-lg leading-relaxed text-gray-700">
                    Brands and retailers list surplus on Commerce Central to
                    recover more while staying in full control of where, how,
                    and to whom it sells.
                  </p>
                  <div className="transition-transform duration-300 group-hover:translate-x-2">
                    <Link
                      href="/auth/login"
                      className="inline-flex items-center justify-center rounded-full bg-[#43CD66] px-7 py-3.5 font-medium text-[#ffffff] transition-all duration-300 hover:bg-[#38b158] hover:shadow-lg hover:shadow-[#43CD66]/30"
                    >
                      Sell on Commerce Central
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Buyers Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="group relative"
          >
            {/* Card with image overlay */}
            <div className="relative h-full overflow-hidden rounded-3xl border border-gray-100 shadow-xl">
              {/* Background gradient */}
              <div className="absolute inset-0 z-0 bg-gradient-to-br from-white via-white to-gray-50"></div>

              {/* Single person smiling photo */}
              <div className="absolute top-0 right-0 z-10 h-full w-full overflow-hidden md:w-3/5">
                <div className="relative h-full w-full">
                  <Image
                    src="https://images.unsplash.com/photo-1592275772614-ec71b19e326f?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt="Smiling shopping person"
                    fill
                    style={{
                      objectFit: "cover",
                      objectPosition: "center left",
                    }}
                    className="transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white opacity-100"></div>
                </div>
              </div>

              {/* Content section */}
              <div className="relative z-20 flex h-full flex-col p-10 md:p-12">
                <div className="z-10 w-full md:w-3/5">
                  <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#ecfdf3] shadow-sm">
                    <FaShoppingBag
                      className="h-7 w-7 text-[#43CD66]"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="mb-6 text-3xl font-bold text-gray-800">
                    Buyers
                  </h3>
                  <p className="mb-8 text-lg leading-relaxed text-gray-700">
                    Manually vetted buyers purchase inventory with tools and
                    support to avoid bad loads and finally trust what shows up.
                  </p>
                  <div className="transition-transform duration-300 group-hover:translate-x-2">
                    <Link
                      href="/auth/login"
                      className="inline-flex items-center justify-center rounded-full border border-[#43CD66] bg-white px-7 py-3.5 font-medium text-[#43CD66] transition-all duration-300 hover:bg-[#43CD66] hover:text-white hover:shadow-lg hover:shadow-[#43CD66]/30"
                    >
                      Buy on Commerce Central
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default InfoSection;
