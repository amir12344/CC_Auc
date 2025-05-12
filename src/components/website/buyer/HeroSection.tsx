import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

const HeroSection = () => (
  <section className="w-full relative text-white py-10 sm:py-16 md:py-24 lg:py-28 z-10 pb-0" style={{ paddingBottom: '0px' }}>
    <div className="container mx-auto px-4 mt-[5rem] md:mt-[2rem]">
   
      <div className="flex flex-col items-center text-center max-w-5xl mx-auto">
        <div className="inline-block px-4 py-1 bg-[#43CD66]/20 rounded-full mb-6">
          <span className="text-[#43CD66] font-medium text-sm">FOR BUYERS</span>
        </div>
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Source Smarter, <span className="text-[#43CD66] relative inline-block">
              <span className="relative z-10">Never Buy Blind Again.</span>
              <span className="absolute bottom-1 left-0 w-full h-3 bg-[#43CD66]/20 -z-0"></span>
            </span>
          </h1>
          <p className="text-md md:text-xl mb-8 text-gray-200 leading-relaxed max-w-3xl mx-auto">
            Commerce Central gives trusted buyers direct access to brand-approved excess and returns — fully manifested, fairly priced, and ready to move.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link
              href='/earlyaccess'
              className='px-4 sm:px-5 md:px-6 py-2.5 md:py-3 rounded-full bg-[#43CD66] text-[#1C1E21] font-medium transition-all duration-300 text-sm sm:text-base md:text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center hover:bg-[#43CD66] hover:text-[#ffff]'
            >
              <span>Early Access</span>
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="max-w-6xl mx-auto mt-0 w-full "
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="relative top-[1px] overflow-hidden border border-neutral-800 bg-neutral-900">
            <Image
              src="/images/marketplace3.webp"
              alt="Commerce Central Seller Dashboard Preview"
              width={1920}
              height={675}
              className="w-full object-cover rounded-t-[10px]"
              quality={70}
              priority
              unoptimized
            />
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default HeroSection;
