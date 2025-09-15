"use client";

import { usePathname } from "next/navigation";
import { useSelector } from "react-redux";

import {
  selectCanAccessBuyerRoutes,
  selectIsBuyer,
} from "@/src/features/authentication/store/authSelectors";
import Footer from "@/src/features/website/components/layout/Footer";

import Header from "./Header";

interface MainLayoutProps {
  children: React.ReactNode;
}

/**src\app\marketplace\layout.tsx
 * Main layout component for app sections
 * Note: ClientProviders should be provided by parent layouts (buyer, seller, marketplace)
 */
export default function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const canAccessBuyerRoutes = useSelector(selectCanAccessBuyerRoutes);
  const isBuyer = useSelector(selectIsBuyer);

  // Hide header for unverified buyers on verification pending page
  const shouldHideHeader =
    pathname === "/buyer/verification-pending" &&
    isBuyer &&
    !canAccessBuyerRoutes;

  return (
    <div className="flex min-h-screen max-w-full flex-col">
      {!shouldHideHeader && <Header />}
      <main className="grow" id="main-content" tabIndex={-1}>
        <div>{children}</div>
      </main>
      <Footer />
    </div>
  );
}
