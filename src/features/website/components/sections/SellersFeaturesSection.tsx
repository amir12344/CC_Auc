"use client";

import React, { useRef } from "react";
import {
  FaChartLine,
  FaCheckCircle,
  FaClipboardCheck,
  FaExclamationCircle,
  FaFileAlt,
  FaLock,
  FaMoneyBillWave,
  FaSearch,
  FaWarehouse,
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

const SellersFeaturesSection: React.FC = () => {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const comparisonItems: ComparisonItem[] = [
    {
      problem: {
        title: "Brand Erosion Risk",
        description:
          "You're forced into fire-sale marketplaces just to clear space — and watch your brand value erode in the process.",
        icon: <FaExclamationCircle className="text-red-400" />,
      },
      solution: {
        title: "Controlled Channel Exit",
        description:
          "You choose resale channels, buyer types, and pricing floors — protecting brand equity and future retail partnerships.",
        icon: <FaLock className="text-[#43CD66]" />,
      },
    },
    {
      problem: {
        title: "No Pricing Discipline",
        description:
          "Broker chains and backdoor deals blur-sm accountability — and kill any hope of pricing control.",
        icon: <FaMoneyBillWave className="text-red-400" />,
      },
      solution: {
        title: "Transparent Transactions",
        description:
          "Every load is verified, tracked, and sold direct — no brokers, no markup, no surprises.",
        icon: <FaSearch className="text-[#43CD66]" />,
      },
    },
    {
      problem: {
        title: "Stalled Warehouse Flow",
        description:
          "Inventory sits idle, tying up cash and blocking throughput — but no one's sure what to do with it.",
        icon: <FaWarehouse className="text-red-400" />,
      },
      solution: {
        title: "Structured Inventory Routing",
        description:
          "We flag aging inventory early and move it through approved resale — freeing up space and working capital.",
        icon: <FaChartLine className="text-[#43CD66]" />,
      },
    },
    {
      problem: {
        title: "Write-Off Fire Drills",
        description:
          "Finance teams scramble to manage write-downs and plug audit gaps after the damage is done.",
        icon: <FaFileAlt className="text-red-400" />,
      },
      solution: {
        title: "Audit-Ready Resale",
        description:
          "We coordinate resale docs, payment records, and licensing — making every exit compliant and finance-approved.",
        icon: <FaClipboardCheck className="text-[#43CD66]" />,
      },
    },
  ];

  return (
    <section
      id="sellers-features"
      ref={ref}
      className="overflow-hidden bg-[#F1E9DE] py-10 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-20 text-center">
          <p className="text-lg font-medium tracking-wider text-[#43CD66] uppercase">
            SELLERS
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-5xl">
            <span className="relative inline-block">
              The Problem You Know.
              <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-[#43cd66] opacity-80"></span>
            </span>{" "}
            <span className="whitespace-nowrap">The Fix You Need.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
          {/* Before Column */}
          <div>
            <div className="mb-8 flex items-center">
              <div className="mr-3 h-10 w-2 rounded-r-md bg-red-400"></div>
              <div className="flex items-center rounded-lg bg-red-50 px-4 py-2 shadow-xs">
                <FaExclamationCircle className="mr-2 h-5 w-5 text-red-400" />
                <h3 className="text-2xl font-semibold text-[#222222]">
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
                      <h4 className="mb-2 text-xl font-semibold text-gray-800">
                        {item.problem.title}
                      </h4>
                      <p className="font-[#1C1E21] text-[18px]">
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
                <h3 className="text-2xl font-semibold text-gray-800">
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
                      <h4 className="mb-2 text-xl font-semibold text-gray-800">
                        {item.solution.title}
                      </h4>
                      <p className="font-[#1C1E21] text-[18px]">
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

export default SellersFeaturesSection;
