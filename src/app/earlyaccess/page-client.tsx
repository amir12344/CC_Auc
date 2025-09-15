"use client";

import React from "react";

import EarlyAccessForm from "@/src/components/earlyaccess/EarlyAccessForm";
import LogoHeader from "@/src/components/earlyaccess/LogoHeader";
import ProductCategories from "@/src/components/earlyaccess/ProductCategories";

export default function EarlyAccessPage() {
  return (
    <div className="relative min-h-screen bg-linear-to-br from-gray-50 to-white">
      <LogoHeader />

      <div className="flex flex-col lg:flex-row">
        {/* Categories Section (Top on Mobile, Right on LG) */}
        <div className="relative min-h-screen w-full overflow-y-auto bg-[#102D21] lg:order-2 lg:w-1/2">
          <div className="mx-auto flex min-h-[calc(100dvh-40px)] w-full max-w-4xl flex-col px-6 py-12 pt-14 lg:px-8 lg:pt-8 xl:max-w-5xl">
            <div className="flex h-full flex-col justify-between">
              <ProductCategories />
            </div>
          </div>
        </div>

        {/* Form Section (Bottom on Mobile, Left on LG) */}
        <div className="relative min-h-screen w-full overflow-y-auto bg-white lg:order-1 lg:w-1/2">
          {/* Decorative background gradient and pattern for Form section */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-linear-to-br from-[#e8f5fc] via-[#f0fff4] to-[#e3f9e5] opacity-90" />
            <svg
              className="absolute -top-24 -left-24 opacity-20"
              width="340"
              height="340"
              viewBox="0 0 340 340"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <ellipse
                cx="170"
                cy="170"
                rx="170"
                ry="170"
                fill="#43cd66"
                fillOpacity="0.15"
              />
              <ellipse
                cx="120"
                cy="110"
                rx="90"
                ry="90"
                fill="#2196f3"
                fillOpacity="0.10"
              />
            </svg>
          </div>
          {/* Main content area for Form */}
          <div className="relative z-10 p-4 pt-16 lg:p-10 lg:pt-24">
            <div className="relative z-10 mx-auto w-full px-0 md:px-4">
              <EarlyAccessForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
