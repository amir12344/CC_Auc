"use client";

import Link from "next/link";
import { useSelector } from "react-redux";

import { RootState } from "@/src/lib/store";

const HeaderNavigation = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  // If not authenticated, don't render anything
  if (!isAuthenticated) return null;

  return (
    <nav className="ml-6 items-center space-x-6 md:flex">
      <Link
        href="/"
        className="font-medium text-black transition-colors hover:underline"
      >
        Home
      </Link>
      <Link
        href="/inbox"
        className="font-medium text-black transition-colors hover:underline"
      >
        Inbox
      </Link>
      <Link
        href="/wishlist"
        className="font-medium text-black transition-colors hover:underline"
      >
        Wishlist
      </Link>
      <Link
        href="/buyer/deals"
        className="font-medium text-black transition-colors hover:underline"
      >
        My Deals
      </Link>
    </nav>
  );
};

export default HeaderNavigation;
