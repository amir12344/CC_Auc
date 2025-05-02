import type { Metadata } from 'next';
import WebsiteLayoutClient from './layout-client';

// Metadata for the marketing layout
export const metadata: Metadata = {
  title: {
    template: '%s | Commerce Central',
    default: 'Commerce Central - Surplus Inventory Platform',
  },
  description: 'Connect with retailers to access premium surplus inventory and wholesale lots.',
};

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WebsiteLayoutClient>{children}</WebsiteLayoutClient>;
}

