"use client";

import { useEffect, useState } from "react";

import SharedBackgroundPattern from "@/src/components/common/SharedBackgroundPattern";
import PodcastEpisodesSection from "@/src/features/website/components/podcast/PodcastEpisodesSection";
// Import the separate section components
import PodcastHeroSection from "@/src/features/website/components/podcast/PodcastHeroSection";
import PodcastPlatformsSection from "@/src/features/website/components/podcast/PodcastPlatformsSection";
import TestimonialsSection from "@/src/features/website/components/sections/OnboardingSection";

const PodcastPageClient = () => {
  return (
    <main className="relative flex flex-col items-center">
      {/* We're removing the SharedBackgroundPattern as we now have a background image in the hero section */}
      <div className="w-full">
        <PodcastHeroSection />
      </div>
      <div className="w-full">
        <PodcastPlatformsSection />
      </div>
      <div className="w-full">
        <PodcastEpisodesSection />
      </div>
      <div className="w-full">
        <TestimonialsSection />
      </div>
    </main>
  );
};

export default PodcastPageClient;
