'use client';

import { ClientProviders } from '@/src/components/providers/ClientProviders';

/**
 * Layout for the collections pages.
 * This ensures that category pages and their components, like the Header,
 * have access to client-side providers (Redux, Auth, etc.).
 */
export default function CollectionsLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return <ClientProviders>{children}</ClientProviders>;
} 