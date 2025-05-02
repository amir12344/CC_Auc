import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';

export const HeroSection = () => {
  return (
    <section className="w-full relative text-white py-10 sm:py-16 md:py-24 lg:py-28 z-10" style={{ paddingBottom: '0px' }}>
      <div className="container mx-auto px-4 mt-[4rem]">
        <div className="text-center mb-4">
          <div className="inline-block px-4 py-1 bg-[#43CD66]/20 rounded-full mb-6">
            <span className="text-[#43CD66] font-medium text-sm">Trusted by leading brands</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Make Your Inventory Work for You, <span className="text-[#43CD66] relative inline-block">
              <span className="relative z-10">Not Against You</span>
              <span className="absolute bottom-1 left-0 w-full h-3 bg-[#43CD66]/20 -z-0"></span>
            </span>
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-200 max-w-3xl mx-auto leading-relaxed">
            Commerce Central helps brands recover margin and clear space from excess and returned inventory without flooding the wrong channels or giving up control.
          </p>
          <div className="flex justify-center mb-12">
            <Link
              href='/earlyAccess'
              className='px-4 sm:px-5 md:px-6 py-2.5 md:py-3 rounded-full bg-[#43CD66] font-medium transition-all duration-300 text-sm sm:text-base md:text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center'
            >
              <span>Sell on Commerce Central</span>
              <FaArrowRight className='w-5 h-5 ml-2' aria-hidden='true' />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
