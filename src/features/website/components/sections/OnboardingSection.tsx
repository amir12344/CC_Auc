"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useRef } from "react";

import { useInView } from "framer-motion";

// Profile image array - try to match similar looking people
const profiles: string[] = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80",
  "https://images.unsplash.com/photo-1739407107085-5061af7d59da?q=80&w=2564&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80",
  "https://images.unsplash.com/photo-1679476819592-3e233227fd83?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1553019852-8fbc53c7f7b6?q=80&w=2671&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",

  "https://images.unsplash.com/photo-1706951413911-a4477e18ccd5?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1729162128021-f37dca3ff30d?q=80&w=2564&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=2564&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80",
  "https://images.unsplash.com/photo-1741455620227-3b1c51e01419?q=80&w=2680&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",

  "https://images.unsplash.com/photo-1696457175552-6f334ba7268e?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1721620833081-c44e4a55ec18?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80",
];

// We're not using this component yet, so we'll remove it for now

const TestimonialsSection: React.FC = () => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section
      id="testimonials"
      ref={ref}
      className="relative overflow-hidden bg-[#F1E9DE] pt-2 transition-all duration-400 md:pt-[5rem]"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* LEFT COLUMN PROFILES */}
        {/* Asian man with glasses - top left */}
        <div className="absolute top-[14%] left-[5%] hidden h-[8rem] w-[7rem] overflow-hidden rounded-xl md:block">
          <Image
            src={profiles[0]}
            alt="Professional"
            width={300}
            height={300}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Man in black shirt - top left */}
        <div className="absolute top-0 left-[15%] hidden h-[8rem] w-[7rem] overflow-hidden rounded-xl md:block">
          <Image
            src={profiles[1]}
            alt="Professional"
            width={300}
            height={300}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Woman with brown top - bottom left */}
        <div className="absolute top-[41%] left-[5%] hidden h-[8rem] w-[7rem] overflow-hidden rounded-xl md:block">
          <Image
            src={profiles[2]}
            alt="Professional"
            width={300}
            height={300}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Man in white shirt - middle left */}
        <div className="absolute top-[27%] left-[15%] hidden h-[8rem] w-[7rem] overflow-hidden rounded-xl md:block">
          <Image
            src={profiles[3]}
            alt="Professional"
            width={300}
            height={300}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Man with glasses in blue shirt */}
        <div className="absolute top-[10%] left-[25%] hidden h-[8rem] w-[7rem] overflow-hidden rounded-xl md:block">
          <Image
            src={profiles[4]}
            alt="Professional"
            width={300}
            height={300}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        {/* MIDDLE SECTION PROFILES */}
        {/* Man with crossed arms blue shirt */}
        <div className="absolute top-[0%] left-[35%] hidden h-[8rem] w-[7rem] overflow-hidden rounded-xl md:block">
          <Image
            src={profiles[5]}
            alt="Professional"
            width={300}
            height={300}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Man in suit */}
        <div className="absolute top-[10%] left-[45%] hidden h-[8rem] w-[7rem] overflow-hidden rounded-xl md:block">
          <Image
            src={profiles[6]}
            alt="Professional"
            width={300}
            height={300}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Woman with brown jacket */}
        <div className="absolute top-[0%] left-[55%] hidden h-[8rem] w-[7rem] overflow-hidden rounded-xl md:block">
          <Image
            src={profiles[7]}
            alt="Professional"
            width={300}
            height={300}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Woman at desk */}
        <div className="absolute top-[10%] left-[65%] hidden h-[8rem] w-[7rem] overflow-hidden rounded-xl md:block">
          <Image
            src={profiles[8]}
            alt="Professional"
            width={300}
            height={300}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Man in green/gray shirt */}
        <div className="absolute top-[0%] left-[75%] hidden h-[8rem] w-[7rem] overflow-hidden rounded-xl md:block">
          <Image
            src={profiles[9]}
            alt="Professional"
            width={300}
            height={300}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        {/* RIGHT COLUMN PROFILES */}
        {/* Woman with curly hair */}
        <div className="absolute top-[14%] right-[6%] hidden h-[8rem] w-[7rem] overflow-hidden rounded-xl md:block">
          <Image
            src={profiles[10]}
            alt="Professional"
            width={300}
            height={300}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Asian man in suit */}
        <div className="absolute top-[27%] right-[16%] hidden h-[8rem] w-[7rem] overflow-hidden rounded-xl md:block">
          <Image
            src={profiles[11]}
            alt="Professional"
            width={300}
            height={300}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Man in blue blazer */}
        <div className="absolute top-[41%] right-[6%] hidden h-[8rem] w-[7rem] overflow-hidden rounded-xl md:block">
          <Image
            src={profiles[12]}
            alt="Professional"
            width={300}
            height={300}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Central content */}
        <div className="relative z-20 mx-auto max-w-3xl pt-0 pt-[2rem] pb-15 text-center md:pt-[13rem]">
          <h2 className="mb-2 hidden text-4xl font-bold text-[#1C1E21] md:block md:text-4xl lg:text-5xl">
            Unlock your inventory’s
          </h2>

          <h3 className="text-primary mb-8 hidden text-4xl font-normal text-[#43CD66] md:block md:text-5xl">
            <span className="relative inline-block text-4xl font-bold text-[#43cd66] md:text-4xl lg:text-5xl">
              full potential
              <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-[#43cd66] opacity-80"></span>
            </span>
          </h3>

          <h2 className="mb-2 text-3xl font-bold text-[#1C1E21] md:hidden">
            Unlock your inventory’s
            <span className="relative inline-block text-3xl font-bold text-[#43cd66] md:text-4xl lg:text-5xl">
              full potential
              <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-[#43cd66] opacity-80"></span>
            </span>
          </h2>
          <p className="mx-auto mb-8 w-[24rem] text-lg text-[#1C1E21]">
            Join the only private surplus distribution platform built for
            trusted Buyers and Sellers.
          </p>
          <div className="mt-4">
            <Link
              href="/auth/select-user-type"
              className="rounded-full bg-[#102D21] p-4 font-medium text-white transition-all duration-200 hover:bg-[#43CD66] hover:shadow-md"
              prefetch={true}
            >
              Get started
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
