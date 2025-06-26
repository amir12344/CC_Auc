'use client';

import { ClientProviders } from '@/src/components/providers/ClientProviders';

export default function MarketplaceLayout({ children }) {
  return <ClientProviders>{children}</ClientProviders>
}
