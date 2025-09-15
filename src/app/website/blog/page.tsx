import type { Metadata } from "next";
import Link from "next/link";

import SharedBackgroundPattern from "@/src/components/common/SharedBackgroundPattern";

export const metadata: Metadata = {
  title: "Blog | Commerce Central",
  description: "Read buyer and seller blogs resources at Commerce Central.",
  robots: "noindex, nofollow",
};

const BlogPage = () => {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <SharedBackgroundPattern />
      <div className="relative z-10 w-full max-w-md rounded-lg border border-[#43CD66]/20 bg-[#102D21]/90 p-8 text-center shadow-lg backdrop-blur-sm">
        <h1 className="mb-6 text-2xl font-bold text-[#D8F4CC]">
          Choose Your Blog Section
        </h1>
        <p className="mb-8 text-[#D8F4CC]/80">
          Select the blog section you&apos;d like to explore:
        </p>

        <div className="space-y-4">
          <Link
            className="block w-full rounded-full bg-[#43CD66] px-6 py-3 font-semibold text-white transition-all duration-200 hover:scale-105 hover:bg-[#43CD66]/60"
            href="/website/blog/buyer"
          >
            Buyer Blogs
          </Link>

          <Link
            className="block w-full rounded-full bg-[#43CD66] px-6 py-3 font-semibold text-[#102D21] transition-all duration-200 hover:scale-105 hover:bg-[#43CD66]/90"
            href="/website/blog/seller"
          >
            Seller Blogs
          </Link>
        </div>

        <div className="mt-8 border-t border-[#43CD66]/20 pt-6">
          <Link
            className="text-sm text-[#D8F4CC]/60 transition-colors duration-200 hover:text-[#43CD66]"
            href="/"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
