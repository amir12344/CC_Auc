"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { motion } from "framer-motion";

export default function NotFound() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate loading to trigger animations
    setIsLoaded(true);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center overflow-hidden bg-[#102D21]">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="stars-small"></div>
        <div className="stars-medium"></div>
        <div className="stars-large"></div>

        {/* Abstract shapes */}
        <motion.div
          className="absolute top-[10%] left-[5%] h-64 w-64 rounded-full bg-blue-500/5 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute right-[10%] bottom-[20%] h-80 w-80 rounded-full bg-indigo-500/5 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Content container */}
      <div className="relative z-10 mx-auto w-full max-w-screen-lg px-6 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <motion.h1
            className="bg-gradient-to-r from-[#43CD66] via-[#2EAB4F] to-[#1A8A3C] bg-clip-text text-[10rem] leading-none font-extrabold tracking-tighter text-transparent select-none md:text-[15rem] lg:text-[20rem]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            404
          </motion.h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mx-auto mb-12 max-w-2xl"
        >
          <h2 className="mb-6 text-4xl leading-tight font-bold text-[#F1E9DE] md:text-5xl lg:text-6xl">
            Page not found
          </h2>
          <p className="mb-8 text-xl text-[#F1E9DE] md:text-2xl">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Link
            href="/"
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-[#43CD66] px-8 py-4 text-lg font-medium text-[#1C1E21] transition-all duration-300 ease-out hover:scale-105 hover:shadow-lg hover:shadow-[#43CD66]/30 focus:ring-2 focus:ring-[#43CD66] focus:ring-offset-2 focus:ring-offset-[#102D21] focus:outline-none"
          >
            <span className="absolute h-0 w-0 rounded-full bg-white opacity-10 transition-all duration-500 ease-out group-hover:h-56 group-hover:w-56"></span>
            <span className="relative">Return Home</span>
          </Link>
        </motion.div>
      </div>

      <style jsx>{`
        .stars-small,
        .stars-medium,
        .stars-large {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-repeat: repeat;
          animation-iteration-count: infinite;
          animation-timing-function: linear;
        }

        .stars-small {
          background-image: radial-gradient(
            1px 1px at calc(100% * var(--x, 0)) calc(100% * var(--y, 0)),
            white,
            transparent
          );
          background-size: 100px 100px;
          animation: stars-small-move 100s infinite linear;
          opacity: 0.6;
        }

        .stars-medium {
          background-image: radial-gradient(
            1.5px 1.5px at calc(100% * var(--x, 0)) calc(100% * var(--y, 0)),
            white,
            transparent
          );
          background-size: 200px 200px;
          animation: stars-medium-move 150s infinite linear;
          opacity: 0.4;
        }

        .stars-large {
          background-image: radial-gradient(
            2.5px 2.5px at calc(100% * var(--x, 0)) calc(100% * var(--y, 0)),
            white,
            transparent
          );
          background-size: 400px 400px;
          animation: stars-large-move 200s infinite linear;
          opacity: 0.2;
        }

        @keyframes stars-small-move {
          0% {
            background-position: 0 0;
            --x: 0;
            --y: 0;
          }
          25% {
            --x: 1;
            --y: 0;
          }
          50% {
            --x: 1;
            --y: 1;
          }
          75% {
            --x: 0;
            --y: 1;
          }
          100% {
            background-position: -10000px 5000px;
            --x: 0;
            --y: 0;
          }
        }

        @keyframes stars-medium-move {
          0% {
            background-position: 0 0;
            --x: 0;
            --y: 0;
          }
          25% {
            --x: 1;
            --y: 0;
          }
          50% {
            --x: 1;
            --y: 1;
          }
          75% {
            --x: 0;
            --y: 1;
          }
          100% {
            background-position: 10000px 5000px;
            --x: 0;
            --y: 0;
          }
        }

        @keyframes stars-large-move {
          0% {
            background-position: 0 0;
            --x: 0;
            --y: 0;
          }
          25% {
            --x: 1;
            --y: 0;
          }
          50% {
            --x: 1;
            --y: 1;
          }
          75% {
            --x: 0;
            --y: 1;
          }
          100% {
            background-position: -5000px -10000px;
            --x: 0;
            --y: 0;
          }
        }
      `}</style>
    </div>
  );
}
