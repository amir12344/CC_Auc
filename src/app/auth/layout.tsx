'use client';

import { ClientProviders } from '@/src/components/providers/ClientProviders';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientProviders>
      <div className="min-h-screen bg-white">
        <main>
          {children}
        </main>
      </div>
    </ClientProviders>
  );
}

