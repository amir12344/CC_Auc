import Link from "next/link";
import React from "react";

import { motion } from "framer-motion";

// Import the correct prop type from the common features index
import { SellerFeatureItemProps } from "@/src/components/common/features/index";

// The component now expects an array of SellerFeatureItemProps
interface FeaturesSectionProps {
  features: SellerFeatureItemProps[];
}

export const FeaturesSection = ({ features }: FeaturesSectionProps) => (
  <section
    id="features"
    className="relative z-20 mt-0 w-full overflow-hidden bg-white py-10 md:py-20"
  >
    <div className="mb-8 text-center md:mb-16">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-4 text-3xl font-bold text-[#1C1E21] md:text-5xl"
      >
        Recover More. Risk Less.
        <span className="text-[#43CD66] underline"> Reclaim Control </span>
      </motion.h2>
    </div>
    {features.map((feature, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        viewport={{ once: true, margin: "-100px" }}
        className={`relative mb-10 md:mb-32 ${
          index % 2 === 1 ? "bg-gray-50 py-5 md:py-24" : "py-8 md:py-12"
        }`}
      >
        <div className="container mx-auto px-4">
          <div
            className={`flex flex-col items-center gap-1 md:gap-12 lg:flex-row`}
          >
            {/* Text Content Area */}
            <div
              className={`w-full lg:w-1/2 ${
                index % 2 === 1 ? "lg:order-2" : "lg:order-1"
              }`}
            >
              <div className="flex h-full flex-col md:flex-row md:gap-8">
                <div className="mb-0 md:flex-1">
                  <h3 className="mb-2 text-center text-2xl font-semibold text-[#1C1E21] md:mb-4 md:mb-6 md:text-left md:text-3xl lg:text-5xl">
                    {feature.title}
                  </h3>
                  <p className="text-md mb-4 text-center leading-relaxed text-[#1C1E21]/70 md:mb-6 md:text-left md:text-xl">
                    {feature.description}
                  </p>
                </div>
              </div>
              <div className="pt-3 pb-6 text-center md:pt-0 md:pb-0 md:text-left">
                <Link
                  href="/auth/seller-signup"
                  className="inline-block transform rounded-full bg-[#43CD66] px-4 py-2 text-sm font-medium text-white transition duration-300 hover:scale-115 sm:px-3 sm:text-base md:px-6 md:py-2 md:text-lg"
                >
                  <span>Get Started</span>
                </Link>
              </div>
            </div>

            {/* Image Section */}
            <div
              className={`mt-0 w-full lg:mt-0 lg:w-1/2 ${
                index % 2 === 1 ? "lg:order-1" : "lg:order-2"
              }`}
            >
              <div className="relative transform overflow-hidden rounded-xl border border-gray-100 shadow-lg transition-transform duration-500 hover:scale-[1.02]">
                {/* Gradient overlay */}

                {/* Render customContent if provided */}
                {feature.customContent && (
                  <div className="self-start rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm transition-shadow duration-300 hover:shadow-md md:flex-1 md:p-6">
                    {feature.customContent}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    ))}
  </section>
);
