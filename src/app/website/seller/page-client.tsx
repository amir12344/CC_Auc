'use client';
import { useState, useEffect } from 'react';
import {
  type CarouselApi,
} from "@/src/components/ui/carousel";

import { HeroSection } from '@/src/components/website/seller/HeroSection';
import { DashboardPreview } from '@/src/components/website/seller/DashboardPreview';
import { FeaturesSection } from '@/src/components/website/seller/FeaturesSection';
import { TestimonialsSection } from '@/src/components/website/seller/TestimonialsSection';
import { FinalCTASection } from '@/src/components/website/seller/FinalCTASection';
import { sellerFeatures } from '@/src/components/website/seller/sellerFeatureData';

const SellerPageClient = () => {
  const testimonials = [
    {
      quote: "With the amount of product moving I can't afford to have excess crowding my shelves. We finally have a simple solution to make our operations better and more profitable.",
      author: "SVP of Supply Chain",
      company: "Multi-Channel Retailer",
      type: "Big Box Retailer"
    },
    {
      quote: "We weren't willing to be associated with off-price markets, and Ghost gives us the peace-of-mind of who is buying our goods and where they end up.",
      author: "VP of Finance",
      company: "Home Appliances Brand",
      type: "Direct Brand Seller"
    },
    {
      quote: "Ghost has allowed me to find new revenue streams in different distribution channels I hadn't even considered. It feels like a whole new world of how we do business.",
      author: "Head of Operations",
      company: "Premium DTC + Retail Brand",
      type: "Wholesale Retailer"
    },
    {
      quote: "With the amount of product moving I can't afford to have excess crowding my shelves. We finally have a simple solution to make our operations better and more profitable.",
      author: "Director of Inventory & Returns",
      company: "Fortune 500 Brand",
      type: "Big Box Retailer"
    },
    {
      quote: "We weren't willing to be associated with off-price markets, and Ghost gives us the peace-of-mind of who is buying our goods and where they end up.",
      author: "VP of Strategy",
      company: "Global Consumer Goods Brand",
      type: "Direct Brand Seller"
    }
  ];

  // State for carousel
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  // Update the scroll buttons state when the carousel changes
  useEffect(() => {
    if (!api) {
      return;
    }

    const onSelect = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };

    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  return (
    <main className="flex flex-col items-center bg-white">
      {/* Background pattern (unchanged) */}
      <div className="absolute top-0 w-full h-[939px] overflow-hidden z-0">
        <div className="absolute inset-0 bg-[#102D21] opacity-95"></div>
        <div className="absolute inset-0 bg-linear-to-b from-[#102D21] to-[#102D21]/70"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
      </div>
      <HeroSection />
      <DashboardPreview />
      <FeaturesSection features={sellerFeatures} />
      <TestimonialsSection
        testimonials={testimonials}
        setApi={setApi}
        canScrollPrev={canScrollPrev}
        canScrollNext={canScrollNext}
      />
      <FinalCTASection />
    </main>
  );
};

export default SellerPageClient;