"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { initializeAuth } from "@/src/features/authentication/store/authSlice";
import type { AppDispatch } from "@/src/lib/store";

/**
 * Handles authentication state initialization with proper error handling
 * and prevents authentication loops
 */
export default function AuthInitializer() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    let isMounted = true;
    let initializationAttempted = false;

    const initAuth = async () => {
      // Prevent multiple initialization attempts
      if (initializationAttempted) {
        return;
      }
      initializationAttempted = true;

      try {
        // Only initialize if component is still mounted
        if (isMounted) {
          await dispatch(initializeAuth());
        }
      } catch {
        // Silently handle errors - initializeAuth already handles error states
        // This prevents unhandled promise rejections that could break the app
      }
    };

    // Small delay to ensure Amplify is fully configured
    const timeoutId = setTimeout(initAuth, 100);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [dispatch]);

  // This component doesn't render anything
  return null;
}
