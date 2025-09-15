"use client";

import React, { useRef } from "react";
import {
  FaBoxOpen,
  FaCheckCircle,
  FaExclamationCircle,
  FaFileAlt,
  FaFileContract,
  FaMoneyBillWave,
} from "react-icons/fa";

import { motion, useInView } from "framer-motion";

interface ComparisonItem {
  problem: {
    title: string;
    description: string;
    icon: React.ReactNode;
  };
  solution: {
    title: string;
    description: string;
    icon: React.ReactNode;
  };
}

const BuyersFeaturesSection: React.FC = () => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const comparisonItems: ComparisonItem[] = [
    {
      problem: {
        title: "Blind Wire Transfers",
        description:
          "You wire money through group chats and pray the load is real — with no backup if things go wrong.",
        icon: <FaMoneyBillWave className="text-red-400" />,
      },
      solution: {
        title: "Verified Sellers Only",
        description:
          "Every seller is pre-vetted. No shady Telegram brokers. No guessing if the load will ship.",
        icon: <FaCheckCircle className="text-[#43CD66]" />,
      },
    },
    {
      problem: {
        title: "Blurry Manifests",
        description:
          "Manifests are vague or fake — and what shows up doesn’t match what you paid for.",
        icon: <FaFileAlt className="text-red-400" />,
      },
      solution: {
        title: "Real Manifests, Real Photos",
        description:
          "You see brand-approved manifests, SKU counts, MSRP, and condition before you ever commit.",
        icon: <FaFileAlt className="text-[#43CD66]" />,
      },
    },
    {
      problem: {
        title: "Picked-Over Loads",
        description:
          "You get stuck with leftovers — half the SKUs missing, or returns already cherry-picked.",
        icon: <FaBoxOpen className="text-red-400" />,
      },
      solution: {
        title: "Resale-Ready Inventory",
        description:
          "Loads are clean, untouched, and sent directly from brands, retailers, or distributors.",
        icon: <FaBoxOpen className="text-[#43CD66]" />,
      },
    },
    {
      problem: {
        title: "No Resale Rights",
        description:
          "You don’t know where the inventory came from — or whether you’re even allowed to sell it.",
        icon: <FaFileContract className="text-red-400" />,
      },
      solution: {
        title: "Clear Resale Confidence",
        description:
          "We coordinate resale rights, purchase terms, and supporting docs — so you stay protected.",
        icon: <FaFileContract className="text-[#43CD66]" />,
      },
    },
  ];

  return (
    <section
      id="buyers-features"
      ref={ref}
      className="overflow-hidden bg-[#102D21] py-10 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-20 text-center">
          <p className="text-lg font-medium tracking-wider text-[#43CD66] uppercase">
            BUYERS
          </p>
          <h2 className="mt-2 text-4xl font-bold tracking-tight text-[#43CD66] md:text-5xl">
            <span className="relative inline-block">
              The Risk You Take.
              <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-[#43cd66] opacity-80"></span>
            </span>{" "}
            <span>The Confidence You Deserve.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
          {/* Before Column */}
          <div>
            <div className="mb-8 flex items-center">
              <div className="mr-3 h-10 w-2 rounded-r-md bg-red-400"></div>
              <div className="flex items-center rounded-lg bg-red-50 px-4 py-2 shadow-xs">
                <FaExclamationCircle className="mr-2 h-5 w-5 text-red-400" />
                <h3 className="text-2xl font-semibold text-[#43CD66]">
                  Before Commerce Central
                </h3>
              </div>
            </div>

            <div className="relative">
              {/* Vertical line */}
              <div className="absolute top-0 bottom-0 left-[19px] w-[1px] bg-red-200"></div>

              <div className="space-y-14">
                {comparisonItems.map((item, index) => (
                  <div key={`problem-${index}`} className="relative">
                    <div className="absolute top-1.5 left-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-red-100 bg-red-50">
                        <div className="h-5 w-5">{item.problem.icon}</div>
                      </div>
                    </div>

                    <div className="pl-16">
                      <h4 className="mb-2 text-xl font-semibold text-[#43CD66]">
                        {item.problem.title}
                      </h4>
                      <p className="text-[18px] text-[#F1E9DE]">
                        {item.problem.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* After Column */}
          <div>
            <div className="mb-8 flex items-center">
              <div className="mr-3 h-10 w-2 rounded-r-md bg-[#43CD66]"></div>
              <div className="flex items-center rounded-lg bg-[#E6F7E9] px-4 py-2 shadow-xs">
                <FaCheckCircle className="mr-2 h-5 w-5 text-[#43CD66]" />
                <h3 className="text-2xl font-semibold text-[#43CD66]">
                  After Commerce Central
                </h3>
              </div>
            </div>

            <div className="relative">
              {/* Vertical line */}
              <div className="absolute top-0 bottom-0 left-[19px] w-[1px] bg-[#43CD66]/40"></div>

              <div className="space-y-14">
                {comparisonItems.map((item, index) => (
                  <div key={`solution-${index}`} className="relative">
                    <div className="absolute top-1.5 left-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#43CD66]/20 bg-[#E6F7E9]">
                        <div className="h-5 w-5">{item.solution.icon}</div>
                      </div>
                    </div>

                    <div className="pl-16">
                      <h4 className="mb-2 text-xl font-semibold text-[#43CD66]">
                        {item.solution.title}
                      </h4>
                      <p className="text-[18px] text-[#F1E9DE]">
                        {item.solution.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BuyersFeaturesSection;
