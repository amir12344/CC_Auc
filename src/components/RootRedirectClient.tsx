"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSelector } from "react-redux";

import { RootState } from "@/src/lib/store";

/**
 * Client Component for handling redirection based on auth state
 * This is used as a fallback when server-side redirection isn't possible
 */
export function RootRedirectClient() {
  const router = useRouter();
  const { isAuthenticated, userType } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    // Redirect based on user type
    if (isAuthenticated) {
      if (userType === "seller") {
        router.push("/seller/dashboard");
      } else {
        // Default to buyer
        router.push("/marketplace");
      }
    } else {
      // If not authenticated, redirect to public marketplace
      router.push("/marketplace");
    }
  }, [isAuthenticated, userType, router]);

  return null;
}
