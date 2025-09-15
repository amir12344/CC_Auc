import Image from "next/image";
import Link from "next/link";
import type { ReactElement } from "react";
import { FaCogs, FaFileAlt, FaLock, FaSearch, FaStore } from "react-icons/fa";

import { motion } from "framer-motion";

interface Feature {
  icon: ReactElement;
  title: string;
  description: string;
  imagePath: string;
  imageAlt: string;
}

const features: Feature[] = [
  {
    icon: <FaFileAlt className="h-6 w-6 text-[#43CD66]" />,
    title: "Know What You're Buying Before You Pay",
    description:
      "Every load is brand-approved, fully manifested, and resale-ready. See MSRP, SKU count, shipping estimate, and condition up front. No blurry manifests. No surprises.",
    imagePath: "/images/01_Manifest.webp",
    imageAlt: "Load details showing manifest and pricing information",
  },
  {
    icon: <FaLock className="h-6 w-6 text-[#43CD66]" />,
    title: "Skip Shady Brokers. Buy Direct from Trusted Sellers",
    description:
      "Only verified brands, retailers, and distributors list on Commerce Central. That means no Telegram roulette, ghost loads, or rep games — just clean, traceable inventory.",
    imagePath: "/images/02_seller_Profile.webp",
    imageAlt: "Seller profiles showing trust scores and verification",
  },
  {
    icon: <FaSearch className="h-6 w-6 text-[#43CD66]" />,
    title: "Only See Loads That Fit Your Business",
    description:
      "Filter by brand, category, MSRP %, resale channel, or region. We match you with the right loads based on your profile — so you spend less time clicking, more time flipping.",
    imagePath: "/images/03_Filter.webp",
    imageAlt: "Filtering interface for inventory loads",
  },
  {
    icon: <FaCogs className="h-6 w-6 text-[#43CD66]" />,
    title: "We Handle the Messy Stuff — So You Don't Have To",
    description:
      "POs, payments, shipping — we take care of it all. You just browse, buy, and restock. No more back-and-forth texts, no middlemen, no markup games.",
    imagePath: "/images/04_orderStatus.webp",
    imageAlt: "Workflow tracker for order processing",
  },
  {
    icon: <FaStore className="h-6 w-6 text-[#43CD66]" />,
    title: "First Dibs, Not Leftovers",
    description:
      "Set reminders to be notified the minute your preferred type of deals go live. Get a head start on the loads that actually flip — clean, shelf-ready inventory priced to move.",
    imagePath: "/images/05_alert.webp",
    imageAlt: "Notifications and alert settings panel",
  },
];

const FeaturesSection = () => (
  <section
    id="features"
    className="relative z-20 mt-0 w-full overflow-hidden bg-white py-10 md:py-20"
  >
    <div className="mb-0 text-center md:mb-16">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-4 p-2 text-3xl font-bold text-[#1C1E21] md:text-5xl"
      >
        Better Deals,
        <span className="text-[#43CD66]"> Verified Loads, Zero Surprises </span>
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
                  href="/auth/buyer-signup"
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
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl">
                <div className="absolute inset-0 z-0 bg-linear-to-br from-[#43CD66]/10 to-transparent"></div>
                <Image
                  src={feature.imagePath}
                  alt={feature.imageAlt}
                  fill
                  quality={70}
                  className="z-10 object-cover"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    ))}
  </section>
);

export default FeaturesSection;
