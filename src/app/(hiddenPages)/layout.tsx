import React from "react";

import Footer from "@/src/features/website/components/layout/Footer";
import Navbar from "@/src/features/website/components/layout/Navbar";

interface HiddenPagesLayoutProps {
  children: React.ReactNode;
}

const HiddenPagesLayout: React.FC<HiddenPagesLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

export default HiddenPagesLayout;
