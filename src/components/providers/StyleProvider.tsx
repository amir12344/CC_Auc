"use client";

import { useEffect } from "react";

import { GeistSans } from "geist/font/sans";

export const StyleProvider = () => {
  useEffect(() => {
    // Add classes after hydration
    document.documentElement.classList.add(GeistSans.className);
    document.body.classList.add("antialiased");
  }, []);

  return null;
};
