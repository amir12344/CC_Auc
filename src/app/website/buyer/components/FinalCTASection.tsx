import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';

const FinalCTASection = () => (
  <section className="w-full py-20 bg-linear-to-br from-[#102D21] to-[#0A2318] text-white relative">
    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
    <div className="container mx-auto px-4 text-center relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto"
      >
        <h2 className="text-3xl md:text-5xl font-[500] mb-6">Join the world&apos;s best surplus sourcing platform</h2>
        <div className="w-20 h-1 bg-[#43CD66] mx-auto mb-8 rounded-full"></div>
        <p className="text-xl mb-10 max-w-3xl mx-auto leading-relaxed text-white">
          With Commerce Central, you&apos;re no longer chasing deals. You&apos;re leading the game.
        </p>
        <Link href="/early-access" className="bg-[#43CD66] hover:bg-[#3ab558] text-[#102D21] font-medium py-4 px-12 rounded-full inline-flex items-center transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg">
          Early Access
          <FaArrowRight className="ml-3" />
        </Link>
      </motion.div>
    </div>
  </section>
);

export default FinalCTASection;
