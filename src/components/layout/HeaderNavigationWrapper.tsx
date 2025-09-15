"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

import HeaderNavigation from "./HeaderNavigation";

/**
 * Client component that mounts HeaderNavigation into the container in the server component
 */
const HeaderNavigationWrapper = () => {
  useEffect(() => {
    const container = document.getElementById("auth-nav-container");
    if (container) {
      container.classList.remove("hidden");
    }
  }, []);

  // Use createPortal to render HeaderNavigation into the container
  // This will handle client-side navigation and auth state
  return typeof document !== "undefined"
    ? createPortal(
        <HeaderNavigation />,
        document.getElementById("auth-nav-container") || document.body
      )
    : null;
};

export default HeaderNavigationWrapper;
