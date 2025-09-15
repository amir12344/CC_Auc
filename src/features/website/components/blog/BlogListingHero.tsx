"use client";

import Image from "next/image";
import Link from "next/link";

interface BlogListingHeroProps {
  type: "buyer" | "seller";
}

const BlogListingHero = ({ type }: BlogListingHeroProps) => {
  const heroContent = {
    buyer: {
      title: "Buyer Resources",
      subtitle:
        "Smart strategies for inventory sourcing and liquidation buying",
      description:
        "Expert tips, market insights, and proven strategies to help you source quality inventory, avoid scams, and maximize profits in liquidation buying.",
      ctaText: "Explore Buyer Articles",
    },
    seller: {
      title: "Seller Insights",
      subtitle: "Expert guidance for brands and surplus inventory sellers",
      description:
        "Industry insights, best practices, and strategic advice to help brands optimize their excess inventory management and recovery strategies.",
      ctaText: "Explore Seller Articles",
    },
  };

  const content = heroContent[type];

  return (
    <section className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-[#102D21] text-white">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 opacity-40">
        <Image
          src="/images/blogHero.webp"
          alt={`${content.title} background`}
          fill
          style={{ objectFit: "cover" }}
          quality={70}
          unoptimized={true}
          sizes="100vw"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        />
        <div className="absolute inset-0 bg-[#102D21] opacity-60"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold text-[#43CD66] md:text-5xl lg:text-6xl">
            {content.title}
          </h1>
          <p className="mb-4 text-xl text-[#D8F4CC] md:text-2xl">
            {content.subtitle}
          </p>
          <p className="mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-[#D8F4CC]/80">
            {content.description}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="#blog-posts"
              onClick={(e) => {
                e.preventDefault();
                document
                  .querySelector("#blog-posts")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="rounded-full bg-[#43CD66] px-8 py-3 font-medium text-black transition-colors duration-300 hover:bg-[#3BB757]"
            >
              {content.ctaText}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogListingHero;
