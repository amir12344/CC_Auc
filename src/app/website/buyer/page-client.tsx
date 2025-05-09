'use client';

import { useState, useEffect } from 'react';
import type { CarouselApi } from "@/src/components/ui/carousel";
import HeroSection from '@/src/components/website/buyer/HeroSection';
import FeaturesSection from '@/src/components/website/buyer/FeaturesSection';
import NoJunkPlanSection from '@/src/components/website/buyer/NoJunkPlanSection';
import TestimonialsSection from '@/src/components/website/buyer/TestimonialsSection';
import FinalCTASection from '@/src/components/website/buyer/FinalCTASection';
import SharedBackgroundPattern from '@/src/components/common/SharedBackgroundPattern';

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
    <main className="flex flex-col items-center bg-white relative">
      <SharedBackgroundPattern className="h-[1000px]" />
      <HeroSection />
      <FeaturesSection />
      <NoJunkPlanSection />
      <TestimonialsSection canScrollPrev={canScrollPrev} canScrollNext={canScrollNext} setApi={setApi} />
      <FinalCTASection />
    </main>
  );
};

export default BuyerPageClient;