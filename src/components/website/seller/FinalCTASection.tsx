import Link from "next/link";

import { motion } from "framer-motion";

export const FinalCTASection = () => (
  <section className="relative w-full overflow-hidden bg-linear-to-br from-[#102D21] to-[#0A2318] py-24 text-white">
    {/* Background Elements */}
    <div className="absolute top-0 left-0 h-full w-full overflow-hidden">
      <div className="absolute top-1/4 -left-24 h-96 w-96 rounded-full bg-[#43CD66] opacity-20 blur-3xl"></div>
      <div className="absolute -right-48 bottom-1/4 h-96 w-96 rounded-full bg-[#43CD66] opacity-20 blur-3xl"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
    </div>
    <div className="relative z-10 container mx-auto px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="mx-auto max-w-4xl"
      >
        <div className="mb-6 inline-block rounded-full bg-white/10 px-6 py-2 backdrop-blur-xs">
          <span className="text-sm font-medium tracking-wider text-[#43CD66]">
            GET STARTED TODAY
          </span>
        </div>
        <h2 className="mb-8 text-4xl leading-tight font-[500] md:text-5xl lg:text-6xl">
          Join the world&apos;s best{" "}
          <span className="text-[#43CD66]">surplus distribution</span> platform
        </h2>
        <p className="mx-auto mb-10 max-w-3xl text-xl text-gray-200">
          No open marketplaces. No brand dilution. Just clean, controlled exits
          on your terms.
        </p>
        <div className="flex flex-col justify-center gap-5 sm:flex-row">
          <Link
            href="/auth/seller-signup"
            className="group flex items-center justify-center rounded-full bg-[#43CD66] px-8 py-4 text-base font-medium shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:px-10 md:text-lg"
          >
            <span>Sell on Commerce Central</span>
          </Link>
        </div>
      </motion.div>
    </div>
  </section>
);
