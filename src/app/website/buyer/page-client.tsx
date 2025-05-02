'use client';

import { useState, useEffect } from 'react';
import type { CarouselApi } from "@/src/components/ui/carousel";
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import NoJunkPlanSection from './components/NoJunkPlanSection';
import TestimonialsSection from './components/TestimonialsSection';
import FinalCTASection from './components/FinalCTASection';

const BuyerPageClient = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };
    onSelect();
    api.on('select', onSelect);
    api.on('reInit', onSelect);
    return () => {
      api.off('select', onSelect);
      api.off('reInit', onSelect);
    };
  }, [api]);

  return (
    <main className="flex flex-col items-center bg-white">
      {/* Background pattern */}
      <div className="absolute top-0 w-full h-[1000px] overflow-hidden z-0">
        <div className="absolute inset-0 bg-[#102D21] opacity-95"></div>
        <div className="absolute inset-0 bg-linear-to-b from-[#102D21] to-[#102D21]/70"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
      </div>
      <HeroSection />
      <FeaturesSection />
      <NoJunkPlanSection />
      <TestimonialsSection canScrollPrev={canScrollPrev} canScrollNext={canScrollNext} setApi={setApi} />
      <FinalCTASection />
    </main>
  );
};

export default BuyerPageClient;