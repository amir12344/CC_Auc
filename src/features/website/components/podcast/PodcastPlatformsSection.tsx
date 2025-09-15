"use client";

import Link from "next/link";
import { useRef } from "react";
import {
  FaAmazon,
  FaApple,
  FaGoogle,
  FaSpotify,
  FaYoutube,
} from "react-icons/fa";

import { motion, useInView } from "framer-motion";

interface PlatformItem {
  name: string;
  icon: React.ReactNode;
  url: string;
  color: string;
}

const PodcastPlatformsSection = () => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const platforms: PlatformItem[] = [
    {
      name: "Spotify",
      icon: <FaSpotify size={56} />,
      url: "#",
      color: "hover:text-[#1DB954]",
    },
    {
      name: "Apple Podcasts",
      icon: <FaApple size={56} />,
      url: "#",
      color: "hover:text-[#872EC4]",
    },
    {
      name: "Amazon Music",
      icon: <FaAmazon size={56} />,
      url: "#",
      color: "hover:text-[#FF9900]",
    },
    {
      name: "YouTube",
      icon: <FaYoutube size={56} />,
      url: "#",
      color: "hover:text-[#FF0000]",
    },
  ];

  return (
    <section
      id="platforms"
      ref={ref}
      className="relative overflow-hidden bg-[#F1E9DE] py-20"
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-[#102D21] opacity-5">
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#43CD66]"></div>
        <div className="absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-[#43CD66]"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <h2 className="mb-4 text-center text-3xl font-bold text-[#102D21] md:text-4xl">
            Subscribe to the Podcast
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Listen to our podcast on your favorite platform
          </p>
        </motion.div>

        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-12 md:gap-16 lg:gap-20">
          {platforms.map((platform, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0 + index * 0.1 }}
              whileHover={{ y: -5, scale: 1.05 }}
              className="flex flex-col items-center"
            >
              <Link
                href={platform.url}
                className={`flex flex-col items-center transition-all duration-300 ${platform.color}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="mb-3 text-[#102D21] transition-colors duration-300">
                  {platform.icon}
                </div>
                <span className="text-center text-lg font-medium text-[#102D21]">
                  {platform.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PodcastPlatformsSection;
