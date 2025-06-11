'use client';

// Import the separate section components
import BlogListingHero from '@/src/features/website/components/blog/BlogListingHero';
import BlogListingSection from '@/src/features/website/components/blog/BlogListingSection';
import TestimonialsSection from '@/src/features/website/components/sections/OnboardingSection';

const SellerBlogPageClient = () => {
  return (
    <main className="flex flex-col items-center relative">
      {/* We're removing the SharedBackgroundPattern as we now have a background image in the hero section */}
      <div className="w-full">
        <BlogListingHero type="seller" />
      </div>
      <div className="w-full">
        <BlogListingSection blogType="seller" />
      </div>
      <div className="w-full">
        <TestimonialsSection />
      </div>
    </main>
  );
};

export default SellerBlogPageClient; 