import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaFileAlt, FaLock, FaSearch, FaCogs, FaStore } from 'react-icons/fa';
import type { ReactElement } from 'react';
import Link from 'next/link';

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
    imagePath: "/images/01_Manifest.webp",
    imageAlt: 'Load details showing manifest and pricing information'
  },
  {
    icon: <FaLock className="h-6 w-6 text-[#43CD66]" />,
    title: "Skip Shady Brokers. Buy Direct from Trusted Sellers",
    description: "Only verified brands, retailers, and distributors list on Commerce Central. That means no Telegram roulette, ghost loads, or rep games — just clean, traceable inventory.",
    imagePath: "/images/02_seller_Profile.webp",
    imageAlt: 'Seller profiles showing trust scores and verification'
  },
  {
    icon: <FaSearch className="h-6 w-6 text-[#43CD66]" />,
    title: "Only See Loads That Fit Your Business",
    description: "Filter by brand, category, MSRP %, resale channel, or region. We match you with the right loads based on your profile — so you spend less time clicking, more time flipping.",
    imagePath: "/images/03_Filter.webp",
    imageAlt: 'Filtering interface for inventory loads'
  },
  {
    icon: <FaCogs className="h-6 w-6 text-[#43CD66]" />,
    title: "We Handle the Messy Stuff — So You Don't Have To",
    description: "POs, payments, shipping — we take care of it all. You just browse, buy, and restock. No more back-and-forth texts, no middlemen, no markup games.",
    imagePath: "/images/04_orderStatus.webp",
    imageAlt: 'Workflow tracker for order processing'
  },
  {
    icon: <FaStore className="h-6 w-6 text-[#43CD66]" />,
    title: "First Dibs, Not Leftovers",
    description: "Set reminders to be notified the minute your preferred type of deals go live. Get a head start on the loads that actually flip — clean, shelf-ready inventory priced to move.",
    imagePath: "/images/05_alert.webp",
    imageAlt: 'Notifications and alert settings panel'
  }
];

const FeaturesSection = () => (
  <section
     id='features'
     className='w-full py-10 md:py-20 relative z-20 mt-0 bg-white overflow-hidden'
   >
     <div className='text-center mb-0 md:mb-16'>
       <motion.h2
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.6 }}
         className='text-3xl p-2 font-bold md:text-5xl text-[#1C1E21] mb-4'
       >
          Better Deals,<span className="text-[#43CD66]"> Verified Loads, Zero Surprises </span>
       </motion.h2>
     </div>
     {features.map((feature, index) => (
       <motion.div
         key={index}
         initial={{ opacity: 0, y: 40 }}
         whileInView={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.7, delay: 0.1 }}
         viewport={{ once: true, margin: '-100px' }}
         className={`relative mb-10 md:mb-32 ${index % 2 === 1 ? 'bg-gray-50 py-5 md:py-24' : 'py-8 md:py-12'
           }`}
       >
         <div className='container mx-auto px-4'>
           <div
             className={`flex flex-col lg:flex-row items-center gap-1 md:gap-12`}
           >
             {/* Text Content Area */}
             <div
               className={`w-full lg:w-1/2 ${index % 2 === 1 ? 'lg:order-2' : 'lg:order-1'
                 }`}
             >
               <div className='flex flex-col md:flex-row md:gap-8 h-full'>
                 <div className='md:flex-1 mb-0'>
                   <h3 className='text-2xl md:text-3xl lg:text-5xl font-semibold text-[#1C1E21] mb-2 md:mb-4 md:mb-6 text-center md:text-left'>
                     {feature.title}
                   </h3>
                   <p className='text-md md:text-xl text-[#1C1E21]/70 mb-4 md:mb-6 leading-relaxed text-center md:text-left'>
                     {feature.description}
                   </p>
                 </div>
               </div>

               <div className="text-center md:text-left pt-3 pb-6">
                 <Link
                   href="/earlyaccess"
                   className="inline-block px-4 sm:px-3 md:px-6 py-2 md:py-2 rounded-full bg-[#43CD66] text-white font-medium text-sm sm:text-base md:text-lg transition duration-300 transform hover:scale-115"
                 >
                   <span>Early Access</span>
                 </Link>
               </div>
             </div>
            
             {/* Image Section */}
             <div
               className={`w-full lg:w-1/2 mt-0 lg:mt-0 ${index % 2 === 1 ? 'lg:order-1' : 'lg:order-2'
                 }`}
             >
               <div className="relative w-full aspect-4/3 overflow-hidden rounded-xl">
                 <div className="absolute inset-0 bg-linear-to-br from-[#43CD66]/10 to-transparent z-0"></div>
                 <Image
                   src={feature.imagePath}
                   alt={feature.imageAlt}
                   fill
                   quality={70}
                   className="object-cover z-10"
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
