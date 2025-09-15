import Image from "next/image";
import Link from "next/link";

import { motion } from "framer-motion";

const HeroSection = () => (
  <section
    className="relative z-10 w-full py-10 pb-0 text-white sm:py-16 md:py-24 lg:py-28"
    style={{ paddingBottom: "0px" }}
  >
    <div className="container mx-auto mt-[5rem] px-4 md:mt-[2rem]">
      <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
        <div className="mb-6 inline-block rounded-full bg-[#43CD66]/20 px-4 py-1">
          <span className="text-sm font-medium text-[#43CD66]">FOR BUYERS</span>
        </div>
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="mb-6 text-3xl leading-tight font-bold md:text-5xl lg:text-6xl">
            Source Smarter,{" "}
            <span className="relative inline-block text-[#43CD66]">
              <span className="relative z-10">Never Buy Blind Again.</span>
              <span className="absolute bottom-1 left-0 -z-0 h-3 w-full bg-[#43CD66]/20"></span>
            </span>
          </h1>
          <p className="text-md mx-auto mb-8 max-w-3xl leading-relaxed text-gray-200 md:text-xl">
            Commerce Central gives trusted buyers direct access to
            brand-approved excess and returns — fully manifested, fairly priced,
            and ready to move.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/auth/buyer-signup"
              className="flex items-center justify-center rounded-full bg-[#43CD66] px-4 py-2.5 text-sm font-medium text-[#1C1E21] shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-[#43CD66] hover:text-[#ffff] hover:shadow-xl sm:px-5 sm:text-base md:px-6 md:py-3 md:text-lg"
            >
              <span>Buy on Commerce Central</span>
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="mx-auto mt-0 w-full max-w-6xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="relative top-[1px] overflow-hidden border border-neutral-800 bg-neutral-900">
            <Image
              src="/images/marketplace3.webp"
              alt="Commerce Central Buyer Dashboard Preview"
              width={1920}
              height={675}
              className="w-full rounded-t-[10px] object-cover"
              quality={85}
              priority={true}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
              placeholder="blur"
              unoptimized
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            />
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default HeroSection;
