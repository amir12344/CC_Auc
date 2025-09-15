"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ArrowRight, Eye, Gavel, Lock, ShoppingCart, X } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { authSessionStorage } from "@/src/utils/sessionStorage";

interface LoginPromptModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Function to close the modal */
  onClose: () => void;
  /** The action that triggered the prompt */
  triggerAction?: "view_manifest" | "place_bid" | "buy_now" | "view_details";
  /** Item name or title for context */
  itemName?: string;
  /** Current page URL for return after login */
  returnUrl?: string;
}

/**
 * LoginPromptModal - Encourages user registration with compelling messaging
 *
 * Shows when guests try to access restricted content like manifests or bidding
 * Provides clear benefits of registration and smooth login flow
 */
export function LoginPromptModal({
  isOpen,
  onClose,
  triggerAction = "view_details",
  itemName,
  returnUrl,
}: LoginPromptModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Handle login navigation with return URL
   */
  const handleLogin = () => {
    setIsLoading(true);

    // Save return URL using the proper auth session storage system
    if (returnUrl) {
      authSessionStorage.saveRedirectUrl(returnUrl);
      // Also pass as query param for immediate access
      router.push(`/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`);
    } else {
      router.push("/auth/login");
    }
  };

  /**
   * Handle signup navigation
   */
  const handleSignup = () => {
    setIsLoading(true);

    // Save return URL using the proper auth session storage system
    if (returnUrl) {
      authSessionStorage.saveRedirectUrl(returnUrl);
      // Also pass as query param for the signup flow
      router.push(
        `/auth/select-user-type?redirect=${encodeURIComponent(returnUrl)}`
      );
    } else {
      router.push("/auth/select-user-type");
    }
  };

  /**
   * Get action-specific messaging
   */
  const getActionMessage = () => {
    switch (triggerAction) {
      case "view_manifest":
        return {
          icon: <Eye className="h-6 w-6 text-blue-600" />,
          title: "View Complete Manifest",
          description: `See detailed inventory breakdown for ${itemName || "this lot"}`,
          benefit:
            "Access complete product lists, quantities, and estimated values",
        };
      case "place_bid":
        return {
          icon: <Gavel className="h-6 w-6 text-green-600" />,
          title: "Place Your Bid",
          description: `Start bidding on ${itemName || "this auction"}`,
          benefit: "Participate in auctions and get wholesale prices",
        };
      case "buy_now":
        return {
          icon: <ShoppingCart className="h-6 w-6 text-purple-600" />,
          title: "Buy This Product",
          description: `Purchase ${itemName || "this item"} now`,
          benefit: "Get instant access to wholesale inventory",
        };
      default:
        return {
          icon: <Lock className="h-6 w-6 text-gray-600" />,
          title: "Access Premium Content",
          description: "View exclusive details and pricing information",
          benefit: "Unlock full access to our marketplace",
        };
    }
  };

  const actionMessage = getActionMessage();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="gap-0 p-0 sm:max-w-md">
        {/* Close button */}
        <button
          onClick={onClose}
          className="ring-offset-background focus:ring-ring absolute top-4 right-4 z-10 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        {/* Simple Header */}
        <div className="p-6 text-center">
          <DialogTitle className="mb-2 text-xl font-semibold text-gray-900">
            Sign In Required
          </DialogTitle>
          <DialogDescription className="mb-6 text-gray-600">
            Please sign in to access this content
          </DialogDescription>

          {/* Action buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="h-11 w-full rounded-full bg-black font-medium text-white hover:bg-gray-800"
            >
              {isLoading ? "Redirecting..." : "Log In"}
            </Button>

            <Button
              onClick={handleSignup}
              disabled={isLoading}
              variant="outline"
              className="h-11 w-full rounded-full border-gray-300 font-medium text-gray-700 hover:bg-gray-50"
            >
              Create Account
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
