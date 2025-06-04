import type { Metadata } from 'next';
import WebsiteLayoutClient from './layout-client';

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WebsiteLayoutClient>{children}</WebsiteLayoutClient>;
}

