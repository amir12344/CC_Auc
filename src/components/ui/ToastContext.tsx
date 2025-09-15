"use client";

import { ReactNode } from "react";

import { Toaster } from "@/src/components/ui/toaster";
import { useToast as useShadcnToast } from "@/src/hooks/use-toast";

// Define the standard variants for type safety
export type ToastType =
  | "default"
  | "destructive"
  | "success"
  | "warning"
  | "info";

/**
 * Toast Provider component that wraps the shadcn toast system
 * Provides toast notifications to the entire app
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}

/**
 * Custom hook to use the toast functionality with a simplified API
 * that matches our previous interface but uses shadcn under the hood
 */
export function useToast() {
  // Call the hook once at the component level
  const shadcnToast = useShadcnToast();

  // Show a toast notification with a simplified API
  const showToast = (
    message: string,
    type: ToastType = "default",
    duration = 3000
  ) => {
    // Map our simple type to shadcn variant
    const variant =
      type === "success" || type === "warning" || type === "info"
        ? "default"
        : type;

    // Show toast with shadcn structure - use the toast method from the object
    return shadcnToast.toast({
      title: type.charAt(0).toUpperCase() + type.slice(1),
      description: message,
      variant,
      duration,
    });
  };

  // Dismiss a specific toast by id
  const hideToast = (id: string) => {
    // Access the dismiss method correctly
    shadcnToast.dismiss(id);
  };

  return { showToast, hideToast };
}
