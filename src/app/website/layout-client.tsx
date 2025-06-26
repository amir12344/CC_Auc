'use client';

import type React from 'react';
import Footer from '@/src/features/website/components/layout/Footer';
import Navbar from '@/src/features/website/components/layout/Navbar';

const WebsiteLayoutClient = ({ children }: { children: React.ReactNode }) => (
  <>
    <Navbar />
    <main>{children}</main>
    <Footer />
  </>
);

export default WebsiteLayoutClient;
