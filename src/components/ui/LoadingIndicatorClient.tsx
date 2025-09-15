"use client";

import LoadingIndicator from "./LoadingIndicator";

/**
 * Client-side wrapper for the loading indicator
 * This ensures the loading indicator only runs on the client
 */
export const LoadingIndicatorClient = () => {
  return <LoadingIndicator />;
};
