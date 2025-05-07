'use client';
import { FaChartLine, FaLock, FaRocket, FaFileAlt, FaStore } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import {
  type CarouselApi,
} from "@/src/components/ui/carousel";

import { HeroSection } from '@/src/components/website/seller/HeroSection';
import { DashboardPreview } from '@/src/components/website/seller/DashboardPreview';
import { FeaturesSection } from '@/src/components/website/seller/FeaturesSection';
import { TestimonialsSection } from '@/src/components/website/seller/TestimonialsSection';
import { FinalCTASection } from '@/src/components/website/seller/FinalCTASection';

const SellerPageClient = () => {
  const features = [
    {
      title: 'Act Before Inventory Becomes a Liability',
      description: 'Detect aging or returned stock early and move it before markdowns, write-offs, or warehouse gridlock erode your margins.',
      icon: <FaChartLine className="h-6 w-6 text-[#43CD66]" />,
      imagePath: '/images/inventoryChart.webp',
      imageAlt: 'Control tower dashboard showing $ value and space tied to returned inventory at each location'
    },
    {
      title: 'Protect Brand, Pricing, and Channels',
      description: 'Decide who can buy, how much, and where it sells. Guardrails like pricing floors, buyer types, and resale geography keep your brand perception and retail relationships intact.',
      icon: <FaLock className="h-6 w-6 text-[#43CD66]" />,
      imagePath: '/images/dashboard3.webp',
      imageAlt: 'Guardrails dashboard with pricing floor and buyer type controls'
    },
    {
      title: 'Run Resale on Autopilot',
      description: 'Set your resale parameters — we handle the rest. From buyer outreach and deal flow to payment, logistics, and tax handling. Your team stays focused on growth, not firefighting.',
      icon: <FaRocket className="h-6 w-6 text-[#43CD66]" />,
      imagePath: '/images/OrderDashboard.webp',
      imageAlt: 'Order dashboard showing different status of transactions'
    },
    {
      title: 'Always Audit-Ready',
      description: 'Every transaction comes with buyer identity, resale terms, and fulfillment proof giving Finance and Legal a compliant, documented trail for every exit.',
      icon: <FaFileAlt className="h-6 w-6 text-[#43CD66]" />,
      imagePath: '/images/audit.webp',
      imageAlt: 'Documentation and audit trail for inventory transactions'
    },
    {
      title: 'Monetize Across Channels Without Conflict',
      description: 'Sell D2C for higher margins, or move in bulk to vetted B2B buyers. Every exit honors your retail relationships and pricing power.',
      icon: <FaStore className="h-6 w-6 text-[#43CD66]" />,
      imagePath: '/images/Inventory_flow.webp',
      imageAlt: 'Visualization of inventory flowing to B2B and D2C channels'
    }
  ];

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

    // Update button states based on carousel position
    const onSelect = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };

    // Call once and then listen for changes
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
      <FeaturesSection features={features} />
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

