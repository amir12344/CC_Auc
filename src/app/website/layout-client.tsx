"use client";

import dynamic from "next/dynamic";
import type React from "react";

import Footer from "@/src/features/website/components/layout/Footer";

// Island-ize Navbar to keep marketing First Load JS minimal
const Navbar = dynamic(
  () => import("@/src/features/website/components/layout/Navbar"),
  {
    loading: () => (
      <div className="fixed top-0 z-50 w-full bg-[#102D21]/90">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="h-8 w-40 rounded bg-[#43CD66]/20" />
          </div>
        </div>
      </div>
    ),
  }
);

const WebsiteLayoutClient = ({ children }: { children: React.ReactNode }) => (
  <>
    <Navbar />
    <main>{children}</main>
    <Footer />
  </>
);

export default WebsiteLayoutClient;
