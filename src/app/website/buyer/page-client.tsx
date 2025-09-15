"use client";

import { useEffect, useState } from "react";

import SharedBackgroundPattern from "@/src/components/common/SharedBackgroundPattern";
import type { CarouselApi } from "@/src/components/ui/carousel";
import BuyerFaqs from "@/src/components/website/buyer/BuyerFaqs";
import FeaturesSection from "@/src/components/website/buyer/FeaturesSection";
import FinalCTASection from "@/src/components/website/buyer/FinalCTASection";
import HeroSection from "@/src/components/website/buyer/HeroSection";
import NoJunkPlanSection from "@/src/components/website/buyer/NoJunkPlanSection";

const BuyerPageClient = () => {
  return (
    <main className="relative flex flex-col items-center bg-white">
      <SharedBackgroundPattern className="h-[1000px]" />
      <HeroSection />
      <FeaturesSection />
      <NoJunkPlanSection />
      {/* <TestimonialsSection canScrollPrev={canScrollPrev} canScrollNext={canScrollNext} setApi={setApi} /> */}
      <BuyerFaqs />
      <FinalCTASection />
    </main>
  );
};

export default BuyerPageClient;
