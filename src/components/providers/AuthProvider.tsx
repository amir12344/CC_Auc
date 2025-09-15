"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Amplify } from "aws-amplify";

import outputs from "@/amplify_outputs.json" with { type: "json" };
import AuthLoading from "@/src/app/auth/loading";
import { initializeAuth } from "@/src/features/authentication/store/authSlice";
import { sessionManager } from "@/src/lib/auth/session-manager";
import type { AppDispatch, RootState } from "@/src/lib/store";

// Configure Amplify once, client-side
Amplify.configure(outputs, { ssr: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [initialized, setInitialized] = useState(false);

  // Effect to initialize auth. Runs once on client.
  useEffect(() => {
    dispatch(initializeAuth()).finally(() => {
      setInitialized(true);
    });
  }, [dispatch]);

  // Effect to keep localStorage cache in sync with Redux state
  useEffect(() => {
    if (initialized) {
      sessionManager.setSessionCache(isAuthenticated);
    }
  }, [isAuthenticated, initialized]);

  if (!initialized) {
    return <AuthLoading />;
  }

  return <>{children}</>;
}
