'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import Logo from '@/src/features/website/components/ui/Logo';

export default function ThankYouPage() {

  const [animationComplete, setAnimationComplete] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.3,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 10 }
    }
  };

  const checkmarkVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        duration: 1,
        ease: "easeInOut",
        delay: 0.5
      }
    }
  };

  const circleVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeInOut"
      }
    }
  };

  // Trigger confetti animation when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-[#fafffe] p-4 pt-24 sm:pt-16 sm:justify-center">
      {/* Background decorative elements - preserved animations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 1 }}
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#43CD66]/10"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#2196f3]/10"
        />

        {/* Animated particles - preserved animations */}
        <AnimatePresence>
          {animationComplete && (
            <>
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    opacity: 1,
                    scale: 0,
                    x: "50%",
                    y: "50%"
                  }}
                  animate={{
                    opacity: 0,
                    scale: Math.random() * 0.5 + 0.5,
                    x: `${Math.random() * 100}%`,
                    y: `${Math.random() * 100}%`
                  }}
                  transition={{
                    duration: Math.random() * 2 + 1,
                    delay: Math.random() * 0.5,
                    ease: "easeOut"
                  }}
                  className={`absolute w-3 h-3 rounded-full ${i % 3 === 0 ? "bg-[#43CD66]" :
                      i % 3 === 1 ? "bg-[#2196f3]" : "bg-[#102D21]"
                    }`}
                  style={{ opacity: Math.random() * 0.5 + 0.2 }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Logo at the top - moved to a fixed position rather than absolute for better mobile support */}
      <motion.div
        className="fixed top-4 left-4 sm:absolute sm:top-8 sm:left-8 z-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Logo variant="dark" size={40} minWidth={120} />
      </motion.div>

      {/* Main content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-3xl w-full mt-8 sm:mt-0"
      >
        {/* Success checkmark - preserved animations */}
        <motion.div
          className="mx-auto mb-8 relative"
          variants={circleVariants}
        >
          <div className="w-24 h-24 rounded-full bg-[#43CD66]/20 flex items-center justify-center">
            <svg
              width="60"
              height="60"
              viewBox="0 0 60 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#43CD66]"
            >
              <motion.circle
                cx="30"
                cy="30"
                r="28"
                stroke="currentColor"
                strokeWidth="3"
                variants={circleVariants}
              />
              <motion.path
                d="M18 30L28 40L42 20"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                variants={checkmarkVariants}
              />
            </svg>
          </div>

          {/* Animated pulse effect - preserved animations */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{
              scale: [0.8, 1.2, 0.8],
              opacity: [0.5, 0.2, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "loop"
            }}
            className="absolute inset-0 rounded-full bg-[#43CD66]/20"
          />
        </motion.div>

        {/* Thank you message */}
        <motion.div className="text-center mb-8 sm:mb-12">
          <motion.h1
            variants={itemVariants}
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#102D21] mb-3 sm:mb-4"
          >
            Thank You!
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg md:text-xl text-gray-700 max-w-lg mx-auto px-2"
          >
            Thank you for stepping up to shape the future of surplus.
          </motion.p>
        </motion.div>

        {/* Message box - clean design */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl shadow-sm p-6 sm:p-10 mb-8 sm:mb-12 text-center relative overflow-hidden"
          whileHover={{ y: -3, boxShadow: '0 10px 25px rgba(0,0,0,0.05)', transition: { duration: 0.3 } }}
        >
          {/* Subtle accent at top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#43CD66]"></div>

          <div className="space-y-6 sm:space-y-8">
            <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
              Our platform is under construction and will go live on <span className="font-bold relative inline-block">
                July 10, 2025
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#43CD66]/70"></span>
              </span>. We&apos;re excited to have business leaders like you leading the way.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-0 pt-4 sm:pt-6 border-t border-gray-100">
              <Logo size="small" variant="dark" minWidth={100} />
              <p className="sm:ml-3 font-bold text-gray-800 text-sm sm:text-base">
                The Commerce Central Team
              </p>
            </div>
          </div>
        </motion.div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Return home button - preserved animations */}
          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <button
              onClick={() => {
                // Prevent default navigation behavior
                const homeUrl = '/website';
                // Use window.location for a direct navigation without client-side routing
                window.location.href = homeUrl;
              }}
              className="bg-gradient-to-r cursor-pointer from-[#43CD66] to-[#2ab149] text-white font-medium py-3 px-8 sm:py-3.5 sm:px-10 rounded-full transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto"
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
              onClick={() => {
                // Check if navigator.share is supported
                if (navigator.share) {
                  navigator.share({
                    title: 'Commerce Central - Early Access',
                    text: 'Join me in shaping the future of surplus with Commerce Central!',
                    url: window.location.origin + '/earlyaccess',
                  })
                    .catch((error) => console.log('Error sharing:', error));
                } else {
                  // Fallback for browsers that don't support navigator.share
                  alert("Your browser doesn't support sharing. Please copy this link: " +
                    window.location.origin + "/earlyaccess");
                }
              }}
              className="bg-white cursor-pointer border border-[#43CD66] text-[#43CD66] font-medium py-3.5 px-10 rounded-full transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
