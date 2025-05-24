
// Import the separate section components
import BlogHeroSection from '@/src/features/website/components/blog/BlogHeroSection';
import BlogPostsSection from '@/src/features/website/components/blog/BlogPostsSection';
import TestimonialsSection from '@/src/features/website/components/sections/OnboardingSection';

const BlogPageClient = () => {
  return (
    <main className="flex flex-col items-center relative">
      {/* We're removing the SharedBackgroundPattern as we now have a background image in the hero section */}
      <div className="w-full">
        <BlogHeroSection />
      </div>
      <div className="w-full">
        <BlogPostsSection />
      </div>
      <div className="w-full">
        <TestimonialsSection />
      </div>
    </main>
  );
};

export default BlogPageClient;