"use client";

import React, { useEffect, useState } from "react";

import { AnimatePresence, easeInOut, motion } from "framer-motion";

import Logo from "@/src/features/website/components/ui/Logo";

export default function ThankYouPage() {
  const [animationComplete, setAnimationComplete] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.3,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 100, damping: 10 },
    },
  };

  const checkmarkVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 1,
        ease: easeInOut,
        delay: 0.5,
      },
    },
  };

  const circleVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: easeInOut,
      },
    },
  };

  // Trigger confetti animation when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-[#fafffe] p-4 pt-24 sm:justify-center sm:pt-16">
      {/* Background decorative elements - preserved animations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ opacity: 0.5 }}
          className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#43CD66]/10"
          initial={{ opacity: 0 }}
          transition={{ duration: 1 }}
        />
        <motion.div
          animate={{ opacity: 0.3 }}
          className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-[#2196f3]/10"
          initial={{ opacity: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        />

        {/* Animated particles - preserved animations */}
        <AnimatePresence>
          {animationComplete && (
            <>
              {[...Array(20)].map((_, i) => (
                <motion.div
                  animate={{
                    opacity: 0,
                    scale: Math.random() * 0.5 + 0.5,
                    x: `${Math.random() * 100}%`,
                    y: `${Math.random() * 100}%`,
                  }}
                  className={`absolute h-3 w-3 rounded-full ${
                    i % 3 === 0
                      ? "bg-[#43CD66]"
                      : i % 3 === 1
                        ? "bg-[#2196f3]"
                        : "bg-[#102D21]"
                  }`}
                  initial={{
                    opacity: 1,
                    scale: 0,
                    x: "50%",
                    y: "50%",
                  }}
                  key={i}
                  style={{ opacity: Math.random() * 0.5 + 0.2 }}
                  transition={{
                    duration: Math.random() * 2 + 1,
                    delay: Math.random() * 0.5,
                    ease: "easeOut",
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Logo at the top - moved to a fixed position rather than absolute for better mobile support */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-4 left-4 z-20 sm:absolute sm:top-8 sm:left-8"
        initial={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        <Logo minWidth={120} size={40} variant="dark" />
      </motion.div>

      {/* Main content */}
      <motion.div
        animate="visible"
        className="relative z-10 mt-8 w-full max-w-3xl sm:mt-0"
        initial="hidden"
        variants={containerVariants}
      >
        {/* Success checkmark - preserved animations */}
        <motion.div className="relative mx-auto mb-8" variants={circleVariants}>
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#43CD66]/20">
            <svg
              className="text-[#43CD66]"
              fill="none"
              height="60"
              viewBox="0 0 60 60"
              width="60"
              xmlns="http://www.w3.org/2000/svg"
            >
              <motion.circle
                cx="30"
                cy="30"
                r="28"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                variants={circleVariants}
              />
              <motion.path
                d="M18 30L28 40L42 20"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                variants={checkmarkVariants}
              />
            </svg>
          </div>

          {/* Animated pulse effect - preserved animations */}
          <motion.div
            animate={{
              scale: [0.8, 1.2, 0.8],
              opacity: [0.5, 0.2, 0.5],
            }}
            className="absolute inset-0 rounded-full bg-[#43CD66]/20"
            initial={{ scale: 0.8, opacity: 0.5 }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
            }}
          />
        </motion.div>

        {/* Thank you message */}
        <motion.div className="mb-8 text-center sm:mb-12">
          <motion.h1
            className="mb-3 text-2xl font-bold text-[#102D21] sm:mb-4 sm:text-3xl md:text-4xl"
            variants={itemVariants}
          >
            Thank You!
          </motion.h1>

          <motion.p
            className="mx-auto max-w-lg px-2 text-base text-gray-700 sm:text-lg md:text-xl"
            variants={itemVariants}
          >
            Thank you for stepping up to shape the future of surplus.
          </motion.p>
        </motion.div>

        {/* Message box - clean design */}
        <motion.div
          className="relative mb-8 overflow-hidden rounded-xl bg-white p-6 text-center shadow-sm sm:mb-12 sm:p-10"
          variants={itemVariants}
          whileHover={{
            y: -3,
            boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
            transition: { duration: 0.3 },
          }}
        >
          {/* Subtle accent at top */}
          <div className="absolute top-0 right-0 left-0 h-1 bg-[#43CD66]" />

          <div className="space-y-6 sm:space-y-8">
            <p className="text-base leading-relaxed text-gray-700 sm:text-lg">
              Our platform is under construction and will go live on{" "}
              <span className="relative inline-block font-bold">
                July 10, 2025
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-[#43CD66]/70" />
              </span>
              . We&apos;re excited to have business leaders like you leading the
              way.
            </p>

            <div className="flex flex-col items-center justify-center gap-2 border-t border-gray-100 pt-4 sm:flex-row sm:gap-0 sm:pt-6">
              <Logo minWidth={100} size="small" variant="dark" />
              <p className="text-sm font-bold text-gray-800 sm:ml-3 sm:text-base">
                The Commerce Central Team
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action buttons */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          {/* Return home button - preserved animations */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <button
              className="w-full cursor-pointer rounded-full bg-gradient-to-r from-[#43CD66] to-[#2ab149] px-8 py-3 font-medium text-white shadow-md transition-all duration-200 hover:shadow-lg sm:w-auto sm:px-10 sm:py-3.5"
              onClick={() => {
                // Prevent default navigation behavior
                const homeUrl = "/website";
                // Use window.location for a direct navigation without client-side routing
                window.location.href = homeUrl;
              }}
            >
              Return to Home
            </button>
          </motion.div>

          {/* Share button with navigator.share() API */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <button
              className="flex cursor-pointer items-center justify-center gap-2 rounded-full border border-[#43CD66] bg-white px-10 py-3.5 font-medium text-[#43CD66] shadow-sm transition-all duration-200 hover:shadow-md"
              onClick={() => {
                // Check if navigator.share is supported
                if (navigator.share) {
                  navigator
                    .share({
                      title: "Commerce Central - Early Access",
                      text: "Join me in shaping the future of surplus with Commerce Central!",
                      url: window.location.origin + "/earlyaccess",
                    })
                    .catch((error) => console.error("Error sharing:", error));
                } else {
                  // Fallback for browsers that don't support navigator.share
                  alert(
                    "Your browser doesn't support sharing. Please copy this link: " +
                      window.location.origin +
                      "/earlyaccess"
                  );
                }
              }}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
              Share
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
