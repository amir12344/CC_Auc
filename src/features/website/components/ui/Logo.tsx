"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type FC } from "react";

// Removed framer-motion entirely to avoid bundling motion on app and website

interface LogoProps {
  variant?: "light" | "dark";
  showFullOnMobile?: boolean;
  size?: "small" | "medium" | "large" | number;
  minWidth?: number;
}

// Helper function to determine logo variant based on context
export const getLogoVariant = () => {
  // Check if we're on a specific page
  if (typeof window !== "undefined") {
    const path = window.location.pathname;

    // For team page, use light variant
    if (path.includes("/website/team")) {
      return "light";
    }
  }

  // Default to light variant
  return "light";
};

// Create a custom SVG component that wraps the Image component
interface CommerceCentralLogoProps {
  width: number;
  height: number;
  variant?: "light" | "dark";
  minWidth?: number;
}

// Create a custom SVG component that wraps the Image component
const CommerceCentralLogo: FC<CommerceCentralLogoProps> = ({
  width,
  height,
  minWidth = 140,
}) => {
  // Use a reliable path with proper error handling
  return (
    <Image
      alt="Commerce Central Logo"
      height={height}
      onError={(e) => {
        // Fallback in case the primary logo doesn't load
        const img = e.currentTarget;
        img.onerror = null; // Prevent infinite loop
        img.src = "/CommerceCentral_logo_Green.svg";
      }}
      priority
      src="/CommerceCentral_logo_Green.svg"
      style={{ minWidth, minHeight: height }}
      width={width}
    />
  );
};

// Smart Logo component that attempts to use Redux state
const SmartLogoWithRedux: FC<LogoProps> = ({
  size = "medium",
  minWidth = 130,
}) => {
  const router = useRouter();
  const [reduxState, setReduxState] = useState<{
    hasRedux: boolean;
    isAuthenticated: boolean;
    isBuyer: boolean;
    isSeller: boolean;
    verificationStatus: string | null;
  }>({
    hasRedux: false,
    isAuthenticated: false,
    isBuyer: false,
    isSeller: false,
    verificationStatus: null,
  });

  // Effect to detect and use Redux state
  useEffect(() => {
    try {
      // Check if we can access Redux
      const { store } = require("@/src/lib/store");

      // Get state directly from store to avoid hook call issues
      const state = store.getState();
      const isAuthenticated = state.auth.isAuthenticated;
      const userType = state.auth.userType;
      const verificationStatus = state.auth.verificationStatus;

      setReduxState({
        hasRedux: true,
        isAuthenticated,
        isBuyer: userType === "buyer",
        isSeller: userType === "seller",
        verificationStatus,
      });

      // Subscribe to store changes
      const unsubscribe = store.subscribe(() => {
        const currentState = store.getState();
        const currentAuth = currentState.auth.isAuthenticated;
        const currentUserType = currentState.auth.userType;
        const currentVerificationStatus = currentState.auth.verificationStatus;

        setReduxState({
          hasRedux: true,
          isAuthenticated: currentAuth,
          isBuyer: currentUserType === "buyer",
          isSeller: currentUserType === "seller",
          verificationStatus: currentVerificationStatus,
        });
      });

      return unsubscribe;
    } catch {
      // Redux not available - keep default state
      setReduxState({
        hasRedux: false,
        isAuthenticated: false,
        isBuyer: false,
        isSeller: false,
        verificationStatus: null,
      });
    }
  }, []);

  // Smart navigation logic based on user authentication and role
  const getNavigationPath = useCallback(() => {
    // If Redux is not available (website pages), default to home
    if (!reduxState.hasRedux) {
      return "/";
    }

    // If Redux is available, implement smart navigation
    if (reduxState.isAuthenticated) {
      if (reduxState.isBuyer) {
        // SECURITY: Only verified buyers can access marketplace
        if (reduxState.verificationStatus === "verified") {
          return "/marketplace";
        }
        // Unverified buyers stay on website
        return "/";
      }
      if (reduxState.isSeller) {
        return "/seller/dashboard";
      }
    }

    // Default fallback for unauthenticated users or unknown states
    return "/";
  }, [reduxState]);

  // Handle logo click with smart navigation
  const handleLogoClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const targetPath = getNavigationPath();
      router.push(targetPath);
    },
    [router, getNavigationPath]
  );

  // Determine logo size based on size prop
  const getSizeStyles = () => {
    if (typeof size === "number") {
      return { width: size, height: size };
    }
    switch (size) {
      case "small":
        return { width: 30, height: 30 };
      case "large":
        return { width: 50, height: 50 };
      default:
        return { width: 40, height: 40 };
    }
  };

  const { width, height } = getSizeStyles();

  return (
    <Link href={getNavigationPath()} onClick={handleLogoClick}>
      {/* Static logo with lightweight hover effect via Tailwind */}
      <div className="inline-flex cursor-pointer items-center transition-transform duration-200 hover:scale-105">
        <CommerceCentralLogo
          height={height}
          minWidth={minWidth}
          width={width}
        />
      </div>
    </Link>
  );
};

// Main Logo component that exports a smart wrapper
const Logo: React.FC<LogoProps> = (props) => {
  return <SmartLogoWithRedux {...props} />;
};

export default Logo;
