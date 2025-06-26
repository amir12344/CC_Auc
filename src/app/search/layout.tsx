'use client';

import { ClientProviders } from '@/src/components/providers/ClientProviders';

/**
 * Layout for the search page.
 * This ensures that the search page and its components, like the Header,
 * have access to client-side providers (Redux, Auth, etc.).
 */
export default function SearchLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return <ClientProviders>{children}</ClientProviders>;
} 