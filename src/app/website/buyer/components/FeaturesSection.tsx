import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaFileAlt, FaLock, FaSearch, FaCogs, FaStore } from 'react-icons/fa';
import type { ReactElement } from 'react';

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
    description: "Every load is brand-approved, fully manifested, and resale-ready. See MSRP, SKU count, shipping estimate, and condition up front. No blurry manifests. No surprises.",
    imagePath: "https://images.unsplash.com/photo-1610374792793-f016b77ca51a?q=80&w=1000&auto=format&fit=crop",
    imageAlt: 'Load details showing manifest and pricing information'
  },
  {
    icon: <FaLock className="h-6 w-6 text-[#43CD66]" />,
    title: "Skip Shady Brokers. Buy Direct from Trusted Sellers",
    description: "Only verified brands, retailers, and distributors list on Commerce Central. That means no Telegram roulette, ghost loads, or rep games — just clean, traceable inventory.",
    imagePath: "https://images.unsplash.com/photo-1556742111-a301076d9d18?q=80&w=1000&auto=format&fit=crop",
    imageAlt: 'Seller profiles showing trust scores and verification'
  },
  {
    icon: <FaSearch className="h-6 w-6 text-[#43CD66]" />,
    title: "Only See Loads That Fit Your Business",
    description: "Filter by brand, category, MSRP %, resale channel, or region. We match you with the right loads based on your profile — so you spend less time clicking, more time flipping.",
    imagePath: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop",
    imageAlt: 'Filtering interface for inventory loads'
  },
  {
    icon: <FaCogs className="h-6 w-6 text-[#43CD66]" />,
    title: "We Handle the Messy Stuff — So You Don't Have To",
    description: "POs, payments, shipping — we take care of it all. You just browse, buy, and restock. No more back-and-forth texts, no middlemen, no markup games.",
    imagePath: "https://images.unsplash.com/photo-1565688534245-05d6b5be184a?q=80&w=1000&auto=format&fit=crop",
    imageAlt: 'Workflow tracker for order processing'
  },
  {
    icon: <FaStore className="h-6 w-6 text-[#43CD66]" />,
    title: "First Dibs, Not Leftovers",
    description: "Set reminders to be notified the minute your preferred type of deals go live. Get a head start on the loads that actually flip — clean, shelf-ready inventory priced to move.",
    imagePath: "https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=1000&auto=format&fit=crop",
    imageAlt: 'Notifications and alert settings panel'
  }
];

const FeaturesSection = () => (
  <section className="w-full py-20 bg-white relative z-20 mt-0">
    <div className="container mx-auto px-4">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-bold md:text-5xl text-[#1C1E21] mb-4">
          Better Deals,<span className="text-[#43CD66]"> Verified Loads, Zero Surprises </span>
        </h2>
      </div>
      <div className="space-y-16 md:space-y-24">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            viewport={{ once: true, margin: "-100px" }}
            className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 md:gap-16`}
          >
            <div className="w-full md:w-1/2">
              <div className="relative w-full aspect-4/3 overflow-hidden rounded-xl">
                <div className="absolute inset-0 bg-linear-to-br from-[#43CD66]/10 to-transparent z-0"></div>
                <Image
                  src={feature.imagePath}
                  alt={feature.imageAlt}
                  fill
                  quality={75}
                  loading="lazy"
                  className="object-cover z-10"
                />
                <div className={`absolute ${index % 2 === 0 ? '-right-3 md:-right-6' : '-left-3 md:-left-6'} -bottom-3 md:-bottom-6 w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#43CD66] flex items-center justify-center shadow-lg z-20`}>
                  <div className="text-white scale-75 md:scale-100">
                    {feature.icon}
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2 mt-6 md:mt-0">
              <div className="max-w-xl mx-auto md:mx-0">
                <h3 className="text-xl md:text-3xl lg:text-5xl font-semibold text-[#1C1E21] mb-3 md:mb-4">
                  {feature.title}
                </h3>
                <p className="text-lg md:text-xl text-[#1C1E21]/70 mb-4 md:mb-6 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
