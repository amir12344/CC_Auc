"use client";

import MainLayout from "@/src/components/layout/MainLayout";
import { ClientProviders } from "@/src/components/providers/ClientProviders";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientProviders>
      <MainLayout>{children}</MainLayout>
    </ClientProviders>
  );
}
