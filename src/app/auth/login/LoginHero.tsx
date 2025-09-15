"use client";

import { motion } from "framer-motion";
import { Clock, Package, Shield } from "lucide-react";

export const LoginHero = () => {
  return (
    <div className="relative hidden w-1/2 overflow-y-auto bg-gradient-to-br from-[#1C1E21] via-[#102d21] to-[#43cd66] lg:block">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 h-32 w-32 rotate-12 rounded-lg border border-white/20" />
        <div className="absolute top-40 right-32 h-24 w-24 rounded-full border border-white/10" />
        <div className="absolute bottom-40 left-16 h-40 w-40 rotate-45 rounded-xl border border-white/15" />
        <div className="absolute right-20 bottom-20 h-20 w-20 -rotate-12 rounded-lg border border-white/10" />
      </div>

      <div className="relative flex min-h-full flex-col items-center justify-center px-6 py-10 text-center md:px-8 lg:px-12 lg:py-12">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
          initial={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <h2 className="mb-4 text-2xl font-bold text-white lg:text-3xl xl:text-4xl">
            Welcome to Commerce Central
          </h2>
          <p className="mx-auto max-w-lg text-center text-base text-white/80 lg:max-w-xl lg:text-lg">
            Source surplus, closeouts, and returns you can flip fast all from
            verified sellers, always stress-free, always priced to move.
          </p>
        </motion.div>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="grid max-w-sm grid-cols-1 gap-5 md:gap-6"
          initial={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <div className="flex items-center text-white/90">
            <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-lg bg-[#43CD66]/20">
              <Package className="h-4 w-4 text-[#43CD66]" />
            </div>
            <span className="text-md">Exclusive Access to in-demand loads</span>
          </div>
          <div className="flex items-center text-white/90">
            <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-lg bg-[#43CD66]/20">
              <Shield className="h-4 w-4 text-[#43CD66]" />
            </div>
            <span className="text-md">Verified Sellers you can trust</span>
          </div>
          <div className="flex items-center text-white/90">
            <div className="mr-4 flex h-8 w-8 items-center justify-center rounded-lg bg-[#43CD66]/20">
              <Clock className="h-4 w-4 text-[#43CD66]" />
            </div>
            <span className="text-md">
              Fast, Direct Deals without the guesswork
            </span>
          </div>
        </motion.div>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mt-10 w-full max-w-lg rounded-xl border border-white/20 bg-gradient-to-r from-white/10 to-white/5 p-4 backdrop-blur-md md:mt-12 lg:max-w-2xl lg:p-6 xl:max-w-3xl"
          initial={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.9 }}
        >
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            <div>
              <div className="text-2xl font-bold text-[#43CD66]">1.5K+</div>
              <div className="text-xs text-white/60">Active Buyers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#43CD66]">500+</div>
              <div className="text-xs text-white/60">Verified Sellers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#43CD66]">45+</div>
              <div className="text-xs text-white/60">Premium Brands</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#43CD66]">99%</div>
              <div className="text-xs text-white/60">Satisfaction</div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-gradient-to-bl from-[#43CD66]/10 to-transparent blur-3xl" />
      <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-gradient-to-tr from-white/5 to-transparent blur-2xl" />
    </div>
  );
};

export default LoginHero;
