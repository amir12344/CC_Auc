import React from 'react';
import Navbar from '@/src/features/website/components/layout/Navbar';
import Footer from '@/src/features/website/components/layout/Footer';

interface HiddenPagesLayoutProps {
  children: React.ReactNode;
}

const HiddenPagesLayout: React.FC<HiddenPagesLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default HiddenPagesLayout; 