import { motion } from 'framer-motion';
import Link from 'next/link';

const FinalCTASection = () => (
  <section className="w-full py-24 relative overflow-hidden bg-linear-to-br from-[#102D21] to-[#0A2318] text-white">
    {/* Background Elements */}
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
      <div className="absolute top-1/4 -left-24 w-96 h-96 rounded-full bg-[#43CD66] blur-3xl opacity-20"></div>
      <div className="absolute bottom-1/4 -right-48 w-96 h-96 rounded-full bg-[#43CD66] blur-3xl opacity-20"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
    </div>
    <div className="container mx-auto px-4 text-center relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto"
      >
        <div className="inline-block px-6 py-2 bg-white/10 rounded-full mb-6 backdrop-blur-xs">
          <span className="text-[#43CD66] font-medium text-sm tracking-wider">GET STARTED TODAY</span>
        </div>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-[500] mb-8 leading-tight">
          Join the world&apos;s best <span className="text-[#43CD66]">surplus sourcing</span> platform
        </h2>
        <p className="text-xl mb-10 max-w-3xl mx-auto text-gray-200">
          With Commerce Central, you're no longer chasing deals. You're leading the game.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-5">
          <Link
            href='/earlyaccess'
            className='px-8 sm:px-10 py-4 rounded-full bg-[#43CD66] font-medium transition-all duration-300 text-base md:text-lg shadow-lg hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center group'
          >
            <span>Early Access</span>
          </Link>
        </div>
      </motion.div>
    </div>
  </section>
);

export default FinalCTASection;
