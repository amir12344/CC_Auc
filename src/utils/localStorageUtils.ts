// src/utils/localStorageUtils.ts
import { toast } from "@/src/hooks/use-toast";

// Add export types at the top after imports
export type PendingData = {
  username: string;
  userType: string;
  timestamp: number;
};

// CertData type removed - using database-driven verification instead

// Key for storing pending confirmation data
const PENDING_KEY = "confirmationPending";

// Expiration time in milliseconds (24 hours)
const EXPIRATION_MS = 24 * 60 * 60 * 1000;

/**
 * Sets the confirmation pending state in localStorage
 * @param data - Object with username and userType
 */
export function setConfirmationPending(data: {
  username: string;
  userType: string;
}) {
  try {
    const pendingData: PendingData = {
      ...data,
      timestamp: Date.now(),
    };
    localStorage.setItem(PENDING_KEY, JSON.stringify(pendingData));
  } catch (err) {
    // Handle storage error
    toast({
      variant: "destructive",
      title: "Storage Error",
      description:
        err instanceof Error
          ? err.message
          : "Failed to save confirmation state. Please try again.",
    });
  }
}

/**
 * Gets the pending confirmation data if valid (not expired)
 * @returns PendingData or null if expired, invalid, or not found
 */
export function getConfirmationPending(): PendingData | null {
  try {
    const stored = localStorage.getItem(PENDING_KEY);
    if (!stored) {
      return null;
    }

    const data: PendingData = JSON.parse(stored);
    if (Date.now() - data.timestamp > EXPIRATION_MS) {
      clearConfirmationPending();
      return null;
    }

    return data;
  } catch (err) {
    // Handle parse error
    toast({
      variant: "destructive",
      title: "Storage Parse Error",
      description:
        err instanceof Error
          ? err.message
          : "Failed to parse confirmation state.",
    });
    return null;
  }
}

/**
 * Clears the pending confirmation state
 */
export function clearConfirmationPending() {
  try {
    localStorage.removeItem(PENDING_KEY);
  } catch (err) {
    // Handle removal error
    toast({
      variant: "destructive",
      title: "Storage Clear Error",
      description:
        err instanceof Error
          ? err.message
          : "Failed to clear confirmation state.",
    });
  }
}

// Certificate localStorage utilities removed - using database-driven verification instead
// All certificate-related functions (setNeedsCertificate, getNeedsCertificate, clearNeedsCertificate)
// have been removed as part of the buyer verification status implementation
