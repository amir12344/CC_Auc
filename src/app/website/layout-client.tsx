'use client';

import Navbar from '@/src/features/website/components/layout/Navbar';
import Footer from '@/src/features/website/components/layout/Footer';


export default function WebsiteLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  );
} 