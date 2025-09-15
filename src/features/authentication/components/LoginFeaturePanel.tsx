"use client";

import { motion } from "framer-motion";

export default function LoginFeaturePanel() {
  return (
    <div className="relative hidden w-1/2 overflow-hidden bg-gradient-to-br from-[#1C1E21] via-[#102d21] to-[#43cd66] lg:block">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, 3, 0],
          }}
          className="absolute top-16 left-12 h-16 w-16 rounded-xl border-2 border-[#43CD66]/20 lg:top-24 lg:left-20 lg:h-20 lg:w-20"
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        <motion.div
          animate={{
            y: [0, 20, 0],
            rotate: [0, -5, 0],
          }}
          className="absolute top-48 right-8 h-12 w-12 rounded-full bg-[#43CD66]/10 lg:top-60 lg:right-16 lg:h-16 lg:w-16"
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 2,
          }}
        />

        <motion.div
          animate={{
            y: [0, -12, 0],
            x: [0, 8, 0],
          }}
          className="absolute bottom-32 left-16 h-20 w-20 rotate-12 rounded-lg border border-white/10 lg:bottom-40 lg:left-24 lg:h-24 lg:w-24"
          transition={{
            duration: 12,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            delay: 4,
          }}
        />
      </div>

      {/* Main Content */}
      <div className="absolute inset-0 flex flex-col justify-center p-6 lg:p-12">
        {/* Header */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center lg:mb-12"
          initial={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#43CD66] to-[#3ab859] shadow-2xl lg:mb-6 lg:h-20 lg:w-20">
            <svg
              className="h-8 w-8 text-[#1C1E21] lg:h-10 lg:w-10"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <title>Commerce Central Logo</title>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>

          <h2 className="mb-3 text-2xl font-bold text-white lg:mb-4 lg:text-3xl">
            Commerce Central Platform
          </h2>
          <p className="mx-auto max-w-sm px-2 text-base leading-relaxed text-white/80 lg:max-w-md lg:text-lg">
            Your unified wholesale marketplace connecting buyers and sellers
            with enterprise-grade commerce solutions.
          </p>
        </motion.div>

        {/* Platform Features */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 lg:mb-12"
          initial={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          {/* First row - Unified Commerce (full width on medium, half on large) */}
          <div className="mb-4 grid grid-cols-1 gap-3 lg:gap-4 xl:grid-cols-1">
            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#43CD66]/20 lg:h-12 lg:w-12">
                <svg
                  className="h-5 w-5 text-[#43CD66] lg:h-6 lg:w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Unified Commerce Icon</title>
                  <path
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-white lg:text-base">
                  Unified Commerce
                </h4>
                <p className="text-xs text-white/60 lg:text-sm">
                  Seamless integration across all sales channels
                </p>
              </div>
            </div>
          </div>

          {/* Second row - Two features side by side */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 lg:gap-4">
            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#43CD66]/20 lg:h-12 lg:w-12">
                <svg
                  className="h-5 w-5 text-[#43CD66] lg:h-6 lg:w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Verified Network Icon</title>
                  <path
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-white lg:text-base">
                  Verified Network
                </h4>
                <p className="text-xs text-white/60 lg:text-sm">
                  Trusted buyers and sellers
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#43CD66]/20 lg:h-12 lg:w-12">
                <svg
                  className="h-5 w-5 text-[#43CD66] lg:h-6 lg:w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Smart Pricing Icon</title>
                  <path
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-white lg:text-base">
                  Smart Pricing
                </h4>
                <p className="text-xs text-white/60 lg:text-sm">
                  AI-driven optimization
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Platform Stats */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-white/20 bg-gradient-to-r from-white/10 to-white/5 p-4 backdrop-blur-md lg:p-6"
          initial={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <div className="grid grid-cols-3 gap-2 text-center lg:gap-4">
            <div>
              <div className="mb-1 text-xl font-bold text-[#43CD66] lg:text-2xl">
                10K+
              </div>
              <div className="text-xs text-white/60">Active Buyers</div>
            </div>
            <div>
              <div className="mb-1 text-xl font-bold text-[#43CD66] lg:text-2xl">
                500+
              </div>
              <div className="text-xs text-white/60">Verified Sellers</div>
            </div>
            <div>
              <div className="mb-1 text-xl font-bold text-[#43CD66] lg:text-2xl">
                99%
              </div>
              <div className="text-xs text-white/60">Satisfaction Rate</div>
            </div>
          </div>

          <div className="mt-3 border-t border-white/10 pt-3 lg:mt-4 lg:pt-4">
            <p className="text-center text-xs leading-relaxed text-white/90 italic lg:text-sm">
              &quot;Commerce Central has transformed our wholesale operations
              with seamless order management and real-time inventory
              tracking.&quot;
            </p>
            <p className="mt-2 text-center text-xs text-white/60">
              - Sarah Chen, Supply Chain Director
            </p>
          </div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-gradient-to-bl from-[#43CD66]/10 to-transparent blur-3xl lg:h-64 lg:w-64" />
      <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-gradient-to-tr from-white/5 to-transparent blur-2xl lg:h-48 lg:w-48" />
    </div>
  );
}
