"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Calendar } from "lucide-react";

import { BlogPost, blogPosts, getBlogPostUrl } from "@/src/lib/blog-data";

interface BlogListingSectionProps {
  blogType: "buyer" | "seller";
}

const BlogListingSection = ({ blogType }: BlogListingSectionProps) => {
  const [visiblePosts, setVisiblePosts] = useState<number>(6);

  // Filter and sort posts based on blog type
  const filteredPosts = useMemo(() => {
    const posts = blogPosts.filter((post) => post.type === blogType);
    return [...posts].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [blogType]);

  const handleLoadMore = () => {
    setVisiblePosts((prev) => prev + 3);
  };

  const sectionTitle =
    blogType === "buyer" ? "Latest Buyer Articles" : "Latest Seller Articles";

  return (
    <section className="bg-white py-10" id="blog-posts">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="mb-16 text-center text-4xl font-bold text-[#102D21]">
          {sectionTitle}
        </h2>

        {filteredPosts.length > 0 ? (
          <>
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPosts.slice(0, visiblePosts).map((post: BlogPost) => {
                return (
                  <Link
                    key={post.id}
                    href={getBlogPostUrl(post)}
                    className="group block h-full w-full"
                  >
                    <article
                      className="relative flex h-full flex-col overflow-hidden rounded-xl bg-white transition-all duration-300 hover:translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_rgba(67,205,102,0.8)]"
                      style={{
                        borderRadius: "13.632px",
                        border: "1px solid #E0D6C2",
                      }}
                    >
                      {/* Post Image */}
                      <div className="relative h-48 shrink-0 overflow-hidden">
                        <Image
                          src={post.thumbnailImage}
                          alt={post.title}
                          fill
                          priority
                          unoptimized
                          quality={100}
                          className="h-full w-full object-fill transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>

                      {/* Post Details */}
                      <div className="flex flex-grow flex-col p-6">
                        <h3 className="mb-2 line-clamp-2 text-lg font-[500] text-[#102D21]">
                          {post.title}
                        </h3>

                        <div className="mt-auto flex shrink-0 items-center gap-3">
                          <div className="flex items-center rounded-full px-3 py-1 pl-0 text-xs font-medium text-[#102D21]">
                            <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#43CD66] text-white">
                              <Calendar size={14} />
                            </span>
                            {post.date}
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>

            {visiblePosts < filteredPosts.length && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  className="focus:ring-opacity-50 rounded-lg bg-[#43CD66] px-6 py-3 font-medium text-white transition-colors duration-300 hover:bg-[#3ab659] focus:ring-2 focus:ring-[#43CD66] focus:outline-none"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="py-12 text-center">
            <h3 className="text-xl font-medium text-gray-600">
              No {blogType} articles available yet
            </h3>
            <p className="mt-2 text-gray-500">
              Check back soon for new content!
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogListingSection;
